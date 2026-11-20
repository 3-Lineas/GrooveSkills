# Wails v3 Frontend Bridge Actions, Events, Pages & Vitest

---

## 1. Vite Configuration (`frontend/vite.config.ts`)

Register `groovepack()` from `@3lineas/groovepack/vite` and configure `GROOVEPACK_LOCALE` (never mix `NEXT_PUBLIC_GROOVEPACK_*`).

```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { groovepack } from "@3lineas/groovepack/vite";

export default defineConfig({
  plugins: [react(), groovepack()],
});
```

---

## 2. Bridge Action (`frontend/src/actions/notes/create-note.action.ts`)

Wrap the generated Wails v3 binding with `apiAction` (`@3lineas/groovepack/api-action`) and validate inputs with Valibot before crossing the IPC bridge.

```ts
import * as v from "valibot";
import { apiAction, type ActionResponse } from "@3lineas/groovepack/api-action";
import { CreateNote } from "../../../bindings/myapp/internal/bridge/notes/notesservice";
import { createNoteSchema } from "@/pages/notes/schemas/create-note.schema";
import type { CreateNoteInput } from "@/types/notes/create-note-input.type";
import type { NoteRecord } from "@/types/notes/note-record.type";

export async function createNoteAction(
  payload: CreateNoteInput,
): Promise<ActionResponse<NoteRecord>> {
  const validatedPayload = v.parse(createNoteSchema, payload);

  return apiAction<NoteRecord>({
    apiCall: () => CreateNote(validatedPayload),
  });
}
```

---

## 3. Domain Hook (`use-notes-page.ts`) & Event Hook (`use-notes-events.ts`)

```ts
// frontend/src/pages/notes/hooks/use-notes-page.ts
import { useState } from "react";
import { apiToast } from "@3lineas/groovepack/api-toast";
import { createNoteAction } from "@/actions/notes/create-note.action";
import type { CreateNoteInput } from "@/types/notes/create-note-input.type";
import type { NoteRecord } from "@/types/notes/note-record.type";

export function useNotesPage(initialNotes: NoteRecord[]) {
  const [notes, setNotes] = useState<NoteRecord[]>(initialNotes);

  async function handleCreateNote(input: CreateNoteInput) {
    const response = await apiToast(createNoteAction(input), {
      loadingMessage: "Saving your note...",
      successMessage: "Your note was saved.",
      errorMessage: "We could not save your note. Please try again.",
    });

    if (response.success && response.data) {
      setNotes((previousNotes) => [response.data, ...previousNotes]);
    }
  }

  return { notes, handleCreateNote };
}
```

```ts
// frontend/src/pages/notes/hooks/use-notes-events.ts
import { useEffect } from "react";
import { Events } from "@wailsio/runtime";

export function useNotesEvents(onSyncProgress: (percent: number) => void) {
  useEffect(() => {
    const unsubscribe = Events.On("notes:sync-progress", (event) => {
      const payload = event.data as { percent?: number } | undefined;
      if (typeof payload?.percent === "number") {
        onSyncProgress(payload.percent);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [onSyncProgress]);
}
```

---

## 4. Declarative Page & Vitest Bridge Test

Keep `frontend/src/pages/notes/notes-page.tsx` declarative with early returns (`if (isLoading) return <NotesSkeleton />;`), and test Bridge Actions in Vitest by mocking the generated binding module:

```ts
import { describe, expect, it, vi } from "vitest";
import { createNoteAction } from "@/actions/notes/create-note.action";

vi.mock("../../../bindings/myapp/internal/bridge/notes/notesservice", () => ({
  CreateNote: vi.fn().mockResolvedValue({ id: "note-1", title: "Release Notes" }),
}));

describe("createNoteAction", () => {
  it("returns a successful ActionResponse when the Wails binding resolves", async () => {
    const result = await createNoteAction({ title: "Release Notes" });
    expect(result.success).toBe(true);
    expect(result.data?.id).toBe("note-1");
  });
});
```
