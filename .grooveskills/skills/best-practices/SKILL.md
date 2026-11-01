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
   - Use configured aliases (e.g. `@/actions/...`, `@/domains/...`, or language package namespaces).

3. **Zero Barrel Files (No re-exporting `index.ts`)**:
   - Never create `index.ts`, `mod.rs`, or library barrel files whose only purpose is re-exporting.
   - Always import directly and explicitly from the file defining the symbol.

4. **Early Return / Guard Clauses (No Nested `if`)**:
   - Never nest `if` conditions ("pyramid of doom").
   - Validate preconditions first and fail fast (return or throw). The happy path stays unindented.

5. **Single Responsibility Principle (SRP per file)**:
   - Every file must do exactly one thing. One action per action file, one endpoint per route file.

6. **Hard Size Limit: 200 Lines Max**:
   - No file may exceed 200 lines. If a file approaches 200 lines, extract helper logic into dedicated atomic files.

7. **Structured Logging and Safe Error Handling**:
   - Wrap I/O operations (network, database, file system) in `try / catch` or `Result`.
   - Log errors with contextual metadata (`file`, `line`, `details`).
   - Propagate typed errors (`AppError`) up to the controller/router layer.

8. **Polite, Persuasive, and Professional Communication**:
   - User-facing messages, validation feedback, and notifications must be courteous, engaging, solution-oriented, and professional in English.
   - Celebrate user milestones, guide them clearly through errors, and encourage action.

---

## 2. Guard Clauses Example

```ts
// ✅ CORRECT (Early return / Guard clause):
export function processTransaction(tx: Transaction): Receipt {
  if (!tx.isValid) {
    throw new AppError({
      message: "Please provide a valid transaction to continue.",
      statusCode: 400,
    });
  }

  if (tx.isExpired) {
    throw new AppError({
      message: "Your payment session has timed out. Please initiate a new request.",
      statusCode: 410,
    });
  }

  return executePayment(tx);
}

// ❌ FORBIDDEN (Nested ifs):
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
import { registerUserAction } from "@/actions/auth/register-user.action.ts";
import { AppError } from "@/errors/app-error.ts";

// ❌ FORBIDDEN (Barrel import & relative path):
import { registerUserAction } from "../../actions/auth";
```
