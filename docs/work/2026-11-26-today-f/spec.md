# Spec
- Under the week strip: HP (kcal eaten / goal), SP (protein / target), EXP (days trained / weekly challenge goal).
  HP/SP tap → Eat; EXP tap → the old challenge toggle (week view).
- "Today's quests · done/total": every meal of the plan + every planned workout, sorted by time.
  Meal = checkbox (tick = eaten, same storage as before). Workout = ▶ Start (→ Train, starts it) or ✓ when done; tap name → program preview.
  Workout time from its Time of day (am 07:00, noon 12:00, pm 18:00, night 20:00), else its usual order; no time label when unset.
- NOW marker (today only) before the first quest later than now; the next open quest gets the bright dot.
- Rest day with no plan: "Rest day · Train anyway ›".
- "+ Ate something else" under the list. Body card stays (no box / icon) for weight + recovery details.
- Old Train / Eat cards and the challenge pill stay in the DOM (hidden) so their handlers are reused.
