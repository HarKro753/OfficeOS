---
title: Prefer Static Utilities Over Arbitrary Properties
impact: HIGH
impactDescription: avoids bypassing the design system for values that already have a utility
tags: util, arbitrary, static-utilities, inherit
---

## Prefer Static Utilities Over Arbitrary Properties

Arbitrary properties (`[property:value]`) are an escape hatch. Reaching for them when a static utility already exists fragments the codebase and trains the wrong instincts.

**Don't write the arbitrary form when a static utility exists:**

| Don't write | Use |
|---|---|
| `[color:inherit]` | `text-inherit` |
| `[color:currentColor]` | `text-current` |
| `[color:transparent]` | `text-transparent` |
| `[text-decoration-thickness:Npx]` (N=0,1,2,4,8) | `decoration-N` |
| `[border-width:1px]` | `border` |
| `[font-style:italic]` | `italic` |
| `[font-style:normal]` | `not-italic` |
| `[text-decoration-line:underline]` | `underline` |
| `[text-transform:uppercase]` | `uppercase` |
| `[background-color:transparent]` | `bg-transparent` |
| `[padding:0]` | `p-0` |
| `[float:left]` | `float-left` |
| `[overflow-x:auto]` | `overflow-x-auto` |
| `[pointer-events:none]` | `pointer-events-none` |

These work even under `@theme inline { --*: initial }` because they don't depend on tokens. The Tailwind LSP surfaces these as hints — let it guide you.

### Theme-dependent utilities: re-declare the token, don't reach for arbitrary

If you reset with `--*: initial` and need `font-normal` / `font-bold` / `tracking-normal` / `ease-out` / etc., **re-declare just what you use** in `@theme inline`:

```css
@theme inline {
  --*: initial;
  /* re-declare only what's actually used */
  --font-weight-normal: 400;
  --font-weight-bold: 700;
  --tracking-normal: 0;
  --ease-out: cubic-bezier(0, 0, 0.2, 1);
}
```

Now `font-normal`, `font-bold`, `tracking-normal`, `ease-out` work as utilities. Reserve `[property:value]` for values that genuinely have no token: `inherit`, `currentColor` in non-color contexts, em-relative values, custom multi-property shorthands.

### Don't restate `inherit` for properties already inherited

`color`, `font-family`, `font-size`, `font-weight`, `line-height`, `letter-spacing` inherit by default. You only need an explicit `inherit` declaration when **a more specific selector earlier in the cascade has already overridden** the property — and even then, audit which property actually conflicts and override only that one.

```css
/* WRONG — font-size and font-weight aren't being overridden, just color */
.prose pre code {
  color: inherit;
  font-size: inherit;
  font-weight: inherit;
}

/* RIGHT — only the property that actually has a conflicting rule upstream */
.prose pre code { @apply text-inherit; }
```
