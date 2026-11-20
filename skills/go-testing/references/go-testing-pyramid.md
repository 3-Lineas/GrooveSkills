# Go 1.27 4-Tier Testing Pyramid, `goleak`, Fuzzing & Benchmarks

---

## 1. Tier 1 — Table-Driven Validation Test

```go
package customers_test

import (
	"testing"

	"myapp/internal/actions/customers"
	customerTypes "myapp/internal/types/customers"
)

func TestValidateCustomerInput(testingContext *testing.T) {
	testingContext.Parallel()

	testCases := []struct {
		name        string
		input       customerTypes.CreateCustomerInput
		expectError bool
	}{
		{
			name:        "accepts valid email",
			input:       customerTypes.CreateCustomerInput{Email: "ana@example.com"},
			expectError: false,
		},
		{
			name:        "rejects blank email",
			input:       customerTypes.CreateCustomerInput{Email: "   "},
			expectError: true,
		},
	}

	for _, testCase := range testCases {
		testingContext.Run(testCase.name, func(subtestContext *testing.T) {
			subtestContext.Parallel()

			validationError := customers.ValidateCustomerInput(
				subtestContext.Context(),
				testCase.input,
			)
			hasError := validationError != nil
			if hasError != testCase.expectError {
				subtestContext.Fatalf("expected error=%v, got error=%v", testCase.expectError, validationError)
			}
		})
	}
}
```

---

## 2. Tier 2 & 3 — Atomic Action & Concurrency with `goleak`

```go
package syncjobs_test

import (
	"testing"

	"go.uber.org/goleak"
)

func TestMain(testMain *testing.M) {
	goleak.VerifyTestMain(testMain)
}
```

Run with race detection and zero caching:

```bash
go test -race -count=1 ./...
```

---

## 3. Tier 4 — HTTP Handler Boundary Test (`httptest`)

```go
package orders_test

import (
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
)

func TestCreateOrderHandlerRejectsMalformedJSON(testingContext *testing.T) {
	testingContext.Parallel()

	request := httptest.NewRequestWithContext(
		testingContext.Context(),
		http.MethodPost,
		"/api/orders",
		strings.NewReader("{invalid-json"),
	)
	responseRecorder := httptest.NewRecorder()

	handler := buildTestCreateOrderHandler()
	handler.ServeHTTP(responseRecorder, request)

	if responseRecorder.Code != http.StatusBadRequest {
		testingContext.Fatalf("expected status 400, got %d", responseRecorder.Code)
	}
}
```

---

## 4. Fuzzing & Modern Benchmarks (`benchmarkContext.Loop()`)

```go
package orders_test

import (
	"encoding/json/v2"
	"testing"

	orderTypes "myapp/internal/types/orders"
)

func FuzzDecodeCreateOrderInput(fuzzContext *testing.F) {
	fuzzContext.Add([]byte(`{"customerId":"cust-1","totalCents":1500}`))

	fuzzContext.Fuzz(func(testingContext *testing.T, rawPayload []byte) {
		var parsed orderTypes.CreateOrderInput
		_ = json.Unmarshal(rawPayload, &parsed)
	})
}

func BenchmarkDecodeCreateOrderInput(benchmarkContext *testing.B) {
	rawPayload := []byte(`{"customerId":"cust-1","totalCents":1500}`)

	for benchmarkContext.Loop() {
		var parsed orderTypes.CreateOrderInput
		decodeError := json.Unmarshal(rawPayload, &parsed)
		if decodeError != nil {
			benchmarkContext.Fatal(decodeError)
		}
	}
}
```
