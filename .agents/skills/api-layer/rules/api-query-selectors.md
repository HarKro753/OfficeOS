---
title: Query Selectors for Transforms
impact: HIGH
impactDescription: avoids corrupting cached data, enables partial subscriptions that reduce rerenders
tags: tanstack-query, select, transform, rerender, structural-sharing, tkdodo
---

## Query Selectors for Transforms

Use TanStack Query's `select` option for data transformations instead of transforming in `queryFn` or the hook body. `select` keeps the original server response in the cache, enables partial subscriptions (components only rerender when their selected slice changes), and benefits from structural sharing. Based on TkDodo's "Data Transformations" and "Selectors Supercharged."

**Incorrect (transforming in queryFn -- corrupts the cache):**

```typescript
// The cache now stores the transformed array of strings instead of the full product objects.
// Any other component that needs full product data must refetch.
export const product = {
  query: {
    names: () =>
      queryOptions({
        ...listProductsOptions(),
        queryKey: product.key.list(),
        // Transforms BEFORE caching — the original Product[] is lost
        queryFn: async () => {
          const products = await listProducts({ client: apiClient })
          return products.map((p) => p.name) // Cache stores string[], not Product[]
        },
      }),
  },
}
```

**Incorrect (transforming in the hook body -- runs every render):**

```typescript
function ProductNameList() {
  const { data: products } = useSuspenseQuery(product.query.list())

  // Runs on EVERY render, even when products haven't changed
  const productNames = products.map((p) => p.name)

  return (
    <ul>
      {productNames.map((name) => (
        <li key={name}>{name}</li>
      ))}
    </ul>
  )
}
```

**Correct (using `select` with a stable reference):**

```typescript
// Partial subscription — component only rerenders when the count changes,
// not when other product fields are updated
const selectProductCount = (products: Product[]) => products.length

function ProductCount() {
  const { data: count } = useSuspenseQuery({
    ...product.query.list(),
    select: selectProductCount,
  })

  return <span>{count} products</span>
}
```

```typescript
// Transforming into select options — stable function reference outside the component
const selectProductOptions = (products: Product[]) =>
  products.map((p) => ({ value: p.id, label: p.name }))

function ProductSelect({ onSelect }: { onSelect: (id: string) => void }) {
  const { data: options } = useSuspenseQuery({
    ...product.query.list(),
    select: selectProductOptions,
  })

  return (
    <select onChange={(e) => onSelect(e.target.value)}>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  )
}
```

```typescript
// When the selector depends on props, stabilize with useCallback
function ProductsByCategory({ categoryId }: { categoryId: string }) {
  const selectByCategory = useCallback(
    (products: Product[]) => products.filter((p) => p.categoryId === categoryId),
    [categoryId],
  )

  const { data: filtered } = useSuspenseQuery({
    ...product.query.list(),
    select: selectByCategory,
  })

  return (
    <ul>
      {filtered.map((p) => (
        <li key={p.id}>{p.name}</li>
      ))}
    </ul>
  )
}
```

### Why `select` Over Other Approaches

| Approach | Cache contents | Rerenders | Structural sharing |
|---|---|---|---|
| Transform in `queryFn` | Transformed data (original lost) | On any cache update | No |
| Transform in hook body | Original data | Every render | No |
| `select` option | Original data (preserved) | Only when selected value changes | Yes |

TanStack Query applies **structural sharing** to `select` results. If your selector returns an object or array that is deeply equal to the previous result, the same reference is returned -- preventing unnecessary rerenders. This means (unlike Redux or Zustand selectors) you do not need to worry about returning new object references.

### Rules

1. Never transform data inside `queryFn` -- the cache should always store the original server response
2. Use `select` for any derived or transformed data that components consume
3. Define selector functions outside the component or stabilize with `useCallback` when they depend on props
4. Leverage partial subscriptions -- multiple components can `select` different slices from the same cached query
5. Trust structural sharing -- returning objects or arrays from `select` is safe without manual memoization
