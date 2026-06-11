---
description: Write, review, or plan tests for React applications. Triggers on tasks involving test files, testing strategy decisions, MSW mock setup, integration tests, E2E tests, or discussions about what and how to test in a Vite + React Router + TanStack Query stack.
---

# React Testing Strategy

Integration-heavy testing strategy for React applications built with Vite, React Router, and TanStack Query. Uses Vitest, Testing Library, MSW, and Playwright. Contains 6 rules across 4 categories, prioritized by confidence-to-effort ratio. Philosophy: test user behavior, not implementation details.

## When to Apply

Reference these guidelines when:
- Writing new tests or test files for React features
- Deciding what level of testing a feature needs
- Setting up MSW handlers for API mocking
- Reviewing tests for anti-patterns (testing implementation details)
- Planning E2E test coverage with Playwright
- Refactoring existing tests for better maintainability

## Rule Categories by Priority

| Priority | Category | Impact | Prefix |
|----------|----------|--------|--------|
| 1 | Integration Testing | CRITICAL | `testing-` |
| 2 | Mock & API Layer | HIGH | `testing-` |
| 3 | E2E Coverage | MEDIUM | `testing-` |
| 4 | Unit Testing | MEDIUM | `testing-` |

## Quick Reference

### 1. Integration Testing (CRITICAL)

- `testing-integration-first` - Integration tests are the primary testing investment
- `testing-user-behavior` - Test what the user sees and does, not implementation details

### 2. Mock & API Layer (HIGH)

- `testing-msw-handlers` - Organize MSW handlers to mirror the API structure
- `testing-component-boundaries` - Test features as units, not individual components

### 3. E2E Coverage (MEDIUM)

- `testing-e2e-critical-paths` - Use Playwright for critical user flows only

### 4. Unit Testing (MEDIUM)

- `testing-unit-utils-only` - Reserve unit tests for pure utilities and complex hooks

## How to Use

Read individual rule files for detailed explanations and code examples:

```
rules/testing-integration-first.md
rules/testing-user-behavior.md
```

Each rule file contains:
- Brief explanation of why it matters
- Incorrect code example with explanation
- Correct code example with explanation
- Additional context and references
