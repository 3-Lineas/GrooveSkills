# Flutter Widget, Riverpod & Integration Testing

## 1. `pump()` vs `pumpAndSettle()` vs `scrollUntilVisible()`
| Method | When to Use |
| :--- | :--- |
| `tester.pump()` | Advance a single frame (e.g., after `tap`, `enterText`, or when testing an infinite loading spinner). |
| `tester.pump(Duration)` | Advance a specific duration (e.g., debounce timers or explicit animation steps). |
| `tester.pumpAndSettle()` | Wait until all finite animations and microtasks complete. **Never** use when an indeterminate `CircularProgressIndicator` is visible (it will time out). |
| `tester.scrollUntilVisible(finder, delta)` | Scroll lazy lists (`ListView.builder`, `CustomScrollView`) until offscreen items are built and visible. |

## 2. Testing Riverpod Providers
### Unit Testing `Notifier` / `AsyncNotifier`
```dart
void main() {
  test('loads user profile into AsyncData', () async {
    final ProviderContainer container = ProviderContainer(
      overrides: [
        userAdapterProvider.overrideWithValue(FakeUserAdapter()),
      ],
    );
    addTearDown(container.dispose);

    final UserProfile profile =
        await container.read(userProfileProvider.future);
    check(profile.displayName).equals('Ada Lovelace');
  });
}
```

### Widget Testing with `ProviderScope`
```dart
await tester.pumpWidget(
  ProviderScope(
    overrides: [
      userAdapterProvider.overrideWithValue(FakeUserAdapter()),
    ],
    child: const MaterialApp(
      home: UserProfileScreen(),
    ),
  ),
);
```

## 3. Localization & Golden Tests
- Always wrap localized widgets in `MaterialApp(localizationsDelegates: AppLocalizations.localizationsDelegates, supportedLocales: AppLocalizations.supportedLocales, home: ...)`.
- For golden tests, use `await expectLater(find.byType(OrderSummaryCard), matchesGoldenFile('goldens/order_summary_card.png'));` and update baselines intentionally with `flutter test --update-goldens`.

## 4. Integration Tests (`integration_test/`)
- Initialize binding at the top of `main()`:
  ```dart
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();
  ```
- Run with `flutter test integration_test/app_flow_test.dart`.
