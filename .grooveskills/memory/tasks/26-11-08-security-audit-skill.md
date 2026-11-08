---
status: completed
createdAt: 2026-11-08
---

# Feature: Unified Security Audit Skill (Cloudflare + NVIDIA SkillSpector + Strix)

## Outcome Hypothesis
By implementing the unified `security-audit` skill with 7 modular domain references, two zero-dependency ESM verification scripts (`validate-audit.mjs` and `scan-skill-integrity.mjs`), integrating the Post-Task Security Gate into ODD Step 7 and GrooveSkills Harness, registering the skill in the catalog, and updating the README with an on-demand audit prompt, the repository and client projects will have automated trust-boundary verification after every task and on-demand 6-phase adversarial auditing, proven by `scan-skill-integrity.mjs` self-check, `check-types`, `test`, `build`, and `node dist/cli.js update`.

## Scope
- In scope:
  - Create `skills/security-audit/SKILL.md` (<160 lines).
  - Create 7 modular references under `skills/security-audit/references/` (<180 lines each).
  - Create ESM scripts under `skills/security-audit/scripts/` (<180 lines each): `validate-audit.mjs` and `scan-skill-integrity.mjs`.
  - Update `skills/odd-ai/SKILL.md` and `skills/groove-harness/SKILL.md` with the Post-Task Security Gate.
  - Update `src/domains/harness/harness-templates.ts` with task template and harness block updates.
  - Register `security-audit` in `src/domains/registry/skill-catalog.ts`.
  - Update `README.md` with the on-demand audit prompt and catalog entry (<200 lines total).
  - Bump `package.json` to `1.11.0`.
  - Update `.grooveskills/memory/decisions.md` and `.grooveskills/bitacora/2026-11.md`.
- Out of scope:
  - Modifying unrelated skills or runtime CLI commands.

## Checklist
- [x] Create `skills/security-audit/SKILL.md` (66 lines, <160 limit).
- [x] Create 7 modular references in `skills/security-audit/references/` (all <70 lines, <180 limit).
- [x] Create `skills/security-audit/scripts/validate-audit.mjs` (119 lines) and `scan-skill-integrity.mjs` (124 lines).
- [x] Update `skills/odd-ai/SKILL.md` and `skills/groove-harness/SKILL.md`.
- [x] Update `src/domains/harness/harness-templates.ts` (193 lines, <200 limit).
- [x] Update `src/domains/registry/skill-catalog.ts` (187 lines, <200 limit) and `project-detector.ts` (90 lines).
- [x] Update `README.md` and keep strictly <200 lines (168 lines).
- [x] Bump `package.json` version to `1.11.0`.
- [x] Update `.grooveskills/memory/decisions.md` and `.grooveskills/bitacora/2026-11.md`.
- [x] Verify line counts, run `scan-skill-integrity.mjs`, run `check-types`, `test`, `build`, and sync store with `node dist/cli.js update`.

## Evidence
- `wc -l`: All files strictly <200 lines (README: 168 lines, harness-templates: 193 lines, skill-catalog: 187 lines, security-audit: 66 lines).
- `scan-skill-integrity.mjs`: Passed cleanly on all 26 skills with 0 violations.
- `validate-audit.mjs`: Successfully verified a compliant audit bundle.
- `pnpm check-types`: Clean exit code 0 (`tsc --noEmit`).
- `pnpm test`: All 9 defensive fs, atomic replace, and transactional rollback tests passed.
- `pnpm build`: Clean build via `tsup`.
- `node dist/cli.js update`: Successfully updated harness and synchronized 26 skills in-place across `.grooveskills/skills/`, `.agents/`, `.claude/`, `.cursor/`, and `AGENTS.md`.

## Next
- Deliver final report to coordinator.
