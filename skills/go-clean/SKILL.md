---
name: go-clean
description: Modern Go 1.27 clean code standards, atomic architecture (1 function/action per file, <200 lines), guard clauses (zero nested ifs), strict descriptive naming, 1 DB query per Action with Pipeline chaining, encoding/json/v2, uuid.NewV7, errors.AsType, and log/slog. TRIGGER when writing or modifying Go files (*.go), go.mod, or designing Go services, handlers, actions, or adapters.
---

# Go Clean Code & Atomic Architecture (Go 1.27)

Enterprise Go 1.27 standards aligned with GrooveSkills non-negotiables: strict atomicity, flat guard clauses, explicit descriptive naming, typed errors without reflection, and modern standard-library-first engineering.

---

## 1. Golden Rules (Non-negotiable)

1. **Zero Nested `if`s — Guard Clauses & Early Returns**:
   - Validate preconditions at the top of every function and return immediately.
   - Keep the happy path flat and left-aligned. Never build pyramids of doom.

2. **Strict Atomic File Rule (`<200` Lines) & Technical Layers with Domain Subfolders**:
   - Export **at most ONE** function, action, HTTP handler, service, or domain type per file.
   - Organize code by `{domain}` subfolders inside technical layers:
     - `internal/actions/{domain}/` (atomic business/DB operations)
     - `internal/handlers/{domain}/` (HTTP / RPC transport controllers)
     - `internal/types/{domain}/` (domain structs, Newtypes, DTOs)
     - `internal/errors/{domain}/` (domain `AppError` constructors)
     - `internal/adapters/{domain}/` (external SDK & storage adapters)
   - Never create monolithic `internal/services/` or `pkg/utils/` dumping grounds.

3. **1 DB Call per Action & Pipeline Chaining**:
   - Every SQL query or mutation (`database/sql`, `pgx`, `sqlc`) lives in its own isolated atomic Action (maximum 1 DB call per Action).
   - Never write monolithic use-case actions that mix lookups, business rules, and writes.
   - Handlers and controllers chain atomic Actions sequentially using a lightweight generic `Pipeline[ContextType]` (see [go-actions-and-pipeline.md](./references/go-actions-and-pipeline.md)).

4. **Strict GrooveSkills Descriptive Naming (Rule #8)**:
   - Single-character, two-character, or cryptic identifiers are **strictly forbidden** — including in Go receivers, parameters, loop variables, and error variables (`d`, `a`, `s`, `p`, `i`, `tx`, `err`, `ctx`, `res`, `req`, `u`, `w`, `r`, `c`).
   - Always use explicit domain identifiers: `requestContext`, `queryError`, `validationError`, `caughtError`, `transaction`, `request`, `responseWriter`, `customerRecord`, `itemIndex`.
   - Follow Go casing conventions (`CamelCase` exported, `camelCase` unexported, uppercase acronyms like `UserID` / `ServeHTTP`) and avoid package stutter (`orders.Order` -> `orders.Record` or `order.Create`).

5. **Explicit Error Handling (Go 1.27)**:
   - Never ignore returned errors (`_ = ...`) and never use `panic` for expected production failures.
   - Wrap errors with context using `fmt.Errorf("load customer profile: %w", queryError)` (respecting Go 1.27 `go vet` strict `%w` / receiver checks).
   - Inspect sentinel and typed errors with `errors.Is` and **`errors.AsType[*AppError](caughtError)`** (zero reflection overhead).
   - Separate technical diagnostics (logged once at the boundary) from empathetic user-facing microcopy (`AppError.UserMessage`, following `ux-writing`). Never log-and-return in every layer.

6. **Modern Go 1.27 Standard Library First**:
   - **`encoding/json/v2`** (and `encoding/json/jsontext`): default JSON encoder/decoder (strict UTF-8 validation and duplicate-key rejection by default).
   - **`uuid` (`uuid.NewV7()`)**: time-ordered UUIDs directly from the Go 1.27 standard library without third-party dependencies.
   - **`log/slog`**: structured logging with typed `slog.Attr` fields. `fmt.Println` and `log.Printf` are forbidden in production code.
   - **Zero `any` / `interface{}` in Domain Contracts**: use concrete structs, Newtypes (`type CustomerID string`), constrained generics, Functional Options, and *"Accept small consumer-side interfaces, return concrete structs"*.

7. **Zero Tech-Debt Patches & Supply Chain Hygiene**:
   - Enforce `gofmt`, `go vet`, `golangci-lint` (v2), and `govulncheck` on every change.
   - Keep implementation details under `internal/`. Never add permissive fallbacks or silent compatibility shims.

---

## 2. Guard Clauses & Go 1.27 Error Inspection Example

```go
package customers

import (
	"context"
	"errors"
	"fmt"
	"strings"

	"myapp/internal/errors/apperror"
	"myapp/internal/types/customers"
)

func ValidateCustomerInput(
	requestContext context.Context,
	input customers.CreateCustomerInput,
) error {
	if requestContext.Err() != nil {
		return fmt.Errorf("customer validation aborted: %w", requestContext.Err())
	}

	trimmedEmail := strings.TrimSpace(input.Email)
	if trimmedEmail == "" || !strings.Contains(trimmedEmail, "@") {
		return apperror.NewValidationError(
			"INVALID_EMAIL",
			"Please enter a valid email address so we can send your confirmation.",
		)
	}

	return nil
}

func ExtractStatusCode(caughtError error) int {
	domainError, matched := errors.AsType[*apperror.AppError](caughtError)
	if !matched {
		return 500
	}
	return domainError.StatusCode
}
```

---

## 3. Deep References

- **Errors, `log/slog`, and `.golangci.yml` v2**: [references/go-errors-slog-and-lint.md](./references/go-errors-slog-and-lint.md)
- **Atomic Actions, Directory Taxonomy & Generic `Pipeline`**: [references/go-actions-and-pipeline.md](./references/go-actions-and-pipeline.md)
- **Concurrency & Runtime Safety**: pair with `go-concurrency-safety`
- **Testing Pyramid & Benchmarks**: pair with `go-testing`
