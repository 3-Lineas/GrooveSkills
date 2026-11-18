---
name: groovepack-logger
description: Adaptive structured logging with @3lineas/groovepack/logger: strict 2-argument signature, ANSI dev vs JSON prod output, and silent AppError integration. TRIGGER when logging events, warnings, or errors in projects using @3lineas/groovepack.
---

# GroovePack Structured Logger (`@3lineas/groovepack/logger`)

Standardized, runtime-adaptive structured logger from `@3lineas/groovepack/logger`.

## 1. Strict 2-Argument Signature

All logger methods (`logger.debug`, `logger.info`, `logger.warn`, `logger.error`) accept **at most 2 arguments**:
`(message: string, context?: LogContext)`

```typescript
import { logger } from "@3lineas/groovepack/logger";

// ✅ Correct: 2 arguments (message + context object)
logger.info("User authenticated", { userId, method: "jwt" });
logger.warn("Rate limit approaching", { ip, remaining: 3 });
logger.error("Failed to process payment", {
  file: "charge-order.action.ts",
  orderId,
  error: caughtError instanceof Error ? caughtError.message : String(caughtError),
});

// ❌ Incorrect: 3 arguments
// logger.error("Failed to process payment", "charge-order.action.ts", caughtError);
```

## 2. Adaptive Output & `AppError` Integration

- **Development / Test**: Renders colorized, human-readable ANSI logs.
- **Production / Cloudflare Workers**: Emits single-line structured JSON for log aggregators.
- **`AppError.silent`**: In global error handlers, skip `logger.error` when `error instanceof AppError && error.silent` is `true` to avoid polluting production error logs with expected 4xx client errors.
