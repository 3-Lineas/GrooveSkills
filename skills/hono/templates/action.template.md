# Action Template (Single Responsibility Principle)

Atomic business logic decoupled from HTTP context. Database queries must be isolated inside Actions.

```ts
import { AppError } from "@/errors/app-error.ts";
import { Logger } from "@/logger/logger.ts";
import type { RegisterUserInput } from "@/schemas/auth/register-user.schema.ts";

export interface DatabaseConnection {
  findUserByEmail(email: string): Promise<{ id: string; email: string } | null>;
  createUser(data: RegisterUserInput): Promise<{ id: string; email: string; fullName: string }>;
}

export async function registerUserAction(
  db: DatabaseConnection,
  input: RegisterUserInput
): Promise<{ id: string; email: string; fullName: string }> {
  const logger = new Logger("Auth:Action:RegisterUser");

  try {
    const existing = await db.findUserByEmail(input.email);

    if (existing) {
      throw new AppError({
        message: "An account with this email address already exists. Please sign in or use another email.",
        code: "USER_ALREADY_EXISTS",
        statusCode: 409,
        silent: true,
      });
    }

    return await db.createUser(input);
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
