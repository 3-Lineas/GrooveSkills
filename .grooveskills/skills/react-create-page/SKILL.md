---
name: react-create-page
description: Use when creating, refactoring, or extending React pages, views, screens, dashboards, or forms. Enforces clean page architecture with zero logic in page components, domain custom hooks, isolated API actions, atomic co-location, Valibot validation, and @formisch/react forms. TRIGGER when creating or modifying files in src/pages/ or src/features/, or when building React views with API actions. Always adhere to 'best-practices' and pair with 'react-core' and 'react-advanced'.
---

# React Page & View Architecture (`react-create-page`)

Standardized architectural pattern for building maintainable, enterprise-grade React pages and views. Enforces declarative page coordinators, isolated domain hooks, pure API actions, atomic co-location, and type-safe forms.

---

## 1. Golden Architectural Rules (Non-negotiable)

1. **Zero Logic in Page Components (`use<Domain>Page` Hook)**:
   - The main page component (`<domain>-page.tsx` or `page.tsx`) must be strictly declarative.
   - **All state, effects, transitions, and submit handlers must live in a dedicated domain custom hook** (`use-<domain>-page.ts`).
   - The page component only calls the hook and passes state/handlers to atomic subcomponents.
2. **Early Returns for UI States in Page**:
   - Handle loading, error, and empty states at the top level with guard clauses (`if (isLoading) return <PageSkeleton />;`).
   - Keep the main render tree flat; never use nested ternaries.
3. **Domain Co-location of Components, Hooks & Types**:
   - Each feature/page lives in its own domain directory (`src/pages/<domain>/` or `src/features/<domain>/`).
   - Subcomponents exclusive to the page reside in `components/`, hooks in `hooks/`, and domain types/schemas in `types/` or `schemas/`.
4. **Mandatory Atomization & Hard 200-Line Limit**:
   - Break headers, KPI summaries, filter bars, tables, cards, and form sections into dedicated atomic files under `components/`.
   - Every file must be under **200 lines**.
5. **No Prop Drilling (Consume Hooks Directly)**:
   - If an atomic component requires deep state, let it consume the domain hook or a domain context directly instead of passing props through intermediary components.
6. **API Communication Exclusively via Domain Actions (`src/actions/<domain>/`)**:
   - Direct `fetch` calls or raw HTTP requests inside components or hooks are **strictly forbidden**.
   - Encapsulate all network requests in pure async action functions under `src/actions/<domain>/<action-name>.action.ts` returning typed `ActionResponse<T>`.
7. **Zero Mocks in Production Views**:
   - Never render mock arrays or fallback mock data in production views.
   - Bind views to real action calls; provide realistic `<Skeleton />` loaders and polite empty states.
8. **Forms with `@formisch/react`, Valibot & Shadcn UI**:
   - Define validation schemas using **Valibot** (`* as v from "valibot"`).
   - Manage form state via `@formisch/react`'s `useForm` and bind inputs with `<Form>` and `<Field>` render props alongside Shadcn UI primitives.
9. **Mandatory Async Feedback with `toast.promise`**:
   - All async operations and form submissions must be wrapped in **`toast.promise`** (from `sonner`).
   - Define clear `loading`, `success`, and `error` messages. Never rely on manual `toast.success`/`toast.error` branching, and never use browser `alert()`.
10. **Code Hygiene & Conventions**:
    - Code, identifiers, and comments strictly in English; UI copy follows target locale.
    - Mandatory `@/...` path aliases and **zero barrel files** (`index.ts`).
    - Use lookup objects (`Record<Key, Value>`) instead of `switch` statements.
    - Use descriptive variable names in callbacks and loops (no single-letter `i`, `e`, `x`).

---

## 2. Domain Directory Taxonomy

```text
src/
├── actions/                         # Pure async API layer
│   └── profile/
│       ├── get-profile.action.ts    # One atomic action (< 100 lines)
│       └── update-profile.action.ts
└── pages/                           # Or src/features/
    └── profile/
        ├── components/              # Atomic UI components for this view
        │   ├── profile-card.tsx
        │   └── profile-form.tsx
        ├── hooks/                   # Page coordinator and state hook
        │   └── use-profile-page.ts
        ├── schemas/                 # Valibot schemas for forms/actions
        │   └── profile.schema.ts
        ├── types/                   # Domain TypeScript definitions
        │   └── profile.types.ts
        └── profile-page.tsx         # Declarative coordinator (< 100 lines)
```

---

## 3. End-to-End Implementation Blueprint

### A. Valibot Schema & Domain Action
```ts
// src/pages/profile/schemas/profile.schema.ts
import * as v from "valibot";

export const profileSchema = v.object({
  fullName: v.pipe(v.string(), v.minLength(2, "Name must have at least 2 characters.")),
  email: v.pipe(v.string(), v.email("Please provide a valid email.")),
});
export type ProfileFormValues = v.InferOutput<typeof profileSchema>;

// src/actions/profile/update-profile.action.ts
export interface ActionResponse<T> { success: boolean; data?: T; error?: string; }
export async function updateProfileAction(data: ProfileFormValues): Promise<ActionResponse<ProfileFormValues>> {
  try {
    const res = await fetch("/api/profile", { method: "PUT", body: JSON.stringify(data) });
    return res.ok ? { success: true, data } : { success: false, error: "Unable to save profile." };
  } catch {
    return { success: false, error: "Network error occurred." };
  }
}
```

### B. Domain Custom Hook & Declarative Page
```tsx
// src/pages/profile/hooks/use-profile-page.ts
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { updateProfileAction } from "@/actions/profile/update-profile.action";
import type { ProfileFormValues } from "@/pages/profile/schemas/profile.schema";

export function useProfilePage(initialData: ProfileFormValues) {
  const [profile, setProfile] = useState<ProfileFormValues>(initialData);

  const handleUpdate = (values: ProfileFormValues): void => {
    toast.promise(
      async () => {
        const res = await updateProfileAction(values);
        if (!res.success || !res.data) {
          throw new Error(res.error ?? "Failed to update profile.");
        }
        setProfile(res.data);
        return res.data;
      },
      {
        loading: "Saving profile changes...",
        success: "Profile updated successfully!",
        error: (err: unknown) => (err instanceof Error ? err.message : "Failed to save profile."),
      }
    );
  };
  return { profile, handleUpdate };
}

// src/pages/profile/profile-page.tsx
export function ProfilePage({ initialData }: { initialData: ProfileFormValues }) {
  const { profile, handleUpdate } = useProfilePage(initialData);

  return (
    <main className="container mx-auto max-w-4xl p-6 space-y-6">
      <h1 className="text-2xl font-bold">Profile Settings</h1>
      <ProfileForm defaultValues={profile} onSubmit={handleUpdate} />
    </main>
  );
}
```

### C. Form with `@formisch/react`, Valibot & Shadcn
```tsx
// src/pages/profile/components/profile-form.tsx
import { useForm, Form, Field } from "@formisch/react";
import { profileSchema, type ProfileFormValues } from "@/pages/profile/schemas/profile.schema";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface ProfileFormProps {
  defaultValues: ProfileFormValues;
  onSubmit: (values: ProfileFormValues) => void;
}

export function ProfileForm({ defaultValues, onSubmit }: ProfileFormProps) {
  const [form, dispatch] = useForm({ schema: profileSchema, initialValues: defaultValues, onSubmit });

  return (
    <Form form={form} dispatch={dispatch} className="space-y-4 rounded-lg border p-6">
      <Field form={form} name="fullName">
        {(field) => (
          <div className="space-y-1.5">
            <Label htmlFor={field.props.id}>Full Name</Label>
            <Input {...field.props} placeholder="Jane Doe" />
            {field.errors[0] && <p className="text-sm text-destructive">{field.errors[0]}</p>}
          </div>
        )}
      </Field>
      <Button type="submit">Save Profile</Button>
    </Form>
  );
}
```

---

## 4. Anti-Patterns to Avoid

| Anti-Pattern | Why It Fails | Correct Pattern |
| :--- | :--- | :--- |
| Inline `fetch` / Axios in hooks or components | Couples UI to transport layer; hard to test/mock | Delegate network requests to `src/actions/<domain>/<action>.action.ts` |
| State/handlers directly in `page.tsx` | Bloats coordinator, breaks SRP, complicates re-renders | Encapsulate in `use<Domain>Page` custom hook |
| Monolithic view file (> 200 lines) | Hard to navigate, maintain, and review | Atomize into `components/` subcomponents (< 200 lines each) |
| Hardcoded mock arrays in views | Creates false assumptions and leaks mocks to production | Use real action bindings, `<Skeleton />`, and polite empty states |
| Manual toasts or native `alert()` | Inconsistent async feedback and poor UX | Wrap all async mutations strictly in `toast.promise` |
| Re-exporting via `index.ts` barrel files | Defeats tree-shaking and causes circular dependency traps | Import directly using `@/` path aliases |
