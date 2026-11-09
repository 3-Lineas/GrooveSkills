# Valibot Schema Template

Type-safe schema validation with courteous, persuasive, and professional error messages.
Schema lives in `src/dtos/{domain}/`. Inferred types are placed in `@/types/{domain}/` (1 type per file).

```ts
import * as v from "valibot";

export const registerUserSchema = v.object({
  email: v.pipe(
    v.string("Please provide your email address."),
    v.email("Please enter a valid email address to continue.")
  ),
  password: v.pipe(
    v.string("A secure password is required."),
    v.minLength(8, "For your account safety, your password must be at least 8 characters long.")
  ),
  fullName: v.pipe(
    v.string("Please share your name with us."),
    v.minLength(2, "Your name should be at least 2 characters long.")
  ),
});
```

*Note: Inferred type `RegisterUserInput` belongs in `src/types/auth/register-user-input.type.ts`:*
```ts
import * as v from "valibot";
import type { registerUserSchema } from "@/dtos/auth/register-user.dto";

export type RegisterUserInput = v.InferOutput<typeof registerUserSchema>;
```
