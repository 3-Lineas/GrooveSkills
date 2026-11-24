---
name: flutter-architecture
description: Clean Flutter application architecture with Riverpod (Notifier/AsyncNotifier) as the mandatory state management and DI standard, pure atomic Actions (1 HTTP/DB call per Action, zero Ref coupling), GoRouter declarative routing, l10n localization, async mounted safety, and runtime error diagnosis. TRIGGER when building or refactoring Flutter apps, providers, routes, HTTP adapters, or localization.
---

# Flutter Clean Architecture & Riverpod

## 1. Domain-Within-Layer Directory Taxonomy
Organize `lib/` by `{domain}` subfolders inside strict technical layers (zero barrel files, `<200` lines per file, 1 public symbol per file):
- `lib/types/{domain}/` — Immutable domain models, DTOs, and `sealed` state/result types.
- `lib/errors/{domain}/` — Typed `AppError` subclasses with localized UX messages.
- `lib/adapters/{domain}/` — External HTTP (`package:http`), storage, or platform wrappers (100% free of `Ref` / Riverpod).
- `lib/actions/{domain}/` — Atomic use-case operations (max 1 DB/API call per Action, 100% pure & free of `Ref` / Riverpod).
- `lib/providers/{domain}/` — Riverpod `Notifier` / `AsyncNotifier` state coordinators and dependency providers.
- `lib/ui/{domain}/` — Thin, declarative `ConsumerWidget` / `ConsumerStatefulWidget` screens and widgets.

## 2. Mandatory Riverpod Rules
- Wrap the root app in `ProviderScope(child: ...)`.
- Use `Notifier` / `AsyncNotifier` (with `@riverpod` / `riverpod_annotation` when codegen is enabled) and `AsyncValue` for async state. **Never** use legacy `StateProvider` for complex domain state.
- **`ref.watch(...)`**: Only inside `build()` to reactively rebuild UI. Use `.select(...)` to subscribe to specific fields and avoid unnecessary rebuilds.
- **`ref.read(...)`**: Only inside callbacks/event handlers (`onPressed`, `onSubmitted`)—never inside `build()`.
- **`ref.listen(...)`**: For side effects (navigation, snackbars/toasts, error dialogs).
- Keep Actions and Adapters **100% decoupled from `Ref`**. Providers inject Adapters into Actions.
- See [references/flutter-layers-actions-and-state.md](references/flutter-layers-actions-and-state.md) for a complete end-to-end Riverpod + Action + HTTP Adapter implementation.

## 3. Lifecycle & Async Safety
- Always guard `BuildContext` and `Ref` after any `await`:
  - In Widgets: `if (!context.mounted) return;`
  - In Notifiers: `if (!ref.mounted) return;`
- Always dispose controllers (`TextEditingController`, `ScrollController`, `FocusNode`, `StreamSubscription`, `Timer`) in `State.dispose()` or `ref.onDispose(...)`.
- Offload CPU-bound work (`>16ms`, heavy JSON parsing, image processing) to `Isolate.run()` or `compute()`.

## 4. Declarative Routing (`go_router`) & Localization (`l10n`)
- Use `GoRouter` with `MaterialApp.router`, `StatefulShellRoute.indexedStack` for persistent tab state, and Riverpod-backed `redirect` guards for authentication.
- Configure `flutter_localizations`, `intl`, `generate: true` in `pubspec.yaml`, and `l10n.yaml` + `.arb` files for all user-facing strings.
- See [references/flutter-routing-and-l10n.md](references/flutter-routing-and-l10n.md) for `GoRouter`, native Deep Linking checklists (Android/iOS), and `l10n` setup.
