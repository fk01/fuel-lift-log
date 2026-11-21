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
