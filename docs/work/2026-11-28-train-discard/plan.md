# Plan — Train week view: can't cancel an open workout
Device: started Push A, tapped Back → week card only had Resume (+ Rest today / Change today); the old
"Discard" button from the plan rows was not carried over. The workout bar (Back · timer · Finish) also floated under the list.
- train-week.js v=2: card for an in-progress workout shows "In progress · done/total sets" and **Discard workout**
  (same confirm as before → cancelProg) instead of Rest / Change today; tabs hidden while a workout is open.
- CSS v=108: hide #wo-top while the week view (#locpick) is shown.
- tests/train-week.cjs: Back → Discard → confirm → workout cancelled, Start back. `npm test`.
