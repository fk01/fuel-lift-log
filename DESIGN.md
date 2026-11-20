---
name: WeightGram
description: A dark, glowing training console that tells a beginner what to do today.
colors:
  console-navy: "#141a24"
  panel-slate: "#1c2431"
  panel-slate-raised: "#232d3c"
  input-well: "#121821"
  signal-cyan: "#2ee6ff"
  go-green: "#3dff8c"
  cyan-wash: "#1d3342"
  on-signal: "#06121a"
  ice-text: "#e8f1f7"
  steel-muted: "#a9bccf"
  rail-line: "#33475f"
  divider: "#2e3b4e"
  amber-warn: "#ffb15c"
  coral-danger: "#ff8a7a"
typography:
  headline:
    fontFamily: "IBM Plex Sans Thai, system-ui, sans-serif"
    fontSize: "2rem"
    fontWeight: 800
    lineHeight: 1.15
    letterSpacing: "-0.01em"
  title:
    fontFamily: "IBM Plex Sans Thai, system-ui, sans-serif"
    fontSize: "1.12rem"
    fontWeight: 800
  body:
    fontFamily: "IBM Plex Sans Thai, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "system-ui, -apple-system, IBM Plex Sans Thai, sans-serif"
    fontSize: "0.8rem"
    fontWeight: 600
  numeral:
    fontFamily: "Share Tech Mono, IBM Plex Mono, ui-monospace, monospace"
    fontSize: "1.6rem"
    fontWeight: 400
    fontFeature: "tnum"
rounded:
  track: "2px"
  input: "6px"
  control: "12px"
  dashed: "14px"
  card: "18px"
  pill: "999px"
spacing:
  xs: "6px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  section: "18px"
components:
  button-primary:
    backgroundColor: "{colors.signal-cyan}"
    textColor: "{colors.on-signal}"
    rounded: "{rounded.pill}"
    height: "40px"
    padding: "0 14px"
  button-secondary:
    backgroundColor: "{colors.panel-slate-raised}"
    textColor: "{colors.ice-text}"
    rounded: "{rounded.control}"
    height: "40px"
    padding: "0 14px"
  button-text:
    textColor: "{colors.steel-muted}"
    height: "36px"
  button-icon:
    backgroundColor: "{colors.panel-slate-raised}"
    textColor: "{colors.ice-text}"
    rounded: "{rounded.control}"
    width: "44px"
    height: "40px"
  card:
    backgroundColor: "{colors.panel-slate}"
    textColor: "{colors.ice-text}"
    rounded: "{rounded.card}"
    padding: "16px"
  input-set:
    backgroundColor: "{colors.input-well}"
    textColor: "{colors.ice-text}"
    rounded: "{rounded.input}"
    padding: "7px 6px"
  pill-status:
    backgroundColor: "{colors.cyan-wash}"
    textColor: "{colors.go-green}"
    rounded: "{rounded.pill}"
    padding: "2px 9px"
---

# Design System: WeightGram

## Overview

**Creative North Star: "The Training Console"**

WeightGram looks like a control panel at night. The background is deep blue-grey, every panel is a heavy outlined card, and a cyan-to-green signal tells you where to act next. The console is not there for decoration. It reads the user's day and lights up the one thing to do now: the next meal, today's program, the set in progress. A beginner should never have to work out what is important, because the glow already shows it.

Density is set for one hand in the gym. The content sits in one narrow column (max 560px). Cards are large, and controls are thick and easy to press with confidence. The UI chrome uses a plain sans-serif font. Numbers use a mono instrument face (Share Tech Mono) and glow cyan like a readout. There is one dark look, chosen on purpose, and no light theme.

The cream-and-serif look that came first (`#0e0e0d`, Noto Serif Thai, uppercase mono labels) has been retired. It still sits at the top of `app.css` and is fully overridden by the neon layer. Do not bring it back.

**Key Characteristics:**
- Deep navy console with a faint 32px grid and two soft corner glows of cyan and green
- Heavy outlined cards (1.5px cyan edge, 18px corners) that light up when they are the current item
- A single cyan→green gradient that means "go"
- Glowing mono numerals for kcal, protein, clocks, volume and %
- Line icons instead of emoji; pill badges for status

## Colors

A cold, high-contrast night palette. One signal gradient does all the emphasis, and the neutrals stay out of its way.

### Primary
- **Signal Cyan** (`signal-cyan`): The console's voice. It starts the gradient and is used for focus rings, active tab text, glowing numerals, chart series, and the edges of cards (as `#2ee6ff47`, or `#2ee6ff8c` when highlighted).

### Secondary
- **Go Green** (`go-green`): Done, gains and readiness. It ends the gradient and is used for ticked checkboxes, the "done" card edge, up-arrows, and the text of status pills.

### Neutral
- **Console Navy** (`console-navy`): The page background, also used as the translucent tab-bar fill (`#141a24ee`).
- **Panel Slate / Raised** (`panel-slate`, `panel-slate-raised`): Card bodies. Cards use a vertical gradient from `#1f2938` to `#19212d`.
- **Input Well** (`input-well`): Recessed number fields in set rows.
- **Ice Text** (`ice-text`): Primary text.
- **Steel Muted** (`steel-muted`): Secondary text. Never go dimmer than this, because it has to keep ≥4.5:1 contrast on navy.
- **Rail Line / Divider** (`rail-line`, `divider`): Borders, dashed add-buttons, and dividers between menu rows.
- **Amber Warn** (`amber-warn`): Overdue meals and warnings.
- **Coral Danger** (`coral-danger`): Destructive buttons, shown as text on a 14% coral wash.

### Named Rules
**The One Signal Rule.** The cyan→green gradient (`linear-gradient(90deg, #2ee6ff, #3dff8c)`) belongs only to the single primary action, the selected tab/chip, and progress fills. If two things on one screen carry the gradient, one of them is wrong.

**The No Purple Rule.** Neglected or "due" states read as neutral or ready, never as alarming purple or red. Red-ish coral is only for destructive actions.

## Typography

**UI Font:** IBM Plex Sans Thai (system-ui fallback). Chrome (buttons, chips, labels) uses the system stack first.
**Numeral Font:** Share Tech Mono (IBM Plex Mono fallback)

**Character:** A sturdy Thai-first sans in heavy weights for headings, with a technical mono reserved for numbers. Headings feel bold and sure of themselves. Numbers feel like instrument readouts.

### Hierarchy
- **Headline** (800, 2rem, 1.15): Page titles. Plain text with a thin glowing gradient underline.
- **Title** (800, 1.12rem): Section titles and sheet headers.
- **Body** (400, 15px, 1.5): Meal items, exercise notes, descriptions.
- **Label** (600, 0.8rem, sentence case, steel-muted): Group headers and field labels. Not uppercase, no letter-spacing.
- **Numeral** (Share Tech Mono, tabular, cyan with `text-shadow: 0 0 10px #2ee6ff66`): kcal/protein totals, the workout clock, recovery %, volume.

### Named Rules
**The Mono Is For Numbers Rule.** Share Tech Mono appears only on figures (kg, reps, sets, times, %). Words never use it.

**The No Shouting Rule.** No all-caps, letter-spaced labels or buttons. Sentence case everywhere. Exercise names stay in English.

## Layout

There is one column, max 560px, with side padding of max(16px, safe-area) and an 18px gap between sections. The page itself never scrolls: `.wrap` is the scroll area sized from `--app-h`, above a floating tab bar inset from the edges, so iOS fixed bars stay put. Sticky bars (workout summary at the top, finish/cancel at the bottom, undo, rest) stack above the tab bar, and toasts clear all of them. Full-screen modals and sheets keep their title and Close button pinned, clear of the Dynamic Island. During a workout, focus mode shows only the current session.

**The Today First Rule.** What needs doing today always gets the first viewport. History and stats are reached by going deeper, never by scrolling past today.

## Elevation & Depth

Depth comes from light, not from material. Cards sit on the console with a stacked shadow: an inner top highlight, a dark hairline, a soft drop, and a faint cyan halo. The current item is "lit": a brighter cyan edge and a larger halo. Glow is used only to signal state. It is never decoration.

### Shadow Vocabulary
- **Card rest** (`inset 0 1px 0 #ffffff0d, 0 0 0 1px #00000040, 0 6px 18px #0006, 0 0 16px #2ee6ff14`): every card, menu, and sheet.
- **Card lit** (`inset 0 1px 0 #ffffff12, 0 0 0 1px #2ee6ff55, 0 0 22px #2ee6ff33`): next meal, current program, selected place.
- **Signal glow** (`0 0 0 1px #2ee6ff55, 0 0 14px #2ee6ff40`): focused inputs, the Today card.
- **Primary halo** (`0 0 0 1px #3dff8c55, 0 0 18px #2ee6ff40`): the primary button.
- **Tab bar float** (`0 0 18px #2ee6ff22, 0 8px 24px #0008`).

### Named Rules
**The Lit Means Now Rule.** Only the item the user should act on next gets the lit edge. Done items get a green edge (`#3dff8c66`) and step back.

## Shapes

Corners are generous and consistent. Cards and sheets use 18px. Controls and icon tiles use 12px. Dashed "add" outlines use 14px. Set inputs use 6px. Pills, chips, and the primary button are fully round. Borders are heavy (1.5px) on cards, secondary buttons, inputs, and the tab bar. Placeholder "add" actions use a dashed rail-line border instead of a fill.

## Components

### Buttons
Thick, clear, and pressed with confidence. The app uses one system everywhere:
- **Primary:** a gradient pill with dark text (`on-signal`), weight 700–800, the primary halo, and a minimum height of 40px (48px in sheets). Use one per screen.
- **Secondary:** a 12px rounded box with a soft white fill (`#ffffff0d`), a 1.5px cyan edge, and weight 600. On press, the fill deepens to `#ffffff1a`.
- **Icon:** a 44×40 box (the ••• menu, gear, close). The hit area is always at least 44pt.
- **Text:** plain steel-muted text, at least 36px tall.
- **Warn:** coral text on a coral wash.

### Chips / Tabs
These are round pills with a rail-line outline. When selected, they fill with the gradient and dark text and get a `0 0 12px #2ee6ff44` glow.

### Cards / Containers
Cards are 18px with the vertical slate gradient, a 1.5px cyan edge (`#2ee6ff47`), card-rest shadow, and about 16px padding. Program and library items are horizontal row cards: icon tile, name and meta, then a fixed last column so ▶ Start and the pills line up.

### Inputs / Fields
The inputs are recessed wells (`input-well`) with a 1.5px border and centred mono digits. On focus, the border turns cyan and gets the signal glow, with no outline. Number entry goes through a custom number pad and never the system keyboard. Checkboxes use go-green.

### Navigation
The tab bar floats at the bottom: translucent navy, a 1.5px cyan edge, and the float shadow. It shows line icons with small labels. The active tab is cyan with a text glow and a short gradient underline that glows. The bar slides away while you scroll and comes back when you stop.

### Progress Track
A 4px track with 2px corners on rail-line, filled with the gradient. Used for kcal/protein and XP.

### Status Pill
A small round badge: green text on a green wash (`#3dff8c22`) with a `#3dff8c55` border, at 0.68rem, weight 600.

## Do's and Don'ts

### Do:
- **Do** give the single next action the lit edge and the gradient button, and keep everything else calm.
- **Do** set every figure in Share Tech Mono, with tabular numbers, in cyan.
- **Do** keep tap targets at 44pt or larger, and make primary buttons 48px tall inside sheets.
- **Do** use line icons in the same stroke style, not emoji.
- **Do** bump the `?v=` asset query in `index.html` after any CSS change.

### Don't:
- **Don't** bring back the retired cream/serif look (Noto Serif Thai headings, uppercase letter-spaced mono labels, `#0e0e0d` background).
- **Don't** put the gradient on more than one action per screen.
- **Don't** use purple, and don't use red for anything that isn't destructive.
- **Don't** let muted text drop below `steel-muted` contrast.
- **Don't** add a light theme. The single dark look is deliberate.
