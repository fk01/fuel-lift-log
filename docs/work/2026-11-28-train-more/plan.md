# Plan — "+n more" on the Train week card does nothing
Device: the card lists 5 exercises then "+4 more" as plain text — can't see the rest.
- train-week.js v=3: "+n more ⌄" is a button; tap → every exercise of that program (sets × reps · last kg), "Show less ⌃" folds back.
  Works on today's card and on an opened future day.
- CSS v=109 button style. tests/train-week.cjs: unfold → all n rows, fold → 5. `npm test`.
