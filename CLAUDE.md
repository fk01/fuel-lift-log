# Fuel & Lift — notes for Claude

Follow `docs/PROCESS.md` for every task:
1. intent.md → wait for **OK**  2. spec.md (+ mockup screenshot for UI) → wait for **OK**
3. plan.md, then code  4. `npm test` + screenshots  5. open a PR to `main`; user says **M** to merge (Cloudflare auto-deploys)
6. issues found on device start a new task.
Tiny tweaks (copy/colour/spacing): user may say **ข้าม** to skip 1–2; still write a short plan.md and run tests.

- Work files: `docs/work/<YYYY-MM-DD>-<slug>/`, templates in `docs/work/_template/`.
- Bump the `?v=` asset query in `public/index.html` on every UI change (iOS caches hard).
- Live programs live in D1 (`settings` doc); `public/js/programs.js` only holds defaults.
- Reply to the user in Thai.
