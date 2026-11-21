# Plan: Today redesign (user ข้าม OK spec)
1. `home.js renderHome`: order = workout → food → body (details, collapsed)
2. workout: primary program only (+N more), suggestion only when nothing planned, primary "เริ่ม <prog>" button
3. food: inline "กินมื้อนี้แล้ว" tick → `food[TODAY].done`
4. body: summary line (ready x/16, recovering muscles) or beginner empty text; full map + recovery-times button inside the fold
5. P3: body icon, "ดูแผน" → "View meals", drop dead `trainLinks()`, drop disabled-button card
6. CSS block at end of app.css; bump `?v=`; `npm test`; before/after screenshots

## Round 2 (critique v2 25/40)
- P0 warn when planned program hits recovering muscles + "เริ่ม <rested> แทน" button
- P1 meal tick → undoLoud (Undo bar); kcal/protein/sets progress bars + mono numerals
- P2 Start button calls startPlanItem directly; skip 0-kcal items as "next meal"; flat empty body card
