---
status: completed
lane: 2
---

# Task: Align Skills with `@3lineas/groovepack` `v1.3.0` & Release `v1.22.0`

## Outcome Hypothesis
Updating all GroovePack-referencing skills to `@3lineas/groovepack` `v1.3.0` (`pnpm add @3lineas/groovepack`, subpath exports, `@3lineas/groovepack/vite`, complete `sonner` removal, direct `logger` / `withD1Transaction` imports, and single-runtime env vars) and bumping `@3lineas/grooveskills` to `v1.22.0` will pass typecheck, test suite, build, and obsolete-reference grep with zero hits.

## Checklist
- [x] Update `skills/nextjs-architecture/` (`SKILL.md`, `groovepack-actions-and-auth.md`, `vinext-cloudflare.md`)
- [x] Update `skills/react-create-page/SKILL.md` and `skills/ux-writing/SKILL.md` (remove `sonner` / `toast.promise`)
- [x] Update `skills/hono/` (`SKILL.md`, `router.template.md`, `action.template.md`, `app-error.template.md`, `error-handler.template.md`, `logger.template.md`)
- [x] Update `skills/controller-orchestration-queues/` (`SKILL.md`, `controller-queue-examples.md`)
- [x] Update `skills/error-handling-logging/`, `skills/testing-vitest/`, `skills/typescript-clean/`, `skills/clean-architecture-ddd/`
- [x] Bump `v1.22.0` in `package.json`, `build-versions-template.ts`, `harness-version-and-bitacora.test.ts`, `README.md`, and `.grooveskills/`

## Evidence
- Verified obsolete-reference `rg` scan on `skills/` returned 0 matches.
- Verified `pnpm run check-types`, `pnpm test`, and `pnpm run build` all exited with code 0.
