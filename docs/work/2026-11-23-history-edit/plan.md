# Verification

- [x] Reproduced on main at `03f4179`. Changing 8 reps to 10 dropped both off-program exercises, their names and sets, annotations, timestamp, duration and set metadata. The location became Gym.
- [x] Restored the saved exercise list and carried untouched fields through Save. A historical draft can resume after a reload.
- [x] Verified rep edits, deleting a set or the only set in an exercise, clearing a memo, legacy entries and the original timestamp on a same-day edit. Run `npm test -- --history-edit` for the regression or `npm test` for the full smoke suite.
- [x] Verified a pre-upgrade draft with a deleted exercise, a deleted first set, and indistinguishable duplicate sets. Checked set-count increase, decrease and cancel through the number picker.
- [x] Moved and deleted the backing entry from History while its edit was open. Both cases kept the edit available and allowed discarding it without writing a log.

History offers Edit sets when the workout's program still exists. A deleted program remains viewable in the list.

![An exercise removed from the current program retains both recorded sets in the editor](removed-exercise.png)
