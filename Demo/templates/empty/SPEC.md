---
version: alpha
type: mobile-app-spec
app:
  name:
  category:
  platforms:
    - iOS
  description:
  keywords:
    -
audience:
  primary:
  secondary:
  notFor:
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
scope:
  fromScratchMobileApp: true
  thirdPartyAuthenticatedSystems: unsupported unless explicitly approved
  liveLegacyIntegrations: unsupported unless explicitly approved
  missingScreensOrSections: not allowed
---

# App Spec

## Overview

- Problem
- Proposed solution
- Who it is for
- Expected outcome

## Goals

### User Goals

### Business / Operational Goals

## Scope

### In Scope

### Out of Scope

## App Navigation

Describe how the app sections relate to each other so the hierarchy is unambiguous.

Required:

- Top-level app sections
- Secondary sections
- Shared detail screens, if any
- Which sections are peers
- Which screens are nested inside another section
- Where users land after onboarding
- How users move between major sections
- Where back actions return

## Sections & Screens

Every app section must be described. Every screen or subscreen inside that section must be included inline with its screenshot, mockup, or attached visual asset. The screen description belongs directly next to that visual.

### Section: Preferences

This section lets users configure personal app behavior.

#### Screen: Preferences Index

![Preferences Index](assets/screens/preferences-index.png)

This is the main preferences screen. It links to streak settings, notes, likes, app icon, and other personalization areas.

#### Screen: App Icon

![App Icon](assets/screens/preferences-app-icon.png)

This screen lets users choose a custom app icon.

## User Stories / Use Cases

Use the simple `feature-prd.md` format:
“As a [role], I want to [action], so that [benefit].”

## Functional Requirements

Split by priority:

- P0: Core Requirements
- P1: Supporting Requirements
- P2: Future Requirements

## Design System

The visual design system belongs in `DESIGN.md`.

`DESIGN.md` should describe the global visual rules OfficeOS should follow across the app:

- colors
- typography
- spacing
- shape / corner radius
- component style
- icon style
- light mode / dark mode requirements
- design do's and don'ts

If a design-system asset is needed, reference it directly inside `DESIGN.md`.

## Custom Assets

All custom assets required by the app must be submitted and referenced directly inside `SPEC.md` or `DESIGN.md`.

Assets are not managed through a separate manifest. The Markdown files are the source of truth.

Required:

- App logo
- App icon

Required if applicable:

- Splash screen
- Illustrations
- Photos
- Videos
- Audio files
- Fonts
- Brand assets
- Other custom visual assets

## Non-Functional Requirements

Keep business-readable:

- privacy / GDPR expectations
- access control
- reliability
- accessibility
- performance expectations
- offline behavior
- maintenance expectations

## Acceptance Criteria

Clear checklist or Given/When/Then.

Acceptance criteria should cover:

- Core requirements
- Required sections
- Required screens and subscreens
- Submitted assets
- `DESIGN.md`
- Metadata needed for app setup and release

## Risks & Assumptions
