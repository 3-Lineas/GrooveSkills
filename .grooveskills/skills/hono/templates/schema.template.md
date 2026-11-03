# Valibot Schema Template

Type-safe schema validation with courteous, persuasive, and professional error messages.

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

export type RegisterUserInput = v.InferOutput<typeof registerUserSchema>;
```
