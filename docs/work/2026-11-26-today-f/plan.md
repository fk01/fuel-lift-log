# Plan
1. `public/js/home-quest.js` (new, after home.js): wrap `renderHome`, build `.hq-quest`, reuse hidden buttons for actions.
2. `glass-cards.css` v=100: hide old cards, bars, timeline, checkbox, NOW, bare body card.
3. `tests/home-quest.cjs` (rows = meals + plan, tick → HP, Start → #gym) added to smoke.
4. Chromium screenshots; `npm test`; PR + merge.
