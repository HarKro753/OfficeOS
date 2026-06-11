---
title: Prefetch in Route Loaders
impact: HIGH
impactDescription: eliminates waterfalls, data is ready before the component renders
tags: tanstack-query, react-router, loader, prefetch, ensureQueryData, suspense, tkdodo
---

## Prefetch in Route Loaders

Use React Router loaders to prefetch data into the TanStack Query cache before the route renders. `queryClient.ensureQueryData()` returns cached data instantly if available and fresh, or fetches it when missing or stale. Components consume with `useSuspenseQuery` -- data is guaranteed available at render time. Based on TkDodo's "React Query meets React Router."

**Incorrect (fetching in useEffect -- waterfall after render):**

```typescript
// Component renders → useEffect fires → fetch starts → loading spinner → data arrives
// The user sees a blank page or spinner for every navigation
function ProductListPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    listProducts({ client: apiClient })
      .then(setProducts)
      .finally(() => setIsLoading(false))
  }, [])

  if (isLoading) return <Skeleton />

  return <ProductGrid products={products} />
}

// Route definition — no loader, data fetched after mount
const routes = [
  { path: '/products', element: <ProductListPage /> },
]
```

**Correct (loader with ensureQueryData + component with useSuspenseQuery):**

```typescript
// src/routes/products.tsx
import { queryClient } from '~/lib/query-client'
import { product } from '~/features/product/api/product'
import type { Route } from './+types/products'

// Loader prefetches into the query cache before the component renders.
// ensureQueryData returns cached data if fresh, fetches only when missing or stale.
export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url)
  const search = url.searchParams.get('q') ?? undefined

  await queryClient.ensureQueryData(
    product.query.list({ query: { search } }),
  )

  return null // Data lives in the query cache, not loader data
}

// Component is guaranteed to have data — no loading state needed
export default function ProductListPage({ loaderData }: Route.ComponentProps) {
  const [searchParams] = useSearchParams()
  const search = searchParams.get('q') ?? undefined

  const { data: products } = useSuspenseQuery(
    product.query.list({ query: { search } }),
  )

  return <ProductGrid products={products} />
}
```

```typescript
// src/routes/products.$productId.tsx — detail page with loader
import { queryClient } from '~/lib/query-client'
import { product } from '~/features/product/api/product'
import type { Route } from './+types/products.$productId'

export async function loader({ params }: Route.LoaderArgs) {
  await queryClient.ensureQueryData(
    product.query.detail({ path: { productId: params.productId } }),
  )

  return null
}

export default function ProductDetailPage({ params }: Route.ComponentProps) {
  const { data } = useSuspenseQuery(
    product.query.detail({ path: { productId: params.productId } }),
  )

  return <ProductView product={data} />
}
```

```typescript
// src/routes/products.$productId.edit.tsx — action with cache invalidation
import { queryClient } from '~/lib/query-client'
import { product } from '~/features/product/api/product'
import type { Route } from './+types/products.$productId.edit'

export async function loader({ params }: Route.LoaderArgs) {
  await queryClient.ensureQueryData(
    product.query.detail({ path: { productId: params.productId } }),
  )

  return null
}

// Action handles form submission and invalidates the cache.
// `await` on invalidateQueries blocks the transition until data is fresh —
// prevents layout shift. Remove `await` to transition instantly with
// a background refetch.
export async function action({ request, params }: Route.ActionArgs) {
  const formData = await request.formData()
  const body = Object.fromEntries(formData) as UpdateProductInput

  await updateProduct({
    path: { productId: params.productId },
    body,
    client: apiClient,
  })

  // Blocks transition until fresh data is in cache — no layout shift
  await queryClient.invalidateQueries({
    queryKey: product.key.detail({ path: { productId: params.productId } }),
  })
  await queryClient.invalidateQueries({
    queryKey: product.key.all(),
  })

  return redirect(`/products/${params.productId}`)
}

export default function ProductEditPage({ params }: Route.ComponentProps) {
  const { data } = useSuspenseQuery(
    product.query.detail({ path: { productId: params.productId } }),
  )

  return <ProductEditForm product={data} />
}
```

```typescript
// Parallel prefetching in a layout loader — multiple queries at once
// src/routes/dashboard.tsx
import { queryClient } from '~/lib/query-client'
import { product } from '~/features/product/api/product'
import { order } from '~/features/order/api/order'
import { account } from '~/features/account/api/account'

export async function loader() {
  // Fire all prefetches in parallel — don't await sequentially
  await Promise.all([
    queryClient.ensureQueryData(product.query.list()),
    queryClient.ensureQueryData(order.query.list({ query: { status: 'pending' } })),
    queryClient.ensureQueryData(account.query.balance()),
  ])

  return null
}
```

### How `ensureQueryData` Works

| Cache state | Behavior |
|---|---|
| Fresh data in cache | Returns immediately, no network request |
| Stale data in cache | Returns cached data, triggers background refetch |
| No data in cache | Fetches from the server, blocks until resolved |

### Invalidation Strategies in Actions

| Pattern | Behavior | Use when |
|---|---|---|
| `await invalidateQueries()` | Blocks route transition until fresh data arrives | Preventing layout shift matters |
| `invalidateQueries()` (no await) | Transitions instantly, refetches in background | Speed over consistency |
| `setQueryData()` + `invalidateQueries()` | Instant update from response + eventual consistency | Mutation response contains full entity |

### Rules

1. Prefetch data in route loaders using `queryClient.ensureQueryData()` -- never fetch in `useEffect`
2. Components consume with `useSuspenseQuery` so data is guaranteed available at render time
3. Use `await` on `invalidateQueries` in actions to block transitions and prevent layout shift
4. Fire multiple `ensureQueryData` calls with `Promise.all` to prefetch in parallel
5. Return `null` from loaders -- data lives in the query cache, not in loader return values
6. Use React Router v7 route types (`Route.LoaderArgs`, `Route.ComponentProps`) for type safety
