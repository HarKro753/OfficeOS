# Sections

This file defines all sections, their ordering, impact levels, and descriptions.
The section ID (in parentheses) is the filename prefix used to group rules.

---

## 1. State Colocation (state)

**Impact:** CRITICAL
**Description:** State should live as close to where it is used as possible. Starting with local component state and only elevating when another component genuinely needs access prevents unnecessary complexity, reduces re-renders, and makes code easier to reason about.

## 2. Server vs Client Separation (state)

**Impact:** CRITICAL
**Description:** Server data (fetched from APIs) and client-only data (UI preferences, transient UI state) require fundamentally different management strategies. TanStack Query handles server state with caching, background refetching, and deduplication. Zustand handles client-only global state. Mixing them creates bugs and stale data.

## 3. Zustand Store Design (state)

**Impact:** HIGH
**Description:** Well-structured Zustand stores use the slice pattern to keep concerns separated, stores small, and types clean. One store per domain concern (UI, notifications, feature flags) prevents monolithic state blobs.

## 4. URL State (state)

**Impact:** HIGH
**Description:** State that should be shareable or bookmarkable (filters, pagination, sort order, selected tabs) belongs in URL search params via React Router, not in React state or a global store.

## 5. Form State (state)

**Impact:** MEDIUM
**Description:** Form state is inherently complex (validation, dirty tracking, submission, errors). Dedicated form libraries with Zod schema validation handle this complexity far better than manual useState management.

## 6. Global State Discipline (state)

**Impact:** MEDIUM
**Description:** Premature global state is a common source of unnecessary coupling and complexity. If only one component tree needs state, local state or a feature-level context provider is the right choice. Global stores should be a last resort, not a starting point.
