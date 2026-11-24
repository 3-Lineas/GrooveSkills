---
name: dart-clean
description: Clean Dart 3.x coding standards, strict static analysis, pattern matching, sealed ADTs, extension types, atomic Actions (1 DB/API call per Action), Result<ValueType, AppError>, Pipeline chaining, type-safe JSON serialization, and Effective Dart documentation. TRIGGER when writing or modifying Dart files (*.dart), pubspec.yaml, analysis_options.yaml, or building Dart CLI/server/Flutter domain logic.
---

# Dart Clean Code & Domain Architecture

## 1. Golden Rules (GrooveSkills Non-Negotiables)
- **Zero `dynamic`**: Never use `dynamic` in domain, action, or adapter code. Use `Object?`, generics, `sealed` classes, or `extension type` wrappers.
- **Guard Clauses (Zero Nested `if`s)**: Return or throw early. Keep nesting depth shallow (`<= 2`).
- **Strict Atomicity (<200 Lines & 1 Public Symbol per File)**: Every `.dart` file exports at most ONE public class, function, extension, or typedef, and stays strictly under 200 lines.
- **Zero Barrel Files**: Never create barrel files that re-export multiple modules. Always import explicit file paths via `package:<app_name>/...`.
- **Strict Descriptive Naming (Rule #8)**: Never use 1- or 2-character or cryptic abbreviations (`d`, `a`, `s`, `p`, `e`, `r`, `k`, `tx`, `err`, `res`). Use explicit domain names (`userRecord`, `validationError`, `responsePayload`).
- **1 DB/API Call per Action + `Pipeline`**: Every database query, file I/O, or HTTP call lives in an isolated atomic Action under `lib/actions/{domain}/` (max 1 external operation per Action). Chain multi-step workflows via `Pipeline`.

## 2. Static Analysis & Tooling
- Enable strict type-system flags in `analysis_options.yaml`:
  - `strict-casts: true`
  - `strict-inference: true`
  - `strict-raw-types: true`
- Run `dart analyze --fatal-infos` before any commit and `dart fix --apply` for mechanical lints.
- Use `dart format --output=none --set-exit-if-changed .` in CI.

## 3. Pattern Matching, Sealed ADTs & Primary Constructors
- Use `sealed class` algebraic data types (ADTs) with `switch` expressions for exhaustive state and error handling.
- Use `extension type const` (Newtypes) for zero-cost domain identifiers (`UserId`, `EmailAddress`).
- Check `environment.sdk` in `pubspec.yaml` before using **Primary Constructors** (enabled by default in Dart `>=3.13.0`; requires `primary-constructors` experiment in `3.12`).
- See [references/dart-patterns-and-types.md](references/dart-patterns-and-types.md) for pattern selection, 6 anti-patterns to avoid, and Primary Constructor rules.

## 4. Error Handling, `Result` & Type-Safe JSON
- Return `sealed class Result<ValueType, ErrorType>` from Actions and Adapters instead of throwing raw exceptions across boundaries.
- Parse JSON with Dart 3 Map/List patterns (`switch (payload)`), failing fast with `FormatException` on missing or mistyped required fields—never silently drop invalid data.
- Offload heavy JSON parsing (`>16ms` or large payloads) to `Isolate.run()`.
- See [references/dart-analysis-errors-and-json.md](references/dart-analysis-errors-and-json.md) for `analysis_options.yaml`, `AppError` / `Result` templates, and JSON deserialization patterns.

## 5. Cross-Platform Paths & Documentation
- **Paths**: Never manipulate file paths with string concatenation (`'$dir/$file'`) or `.split('/')`. Always use `package:path` (`path.join`, `path.basename`, `path.extension`).
- **Docstrings**: Document public APIs with `///` Effective Dart doc comments explaining **intent** ("why"), not mechanics ("what").
