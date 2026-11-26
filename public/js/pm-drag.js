/* pm-drag.js — program editor: reorder exercises by dragging the number circle, and no more scroll jumps.
   Loads after program-manager.js and wraps pmExRows():
   - every rebuild keeps the list's height and the scroll position (before: the box emptied, the sheet
     scrolled to clamp, then jumped back → "the screen bounces around" on every Move up / Move down)
   - press and drag the number (1, 2, 3 …) of a row; the others slide out of the way; drop to place it.
     Near the top / bottom edge the sheet scrolls by itself. ⋯ → Move up / Move down still works. */
(() => {
  if (typeof pmExRows !== "function") return;
  const L = (th, en) => (typeof lang !== "undefined" && lang === "th" ? th : en);
  const scroller = el => { for (let p = el.parentElement; p; p = p.parentElement) { const o = getComputedStyle(p).overflowY; if ((o === "auto" || o === "scroll") && p.scrollHeight > p.clientHeight) return p; } return document.scrollingElement; };

  const orig = pmExRows;
  window.pmExRows = function (box, k) {
    const sc = scroller(box), top = sc.scrollTop;
    box.style.minHeight = box.offsetHeight + "px";              // no collapse while rebuilding
    const r = orig.apply(this, arguments);
    box.style.minHeight = "";
    const put = () => { if (Math.abs(sc.scrollTop - top) > 2) sc.scrollTop = top; };   // iOS may reset it a frame later
    put(); requestAnimationFrame(put); setTimeout(put, 80);
    try { attach(box, k); } catch (e) { console.error(e); }
    return r;
  };

  function attach(box, k) {
    const rows = [...box.querySelectorAll(":scope > .pm-row")];
    if (rows.length > 1 && !(box.previousElementSibling && box.previousElementSibling.classList.contains("pm-hint"))) {
      const h = document.createElement("small"); h.className = "pm-hint"; h.textContent = L("กดค้างที่ตัวเลขแล้วลาก เพื่อเรียงลำดับ", "Hold a number and drag to reorder"); box.before(h);
    }
    rows.forEach((row, i) => {
      const hd = row.querySelector(".pi-no"); if (!hd) return;
      hd.classList.add("pm-handle"); hd.setAttribute("role", "button"); hd.setAttribute("aria-label", L("ลากเพื่อเรียงลำดับ", "Drag to reorder"));
      hd.addEventListener("pointerdown", ev => start(ev, box, k, rows, i));
    });
  }

  function start(ev, box, k, rows, from) {
    if (ev.button > 0) return;
    ev.preventDefault();
    const hd = ev.currentTarget, row = rows[from], sc = scroller(box);
    try { hd.setPointerCapture(ev.pointerId); } catch (_) {}
    const s0 = sc.scrollTop, y0 = ev.clientY;
    const rects = rows.map(r => r.getBoundingClientRect());
    const tops = rects.map(r => r.top + s0), mids = rects.map(r => r.top + s0 + r.height / 2);
    const step = rects[from].height + (rows.length > 1 ? Math.max(0, (from + 1 < rows.length ? tops[from + 1] - (tops[from] + rects[from].height) : tops[from] - (tops[from - 1] + rects[from - 1].height))) : 0);
    let lastY = y0, to = from, raf = 0, moved = false;
    row.classList.add("pm-drag"); box.classList.add("pm-dragging");
    rows.forEach(r => { if (r !== row) r.style.transition = "transform .15s ease"; });

    const paint = () => {
      const dy = lastY - y0 + (sc.scrollTop - s0);
      if (Math.abs(dy) > 3) moved = true;
      row.style.transform = `translateY(${dy}px)`;
      const c = mids[from] + dy;
      to = from;
      for (let j = 0; j < rows.length; j++) { if (j < from && c < mids[j]) { to = j; break; } }
      for (let j = rows.length - 1; j > from; j--) { if (c > mids[j]) { to = j; break; } }
      rows.forEach((r, j) => {
        if (r === row) return;
        const sh = from < to && j > from && j <= to ? -step : to < from && j >= to && j < from ? step : 0;
        r.style.transform = sh ? `translateY(${sh}px)` : "";
      });
    };
    const edge = () => {                                         // auto-scroll near the edges
      const vr = sc === document.scrollingElement ? { top: 0, bottom: innerHeight } : sc.getBoundingClientRect();
      const bar = document.body.classList.contains("tx-open") ? 110 : 0;
      const lo = vr.top + 70, hi = Math.min(vr.bottom, innerHeight - bar) - 70;
      const v = lastY < lo ? -Math.min(14, (lo - lastY) / 4 + 2) : lastY > hi ? Math.min(14, (lastY - hi) / 4 + 2) : 0;
      if (v) { sc.scrollTop += v; paint(); }
      raf = requestAnimationFrame(edge);
    };
    raf = requestAnimationFrame(edge);
    const move = e => { lastY = e.clientY; paint(); };
    const end = () => {
      cancelAnimationFrame(raf);
      hd.removeEventListener("pointermove", move); hd.removeEventListener("pointerup", end); hd.removeEventListener("pointercancel", end);
      rows.forEach(r => { r.style.transition = ""; r.style.transform = ""; });
      row.classList.remove("pm-drag"); box.classList.remove("pm-dragging");
      if (!moved || to === from) return;
      const list = PROGS[k].ex; list.splice(to, 0, list.splice(from, 1)[0]);
      saveProgs(); pmExRows(box, k); if (typeof renderGym === "function") renderGym();
    };
    hd.addEventListener("pointermove", move); hd.addEventListener("pointerup", end); hd.addEventListener("pointercancel", end);
  }
})();
