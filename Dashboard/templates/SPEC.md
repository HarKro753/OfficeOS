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
  privacyPolicy:
  terms:
  support:
submission:
  designSystem: DESIGN.md
  assetRule: Assets must be referenced directly inside SPEC.md or DESIGN.md.
data:
  productDataset: assets/data/openfoodfacts-yuka-sample.csv
scope:
  fromScratchMobileApp: true
  thirdPartyAuthenticatedSystems: unsupported unless explicitly approved
  liveLegacyIntegrations: unsupported unless explicitly approved
  missingScreensOrSections: not allowed
---

# YUKA App Spec

## Overview

YUKA is a clean iOS health app for packaged food discovery. Users can scan or search products, browse healthier products by category, review product details, compare alternatives, and revisit products they already opened.

Version 1.1 adds one new user-facing page: History. History makes recently viewed products recoverable without scanning or searching again.

## Goals

### User Goals

- Quickly identify whether a packaged food product is healthy.
- Understand why a product received its score.
- Find healthier alternatives that are similar enough to be useful substitutes.
- Browse healthy products by category and personal preference.
- Reopen recently viewed products from one chronological History page.

### Business / Operational Goals

- Keep the first app experience simple and native-feeling.
- Make product comparison easier by preserving recently viewed products.
- Use the supplied OpenFoodFacts-derived CSV as the product source for scan, search, explore, detail, alternatives, and history rows.
- Keep the v1.1 update focused on History only.

## Scope

### In Scope

- iOS app with Apple-native UX patterns.
- Onboarding section for lightweight personalization.
- Top-level app sections after onboarding: Scanner, Explore, and History.
- Scanner section for barcode scan and typed product search.
- Explore section for browsing healthy products by category.
- Shared Product Details screen opened from Scanner, Search, Explore, Alternatives, and History.
- History section showing recently viewed products in chronological order.
- Local, device-level product history for the mock app.

### Out of Scope

- Medical advice or clinical nutrition recommendations.
- User accounts.
- Cloud-synced history.
- Favorites, saved lists, manual notes, grocery cart, checkout, delivery, or affiliate purchasing.
- Live OpenFoodFacts API integration.
- Android for this version.

## App Navigation

After onboarding, the app has three top-level app-bar sections:

- Scanner
- Explore
- History

Product Details is a shared detail destination, not a top-level section.

Navigation rules:

- A successful barcode scan opens Product Details for the matched product.
- Selecting a search result opens Product Details.
- Selecting any product item in Explore opens Product Details.
- Selecting an alternative product from Product Details opens Product Details for that alternative.
- Selecting a History item opens Product Details for that product.
- Back from Product Details returns to the section that opened it.
- Opening Product Details from any source writes or updates one History entry for that product.

## Sections & Screens

Every app section must be described. Every screen or subscreen inside that section must be included inline with its screenshot, mockup, or attached visual asset. The screen description belongs directly next to that visual.

### Section: Scanner

Scanner lets users find products by barcode scan or typed search.

#### Screen: Scanner

![Scanner](assets/screens/v1.0/scanner.png)

The Scanner screen is the v1.0 baseline for product lookup. It should preserve the large native title, simple scan/search controls, and direct route into Product Details.

### Section: Explore

Explore lets users browse healthy products without scanning first.

#### Screen: Explore Home

![Explore home](assets/screens/v1.0/explore.png)

The Explore screen shows product categories, horizontal product rows, product imagery, product names, brands, and score indicators. Selecting a product opens Product Details and writes that product to History in v1.1.

#### Screen: Explore Filter Open

![Explore filter open](assets/screens/v1.0/explore-filter.png)

The Explore filter state remains part of the baseline app. Filters should preserve the same light iOS floating-panel treatment.

### Section: Product Details

Product Details explains the selected product's score and provides healthier similar alternatives.

#### Screen: Product Details Overview

![Product details overview](assets/screens/v1.0/product-detail.png)

The detail overview shows product image, product name, brand, score, score label, positive nutrition factors, and negative nutrition factors.

#### Screen: Product Details Expanded Nutrients

![Product details expanded nutrients](assets/screens/v1.0/product-detail-expanded-sections.png)

Expanded nutrient rows show threshold bars and value markers so users can understand the score breakdown.

#### Screen: Product Details Alternatives

![Product details alternatives](assets/screens/v1.0/product-detail-alternatives.png)

Alternative cards show healthier or relevant substitute products. Selecting an alternative opens Product Details and writes that alternative product to History in v1.1.

### Section: History

History is new in v1.1. It lets users reopen products they already viewed.

#### Screen: Product History

![Product History](assets/screens/v1.1/history.png)

The History screen lists recently viewed products in chronological order, most recent first. Each row includes product image, product name, brand, score indicator, numeric score, score label, last viewed time, and a chevron. Selecting a row opens Product Details for that product. The bottom app navigation shows History as the active section.

## Functional Requirements

### P0: Core Requirements

- The app must load product data from the attached OpenFoodFacts-derived CSV.
- Scanner and search must open Product Details for matched products.
- Explore product cards must open Product Details.
- Product Details must show product name, brand, image, numeric score, score label, positive nutrients, negative nutrients, and per-100g values where available.
- Product Details must show healthier similar alternatives when matching products exist in the CSV.
- History must show products after the user opens Product Details from Scanner, Search, Explore, or Alternatives.
- History must sort products by most recently viewed first.
- History must deduplicate repeated product views by moving the existing product row to the top.

### P1: Supporting Requirements

- History rows should show a readable last viewed time or date.
- History should have a clean empty state when no products have been viewed.
- Product cards, alternative rows, and history rows should all use consistent score colors and labels.
- Existing Scanner, Explore, and Product Details behavior should remain usable after adding History.

### P2: Future Requirements

- Favorites or saved products.
- Cloud-synced history.
- User accounts.
- Additional diets or allergens.
- Android version.

## Design System

The visual design system belongs in `DESIGN.md`.

The app should preserve a simple, clean, white iOS-native style with large titles, soft floating controls, black primary text, muted gray secondary text, sparse use of strong color, and consistent nutrition score indicators.

## Custom Assets

Required assets:

- `assets/brand/yuka-app-icon.png`
- `assets/data/openfoodfacts-yuka-sample.csv`
- `assets/screens/v1.0/scanner.png`
- `assets/screens/v1.0/explore.png`
- `assets/screens/v1.0/explore-filter.png`
- `assets/screens/v1.0/product-detail.png`
- `assets/screens/v1.0/product-detail-expanded-sections.png`
- `assets/screens/v1.0/product-detail-alternatives.png`
- `assets/screens/v1.1/history.png`

## Non-Functional Requirements

- Privacy: History is local to the mock app and should not imply account-level tracking.
- Reliability: Missing product fields should not break History rows.
- Accessibility: Score color cannot be the only indicator of product quality.
- Performance: History should render instantly for the small local product list.
- Offline behavior: The app should work offline after the CSV is bundled or locally available.

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

## Risks & Assumptions

- The CSV contains enough product metadata to populate History rows.
- The v1.1 History screenshot is the visual source of truth for this update.
- History is local mock behavior, not a synced user account feature.
- This app provides health guidance, not medical advice.
