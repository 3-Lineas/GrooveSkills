---
name: valibot-validation
description: Schema validation at system boundaries with Valibot (* as v from "valibot"). Strict type inference (InferInput, InferOutput), input sanitization, pipeline transformations, bidirectional DTO isolation, and courteous user-facing error messages. TRIGGER when defining API request/response schemas, validating forms, parsing external payloads, env configs, or when the project imports 'valibot'.
---

# Valibot Schema Validation & DTO Standards

Guidelines for high-performance, modular schema validation at system boundaries and atomic Data Transfer Objects (DTOs) using **Valibot** (`* as v from "valibot"`).

---

## 1. Golden Rules (Non-negotiable)

1. **Namespace Import `* as v from "valibot"`**:
   - Always import Valibot as namespace `import * as v from "valibot";` to prevent naming collisions and keep schemas consistent.

2. **Schema & DTO Isolation (1 Schema per File)**:
   - DTO and Schema files (`@/dtos/{domain}/{name}.dto.ts` or `@/schemas/{domain}/`) contain **ONLY** Valibot schemas (`v.object({...})`).
   - In Next.js/Vinext pages, schemas exclusive to a route live co-located in `src/app/<route>/schemas/{name}.schema.ts` (1 schema per file).
   - **NEVER** declare TypeScript `type` or `interface` inside a DTO/Schema file. Inferred types belong in `@/types/{domain}/`.

3. **Bidirectional Validation (Input + Output Whitelisting)**:
   - **Input**: Validate request bodies, query params, and route params via validators (`vValidator` / `sValidator`).
   - **Output**: Serialize and whitelist outgoing responses with output schemas (`StoreResponseDto`) to eliminate sensitive fields (`passwordHash`, private tokens) and format values (e.g. ISO date conversions).

4. **Pipelines with Polite Error Messages (`v.pipe`)**:
   - Chain schema constraints using `v.pipe(...)`.
   - Provide clear, user-facing error messages on every validation step following the `ux-writing` skill guidelines.

5. **Explicit Type Inference (`v.InferInput` & `v.InferOutput`)**:
   - Use `v.InferOutput<typeof schema>` for validated downstream data, and `v.InferInput<typeof schema>` for raw form inputs.

6. **`v.safeParse` vs `v.parse` Discipline**:
   - Use `v.safeParse` when building user-friendly forms or API endpoints to format issues into polite error responses without throwing.
   - Use `v.parse` for critical startup configurations (like environment variables) where throwing stops catastrophic initialization.

7. **Hard Limit of <200 Lines**:
   - Keep atomic DTO and schema definitions concise and focused (target: 20-60 lines).

---

## 2. Directory Taxonomy

```text
src/
├── dtos/ (or schemas/)
│   └── {domain}/
│       ├── create-{entity}.dto.ts       # Request Body Schema
│       ├── {entity}-param.dto.ts        # URL Param Schema
│       ├── {entity}-query.dto.ts        # Query Filter Schema
│       └── {entity}-response.dto.ts     # Whitelist Output Response Schema
└── types/
    └── {domain}/
        ├── create-{entity}-input.type.ts  # v.InferInput<typeof CreateEntityDto>
        └── {entity}-response.type.ts      # v.InferOutput<typeof EntityResponseDto>
```

---

## 3. Bidirectional Schema Example

### Input Schema (`src/dtos/users/create-user.dto.ts`):
```ts
import * as v from "valibot";

export const CreateUserDto = v.object({
  fullName: v.pipe(
    v.string("El nombre completo es requerido."),
    v.trim(),
    v.minLength(2, "El nombre debe tener al menos 2 caracteres.")
  ),
  email: v.pipe(
    v.string("El correo electrónico es requerido."),
    v.trim(),
    v.toLowerCase(),
    v.email("Por favor ingresa un correo electrónico válido.")
  ),
});
```

### Output Whitelist Schema (`src/dtos/users/user-response.dto.ts`):
```ts
import * as v from "valibot";

export const UserResponseDto = v.object({
  id: v.string(),
  fullName: v.string(),
  email: v.string(),
  createdAt: v.pipe(
    v.union([v.date(), v.string(), v.number()]),
    v.transform((value) => new Date(value).toISOString())
  ),
});
```

### Inferred Type Isolation (`src/types/users/create-user-input.type.ts`):
```ts
import type * as v from "valibot";
import type { CreateUserDto } from "@/dtos/users/create-user.dto";

export type CreateUserInput = v.InferInput<typeof CreateUserDto>;
```

---

## 4. Safe Parsing Helper Pattern

```ts
// src/common/utils/validate-schema.ts
import * as v from "valibot";
import type { ValidationResult } from "@/types/common/validation-result.type";

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
    const issuePath = issue.path?.map((pathItem) => pathItem.key).join(".") || "root";
    if (!errors[issuePath]) {
      errors[issuePath] = issue.message;
    }
  }

  return { success: false, errors };
}
```

---

## 5. Sibling Skills

- **`best-practices`**: Universal clean code and `<200` line limits.
- **`ux-writing`**: Form validation copy and tone standards.
- **`hono`**: Hono API route integration with validation hooks and thin route wrappers.
- **`typescript-clean`**: Isolated type definitions and strict contracts.
