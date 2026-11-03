# Hono Route Template

Slim HTTP controller that validates request body with Valibot via `validationHook`, uses `createRouteHandler`, and delegates to the Action.

```ts
import { Hono } from "hono";
import { vValidator } from "@hono/valibot-validator";
import type { AppContext } from "@/types/context/app-context.type";
import type { RegisterUserInput } from "@/types/auth/register-user-input.type";
import { RegisterUserDto } from "@/dtos/auth/register-user.dto";
import { UserResponseDto } from "@/dtos/auth/user-response.dto";
import { registerUserAction } from "@/actions/auth/register-user.action";
import { createRouteHandler } from "@/common/utils/route-handler";
import { validationHook } from "@/common/utils/validation";

export const registerUserRoute = new Hono<AppContext>().post(
  "/",
  vValidator("json", RegisterUserDto, validationHook),
  createRouteHandler<unknown, typeof UserResponseDto, RegisterUserInput>(
    { outputSchema: UserResponseDto, status: 201 },
    async ({ db, input }) => {
      const createdUser = await registerUserAction(db, input!);
      return createdUser;
    }
  )
);
```
