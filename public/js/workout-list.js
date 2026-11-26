/* workout-list.js — active workout shows every exercise on one page (option A):
   the current exercise (woIdx, .pg-on) is a full card, every other one collapses to a single row.
   Also: "⇄ Replace" swaps an exercise for today only (draft.swap; the program is untouched).
   Classic script: loads after workout.js + workout-pager-fix.js and shares their globals. */
(() => {
  const L = (th, en) => (typeof lang !== "undefined" && lang === "th" ? th : en);
  const box = () => document.getElementById("exs");
  const done = e => { const r = (draft.ex || {})[e.id] || []; return r.length > 0 && r.every(x => x.ok); };
  const ticked = e => ((draft.ex || {})[e.id] || []).some(x => x.ok);
  const hist = () => !!(draft.fromHist && draft.historyExercises);
  const canReplace = () => !editing && (hist() || !draft.fromHist && PROGS[cur]);
  const origOf = e => { const m = swapMap(); return Object.keys(m).find(k => m[k] && m[k].id === e.id) || null; };
  const wasName = e => hist() ? (draft.histSwap || {})[e.id] || null : (() => { const o = origOf(e); return o ? (PROGS[cur].ex.find(x => x.id === o) || {}).n || o : null; })();

  function summary(e) {
    const r = ((draft.ex || {})[e.id] || []).filter(x => x.ok);
    if (!r.length) return "";
    const same = r.every(x => +x.kg === +r[0].kg && +x.reps === +r[0].reps);
    return same ? `${toDisp(r[0].kg, e.u)}×${r[0].reps} ×${r.length}` : r.map(x => `${toDisp(x.kg, e.u)}×${x.reps}`).join(" · ");
  }

  // top bar: plain text labels "‹ Back" / "Finish" instead of icon buttons
  function topLabels() {
    const bk = document.getElementById("wo-back"), fin = document.querySelector("#wo-top .wt-fin");
    if (bk && !bk.dataset.lbl) { bk.dataset.lbl = 1; bk.textContent = L("กลับ", "Back"); }
    if (fin && !fin.dataset.lbl) { fin.dataset.lbl = 1; fin.textContent = L("จบ", "Finish"); }
  }

  function listify() {
    try { topLabels(); } catch (_) {}
    const b = box(); if (!b) return;
    const cards = [...b.querySelectorAll(":scope>.ex")];
    const on = picked && !editing && cards.length > 1;
    b.classList.toggle("wo-list", on);
    b.querySelectorAll(":scope>.wl-head").forEach(x => x.remove());
    b.querySelectorAll(".ls-next:not(.wl-row)").forEach(x => x.remove());
    cards.forEach(c => { c.classList.remove("wl-mini"); c.querySelector(":scope>.wl-row")?.remove(); });
    if (!on) return;
    const ex = sessEx(), nDone = ex.filter(done).length;
    b.insertAdjacentHTML("afterbegin", `<div class="wl-head"><span>${esc(PROGS[cur]?.name || "")}</span><small>${nDone}/${ex.length} ${L("ท่าเสร็จ", "done")}</small><i style="--p:${ex.length ? nDone / ex.length * 100 : 0}%"></i></div>`);
    const curIdx = cards.findIndex(c => c.classList.contains("pg-on"));
    cards.forEach((c, i) => {
      const e = ex[i]; if (!e) return;
      if (i === curIdx) { headerExtras(c, e); return; }
      c.classList.add("wl-mini");
      const d = done(e), row = document.createElement("div");
      row.className = "wl-row" + (d ? " wl-done" : "") + (i === curIdx + 1 ? " wl-next" : "");
      row.setAttribute("role", "button"); row.tabIndex = 0;
      row.innerHTML = `<span class="wl-n">${d ? "✓ " : ""}${esc(e.n)}</span>` +
        (d ? `<span class="wl-s">${esc(summary(e))}</span>`
           : `<span class="wl-r">${canReplace() && (hist() || !ticked(e)) ? `<button type="button" class="wl-sw" aria-label="${L("เปลี่ยนท่า", "Replace")} ${esc(e.n)}">⇄</button>` : ""}<span class="wl-s">${e.s} ${L("เซ็ต", "sets")} ›</span></span>`);
      row.addEventListener("click", ev => { if (ev.target.closest(".wl-sw")) { ev.stopPropagation(); openReplace(e); return; } goEx(i); });
      row.addEventListener("keydown", ev => { if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); goEx(i); } });
      c.prepend(row);
    });
  }

  function headerExtras(card, e) {
    const hd = card.querySelector(".mk-h"); if (!hd) return;
    hd.querySelector(".wl-rep")?.remove(); card.querySelector(".wl-was")?.remove();
    if (canReplace()) {
      const bt = document.createElement("button");
      bt.type = "button"; bt.className = "wl-rep"; bt.textContent = "⇄ " + L("เปลี่ยนท่า", "Replace");
      bt.addEventListener("click", () => openReplace(e));
      hd.querySelector(".mk-more")?.before(bt);
    }
    const was = wasName(e);
    if (was) hd.querySelector(".mk-t small")?.insertAdjacentHTML("beforebegin", `<small class="wl-was">⇄ ${L("แทน", "replaced")} ${esc(was)} · ${hist() ? L("เฉพาะ workout นี้", "this workout") : L("เฉพาะวันนี้", "today only")}</small>`);
  }

  /* ---- Replace sheet ---- */
  function openReplace(e) {
    const prim = (() => { try { return new Set(musOf(EXLIB.find(q => q.id === e.id) || e)[0]); } catch (x) { return new Set(); } })();
    const eq = new Set(eqOf(EXLIB.find(q => q.id === e.id) || e));
    const inSess = new Set(sessEx().map(x => x.id));
    let mode = "mus", q = "";
    const pool = () => EXLIB.filter(x => !inSess.has(x.id) && (() => { try { return canDo(x); } catch (_) { return true; } })());
    const match = x => {
      if (q) return (x.n || "").toLowerCase().includes(q) || t(x.n || "").toLowerCase().includes(q);
      if (mode === "mus") { try { return musOf(x)[0].some(m => prim.has(m)); } catch (_) { return false; } }
      if (mode === "eq") return eqOf(x).some(z => eq.has(z));
      return true;
    };
    const meta = x => {
      let ms = ""; try { ms = musOf(x)[0].slice(0, 2).map(m => t(MUS_NAME[m])).join(", "); } catch (_) {}
      const l = lastFor(x.id), u = x.u || "kg";
      return [ms, l && l.sets && l.sets[0] ? `${L("ล่าสุด", "Last")} ${toDisp(l.sets[0].kg, u)} ${u} × ${l.sets[0].reps}` : ""].filter(Boolean).join(" · ");
    };
    const draw = b => {
      const list = pool().filter(match).slice(0, 40);
      b.querySelectorAll("[data-rm]").forEach(c => c.setAttribute("aria-pressed", String(c.dataset.rm === mode && !q)));
      b.querySelector(".rp-list").innerHTML = list.length
        ? list.map(x => `<button type="button" class="rp-opt" data-rp="${esc(x.id)}"><span><b>${esc(t(x.n))}</b><small>${esc(meta(x))}</small></span><i>›</i></button>`).join("")
        : `<small class="note">${L("ไม่พบท่าที่ทำได้ในสถานที่นี้", "No matching exercise for this place")}</small>`;
      b.querySelectorAll("[data-rp]").forEach(o => o.addEventListener("click", () => pick(e, EXLIB.find(x => x.id === o.dataset.rp))));
    };
    openGen(`${L("เปลี่ยน", "Replace")} ${esc(e.n)}`,
      `<small class="note rp-sub">${hist() ? L("แก้เฉพาะ workout นี้ — เซ็ตที่บันทึกย้ายไปท่าใหม่", "This workout only — its logged sets move to the new exercise") : L("เปลี่ยนเฉพาะวันนี้ โปรแกรมยังเป็นท่าเดิม", "Today only — your program keeps the original")}</small>
       <input class="le-in rp-q" type="search" placeholder="${L("ค้นหาท่า", "Search exercises")}" aria-label="${L("ค้นหาท่า", "Search exercises")}">
       <div class="chips rp-chips"><button type="button" class="chip" data-rm="mus">${L("กล้ามเดียวกัน", "Same muscle")}</button><button type="button" class="chip" data-rm="eq">${L("อุปกรณ์เดียวกัน", "Same equipment")}</button><button type="button" class="chip" data-rm="all">${L("ทั้งหมด", "All")}</button></div>
       <div class="rp-list"></div>
       <div class="actions sheet-act"><button type="button" class="btn" data-gen-close>${L("ยกเลิก", "Cancel")}</button></div>`,
      b => {
        b.querySelector(".rp-q").addEventListener("input", ev => { q = ev.target.value.trim().toLowerCase(); draw(b); });
        b.querySelectorAll("[data-rm]").forEach(c => c.addEventListener("click", () => { mode = c.dataset.rm; q = ""; b.querySelector(".rp-q").value = ""; draw(b); }));
        draw(b);
      });
  }

  function pick(e, x) {
    if (!x) return;
    const prevRaw = JSON.stringify(draft);
    const orig = origOf(e) || e.id;
    if (hist()) {   // editing a past workout: fix the exercise in this log; its sets move to the new exercise
      const nx = { ...libPick(x), s: e.s, r: e.r };
      const list = draft.historyExercises.some(p => p.id === e.id) ? draft.historyExercises : (draft.extra || []);
      const i = list.findIndex(p => p.id === e.id); if (i < 0) return;
      list[i] = nx;
      draft.ex = draft.ex || {};
      draft.ex[x.id] = (draft.ex[e.id] || []).map(({ kg, reps, ok }) => ({ kg, reps, ok }));
      delete draft.ex[e.id];
      if (draft.memo && draft.memo[e.id] != null) { draft.memo[x.id] = draft.memo[e.id]; delete draft.memo[e.id]; }
      draft.histSwap = draft.histSwap || {};
      const first = draft.histSwap[e.id] || e.n; delete draft.histSwap[e.id];
      if (first !== x.n) draft.histSwap[x.id] = first;
    } else if (!(PROGS[cur].ex || []).some(p => p.id === orig)) {   // an added (extra) exercise: replace it in place
      const i = (draft.extra || []).findIndex(p => p.id === e.id);
      if (i >= 0) draft.extra[i] = { ...libPick(x), s: e.s, r: e.r };
    } else {
      if (!draft.swap || draft.swap.prog !== cur) draft.swap = { prog: cur, map: {} };
      if (x.id === orig) delete draft.swap.map[orig];           // swapped back to the program's own exercise
      else draft.swap.map[orig] = { ...libPick(x), s: e.s, r: e.r, ...(e.main ? { main: 1 } : {}) };
    }
    if (!hist() && draft.ex && !ticked(e)) delete draft.ex[e.id];
    closeGen();
    save("gymdraft", draft);
    // Undo bar: hand the pre-replace draft to undo.js directly (its auto-capture skips edits made while a sheet is open)
    try { if (typeof undoShow === "function") { undoGrp = new Map([["gymdraft", prevRaw]]); undoGrp.loud = true; undoMsg = "⇄ " + t(x.n); setTimeout(() => { undoShow(); const bar = document.getElementById("undo-bar"); if (bar) { bar.classList.add("with-undo"); clearTimeout(bar._t); bar._t = setTimeout(() => { bar.hidden = true; bar.classList.remove("with-undo"); undoLast = null; }, 5000); bar.querySelector("[data-undo]")?.addEventListener("click", () => bar.classList.remove("with-undo"), { once: true }); } }, 0); } } catch (_) {}
    renderEx(); try { updWoBar(); } catch (_) {}
  }

  /* run after every render / page change (pager-fix re-runs on timers, so follow it) */
  const after = fn => function () { const r = fn.apply(this, arguments); try { listify(); } catch (err) { console.error(err); } return r; };
  if (typeof renderEx === "function") renderEx = after(renderEx);
  if (typeof applyPager === "function") { const f = after(window.applyPager); f.__wgFixed = true; window.applyPager = f; }
  if (typeof renderGym === "function") { const g = window.renderGym; window.renderGym = function () { const r = g.apply(this, arguments); setTimeout(listify, 0); setTimeout(listify, 60); return r; }; window.renderGym.__wgFixed = g.__wgFixed; }
  [0, 80, 300, 900, 2100].forEach(ms => setTimeout(listify, ms));
  window.addEventListener("hashchange", () => setTimeout(listify, 80));
  window.woListify = listify;
})();
