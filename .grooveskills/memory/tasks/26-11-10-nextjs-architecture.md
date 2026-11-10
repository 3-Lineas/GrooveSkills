---
status: completed
createdAt: 2026-11-10
completedAt: 2026-11-10
---

# Next.js & Vinext Server Architecture Skill (`nextjs-architecture`)

## Outcome Hypothesis
Al implementar el skill canónico `nextjs-architecture`, actualizar el detector para priorizarlo sobre `react-create-page` en proyectos Next/Vinext y sincronizar las referencias de GroovePack (`api-toast` ➔ Server Action ➔ `api-action` ➔ `api-client`), los agentes y desarrolladores contarán con una arquitectura server-first 100% tipada, con carga inicial en el servidor, componentes cliente exclusivos para interactividad, skeletons en `loading.tsx` y compatibilidad nativa con Cloudflare Workers vía Vinext, probado mediante `pnpm check-types`, `pnpm test`, `pnpm build` y verificación estática.

## Scope
- In scope:
  - Crear `skills/nextjs-architecture/SKILL.md` (<200 líneas).
  - Crear referencias modulares en `skills/nextjs-architecture/references/` (<200 líneas cada una):
    - `groovepack-actions-and-auth.md`
    - `server-pages-loading-and-url-state.md`
    - `vinext-cloudflare.md`
  - Actualizar `src/domains/registry/skill-catalog.ts` para registrar `nextjs-architecture`.
  - Actualizar `src/domains/detector/project-detector.ts` para auto-seleccionar `nextjs-architecture` y omitir `react-create-page` si se detecta Next.js o Vinext.
  - Actualizar `skills/react-create-page/SKILL.md` para clarificar la exclusión mutua con `nextjs-architecture` y prohibir crear archivos de GroovePack a mano.
  - Actualizar `skills/typescript-clean/SKILL.md` y `skills/valibot-validation/SKILL.md` para documentar la co-locación en `src/app/<ruta>/types/` y `schemas/`.
  - Actualizar `README.md` catalogando el nuevo skill.
  - Sincronizar en `.grooveskills/skills/` y `.agents/skills/`.
  - Registrar ADR en `.grooveskills/memory/decisions.md` y bitacora en `.grooveskills/bitacora/2026-11.md`.
- Out of scope:
  - Modificar lógica de otros frameworks o librerías no relacionadas con Next.js/React.

## Checklist
- [x] 1. Crear `skills/nextjs-architecture/SKILL.md` y sus referencias modulares en `skills/nextjs-architecture/references/`.
- [x] 2. Modificar `src/domains/registry/skill-catalog.ts` y `src/domains/detector/project-detector.ts`.
- [x] 3. Actualizar `skills/react-create-page/SKILL.md`, `skills/typescript-clean/SKILL.md` y `skills/valibot-validation/SKILL.md`.
- [x] 4. Actualizar `README.md` reflejando el nuevo skill en la tabla.
- [x] 5. Sincronizar localmente en `.grooveskills/skills/` y `.agents/skills/`.
- [x] 6. Ejecutar tests (`pnpm test`), typecheck (`pnpm check-types`), build (`pnpm build`) y auditoría de seguridad.
- [x] 7. Registrar ADR en `decisions.md` y entrada en `bitacora/2026-11.md`.

## Evidence
- `pnpm check-types`: Clean pass with 0 TypeScript diagnostics.
- `pnpm test`: Ran verification suites in `safe-fs.test.ts` including new `runProjectDetectorTests()` suite:
  - `SKILL_CATALOG contains valid 'nextjs-architecture' definition`: Passed.
  - `Pure React project suggests react-create-page and excludes nextjs-architecture`: Passed.
  - `Next.js project suggests nextjs-architecture and excludes react-create-page`: Passed.
  - `Vinext project suggests nextjs-architecture and excludes react-create-page`: Passed.
  - All resilience, atomic replace, security audit, and rollback tests: Passed.
- `pnpm build`: Built `dist/cli.js`, `dist/main.js` and declaration files cleanly with tsup.
- `node dist/cli.js audit .`: Completed zero-footprint adversarial audit across 5 coverage units with 0 preliminary static findings.
- Verified line limits (<200 lines) across all touched files.

## Next
- Tarea finalizada.
