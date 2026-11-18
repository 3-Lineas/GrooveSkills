# GroovePack Integration, Server Actions & Cookie Auth

Guide for integrating GroovePack packages (`api-client`, `api-action`, `api-toast`) in Next.js and Vinext.

> [!IMPORTANT]
> **Zero Manual Reimplementation of GroovePack Primitives**
> Never write or recreate `api-client`, `api-action`, `api-toast`, `pipeline`, or `logger` by hand. These modules are installed as a `pnpm` package (`https://github.com/3-Lineas/GroovePack`) with subpath exports:
> ```bash
> pnpm add @3lineas/groovepack
> ```
> In **Next.js / Vinext**, configure **only** `NEXT_PUBLIC_GROOVEPACK_LOCALE` (e.g. `"es"` | `"en"` | `"pt"` | `"it"` | `"fr"`, default `"en"`). Set `NEXT_PUBLIC_GROOVEPACK_SHADCN_PATH` **only** if Shadcn UI components do not reside in `/src/components/ui`. Never declare `GROOVEPACK_*` alongside `NEXT_PUBLIC_GROOVEPACK_*`.

---

## 1. Architecture Flow

```text
[ Client Hook: useCreateProduct ]
         │
         ▼
[ apiToast (@3lineas/groovepack/api-toast) ]
         │
         ▼
[ Server Action: createProductAction ("use server") ]
         │
         ▼
[ apiAction (@3lineas/groovepack/api-action) ]
         │
         ▼
[ createApiClient / createHonoClient (@3lineas/groovepack/api-client) + Server Cookies ]
         │
         ▼
[ Backend API / Cloudflare Worker ]
```

---

## 2. Shared API Client (`src/lib/api-client.ts`) & Server Actions (`src/actions/`)

Configure a single shared client in `src/lib/api-client.ts` using `createHonoClient` or `createApiClient` with `baseUrl`, `serviceBinding`, `fallbackBaseUrl`, and async `getHeaders` for session/auth propagation:

```ts
// src/lib/api-client.ts
import { cookies } from "next/headers";
import { createApiClient } from "@3lineas/groovepack/api-client";

export const apiClient = createApiClient({
  baseUrl: "http://api.local/api",
  serviceBinding: "API",
  fallbackBaseUrl: process.env.API_URL ?? "http://127.0.0.1:8787",
  getHeaders: async () => {
    const token = (await cookies()).get("session_token")?.value;
    return token ? { Authorization: `Bearer ${token}` } : {};
  },
});
```

Server Actions must reside in `src/actions/<domain>/<action-name>.action.ts` with the `"use server"` directive at the top. `apiAction` accepts either a factory `() => Promise<...>` or a direct `Promise<...>` in `apiCall`:

```ts
// src/actions/products/get-products.action.ts
"use server";

import { apiAction, type ActionResponse } from "@3lineas/groovepack/api-action";
import { logger } from "@3lineas/groovepack/logger";
import { apiClient } from "@/lib/api-client";
import type { ProductItem } from "@/app/products/types/product-item.type";

export async function getProductsAction(query?: string): Promise<ActionResponse<ProductItem[]>> {
  const search = query ? `?query=${encodeURIComponent(query)}` : "";
  return apiAction<ProductItem[]>({
    apiCall: apiClient.get(`/products${search}`),
    onError: (message, context) => logger.error(message, context),
  });
}
```

### Mutation Action with Cookie Management

```ts
// src/actions/auth/login.action.ts
"use server";

import { cookies } from "next/headers";
import { apiAction, type ActionResponse } from "@3lineas/groovepack/api-action";
import { logger } from "@3lineas/groovepack/logger";
import { apiClient } from "@/lib/api-client";
import type { LoginInput } from "@/types/auth/login-input.type";
import type { AuthSession } from "@/types/auth/auth-session.type";

export async function loginAction(credentials: LoginInput): Promise<ActionResponse<AuthSession>> {
  return apiAction<AuthSession>({
    apiCall: async () => {
      const response = await apiClient.post("/auth/login", credentials);
      const session = (await response.json()) as AuthSession;
      const { token, maxAgeSeconds } = session;

      const cookieStore = await cookies();
      cookieStore.set("session_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: maxAgeSeconds,
      });

      return session;
    },
    onError: (message, context) => logger.error(message, context),
  });
}
```

---

## 3. Client Hook Invocations with `apiToast`

In Next.js, hooks are used **only** inside Client Components (`"use client"`) that require interactive logic (forms, button actions, UI state).

```ts
// src/app/products/hooks/use-create-product.ts
"use client";

import { useForm } from "@formisch/react";
import { useRouter } from "next/navigation";
import { apiToast } from "@3lineas/groovepack/api-toast";
import { createProductAction } from "@/actions/products/create-product.action";
import { createProductSchema } from "@/app/products/schemas/create-product.schema";
import type { CreateProductInput } from "@/app/products/types/create-product-input.type";

interface UseCreateProductOptions {
  onSuccess?: () => void;
}

export function useCreateProduct(options?: UseCreateProductOptions) {
  const router = useRouter();

  const [form, dispatch] = useForm({
    schema: createProductSchema,
    onSubmit: async (values: CreateProductInput) => {
      await apiToast({
        action: () => createProductAction(values),
        loadingMessage: "Guardando producto...",
        successMessage: "Producto registrado exitosamente.",
        errorMessage: "No se pudo guardar el producto.",
        onSuccess: () => {
          router.refresh();
          options?.onSuccess?.();
        },
      });
    },
  });

  return { form, dispatch };
}
```

---

## 4. Key Rules Summary

1. **Client Hook**: Handles interactive state; wraps the Server Action invocation in `apiToast`.
2. **`apiToast`**: Manages toast promises and error notification display automatically.
3. **Server Action**: Encapsulates server-only logic, secret keys, and cookie storage; delegates network requests to `apiAction`.
4. **`apiAction` (3 Modes)**:
   - **Default (`ActionResponse<T>`)**: Returns `{ success, data } | { success, error, code }` — ideal for mutations consumed by `apiToast`.
   - **Fallback (`fallback: T`)**: Returns `Promise<T>` directly — ideal for Server Components (`page.tsx`) needing a safe default on failure.
   - **Strict Throw (`throwOnError: true`)**: Throws the `Error` returned by `onError` (e.g. a `createAppError` factory from `@3lineas/groovepack/errors`) or `AppError` `"API_ACTION_FAILED"` — ideal for Error Boundaries (`error.tsx`).
5. **`apiClient`**: Standard HTTP client preconfigured in `src/lib/api-client.ts` with `baseUrl`, `serviceBinding`, `fallbackBaseUrl`, and async `getHeaders` for session/auth propagation.
