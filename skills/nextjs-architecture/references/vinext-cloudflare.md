# Vinext on Cloudflare Workers Architecture

Standardized guide for building and deploying Next.js applications to Cloudflare Workers using **Vinext** (`https://vinext.dev`).

---

## 1. When to Use Vinext

Vinext is mandatory whenever a Next.js App Router project is deployed to or runs on Cloudflare Workers. It replaces the default webpack/turbopack bundler with Vite, compiling standard Next.js App Router code into high-performance Cloudflare Worker entrypoints.

---

## 2. Interactive Setup Protocol (Zero Blind CLI Execution)

When initializing a new Vinext project or adding the Cloudflare platform adapter:

```bash
# New project
pnpm create vinext-app@latest

# Existing project initialization
pnpm dlx vinext init --platform=cloudflare
```

> [!WARNING]
> **Mandatory Developer Confirmation Gate**
> `vinext init --platform=cloudflare` requires specifying cache and optimization flags. The agent **MUST NEVER execute this command autonomously**. Always ask the developer to choose among:
> 1. `--cdn-cache`: Caches SSR HTML and static assets on Cloudflare global edge CDN.
> 2. `--data-cache`: Cloudflare KV-backed persistent fetch cache for `fetch(..., { next: { revalidate } })`.
> 3. `--image-optimization`: Cloudflare Images transform pipeline for `next/image`.

---

## 3. Configuration Blueprints

### A. `vite.config.ts`
```ts
import { defineConfig } from "vite";
import vinext from "vinext";
import { groovepack } from "@3lineas/groovepack/vite";

export default defineConfig({
  plugins: [vinext(), groovepack()],
  resolve: {
    alias: {
      "@": "/src",
    },
  },
});
```

### B. `cloudflare.config.ts`
```ts
import { defineConfig } from "@vinext/cloudflare";

export default defineConfig({
  entrypoint: "vinext/server/fetch-handler",
  compatibilityFlags: ["nodejs_compat"],
  runWorkerFirst: true,
  routes: [
    { pattern: "/_next/static/*", zone: "assets" },
    { pattern: "/favicon.ico", zone: "assets" },
    { pattern: "/*", zone: "worker" },
  ],
});
```

### C. `tsconfig.json` (Include Cloudflare Runtime Types)
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["DOM", "DOM.Iterable", "ES2022"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "types": [".cloudflare/types"]
  },
  "include": ["src", ".cloudflare/types/**/*.d.ts"]
}
```

---

## 4. Shared API Client (`src/lib/api-client.ts`) with Service Bindings

In Vinext on Cloudflare Workers, configure `src/lib/api-client.ts` using `createHonoClient` (or `createApiClient`) with `serviceBinding`, `fallbackBaseUrl`, and `getHeaders`. This resolves `env[serviceBinding]?.fetch` via `cloudflare:workers` in production and falls back to `fallbackBaseUrl` locally:

```ts
// src/lib/api-client.ts
import { createHonoClient } from "@3lineas/groovepack/api-client";
import type { AppType } from "@repo/api/routes";
import { verifySession } from "@/lib/session/verify-session";

export const apiClient = createHonoClient<AppType>({
  baseUrl: "http://api.local/api",
  serviceBinding: "API",
  fallbackBaseUrl: process.env.API_URL ?? "http://127.0.0.1:8787",
  getHeaders: async () => {
    const session = await verifySession();
    return session.isAuth && session.userId
      ? { "x-user-id": session.userId, "x-user-role": session.role ?? "user" }
      : {};
  },
});
```

---

## 5. Accessing Cloudflare Context & Data Bindings

In Server Actions and Server Components, access Cloudflare data bindings (KV, D1, R2, Environment secrets) through the Vinext context helper. For HTTP calls to other Workers via Service Binding, always use `serviceBinding` + `fallbackBaseUrl` in `createApiClient` / `createHonoClient` instead of `getCloudflareContext()`:

```ts
// src/actions/system/get-kv-value.action.ts
"use server";

import { getCloudflareContext } from "@vinext/cloudflare";
import { apiAction, type ActionResponse } from "@3lineas/groovepack/api-action";

export async function getKvValueAction(key: string): Promise<ActionResponse<string | null>> {
  return apiAction<string | null>({
    apiCall: async () => {
      const { env } = getCloudflareContext();
      return env.CONFIG_KV.get(key);
    },
  });
}
```

---

## 6. Development & Deployment Commands

```bash
# Local development with Cloudflare Worker runtime simulation
pnpm dev

# Build for Cloudflare production
pnpm build

# Deploy directly via Wrangler
pnpm wrangler deploy
```
