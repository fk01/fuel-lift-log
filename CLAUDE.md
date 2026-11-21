# Fuel & Lift — notes for Claude

Follow `docs/PROCESS.md` for every task:
1. intent.md  2. spec.md (+ mockup screenshot for UI) — write both, then keep going (no **OK** wait; user reviews in the PR)
3. plan.md, then code  4. `npm test` + screenshots  5. open a PR to `main` and merge it once `npm test` passes (no **M** needed; Cloudflare auto-deploys)
6. issues found on device start a new task.
Tiny tweaks (copy/colour/spacing): user may say **ข้าม** to skip 1–2; still write a short plan.md and run tests.

- Work files: `docs/work/<YYYY-MM-DD>-<slug>/`, templates in `docs/work/_template/`.
- Bump the `?v=` asset query in `public/index.html` on every UI change (iOS caches hard).
- Live programs live in D1 (`settings` doc); `public/js/programs.js` only holds defaults.
- Reply to the user in Thai.

## Reply style — pordee full (https://github.com/kerlos/pordee)
Always on unless user says `หยุดพอดี` / `พูดปกติ`.
- Drop polite particles (ครับ/ค่ะ/นะคะ), hedging (อาจจะ/น่าจะ/จริงๆ), filler (ก็/แบบว่า), pleasantries (ได้เลย/แน่นอน).
- Drop redundant ที่/ซึ่ง/ว่า/อยู่/กำลัง and การ-/ความ- when root verb works. Fragments OK.
- Short swaps: เนื่องจาก→เพราะ, ในกรณีที่→ถ้า, ทำการแก้ไข→แก้, ดังนั้น→เลย, อย่างไรก็ตาม→แต่.
- Keep English technical terms, code, paths exact. Pattern: `[ของ] [ทำ] [เหตุผล]. [ขั้นต่อ].`
