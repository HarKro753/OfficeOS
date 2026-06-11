---
title: Data-First Status Checks
impact: HIGH
impactDescription: prevents cached data from being hidden during background refetch failures
tags: tanstack-query, status, error, pending, suspense, stale-while-revalidate, tkdodo
---

## Data-First Status Checks

Check `data` before `error` before `isPending`. Background refetches can fail — with status-first checking, a failed background refetch replaces valid cached data with an error screen. Data-first respects stale-while-revalidate: show cached data with an error indicator, don't hide it. Follows [TkDodo's "Status Checks in React Query"](https://tkdodo.eu/blog/status-checks-in-react-query) patterns.

**Incorrect (status-first hides cached data on background refetch failure):**

```typescript
import { useQuery } from '@tanstack/react-query'
import { order } from '~/features/order/api/order'

function OrderList() {
  const { data, error, isPending } = useQuery(order.query.list())

  // Status-first: if a background refetch fails while cached data exists,
  // the user sees a full-page error instead of their cached order list
  if (isPending) {
    return <OrderListSkeleton />
  }

  if (error) {
    // This fires on background refetch failure — hides perfectly valid cached data
    return <ErrorScreen message={error.message} />
  }

  // Data is only rendered if there's no error at all — even transient ones
  return (
    <ul>
      {data.map((o) => (
        <OrderCard key={o.id} order={o} />
      ))}
    </ul>
  )
}
```

**Correct (data-first preserves cached data during transient failures):**

```typescript
// app/features/order/components/order-list.tsx
import { useQuery } from '@tanstack/react-query'
import { order } from '~/features/order/api/order'

function OrderList() {
  const { data, error, isPending } = useQuery(order.query.list())

  // Data-first: show cached data even if a background refetch just failed
  if (data) {
    return (
      <div>
        {error && (
          <Banner variant="warning">
            Failed to refresh — showing cached data.
            <button onClick={() => void refetch()}>Retry</button>
          </Banner>
        )}
        <ul>
          {data.map((o) => (
            <OrderCard key={o.id} order={o} />
          ))}
        </ul>
      </div>
    )
  }

  // Error without any cached data — true failure on initial fetch
  if (error) {
    return <ErrorScreen message={error.message} />
  }

  // No data yet, no error — initial load
  if (isPending) {
    return <OrderListSkeleton />
  }

  return null
}
```

**Preferred (useSuspenseQuery eliminates status checks entirely):**

```typescript
// app/features/order/components/order-list.tsx
import { useSuspenseQuery } from '@tanstack/react-query'
import { order } from '~/features/order/api/order'

function OrderList() {
  // data is ALWAYS defined — no status checks needed
  // Errors go to the nearest ErrorBoundary, loading goes to the nearest Suspense
  const { data } = useSuspenseQuery(order.query.list())

  return (
    <ul>
      {data.map((o) => (
        <OrderCard key={o.id} order={o} />
      ))}
    </ul>
  )
}

// Wrap with boundaries at the route or layout level
// app/routes/orders.tsx
import { Suspense } from 'react'
import { ErrorBoundary } from 'react-error-boundary'

export default function OrdersRoute() {
  return (
    <ErrorBoundary fallback={<ErrorScreen />}>
      <Suspense fallback={<OrderListSkeleton />}>
        <OrderList />
      </Suspense>
    </ErrorBoundary>
  )
}
```

### Rules

1. With `useQuery`: check `data` first, then `error`, then `isPending` — data-first order
2. When cached data exists alongside an error, show the data with an error indicator — don't replace it with an error screen
3. Prefer `useSuspenseQuery` — `data` is always defined, errors go to `ErrorBoundary`, loading goes to `Suspense`
4. Place `ErrorBoundary` and `Suspense` at route or layout boundaries, not around every query consumer
5. Reserve `useQuery` (non-suspense) for cases where you need fine-grained control over loading/error states within a component (e.g., inline error messages, partial loading)
