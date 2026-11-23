# Workout weight validation

- For a weighted set with missing kg, a single tick uses the existing previous-set weight shortcut when available. Otherwise, it leaves the set unticked and opens the weight keypad.
- Tick all keeps its previous-session weight shortcut and completes only rows with a valid load. Clearing a completed weighted row's weight unticks the row and shows a message.
- Bodyweight sets can be completed and saved with blank kg, stored as numeric zero. An explicit zero stays valid even when earlier sets used a positive load.
- A draft with a completed weighted row and missing kg stays open when saved. The user can enter a weight or untick the row.
