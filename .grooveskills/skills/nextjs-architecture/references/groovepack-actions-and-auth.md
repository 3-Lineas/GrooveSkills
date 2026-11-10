# GroovePack Integration, Server Actions & Cookie Auth

Guide for integrating GroovePack packages (`api-client`, `api-action`, `api-toast`) in Next.js and Vinext.

> [!IMPORTANT]
> **Zero Manual File Creation for GroovePack Packages**
> Never write or recreate `@/lib/api-client`, `@/lib/api-action`, `@/lib/api-toast`, or `@/lib/logger` by hand. These modules are continuously maintained in the GroovePack registry (`https://github.com/3-Lineas/GroovePack`). If missing in the project, stop and ask the developer to install them:
> ```bash
> npx @3lineas/groovepack add api-client api-action api-toast logger
> ```

---

## 1. Architecture Flow

```text
[ Client Hook: useCreateProduct ]
         │
         ▼
[ apiToast (@/lib/api-toast) ]
         │
         ▼
[ Server Action: createProductAction ("use server") ]
         │
         ▼
[ apiAction (@/lib/api-action) ]
         │
         ▼
[ apiClient (@/lib/api-client) + Server Cookies ]
         │
         ▼
[ Backend API / Cloudflare Worker ]
```

---

## 2. Server Action Implementation (`src/actions/`)

Server Actions must reside in `src/actions/<domain>/<action-name>.action.ts` with the `"use server"` directive at the top.

```ts
// src/actions/products/get-products.action.ts
"use server";

import { cookies } from "next/headers";
import { apiAction } from "@/lib/api-action";
import { apiClient } from "@/lib/api-client";
import type { ProductItem } from "@/app/products/types/product-item.type";
import type { ActionResponse } from "@/types/common/action-response.type";

export async function getProductsAction(query?: string): Promise<ActionResponse<ProductItem[]>> {
  return apiAction(async () => {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("session_token")?.value;

    const response = await apiClient.get<ProductItem[]>("/products", {
      headers: sessionToken ? { Authorization: `Bearer ${sessionToken}` } : {},
      params: query ? { query } : undefined,
    });

    return response.data;
  });
}
```

### Mutation Action with Cookie Management

```ts
// src/actions/auth/login.action.ts
"use server";

import { cookies } from "next/headers";
import { apiAction } from "@/lib/api-action";
import { apiClient } from "@/lib/api-client";
import type { LoginInput } from "@/types/auth/login-input.type";
import type { AuthSession } from "@/types/auth/auth-session.type";
import type { ActionResponse } from "@/types/common/action-response.type";

export async function loginAction(credentials: LoginInput): Promise<ActionResponse<AuthSession>> {
  return apiAction(async () => {
    const response = await apiClient.post<AuthSession>("/auth/login", credentials);
    const { token, maxAgeSeconds } = response.data;

    const cookieStore = await cookies();
    cookieStore.set("session_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: maxAgeSeconds,
    });

    return response.data;
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
import { apiToast } from "@/lib/api-toast";
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
      await apiToast(createProductAction(values), {
        loading: "Guardando producto...",
        success: "Producto registrado exitosamente.",
        error: "No se pudo guardar el producto.",
      });

      router.refresh();
      options?.onSuccess?.();
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
4. **`apiAction`**: Normalizes exceptions, formats structured `ActionResponse<T>`, and handles status codes.
5. **`apiClient`**: Standard HTTP client preconfigured with baseUrl, timeouts, and auth headers.
