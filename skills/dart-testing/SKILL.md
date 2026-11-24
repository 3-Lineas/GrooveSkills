---
name: dart-testing
description: Four-tier deterministic testing pyramid for Dart and Flutter using package:test, flutter_test, package:checks (modern type-safe assertions), in-memory fakes over brittle mocks, Riverpod ProviderContainer/ProviderScope overrides, WidgetTester, integration_test, and LCOV coverage. TRIGGER when writing or updating *_test.dart files, widget tests, integration tests, or test coverage scripts.
---

# Dart & Flutter Testing Standards

## 1. Core Principles
- **Arrange-Act-Assert (AAA)**: Structure every `test(...)` and `testWidgets(...)` with clear Arrange, Act, and Assert phases.
- **Mirror Source Structure**: Place unit tests in `test/<domain>/<file>_test.dart` mirroring `lib/<domain>/<file>.dart`.
- **Behavior Over Implementation**: Assert observable outputs, state transitions, and rendered semantics—never private fields or internal call counts unless testing an external boundary.
- **In-Memory Fakes Before Mocks**: Implement lightweight fake classes for repositories/adapters (`FakeUserRepository`) instead of brittle mock setups. Reserve `mocktail` / `mockito` strictly for external SDK boundaries.
- **Strict Naming (Rule #8)**: Use descriptive test names and variables (`expectedTotal`, `actualResult`)—never single-letter identifiers.

## 2. Modern Assertions with `package:checks`
Prefer `package:checks` over legacy `package:matcher` (`expect(...)`) for type-safe, composable assertions:
- `check(actualResult).equals(expectedResult)`
- `check(items).deepEquals([firstItem, secondItem])`
- `await check(futureAction()).throws<ValidationError>()`
- See [references/dart-checks-and-unit-testing.md](references/dart-checks-and-unit-testing.md) for the full `matcher` -> `checks` migration table, the 10 critical pitfalls, custom `Subject<T>` extensions, and LCOV coverage commands.

## 3. Widget, Riverpod & Integration Testing
- **Riverpod Unit Tests**: Use `ProviderContainer(overrides: [...])` with `addTearDown(container.dispose)`—no widget tree required for testing `Notifier` / `AsyncNotifier` logic.
- **Widget Tests**: Wrap widgets in `MaterialApp` + `ProviderScope(overrides: [...])` and use `WidgetTester` (`pump`, `pumpAndSettle`, `scrollUntilVisible`).
- **Integration Tests**: Place end-to-end flows in `integration_test/` using `IntegrationTestWidgetsFlutterBinding.ensureInitialized()`.
- See [references/flutter-widget-and-integration-testing.md](references/flutter-widget-and-integration-testing.md) for `pump` vs `pumpAndSettle` decision matrix, Riverpod testing patterns, and golden tests.
