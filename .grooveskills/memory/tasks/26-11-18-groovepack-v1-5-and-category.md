---
status: completed
lane: 2
---

# Task: `@3lineas/groovepack` `v1.5.0`, Categoría `GroovePack` y Release `v1.23.0`

## Outcome Hypothesis
Al agrupar los skills dedicados de GroovePack bajo la categoría `"GroovePack"` (`SKILL_CATALOG`, `prompts.groupMultiselect`, `README.md`) y alinear todos los templates/skills con `@3lineas/groovepack` `v1.5.0` (`@3lineas/groovepack/errors`, 3 modos de `apiAction`, `logger` de 2 args y `RestApiClient` sin genéricos), `pnpm run check-types`, `pnpm test` y `pnpm run build` pasarán en `v1.23.0`.

## Checklist
- [x] Agregar `SkillCategory` (incluyendo `"GroovePack"`) a `src/types/skill.types.ts`, categorizar `SKILL_CATALOG` y agrupar `promptSkills` con `prompts.groupMultiselect`.
- [x] Crear los 4 skills dedicados: `groovepack-errors`, `groovepack-pipeline`, `groovepack-api` y `groovepack-logger`.
- [x] Reemplazar `AppError` manual por `@3lineas/groovepack/errors` y corregir `apiAction` (3 modos), `logger.*` (2 args) y `RestApiClient` en `skills/`.
- [x] Actualizar `package.json`, `build-versions-template.ts`, tests, `README.md` y `.grooveskills/` a `v1.23.0`.

## Evidence
- `rg -n "@/errors/app-error|apiClient\.(get|post|put|patch|delete)<|authApi\.(get|post|put|patch|delete)<" skills/` -> 0 matches.
- `pnpm run check-types && pnpm test && pnpm run build` -> exit code 0 (todas las suites de test y build ESM/DTS pasaron en `v1.23.0`).
