---
name: groovepack-api
description: Typed HTTP clients, 3-mode apiAction (ActionResponse, fallback, throwOnError), apiToast (Shadcn Base UI), i18n, and Vite plugin from @3lineas/groovepack. TRIGGER when calling APIs, writing Server Actions or React mutation hooks, showing API toasts, or configuring groovepack env/vite.
---

# GroovePack API Client, Action & Toast (`@3lineas/groovepack`)

Unified client/server API pipeline: `createApiClient` / `createHonoClient`, `apiAction`, `apiToast`, `i18n`, and `vite`.

## 1. HTTP Clients (`@3lineas/groovepack/api-client`)

- `createApiClient(config)` returns a `RestApiClient` whose `.get()`, `.post()`, `.put()`, `.patch()`, and `.delete()` methods return `Promise<Response>` (**do NOT pass type generics to these methods**—parse `await response.json()`).
- `createHonoClient<AppType>(config)` receives a single `ApiClientConfig` object (never `(baseUrl, options)`) and returns a typed Hono RPC client.
- **`ApiClientConfig` key options**:
  - `baseUrl`: Base URL for requests (e.g., `"http://api.local/api"` when using a Service Binding, or `process.env.API_URL`).
  - `getHeaders?: () => Record<string, string> | Promise<Record<string, string>>`: Resolved per request after `defaultHeaders` and before `init.headers` (ideal for propagating session/auth headers).
  - `serviceBinding?: string`: Cloudflare Worker Service Binding name (dynamically resolves `env[serviceBinding]?.fetch` via `cloudflare:workers` without breaking Vite, Next.js, or browser builds).
  - `fallbackBaseUrl?: string`: Automatic fallback to `fetch(fallbackBaseUrl + pathname + search, init)` when running locally outside Cloudflare Workers.

```typescript
import { createHonoClient } from "@3lineas/groovepack/api-client";
import type { AppType } from "@repo/api/routes";

export const apiClient = createHonoClient<AppType>({
  baseUrl: "http://api.local/api",
  serviceBinding: "API",
  fallbackBaseUrl: process.env.API_URL ?? "http://127.0.0.1:8787",
  getHeaders: async () => {
    const token = await getSessionToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  },
});
```

## 2. `apiAction` — 3 Execution Modes (`@3lineas/groovepack/api-action`)

`apiCall` accepts `ApiCallInput<T>`: either a factory `() => Promise<ApiCallResult<T>>` **or** a direct `Promise<ApiCallResult<T>>`. Always pair `apiAction` with `createAppError` factories from `@3lineas/groovepack/errors` in `onError`:

1. **Default (`ActionResponse<T>`)** — Ideal for mutations consumed by `apiToast` or form handlers:
   ```typescript
   const result = await apiAction<User>({
     apiCall: () => backendClient.post("/users", payload).then((r) => r.json()),
     defaultErrorMessage: "Could not create user.",
     onError: userConflictError,
   });
   // result: ActionResponse<User> ({ success: true, data } | { success: false, error, code })
   ```
2. **Fallback (`Promise<T>`)** — Ideal for Server Components (`page.tsx`) that need a safe default on failure (accepts a direct `Promise`):
   ```typescript
   const users = await apiAction<User[]>({
     apiCall: backendClient.get("/users"),
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
