---
title: Query Defaults Strategy
impact: HIGH
impactDescription: prevents unnecessary refetches, aligns cache lifetime with data volatility
tags: tanstack-query, staleTime, gcTime, defaults, refetch, tkdodo
---

## Query Defaults Strategy

`staleTime: 0` (the default) means every component mount triggers a background refetch. Instead of disabling refetch flags, increase `staleTime` to match how often the underlying data actually changes. Use `queryClient.setQueryDefaults` for per-entity granularity. Based on TkDodo's "React Query as a State Manager" and "Thinking in React Query."

**Incorrect (leaving defaults or disabling refetch triggers):**

```typescript
// Problem 1: Default staleTime: 0 — every mount refetches
const queryClient = new QueryClient()

// Problem 2: Disabling refetch flags to "fix" the symptom
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // Hides stale data instead of solving it
      refetchOnMount: false,       // Components show stale data silently
      refetchOnReconnect: false,   // Data never updates after network recovery
    },
  },
})
```

**Correct (project-wide staleTime + per-entity overrides):**

```typescript
// src/lib/query-client.ts
import { QueryClient } from '@tanstack/react-query'
import { product } from '~/features/product/api/product'
import { user } from '~/features/user/api/user'
import { config } from '~/features/config/api/config'
import { notification } from '~/features/notification/api/notification'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Sensible project-wide default — most data is fine for 1 minute
      staleTime: 1000 * 60,
      // Keep unused data in cache for 5 minutes before garbage collection
      gcTime: 1000 * 60 * 5,
      // Leave refetch triggers ON — staleTime controls when they actually fire
    },
  },
})

// Per-entity overrides — match staleTime to data volatility
// User profile rarely changes during a session
queryClient.setQueryDefaults(user.key.all(), {
  staleTime: 1000 * 60 * 5, // 5 minutes
})

// App config is essentially static after initial load
queryClient.setQueryDefaults(config.key.all(), {
  staleTime: Infinity,
})

// Notifications change frequently — keep a short window
queryClient.setQueryDefaults(notification.key.all(), {
  staleTime: 1000 * 30, // 30 seconds
})

// Product catalog changes occasionally
queryClient.setQueryDefaults(product.key.all(), {
  staleTime: 1000 * 60 * 2, // 2 minutes
})
```

```typescript
// WebSocket-driven data: staleTime Infinity + manual invalidation
// src/features/chat/api/chat.ts
import { queryOptions, useQueryClient } from '@tanstack/react-query'
import { listMessagesOptions, listMessagesQueryKey } from '~/core/api/generated/@tanstack/react-query.gen'
import type { Options } from '~/core/api/generated/sdk.gen'
import type { ListMessagesData } from '~/core/api/generated/types.gen'

export const chat = {
  key: {
    all: () => ['chat'] as const,
    messages: (options: Options<ListMessagesData>) =>
      [...chat.key.all(), ...listMessagesQueryKey(options)],
  },
  query: {
    messages: (options: Options<ListMessagesData>) =>
      queryOptions({
        ...listMessagesOptions(options),
        queryKey: chat.key.messages(options) as ReturnType<typeof listMessagesQueryKey>,
        staleTime: Infinity, // Server pushes updates via WebSocket
      }),
  },
} as const

// In the WebSocket handler — manually invalidate when the server pushes new data
export function useChatSocket(channelId: string) {
  const queryClient = useQueryClient()

  useEffect(() => {
    const ws = new WebSocket(`${WS_URL}/channels/${channelId}`)

    ws.onmessage = () => {
      void queryClient.invalidateQueries({
        queryKey: chat.key.messages({ path: { channelId } }),
      })
    }

    return () => ws.close()
  }, [channelId, queryClient])
}
```

### How staleTime and Refetch Triggers Interact

| Scenario | `staleTime: 0` (default) | `staleTime: 60_000` |
|---|---|---|
| Component mounts | Refetches in background | Serves cache, no refetch |
| Window regains focus | Refetches in background | Refetches only if > 60s since last fetch |
| Network reconnects | Refetches in background | Refetches only if > 60s since last fetch |

The refetch triggers (`refetchOnWindowFocus`, `refetchOnMount`, `refetchOnReconnect`) only fire when data is **stale**. Setting an appropriate `staleTime` makes them work for you instead of against you.

### Rules

1. Always set a project-wide `staleTime` in `QueryClient` defaults -- never leave the default `0`
2. Use `queryClient.setQueryDefaults` to override per entity, matching `staleTime` to data volatility
3. Never disable `refetchOnWindowFocus` or `refetchOnMount` -- increase `staleTime` instead
4. Use `staleTime: Infinity` for data updated via WebSocket or other push mechanisms
5. Set `gcTime` higher than `staleTime` so stale-but-cached data is still available while refetching
