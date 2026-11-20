---
name: go-concurrency-safety
description: Go 1.27 concurrency, context propagation, errgroup structured concurrency, goroutine leak profiling, panic recovery, timer hygiene, and runtime safety (nil maps, slice aliasing, mutex copying, defer in loops). TRIGGER when writing goroutines, channels, sync primitives, context.Context flows, worker pools, or graceful shutdown in Go.
---

# Go 1.27 Concurrency, Context & Runtime Safety

Deterministic concurrency and runtime safety standards for Go 1.27. Every concurrent operation must have bounded parallelism, explicit cancellation, zero goroutine leaks, and descriptive GrooveSkills naming.

---

## 1. Golden Rules (Non-negotiable)

1. **`context.Context` as First Parameter (`requestContext`)**:
   - Always pass `requestContext context.Context` as the first parameter of any I/O, DB, HTTP, or concurrent function.
   - Never replace an incoming `requestContext` with `context.Background()` mid-flow.
   - Never store `context.Context` inside a struct field.
   - Never abuse `context.WithValue` for optional function parameters or dependency injection; restrict it strictly to request-scoped metadata (trace ID, authenticated actor).

2. **Structured Concurrency with `errgroup`**:
   - Prefer `golang.org/x/sync/errgroup` (`errgroup.WithContext(requestContext)` + `workerGroup.SetLimit(maxConcurrency)`) over unbounded `go func()` launches or manual `sync.WaitGroup` + error channels.
   - Every concurrent fan-out must declare an explicit concurrency ceiling (`SetLimit`).

3. **Goroutine Lifecycle, Leak Profiling (Go 1.27) & Panic Recovery**:
   - Never spawn a goroutine without knowing exactly how and when it exits.
   - Detached background goroutines (e.g., event dispatchers, desktop workers) must include `defer recover()` and log the recovered panic with `slog.Error`.
   - Use Go 1.27's native goroutine leak profiler in `runtime/pprof` (alongside `goleak` in tests) to detect leaked goroutines blocked on channels or locks.

4. **Runtime Safety (`golang-safety`)**:
   - **Nil Maps**: Always initialize maps with `make(map[Key]Value, expectedCount)` before writing; writing to a `nil` map panics.
   - **Slice Aliasing**: Never assume `append` allocates a new backing array; use `slices.Clone(sourceSlice)` or full-slice expressions (`sourceSlice[:length:length]`) when returning or mutating shared slices.
   - **Never Copy `sync.Mutex` / `sync.RWMutex`**: Pass structs containing mutexes by pointer (`*StateStore`) only.
   - **No `defer` Inside Loops**: `defer` executes when the surrounding function returns, not at loop iteration end. Extract the loop body into an atomic helper function.
   - **Timer Hygiene (Go 1.27)**: Never call `time.After(...)` inside a `for`/`select` loop. Use `time.NewTimer(duration)` with `defer timer.Stop()` and `timer.Reset(duration)`. In Go 1.27, timer channels are always synchronous/unbuffered (`GODEBUG=asynctimerchan` has been removed).

5. **Performance Hygiene**:
   - Preallocate slices and maps when capacity is known (`make([]OrderRecord, 0, len(rawItems))`).
   - Use `strings.Builder` for string concatenation inside loops.
   - Always close `http.Response.Body` (and drain when reusing connections) and `sql.Rows` with `defer` immediately after checking the error.

---

## 2. Quick Anti-Pattern Checklist

| Anti-Pattern | Risk | Correct Go 1.27 Pattern |
| :--- | :--- | :--- |
| Unbounded `go processItem(item)` in loop | Memory exhaustion & DB pool starvation | `errgroup.WithContext` + `SetLimit(maxWorkers)` |
| `time.After(5 * time.Second)` in `select` loop | Unnecessary timer allocations per iteration | `timer := time.NewTimer(...)` + `Stop()` / `Reset()` |
| `defer fileHandle.Close()` inside `for` loop | File descriptor exhaustion | Extract iteration body into atomic helper function |
| Writing to `var cache map[string]int` | Runtime panic (`assignment to entry in nil map`) | `cache := make(map[string]int, initialCapacity)` |
| Ignoring `requestContext.Done()` in channel send | Permanent goroutine leak | `select { case output <- item: case <-requestContext.Done(): return }` |

---

## 3. Deep Reference

- **Bounded `errgroup`, Graceful Shutdown & Shared State Patterns**: [references/go-concurrency-patterns.md](./references/go-concurrency-patterns.md)
