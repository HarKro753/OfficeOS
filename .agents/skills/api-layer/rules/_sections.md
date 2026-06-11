# Sections

This file defines all sections, their ordering, impact levels, and descriptions.
The section ID (in parentheses) is the filename prefix used to group rules.

---

## 1. Client & Key Foundation (api)

**Impact:** CRITICAL
**Description:** The generated API client and feature query object pattern form the foundation. Every other rule builds on these — get them right and the rest follows.

## 2. Query Configuration (api)

**Impact:** HIGH
**Description:** staleTime, gcTime, and refetch behavior determine how fresh your data is and how many network requests fire. Misconfiguration causes either stale UIs or request storms.

## 3. Data Access Patterns (api)

**Impact:** HIGH
**Description:** How components consume and transform server data. Prefer generated hooks and `select` for most cases, custom hooks for cross-feature composition, and router loaders for prefetching.

## 4. Cache Strategies (api)

**Impact:** HIGH
**Description:** Cache invalidation, seeding, and optimistic updates control the user experience during mutations and navigation. The difference between a snappy app and a flickery one.

## 5. Testing & Resilience (api)

**Impact:** HIGH
**Description:** MSW handlers provide a single source of truth for API mocking across dev, test, and Storybook. Centralized error handling prevents scattered try-catch blocks.

## 6. Specialized Patterns (api)

**Impact:** MEDIUM
**Description:** Forms backed by server data and infinite scroll require specific TanStack Query patterns that differ from standard CRUD.
