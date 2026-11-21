# Plan: Today bugs (from device)
- Recovery times button dead: home.js bound listener at load, but #rec-cfg is after the scripts in index.html → delegate on document
- Body log button disappeared after logging today → always show ("บันทึกร่างกาย" / "แก้บันทึกวันนี้")
- smoke tests for both
