# Plan: type ramp
- 30 ขนาดฟอนต์ → 11 token `--t-*` (label 12 · meta 13 · sm 14 · body 15 · md 16 · title 17 · head 18 · lg 20 · xl 24 · display 32 · hero 40)
- map ค่าเดิมไปขั้นใกล้สุด; DESIGN.md เพิ่ม Size ramp
- คงไว้: `max(16px,1em)` (iOS zoom), `.8em`, `0`
- ผล: detector font-size advisory 121 → 0; screenshot เทียบแทบเหมือนเดิม
