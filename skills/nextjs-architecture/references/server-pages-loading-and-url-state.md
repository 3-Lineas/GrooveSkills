# Server Pages, Loading Skeletons & URL State

Architectural blueprint for Server Components in Next.js/Vinext, unified `loading.tsx`, and URL query state management.

---

## 1. 100% Server Page (`page.tsx`)

Every `page.tsx` must be a Server Component. It receives `searchParams`, directly calls data-fetching Server Actions, and renders static Server Components alongside reactive Client Component leaves.

```tsx
// src/app/products/page.tsx
import { getProductsAction } from "@/actions/products/get-products.action";
import { ProductsHeader } from "@/app/products/components/products-header";
import { ProductsSearch } from "@/app/products/components/products-search";
import { ProductsTable } from "@/app/products/components/products-table";

interface ProductsPageProps {
  searchParams: Promise<{ query?: string; page?: string }>;
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const resolvedParams = await searchParams;
  const currentQuery = resolvedParams.query ?? "";
  const currentPage = Number(resolvedParams.page ?? "1");

  const response = await getProductsAction(currentQuery);
  const products = response.success && response.data ? response.data : [];

  return (
    <main className="container mx-auto max-w-5xl p-6 space-y-6">
      <ProductsHeader />
      <div className="flex items-center justify-between gap-4">
        <ProductsSearch initialQuery={currentQuery} />
      </div>
      <ProductsTable items={products} currentPage={currentPage} />
    </main>
  );
}
```

---

## 2. Unified `loading.tsx` (Real Static Components + `<Skeleton />`)

Every page must contain a single `loading.tsx` file. Rather than rendering a full-page generic skeleton, it imports the **real static components** (headers, navigation, static search bars) and places Shadcn UI `<Skeleton />` exclusively in dynamic regions.

```tsx
// src/app/products/loading.tsx
import { Skeleton } from "@/components/ui/skeleton";
import { ProductsHeader } from "@/app/products/components/products-header";

export default function ProductsLoading() {
  return (
    <main className="container mx-auto max-w-5xl p-6 space-y-6">
      {/* Real static component: no skeleton needed */}
      <ProductsHeader />

      {/* Real layout skeleton for dynamic controls */}
      <div className="flex items-center justify-between gap-4">
        <Skeleton className="h-10 w-72 rounded-md" />
      </div>

      {/* Dynamic data table skeleton */}
      <div className="space-y-3 rounded-lg border p-4">
        <Skeleton className="h-8 w-full rounded" />
        <Skeleton className="h-12 w-full rounded" />
        <Skeleton className="h-12 w-full rounded" />
        <Skeleton className="h-12 w-full rounded" />
      </div>
    </main>
  );
}
```

---

## 3. Coherent URL State for Search and Pagination

Search terms and page numbers belong in the URL query string (`searchParams`). This enables shareable URLs, bookmarking, and native SSR caching while keeping ephemeral UI state local.

### Client Search Component with URL Synchronization

```tsx
// src/app/products/components/products-search.tsx
"use client";

import { useProductsSearch } from "@/app/products/hooks/use-products-search";
import { Input } from "@/components/ui/input";

interface ProductsSearchProps {
  initialQuery: string;
}

export function ProductsSearch({ initialQuery }: ProductsSearchProps) {
  const { query, setQuery, isPending } = useProductsSearch(initialQuery);

  return (
    <div className="relative w-72">
      <Input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Buscar productos..."
        className={isPending ? "opacity-70" : undefined}
      />
    </div>
  );
}
```

### URL Sync Hook (`hooks/use-products-search.ts`)

```ts
// src/app/products/hooks/use-products-search.ts
"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition, useEffect } from "react";

export function useProductsSearch(initialQuery: string) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(initialQuery);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const timer = setTimeout(() => {
      const nextParams = new URLSearchParams(searchParams.toString());
      if (query.trim()) {
        nextParams.set("query", query.trim());
      } else {
        nextParams.delete("query");
      }
      nextParams.delete("page"); // Reset page on new query

      startTransition(() => {
        router.replace(`${pathname}?${nextParams.toString()}`);
      });
    }, 300);

    return () => clearTimeout(timer);
  }, [query, pathname, router, searchParams]);

  return { query, setQuery, isPending };
}
```
