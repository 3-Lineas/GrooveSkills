# Modern Web Primitives & Baseline Reference (Offline Fallback)

Use this reference when offline or in a restricted sandbox without access to `pnpx modern-web-guidance@latest`.

## 1. HTML & Top-Layer UI

| Primitive | Use Case | Baseline Status | Notes |
| :--- | :--- | :--- | :--- |
| `<dialog>` + `showModal()` / `closedby` | Modals, confirmation dialogs | Widely Available | Native top-layer, backdrop (`::backdrop`), Escape handling, focus trapping. |
| Popover API (`popover`, `popovertarget`, `:popover-open`) | Tooltips, dropdown menus, non-modal overlays | Widely Available | Light-dismiss (`popover="auto"`) or manual (`popover="manual"`). Zero JS required for toggle. |
| Invoker Commands (`commandfor`, `command`) | Declarative button-to-dialog/popover actions | Newly Available | Replaces boilerplate `onClick` handlers for `show-modal`, `close`, `toggle-popover`. |
| Exclusive `<details name="...">` | Accordions | Widely Available | Native single-open accordion group without JS state. |
| `inert` attribute | Disable background interaction | Widely Available | Removes subtree from tab order, screen readers, and pointer events. |
| `<search>` landmark | Search form wrapper | Widely Available | Semantic landmark replacing `<div role="search">`. |

## 2. Modern CSS & Layouts

| Primitive | Use Case | Baseline Status | Notes |
| :--- | :--- | :--- | :--- |
| Container Queries (`@container`, `cqi`) | Component-driven responsive layouts | Widely Available | Query parent container size instead of viewport. |
| Anchor Positioning (`anchor-name`, `position-anchor`, `position-area`) | Tethered tooltips, popovers, menus | Newly Available | Provide a fallback position or `@supports (anchor-name: --a)` when targeting older browsers. |
| `@starting-style` + `transition-behavior: allow-discrete` | Entry/exit animations for `display: none` & top-layer | Newly Available | Enables pure CSS transitions on `<dialog>` and `[popover]`. |
| View Transitions (`document.startViewTransition`) | Smooth DOM state & route transitions | Newly Available | Always feature-detect `if (!document.startViewTransition)` and fall back to immediate DOM update. |
| Scroll-Driven Animations (`animation-timeline: scroll() / view()`) | Parallax, reveal-on-scroll, progress bars | Newly Available | Runs off the main thread; wrap in `@supports (animation-timeline: view())`. |
| `light-dark(lightVal, darkVal)` | Automatic theme color switching | Newly Available | Requires `color-scheme: light dark;` on `:root`. |
| `:has()`, CSS Nesting, Subgrid | Parent selectors, native nesting, aligned nested grids | Widely Available | Eliminates extra wrapper classes and JS DOM queries. |
| `content-visibility: auto` | Skip rendering off-screen sections | Newly Available | Pair with `contain-intrinsic-size` to prevent CLS. |
| `interpolate-size: allow-keywords` | Animate `height: 0` to `height: auto` | Newly Available | Pure CSS accordion/collapsible height transitions. |

## 3. Forms, Accessibility & Core Web Vitals (CWV)

- **Forms & Autofill**: Use native constraint validation (`required`, `minLength`, `pattern`, `:user-invalid`) and explicit `autocomplete` tokens (`email`, `current-password`, `one-time-code`).
- **LCP (Largest Contentful Paint)**: Add `fetchpriority="high"` on the hero `<img>`, use `<picture>` with `srcset`/`sizes`, and `decoding="async"` on non-critical images. Never lazy-load (`loading="lazy"`) the LCP image.
- **INP (Interaction to Next Paint)**: Break up long main-thread tasks using `scheduler.yield()` (with `setTimeout(..., 0)` fallback) so input events paint immediately.
- **CLS (Cumulative Layout Shift)**: Always set explicit `width` and `height` attributes (or CSS `aspect-ratio`) on images, videos, and async slots.

## 4. Client-Side JavaScript & Security

- **HTML Sanitization**: Prefer the native Sanitizer API (`setHTML()`) when available; fall back to `DOMPurify.sanitize()` for untrusted HTML strings. Never assign raw strings to `innerHTML` or `dangerouslySetInnerHTML`.
- **Passkeys (WebAuthn)**: Use `navigator.credentials.create()` / `get()` with `PublicKeyCredential.isConditionalMediationAvailable()` for autofill-assisted passkey sign-in.
- **Dates & Timezones**: Use `Intl.DateTimeFormat` / `Intl.RelativeTimeFormat` (Widely Available). For `Temporal`, gate behind a polyfill or feature check.
- **Utilities**: Use `structuredClone()` for deep cloning and `AbortSignal.timeout(ms)` for fetch timeouts instead of manual `AbortController` + `setTimeout`.
