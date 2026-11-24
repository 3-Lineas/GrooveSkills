# Dart 3 Pattern Matching, Sealed ADTs & Primary Constructors

## 1. Pattern Selection Strategy
Choose the simplest pattern that expresses the structural contract:

- **Map patterns** (`{'id': final String userId, 'role': final String userRole}`): Validate JSON/API payloads and extract typed fields in one step.
- **List patterns** (`[final firstSegment, ...final remainingSegments]`): Parse CLI arguments, URI segments, or CSV tokens.
- **Record patterns** (`final (statusCode, responseBody) = result;`): Destructure multiple return values without creating boilerplate wrapper classes.
- **Object patterns** (`case UserAuthenticated(:final userId, :final sessionToken):`): Match class/sealed-subtype instances and extract getters.
- **Relational & Logical patterns** (`>= 200 && < 300`, `200 || 201`): Replace chained `if / else if` range checks in `switch` expressions.

## 2. Six Anti-Patterns to Avoid
1. **Simple type promotion**: Use `if (value is String)` instead of `if (value case final String text)` when you only need a single type check.
2. **Nullable consolidation**: Use `if (user == null) return;` instead of `switch (user) { case null: ... case final activeUser: ... }`.
3. **Silent fallback on invalid payloads**: Never return `null` or empty defaults when required JSON keys fail pattern matching; throw `FormatException` or return `Failure(ValidationError(...))`.
4. **Boolean or single-case switches**: Use `if / else` for booleans and `if (payload case ...)` for a single structural match.
5. **Over-destructuring**: Only destructure objects/records when extracting **3+ fields** or iterating `MapEntry` pairs (`for (final MapEntry(:key, :value) in headers.entries)`).
6. **Wildcard swallowing**: Avoid `default:` or `_ =>` on `sealed class` switches so the compiler enforces exhaustiveness when new subtypes are added.

## 3. Sealed ADTs & Zero-Cost Extension Types
```dart
sealed class DomainResult<ValueType, ErrorType> {
  const DomainResult();
}

final class SuccessResult<ValueType, ErrorType>
    extends DomainResult<ValueType, ErrorType> {
  const SuccessResult(this.value);
  final ValueType value;
}

final class FailureResult<ValueType, ErrorType>
    extends DomainResult<ValueType, ErrorType> {
  const FailureResult(this.error);
  final ErrorType error;
}

extension type const OrderId(String value) {
  bool get isValid => value.trim().isNotEmpty;
}
```

## 4. Primary Constructors (Dart 3.13+ / 3.12 Experimental)
- Verify `environment.sdk` in `pubspec.yaml`:
  - `>=3.13.0`: Primary constructors are enabled by default.
  - `3.12.x`: Only use if `analyzer: enable-experiment: [primary-constructors]` is configured in `analysis_options.yaml`.
- **Syntax**:
  ```dart
  class UserProfile(final String userId, final String displayName) {
    final DateTime createdAt = DateTime.now();
  }
  ```
- **Rules**:
  - Constructor parameters are in scope for field initializers and `this:` initializer blocks, but **not** inside method bodies unless declared as `final`/`var` fields.
  - Prefer `final` fields in primary constructors over `late` mutable fields.
