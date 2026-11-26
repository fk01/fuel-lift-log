# Plan — Ask AI card: same size on Eat / Train / Stats
Measured (430 wide): Eat 77 px tall, Train 77 px with no border, Stats 85 px and 5 px higher
(its title had been set to 24 px/wrap while the others were 28 px nowrap — and on a 390 pt iPhone every title overflowed).
- One rule for `.btn.st-ai` on all three tabs: padding 12/14, 1px border .18, radius 18, glass fill, subtitle one line.
- Page titles on Today/Eat/Train/Stats: `clamp(20px, 5.9vw, 28px)`, one line → same size everywhere, fits at 390.
- glass-cards v=104. Verified 390 + 430: card 85 px on all three, top within 1–2 px. `npm test`.
