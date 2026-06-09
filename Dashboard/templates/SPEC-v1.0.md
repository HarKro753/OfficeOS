---
version: alpha
type: mobile-app-spec
targetVersion: "1.0"
app:
  name: YUKA
  category: Health & Fitness
  platforms:
    - iOS
  description: Scan packaged food, understand its health score, and discover healthier alternatives.
  keywords:
    - food scanner
    - nutrition
    - healthy food
    - product alternatives
    - openfoodfacts
audience:
  primary: People who want simple, fast guidance when choosing packaged food.
  secondary: People exploring healthier foods by category, preference, and country availability.
  notFor: Medical diagnosis, clinical nutrition plans, or treatment-specific diet advice.
assets:
  appIcon: assets/brand/yuka-app-icon.png
  appLogo: assets/brand/yuka-app-icon.png
urls:
  appStore: https://appstoreconnect.apple.com/apps/officeos-yuka
  posthog: https://app.posthog.com/project/officeos-yuka
submission:
  designSystem: DESIGN.md
  assetRule: Assets must be referenced directly inside SPEC-v1.0.md or DESIGN.md.
data:
  productDataset: assets/data/openfoodfacts-yuka-sample.csv
scope:
  fromScratchMobileApp: true
  thirdPartyAuthenticatedSystems: unsupported unless explicitly approved
  liveLegacyIntegrations: unsupported unless explicitly approved
  missingScreensOrSections: not allowed
---

# YUKA App Spec - v1.0

## Overview

Version 1.0 is the live YUKA baseline. Users can scan or search packaged food, browse healthy products in Explore, open Product Details, inspect expanded nutrition evidence, and compare alternative products.

History is not part of v1.0.

## Goals

### User Goals

- Quickly identify whether a packaged food product is healthy.
- Understand why a product received its score.
- Find healthier alternatives that are similar enough to be useful substitutes.
- Browse healthy products by category and personal preference.

### Business / Operational Goals

- Provide a simple food-scanning experience that feels fast and trustworthy.
- Make healthy alternatives visible at the moment a user evaluates a product.
- Use the supplied OpenFoodFacts-derived CSV as the product source for scan, search, explore, detail, and alternatives.
- Keep v1.0 focused on Scanner, Explore, and Product Details.

## Scope

### In Scope

- iOS app with Apple-native UX patterns.
- Onboarding section for lightweight personalization.
- Two top-level app sections after onboarding: Scanner and Explore.
- Scanner section for barcode scan and typed product search.
- Explore section for browsing healthy products by category.
- Shared Product Details screen opened from Scanner, Search, Explore, and Alternatives.
- Alternative product recommendations based on similar category and preferable health score where available.

### Out of Scope

- Product History.
- Favorites or saved products.
- User accounts.
- Cloud sync.
- Medical advice or clinical nutrition recommendations.
- Live OpenFoodFacts API integration.
- Android for this version.

## App Navigation

After onboarding, the app has two top-level app-bar sections:

- Scanner
- Explore

Product Details is a shared detail destination, not a top-level section.

Navigation rules:

- A successful barcode scan opens Product Details for the matched product.
- Selecting a search result opens Product Details.
- Selecting any product item in Explore opens Product Details.
- Selecting an alternative product from Product Details opens Product Details for that alternative.
- Back from Product Details returns to the section that opened it.

## Sections & Screens

### Section: Scanner

Scanner lets users find products by barcode scan or typed search.

#### Screen: Scanner

![Scanner](assets/screens/v1.0/scanner.png)

The Scanner screen is the v1.0 product lookup entry point.

### Section: Explore

Explore lets users browse healthy products without scanning first.

#### Screen: Explore Home

![Explore home](assets/screens/v1.0/explore.png)

Explore shows product categories, horizontal product rows, product imagery, product names, brands, and score indicators.

#### Screen: Explore Filter Open

![Explore filter open](assets/screens/v1.0/explore-filter.png)

The Explore filter state uses a light iOS floating-panel treatment.

### Section: Product Details

Product Details explains the selected product's score and provides healthier similar alternatives.

#### Screen: Product Details Overview

![Product details overview](assets/screens/v1.0/product-detail.png)

The detail overview shows product image, product name, brand, score, score label, positive nutrition factors, and negative nutrition factors.

#### Screen: Product Details Expanded Nutrients

![Product details expanded nutrients](assets/screens/v1.0/product-detail-expanded-sections.png)

Expanded nutrient rows show threshold bars and value markers.

#### Screen: Product Details Alternatives

![Product details alternatives](assets/screens/v1.0/product-detail-alternatives.png)

Alternative cards show healthier or relevant substitute products and open Product Details when selected.

## Functional Requirements

- The app must load product data from the attached OpenFoodFacts-derived CSV.
- Scanner and search must open Product Details for matched products.
- Explore product cards must open Product Details.
- Product Details must show product name, brand, image, numeric score, score label, positive nutrients, negative nutrients, and per-100g values where available.
- Product Details must show healthier similar alternatives when matching products exist in the CSV.
- Explore filters should support Low Calorie, High Protein, High Nutri Score, Vegan, and Vegetarian where CSV fields support them.

## Acceptance Criteria

- Scanner and Explore are available after onboarding.
- Product search returns matching CSV products and opens Product Details.
- Barcode scan opens the matching product when barcode data exists.
- Explore displays category-based product rows and product cards.
- Product Details displays score, nutrition breakdown, expandable nutrient information, and alternatives.
- Selecting an alternative opens Product Details for that product.
- There is no History top-level section in v1.0.
- The implementation follows `DESIGN.md` and the inline screenshots as the visual source of truth.

## Assets

- `assets/brand/yuka-app-icon.png`
- `assets/data/openfoodfacts-yuka-sample.csv`
- `assets/screens/v1.0/scanner.png`
- `assets/screens/v1.0/explore.png`
- `assets/screens/v1.0/explore-filter.png`
- `assets/screens/v1.0/product-detail.png`
- `assets/screens/v1.0/product-detail-expanded-sections.png`
- `assets/screens/v1.0/product-detail-alternatives.png`

## Risks & Assumptions

- The CSV contains enough product metadata for search, barcode lookup, category grouping, scoring, and recommendations.
- If product images are missing, OfficeOS should use a clean placeholder style.
- This app provides health guidance, not medical advice.
