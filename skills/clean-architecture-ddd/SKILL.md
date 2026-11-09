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

2. **Actions Layer for Business Logic**:
   - Encapsulate every single business use case or domain computation in an isolated Action (`src/actions/{domain}/{action-name}.action.ts`).
   - Exactly ONE function per file. Pure domain logic, transformations, or calculations (e.g. `calculate-prorated-tax.action.ts`) also live as atomic Actions.
   - Routers and UI controllers remain thin and delegate to Actions.

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
├── actions/                         # Pure business logic actions (1 function/file)
│   └── billing/
│       ├── charge-subscription.action.ts
│       ├── cancel-subscription.action.ts
│       └── calculate-prorated-tax.action.ts
├── routes/                          # Thin HTTP route endpoints (1 route/file)
│   └── billing/
│       ├── billing.router.ts
│       └── charge-subscription.route.ts
├── dtos/                            # Valibot schemas (<50 lines)
│   └── billing/
│       └── charge-subscription.dto.ts
├── types/                           # Pure isolated domain types (1 type/file)
│   └── billing/
│       ├── invoice.type.ts
│       └── charge-subscription-input.type.ts
└── infrastructure/                  # Adapters, DB clients, external APIs
    └── stripe/
        └── stripe-payment-gateway.adapter.ts
```

---

## 3. Atomic Action Blueprint

```ts
import type { Invoice } from "@/types/billing/invoice.type";
import type { ChargeSubscriptionInput } from "@/types/billing/charge-subscription-input.type";
import type { PaymentGatewayPort } from "@/types/billing/payment-gateway-port.type";
import { AppError } from "@/errors/app-error";
import type { ActionResponse } from "@/types/common/action-response.type";

export async function chargeSubscriptionAction(
  input: ChargeSubscriptionInput,
  paymentGateway: PaymentGatewayPort
): Promise<ActionResponse<Invoice>> {
  if (!input.customerId || !input.planId) {
    throw new AppError({ message: "Customer and Plan are required.", statusCode: 400 });
  }

  // Pure domain math calculated directly; or if calculated by an Action, sequenced upstream via Pipeline
  const baseAmount = 4900;
  const proratedTax = Math.round(baseAmount * 0.21);
  const total = baseAmount + proratedTax;

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
