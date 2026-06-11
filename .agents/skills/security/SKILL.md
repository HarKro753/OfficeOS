---
description: Implement authentication, authorization, input handling, or security headers in a React SPA. Triggers on tasks involving auth flows, token storage, XSS prevention, role-based access control, Content Security Policy, or protected routes.
---

# Frontend Security Best Practices

Practical security guide for React single-page applications built with Vite, React Router, and TanStack Query. Contains 5 rules across 3 categories, prioritized by impact. Client-side security complements server-side validation — it is not a replacement.

## When to Apply

Reference these guidelines when:
- Implementing authentication or authorization flows
- Storing or transmitting auth tokens
- Rendering user-generated content or rich text
- Building role-based or permission-based access control
- Configuring Content Security Policy headers
- Protecting routes behind authentication

## Rule Categories by Priority

| Priority | Category | Impact | Prefix |
|----------|----------|--------|--------|
| 1 | Token & Auth Security | CRITICAL | `security-` |
| 2 | Access Control | HIGH | `security-` |
| 3 | Transport & Headers | MEDIUM | `security-` |

## Quick Reference

### 1. Token & Auth Security (CRITICAL)

- `security-token-storage` - Store auth tokens in HttpOnly cookies, never localStorage
- `security-input-sanitization` - Sanitize all user inputs before rendering

### 2. Access Control (HIGH)

- `security-rbac-pbac` - Role-based and permission-based access control components
- `security-auth-flow` - Complete authentication flow for SPAs with route protection

### 3. Transport & Headers (MEDIUM)

- `security-csp-headers` - Content Security Policy to prevent XSS and data injection

## How to Use

Read individual rule files for detailed explanations and code examples:

```
rules/security-token-storage.md
rules/security-auth-flow.md
```

Each rule file contains:
- Brief explanation of why it matters
- Incorrect code example with explanation
- Correct code example with explanation
- Additional context and references
