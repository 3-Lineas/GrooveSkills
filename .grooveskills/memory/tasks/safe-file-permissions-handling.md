---
status: completed
createdAt: 2026-11-03
---

# Manejo Defensivo de Permisos y Rollback Transaccional en Instalación

## Outcome Hypothesis
Al implementar `safeWriteFileSync` con auto-recuperación de permisos (`chmodSync 0o644` ante `EACCES`/`EPERM`), el diario de transacciones `InstallTransaction` con rollback automático y el manejo ordenado de errores con `InstallTransactionError` en UI y CLI, se garantizará que fallos de permisos como el observado en `AGENTS.md` se resuelvan de forma transparente cuando el usuario sea dueño del archivo, o bien reviertan todas las modificaciones y reporten el problema limpiamente en Español sin excepciones abruptas ni estados intermedios inconsistentes.

## Scope
- In scope:
  - Crear `src/domains/fs/safe-file-writer.ts` con auto-chmod ante `EACCES`/`EPERM`.
  - Crear `src/errors/file-permission-error.ts` y `src/errors/install-transaction-error.ts`.
  - Crear `src/domains/fs/install-transaction.ts` con diario de cambios y método `rollback()`.
  - Actualizar `installSkills` (`install-orchestrator.ts`), adapters, `installHarness`, `upsertAgentInstructions`, `writeProjectConfig` y `syncProjectStore` para integrarse con la transacción.
  - Actualizar `ui-orchestrator.ts` y `bin/cli.ts` para capturar `InstallTransactionError`, detener el spinner e imprimir el reporte en Español con solución sugerida.
  - Escribir suite de pruebas `src/domains/fs/safe-fs.test.ts` y agregar script `pnpm test`.
- Out of scope:
  - Modificar la lógica de plantillas o el catálogo de skills existentes.

## Checklist
- [x] Crear `src/errors/file-permission-error.ts` y `src/errors/install-transaction-error.ts`.
- [x] Crear `src/domains/fs/safe-file-writer.ts` y `src/domains/fs/install-transaction.ts`.
- [x] Actualizar `upsert-agent-instructions.ts`, `install-harness.ts`, `write-project-config.ts` y `skill-reference-builder.ts` para usar `safeWriteFileSync` y registrar operaciones en `InstallTransaction`.
- [x] Actualizar `install-orchestrator.ts` envolviendo las fases en el ciclo transaccional con captura de errores y rollback automático.
- [x] Actualizar `ui-orchestrator.ts` y `bin/cli.ts` para reportar fallos y rollbacks de forma clara y empática en Español.
- [x] Implementar suite de pruebas automatizada `src/domains/fs/safe-fs.test.ts` y validar con `pnpm test`.
- [x] Verificar que `pnpm check-types` y `pnpm build` compilan al 100% sin advertencias ni errores.

## Evidence
- `pnpm test` ejecuta `safe-fs.test.ts` validando:
  1. Auto-recuperación de permisos en archivos `0o444` (solo lectura) con `safeWriteFileSync`.
  2. Emisión estructurada de `FilePermissionError` con comando de corrección sugerido.
  3. Ejecución de rollback en `InstallTransaction` restaurando archivos previos a su versión original y eliminando archivos/carpetas nuevas creadas.
  4. Integración end-to-end de `installSkills` actualizando limpiamente `AGENTS.md` con permisos `0o444`.
  5. Ejecución end-to-end de rollback transaccional ante error de permisos dentro de las fases de instalación (`InstallTransactionError`), restaurando el estado exacto del repositorio.
- `pnpm check-types` (`tsc --noEmit`) finaliza con código de salida 0.
- `pnpm build` (`tsup`) emite los bundles de `cli.js` y `main.js` exitosamente sin errores de compilación.

## Next
- Comunicar los resultados y detalles técnicos al coordinador mediante reporte final.
