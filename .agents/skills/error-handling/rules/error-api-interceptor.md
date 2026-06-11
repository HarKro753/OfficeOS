---
title: Centralized API Error Interceptor
impact: CRITICAL
impactDescription: eliminates duplicated error handling across every component
tags: api, tanstack-query, interceptor, http-errors, auth, error-handling
---

## Centralized API Error Interceptor

Without centralized error handling, every component that fetches data must independently handle 401s, 403s, 500s, and network errors. This leads to inconsistent behavior (some components redirect on 401, others don't) and massive duplication. Centralize it once in TanStack Query's global defaults and a shared fetch wrapper.

**Incorrect (error handling duplicated in every component):**

```typescript
// features/dashboard/hooks/use-dashboard-data.ts
function useDashboardData() {
  return useQuery({
    queryKey: ["dashboard"],
    queryFn: async () => {
      const res = await fetch("/api/dashboard");
      if (res.status === 401) {
        window.location.href = "/login"; // Duplicated everywhere
      }
      if (res.status === 403) {
        throw new Error("Forbidden"); // Inconsistent handling
      }
      if (!res.ok) {
        throw new Error("Failed to fetch"); // Generic message
      }
      return res.json();
    },
  });
}

// features/settings/hooks/use-settings.ts — same error handling repeated
function useSettings() {
  return useQuery({
    queryKey: ["settings"],
    queryFn: async () => {
      const res = await fetch("/api/settings");
      if (res.status === 401) {
        window.location.href = "/login"; // Copy-pasted
      }
      // Forgot to handle 403 here — inconsistent!
      if (!res.ok) {
        throw new Error("Failed to fetch");
      }
      return res.json();
    },
  });
}
```

**Correct (centralized error handling):**

```typescript
// lib/api-client.ts — single fetch wrapper with error classification
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export async function apiClient<T>(
  url: string,
  options?: RequestInit,
): Promise<T> {
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new ApiError(
      body.message || response.statusText,
      response.status,
      body.code,
    );
  }

  return response.json();
}
```

```typescript
// lib/query-client.ts — global error handler in QueryClient
import { QueryClient, type QueryCache, type MutationCache } from "@tanstack/react-query";
import { ApiError } from "./api-client";
import { toast } from "sonner";

function handleGlobalError(error: unknown) {
  if (!(error instanceof ApiError)) {
    toast.error("An unexpected error occurred. Please try again.");
    return;
  }

  switch (error.status) {
    case 401:
      // Session expired — redirect to login
      // Use window.location to fully reset app state
      window.location.href = "/login";
      break;

    case 403:
      toast.error("You don't have permission to perform this action.");
      break;

    case 404:
      // Usually handled by the component — don't toast
      break;

    case 422:
      // Validation errors — handled by the form, don't toast
      break;

    case 429:
      toast.error("Too many requests. Please wait a moment and try again.");
      break;

    default:
      if (error.status >= 500) {
        toast.error("Something went wrong on our end. Please try again later.");
      }
  }
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        // Don't retry on auth or client errors
        if (error instanceof ApiError && error.status < 500) {
          return false;
        }
        return failureCount < 3;
      },
      staleTime: 1000 * 60, // 1 minute
    },
    mutations: {
      retry: false, // Never auto-retry mutations
    },
  },
  queryCache: new QueryCache({
    onError: handleGlobalError,
  }),
  mutationCache: new MutationCache({
    onError: handleGlobalError,
  }),
});
```

```typescript
// features/dashboard/hooks/use-dashboard-data.ts — clean, no error handling
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { DashboardData } from "../types";

export function useDashboardData() {
  return useQuery({
    queryKey: ["dashboard"],
    queryFn: () => apiClient<DashboardData>("/api/dashboard"),
  });
}

// features/settings/hooks/use-settings.ts — equally clean
export function useSettings() {
  return useQuery({
    queryKey: ["settings"],
    queryFn: () => apiClient<Settings>("/api/settings"),
  });
}
```

**Overriding global handling for specific queries:**

```typescript
// When a specific query needs custom error handling,
// use the query-level meta or onError option
export function useOptionalFeature() {
  return useQuery({
    queryKey: ["optional-feature"],
    queryFn: () => apiClient<Feature>("/api/optional-feature"),
    meta: { suppressGlobalError: true }, // Custom flag
  });
}

// Then check in the global handler:
// queryCache: new QueryCache({
//   onError: (error, query) => {
//     if (query.meta?.suppressGlobalError) return;
//     handleGlobalError(error);
//   },
// }),
```

**Key design decisions:**

- `ApiError` class carries status code and optional error code for structured handling
- Global handler lives in `QueryCache` / `MutationCache`, not in individual hooks
- 401 uses `window.location.href` (not `navigate()`) to fully reset app state
- 404 and 422 are not toasted globally because components handle them contextually
- Retry only on server errors (5xx), never on client errors (4xx)
- Mutations never auto-retry to prevent duplicate side effects
