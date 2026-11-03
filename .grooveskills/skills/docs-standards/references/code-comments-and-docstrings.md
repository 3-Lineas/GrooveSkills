# In-Code Comments and Docstrings Standard

Guidelines for writing intent-focused, maintainable code comments and docstrings in TypeScript, Python, and Rust.

---

## 1. Golden Philosophy: Document the "Why", Not the "What"

Comments must justify non-obvious engineering decisions, document invariants, and highlight failure modes. They must never repeat what the code already says.

### Anti-Patterns to Avoid

```ts
// ❌ WRONG: Useless repetition of obvious code
// Increment counter by one
counter += 1;

// ❌ WRONG: Commented-out dead code (delete it; git keeps history)
// const oldRate = fetchV1Rate(currency);
// return oldRate * 1.05;

// ❌ WRONG: Speculative "maybe one day" comments
// TODO: Maybe we can convert this to a microservice in 2028 if needed
```

### Clean Patterns to Adopt

```ts
// ✅ CORRECT: Explains the underlying constraint / rationale
// Stripe requires idempotency keys to expire within 24 hours. We pin the key
// to the daily order UUID to avoid duplicate authorization calls on network retry.
const idempotencyKey = `ord_${order.id}_${txDate}`;

// ✅ CORRECT: Documents intentional performance trade-off
// Using a bitmask instead of Set<string> here because this validation executes
// inside the hot per-packet loop processing ~100k records/second.
const permissionsMask = roleFlags & REQUIRED_FLAGS;
```

---

## 2. TypeScript / JavaScript (TSDoc & JSDoc)

Use standard TSDoc for public module APIs, interfaces, and actions. Keep types inside TypeScript; do not duplicate type annotations inside docstrings.

```ts
export interface CacheRememberOptions {
  ttlSeconds: number;
  tags?: string[];
}

/**
 * Executes the fallback fetcher and caches the result when a cache miss occurs.
 *
 * Employs a single-flight mutex per key to prevent thundering-herd cache stampedes
 * when multiple concurrent requests query an expired key simultaneously.
 *
 * @param key - Unique cache partition key.
 * @param ttlSeconds - Cache TTL in seconds.
 * @param fetcher - Asynchronous producer function executed on miss.
 * @returns The cached or freshly computed value.
 * @throws {AppError} If fetcher throws or cache connection drops.
 */
export async function remember<T>(
  key: string,
  ttlSeconds: number,
  fetcher: () => Promise<T>
): Promise<T> {
  // Implementation...
}
```

---

## 3. Python (PEP 257 & Google Style)

Use triple-quoted strings for modules, classes, and functions. Document exceptions raised and edge-case behavior.

```python
"""Rate limiting domain service with sliding-window support."""

from typing import Protocol


class RateLimiterPort(Protocol):
    """Domain contract for rate limiting adapters."""

    def is_allowed(self, client_id: str, limit: int, window_sec: int) -> bool:
        """Evaluate if the client request stays within the sliding window limit.

        Uses a Redis Sorted Set under the hood to ensure atomic score increments.
        Fails open (returns True) if the Redis node is unreachable to prevent
        taking down downstream checkout APIs during cache outages.

        Args:
            client_id: Unique IP, API token, or user account identifier.
            limit: Maximum requests allowed in the sliding window.
            window_sec: Window duration in seconds.

        Returns:
            True if the call is allowed, False if limit is exceeded.
        """
        ...
```

---

## 4. Rust (Rustdoc: `///` and `//!`)

Use `//!` for module-level documentation and `///` for structs, enums, and functions. Include doc tests or failure conditions.

```rust
//! Cryptographic HMAC webhook signature verifier.
//!
//! Provides zero-allocation constant-time verification for incoming
//! payment webhooks.

use subtle::ConstantTimeEq;

/// Verifies whether an incoming payload matches the expected HMAC-SHA256 signature.
///
/// Compares signatures using constant-time comparison to protect against
/// timing attacks on the cryptographic hash digest.
///
/// # Errors
///
/// Returns `Err(WebhookError::InvalidSignature)` if the digest lengths
/// mismatch or if the signature does not authenticate the payload.
pub fn verify_signature(
    secret: &[u8],
    payload: &[u8],
    expected_hex_sig: &str,
) -> Result<(), WebhookError> {
    // Implementation...
}
```

---

## 5. Commenting Checklist

Before committing code:
- [ ] Are all comments and docstrings written in English?
- [ ] Are all commented-out dead code blocks deleted?
- [ ] Do comments answer "Why was it built this way?" rather than "What does this line do?"?
- [ ] For public functions: are edge cases, thrown exceptions, or fallbacks documented?
- [ ] Does the file stay under 200 lines?
