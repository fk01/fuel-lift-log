# Plan: Train (critique 25/40, user picked 4 groups)
- one Finish: header button hidden, bottom "Finish & save N/M" stays
- calm style like Today/Eat: greeting header + round week strip ("สัปดาห์นี้เล่น N วัน"), big title hidden, flat cards, no glow, no grid, flat workout top bar
- plan list: Start only on the lead row (first undone weights item); others show ›; no one-tap ✕ (remove via the row sheet "เอาออกจากวันนี้")
- set entry: ticking a weighted set with empty kg copies the row above, else asks for the weight (pad opens); 44px green tick; pad confirm "✓ เสร็จเซ็ตนี้"
- copy: no "Pending" chip, "5 เซ็ต × 5 ครั้ง"; 44px targets in the workout; Add sheet takes focus
- tests: day-queue follows the new rules (one Start, remove via sheet); hit-areas hides a transient level-up toast
- Train strip was 8px lower (#step1 wrapper margin+padding) → zeroed; measured header/strip/day/dot/arrows identical on Today, Eat, Train

## Remove the "LEVEL UP!" toast (user request)
- hero.js no longer toasts on level up; level stays visible on Today → This week

## Device bugs (workout)
- +Set / −Set / Tick all re-rendered the cards without re-applying the pager → the shown exercise vanished. renderEx now re-applies the pager; smoke test workout-set-buttons-keep-card
- paging ‹ › scrolled the page to the pager every time → only scroll back if the pager is off-screen above (measured: scroll position unchanged)
- Cancel / Finish & save drifted (sticky + bar-hide) → fixed above the tab bar; tab bar stays put on Train (measured: same y while scrolling)

## Start button identical on Today and Train
- Train lead Start uses the Today classes (btn primary sm hq-ps); no glow on either; measured: size, radius, border, gradient, shadow, font, colour all equal

## Flow bug: start → tick → cancel looked frozen
- ticking a set opens the rest sheet and the old CSS hid Cancel / Finish & save while resting (.wrap.has-rest .wo-bar{display:none}) → bar now stays; rest sheet sits right above it; solid bar background; no gaps (measured edges: rest bottom = bar top = 697, bar bottom = tab bar top = 774)
- smoke test workout-cancel-during-rest

## Flow bug: tick all → next → back → Edit
- edit card Done button was blank (key "เสร็จ" collides with another EN key) → "✓ เสร็จ" / "Done"
- editing stacked two bottom bars (edit Cancel/Save over the workout Cancel/Finish) → workout bar hides while the edit bar is up; edit bar sits above the tab bar only during a workout
- smoke test workout-edit-one-bar

## Main lift + ↑↓ live only in "Edit exercises"
- single exercise Edit (during a workout): sets, rep range, muscles, change exercise, Delete, Done
- "Edit exercises" mode keeps Main lift + ↑↓ (aria-labels "Move earlier/later"); measured: single edit 0 ↑ / 0 main, edit mode 8 / 8

## Rest timer first (user request, replaces #150 behaviour)
- while the rest timer is up, Cancel / Finish & save are hidden; close it with Ready (or let it finish) and the bar comes back
- rest sheet back to sitting directly on the tab bar; smoke test renamed workout-rest-then-cancel (bar hidden during rest → Ready → bar back → Cancel)

## One typeface on Train (user request)
- #v-gym, rest sheet and number pad use the body font everywhere (no mono mixed in: "5 Set × 5 Reps", "No history", set numbers, clock, pad); tabular numbers keep digits aligned

## Cancel / Finish & save sit after "+ Add exercise" (user request)
- bar is part of the page (static), right under "+ Add exercise", scrolls with the content; room below so it clears the tab bar (measured: add bottom 533 → bar top 565, bar bottom 714 < tab bar 774)

## Program sheet lists every exercise (user request)
- openPlanItem no longer cuts at 6 ("+1 exercises"); measured 7/7 rows for Pull B
