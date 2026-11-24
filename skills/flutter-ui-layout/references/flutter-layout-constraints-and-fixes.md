# Flutter Layout Constraints, Breakpoints & Error Fixes

## 1. Five Classic Layout Errors & Remediation
| Error Message | Root Cause | Fix |
| :--- | :--- | :--- |
| `Vertical viewport was given unbounded height` | `ListView` / `GridView` placed directly inside `Column` or `SingleChildScrollView`. | Wrap `ListView.builder` in `Expanded` (inside `Column`) or use `CustomScrollView` + `SliverList`. |
| `InputDecorator ... unbounded width` | `TextField` / `TextFormField` placed directly inside `Row` without width constraints. | Wrap `TextField` in `Expanded` or `SizedBox(width: ...)`. |
| `RenderFlex overflowed by X pixels` | Fixed children exceed `Row` / `Column` main-axis space or `Text` lacks wrapping. | Wrap `Text` in `Expanded` / `Flexible`, use `Wrap` instead of `Row`, or make container scrollable. |
| `Incorrect use of ParentData widget` | `Expanded`, `Flexible`, or `Positioned` not a direct child of `Flex` (`Row`/`Column`) or `Stack`. | Move `Expanded`/`Flexible` to be a direct child of `Row`/`Column`, or `Positioned` directly under `Stack`. |
| `RenderBox was not laid out` | Cascading failure from an earlier unbounded constraint or zero-size parent. | Fix the primary constraint error reported above it in the console. |

## 2. Adaptive Breakpoints & Grids
```dart
class AdaptiveCatalogLayout extends StatelessWidget {
  const AdaptiveCatalogLayout({required this.items, super.key});

  final List<CatalogItem> items;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: ConstrainedBox(
        constraints: const BoxConstraints(maxWidth: 1080),
        child: GridView.builder(
          padding: const EdgeInsets.all(16),
          gridDelegate: const SliverGridDelegateWithMaxCrossAxisExtent(
            maxCrossAxisExtent: 280,
            mainAxisSpacing: 16,
            crossAxisSpacing: 16,
            childAspectRatio: 0.85,
          ),
          itemCount: items.length,
          itemBuilder: (context, index) => CatalogItemCard(item: items[index]),
        ),
      ),
    );
  }
}
```
