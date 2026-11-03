---
status: completed
createdAt: 2026-11-03
---

# Feature: Interactive AI Agent Onboarding Prompt Copy-Paste

## Outcome Hypothesis
By adding localized onboarding prompts to `harness-languages.ts`, rendering them via `render-onboarding-prompt.ts` at the end of `grooveskills init` or first harness initialization in both interactive and CLI modes, and updating the onboarding task template to instruct the AI agent to ask questions step-by-step to align and adapt project architecture, developers will have an immediate copy-paste message to activate their AI agent smoothly.

## Scope
- In scope:
  - Add `onboardingPromptTitle` and `onboardingPrompt` to `LanguageDefinition` and all 5 supported languages in `harness-languages.ts`.
  - Update `buildOnboardingTaskTemplate` in `harness-templates.ts` to instruct the AI agent to ask interactive alignment questions.
  - Update `installHarness` to return `HarnessInstallResult` (`{ createdFiles, onboardingInitialized }`) and propagate it in `installSkills`.
  - Create `src/domains/ui/render-onboarding-prompt.ts` (<50 lines) with clean formatting.
  - Integrate prompt display in `src/domains/ui/ui-orchestrator.ts` and `src/main.ts`.
- Out of scope:
  - Modifying external agent adapters or third-party skill definitions.

## Checklist
- [x] Extend `LanguageDefinition` with localized prompt strings for `es`, `en`, `pt`, `it`, and `fr`.
- [x] Update `buildOnboardingTaskTemplate` to emphasize interactive questions and alignment.
- [x] Return `HarnessInstallResult` from `installHarness` and accurately assign `harnessInitialized`.
- [x] Implement `render-onboarding-prompt.ts` (<50 lines).
- [x] Show prompt block in `ui-orchestrator.ts` before `p.outro()`.
- [x] Show prompt block in `src/main.ts` direct execution mode when harness was initialized.
- [x] Verify typechecking (`pnpm check-types`), build (`pnpm build`), file line count (<200 lines), and end-to-end execution.

## Evidence
- `pnpm check-types`: Exit code 0, no type errors.
- `pnpm build`: Exit code 0, ESM & DTS generated cleanly.
- `wc -l`: All modified files under 200 lines (`harness-templates.ts`: 170 lines, `render-onboarding-prompt.ts`: 32 lines, `ui-orchestrator.ts`: 137 lines).
- End-to-end temp directory test: Initial run prints formatted onboarding prompt and generates files; subsequent run omits prompt; `init` re-runs onboarding and prints prompt.

## Next
- Ready for coordinator review and release.
