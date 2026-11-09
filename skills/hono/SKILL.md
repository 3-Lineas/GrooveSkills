---
name: hono
description: Use when building or modifying Hono APIs, endpoints, middlewares, or actions. TRIGGER when the project imports 'hono', when modifying routes in src/routes/ or actions in src/actions/, or when the user mentions Hono, API endpoints, or routing. Always validate with Valibot (* as v from 'valibot') and adhere to the 'best-practices' skill.
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

4. **Zero `src/domains/`, `src/controllers/`, or `src/services/` Folders**:
   - Never create a root `src/domains/` folder.
   - Domain is strictly an organizing subfolder `{domain}` inside each technical layer: `src/routes/{domain}/`, `src/actions/{domain}/`, `src/dtos/{domain}/`, `src/types/{domain}/`, and `src/errors/{domain}/`.

5. **Independent Route per File by Domain (`src/routes/{domain}/`)**:
   - Every single endpoint resides in its own atomic file: `src/routes/{domain}/{action}.route.ts`.
   - Subfolders for surfaces (e.g. `src/routes/{surface}/{domain}/` or `modules`) are ONLY permitted when the backend serves 2 or more distinct route surfaces (e.g. `web` vs `mobile`). For standard APIs, `{domain}` is direct: `src/routes/{domain}/`.
   - Group domain routes under `src/routes/{domain}/{domain}.router.ts` and mount in root router `src/routes/index.ts`.

6. **1 Route per File & 1 Atomic Action per File (Max 1 DB Query/Mutation)**:
   - Each route file defines exactly 1 HTTP endpoint.
   - Each action file exports exactly 1 atomic function.
   - **Every DB Call is an Atomic Action**: All database queries or mutations (`SELECT`, `INSERT`, `UPDATE`, `DELETE`) must live in their own dedicated atomic Action. An Action must NEVER execute multiple database operations.
   - **Zero Monolithic Use-Case Actions**: Creating god actions like `register-user.action.ts` (which bundles email existence lookup, validation, and insertion in one file) is strictly forbidden. Decompose into atomic actions (`sanitizeUserInputAction`, `ensureEmailAvailableAction`, `persistUserAction`).
   - An Action **NEVER** calls another Action. Orchestration belongs in the route.
   - No inline data interfaces or types; domain types live in `@/types/{domain}/`.

7. **Mandatory Pipeline Chaining in Routes (No Monolithic Route Actions)**:
   - A route **must never** call a single action that performs the entire use-case logic.
   - When an endpoint performs multiple steps (validation, DB lookup, DB insertion, external call): chain them sequentially using `Pipeline.send(context).through([actionA, actionB, actionC])`.
   - When an endpoint performs a simple atomic read: invoke the single query action directly (`const userProfile = await getUserByIdAction({ db, userId });`).

8. **Hard Size Limit: <200 Lines Max**:
   - Keep route endpoints under 60 lines and routers under 50 lines.

9. **Unified Client Response (`ActionResponse<T>`)**:
   - Every API endpoint response (success or failure) conforms to `ActionResponse<T>` (`success`, `message`, `data`, `error`).

---

## 2. Directory Taxonomy

```text
src/
├── routes/
│   ├── index.ts                     # Main apiRouter mounting domain routers
│   └── {domain}/                    # Direct domain route folder (unless multi-surface)
│       ├── {action}.route.ts        # Atomic endpoint (<60 lines)
│       └── {domain}.router.ts       # Domain assembly router (<50 lines)
├── dtos/{domain}/                   # Valibot schemas (<50 lines)
├── actions/{domain}/                # Atomic business logic (<100 lines, 1 function/file)
├── errors/{domain}/                 # Domain-specific AppError subclasses
└── types/{domain}/                  # Isolated domain contracts (<50 lines, 1 type/file)
```

---

## 3. Thin Route Patterns

### Pattern A: Direct Action Execution (Single Action)

```ts
import { Hono } from "hono";
import type { AppContext } from "@/types/context/app-context.type";
import type { UserProfile } from "@/types/users/user-profile.type";
import { UserResponseDto } from "@/dtos/users/user-response.dto";
import { getUserByIdAction } from "@/actions/users/get-user-by-id.action";
import { createRouteHandler } from "@/common/utils/route-handler";

export const getUserByIdRoute = new Hono<AppContext>().get(
  "/:userId",
  createRouteHandler<unknown, typeof UserResponseDto, void, { userId: string }>(
    { outputSchema: UserResponseDto, status: 200 },
    async ({ db, ctx }) => {
      const userId = ctx.req.param("userId");
      const userProfile: UserProfile = await getUserByIdAction({ db, userId });
      return userProfile;
    }
  )
);
```

### Pattern B: Pipeline Execution (Multi-Action Orchestration)

```ts
import { Hono } from "hono";
import { vValidator } from "@hono/valibot-validator";
import type { AppContext } from "@/types/context/app-context.type";
import type { CreateUserInput } from "@/types/users/create-user-input.type";
import type { UserRegistrationContext } from "@/types/users/user-registration-context.type";
import { CreateUserDto } from "@/dtos/users/create-user.dto";
import { UserResponseDto } from "@/dtos/users/user-response.dto";
import { sanitizeUserAction } from "@/actions/users/sanitize-user.action";
import { ensureEmailAvailableAction } from "@/actions/users/ensure-email-available.action";
import { persistUserAction } from "@/actions/users/persist-user.action";
import { Pipeline } from "@/common/pipeline/pipeline";
import { createRouteHandler } from "@/common/utils/route-handler";
import { validationHook } from "@/common/utils/validation";

export const createUserRoute = new Hono<AppContext>().post(
  "/",
  vValidator("json", CreateUserDto, validationHook),
  createRouteHandler<unknown, typeof UserResponseDto, CreateUserInput>(
    { outputSchema: UserResponseDto, status: 201 },
    async ({ db, input }) => {
      const initialContext: UserRegistrationContext = {
        db,
        input: input!,
        sanitizedInput: null,
        createdUser: null,
      };

      const resultContext = await Pipeline.send(initialContext)
        .through([
          sanitizeUserAction,
          ensureEmailAvailableAction,
          persistUserAction,
        ]);

      return resultContext.createdUser!;
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
