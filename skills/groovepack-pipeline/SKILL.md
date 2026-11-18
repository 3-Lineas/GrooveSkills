---
name: groovepack-pipeline
description: Atomic action orchestration and Cloudflare D1 transactional pipelines using @3lineas/groovepack/pipeline and @3lineas/groovepack/pipeline/with-d1-transaction. TRIGGER when chaining multi-step workflows, staging Drizzle/D1 statements, or executing transactional pipelines.
---

# GroovePack Pipeline & D1 Transactions (`@3lineas/groovepack/pipeline`)

Standardized Laravel-inspired `Pipeline` orchestration and Cloudflare D1 / Drizzle batch transaction support.

## 1. Atomic Pipeline Chaining

Routes and controllers sequence single-purpose atomic Actions (`PipeAction<TContext>`) using `Pipeline.send(initialContext).through([...actions]).then(destination?)`:

```typescript
import { Pipeline } from "@3lineas/groovepack/pipeline";

const result = await Pipeline.send({ input, db: context.env.DB })
  .through([
    validateTenantInputAction,
    checkSlugAvailabilityAction,
    insertTenantAction,
  ])
  .then((finalContext) => finalContext.createdTenant);
```

## 2. Transactional D1 / Drizzle Pipelines (`.transactional(db)`)

When multiple database mutations must succeed or fail atomically on Cloudflare D1:
1. Actions push prepared Drizzle statements into `context.stagedStatements` instead of executing them immediately.
2. `.transactional(db)` executes `db.batch(stagedStatements)` at the end of the pipeline.
3. If any pipe throws, `stagedStatements` are discarded in memory—nothing is committed to D1.

```typescript
import { Pipeline } from "@3lineas/groovepack/pipeline";
import type { D1TransactionContext } from "@3lineas/groovepack/pipeline/with-d1-transaction";

interface CreateOrderContext extends D1TransactionContext {
  orderInput: CreateOrderInput;
}

const result = await Pipeline.send<CreateOrderContext>({
  orderInput,
  stagedStatements: [],
})
  .transactional(db)
  .through([
    stageOrderInsertAction,
    stageInventoryDecrementAction,
  ])
  .then((finalContext) => finalContext);
```

## 3. Standalone `withD1Transaction`

For imperative multi-statement D1 batches outside a `Pipeline`, use `withD1Transaction` from `@3lineas/groovepack/pipeline/with-d1-transaction`:

```typescript
import { withD1Transaction } from "@3lineas/groovepack/pipeline/with-d1-transaction";

await withD1Transaction(db, { orderInput }, async (txContext) => {
  txContext.stagedStatements.push(db.insert(orders).values(txContext.orderInput));
  return txContext;
});
```

## 4. Rules
- **1 DB call per Action**: Never execute multiple queries inside a single pipe action.
- **No monolithic use-case actions**: Always compose small, testable `PipeAction<TContext>` steps.
