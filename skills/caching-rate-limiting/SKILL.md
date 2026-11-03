---
name: caching-rate-limiting
description: Architectural standards for Cache-Aside wrappers (cache.remember pattern) and interchangeable Rate Limiter adapters (Redis, Cloudflare KV, In-Memory). Prevents leaking vendor cache drivers into business logic and guarantees clean sliding-window or token-bucket rate limiting. TRIGGER when optimizing database query performance, adding cache layers, implementing API throttling, DDoS prevention, or per-user rate limiting.
---

# Cache-Aside Wrapper & Rate Limiter Adapters

Opinionated architectural pattern for performance caching via the **Cache-Aside (`cache.remember`)** wrapper and decoupled **Rate Limiter** adapters.

---

## 1. Core Architectural Concepts

1. **Cache-Aside Pattern (`cache.remember`)**:
   - Instead of manual `get`, check null, query DB, and `set`, actions call `cache.remember(key, ttl, fetcher)`.
   - Caching logic stays declarative, resilient, and decoupled from underlying stores.
2. **Interchangeable Rate Limiting Port**:
   - Throttling (sliding window / token bucket) is encapsulated behind `RateLimiterPort`.
   - HTTP route middleware and actions check permissions without knowing whether Redis, Cloudflare KV, or an In-Memory store enforces limits.

---

## 2. Directory Layout

```text
src/
├── domains/
│   ├── cache/
│   │   ├── cache-store.port.ts             # Raw key-value cache contract (<40 lines)
│   │   └── cache.wrapper.ts                # Cache-aside remember helper (<60 lines)
│   └── rate-limit/
│       └── rate-limiter.port.ts            # Rate limiting contract (<40 lines)
└── infrastructure/
    └── adapters/
        ├── cache/
        │   ├── redis-cache.adapter.ts      # Redis cache implementation (<70 lines)
        │   ├── cloudflare-kv.adapter.ts    # Cloudflare KV cache (<70 lines)
        │   └── memory-cache.adapter.ts     # In-memory testing cache (<60 lines)
        └── rate-limit/
            ├── redis-rate-limiter.adapter.ts # Redis sliding window (<80 lines)
            └── memory-rate-limiter.adapter.ts # In-memory rate limiter (<60 lines)
```

---

## 3. Cache-Aside Wrapper (`src/domains/cache/cache.wrapper.ts`)

```ts
import type { CacheStorePort } from "./cache-store.port";

export class CacheWrapper {
  constructor(private store: CacheStorePort) {}

  async remember<T>(key: string, ttlSeconds: number, fetcher: () => Promise<T>): Promise<T> {
    const cached = await this.store.get<T>(key);
    if (cached !== null && cached !== undefined) {
      return cached;
    }

    const fresh = await fetcher();
    await this.store.set(key, fresh, ttlSeconds);
    return fresh;
  }

  async forget(key: string): Promise<void> {
    await this.store.delete(key);
  }
}
```

---

## 4. Rate Limiter Port & Enforcement

```ts
// src/domains/rate-limit/rate-limiter.port.ts
export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  resetSeconds: number;
}

export interface RateLimiterPort {
  limit(identifier: string): Promise<RateLimitResult>;
}
```

### Rate Limiter Middleware Example
```ts
export async function rateLimitMiddleware(c: Context, limiter: RateLimiterPort) {
  const ip = c.req.header("cf-connecting-ip") ?? c.req.header("x-forwarded-for") ?? "anonymous";
  const check = await limiter.limit(`ip:${ip}`);

  c.header("X-RateLimit-Limit", String(check.limit));
  c.header("X-RateLimit-Remaining", String(check.remaining));

  if (!check.success) {
    throw new AppError({ message: "Has excedido el límite de solicitudes. Intenta más tarde.", statusCode: 429 });
  }
}
```

---

## 5. Detailed Adapters Reference

For real implementations of Redis cache, Cloudflare KV, and Redis sliding-window rate limiters, consult:
- `references/cache-rate-limit-examples.md`
