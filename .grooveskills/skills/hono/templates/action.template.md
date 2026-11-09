# Action Template (Atomic Single Responsibility Principle)

Atomic business step decoupled from HTTP context. Every database operation must live in its own dedicated Action (maximum 1 DB query/mutation per Action). Monolithic use-case actions (e.g. `register-user.action.ts` combining lookup, validation, and insertion) are strictly forbidden.
Exports exactly ONE function per file, with zero inline data interfaces (all types imported from `@/types/{domain}/`).

```text
❌ FORBIDDEN ANTI-PATTERN:
Never create monolithic use-case actions like `register-user.action.ts` that bundle
email check (SELECT), input sanitization, and user creation (INSERT) in one file.

✅ ATOMIC PIPELINE ARCHITECTURE:
Break the use-case into atomic single-responsibility actions:
1. `src/actions/auth/sanitize-user-input.action.ts`   (Pure data sanitization)
2. `src/actions/auth/ensure-email-available.action.ts` (1 DB SELECT query + validation guard)
3. `src/actions/auth/persist-user.action.ts`          (1 DB INSERT query)
```

---

## 1. Pure Transformation Action (`sanitize-user-input.action.ts`)

```ts
import type { RegisterUserContext } from "@/types/auth/register-user-context.type";

export function sanitizeUserInputAction(
  context: RegisterUserContext
): RegisterUserContext {
  return {
    ...context,
    sanitizedInput: {
      email: context.input.email.trim().toLowerCase(),
      fullName: context.input.fullName.trim(),
      passwordHash: context.input.passwordHash,
    },
  };
}
```

---

## 2. Invariant Check Action with 1 DB Query (`ensure-email-available.action.ts`)

```ts
import { AppError } from "@/errors/app-error";
import { Logger } from "@/logger/logger";
import type { RegisterUserContext } from "@/types/auth/register-user-context.type";

export async function ensureEmailAvailableAction(
  context: RegisterUserContext
): Promise<RegisterUserContext> {
  const logger = new Logger("Auth:Action:EnsureEmailAvailable");
  const targetEmail = context.sanitizedInput?.email ?? context.input.email;

  try {
    // Exactly 1 database query (SELECT)
    const existingUser = await context.db.findUserByEmail(targetEmail);

    if (existingUser) {
      throw new AppError({
        message: "An account with this email address already exists. Please sign in or use another email.",
        code: "USER_ALREADY_EXISTS",
        statusCode: 409,
        silent: true,
      });
    }

    return context;
  } catch (caughtError) {
    if (caughtError instanceof AppError) {
      throw caughtError;
    }

    logger.error("Database query failed while checking email availability", { file: "ensure-email-available.action.ts" }, caughtError);
    throw new AppError({
      message: "We encountered an issue checking your email. Please try again shortly.",
      code: "DATABASE_QUERY_ERROR",
      statusCode: 500,
    });
  }
}
```

---

## 3. Atomic DB Mutation Action (`persist-user.action.ts`)

```ts
import { AppError } from "@/errors/app-error";
import { Logger } from "@/logger/logger";
import type { RegisterUserContext } from "@/types/auth/register-user-context.type";

export async function persistUserAction(
  context: RegisterUserContext
): Promise<RegisterUserContext> {
  const logger = new Logger("Auth:Action:PersistUser");
  const payload = context.sanitizedInput ?? context.input;

  try {
    // Exactly 1 database mutation (INSERT)
    const createdUser = await context.db.createUser(payload);

    return {
      ...context,
      user: createdUser,
    };
  } catch (caughtError) {
    if (caughtError instanceof AppError) {
      throw caughtError;
    }

    logger.error("Database insert failed while persisting user", { file: "persist-user.action.ts" }, caughtError);
    throw new AppError({
      message: "We encountered a temporary issue creating your account. Please try again shortly.",
      code: "DATABASE_MUTATION_ERROR",
      statusCode: 500,
    });
  }
}
```
