---
title: MSW Handler Organization
impact: HIGH
impactDescription: realistic API mocking for development and testing
tags: msw, mocking, testing, handlers, development, api
---

## MSW Handler Organization

Mock Service Worker (MSW) intercepts network requests at the service worker level, providing realistic API simulation without modifying application code. Organize handlers to mirror your API structure and share them between development and tests.

**Incorrect (inline mocks scattered across test files):**

```typescript
// src/features/products/__tests__/product-list.test.tsx
import { render, screen } from '@testing-library/react'

// Mock is buried inside each test file, duplicated across tests
vi.mock('@/lib/api', () => ({
  productsListProducts: vi.fn().mockResolvedValue({
    data: [
      { id: '1', name: 'Widget', price: 9.99 },
      { id: '2', name: 'Gadget', price: 19.99 },
    ],
  }),
}))

test('renders products', async () => {
  render(<ProductList />)
  // vi.mock hoists to file top, can't vary per test easily
  // Doesn't test actual HTTP layer
})
```

**Correct (centralized MSW handlers mirroring API structure):**

```typescript
// src/testing/mocks/handlers/products.ts
import { http, HttpResponse } from 'msw'
import { db } from '../db'

const BASE_URL = import.meta.env.VITE_API_BASE_URL

export const productHandlers = [
  http.get(`${BASE_URL}/products`, ({ request }) => {
    const url = new URL(request.url)
    const category = url.searchParams.get('category')

    let products = db.product.getAll()
    if (category) {
      products = products.filter((p) => p.category === category)
    }

    return HttpResponse.json({ data: products })
  }),

  http.get(`${BASE_URL}/products/:id`, ({ params }) => {
    const product = db.product.findFirst({
      where: { id: { equals: params.id as string } },
    })

    if (!product) {
      return HttpResponse.json(
        { message: 'Product not found' },
        { status: 404 }
      )
    }

    return HttpResponse.json({ data: product })
  }),

  http.post(`${BASE_URL}/products`, async ({ request }) => {
    const body = (await request.json()) as CreateProductInput
    const product = db.product.create(body)
    return HttpResponse.json({ data: product }, { status: 201 })
  }),

  http.delete(`${BASE_URL}/products/:id`, ({ params }) => {
    db.product.delete({
      where: { id: { equals: params.id as string } },
    })
    return new HttpResponse(null, { status: 204 })
  }),
]
```

```typescript
// src/testing/mocks/db.ts — in-memory database with @mswjs/data
import { factory, primaryKey } from '@mswjs/data'

export const db = factory({
  product: {
    id: primaryKey(String),
    name: String,
    price: Number,
    category: String,
    createdAt: String,
  },
  order: {
    id: primaryKey(String),
    productId: String,
    quantity: Number,
    status: String,
  },
})
```

```typescript
// src/testing/mocks/handlers/index.ts — aggregate all handlers
import { productHandlers } from './products'
import { orderHandlers } from './orders'
import { authHandlers } from './auth'

export const handlers = [
  ...authHandlers,
  ...productHandlers,
  ...orderHandlers,
]
```

```typescript
// src/testing/mocks/server.ts — test server (Node environment)
import { setupServer } from 'msw/node'
import { handlers } from './handlers'

export const server = setupServer(...handlers)
```

```typescript
// src/testing/mocks/browser.ts — dev server (browser environment)
import { setupWorker } from 'msw/browser'
import { handlers } from './handlers'

export const worker = setupWorker(...handlers)
```

```typescript
// src/main.tsx — start MSW in development
async function enableMocking() {
  if (import.meta.env.DEV) {
    const { worker } = await import('./testing/mocks/browser')
    return worker.start({ onUnhandledRequest: 'bypass' })
  }
}

enableMocking().then(() => {
  createRoot(document.getElementById('root')!).render(<App />)
})
```

```typescript
// src/testing/setup.ts — vitest setup file
import { server } from './mocks/server'
import { beforeAll, afterEach, afterAll } from 'vitest'

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())
```

**Handler directory structure:**

```
src/testing/
  mocks/
    browser.ts         # setupWorker for dev
    server.ts          # setupServer for tests
    db.ts              # @mswjs/data factory
    handlers/
      index.ts         # aggregates all handlers
      auth.ts          # auth endpoints
      products.ts      # product endpoints
      orders.ts        # order endpoints
  setup.ts             # vitest globalSetup
```

Use `server.use()` in individual tests to override handlers for error scenarios without affecting other tests.
