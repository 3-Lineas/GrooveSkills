---
name: error-handling-logging
description: Deterministic error handling with custom AppError, domain exception hierarchies, silent mode, Result/ActionResponse contracts, and structured logging. TRIGGER when designing error boundaries, writing try/catch blocks, handling I/O or network failures, creating domain exceptions, or configuring application loggers.
---

# Error Handling & Structured Logging Standards

Enterprise-grade patterns for deterministic error handling, typed domain exceptions, silent log mode for expected business flows, and safe API error responses.

---

## 1. Golden Rules (Non-negotiable)

1. **Hierarchy Based on `AppError`**:
   - Every domain error or business exception **MUST** extend `AppError`.
   - Never throw raw strings or generic untyped `Error("failed")` in domain actions or controllers.

2. **Atomic Domain Exceptions (1 Exception per File)**:
   - Each custom exception resides in its own atomic file: `@/errors/{domain}/{name}.error.ts` (e.g. `slug-conflict.error.ts`, `user-not-found.error.ts`).
   - Throw custom errors directly without boilerplate try/catch re-wrapping inside business logic.

3. **Auto-Logging with `silent: true` for Expected Flows**:
   - `AppError` emits a warning via structured logger upon instantiation.
   - For expected user conflicts (e.g. 409 duplicate slug, 404 not found, 400 validation error), set `silent: true` in the constructor to avoid polluting server error alerts.

4. **Universal Error Normalization in Catch Blocks**:
   - Every top-level catch block or global error handler must normalize unknown or unexpected runtime errors into `AppError` subclasses (e.g. `InternalServerError`).
   - All HTTP responses are formatted via standardized response serialization (`ActionResponse<never>`).

5. **Separate User-Safe Messages from Internal Diagnostics**:
   - The user receives courteous, empathetic, and actionable feedback in the configured locale (governed by `ux-writing`).
   - Internal logs receive complete diagnostic metadata (stack trace, payload params, correlation ID).

6. **Hard Size Limit of <200 Lines**:
   - Keep atomic exception classes under 40 lines and error handlers concise.

---

## 2. Directory Layout

```text
src/
├── errors/
│   ├── app-error.ts                  # Base AppError with auto-logging & silent flag
│   ├── common/
│   │   ├── internal-server.error.ts  # 500 error for unhandled exceptions
│   │   └── validation.error.ts       # 400 error for schema validation
│   └── {domain}/                     # Domain-specific custom exceptions
│       ├── slug-conflict.error.ts    # e.g., extends AppError (409, silent: true)
│       └── entity-not-found.error.ts # e.g., extends AppError (404, silent: true)
└── types/errors/
    └── app-error-params.type.ts      # AppError constructor options
```

---

## 3. Standard Contracts & Domain Exceptions

### A. Domain Custom Exception Example (`src/errors/stores/slug-conflict.error.ts`)
```ts
import { AppError } from "@/errors/app-error";

export class SlugConflictError extends AppError {
  constructor(
    slug: string,
    message = `El enlace '${slug}' ya está registrado. Te sugerimos agregar una palabra o número adicional.`
  ) {
    super({
      message,
      statusCode: 409,
      code: "SLUG_ALREADY_IN_USE",
      details: { slug },
      silent: true, // Expected business conflict: suppress error log alert
    });
    this.name = "SlugConflictError";
  }
}
```

### B. Universal Catch Normalization Pattern
```ts
import { AppError } from "@/errors/app-error";
import { InternalServerError } from "@/errors/common/internal-server.error";

export function normalizeError(caughtError: unknown): AppError {
  if (caughtError instanceof AppError) {
    return caughtError;
  }
  return new InternalServerError({
    message: "Ocurrió un error inesperado al procesar la solicitud.",
    cause: caughtError,
  });
}
```

---

## 4. Templates

- `./templates/app-error.template.md`: Complete extensible `AppError` base class with `silent` mode.
- `./templates/logger.template.md`: Lightweight structured logger with contextual metadata.
