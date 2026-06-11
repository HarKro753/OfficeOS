---
title: Use @utility for Custom Token-Driven Utilities
impact: MEDIUM
impactDescription: keeps the size scale symmetric across properties
tags: v4, utility, plugin, theme, spacing, radius
---

## Use @utility for Custom Token-Driven Utilities

`@utility` lets you author your own dynamic utilities backed by theme tokens. The most common need is making `rounded-{N}` consistent with the rest of the size scale.

**Why this comes up:** `rounded-{N}` looks up `--radius-*`, **not** `--spacing` — asymmetric with `p-N` / `m-N` / `border-{N}` / `underline-offset-N`, all of which DO use `--spacing`. If you've set `--spacing: 1px` (or any base unit) and want consistent semantics across all size utilities, define this once:

```css
@utility rounded-* {
  border-radius: --spacing(--value(integer));
}
```

Place it alongside `@theme`. Now `rounded-8` = `8 * --spacing` like every other size utility — no need to add a parallel `--radius-N` for every value.

**Other patterns this enables:** Anywhere a built-in utility looks up the wrong token namespace, write a thin `@utility` rule rather than duplicating tokens.

### `@plugin`, `@theme`, `@utility` placement

These directives, plus `@source` and `@apply`, must all live in CSS that Tailwind's compiler processes — your top-level `@import "tailwindcss"` graph.

**Anti-pattern:**

- Putting `@plugin`, `@theme`, or `@utility` in an unrelated stylesheet that isn't reached from the entry CSS
- Nesting them inside a scoped style block (e.g. inside a `:where(...)` or component-scoped CSS module that runs through a different pipeline)
- Injecting them at runtime

In all of these cases the directives are invisible to Tailwind and silently do nothing. Keep them at the top level of CSS files reached by your `@import "tailwindcss"`.
