# React Compiler — Adoption & Memoization Guidance

> Source of truth: [React Compiler docs](https://react.dev/learn/react-compiler/introduction) and the [1.0 announcement](https://react.dev/blog/2025/10/07/react-compiler-1).

## What the Compiler Is

The React Compiler is a build-time optimizing compiler that rewrites components and hooks to memoize automatically. It reached **1.0 stable on 2025-10-07**. It analyzes which values a component computes, which of those depend on which inputs, and emits memoization at fine granularity — including **conditional** memoization that a hand-written `useMemo` cannot express.

It supports React 17, 18, and 19, and produces the best results on 19. On 17/18 it relies on a runtime helper (`react-compiler-runtime`).

## The Memoization Inversion

Pre-compiler React guidance optimized for reference stability by hand: wrap derived values in `useMemo`, wrap callbacks in `useCallback`, wrap components in `React.memo`. With the compiler enabled, that work is redundant for new code, and over-memoization carries real cost (larger code, more cache slots, harder reading).

### Before (manual, pre-compiler)

```tsx
export function Dashboard({ items, onSelect }: DashboardProps) {
  const sorted = useMemo(() => items.slice().sort(byName), [items]);
  const total = useMemo(() => items.reduce((s, i) => s + i.value, 0), [items]);
  const handleSelect = useCallback((id: string): void => onSelect(id), [onSelect]);

  return <ItemList items={sorted} total={total} onSelect={handleSelect} />;
}

const ItemList = React.memo(function ItemList({ items, total, onSelect }: ListProps) {
  return /* ... */;
});
```

### After (compiler enabled)

```tsx
// Plain code. The compiler memoizes `sorted`, `total`, `handleSelect`,
// and the ItemList render output as needed — including conditionally.
export function Dashboard({ items, onSelect }: DashboardProps) {
  const sorted = items.slice().sort(byName);
  const total = items.reduce((s, i) => s + i.value, 0);
  const handleSelect = (id: string): void => onSelect(id);

  return <ItemList items={sorted} total={total} onSelect={handleSelect} />;
}
```

## When Manual Memo Still Earns Its Place

Keep manual memo when:

1. **A value is an effect dependency and correctness depends on its reference identity.** The compiler optimizes *render*; it does not guarantee a particular identity contract for an effect's dependency array. A value recreated each render re-fires the effect.

```tsx
const config = useMemo(() => ({ url, token }), [url, token]);
useEffect(() => subscribe(config), [config]);
```

2. **Code the compiler cannot statically analyze.** When the compiler cannot prove a component follows the Rules of React, it safely skips that component rather than risk a miscompile. In a skipped component, manual memo remains a valid local optimization.

## Do Not Strip Existing Manual Memo Blindly

The compiler is designed to *preserve* existing `useMemo`/`useCallback`/`React.memo`. The [`preserve-manual-memoization`](https://react.dev/reference/eslint-plugin-react-hooks/lints/preserve-manual-memoization) lint flags cases where removing or altering manual memo would change behavior. Treat its warnings as a signal that the memo carried meaning beyond performance.

## Adoption Path

1. **Install ESLint support:** `eslint-plugin-react-hooks` v6+ absorbed the former `eslint-plugin-react-compiler`.
2. **Fix reported Rules of React violations** (mutations during render, conditional hooks).
3. **Enable the compiler in the build** (Babel, Vite, Metro, Next.js, or Rsbuild).

```ts
// vite.config.ts
import react from "@vitejs/plugin-react";

export default {
  plugins: [
    react({
      babel: { plugins: [["babel-plugin-react-compiler", {}]] },
    }),
  ],
};
```

4. **Verify in DevTools:** React DevTools marks compiler-optimized components with a `"Memo ✨"` badge.

## Detection Checklist

| Symptom | Likely cause | Action |
|---|---|---|
| New code still littered with `useMemo`/`useCallback` | Reflex memoization habit | Remove; let the compiler handle it |
| `preserve-manual-memoization` warnings after cleanup | Removed load-bearing memo | Restore the memo; it stabilized an effect/identity contract |
| A component shows no `"Memo ✨"` badge | Compiler skipped it (unanalyzable) | Fix Rules of React violations, or keep manual memo there |
| Effect re-fires every render | A dependency value is recreated each render | Memoize that single dependency by hand |
