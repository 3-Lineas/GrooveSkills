---
name: groovepack-errors
description: Atomic domain exceptions and error handling using @3lineas/groovepack/errors (v1.5.0+): createAppError factories, .is() guards, AppError inheritance, and apiAction onError integration. TRIGGER when defining domain errors, handling AppError instances, or mapping API/pipeline failures in projects using @3lineas/groovepack.
---

# GroovePack Errors (`@3lineas/groovepack/errors`)

Standardized, zero-boilerplate domain exception management powered by `@3lineas/groovepack` (`v1.5.0+`).
**Never** create manual `src/errors/app-error.ts` base classes when `@3lineas/groovepack` is installed—import `createAppError` and `AppError` directly from `@3lineas/groovepack/errors`.

## 1. Atomic Domain Error Factories (`createAppError`)

Every domain exception lives in its own atomic file (`1` export per file) under `src/errors/{domain}/{name}.error.ts`.

```typescript
// src/errors/tenants/slug-conflict.error.ts
import { createAppError } from "@3lineas/groovepack/errors";

export const slugConflictError = createAppError({
  name: "SlugConflictError",
  statusCode: 409,
  code: "SLUG_CONFLICT",
  defaultMessage: "This workspace URL is already taken. Please choose a different slug.",
  silent: true,
});
```

### Key Properties of a `createAppError` Factory
- **Callable**: `throw slugConflictError()` (uses `defaultMessage`), `throw slugConflictError("Custom message")`, or `throw slugConflictError(undefined, { slug })` (attaches structured `details`).
- **Readonly metadata**: `slugConflictError.code` (`"SLUG_CONFLICT"`) and `slugConflictError.statusCode` (`409`).
- **Type guard**: `slugConflictError.is(caughtError)` narrows `caughtError` cleanly without `instanceof` boilerplate.
- **`apiAction` compatible**: Pass `onError: slugConflictError` directly into `apiAction({ apiCall, onError: slugConflictError })`.

## 2. Global Error Handling & `AppError` Inheritance

Import `AppError` directly from `@3lineas/groovepack/errors` for `instanceof` checks in global error handlers (e.g., Hono `globalErrorHandler`) or when subclassing with custom properties:

```typescript
// src/errors/billing/quota-exceeded.error.ts
import { AppError } from "@3lineas/groovepack/errors";

export class QuotaExceededError extends AppError {
  public readonly limit: number;

  constructor(limit: number, message = "Plan quota exceeded.") {
    super(message, 402, "QUOTA_EXCEEDED", true, { limit });
    this.limit = limit;
    this.name = "QuotaExceededError";
  }
}
```

```typescript
// Checking in a global error handler
import { AppError } from "@3lineas/groovepack/errors";
import { logger } from "@3lineas/groovepack/logger";

if (error instanceof AppError) {
  if (!error.silent) {
    logger.error(error.message, { code: error.code, statusCode: error.statusCode, details: error.details });
  }
  return context.json({ error: error.message, code: error.code }, error.statusCode);
}
```

## 3. Rules & Anti-Patterns
- **Zero manual `AppError` classes**: Do not copy-paste `class AppError extends Error` into `src/errors/app-error.ts`.
- **1 export per file**: Each `createAppError` factory or `AppError` subclass must live in its own `*.error.ts` file.
- **Silent vs. Loud**: Set `silent: true` for expected business/validation errors (4xx) and `silent: false` for unexpected infrastructure/upstream failures (5xx).
