---
status: completed
date: 2026-11-23
---

# Task: Suite de Skills de Dart & Flutter (`v1.26.0`)

## Outcome Hypothesis
Consolidating Google's `dart-lang/skills` and `flutter/agent-plugins` into 4 modular skills (`dart-clean`, `dart-testing`, `flutter-architecture`, `flutter-ui-layout`) with deep `references/`, `pubspec.yaml` auto-detection, and Riverpod-first architecture will provide first-class Dart/Flutter support in `@3lineas/grooveskills` `v1.26.0` without bloating the CLI wizard.

## Checklist
- [x] Create `skills/dart-clean/SKILL.md` + 2 reference files
- [x] Create `skills/dart-testing/SKILL.md` + 2 reference files
- [x] Create `skills/flutter-architecture/SKILL.md` + 2 reference files
- [x] Create `skills/flutter-ui-layout/SKILL.md` + 2 reference files
- [x] Register all 4 skills in `src/domains/registry/skill-catalog.ts`
- [x] Add `pubspec.yaml` detection (`dart` & `flutter`) in `src/domains/detector/detect-dependencies.ts`
- [x] Add `src/domains/harness/detect-dart-onboarding.ts` and integrate in `scan-project-onboarding.ts` (<200 lines)
- [x] Bump version to `1.26.0` in `package.json`, `build-versions-template.ts`, `README.md`, and `harness-version-and-bitacora.test.ts`
- [x] Add `src/domains/detector/dart-flutter-detector.test.ts` and hook into `safe-fs.test.ts`

## Evidence
- `pnpm run check-types` -> exited 0
- `pnpm test` -> exited 0 (including `runDartAndFlutterDetectorTests()` and `runHarnessVersionAndBitacoraTests()` at `v1.26.0`)
- `pnpm run build` -> exited 0
- `wc -l` -> all created/modified `.ts` files strictly `<200` lines
