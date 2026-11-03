# Concurrent Rendering

> Source of truth: [useTransition](https://react.dev/reference/react/useTransition), [useDeferredValue](https://react.dev/reference/react/useDeferredValue), [Suspense](https://react.dev/reference/react/Suspense), and [renderToPipeableStream](https://react.dev/reference/react-dom/server/renderToPipeableStream).

Concurrent rendering lets React prepare a new UI in the background and interrupt it for more urgent work. Urgent updates (typing, clicking) stay responsive while expensive updates (filtering thousands of rows, navigating) render without blocking input.

## `useTransition`

`useTransition` marks a state update as a non-urgent **transition**. React renders the transition in the background, keeps the current UI interactive, and exposes `isPending` so the UI can show a subtle pending indicator without a hard fallback.

```tsx
import { useState, useTransition } from "react";
import { ExpensiveReports } from "@/components/reports/expensive-reports";
import { HomeOverview } from "@/components/home/home-overview";
import { TabBar } from "@/components/navigation/tab-bar";

export function TabbedView() {
  const [tab, setTab] = useState<"home" | "reports">("home");
  const [isPending, startTransition] = useTransition();

  function selectTab(next: "home" | "reports"): void {
    startTransition(() => setTab(next));
  }

  return (
    <>
      <TabBar active={tab} onSelect={selectTab} busy={isPending} />
      {tab === "reports" ? <ExpensiveReports /> : <HomeOverview />}
    </>
  );
}
```

### React 19 async transitions and the post-`await` gotcha

React 19 allows `startTransition` to receive an async function (an "Action"). Only updates issued **synchronously within the transition scope** belong to the transition. Updates after an `await` run in a fresh task and escape it unless re-wrapped.

```tsx
// ❌ BAD: setResult runs after await, outside the transition; isPending ends early.
startTransition(async () => {
  const data = await fetchData();
  setResult(data);
});

// ✅ GOOD: re-wrap the post-await update so it stays part of the transition.
startTransition(async () => {
  const data = await fetchData();
  startTransition(() => setResult(data));
});
```

## `startTransition` vs `useDeferredValue`

`startTransition` marks an update non-urgent at the **call site** (event handlers). `useDeferredValue` marks a **value** as allowed to lag when an expensive subtree trails a fast-changing input.

Prefer `useDeferredValue` over a fixed `setTimeout` debounce for expensive *derived renders*: it is interruptible and device-adaptive.

```tsx
import { useDeferredValue, useState } from "react";

export interface RowItem {
  id: string;
  label: string;
}

export function FilterList({ rows }: { rows: RowItem[] }) {
  const [text, setText] = useState<string>("");
  const deferredText = useDeferredValue(text, "");

  const filtered = rows.filter((r) => r.label.includes(deferredText));
  const isStale = text !== deferredText;

  return (
    <>
      <input value={text} onChange={(e) => setText(e.target.value)} />
      <ul style={{ opacity: isStale ? 0.6 : 1 }}>
        {filtered.map((r) => (
          <li key={r.id}>{r.label}</li>
        ))}
      </ul>
    </>
  );
}
```

## Suspense for Data

A component suspends when it reads a not-yet-resolved promise via `use()`. The nearest `<Suspense fallback>` shows until the promise resolves.

```tsx
import { Suspense, use } from "react";
import type { User } from "@/types/user.types";
import { ProfileSkeleton } from "@/components/profile/profile-skeleton";

export function ProfileSection({ userPromise }: { userPromise: Promise<User> }) {
  return (
    <Suspense fallback={<ProfileSkeleton />}>
      <ProfileHeader userPromise={userPromise} />
    </Suspense>
  );
}

function ProfileHeader({ userPromise }: { userPromise: Promise<User> }) {
  const user = use(userPromise);
  return <h1>{user.name}</h1>;
}
```

### Resetting a boundary with `key`

Changing the `key` on a Suspense boundary (or a component inside it) discards the previous tree and re-suspends when switching the displayed resource:

```tsx
<Suspense fallback={<ProfileSkeleton />}>
  <ProfileLoader key={userId} userId={userId} />
</Suspense>
```

## Streaming SSR (React Level)

For Node servers, `renderToPipeableStream` streams HTML as Suspense boundaries resolve (`renderToReadableStream` for Web Streams / Edge / Cloudflare Workers). Design a meaningful **shell** (header, navigation, layout) that flushes immediately, and let slower data stream behind Suspense.

## Anti-Patterns

| Anti-pattern | Why it is wrong | Detection |
|---|---|---|
| State update after `await` in an async transition | Escapes the transition; `isPending` ends early | UI flips to non-pending mid-operation |
| Fixed debounce/throttle for expensive derived renders | `useDeferredValue` is interruptible and adaptive | Janky typing on slow devices; hard-coded timers |
| One root spinner instead of a streamed shell | Blocks first paint on the slowest data | Long blank time-to-first-byte |
| Suspense fallback that mismatches final layout | Causes layout shift on reveal | Visible jump when content arrives |
