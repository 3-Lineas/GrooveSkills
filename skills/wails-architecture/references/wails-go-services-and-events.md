# Wails v3 Thin Go Bound Services & Typed Events

---

## 1. Thin Bound Service Blueprint (`internal/bridge/notes/notes_service.go`)

A bound service acts strictly as a thin controller:
- Manages lifecycle (`ServiceStartup` / `ServiceShutdown`) and cancellable background context.
- Protects shared multi-window state with `sync.RWMutex`.
- Delegates all business logic and DB queries to atomic Actions chained through `Pipeline`.
- Sanitizes technical errors into safe `AppError.UserMessage` strings before crossing the IPC bridge.

```go
package notes

import (
	"context"
	"errors"
	"log/slog"
	"sync"

	"github.com/wailsapp/wails/v3/pkg/application"
	"myapp/internal/actions/notes"
	"myapp/internal/errors/apperror"
	"myapp/internal/pipeline"
	noteTypes "myapp/internal/types/notes"
)

type NotesService struct {
	logger        *slog.Logger
	stateMutex    sync.RWMutex
	serviceCtx    context.Context
	cancelService context.CancelFunc
	validateNote  notes.ValidateNoteStep
	insertNote    notes.InsertNoteStep
}

func NewNotesService(
	logger *slog.Logger,
	validateNote notes.ValidateNoteStep,
	insertNote notes.InsertNoteStep,
) *NotesService {
	return &NotesService{
		logger:       logger,
		validateNote: validateNote,
		insertNote:   insertNote,
	}
}

func (service *NotesService) ServiceStartup(
	startupContext context.Context,
	_ application.ServiceOptions,
) error {
	service.stateMutex.Lock()
	defer service.stateMutex.Unlock()

	service.serviceCtx, service.cancelService = context.WithCancel(startupContext)
	return nil
}

func (service *NotesService) ServiceShutdown() error {
	service.stateMutex.Lock()
	defer service.stateMutex.Unlock()

	if service.cancelService != nil {
		service.cancelService()
	}
	return nil
}

func (service *NotesService) CreateNote(
	requestContext context.Context,
	input noteTypes.CreateNoteInput,
) (noteTypes.NoteRecord, error) {
	initialContext := noteTypes.CreateNoteContext{Input: input}

	resultContext, pipelineError := pipeline.Send(initialContext).
		Through(service.validateNote, service.insertNote).
		Run(requestContext)
	if pipelineError != nil {
		return noteTypes.NoteRecord{}, service.sanitizeError(pipelineError)
	}

	return resultContext.CreatedNote, nil
}

func (service *NotesService) sanitizeError(caughtError error) error {
	domainError, isDomainError := errors.AsType[*apperror.AppError](caughtError)
	if isDomainError {
		if !domainError.Silent {
			service.logger.Warn("notes service domain error", slog.String("code", domainError.Code))
		}
		return errors.New(domainError.UserMessage)
	}

	service.logger.Error("notes service internal error", slog.Any("error", caughtError))
	return errors.New("We could not save your note right now. Please try again.")
}
```

---

## 2. Background Goroutine with `defer recover()` & `app.Event.Emit`

```go
func (service *NotesService) StartBackgroundSync(desktopApp *application.App) {
	service.stateMutex.RLock()
	workerContext := service.serviceCtx
	service.stateMutex.RUnlock()

	go func() {
		defer func() {
			if recoveredPanic := recover(); recoveredPanic != nil {
				service.logger.Error("background sync panic recovered", slog.Any("panic", recoveredPanic))
			}
		}()

		if workerContext.Err() != nil {
			return
		}

		desktopApp.Event.Emit("notes:sync-progress", map[string]int{"percent": 100})
	}()
}
```
