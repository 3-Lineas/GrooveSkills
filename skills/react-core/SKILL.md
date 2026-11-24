---
name: react-core
description: Use when building or modifying React components, JSX, props, local state, core hooks (useState, useEffect, useRef, useContext, useMemo, useCallback), lists, conditional UI, or controlled inputs. TRIGGER when the project imports 'react' or 'react-dom', or when editing .tsx/.jsx files. Always adhere to the 'best-practices' skill and pair with 'react-advanced' for React 19 platform features and performance architecture.
---

# React Core Fundamentals & Opinionated Standards

> **Modern Web Primitives**: Before implementing `<dialog>`, `popover`, container queries, anchor positioning, view transitions, native form validation/autofill, or Core Web Vitals optimizations in React, consult `modern-web-guidance` for Baseline-verified native APIs and zero-`any` TypeScript adaptation.

Canonical reference for React fundamentals in GrooveSkills projects: function components, JSX, props and immutable state, core hooks, composition, conditional and list rendering, and controlled inputs.

---

## 1. Golden Rules (Non-negotiable)

1. **Strictly Prohibited: `React.FC` and `React.FunctionComponent`**:
   - In modern React (React 18 / 19), **NEVER** type components with `React.FC` or `React.FunctionComponent`.
   - Declare standard functions and type `props` directly in the parameter list.
   - For components requiring children, type `children: ReactNode` explicitly in the props interface.

2. **One Component per File & Props-Only Inline Type**:
   - Every exported React component resides in its own dedicated `.tsx` file and never exceeds **200 lines**.
   - **Exclusive Inline Exception**: ONLY the component's own `Props` interface (e.g. `interface UserAvatarProps { ... }`) may be declared inline in its `.tsx` file. All other domain models, entities, or state structures must be imported from `@/types/{domain}/`.
   - Extract sub-components or custom hooks (`use-*.ts`) into atomic files before reaching the limit.

3. **Domain Custom Hooks for Form Encapsulation**:
   - Form components must encapsulate their own state using domain hooks (e.g. `useLoginForm`, `useRegisterForm`) instead of bubbling raw `form` and `onSubmit` props up to higher-level screen containers.

4. **Mandatory Path Aliases (`@/...`) & Zero Barrel Files**:
   - Import components, hooks, schemas, and utilities directly via path aliases (`@/components/ui/card`, `@/hooks/use-window-width`).
   - Never create `index.ts` or `index.tsx` barrel files to re-export components or hooks.

5. **Early Returns for UI States (No Nested Ternaries)**:
   - Handle loading, error, and empty states with top-level guard clauses (`if (!data) return <EmptyState />;`) instead of deeply nested JSX conditionals.

6. **Immutable State Updates & Functional Updaters**:
   - Never mutate arrays or objects in place (`items.push()`). Always pass a new reference (`[...items, next]`).
   - Use functional updaters (`setCount((prev) => prev + step)`) whenever next state depends on previous state.

7. **Stable Identity Keys in Lists**:
   - Always provide a stable, unique `key` derived from domain identity (`item.id`), never the array index (`i`) for dynamic or reorderable lists.

8. **Strictly Avoid `useEffect` by Default (Last Resort Only)**:
   - Never use `useEffect` when a declarative or event-based alternative exists:
     - **Derived/computed values**: compute inline with `const` during render (`const doubleCount = count * 2`), never duplicate state with `useState` + `useEffect`.
     - **Event-driven logic**: execute directly inside the event handler, never react to state changes in an effect.
     - **Resetting state on prop change**: pass a stable `key` to the child component or derive the value during render.
     - **Effect chains**: compute the entire next state transition once inside the originating event handler.
   - **Strict exception**: `useEffect` is a **last resort only**, permitted **solely** when no other way exists to synchronize with an external system (imperative DOM APIs, browser/WebSocket/Wails subscriptions, timers, or imperative third-party widgets), always with a cleanup function.

---

## 2. Component Typing Standards (1 Component per File)

```tsx
// src/components/users/user-avatar.tsx
// ✅ Component with props (Props interface permitted inline)
export interface UserAvatarProps {
  name: string;
  avatarUrl?: string;
}

export function UserAvatar({ name, avatarUrl }: UserAvatarProps) {
  return (
    <div className="flex items-center gap-2">
      {avatarUrl ? <img src={avatarUrl} alt={name} /> : null}
      <span>{name}</span>
    </div>
  );
}
```

```tsx
// src/components/ui/card.tsx
import type { ReactNode } from "react";

// ✅ Component with children (Props interface permitted inline)
export interface CardProps {
  title: string;
  children: ReactNode;
}

export function Card({ title, children }: CardProps) {
  return (
    <section className="rounded-lg border p-4">
      <h3 className="font-semibold text-lg">{title}</h3>
      {children}
    </section>
  );
}
```

```tsx
// src/components/ui/empty-state.tsx
// ✅ Component without props
export function EmptyState() {
  return <p className="text-muted-foreground text-sm">No items found.</p>;
}
```

---

## 3. Avoid `useEffect` — Example: Derived Values with `const`

```tsx
// ❌ FORBIDDEN: Redundant state + useEffect causes an extra render pass
import { useEffect, useState } from "react";

export function Counter() {
  const [count, setCount] = useState<number>(0);
  const [doubleCount, setDoubleCount] = useState<number>(0);

  useEffect(() => {
    setDoubleCount(count * 2);
  }, [count]);

  return (
    <div>
      <button onClick={() => setCount((previousCount) => previousCount + 1)}>
        Increment
      </button>
      <p>Number: {count}</p>
      <p>Double Number: {doubleCount}</p>
    </div>
  );
}

// ✅ CORRECT: Compute derived values inline with const during render
import { useState } from "react";

export function Counter() {
  const [count, setCount] = useState<number>(0);
  const doubleCount = count * 2;

  return (
    <div>
      <button onClick={() => setCount((previousCount) => previousCount + 1)}>
        Increment
      </button>
      <p>Number: {count}</p>
      <p>Double Number: {doubleCount}</p>
    </div>
  );
}
```

---

## 4. Anti-Patterns to Avoid

| Anti-Pattern | Why It Fails | Correct Pattern |
| :--- | :--- | :--- |
| `export const Button: React.FC<Props>` | Verbose, breaks TS generics, legacy implicit children | `export function Button({ label }: ButtonProps)` |
| Mutating state in place (`items.push(next)`) | Same array reference; React skips re-render | Create a new reference: `setItems((prev) => [...prev, next])` |
| Calling hooks after `if` or inside loops | Breaks React's deterministic hook call order | Call hooks unconditionally at top level |
| Using array index `key={i}` on dynamic lists | Misattributes component state on insert, delete, or sort | Use a stable domain identifier: `key={item.id}` |
| Re-exporting components via `components/index.ts` | Violates Zero Barrel Files and harms tree-shaking | Import directly from `@/components/ui/card` |
| Using `useEffect` for derived state, event logic, or prop resets | Causes extra render passes, stale state, and effect chains | Compute inline with `const`, run in event handlers, or use `key` |

---

## 5. Sibling Skills

- **`best-practices`**: Universal clean architecture, `< 200` lines limit, `@/` path aliases, strict typing, and courteous user feedback.
- **`react-advanced`**: React 19 platform features, React Compiler auto-memoization, concurrent rendering, and RSC boundaries.
- **`react-create-page`**: Page coordinator architecture, custom domain hooks, and Valibot forms.
