---
name: env-feature-flags
description: Architectural standards for fail-fast environment validation with Valibot and decoupled Feature Flags wrappers with swappable adapters (PostHog, LaunchDarkly, Unleash, In-Memory). Guarantees that applications crash at boot time on invalid config and allows toggling features without coupling code to vendor SDKs. TRIGGER when reading environment variables, structuring process.env, configuring feature flags, or running A/B experiments.
---

# Fail-Fast Environment Validation & Feature Flags Adapters

Opinionated architectural standard combining **Fail-Fast Environment Schema Validation** (using Valibot) and **Feature Flags Adapters** (PostHog, LaunchDarkly, In-Memory).

---

## 1. Architectural Invariants

1. **Fail-Fast at Startup**:
   - Environment variables must be validated on application boot. If a required secret or URL is missing or malformed, the process exits immediately with a clean diagnostic message.
   - Raw `process.env` is NEVER accessed directly inside business actions or controllers. All code imports the strongly typed `env` singleton.
2. **Feature Flags as a Domain Port**:
   - Business actions evaluate feature availability through `FeatureFlagPort`.
   - Vendor SDKs (PostHog, LaunchDarkly, Unleash) remain isolated inside infrastructure adapters.

---

## 2. Directory Layout

```text
src/
├── config/
│   └── env.ts                              # Fail-fast Valibot environment parser (<70 lines)
├── domains/
│   └── feature-flags/
│       ├── feature-flag.port.ts            # Domain interface for flags (<40 lines)
│       └── flag-keys.ts                    # Strongly typed flag registry (<30 lines)
└── infrastructure/
    └── adapters/
        └── feature-flags/
            ├── posthog-flags.adapter.ts    # PostHog implementation (<70 lines)
            ├── launchdarkly-flags.adapter.ts # LaunchDarkly implementation (<70 lines)
            └── memory-flags.adapter.ts     # In-memory testing flags fake (<50 lines)
```

---

## 3. Fail-Fast Environment Config (`src/config/env.ts`)

```ts
import * as v from "valibot";

const EnvSchema = v.object({
  NODE_ENV: v.fallback(v.picklist(["development", "production", "test"]), "development"),
  PORT: v.fallback(v.pipe(v.string(), v.transform(Number)), 3000),
  DATABASE_URL: v.pipe(v.string(), v.url("DATABASE_URL debe ser una URL válida.")),
  API_SECRET_KEY: v.pipe(v.string(), v.minLength(32, "API_SECRET_KEY requiere al menos 32 caracteres.")),
});

function loadEnv() {
  const result = v.safeParse(EnvSchema, process.env);
  if (!result.success) {
    console.error("❌ Error fatal en variables de entorno:");
    for (const issue of result.issues) {
      console.error(`  - ${issue.path?.[0]?.key}: ${issue.message}`);
    }
    process.exit(1);
  }
  return result.output;
}

export const env = loadEnv();
```

---

## 4. Feature Flag Port (`src/domains/feature-flags/feature-flag.port.ts`)

```ts
export type FeatureFlagKey = "new-checkout-flow" | "ai-copilot" | "export-pdf";

export interface FeatureFlagEvaluationContext {
  distinctId: string;
  organizationId?: string;
  properties?: Record<string, unknown>;
}

export interface FeatureFlagPort {
  isEnabled(key: FeatureFlagKey, context?: FeatureFlagEvaluationContext): Promise<boolean>;
  getVariant<T = string>(key: FeatureFlagKey, context?: FeatureFlagEvaluationContext): Promise<T | null>;
}
```

---

## 5. Detailed Adapters Reference

For real implementations of PostHog, LaunchDarkly, and In-Memory Feature Flag adapters, see:
- `references/env-feature-flags-examples.md`
