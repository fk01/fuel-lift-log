# Intent/Plan: polish tokens (user: แก้ทั้งหมด, ไม่ต้องถาม)
- สี hard-code → token ใน :root (`--bg-glass`, `--k*`, `--w*`, `--mus-p/s`, `--brand-ig/strava`, `--white`)
- radius → `--r-xs/sm/md/lg` (DESIGN.md เพิ่ม xs 4px); 14→12, 16/20/22/26→18, 6/8/9→10, 2/3→4
- reduced-motion: ptr spinner หมุน → กระพริบ opacity
- canvas code (run.js, muscle-map.js) ไม่แตะ: canvas ใช้ CSS var ไม่ได้
- ผล: detector เหลือแค่สี Instagram (third-party) ใน token
