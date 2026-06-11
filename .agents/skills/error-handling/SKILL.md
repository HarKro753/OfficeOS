---
description: Error handling patterns for React applications. Use when implementing error boundaries, API error interceptors, toast notifications, Sentry integration, or graceful degradation. Triggers on tasks involving error recovery, fault tolerance, crash reporting, or user-facing error messaging. Stack: Vite + React Router + TanStack Query + Sentry.
---

# Error Handling Best Practices

Production-grade error handling patterns for React applications built with Vite, React Router, and TanStack Query. Covers the full error lifecycle: catching errors at the right granularity, centralizing API error handling, displaying user-friendly messages, tracking errors in production with Sentry, and degrading gracefully when non-critical features fail.

## When to Apply

Reference these guidelines when:

- Adding error boundaries to React components or pages
- Setting up centralized API error handling with TanStack Query
- Implementing user-facing error notifications (toasts)
- Configuring Sentry for production error tracking
- Building resilient features that degrade gracefully on failure
- Reviewing error handling coverage in existing code

## Rule Categories by Priority

| Priority | Category                | Impact   | Prefix      |
| -------- | ----------------------- | -------- | ----------- |
| 1        | Error Boundaries        | CRITICAL | `error-`    |
| 2        | API Error Handling      | CRITICAL | `error-`    |
| 3        | User Notifications      | HIGH     | `error-`    |
| 4        | Error Tracking          | HIGH     | `error-`    |
| 5        | Graceful Degradation    | MEDIUM   | `error-`    |

## Quick Reference

### 1. Error Boundaries (CRITICAL)

- `error-boundaries-granular` - Deploy multiple error boundaries per feature, not one at the root

### 2. API Error Handling (CRITICAL)

- `error-api-interceptor` - Centralized API error handling via TanStack Query defaults

### 3. User Notifications (HIGH)

- `error-toast-patterns` - User-facing error notifications via a toast system

### 4. Error Tracking (HIGH)

- `error-tracking-sentry` - Production error tracking with Sentry and source maps

### 5. Graceful Degradation (MEDIUM)

- `error-graceful-degradation` - Degrade gracefully when non-critical features fail

## How to Use

Read individual rule files for detailed explanations and code examples:

```
rules/error-boundaries-granular.md
rules/error-api-interceptor.md
```

Each rule file contains:

- Brief explanation of why it matters
- Incorrect code example with explanation
- Correct code example with explanation
- Additional context and references
