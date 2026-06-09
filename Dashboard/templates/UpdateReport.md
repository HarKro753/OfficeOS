---
version: alpha
type: mobile-app-update-report
app:
  name: YUKA
request:
  id: request-yuka-history-update
  title: Add product history tab
  targetVersion: "1.1"
  status: live
  createdAt: "2026-06-06T09:20:00.000Z"
  approvedAt: "2026-06-06T09:24:00.000Z"
release:
  appStoreUrl: https://appstoreconnect.apple.com/apps/officeos-yuka
  posthogUrl: https://app.posthog.com/project/officeos-yuka
---

# Update Report - v1.1

## Summary

Version 1.1 adds one new page to YUKA: Product History. The page gives users a top-level place to revisit products they recently opened from Scanner, Search, Explore, or Alternatives.

## Screenshot

### Screen: Product History

![Product History](assets/screens/v1.1/history.png)

History changed from not existing in v1.0 to being a top-level app section in v1.1. The page shows recently viewed products as chronological rows with product image, name, brand, score, score label, viewed time, and a chevron to reopen Product Details.

## Changed Page

- Product History was added as the only new v1.1 page.
- The bottom app navigation now includes Scanner, Explore, and History.
- History is selected in the submitted screenshot and shows the latest viewed products first.

## Preserved Behavior

- Scanner remains available.
- Explore remains available.
- Product Details remains the shared destination for products opened from every entry point.

## Acceptance

- Products opened from scan, search, Explore, or Alternatives appear in History.
- Reopened products move to the top instead of duplicating.
- Selecting a History row opens Product Details.
- Back from Product Details returns to History when History was the source.

## Release Links

- App Store: https://appstoreconnect.apple.com/apps/officeos-yuka
- PostHog: https://app.posthog.com/project/officeos-yuka

## Known Limitations

This is a mocked update report. No real App Store release, PostHog event stream, or backend history sync is connected.
