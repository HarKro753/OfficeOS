---
version: alpha
type: mobile-app-change-request
app:
  name:
request:
  title:
  requestedBy:
  date:
  priority:
  changeType:
---

# Change Request

## Request

Describe the requested change in plain language.

## Current Behavior

Describe how the app works today before this change.

## Why This Change Matters

Describe why this request matters in plain language.

## Desired Behavior

Describe what should happen after the change exists in plain language.

## Affected App Areas

List the existing parts of the app that may need to change.

## App Navigation Impact

Describe whether this change affects app hierarchy or movement between sections.

Include only what is relevant:

- New top-level section
- New nested section
- New shared detail screen
- New entry point from an existing screen
- Changed back behavior
- No navigation change

## New or Changed Screens

Every new or meaningfully changed screen should include an inline screenshot, mockup, wireframe, sketch, or reference image.

For each screen:

- Screen name
- Inline screenshot / mockup / asset
- Description

Example:

### Screen: Product History

![Product History](assets/screens/product-history.png)

This screen lists recently scanned or opened products. Each row shows product image, product name, brand, score, and the date it was last opened.

## Data & Content

Describe any new or changed data, copy, labels, or content rules.

Examples:

- New data shown to the user
- New data stored by the app
- New empty states
- New labels or button text
- New sorting or filtering rules

## Acceptance Criteria

Describe how OfficeOS and the user can tell the change is complete.

Use clear checklist items or Given/When/Then.

Examples:

- Given [starting state], when [user action], then [expected result].
- The new screen shows [required content].
- The updated section includes [required behavior].
- The change does not affect [important existing behavior].

## Non-Goals

List anything that should not be included in this change.

## Assets

List any new assets required for this change and reference them inline where relevant.

Examples:

- Screenshots / mockups
- Icons
- Illustrations
- Photos
- Videos
- Audio files
- Fonts
- Brand assets
