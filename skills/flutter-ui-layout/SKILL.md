---
name: flutter-ui-layout
description: Flutter UI, adaptive responsive layouts, constraint debugging, widget performance, previews, and WCAG accessibility (Semantics, >=48dp touch targets, dynamic TextScaler). TRIGGER when building Flutter widgets, fixing RenderFlex/unbounded constraint errors, implementing responsive layouts, or auditing UI performance and accessibility.
---

# Flutter UI, Adaptive Layouts, Performance & Accessibility

## 1. Fundamental Layout Rule
**Constraints go down. Sizes go up. Parent sets position.**
- A widget cannot know its own position, and it can only choose a size within the `BoxConstraints` passed down by its parent.
- Never force fixed screen-based sizes when `Expanded`, `Flexible`, `LayoutBuilder`, or `ConstrainedBox` expresses the constraint cleanly.

## 2. Adaptive & Responsive Design
- Use `LayoutBuilder` (for local parent constraints) and `MediaQuery.sizeOf(context)` (for window-level breakpoints).
- **Never** use `MediaQuery.orientationOf` or hardware-type checks (`Platform.isIOS` / `isTablet`) to decide layout structure, and **never** lock screen orientation.
- Center content on wide viewports with `ConstrainedBox(maxWidth: 840)` and adapt navigation (`NavigationBar` -> `NavigationRail`) by window width.
- See [references/flutter-layout-constraints-and-fixes.md](references/flutter-layout-constraints-and-fixes.md) for the 5 classic layout error diagnostics and adaptive grid/breakpoint patterns.

## 3. Widget Performance & Previews
- Use `const` constructors wherever possible to short-circuit widget rebuilds.
- Extract reusable UI pieces into atomic `StatelessWidget` classes (1 public widget per file, `<200` lines)—**never** use `_buildSection()` helper methods that hide rebuild scopes.
- Use lazy builders (`ListView.builder`, `GridView.builder`, `SliverList`) for scrollable collections instead of `Column` + `SingleChildScrollView` with large lists.
- Use `RepaintBoundary` selectively around complex animations or custom painters.
- Add interactive widget previews in `previews.dart` using `@Preview(...)` for isolated UI verification.

## 4. Accessibility (WCAG & Semantics)
- Enforce minimum `48x48dp` touch targets (`MaterialTapTargetSize.padded` or `ConstrainedBox(minWidth: 48, minHeight: 48)`).
- Wrap custom interactive elements and icon-only buttons with `Semantics(label: ..., button: true)` and use `ExcludeSemantics` for purely decorative visuals.
- Test with large `TextScaler` values (`2.0x`) to guarantee zero text clipping or `RenderFlex` overflow.
- See [references/flutter-performance-and-a11y.md](references/flutter-performance-and-a11y.md) for performance checklists, `previews.dart`, and `tester.getSemantics` verification.
