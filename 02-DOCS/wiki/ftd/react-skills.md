---
author: Diego Nelson
branch: feat/react-skills
status: in-progress
---
# React Skills (`react-core`, `react-advanced` & `react-create-page`)

## Intent
Add opinionated React skills (`react-core`, `react-advanced`, and `react-create-page`) to GrooveSkills, adapted from `referenciastemporales/skills/`, aligned with GrooveSkills' universal best practices (`@/` path aliases, zero barrel files, `<200` lines per file, early returns, strict TypeScript, Valibot validation, and React 19 / Compiler consistency).

## Scope
- **In scope:**
  - Create `skills/react-core/SKILL.md` with React fundamentals, Golden Rules, and anti-patterns aligned with React 19 and `best-practices`.
  - Create `skills/react-advanced/SKILL.md` and `skills/react-advanced/references/*.md` (6 reference guides) covering React 19 platform features, React Compiler 1.0, concurrent rendering, Actions, `use()`, component patterns, performance, and RSC boundaries without referencing non-existent skills.
  - Create `skills/react-create-page/SKILL.md` adapted from `referenciastemporales/skills/create-page-view/SKILL.md`, generalizing project-specific rules into canonical React page architecture with declarative coordinators, domain hooks, isolated actions, and `@formisch/react` + Valibot forms.
  - Register `react-core`, `react-advanced`, and `react-create-page` in `src/domains/registry/skill-catalog.ts` with dependency detection for `["react", "react-dom"]`.
  - Update `README.md` with the new skills in the Available Skills table.
- **Out of scope:**
  - Creating `react-hooks-composition`, `react-state-machine`, or Next.js skills in this task.

## Checklist
- [x] Create `skills/react-core/SKILL.md` adapted to GrooveSkills standards — verified by inspecting file existence, frontmatter, and line count (168 lines < 200).
- [x] Create `skills/react-advanced/SKILL.md` and its 6 reference files in `skills/react-advanced/references/` — verified by listing all 7 files and checking line counts (all < 200 lines).
- [x] Create `skills/react-create-page/SKILL.md` with declarative coordinator, domain hook, Valibot + Formisch forms, and actions architecture — verified by inspecting frontmatter and line count (182 lines < 200).
- [x] Register `react-core`, `react-advanced`, and `react-create-page` in `src/domains/registry/skill-catalog.ts` and update `README.md` — verified by reading the catalog and README diff.
- [x] Run typecheck (`pnpm run check-types`), build (`pnpm run build`), and verify built ESM output — verified by exit code 0 and `dist/` bundle build.

## Evidence
- `wc -l`:
  - `skills/react-core/SKILL.md`: 168 lines
  - `skills/react-advanced/SKILL.md`: 147 lines
  - `skills/react-create-page/SKILL.md`: 182 lines
  - `skills/react-advanced/references/component-patterns.md`: 117 lines
  - `skills/react-advanced/references/concurrent-rendering.md`: 130 lines
  - `skills/react-advanced/references/performance.md`: 99 lines
  - `skills/react-advanced/references/react-compiler.md`: 90 lines
  - `skills/react-advanced/references/react19-actions-and-apis.md`: 145 lines
  - `skills/react-advanced/references/rsc-boundary.md`: 129 lines
- `pnpm run check-types && pnpm run build`: `tsc --noEmit` exited 0; `tsup` built `dist/cli.js` and `dist/main.js` cleanly.

## Next
Ready to commit, open a PR (`ship`), or continue with the next skill in `referenciastemporales/`.
