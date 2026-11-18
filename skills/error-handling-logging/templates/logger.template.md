# Structured Logger (`@3lineas/groovepack/logger`)

Do **not** reimplement a manual `Logger` class. Install `@3lineas/groovepack` and import the structured `logger` singleton directly:

```bash
pnpm add @3lineas/groovepack
```

```ts
import { logger } from "@3lineas/groovepack/logger";

logger.info("Operation completed", { action: "processOrder", orderId: "ord_123" });
logger.warn("Approaching rate limit", { action: "rateLimiter", remaining: 3 });
logger.error("Unexpected database error", { action: "persistOrder", error });
logger.debug("Parsed input payload", { action: "validateOrder", itemsCount: 2 });
```
