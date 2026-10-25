---
name: react-core
description: Use when building or modifying React components, JSX, props, local state, core hooks (useState, useEffect, useRef, useContext, useMemo, useCallback), lists, conditional UI, or controlled inputs. TRIGGER when the project imports 'react' or 'react-dom', or when editing .tsx/.jsx files. Always adhere to the 'best-practices' skill and pair with 'react-advanced' for React 19 platform features and performance architecture.
---

# React Core Fundamentals & Opinionated Standards

Canonical reference for React fundamentals in GrooveSkills projects: function components, JSX, props and immutable state, core hooks, composition, conditional and list rendering, and controlled inputs.

---

## 1. Golden Rules (Non-negotiable)

1. **One Component per File & < 200 Lines**:
   - Every exported React component resides in its own dedicated `.tsx` file and never exceeds **200 lines**.
   - Extract sub-components or custom hooks (`use-*.ts`) into atomic files before reaching the limit.
2. **Mandatory Path Aliases (`@/...`) & Zero Barrel Files**:
   - Import components, hooks, schemas, and utilities directly via path aliases (`@/components/ui/card`, `@/hooks/use-window-width`).
   - Never create `index.ts` or `index.tsx` barrel files to re-export components or hooks.
3. **Strict Props Typing (Zero `any`)**:
   - Define explicit `interface` or `type` declarations for component props.
   - Treat `props` and `state` as strictly immutable.
4. **Early Returns for UI States (No Nested Ternaries)**:
   - Handle loading, error, and empty states with top-level guard clauses (`if (!data) return <EmptyState />;`) instead of deeply nested JSX conditionals.
5. **Top-Level Hooks Only (Rules of Hooks)**:
   - Call hooks unconditionally at the top level of function components or custom hooks—never inside loops, conditions, or nested functions (except React 19's `use()`, covered in `react-advanced`).
6. **Immutable State Updates & Functional Updaters**:
   - Never mutate arrays or objects in place (`items.push()`). Always pass a new reference (`[...items, next]`).
   - Use functional updaters (`setCount((prev) => prev + step)`) whenever next state depends on previous state.
7. **Compiler-Aware Memoization**:
   - Do not wrap every value or callback in `useMemo` or `useCallback` by reflex. When the React Compiler is active, it memoizes automatically.
   - Reserve manual `useMemo` and `useCallback` for stabilizing references passed to `useEffect` dependency arrays or for genuinely expensive computations in uncompiled modules.
8. **Stable Identity Keys in Lists**:
   - Always provide a stable, unique `key` derived from domain identity (`item.id`), never the array index (`i`) for dynamic or reorderable lists.
9. **Controlled Inputs with Single Source of Truth**:
   - Derive input `value` from state and handle updates via `onChange`, validating user input with **Valibot** (`* as v from "valibot"`) where applicable.

---

## 2. Components, JSX, Props, and Early Returns

Name components in `PascalCase`. Return a single root element or Fragment (`<>...</>`). Use guard clauses to keep the primary render path flat.

```tsx
import { useState } from "react";

interface UserSummaryProps {
  name: string;
  role?: string;
  isActive: boolean;
  step?: number;
}

export function UserSummary({ name, role = "Member", isActive, step = 1 }: UserSummaryProps) {
  const [count, setCount] = useState<number>(0);

  if (!isActive) {
    return <p className="text-muted">This account is currently inactive.</p>;
  }

  return (
    <section className="user-summary">
      <h2>Hello, {name} ({role})</h2>
      <button type="button" onClick={() => setCount((prev) => prev + step)}>
        Count: {count}
      </button>
    </section>
  );
}
```

---

## 3. Core Hooks Guide

- **`useState`**: Holds reactive local state (`const [isOpen, setIsOpen] = useState<boolean>(false);`).
- **`useEffect`**: Synchronizes with external systems (DOM listeners, timers, subscriptions). Always declare accurate dependencies and return a cleanup function.
- **`useRef`**: Holds a mutable value across renders without causing re-renders, or references a DOM node.
- **`useMemo` & `useCallback`**: Deliberate escape hatches to stabilize references for `useEffect` dependency arrays or heavy computations in uncompiled components.
- **`useContext`**: Reads shared state from a `Context` higher in the tree (`<ThemeContext value={theme}>` in React 19).

```tsx
import { useEffect, useRef, useState } from "react";

export function AutoFocusWindowTracker() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [width, setWidth] = useState<number>(() => window.innerWidth);

  useEffect(() => {
    inputRef.current?.focus();
    const handleResize = (): void => setWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return <input ref={inputRef} placeholder={`Viewport: ${width}px`} />;
}
```

---

## 4. Composition, Lists, and Controlled Inputs

Favor composition via `children` over bloated configuration props, use stable domain keys (`todo.id`) for lists, and bind controlled inputs to state:

```tsx
import { useState, type ReactNode } from "react";

export interface TodoItem {
  id: string;
  text: string;
  done: boolean;
}

export function TodoCard({
  title,
  todos,
  children,
}: {
  title: string;
  todos: TodoItem[];
  children?: ReactNode;
}) {
  const [filter, setFilter] = useState<string>("");

  if (todos.length === 0) {
    return <p>Your task list is clear. Add a new item to get started.</p>;
  }

  const visible = todos.filter((t) => t.text.toLowerCase().includes(filter.toLowerCase()));

  return (
    <article className="card">
      <h2>{title}</h2>
      <input
        value={filter}
        onChange={(event) => setFilter(event.target.value)}
        placeholder="Filter tasks..."
      />
      <ul>
        {visible.map((todo) => (
          <li key={todo.id}>{todo.done ? <s>{todo.text}</s> : todo.text}</li>
        ))}
      </ul>
      {children}
    </article>
  );
}
```

---

## 5. Anti-Patterns to Avoid

| Anti-Pattern | Why It Fails | Correct Pattern |
| :--- | :--- | :--- |
| Mutating state in place (`items.push(next)`) | Same array reference; React skips re-render | Create a new reference: `setItems((prev) => [...prev, next])` |
| Calling hooks after `if` or inside loops | Breaks React's deterministic hook call order | Call hooks unconditionally at the top level; branch on results |
| Using array index `key={i}` on dynamic lists | Misattributes component state on insert, delete, or sort | Use a stable domain identifier: `key={item.id}` |
| Fetching or deriving synchronous state inside `useEffect` | Triggers an extra render pass and causes UI flicker | Derive values inline during render; use `use()` / Suspense or Actions for async data (`react-advanced`) |
| Re-exporting components via `components/index.ts` | Violates Zero Barrel Files and harms tree-shaking | Import directly from `@/components/ui/card` |

---

## 6. Sibling Skills

- **`best-practices`**: Universal clean architecture, `< 200` lines limit, `@/` path aliases, strict typing, and courteous user feedback.
- **`react-advanced`**: React 19 platform features, React Compiler 1.0 auto-memoization, concurrent rendering (`useTransition`, `useDeferredValue`, `Suspense`), `use()`, Actions (`useActionState`, `useOptimistic`, `useFormStatus`), context optimization, virtualization, and RSC boundaries.
