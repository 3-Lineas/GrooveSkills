---
name: hono
description: Use when building or modifying Hono APIs, endpoints, middlewares, or actions. TRIGGER when the project imports 'hono', when modifying routes in src/modules/ or actions in src/actions/, or when the user mentions Hono, API endpoints, or routing. Always validate with Valibot (* as v from 'valibot') and adhere to the 'best-practices' skill.
---

# Hono Architecture & Thin Route Standards

Standardized guide for building robust, scalable Hono applications with isolated domain layers, strict Valibot validation, typed Actions, and thin route wrappers.

---

## 1. Golden Rules (Non-negotiable)

1. **Standard Schema Validator with Valibot**:
   - Always use **Valibot** (`* as v from "valibot"`) with `@hono/valibot-validator` (`vValidator`) or `@hono/standard-validator` (`sValidator`).
   - Use `validationHook` to intercept schema issues and emit a standardized `400 Bad Request` with `ActionResponse<never>`.

2. **Strict Route Wrapper (`createRouteHandler`)**:
   - Endpoints must be thin controllers. Wrap routes with `createRouteHandler({ outputSchema, status }, handler)`.
   - Handler automatically receives `{ db, logger, env, input, ctx }`, handles try/catch normalization to `AppError`, and returns serialized `ActionResponse<T>`.

3. **Strict Identifier Naming**:
   - The Hono context parameter is **ALWAYS** named `ctx` (NEVER `c`).
   - Catch errors are **ALWAYS** named `error` or `caughtError` (NEVER `e` or `err`).

4. **Independent Route per File by Domain**:
   - Every single endpoint resides in its own file (`src/routes/modules/{domain}/{action}.route.ts`).
   - Group them under the domain router `src/routes/modules/{domain}/{domain}.router.ts` and mount in root router.

5. **Business Logic Exclusively in Actions / Pipelines**:
   - All business logic lives in `src/actions/{domain}/{action}.action.ts`.
   - Never execute SQL, D1, Drizzle, or Prisma queries directly inside route handlers.

6. **Hard Size Limit: <200 Lines Max**:
   - Keep route endpoints under 60 lines and routers under 50 lines.

7. **Unified Client Response (`ActionResponse<T>`)**:
   - Every API endpoint response (success or failure) conforms to `ActionResponse<T>` (`success`, `message`, `data`, `error`).

---

## 2. Directory Taxonomy

```text
src/
├── routes/
│   ├── index.ts                     # Main apiRouter mounting domain routers
│   └── modules/{domain}/
│       ├── {action}.route.ts        # Atomic endpoint (<60 lines)
│       └── {domain}.router.ts       # Domain assembly router (<50 lines)
├── dtos/{domain}/                   # Valibot schemas (<50 lines)
├── actions/{domain}/                # Atomic business logic (<100 lines)
└── types/                           # Isolated domain contracts (<50 lines)
```

---

## 3. Thin Route Pattern Example

```ts
import { Hono } from "hono";
import { vValidator } from "@hono/valibot-validator";
import type { AppContext } from "@/types/context/app-context.type";
import type { CreateUserInput } from "@/types/users/create-user-input.type";
import { CreateUserDto } from "@/dtos/users/create-user.dto";
import { UserResponseDto } from "@/dtos/users/user-response.dto";
import { registerUserAction } from "@/actions/users/register-user.action";
import { createRouteHandler } from "@/common/utils/route-handler";
import { validationHook } from "@/common/utils/validation";

export const createUserRoute = new Hono<AppContext>().post(
  "/",
  vValidator("json", CreateUserDto, validationHook),
  createRouteHandler<unknown, typeof UserResponseDto, CreateUserInput>(
    { outputSchema: UserResponseDto, status: 201 },
    async ({ db, input }) => {
      return await registerUserAction(db, input!);
    }
  )
);
```

---

## 4. Domain Router Assembly

```ts
import { Hono } from "hono";
import type { AppContext } from "@/types/context/app-context.type";
import { createUserRoute } from "./create-user.route";
import { listUsersRoute } from "./list-users.route";

export const usersRouter = new Hono<AppContext>()
  .route("/", createUserRoute)
  .route("/", listUsersRoute);
```

---

## 5. Templates

- `./templates/router.template.md`: Atomic route template with `createRouteHandler`.
- `./templates/action.template.md`: Single responsibility Action template.
- `./templates/schema.template.md`: Valibot schema template with UX microcopy.
- `./templates/error-handler.template.md`: Centralized error handler template.
