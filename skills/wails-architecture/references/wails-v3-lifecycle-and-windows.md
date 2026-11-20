# Wails v3 Lifecycle, Multi-Window, System Tray & CLI

---

## 1. Composition Root (`main.go` / `cmd/desktop/main.go`)

Use `application.New`, `embed.FS`, `application.AssetFileServerFS`, and `application.NewService(...)`. Never use Wails v2 `wails.Run` or `Bind: []interface{}`.

```go
package main

import (
	"embed"
	"log/slog"
	"os"

	"github.com/wailsapp/wails/v3/pkg/application"
	notesBridge "myapp/internal/bridge/notes"
)

//go:embed all:frontend/dist
var frontendAssets embed.FS

func main() {
	logger := slog.New(slog.NewJSONHandler(os.Stdout, nil))
	notesService := notesBridge.NewNotesService(logger)

	desktopApp := application.New(application.Options{
		Name:        "MyDesktopApp",
		Description: "Enterprise desktop workspace",
		Services: []application.Service{
			application.NewService(notesService),
		},
		Assets: application.AssetOptions{
			Handler: application.AssetFileServerFS(frontendAssets),
		},
		Mac: application.MacOptions{
			ApplicationShouldTerminateAfterLastWindowClosed: true,
		},
	})

	desktopApp.Window.NewWithOptions(application.WebviewWindowOptions{
		Title:            "Workspace",
		Width:            1280,
		Height:           800,
		BackgroundColour: application.NewRGB(18, 18, 22),
		URL:              "/",
	})

	runError := desktopApp.Run()
	if runError != nil {
		logger.Error("desktop application terminated with error", slog.Any("error", runError))
		os.Exit(1)
	}
}
```

---

## 2. Multi-Window, Native Menus & System Tray

- **Secondary Windows**: create lazily via `desktopApp.Window.NewWithOptions(application.WebviewWindowOptions{ Name: "settings", URL: "/settings", Width: 640, Height: 480 })`.
- **System Tray**: create via `systemTray := desktopApp.SystemTray.New()` and attach a menu built with `desktopApp.NewMenu()`.
- **Window & Service Coordination**: pass the `*application.App` reference into services via `ServiceStartup` options or explicit setter — never store `desktopApp` as a mutable package global.

---

## 3. Essential `wails3` CLI Commands

| Command | Purpose |
| :--- | :--- |
| `wails3 init -n my-app -t react-ts` | Scaffold a new Wails v3 + React TypeScript project |
| `wails3 dev` | Start live Go + Vite dev server and regenerate `frontend/bindings/` |
| `wails3 generate bindings` | Regenerate TypeScript bindings in `frontend/bindings/` |
| `wails3 build` | Build production desktop binary |
| `wails3 package` | Package platform installers (`.dmg`, `.msi`, `.AppImage`) |

---

## 4. Wails v2 Guardrails (Strictly Forbidden)

| Legacy Wails v2 (Forbidden) | Canonical Wails v3 (Required) |
| :--- | :--- |
| `wails.Run(&options.App{ Bind: []interface{}{...} })` | `application.New(application.Options{ Services: []application.Service{ application.NewService(...) } })` |
| `frontend/wailsjs/go/...` | `frontend/bindings/<module>/...` |
| `runtime.EventsEmit(ctx, "name", data)` | `desktopApp.Event.Emit("domain:event", data)` |
| `wails.json` | `build/config.yml` |
| `wails dev` / `wails build` | `wails3 dev` / `wails3 build` |
