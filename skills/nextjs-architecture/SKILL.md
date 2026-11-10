---
name: nextjs-architecture
description: Standardized Next.js & Vinext (Cloudflare) architecture: 100% server pages, initial data fetching via Server Actions, client components restricted to interactive logic, loading.tsx skeletons, URL searchParams state, cookie auth, and GroovePack pipeline (apiToast -> Action -> apiAction -> apiClient). TRIGGER when the project uses Next.js, Vinext, or app router (src/app/), or when creating Next.js pages, actions, or client components.
---

# Next.js & Vinext Server Architecture (`nextjs-architecture`)

Standardized architecture for enterprise Next.js and Vinext applications. Enforces 100% Server Pages, initial data loading via Server Actions, interactive logic restricted to client leaf hooks, atomic page co-location, and strict GroovePack integration.

---

## 1. Golden Architectural Rules (Non-negotiable)

1. **Exclusive Scope for Next.js & Vinext (No React SPA Overlap)**:
   - This skill applies **strictly to Next.js or Vinext** applications (`src/app/`).
   - For pure React SPAs (Vite, CRA, SPA without Next.js), use **`react-create-page`**.
2. **Cloudflare Environment = Vinext Mandatory (`vinext` + `@vinext/cloudflare`)**:
   - If deploying or running on Cloudflare Workers, Next.js **must be Vinext** (`pnpm dlx vinext init --platform=cloudflare`).
   - `vinext init --platform=cloudflare` requires `--cdn-cache`, `--data-cache`, and `--image-optimization`. In agent sessions, **always ask the developer their preferred options** before executing initialization.
3. **100% Server Pages (`page.tsx`) & Server-First Hierarchy**:
   - Every `page.tsx` and `layout.tsx` **MUST be a Server Component** (`async function`). `"use client"` is strictly forbidden in `page.tsx`.
   - **Initial data loading is performed exclusively on the server** in `page.tsx` by directly awaiting the Server Action (`await getProductsAction(...)`). Never load initial data in hooks or `useEffect`.
   - Every component that can be a Server Component must be a Server Component; only interactive leaves use `"use client"` and are rendered as children of `page.tsx`.
4. **Targeted Client Hooks (Interactive Logic Only)**:
   - `page.tsx` **NEVER** uses hooks.
   - Custom hooks (`hooks/use-*.ts`) are reserved exclusively for Client Components (`"use client"`) that require interactive logic: forms (`@formisch/react`), local UI state, button actions (mutations), or URL searchParams updates.
5. **Mandatory GroovePack Flow & Zero Manual GroovePack File Creation**:
   - **NEVER create or write files manually** for `api-client`, `api-action`, `api-toast`, or `logger`. GroovePack updates centrally. If missing, **instruct the developer to install them via GroovePack** (`https://github.com/3-Lineas/GroovePack` / `npx @3lineas/groovepack`).
   - **Client mutation chain**: `Client Hook ("use client")` ➔ `apiToast` (`@/lib/api-toast`) ➔ `Server Action ("use server")` ➔ `apiAction` (`@/lib/api-action`) ➔ `apiClient` (`@/lib/api-client`) ➔ `Backend`.
   - **Server load chain**: `page.tsx (Server)` ➔ `Server Action ("use server")` ➔ `apiAction` ➔ `apiClient` ➔ `Backend`.
6. **Strict Page Co-location by Class Folder**:
   - All components, hooks, schemas, and types exclusive to a page live inside that page directory (`src/app/<route>/`), separated into class folders:
     - `components/` (Server Components by default; Client Components only when reactive).
     - `hooks/` (Client custom hooks with interactive logic).
     - `schemas/` (Page-specific Valibot schemas, 1 per file).
     - `types/` (Page-specific TypeScript types, 1 per file).
   - Global shared contracts live in `@/types/{domain}/` and `@/schemas/{domain}/`.
7. **Single `loading.tsx` (Real Static Components + Dynamic `<Skeleton />`)**:
   - Each page has **exactly one `loading.tsx`** containing all real static components (headers, images, static layout wrappers) and uses Shadcn UI `<Skeleton />` **only for the dynamic content block**.
8. **URL Query State (`searchParams`) for Search & Pagination**:
   - Search queries and pagination state live in the URL query string. `page.tsx` reads `searchParams` and passes them to the data-fetching Server Action.
   - Client components synchronize URL params via `useRouter` and `useSearchParams`. Never abuse the URL for ephemeral UI state (modals, dropdown toggles).
9. **Server-Side Cookie Authentication by Default**:
   - Unless explicitly specified otherwise, authentication uses `httpOnly` cookies accessed server-side via `cookies()` from `next/headers`.

---

## 2. Directory Taxonomy & Data Flow

```text
src/
├── actions/                         # Server Actions ("use server") grouped by domain
│   └── products/
│       ├── get-products.action.ts   # Called directly by page.tsx (Server)
│       └── create-product.action.ts # Called by apiToast from use-create-product hook
└── app/
    └── products/
        ├── components/              # Page components (Server by default, Client if reactive)
        │   ├── products-header.tsx  # Server: real static header (shared with loading.tsx)
        │   ├── products-table.tsx   # Server: renders initial data passed from page.tsx
        │   ├── products-search.tsx  # Client ("use client"): URL query input coordinator
        │   └── create-product-form.tsx # Client ("use client"): form with hook
        ├── hooks/                   # Client hooks (only for interactive logic)
        │   ├── use-create-product.ts# Handles form state + apiToast(createProductAction)
        │   └── use-products-search.ts # Handles debounced URL searchParams sync
        ├── schemas/                 # Page-specific Valibot schemas (1 per file)
        │   └── create-product.schema.ts
        ├── types/                   # Page-specific types (1 per file)
        │   └── product-item.type.ts
        ├── loading.tsx              # 1 single file: real static components + <Skeleton />
        └── page.tsx                 # 100% Server Component: reads searchParams & awaits action
```

---

## 3. Communication Architecture Diagram

```text
[ Server Page: page.tsx ]
       │ (1. Await initial load)
       ▼
[ Server Action: get-products.action.ts ] ──► [ apiAction ] ──► [ apiClient + Cookies ] ──► [ Backend ]
       ▲
       │ (2. Trigger mutation via apiToast)
[ Client Hook: use-create-product.ts ] ──► [ apiToast ]
```

---

## 4. Anti-Patterns to Avoid

| Anti-Pattern | Why It Fails | Correct Pattern |
| :--- | :--- | :--- |
| `"use client"` on `page.tsx` | Eliminates SSR/RSC benefits, bundles heavy client JS | Keep `page.tsx` 100% Server; extract client leaves to `components/` |
| Initial data loading inside hooks or `useEffect` | Causes waterfall, layout shifts, SEO loss | Await Server Action directly in `page.tsx` |
| Writing manual `api-client` / `api-toast` files | Breaks sync with centralized GroovePack updates | Request user to install GroovePack: `npx @3lineas/groovepack` |
| Full-page skeleton in `loading.tsx` | Destroys perceived performance, layout flickers | Render real static headers/containers; skeleton only dynamic data |
| Client-side token storage in `localStorage` | Vulnerable to XSS token theft | Use server-side `httpOnly` cookies via `cookies()` |
| Using `react-create-page` in Next.js/Vinext | Forces client-side coordinator hooks onto Next.js | Use `nextjs-architecture` for Next/Vinext; `react-create-page` for pure React |

---

## 5. Reference Documentation

- [GroovePack Actions, Toast & Cookie Auth](./references/groovepack-actions-and-auth.md)
- [Server Pages, Loading Skeleton & URL State](./references/server-pages-loading-and-url-state.md)
- [Vinext Deployment & Configuration for Cloudflare](./references/vinext-cloudflare.md)
