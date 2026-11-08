---
status: completed
createdAt: 2026-11-03
---

# Feature: Skill `external-service-adapters` (Wrapper & Adapter Pattern)

## Outcome Hypothesis
Al crear el skill `external-service-adapters` y registrarlo en el catálogo, detector, documentación y referencias entre skills, los agentes de IA implementarán integraciones externas (pasarelas de pago, email, SMS, storage, etc.) desacopladas mediante interfaces estandarizadas (Wrappers/Clients del SDK y Domain Adapters), comprobado mediante typecheck/build limpios (`pnpm check-types && pnpm build`), sincronización local de skills y verificación de límites de líneas (<200 líneas por archivo).

## Scope
- In scope:
  - Crear `skills/external-service-adapters/SKILL.md` (<200 líneas).
  - Crear `skills/external-service-adapters/references/email-and-payment-examples.md` (<200 líneas) con ejemplos reales de Email (SMTP, Resend, AWS SES, Cloudflare Email) y Pagos (Stripe, MercadoPago).
  - Registrar en `src/domains/registry/skill-catalog.ts`.
  - Registrar en `src/domains/detector/project-detector.ts` como skill sugerido por defecto.
  - Añadir enlace hermano en `skills/clean-architecture-ddd/SKILL.md`.
  - Documentar en `README.md` (<200 líneas).
  - Actualizar `.grooveskills/memory/decisions.md` (ADR).
  - Ejecutar build y sincronización en `.grooveskills/skills/` y adapters de agentes.
- Out of scope:
  - Alterar lógica de ejecución de otros skills existentes.

## Checklist
- [x] Crear `skills/external-service-adapters/SKILL.md`
- [x] Crear `skills/external-service-adapters/references/email-and-payment-examples.md`
- [x] Registrar skill en `src/domains/registry/skill-catalog.ts`
- [x] Añadir a `suggestedSkillIds` en `src/domains/detector/project-detector.ts`
- [x] Añadir referencia cruzada en `skills/clean-architecture-ddd/SKILL.md`
- [x] Documentar en `README.md`
- [x] Actualizar `.grooveskills/memory/decisions.md` con nuevo ADR
- [x] Ejecutar typecheck y build (`pnpm check-types && pnpm build`)
- [x] Sincronizar skills en el repositorio con el CLI
- [x] Verificar `wc -l` (<200 líneas por archivo)

## Evidence
- `wc -l`:
  - `skills/external-service-adapters/SKILL.md`: 148 líneas (<200)
  - `skills/external-service-adapters/references/email-and-payment-examples.md`: 198 líneas (<200)
  - `README.md`: 149 líneas (<200)
  - `src/domains/registry/skill-catalog.ts`: 117 líneas (<200)
  - `src/domains/detector/project-detector.ts`: 59 líneas (<200)
- `pnpm check-types`: Exit code 0 (TypeScript 5.9 limpio, 0 errores).
- `pnpm build`: Exit code 0 (tsup generó bundles ESM + DTS correctamente).
- CLI sync: `node ./dist/cli.js --skills ... --agents antigravity claude cursor gemini -l es -y` ejecutado con éxito:
  - Sincronizado en `.grooveskills/skills/external-service-adapters/`
  - Generadas referencias ligeras en `.agents/skills/external-service-adapters/SKILL.md`, `.claude/skills/external-service-adapters/SKILL.md`, `.gemini/skills/external-service-adapters/SKILL.md`, y regla `.cursor/rules/external-service-adapters.mdc`.
  - `.grooveskills/config.json` actualizado automáticamente con `"external-service-adapters"`.

## Next
- Realizar git commit si se requiere.
