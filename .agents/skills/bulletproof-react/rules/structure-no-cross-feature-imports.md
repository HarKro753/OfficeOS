---
title: No Cross-Feature Imports
impact: CRITICAL
impactDescription: keeps features independent and refactorable
tags: structure, imports, features, boundaries
---

## No Cross-Feature Imports

Features must never import directly from other features. If two features need to share code, either extract the shared code to the shared layer or compose them at the app level.

**Incorrect (feature importing from another feature):**

```typescript
// src/features/checkout/components/checkout-form.tsx
import { useAuth } from '@/features/auth'
import { CartItem } from '@/features/cart/types'
import { ProductImage } from '@/features/product/components/product-image'
```

**Correct (compose at the app level):**

```typescript
// src/features/checkout/components/checkout-form.tsx
import type { CartItem } from '@/features/checkout/types' // Own types
import { useCheckout } from '../hooks/use-checkout'

// src/app/routes/checkout.tsx — app layer composes features
import { useAuth } from '@/features/auth'
import { useCart } from '@/features/cart'
import { CheckoutForm } from '@/features/checkout'

function CheckoutPage() {
  const { user } = useAuth()
  const { items } = useCart()
  return <CheckoutForm user={user} items={items} />
}
```

**When shared code is needed:**

```
# Move shared types/utils to the shared layer
src/
  types/
    cart-item.ts    # Shared type used by cart AND checkout
  features/
    cart/           # Imports from @/types/cart-item
    checkout/       # Imports from @/types/cart-item
```

Enforce with Biome's `noRestrictedImports` or a project-level convention. Biome catches many import issues natively. For strict boundary enforcement beyond what Biome provides, review imports during code review:

```json
// biome.json
{
  "linter": {
    "rules": {
      "style": {
        "noRestrictedGlobals": "error"
      }
    }
  }
}
```

**Architectural discipline:** Even without a linter rule, the convention is clear — features import from `@/` shared paths, never `@/features/other-feature`. Code review and clear directory structure enforce this in practice.
