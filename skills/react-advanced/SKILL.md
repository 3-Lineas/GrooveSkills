---
name: react-advanced
description: Use when building with React 19 platform features and rendering architecture: React Compiler (auto-memoization), concurrent rendering (useTransition, useDeferredValue, Suspense), the use() hook, Actions (useActionState, useOptimistic, useFormStatus), ref-as-prop, <Context value>, compound components, context splitting, error boundaries, portals, virtualization (@tanstack/react-virtual), code-splitting, and RSC / 'use client' boundaries. TRIGGER when optimizing React performance, adopting React 19 APIs, working with forms/mutations, or architecting complex React component trees. Always adhere to 'best-practices' and 'react-core'.
---

# React Advanced: React 19 Platform & Rendering Architecture

Opinionated reference for **React 19** and **React Compiler 1.0** capabilities, concurrent rendering primitives, async Actions, advanced component composition, performance engineering, and React Server Component (RSC) boundaries.

---

## 1. Golden Rules (Non-negotiable)

1. **React Compiler First — Stop Reflexive Manual Memoization**:
   - Do not wrap every derived value or handler in `useMemo`, `useCallback`, or `React.memo` by reflex in new code.
   - Reserve manual `useMemo`/`useCallback` strictly for **effect dependency stability** (`useEffect` identity contracts) or code skipped by the compiler.
   - Never strip existing manual memoization blindly; respect `preserve-manual-memoization` lint warnings.
2. **React 19 Idioms Only (No Legacy Wrappers)**:
   - Receive `ref` as a plain prop on function components (`ComponentProps<"input">`)—never use `forwardRef` in new code.
   - Render `<MyContext value={val}>` directly—never use legacy `<MyContext.Provider>`.
   - Render native `<title>`, `<meta>`, and `<link>` tags directly in components—never add `react-helmet`.
3. **Actions for Async Mutations & Forms**:
   - Use `useActionState`, `useOptimistic`, `useFormStatus`, and `<form action={fn}>` for form submissions and async mutations instead of manual `isLoading`/`error` `useState` boilerplate.
4. **Concurrent Responsiveness & Post-`await` Transitions**:
   - Use `useTransition` for non-urgent state updates and `useDeferredValue` instead of fixed `setTimeout` debouncing for expensive derived renders.
   - Inside `startTransition(async () => { ... })`, always re-wrap state updates that happen **after an `await`** in a nested `startTransition(() => setState(...))`.
5. **Safe `use()` Hook Usage**:
   - `use(promiseOrContext)` may be called conditionally after early returns, but **never inside `try / catch`**. Handle rejected promises with an **Error Boundary**.
   - Never create a new promise inline during client render (`use(fetchData())`); pass a stable promise created on the server, in a parent, or in an event/transition.
6. **Context Architecture by Change Frequency**:
   - Native Context has no selector and bypasses `React.memo`. Never combine high-frequency state (e.g. cursor/scroll) and low-frequency state (e.g. theme/auth) in a single Context. Split contexts by update rate and memoize provider values.
7. **Virtualize Large Lists & Split by Route**:
   - Virtualize lists exceeding ~100 items using `@tanstack/react-virtual`.
   - Code-split with `React.lazy` + `Suspense` at **route or heavy-feature boundaries**, avoiding micro-chunks (<10KB).
8. **Strict RSC & `'use server'` Security Boundary**:
   - Treat `'use client'` as a **module dependency graph** boundary: props crossing into client modules must be serializable.
   - Treat every `'use server'` function as a public HTTP endpoint: validate inputs with **Valibot** (`* as v from "valibot"`) and verify authorization inside the function before executing mutations.
9. **GrooveSkills Architecture Compliance**:
   - Enforce `< 200` lines per file, mandatory `@/...` path aliases, zero barrel files (`index.ts`), and early returns across all components and hooks.

---

## 2. Compiler, Concurrency & React 19 Actions

```tsx
import { startTransition, useActionState, useDeferredValue, useState } from "react";
import { updateFilterPreferenceAction } from "@/actions/catalog/update-filter-preference.action";
import type { Product } from "@/types/product.types";

export function ProductExplorer({ catalog }: { catalog: Product[] }) {
  const [query, setQuery] = useState<string>("");
  const deferredQuery = useDeferredValue(query, "");

  const [state, saveAction, isPending] = useActionState(
    async (_prev: { error?: string }, formData: FormData) => {
      const savedQuery = String(formData.get("query") ?? "");
      return await updateFilterPreferenceAction({ query: savedQuery });
    },
    {}
  );

  function handleAsyncRefresh(fetchNext: () => Promise<string>): void {
    startTransition(async () => {
      const nextQuery = await fetchNext();
      // Always re-wrap state updates after await in startTransition:
      startTransition(() => setQuery(nextQuery));
    });
  }

  const matches = catalog.filter((item) =>
    item.name.toLowerCase().includes(deferredQuery.toLowerCase())
  );

  return (
    <section>
      <form action={saveAction}>
        <input name="query" value={query} onChange={(e) => setQuery(e.target.value)} />
        <button type="submit" disabled={isPending}>Save Filter</button>
        {state.error && <p role="alert">{state.error}</p>}
      </form>
      <ul style={{ opacity: query !== deferredQuery ? 0.6 : 1 }}>
        {matches.map((p) => <li key={p.id}>{p.name}</li>)}
      </ul>
    </section>
  );
}
```

---

## 3. RSC & `'use server'` Boundary with Valibot

Server Functions (`'use server'`) are public-facing boundaries. Always validate inputs with **Valibot** and authorize the caller before executing business logic.

```tsx
"use server";

import * as v from "valibot";
import { requireAuthenticatedUser } from "@/actions/auth/require-authenticated-user.action";

const commentSchema = v.object({
  articleId: v.pipe(v.string(), v.nonEmpty("Article ID is required.")),
  body: v.pipe(
    v.string(),
    v.trim(),
    v.minLength(3, "Please write at least 3 characters before posting.")
  ),
});

export async function publishCommentServerAction(formData: FormData) {
  const parsed = v.safeParse(commentSchema, {
    articleId: formData.get("articleId"),
    body: formData.get("body"),
  });

  if (!parsed.success) {
    return { success: false, error: parsed.issues[0].message };
  }

  const user = await requireAuthenticatedUser();
  return { success: true, userId: user.id, message: "Thank you! Your comment has been published." };
}
```

---

## 4. Anti-Patterns to Avoid

| Anti-Pattern | Why It Fails | Fix |
| :--- | :--- | :--- |
| Hand-memoizing everything with React Compiler active | Adds visual noise and redundant cache overhead | Write plain code; use `useMemo` only as an effect-dependency escape hatch |
| Stripping existing `useMemo` blindly | Can break effect dependency stability contracts | Respect `preserve-manual-memoization` lint warnings |
| Updating state after `await` in `startTransition` without re-wrapping | Post-`await` update escapes the transition; `isPending` ends prematurely | Wrap post-`await` state updates in `startTransition(() => ...)` |
| Calling `use(promise)` inside `try / catch` or creating promises in client render | Suspense throws internal signals; inline promises recreate every render | Use Error Boundaries for rejections; create promises above the component |
| Using `forwardRef`, `<Context.Provider>`, or `react-helmet` | Deprecated/superseded in React 19 | Pass `ref` as prop, render `<Context value>`, use native `<title>`/`<meta>` |
| Unvalidated `'use server'` arguments | `'use server'` endpoints are public and untrusted | Validate with Valibot (`* as v from "valibot"`) and check auth first |

---

## 5. Reference Navigation

- **[react-compiler.md](references/react-compiler.md)**: Compiler adoption, ESLint v6+, escape hatches, and detection checklist.
- **[concurrent-rendering.md](references/concurrent-rendering.md)**: `useTransition`, post-`await` rule, `useDeferredValue`, `Suspense`, and streaming SSR.
- **[react19-actions-and-apis.md](references/react19-actions-and-apis.md)**: `use()`, `useActionState`, `useOptimistic`, `useFormStatus`, `ref` prop, `<Context value>`, and native metadata.
- **[component-patterns.md](references/component-patterns.md)**: Compound components, context splitting, `use-context-selector`, error boundaries, and portals.
- **[performance.md](references/performance.md)**: `@tanstack/react-virtual`, route-first `React.lazy`, Profiler workflow, and anti-pattern table.
- **[rsc-boundary.md](references/rsc-boundary.md)**: Module-graph `'use client'` rules, serializable props, `'use server'` Valibot security, and React version pinning.
