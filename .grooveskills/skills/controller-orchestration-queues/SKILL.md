---
name: controller-orchestration-queues
description: Strict orchestration standards for Controllers, atomic Actions, Pipeline pattern, database Transactions (including Cloudflare D1 batching), and background Queue Adapters. Mandates that Actions do only ONE atomic thing, while Controllers sequence multiple actions, manage transactions, or dispatch async jobs. Enforces Queue Workers as slim controllers. TRIGGER when orchestrating multi-step workflows, handling DB transactions across actions, dispatching background tasks, or designing queue consumers.
---

# Controller Action Orchestration, Pipelines, Transactions & Queues

Architectural standard establishing strict separation of concerns between **Atomic Actions**, **Declarative Pipelines**, **Transactions (SQL / D1)**, and **Orchestration Controllers / Queue Workers**.

---

## 1. The Core Architectural Law

1. **Actions Do Exactly ONE Atomic Thing (Max 1 DB Query)**:
   - Single responsibility. Example: `sanitizeSlugAction`, `ensureAvailableAction` (1 `SELECT` query), `persistOrderAction` (1 `INSERT` query).
   - **Every DB Call is an Atomic Action**: All database queries or mutations must live in an isolated Action. An Action must NEVER execute multiple DB operations.
   - **An Action NEVER calls another Action directly.** No nested Action cascades.
   - Signature: `(context: TContext) => Promise<TContext> | TContext`.

2. **Controllers & Pipelines are Orchestrators (Zero Use-Case God Actions)**:
   - Creating god actions (like `register-user.action.ts` or `checkout-order.action.ts` that bundle verification and persistence) is strictly forbidden.
   - HTTP route handlers and RPC controllers validate inputs, sequence atomic actions through Pipelines (`Pipeline.send(context).through([...actions])`), wrap transactions, and dispatch background jobs via `QueuePort`.
   - Never call a single monolithic action from a route to execute the entire use case.

3. **Atomic Multi-Mutation Pipelines (`withTransaction` / `withD1Transaction`)**:
   - In standard relational databases, wrap actions inside a database transaction handle (`tx`).
   - In serverless SQLite / Cloudflare D1, wrap pipeline executions with `withD1Transaction`: actions run immediate reads via `tx.db.select()` and stage mutations via `tx.stage(stmt)` to guarantee all-or-nothing rollback using `db.batch()`.

4. **Queue Workers are Slim Controllers**:
   - A queue worker message handler behaves like an HTTP controller: parses payload and delegates to atomic actions.

5. **Hard Size Limit of <200 Lines**:
   - Controllers, actions, and pipeline steps must remain strictly below 200 lines (target: 20-60 lines).

---

## 2. Directory Layout

```text
src/
├── actions/
│   └── orders/
│       ├── sanitize-order.action.ts        # Atomic data transform (<50 lines)
│       ├── ensure-stock.action.ts          # Atomic invariant check (<50 lines)
│       └── persist-order.action.ts         # Atomic DB persistence (<60 lines)
├── routes/
│   └── orders/
│       ├── orders.router.ts                # Router mounting endpoints (<40 lines)
│       └── checkout-order.route.ts         # Pipeline & Queue Orchestration (<80 lines)
├── types/
│   ├── orders/
│   │   ├── checkout-context.type.ts        # Pipeline context type (<40 lines)
│   │   └── order.type.ts
│   └── queue/
│       ├── queue-port.type.ts              # Domain interface for dispatching (<40 lines)
│       └── queue-job.type.ts               # Strongly typed queue messages (<50 lines)
└── infrastructure/
    └── adapters/
        └── queue/                          # Swappable Queue adapters (Cloudflare, BullMQ, Memory)
```

---

## 3. Pipeline Orchestration Pattern in Route

```ts
import { Hono } from "hono";
import { vValidator } from "@hono/valibot-validator";
import type { AppContext } from "@/types/context/app-context.type";
import type { CheckoutOrderInput } from "@/types/orders/checkout-order-input.type";
import type { CheckoutContext } from "@/types/orders/checkout-context.type";
import { CheckoutOrderDto } from "@/dtos/orders/checkout-order.dto";
import { OrderResponseDto } from "@/dtos/orders/order-response.dto";
import { sanitizeOrderAction } from "@/actions/orders/sanitize-order.action";
import { ensureStockAction } from "@/actions/orders/ensure-stock.action";
import { persistOrderAction } from "@/actions/orders/persist-order.action";
import { Pipeline } from "@/common/utils/pipeline";
import { createRouteHandler } from "@/common/utils/route-handler";
import { validationHook } from "@/common/utils/validation";

export const checkoutOrderRoute = new Hono<AppContext>().post(
  "/checkout",
  vValidator("json", CheckoutOrderDto, validationHook),
  createRouteHandler<unknown, typeof OrderResponseDto, CheckoutOrderInput>(
    { outputSchema: OrderResponseDto, status: 201 },
    async ({ db, input }) => {
      const initialContext: CheckoutContext = {
        database: db,
        input: input!,
        createdOrder: null,
      };

      const finalContext = await Pipeline.send(initialContext)
        .through([
          sanitizeOrderAction,
          ensureStockAction,
          persistOrderAction,
        ]);

      return finalContext.createdOrder!;
    }
  )
);
```

---

## 4. Cloudflare D1 Staged Batching (`withD1Transaction`)

For Cloudflare D1, wrap mutations in a staged batch to guarantee ACID rollback:

```ts
export async function stageOrderMutationAction(context: CheckoutContext): Promise<CheckoutContext> {
  const insertStatement = context.database
    .insert(ordersTable)
    .values(context.newOrderRecord);

  // Stage statement for atomic db.batch() execution
  context.transaction?.stage(insertStatement);
  return context;
}
```

---

## 5. Detailed Adapters & References

For real implementations of Cloudflare Queues, BullMQ, AWS SQS, In-Memory Queue adapters, and the full D1 Transaction runner, consult:
- `./references/controller-queue-examples.md`
