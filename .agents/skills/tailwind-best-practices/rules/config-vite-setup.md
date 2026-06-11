---
title: Use the Vite Plugin Over PostCSS
impact: CRITICAL
impactDescription: faster builds with native Vite integration
tags: config, vite, postcss, setup, v4
---

## Use the Vite Plugin Over PostCSS

Tailwind v4 ships a dedicated Vite plugin that's faster than the PostCSS path. If you're using Vite (or a Vite-based framework like Next.js, Remix, SvelteKit, etc.), prefer `@tailwindcss/vite` over `@tailwindcss/postcss`.

**Incorrect (using PostCSS when on Vite):**

```js
// postcss.config.js — unnecessary overhead with Vite
export default {
  plugins: {
    '@tailwindcss/postcss': {},
  },
}
```

**Correct (Vite plugin):**

```js
// vite.config.ts
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    tailwindcss(),
  ],
})
```

Then import Tailwind in your CSS entry point:

```css
@import "tailwindcss";
```

**When PostCSS is still needed:** Only if your build tool doesn't support Vite plugins (e.g., webpack, Parcel, or a legacy pipeline). In that case, use `@tailwindcss/postcss`.

### Verifying CSS compilation

Type-checks and lint don't exercise the CSS pipeline. To verify a Tailwind setup actually compiles:

1. Build the project for production.
2. Grep the emitted CSS to confirm specific utilities expanded:
   ```bash
   grep -o '\.your-class{[^}]*}' dist/**/*.css
   ```
3. If a utility is missing from output, it either wasn't matched in the content scan, was filtered by `--*: initial`, or expanded into a different rule than expected (Tailwind v4 splits some `@apply`s across multiple blocks plus a `@supports color-mix` fallback — that's normal).

This catches `@apply unknown utility` errors that don't always surface during dev.
