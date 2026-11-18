# Implementation Reference: Controller Orchestration, Queues & D1 Transactions

Real-world queue adapters (Cloudflare Queues, BullMQ, AWS SQS, In-Memory) and atomic Cloudflare D1 transaction runner.

---

## 1. Cloudflare D1 Atomic Transaction Runner (`@3lineas/groovepack/pipeline/with-d1-transaction`)

Cloudflare D1 runs SQLite at the edge, where standard multi-statement transactions are executed via `db.batch()`. Do **not** reimplement `withD1Transaction` manually; import `withD1Transaction` and `D1TransactionContext` directly from `@3lineas/groovepack/pipeline/with-d1-transaction` and push statements to `txContext.stagedStatements`:

```ts
import {
  withD1Transaction,
  type D1TransactionContext,
} from "@3lineas/groovepack/pipeline/with-d1-transaction";
import { ordersTable, inventoryTable } from "@/db/schema";

interface CheckoutTxContext extends D1TransactionContext {
  orderId: string;
  productId: string;
}

export async function executeCheckoutBatch(
  database: DrizzleD1Database<typeof schema>,
  orderId: string,
  productId: string,
): Promise<CheckoutTxContext> {
  return withD1Transaction(
    database,
    { stagedStatements: [], orderId, productId },
    async (txContext) => {
      txContext.stagedStatements.push(
        database.insert(ordersTable).values({ id: txContext.orderId, productId: txContext.productId }),
      );
      txContext.stagedStatements.push(
        database.update(inventoryTable).set({ reserved: 1 }),
      );
      return txContext;
    },
  );
}
```

---

## 2. Cloudflare Queues Adapter

```ts
import type { QueuePort } from "@/types/queue/queue-port.type";
import type { QueueJob } from "@/types/queue/queue-job.type";
import { AppError } from "@3lineas/groovepack/errors";

export class CloudflareQueueAdapter implements QueuePort {
  constructor(private queue: Queue) {}

  async dispatch<T>(job: QueueJob<T>): Promise<{ jobId: string }> {
    try {
      await this.queue.send(job, { delaySeconds: job.delaySeconds });
      return { jobId: job.id ?? crypto.randomUUID() };
    } catch (caughtError) {
      throw new AppError({
        message: "Error al encolar mensaje en Cloudflare Queues.",
        statusCode: 502,
        cause: caughtError,
      });
    }
  }

  async dispatchBatch<T>(jobs: QueueJob<T>[]): Promise<{ count: number }> {
    await this.queue.sendBatch(jobs.map((job) => ({ body: job, delaySeconds: job.delaySeconds })));
    return { count: jobs.length };
  }
}
```

---

## 3. BullMQ (Redis) Adapter

```ts
import { Queue as BullQueue } from "bullmq";
import type { QueuePort } from "@/types/queue/queue-port.type";
import type { QueueJob } from "@/types/queue/queue-job.type";
import { AppError } from "@3lineas/groovepack/errors";

export class BullMQAdapter implements QueuePort {
  constructor(private bullQueue: BullQueue) {}

  async dispatch<T>(job: QueueJob<T>): Promise<{ jobId: string }> {
    try {
      const queuedJob = await this.bullQueue.add(job.name, job.data, {
        jobId: job.id,
        delay: job.delaySeconds ? job.delaySeconds * 1000 : undefined,
      });
      return { jobId: String(queuedJob.id) };
    } catch (caughtError) {
      throw new AppError({
        message: "Error al enviar trabajo a BullMQ.",
        statusCode: 502,
        cause: caughtError,
      });
    }
  }

  async dispatchBatch<T>(jobs: QueueJob<T>[]): Promise<{ count: number }> {
    await this.bullQueue.addBulk(
      jobs.map((job) => ({
        name: job.name,
        data: job.data,
        opts: { jobId: job.id, delay: job.delaySeconds ? job.delaySeconds * 1000 : undefined },
      }))
    );
    return { count: jobs.length };
  }
}
```

---

## 4. In-Memory Queue Adapter (Testing Fake)

```ts
import type { QueuePort } from "@/types/queue/queue-port.type";
import type { QueueJob } from "@/types/queue/queue-job.type";

export class MemoryQueueAdapter implements QueuePort {
  public jobs: QueueJob[] = [];

  async dispatch<T>(job: QueueJob<T>): Promise<{ jobId: string }> {
    const jobId = job.id ?? `job_${this.jobs.length + 1}`;
    this.jobs.push({ ...job, id: jobId });
    return { jobId };
  }

  async dispatchBatch<T>(jobs: QueueJob<T>[]): Promise<{ count: number }> {
    for (const job of jobs) {
      await this.dispatch(job);
    }
    return { count: jobs.length };
  }
}
```
