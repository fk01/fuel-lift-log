# Typed kg/reps survive refresh
- [x] cause: while any editor (tx) open, save("gymdraft") was held in memory only
- [x] gymdraft written to storage + synced even during tx
- [x] txCancel keeps typed sets (merges draft.ex)
- [x] repro before (lost) / after (kept) script, npm test
