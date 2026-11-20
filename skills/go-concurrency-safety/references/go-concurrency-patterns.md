# Go 1.27 Concurrency Patterns

---

## 1. Bounded Worker Pool with `errgroup.WithContext` + `SetLimit`

```go
package syncjobs

import (
	"context"
	"fmt"

	"golang.org/x/sync/errgroup"
)

func SyncCatalogItems(
	requestContext context.Context,
	itemIdentifiers []string,
	maxConcurrency int,
	syncOneItem func(context.Context, string) error,
) error {
	if maxConcurrency <= 0 {
		maxConcurrency = 4
	}

	workerGroup, groupContext := errgroup.WithContext(requestContext)
	workerGroup.SetLimit(maxConcurrency)

	for _, itemIdentifier := range itemIdentifiers {
		workerGroup.Go(func() error {
			if groupContext.Err() != nil {
				return groupContext.Err()
			}

			syncError := syncOneItem(groupContext, itemIdentifier)
			if syncError != nil {
				return fmt.Errorf("sync item %s: %w", itemIdentifier, syncError)
			}
			return nil
		})
	}

	return workerGroup.Wait()
}
```

---

## 2. Graceful Shutdown with `signal.NotifyContext`

```go
package main

import (
	"context"
	"errors"
	"log/slog"
	"net/http"
	"os/signal"
	"syscall"
	"time"
)

func RunHTTPServer(
	rootContext context.Context,
	httpServer *http.Server,
	logger *slog.Logger,
) error {
	signalContext, stopSignals := signal.NotifyContext(
		rootContext,
		syscall.SIGINT,
		syscall.SIGTERM,
	)
	defer stopSignals()

	serverErrors := make(chan error, 1)
	go func() {
		listenError := httpServer.ListenAndServe()
		if listenError != nil && !errors.Is(listenError, http.ErrServerClosed) {
			serverErrors <- listenError
		}
		close(serverErrors)
	}()

	select {
	case listenError := <-serverErrors:
		return listenError
	case <-signalContext.Done():
		logger.Info("shutdown signal received, draining active requests")
	}

	shutdownContext, cancelShutdown := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancelShutdown()

	return httpServer.Shutdown(shutdownContext)
}
```

---

## 3. Shared State with `sync.RWMutex` & Channel Ownership

- **Channel ownership**: only the sender closes a channel; receivers never call `close(...)`.
- **Pointer receivers only**: structs embedding or containing `sync.RWMutex` must only be passed by pointer.

```go
package state

import "sync"

type ActiveSessionsStore struct {
	mutex    sync.RWMutex
	sessions map[string]string
}

func NewActiveSessionsStore(initialCapacity int) *ActiveSessionsStore {
	return &ActiveSessionsStore{
		sessions: make(map[string]string, initialCapacity),
	}
}

func (store *ActiveSessionsStore) Set(sessionID string, accountID string) {
	store.mutex.Lock()
	defer store.mutex.Unlock()
	store.sessions[sessionID] = accountID
}

func (store *ActiveSessionsStore) Get(sessionID string) (string, bool) {
	store.mutex.RLock()
	defer store.mutex.RUnlock()
	accountID, exists := store.sessions[sessionID]
	return accountID, exists
}
```
