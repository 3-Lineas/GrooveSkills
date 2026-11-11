# Task: Clean Copyable Onboarding Prompt Layout

- Status: completed
- Date: 2026-11-11
- Lane: Lane 2 (Task)

## Outcome Hypothesis
By isolating the Unicode decorative box exclusively to the title badge (`COPY & PASTE PROMPT FOR YOUR AI AGENT`), outputting the raw prompt string with zero vertical borders (`│`), no artificial line wrapping, and no space padding, followed by a clean horizontal closing line (`───`), users can easily select or triple-click the entire prompt directly from the terminal without inadvertently copying borders or whitespace garbage into their AI client.

## Checklist
- [x] Redesign `formatOnboardingPrompt` in `src/domains/ui/render-onboarding-prompt.ts` with boxed title, raw prompt paragraph, and horizontal closing rule.
- [x] Create comprehensive automated tests in `src/domains/ui/render-onboarding-prompt.test.ts` covering all supported languages.
- [x] Register new tests in `safe-fs.test.ts` and ensure English compliance check covers `render-onboarding-prompt.ts` in `safe-fs-integration.test.ts`.
- [x] Verify strict module limits (<200 lines per file, English comments/messages).
- [x] Run full test suite (`pnpm run test`, `pnpm run check-types`, `pnpm run build`).
- [x] Update daily bitacora (`.grooveskills/bitacora/2026-11.md`) maintaining <= 10 items.

## Evidence
- Automated test output:
```
▶ Starting verification suite: Onboarding Prompt Clean Rendering...
  ✔ Onboarding prompt renders as clean copyable text without side borders across all languages.
✅ ALL ONBOARDING PROMPT RENDER TESTS PASSED.
```
- Real terminal render verification:
```
╭──────────────────────────────────────────────────────────────────────────╮
│  COPY & PASTE PROMPT FOR YOUR AI AGENT                                   │
╰──────────────────────────────────────────────────────────────────────────╯

Hola. Acabo de configurar GrooveSkills Harness en este proyecto. Por favor lee `.grooveskills/memory/tasks/00-onboarding.md`, `.grooveskills/memory/context.md` y las skills instaladas en `.agents/skills/`. Hazme preguntas interactivas paso a paso para detectar vacíos de arquitectura, aclarar objetivos y adaptar el proyecto a mis necesidades antes de continuar.

────────────────────────────────────────────────────────────────────────────
```
- No changes required to trust boundaries; no security policy modifications.
