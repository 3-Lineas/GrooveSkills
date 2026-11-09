---
name: webhook-idempotency
description: Standardized architectural pattern for incoming webhook verification and idempotency guards. Decouples vendor cryptographic signature checks (Stripe, MercadoPago, Svix, GitHub) into isolated adapters, and guarantees single execution via an IdempotencyGuard wrapper backed by persistent storage. TRIGGER when building webhook endpoints, handling payment callbacks, verifying HMAC signatures, or ensuring at-most-once processing.
---

# Incoming Webhooks, Signature Verification & Idempotency Guards

Architectural pattern for incoming webhooks: decoupled cryptographic signature verification and atomic idempotency guards to protect against duplicate delivery and replay attacks.

---

## 1. The 3 Invariants of Secure Webhooks

1. **Verify Before Anything Else**:
   - Webhook endpoints must verify HMAC cryptographic signatures using raw request bodies before running any business logic or parsing JSON.
2. **Idempotency Guard**:
   - Webhooks are delivered with "at-least-once" guarantees. An `IdempotencyGuard` checks if an event ID was already processed; if so, returns early (HTTP 200) without re-running actions.
3. **Slim Webhook Route**:
   - The webhook route verifies signatures, claims idempotency, and delegates to an action or dispatches to a queue.

---

## 2. Directory Layout

```text
src/
├── routes/
│   └── webhooks/
│       ├── stripe-webhook.route.ts          # Verifies + Idempotency + Action (<80 lines)
│       └── mercadopago-webhook.route.ts     # Verifies + Idempotency + Action (<80 lines)
├── types/
│   └── webhooks/
│       ├── webhook-verifier-port.type.ts    # Signature verification interface (<40 lines)
│       ├── webhook-verify-input.type.ts     # Payload type (<30 lines)
│       └── idempotency-port.type.ts         # Idempotency storage interface (<40 lines)
└── infrastructure/
    ├── adapters/
    │   ├── webhooks/
    │   │   ├── stripe-verifier.adapter.ts   # Stripe signature verification (<70 lines)
    │   │   ├── svix-verifier.adapter.ts     # Svix HMAC verification (<70 lines)
    │   │   └── mercadopago-verifier.adapter.ts # MP HMAC verification (<70 lines)
    │   └── idempotency/
    │       ├── redis-idempotency.adapter.ts # Redis SETNX implementation (<60 lines)
    │       └── db-idempotency.adapter.ts    # SQL unique constraint implementation (<60 lines)
    └── guards/
        └── idempotency.guard.ts             # Idempotency execution wrapper (<70 lines)
```

---

## 3. Interfaces Contract (`src/types/webhooks/`)

```ts
// src/types/webhooks/webhook-verify-input.type.ts
export interface WebhookVerifyInput {
  rawBody: string | Uint8Array;
  signatureHeader: string;
  secret: string;
}
```

```ts
// src/types/webhooks/webhook-verifier-port.type.ts
import type { WebhookVerifyInput } from "@/types/webhooks/webhook-verify-input.type";

export interface WebhookVerifierPort<TEvent = unknown> {
  verify(input: WebhookVerifyInput): Promise<TEvent>;
}
```

```ts
// src/types/webhooks/idempotency-port.type.ts
export interface IdempotencyPort {
  lockOrSkip(key: string, ttlSeconds: number): Promise<boolean>;
  markCompleted(key: string): Promise<void>;
}
```

---

## 4. Idempotency Guard Implementation

```ts
// src/infrastructure/guards/idempotency.guard.ts
import type { IdempotencyPort } from "@/types/webhooks/idempotency-port.type";

export class IdempotencyGuard {
  constructor(private port: IdempotencyPort) {}

  async runOnce<T>(key: string, ttlSeconds: number, fn: () => Promise<T>): Promise<{ executed: boolean; result?: T }> {
    const acquired = await this.port.lockOrSkip(key, ttlSeconds);
    if (!acquired) {
      return { executed: false };
    }

    try {
      const result = await fn();
      await this.port.markCompleted(key);
      return { executed: true, result };
    } catch (caughtError) {
      throw caughtError;
    }
  }
}
```

---

## 5. Detailed Verifiers & Store References

For real HMAC verifiers (Stripe, Svix, MercadoPago) and Redis/SQL idempotency stores, see:
- `references/webhook-idempotency-examples.md`
