---
status: completed
createdAt: 2026-11-01
---

# Feature: Implementación Skill `odd-ai` y ODD en GrooveSkills Harness

## Outcome Hypothesis
Mediante la creación del skill `odd-ai` y la actualización del harness (`groove-harness`, plantillas de tareas, bloques de instrucciones y orquestador), los agentes operarán bajo un protocolo orgánico de 7 pasos con hipótesis de resultado verificables, comprobado mediante typecheck/build limpios (`tsc --noEmit && tsup`), pruebas de instalación local y sincronización del repositorio.

## Scope
- In scope:
  - Crear `skills/odd-ai/SKILL.md` (<200 líneas).
  - Crear `skills/odd-ai/references/odd-protocol-examples.md` (<200 líneas).
  - Actualizar `skills/groove-harness/SKILL.md` para integrar ODD (<200 líneas).
  - Actualizar `src/domains/harness/harness-templates.ts` (`buildAgentHarnessBlock`, `buildTaskTemplate`, etc.).
  - Actualizar `src/domains/installer/install-orchestrator.ts` para autoincluir `odd-ai` con `--harness`.
  - Actualizar `src/domains/registry/skill-catalog.ts` y `src/domains/detector/project-detector.ts`.
  - Actualizar `README.md` manteniendo <200 líneas.
  - Bump de versión en `package.json` (de v1.2.0 a v1.3.0).
  - Compilación, verificación, commit, tag y push a `origin/main`.
- Out of scope:
  - Alterar comportamiento de otros skills no relacionados.

## Checklist
- [x] Crear `skills/odd-ai/SKILL.md` y `skills/odd-ai/references/odd-protocol-examples.md`
- [x] Actualizar `skills/groove-harness/SKILL.md`
- [x] Actualizar `src/domains/harness/harness-templates.ts` y `src/domains/installer/install-orchestrator.ts`
- [x] Actualizar `src/domains/registry/skill-catalog.ts` y `src/domains/detector/project-detector.ts`
- [x] Actualizar `README.md`
- [x] Bumping versión a v1.3.0 en `package.json`
- [x] Ejecutar typecheck y build (`tsc --noEmit && tsup`)
- [x] Sincronizar harness local y verificar archivos resultantes
- [x] Git commit, git tag y push

## Evidence
- `wc -l`: Todos los archivos bajo 200 líneas (SKILL.md 64 líneas, README.md 135 líneas).
- `tsc --noEmit && tsup`: Código de salida 0, compilación ESM + DTS exitosa.
- `node ./dist/cli.js --version`: 1.3.0
- `node ./dist/cli.js --skills ... --harness -l es -y`: Sincronización exitosa en `.agents/skills/odd-ai`, `.claude/skills/odd-ai`, `.cursor/rules/odd-ai.mdc`, `.gemini/skills/odd-ai`.

## Next
- Realizar git add, commit, tag v1.3.0 y git push con BypassSandbox.
