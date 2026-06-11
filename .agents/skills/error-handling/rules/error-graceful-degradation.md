---
title: Graceful Degradation Patterns
impact: MEDIUM
impactDescription: keeps the app usable when non-critical features fail
tags: resilience, fallback, retry, offline, degradation
---

## Graceful Degradation Patterns

When a non-critical feature fails, the entire app should not become unusable. Analytics widget down? Hide it. Recommendation engine unreachable? Show a static fallback. Network flaky? Queue actions and retry. The core user workflow must survive partial failures.

**Incorrect (non-critical failure blocks the entire UI):**

```typescript
// A failing recommendations widget prevents the whole page from rendering
function ProductPage({ productId }: { productId: string }) {
  const product = useQuery({
    queryKey: ["product", productId],
    queryFn: () => apiClient<Product>(`/api/products/${productId}`),
  });
  const recommendations = useQuery({
    queryKey: ["recommendations", productId],
    queryFn: () => apiClient<Product[]>(`/api/recommendations/${productId}`),
  });

  // If recommendations fail, user sees an error for the ENTIRE page
  if (product.isError || recommendations.isError) {
    return <ErrorPage />;
  }

  if (product.isLoading || recommendations.isLoading) {
    return <LoadingSkeleton />;
  }

  return (
    <div>
      <ProductDetails product={product.data} />
      <RecommendationList items={recommendations.data} />
    </div>
  );
}
```

**Correct (non-critical features degrade independently):**

```typescript
// Product page renders even if recommendations fail
function ProductPage({ productId }: { productId: string }) {
  const product = useQuery({
    queryKey: ["product", productId],
    queryFn: () => apiClient<Product>(`/api/products/${productId}`),
  });

  if (product.isError) {
    return <ErrorPage />; // Only the critical data triggers full error
  }

  if (product.isLoading) {
    return <LoadingSkeleton />;
  }

  return (
    <div>
      <ProductDetails product={product.data} />
      {/* Recommendations degrade gracefully on their own */}
      <Recommendations productId={productId} />
    </div>
  );
}

function Recommendations({ productId }: { productId: string }) {
  const { data, isError, isLoading } = useQuery({
    queryKey: ["recommendations", productId],
    queryFn: () => apiClient<Product[]>(`/api/recommendations/${productId}`),
    retry: 2,
    staleTime: 1000 * 60 * 5, // Serve stale data for 5 minutes
  });

  // Loading state — show skeleton, don't block the page
  if (isLoading) {
    return <RecommendationSkeleton />;
  }

  // Error state — silently hide or show minimal fallback
  if (isError) {
    return null; // Or: <StaticRecommendations />
  }

  return <RecommendationList items={data} />;
}
```

**Retry with exponential backoff for transient errors:**

```typescript
// hooks/use-retry-mutation.ts
import { useMutation, type UseMutationOptions } from "@tanstack/react-query";
import { toast } from "sonner";
import { ApiError } from "@/lib/api-client";

interface RetryConfig {
  maxRetries?: number;
  baseDelay?: number;
}

export function useRetryMutation<TData, TVariables>(
  options: UseMutationOptions<TData, Error, TVariables> & {
    retryConfig?: RetryConfig;
  },
) {
  const { retryConfig, ...mutationOptions } = options;
  const maxRetries = retryConfig?.maxRetries ?? 3;
  const baseDelay = retryConfig?.baseDelay ?? 1000;

  return useMutation({
    ...mutationOptions,
    retry: (failureCount, error) => {
      // Only retry on server errors or network failures
      if (error instanceof ApiError && error.status < 500) {
        return false;
      }
      return failureCount < maxRetries;
    },
    retryDelay: (attemptIndex) => {
      // Exponential backoff: 1s, 2s, 4s
      return Math.min(baseDelay * 2 ** attemptIndex, 10000);
    },
    onError: (error, variables, context) => {
      mutationOptions.onError?.(error, variables, context);
    },
  });
}
```

**Optional feature wrapper — hide on failure:**

```typescript
// components/optional-feature.tsx
import { ErrorBoundary } from "react-error-boundary";
import { type ReactNode } from "react";

interface OptionalFeatureProps {
  children: ReactNode;
  fallback?: ReactNode;
  name?: string;
}

export function OptionalFeature({
  children,
  fallback = null,
  name,
}: OptionalFeatureProps) {
  return (
    <ErrorBoundary
      fallbackRender={() => <>{fallback}</>}
      onError={(error) => {
        // Log but don't crash — this feature is optional
        console.warn(`Optional feature${name ? ` "${name}"` : ""} failed:`, error);
        // Sentry captures this via global handler
      }}
    >
      {children}
    </ErrorBoundary>
  );
}

// Usage
function Dashboard() {
  return (
    <div>
      <CriticalMetrics /> {/* No wrapper — must work */}

      <OptionalFeature name="activity-feed" fallback={<ActivityFeedPlaceholder />}>
        <ActivityFeed />
      </OptionalFeature>

      <OptionalFeature name="analytics-chart">
        <AnalyticsChart /> {/* Silently hidden if it crashes */}
      </OptionalFeature>
    </div>
  );
}
```

**Stale-while-revalidate for resilience:**

```typescript
// Show cached data while refetching — user never sees a blank screen
export function useResilientQuery<T>(
  queryKey: readonly unknown[],
  queryFn: () => Promise<T>,
) {
  return useQuery({
    queryKey,
    queryFn,
    staleTime: 1000 * 60 * 5,       // Data is "fresh" for 5 minutes
    gcTime: 1000 * 60 * 30,          // Keep in cache for 30 minutes
    refetchOnWindowFocus: true,       // Silently refresh in background
    placeholderData: (previousData) => previousData, // Show old data during refetch
  });
}

// Usage: even if the API is down, the user sees the last good data
function UserProfile() {
  const { data, isError, isFetching } = useResilientQuery(
    ["profile"],
    () => apiClient<Profile>("/api/profile"),
  );

  return (
    <div>
      {isError && (
        <div className="text-xs text-amber-600">
          Unable to refresh. Showing cached data.
        </div>
      )}
      {data && <ProfileCard profile={data} />}
      {isFetching && <RefreshIndicator />}
    </div>
  );
}
```

**Degradation hierarchy (decide per feature):**

1. **Retry** -- transient errors (network blip, 503) resolve on their own
2. **Stale data** -- show the last good response while retrying in background
3. **Fallback UI** -- static placeholder or simplified version of the feature
4. **Hide** -- remove the feature entirely if it adds no value in a failed state
5. **Error message** -- only for critical features that the user explicitly requested
