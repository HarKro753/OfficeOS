---
title: Cache Seeding for Instant Navigation
impact: HIGH
impactDescription: eliminates loading spinners on list-to-detail transitions
tags: tanstack-query, initialData, placeholderData, cache, seeding, prefetch, tkdodo
---

## Cache Seeding for Instant Navigation

Pre-populate the detail query cache from list data so users never see a loading spinner when navigating from a list to a detail view. Choose between `initialData` (persists to cache, respects `staleTime`) and `placeholderData` (ephemeral, always triggers a background refetch). Based on TkDodo's "Placeholder and Initial Data" and "Seeding the Query Cache."

**Incorrect (no seeding -- separate loading spinners for list and detail):**

```typescript
// User clicks a product in the list → sees a full loading spinner
// even though we already fetched the product data in the list
function ProductDetail({ productId }: { productId: string }) {
  const { data: product, isLoading } = useQuery({
    ...product.query.detail({ path: { productId } }),
  })

  if (isLoading) return <Skeleton /> // Unnecessary spinner

  return <ProductView product={product!} />
}
```

**Correct (pull approach -- seed detail from list cache with `initialData`):**

```typescript
// Pull approach: detail query pulls initial data from the list cache.
// Use when list items contain all the fields the detail view needs.
function ProductDetail({ productId }: { productId: string }) {
  const queryClient = useQueryClient()

  const { data } = useSuspenseQuery({
    ...product.query.detail({ path: { productId } }),
    initialData: () => {
      // Pull this product from the list cache
      const products = queryClient.getQueryData<Product[]>(
        product.key.list()
      )
      return products?.find((p) => p.id === productId)
    },
    // Tie staleness to when the list was last fetched
    initialDataUpdatedAt: () =>
      queryClient.getQueryState(product.key.list())?.dataUpdatedAt,
  })

  return <ProductView product={data} />
}
```

**Correct (push approach -- populate detail caches inside list queryFn):**

```typescript
// Push approach: list queryFn pushes each item into the detail cache.
// Use when you want detail caches ready before the user clicks anything.

// With generated client:
export const product = {
  query: {
    list: (options?: Options<ListProductsData>) =>
      queryOptions({
        ...listProductsOptions(options),
        queryKey: product.key.list(options) as ReturnType<typeof listProductsQueryKey>,
        queryFn: async (context) => {
          const products = await listProductsOptions(options).queryFn(context)
          for (const item of products) {
            queryClient.setQueryData(product.key.detail(item.id), item)
          }
          return products
        },
      }),
  },
} as const

// Without generated client (manual ky):
export const product = {
  query: {
    list: () =>
      queryOptions({
        queryKey: product.key.list(),
        queryFn: async () => {
          const products = await client.get('products').json<Product[]>()
          for (const item of products) {
            queryClient.setQueryData(product.key.detail(item.id), item)
          }
          return products
        },
      }),
  },
} as const
```

**Correct (placeholderData -- when list items lack detail fields):**

```typescript
// List items have { id, name, price } but detail view needs { id, name, price, description, specs }.
// Use placeholderData since the seeded data is incomplete — always trigger a background refetch.
function ProductDetail({ productId }: { productId: string }) {
  const queryClient = useQueryClient()

  const { data, isPlaceholderData } = useSuspenseQuery({
    ...product.query.detail({ path: { productId } }),
    placeholderData: () => {
      const products = queryClient.getQueryData<ProductListItem[]>(
        product.key.list()
      )
      const partial = products?.find((p) => p.id === productId)
      // Return partial data shaped like the full type
      return partial
        ? { ...partial, description: '', specs: [] }
        : undefined
    },
  })

  return (
    <div className={isPlaceholderData ? 'opacity-70' : undefined}>
      <ProductView product={data} />
      {isPlaceholderData && (
        <div className="absolute inset-0 animate-pulse bg-muted/20" />
      )}
    </div>
  )
}
```

### `initialData` vs `placeholderData`

| Behavior | `initialData` | `placeholderData` |
|---|---|---|
| Persists to cache | Yes | No |
| Respects `staleTime` | Yes (use `initialDataUpdatedAt`) | No -- always refetches |
| On failed refetch | Survives in cache | Disappears (shows error state) |
| Status flag | N/A | `isPlaceholderData: true` |
| Best for | List items that match detail shape exactly | Partial data or shape mismatch |

### Decision Tree

1. List item has **all** detail fields? Use `initialData` + `initialDataUpdatedAt` (pull approach)
2. Want detail caches ready **before** user navigates? Use the push approach in the list `queryFn`
3. List item is **missing** some detail fields? Use `placeholderData` with a visual indicator
4. No list data available at all? Let the query fetch normally with Suspense

### Rules

1. Always seed detail caches from list data to avoid redundant loading spinners
2. Use `initialData` when list items fully match the detail shape; pair with `initialDataUpdatedAt`
3. Use `placeholderData` when list items are incomplete; show a visual indicator via `isPlaceholderData`
4. Choose pull (detail reads from list cache) or push (list writes to detail caches) based on access patterns
5. On failed refetch, `initialData` survives in cache but `placeholderData` disappears -- plan error states accordingly
