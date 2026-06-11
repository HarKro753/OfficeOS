---
title: Infinite Query Patterns
impact: MEDIUM
impactDescription: correct pagination and infinite scroll with consistent cache behavior
tags: tanstack-query, infinite-query, pagination, cursor, infinite-scroll, tkdodo
---

## Infinite Query Patterns

`useInfiniteQuery` manages paginated data as an array of pages in a single cache entry. It uses the same Query class internally — `data.pages` holds all fetched pages, `getNextPageParam` drives subsequent fetches. Follows [TkDodo's "How Infinite Queries Work"](https://tkdodo.eu/blog/the-power-of-infinite-queries) patterns.

**Incorrect (manual page tracking with useQuery):**

```typescript
import { useState } from 'react'
import { useSuspenseQuery, useQueryClient } from '@tanstack/react-query'
import { product } from '~/features/product/api/product'

function ProductFeed() {
  const [pages, setPages] = useState<Product[][]>([])
  const [cursor, setCursor] = useState<string | undefined>(undefined)

  // Each page is a separate cache entry — no unified data, manual deduplication needed
  const { data } = useSuspenseQuery(
    product.query.list({ query: { cursor, limit: 20 } }),
  )

  const loadMore = () => {
    // Manually tracking pages in state — duplicates cache, drifts on refetch
    setPages((prev) => [...prev, data.items])
    setCursor(data.nextCursor)
  }

  // Have to flatten manually, loses page boundaries
  const allProducts = [...pages.flat(), ...(data?.items ?? [])]

  return (
    <div>
      {allProducts.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
      {data.nextCursor && <button onClick={loadMore}>Load More</button>}
    </div>
  )
}
```

**Correct (useInfiniteQuery with getNextPageParam):**

```typescript
// app/features/product/api/product.ts — add infinite query option
import { infiniteQueryOptions } from '@tanstack/react-query'
import { listProductsOptions } from '~/core/api/generated/@tanstack/react-query.gen'

export const product = {
  // ... key, query, mutation (see api-query-key-factory)
  query: {
    // ...existing queries
    infinite: (options?: { query?: { limit?: number } }) =>
      infiniteQueryOptions({
        queryKey: [...product.key.all(), 'infinite', options] as const,
        queryFn: ({ pageParam }) =>
          listProductsOptions({
            query: {
              cursor: pageParam,
              limit: options?.query?.limit ?? 20,
            },
          }).queryFn!({ signal: new AbortController().signal }),
        // Required — the starting cursor
        initialPageParam: undefined as string | undefined,
        // Return undefined to signal no more pages
        getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
      }),
  },
} as const
```

```typescript
// app/features/product/components/product-feed.tsx
import { useSuspenseInfiniteQuery } from '@tanstack/react-query'
import { useInView } from 'react-intersection-observer'
import { useEffect } from 'react'
import { product } from '~/features/product/api/product'

function ProductFeed() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useSuspenseInfiniteQuery(product.query.infinite({ query: { limit: 20 } }))

  // Intersection observer for infinite scroll trigger
  const { ref, inView } = useInView({ threshold: 0 })

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      void fetchNextPage()
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage])

  // data.pages is an array of page responses — flatMap to get all items
  const allProducts = data.pages.flatMap((page) => page.items)

  return (
    <div>
      {allProducts.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}

      {/* Sentinel element — triggers fetchNextPage when scrolled into view */}
      <div ref={ref} aria-hidden="true">
        {isFetchingNextPage && <ProductCardSkeleton count={3} />}
      </div>

      {!hasNextPage && allProducts.length > 0 && (
        <p>No more products to load.</p>
      )}
    </div>
  )
}
```

```typescript
// Alternative: button-triggered pagination (better for frequently changing data)
// app/features/product/components/product-list-paginated.tsx
function ProductListPaginated() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useSuspenseInfiniteQuery(product.query.infinite({ query: { limit: 20 } }))

  const allProducts = data.pages.flatMap((page) => page.items)

  return (
    <div>
      {allProducts.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}

      {hasNextPage && (
        <button
          onClick={() => void fetchNextPage()}
          disabled={isFetchingNextPage}
        >
          {isFetchingNextPage ? 'Loading...' : 'Load More'}
        </button>
      )}
    </div>
  )
}
```

### Rules

1. `initialPageParam` is required — specifies the starting cursor or offset value
2. `getNextPageParam` drives all subsequent page fetching — return `undefined` to signal no more pages
3. Access all items via `data.pages.flatMap((page) => page.items)` — data is an array of pages, not a flat list
4. Refetches loop through ALL cached pages sequentially — can be expensive with many pages; consider manual refetch strategies or `maxPages` option for large datasets
5. Prefer button-triggered "Load More" over infinite scroll when data changes frequently, users need to bookmark positions, or page count is bounded
6. Use `infiniteQueryOptions` in the feature query object to keep the infinite query configuration colocated with standard queries
7. Guard `fetchNextPage` with `hasNextPage && !isFetchingNextPage` to prevent duplicate requests
