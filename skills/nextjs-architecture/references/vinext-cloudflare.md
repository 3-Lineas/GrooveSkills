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

export default defineConfig({
  plugins: [vinext()],
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

## 4. Accessing Cloudflare Context & Bindings

In Server Actions and Server Components, access Cloudflare platform bindings (KV, D1, R2, Environment secrets) through the Vinext context helper:

```ts
// src/actions/system/get-kv-value.action.ts
"use server";

import { getCloudflareContext } from "@vinext/cloudflare";
import { apiAction } from "@/lib/api-action";
import type { ActionResponse } from "@/types/common/action-response.type";

export async function getKvValueAction(key: string): Promise<ActionResponse<string | null>> {
  return apiAction(async () => {
    const { env } = getCloudflareContext();
    const value = await env.CONFIG_KV.get(key);
    return value;
  });
}
```

---

## 5. Development & Deployment Commands

```bash
# Local development with Cloudflare Worker runtime simulation
pnpm dev

# Build for Cloudflare production
pnpm build

# Deploy directly via Wrangler
pnpm wrangler deploy
```
