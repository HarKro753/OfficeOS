---
title: Production Error Tracking with Sentry
impact: HIGH
impactDescription: provides visibility into real-world errors with readable stack traces
tags: sentry, monitoring, source-maps, error-tracking, production
---

## Production Error Tracking with Sentry

Without production error tracking, you only know about errors that users report. Sentry captures unhandled exceptions, promise rejections, and error boundary crashes automatically, with source maps for readable stack traces pointing to your original TypeScript code.

**Incorrect (no structured error tracking):**

```typescript
// Errors silently swallowed or only logged to console
function App() {
  return (
    <ErrorBoundary
      fallback={<ErrorPage />}
      onError={(error) => {
        console.error("Something broke:", error); // Lost in production
      }}
    >
      <Router />
    </ErrorBoundary>
  );
}

// Or manual tracking with no context
window.addEventListener("error", (e) => {
  fetch("/api/log-error", {
    method: "POST",
    body: JSON.stringify({ message: e.message }), // No stack, no context
  });
});
```

**Correct (Sentry setup with source maps and error boundary integration):**

```typescript
// lib/sentry.ts — initialize Sentry early in the app
import * as Sentry from "@sentry/react";

export function initSentry() {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    environment: import.meta.env.MODE, // "development" | "production"
    release: import.meta.env.VITE_APP_VERSION, // e.g. "1.2.3"

    // Only send errors in production
    enabled: import.meta.env.PROD,

    // Sample 100% of errors, 10% of performance transactions
    sampleRate: 1.0,
    tracesSampleRate: 0.1,

    // Filter out noise
    ignoreErrors: [
      // Browser extensions
      "top.GLOBALS",
      // Network errors the user already sees via toast
      "Failed to fetch",
      "NetworkError",
      "AbortError",
      // Benign React errors
      "ResizeObserver loop",
    ],

    beforeSend(event) {
      // Strip PII from error reports
      if (event.request?.cookies) {
        delete event.request.cookies;
      }
      return event;
    },
  });
}

// Identify the user for error context
export function identifySentryUser(user: { id: string; email: string }) {
  Sentry.setUser({ id: user.id, email: user.email });
}

export function clearSentryUser() {
  Sentry.setUser(null);
}
```

```typescript
// main.tsx — initialize Sentry before rendering
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { initSentry } from "@/lib/sentry";
import { App } from "./app";

// Initialize Sentry FIRST so it captures any errors during startup
initSentry();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
```

```typescript
// components/sentry-error-boundary.tsx — error boundary that reports to Sentry
import * as Sentry from "@sentry/react";
import { type FallbackProps } from "react-error-boundary";
import { ErrorBoundary } from "react-error-boundary";

function ErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  return (
    <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-6">
      <h3 className="text-sm font-medium text-red-800">Something went wrong</h3>
      <p className="mt-1 text-sm text-red-600">
        This error has been reported to our team.
      </p>
      <div className="mt-4 flex gap-2">
        <button
          onClick={resetErrorBoundary}
          className="text-sm font-medium text-red-700 underline"
        >
          Try again
        </button>
        <button
          onClick={() => Sentry.showReportDialog()}
          className="text-sm font-medium text-red-700 underline"
        >
          Send feedback
        </button>
      </div>
    </div>
  );
}

export function SentryErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={(error, info) => {
        Sentry.withScope((scope) => {
          scope.setTag("boundary", "feature");
          scope.setExtra("componentStack", info.componentStack);
          Sentry.captureException(error);
        });
      }}
    >
      {children}
    </ErrorBoundary>
  );
}
```

```typescript
// vite.config.ts — upload source maps during build
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { sentryVitePlugin } from "@sentry/vite-plugin";

export default defineConfig({
  plugins: [
    react(),
    sentryVitePlugin({
      org: "your-org",
      project: "your-project",
      authToken: process.env.SENTRY_AUTH_TOKEN,
      sourcemaps: {
        filesToDeleteAfterUpload: ["./dist/**/*.map"],
      },
    }),
  ],
  build: {
    sourcemap: true, // Required for Sentry source maps
  },
});
```

**Adding context to errors:**

```typescript
// Add breadcrumbs for debugging context
import * as Sentry from "@sentry/react";

export function useTrackAction() {
  return (action: string, data?: Record<string, unknown>) => {
    Sentry.addBreadcrumb({
      category: "user-action",
      message: action,
      data,
      level: "info",
    });
  };
}

// In the global API error handler, tag errors with context
function handleGlobalError(error: unknown) {
  if (error instanceof ApiError) {
    Sentry.withScope((scope) => {
      scope.setTag("error.type", "api");
      scope.setTag("error.status", error.status.toString());
      scope.setExtra("error.code", error.code);
      Sentry.captureException(error);
    });
  }
}
```

**Key setup decisions:**

- Initialize Sentry before `createRoot` so startup errors are captured
- Use `@sentry/vite-plugin` to upload source maps, then delete `.map` files from the build output so they aren't served to users
- Set `VITE_APP_VERSION` from your CI pipeline (e.g., git tag or commit SHA) to correlate errors with releases
- Filter `ignoreErrors` for noise like browser extensions and expected network errors
- Strip cookies/PII in `beforeSend` to avoid GDPR issues
- Call `Sentry.showReportDialog()` in error fallback so users can add context to their crash report
