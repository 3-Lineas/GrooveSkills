---
name: typescript-clean
description: Advanced TypeScript 5.5+ standards, strict tsconfig rules, discriminated unions, satisfies operator, const type parameters, unknown over any, atomic type isolation in @/types/, and elimination of unsafe type assertions (as / any). TRIGGER when writing or modifying TypeScript files (.ts, .tsx), type definitions, tsconfig.json, or when handling complex polymorphic domain models.
---

# TypeScript Clean Code Standards (TS 5.5+)

Guidelines for writing safe, expressive, strictly typed TypeScript with zero unsafe casts, exhaustive pattern matching, and atomic domain type isolation.

---

## 1. Golden Rules (Non-negotiable)

1. **Zero `any` and Zero Non-null Assertions (`!`)**:
   - `any` disables the compiler and hides runtime bugs. Use `unknown` with narrowers or generics.
   - Non-null assertion operator `!` assumes runtime state without proof. Use optional chaining `?.` or explicit guard clauses.

2. **Strict Type Isolation (`@/types/{domain}/`)**:
   - In modular domain architectures, **NEVER** write `interface` or `type` definitions inside DTOs, Actions, Routes, or Utility helpers.
   - Every contract has its own dedicated file: `@/types/{domain}/{name}.type.ts`.
   - Organize into domains: `common/`, `context/`, `db/`, `pipeline/`, `services/`, and `{domain}/`.

3. **Discriminated Unions for Domain States**:
   - Represent valid combinations of state using tagged unions (`type = "idle" | "loading" | "success" | "error"`).
   - Never use "optional soup" where every field is `x?: string`.

4. **Exhaustive Type Checking with `never`**:
   - Every `switch` or conditional on a union must have an `assertNever(value)` exhaustive check in default branch.

5. **Favor `satisfies` Over Type Annotations on Literals**:
   - `satisfies` checks that a value adheres to a contract without widening or discarding specific literal types.

6. **`const` Type Parameters (TS 5.0+)**:
   - Use `<const T>` in generic helper functions to preserve literal types without requiring `as const` at call site.

7. **Custom Type Guards & Inferred Type Predicates (TS 5.5+)**:
   - Use type predicates (`x is TargetType`) or rely on TS 5.5 automatic type narrowing for array filters.

8. **Avoid Unsafe `as` Type Assertions**:
   - Never use `value as SomeType` to bypass the type checker. Validate with Valibot schema or custom type guard first.

9. **Hard Size Limit of <200 Lines**:
   - Keep type definition files atomic and concise (target: 10-50 lines).

---

## 2. Directory Structure for Type Isolation

```text
src/types/
├── common/                           # Global shared contracts
│   └── action-response.type.ts       # interface ActionResponse<T>
├── context/                          # Infrastructure & runtime execution context
│   ├── env.type.ts                   # interface Env (Bindings / Secrets)
│   └── app-context.type.ts           # Context typing (Bindings, Variables)
├── db/                               # Database client and ORM entities
│   ├── database-client.type.ts       # Database client handle
│   └── {entity}.type.ts              # Select / Insert schema types
└── {domain}/                         # Domain-specific DTO & action contracts
    ├── create-{entity}-input.type.ts # Inferred from input DTO
    └── {entity}-response.type.ts     # Inferred from output DTO
```

---

## 3. Key Patterns

### A. Discriminated Unions & Exhaustiveness
```ts
export type RequestState<T> =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: T }
  | { status: "error"; error: Error };

export function assertNever(x: never): never {
  throw new Error(`Unexpected value: ${JSON.stringify(x)}`);
}

export function renderStatus<T>(state: RequestState<T>): string {
  switch (state.status) {
    case "idle":
      return "Ready to start.";
    case "loading":
      return "Loading data...";
    case "success":
      return "Data loaded successfully.";
    case "error":
      return state.error.message;
    default:
      return assertNever(state);
  }
}
```

### B. `satisfies` vs Widening Annotations
```ts
type RouteConfig = Record<string, { path: string; isProtected: boolean }>;

export const APP_ROUTES = {
  HOME: { path: "/", isProtected: false },
  DASHBOARD: { path: "/dashboard", isProtected: true },
} satisfies RouteConfig;
```

### C. Const Generic Parameters
```ts
export function createEnumSet<const T extends readonly string[]>(values: T): ReadonlySet<T[number]> {
  return new Set(values);
}

export const ROLES = createEnumSet(["admin", "editor", "viewer"]);
```

---

## 4. Strict TSConfig Expectations

Always enable:
- `"strict": true`
- `"noUncheckedIndexedAccess": true`
- `"noImplicitOverride": true`
- `"exactOptionalPropertyTypes": true` (where library ecosystem allows)

---

## 5. Sibling Skills

- **`best-practices`**: Universal clean code rules, descriptive naming, and 200-line limit.
- **`valibot-validation`**: Runtime validation inferred to static TS types.
- Reference guide: `./references/js-ts-antipatterns.md`.
