# Plan
1. `public/js/pm-drag.js` (new, after program-manager.js): wrap `pmExRows` → keep scroll, attach pointer drag on `.pi-no`.
2. CSS (glass-cards v=98): handle `touch-action:none`, `.pm-drag` lifted row, `.pm-hint`.
3. `tests/pm-reorder.cjs` (drag moves, tap no-op, Move up keeps scroll) → added to smoke.
4. Not verified on iPhone (no WebKit here): the original bounce couldn't be reproduced in Chromium.
