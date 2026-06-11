---
title: Don't Create Global State Prematurely
impact: MEDIUM
impactDescription: prevents unnecessary coupling and makes features easier to test and refactor
tags: state, architecture, zustand, context, colocation
---

## Don't Create Global State Prematurely

Do not create a Zustand store or top-level context provider "just in case" or "because we might need it elsewhere later." If only one component tree needs the state, use local state or a feature-level context. Global state should be the last tool you reach for, not the default starting point.

**Signs you created global state prematurely:**
- The store is only used in one route or feature
- You added the store "for future use" but nothing else reads from it
- You wrapped the entire app in a provider when only one page needs it
- The store duplicates data already available from TanStack Query or URL params

**Incorrect (global store for a single feature):**

```typescript
// store/kanban-store.ts — global store for one page
import { create } from "zustand";

interface KanbanStore {
  columns: Column[];
  draggedCard: Card | null;
  setDraggedCard: (card: Card | null) => void;
  moveCard: (cardId: string, fromCol: string, toCol: string) => void;
}

// This store is ONLY used on the /board page, yet it's globally accessible
export const useKanbanStore = create<KanbanStore>((set) => ({
  columns: [],
  draggedCard: null,
  setDraggedCard: (card) => set({ draggedCard: card }),
  moveCard: (cardId, fromCol, toCol) =>
    set((s) => {
      // ... complex column logic
      return { columns: updatedColumns };
    }),
}));

// app.tsx — no provider needed since it's a global store,
// but the state is accessible everywhere unnecessarily
```

**Correct (feature-level context scoped to the board page):**

```typescript
// features/board/context.tsx — scoped to the feature that needs it
interface BoardState {
  draggedCard: Card | null;
}

interface BoardActions {
  setDraggedCard: (card: Card | null) => void;
  moveCard: (cardId: string, fromCol: string, toCol: string) => void;
}

interface BoardContextValue {
  state: BoardState;
  actions: BoardActions;
}

const BoardContext = createContext<BoardContextValue | null>(null);

export function useBoard() {
  const ctx = use(BoardContext);
  if (!ctx) throw new Error("useBoard must be used within BoardProvider");
  return ctx;
}

export function BoardProvider({ children }: { children: React.ReactNode }) {
  const [draggedCard, setDraggedCard] = useState<Card | null>(null);
  const queryClient = useQueryClient();

  const moveCardMutation = useMutation({
    mutationFn: moveCardApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["board"] });
    },
  });

  const actions: BoardActions = {
    setDraggedCard,
    moveCard: (cardId, fromCol, toCol) => {
      moveCardMutation.mutate({ cardId, fromCol, toCol });
    },
  };

  return (
    <BoardContext value={{ state: { draggedCard }, actions }}>
      {children}
    </BoardContext>
  );
}

// routes/board.tsx — provider wraps only the page that needs it
function BoardPage() {
  return (
    <BoardProvider>
      <BoardHeader />
      <BoardColumns />
    </BoardProvider>
  );
}
```

**When global state IS justified:**

```typescript
// store/ui-store.ts — these are genuinely app-wide concerns
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UISlice {
  sidebarOpen: boolean;
  theme: "light" | "dark" | "system";
  toggleSidebar: () => void;
  setTheme: (theme: "light" | "dark" | "system") => void;
}

export const useUIStore = create<UISlice>()(
  persist(
    (set) => ({
      sidebarOpen: true,
      theme: "system",
      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
      setTheme: (theme) => set({ theme }),
    }),
    { name: "ui-preferences" },
  ),
);
```

**Decision checklist before creating global state:**

1. Is this state used by components in multiple unrelated routes? If no, use local or feature context.
2. Does this state need to persist across route changes? If no, local state is fine.
3. Is this server data? If yes, it belongs in TanStack Query, not a store.
4. Should this be in the URL? If it should be shareable or bookmarkable, use search params.
5. After all the above, does it still need to be global? Only then create a Zustand store.

The cost of premature global state is not the store itself — it is the implicit coupling it creates between features that should be independent.
