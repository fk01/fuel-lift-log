# Plan
1. `public/js/bg-picker.js` (new): prefs, IDB, `applyBg()` writes a `<style id="bg-user">`, picker + photo sheets, canvas filter.
2. `glass-cards.css` v=105: tiles, options, preview.
3. `tests/bg-picker.cjs` (panel every tab + strength, one-tab override, photo → greyscale blob, survives reload) in smoke.
4. Not verified on iPhone: IndexedDB + canvas work in Safari; large photos are scaled to 1400 px before filtering.
