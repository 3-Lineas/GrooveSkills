# Hono Route Template

Slim HTTP controller that validates request body with Valibot and delegates directly to the Action.

```ts
import { Hono } from "hono";
import { sValidator } from "@hono/standard-validator";
import { registerUserSchema } from "@/schemas/auth/register-user.schema.ts";
import { registerUserAction } from "@/actions/auth/register-user.action.ts";
import type { DatabaseConnection } from "@/actions/auth/register-user.action.ts";

export interface CustomVariables {
  db: DatabaseConnection;
}

export const registerUserRoute = new Hono<{ Variables: CustomVariables }>().post(
  "/",
  sValidator("json", registerUserSchema),
  async (ctx) => {
    const input = ctx.req.valid("json");
    const db = ctx.get("db");

    const createdUser = await registerUserAction(db, input);

    return ctx.json(
      {
        success: true,
        message: "Welcome aboard! Your account has been created successfully.",
        data: createdUser,
      },
      201
    );
  }
);
```
