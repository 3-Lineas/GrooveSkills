---
status: completed
lane: 2
date: 2026-11-23
---

# Task: Integrate Google Modern Web Guidance (`v1.27.0`)

## Outcome Hypothesis
> By delivering `skills/modern-web-guidance/SKILL.md` (with 2 offline `references/`), registering `modern-web-guidance` in `SKILL_CATALOG` with web frontend auto-detection, adding cross-references in `frontend-design` and `react-core`, and bumping `@3lineas/grooveskills` to `v1.27.0`, web projects will auto-suggest `modern-web-guidance` while pure backend projects will not, proven by `pnpm run check-types`, `pnpm test` (including `runModernWebGuidanceDetectorTests()` and `runHarnessVersionAndBitacoraTests()`), and `pnpm run build`.

## Checklist
- [x] Create `skills/modern-web-guidance/SKILL.md` and 2 local references (`modern-web-primitives-and-baseline.md`, `grooveskills-web-adaptation.md`) with zero `as any`.
- [x] Register `modern-web-guidance` in `src/domains/registry/skill-catalog.ts` under `Frameworks & UI`.
- [x] Add cross-references in `skills/frontend-design/SKILL.md` and `skills/react-core/SKILL.md`.
- [x] Bump `package.json` to `1.27.0`, update `build-versions-template.ts`, `README.md`, `decisions.md`, and `bitacora/2026-11.md`.
- [x] Add `src/domains/detector/modern-web-guidance-detector.test.ts`, hook into `safe-fs.test.ts`, and update `harness-version-and-bitacora.test.ts` to `1.27.0`.

## Evidence
- `pnpm run check-types`: `tsc --noEmit` exited with code `0`.
- `pnpm test`: Full suite exited with code `0`, including `Modern Web Guidance detection, exclusion, and disk asset tests passed.` and `All version resolution, status, and bitacora rule tests passed.` (`v1.27.0`).
- `pnpm run build`: `tsup` exited with code `0`.
- `wc -l`: `modern-web-guidance-detector.test.ts` is `71` lines (`<= 200`).
