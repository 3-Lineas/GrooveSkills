# Template: Domain Errors with `@3lineas/groovepack/errors`

Do **not** create a manual `src/errors/app-error.ts` base class. Import `createAppError` and `AppError` directly from `@3lineas/groovepack/errors` (`v1.5.0+`).

## Atomic Error Factory (`src/errors/{domain}/{name}.error.ts`)

```ts
import { createAppError } from "@3lineas/groovepack/errors";

export const resourceNotFoundError = createAppError({
  name: "ResourceNotFoundError",
  statusCode: 404,
  code: "RESOURCE_NOT_FOUND",
  defaultMessage: "The requested resource could not be found.",
  silent: true,
});
```

## Subclassing `AppError` (Only when custom properties are required)

```ts
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
