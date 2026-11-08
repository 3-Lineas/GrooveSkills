# Project Context & Architecture: @3lineas/grooveskills

This file provides AI agents with instant architectural orientation for this project.

## 1. Stack & Dependencies
- **Package Manager**: `pnpm`
- `@clack/prompts` (Interactive CLI prompts)
- `commander` (CLI argument & `init` command parsing)
- `picocolors` (Terminal styling)
- `valibot` (Schema validation)
- `@types/node`, `tsup`, `typescript` (Strict TypeScript 5.9 ESM build)

## 2. Directory Structure & Domain Architecture
- Follow single-responsibility per file (<200 lines) and guard clauses (zero nested `if`s).
- Maintain direct imports with path aliases (`@/...`); avoid barrel files (`index.ts`).
- Enforce strict descriptive naming: zero single- or two-character abbreviations (`d`, `a`, `s`, `p`, `tx`, `err`, `res`, etc.). Every identifier must reflect its explicit domain intent.

### Path Aliases
- `@/*` -> `./src/*`

### Source Modules (`src/`)
- `domains/adapters/`: Agent adapters (`antigravity`, `claude`, `cursor`, `gemini`) and `skill-reference-builder.ts` (creates relative symbolic links in agent skills folders pointing directly to `.grooveskills/skills/<skill>/` and rule references for Cursor).
- `domains/detector/`: Stack dependency detection (`package.json`, `Cargo.toml`, `pyproject.toml`) and active agent/harness detection.
- `domains/harness/`: Mandatory harness installer (`install-harness.ts`), automatic project onboarding scanner (`scan-project-onboarding.ts`), multilingual templates (`harness-templates.ts`), `AGENTS.md`/`CLAUDE.md` upserter, and `config.json` persistence.
- `domains/installer/`: Installation orchestrator (`install-orchestrator.ts`) ensuring `groove-harness` and `odd-ai` are always installed.
- `domains/project-store/`: Canonical `.grooveskills/skills/` store synchronization (`sync-project-store.ts`).
- `domains/registry/`: `SKILL_CATALOG` metadata registry (with `isCoreHarness: true` on `groove-harness`).
- `domains/ui/`: Clack interactive wizard (`ui-orchestrator.ts`, `prompt-skills.ts` filtering out `isCoreHarness`).
- `types/`: Domain TypeScript interfaces.

## 3. Communication & User Copy Language
- **Configured Language**: Español (`es`).
- **Policy**: Todos los mensajes, validaciones, errores, CTAs y comunicaciones con el usuario deben redactarse estrictamente en Español. El tono debe ser empático, amable, persuasivo y profesional.

## 4. Essential Commands
- **build**: `pnpm build` (or `./node_modules/.bin/tsup`)
- **typecheck**: `pnpm check-types` (or `./node_modules/.bin/tsc --noEmit`)
- **dev**: `pnpm dev`
- **re-onboard**: `npx @3lineas/grooveskills init`
