---
title: Separate Server State from Client State
impact: CRITICAL
impactDescription: prevents stale data bugs and eliminates redundant state synchronization
tags: state, tanstack-query, zustand, server-state, client-state, caching
---

## Separate Server State from Client State

TanStack Query IS your server state manager. Server data (users, products, orders, anything from an API) belongs in TanStack Query's cache. Client-only data (sidebar open/closed, theme preference, notification toasts) belongs in Zustand or local state. Never duplicate server data into Zustand or React Context — it creates a second source of truth that inevitably drifts out of sync.

**The boundary is clear:**
- **TanStack Query** — data that originates on the server (fetched, cached, refetched, invalidated)
- **Zustand** — client-only global state (UI preferences, transient UI state shared across routes)
- **Local state** — ephemeral component state (open/closed, hover, input values)
- **URL state** — shareable state (filters, pagination, selected tab)

**Incorrect (duplicating server data into Zustand):**

```typescript
// store/user-store.ts — DON'T: mirrors server data in a client store
import { create } from "zustand";

interface UserStore {
  users: User[];
  isLoading: boolean;
  error: string | null;
  fetchUsers: () => Promise<void>;
}

const useUserStore = create<UserStore>((set) => ({
  users: [],
  isLoading: false,
  error: null,
  fetchUsers: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch("/api/users");
      const users = await res.json();
      set({ users, isLoading: false });
    } catch (err) {
      set({ error: (err as Error).message, isLoading: false });
    }
  },
}));

// components/user-list.tsx — manually triggers fetch, no caching, no refetch
function UserList() {
  const { users, isLoading, fetchUsers } = useUserStore();

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  if (isLoading) return <Spinner />;
  return <ul>{users.map((u) => <li key={u.id}>{u.name}</li>)}</ul>;
}
```

**Correct (TanStack Query for server data, Zustand only for client state):**

```typescript
// api/users.ts — query options factory
import { queryOptions } from "@tanstack/react-query";

export const usersQueryOptions = () =>
  queryOptions({
    queryKey: ["users"],
    queryFn: async (): Promise<User[]> => {
      const res = await fetch("/api/users");
      if (!res.ok) throw new Error("Failed to fetch users");
      return res.json();
    },
  });

// components/user-list.tsx — TanStack Query handles caching, refetching, deduplication
import { useSuspenseQuery } from "@tanstack/react-query";
import { usersQueryOptions } from "../api/users";

function UserList() {
  const { data: users } = useSuspenseQuery(usersQueryOptions());

  return <ul>{users.map((u) => <li key={u.id}>{u.name}</li>)}</ul>;
}

// store/ui-store.ts — Zustand ONLY for client-only state
import { create } from "zustand";

interface UIStore {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
}

export const useUIStore = create<UIStore>((set) => ({
  sidebarOpen: true,
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
}));
```

**Mutations also belong to TanStack Query:**

```typescript
// api/users.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newUser: CreateUserInput): Promise<User> => {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser),
      });
      if (!res.ok) throw new Error("Failed to create user");
      return res.json();
    },
    onSuccess: () => {
      // Invalidate and refetch — single source of truth stays in the cache
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}
```

If you find yourself writing `useEffect` to sync server data into a store, you are creating a second source of truth. Use TanStack Query as the cache and read from it directly.
