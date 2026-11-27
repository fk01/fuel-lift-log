/* bg-picker.js — More → Background (user choice, 4 steps):
   1. a "Background" row in More → Settings shows what is in use
   2. pick a manga panel that ships with the app (or "one per tab" = the default, or none), strength, which tab
   3. or your own photo: it is turned into black & white manga line art on the device (Pencil / Ink / Screentone),
      drag the preview to place it; the result is kept in this browser only (IndexedDB), never uploaded
   4. the chosen image replaces the page background (the same ::before layer comic-page-bg.css draws)
   Prefs (small) live in localStorage "bgpref"; the photo blob in IndexedDB "wg-bg". */
(() => {
  const L = (th, en) => (typeof lang !== "undefined" && lang === "th" ? th : en);
  const TABS = [["home", "วันนี้", "Today"], ["food", "กิน", "Eat"], ["gym", "ออกกำลัง", "Train"], ["stats", "สถิติ", "Stats"], ["more", "เพิ่มเติม", "More"]];
  const PANELS = [["today", "วันนี้", "Today"], ["eat", "กิน", "Eat"], ["active", "ออกกำลัง", "Train"], ["stats", "สถิติ", "Stats"], ["more", "เพิ่มเติม", "More"], ["login", "ฮีโร่", "Hero"], ["badges", "เหรียญ", "Badges"]];
  const OPA = { subtle: 0.08, normal: 0.14, strong: 0.22 };
  const STYLES = [["pencil", "ดินสอ", "Pencil"], ["ink", "หมึก", "Ink"], ["tone", "สกรีนโทน", "Screentone"]];

  /* ---------- prefs ---------- */
  const DEF = { def: "tab", tabs: {}, strength: "normal", style: "ink", x: 50, y: 30 };
  let pref = (() => { try { return { ...DEF, ...JSON.parse(localStorage.getItem("bgpref") || "{}") }; } catch (e) { return { ...DEF }; } })();
  const savePref = () => { try { localStorage.setItem("bgpref", JSON.stringify(pref)); } catch (e) {} };

  /* ---------- photo store (IndexedDB) ---------- */
  const db = () => new Promise((res, rej) => { const r = indexedDB.open("wg-bg", 1); r.onupgradeneeded = () => r.result.createObjectStore("f"); r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); });
  const idbGet = async k => { try { const d = await db(); return await new Promise(res => { const q = d.transaction("f").objectStore("f").get(k); q.onsuccess = () => res(q.result || null); q.onerror = () => res(null); }); } catch (e) { return null; } };
  const idbPut = async (k, v) => { const d = await db(); await new Promise((res, rej) => { const tx = d.transaction("f", "readwrite"); tx.objectStore("f").put(v, k); tx.oncomplete = res; tx.onerror = () => rej(tx.error); }); };
  let photoURL = null;
  const loadPhoto = async () => { const b = await idbGet("photo"); if (photoURL) URL.revokeObjectURL(photoURL); photoURL = b ? URL.createObjectURL(b) : null; return photoURL; };

  /* ---------- apply ---------- */
  const imgFor = c => c === "photo" ? (photoURL ? `url("${photoURL}")` : null) : c === "none" ? "none" : c && c.startsWith("p:") ? `url(/img/comic-${c.slice(2)}.jpg)` : null;
  function applyBg() {
    let st = document.getElementById("bg-user"); if (!st) { st = document.createElement("style"); st.id = "bg-user"; document.head.appendChild(st); }
    const op = OPA[pref.strength] || OPA.normal;
    st.textContent = TABS.map(([tab]) => {
      const c = pref.tabs[tab] || pref.def, img = imgFor(c);
      const pos = c === "photo" ? `background-position:${pref.x}% ${pref.y}% !important;` : c && c.startsWith("p:") ? "background-position:center 25% !important;" : "";
      const sel = `html body #v-${tab}:not([hidden])::before` + (tab === "gym" ? `, html body.wo-focus #v-gym:not([hidden])::before` : "");
      return `${sel}{${img ? `background-image:${img} !important;` : ""}${pos}opacity:${tab === "gym" && c === "tab" ? op * 1.15 : op} !important}`;
    }).join("\n");
    document.documentElement.dataset.bg = pref.def;
    const s = document.getElementById("bg-sum"); if (s) s.textContent = summary();
  }
  const nameOf = c => c === "tab" ? L("ภาพมังงะ · แท็บละภาพ", "Manga panels · one per tab") : c === "none" ? L("ไม่มี", "None")
    : c === "photo" ? `${L("รูปของฉัน", "Your photo")} · ${L(...STYLES.find(s => s[0] === pref.style).slice(1))}` : (p => p ? L(p[1], p[2]) : c)(PANELS.find(p => "p:" + p[0] === c));
  const summary = () => { const n = Object.keys(pref.tabs).length; return nameOf(pref.def) + (pref.def !== "tab" && pref.def !== "none" && pref.def !== "photo" ? ` · ${L("ทุกแท็บ", "every tab")}` : "") + (n ? ` · +${n} ${L("แท็บ", n > 1 ? "tabs" : "tab")}` : ""); };

  /* ---------- manga filter (same recipe as the mockup: local contrast → dodge sketch → ink / screentone) ---------- */
  function boxBlur(src, w, h, r) {           // 3 × separable box blur ≈ gaussian
    let a = Float32Array.from(src), b = new Float32Array(a.length);
    for (let pass = 0; pass < 3; pass++) {
      for (let y = 0; y < h; y++) { let s = 0; const o = y * w; for (let x = -r; x <= r; x++) s += a[o + Math.min(w - 1, Math.max(0, x))];
        for (let x = 0; x < w; x++) { b[o + x] = s / (2 * r + 1); s += a[o + Math.min(w - 1, x + r + 1)] - a[o + Math.max(0, x - r)]; } }
      for (let x = 0; x < w; x++) { let s = 0; for (let y = -r; y <= r; y++) s += b[Math.min(h - 1, Math.max(0, y)) * w + x];
        for (let y = 0; y < h; y++) { a[y * w + x] = s / (2 * r + 1); s += b[Math.min(h - 1, y + r + 1) * w + x] - b[Math.max(0, y - r) * w + x]; } }
    }
    return a;
  }
  function manga(img, style, maxSide) {
    const sc = Math.min(1, maxSide / Math.max(img.width, img.height)), w = Math.max(1, Math.round(img.width * sc)), h = Math.max(1, Math.round(img.height * sc));
    const c = document.createElement("canvas"); c.width = w; c.height = h; const x = c.getContext("2d");
    x.fillStyle = "#fff"; x.fillRect(0, 0, w, h); x.drawImage(img, 0, 0, w, h);
    const id = x.getImageData(0, 0, w, h), p = id.data, n = w * h, g = new Float32Array(n);
    for (let i = 0; i < n; i++) g[i] = p[i * 4] * 0.3 + p[i * 4 + 1] * 0.59 + p[i * 4 + 2] * 0.11;
    // auto-contrast (2% cut)
    const hist = new Uint32Array(256); for (let i = 0; i < n; i++) hist[g[i] | 0]++;
    let lo = 0, hi = 255, acc = 0; while (lo < 255 && (acc += hist[lo]) < n * 0.02) lo++; acc = 0; while (hi > 0 && (acc += hist[hi]) < n * 0.02) hi--;
    const k = 255 / Math.max(1, hi - lo); for (let i = 0; i < n; i++) g[i] = Math.min(255, Math.max(0, (g[i] - lo) * k));
    const R = Math.max(4, Math.round(Math.max(w, h) / 22));
    const big = boxBlur(g, w, h, Math.round(R / 1.7)), loc = new Float32Array(n);
    for (let i = 0; i < n; i++) loc[i] = Math.min(255, Math.max(0, (g[i] - big[i]) * 1.6 + 175));
    const inv = new Float32Array(n); for (let i = 0; i < n; i++) inv[i] = 255 - loc[i];
    const ib = boxBlur(inv, w, h, Math.max(1, Math.round(Math.max(w, h) / 220))), sk = new Float32Array(n);
    for (let i = 0; i < n; i++) sk[i] = Math.min(255, loc[i] * 255 / (256 - ib[i]));
    const out = new Uint8ClampedArray(n);
    if (style === "pencil") for (let i = 0; i < n; i++) out[i] = sk[i];
    else if (style === "ink") for (let i = 0; i < n; i++) out[i] = sk[i] < 215 || loc[i] < 95 ? 0 : 255;
    else out.fill(255);
    for (let i = 0; i < n; i++) { const v = out[i]; p[i * 4] = p[i * 4 + 1] = p[i * 4 + 2] = v; p[i * 4 + 3] = 255; }
    x.putImageData(id, 0, 0);
    if (style === "tone") {                 // screentone dots on the darker areas, then the ink lines on top
      const step = Math.max(4, Math.round(Math.max(w, h) / 135)); x.fillStyle = "#000";
      for (let y = 0; y < h; y += step) for (let xx = ((y / step) % 2) * step / 2; xx < w; xx += step) {
        const v = loc[Math.min(h - 1, y) * w + Math.min(w - 1, xx | 0)] / 255, r = (1 - v) * step * 0.75;
        if (v < 0.66 && r > 0.5) { x.beginPath(); x.arc(xx, y, r, 0, 6.2832); x.fill(); }
      }
      const d2 = x.getImageData(0, 0, w, h), q = d2.data;
      for (let i = 0; i < n; i++) if (sk[i] < 215) q[i * 4] = q[i * 4 + 1] = q[i * 4 + 2] = 0;
      x.putImageData(d2, 0, 0);
    }
    return c;
  }
  const toBlob = c => new Promise(r => c.toBlob(b => r(b), "image/jpeg", 0.85));
  const fileImg = f => new Promise((res, rej) => { const u = URL.createObjectURL(f), im = new Image(); im.onload = () => { URL.revokeObjectURL(u); res(im); }; im.onerror = () => { URL.revokeObjectURL(u); rej(new Error("image")); }; im.src = u; });

  /* ---------- step 2: picker sheet ---------- */
  function openBg() {
    let sel = pref.def, str = pref.strength, on = "all";
    const tile = (c, lab, img) => `<button type="button" class="bgp-t${img ? "" : " bgp-plain"}" data-bgc="${c}" aria-pressed="false" aria-label="${esc(lab)}">${img ? `<i style="background-image:${img}"></i>` : ""}<span>${esc(lab)}</span></button>`;
    const html = `<div class="bgp">
      <div class="bgp-lab">${L("ภาพมังงะ", "Manga panels")}</div>
      <div class="bgp-grid">${tile("tab", L("แท็บละภาพ", "Per tab"), "url(/img/comic-today.jpg)")}${PANELS.map(([k, th, en]) => tile("p:" + k, L(th, en), `url(/img/comic-${k}.jpg)`)).join("")}
        <button type="button" class="bgp-t bgp-add" data-bgc="photo" aria-pressed="false">${photoURL ? `<i style="background-image:url('${photoURL}')"></i>` : ""}<span>${photoURL ? L("รูปของฉัน", "Your photo") : "+ " + L("รูปของฉัน", "Your photo")}</span></button>
        ${tile("none", L("ไม่มี", "None"), "")}</div>
      ${photoURL ? `<button type="button" class="bgp-link" data-bgnew>${L("เลือกรูปใหม่", "Choose another photo")} ›</button>` : ""}
      <div class="bgp-lab">${L("ความเข้ม", "Strength")}</div>
      <div class="bgp-opts" data-grp="str">${[["subtle", "จาง", "Subtle"], ["normal", "ปกติ", "Normal"], ["strong", "ชัด", "Strong"]].map(([k, th, en]) => `<button type="button" data-v="${k}">${L(th, en)}</button>`).join("")}</div>
      <div class="bgp-lab">${L("ใช้กับ", "Use on")}</div>
      <div class="bgp-opts" data-grp="on"><button type="button" data-v="all">${L("ทุกแท็บ", "Every tab")}</button>${TABS.map(([k, th, en]) => `<button type="button" data-v="${k}">${L(th, en)}</button>`).join("")}</div>
      <input type="file" accept="image/*" data-bgfile hidden>
      <div class="actions sheet-act"><button type="button" class="btn" data-gen-close>${L("ยกเลิก", "Cancel")}</button><button type="button" class="btn primary" data-bgsave>✓ ${L("บันทึก", "Save")}</button></div></div>`;
    openGen(L("พื้นหลัง", "Background"), html, b => {
      const paint = () => {
        b.querySelectorAll("[data-bgc]").forEach(x => x.setAttribute("aria-pressed", String(x.dataset.bgc === sel)));
        b.querySelectorAll('[data-grp="str"] button').forEach(x => x.setAttribute("aria-pressed", String(x.dataset.v === str)));
        b.querySelectorAll('[data-grp="on"] button').forEach(x => x.setAttribute("aria-pressed", String(x.dataset.v === on)));
      };
      const file = b.querySelector("[data-bgfile]");
      b.querySelectorAll("[data-bgc]").forEach(x => x.addEventListener("click", () => { if (x.dataset.bgc === "photo" && !photoURL) { file.click(); return; } sel = x.dataset.bgc; paint(); }));
      b.querySelector("[data-bgnew]")?.addEventListener("click", () => file.click());
      file.addEventListener("change", () => { const f = file.files && file.files[0]; if (f) openPhoto(f); });
      b.querySelectorAll('[data-grp="str"] button').forEach(x => x.addEventListener("click", () => { str = x.dataset.v; paint(); }));
      b.querySelectorAll('[data-grp="on"] button').forEach(x => x.addEventListener("click", () => { on = x.dataset.v; paint(); }));
      b.querySelector("[data-bgsave]").addEventListener("click", () => {
        pref.strength = str;
        if (on === "all") { pref.def = sel; pref.tabs = {}; } else { if (sel === pref.def) delete pref.tabs[on]; else pref.tabs[on] = sel; }
        savePref(); applyBg(); closeGen(); toast("✓ " + L("เปลี่ยนพื้นหลังแล้ว", "Background updated"));
      });
      paint();
    });
  }

  /* ---------- step 3: your photo → manga ---------- */
  async function openPhoto(f) {
    let img; try { img = await fileImg(f); } catch (e) { toast(L("เปิดรูปไม่ได้", "Can't open that image")); return; }
    let style = pref.style || "ink", px = 50, py = 30;
    const prev = {}; STYLES.forEach(([k]) => { prev[k] = manga(img, k, 520).toDataURL("image/jpeg", 0.8); });
    const html = `<div class="bgp">
      <div class="bgp-prev" data-bgprev><i></i><span>${L("ลากเพื่อจัดตำแหน่ง", "Drag to move")}</span></div>
      <div class="bgp-lab">${L("สไตล์", "Style")}</div>
      <div class="bgp-sty">${STYLES.map(([k, th, en]) => `<button type="button" class="bgp-t" data-bgs="${k}" aria-pressed="false"><i style="background-image:url(${prev[k]})"></i><span>${L(th, en)}</span></button>`).join("")}</div>
      <div class="actions sheet-act"><button type="button" class="btn" data-bgback>${L("ยกเลิก", "Cancel")}</button><button type="button" class="btn primary" data-bguse>✓ ${L("ใช้รูปนี้", "Use this")}</button></div></div>`;
    openGen(L("รูปของฉัน", "Your photo"), html, b => {
      const pv = b.querySelector("[data-bgprev]"), pi = pv.querySelector("i");
      const paint = () => { pi.style.backgroundImage = `url(${prev[style]})`; pi.style.backgroundPosition = `${px}% ${py}%`; b.querySelectorAll("[data-bgs]").forEach(x => x.setAttribute("aria-pressed", String(x.dataset.bgs === style))); };
      b.querySelectorAll("[data-bgs]").forEach(x => x.addEventListener("click", () => { style = x.dataset.bgs; paint(); }));
      let d0 = null;
      pv.addEventListener("pointerdown", e => { d0 = { x: e.clientX, y: e.clientY, px, py }; try { pv.setPointerCapture(e.pointerId); } catch (_) {} });
      pv.addEventListener("pointermove", e => { if (!d0) return; const r = pv.getBoundingClientRect();
        px = Math.max(0, Math.min(100, d0.px - (e.clientX - d0.x) / r.width * 100)); py = Math.max(0, Math.min(100, d0.py - (e.clientY - d0.y) / r.height * 100)); paint(); });
      const up = () => { d0 = null; }; pv.addEventListener("pointerup", up); pv.addEventListener("pointercancel", up);
      b.querySelector("[data-bgback]").addEventListener("click", () => { try { genBack(); } catch (e) { closeGen(); } });
      b.querySelector("[data-bguse]").addEventListener("click", async ev => {
        ev.currentTarget.disabled = true;
        try {
          const blob = await toBlob(manga(img, style, 1400));
          await idbPut("photo", blob); await loadPhoto();
          Object.assign(pref, { def: "photo", tabs: {}, style, x: px, y: py }); savePref(); applyBg();
          closeGen(); toast("✓ " + L("ใช้รูปของคุณเป็นพื้นหลังแล้ว", "Your photo is the background now"));
        } catch (e) { console.error(e); ev.currentTarget.disabled = false; toast(L("บันทึกรูปไม่ได้", "Couldn't save the photo")); }
      });
      paint();
    });
  }

  /* ---------- step 1: the More row ---------- */
  function addRow() {
    if (document.getElementById("bg-open")) return;
    const lng = document.querySelector('#v-more [data-act="lang"]'); if (!lng) return;
    const r = document.createElement("button"); r.className = "menu-row"; r.id = "bg-open";
    r.innerHTML = `<span class="mi"></span><span class="mt"><b data-i="พื้นหลัง">${t("พื้นหลัง")}</b><small id="bg-sum"></small></span><span class="mc">›</span>`;
    lng.before(r); r.addEventListener("click", openBg);
  }
  try { Object.assign(EN, { "พื้นหลัง": "Background" }); } catch (e) {}
  window.openBg = openBg; window.applyBg = applyBg; window.bgManga = manga;
  addRow(); applyBg(); loadPhoto().then(applyBg);
  window.addEventListener("hashchange", () => { const s = document.getElementById("bg-sum"); if (s) s.textContent = summary(); });
})();
