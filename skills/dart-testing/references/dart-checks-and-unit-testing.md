# `package:checks` Migration, Pitfalls & LCOV Coverage

## 1. `package:matcher` to `package:checks` Migration Table
| Legacy `package:matcher` | Modern `package:checks` |
| :--- | :--- |
| `expect(actual, equals(expected))` | `check(actual).equals(expected)` |
| `expect(actual, isNull)` | `check(actual).isNull()` |
| `expect(actual, isNotNull)` | `check(actual).isNotNull()` |
| `expect(list, equals([1, 2]))` | `check(list).deepEquals([1, 2])` |
| `expect(text, contains('abc'))` | `check(text).contains('abc')` |
| `expect(text, matches(RegExp(...)))` | `check(text).matchesPattern(RegExp(...))` |
| `expect(() => fn(), throwsA(isA<E>()))` | `check(() => fn()).throws<E>()` |
| `expect(future, throwsA(isA<E>()))` | `await check(future).throws<E>()` |
| `expect(value, isA<User>().having((u) => u.id, 'id', '1'))` | `check(value).isA<User>().has((user) => user.id, 'id').equals('1')` |

## 2. Ten Critical `package:checks` Pitfalls
1. **Collection equality**: `.equals()` checks identity on `List`/`Map`/`Set`; always use `.deepEquals(...)` for structural equality.
2. **Failure reason**: Pass `because:` to `check(value, because: '...')`, not to the assertion method.
3. **Regex matching**: `.matchesPattern()` takes a `Pattern` (`RegExp`), whereas `.contains()` checks substring/pattern containment.
4. **Property extraction**: Chain `.has((item) => item.fieldName, 'fieldName')` to inspect properties with clear failure diagnostics.
5. **Sync vs Async `.throws<E>()`**: Sync functions use `check(() => action()).throws<E>()`; Futures require `await check(futureAction()).throws<E>()`.
6. **Nullable booleans (`bool?`)**: Unwrap with `.isNotNull().isTrue()` instead of calling `.isTrue()` directly on `bool?`.
7. **Map key checks**: Use `.containsKey('token')` and `.containsKeyThat('token', (value) => value.isNotNull())`.
8. **Extension types & generics**: `check<OrderId>(orderId)` preserves the static extension type when type inference widens to the representation type.
9. **Stream assertions**: Use `await check(stream).withQueue((queue) => ...)` or `emitsInOrder(...)` equivalents from `checks`.
10. **Soft assertions**: Use `softCheck(...)` when collecting multiple validation failures in a single test case.

## 3. Custom `Subject<T>` Extensions
```dart
extension ResultChecks<ValueType, ErrorType>
    on Subject<DomainResult<ValueType, ErrorType>> {
  Subject<ValueType> isSuccess() {
    return context.nest<ValueType>(
      () => ['is SuccessResult'],
      (actual) {
        if (actual is SuccessResult<ValueType, ErrorType>) {
          return Extracted.value(actual.value);
        }
        return Rejection(which: ['was $actual']);
      },
    );
  }
}
```

## 4. LCOV Coverage Commands
- **Pure Dart**:
  ```bash
  dart test --coverage=coverage
  dart pub global run coverage:format_coverage --lcov --in=coverage --out=coverage/lcov.info --report-on=lib
  ```
- **Flutter**:
  ```bash
  flutter test --coverage
  ```
