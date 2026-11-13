---
name: world-class-engineering
description: Enforces world-business-grade root-cause solutions by default, banning permissive fallbacks, auth bypasses, and silent compatibility hacks unless explicitly scoped down by the user.
---

# World-Class Engineering & Zero Tech-Debt

## 1. Guiding Principle

Every task MUST be delivered to **World-Business-Grade** production enterprise standards by default:
- Strict security and trust boundaries (authentication, authorization, tenant isolation, input validation).
- Clean root-cause fixes rather than symptom patches.
- Complete, clean migration of affected callers, DTOs, and tests.
- Zero deliberate technical debt or silent workarounds.

A reduced scope or temporary bridge is **ONLY** permitted when explicitly requested or approved by the user.

---

## 2. Forbidden Antipatterns ("Zero Tech-Debt Patches")

NEVER introduce any of the following to avoid friction with existing code, legacy clients, or failing tests:

1. **Permissive Fallbacks & Auth Bypasses**:
   - Making authentication middleware optional on protected routes.
   - Falling back to untrusted query parameters, body fields, or unverified headers (e.g., `?crewId=...` or `x-user-id`) when `ctx.get('user')` or session identity is missing.
   - Introducing BOLA (Broken Object Level Authorization) or tenant-isolation bypasses "to keep legacy test clients working."
2. **Unsolicited Dual Modes & Compatibility Shims**:
   - Maintaining parallel insecure/legacy code paths alongside the clean path without explicit user approval.
   - Adding silent fallback branches that weaken domain invariants or validation contracts.
3. **Test & Type Weakening**:
   - Silencing TypeScript errors with `as any`, `@ts-ignore`, or `@ts-expect-error`.
   - Skipping, deleting, or relaxing existing tests to make a build appear green.
   - Leaving `TODO` hacks in place of proper error handling or boundary validation.

---

## 3. Clean Ripple Updates Protocol

When implementing the correct, clean solution breaks existing tests, fixtures, DTOs, or callers within the project:
1. **Update Dependents Cleanly**: Update the affected tests, fixtures, and callers to conform to the strict contract (e.g., attach proper auth headers/tokens in test clients, mount required auth middleware on test routers).
2. **Escalate When Scope Exceeds Expectations**: If updating dependents requires changes beyond the expected risk, effort, or task boundary, **STOP and ask the user** before proceeding or reducing scope. Never silently downgrade the implementation to avoid updating callers.

---

## 4. Explicit Scope-Down Gate

A temporary bridge or reduced scope is ONLY valid when:
1. The user explicitly requests or approves the reduced scope.
2. The exact boundaries, assumed security/correctness risk, and removal plan are documented in `.grooveskills/memory/tasks/YY-MM-DD-<slug>.md`.
