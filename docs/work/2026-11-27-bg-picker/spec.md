# Spec
1. More → Settings: "Background" row (above Language), subtitle = what is in use.
2. Sheet "Background": tiles — Per tab (default), the 7 manga panels in the app, + Your photo, None.
   Strength: Subtle / Normal / Strong (opacity .08 / .14 / .22). Use on: Every tab / Today / Eat / Train / Stats / More.
   Cancel | ✓ Save.
3. Your photo: pick from the device → converted on the device to black & white manga line art
   (local contrast → dodge sketch; Pencil / Ink / Screentone). Drag the preview to place it. Cancel | ✓ Use this.
   Stored in IndexedDB only (never uploaded, not in sync/backup); prefs in localStorage `bgpref`.
4. The image replaces the page background layer (same ::before as comic-page-bg.css, same invert + screen look).
