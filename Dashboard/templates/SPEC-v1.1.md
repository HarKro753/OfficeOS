---
version: alpha
type: mobile-app-spec
targetVersion: "1.1"
app:
  name: YUKA
  category: Health & Fitness
  platforms:
    - iOS
  description: Scan packaged food, understand its health score, discover healthier alternatives, and revisit recently viewed products.
  keywords:
    - food scanner
    - nutrition
    - healthy food
    - product history
    - openfoodfacts
audience:
  primary: People who want simple, fast guidance when choosing packaged food.
  secondary: People who compare recently scanned or browsed products before buying.
  notFor: Medical diagnosis, clinical nutrition plans, or treatment-specific diet advice.
assets:
  appIcon: assets/brand/yuka-app-icon.png
  appLogo: assets/brand/yuka-app-icon.png
urls:
  appStore: https://appstoreconnect.apple.com/apps/officeos-yuka
  posthog: https://app.posthog.com/project/officeos-yuka
submission:
  designSystem: DESIGN.md
  assetRule: Assets must be referenced directly inside SPEC-v1.1.md or DESIGN.md.
data:
  productDataset: assets/data/openfoodfacts-yuka-sample.csv
scope:
  fromScratchMobileApp: true
  thirdPartyAuthenticatedSystems: unsupported unless explicitly approved
  liveLegacyIntegrations: unsupported unless explicitly approved
  missingScreensOrSections: not allowed
---

# YUKA App Spec - v1.1

## Overview

Version 1.1 keeps the v1.0 Scanner, Explore, Product Details, expanded nutrients, and alternative cards. It adds one new page: Product History.

History makes recently viewed products recoverable without scanning, searching, or browsing for the same item again.

## Goals

### User Goals

- Quickly identify whether a packaged food product is healthy.
- Understand why a product received its score.
- Find healthier alternatives that are similar enough to be useful substitutes.
- Browse healthy products by category and personal preference.
- Reopen recently viewed products from one chronological History page.

### Business / Operational Goals

- Preserve the v1.0 product discovery flow.
- Make product comparison easier by preserving recently viewed products.
- Use the supplied OpenFoodFacts-derived CSV as the product source for scan, search, explore, detail, alternatives, and history rows.
- Keep the v1.1 update focused on History only.

## Scope

### In Scope

- iOS app with Apple-native UX patterns.
- Top-level app sections after onboarding: Scanner, Explore, and History.
- Scanner section for barcode scan and typed product search.
- Explore section for browsing healthy products by category.
- Shared Product Details screen opened from Scanner, Search, Explore, Alternatives, and History.
- History section showing recently viewed products in chronological order.
- Local, device-level product history for the mock app.

### Out of Scope

- Favorites or saved products.
- User accounts.
- Cloud-synced history.
- Manual product notes.
- Purchase history or grocery list behavior.
- Live OpenFoodFacts API integration.
- Android for this version.

## App Navigation

After onboarding, the app has three top-level app-bar sections:

- Scanner
- Explore
- History

Product Details remains a shared detail destination, not a top-level section.

Navigation rules:

- A successful barcode scan opens Product Details for the matched product.
- Selecting a search result opens Product Details.
- Selecting any product item in Explore opens Product Details.
- Selecting an alternative product from Product Details opens Product Details for that alternative.
- Selecting a History item opens Product Details for that product.
- Back from Product Details returns to the section that opened it.
- Opening Product Details from any source writes or updates one History entry for that product.

## Sections & Screens

### Section: Scanner

#### Screen: Scanner

![Scanner](assets/screens/v1.0/scanner.png)

Scanner remains the product lookup entry point from v1.0.

### Section: Explore

#### Screen: Explore Home

![Explore home](assets/screens/v1.0/explore.png)

Explore remains the product browsing page from v1.0. Selecting a product opens Product Details and writes that product to History.

#### Screen: Explore Filter Open

![Explore filter open](assets/screens/v1.0/explore-filter.png)

Explore filtering remains available and visually unchanged.

### Section: Product Details

#### Screen: Product Details Overview

![Product details overview](assets/screens/v1.0/product-detail.png)

Product Details remains the shared product review page.

#### Screen: Product Details Expanded Nutrients

![Product details expanded nutrients](assets/screens/v1.0/product-detail-expanded-sections.png)

Expanded nutrients remain available.

#### Screen: Product Details Alternatives

![Product details alternatives](assets/screens/v1.0/product-detail-alternatives.png)

Alternative cards remain available. Selecting an alternative opens Product Details and writes that product to History.

### Section: History

#### Screen: Product History

![Product History](assets/screens/v1.1/history.png)

History is the only new page in v1.1. It lists recently viewed products in chronological order, most recent first. Each row includes product image, product name, brand, score indicator, numeric score, score label, last viewed time, and a chevron. Selecting a row opens Product Details for that product. The bottom app navigation shows History as the active section.

## Functional Requirements

- The app must load product data from the attached OpenFoodFacts-derived CSV.
- Scanner and search must open Product Details for matched products.
- Explore product cards must open Product Details.
- Alternative product cards must open Product Details.
- Product Details must show product name, brand, image, numeric score, score label, positive nutrients, negative nutrients, and per-100g values where available.
- History must show products after the user opens Product Details from Scanner, Search, Explore, or Alternatives.
- History must sort products by most recently viewed first.
- History must deduplicate repeated product views by moving the existing product row to the top.
- History rows must open Product Details.

## Acceptance Criteria

- Scanner, Explore, Product Details, and History are available after onboarding.
- Given the user opens Product Details from a successful barcode scan, when they open History, then that product appears at the top.
- Given the user opens Product Details from a search result, when they open History, then that product appears at the top.
- Given the user opens Product Details from an Explore product card, when they open History, then that product appears at the top.
- Given the user opens Product Details from an alternative product card, when they open History, then that product appears at the top.
- Given the user views the same product multiple times, History shows one row for that product and moves it to the top.
- Given History contains products, selecting any History item opens Product Details.
- Given Product Details was opened from History, tapping back returns to History.
- Given History has no viewed products, the History screen shows a simple empty state.
- Existing Scanner, Explore, Product Details, and Alternatives behavior continues to work.

## Assets

- `assets/brand/yuka-app-icon.png`
- `assets/data/openfoodfacts-yuka-sample.csv`
- `assets/screens/v1.0/scanner.png`
- `assets/screens/v1.0/explore.png`
- `assets/screens/v1.0/explore-filter.png`
- `assets/screens/v1.0/product-detail.png`
- `assets/screens/v1.0/product-detail-expanded-sections.png`
- `assets/screens/v1.0/product-detail-alternatives.png`
- `assets/screens/v1.1/history.png`

## Risks & Assumptions

- The CSV contains enough product metadata to populate History rows.
- The v1.1 History screenshot is the visual source of truth for this update.
- History is local mock behavior, not a synced user account feature.
- This app provides health guidance, not medical advice.
