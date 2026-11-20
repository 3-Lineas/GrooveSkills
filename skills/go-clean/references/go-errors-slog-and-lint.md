# Go 1.27 Errors (`AppError` & `errors.AsType`), `log/slog`, and Linting

---

## 1. Domain `AppError` with `Unwrap()` & `errors.AsType`

Keep `AppError` in `internal/errors/apperror/app_error.go`. It separates internal technical details (logged once at the boundary) from safe, empathetic `UserMessage` copy.

```go
package apperror

import "fmt"

type AppError struct {
	Code        string
	StatusCode  int
	UserMessage string
	Silent      bool
	Cause       error
}

func (appError *AppError) Error() string {
	if appError.Cause == nil {
		return fmt.Sprintf("%s: %s", appError.Code, appError.UserMessage)
	}
	return fmt.Sprintf("%s: %s: %v", appError.Code, appError.UserMessage, appError.Cause)
}

func (appError *AppError) Unwrap() error {
	return appError.Cause
}
```

### Safe Extraction in Go 1.27 (`errors.AsType`)

```go
package handlers

import (
	"errors"
	"log/slog"
	"net/http"

	"myapp/internal/errors/apperror"
)

func WriteErrorResponse(
	responseWriter http.ResponseWriter,
	logger *slog.Logger,
	caughtError error,
) {
	domainError, isDomainError := errors.AsType[*apperror.AppError](caughtError)
	if !isDomainError {
		logger.Error("unexpected internal failure", slog.Any("error", caughtError))
		http.Error(responseWriter, "We could not complete your request right now. Please try again.", http.StatusInternalServerError)
		return
	}

	if !domainError.Silent {
		logger.Warn(
			"domain error returned to client",
			slog.String("code", domainError.Code),
			slog.Int("statusCode", domainError.StatusCode),
			slog.Any("cause", domainError.Cause),
		)
	}

	http.Error(responseWriter, domainError.UserMessage, domainError.StatusCode)
}
```

---

## 2. Adaptive `log/slog` Configuration

Configure `log/slog` once in `cmd/<app>/main.go` and inject `*slog.Logger` into handlers and adapters (zero package-level globals).

```go
package logging

import (
	"log/slog"
	"os"
)

func NewLogger(environment string) *slog.Logger {
	handlerOptions := &slog.HandlerOptions{
		Level: slog.LevelInfo,
	}

	if environment == "development" {
		handlerOptions.Level = slog.LevelDebug
		return slog.New(slog.NewTextHandler(os.Stdout, handlerOptions))
	}

	return slog.New(slog.NewJSONHandler(os.Stdout, handlerOptions))
}
```

---

## 3. Strict `.golangci.yml` (v2) & Go 1.27 `go vet`

```yaml
version: "2"

linters:
  enable:
    - bodyclose
    - contextcheck
    - errcheck
    - errname
    - errorlint
    - gocritic
    - govet
    - nilerr
    - noctx
    - revive
    - staticcheck
    - unconvert
    - unparam
    - wrapcheck

linters-settings:
  govet:
    enable-all: true

issues:
  max-issues-per-linter: 0
  max-same-issues: 0
```

### Go 1.27 `go vet` Notes
- **`printf` / `%w` strictness**: Go 1.27 `go vet` flags invalid `%w` usage and mismatched receiver/format arguments. Always pass an `error` value to `%w`.
- **`stdversion` analyzer**: Automatically runs during `go test` in Go 1.27 to catch standard library symbols newer than the `go` directive in `go.mod`.
- **Supply chain check**: Run `govulncheck ./...` in CI alongside `go vet ./...` and `golangci-lint run`.
