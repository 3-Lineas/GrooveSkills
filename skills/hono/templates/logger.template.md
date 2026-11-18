# Logger (`@3lineas/groovepack/logger`)

Do **not** reimplement a manual `Logger` class. Install `@3lineas/groovepack` and import the structured `logger` singleton directly:

```bash
pnpm add @3lineas/groovepack
```

```ts
import { logger } from "@3lineas/groovepack/logger";

logger.info("User registered", { action: "persistUserAction", userId: createdUser.id });
logger.warn("Rate limit threshold approaching", { action: "checkRateLimit", remaining: 5 });
logger.error("Failed to persist user", { action: "persistUserAction", error });
logger.debug("Sanitized payload", { action: "sanitizeUserAction", email: sanitizedEmail });
```
