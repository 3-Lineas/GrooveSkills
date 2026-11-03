# Implementation Reference: Auth Adapters & Policies

Real adapter implementations (Clerk, Supabase, JWT) converting provider-specific tokens into `AuthenticatedActor`.

---

## 1. Clerk Authentication Adapter (`@clerk/backend`)

```ts
// src/infrastructure/adapters/auth/clerk-auth.adapter.ts
import { verifyToken } from "@clerk/backend";
import type { AuthAdapterPort, AuthenticatedActor } from "@/domains/auth/authenticated-actor";
import { AppError } from "@/errors/app-error";

export class ClerkAuthAdapter implements AuthAdapterPort {
  constructor(private jwtKey: string) {}

  async authenticateBearerToken(headerValue?: string): Promise<AuthenticatedActor> {
    const token = headerValue?.replace(/^Bearer\s+/i, "");
    if (!token) {
      throw new AppError({ message: "Token de autorización requerido.", statusCode: 401 });
    }

    try {
      const payload = await verifyToken(token, { jwtKey: this.jwtKey });
      const role = (payload.metadata as { role?: "admin" | "member" })?.role ?? "member";
      return {
        id: payload.sub,
        role,
        permissions: (payload.permissions as string[]) ?? [],
        organizationId: payload.org_id as string | undefined,
      };
    } catch (err) {
      throw new AppError({ message: "Token de autorización inválido o expirado.", statusCode: 401, cause: err });
    }
  }
}
```

---

## 2. Supabase Auth Adapter (`@supabase/supabase-js`)

```ts
// src/infrastructure/adapters/auth/supabase-auth.adapter.ts
import type { SupabaseClient } from "@supabase/supabase-js";
import type { AuthAdapterPort, AuthenticatedActor } from "@/domains/auth/authenticated-actor";
import { AppError } from "@/errors/app-error";

export class SupabaseAuthAdapter implements AuthAdapterPort {
  constructor(private supabase: SupabaseClient) {}

  async authenticateBearerToken(headerValue?: string): Promise<AuthenticatedActor> {
    const token = headerValue?.replace(/^Bearer\s+/i, "");
    if (!token) {
      throw new AppError({ message: "Sesión requerida.", statusCode: 401 });
    }

    const { data: { user }, error } = await this.supabase.auth.getUser(token);
    if (error || !user) {
      throw new AppError({ message: "Sesión no válida o expirada.", statusCode: 401, cause: error });
    }

    const appRole = (user.app_metadata?.role as "admin" | "member") ?? "member";
    return {
      id: user.id,
      role: appRole,
      permissions: (user.app_metadata?.permissions as string[]) ?? [],
      organizationId: user.app_metadata?.org_id as string | undefined,
    };
  }
}
```

---

## 3. In-Memory Mock Adapter (Deterministic Testing)

```ts
// src/infrastructure/adapters/auth/memory-auth.adapter.ts
import type { AuthAdapterPort, AuthenticatedActor } from "@/domains/auth/authenticated-actor";
import { AppError } from "@/errors/app-error";

export class MemoryAuthAdapter implements AuthAdapterPort {
  private users = new Map<string, AuthenticatedActor>();

  seedUser(token: string, actor: AuthenticatedActor): void {
    this.users.set(token, actor);
  }

  async authenticateBearerToken(headerValue?: string): Promise<AuthenticatedActor> {
    const token = headerValue?.replace(/^Bearer\s+/i, "");
    if (!token) throw new AppError({ message: "Falta token.", statusCode: 401 });
    const actor = this.users.get(token);
    if (!actor) throw new AppError({ message: "Token inválido.", statusCode: 401 });
    return actor;
  }
}
```
