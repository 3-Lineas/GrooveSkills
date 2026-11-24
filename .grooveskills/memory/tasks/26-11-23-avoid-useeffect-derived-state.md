---
id: 26-11-23-avoid-useeffect-derived-state
title: Prohibición estricta de useEffect por defecto y estado derivado inline
status: completed
created: 2026-11-23
---

# Task: Prohibición estricta de `useEffect` por defecto y estado derivado inline

## Outcome Hypothesis
Al prohibir `useEffect` por defecto en `best-practices`, `react-core`, `react-advanced` y `react-create-page` (permitiéndolo únicamente como último recurso para sincronización inevitable con sistemas externos) y documentar el patrón `const` inline con ejemplo Antes/Después, los agentes generarán código React sin renders redundantes ni cadenas de efectos.

## Checklist
- [x] Agregar Golden Rule #11 en `skills/best-practices/SKILL.md` con referencia a `react-core`.
- [x] Agregar Golden Rule #8, sección de ejemplo Antes/Después sin `useEffect` y fila en `Anti-Patterns to Avoid` en `skills/react-core/SKILL.md`.
- [x] Reforzar `skills/react-advanced/SKILL.md` y `skills/react-create-page/SKILL.md` (<200 líneas).
- [x] Bump de versión a `v1.27.1` en `package.json`, `src/domains/harness/build-versions-template.ts` y `src/domains/harness/harness-version-and-bitacora.test.ts`.
- [x] Verificar `wc -l` (<200 líneas en los 4 skills) y ejecutar `pnpm run check-types && pnpm test && pnpm run build`.

## Evidence
- `wc -l`: `best-practices/SKILL.md` (128), `react-core/SKILL.md` (166), `react-advanced/SKILL.md` (141), `react-create-page/SKILL.md` (197).
- `pnpm run check-types && pnpm test && pnpm run build`: Exit code 0; todas las suites pasaron incluyendo `harness-version-and-bitacora.test.ts` con `v1.27.1`.
