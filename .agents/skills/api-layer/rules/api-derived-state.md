---
title: Derive State from Server Cache
impact: CRITICAL
impactDescription: prevents state drift, eliminates sync bugs between server and client state
tags: tanstack-query, state, derived, useEffect, zustand, tkdodo
---

## Derive State from Server Cache

Never copy server state into client state. Server truth lives in the TanStack Query cache. Client state (selections, UI intent) lives in `useState` or Zustand. Derive combined state at render time — never sync with `useEffect`. Follows [TkDodo's "Don't over useState"](https://tkdodo.eu/blog/dont-over-use-state) patterns.

**Incorrect (useEffect syncing server data to local state):**

```typescript
import { useState, useEffect } from 'react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { product } from '~/features/product/api/product'

function ProductDetail({ productId }: { productId: string }) {
  const { data } = useSuspenseQuery(product.query.detail({ path: { id: productId } }))

  // Two sources of truth — local state drifts from cache on background refetch
  const [name, setName] = useState('')
  const [price, setPrice] = useState(0)
  const [category, setCategory] = useState('')

  useEffect(() => {
    // This fires on every refetch, but also re-runs stale closures,
    // overwrites user intent, and creates render cascades
    setName(data.name)
    setPrice(data.price)
    setCategory(data.category)
  }, [data])

  return (
    <div>
      <h1>{name}</h1>
      <p>{price}</p>
      <p>{category}</p>
    </div>
  )
}
```

```typescript
// Copying query data into a Zustand store — same problem at a different scale
import { create } from 'zustand'

interface ProductStore {
  products: Product[]
  setProducts: (products: Product[]) => void
  selectedId: string | null
  setSelectedId: (id: string | null) => void
}

const useProductStore = create<ProductStore>((set) => ({
  products: [],
  setProducts: (products) => set({ products }), // Duplicates the query cache
  selectedId: null,
  setSelectedId: (id) => set({ selectedId: id }),
}))

function ProductList() {
  const { data } = useSuspenseQuery(product.query.list())
  const { setProducts, products, selectedId } = useProductStore()

  // Sync loop: cache updates -> effect fires -> store updates -> re-render
  useEffect(() => {
    setProducts(data)
  }, [data, setProducts])

  const selected = products.find((p) => p.id === selectedId)
  // ...
}
```

**Correct (derive from query cache + client state at render time):**

```typescript
// app/features/product/components/product-detail.tsx
import { useSuspenseQuery } from '@tanstack/react-query'
import { product } from '~/features/product/api/product'

function ProductDetail({ productId }: { productId: string }) {
  // Server truth — always fresh from the cache
  const { data } = useSuspenseQuery(product.query.detail({ path: { id: productId } }))

  // Render directly from cache — no intermediate state, no sync bugs
  return (
    <div>
      <h1>{data.name}</h1>
      <p>{data.price}</p>
      <p>{data.category}</p>
    </div>
  )
}
```

```typescript
// app/features/product/components/product-list.tsx
import { useState } from 'react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { product } from '~/features/product/api/product'

function ProductList() {
  // Server truth — the query cache
  const { data: products } = useSuspenseQuery(product.query.list())

  // Client state — UI intent only ("user selected item X")
  const [selectedId, setSelectedId] = useState<string | null>(null)

  // Derived at render time — no sync, auto-heals if the item is deleted and restored
  const selectedProduct = products.find((p) => p.id === selectedId)

  // Graceful fallback — client selection ?? server default
  const activeProduct = selectedProduct ?? products[0] ?? null

  return (
    <div>
      <ul>
        {products.map((p) => (
          <li
            key={p.id}
            aria-selected={p.id === selectedId}
            onClick={() => setSelectedId(p.id)}
          >
            {p.name}
          </li>
        ))}
      </ul>
      {activeProduct && <ProductDetail productId={activeProduct.id} />}
    </div>
  )
}
```

```typescript
// If you need shared UI intent across components, store ONLY the intent in Zustand
import { create } from 'zustand'

interface ProductUIStore {
  selectedId: string | null
  setSelectedId: (id: string | null) => void
}

// Store holds UI intent, NOT server data
export const useProductUIStore = create<ProductUIStore>((set) => ({
  selectedId: null,
  setSelectedId: (id) => set({ selectedId: id }),
}))

function ProductSidebar() {
  const { data: products } = useSuspenseQuery(product.query.list())
  const { selectedId } = useProductUIStore()

  // Derive at render time — if the selected item was deleted server-side,
  // this gracefully returns undefined instead of showing stale data
  const selected = products.find((p) => p.id === selectedId)
  // ...
}
```

### Rules

1. Server state belongs in the TanStack Query cache — never copy it into `useState` or Zustand
2. Client state stores UI intent ("user selected X", "panel is open") — not validated data
3. Derive combined state at render time: `const value = items?.find(i => i.id === selectedId)`
4. Use `clientSelection ?? serverData?.default` for graceful fallback when selection is invalid
5. Derived state auto-heals: if a selected item is deleted and restored server-side, derivation handles it automatically — `useEffect` sync would have cleared the selection permanently
6. Forms are the ONE exception to this rule — see `api-form-integration` for when copying server state into form `defaultValues` is correct
