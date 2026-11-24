# Flutter Performance, Previews & Accessibility (a11y)

## 1. Rebuild & Rendering Performance Checklist
- Prefer `const` constructors on all static widgets and `EdgeInsets` / `SizedBox` constants.
- Split large screens into small `StatelessWidget` / `ConsumerWidget` classes so `ref.watch(...select(...))` only rebuilds the leaf widget that changed.
- Never call `saveLayer()` (e.g., `Opacity` widget over complex subtrees) inside animations; use `FadeTransition` or `AnimatedOpacity`.
- Always use `ListView.builder` / `SliverList` for dynamic or long lists.

## 2. Widget Previews (`previews.dart`)
```dart
import 'package:flutter/material.dart';
import 'package:flutter/widget_previews.dart';

@Preview(name: 'Order Summary - Light')
Widget orderSummaryPreview() {
  return const MaterialApp(
    home: Scaffold(
      body: Center(
        child: OrderSummaryCard(orderNumber: 'ORD-1042', totalLabel: '\$49.90'),
      ),
    ),
  );
}
```

## 3. WCAG & Accessibility Checklist
- **Touch Targets**: Every `IconButton`, custom `InkWell`, or `GestureDetector` must be at least `48x48dp`.
- **Semantics**: Provide descriptive `Semantics(label: ...)` for non-text controls and `tooltip:` on `IconButton`.
- **Dynamic Text Scaling**: Avoid fixed-height containers (`SizedBox(height: 40)`) around text; use `ConstrainedBox(minHeight: 40)` so text can grow at `2.0x` scale.
- **Automated Semantics Verification**:
  ```dart
  final SemanticsNode semantics = tester.getSemantics(find.byType(SubmitOrderButton));
  check(semantics.label).contains('Submit order');
  ```
