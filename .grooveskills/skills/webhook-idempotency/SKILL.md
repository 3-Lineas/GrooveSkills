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
3. **Slim Webhook Controller**:
   - The webhook controller verifies signatures, claims idempotency, and delegates to an action or dispatches to a queue.

---

## 2. Directory Layout

```text
src/
├── controllers/
│   └── webhooks/
│       ├── stripe-webhook.controller.ts     # Verifies + Idempotency + Action (<80 lines)
│       └── mercadopago-webhook.controller.ts # Verifies + Idempotency + Action (<80 lines)
├── domains/
│   └── webhooks/
│       ├── webhook-verifier.port.ts         # Signature verification interface (<40 lines)
│       └── idempotency.port.ts              # Idempotency storage interface (<40 lines)
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

## 3. Interfaces Contract (`src/domains/webhooks/`)

```ts
// webhook-verifier.port.ts
export interface WebhookVerifyInput {
  rawBody: string | Uint8Array;
  signatureHeader: string;
  secret: string;
}

export interface WebhookVerifierPort<TEvent = unknown> {
  verify(input: WebhookVerifyInput): Promise<TEvent>;
}

// idempotency.port.ts
export interface IdempotencyPort {
  lockOrSkip(key: string, ttlSeconds: number): Promise<boolean>;
  markCompleted(key: string): Promise<void>;
}
```

---

## 4. Idempotency Guard Implementation

```ts
// src/infrastructure/guards/idempotency.guard.ts
import type { IdempotencyPort } from "@/domains/webhooks/idempotency.port";

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
    } catch (err) {
      throw err;
    }
  }
}
```

---

## 5. Detailed Verifiers & Store References

For real HMAC verifiers (Stripe, Svix, MercadoPago) and Redis/SQL idempotency stores, see:
- `references/webhook-idempotency-examples.md`
