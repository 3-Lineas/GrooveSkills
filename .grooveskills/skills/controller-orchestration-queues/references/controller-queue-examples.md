# Implementation Reference: Controller Orchestration & Queue Adapters

Real-world queue adapters (Cloudflare Queues, BullMQ, AWS SQS, In-Memory) and Slim Worker controllers.

---

## 1. Cloudflare Queues Adapter

```ts
// src/infrastructure/adapters/queue/cloudflare-queues.adapter.ts
import type { QueuePort, QueueJob } from "@/domains/queue/queue.port";
import { AppError } from "@/errors/app-error";

export class CloudflareQueueAdapter implements QueuePort {
  constructor(private queue: Queue) {}

  async dispatch<T>(job: QueueJob<T>): Promise<{ jobId: string }> {
    try {
      await this.queue.send(job, { delaySeconds: job.delaySeconds });
      return { jobId: job.id ?? crypto.randomUUID() };
    } catch (err) {
      throw new AppError({ message: "Error al encolar mensaje en Cloudflare Queues.", statusCode: 502, cause: err });
    }
  }

  async dispatchBatch<T>(jobs: QueueJob<T>[]): Promise<{ count: number }> {
    await this.queue.sendBatch(jobs.map((j) => ({ body: j, delaySeconds: j.delaySeconds })));
    return { count: jobs.length };
  }
}
```

---

## 2. BullMQ (Redis) Adapter

```ts
// src/infrastructure/adapters/queue/bullmq-queues.adapter.ts
import { Queue as BullQueue } from "bullmq";
import type { QueuePort, QueueJob } from "@/domains/queue/queue.port";
import { AppError } from "@/errors/app-error";

export class BullMQAdapter implements QueuePort {
  constructor(private bullQueue: BullQueue) {}

  async dispatch<T>(job: QueueJob<T>): Promise<{ jobId: string }> {
    try {
      const bJob = await this.bullQueue.add(job.name, job.data, {
        jobId: job.id,
        delay: job.delaySeconds ? job.delaySeconds * 1000 : undefined,
      });
      return { jobId: String(bJob.id) };
    } catch (err) {
      throw new AppError({ message: "Error al enviar trabajo a BullMQ.", statusCode: 502, cause: err });
    }
  }

  async dispatchBatch<T>(jobs: QueueJob<T>[]): Promise<{ count: number }> {
    await this.bullQueue.addBulk(
      jobs.map((j) => ({
        name: j.name,
        data: j.data,
        opts: { jobId: j.id, delay: j.delaySeconds ? j.delaySeconds * 1000 : undefined },
      }))
    );
    return { count: jobs.length };
  }
}
```

---

## 3. In-Memory Queue Adapter (Testing Fake)

```ts
// src/infrastructure/adapters/queue/memory-queues.adapter.ts
import type { QueuePort, QueueJob } from "@/domains/queue/queue.port";

export class MemoryQueueAdapter implements QueuePort {
  public jobs: QueueJob[] = [];

  async dispatch<T>(job: QueueJob<T>): Promise<{ jobId: string }> {
    const id = job.id ?? `job_${this.jobs.length + 1}`;
    this.jobs.push({ ...job, id });
    return { jobId: id };
  }

  async dispatchBatch<T>(jobs: QueueJob<T>[]): Promise<{ count: number }> {
    for (const job of jobs) {
      await this.dispatch(job);
    }
    return { count: jobs.length };
  }
}
```

---

## 4. Slim Queue Worker Controller Pattern

```ts
// src/infrastructure/workers/order-events.worker.ts
import { sendOrderEmailAction } from "@/actions/email/send-order-email.action";
import { syncCrmAction } from "@/actions/crm/sync-crm.action";
import { logger } from "@/infrastructure/logger/app-logger";

export async function handleOrderQueueMessage(messageBody: { name: string; data: { orderId: string; customerEmail: string } }) {
  logger.info("Procesando evento de orden", { jobName: messageBody.name, orderId: messageBody.data.orderId });

  if (messageBody.name === "orders.post-checkout") {
    await sendOrderEmailAction(messageBody.data.customerEmail, messageBody.data.orderId);
    await syncCrmAction(messageBody.data.orderId);
  }
}
```
