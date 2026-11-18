---
status: completed
lane: 2
---

# Task: Actualización de Skills a `@3lineas/groovepack` `v1.6.0` y Release `v1.24.0`

## Outcome Hypothesis
Los skills `groovepack-api`, `nextjs-architecture`, `groovepack-actions-and-auth.md` y `vinext-cloudflare.md` reflejarán con precisión la firma `createHonoClient<AppType>(config)`, `getHeaders`, `serviceBinding` + `fallbackBaseUrl` y `ApiCallInput<T>` de `@3lineas/groovepack` `v1.6.0`, junto con el release bump a `v1.24.0` validado con `check-types`, `test` y `build`.

## Checklist
- [x] Actualizar `skills/groovepack-api/SKILL.md` (`createHonoClient<AppType>(config)`, `getHeaders`, `serviceBinding`, `fallbackBaseUrl`, `ApiCallInput<T>`).
- [x] Actualizar `skills/nextjs-architecture/SKILL.md`, `references/groovepack-actions-and-auth.md` y `references/vinext-cloudflare.md`.
- [x] Actualizar versión a `1.24.0` en `package.json`, `build-versions-template.ts`, `harness-version-and-bitacora.test.ts` y `README.md`.
- [x] Actualizar `.grooveskills/bitacora/2026-11.md` (<= 10 ítems).
- [x] Verificar `pnpm run check-types && pnpm test && pnpm run build` y ausencia de `createHonoClient(baseUrl, options)` en `skills/`.

## Evidence
- `pnpm run check-types && pnpm test && pnpm run build`: exited with code 0 (`tsc --noEmit`, `safe-fs.test.ts` including `Version Resolution, Bitacora Limit & Status CLI` with `1.24.0`, and `tsup` build).
- `grep -rn "createHonoClient.*baseUrl," skills/`: 0 matches of the old `(baseUrl, options)` signature.
