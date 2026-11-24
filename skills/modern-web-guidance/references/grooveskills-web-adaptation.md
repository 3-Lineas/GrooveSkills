# GrooveSkills Web Adaptation Guide

This guide bridges Google's vanilla `modern-web-guidance` recommendations with GrooveSkills' strict TypeScript, atomicity, and architecture rules.

## 1. Strict TypeScript: Zero `as any` for Emerging HTML Attributes

Upstream examples sometimes cast props or attributes with `as any` when React or TypeScript DOM types lag behind new HTML specs (e.g., `commandfor`, `command`, `closedby`, `popovertarget`). **Never use `as any` or `any` in GrooveSkills projects.**

Instead, add a dedicated module augmentation file in `src/types/web/html-attributes.d.ts`:

```ts
import "react";

declare module "react" {
  interface ButtonHTMLAttributes<T> {
    commandfor?: string;
    command?: "show-modal" | "close" | "toggle-popover" | "show-popover" | "hide-popover" | string;
  }

  interface DialogHTMLAttributes<T> {
    closedby?: "any" | "closerequest" | "none";
  }
}
```

## 2. SSR Guards & Hydration Safety (Next.js / Vinext)

- **Never access `window` or `document` during render**: Guard browser APIs inside `useEffect`, event handlers, or `if (typeof window === "undefined") return;`.
- **Feature Detection**:
  ```ts
  export function triggerViewTransition(updateDom: () => void): void {
    if (typeof document === "undefined" || !document.startViewTransition) {
      updateDom();
      return;
    }
    document.startViewTransition(updateDom);
  }
  ```
- **Unique IDs**: Use React's `useId()` for `popovertarget`, `commandfor`, and `anchor-name` pairs so multiple instances of a component never collide.

## 3. Tailwind v4 & CSS Layer Coexistence

- Keep `@starting-style`, `:root` custom properties (`color-scheme: light dark`), and `@view-transition` rules in global CSS (e.g., `src/styles/web-primitives.css`) rather than scoped CSS Modules.
- When combining with Tailwind CSS v4, place custom primitive rules inside `@layer components` or `@layer utilities` so cascade specificity remains predictable.

## 4. Atomicity & File Limits

- Keep every React component, hook, and utility under **200 lines**.
- Export at most **one** component, hook, or function per file.
- Keep domain/data types in `@/types/{domain}/{name}.type.ts`; only a component's own `Props` interface may live inline in its `.tsx` file.

## 5. Documenting Browser Support Policy in `AGENTS.md` / `CLAUDE.md`

If a project targets a controlled runtime (e.g., Tauri, Wails, Electron, or internal Chrome-only dashboards), document the **Browser Support** policy in `AGENTS.md` / `CLAUDE.md` so agents know when *Newly Available* features can be used without fallbacks:

```markdown
## Browser Support Policy
- Target: Modern Evergreen Browsers (Chrome 125+, Edge 125+, Firefox 128+, Safari 17.5+) / Desktop WebView.
- Newly Available Baseline features (e.g., `@starting-style`, `light-dark()`, `anchor-name`) may be used directly without JS polyfills unless specified otherwise.
```
