---
name: controller-orchestration-queues
description: Strict orchestration standards for Controllers, atomic Actions, database Transactions, and background Queue Adapters (Cloudflare Queues, BullMQ, AWS SQS, In-Memory). Mandates that Actions do only ONE atomic thing, while Controllers sequence multiple actions, manage transactions, or dispatch async jobs. Enforces Queue Workers as slim controllers. TRIGGER when orchestrating multi-step workflows, handling DB transactions across actions, dispatching background tasks, or designing queue consumers.
---

# Controller Action Orchestration, Transactions & Queue Adapters

Architectural standard establishing strict separation of concerns between **Atomic Actions** and **Orchestration Controllers / Queue Workers**.

---

## 1. The Core Architectural Law

1. **Actions Do Exactly ONE Atomic Thing**:
   - Pure single responsibility. Example: `createOrderAction`, `chargeCardAction`, `sendOrderEmailAction`.
   - Actions NEVER orchestrate other sibling actions or dispatch unrelated background jobs directly.
2. **Controllers are Orchestrators**:
   - HTTP route handlers and RPC controllers validate inputs, sequence actions, wrap transactional DB boundaries (`withTransaction`), and dispatch background jobs via `QueuePort`.
3. **Queue Workers are Slim Controllers**:
   - A queue worker message handler behaves like an HTTP controller: parses payload and delegates to atomic actions.

---

## 2. Directory Layout

```text
src/
├── actions/
│   ├── orders/
│   │   ├── create-order.action.ts          # Atomic insert order (<70 lines)
│   │   └── update-order-status.action.ts   # Atomic update status (<60 lines)
│   └── billing/
│       └── charge-card.action.ts           # Atomic payment charge (<70 lines)
├── controllers/
│   └── orders/
│       └── checkout.controller.ts         # Orchestrates actions + Queue (<90 lines)
├── domains/
│   └── queue/
│       ├── queue.port.ts                   # Domain interface for dispatching (<40 lines)
│       └── queue-message.types.ts          # Strongly typed queue messages (<50 lines)
└── infrastructure/
    ├── adapters/
    │   └── queue/
    │       ├── cloudflare-queues.adapter.ts # Cloudflare Queues adapter (<80 lines)
    │       ├── bullmq-queues.adapter.ts     # Redis / BullMQ adapter (<80 lines)
    │       ├── sqs-queues.adapter.ts        # AWS SQS adapter (<80 lines)
    │       └── memory-queues.adapter.ts     # In-memory testing queue (<60 lines)
    └── workers/
        └── order-events.worker.ts          # Slim worker invoking actions (<80 lines)
```

---

## 3. Domain Queue Contract (`src/domains/queue/queue.port.ts`)

```ts
export interface QueueJob<TData = unknown> {
  id?: string;
  name: string;
  data: TData;
  delaySeconds?: number;
}

export interface QueuePort {
  dispatch<T>(job: QueueJob<T>): Promise<{ jobId: string }>;
  dispatchBatch<T>(jobs: QueueJob<T>[]): Promise<{ count: number }>;
}
```

---

## 4. Orchestration Controller Pattern

```ts
// src/controllers/orders/checkout.controller.ts
import type { Context } from "hono";
import type { QueuePort } from "@/domains/queue/queue.port";
import { createOrderAction } from "@/actions/orders/create-order.action";
import { chargeCardAction } from "@/actions/billing/charge-card.action";
import { db, withTransaction } from "@/infrastructure/db/connection";

export async function checkoutController(c: Context, queue: QueuePort) {
  const payload = c.get("validatedJson");
  const actor = c.get("actor");

  // Step 1: Charge card (external side-effect, kept outside DB transaction)
  const charge = await chargeCardAction(payload.paymentMethodId, payload.amount);

  // Step 2: Atomic DB Transaction for local entity creation
  const order = await withTransaction(db, async (tx) => {
    return createOrderAction(tx, { actorId: actor.id, amount: payload.amount, chargeId: charge.id });
  });

  // Step 3: Dispatch async post-processing via Queue
  await queue.dispatch({
    name: "orders.post-checkout",
    data: { orderId: order.id, customerEmail: actor.email },
  });

  return c.json({ orderId: order.id, status: "confirmed" }, 201);
}
```

---

## 5. Detailed Adapters & Workers Reference

For real implementations of Cloudflare Queues, BullMQ, AWS SQS, and In-Memory Queue adapters, consult:
- `references/controller-queue-examples.md`
