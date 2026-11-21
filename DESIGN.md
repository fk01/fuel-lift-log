---
name: WeightGram
description: Weightgramming — body, eat, train, today. A dark night-gym console for people who lift on their own.
colors:
  night-navy: "#141a24"
  console-panel: "#1c2431"
  console-panel-raised: "#232d3c"
  card-top: "#1f2938"
  card-bottom: "#19212d"
  chalk: "#e8f1f7"
  steel-muted: "#a9bccf"
  rail: "#33475f"
  signal-cyan: "#2ee6ff"
  go-green: "#3dff8c"
  on-signal: "#06121a"
  amber-warn: "#ffb15c"
  alarm-red: "#ff5d73"
typography:
  display:
    fontFamily: "IBM Plex Sans Thai, system-ui, sans-serif"
    fontSize: "2rem"
    fontWeight: 700
    lineHeight: 1.15
    letterSpacing: "-0.01em"
  headline:
    fontFamily: "IBM Plex Sans Thai, system-ui, sans-serif"
    fontSize: "1.12rem"
    fontWeight: 700
    lineHeight: 1.3
  title:
    fontFamily: "IBM Plex Sans Thai, system-ui, sans-serif"
    fontSize: "1.05rem"
    fontWeight: 700
    lineHeight: 1.3
  body:
    fontFamily: "IBM Plex Sans Thai, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "IBM Plex Sans Thai, system-ui, sans-serif"
    fontSize: "12px"
    fontWeight: 600
    lineHeight: 1.2
  numeric:
    fontFamily: "Share Tech Mono, IBM Plex Mono, ui-monospace, monospace"
    fontSize: "1rem"
    fontWeight: 400
    fontFeature: "tnum"
rounded:
  xs: "4px"
  sm: "10px"
  md: "12px"
  lg: "18px"
  pill: "999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
components:
  button-primary:
    backgroundColor: "{colors.signal-cyan}"
    textColor: "{colors.on-signal}"
    rounded: "{rounded.pill}"
    padding: "12px 18px"
    height: "48px"
  button-secondary:
    backgroundColor: "{colors.console-panel}"
    textColor: "{colors.chalk}"
    rounded: "{rounded.md}"
    padding: "10px 14px"
    height: "44px"
  chip:
    backgroundColor: "{colors.night-navy}"
    textColor: "{colors.chalk}"
    rounded: "{rounded.pill}"
    padding: "6px 14px"
    height: "40px"
  chip-selected:
    backgroundColor: "{colors.night-navy}"
    textColor: "{colors.go-green}"
    rounded: "{rounded.pill}"
  card:
    backgroundColor: "{colors.card-top}"
    textColor: "{colors.chalk}"
    rounded: "{rounded.lg}"
    padding: "14px"
  input:
    backgroundColor: "{colors.night-navy}"
    textColor: "{colors.chalk}"
    rounded: "{rounded.sm}"
    padding: "10px"
    height: "44px"
  tab-bar:
    backgroundColor: "{colors.console-panel}"
    textColor: "{colors.steel-muted}"
    rounded: "{rounded.pill}"
    height: "60px"
---

# Design System: WeightGram

## Overview

**Creative North Star: "The Night Gym Console"**

WeightGram is the control panel of a gym after dark: a deep navy room, chalk-white type, and instruments that light up only when they have something to say. The person holding it is mid-workout or half-awake in the morning, phone in one hand. Everything is built so the three morning answers — body, eat, train — and the next set can be read in a glance and acted on with a thumb.

Density is medium: cards stack in one column, numbers are large and tabular, labels are short. Personality comes from the signal colors (cyan for "this is live", green for "done / go") and from the WG barbell mark, not from decoration. Controls feel heavy and certain, like gym equipment: big pill buttons, firm borders, nothing flimsy.

Glow is a signal, not a finish. A card glows because it is in progress, selected or the next thing to do; at rest it is a dark panel with a quiet edge.

**Key Characteristics:**
- Dark night-navy room, chalk-white text, one cyan→green signal gradient
- Tabular monospace numerals for every count, weight and time
- Heavy, rounded, thumb-sized controls (44 px targets, 48 px primary actions)
- Neon edge only on live / selected / next items
- Thai-first copy in IBM Plex Sans Thai; English uses the same face

## Colors

A near-black navy console lit by two signal colors that always travel together as one gradient.

### Primary
- **Signal Cyan** (#2ee6ff): live state — in-progress rows, focus, links, the start of the action gradient.
- **Go Green** (#3dff8c): done / reached / ready — completed rows, goal hit, the end of the action gradient.

### Neutral
- **Night Navy** (#141a24): app background and input wells.
- **Console Panel** (#1c2431) and **Console Panel Raised** (#232d3c): sheets, menus, raised rows.
- **Card Gradient** (#1f2938 → #19212d): every card surface, top-lit.
- **Chalk** (#e8f1f7): primary text.
- **Steel Muted** (#a9bccf): secondary text, captions (≥4.5:1 on Night Navy).
- **Rail** (#33475f): dividers and resting borders.
- **On Signal** (#06121a): text on the cyan→green gradient.

### Status
- **Amber Warn** (#ffb15c): recovering muscles, unsaved state, overdue meal.
- **Alarm Red** (#ff5d73): just-trained muscles, below goal, destructive actions.

### Named Rules
**The Signal Pair Rule.** Cyan and green appear together as the action gradient (`linear-gradient(90deg, #2ee6ff, #3dff8c)`) on the one primary action per screen; alone, cyan means live and green means done. No other accent hues.

**The Recovery Palette Rule.** The muscle map uses its own user-selectable palette (`REC_PALS`); never reuse those colors for UI chrome.

## Typography

**Body / UI Font:** IBM Plex Sans Thai (system-ui fallback)
**Numeric Font:** Share Tech Mono (IBM Plex Mono fallback), tabular

**Character:** One humanist sans carries Thai and English at every size; a narrow technical mono carries the numbers so weights, sets and times line up like a console readout.

### Hierarchy
- **Display** (700, 2rem, 1.15): screen titles — วันนี้, กิน, ออกกำลัง.
- **Headline** (700, 1.12rem): section heads — "วันนี้จะทำอะไร?", "คอมเมนต์".
- **Title** (700, 1.05rem): card and row titles — program and plan names.
- **Body** (400, 15px, 1.5): descriptions, comments, meal items.
- **Label** (600, 12px): tab labels, chips, captions. 12 px is the floor for any functional text.
- **Numeric** (mono, tabular): kcal, kg, sets, timers, counts.

### Size ramp (CSS tokens `--t-*`)
label 12 · meta 13 · sm 14 · body 15 · md 16 · title 17 · head 18 · lg 20 · xl 24 · display 32 · hero 40 (px). Every font-size uses one of these; inputs keep `max(16px,1em)`.

### Named Rules
**The 12 px Floor Rule.** No functional text below 12 px; inputs never below 16 px (iOS zoom).

**The No-Shouting Rule.** Labels are sentence case in the UI face; no forced uppercase or letter-spaced mono labels.

## Layout

Single column, phone-first, 16 px side gutters, cards separated by 10–14 px. A floating pill tab bar (60 px) sits above the home indicator; sheets rise from the bottom with a sticky Cancel / primary action bar. Focus mode (an active workout) hides everything but the session and a top bar with "‹ วันนี้". Spacing steps: 4 / 8 / 12 / 16 / 24.

## Elevation & Depth

Depth is tonal first: Night Navy room → top-lit card gradient → raised panel for sheets. Every card has a soft neutral drop (`0 6px 18px #0006`) and a 1 px inset highlight. Neon glow is reserved for state.

### Shadow Vocabulary
- **Card rest** (`inset 0 1px 0 #ffffff0d, 0 6px 18px #0006`): every card at rest.
- **Signal live** (`0 0 0 1px #2ee6ff55, 0 0 22px #2ee6ff33`): in-progress, selected, next-up items.
- **Action glow** (`0 0 0 1px #3dff8c55, 0 0 18px #2ee6ff40`): the primary gradient button.

### Named Rules
**The Glow Means Live Rule.** A card glows only when it is in progress, selected or next. Resting cards carry the Rail edge and the neutral drop, no colored halo.

## Shapes

Generous, equipment-like rounding: cards 18 px, buttons and inputs 10–12 px, chips, primary actions and the tab bar fully pill-shaped. Borders are 1.5 px. Icons are line SVGs at a single stroke weight (1.8–2 px) inside 12 px-rounded tiles.

## Components

### Buttons
- **Shape:** pill (999px) for primary, 12px for secondary.
- **Primary:** cyan→green gradient, On Signal text, 700 weight, 48 px tall, Action glow. One per screen.
- **Secondary:** Console Panel fill, 1.5 px signal-tinted edge, Chalk text, 44 px.
- **Text links:** Signal Cyan, 44 px tap height even when the text is small.
- **Focus:** 2 px Signal Cyan outline, 2 px offset.

### Chips
- **Style:** pill, Night Navy fill, Rail border, 40 px (36 px inside dense rows).
- **Selected:** Go Green border and text; filters and segmented tabs use the gradient fill for the active segment.

### Cards / Containers
- **Corner Style:** 18 px.
- **Background:** Card Gradient.
- **Border:** 1.5 px edge; brighter cyan edge + Signal live glow when active; green edge when done.
- **Internal Padding:** 12–16 px.

### Inputs / Fields
- **Style:** Night Navy well, Rail border, 10 px radius, ≥16 px text, 44 px tall.
- **Focus:** Signal Cyan border with the live glow.

### Navigation
- Floating pill tab bar, six tabs (Today · Eat · Train · Stats · Explore · More), line icons over 12 px labels; active tab Signal Cyan with an underline.

### Signature: Plan Row
Status pill (Pending / In progress / Done) + title + subtitle with a place chip + ▶ Start pill. In progress = Signal live; done = green edge and check.

### Signature: Three Questions Card
Today's cards: question line with a line icon, a large 700-weight answer, a muted detail line, and a cyan link to its tab.

## Do's and Don'ts

### Do:
- **Do** keep one gradient primary action per screen.
- **Do** use the mono numeric face for every number a person compares (kg, sets, kcal, time).
- **Do** give every tappable thing 44 px of height.
- **Do** let state carry the glow: live = cyan, done = green, warn = amber, alarm = red.
- **Do** write Thai first and keep English the same length or shorter.

### Don't:
- **Don't** put colored glow on resting cards (Glow Means Live).
- **Don't** introduce new accent hues beyond cyan, green, amber and red.
- **Don't** use emoji as icons; use the line icon set.
- **Don't** set functional text under 12 px or inputs under 16 px.
- **Don't** use forced-uppercase letter-spaced labels.
