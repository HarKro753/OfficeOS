import type { MockAsset, SourceDoc } from "../types";

const clientAssets: MockAsset[] = [
  {
    name: "openfoodfacts-yuka-sample.csv",
    path: "assets/data/openfoodfacts-yuka-sample.csv",
    kind: "file",
    description: "Mock product dataset for scan, search, and explore behavior.",
  },
  {
    name: "yuka-app-icon.png",
    path: "assets/brand/yuka-app-icon.png",
    kind: "image",
    description: "Mock brand asset for the YUKA app identity.",
  },
  {
    name: "scanner.png",
    path: "assets/screens/v1.0/scanner.png",
    kind: "image",
    description: "v1.0 baseline Scanner screen.",
  },
  {
    name: "explore.png",
    path: "assets/screens/v1.0/explore.png",
    kind: "image",
    description: "v1.0 baseline Explore screen.",
  },
  {
    name: "explore-filter.png",
    path: "assets/screens/v1.0/explore-filter.png",
    kind: "image",
    description: "v1.0 baseline Explore filter state.",
  },
  {
    name: "product-detail.png",
    path: "assets/screens/v1.0/product-detail.png",
    kind: "image",
    description: "v1.0 baseline Product Details screen.",
  },
  {
    name: "product-detail-expanded-sections.png",
    path: "assets/screens/v1.0/product-detail-expanded-sections.png",
    kind: "image",
    description: "v1.0 baseline expanded Product Details sections.",
  },
  {
    name: "product-detail-alternatives.png",
    path: "assets/screens/v1.0/product-detail-alternatives.png",
    kind: "image",
    description: "v1.0 baseline Product Details alternatives.",
  },
  {
    name: "history.png",
    path: "assets/screens/v1.1/history.png",
    kind: "image",
    description: "v1.1 submitted update screenshot for the Product History page.",
  },
];

const clientSourceDocs: SourceDoc[] = [
  {
    key: "SPEC.md",
    label: "SPEC.md",
    role: "Product contract",
    description:
      "Defines the app, navigation, screens, requirements, and acceptance criteria.",
    content: `# YUKA App Spec

## Overview

YUKA is a clean iOS health app for packaged food discovery. Users can search or scan products, see a simple health score, discover healthier alternatives, and revisit recently viewed products.

## Scope

- iOS app with onboarding, Scanner, Explore, History, and shared Product Details.
- Product recommendations use the supplied OpenFoodFacts-derived CSV.
- Medical advice, accounts, live OpenFoodFacts sync, checkout, and Android are out of scope.

## App Navigation

After onboarding, the app has three top-level app-bar sections:

- Scanner
- Explore
- History

Product Details is a shared detail destination opened from scan results, search results, Explore cards, alternative cards, and History rows.

## Acceptance Criteria

- Scanner and search open Product Details for matched products.
- Explore shows healthy products by category and market where available.
- Product Details explains score drivers and presents healthier alternatives.
- History shows recently viewed products and opens Product Details.
- Back navigation returns to the section that opened Product Details.`,
  },
  {
    key: "DESIGN.md",
    label: "DESIGN.md",
    role: "Design contract",
    description:
      "Defines colors, typography, layout, components, and visual constraints.",
    content: `# YUKA Design System

## Direction

The app should feel like a clean native iOS health utility: white canvas, strong black typography, soft gray secondary text, and minimal decoration.

## Colors

- Primary action: #0A84FF
- Background: #FFFFFF
- Muted surface: #F4F4F5
- Excellent score: #34C759
- Medium score: #FF8A24
- Poor score: #FF3B30

## Components

- Onboarding choice rows are full-width rounded rectangles.
- Product cards show image, name, brand, score dot, and numeric score.
- Explore filters appear as a floating rounded panel.
- History rows show product image, name, brand, score, score label, viewed time, and chevron.
- The v1.1 bottom navigation includes Scanner, Explore, and History.
- Product Details nutrient rows use clear positive and negative sections.

## Preserve

Keep product imagery, native-feeling search/scanner controls, and simple list rows as the main visual language.`,
  },
  {
    key: "ChangeRequest.md",
    label: "Update brief",
    role: "Change contract",
    description:
      "Defines the governed app update that modifies the source of truth.",
    content: `---
version: alpha
type: mobile-app-change-request
app:
  name: YUKA
request:
  title: Add product history tab
  requestedBy: OfficeOS Demo
  date: 2026-06-06
  priority: normal
  changeType: feature
---

# App Update Brief

## Request

Add a History tab to the app.

## Current Behavior

Version 1.0 has Scanner and Explore as the primary app sections. Users can open Product Details from scans, search results, Explore product cards, and alternative product cards. There is no page where users can revisit products they already opened.

## Why This Change Matters

Users often compare more than one product while shopping. A History page lets them return to recently viewed products without rescanning, retyping, or finding the same item again in Explore.

## Desired Behavior

After the change exists, the app should have a new History tab next to Scanner and Explore.

History should show recently viewed products in chronological order, with the most recent product first.

A product should appear in History after the user opens Product Details from:

- a successful barcode scan
- a search result
- an Explore product card
- an alternative product card

Each history item should show enough information for the user to recognize the product:

- product image
- product name
- brand
- score
- score label or colored score indicator
- last viewed time or date

Selecting a history item should open Product Details for that product.

## Affected App Areas

- App Navigation
- Scanner
- Explore
- Product Details
- History
- Design System

## App Navigation Impact

Add History as a new top-level app-bar section next to Scanner and Explore.

After the change, the top-level app-bar sections are:

- Scanner
- Explore
- History

Product Details remains a shared detail destination, not a top-level section.

Navigation rules:

- Selecting a History item opens Product Details for that product.
- Back from Product Details returns to History when Product Details was opened from History.
- Existing Scanner and Explore navigation should continue to work as before.

## New or Changed Screens

### Screen: Product History

![Product History](assets/screens/v1.1/history.png)

This is the only new page in v1.1. It lists recently viewed products as native-feeling iOS rows with image, name, brand, score, score label, viewed time, and chevron. The bottom navigation shows History as the active tab.

## Data & Content

History stores or derives a local list of recently viewed products.

Each history entry should include:

- product id or barcode
- product image
- product name
- brand
- score
- score label or colored score indicator
- last viewed time or date

Sorting rule: most recently viewed product first.

Deduplication rule: if the same product is viewed again, move it to the top instead of showing duplicate rows.

Empty state: if no products have been viewed yet, show a simple empty state explaining that scanned or opened products will appear here.

## Acceptance Criteria

- Given the user opens Product Details from a successful barcode scan, when they return to History, then that product appears at the top of History.
- Given the user opens Product Details from a search result, when they return to History, then that product appears at the top of History.
- Given the user opens Product Details from an Explore product card, when they return to History, then that product appears at the top of History.
- Given the user opens Product Details from an alternative product card, when they return to History, then that product appears at the top of History.
- Given the user views the same product multiple times, History shows one row for that product and moves it to the top.
- Given History contains products, selecting any History item opens Product Details for that product.
- Given Product Details was opened from History, tapping back returns to History.
- Given History has no viewed products, the History screen shows a simple empty state.
- Existing Scanner, Explore, Product Details, and Alternatives behavior continues to work.

## Non-Goals

- Favorites or saved products.
- User accounts.
- Cloud-synced history.
- Manual product notes.
- Purchase history or grocery list behavior.

## Assets

- \`assets/screens/v1.1/history.png\``,
  },
];

export function getClientMockMarkdownEditorData() {
  return {
    assets: clientAssets,
    sourceDocs: clientSourceDocs,
  };
}

export function getClientMockChangeRequestData() {
  return {
    assets: clientAssets,
    sourceDocs: clientSourceDocs.filter((doc) => doc.key === "ChangeRequest.md"),
  };
}
