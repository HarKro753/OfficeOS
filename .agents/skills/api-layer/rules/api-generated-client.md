---
title: API Client Setup
impact: CRITICAL
impactDescription: eliminates hand-written fetchers, single source of truth for API types
tags: api, codegen, hey-api, openapi, ky, tanstack-query, client, manual
---

## API Client Setup

Two paths depending on whether the backend provides an OpenAPI schema:
- **With OpenAPI schema** (preferred): Use @hey-api/openapi-ts to generate typed SDK, TanStack Query hooks, and query keys automatically
- **Without OpenAPI schema**: Use ky directly with hand-written typed fetcher functions per feature

### With OpenAPI Schema (Generated Client)

**Incorrect (raw fetch with manual types):**

```typescript
export function useProducts() {
  return useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const res = await fetch('/api/products')
      if (!res.ok) throw new Error('Failed to fetch')
      return res.json() as Promise<Product[]>
    },
  })
}
```

**Correct (hey-api generates everything):**

```typescript
// openapi-ts.config.ts
import { defineConfig } from '@hey-api/openapi-ts'
import { loadEnv } from 'vite'

const mode = process.env.NODE_ENV || 'development'
const env = loadEnv(mode, process.cwd(), '')

// Prioritize process.env (CI) over .env files (local dev)
const schemaUrl = process.env.SCHEMA_URL || env.SCHEMA_URL

export default defineConfig({
  input: schemaUrl,
  output: './app/core/api/generated',
  plugins: [
    {
      name: '@hey-api/client-ky',
      runtimeConfigPath: '~/core/http/client',
    },
    '@tanstack/react-query',
  ],
})
```

```typescript
// app/core/http/client.ts — ky client configuration
import ky from 'ky'

export const client = ky.create({
  prefixUrl: import.meta.env.VITE_API_BASE_URL,
  hooks: {
    beforeRequest: [
      (request) => {
        // Add auth headers, logging, etc.
      },
    ],
    afterResponse: [
      async (request, options, response) => {
        if (response.status === 401) {
          // Handle token refresh or redirect to login
        }
      },
    ],
  },
})
```

```typescript
// Components consume generated hooks directly
import { useProductsList } from '~/core/api/generated'

function ProductList() {
  const { data, isLoading } = useProductsList()

  if (isLoading) return <ProductListSkeleton />

  return (
    <ul>
      {data?.map((product) => (
        <li key={product.id}>{product.name}</li>
      ))}
    </ul>
  )
}
```

**What the @tanstack/react-query plugin generates:**
- `useQuery` hooks for every GET endpoint
- `useMutation` hooks for POST/PUT/PATCH/DELETE endpoints
- Query key factories for cache management
- Full TypeScript types from the OpenAPI spec

**Project structure:**

```
app/
  core/
    http/
      client.ts              # ky client instance + interceptors
    api/
      generated/             # auto-generated (do not edit)
        index.ts
        sdk.gen.ts           # typed endpoint functions
        types.gen.ts         # request/response types
        tanstack-query.gen.ts # generated hooks + query keys
```

Regenerate after spec changes with `npx @hey-api/openapi-ts`.

### Without OpenAPI Schema (Manual Client)

When the backend doesn't provide an OpenAPI spec, use ky directly with hand-written typed fetcher functions. The ky client setup is identical — only the consumption layer changes.

```typescript
// app/core/http/client.ts — same ky setup, no @hey-api dependency
import ky from 'ky'

export const client = ky.create({
  prefixUrl: import.meta.env.VITE_API_BASE_URL,
  hooks: {
    beforeRequest: [
      (request) => {
        const token = localStorage.getItem('auth-token')
        if (token) {
          request.headers.set('Authorization', `Bearer ${token}`)
        }
      },
    ],
    afterResponse: [
      async (request, options, response) => {
        if (response.status === 401) {
          window.location.href = '/login'
        }
      },
    ],
  },
})
```

```typescript
// app/features/product/api/fetchers.ts — typed fetcher functions
import { client } from '~/core/http/client'

export interface Product {
  id: string
  name: string
  price: number
  description: string
}

export interface CreateProductInput {
  name: string
  price: number
  description: string
}

export const productApi = {
  list: () => client.get('products').json<Product[]>(),
  detail: (id: string) => client.get(`products/${id}`).json<Product>(),
  create: (input: CreateProductInput) =>
    client.post('products', { json: input }).json<Product>(),
  update: (id: string, input: Partial<CreateProductInput>) =>
    client.patch(`products/${id}`, { json: input }).json<Product>(),
  delete: (id: string) => client.delete(`products/${id}`),
}
```

```typescript
// Components consume via the feature query object (see api-query-key-factory)
import { useSuspenseQuery } from '@tanstack/react-query'
import { product } from '~/features/product/api/product'

function ProductList() {
  const { data: products } = useSuspenseQuery(product.query.list())
  return (
    <ul>
      {products.map((p) => <li key={p.id}>{p.name}</li>)}
    </ul>
  )
}
```

**Manual client project structure:**

```
app/
  core/
    http/
      client.ts              # ky client instance + interceptors
  features/
    product/
      api/
        fetchers.ts          # typed fetcher functions (replaces generated SDK)
        product.ts           # feature query object (keys + queries + mutations)
      components/
        product-list.tsx
```

### When to Use Which

| Scenario | Approach |
|---|---|
| Backend provides OpenAPI/Swagger spec | Generated client (@hey-api) |
| Backend has no spec, stable API | Manual ky client with typed fetchers |
| Rapid prototyping, API still changing | Manual client, generate later when API stabilizes |
| Third-party API with OpenAPI spec | Generated client |
| GraphQL backend | Neither — use a GraphQL client instead |

**Why ky over fetch (applies to both paths):**
- Cleaner API — `ky.get()` vs `fetch()` + manual response handling
- Built-in retry, timeout, and hooks (beforeRequest/afterResponse)
- Automatic JSON parsing and error throwing on non-2xx responses
- Simpler interceptor pattern for auth, logging, and error handling
