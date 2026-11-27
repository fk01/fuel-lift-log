# Plan
1. `public/js/train-week.js` (after locations.js): wrap `renderPlan`, build `.tw`, reuse startPlanItem / openPlanAdd /
   openDoneItem / openPlanItem / setDayMode; ⇄ sheet edits `PROGS[k].days` + saveProgs.
2. `glass-cards.css` v=106: week rows, today card, schedule sheet; hide old rows; rest-day fold fix.
3. `tests/train-week.cjs` in smoke. `npm test` PASS. Chromium screenshots.
