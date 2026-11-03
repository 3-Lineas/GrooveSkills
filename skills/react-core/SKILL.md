---
name: react-core
description: Use when building or modifying React components, JSX, props, local state, core hooks (useState, useEffect, useRef, useContext, useMemo, useCallback), lists, conditional UI, or controlled inputs. TRIGGER when the project imports 'react' or 'react-dom', or when editing .tsx/.jsx files. Always adhere to the 'best-practices' skill and pair with 'react-advanced' for React 19 platform features and performance architecture.
---

# React Core Fundamentals & Opinionated Standards

Canonical reference for React fundamentals in GrooveSkills projects: function components, JSX, props and immutable state, core hooks, composition, conditional and list rendering, and controlled inputs.

---

## 1. Golden Rules (Non-negotiable)

1. **Strictly Prohibited: `React.FC` and `React.FunctionComponent`**:
   - In modern React (React 18 / 19), **NEVER** type components with `React.FC` or `React.FunctionComponent`.
   - Declare standard functions and type `props` directly in the parameter list.
   - For components requiring children, type `children: ReactNode` explicitly in the props interface.

2. **One Component per File & < 200 Lines**:
   - Every exported React component resides in its own dedicated `.tsx` file and never exceeds **200 lines**.
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

---

## 2. Component Typing Standards

```tsx
import type { ReactNode } from "react";

// ✅ Component with props
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

// ✅ Component with children
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

// ✅ Component without props
export function EmptyState() {
  return <p className="text-muted-foreground text-sm">No items found.</p>;
}
```

---

## 3. Anti-Patterns to Avoid

| Anti-Pattern | Why It Fails | Correct Pattern |
| :--- | :--- | :--- |
| `export const Button: React.FC<Props>` | Verbose, breaks TS generics, legacy implicit children | `export function Button({ label }: ButtonProps)` |
| Mutating state in place (`items.push(next)`) | Same array reference; React skips re-render | Create a new reference: `setItems((prev) => [...prev, next])` |
| Calling hooks after `if` or inside loops | Breaks React's deterministic hook call order | Call hooks unconditionally at top level |
| Using array index `key={i}` on dynamic lists | Misattributes component state on insert, delete, or sort | Use a stable domain identifier: `key={item.id}` |
| Re-exporting components via `components/index.ts` | Violates Zero Barrel Files and harms tree-shaking | Import directly from `@/components/ui/card` |

---

## 4. Sibling Skills

- **`best-practices`**: Universal clean architecture, `< 200` lines limit, `@/` path aliases, strict typing, and courteous user feedback.
- **`react-advanced`**: React 19 platform features, React Compiler auto-memoization, concurrent rendering, and RSC boundaries.
- **`react-create-page`**: Page coordinator architecture, custom domain hooks, and Valibot forms.
