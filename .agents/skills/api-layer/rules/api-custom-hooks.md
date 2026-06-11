---
title: Compose Queries Beyond CRUD
impact: MEDIUM
impactDescription: derived and aggregated data from multiple endpoints
tags: tanstack-query, hooks, composition, derived, queries
---

## Compose Queries Beyond CRUD

Standard CRUD operations are handled by the feature query object pattern (see `api-query-key-factory`). Custom hooks are only needed when you compose data from multiple feature query objects or derive transformed data that doesn't map to a single endpoint.

**Default — use the feature query object directly:**

```typescript
import { useSuspenseQuery } from '@tanstack/react-query'
import { product } from '~/features/product/api/product'

function ProductList() {
  const { data: products } = useSuspenseQuery(product.query.list())
  const createProduct = product.mutation.useCreate()
  // No custom hook needed — the query object IS the API
}
```

**When to create a custom hook — composing multiple features:**

```typescript
// app/features/dashboard/hooks/use-dashboard-data.ts
import { useSuspenseQuery } from '@tanstack/react-query'
import { product } from '~/features/product/api/product'
import { order } from '~/features/order/api/order'
import { account } from '~/features/account/api/account'

export function useDashboardData() {
  const products = useSuspenseQuery(product.query.list())
  const pendingOrders = useSuspenseQuery(
    order.query.list({ query: { status: 'pending' } })
  )
  const balance = useSuspenseQuery(account.query.balance())

  return {
    totalProducts: products.data.length,
    pendingOrders: pendingOrders.data,
    balance: balance.data,
  }
}
```

**When to create a custom hook — transforming data for a specific UI:**

```typescript
// app/features/product/hooks/use-product-options.ts
import { useSuspenseQuery } from '@tanstack/react-query'
import { product } from '~/features/product/api/product'

export function useProductOptions() {
  const { data: products } = useSuspenseQuery(product.query.list())

  return products.map((p) => ({
    value: p.id,
    label: p.name,
  }))
}
```

**Decision tree:**
1. Single endpoint, no transform → use `feature.query.*` directly
2. Single endpoint, UI-specific transform → custom hook wrapping feature query
3. Multiple endpoints composed → custom hook combining feature queries
4. Everything else → the feature query object handles it

### useSuspenseQueries for Parallel Fetching

When composing multiple queries in a custom hook, use `useSuspenseQueries` (plural) to trigger all fetches **in parallel**. Individual `useSuspenseQuery` calls suspend sequentially — the first query suspends the component, and only after it resolves does the second query start:

```typescript
// INCORRECT: sequential fetching — each query waits for the previous to resolve
export function useDashboardData() {
  // Suspends here... waits for products to resolve
  const { data: products } = useSuspenseQuery(product.query.list())
  // Only THEN starts fetching orders
  const { data: orders } = useSuspenseQuery(
    order.query.list({ query: { status: 'pending' } })
  )
  // Only THEN starts fetching balance
  const { data: balance } = useSuspenseQuery(account.query.balance())

  return { products, orders, balance }
}

// CORRECT: parallel fetching — all three queries fire simultaneously
export function useDashboardData() {
  const [products, orders, balance] = useSuspenseQueries({
    queries: [
      product.query.list(),
      order.query.list({ query: { status: 'pending' } }),
      account.query.balance(),
    ],
  })

  return {
    products: products.data,
    orders: orders.data,
    balance: balance.data,
  }
}
```

This matters for dashboard-style views where multiple independent queries feed a single component. With `useSuspenseQueries`, the total load time is `max(query1, query2, query3)` instead of `query1 + query2 + query3`.

### Anti-pattern: Syncing Server State to Local State

Never copy TanStack Query data into local state via `useEffect`. This creates a stale copy that drifts from the cache whenever a background refetch updates the query data:

```typescript
// INCORRECT: creates a local copy that drifts from the cache
function ProductEditor({ id }: { id: string }) {
  const { data } = useSuspenseQuery(product.query.detail(id))
  const [localProduct, setLocalProduct] = useState(data)

  // This re-syncs on every refetch, causing UI flicker and lost local edits
  useEffect(() => {
    setLocalProduct(data)
  }, [data])

  return <input value={localProduct.name} onChange={...} />
}
```

Instead, derive computed values directly from the query data (see `api-derived-state.md` for the `select` option pattern). For editable forms, initialize local state once from the query data and use the mutation's `onSuccess` to reconcile — don't continuously sync.
