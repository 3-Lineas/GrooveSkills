---
name: auth-rbac-policies
description: Standardized authentication adapter architecture and pure domain authorization policies (RBAC/ABAC). Replaces coupling to auth vendors (Supabase Auth, Clerk, Auth0, Lucia, JWT) with an AuthenticatedActor domain contract and isolated, pure boolean policy functions. TRIGGER when implementing login, session extraction, role-based access control, resource ownership checks, permission gates, or user token verification.
---

# Authentication Adapters & Pure Authorization Policies (RBAC/ABAC)

Opinionated architectural standard decoupling authentication identity extraction (via vendor adapters) from authorization logic (via pure domain policy functions).

---

## 1. Architectural Distinction: AuthN vs. AuthZ

| Dimension | Authentication (AuthN) | Authorization (AuthZ) |
| :--- | :--- | :--- |
| **Question** | *Who is calling the system?* | *Is this actor permitted to perform this action on this resource?* |
| **Layer** | Infrastructure Adapter (`src/infrastructure/adapters/auth/`) | Pure Domain Policy (`src/domains/<domain>/policies/`) |
| **Mechanism** | JWT verify, Clerk/Supabase session token parser | Pure boolean logic: `(actor, resource) => boolean` |
| **Side Effects** | I/O, network tokens, crypto signature checks | Zero I/O, deterministic, 100% testable without mocks |

---

## 2. Standardized AuthenticatedActor Contract

```ts
// src/domains/auth/authenticated-actor.ts
export interface AuthenticatedActor {
  readonly id: string;
  readonly role: "admin" | "member" | "viewer" | "guest";
  readonly permissions: readonly string[];
  readonly organizationId?: string;
}

export interface AuthAdapterPort {
  authenticateBearerToken(headerValue?: string): Promise<AuthenticatedActor>;
}
```

---

## 3. Pure Authorization Policies (Zero Side Effects)

Policies must be standalone pure functions. Never instantiate an external database or call network APIs inside a policy.

```ts
// src/domains/documents/policies/document.policy.ts
import type { AuthenticatedActor } from "@/domains/auth/authenticated-actor";

export interface DocumentResource {
  id: string;
  authorId: string;
  organizationId: string;
  isPublished: boolean;
}

export const DocumentPolicy = {
  canView(actor: AuthenticatedActor, doc: DocumentResource): boolean {
    if (actor.role === "admin") return true;
    if (doc.isPublished && actor.organizationId === doc.organizationId) return true;
    return actor.id === doc.authorId;
  },

  canEdit(actor: AuthenticatedActor, doc: DocumentResource): boolean {
    if (actor.role === "admin") return true;
    return actor.id === doc.authorId;
  },

  canDelete(actor: AuthenticatedActor, doc: DocumentResource): boolean {
    return actor.role === "admin" || actor.id === doc.authorId;
  },
};
```

---

## 4. Enforcement in Actions or Route Middleware

```ts
import { AppError } from "@/errors/app-error";
import { DocumentPolicy, type DocumentResource } from "@/domains/documents/policies/document.policy";
import type { AuthenticatedActor } from "@/domains/auth/authenticated-actor";

export function authorizeOrThrow(actor: AuthenticatedActor, resource: DocumentResource): void {
  const allowed = DocumentPolicy.canEdit(actor, resource);
  if (!allowed) {
    throw new AppError({
      message: "No tienes permiso para modificar este documento.",
      statusCode: 403,
      context: { actorId: actor.id, docId: resource.id },
    });
  }
}
```

---

## 5. Detailed Adapters Reference

For real implementations of Supabase Auth, Clerk, Custom JWT, and In-Memory testing actors, see:
- `references/auth-adapters-examples.md`
