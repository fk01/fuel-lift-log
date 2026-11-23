# Verification

- [x] Reproduced on main at `03f4179`. Changing 8 reps to 10 dropped both off-program exercises, their names and sets, annotations, timestamp, duration and set metadata. The location became Gym.
- [x] Restored the saved exercise list and carried untouched fields through Save. A historical draft can resume after a reload.
- [x] Verified rep edits, deleting a set or the only set in an exercise, clearing a memo, legacy entries and the original timestamp on a same-day edit. Run `npm test -- --history-edit` for the regression or `npm test` for the full smoke suite.
- [x] Verified a pre-upgrade draft with a deleted exercise, a deleted first set, and indistinguishable duplicate sets. Checked set-count increase, decrease and cancel through the number picker.
- [x] Moved and deleted the backing entry from History while its edit was open. Both cases kept the edit available and allowed discarding it without writing a log.
- [x] Replaced the original slot with a different workout using the same date, program and timestamp. Verified that Save rejects both moved and deleted originals and also checks the current browser storage before writing.

History offers Edit sets when the workout's program still exists. A deleted program remains viewable in the list.

New drafts carry the selected log's complete version across reloads. An older draft without that version stays open for review. To resume it, select the intended History entry, inspect its saved sets and explicitly apply the draft. The editor then checks that version on Save.

Older drafts did not record a reliable set identity. After confirming the workout, an intact set sequence or a unique match on both weight and reps can retain set metadata. With an ambiguous duplicate or changed values such as 7 kg × 9 becoming 7 kg × 10, the edited weight and reps survive and unverified set metadata is omitted. New edits preserve metadata through their recorded source indices.

![An exercise removed from the current program retains both recorded sets in the editor](removed-exercise.png)
