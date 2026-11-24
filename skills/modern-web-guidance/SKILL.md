---
name: modern-web-guidance
description: Search tool and native web primitives guidance for modern HTML, CSS, and client-side JavaScript with verified Baseline support. TRIGGER before implementing or updating HTML/CSS, layouts, animations, modals/dialogs/popovers, tables, dark mode, anchor positioning, container queries, view transitions, scroll-driven animations, forms/validation/autofill, accessibility, custom selects, Core Web Vitals (LCP, INP, CLS), content-visibility, fetchpriority, image optimization, passkeys, HTML sanitization, Web Components, Temporal/dates, Built-in AI, or WebAssembly.
---

# Modern Web Guidance

Use native, Baseline-verified HTML, CSS, and client-side JavaScript primitives instead of legacy workarounds or unnecessary JavaScript libraries. This skill combines Google Chrome's live `modern-web-guidance` catalog (200+ guides maintained by Chrome, Edge, Firefox, and MDN) with GrooveSkills' strict TypeScript and atomic architecture standards.

## 1. Strict Trigger & Explicit Exclusions

- **Mandatory First Step**: Execute this workflow BEFORE writing or modifying HTML, CSS, DOM APIs, or client-side UI logic for:
  - Modals, dialogs, popovers, tooltips, custom `<select>`, accordions (`<details>`), or `inert`
  - Layouts, Container Queries (`@container`), Subgrid, CSS Nesting, `:has()`, `light-dark()`, Anchor Positioning
  - View Transitions, Scroll-Driven Animations, `@starting-style`, `interpolate-size: allow-keywords`
  - Forms, native validation, `autocomplete`/autofill, accessibility, focus management
  - Core Web Vitals (LCP, INP, CLS), `content-visibility`, `fetchpriority`, `<picture>`/`srcset`
  - Security & client JS: Sanitizer API, Passkeys (WebAuthn), `Temporal`/`Intl`, `structuredClone`, `AbortSignal.timeout()`, Web Components, Built-in AI, WebAssembly
- **Do NOT Trigger For**:
  - Pure backend logic (SQL, ORMs, Hono/API routes, workers, queues)
  - Infrastructure/CI/CD (Docker, GitHub Actions, Wrangler config)
  - Non-web languages (Python, Go, Rust, Dart) or trivial tooling (`tsconfig`, ESLint, unit tests, copy edits)

## 2. Primary Workflow (4 Steps)

1. **Search (`search`)**: Query the live catalog using 2–5 generic web-platform keywords (never include framework names like React/Vue or business domain terms):
   ```bash
   pnpx modern-web-guidance@latest search "<2-5 generic keywords>"
   ```
   *(Use `npx` if `pnpm` is unavailable in the environment.)*
2. **Retrieve (`retrieve`)**: Fetch the full guide(s) by ID:
   ```bash
   pnpx modern-web-guidance@latest retrieve "<id1,id2>"
   ```
3. **Verify Compliance & Baseline**:
   - **Widely Available**: Use directly without a JavaScript fallback or polyfill by default.
   - **Newly Available**: Include the recommended progressive enhancement or fallback unless the project's `AGENTS.md` / `CLAUDE.md` defines a custom **Browser Support** policy that already covers it.
   - **Zero `as any`**: Never use `as any` for emerging HTML attributes in JSX/TSX. Use strict TypeScript module augmentation or typed interfaces (see [grooveskills-web-adaptation.md](./references/grooveskills-web-adaptation.md)).
4. **Disclose (`### Modern Web Guidance`)**: At the end of your response, include a concise section listing the guide IDs/titles applied and their Baseline status.

## 3. Modernization Audit Flow (`legacy-scan`)

When performing an open-ended modernization audit of an existing web codebase:
```bash
pnpx modern-web-guidance@latest legacy-scan <path> --json
```
Evaluate every finding against its `keepWhen` and `dropWhen` rubrics before recommending or applying a refactor. Do not blindly replace legacy patterns if `keepWhen` conditions apply.

## 4. Offline & Sandbox Fallback

If the environment has no network access or `pnpx` fails in a sandbox:
1. Retry with `--offline` if a local CLI cache exists:
   ```bash
   pnpx modern-web-guidance@latest search "<query>" --offline
   ```
2. Consult the local offline references bundled with this skill:
   - [modern-web-primitives-and-baseline.md](./references/modern-web-primitives-and-baseline.md) — Core HTML, CSS, CWV, and Client JS primitives with Baseline status.
   - [grooveskills-web-adaptation.md](./references/grooveskills-web-adaptation.md) — Strict TypeScript typing (zero `as any`), SSR guards, `useId()`, Tailwind v4 coexistence, and Browser Support policy template.

## 5. Framework Adaptation Rules

- **SSR Guards**: Always guard browser-only APIs (`window`, `document`, `startViewTransition`, `navigator.credentials`) with `typeof window !== "undefined"` or run them inside `useEffect` / event handlers.
- **Unique IDs**: Use React's `useId()` (or framework equivalent) for `popovertarget`, `commandfor`, and `anchor-name` pairs to avoid collisions across multiple component instances.
- **Unscoped CSS Primitives**: Keep `@starting-style`, `:root` tokens, and `@view-transition` rules unscoped (not trapped inside CSS Modules or scoped component styles that rewrite selectors).
