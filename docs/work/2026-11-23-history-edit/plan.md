# Verification

- [x] Reproduced on main at `03f4179`. Changing 8 reps to 10 dropped both off-program exercises, their names and sets, annotations, timestamp, duration and set metadata. The location became Gym.
- [x] Restored the saved exercise list and carried untouched fields through Save. A historical draft can resume after a reload.
- [x] Verified rep edits, deleting a set or the only set in an exercise, clearing a memo, legacy entries and the original timestamp on a same-day edit. Run `npm test -- --history-edit` for the regression or `npm test` for the full smoke suite.

![An exercise removed from the current program retains both recorded sets in the editor](removed-exercise.png)
