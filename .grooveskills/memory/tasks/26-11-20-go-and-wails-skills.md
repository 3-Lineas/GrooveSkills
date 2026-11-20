---
status: completed
date: 2026-11-20
---

# Go 1.27 Skills Suite & Wails v3 Architecture (`v1.25.0`)

## Outcome Hypothesis
By delivering the Go 1.27 skills suite (`go-clean`, `go-concurrency-safety`, `go-testing`), the unified `wails-architecture` skill, stack detection/onboarding extensions, and the `v1.25.0` release bump, GrooveSkills will automatically detect Go 1.27 and Wails v3 repositories, suggest the right skills while excluding `react-create-page` on Wails v3, and pass `pnpm run check-types`, `pnpm test`, and `pnpm run build`.

## Checklist
- [x] Create `skills/go-clean/`, `skills/go-concurrency-safety/`, and `skills/go-testing/` with deep references
- [x] Create `skills/wails-architecture/` with 3 deep references
- [x] Register skills in `SKILL_CATALOG` and extend `detect-dependencies.ts`, `project-detector.ts`, `detect-go-onboarding.ts`, and `scan-project-onboarding.ts`
- [x] Update `best-practices`, `react-create-page`, `package.json`, `build-versions-template.ts`, `README.md`, and `decisions.md`
- [x] Add `go-wails-detector.test.ts` and update `safe-fs.test.ts` and `harness-version-and-bitacora.test.ts`
- [x] Verify with `pnpm run check-types`, `pnpm test`, `pnpm run build`, and `wc -l`

## Evidence
- `pnpm run check-types`: passed (exit 0).
- `pnpm test`: passed (exit 0), including `runGoAndWailsDetectorTests()` and `runHarnessVersionAndBitacoraTests()` (`v1.25.0`).
- `pnpm run build`: passed (exit 0).
- `wc -l`: all new/modified `.ts` files strictly `<200` lines (`detect-dependencies.ts`: 90, `project-detector.ts`: 127, `go-wails-detector.test.ts`: 135, `detect-go-onboarding.ts`: 72, `scan-project-onboarding.ts`: 194, `build-versions-template.ts`: 93, `harness-version-and-bitacora.test.ts`: 124).
