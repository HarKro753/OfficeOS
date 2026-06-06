---
version: alpha
name: YUKA Design System
description: Simple white iOS-native health food app visual system with clean typography, soft floating controls, and nutrition score colors.
colors:
  primary: "#0A84FF"
  background: "#FFFFFF"
  surface: "#FFFFFF"
  surfaceMuted: "#F4F4F5"
  text: "#000000"
  muted: "#8E8E93"
  separator: "#E5E5EA"
  scoreExcellent: "#34C759"
  scoreMedium: "#FF8A24"
  scorePoor: "#FF3B30"
  overlay: "rgba(255, 255, 255, 0.82)"
typography:
  heading:
    fontFamily: SF Pro Display
    fontSize: 40
    fontWeight: 700
    lineHeight: 48
  title:
    fontFamily: SF Pro Display
    fontSize: 22
    fontWeight: 700
    lineHeight: 28
  body:
    fontFamily: SF Pro Text
    fontSize: 17
    fontWeight: 400
    lineHeight: 24
  label:
    fontFamily: SF Pro Text
    fontSize: 15
    fontWeight: 500
    lineHeight: 20
rounded:
  sm: 8
  md: 14
  lg: 22
  pill: 999
spacing:
  sm: 8
  md: 16
  lg: 24
  xl: 32
components:
  primaryButton:
    backgroundColor: "#0A84FF"
    textColor: "#FFFFFF"
    rounded: 12
    height: 56
  floatingButton:
    backgroundColor: "#FFFFFF"
    textColor: "#000000"
    rounded: 999
    shadow: soft
  productCard:
    imageRadius: 4
    scoreDotSize: 10
    titleLines: 2
---

# YUKA Design System

## Overview

The app should feel like a clean native iOS health utility: white background, generous spacing, strong black typography, soft gray secondary text, and minimal decoration. Interactions should use familiar Apple-native patterns such as large titles, floating circular buttons, soft bottom controls, native keyboard/search behavior, and simple list rows.

The design should avoid a heavy branded look. Nutrition score colors are the main visual accent.

## Colors

Use white as the dominant background and surface color. Use black for primary text and muted iOS gray for secondary text, labels, dividers, placeholder text, and inactive icons.

Use blue only for primary actions such as Continue, search action, and important links.

Use score colors consistently:

- Green: excellent, very good, positive, high score
- Orange: medium, moderate, caution
- Red: poor, bad, high-risk nutrient, low score

## Typography

Use Apple system fonts.

Large page titles should be bold and prominent, as shown on the Explore screen. Product names and section headings should be bold. Brands, score labels, helper text, and secondary values should use muted gray.

Keep text direct and uncluttered. Avoid long explanatory paragraphs inside the main product UI.

## Layout

Use a white canvas with generous horizontal padding. Preserve iPhone safe areas and Dynamic Island spacing.

Screens should use simple vertical hierarchy:

- top navigation or title area
- main content
- floating scanner/search controls where relevant

Explore uses horizontal product rows within vertical categories. Product Details uses a scrollable nutrition list with clear Positive and Negative sections. Onboarding uses centered vertical progression with a sticky bottom primary button.

## Elevation & Depth

Use subtle depth only for floating controls, filter panels, and bottom controls. Shadows should be soft, broad, and low contrast.

Floating panels may use a translucent white or lightly blurred background, but the app should still feel mostly flat and clean.

## Shapes

Use rounded iOS-style shapes:

- Primary onboarding button: rounded rectangle
- Onboarding choice rows: rounded rectangle
- Floating buttons: circular or pill-shaped
- Search/scanner bottom control: large pill
- Filter panel: rounded floating sheet

Avoid sharp decorative containers and heavy card chrome.

## Components

### Onboarding Choice Rows

Choice rows should be full-width rounded rectangles with light gray fill or border, black text, and clear selected state if needed.

### Primary Button

Primary buttons should be blue, full-width where used in onboarding, with white centered text and a rounded rectangle shape.

### Product Cards

Product cards should show product image, product name, brand, colored score dot, and numeric score. Keep image corners lightly rounded. Product names can truncate after two lines.

### Search

Search should use a native-feeling bottom search input when active, with clear and close controls. Search result rows should be simple, separated by thin dividers, and use muted gray icons.

### Floating Scanner/Search Controls

The floating bottom control should expose scanner and search actions without using a heavy tab bar. Keep it pill-shaped or circular with soft shadow and high contrast icons.

### Filter Menu

The explore filter menu should appear as a floating rounded panel with icon-text rows. It should preserve the visible content context behind it.

### Product Detail Nutrient Rows

Nutrient rows should show:

- muted icon
- nutrient name
- qualitative label
- value per 100g
- colored status dot
- optional chevron for expandable rows

### Expanded Nutrient Bars

Expanded nutrient rows should use horizontal threshold bars with green, orange, and red segments. A small marker should show the product's value.

### Alternative Cards

Alternative rows should show product image, product name, brand/source, score dot, score number, and score label. Alternatives should feel like useful substitutes, not generic recommendations.

## Do's and Don'ts

Do preserve:

- white background
- large Apple-style typography
- soft floating controls
- simple list rows
- product imagery as the main visual content
- consistent score colors

Do not introduce:

- dark mode as the default style
- dense dashboards
- heavy gradients
- decorative cards around every section
- complex navigation chrome
- custom visual language that conflicts with native iOS behavior
