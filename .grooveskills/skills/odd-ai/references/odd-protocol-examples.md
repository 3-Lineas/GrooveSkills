# ODD Protocol & Workflow Examples

Concrete patterns and templates for applying Organic & Outcome-Driven Development (ODD) with AI coding agents.

---

## 1. Task Document Template (`.grooveskills/memory/tasks/YY-MM-DD-<slug>.md`)

```markdown
---
status: in-progress
createdAt: 2026-11-01
---

# Feature: Strict Valibot Input Sanitization for Auth Route

## Outcome Hypothesis
By introducing a Valibot validation schema and an isolated Action in \`src/domains/auth/validate-login.ts\`, the authentication endpoint will reject malformed payloads with structured 400 errors and sanitize incoming email strings, proven by passing Vitest unit tests and a zero-error typecheck.

## Scope
- In scope:
  - Valibot schema for \`loginSchema\` with trimmed, lowercased email.
  - Unit tests covering empty payload, invalid format, and valid login.
- Out of scope:
  - Database token generation or session cookies.

## Checklist
- [x] Create \`src/domains/auth/login.schema.ts\` with Valibot schema
- [x] Implement isolated action in \`src/domains/auth/validate-login-action.ts\`
- [x] Add test suite in \`src/domains/auth/validate-login.test.ts\`

## Evidence
- Ran \`pnpm vitest run src/domains/auth/validate-login.test.ts\`: 3 passed (12ms)
- Ran \`tsc --noEmit\`: Exit code 0 (0 errors)

## Next
- Wire \`validateLoginAction\` to the Hono route handler.
```

---

## 2. Self-Healing Verification Loop (Step 7)

When verification fails during Step 7, the agent enters an automatic self-correction loop:

1. **Capture Exact Error**: Read compiler or test failure without guessing.
2. **Isolate Root Cause**: Inspect the failing assertion or type mismatch.
3. **Remediate Minimally**: Fix the implementation without changing test expectations unless the spec changed.
4. **Re-Verify**: Re-run the verification command and log observed proof in `## Evidence`.

---

## 3. ADR Entry Example (`.grooveskills/memory/decisions.md`)

```markdown
| 2026-11-01 | Adopt ODD for AI Workflow | Standardize on 7-step ODD protocol | Balances organic iteration with empirical outcome verification across all agent sessions. |
```
