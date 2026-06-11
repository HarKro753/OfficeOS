---
title: Optimistic Mutation Updates
impact: MEDIUM
impactDescription: instant UI feedback, improves perceived performance
tags: tanstack-query, optimistic, mutation, rollback, cache
---

## Optimistic Mutation Updates

Optimistic updates make the UI feel instant by updating the cache before the server responds. If the mutation fails, the cache rolls back to the previous state. Use the `onMutate`/`onError`/`onSettled` pattern in TanStack Query v5.

**Incorrect (no optimistic update, UI waits for server):**

```typescript
export function useToggleTodo() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, completed }: { id: string; completed: boolean }) =>
      todosUpdateTodo({
        path: { id },
        body: { completed },
        client: apiClient,
      }),
    onSuccess: () => {
      // UI freezes or shows spinner for 200-500ms until this fires
      queryClient.invalidateQueries({ queryKey: todoKeys.lists() })
    },
  })
}
```

**Correct (optimistic update with rollback):**

```typescript
// src/features/todos/hooks/use-toggle-todo.ts
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { todosUpdateTodo } from '@/lib/api'
import { apiClient } from '@/lib/api'
import { todoKeys } from '../query-keys'
import type { Todo } from '../types'

export function useToggleTodo() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, completed }: { id: string; completed: boolean }) =>
      todosUpdateTodo({
        path: { id },
        body: { completed },
        client: apiClient,
      }),

    onMutate: async ({ id, completed }) => {
      // 1. Cancel outgoing refetches so they don't overwrite our optimistic update
      await queryClient.cancelQueries({ queryKey: todoKeys.lists() })

      // 2. Snapshot the previous value for rollback
      const previousTodos = queryClient.getQueryData<Todo[]>(todoKeys.list())

      // 3. Optimistically update the cache
      queryClient.setQueryData<Todo[]>(todoKeys.list(), (old) =>
        old?.map((todo) =>
          todo.id === id ? { ...todo, completed } : todo
        )
      )

      // 4. Return snapshot in context for rollback
      return { previousTodos }
    },

    onError: (_error, _variables, context) => {
      // 5. Roll back to snapshot on failure
      if (context?.previousTodos) {
        queryClient.setQueryData(todoKeys.list(), context.previousTodos)
      }
    },

    onSettled: () => {
      // 6. Always refetch after mutation to ensure server state
      queryClient.invalidateQueries({ queryKey: todoKeys.lists() })
    },
  })
}
```

```typescript
// Optimistic update for adding an item to a list
// src/features/todos/hooks/use-create-todo.ts
export function useCreateTodo() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateTodoInput) =>
      todosCreateTodo({ body: data, client: apiClient }),

    onMutate: async (newTodo) => {
      await queryClient.cancelQueries({ queryKey: todoKeys.lists() })

      const previousTodos = queryClient.getQueryData<Todo[]>(todoKeys.list())

      // Add optimistic item with a temporary ID
      queryClient.setQueryData<Todo[]>(todoKeys.list(), (old) => [
        ...(old ?? []),
        {
          id: `temp-${Date.now()}`,
          ...newTodo,
          completed: false,
          createdAt: new Date().toISOString(),
        },
      ])

      return { previousTodos }
    },

    onError: (_error, _variables, context) => {
      if (context?.previousTodos) {
        queryClient.setQueryData(todoKeys.list(), context.previousTodos)
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: todoKeys.lists() })
    },
  })
}
```

Reserve optimistic updates for interactions where the user expects instant feedback (toggles, reordering, inline edits). For complex mutations where the server transforms data significantly, prefer showing a loading state and invalidating on success.

### Concurrent Mutation Guard

When multiple mutations target the same entity (e.g., rapid toggling, bulk edits), the `onSettled` invalidation can fire for each mutation, causing redundant refetches. Only the **last settling mutation** should trigger the invalidation:

```typescript
export function useToggleTodo() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['todos', 'toggle'],
    mutationFn: ({ id, completed }: { id: string; completed: boolean }) =>
      todosUpdateTodo({
        path: { id },
        body: { completed },
        client: apiClient,
      }),

    onMutate: async ({ id, completed }) => {
      await queryClient.cancelQueries({ queryKey: todoKeys.lists() })
      const previousTodos = queryClient.getQueryData<Todo[]>(todoKeys.list())
      queryClient.setQueryData<Todo[]>(todoKeys.list(), (old) =>
        old?.map((todo) =>
          todo.id === id ? { ...todo, completed } : todo
        )
      )
      return { previousTodos }
    },

    onError: (_error, _variables, context) => {
      if (context?.previousTodos) {
        queryClient.setQueryData(todoKeys.list(), context.previousTodos)
      }
    },

    onSettled: () => {
      // Only invalidate when this is the last in-flight mutation for this key
      if (
        queryClient.isMutating({ mutationKey: ['todos', 'toggle'] }) === 1
      ) {
        void queryClient.invalidateQueries({ queryKey: todoKeys.lists() })
      }
    },
  })
}
```

Key details for the concurrent mutation pattern:

- **Use `mutationKey` scoping**: Check `isMutating` with a specific `mutationKey` so you only count mutations of the same type. Without a `mutationKey`, `isMutating` counts all in-flight mutations, which can suppress unrelated invalidations.
- **Use imperative `queryClient.isMutating()`, not the `useMutating` hook**: Hooks create stale closures inside `onSettled` callbacks. The imperative `queryClient.isMutating()` reads the live count at the moment the callback executes.
- **The count is `1` (not `0`)**: At the time `onSettled` fires, the current mutation has not yet been removed from the mutation cache. So "I am the last one" means the count equals `1`.

### When NOT to Use Optimistic Updates

Do not use optimistic updates for **sorted or filtered lists where the mutation changes filter membership**. For example, if the user marks a todo as complete and the current view only shows incomplete todos, the optimistic update needs to remove the item from the list. But the server may apply additional business logic (cascading updates, computed fields, permission checks) that the client cannot replicate. Trying to mirror server filter logic client-side leads to subtle bugs.

Instead, use a **loading state** on the individual item and invalidate on success:

```typescript
// Prefer this for mutations that change filter/sort membership
export function useCompleteTodo() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id }: { id: string }) =>
      todosUpdateTodo({
        path: { id },
        body: { completed: true },
        client: apiClient,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: todoKeys.lists() })
    },
  })
}

// In the component, use `isPending` on the mutation for per-item loading
function TodoItem({ todo }: { todo: Todo }) {
  const completeTodo = useCompleteTodo()

  return (
    <li style={{ opacity: completeTodo.isPending ? 0.5 : 1 }}>
      {todo.title}
      <button
        onClick={() => completeTodo.mutate({ id: todo.id })}
        disabled={completeTodo.isPending}
      >
        Complete
      </button>
    </li>
  )
}
```
