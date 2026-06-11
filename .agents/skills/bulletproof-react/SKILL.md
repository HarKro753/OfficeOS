---
description: Architectural blueprint for React applications. Use when scaffolding a new project, reviewing project structure, enforcing coding standards, or making architectural decisions. Triggers on tasks involving project setup, folder organization, file naming, import patterns, or development workflow configuration. This is the umbrella skill — it references specialist skills for component patterns, performance, styling, API layer, state management, testing, error handling, and security.
---

# Bulletproof React

Opinionated architectural blueprint for production React applications built with Vite, React Router, and TanStack Query. Provides project structure conventions (inspired by the developerway feature-packages approach), coding standards, and references to specialist skills for deeper domain guidance.

## When to Apply

Reference these guidelines when:
- Scaffolding a new React project or feature
- Reviewing or auditing project structure
- Deciding where new files should live
- Setting up or reviewing project standards (Biome, TypeScript)
- Making architectural decisions about code organization
- Onboarding to an existing codebase

## Specialist Skills

This umbrella skill covers **structure** and **standards**. For deeper guidance, load the relevant specialist skill:

| Domain | Skill | Rules |
|---|---|---|
| Component patterns | `composition-patterns` | 8 rules |
| React/Next.js performance | `react-best-practices` | 55 rules |
| Tailwind CSS styling | `tailwind-best-practices` | 26 rules |
| API layer & data fetching | `api-layer` | 15 rules |
| State management | `state-management` | 6 rules |
| Testing strategy | `testing-strategy` | 6 rules |
| Error handling | `error-handling` | 5 rules |
| Security | `security` | 5 rules |

## Rule Categories by Priority

| Priority | Category | Impact | Prefix |
|----------|----------|--------|--------|
| 1 | Project Structure | CRITICAL | `structure-` |
| 2 | Project Standards | HIGH | `standards-` |

## Quick Reference

### 1. Project Structure (CRITICAL)

- `structure-feature-packages` - Organize code as self-contained feature packages
- `structure-unidirectional-flow` - Enforce shared -> features -> app import direction
- `structure-no-cross-feature-imports` - Features never import from each other
- `structure-layer-hierarchy` - Each feature has data, shared, and UI layers
- `structure-colocation` - Colocate related files within their feature
- `structure-naming-conventions` - kebab-case files, PascalCase components
- `structure-index-exports` - Each feature exports through a single index.ts

### 2. Project Standards (HIGH)

- `standards-biome-config` - Biome for linting, formatting, and import sorting in one tool
- `standards-typescript-strict` - TypeScript in strict mode, type declarations first
- `standards-absolute-imports` - Use @/ path aliases, no deep relative imports
- `standards-kebab-case-files` - Enforce kebab-case filenames via Biome's useFilenamingConvention
- `standards-pnpm-exact` - pnpm with exact versions for deterministic installs
- `standards-husky-hooks` - Pre-commit hooks with Biome check and type checking

## How to Use

Read individual rule files for detailed explanations and code examples:

```
rules/structure-feature-packages.md
rules/standards-biome-config.md
```

Each rule file contains:
- Brief explanation of why it matters
- Incorrect code example with explanation
- Correct code example with explanation
- Additional context and references
