# Dart Static Analysis, Error Handling & JSON Serialization

## 1. Enterprise `analysis_options.yaml`
```yaml
include: package:lints/recommended.yaml

analyzer:
  language:
    strict-casts: true
    strict-inference: true
    strict-raw-types: true
  errors:
    missing_required_param: error
    missing_return: error
    todo: ignore

linter:
  rules:
    - always_declare_return_types
    - avoid_dynamic_calls
    - cancel_subscriptions
    - close_sinks
    - prefer_const_constructors
    - prefer_final_locals
    - unawaited_futures
```

## 2. `AppError` & Boundary Separation
- Never expose raw stack traces, SQL errors, or internal exception messages to end users.
- Log structured context internally; return localized, empathetic UX copy in `userMessage` (following `ux-writing`).
- Map external exceptions (`SocketException`, `TimeoutException`, `FormatException`) inside Adapters (`lib/adapters/{domain}/`) into typed `AppError` subclasses (`NetworkError`, `ValidationError`, `UnauthorizedError`).

## 3. Type-Safe JSON Deserialization
Always distinguish **omitted key** (`!jsonMap.containsKey('middleName')`) from **explicit `null`** (`jsonMap['middleName'] == null`) when needed:

```dart
UserAccount parseUserAccount(Object? rawPayload) {
  if (rawPayload is! Map<String, Object?>) {
    throw const FormatException('Expected a JSON object for UserAccount.');
  }

  switch (rawPayload) {
    case {
      'id': final String userId,
      'email': final String emailAddress,
      'is_active': final bool isActive,
    }:
      return UserAccount(
        userId: userId,
        emailAddress: emailAddress,
        isActive: isActive,
      );
    default:
      throw const FormatException(
        'Missing or invalid required fields in UserAccount payload.',
      );
  }
}
```

## 4. Background Isolate Parsing
For large JSON arrays or payloads exceeding frame budget (`>16ms`), offload decoding:
```dart
Future<List<CatalogItem>> parseCatalogItemsInBackground(String rawJson) {
  return Isolate.run(() {
    final Object? decoded = jsonDecode(rawJson);
    if (decoded is! List<Object?>) {
      throw const FormatException('Expected a JSON array of catalog items.');
    }
    return decoded.map(parseCatalogItem).toList(growable: false);
  });
}
```
