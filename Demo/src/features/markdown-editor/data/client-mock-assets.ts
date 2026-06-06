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
    name: "explore.png",
    path: "assets/screens/app-preview/explore.png",
    kind: "image",
    description: "Submitted update screenshot for the Explore screen.",
  },
  {
    name: "explore-filter-open.png",
    path: "assets/screens/app-preview/explore-filter-open.png",
    kind: "image",
    description: "Submitted update screenshot for the open Explore filter.",
  },
  {
    name: "detail-expanded-sections.png",
    path: "assets/screens/app-preview/detail-expanded-sections.png",
    kind: "image",
    description: "Submitted update screenshot for expanded detail sections.",
  },
  {
    name: "detail-footer-alternative-cards.png",
    path: "assets/screens/app-preview/detail-footer-alternative-cards.png",
    kind: "image",
    description: "Submitted update screenshot for alternative product cards.",
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

Product Details is a shared detail destination opened from scan results, search results, Explore cards, and alternative cards.

## Acceptance Criteria

- Scanner and search open Product Details for matched products.
- Explore shows healthy products by category and market where available.
- Product Details explains score drivers and presents healthier alternatives.
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

Add guided Explore improvements for YUKA.

## Desired Behavior

- Make Explore filtering clearer and easier to inspect.
- Expand Product Details evidence sections.
- Add alternative recommendation cards to the Product Details footer.
- Preserve onboarding, search, and baseline Product Details behavior.

## Affected App Areas

- Explore
- Product Details
- Recommendation cards
- QA evidence screenshots

## Acceptance Criteria

- Explore filter state can be opened and reviewed.
- Expanded detail sections are visible.
- Alternative product cards appear in Product Details.
- Existing Scanner, Search, and onboarding flows continue to work.`,
  },
  {
    key: "UpdateReport.md",
    label: "Update report",
    role: "Delivery report",
    description:
      "Summarizes the submitted update, changed screens, screenshots, and QA checks.",
    content: `# Update Report

## Summary

This update adds a richer Explore workflow for YUKA while preserving the existing onboarding, search, and product detail baseline from version 1.0.

## Screenshot Evidence

![Explore](assets/screens/app-preview/explore.png)
![Explore Filter Open](assets/screens/app-preview/explore-filter-open.png)
![Product Details Expanded](assets/screens/app-preview/detail-expanded-sections.png)
![Alternative Cards](assets/screens/app-preview/detail-footer-alternative-cards.png)

## Changed Screens

- Explore now has clearer guided browsing and filtering.
- Product Details now shows expanded evidence sections.
- Product Details now includes alternative recommendation cards.

## QA Checklist

- Explore screen matches submitted screenshot.
- Explore filter state can be opened and reviewed.
- Expanded product detail sections are visible.
- Alternative cards appear in the product detail footer.
- Onboarding, search, and baseline detail navigation remain usable.`,
  },
];

export function getClientMockMarkdownEditorData() {
  return {
    assets: clientAssets,
    sourceDocs: clientSourceDocs,
  };
}
