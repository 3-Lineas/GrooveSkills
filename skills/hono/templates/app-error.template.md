# AppError Template (`@3lineas/groovepack/errors`)

Do **not** create a manual `src/errors/app-error.ts` base class. Import `createAppError` and `AppError` directly from `@3lineas/groovepack/errors` (`v1.5.0+`).

```ts
// src/errors/tenants/slug-conflict.error.ts
import { createAppError } from "@3lineas/groovepack/errors";

export const slugConflictError = createAppError({
  name: "SlugConflictError",
  statusCode: 409,
  code: "SLUG_CONFLICT",
  defaultMessage: "This workspace URL is already taken.",
  silent: true,
});
```
