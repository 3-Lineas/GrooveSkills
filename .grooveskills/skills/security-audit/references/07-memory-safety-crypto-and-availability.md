# Memory Safety, Cryptography & Availability Security

Domain audit checklist covering Rust memory safety, cryptographic primitives, race conditions, ReDoS, and denial of service.

---

## 1. Rust Memory Safety & FFI Isolation

- **Unsafe Auditing**: Scan for every occurrence of `unsafe { ... }` in Rust codebases:
  - Verify every `unsafe` block has a preceding `// SAFETY: ...` doc comment justifying why the invariants cannot be violated.
  - Check for raw pointer dereferencing, undefined behavior, or unaligned memory access.
- **FFI & C-Bindings**: Verify bounds checking on buffers passed across foreign function interfaces.
- **Panic Boundaries**: Ensure panics cannot unwind across FFI or Cloudflare Worker boundaries (use `std::panic::catch_unwind`).

---

## 2. Cryptographic Standards

- **Secure Randomness**: Never use `Math.random()` or unseeded pseudo-random number generators for secrets, session IDs, or tokens. Always use `crypto.getRandomValues()` or Rust `rand::rngs::OsRng`.
- **Constant-Time Comparison**: Verify signatures, HMACs, and password hashes using constant-time comparison functions (`crypto.timingSafeEqual` in Node/Workers) to prevent timing side-channel attacks.
- **Modern Algorithms**:
  - Hashing / Password storage: Argon2id, scrypt, or bcrypt with appropriate work factors.
  - Symmetric encryption: AES-256-GCM or ChaCha20-Poly1305.
  - Signatures: Ed25519 or ECDSA (P-256). Disallow deprecated algorithms (MD5, SHA-1, DES).

---

## 3. Concurrency, Race Conditions & TOCTOU

- **Time-of-Check to Time-of-Use (TOCTOU)**: Avoid checking file existence or user balance in one step and updating it in another without locking.
- **Database Transactions & Row Locks**: Use `SELECT ... FOR UPDATE` or serializable isolation when modifying critical state (coupons, gift cards, credit balances, inventory).
- **Atomic Operations**: In high-throughput counters, use database `UPDATE ... SET count = count + 1` or Redis `INCRBY` instead of read-modify-write loops.

---

## 4. Availability & Spend Denial of Service (DoS)

- **Regular Expression Denial of Service (ReDoS)**: Scan regular expressions for catastrophic backtracking patterns (nested quantifiers like `(a+)+$`). Use RE2 or non-backtracking engines where available.
- **Resource Limits**:
  - Enforce timeouts on all outbound HTTP calls and database queries.
  - Impose strict upload file size limits and stream parsing to avoid memory spikes.
- **Spend DoS & Third-Party API Quotas**: Protect expensive AI LLM generation or SMS dispatch routes behind strict per-user rate limits and CAPTCHA/proof-of-work challenges.
