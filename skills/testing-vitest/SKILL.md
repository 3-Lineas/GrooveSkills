---
name: testing-vitest
description: Clean, deterministic unit, integration, and HTTP route testing with Vitest. Enforces Arrange-Act-Assert (AAA), behavioral testing over implementation details, in-memory SQLite/D1 fakes over brittle mocks, four-tier testing pyramid, and strict assertion contracts. TRIGGER when writing, maintaining, or fixing automated tests (*.test.ts, *.spec.ts), test utilities, or testing infrastructure with Vitest.
---

# Vitest Testing Standards & 4-Tier Backend Pyramid

Guidelines for authoring reliable, fast, and maintainable unit, integration, and route tests with **Vitest**.

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
   - Prefer in-memory fakes (e.g., `testDb` backed by `:memory:` SQLite / D1 emulator) over mock chains.
   - Only mock external boundaries (network HTTP calls, system clocks, third-party payment APIs).

4. **Four-Tier Testing Pyramid**:
   - **Tier 1 (DTOs / Schemas)**: Test constraint validations, sanitization, trims, and invalid payload rejections.
   - **Tier 2 (Actions)**: Test isolated business logic functions with typed context.
   - **Tier 3 (Transactions)**: Test multi-mutation atomic batching and rollback mechanics.
   - **Tier 4 (HTTP Routes)**: Mount thin routes on `testApp`, inject `testDb`, and verify HTTP lifecycle with `testApp.request()`.

5. **Mandatory Response Envelope Validation (`ActionResponse<T>`)**:
   - Route tests must assert that responses adhere to `ActionResponse<T>` (`success`, `message`, `data`, `error`).
   - Verify that sensitive fields (e.g. `passwordHash`) are stripped by output whitelisting schemas.

6. **Hard Size Limit: <200 Lines**:
   - Keep test files focused and under 200 lines (target: 30-100 lines).

---

## 2. Directory Taxonomy

```text
packages/testing/src/backend/ (or tests/)
├── setup.ts                    # Global testDb initialization & migrations
├── mocks/
│   └── in-memory-d1.ts         # In-memory SQLite emulator applying migrations
└── {domain}/
    ├── {entity}-dto.test.ts    # Tier 1: Schema validation tests
    ├── {domain}-actions.test.ts# Tier 2: Pipeline actions unit tests
    └── {action}.route.test.ts  # Tier 4: Route integration tests
```

---

## 3. Four-Tier Pattern Examples

### Tier 1: DTO Validation Test
```ts
import { describe, it, expect } from "vitest";
import * as v from "valibot";
import { CreateUserDto } from "@/dtos/users/create-user.dto";

describe("Users DTO Validation", () => {
  it("should accept valid payload and lowercase email", () => {
    const input = { fullName: "Carlos Santana", email: "CARLOS@EXAMPLE.COM" };
    const parsed = v.parse(CreateUserDto, input);
    expect(parsed.email).toBe("carlos@example.com");
  });

  it("should reject invalid email", () => {
    expect(() => v.parse(CreateUserDto, { fullName: "Carlos", email: "invalid" })).toThrow();
  });
});
```

### Tier 4: Route Integration Test with `testApp.request()`
```ts
import { describe, it, expect, vi } from "vitest";
import { Hono } from "hono";
import { createUserRoute } from "@/routes/modules/users/create-user.route";
import { testDb } from "@/backend/setup";
import type { AppContext } from "@/types/context/app-context.type";
import type { ActionResponse } from "@/types/common/action-response.type";

describe("POST /users Route Integration", () => {
  const testApp = new Hono<AppContext>();
  testApp.use("*", async (ctx, next) => {
    ctx.set("db", testDb);
    ctx.set("logger", { info: vi.fn(), warn: vi.fn(), error: vi.fn() } as any);
    await next();
  });
  testApp.route("/users", createUserRoute);

  it("should return 201 with ActionResponse contract", async () => {
    const response = await testApp.request("/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fullName: "Valeria Gomez", email: "valeria@example.com" }),
    });

    expect(response.status).toBe(201);
    const json = (await response.json()) as ActionResponse<{ id: string; passwordHash?: string }>;
    expect(json.success).toBe(true);
    expect(json.data?.passwordHash).toBeUndefined();
  });
});
```

---

## 4. Deep References

- `./references/backend-d1-testing-pyramid.md`: Comprehensive guide for In-Memory SQLite/D1 setup and test matrices.
