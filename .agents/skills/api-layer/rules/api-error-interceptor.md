---
title: Centralized API Error Handling
impact: HIGH
impactDescription: consistent error UX, single place for auth redirects and error toasts
tags: error-handling, interceptor, axios, queryClient, 401, 403, toast
---

## Centralized API Error Handling

API errors should be handled in one place, not scattered across every component. Use ky's request hooks or a TanStack Query global error handler to intercept responses and route errors to the appropriate UI treatment: 401 redirects to login, 403 shows forbidden, 500 shows a toast, network errors show a retry prompt.

**Incorrect (error handling duplicated in every hook):**

```typescript
// src/features/products/hooks/use-products.ts
export function useProducts() {
  const navigate = useNavigate()

  return useQuery({
    queryKey: productKeys.list(),
    queryFn: async () => {
      const res = await productsListProducts({ client: apiClient })
      if (res.error) {
        if (res.error.status === 401) {
          navigate('/login')
        } else if (res.error.status === 403) {
          navigate('/forbidden')
        } else {
          toast.error('Something went wrong')
        }
        throw res.error
      }
      return res.data
    },
  })
}

// Repeated in use-orders.ts, use-users.ts, use-settings.ts...
```

**Correct (centralized via ky hooks + queryClient defaults):**

```typescript
// app/core/http/client.ts — ky client with error hooks
import ky from 'ky'

export const client = ky.create({
  prefixUrl: import.meta.env.VITE_API_BASE_URL,
  hooks: {
    afterResponse: [
      async (request, options, response) => {
        if (response.status === 401) {
          // Clear auth state and redirect
          // Use window.location for hard redirect outside React tree
          window.location.href = '/login'
        }
      },
    ],
  },
})
```

```typescript
// src/lib/query-client.ts — global TanStack Query error handling
import { QueryClient, type Mutation } from '@tanstack/react-query'
import { toast } from 'sonner'

function handleGlobalError(
  error: unknown,
  _query?: unknown,
  mutation?: Mutation<unknown, unknown, unknown, unknown>
) {
  // Skip if the hook provides its own onError
  if (mutation?.options.onError) return

  const status = (error as { status?: number }).status

  switch (status) {
    case 403:
      toast.error('You do not have permission to perform this action.')
      break
    case 404:
      // Silently ignore — component should handle empty state
      break
    case 422:
      // Validation errors — let the form hook handle them
      break
    case 500:
    case 502:
    case 503:
      toast.error('Something went wrong. Please try again later.')
      break
    default:
      if (!navigator.onLine) {
        toast.error('No internet connection. Check your network and retry.')
      } else {
        toast.error('An unexpected error occurred.')
      }
  }
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        const status = (error as { status?: number }).status
        // Don't retry auth or client errors
        if (status && status >= 400 && status < 500) return false
        return failureCount < 3
      },
      staleTime: 1000 * 60, // 1 minute
    },
    mutations: {
      onError: (error, _variables, _context, mutation) => {
        handleGlobalError(error, undefined, mutation)
      },
    },
  },
})
```

```typescript
// src/app/provider.tsx — wire up the query client
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from '@/lib/query-client'

export function AppProvider({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}
```

```typescript
// Individual hooks can still override for specific cases
// src/features/auth/hooks/use-login.ts
export function useLogin() {
  return useMutation({
    mutationFn: (credentials: LoginInput) =>
      client.post('auth/login', { json: credentials }).json(),
    onError: (error) => {
      // Custom handling — global handler is skipped for mutations with onError
      const status = (error as { status?: number }).status
      if (status === 401) {
        toast.error('Invalid email or password.')
      }
    },
  })
}
```

The ky `afterResponse` hook handles 401 redirects at the HTTP level. The `queryClient` default `onError` handles everything else with appropriate UI feedback. Individual hooks can override when they need specific behavior. This ensures every API error gets handled without any per-hook boilerplate.

### QueryCache.onError for Global Query Error Toasts

Query-level `onError` callbacks fire once **per Observer** (per component mounting the query). If three components use the same query, you get three toasts. Use `QueryCache.onError` instead — it fires once per query, not per observer. Only show a toast when the query already has cached data (`query.state.data !== undefined`), meaning it's a background refetch failure, not an initial load error (which the component should handle with its own error UI).

```typescript
import { QueryClient, QueryCache } from '@tanstack/react-query'
import { toast } from 'sonner'

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error, query) => {
      // Only toast on background refetch errors, not initial loads
      if (query.state.data !== undefined) {
        toast.error(`Background update failed: ${error.message}`)
      }
    },
  }),
  // ... defaultOptions
})
```

### throwOnError with Status-Based Routing

Route server errors (5xx) to Error Boundaries while keeping client errors (4xx) local for component-level handling. The `throwOnError` option accepts a function:

```typescript
// src/lib/query-client.ts
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      throwOnError: (error) =>
        error instanceof ApiError && error.status >= 500,
    },
  },
})
```

5xx errors propagate to the nearest `<ErrorBoundary>` (or React Router's `errorElement`), giving users a full-page "something went wrong" experience. 4xx errors stay in the query's `error` state for the component to handle inline (e.g., "not found" empty state, permission denied message).

### fetchStatus vs status

TanStack Query exposes two orthogonal status fields:

- **`status`** answers "do I have data?" — `pending` (no data yet), `error` (failed), or `success` (has data).
- **`fetchStatus`** answers "is the queryFn running?" — `fetching` (running now), `paused` (wants to run but offline), or `idle` (not running).

A query can be `status: 'success'` + `fetchStatus: 'fetching'` (background refetch with stale data) or `status: 'success'` + `fetchStatus: 'paused'` (has cached data, waiting for network to come back). Always check both when building loading indicators:

```typescript
const { data, status, fetchStatus } = useQuery(product.query.detail(id))

// Initial load — no data yet, currently fetching
if (status === 'pending' && fetchStatus === 'fetching') return <Skeleton />

// Offline with no cache — no data, paused
if (status === 'pending' && fetchStatus === 'paused') return <OfflineMessage />

// Has data — render it (may be refetching in background)
if (status === 'success') return <ProductDetail data={data} />
```
