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

YUKA is a clean iOS health app for packaged food discovery. Users can search or scan products, see a simple health score, understand the main positive and negative nutrition signals, and discover healthier alternatives.

## Scope

- iOS app with onboarding, Scanner, Explore, and shared Product Details.
- Product recommendations use the supplied OpenFoodFacts-derived CSV.
- Medical advice, accounts, live OpenFoodFacts sync, checkout, and Android are out of scope.

## App Navigation

After onboarding, the app has two top-level app-bar sections:

- Scanner
- Explore

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
    content: `# App Update Brief

## Request

Add a product History tab to YUKA.

## Desired Behavior

- Add History as a top-level app section next to Scanner and Explore.
- Show recently viewed products in chronological order.
- Store products opened from Scanner, Search, Explore, and Alternatives.
- Preserve Scanner, Explore, and Product Details behavior.

## Affected App Areas

- App Navigation
- History
- Scanner
- Explore
- Product Details
- QA evidence screenshots

## Acceptance Criteria

- Products opened from scan, search, Explore, or Alternatives appear in History.
- Reopened products move to the top without duplication.
- History rows open Product Details.
- Existing Scanner, Explore, and Product Details flows continue to work.`,
  },
  {
    key: "UpdateReport.md",
    label: "Update report",
    role: "Delivery report",
    description:
      "Summarizes the submitted update, changed screens, screenshots, and QA checks.",
    content: `# Update Report

## Summary

This update adds one new page to YUKA: Product History. History gives users a top-level place to revisit products they recently opened.

## Screenshot Evidence

![Product History](assets/screens/v1.1/history.png)

## Changed Screens

- Product History was added as the only new v1.1 page.
- The bottom app navigation now includes Scanner, Explore, and History.
- History rows show image, name, brand, score, score label, viewed time, and chevron.

## QA Checklist

- History screen matches submitted screenshot.
- Products opened from scan, search, Explore, or Alternatives appear in History.
- Selecting a History row opens Product Details.
- Existing Scanner, Explore, and detail navigation remain usable.`,
  },
];

export function getClientMockMarkdownEditorData() {
  return {
    assets: clientAssets,
    sourceDocs: clientSourceDocs,
  };
}
