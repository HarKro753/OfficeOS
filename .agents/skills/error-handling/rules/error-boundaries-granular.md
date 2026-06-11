---
title: Granular Error Boundaries
impact: CRITICAL
impactDescription: prevents full-app crashes from isolated component failures
tags: error-boundary, react, resilience, fault-isolation
---

## Granular Error Boundaries

A single error boundary at the root means any component crash shows a full-page error screen. Users lose all context and must reload. Granular boundaries isolate failures to the feature that broke, keeping the rest of the app functional.

**Incorrect (single root-level error boundary):**

```typescript
// app.tsx — one boundary wraps everything
import { ErrorBoundary } from "react-error-boundary";

function App() {
  return (
    <ErrorBoundary fallback={<FullPageError />}>
      <Layout>
        <Sidebar />
        <Dashboard />
        <ActivityFeed />
        <NotificationPanel />
      </Layout>
    </ErrorBoundary>
  );
}

// If ActivityFeed crashes, the ENTIRE app shows FullPageError.
// Sidebar, Dashboard, NotificationPanel — all gone.
```

**Correct (granular error boundaries per feature):**

```typescript
// components/feature-error-boundary.tsx
import { ErrorBoundary, type FallbackProps } from "react-error-boundary";

function FeatureErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  return (
    <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-4">
      <h3 className="text-sm font-medium text-red-800">
        Something went wrong
      </h3>
      <p className="mt-1 text-sm text-red-600">{error.message}</p>
      <button
        onClick={resetErrorBoundary}
        className="mt-3 text-sm font-medium text-red-700 underline"
      >
        Try again
      </button>
    </div>
  );
}

// app.tsx — each feature gets its own boundary
function App() {
  return (
    <Layout>
      <Sidebar />
      <ErrorBoundary
        FallbackComponent={FeatureErrorFallback}
        onReset={() => {
          // Clear any stale state that caused the error
        }}
      >
        <Dashboard />
      </ErrorBoundary>
      <ErrorBoundary FallbackComponent={FeatureErrorFallback}>
        <ActivityFeed />
      </ErrorBoundary>
      <ErrorBoundary FallbackComponent={FeatureErrorFallback}>
        <NotificationPanel />
      </ErrorBoundary>
    </Layout>
  );
}

// If ActivityFeed crashes, only that panel shows the error fallback.
// Sidebar, Dashboard, and NotificationPanel continue working.
```

**Route-level boundaries with React Router:**

```typescript
// routes.tsx — error boundaries at the route level
import { createBrowserRouter } from "react-router-dom";
import { RouteErrorFallback } from "@/components/route-error-fallback";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    errorElement: <RouteErrorFallback />, // Catches route-level errors
    children: [
      {
        path: "dashboard",
        element: <DashboardPage />,
        errorElement: <RouteErrorFallback />, // Dashboard-specific errors
      },
      {
        path: "settings",
        element: <SettingsPage />,
        errorElement: <RouteErrorFallback />, // Settings-specific errors
      },
    ],
  },
]);

// components/route-error-fallback.tsx
import { useRouteError, useNavigate } from "react-router-dom";

export function RouteErrorFallback() {
  const error = useRouteError() as Error;
  const navigate = useNavigate();

  return (
    <div className="flex min-h-[400px] items-center justify-center">
      <div className="text-center">
        <h2 className="text-lg font-semibold">This page encountered an error</h2>
        <p className="mt-2 text-sm text-gray-600">{error.message}</p>
        <div className="mt-4 flex gap-2 justify-center">
          <button onClick={() => navigate(0)} className="btn btn-primary">
            Reload page
          </button>
          <button onClick={() => navigate("/")} className="btn btn-secondary">
            Go home
          </button>
        </div>
      </div>
    </div>
  );
}
```

**Where to place error boundaries:**

- Around each route (via React Router `errorElement`)
- Around independent feature panels (sidebar widgets, feeds, charts)
- Around third-party components you don't control
- Around components that parse user-generated or external data
- NOT around every single component (that creates noise and maintenance burden)

**Reset strategies:**

- `onReset` callback: clear stale cache or state that caused the error
- `resetKeys` prop: automatically reset when specific values change (e.g., route params)
- Manual retry button: let users decide when to try again
