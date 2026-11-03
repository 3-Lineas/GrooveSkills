# Implementation Reference: Cache & Rate Limiting Adapters

Production implementations of Redis cache, Cloudflare KV, and sliding-window rate limiters.

---

## 1. Redis Cache Adapter (`ioredis`)

```ts
// src/infrastructure/adapters/cache/redis-cache.adapter.ts
import type { Redis } from "ioredis";
import type { CacheStorePort } from "@/domains/cache/cache-store.port";

export class RedisCacheAdapter implements CacheStorePort {
  constructor(private redis: Redis) {}

  async get<T>(key: string): Promise<T | null> {
    const raw = await this.redis.get(key);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  }

  async set<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
    await this.redis.set(key, JSON.stringify(value), "EX", ttlSeconds);
  }

  async delete(key: string): Promise<void> {
    await this.redis.del(key);
  }
}
```

---

## 2. Cloudflare Workers KV Cache Adapter

```ts
// src/infrastructure/adapters/cache/cloudflare-kv.adapter.ts
import type { CacheStorePort } from "@/domains/cache/cache-store.port";

export class CloudflareKvAdapter implements CacheStorePort {
  constructor(private kv: KVNamespace) {}

  async get<T>(key: string): Promise<T | null> {
    return this.kv.get<T>(key, "json");
  }

  async set<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
    await this.kv.put(key, JSON.stringify(value), { expirationTtl: Math.max(ttlSeconds, 60) });
  }

  async delete(key: string): Promise<void> {
    await this.kv.delete(key);
  }
}
```

---

## 3. Redis Sliding Window Rate Limiter Adapter

```ts
// src/infrastructure/adapters/rate-limit/redis-rate-limiter.adapter.ts
import type { Redis } from "ioredis";
import type { RateLimiterPort, RateLimitResult } from "@/domains/rate-limit/rate-limiter.port";

export class RedisSlidingWindowRateLimiter implements RateLimiterPort {
  constructor(
    private redis: Redis,
    private maxRequests: number = 60,
    private windowSeconds: number = 60
  ) {}

  async limit(identifier: string): Promise<RateLimitResult> {
    const now = Date.now();
    const windowStart = now - this.windowSeconds * 1000;
    const key = `ratelimit:${identifier}`;

    const multi = this.redis.multi();
    multi.zremrangebyscore(key, 0, windowStart);
    multi.zadd(key, now, `${now}-${Math.random()}`);
    multi.zcard(key);
    multi.expire(key, this.windowSeconds);

    const results = await multi.exec();
    const count = (results?.[2]?.[1] as number) ?? 1;

    const remaining = Math.max(0, this.maxRequests - count);
    const success = count <= this.maxRequests;

    return { success, limit: this.maxRequests, remaining, resetSeconds: this.windowSeconds };
  }
}
```

---

## 4. In-Memory Testing Cache Adapter

```ts
// src/infrastructure/adapters/cache/memory-cache.adapter.ts
import type { CacheStorePort } from "@/domains/cache/cache-store.port";

export class MemoryCacheAdapter implements CacheStorePort {
  private store = new Map<string, { value: unknown; expiresAt: number }>();

  async get<T>(key: string): Promise<T | null> {
    const item = this.store.get(key);
    if (!item) return null;
    if (Date.now() > item.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return item.value as T;
  }

  async set<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
    this.store.set(key, { value, expiresAt: Date.now() + ttlSeconds * 1000 });
  }

  async delete(key: string): Promise<void> {
    this.store.delete(key);
  }
}
```
