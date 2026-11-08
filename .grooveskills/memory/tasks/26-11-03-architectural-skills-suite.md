---
status: completed
createdAt: 2026-11-03
---

# Feature: 6 Architectural Wrapper & Adapter Skills Suite

## Outcome Hypothesis
Al implementar la suite de 6 skills arquitectónicos (`storage-file-adapters`, `auth-rbac-policies`, `controller-orchestration-queues`, `webhook-idempotency`, `caching-rate-limiting`, `env-feature-flags`) con sus guías canónicas y referencias de código de producción, registrándolos en el catálogo y detector universal de GrooveSkills, los agentes de IA estructurarán sistemas con desacoplamiento estricto (puertos de dominio, acciones atómicas de propósito único, wrappers de SDK, verifiers HMAC e idempotencia), comprobado mediante typecheck/build limpios (`pnpm check-types && pnpm build`), sincronización de skills del CLI y límite estricto de <200 líneas por archivo.

## Scope
- In scope:
  - Crear 6 carpetas de skills bajo `skills/<nombre>/`:
    - `skills/storage-file-adapters/SKILL.md` y `references/storage-adapters-examples.md`
    - `skills/auth-rbac-policies/SKILL.md` y `references/auth-adapters-examples.md`
    - `skills/controller-orchestration-queues/SKILL.md` y `references/controller-queue-examples.md`
    - `skills/webhook-idempotency/SKILL.md` y `references/webhook-idempotency-examples.md`
    - `skills/caching-rate-limiting/SKILL.md` y `references/cache-rate-limit-examples.md`
    - `skills/env-feature-flags/SKILL.md` y `references/env-feature-flags-examples.md`
  - Registrar los 6 skills en `src/domains/registry/skill-catalog.ts`.
  - Registrar los 6 skills en `src/domains/detector/project-detector.ts` dentro de `suggestedSkillIds`.
  - Actualizar catálogo en `README.md`.
  - Actualizar `.grooveskills/memory/decisions.md` (ADR).
  - Ejecutar verificación de tipos y compilación con `pnpm check-types && pnpm build`.
  - Ejecutar sincronización de GrooveSkills CLI en el propio repositorio.
- Out of scope:
  - Modificar skills preexistentes no relacionados.

## Checklist
- [x] Crear `skills/storage-file-adapters/SKILL.md` y su archivo de referencias
- [x] Crear `skills/auth-rbac-policies/SKILL.md` y su archivo de referencias
- [x] Crear `skills/controller-orchestration-queues/SKILL.md` y su archivo de referencias
- [x] Crear `skills/webhook-idempotency/SKILL.md` y su archivo de referencias
- [x] Crear `skills/caching-rate-limiting/SKILL.md` y su archivo de referencias
- [x] Crear `skills/env-feature-flags/SKILL.md` y su archivo de referencias
- [x] Registrar 6 skills en `src/domains/registry/skill-catalog.ts`
- [x] Añadir a `suggestedSkillIds` en `src/domains/detector/project-detector.ts`
- [x] Actualizar tabla de catálogo en `README.md`
- [x] Registrar ADR en `.grooveskills/memory/decisions.md`
- [x] Ejecutar `pnpm check-types`
- [x] Ejecutar `pnpm build`
- [x] Ejecutar sincronización CLI para actualizar `.grooveskills/skills/` y agentes
- [x] Verificar regla de <200 líneas en todos los archivos nuevos y modificados

## Evidence
- `wc -l` en archivos de skills y código modificado: todos <200 líneas.
- `pnpm check-types`: Exit code 0 (TypeScript 5.9 limpio, 0 errores).
- `pnpm build`: Exit code 0 (tsup generó bundles ESM + DTS correctamente).
- CLI sync ejecutado y verificado en `.grooveskills/skills/` y `.agents/skills/`.

## Next
- Comunicar al usuario el resumen de entrega.
