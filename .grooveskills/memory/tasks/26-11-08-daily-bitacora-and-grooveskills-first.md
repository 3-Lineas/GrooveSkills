---
status: completed
createdAt: 2026-11-08
---

# Daily Bitacora & Mandatory .grooveskills-First Read

## Outcome Hypothesis
By introducing a dedicated daily bitacora (`.grooveskills/bitacora/YYYY-MM.md`), enforcing a `.grooveskills`-first read protocol (zero project re-scanning), and adding an in-place `update` command, AI agents will reduce token overhead while providing developers with an effortless daily activity log for Jira/Trello/ClickUp tracking, proven by typecheck, automated test suite, build pass, and verifying in-place repository updates.

## Scope
- In scope:
  - Add `getProjectBitacoraDir` in `src/domains/project-store/project-paths.ts`.
  - Include `.grooveskills/bitacora` directory in preflight permission checks and harness installation.
  - Update `src/domains/detector/project-detector.ts` to detect and load configured skills and agents from existing config.
  - Add `.grooveskills-First` rule and Daily Bitacora instructions to `buildAgentHarnessBlock` in `harness-templates.ts`.
  - Add `update` command in `bin/cli.ts` and `src/main.ts` for in-place updates of existing projects.
  - Update `groove-harness` and `odd-ai` skills documentation.
  - Update `README.md` keeping file limit < 200 lines.
  - Verify all checks pass cleanly.
- Out of scope:
  - Modifying external agents adapters or unrequested files.

## Checklist
- [x] Add `getProjectBitacoraDir` helper in `src/domains/project-store/project-paths.ts`.
- [x] Add bitacora directory check in `src/domains/fs/preflight-write-check.ts`.
- [x] Ensure `.grooveskills/bitacora` is created in `src/domains/harness/install-harness.ts`.
- [x] Enhance `src/domains/detector/project-detector.ts` to load existing configured skills/agents.
- [x] Update `buildAgentHarnessBlock` with `.grooveskills`-First and bitacora rules.
- [x] Implement `update` command in `bin/cli.ts` and `src/main.ts`.
- [x] Document bitacora and `.grooveskills-first` in `skills/groove-harness/SKILL.md` and `skills/odd-ai/SKILL.md`.
- [x] Update `README.md` with bitacora folder and `update` command.
- [x] Create initial `.grooveskills/bitacora/2026-11.md`.
- [x] Pass all tests (`pnpm run check-types`, `pnpm run test`, `pnpm run build`).
- [x] Test real in-place update with `node dist/cli.js update`.

## Evidence
- `pnpm run check-types`: Clean exit (code 0).
- `pnpm run test`: All 9 defensive fs, permission, atomic replace & rollback test cases passed cleanly.
- `pnpm run build`: tsup completed build with code 0.
- `node dist/cli.js update`: Updated 25 skills and harness block cleanly in `.grooveskills` and `AGENTS.md`.

## Next
- Completed and ready for verification by caller and reviewer.
