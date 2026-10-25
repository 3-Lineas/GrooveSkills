---
name: hono
description: Use when building or modifying Hono APIs, endpoints, middlewares, or actions. TRIGGER when the project imports 'hono', when modifying routes in src/modules/ or actions in src/actions/, or when the user mentions Hono, API endpoints, or routing. Always validate with Valibot (* as v from 'valibot') and adhere to the 'best-practices' skill.
---

# Hono Architecture & Opinionated Best Practices

Standardized guide for building robust, scalable, enterprise-grade Hono applications with isolated domain layers, strict Valibot validation, and typed Actions.

---

## 1. Golden Rules (Non-negotiable)

1. **Standard Schema Validator with Valibot**:
   - Always use **Valibot** (`* as v from "valibot"`) with `@hono/standard-validator` (`sValidator`) or `@hono/valibot-validator`.
   - Never use Zod.
2. **Mandatory Path Aliases (`@/...`)**:
   - Import all internal modules using configured path aliases (`@/actions/...`, `@/schemas/...`, `@/errors/...`).
3. **Zero Barrel Files**:
   - Never create `index.ts` files that re-export multiple routes or actions.
   - Import directly from each specific action and schema file.
4. **Independent Route per File by Domain**:
   - Every single endpoint resides in its own file (`src/modules/{domain}/{action}.ts`).
   - Group them under the domain router `src/modules/{domain}/{domain}.router.ts`.
5. **Business Logic Exclusively in Actions**:
   - All business logic lives inside `src/actions/{domain}/{action}.action.ts`.
   - Routers are slim controllers: validate input, call the action, return the response.
6. **Database Connections strictly in Actions**:
   - Never execute SQL, D1, Drizzle, or Prisma queries inside routes or middleware.
   - The database instance is injected from Hono context (`ctx.get("db")`) into the action function.
7. **Single Responsibility Principle (SRP)**:
   - Each action performs **exactly one** business action.
8. **Hard File Limit**:
   - Maximum **200 lines per file**.
9. **Unified Error Handling**:
   - Throw typed `AppError` instances for business failures.
   - Wrap I/O operations in `try / catch`, log with structured `Logger`, and re-throw or propagate to `globalErrorHandler`.
10. **Courteous and Professional User Feedback**:
    - Return polite, engaging, and solution-oriented messages in English (`ActionResponse<T>`).

---

## 2. Directory Taxonomy

```text
apps/api/src/
├── actions/                         # Pure business logic layer
│   └── auth/
│       ├── register-user.action.ts  # One atomic action (< 100 lines)
│       └── login-user.action.ts
├── modules/                         # Thin HTTP controllers
│   └── auth/
│       ├── register-user.ts         # Endpoint definition (< 80 lines)
│       └── auth.router.ts           # Domain router mounting endpoints (< 60 lines)
├── schemas/                         # Valibot schemas
│   └── auth/
│       └── register-user.schema.ts  # Strict input schema (< 50 lines)
├── errors/
│   ├── app-error.ts                 # Base application error with auto-logging
│   └── error-handler.ts             # Central Hono error handler
└── routers/
    └── api.router.ts                # Root router exporting ApiRouter type for RPC
```

---

## 3. Valibot Validation Example

```ts
import { sValidator } from "@hono/standard-validator";
import * as v from "valibot";

export const loginSchema = v.object({
  email: v.pipe(
    v.string("Please provide your email address."),
    v.email("Please provide a valid email address.")
  ),
  password: v.pipe(
    v.string("Password is required."),
    v.minLength(8, "Your password must be at least 8 characters long.")
  ),
});

export type LoginInput = v.InferOutput<typeof loginSchema>;
```

---

## 4. Standard Response Contract

```ts
export interface ActionResponse<T = unknown> {
  success: boolean;
  message?: string;
  error?: string;
  data?: T;
}
```
