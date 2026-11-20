---
name: wails-architecture
description: Standardized Wails v3 desktop architecture (Go 1.27 + React/Vite): strict Wails v3 APIs only (zero v2 legacy), thin Go bound services delegating to Pipeline + atomic Actions, sanitized IPC errors, typed app.Event / @wailsio/runtime events, never edit frontend/bindings, and GroovePack frontend bridge (apiToast -> Bridge Action -> apiAction -> generated binding). TRIGGER when the project uses github.com/wailsapp/wails/v3, @wailsio/runtime, or build/config.yml. Replaces react-create-page in Wails desktop apps.
---

# Wails v3 Desktop Architecture (`wails-architecture`)

Canonical architectural standard for **Wails v3 + Go 1.27 + React/Vite** desktop applications. Analogous to `nextjs-architecture`, it replaces `react-create-page` in Wails desktop repositories and pairs with `go-clean`, `go-concurrency-safety`, `go-testing`, `react-core`, `react-advanced`, `valibot-validation`, `frontend-design`, and `groovepack-*`.

---

## 1. Golden Architectural Rules (Non-negotiable)

1. **Wails v3 Exclusively (Zero Legacy v2 APIs)**:
   - Every Wails project MUST use **`github.com/wailsapp/wails/v3`** (`application.New`, `application.NewService`, `app.Window.NewWithOptions`, `app.Event`, `@wailsio/runtime`, `frontend/bindings/`, and the `wails3` CLI).
   - Legacy Wails v2 APIs (`wails.Run`, `Bind: []interface{}`, `wailsjs/`, `runtime.EventsEmit(ctx, ...)`, `wails.json`) are **strictly forbidden**.

2. **Exclusive Desktop Scope (No Overlap with `react-create-page`)**:
   - In Wails v3 repositories, `wails-architecture` is the sole view/page architecture standard and automatically excludes `react-create-page`.

3. **Bound Services = Thin Controllers (Zero God-Structs)**:
   - Every bound service registered via `application.NewService(&DomainService{})` lives in `internal/bridge/{domain}/`.
   - Inject all dependencies via constructor (zero package-level globals).
   - Protect multi-window shared state with `sync.RWMutex`.
   - Implement `ServiceStartup` / `ServiceShutdown` whenever a service owns background workers, file handles, or connections.
   - Delegate all business logic and persistence to atomic Go Actions (`internal/actions/{domain}/`, max 1 DB query per Action) chained through `Pipeline`.

4. **IPC Error Sanitization & Trust Boundary Security**:
   - Wails v3 converts Go `error` returns from bound service methods into rejected TypeScript Promises.
   - Intercept technical errors inside the Go Service, log them once with `slog.Error`, and return **only** safe empathetic user-facing messages (`AppError.UserMessage`). Never leak OS file paths, stack traces, or raw SQL errors to the WebView.

5. **Async Heavy Work & Typed Events (`app.Event` / `@wailsio/runtime`)**:
   - Never block the IPC call with long-running tasks. Launch background work in a goroutine bound to a cancellable `context.Context` with `defer recover()`.
   - Emit namespaced events via `app.Event.Emit("sync:progress", payload)` (e.g. `sync:progress`, `printer:status`).
   - Subscribe in React using `Events.On` from `@wailsio/runtime` inside a dedicated event hook (`use-<domain>-events.ts`), always returning the unsubscribe callback from `useEffect` cleanup.

6. **Never Manually Edit `frontend/bindings/`**:
   - TypeScript bindings are generated strictly by `wails3 generate bindings` / `wails3 dev`. Treat `frontend/bindings/` as read-only generated output.

7. **Strict Frontend Communication Flow (Zero Direct Bindings in JSX or Hooks)**:
   ```text
   [ Declarative Page: frontend/src/pages/<domain>/<domain>-page.tsx ]
          │
          ▼
   [ Domain Hook: use-<domain>-page.ts ] ──► [ apiToast (@3lineas/groovepack/api-toast) ]
          │
          ▼
   [ Bridge Action: frontend/src/actions/<domain>/<action>.action.ts ]
          │ (wraps generated Promise via apiAction + Valibot boundary schema)
          ▼
   [ Generated Wails v3 Binding: frontend/bindings/<module>/<service> ]
          │ (Native IPC Bridge)
          ▼
   [ Thin Go Service: internal/bridge/<domain>/ ] ──► [ Pipeline -> Atomic Go Actions ]
   ```

8. **Atomic Co-location of Desktop Views (`frontend/src/pages/<domain>/`)**:
   - Co-locate `components/`, `hooks/` (`use-<domain>-page.ts` + `use-<domain>-events.ts`), `schemas/` (Valibot + `@formisch/react`), `types/`, and a declarative `<domain>-page.tsx` using early returns (`<Skeleton />` / empty states).
   - Register `groovepack()` from `@3lineas/groovepack/vite` in `frontend/vite.config.ts` and configure `GROOVEPACK_LOCALE`.
   - Enforce `<200` lines per file across both Go and TypeScript.

9. **Decoupled Testing (Zero WebView in Unit Tests)**:
   - Test Go Services and atomic Actions directly via `go test -race -count=1 ./...`.
   - Test React pages, hooks, and Bridge Actions in Vitest by mocking Bridge Actions or generated bindings without booting a WebView.

---

## 2. Deep References

- **Wails v3 Bootstrap, Multi-Window, Tray, Menus & `wails3` CLI**: [references/wails-v3-lifecycle-and-windows.md](./references/wails-v3-lifecycle-and-windows.md)
- **Thin Go Bound Services, `ServiceStartup`/`Shutdown`, `AppError` & Events**: [references/wails-go-services-and-events.md](./references/wails-go-services-and-events.md)
- **Frontend Bridge Actions, `apiToast`, `@wailsio/runtime` Events, Pages & Vitest**: [references/wails-frontend-bridge-and-pages.md](./references/wails-frontend-bridge-and-pages.md)
