# Implementation Reference: Webhook Verifiers & Idempotency Stores

Real-world HMAC verification adapters (Stripe, Svix, MercadoPago) and atomic idempotency stores (Redis, SQL).

---

## 1. Stripe Webhook Verifier Adapter

```ts
// src/infrastructure/adapters/webhooks/stripe-verifier.adapter.ts
import Stripe from "stripe";
import type { WebhookVerifierPort, WebhookVerifyInput } from "@/domains/webhooks/webhook-verifier.port";
import { AppError } from "@/errors/app-error";

export class StripeWebhookVerifierAdapter implements WebhookVerifierPort<Stripe.Event> {
  constructor(private stripe: Stripe) {}

  async verify(input: WebhookVerifyInput): Promise<Stripe.Event> {
    try {
      return this.stripe.webhooks.constructEvent(
        input.rawBody,
        input.signatureHeader,
        input.secret
      );
    } catch (err) {
      throw new AppError({
        message: "Firma criptográfica de Stripe inválida.",
        statusCode: 400,
        cause: err,
      });
    }
  }
}
```

---

## 2. Svix Webhook Verifier Adapter

```ts
// src/infrastructure/adapters/webhooks/svix-verifier.adapter.ts
import { Webhook } from "svix";
import type { WebhookVerifierPort, WebhookVerifyInput } from "@/domains/webhooks/webhook-verifier.port";
import { AppError } from "@/errors/app-error";

export class SvixWebhookVerifierAdapter implements WebhookVerifierPort<unknown> {
  async verify(input: WebhookVerifyInput): Promise<unknown> {
    try {
      const wh = new Webhook(input.secret);
      return wh.verify(input.rawBody.toString(), { "svix-signature": input.signatureHeader });
    } catch (err) {
      throw new AppError({ message: "Firma Svix inválida.", statusCode: 400, cause: err });
    }
  }
}
```

---

## 3. Redis Idempotency Store (`SET key NX EX`)

```ts
// src/infrastructure/adapters/idempotency/redis-idempotency.adapter.ts
import type { Redis } from "ioredis";
import type { IdempotencyPort } from "@/domains/webhooks/idempotency.port";

export class RedisIdempotencyAdapter implements IdempotencyPort {
  constructor(private redis: Redis) {}

  async lockOrSkip(key: string, ttlSeconds: number): Promise<boolean> {
    const res = await this.redis.set(`idemp:${key}`, "processing", "EX", ttlSeconds, "NX");
    return res === "OK";
  }

  async markCompleted(key: string): Promise<void> {
    await this.redis.set(`idemp:${key}`, "completed", "KEEPTTL");
  }
}
```

---

## 4. End-to-End Webhook Controller with Idempotency

```ts
// src/controllers/webhooks/stripe-webhook.controller.ts
import type { Context } from "hono";
import type { WebhookVerifierPort } from "@/domains/webhooks/webhook-verifier.port";
import type { IdempotencyGuard } from "@/infrastructure/guards/idempotency.guard";
import { fulfillSubscriptionAction } from "@/actions/billing/fulfill-subscription.action";
import type Stripe from "stripe";

export async function stripeWebhookController(
  c: Context,
  verifier: WebhookVerifierPort<Stripe.Event>,
  guard: IdempotencyGuard,
  webhookSecret: string
) {
  const signature = c.req.header("stripe-signature") ?? "";
  const rawBody = await c.req.text();

  const event = await verifier.verify({ rawBody, signatureHeader: signature, secret: webhookSecret });

  const { executed } = await guard.runOnce(event.id, 86400, async () => {
    if (event.type === "checkout.session.completed") {
      await fulfillSubscriptionAction(event.data.object as Stripe.Checkout.Session);
    }
  });

  return c.json({ received: true, processed: executed }, 200);
}
```
