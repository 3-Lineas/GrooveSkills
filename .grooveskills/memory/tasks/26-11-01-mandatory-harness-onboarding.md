---
status: completed
createdAt: 2026-11-01
---

# Feature: Core Harness Invisible en Selección, Onboarding Automático y Comando `init` (v1.5.0)

## Outcome Hypothesis
Mediante el filtrado de `isCoreHarness` en `prompt-skills.ts`, la creación del escáner `scan-project-onboarding.ts` y la adición del comando `grooveskills init` en `bin/cli.ts`, el GrooveSkills Harness se instalará siempre por defecto sin aparecer como checkbox opcional, ejecutará el onboarding automáticamente en la primera instalación y permitirá re-ejecutarlo bajo demanda con `npx @3lineas/grooveskills init`, demostrado con compilación limpia (`tsc --noEmit && tsup`) y ejecución real sobre el repositorio.

## Scope
- In scope:
  - Ocultar `groove-harness` (`isCoreHarness: true`) de la lista de seleccionables en `prompt-skills.ts`.
  - Crear `src/domains/harness/scan-project-onboarding.ts` (<200 líneas, cero `if` anidados).
  - Actualizar `harness-templates.ts` e `install-harness.ts` para generar `context.md` enriquecido y `00-onboarding.md`.
  - Soportar `npx @3lineas/grooveskills init` en `bin/cli.ts` y `src/main.ts`.
  - Actualizar `README.md` y la memoria del harness en `.grooveskills/memory/`.
- Out of scope:
  - Cambios en skills de frameworks externos.

## Checklist
- [x] Marcar `groove-harness` con `isCoreHarness: true` y filtrarlo en `promptSkills`
- [x] Implementar `src/domains/harness/scan-project-onboarding.ts`
- [x] Actualizar `harness-templates.ts`, `install-harness.ts` y `AGENTS.md` / `CLAUDE.md`
- [x] Implementar comando `init` en `bin/cli.ts` y `src/main.ts`
- [x] Actualizar `README.md` (<200 líneas) y `.grooveskills/memory/` (`context.md`, `decisions.md`, `00-onboarding.md`)
- [x] Verificar `tsc --noEmit && tsup` y conteo de líneas (`wc -l`)

## Evidence
- `wc -l README.md src/**/*.ts`: Todos los archivos estrictamente <200 líneas (`README.md` 156 líneas, `scan-project-onboarding.ts` 178 líneas).
- `./node_modules/.bin/tsc --noEmit && ./node_modules/.bin/tsup`: Exit code 0 (ESM + DTS generados en `dist/`).
- `node ./dist/cli.js init --skills ... --agents antigravity claude cursor gemini -l es -y`: Exit code 0; generó `context.md`, `00-onboarding.md` y actualizó `AGENTS.md` y `CLAUDE.md`.

## Next
- Listo para commit, tag `v1.5.0` y push cuando el usuario lo indique.
