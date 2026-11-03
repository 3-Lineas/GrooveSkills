# React 19 Platform Hooks & APIs

> Source of truth: [use()](https://react.dev/reference/react/use), [useActionState](https://react.dev/reference/react/useActionState), [useOptimistic](https://react.dev/reference/react/useOptimistic), [useFormStatus](https://react.dev/reference/react-dom/hooks/useFormStatus), and [<form>](https://react.dev/reference/react-dom/components/form).

## The `use()` Hook

`use()` reads the value of a promise or a context. Unlike every other hook, it may be called **conditionally** — after early returns or inside branches. When given a promise, it suspends the component until the promise resolves, integrating with the nearest Suspense boundary.

```tsx
import { use } from "react";
import type { CommentItem } from "@/types/comment.types";

export function CommentList({
  commentsPromise,
  isVisible,
}: {
  commentsPromise: Promise<CommentItem[]>;
  isVisible: boolean;
}) {
  if (!isVisible) {
    return null;
  }

  // Legal after an early return — `use` is exempt from the top-level rule.
  const comments = use(commentsPromise);
  return (
    <ul>
      {comments.map((c) => (
        <li key={c.id}>{c.text}</li>
      ))}
    </ul>
  );
}
```

### Rules and pitfalls

- **Never wrap `use()` in `try / catch`.** A suspended promise is not a synchronous error; rejections surface through an **Error Boundary**, not `catch`.
- **Do not create the promise during render on the client.** A promise created in the render body is recreated every render, causing infinite suspension loops. Create it on the server, in a parent loader, or in an event handler, and pass it down.

## Actions (`useActionState`, `useOptimistic`, `useFormStatus`)

Actions are React's built-in async-mutation model, providing pending, error, and optimistic handling at the React level.

### `useActionState`

Runs an action function, tracks `isPending`, and threads the previous result forward (replaces the canary `useFormState`).

```tsx
import { useActionState } from "react";

interface SaveResult {
  error?: string;
}

export function UpdateNameForm({
  saveName,
}: {
  saveName: (name: string) => Promise<SaveResult>;
}) {
  const [state, formAction, isPending] = useActionState<SaveResult, FormData>(
    async (_prev, formData) => {
      const name = String(formData.get("name") ?? "");
      return await saveName(name);
    },
    {}
  );

  return (
    <form action={formAction}>
      <input name="name" disabled={isPending} />
      <button type="submit" disabled={isPending}>
        {isPending ? "Saving..." : "Save"}
      </button>
      {state.error && <p role="alert">{state.error}</p>}
    </form>
  );
}
```

### `useOptimistic`

Renders an optimistic value while an async action is in flight, reverting automatically when the action settles.

```tsx
import { useOptimistic } from "react";

export function LikeButton({
  count,
  onLike,
}: {
  count: number;
  onLike: () => Promise<void>;
}) {
  const [optimisticCount, addOptimistic] = useOptimistic(
    count,
    (current, delta: number) => current + delta
  );

  async function handleAction(): Promise<void> {
    addOptimistic(1);
    await onLike();
  }

  return (
    <form action={handleAction}>
      <button type="submit">♥ {optimisticCount}</button>
    </form>
  );
}
```

### `useFormStatus`

Reads the pending state of the enclosing `<form>` from a child component without prop drilling.

```tsx
import { useFormStatus } from "react-dom";

export function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending}>
      {pending ? "Submitting..." : label}
    </button>
  );
}
```

## React 19 Ergonomic Changes

1. **`ref` as a plain prop**: `forwardRef` is deprecated. Derive wrapper props from `ComponentProps<"input">` (which already includes `ref`), or add `ref?: React.Ref<HTMLElement>` to custom interfaces.
2. **`<Context value>` as provider**: Render `<ThemeContext value={theme}>{children}</ThemeContext>` instead of `<ThemeContext.Provider>`.
3. **Native document metadata**: Render `<title>`, `<meta>`, and `<link>` directly inside components; React hoists them to `<head>` automatically without `react-helmet`.

## Migration Notes from React 17/18

| React 17/18 idiom | React 19 replacement |
|---|---|
| `forwardRef((props, ref) => ...)` | `ref` as a plain prop |
| `<Context.Provider value={...}>` | `<Context value={...}>` |
| `react-helmet` for `<head>` tags | Native `<title>`, `<meta>`, `<link>` hoisting |
| `useFormState` (canary) | `useActionState` (from `"react"`) |
| Manual `isLoading`/`error` state in submit handlers | `useActionState` + `useOptimistic` + `useFormStatus` |
| Fetch in `useEffect` + store in `useState` | Pass a promise to `use()` under `<Suspense>` |
