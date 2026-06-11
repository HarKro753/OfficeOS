---
title: Use URL Search Params for Shareable State
impact: HIGH
impactDescription: makes filters, pagination, and tabs bookmarkable, shareable, and back-button friendly
tags: state, url, react-router, search-params, filters, pagination
---

## Use URL Search Params for Shareable State

State that should survive a page refresh, be shareable via link, or work with browser back/forward buttons belongs in the URL. Use React Router's `useSearchParams` for filters, pagination, sort order, selected tabs, and search queries. Storing this state in `useState` or Zustand means users cannot bookmark, share, or navigate back to a previous view.

**Incorrect (filters in React state — lost on refresh, not shareable):**

```typescript
function ProductList() {
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);

  const { data: products } = useSuspenseQuery(
    productsQueryOptions({ category, sort, page })
  );

  return (
    <div>
      <CategoryFilter value={category} onChange={setCategory} />
      <SortSelect value={sort} onChange={setSort} />
      <ProductGrid products={products.items} />
      <Pagination
        page={page}
        total={products.totalPages}
        onChange={setPage}
      />
    </div>
  );
}
```

**Correct (filters in URL search params — bookmarkable, shareable, back-button works):**

```typescript
import { useSearchParams } from "react-router";

function ProductList() {
  const [searchParams, setSearchParams] = useSearchParams();

  const category = searchParams.get("category") ?? "all";
  const sort = searchParams.get("sort") ?? "newest";
  const page = Number(searchParams.get("page") ?? "1");

  const { data: products } = useSuspenseQuery(
    productsQueryOptions({ category, sort, page })
  );

  function updateParams(updates: Record<string, string>) {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      for (const [key, value] of Object.entries(updates)) {
        next.set(key, value);
      }
      return next;
    });
  }

  return (
    <div>
      <CategoryFilter
        value={category}
        onChange={(v) => updateParams({ category: v, page: "1" })}
      />
      <SortSelect
        value={sort}
        onChange={(v) => updateParams({ sort: v, page: "1" })}
      />
      <ProductGrid products={products.items} />
      <Pagination
        page={page}
        total={products.totalPages}
        onChange={(p) => updateParams({ page: String(p) })}
      />
    </div>
  );
}
```

**Using React Router's `Form` component for declarative URL state:**

```typescript
import { Form, useSearchParams } from "react-router";

function ViewToggle() {
  const [searchParams] = useSearchParams();
  const view = searchParams.get("view") ?? "grid";

  return (
    <Form>
      {/* Preserve other existing search params */}
      {Array.from(searchParams.entries())
        .filter(([key]) => key !== "view")
        .map(([key, value]) => (
          <input key={key} type="hidden" name={key} value={value} />
        ))}
      <button name="view" value="grid" aria-pressed={view === "grid"}>
        Grid
      </button>
      <button name="view" value="list" aria-pressed={view === "list"}>
        List
      </button>
    </Form>
  );
}
```

**Connecting URL state to TanStack Query:**

```typescript
// api/products.ts — query key includes URL params for automatic cache separation
import { queryOptions } from "@tanstack/react-query";

interface ProductFilters {
  category: string;
  sort: string;
  page: number;
}

export const productsQueryOptions = (filters: ProductFilters) =>
  queryOptions({
    queryKey: ["products", filters],
    queryFn: async () => {
      const params = new URLSearchParams({
        category: filters.category,
        sort: filters.sort,
        page: String(filters.page),
      });
      const res = await fetch(`/api/products?${params}`);
      if (!res.ok) throw new Error("Failed to fetch products");
      return res.json() as Promise<PaginatedResponse<Product>>;
    },
  });
```

**What belongs in the URL vs what does not:**

| URL search params | React state / Zustand |
|---|---|
| Search query | Form input mid-typing |
| Filters, sort order | Dropdown open/closed |
| Pagination | Hover state |
| Selected tab | Animation state |
| Modal open with ID (`?modal=edit&id=5`) | Ephemeral toast messages |
