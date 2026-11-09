# Action Template (Single Responsibility Principle)

Atomic business logic decoupled from HTTP context. Database queries must be isolated inside Actions.
Exports exactly ONE function per file, with zero inline data interfaces (all types imported from `@/types/{domain}/`).

```ts
import { AppError } from "@/errors/app-error";
import { Logger } from "@/logger/logger";
import type { RegisterUserContext } from "@/types/auth/register-user-context.type";

export async function registerUserAction(
  context: RegisterUserContext
): Promise<RegisterUserContext> {
  const logger = new Logger("Auth:Action:RegisterUser");

  try {
    const existing = await context.db.findUserByEmail(context.input.email);

    if (existing) {
      throw new AppError({
        message: "An account with this email address already exists. Please sign in or use another email.",
        code: "USER_ALREADY_EXISTS",
        statusCode: 409,
        silent: true,
      });
    }

    const createdUser = await context.db.createUser(context.input);
    return {
      ...context,
      user: createdUser,
    };
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    logger.error("Database connection failure while registering user", { file: "register-user.action.ts" }, error);
    throw new AppError({
      message: "We encountered a temporary issue while creating your account. Please try again shortly.",
      code: "DATABASE_ERROR",
      statusCode: 500,
    });
  }
}
```
