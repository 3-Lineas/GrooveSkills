---
name: testing-vitest
description: Clean, deterministic unit and integration testing with Vitest. Enforces Arrange-Act-Assert (AAA), behavioral testing over implementation details, in-memory fakes over brittle mocks, strict assertions, and boundary/edge case test matrices. TRIGGER when writing, maintaining, or fixing automated tests (*.test.ts, *.spec.ts), test utilities, or testing infrastructure with Vitest.
---

# Vitest Testing Standards

Guidelines for authoring reliable, fast, and maintainable unit and integration tests with **Vitest**.

---

## 1. Golden Rules (Non-negotiable)

1. **Test Behavior, Not Implementation Details**:
   - Assert on observable inputs, outputs, side-effects, and state changes.
   - Do not test private methods, internal variable states, or intermediate execution order.

2. **Strict Arrange-Act-Assert (AAA) Structure**:
   - Organize every test clearly into three visually distinct blocks:
     - `// Arrange`: Set up inputs, state, and dependencies.
     - `// Act`: Execute the unit under test.
     - `// Assert`: Verify outputs and invariants.

3. **In-Memory Fakes Over Brittle Mocks**:
   - Prefer in-memory fakes (e.g., `FakeUserRepository`, `MemoryStorage`) over deeply nested `vi.spyOn()` or mock chains.
   - Only mock external boundaries (network HTTP calls, system clocks, third-party APIs).

4. **Deterministic & Isolated (Zero Shared Mutable State)**:
   - Each test must run independently in any order without relying on state from preceding tests.
   - Use `beforeEach` strictly to reset test fixtures.

5. **Exhaustive Edge Cases & Failure Modes**:
   - Always test boundary values: empty strings, zero, negative numbers, missing optional fields, expired tokens, and rejected promises.
   - Never write happy-path-only tests.

6. **Clear, Intention-Revealing Test Names**:
   - Use descriptive sentences: `it("should calculate tax accurately when order total exceeds threshold")`.
   - Avoid vague names like `it("works")` or `it("test 1")`.

---

## 2. Standard Test Pattern (AAA)

```ts
import { describe, it, expect } from "vitest";
import { calculateDiscount } from "./calculate-discount";

describe("calculateDiscount", () => {
  it("should apply 15% discount when user is a premium member", () => {
    // Arrange
    const originalPrice = 100;
    const isPremium = true;

    // Act
    const finalPrice = calculateDiscount(originalPrice, isPremium);

    // Assert
    expect(finalPrice).toBe(85);
  });

  it("should return unchanged price when discount percentage is zero", () => {
    // Arrange & Act
    const finalPrice = calculateDiscount(50, false);

    // Assert
    expect(finalPrice).toBe(50);
  });

  it("should throw an AppError when input price is negative", () => {
    // Arrange, Act & Assert
    expect(() => calculateDiscount(-10, true)).toThrowError(/Price must be non-negative/);
  });
});
```

---

## 3. Mocking External Boundaries Safely

```ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { fetchExchangeRate } from "./fetch-exchange-rate";

describe("fetchExchangeRate", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("should parse rate safely when API returns 200", async () => {
    const fakeFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ rate: 1.08 }),
    });
    vi.stubGlobal("fetch", fakeFetch);

    const rate = await fetchExchangeRate("EUR", "USD");

    expect(rate).toBe(1.08);
    expect(fakeFetch).toHaveBeenCalledWith(expect.stringContaining("EUR/USD"));
  });
});
```

---

## 4. Sibling Skills

- **`best-practices`**: Universal clean code rules.
- **`error-handling-logging`**: Testing expected `AppError` throws and error payloads.
