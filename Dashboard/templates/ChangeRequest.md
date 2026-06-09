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

- `assets/screens/v1.1/history.png`
