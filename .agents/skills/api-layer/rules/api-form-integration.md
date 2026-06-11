---
title: Form and Query Integration
impact: MEDIUM
impactDescription: prevents stale form data, avoids double submits and flash of old values
tags: tanstack-query, forms, react-hook-form, zod, mutation, staleTime, tkdodo
---

## Form and Query Integration

Forms are the one legitimate exception to "don't copy server state into client state." Copy server state into form `defaultValues`, protect the form from background refetches with `staleTime: Infinity`, and await `invalidateQueries` before resetting. Follows [TkDodo's "React Query and Forms"](https://tkdodo.eu/blog/react-query-and-forms) patterns.

**Incorrect (no staleTime protection, form reset before invalidation completes):**

```typescript
import { useSuspenseQuery } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { product } from '~/features/product/api/product'

function ProductEditForm({ productId }: { productId: string }) {
  const { data } = useSuspenseQuery(product.query.detail({ path: { id: productId } }))

  // No staleTime — a background refetch mid-edit overwrites the form with server values
  const form = useForm({
    defaultValues: {
      name: data.name,
      price: data.price,
      description: data.description,
    },
  })

  const updateProduct = product.mutation.useUpdate()

  const onSubmit = form.handleSubmit((values) => {
    updateProduct.mutate(
      { path: { id: productId }, body: values },
      {
        onSuccess: () => {
          // Form resets BEFORE invalidation finishes — if the component re-renders
          // with stale cache data, the form briefly shows old values
          form.reset()
          queryClient.invalidateQueries({ queryKey: product.key.all() })
        },
      },
    )
  })

  return (
    <form onSubmit={onSubmit}>
      <input {...form.register('name')} />
      <input {...form.register('price', { valueAsNumber: true })} />
      <textarea {...form.register('description')} />
      {/* No disabled state — user can double-click and submit twice */}
      <button type="submit">Save</button>
    </form>
  )
}
```

**Correct (staleTime protection, awaited invalidation, double-submit prevention):**

```typescript
// app/features/product/api/product.ts — add a form-specific query option
// Works with both generated and manual feature query objects

export const product = {
  // ... key, query, mutation (see api-query-key-factory)
  query: {
    // ...existing queries
    detailForEdit: (id: string) =>
      queryOptions({
        ...product.query.detail(id),
        // Prevent background refetches from overwriting the form mid-edit
        staleTime: Infinity,
      }),
  },
} as const
```

```typescript
// app/features/product/components/product-edit-form.tsx
import { useSuspenseQuery, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { product } from '~/features/product/api/product'

const productFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  price: z.number().positive('Price must be positive'),
  description: z.string().max(500, 'Description too long'),
})

type ProductFormValues = z.infer<typeof productFormSchema>

function ProductEditForm({ productId }: { productId: string }) {
  const queryClient = useQueryClient()

  // staleTime: Infinity — form is safe from background refetches
  const { data } = useSuspenseQuery(
    product.query.detailForEdit({ path: { id: productId } }),
  )

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: data.name,
      price: data.price,
      description: data.description,
    },
  })

  const updateProduct = product.mutation.useUpdate()

  const onSubmit = form.handleSubmit((values) => {
    updateProduct.mutate(
      { path: { id: productId }, body: values },
      {
        onSuccess: async () => {
          // 1. Await invalidation — cache is fresh BEFORE we touch the form
          await queryClient.invalidateQueries({ queryKey: product.key.all() })
          // 2. Reset form AFTER cache is updated — no flash of stale values
          form.reset(values)
        },
      },
    )
  })

  return (
    <form onSubmit={onSubmit}>
      <fieldset disabled={updateProduct.isPending}>
        <div>
          <label htmlFor="name">Name</label>
          <input id="name" {...form.register('name')} />
          {form.formState.errors.name && (
            <p role="alert">{form.formState.errors.name.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="price">Price</label>
          <input
            id="price"
            type="number"
            step="0.01"
            {...form.register('price', { valueAsNumber: true })}
          />
          {form.formState.errors.price && (
            <p role="alert">{form.formState.errors.price.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="description">Description</label>
          <textarea id="description" {...form.register('description')} />
          {form.formState.errors.description && (
            <p role="alert">{form.formState.errors.description.message}</p>
          )}
        </div>

        <button type="submit" disabled={updateProduct.isPending}>
          {updateProduct.isPending ? 'Saving...' : 'Save'}
        </button>
      </fieldset>

      {updateProduct.isError && (
        <p role="alert">Failed to save: {updateProduct.error.message}</p>
      )}
    </form>
  )
}
```

### Rules

1. Forms are the ONE exception to "don't copy server state" — use `defaultValues` to seed the form
2. Set `staleTime: Infinity` on queries backing edit forms to prevent background refetches from overwriting user edits
3. `await invalidateQueries` in mutation `onSuccess` BEFORE resetting the form — prevents flash of stale values
4. Reset the form with the submitted values (`form.reset(values)`) so dirty tracking stays accurate
5. Wrap form fields in `<fieldset disabled={mutation.isPending}>` to prevent all inputs and the submit button from being interactive during submission
6. Use React Hook Form + Zod schema for validation — colocate the schema near the form component
