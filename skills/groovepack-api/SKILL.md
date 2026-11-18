---
name: groovepack-api
description: Typed HTTP clients, 3-mode apiAction (ActionResponse, fallback, throwOnError), apiToast (Shadcn Base UI), i18n, and Vite plugin from @3lineas/groovepack. TRIGGER when calling APIs, writing Server Actions or React mutation hooks, showing API toasts, or configuring groovepack env/vite.
---

# GroovePack API Client, Action & Toast (`@3lineas/groovepack`)

Unified client/server API pipeline: `createApiClient` / `createHonoClient`, `apiAction`, `apiToast`, `i18n`, and `vite`.

## 1. HTTP Clients (`@3lineas/groovepack/api-client`)

- `createApiClient(options)` returns a `RestApiClient` whose `.get()`, `.post()`, `.put()`, `.patch()`, and `.delete()` methods return `Promise<Response>` (**do NOT pass type generics to these methods**—parse `await response.json()`).
- `createHonoClient<AppType>(baseUrl, options)` returns a typed Hono RPC client.

```typescript
import { createApiClient } from "@3lineas/groovepack/api-client";

export const backendClient = createApiClient({
  baseUrl: process.env.API_URL ?? "",
});

const response = await backendClient.post("/auth/login", credentials);
const data = (await response.json()) as LoginResponse;
```

## 2. `apiAction` — 3 Execution Modes (`@3lineas/groovepack/api-action`)

Always pair `apiAction` with `createAppError` factories from `@3lineas/groovepack/errors` in `onError`:

1. **Default (`ActionResponse<T>`)** — Ideal for mutations consumed by `apiToast` or form handlers:
   ```typescript
   const result = await apiAction<User>({
     apiCall: () => backendClient.post("/users", payload).then((r) => r.json()),
     defaultErrorMessage: "Could not create user.",
     onError: userConflictError,
   });
   // result: ActionResponse<User> ({ success: true, data } | { success: false, error, code })
   ```
2. **Fallback (`Promise<T>`)** — Ideal for Server Components (`page.tsx`) that need a safe default on failure:
   ```typescript
   const users = await apiAction<User[]>({
     apiCall: () => backendClient.get("/users").then((r) => r.json()),
     fallback: [],
   });
   ```
3. **Strict Throw (`throwOnError: true`)** — Ideal for Error Boundaries (`error.tsx`) or callers that handle thrown `AppError`:
   ```typescript
   const profile = await apiAction<User>({
     apiCall: () => backendClient.get("/me").then((r) => r.json()),
     throwOnError: true,
     defaultErrorMessage: "Failed to load profile.",
     onError: unauthorizedError,
   });
   ```

## 3. `apiToast` (`@3lineas/groovepack/api-toast`)

Uses Shadcn Toast (`@base-ui/react/toast`) automatically—**never** use `sonner` or `toast.promise`.

```typescript
import { apiToast } from "@3lineas/groovepack/api-toast";

const response = await apiToast(createUserAction(payload), {
  loading: "Creating user...",
  success: "User created successfully.",
});
```

## 4. Environment Variables & Vite Plugin

Use **only one runtime env var convention** per project:
- **Next.js / Vinext**: `NEXT_PUBLIC_GROOVEPACK_LOCALE` and `NEXT_PUBLIC_GROOVEPACK_SHADCN_PATH`
- **Vite / Node / Workers**: `GROOVEPACK_LOCALE` and `GROOVEPACK_SHADCN_PATH`, plus register `groovepack()` from `@3lineas/groovepack/vite` in `vite.config.ts`.
