# Go 1.27 Atomic Actions, Directory Taxonomy & Generic `Pipeline`

---

## 1. Canonical Directory Taxonomy

Organize by `{domain}` subfolders inside technical layers. Keep every file strictly under 200 lines with at most 1 exported function, action, handler, or type per file.

```text
cmd/
└── api/
    └── main.go                              # Composition root (DI, slog, graceful shutdown)
internal/
├── actions/
│   └── orders/
│       ├── find_customer_action.go          # 1 DB read query
│       ├── insert_order_action.go           # 1 DB write mutation
│       └── record_audit_event_action.go     # 1 DB write mutation
├── handlers/
│   └── orders/
│       └── create_order_handler.go          # Thin HTTP handler chaining Pipeline
├── pipeline/
│   └── pipeline.go                          # Lightweight generic Pipeline[ContextType]
├── types/
│   └── orders/
│       ├── create_order_input.go            # Request DTO
│       └── create_order_context.go          # Pipeline context struct
├── errors/
│   └── apperror/
│       └── app_error.go                     # AppError struct
└── adapters/
    └── postgres/
        └── open_pool.go                     # DB adapter
```

---

## 2. Lightweight Generic `Pipeline[ContextType]` (<40 Lines)

```go
package pipeline

import "context"

type Step[ContextType any] func(
	requestContext context.Context,
	pipelineContext ContextType,
) (ContextType, error)

type Pipeline[ContextType any] struct {
	initialContext ContextType
	steps          []Step[ContextType]
}

func Send[ContextType any](initialContext ContextType) *Pipeline[ContextType] {
	return &Pipeline[ContextType]{initialContext: initialContext}
}

func (currentPipeline *Pipeline[ContextType]) Through(
	steps ...Step[ContextType],
) *Pipeline[ContextType] {
	currentPipeline.steps = append(currentPipeline.steps, steps...)
	return currentPipeline
}

func (currentPipeline *Pipeline[ContextType]) Run(
	requestContext context.Context,
) (ContextType, error) {
	currentContext := currentPipeline.initialContext

	for _, step := range currentPipeline.steps {
		if requestContext.Err() != nil {
			return currentContext, requestContext.Err()
		}

		nextContext, stepError := step(requestContext, currentContext)
		if stepError != nil {
			return currentContext, stepError
		}
		currentContext = nextContext
	}

	return currentContext, nil
}
```

---

## 3. End-to-End Handler Chaining 3 Atomic Actions (`encoding/json/v2` + `uuid.NewV7`)

```go
package orders

import (
	"encoding/json/v2"
	"log/slog"
	"net/http"
	"uuid"

	"myapp/internal/actions/orders"
	"myapp/internal/pipeline"
	orderTypes "myapp/internal/types/orders"
)

func NewCreateOrderHandler(
	findCustomer orders.FindCustomerStep,
	insertOrder orders.InsertOrderStep,
	recordAudit orders.RecordAuditStep,
	logger *slog.Logger,
) http.HandlerFunc {
	return func(responseWriter http.ResponseWriter, request *http.Request) {
		var orderInput orderTypes.CreateOrderInput
		decodeError := json.UnmarshalRead(request.Body, &orderInput)
		if decodeError != nil {
			http.Error(responseWriter, "The order payload is invalid. Please check the fields and try again.", http.StatusBadRequest)
			return
		}

		initialContext := orderTypes.CreateOrderContext{
			OrderID:    uuid.NewV7().String(),
			CustomerID: orderInput.CustomerID,
			TotalCents: orderInput.TotalCents,
		}

		resultContext, pipelineError := pipeline.Send(initialContext).
			Through(findCustomer, insertOrder, recordAudit).
			Run(request.Context())
		if pipelineError != nil {
			WriteErrorResponse(responseWriter, logger, pipelineError)
			return
		}

		responseWriter.Header().Set("Content-Type", "application/json")
		responseWriter.WriteHeader(http.StatusCreated)
		_ = json.MarshalWrite(responseWriter, resultContext.CreatedOrder)
	}
}
```
