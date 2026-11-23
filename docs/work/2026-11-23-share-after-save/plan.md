# Validation

- Reuse the selection fix from `7fec6f1` and both regression cases from `6f882ec`.
- Run `npm test -- --share-after-save` to edit a past set and finish a second program through the workout UI. Check the rendered card's source record against the persisted workout and verify the PNG filename.
- Run `npm test -- --history-edit` against the integrated History save guard from #271. Verify that a moved, deleted, or replaced workout cannot be overwritten by a stale edit.
- Run `npm test` for the full browser suite.
