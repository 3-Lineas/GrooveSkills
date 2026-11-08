---
status: completed
createdAt: 2026-11-03
---

# Feature: Documentation Standards Skill (`docs-standards`)

## Outcome Hypothesis
Al crear el nuevo skill `docs-standards` con su guía principal (`SKILL.md`) y referencias modulares (`relative-paths-and-diagrams.md`, `adr-template-and-lifecycle.md`, `code-comments-and-docstrings.md`), registrándolo en el catálogo universal de GrooveSkills y detector de proyectos, los agentes de IA redactarán documentación técnica consistente en inglés, con rutas relativas POSIX (`./`, `../`), diagramas Mermaid sintácticamente seguros y citas protegidas, ciclo de vida de ADRs y docstrings que explican el "por qué" en TypeScript, Python y Rust, comprobado con compilación limpia (`pnpm check-types && pnpm build`), sincronización CLI y límite estricto de <200 líneas por archivo.

## Scope
- In scope:
  - Crear `skills/docs-standards/SKILL.md` (<200 líneas, documentado en inglés).
  - Crear `skills/docs-standards/references/relative-paths-and-diagrams.md` (<200 líneas).
  - Crear `skills/docs-standards/references/adr-template-and-lifecycle.md` (<200 líneas).
  - Crear `skills/docs-standards/references/code-comments-and-docstrings.md` (<200 líneas).
  - Registrar `docs-standards` en `src/domains/registry/skill-catalog.ts`.
  - Añadir `docs-standards` a `suggestedSkillIds` en `src/domains/detector/project-detector.ts`.
  - Actualizar tabla del catálogo de skills en `README.md`.
  - Añadir entrada en `.grooveskills/memory/decisions.md` (ADR).
  - Compilar y verificar tipos (`pnpm check-types` y `pnpm build`).
  - Sincronizar CLI local con `node ./dist/cli.js --skills docs-standards --agents antigravity claude cursor gemini -l es -y`.
  - Verificar límite <200 líneas en todos los archivos tocados.
- Out of scope:
  - Modificar la lógica interna de instalación del CLI o empaquetado de agentes.

## Checklist
- [x] Crear `skills/docs-standards/SKILL.md`
- [x] Crear `skills/docs-standards/references/relative-paths-and-diagrams.md`
- [x] Crear `skills/docs-standards/references/adr-template-and-lifecycle.md`
- [x] Crear `skills/docs-standards/references/code-comments-and-docstrings.md`
- [x] Registrar en `src/domains/registry/skill-catalog.ts`
- [x] Añadir a `suggestedSkillIds` en `src/domains/detector/project-detector.ts`
- [x] Actualizar catálogo en `README.md`
- [x] Registrar ADR en `.grooveskills/memory/decisions.md`
- [x] Ejecutar `pnpm run check-types`
- [x] Ejecutar `pnpm run build`
- [x] Ejecutar comando de sincronización CLI de prueba
- [x] Validar que ningún archivo exceda 200 líneas

## Evidence
- `wc -l`: todos los archivos nuevos y modificados se encuentran estrictamente por debajo de 200 líneas (`SKILL.md`: 113, `adr-template-and-lifecycle.md`: 111, `code-comments-and-docstrings.md`: 147, `relative-paths-and-diagrams.md`: 123, `skill-catalog.ts`: 166, `project-detector.ts`: 66, `README.md`: 156).
- `pnpm run check-types`: Exit code 0 (TypeScript 5.9 limpio, 0 errores).
- `pnpm run build`: Exit code 0 (tsup generó los bundles ESM y definiciones DTS con éxito).
- CLI sync ejecutado con `node ./dist/cli.js --skills docs-standards --agents antigravity claude cursor gemini -l es -y`: sincronizado limpiamente hacia `.grooveskills/skills/docs-standards/`, `.agents/`, `.claude/`, `.gemini/` y `.cursor/rules/`.

## Next
- Notificar finalización de la tarea.
