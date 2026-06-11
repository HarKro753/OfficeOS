---
title: Don't Rely on useMemo for Correctness
impact: MEDIUM
impactDescription: prevents bugs when React discards cached values
tags: rerender, useMemo, useState, correctness, semantic-guarantee
---

## Don't Rely on useMemo for Correctness

Use `useState` instead of `useMemo` when your code's correctness depends on a value being preserved across renders. `useMemo` is a performance hint — React may discard cached values during HMR, offscreen rendering, or future optimizations.

**Incorrect (correctness depends on memoization):**

```tsx
function SearchResults({ items }: Props) {
  // React may recompute this at any time — if buildIndex is expensive
  // and has side effects or identity-dependent consumers, this breaks
  const index = useMemo(() => buildSearchIndex(items), [items])

  // Downstream code assumes `index` is the same object reference
  useEffect(() => {
    registerIndex(index)
    return () => unregisterIndex(index)
  }, [index])
}
```

**Correct (value is guaranteed to persist):**

```tsx
function SearchResults({ items }: Props) {
  const [index, setIndex] = useState(() => buildSearchIndex(items))

  useEffect(() => {
    setIndex(buildSearchIndex(items))
  }, [items])

  // `index` is stable state — React never silently discards it
  useEffect(() => {
    registerIndex(index)
    return () => unregisterIndex(index)
  }, [index])
}
```

Use `useMemo` when re-computation is merely wasteful. Use `useState` when re-computation would cause bugs — effects re-firing, subscriptions breaking, or identity-dependent logic failing.

Reference: [useMemo – React](https://react.dev/reference/react/useMemo#caveats)
