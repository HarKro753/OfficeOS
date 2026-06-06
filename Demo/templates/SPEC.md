---
version: alpha
type: mobile-app-spec
app:
  name: YUKA
  category: Health & Fitness
  platforms:
    - iOS
  description: Scan packaged food, understand its health score, and discover healthier similar alternatives.
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
  appIcon:
  appLogo:
urls:
  privacyPolicy:
  terms:
  support:
submission:
  designSystem: DESIGN.md
  assetRule: Assets must be referenced directly inside SPEC.md or DESIGN.md.
data:
  productDataset: Attached CSV derived from OpenFoodFacts. OfficeOS should not fetch or recreate the full OpenFoodFacts dataset itself.
scope:
  fromScratchMobileApp: true
  thirdPartyAuthenticatedSystems: unsupported unless explicitly approved
  liveLegacyIntegrations: unsupported unless explicitly approved
  missingScreensOrSections: not allowed
---

# YUKA App Spec

## Overview

YUKA is a clean iOS health app for packaged food discovery. Users can search or scan products, see a simple health score, understand the main positive and negative nutrition signals, and discover healthier alternatives that are relatively similar to the scanned product.

The app also includes an explore experience for browsing generally healthy food. Explore recommendations should be based on product categories the user likes and the user's country or market, using the supplied OpenFoodFacts-derived CSV.

## Goals

### User Goals

- Quickly identify whether a packaged food product is healthy.
- Understand why a product received its score without reading dense nutrition tables.
- Find healthier alternatives that are similar enough to be useful substitutes.
- Browse healthy products by category and personal preference.

### Business / Operational Goals

- Provide a simple food-scanning experience that feels fast and trustworthy.
- Make healthy alternatives visible at the moment a user evaluates a product.
- Use the attached CSV as the product source for scan/search/explore behavior.
- Keep the first version focused on onboarding, scanner/search, explore, and product details.

## Scope

### In Scope

- iOS app with Apple-native UX patterns.
- Onboarding section for collecting basic personalization inputs.
- Two main app-bar sections after onboarding: Scanner and Explore.
- Scanner section for finding products by barcode scan or typed search.
- Explore section for browsing recommended healthy products by category.
- Shared Product Details screen opened from successful scans, search results, explore product cards, and alternatives.
- Product recommendations based on similar product category, health score, user-liked categories, and country/market where available in the CSV.

### Out of Scope

- Medical advice or clinical nutrition recommendations.
- User accounts unless explicitly added later.
- Live OpenFoodFacts API integration.
- Fetching or maintaining the full OpenFoodFacts dataset.
- Grocery checkout, cart, delivery, or affiliate purchasing.
- Complex diet-plan generation.
- Android for the first version.

## App Navigation

After onboarding, the app has two top-level app-bar sections:

- Scanner
- Explore

Scanner and Explore are peers. Product Details is not a top-level section; it is a shared detail destination.

Navigation rules:

- A successful barcode scan opens Product Details for the matched product.
- Selecting a search result opens Product Details.
- Selecting any product item in Explore opens Product Details.
- Selecting an alternative product from Product Details opens Product Details for that alternative.
- Back from Product Details returns to the section that opened it.

## Sections & Screens

Every app section must be described. Every screen or subscreen inside that section must be included inline with its screenshot, mockup, or attached visual asset. The screen description belongs directly next to that visual.

### Section: Onboarding

This section appears when a user opens the app for the first time. It collects lightweight personalization inputs that help the app tune explore recommendations and product suggestions.

The onboarding flow should stay short: five questions total. Each screen uses the same visual pattern shown below: progress indicator, back affordance, large title, white background, simple answer controls, and a fixed primary Continue button.

#### Screen: Onboarding Name

![Onboarding question visual pattern](assets/brand/yuka-app-icon.png)

Ask: "What should we call you?"

Input type: free text.

Purpose: personalize small moments in the app and make onboarding feel less anonymous.

Expected behavior: the user enters a first name or nickname and taps Continue. The field can be left blank if the user does not want to provide a name.

#### Screen: Onboarding Age

![Onboarding age question](assets/brand/yuka-app-icon.png)

Ask: "How old are you?"

Input type: single select.

Answer options:

- Under 18
- 18-24
- 25-34
- 35-44
- 45+

Purpose: lightly personalize recommendations and avoid treating every user profile the same.

Expected behavior: the user selects one age range and taps Continue.

#### Screen: Onboarding Country / Market

![Onboarding country market](assets/brand/yuka-app-icon.png)

Ask: "Where do you usually shop for food?"

Input type: single select or free text.

Suggested answer options:

- United States
- Germany
- France
- United Kingdom
- Other

Purpose: tune Explore recommendations toward products and categories likely to be available in the user's country or market.

Expected behavior: the user selects or enters one market and taps Continue.

#### Screen: Onboarding Dietary Preferences

![Onboarding dietary preferences](assets/brand/yuka-app-icon.png)

Ask: "Do you follow any food preferences?"

Input type: multi select.

Answer options:

- Vegan
- Vegetarian
- High protein
- Low calorie
- No preference

Purpose: tune Explore recommendations and filter defaults around the user's food preferences.

Expected behavior: the user can select one or more preferences and taps Continue.

#### Screen: Onboarding Favorite Categories

![Onboarding favorite categories](assets/brand/yuka-app-icon.png)

Ask: "What kinds of food do you want to see more of?"

Input type: multi select.

Answer options:

- Eggs
- Meat
- Vegetables
- Dairy
- Snacks
- Ready meals

Purpose: tune the Explore section toward categories the user actually wants to browse.

Expected behavior: the user can select one or more categories and taps Continue to finish onboarding. After completion, the app opens Explore.

### Section: Scanner

This section lets users find products either by scanning a barcode or using text search.

If there is no match for a scanned barcode or search query, OfficeOS should provide a simple empty/not-found state consistent with `DESIGN.md`.

#### Screen: Product Search

![Product search](assets/screens/explore-screen.png)

This screen shows typed product search with native iOS keyboard behavior. Search suggestions/results appear as a simple vertical list, with small product/category icons, bold matching text, and muted secondary text. The user can clear the search or close the search mode. Selecting a result opens Product Details.

### Section: Explore

This section lets users browse healthy products without scanning first. It should recommend products using the attached CSV, considering product category, user-liked categories, country/market availability, and health score.

#### Screen: Explore Home

![Explore home](assets/screens/explore-screen.png)

This is the main Explore screen. It uses a large title, category rows, horizontal product carousels, product cards with images, product name, brand, and score. Category headers should open category-specific result lists if that behavior is implemented.

#### Screen: Explore Filter Open

![Explore filter open](assets/screens/explore-screen.png)

This screen shows the explore filter menu opened from the top-right control. Filters include Low Calorie, High Protein, High Nutri Score, Vegan, and Vegetarian. The menu should feel like a lightweight iOS floating panel with soft blur/shadow and simple icon-text rows.

### Section: Product Details

This section explains the selected product's score and provides healthier similar alternatives.

#### Screen: Product Details Overview

![Product details overview](assets/screens/product-details-expanded.png)

This screen shows product image, product name, brand, score, score label, positive nutrition factors, and negative nutrition factors. Nutrient rows show icon, nutrient name, qualitative label, per-100g value, and colored status dot. Back and share controls are circular floating iOS-style buttons.

#### Screen: Product Details Expanded Nutrients

![Product details expanded nutrients](assets/screens/product-details-expanded.png)

This screen shows nutrient rows expanded with colored threshold bars and a marker indicating the product's value. Expanded rows should help users understand why the score is good, moderate, or poor without requiring technical nutrition knowledge.

#### Screen: Product Details Alternatives

![Product details alternatives](assets/screens/product-details-expanded.png)

This lower product-detail state shows alternative products after the nutrient breakdown. Alternatives should be products from similar categories that are healthier or otherwise useful substitutions. Each alternative should show product image, name, brand/source, score, and score label. A short explanation should clarify that ratings are based on nutritional value, ingredient quality, and processing level.

## User Stories / Use Cases

- As a food shopper, I want to scan a packaged product so that I can quickly know if it is a healthy choice.
- As a food shopper, I want healthier alternatives so that I can swap a product without changing what I am trying to buy too much.
- As a health-conscious user, I want to browse healthy products by category so that I can discover better options before shopping.
- As a user with preferences, I want explore recommendations to consider categories I like and where I am from so that the products feel relevant.
- As a user, I want to understand the score breakdown so that I can trust the recommendation.

## Functional Requirements

### P0: Core Requirements

- The app must load product data from the attached OpenFoodFacts-derived CSV.
- The app must support product search from the scanner/search section.
- The app must support barcode scan entry where product barcode data exists in the CSV.
- The app must show Product Details for selected products.
- Product Details must show product name, brand, image, numeric score, score label, positive nutrients, negative nutrients, and per-100g values where available.
- Product Details must show healthier similar alternatives when matching products exist in the CSV.
- Explore must show category-based product rows with product cards and scores.
- Onboarding must collect enough preference/context information to support personalized explore recommendations.

### P1: Supporting Requirements

- Explore filters should support Low Calorie, High Protein, High Nutri Score, Vegan, and Vegetarian where CSV fields support them.
- Product nutrient rows should be expandable to show score thresholds.
- Product cards should open Product Details.
- The app should support share from Product Details.
- Search should show matching suggestions while the user types.

### P2: Future Requirements

- User accounts and saved preferences.
- Favorites or saved products.
- Full country-aware availability beyond what is present in the supplied CSV.
- Additional diets or allergens.
- Android version.

## Design System

The visual design system belongs in `DESIGN.md`.

The app should preserve a simple, clean, white iOS-native style with large titles, soft floating controls, black primary text, muted gray secondary text, and sparse use of strong color. Score colors and nutrition-status indicators should be consistent across explore cards, detail rows, and expanded nutrient bars.

## Custom Assets

All custom assets required by the app must be submitted and referenced directly inside `SPEC.md` or `DESIGN.md`.

Required:

- App icon
- App logo, if different from the app icon
- Product dataset CSV derived from OpenFoodFacts

Required if applicable:

- Custom icons
- Custom product placeholder image
- Brand assets
- Custom fonts

## Non-Functional Requirements

- Privacy: Do not collect unnecessary personal data. Onboarding inputs should be used only for app personalization unless otherwise approved.
- Reliability: The app should handle missing CSV fields gracefully.
- Accessibility: Text should support dynamic type where practical, controls should have accessible labels, and score color should not be the only indicator of product quality.
- Performance: Search, explore, and product details should feel fast with the supplied CSV.
- Offline behavior: The app should work offline after the CSV is bundled or locally available.
- Maintenance: Recommendation rules should be understandable and adjustable without redesigning the app.

## Acceptance Criteria

- Onboarding, Scanner, Explore, and Product Details sections are implemented.
- Every screen shown in this spec has a corresponding implemented screen or state.
- Product search returns matching CSV products and opens Product Details.
- Barcode scan opens the matching product when barcode data exists.
- Explore displays category-based product rows and product cards.
- Product Details displays score, nutrition breakdown, expandable nutrient information, and alternatives.
- Alternatives are drawn from products that are similar by category and preferable by health score where available.
- The implementation follows `DESIGN.md` and the inline screenshots as the visual source of truth.
- OfficeOS-owned empty/loading/error states are clean, simple, and consistent with the design system.

## Risks & Assumptions

- The CSV will contain enough product metadata for search, barcode lookup, category grouping, scoring, and recommendations.
- If the CSV does not contain country/market data, country-based recommendation behavior will be limited or skipped.
- If product images are missing, OfficeOS should use a clean placeholder style.
- This app provides health guidance, not medical advice.
