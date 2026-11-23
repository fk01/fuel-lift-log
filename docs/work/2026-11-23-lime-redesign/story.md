# Lime redesign — story per screen (no code yet)

Reference: dark green-black, lime→green gradient accents, big two-tone headline (white + lime italic), photo-led cards, pill chips, one floating action, rounded 28px cards.

## Design tokens (all screens)
- Background: near-black with soft green glow at top (#0b0f0c → #0f1a12)
- Accent: lime #b8f34a → green #3ddc84 gradient (replaces cyan→green)
- Headline: white sans + lime italic word ("Build *Better Habits*")
- Cards: #151a16, radius 28, no borders; photo cards with dark gradient overlay
- Chips: pill, outline lime when selected
- Tab bar: 4 tabs + raised round lime button in the middle (Start / Log)

## 0. Login (first screen)
Full-screen dark gym photo, headline "Start Your Fitness *Journey Today*", one line copy, **Swipe to Start** pill (lime) → Google sign-in sheet.

## 1. Today
"Hello, FK01 👋" / "Build *Better Habits*", flame streak button + avatar.
Month label with ‹ › and 7 day pills (ring = progress, dot = trained).
Lime **Ongoing challenge** bar (e.g. "Train 4×/week · 3/4") → tap = This week.
Cards: Train today (photo of the program's main muscle, Start), Eat today (kcal + P/C/F mini bars), Body (BMI / weight).

## 2. Eat
Same header + day pills. Kcal hero with flame, macro trio.
Chip row: All · Breakfast · Lunch · Dinner · Snacks.
Meal cards as horizontal photo cards (food photo, time chip, kcal, tick ✓).
Ask AI card under the calendar stays.

## 3. Train
Header "What do I *train today?*" + day pills.
Chip filter: All · Gym · Condo · Cardio.
Plan cards = big photo cards ("Upper Body Power — 7 exercises · 42 min", heart, Start).
My programs as a horizontal carousel of photo cards.

## 4. Program details (new full screen, like "Workout Details")
Hero photo/gif top with ‹ and ♡, rating-style meta row (⏱ 42 min · 💪 Chest, Shoulders · 7 exercises).
Title, short description, exercise list (number · name · sets×reps · How to), sticky lime **Start workout** pill.

## 5. Workout (in progress)
Top bar: ‹ today · timer · kg · sets (one line).
Exercise hero gif with media-style controls (‹ ❚❚ › for prev/next exercise, progress bar = sets done).
Set rows below; Finish as lime pill.

## 6. Rest
Full-screen gif/photo, big lime ring timer, −15 · +15 · **Ready** lime pill; video on Ready.

## 7. Stats
"How am I *progressing?*", lime challenge bar, tiles (this month ▲, streak, total), charts in lime, Ask AI card.

## 8. More
Simple list on dark cards; profile header with avatar.

## Open questions
1. Photos: use stock gym/food photos (need a free source, e.g. Unsplash, stored in /img) or keep muscle-map art?
2. Middle floating button: Start workout, or quick log (meal/weight)?
3. Keep Thai/English mix as now?
