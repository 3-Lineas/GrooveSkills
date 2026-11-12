---
status: completed
createdAt: 2026-11-12
---

# Document Recent Versions and Dynamic Update Prompt for AI Agents

## Outcome Hypothesis
By introducing `.grooveskills/VERSIONS.md` (and template) documenting the last 5-6 releases (v1.14.0 - v1.18.1), updating `install-harness.ts` to maintain it, exposing a dynamic copy-and-paste update prompt that explicitly instructs the AI agent to read `.grooveskills/VERSIONS.md`, rendering it on `grooveskills update` and existing harness runs, and synchronizing `README.md`, projects updating GrooveSkills will immediately receive an unambiguous, actionable prompt for their AI agent without hardcoded version drift.

## Scope & Strict Boundaries
- **In scope**:
  - Create `src/domains/harness/templates/versions-template.ts` with structured release notes for v1.14.0 to v1.18.1.
  - Update `src/domains/harness/install-harness.ts` to write `.grooveskills/VERSIONS.md` on every install/update (`forceOverwrite: true`).
  - Add update prompt definitions across all 5 supported languages in `src/domains/harness/harness-languages.ts` pointing explicitly to `.grooveskills/VERSIONS.md`.
  - Create `src/domains/ui/render-update-prompt.ts` with atomic single-function design (<200 lines).
  - Integrate update prompt emission in `src/main.ts` (`isUpdateMode` & existing harness direct execution) and `src/domains/ui/ui-orchestrator.ts` (when `context.harnessExists` and not `forceOnboarding`).
  - Update `README.md` with Recent Release Highlights and `.grooveskills/VERSIONS.md` documentation.
  - Add unit tests verifying prompt rendering, multi-language support, instruction contents, and `VERSIONS.md` generation.
  - Record ADR in `decisions.md` and log day's progress in `bitacora/2026-11.md` (<= 10 items).
- **Out of scope**: Modifying unrelated skills, altering existing onboarding flows for brand new projects.

## Checklist
- [x] Create `src/domains/harness/build-versions-template.ts` with clear highlights for v1.14.0 through v1.18.1.
- [x] Update `src/domains/harness/install-harness.ts` to ensure `.grooveskills/VERSIONS.md` is written and tracked.
- [x] Add `updatePromptTitle` and `updatePrompt` to `LanguageDefinition` and `SUPPORTED_LANGUAGES` in `src/domains/harness/harness-languages.ts`.
- [x] Create `src/domains/ui/render-update-prompt.ts` with atomic single-function design (<200 lines).
- [x] Update `src/main.ts` to output update prompt upon update or existing harness direct runs.
- [x] Update `src/domains/ui/ui-orchestrator.ts` to output update prompt when updating existing harness.
- [x] Add unit tests in `src/domains/ui/render-update-prompt.test.ts` and integrate in `src/domains/fs/safe-fs.test.ts`.
- [x] Update `README.md` with recent release notes and `VERSIONS.md` file reference.
- [x] Run `pnpm check-types` and `pnpm test` ensuring 100% passes.
- [x] Update `.grooveskills/VERSIONS.md` in this repository as well.
- [x] Record ADR in `.grooveskills/memory/decisions.md` and bitacora in `.grooveskills/bitacora/2026-11.md`.
- [x] Post-Task Security Gate: Verify trust boundaries and CLI string integrity.

## Evidence
- Observed unit tests and typecheck execution receipts: `tsc --noEmit` exited 0; full test suite passed with 17 integration checks including `runUpdatePromptRenderTests` and `.grooveskills/VERSIONS.md` generation; built CLI tested in isolated temporary directory.
- English CLI integrity verified by test #8 in `safe-fs.test.ts`.
- Bitacora limit verified: 8 items for 2026-11-12 (<= 10 items).

## Next
- Deliver final completion report.
