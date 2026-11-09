---
name: best-practices
description: Universal coding standards, clean architecture, error handling, and file structure guidelines. TRIGGER when writing, creating, or refactoring ANY file, function, module, or component in ANY programming language (TypeScript, PHP, Dart, Rust, Go, Python, etc.) across the project.
---

# Universal Best Practices & Clean Architecture

Universal guidelines applicable to **any programming language** and **any file** in the project.

---

## 1. Golden Rules (Non-negotiable)

1. **Strict Typing (Zero `any`, Zero `dynamic`)**:
   - Every variable, parameter, property, and return value must have a concrete type.
   - For TypeScript: `any` is forbidden. Use generics or `unknown` with type guards.
   - For Dart: `dynamic` is forbidden. Use generics or `Object`.
   - For PHP: Use strict typing (`declare(strict_types=1);`), typed properties, arguments, and return types.
   - For Rust: Explicit types and structured `Result<T, E>` / `Option<T>`.

2. **Always Use Path Aliases (`@/...`)**:
   - Never use deep relative paths (`../../..`).
   - Use configured aliases (e.g. `@/actions/{domain}/...`, `@/routes/{domain}/...`, `@/types/{domain}/...`, or language package namespaces).

3. **Zero Barrel Files (No re-exporting `index.ts`)**:
   - Never create `index.ts`, `mod.rs`, or library barrel files whose only purpose is re-exporting.
   - Always import directly and explicitly from the file defining the symbol.

4. **Early Return / Guard Clauses (No Nested `if`)**:
   - Never nest `if` conditions ("pyramid of doom").
   - Validate preconditions first and fail fast (return or throw). The happy path stays unindented.

5. **Strict Atomic File Rule (1 Function / 1 Method per File & Max 1 DB Query)**:
   - Every file must export **at most ONE function, method, action, route handler, component, hook, schema, or type**.
   - **NEVER** group multiple functions, helper functions, or utility methods in the same file. If a function needs a helper, extract that helper into its own dedicated atomic file.
   - **1 DB Call per Action**: Every database operation (`SELECT`, `INSERT`, `UPDATE`, `DELETE`) must reside in its own dedicated atomic Action. An Action must never execute multiple DB queries.
   - **Zero Monolithic Use-Case Actions**: Do not create god actions (like `register-user.action.ts`) that bundle lookups, validations, and persistence together. Routes must chain atomic actions sequentially via `Pipeline`.
   - **No Inline Data Types**: Never declare data `interface` or `type` definitions inline inside actions, routes, DTOs, hooks, or components. **Exception**: Only a UI component's own `Props` interface (e.g. `interface ButtonProps`) may be declared inline in its `.tsx` file; all other domain/data types must live in `@/types/{domain}/{name}.type.ts`.
   - **NEVER** create `src/domains/` or `src/services/` folders to dump business logic; all business logic lives in atomic actions under `src/actions/{domain}/{action-name}.action.ts`.

6. **Hard Size Limit: 200 Lines Max**:
   - No file may exceed 200 lines. If a file approaches 200 lines, extract helper logic into dedicated atomic files.

7. **Structured Logging and Safe Error Handling**:
   - Wrap I/O operations (network, database, file system) in `try / catch` or `Result`.
   - Log errors with contextual metadata (`file`, `line`, `details`).
   - Propagate typed errors (`AppError`) up to the controller/router layer.

8. **Descriptive Naming (Zero Cryptic or Single-Letter Identifiers)**:
   - Single-character, two-character, or cryptic abbreviations for variables, parameters, properties, import aliases, and loop/callback iterators are strictly forbidden (e.g. `d`, `a`, `s`, `p`, `i`, `tx`, `cb`, `err`, `res`, `req`, `fn`).
   - Every identifier must be fully descriptive and reflect its domain intent (e.g. `dependencyName`, `agentId`, `installSpinner`, `transaction`, `prompts`, `picocolors`, `request`, `response`, `caughtError`, `itemIndex`).
   - This applies universally across all contexts: `.map()`, `.filter()`, `.reduce()`, loops (`for`, `while`), `catch` blocks, and module imports.

9. **Polite, Persuasive, and Professional Communication**:
   - User-facing messages, validation feedback, and notifications must be courteous, engaging, solution-oriented, and professional in English.
   - Celebrate user milestones, guide them clearly through errors, and encourage action.

---

## 2. Guard Clauses Example

```ts
// ✅ CORRECT (Early return / Guard clause & descriptive identifiers):
export function processTransaction(activeTransaction: Transaction): Receipt {
  if (!activeTransaction.isValid) {
    throw new AppError({
      message: "Please provide a valid transaction to continue.",
      statusCode: 400,
    });
  }

  if (activeTransaction.isExpired) {
    throw new AppError({
      message: "Your payment session has timed out. Please initiate a new request.",
      statusCode: 410,
    });
  }

  return executePayment(activeTransaction);
}

// ❌ FORBIDDEN (Nested ifs & cryptic abbreviation 'tx'):
export function processTransaction(tx: Transaction) {
  if (tx.isValid) {
    if (!tx.isExpired) {
      return executePayment(tx);
    }
  }
}
```

---

## 3. Direct Import Example

```ts
// ✅ CORRECT (Direct import with alias):
import { persistUserAction } from "@/actions/auth/persist-user.action.ts";
import { AppError } from "@/errors/app-error.ts";

// ❌ FORBIDDEN (Barrel import & relative path):
import { persistUserAction } from "../../actions/auth";
```
