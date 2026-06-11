---
title: Organize Code as Feature Packages
impact: CRITICAL
impactDescription: determines codebase scalability and team independence
tags: structure, features, packages, organization
---

## Organize Code as Feature Packages

Treat each feature as a self-contained package within the `src/features/` directory. Each feature owns its components, hooks, API calls, types, and utils. Features are the primary unit of code organization — not file type.

**Incorrect (organized by file type):**

```
src/
  components/
    UserProfile.tsx
    UserAvatar.tsx
    ProductCard.tsx
    ProductList.tsx
    CartSummary.tsx
  hooks/
    useUser.ts
    useProducts.ts
    useCart.ts
  types/
    user.ts
    product.ts
    cart.ts
```

**Correct (organized by feature):**

```
src/
  features/
    user/
      components/
        user-profile.tsx
        user-avatar.tsx
      hooks/
        use-user.ts
      types/
        index.ts
      index.ts          # Public API for this feature
    product/
      components/
        product-card.tsx
        product-list.tsx
      hooks/
        use-products.ts
      types/
        index.ts
      index.ts
    cart/
      components/
        cart-summary.tsx
      hooks/
        use-cart.ts
      types/
        index.ts
      index.ts
```

**Why feature packages:**
- Teams can work on features independently without merge conflicts
- Deleting a feature is a single directory removal
- Feature scope is immediately visible from the folder structure
- Replicable — every feature follows the same internal pattern
