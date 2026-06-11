---
title: Effective Query Keys
impact: CRITICAL
impactDescription: prevents cache collisions, enables targeted invalidation
tags: tanstack-query, cache, query-keys, invalidation, hey-api, tkdodo
---

## Effective Query Keys

Query keys are the identity of cached data in TanStack Query. Build a custom key hierarchy on top of generated keys — combining your own generic-to-specific structure with the generated key factories for type safety. Follows [TkDodo's effective query keys](https://tkdodo.eu/blog/effective-react-query-keys) patterns.

### Principle 1: Keys Are Dependency Arrays

Treat query keys like `useEffect` dependency arrays. When state changes, update the key — TanStack Query refetches automatically. Don't imperatively refetch with new parameters.

**Incorrect (imperative refetch):**

```typescript
const { data, refetch } = useProductsList()

const handleFilter = (newFilters: Filters) => {
  refetch({ query: newFilters }) // Fighting the framework
}
```

**Correct (declarative key change):**

```typescript
const [filters, setFilters] = useState<Filters>({})
const { data } = useSuspenseQuery(product.query.list(filters))

// Just update state — TanStack Query handles the rest
const handleFilter = (newFilters: Filters) => setFilters(newFilters)
```

### Principle 2: Feature Query Object Pattern

Colocate keys, queries, and mutations in a single feature query object. Build your own key hierarchy on top of generated key factories — this gives you a clean generic-to-specific structure with cross-feature invalidation.

**Incorrect (scattered across files):**

```typescript
// keys.ts
export const orderKeys = { all: ['orders'] as const }

// queries.ts
export function useOrders() { ... }

// mutations.ts
export function useCreateOrder() { ... }
```

**Correct (single feature query object):**

```typescript
// app/features/order/api/order.ts
import { queryOptions, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  cancelOrderMutation,
  createOrderMutation,
  getOrderOptions,
  getOrderQueryKey,
  listOrdersOptions,
  listOrdersQueryKey,
} from '~/core/api/generated/@tanstack/react-query.gen'
import type { Options } from '~/core/api/generated/sdk.gen'
import type { GetOrderData, ListOrdersData } from '~/core/api/generated/types.gen'
import { account } from './account'

export const order = {
  key: {
    all: () => ['orders'] as const,
    list: (options?: Options<ListOrdersData>) =>
      [...order.key.all(), ...listOrdersQueryKey(options)],
    detail: (options: Options<GetOrderData>) =>
      [...order.key.all(), ...getOrderQueryKey(options)],
  },
  query: {
    list: (options?: Options<ListOrdersData>) =>
      queryOptions({
        ...listOrdersOptions(options),
        queryKey: order.key.list(options) as ReturnType<typeof listOrdersQueryKey>,
      }),
    detail: (options: Options<GetOrderData>) =>
      queryOptions({
        ...getOrderOptions(options),
        queryKey: order.key.detail(options) as ReturnType<typeof getOrderQueryKey>,
      }),
  },
  mutation: {
    useCreate: () => {
      const queryClient = useQueryClient()
      return useMutation({
        ...createOrderMutation(),
        onSuccess: () => {
          void queryClient.invalidateQueries({ queryKey: order.key.all() })
          void queryClient.invalidateQueries({ queryKey: account.key.all() })
        },
      })
    },
    useCancel: () => {
      const queryClient = useQueryClient()
      return useMutation({
        ...cancelOrderMutation(),
        onSuccess: () => {
          void queryClient.invalidateQueries({ queryKey: order.key.all() })
          void queryClient.invalidateQueries({ queryKey: account.key.all() })
        },
      })
    },
  },
} as const
```

### Why This Pattern Works

**Keys** — Custom hierarchy (`['orders', ...generatedKey]`) gives you a clean top-level namespace for bulk invalidation (`order.key.all()`) while preserving generated key specificity for individual queries.

**Queries** — `queryOptions` spreads generated options and overrides the queryKey with your custom hierarchy. This keeps all TanStack Query config (staleTime, gcTime, etc.) from the generated output while giving you control over cache structure.

**Mutations** — Hook factories within the object colocate invalidation logic with the mutation. Cross-feature invalidation (e.g., creating an order also invalidates account data) is explicit and discoverable.

### Consuming in Components

```typescript
import { useSuspenseQuery } from '@tanstack/react-query'
import { order } from '~/features/order/api/order'

function OrderList() {
  const { data: orders } = useSuspenseQuery(order.query.list())
  const createOrder = order.mutation.useCreate()

  return (
    <div>
      {orders.map((o) => <OrderCard key={o.id} order={o} />)}
      <button onClick={() => createOrder.mutate({ body: newOrder })}>
        Create Order
      </button>
    </div>
  )
}
```

### Without Code Generation (Manual Feature Query Object)

When there's no OpenAPI schema, the feature query object pattern is identical — only the `queryFn` source changes. Instead of spreading generated options, write the `queryFn` by hand using the ky client:

```typescript
// app/features/product/api/product.ts — manual version
import { queryOptions, useMutation, useQueryClient } from '@tanstack/react-query'
import { client } from '~/core/http/client'
import type { Product, CreateProductInput } from './types'

export const product = {
  key: {
    all: () => ['products'] as const,
    list: (filters?: ProductFilters) => [...product.key.all(), 'list', filters] as const,
    detail: (id: string) => [...product.key.all(), 'detail', id] as const,
  },
  query: {
    list: (filters?: ProductFilters) =>
      queryOptions({
        queryKey: product.key.list(filters),
        queryFn: () =>
          client.get('products', { searchParams: filters }).json<Product[]>(),
      }),
    detail: (id: string) =>
      queryOptions({
        queryKey: product.key.detail(id),
        queryFn: () => client.get(`products/${id}`).json<Product>(),
      }),
  },
  mutation: {
    useCreate: () => {
      const queryClient = useQueryClient()
      return useMutation({
        mutationFn: (input: CreateProductInput) =>
          client.post('products', { json: input }).json<Product>(),
        onSuccess: () => {
          void queryClient.invalidateQueries({ queryKey: product.key.all() })
        },
      })
    },
  },
} as const
```

The key difference: `queryFn` calls `client.get(...).json<T>()` directly instead of spreading `listProductsOptions()`. The `key`, `query`, and `mutation` structure is the same. Components consume identically:

```typescript
const { data } = useSuspenseQuery(product.query.list())
const createProduct = product.mutation.useCreate()
```

### Rules

1. One feature query object per domain entity (order, product, account)
2. Build custom key hierarchy — on top of generated factories (with codegen) or from scratch (manual)
3. Use `queryOptions` to compose queries with custom keys
4. Colocate mutation hooks with their invalidation logic
5. Cross-feature invalidation is explicit — import the other feature's key object
6. Use `void` before `invalidateQueries` to suppress floating promise warnings
