---
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

After onboarding, the app has two top-level app-bar sections:

- Scanner
- Explore

Users can open Product Details from successful scans, search results, Explore product cards, and alternative product cards. There is no section where users can revisit products they already viewed.

## Why This Change Matters

Users often want to revisit products they scanned, searched for, or opened from Explore. A history section makes it easier to compare recently viewed products without scanning or searching again.

## Desired Behavior

After the change exists, the app should have a new History tab next to Scanner and Explore.

History should show all recently viewed products in chronological order, with the most recent product first.

A product should appear in History after the user opens its Product Details from:

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

![Product History](assets/screens/explore-screen.png)

This screen shows recently viewed products in chronological order. The visual should follow the same clean white iOS style as Explore and Product Details. Product rows or cards should show product image, name, brand, score, and last viewed time/date.

## Data & Content

History stores or derives a list of recently viewed products.

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
- Existing Scanner and Explore behavior continues to work.

## Non-Goals

- Favorites or saved products.
- User accounts.
- Cloud-synced history.
- Manual product notes.
- Purchase history or grocery list behavior.

## Assets

No new custom assets required.
