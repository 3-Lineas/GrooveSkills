---
status: completed
createdAt: 2026-11-09
completedAt: 2026-11-09
---

# Atomic DB Actions (1 Query per Action) & Mandatory Pipeline Chaining in Routes

## Outcome Hypothesis
By establishing and enforcing the architectural rule that every database operation must reside in its own isolated atomic Action (max 1 query/mutation per Action) and that HTTP routes must sequence these atomic Actions using `Pipeline.send(context).through([...actions])` rather than calling monolithic use-case actions (such as `register-user.action.ts`), agents and developers will maintain 100% atomic, testable, and composable domain actions across all skills, templates, catalog descriptions, and documentation, proven by static lint/typecheck, test suites, and strict parity between `skills/` and `.grooveskills/skills/`.

## Scope
- In scope:
  - Update `skills/hono/SKILL.md`, `skills/hono/templates/action.template.md`, and `skills/hono/templates/router.template.md`.
  - Update `skills/best-practices/SKILL.md` (Golden Rules & imports).
  - Update `skills/clean-architecture-ddd/SKILL.md` (Rule #2, Blueprint, eliminate `chargeSubscriptionAction` monolith).
  - Update `skills/controller-orchestration-queues/SKILL.md` (Core Law #1 & #2).
  - Update `skills/rust-clean/SKILL.md` and `skills/python-clean/SKILL.md` (Atomic Action Blueprints).
  - Update `skills/groove-harness/SKILL.md` and `src/domains/harness/harness-templates.ts`.
  - Update `src/domains/registry/skill-catalog.ts` and `README.md`.
  - Record ADR in `.grooveskills/memory/decisions.md` and bitacora in `.grooveskills/bitacora/2026-11.md`.
  - Synchronize `skills/` to `.grooveskills/skills/`.
  - Verify with typecheck, build, and tests.
- Out of scope:
  - Modifying unrelated skills or breaking backward compatibility of CLI commands.

## Checklist
- [x] 1. Update `skills/hono/SKILL.md`, `action.template.md`, and `router.template.md` with 1 query per action & Pipeline chaining rules.
- [x] 2. Update `skills/best-practices/SKILL.md` with 1 DB query per Action rule and direct import example.
- [x] 3. Update `skills/clean-architecture-ddd/SKILL.md` and `skills/controller-orchestration-queues/SKILL.md`.
- [x] 4. Update `skills/rust-clean/SKILL.md` and `skills/python-clean/SKILL.md` Action Blueprints.
- [x] 5. Update `skills/groove-harness/SKILL.md` and `src/domains/harness/harness-templates.ts`.
- [x] 6. Update `src/domains/registry/skill-catalog.ts` and `README.md`.
- [x] 7. Update ADR in `.grooveskills/memory/decisions.md` and bitacora in `.grooveskills/bitacora/2026-11.md`.
- [x] 8. Sync `skills/` to `.grooveskills/skills/` and verify identical diff.
- [x] 9. Verify build, typecheck, and test suite pass cleanly.
- [x] Post-Task Security Gate: Verify trust boundaries and ensure no regression or integrity issue.

## Evidence
- `tsc --noEmit` and `tsup` succeeded with 0 errors.
- Test suites (`safe-fs.test.ts` & standalone security audit) passed cleanly (11/11 resilience tests + all security audit tests).
- `scan-skill-integrity.mjs` returned 0 SkillSpector violations.
- `diff -r skills/ .grooveskills/skills/` returned 0 differences (perfect parity).
- `grep -rn "chargeSubscriptionAction" skills/` returned 0 matches.

## Next
- Deliver final completion report.
