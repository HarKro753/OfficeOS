---
description: Build, review, or refactor the API layer in React applications using TanStack Query. Triggers on tasks involving API client setup, data fetching hooks, query key management, cache invalidation, optimistic updates, API mocking with MSW, centralized error handling, or data fetching architecture decisions.
---

# API Layer Best Practices

Comprehensive guide for building a robust API layer in React applications with TanStack Query v5 and ky. Supports two paths: **generated client** (@hey-api/openapi-ts with ky + react-query plugin) when an OpenAPI schema is available, or **manual client** (ky with hand-written typed fetchers) when it's not. All TanStack Query patterns (caching, invalidation, optimistic updates, etc.) apply equally to both paths. Informed by [TkDodo's Practical React Query](https://tkdodo.eu/blog/practical-react-query) series. Contains 15 rules across 6 categories, prioritized by impact.

## When to Apply

Reference these guidelines when:
- Setting up or configuring a generated API client (@hey-api or similar)
- Creating data fetching hooks with TanStack Query
- Designing query key structures for cache management
- Implementing cache invalidation or optimistic updates
- Setting up MSW handlers for development or testing
- Building centralized error handling for API responses
- Configuring staleTime, gcTime, and refetch behavior
- Integrating React Router loaders with TanStack Query
- Building forms backed by server data
- Implementing infinite scroll or pagination

## Rule Categories by Priority

| Priority | Category | Impact | Prefix |
|----------|----------|--------|--------|
| 1 | Client & Key Foundation | CRITICAL | `api-` |
| 2 | Query Configuration | HIGH | `api-` |
| 3 | Data Access Patterns | HIGH | `api-` |
| 4 | Cache Strategies | HIGH | `api-` |
| 5 | Testing & Resilience | HIGH | `api-` |
| 6 | Specialized Patterns | MEDIUM | `api-` |

## Quick Reference

### 1. Client & Key Foundation (CRITICAL)

- `api-generated-client` - API client setup: generated (@hey-api) or manual (ky)
- `api-query-key-factory` - Feature query object pattern — colocate keys, queries, and mutations
- `api-derived-state` - Never copy server state into client state — derive at render time

### 2. Query Configuration (HIGH)

- `api-query-defaults` - staleTime strategy per entity type, don't disable refetch triggers
- `api-status-checks` - Data-first status checking, background vs initial errors

### 3. Data Access Patterns (HIGH)

- `api-custom-hooks` - Compose queries only when aggregating across features
- `api-query-selectors` - Use `select` for data transformations and render optimization
- `api-router-prefetch` - Prefetch in React Router loaders with `ensureQueryData`

### 4. Cache Strategies (HIGH)

- `api-cache-invalidation` - Targeted invalidation, global MutationCache, void vs return
- `api-cache-seeding` - initialData vs placeholderData, list-to-detail pre-population
- `api-optimistic-updates` - Optimistic mutations with rollback and concurrent guards

### 5. Testing & Resilience (HIGH)

- `api-msw-mocking` - MSW handler organization for development and testing
- `api-error-interceptor` - Centralized error handling, QueryCache.onError, throwOnError

### 6. Specialized Patterns (MEDIUM)

- `api-form-integration` - Forms backed by server data with staleTime: Infinity
- `api-infinite-queries` - useInfiniteQuery for pagination and infinite scroll

## How to Use

Read individual rule files for detailed explanations and code examples:

```
rules/api-generated-client.md
rules/api-query-key-factory.md
```

Each rule file contains:
- Brief explanation of why it matters
- Incorrect code example with explanation
- Correct code example with explanation
- Additional context and references
