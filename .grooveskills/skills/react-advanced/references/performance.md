# Performance Architecture

> Source of truth: [lazy](https://react.dev/reference/react/lazy) and [Suspense](https://react.dev/reference/react/Suspense).

With the React Compiler handling fine-grained memoization, performance engineering focuses on three architectural levers: rendering fewer DOM nodes (**virtualization**), shipping less JavaScript up front (**code-splitting**), and measuring before optimizing (**profiling**).

## Virtualization

A list of thousands of rows mounts thousands of DOM nodes, degrading initial render and scroll responsiveness. Virtualization renders only the rows inside (and near) the viewport.

### Library Comparison

| Library | Character | Use when |
|---|---|---|
| `@tanstack/react-virtual` | Modern, headless, strongest TypeScript support; full markup control | Default choice for custom layouts and strict TypeScript projects |
| `react-virtuoso` | Batteries-included (auto-sizing, grouping, sticky headers, chat feeds) | Rich variable-height list features out of the box |
| `react-window` | Legacy/minimal fixed-size lists | Maintaining existing codebases |

```tsx
import { useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import type { LogEntry } from "@/types/log.types";
import { LogRowView } from "@/components/logs/log-row-view";

export function VirtualLogList({ rows }: { rows: LogEntry[] }) {
  const parentRef = useRef<HTMLDivElement>(null);
  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 40,
    overscan: 8,
  });

  return (
    <div ref={parentRef} style={{ height: 600, overflow: "auto" }}>
      <div style={{ height: virtualizer.getTotalSize(), position: "relative" }}>
        {virtualizer.getVirtualItems().map((virtualRow) => (
          <div
            key={virtualRow.key}
            style={{
              position: "absolute",
              top: 0,
              transform: `translateY(${virtualRow.start}px)`,
              width: "100%",
            }}
          >
            <LogRowView row={rows[virtualRow.index]} />
          </div>
        ))}
      </div>
    </div>
  );
}
```

**Keep row renderers light:** Once virtualized, per-item render cost becomes the bottleneck. Avoid heavy computation or deep subtrees inside `LogRowView`.

## Code-Splitting

`React.lazy` + `Suspense` defers loading a component's bundle until it is rendered.

```tsx
import { lazy, Suspense } from "react";
import { RouteSkeleton } from "@/components/layout/route-skeleton";

const AnalyticsDashboard = lazy(() => import("@/components/analytics/analytics-dashboard"));

export function AnalyticsRoute() {
  return (
    <Suspense fallback={<RouteSkeleton />}>
      <AnalyticsDashboard />
    </Suspense>
  );
}
```

### Strategy

- **Split by route or heavy feature first** (charts, rich-text editors, admin modals).
- **Do not over-split** tiny (<10KB) components, which creates network request waterfalls.
- **Match fallback dimensions** to prevent Cumulative Layout Shift (CLS).

## Profiling Workflow

1. **Profile against a production/profiling build** (development builds add instrumentation overhead).
2. **Record the interaction** in React DevTools Profiler and inspect the flamegraph and "Why did this render?".
3. **Verify `"Memo ✨"` badges** to confirm the React Compiler optimized hot-path components.

## Anti-Pattern → Detection → Fix Catalog

| Anti-pattern | Why it is wrong | How to detect | Fix |
|---|---|---|---|
| Hand-memoizing everything | Redundant with React Compiler | Compiler on, code cluttered with `useMemo` | Remove; keep only effect-stability escape hatches |
| Removing manual memo blindly | Breaks effect dependency identity contracts | `preserve-manual-memoization` lint warnings | Restore load-bearing memo |
| Large high-frequency context | Re-renders all consumers on every tick | Profiler highlights unrelated consumers | Split contexts by change frequency |
| `use()` inside `try / catch` or inline client `fetch()` | Swallows Suspense signals or loops infinitely | Infinite network requests or uncaught suspense | Use Error Boundary; hoist promise creation |
| State update after `await` in `startTransition` | Escapes transition; `isPending` ends early | Pending spinner disappears before UI updates | Re-wrap post-`await` setter in `startTransition` |
| Manual debounce for derived renders | Fixed delay on fast/slow devices alike | Input lag on low-end devices | Use `useDeferredValue` |
| Unvirtualized lists >100 rows | Mounts thousands of DOM nodes | Slow mount and scroll jank in Profiler | Virtualize with `@tanstack/react-virtual` |
