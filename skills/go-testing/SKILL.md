---
name: go-testing
description: Go 1.27 testing standards and 4-tier testing pyramid: AAA pattern, table-driven tests with t.Parallel(), modern Go 1.24-1.27 primitives (t.Context(), t.TempDir(), b.Loop(), stdversion vet), in-memory fakes over mocks, -race + goleak verification, and fuzz tests. TRIGGER when writing, maintaining, or fixing Go tests (*_test.go), benchmarks, or fuzz targets.
---

# Go 1.27 Testing Standards & 4-Tier Pyramid

Deterministic, fast, behavioral testing standards for Go 1.27 aligned with GrooveSkills `testing-vitest` and strict descriptive naming.

---

## 1. Golden Rules (Non-negotiable)

1. **Arrange-Act-Assert (AAA) & Behavioral Testing**:
   - Test observable contracts, return values, and domain errors — never private implementation details.
   - Keep every test file strictly under **200 lines**.

2. **Table-Driven Tests & Parallelism**:
   - Use table-driven tests with `testingContext.Run(testCase.name, func(subtestContext *testing.T) { ... })`.
   - Call `testingContext.Parallel()` and `subtestContext.Parallel()` whenever tests do not mutate shared global state.

3. **Modern Go 1.24–1.27 Testing Primitives**:
   - **`testingContext.Context()`**: use instead of `context.Background()` so cancellation propagates automatically when a test finishes.
   - **`testingContext.TempDir()`**: use for temporary filesystem fixtures (auto-cleaned).
   - **`testingContext.Cleanup(...)`** & **`testingContext.Helper()`**: register teardown deterministically and mark helper assertions so failure lines point to the caller.
   - **`benchmarkContext.Loop()`**: use in benchmarks instead of `for index := 0; index < benchmarkContext.N; index++` for accurate compiler-safe timing.
   - **Go 1.27 `stdversion` vet & `OutputType` JSON**: `go test` automatically runs the `stdversion` analyzer; CI parsers can rely on `OutputType` in `go test -json`.

4. **In-Memory Fakes Over Brittle Mocks**:
   - Prefer small consumer-side interfaces backed by in-memory fakes or SQLite `:memory:` over heavy reflection mock frameworks.
   - Use `net/http/httptest` (`httptest.NewRecorder`, `httptest.NewServer`) at HTTP boundaries.

5. **4-Tier Testing Pyramid**:
   - **Tier 1 — Types & Validation DTOs**: pure validation, Newtype parsing, `encoding/json/v2` boundary tests.
   - **Tier 2 — Atomic Actions**: single-query DB actions against SQLite `:memory:` or in-memory fakes.
   - **Tier 3 — Transactions & Concurrency**: multi-step `Pipeline` flows, `errgroup` cancellation, verified with `-race` and `goleak`.
   - **Tier 4 — HTTP Handlers & Wails v3 Services**: boundary status codes, sanitized `AppError.UserMessage` responses, and bound service methods without launching a WebView.

6. **Mandatory Verification Commands**:
   - Always run **`go test -race -count=1 ./...`** (disables test cache and enables the race detector).
   - Add fuzz targets (`Fuzz*`) for parsers, validators, and deserializers.

---

## 2. Deep Reference

- **Complete 4-Tier Examples, `goleak`, Fuzzing & `benchmarkContext.Loop()`**: [references/go-testing-pyramid.md](./references/go-testing-pyramid.md)
