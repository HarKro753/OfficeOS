---
title: Cache Invalidation Patterns
impact: HIGH
impactDescription: ensures UI reflects server state after mutations
tags: tanstack-query, cache, invalidation, mutation, stale-data
---

## Cache Invalidation Patterns

After a mutation succeeds, related cached data must be invalidated so the UI reflects the current server state. TanStack Query's hierarchical key matching makes this straightforward when combined with a key factory, but incorrect patterns lead to stale data or over-fetching.

**Incorrect (no invalidation or overly broad invalidation):**

```typescript
// Problem 1: No invalidation — UI stays stale after mutation
export function useCreateProduct() {
  return useMutation({
    mutationFn: (data: CreateProductInput) =>
      productsCreateProduct({ body: data, client: apiClient }),
    // Missing onSuccess — list still shows old data
  })
}

// Problem 2: Nuclear invalidation — refetches everything
export function useUpdateProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProductInput }) =>
      productsUpdateProduct({ path: { id }, body: data, client: apiClient }),
    onSuccess: () => {
      // Invalidates every query in the entire cache
      queryClient.invalidateQueries()
    },
  })
}
```

**Correct (targeted invalidation using key factory):**

```typescript
// src/features/products/hooks/use-create-product.ts
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { productsCreateProduct } from '@/lib/api'
import { apiClient } from '@/lib/api'
import { productKeys } from '../query-keys'

export function useCreateProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateProductInput) =>
      productsCreateProduct({ body: data, client: apiClient }),
    onSuccess: () => {
      // Invalidate all list queries (they need the new item)
      queryClient.invalidateQueries({ queryKey: productKeys.lists() })
    },
  })
}
```

```typescript
// src/features/products/hooks/use-update-product.ts
export function useUpdateProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProductInput }) =>
      productsUpdateProduct({ path: { id }, body: data, client: apiClient }),
    onSuccess: (_result, { id }) => {
      // Invalidate the specific detail and all lists
      queryClient.invalidateQueries({ queryKey: productKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: productKeys.lists() })
    },
  })
}
```

```typescript
// Invalidating related queries across features
// src/features/orders/hooks/use-create-order.ts
import { productKeys } from '@/features/products/query-keys'
import { orderKeys } from '../query-keys'

export function useCreateOrder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateOrderInput) =>
      ordersCreateOrder({ body: data, client: apiClient }),
    onSuccess: () => {
      // Invalidate order lists
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() })
      // Also invalidate product stock since order affects inventory
      queryClient.invalidateQueries({ queryKey: productKeys.lists() })
    },
  })
}
```

```typescript
// Direct cache update when the mutation response contains the full entity
export function useUpdateProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProductInput }) =>
      productsUpdateProduct({ path: { id }, body: data, client: apiClient }),
    onSuccess: (result, { id }) => {
      // Set the detail cache directly from the response
      queryClient.setQueryData(productKeys.detail(id), result.data)
      // Still invalidate lists since sort order or filters may change
      queryClient.invalidateQueries({ queryKey: productKeys.lists() })
    },
  })
}
```

Use `invalidateQueries` for list queries (triggers a refetch) and `setQueryData` for detail queries when the mutation response contains the full updated entity. Cross-feature invalidation is acceptable when mutations have side effects on other domains.

### Global MutationCache Auto-Invalidation

Instead of writing `onSuccess` invalidation in every mutation hook, configure `MutationCache.onSuccess` to automatically invalidate queries after any mutation. Use `meta.invalidates` for fine-grained control over which query keys to invalidate:

```typescript
import { QueryClient, MutationCache } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  mutationCache: new MutationCache({
    onSuccess: (_data, _variables, _context, mutation) => {
      const invalidates = mutation.options.meta?.invalidates as
        | string[][]
        | undefined

      if (invalidates) {
        // Targeted: only invalidate specified query keys
        invalidates.forEach((key) =>
          queryClient.invalidateQueries({ queryKey: key })
        )
      } else {
        // Default: invalidate all active queries
        queryClient.invalidateQueries()
      }
    },
  }),
})
```

```typescript
// Usage — mutations auto-invalidate without onSuccess boilerplate
export function useCreateProduct() {
  return useMutation({
    mutationFn: (data: CreateProductInput) =>
      productsCreateProduct({ body: data, client: apiClient }),
    // No onSuccess needed — MutationCache handles invalidation

    // Optional: scope invalidation via meta
    meta: {
      invalidates: [productKeys.lists()],
    },
  })
}
```

### void vs return: Fire-and-Forget vs Awaited Invalidation

The return value of `onSuccess` controls whether the mutation stays in `pending` state while queries refetch:

```typescript
// Fire-and-forget: mutation resolves immediately, queries refetch in background
onSuccess: () => {
  void queryClient.invalidateQueries({ queryKey: productKeys.lists() })
}

// Awaited: mutation stays pending until refetch completes
onSuccess: async () => {
  return queryClient.invalidateQueries({ queryKey: productKeys.lists() })
}
```

Use `void` (fire-and-forget) when the user should see the success state immediately (e.g., modal closes, form resets). Use `return` (awaited) when the user stays on the same page and you want the loading indicator to cover the entire refetch cycle.

### cancelRefetch: false to Prevent Duplicate Requests

When both a global handler (e.g., `MutationCache.onSuccess`) and a local `onSuccess` callback invalidate the same query keys, the second invalidation cancels and restarts the refetch triggered by the first. Use `cancelRefetch: false` to let the in-flight request finish instead:

```typescript
// Global handler triggers first invalidation
// Local handler adds cancelRefetch: false to avoid restarting it
onSuccess: (_result, { id }) => {
  queryClient.invalidateQueries({
    queryKey: productKeys.detail(id),
    cancelRefetch: false,
  })
}
```

`cancelRefetch` defaults to `true`. Setting it to `false` means "if this query is already refetching, don't cancel it — just mark it as invalidated so it refetches again when the current fetch completes." This prevents wasted network requests when multiple invalidation sources target the same queries.
