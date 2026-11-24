# Flutter Declarative Routing (`go_router`) & Localization (`l10n`)

## 1. `GoRouter` with `StatefulShellRoute` & Riverpod Auth Redirect
- Configure `MaterialApp.router(routerConfig: router)`.
- Call `usePathUrlStrategy()` from `flutter_web_plugins` before `runApp` for clean web URLs without `#`.
- Use `StatefulShellRoute.indexedStack` for bottom navigation / rail tabs so each branch preserves its own navigation stack and scroll position.
- Drive `redirect:` from a Riverpod `authStateProvider` (with `refreshListenable`) so unauthenticated users are redirected to `/login` declaratively.

## 2. Native Deep Linking Checklist
### Android (`android/app/src/main/AndroidManifest.xml`)
- Add `<meta-data android:name="flutter_deeplinking_enabled" android:value="true" />` inside `<activity>`.
- Add `<intent-filter android:autoVerify="true">` for `https` host/pathPrefix.
- Host `https://<domain>/.well-known/assetlinks.json` with your SHA-256 signing fingerprint.
- Verify with:
  ```bash
  adb shell am start -a android.intent.action.VIEW -d "https://example.com/orders/42"
  ```

### iOS (`ios/Runner/Info.plist` & `Runner.entitlements`)
- Add `FlutterDeepLinkingEnabled = true` in `Info.plist`.
- Add `applinks:<domain>` to `com.apple.developer.associated-domains` in `Runner.entitlements`.
- Host `https://<domain>/.well-known/apple-app-site-association`.
- Verify with:
  ```bash
  xcrun simctl openurl booted "https://example.com/orders/42"
  ```

## 3. Localization (`l10n.yaml` & `.arb`)
1. Add `flutter_localizations` (SDK) and `intl` to `pubspec.yaml`, plus `flutter: generate: true`.
2. Create `l10n.yaml` at the project root:
   ```yaml
   arb-dir: lib/l10n
   template-arb-file: app_en.arb
   output-localization-file: app_localizations.dart
   ```
3. Never hardcode user-visible strings in widgets; access `AppLocalizations.of(context)!.greetingMessage`.
