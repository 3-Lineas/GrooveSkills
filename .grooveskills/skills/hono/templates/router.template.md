# Hono Route Template

Slim HTTP controller that validates request body with Valibot via `validationHook`, uses `createRouteHandler`, and delegates to atomic Actions.
- **Multi-Step Flow (Default)**: Mandatory Pipeline orchestration chaining atomic actions (maximum 1 DB query/mutation per action). Calling a single monolithic action that does all the logic is strictly forbidden.
- **Single Read Flow**: Directly calls an atomic read Action (which executes exactly 1 `SELECT` query).
Located at `src/routes/{domain}/{action}.route.ts`.

## Pattern A: Direct Single Action Call

```ts
import { Hono } from "hono";
import type { AppContext } from "@/types/context/app-context.type";
import type { UserProfile } from "@/types/auth/user-profile.type";
import { UserResponseDto } from "@/dtos/auth/user-response.dto";
import { getUserByIdAction } from "@/actions/auth/get-user-by-id.action";
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

## Pattern B: Multi-Action Orchestration via Pipeline

```ts
import { Hono } from "hono";
import { vValidator } from "@hono/valibot-validator";
import type { AppContext } from "@/types/context/app-context.type";
import type { RegisterUserInput } from "@/types/auth/register-user-input.type";
import type { RegisterUserContext } from "@/types/auth/register-user-context.type";
import { RegisterUserDto } from "@/dtos/auth/register-user.dto";
import { UserResponseDto } from "@/dtos/auth/user-response.dto";
import { sanitizeUserAction } from "@/actions/auth/sanitize-user.action";
import { ensureEmailAvailableAction } from "@/actions/auth/ensure-email-available.action";
import { persistUserAction } from "@/actions/auth/persist-user.action";
import { Pipeline } from "@/common/pipeline/pipeline";
import { createRouteHandler } from "@/common/utils/route-handler";
import { validationHook } from "@/common/utils/validation";

export const registerUserRoute = new Hono<AppContext>().post(
  "/",
  vValidator("json", RegisterUserDto, validationHook),
  createRouteHandler<unknown, typeof UserResponseDto, RegisterUserInput>(
    { outputSchema: UserResponseDto, status: 201 },
    async ({ db, input }) => {
      const initialContext: RegisterUserContext = {
        db,
        input: input!,
        user: null,
      };

      const resultContext = await Pipeline.send(initialContext)
        .through([
          sanitizeUserAction,
          ensureEmailAvailableAction,
          persistUserAction,
        ]);

      return resultContext.user!;
    }
  )
);
```
