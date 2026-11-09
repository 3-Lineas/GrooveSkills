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
| **Layer** | Infrastructure Adapter (`src/infrastructure/adapters/auth/`) | Pure Atomic Policy (`src/actions/{domain}/can-{action}-{resource}.action.ts`) |
| **Mechanism** | JWT verify, Clerk/Supabase session token parser | Pure boolean logic: `(actor, resource) => boolean` (1 function per file) |
| **Side Effects** | I/O, network tokens, crypto signature checks | Zero I/O, deterministic, 100% testable without mocks |

---

## 2. Standardized AuthenticatedActor Contract

Contracts live in `@/types/auth/` (1 interface per file).

```ts
// src/types/auth/authenticated-actor.type.ts
export interface AuthenticatedActor {
  readonly id: string;
  readonly role: "admin" | "member" | "viewer" | "guest";
  readonly permissions: readonly string[];
  readonly organizationId?: string;
}
```

```ts
// src/types/auth/auth-adapter-port.type.ts
import type { AuthenticatedActor } from "@/types/auth/authenticated-actor.type";

export interface AuthAdapterPort {
  authenticateBearerToken(headerValue?: string): Promise<AuthenticatedActor>;
}
```

---

## 3. Pure Authorization Policies (1 Function per File)

Policies must be standalone pure functions exporting exactly ONE function per file under `src/actions/{domain}/`. Never instantiate an external database or call network APIs inside a policy.

```ts
// src/actions/documents/can-view-document.action.ts
import type { AuthenticatedActor } from "@/types/auth/authenticated-actor.type";
import type { DocumentResource } from "@/types/documents/document-resource.type";

export function canViewDocumentAction(actor: AuthenticatedActor, doc: DocumentResource): boolean {
  if (actor.role === "admin") return true;
  if (doc.isPublished && actor.organizationId === doc.organizationId) return true;
  return actor.id === doc.authorId;
}
```

```ts
// src/actions/documents/can-edit-document.action.ts
import type { AuthenticatedActor } from "@/types/auth/authenticated-actor.type";
import type { DocumentResource } from "@/types/documents/document-resource.type";

export function canEditDocumentAction(actor: AuthenticatedActor, doc: DocumentResource): boolean {
  if (actor.role === "admin") return true;
  return actor.id === doc.authorId;
}
```

```ts
// src/actions/documents/can-delete-document.action.ts
import type { AuthenticatedActor } from "@/types/auth/authenticated-actor.type";
import type { DocumentResource } from "@/types/documents/document-resource.type";

export function canDeleteDocumentAction(actor: AuthenticatedActor, doc: DocumentResource): boolean {
  return actor.role === "admin" || actor.id === doc.authorId;
}
```

---

## 4. Enforcement in Actions or Route Middleware

```ts
// src/actions/documents/authorize-document-edit.action.ts
import { AppError } from "@/errors/app-error";
import { canEditDocumentAction } from "@/actions/documents/can-edit-document.action";
import type { DocumentResource } from "@/types/documents/document-resource.type";
import type { AuthenticatedActor } from "@/types/auth/authenticated-actor.type";

export function authorizeDocumentEditAction(actor: AuthenticatedActor, resource: DocumentResource): void {
  const allowed = canEditDocumentAction(actor, resource);
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
