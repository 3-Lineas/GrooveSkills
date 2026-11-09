---
name: clean-architecture-ddd
description: Domain-driven design, clean architecture, isolated Actions layer, strict separation of concerns, pure domain logic, immutability, zero barrel files, and hard 200-line limit per file. TRIGGER when structuring new features, refactoring domain entities, organizing modules/actions/repositories, or designing service boundaries.
---

# Clean Architecture & Domain-Driven Design (DDD)

Architectural guidelines for organizing code into decoupled domain modules, isolated business actions, pure functions, and thin adapters.

---

## 1. Golden Rules (Non-negotiable)

1. **Domain Isolation within Technical Layers**:
   - Organize files by business domain subfolders (`users/`, `billing/`, `orders/`) *inside* each technical layer (`src/actions/{domain}/`, `src/routes/{domain}/`, `src/types/{domain}/`, `src/dtos/{domain}/`, `src/errors/{domain}/`).
   - **NEVER** create a root `src/domains/`, `src/controllers/`, or `src/services/` folder to dump code.

2. **Actions Layer for Atomic Business Steps (Max 1 DB Query)**:
   - Encapsulate every single atomic business step or domain computation in an isolated Action (`src/actions/{domain}/{action-name}.action.ts`).
   - Actions are **atomic steps**, NOT entire use cases. Never bundle calculation + database lookup + gateway call + database mutation into one monolithic Action.
   - **Every DB Call is an Atomic Action**: All database queries or mutations live in their own dedicated Action (maximum 1 DB query per Action).
   - Exactly ONE function per file. Pure domain logic, transformations, or calculations (e.g. `calculate-prorated-tax.action.ts`) live as atomic Actions.
   - Routers remain thin and sequence atomic Actions using `Pipeline.send(context).through([...actions])`.

3. **Inversion of Dependencies**:
   - Business actions do not depend directly on concrete database drivers or external HTTP clients.
   - Inject repository ports, database handles, or adapter clients into the action context.

4. **Immutability and Pure Functions**:
   - Domain calculation and transformation logic must be pure and free of side effects.
   - Do not mutate entities in place. Return updated copies (`{ ...user, status: "active" }`).

5. **Strict Atomic File Rule & Type Isolation**:
   - Every file exports at most ONE function or type.
   - Never declare interfaces or types inline inside `.action.ts` files; all types live in `@/types/{domain}/{name}.type.ts`.

6. **Zero Barrel Files (`index.ts`)**:
   - Import directly from the exact file defining the symbol. Barrel files create circular dependency traps and bloat bundle sizes.

7. **Hard Size Limit: 200 Lines Max**:
   - If an action grows past 150 lines, split sub-responsibilities into dedicated atomic helper actions in separate files.

---

## 2. Directory Structure

```text
src/
├── actions/                         # Pure business logic actions (1 function/file, max 1 DB query)
│   └── billing/
│       ├── calculate-prorated-tax.action.ts # Step 1: Pure math calculation (<40 lines)
│       ├── charge-payment-gateway.action.ts # Step 2: Atomic external payment call (<60 lines)
│       └── persist-invoice.action.ts        # Step 3: Atomic 1 DB mutation (<50 lines)
├── routes/                          # Thin HTTP route endpoints (1 route/file)
│   └── billing/
│       ├── billing.router.ts
│       └── charge-subscription.route.ts     # Pipeline orchestrator chaining Steps 1 -> 2 -> 3
├── dtos/                            # Valibot schemas (<50 lines)
│   └── billing/
│       └── charge-subscription.dto.ts
├── types/                           # Pure isolated domain types (1 type/file)
│   └── billing/
│       ├── invoice.type.ts
│       ├── charge-subscription-input.type.ts
│       └── billing-context.type.ts
└── infrastructure/                  # Adapters, DB clients, external APIs
    └── stripe/
        └── stripe-payment-gateway.adapter.ts
```

---

## 3. Atomic Action Blueprint

Actions represent ONE isolated atomic step (pure transformation, single external adapter call, or single DB query/mutation). Endpoints chain them via `Pipeline`.

```ts
// src/actions/billing/charge-payment-gateway.action.ts
import type { BillingContext } from "@/types/billing/billing-context.type";
import { AppError } from "@/errors/app-error";

export async function chargePaymentGatewayAction(
  context: BillingContext
): Promise<BillingContext> {
  if (!context.customerId || context.totalAmount <= 0) {
    throw new AppError({
      message: "Customer identifier and valid amount are required to process payment.",
      statusCode: 400,
      silent: true,
    });
  }

  // Exactly 1 external service call via injected port
  const chargeReceipt = await context.paymentGateway.charge(
    context.customerId,
    context.totalAmount
  );

  if (!chargeReceipt.success) {
    throw new AppError({
      message: "Payment processing was declined by the provider. Please verify your payment details.",
      code: "PAYMENT_DECLINED",
      statusCode: 402,
      silent: true,
    });
  }

  return {
    ...context,
    paymentReceipt: chargeReceipt,
  };
}
```

---

## 4. Sibling Skills

- **`best-practices`**: Universal clean code rules and guard clauses.
- **`error-handling-logging`**: Structured `AppError` and `ActionResponse`.
- **`valibot-validation`**: Domain input/output validation.
- **`external-service-adapters`**: Standardized domain ports, vendor SDK wrappers, and adapters for third-party services.
