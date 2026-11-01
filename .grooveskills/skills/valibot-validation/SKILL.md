---
name: valibot-validation
description: Schema validation at system boundaries with Valibot (* as v from "valibot"). Strict type inference (InferInput, InferOutput), input sanitization, pipeline transformations, and courteous user-facing error messages. TRIGGER when defining API request/response schemas, validating forms, parsing external payloads, env configs, or when the project imports 'valibot'.
---

# Valibot Schema Validation Standards

Guidelines for high-performance, modular schema validation at system boundaries using **Valibot** (`* as v from "valibot"`).

---

## 1. Golden Rules (Non-negotiable)

1. **Namespace Import `* as v from "valibot"`**:
   - Always import Valibot as namespace `import * as v from "valibot";` to prevent naming collisions and keep schemas consistent.

2. **Validate Every Boundary (Zero Unchecked Inputs)**:
   - Validate every HTTP body, query string, route param, environment variable, and database response crossing boundary lines.

3. **Pipelines with Polite Error Messages (`v.pipe`)**:
   - Chain schema constraints using `v.pipe(...)`.
   - Provide clear, user-facing error messages on every validation step following the `ux-writing` skill guidelines.

4. **Explicit Type Inference (`v.InferInput` & `v.InferOutput`)**:
   - Export inferred types for transformations.
   - Use `v.InferOutput<typeof schema>` for validated downstream data, and `v.InferInput<typeof schema>` for raw form inputs.

5. **`v.safeParse` vs `v.parse` Discipline**:
   - Use `v.safeParse` when building user-friendly forms or API endpoints to format issues into polite error responses without throwing.
   - Use `v.parse` for critical startup configurations (like environment variables) where throwing stops catastrophic initialization.

---

## 2. Standard Schema Example

```ts
import * as v from "valibot";

export const CreateUserSchema = v.object({
  fullName: v.pipe(
    v.string("El nombre completo es requerido."),
    v.trim(),
    v.minLength(2, "El nombre debe tener al menos 2 caracteres.")
  ),
  email: v.pipe(
    v.string("El correo electrónico es requerido."),
    v.trim(),
    v.email("Por favor ingresa un correo electrónico válido.")
  ),
  age: v.pipe(
    v.number("La edad debe ser un número."),
    v.integer("La edad debe ser un número entero."),
    v.minValue(18, "Debes ser mayor de 18 años para registrarte.")
  ),
});

export type CreateUserInput = v.InferInput<typeof CreateUserSchema>;
export type CreateUserOutput = v.InferOutput<typeof CreateUserSchema>;
```

---

## 3. Safe Parsing Helper Pattern

```ts
import * as v from "valibot";

export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  errors?: Record<string, string>;
}

export function validateSchema<TSchema extends v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>>>(
  schema: TSchema,
  input: unknown
): ValidationResult<v.InferOutput<TSchema>> {
  const result = v.safeParse(schema, input);

  if (result.success) {
    return { success: true, data: result.output };
  }

  const errors: Record<string, string> = {};
  for (const issue of result.issues) {
    const path = issue.path?.map((p) => p.key).join(".") || "root";
    if (!errors[path]) {
      errors[path] = issue.message;
    }
  }

  return { success: false, errors };
}
```

---

## 4. Sibling Skills

- **`best-practices`**: Universal clean code and `<200` line limits.
- **`ux-writing`**: Form validation copy and tone standards.
- **`hono`**: Hono API route integration with `@hono/valibot-validator` and `sValidator`.
