---
title: Reserve Unit Tests for Pure Utilities and Complex Hooks
impact: MEDIUM
impactDescription: Avoids redundant tests, focuses unit tests where they add value
tags: testing, unit-tests, utilities, hooks, vitest
---

## Reserve Unit Tests for Pure Utilities and Complex Hooks

Unit tests are best suited for pure functions (no side effects, deterministic output) and custom hooks with complex branching logic. If a function is a simple passthrough, thin wrapper, or is already exercised by an integration test, adding a unit test only increases maintenance cost without improving confidence. Apply unit tests where they provide the most value: date formatting, validation schemas, data transformations, and stateful hook logic.

**Incorrect (unit-testing trivial wrappers and already-covered code):**

```typescript
// utils/cn.ts — thin wrapper, no logic to test
export function cn(...classes: string[]) {
  return clsx(classes);
}

// utils/cn.test.ts — this test adds zero value
test("cn merges classes", () => {
  expect(cn("a", "b")).toBe("a b");
});

// hooks/use-projects.ts — simple TanStack Query wrapper
export function useProjects() {
  return useQuery({
    queryKey: ["projects"],
    queryFn: () => api.get("/projects"),
  });
}

// hooks/use-projects.test.ts — integration tests already cover this
test("useProjects fetches data", async () => {
  const { result } = renderHook(() => useProjects(), { wrapper });
  await waitFor(() => expect(result.current.data).toBeDefined());
});
```

**Correct (unit-testing where it matters):**

```typescript
// utils/format-date.ts
export function formatRelativeDate(date: Date, now = new Date()): string {
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

// utils/format-date.test.ts
import { formatRelativeDate } from "./format-date";

const now = new Date("2025-06-15T12:00:00Z");

test.each([
  [new Date("2025-06-15T11:59:30Z"), "just now"],
  [new Date("2025-06-15T11:45:00Z"), "15m ago"],
  [new Date("2025-06-15T09:00:00Z"), "3h ago"],
  [new Date("2025-06-13T12:00:00Z"), "2d ago"],
  [new Date("2025-06-01T12:00:00Z"), "6/1/2025"],
])("formatRelativeDate(%s) => %s", (date, expected) => {
  expect(formatRelativeDate(date, now)).toBe(expected);
});

// utils/validation.ts
import { z } from "zod";

export const projectSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be under 100 characters")
    .regex(/^[a-zA-Z0-9\s-]+$/, "Name can only contain letters, numbers, spaces, and hyphens"),
  description: z.string().max(500).optional(),
  budget: z.number().positive("Budget must be positive").optional(),
});

// utils/validation.test.ts
import { projectSchema } from "./validation";

test("accepts valid project", () => {
  const result = projectSchema.safeParse({
    name: "Alpha Project",
    description: "A project",
    budget: 10000,
  });
  expect(result.success).toBe(true);
});

test("rejects empty name", () => {
  const result = projectSchema.safeParse({ name: "" });
  expect(result.success).toBe(false);
  if (!result.success) {
    expect(result.error.issues[0].message).toBe("Name is required");
  }
});

test("rejects special characters in name", () => {
  const result = projectSchema.safeParse({ name: "Alpha@Project!" });
  expect(result.success).toBe(false);
});

// hooks/use-debounced-search.ts — complex hook with timing logic
export function useDebouncedSearch(delay = 300) {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), delay);
    return () => clearTimeout(timer);
  }, [query, delay]);

  return { query, debouncedQuery, setQuery };
}

// hooks/use-debounced-search.test.ts
import { renderHook, act } from "@testing-library/react";
import { useDebouncedSearch } from "./use-debounced-search";

test("debounces the search query", async () => {
  vi.useFakeTimers();
  const { result } = renderHook(() => useDebouncedSearch(300));

  act(() => result.current.setQuery("rea"));
  act(() => result.current.setQuery("reac"));
  act(() => result.current.setQuery("react"));

  // Not debounced yet
  expect(result.current.debouncedQuery).toBe("");

  // Advance past debounce delay
  act(() => vi.advanceTimersByTime(300));

  expect(result.current.debouncedQuery).toBe("react");

  vi.useRealTimers();
});
```

### Decision Checklist

| Question | If Yes | If No |
|---|---|---|
| Is it a pure function with no dependencies? | Unit test it | Probably integration |
| Does it have 3+ code paths or edge cases? | Unit test it | Integration covers it |
| Is it a thin wrapper around a library? | Skip unit test | -- |
| Is a hook just calling `useQuery`? | Skip unit test | -- |
| Does the hook have timers, state machines, or complex logic? | Unit test it | Integration covers it |
