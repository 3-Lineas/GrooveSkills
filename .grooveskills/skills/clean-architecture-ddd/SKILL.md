---
name: clean-architecture-ddd
description: Domain-driven design, clean architecture, isolated Actions layer, strict separation of concerns, pure domain logic, immutability, zero barrel files, and hard 200-line limit per file. TRIGGER when structuring new features, refactoring domain entities, organizing modules/actions/repositories, or designing service boundaries.
---

# Clean Architecture & Domain-Driven Design (DDD)

Architectural guidelines for organizing code into decoupled domain modules, isolated business actions, pure functions, and thin adapters.

---

## 1. Golden Rules (Non-negotiable)

1. **Domain Isolation (Features by Business Domain)**:
   - Group files by business domain (`users/`, `billing/`, `orders/`), never by technical type alone (`controllers/`, `services/`).

2. **Actions Layer for Business Logic**:
   - Encapsulate every single business use case in an isolated Action (`src/actions/<domain>/<action-name>.action.ts`).
   - One business action per file. Routers and UI controllers remain thin.

3. **Inversion of Dependencies**:
   - Business actions do not depend directly on database drivers or external HTTP clients.
   - Inject repository interfaces, database handles, or clients into the action.

4. **Immutability and Pure Functions**:
   - Domain calculation and transformation logic must be pure and free of side effects.
   - Do not mutate entities in place. Return updated copies (`{ ...user, status: "active" }`).

5. **Zero Barrel Files (`index.ts`)**:
   - Import directly from the exact file defining the symbol. Barrel files create circular dependency traps and bloat bundle sizes.

6. **Hard Size Limit: 200 Lines Max**:
   - If an action, entity, or router grows past 150 lines, split sub-responsibilities into atomic helpers.

---

## 2. Directory Structure

```text
src/
├── actions/                         # Pure business logic actions
│   └── billing/
│       ├── charge-subscription.action.ts  # One action per file (<100 lines)
│       └── cancel-subscription.action.ts
├── domains/                         # Domain models, types & pure logic
│   └── billing/
│       ├── billing.types.ts
│       └── calculate-prorated-tax.ts      # Pure function (<50 lines)
├── infrastructure/                  # Adapters, DB clients, external APIs
│   └── stripe/
│       └── stripe-client.ts
└── modules/                         # Transport controllers (HTTP, CLI, Worker)
    └── billing/
        ├── billing.router.ts
        └── charge-subscription.ts
```

---

## 3. Atomic Action Blueprint

```ts
import type { BillingCustomer, Invoice } from "@/domains/billing/billing.types";
import { calculateProratedTax } from "@/domains/billing/calculate-prorated-tax";
import { AppError } from "@/errors/app-error";
import type { ActionResponse } from "@/types/response.types";

export interface ChargeSubscriptionInput {
  customerId: string;
  planId: string;
}

export async function chargeSubscriptionAction(
  input: ChargeSubscriptionInput,
  paymentGateway: { charge: (id: string, amount: number) => Promise<boolean> }
): Promise<ActionResponse<Invoice>> {
  if (!input.customerId || !input.planId) {
    throw new AppError({ message: "Customer and Plan are required.", statusCode: 400 });
  }

  const baseAmount = 4900;
  const tax = calculateProratedTax(baseAmount);
  const total = baseAmount + tax;

  const success = await paymentGateway.charge(input.customerId, total);
  if (!success) {
    return { success: false, error: "Payment processing was declined by provider." };
  }

  return {
    success: true,
    data: { id: "inv_123", total, customerId: input.customerId },
  };
}
```

---

## 4. Sibling Skills

- **`best-practices`**: Universal clean code rules and guard clauses.
- **`error-handling-logging`**: Structured `AppError` and `ActionResponse`.
- **`valibot-validation`**: Domain input/output validation.
- **`external-service-adapters`**: Standardized domain ports, vendor SDK wrappers, and adapters for third-party services.
