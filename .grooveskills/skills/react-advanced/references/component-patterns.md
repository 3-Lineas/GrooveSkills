# Advanced Component Patterns

> Source of truth: [useContext](https://react.dev/reference/react/useContext), [createPortal](https://react.dev/reference/react-dom/createPortal), and [Component (error boundaries)](https://react.dev/reference/react/Component).

## Compound Components

Compound components let a parent and its sub-components coordinate through implicit shared state via Context so consumers compose pieces declaratively without prop drilling. In GrooveSkills projects, keep each sub-component under 200 lines or extract sub-components into dedicated files under the same domain folder.

```tsx
import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

interface TabsContextValue {
  activeTab: string;
  setActiveTab: (id: string) => void;
}

const TabsContext = createContext<TabsContextValue | null>(null);

export function useTabsContext(): TabsContextValue {
  const ctx = useContext(TabsContext);
  if (!ctx) {
    throw new Error("Tab components must be rendered inside <TabsRoot>.");
  }
  return ctx;
}

export function TabsRoot({
  defaultTab,
  children,
}: {
  defaultTab: string;
  children: ReactNode;
}) {
  const [activeTab, setActiveTab] = useState<string>(defaultTab);
  const value = useMemo(() => ({ activeTab, setActiveTab }), [activeTab]);

  return <TabsContext value={value}>{children}</TabsContext>;
}
```

## Context Optimization

Native context has **no selector**. When a provider value changes, **every** consumer of that context re-renders, regardless of which slice each consumer reads:

- `React.memo` does **not** block context-driven re-renders.
- `use(Context)` adds *conditional reading* but **not** *selective subscription*.
- The React Compiler does **not** solve large-context over-rendering.

### Native fix 1 — Memoize the provider value

A provider value object created inline is a new reference every render. Memoize it when passing an object literal:

```tsx
const authValue = useMemo(() => ({ user, signOut }), [user, signOut]);
return <AuthContext value={authValue}>{children}</AuthContext>;
```

### Native fix 2 — Split contexts by change frequency

Separate slow-changing state from fast-changing state so frequent updates never re-render consumers of stable data:

```tsx
// ❌ BAD: theme (rare) and pointer (frequent) share one context.
const UIContext = createContext<{ theme: ThemeMode; pointer: Point } | null>(null);

// ✅ GOOD: independent contexts; pointer churn never re-renders theme consumers.
export const ThemeContext = createContext<ThemeMode>("light");
export const PointerContext = createContext<Point>({ x: 0, y: 0 });
```

### Userland fix — `use-context-selector` or External Stores

When a single store holds many slices and consumers must subscribe to a single slice, use `use-context-selector` or a dedicated external store (`useSyncExternalStore` / Zustand / Nanostores).

## Custom Hooks vs Render Props

- **Custom Hooks (`use-*.ts`)**: Default choice for sharing stateful logic cleanly across components.
- **Render Props**: Useful for headless UI wrappers that own behavior/DOM measurement and delegate markup rendering to the caller.

## Error Boundaries

Error boundaries catch errors thrown during render, lifecycle methods, and constructors of the tree below them. For async and event-handler errors, pair `react-error-boundary` (`useErrorBoundary().showBoundary(error)`) with React 19's root `onCaughtError` / `onUncaughtError` hooks.

```tsx
import { useErrorBoundary } from "react-error-boundary";
import { saveRecordAction } from "@/actions/records/save-record.action";

export function SaveRecordButton({ payload }: { payload: string }) {
  const { showBoundary } = useErrorBoundary();

  async function handleSave(): Promise<void> {
    try {
      await saveRecordAction(payload);
    } catch (error) {
      showBoundary(error);
    }
  }

  return (
    <button type="button" onClick={handleSave}>
      Save Changes
    </button>
  );
}
```

## Portals

`createPortal` renders children into a different DOM node (`document.body`) while keeping them in the same place in the **React tree** (preserving Context and React event bubbling). Use portals for modals, dialogs, tooltips, and toasts that must escape parent `overflow: hidden` or `z-index` stacking contexts.

## Anti-Patterns

| Anti-pattern | Why it is wrong | Detection |
|---|---|---|
| One large context for high-frequency state | Every consumer re-renders on any change; `memo` cannot block it | Profiler shows unrelated consumers re-rendering |
| Expecting `React.memo` to stop context re-renders | Context bypasses prop comparison | Memoized child still re-renders on context change |
| Expecting native boundaries to catch async/event errors | Native boundaries catch only render-phase errors | Unhandled promise rejections in click handlers |
