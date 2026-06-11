---
title: Don't Add `content-none` to `before:` / `after:`
impact: MEDIUM
impactDescription: avoids disabling the pseudo-element you just enabled
tags: util, pseudo-element, before, after, content
---

## Don't Add `content-none` to `before:` / `after:`

In Tailwind v4, `before:` and `after:` variants automatically inject `content: var(--tw-content)` with `--tw-content` defaulting to `""`. The pseudo-element already renders — you don't need a separate `content-*` utility to enable it.

Adding `before:content-none` doesn't make it "render with no content" — `none` actually **disables the pseudo-element entirely**, so anything else you stacked on `before:` (size, position, background) is dropped.

**Incorrect (the `content-none` cancels the pseudo-element):**

```html
<!-- ✗ before:content-none disables the pseudo-element — the bg-foam never paints -->
<div class="before:content-none before:absolute before:inset-0 before:bg-foam" />

<!-- ✗ Redundant — content is already "" by default under before:/after: -->
<span class="after:content-none after:ml-1 after:text-fg-muted">Required</span>
```

**Correct:**

```html
<!-- ✓ before: alone is enough — content defaults to "" -->
<div class="before:absolute before:inset-0 before:bg-foam" />

<!-- ✓ When you need explicit content, set it with content-[...] -->
<span class="after:content-['*'] after:ml-1 after:text-fg-muted">Required</span>
```

**When `content-none` IS the right answer:** only when you need to **suppress** a pseudo-element that an upstream stylesheet declared. The classic case is overriding a third-party rule:

```css
/* Some plugin you don't control */
.prose code::before { content: '`'; }

/* Your override — content-none here genuinely removes the backtick */
.prose code { @apply before:content-none; }
```

If you're not overriding existing `content`, you don't need `content-none`. Reach for `before:` / `after:` variants directly and let the default empty string carry you.
