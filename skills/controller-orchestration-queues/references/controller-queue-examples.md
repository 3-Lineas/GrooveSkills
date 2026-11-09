# Implementation Reference: Controller Orchestration, Queues & D1 Transactions

Real-world queue adapters (Cloudflare Queues, BullMQ, AWS SQS, In-Memory) and atomic Cloudflare D1 transaction runner.

---

## 1. Cloudflare D1 Atomic Transaction Runner (`withD1Transaction`)

Cloudflare D1 runs SQLite at the edge, where standard multi-statement transactions are executed via `db.batch()`. The `withD1Transaction` pattern allows actions to stage statements and execute them atomically:

```ts
import type { DrizzleD1Database } from "drizzle-orm/d1";
import type { BatchItem } from "drizzle-orm/batch";

export interface D1TransactionContext<TSchema extends Record<string, unknown>> {
  readonly db: DrizzleD1Database<TSchema>;
  stage: (statement: BatchItem<"sqlite">) => void;
}

export async function withD1Transaction<TSchema extends Record<string, unknown>, TResult>(
  database: DrizzleD1Database<TSchema>,
  callback: (transaction: D1TransactionContext<TSchema>) => Promise<TResult>
): Promise<TResult> {
  const stagedStatements: BatchItem<"sqlite">[] = [];

  const transactionContext: D1TransactionContext<TSchema> = {
    db: database,
    stage: (statement) => {
      stagedStatements.push(statement);
    },
  };

  const result = await callback(transactionContext);

  if (stagedStatements.length > 0) {
    // All staged mutations are executed in a single atomic batch
    await database.batch(stagedStatements as [BatchItem<"sqlite">, ...BatchItem<"sqlite">[]]);
  }

  return result;
}
```

---

## 2. Cloudflare Queues Adapter

```ts
import type { QueuePort } from "@/types/queue/queue-port.type";
import type { QueueJob } from "@/types/queue/queue-job.type";
import { AppError } from "@/errors/app-error";

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
import { AppError } from "@/errors/app-error";

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
