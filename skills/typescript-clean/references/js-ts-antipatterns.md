# TypeScript & JavaScript Antipatterns Reference

Common antipatterns in modern TypeScript codebases and how to refactor them.

---

## 1. Antipattern: The `any` Escape Hatch

```ts
// ❌ WRONG: disables compiler checks
function parsePayload(raw: any) {
  return raw.user.id;
}

// ✅ CORRECT: unknown with schema validation or guard
import * as v from "valibot";

const UserPayloadSchema = v.object({
  user: v.object({ id: v.string() }),
});

function parsePayload(raw: unknown): string {
  const parsed = v.parse(UserPayloadSchema, raw);
  return parsed.user.id;
}
```

---

## 2. Antipattern: Non-null Assertion (`!`)

```ts
// ❌ WRONG: crashes if element is missing
const element = document.getElementById("submit-btn")!;
element.addEventListener("click", () => {});

// ✅ CORRECT: early guard clause
const element = document.getElementById("submit-btn");
if (!element) {
  throw new Error("Submit button element not found in DOM.");
}
element.addEventListener("click", () => {});
```

---

## 3. Antipattern: Type Assertion (`as Type`) Bypass

```ts
// ❌ WRONG: compiler lies to itself; runtime crash later
const user = JSON.parse(response) as User;

// ✅ CORRECT: parse with Valibot schema
const user = v.parse(UserSchema, JSON.parse(response));
```

---

## 4. Antipattern: Optional Soup (Unrepresentable States)

```ts
// ❌ WRONG: allows impossible state { isLoading: true, error: "fail", data: [...] }
interface State {
  isLoading?: boolean;
  data?: string[];
  error?: string;
}

// ✅ CORRECT: Discriminated Union
type State =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: string[] }
  | { status: "error"; error: string };
```

---

## 5. Antipattern: Magic Enums in TypeScript

```ts
// ❌ WRONG: numeric TS enums emit runtime objects and loose typing
enum UserRole {
  Admin,
  Editor,
}

// ✅ CORRECT: const objects or union literals
export const USER_ROLES = ["admin", "editor"] as const;
export type UserRole = (typeof USER_ROLES)[number];
```
