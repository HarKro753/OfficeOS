---
name: bulletproof-react
description: Use when working with React, Next.js, or TypeScript frontend code that should follow Bulletproof React architecture and feature-based organization.
---

# Bulletproof React Rules

Encode and apply Bulletproof React architecture rules when building, modifying, or explaining React and TypeScript applications. This skill is implementation guidance, not an audit/report generator.

## When to Use

Use this skill for:

- React, Next.js, Vite, or TypeScript frontend work
- Project structure and folder organization decisions
- Feature-based architecture decisions
- Component placement, shared code boundaries, and import rules
- API, state, hooks, forms, testing, or error-handling patterns in React apps
- Refactors that should move code toward Bulletproof React conventions

## Architecture Rule

Default to feature-based organization. Most application code belongs inside `src/features/<feature-name>/`. Shared folders are allowed only for code that is truly reusable across unrelated features.

Preferred structure:

```text
src/
├── app/           # App shell, routing, providers, global styles
├── components/    # Shared application components only
├── config/        # Runtime and build-time configuration
├── features/      # Feature modules; most product code lives here
│   └── feature-name/
│       ├── api/          # Feature API calls, query keys, mutations
│       ├── components/   # Feature-specific components
│       ├── hooks/        # Feature-specific hooks
│       ├── stores/       # Feature-specific client state
│       ├── types/        # Feature-specific types
│       └── utils/        # Feature-specific utilities
├── hooks/         # Shared hooks used by multiple unrelated features
├── lib/           # Configured third-party libraries and clients
├── stores/        # Global client state only
├── testing/       # Test utilities, mocks, factories, render helpers
├── types/         # Shared application types
└── utils/         # Shared pure utilities
```

## Feature Boundary Rules

- A feature may import from shared folders such as `components`, `hooks`, `lib`, `types`, and `utils`.
- A feature should not import directly from another feature's private internals.
- If multiple features need the same code, move that code to an appropriate shared folder or create an explicit public API for the source feature.
- Prefer feature-local code first. Promote code to shared only after real reuse exists.
- Avoid catch-all shared folders that become dumping grounds.
- Keep feature modules cohesive: API calls, feature components, feature hooks, feature stores, and feature types should live together.

## Public API Rule

When a feature exposes code to the rest of the app, export it through a narrow `index.ts` or clearly named public entrypoint.

```ts
// Good
import { ProjectList } from "@/features/projects";

// Avoid
import { ProjectList } from "@/features/projects/components/project-list";
```

Only export what outside code is meant to use. Keep internal components, hooks, utilities, and implementation details unexported.

## Component Rules

- Keep components focused on one responsibility.
- Prefer composition over large configurable components.
- Keep feature-specific components inside their feature.
- Put only broadly reusable primitives and application-level shared components in `src/components`.
- Separate server state, client state, and derived view state clearly.
- Avoid deeply nested prop drilling; use composition, colocated state, or focused context when appropriate.
- Treat components over roughly 300 lines as candidates for decomposition, but use judgment rather than blind splitting.
- Avoid components with broad prop surfaces. If many props are mode flags, consider composition or separate components.

## State Rules

- Keep state as local as possible.
- Use server-state tools such as TanStack Query, SWR, React Router loaders, or framework-native data APIs for remote data.
- Do not duplicate server state in global client stores.
- Use global state only for state that is genuinely cross-cutting, such as auth session, app settings, or long-lived UI state.
- Keep feature-specific state inside `src/features/<feature>/stores`.
- Derive data during render when practical instead of storing redundant derived state.

## API Rules

- Centralize HTTP client configuration in `src/lib` or the app's established equivalent.
- Keep feature API functions inside the owning feature's `api` folder.
- Type request and response boundaries.
- Keep query keys, mutations, cache invalidation, and optimistic updates close to the feature API they belong to.
- Normalize error handling so UI code does not repeat transport-specific details.
- Do not call `fetch` or client SDKs ad hoc throughout components when the codebase has an API layer pattern.

## Hook Rules

- Keep reusable behavior in hooks, not in oversized components.
- Feature-specific hooks stay in their feature.
- Shared hooks must be generic and independent of a specific feature.
- Hooks should expose stable, task-oriented APIs instead of leaking implementation details.
- Do not hide side effects in hooks with surprising names.

## Type Rules

- Keep feature-specific types in the feature.
- Put shared domain or platform types in `src/types`.
- Prefer explicit types at external boundaries: API responses, route params, form values, storage, and message/event payloads.
- Avoid `any`. If the shape is unknown, use `unknown` and narrow it.
- Avoid global type declarations unless the type is truly global.

## Testing Rules

- Test behavior rather than implementation details.
- Prefer integration-style component tests for user-facing flows.
- Use semantic queries such as `getByRole` where possible.
- Keep test utilities, render wrappers, mocks, and factories in `src/testing`.
- Put feature tests near the feature when that matches the codebase's pattern.
- Add or update tests when behavior changes, contracts change, or a refactor touches shared code.

## Styling Rules

- Follow the styling system already chosen by the project.
- Keep design primitives and shared UI components separate from feature-specific presentation.
- Avoid one-off styling patterns when a reusable component or token exists.
- Keep responsive behavior and interaction states explicit.

## Error And Loading Rules

- Model loading, empty, error, and success states deliberately.
- Use route-level or app-level error boundaries where the framework supports them.
- Keep retry, toast, logging, and tracking behavior consistent.
- Avoid leaving rejected promises, failed mutations, or empty API responses as implicit UI states.

## Performance Rules

- Split code at route and feature boundaries when bundle size matters.
- Memoize only when there is a measured or obvious render cost.
- Avoid premature optimization that makes feature code harder to understand.
- Keep large dependencies out of shared entrypoints unless most of the app needs them.
- Prefer colocated lazy loading for heavy feature-specific components.

## Security Rules

- Validate and sanitize data at trust boundaries.
- Do not store sensitive secrets in frontend code.
- Prefer secure, httpOnly cookie-backed auth when the app architecture supports it.
- Keep authorization checks enforceable on the server; frontend guards are UX, not security.
- Treat HTML injection, unsafe redirects, and user-controlled URLs as security-sensitive.

## Implementation Behavior

When making changes:

1. Match the existing project conventions unless they clearly conflict with these rules.
2. Move code toward feature ownership before introducing new shared abstractions.
3. Keep refactors incremental and scoped to the user's request.
4. Preserve working behavior while improving boundaries.
5. Add tests proportional to the risk and surface area of the change.
6. Explain architectural tradeoffs using these rules as the reasoning source.

## Decision Heuristics

- If code belongs to one business capability, it belongs in that feature.
- If code is reused by unrelated features, it may become shared.
- If shared code knows too much about one feature, it is not truly shared.
- If a component mostly orchestrates a feature workflow, it belongs in the feature.
- If a component is a reusable UI primitive, it belongs in shared components or the design system.
- If a type describes an external contract, make it explicit and keep it near that boundary.
- If a state value can be derived, derive it.
- If a rule conflicts with the local codebase's established architecture, prefer the local architecture and explain the exception.

## Resources

- [Bulletproof React Guide](https://github.com/alan2207/bulletproof-react)
- [Project Structure](https://github.com/alan2207/bulletproof-react/blob/master/docs/project-structure.md)
- [Sample App](https://github.com/alan2207/bulletproof-react/tree/master/apps/react-vite)
