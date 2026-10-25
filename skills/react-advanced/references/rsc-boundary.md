# RSC / `'use client'` Boundary & `'use server'` Security

> Source of truth: [Server Components](https://react.dev/reference/rsc/server-components), [`'use client'`](https://react.dev/reference/rsc/use-client), and [`'use server'`](https://react.dev/reference/rsc/use-server).

## Server Components by Default

In an RSC architecture, components render on the server ahead of time and emit a serializable UI tree:

- **No client state or effects**: Server Components cannot call `useState`, `useEffect`, or browser DOM APIs.
- **Direct `async / await`**: Server Components can `await` database/action calls directly without shipping library code to the browser.

```tsx
import { getArticleByIdAction } from "@/actions/articles/get-article-by-id.action";
import { LikeButton } from "@/components/articles/like-button";

export async function ArticleView({ articleId }: { articleId: string }) {
  const article = await getArticleByIdAction(articleId);
  if (!article) {
    return <p>The requested article could not be found.</p>;
  }

  return (
    <article>
      <h1>{article.title}</h1>
      <LikeButton articleId={article.id} initialLikes={article.likes} />
    </article>
  );
}
```

## The Boundary Is on the Module Graph, Not the Render Tree

`'use client'` placed at the top of a file marks that **module and all of its static imports** as client code.

### Two Key Architectural Rules

1. **Props crossing into a Client Component must be serializable** (primitives, plain objects, arrays, `ReactNode`, or `'use server'` functions). Class instances, closures, and `Date`/`Map` instances (unless supported by the framework serializer) cannot cross as props.
2. **Client Components can render Server Components passed as `children` (Slot pattern).** Passing a Server Component via `children` keeps the server subtree on the server without pulling its dependencies into the client bundle:

```tsx
"use client";

import { useState, type ReactNode } from "react";

export function CollapsiblePanel({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  return (
    <section>
      <button type="button" onClick={() => setIsOpen((prev) => !prev)}>
        {title}
      </button>
      {isOpen && <div>{children}</div>}
    </section>
  );
}
```

## `'use server'` — Server Functions & Valibot Validation

`'use server'` marks a function as callable from the client but executed on the server. Treat every `'use server'` function as an **untrusted public HTTP endpoint**:

1. **Always validate inputs with Valibot** (`* as v from "valibot"`). Never use Zod.
2. **Always authenticate and authorize** the caller inside the function before mutating state.

```tsx
"use server";

import * as v from "valibot";
import { requireSessionUser } from "@/actions/auth/require-session-user.action";
import { createCommentAction } from "@/actions/comments/create-comment.action";

const publishCommentSchema = v.object({
  text: v.pipe(
    v.string("Please enter a comment."),
    v.trim(),
    v.minLength(2, "Your comment must be at least 2 characters long.")
  ),
});

export async function publishCommentServerFn(formData: FormData) {
  const parsed = v.safeParse(publishCommentSchema, {
    text: formData.get("text"),
  });

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.issues[0].message,
    };
  }

  const user = await requireSessionUser();
  await createCommentAction({ userId: user.id, text: parsed.output.text });

  return {
    success: true,
    message: "Your comment has been published successfully.",
  };
}
```

## Version Pinning in RSC Projects

RSC relies on bundler-facing internals that are not semver-stable across minor/patch skews. Pin exact matching versions of `react` and `react-dom` in `package.json`:

```json
{
  "dependencies": {
    "react": "19.2.0",
    "react-dom": "19.2.0"
  }
}
```

## Anti-Patterns

| Anti-pattern | Why it is wrong | Fix |
|---|---|---|
| Calling `useState`/`useEffect` in a Server Component | Server Components do not execute on the client | Extract interactive leaf into a `'use client'` component |
| Importing server-only modules into a `'use client'` file | Pulls server code into the client bundle or fails build | Pass server data via serializable props or `children` slots |
| Trusting `'use server'` arguments without validation | Client payloads can be forged like any HTTP POST | Validate with Valibot (`v.safeParse`) and verify auth inside the function |
| Using caret ranges (`^19.0.0`) with RSC bundlers | Version skew between `react` and `react-dom` breaks RSC wiring | Pin exact matching versions |
