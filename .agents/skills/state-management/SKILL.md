---
description: Manage state in React applications — choosing where state lives, separating server vs client state, integrating TanStack Query, Zustand, or React Router URL state. Triggers on tasks involving state architecture, data fetching patterns, global stores, form state, or state colocation decisions.
---

# State Management Best Practices

Colocation-first state management guide for React applications using TanStack Query (server state), Zustand (client-only global state), and React Router (URL state). The core philosophy: state should live as close to where it is used as possible, and only be elevated when truly necessary.

## When to Apply

Reference these guidelines when:
- Deciding where to put new state (local, URL, context, global store)
- Fetching or caching server data in React components
- Creating or refactoring Zustand stores
- Managing filters, pagination, or other URL-driven state
- Building forms with validation
- Reviewing code for unnecessary global state or duplicated server data

## Rule Categories by Priority

| Priority | Category | Impact | Prefix |
|----------|----------|--------|--------|
| 1 | State Colocation | CRITICAL | `state-` |
| 2 | Server vs Client Separation | CRITICAL | `state-` |
| 3 | Zustand Store Design | HIGH | `state-` |
| 4 | URL State | HIGH | `state-` |
| 5 | Form State | MEDIUM | `state-` |
| 6 | Global State Discipline | MEDIUM | `state-` |

## Quick Reference

### 1. State Colocation (CRITICAL)

- `state-colocation-first` - Start local, elevate only when another component actually needs the same state

### 2. Server vs Client Separation (CRITICAL)

- `state-server-vs-client` - TanStack Query owns server state; Zustand is for client-only state; never duplicate between them

### 3. Zustand Store Design (HIGH)

- `state-zustand-slices` - Organize Zustand stores using the slice pattern with one store per domain concern

### 4. URL State (HIGH)

- `state-url-state` - Use React Router search params for shareable, bookmarkable state like filters, pagination, and sort order

### 5. Form State (MEDIUM)

- `state-form-state` - Use a form library with Zod validation instead of manual useState for forms

### 6. Global State Discipline (MEDIUM)

- `state-no-premature-global` - Don't create global stores "just in case"; global state is a last resort

## How to Use

Read individual rule files for detailed explanations and code examples:

```
rules/state-colocation-first.md
rules/state-server-vs-client.md
```

Each rule file contains:
- Brief explanation of why it matters
- Incorrect code example with explanation
- Correct code example with explanation
- Additional context and references
