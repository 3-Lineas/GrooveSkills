# Implementation Reference: Backend Testing Pyramid & In-Memory D1 Setup

A complete guide for orchestrating Vitest test suites across the 4-tier testing pyramid using in-memory SQLite / Cloudflare D1 emulators.

---

## 1. Global Setup with In-Memory Database (`setup.ts`)

Instead of recreating database tables inside every test file, initialize migrations once on an in-memory database:

```ts
import { beforeAll, afterAll } from "vitest";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import * as schema from "@/db/schema";

const sqliteConnection = new Database(":memory:");
export const testDb = drizzle(sqliteConnection, { schema });

beforeAll(async () => {
  // Apply schema migrations automatically before suite execution
  migrate(testDb, { migrationsFolder: "./drizzle" });
});

afterAll(() => {
  sqliteConnection.close();
});
```

---

## 2. Testing Transactions & Rollback (Tier 3)

```ts
import { describe, it, expect } from "vitest";
import { withD1Transaction } from "@/common/utils/d1-transaction";
import { testDb } from "@/backend/setup";
import { usersTable } from "@/db/schema";

describe("D1 Atomic Batch Transactions", () => {
  it("should rollback all mutations if an error occurs mid-transaction", async () => {
    const executeFailingTransaction = async () => {
      await withD1Transaction(testDb as any, async (transaction) => {
        transaction.stage(
          testDb.insert(usersTable).values({ id: "user_1", email: "first@example.com" }) as any
        );

        throw new Error("Simulated failure mid-transaction");
      });
    };

    await expect(executeFailingTransaction()).rejects.toThrow("Simulated failure mid-transaction");

    const users = await testDb.select().from(usersTable);
    expect(users).toHaveLength(0);
  });
});
```

---

## 3. Best Practices Checklist

- [ ] Run migrations on in-memory SQLite rather than hitting live cloud databases.
- [ ] Reset mutable database state between tests using transaction rollbacks or truncation.
- [ ] Validate both happy path and rejection paths on every DTO schema.
- [ ] Ensure route tests never assert raw implementation details, only HTTP status codes and `ActionResponse<T>` envelopes.
- [ ] Keep every test file strictly below 200 lines.
