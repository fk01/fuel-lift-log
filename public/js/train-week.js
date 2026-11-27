/* train-week.js — Train tab, option G (user choice): the whole week as rows (Mon → Sun).
   Today's row opens as a glass card: the program's exercises (sets × reps · last weight), a place / program
   switch when today has more than one, ▶ Start, Rest today, Change today. Other days: tap to see the
   exercises; ⇄ edits which programs are on that weekday (the weekly schedule = each program's days).
   All programs fold under one line. Loads after locations.js and wraps renderPlan(); the original
   rows stay in the DOM (hidden) so the existing handlers keep working. */
(() => {
  if (typeof renderPlan !== "function") return;
  const L = (th, en) => (typeof lang !== "undefined" && lang === "th" ? th : en);
  const DN = [["อา", "Sun"], ["จ", "Mon"], ["อ", "Tue"], ["พ", "Wed"], ["พฤ", "Thu"], ["ศ", "Fri"], ["ส", "Sat"]];
  const dayName = ds => L(...DN[new Date(ds + "T12:00:00").getDay()]);
  const placeOf = k => { try { const P = PROGS[k], l = locById(locOf(P) === "*" ? P.lastLoc : locOf(P)); return l ? t(l.name) : ""; } catch (e) { return ""; } };
  const exN = e => { try { return exOf(e.id).n || e.n; } catch (_) { return e.n || e.id; } };
  const lastKg = id => { for (let i = logs.length - 1; i >= 0; i--) { const s = (logs[i].ex || {})[id]; if (s && s.length) { const m = Math.max(...s.map(q => +q.kg || 0)); return m > 0 ? m : null; } } return null; };
  let open = null, pickK = null, allOpen = false;

  const orig = renderPlan;
  window.renderPlan = function (box) { const r = orig.apply(this, arguments); try { week(box); } catch (e) { console.error(e); } return r; };

  function week(box) {
    box.classList.add("tw-on");
    box.querySelector(".tw")?.remove();
    const today = TODAY, base = new Date(today + "T12:00:00"), off = (base.getDay() + 6) % 7;
    const days = [...Array(7)].map((_, i) => { const d = new Date(base); d.setDate(base.getDate() - off + i); return dkey(d); });
    const tKs = (() => { const ks = planList().slice(); if (picked && cur && PROGS[cur] && cur !== "free" && !ks.includes(cur) && !planItemDone(cur)) ks.unshift(cur); return ks; })();
    const resting = dayMode() === "rest";
    const doneOn = ds => [...new Set(logs.filter(l => l.date === ds).map(l => l.prog))].filter(Boolean);
    const progsOn = ds => ds === today ? tKs : planKeys(ds);
    const nm = k => esc((PROGS[k] && PROGS[k].name) || k);
    const names = ks => [...new Set(ks.map(nm))].join(" · ");
    const sub = k => { const P = PROGS[k]; if (!P) return ""; return isCardio(P) ? L("คาร์ดิโอ", "Cardio") : `${nU(P.ex.length, "ท่า")} · ~${P.ex.length * 6} ${t("นาที")}`; };
    const exList = (k, max) => { const P = PROGS[k]; if (!P || isCardio(P)) return ""; const ex = P.ex || [];
      return `<div class="tw-ex">${ex.slice(0, max).map(e => { const kg = lastKg(e.id); return `<div><span>${esc(exN(e))}</span><span>${e.s || 3}×${esc(String(e.r || "8-12"))}${kg ? ` · ${kg}` : ""}</span></div>`; }).join("")}${ex.length > max ? `<div class="tw-more">+${ex.length - max} ${L("ท่า", "more")}</div>` : ""}</div>`; };
    const doneCnt = days.filter(ds => ds <= today && (doneOn(ds).length || cxAny(ds))).length;
    const plannedCnt = days.filter(ds => progsOn(ds).length).length;

    const todayCard = () => {
      if (resting) return `<div class="tw-card"><div class="tw-ch"><span class="tw-d">${dayName(today)}</span><b>${L("พักวันนี้", "Rest day")}</b></div>
        <small class="tw-s">${L("ให้กล้ามได้ฟื้น — พรุ่งนี้กลับมาใหม่", "Let your muscles recover — back tomorrow")}</small>
        <div class="tw-act"><span></span><button type="button" class="tw-go" data-tw="unrest">${L("ออกกำลังแทน", "Train instead")} ›</button></div></div>`;
      if (!tKs.length) return `<div class="tw-card"><div class="tw-ch"><span class="tw-d">${dayName(today)}</span><b>${L("ยังไม่มีแผน", "Nothing planned")}</b></div>
        <div class="tw-act"><button type="button" class="tw-lnk" data-tw="rest">${L("พักวันนี้", "Rest today")}</button><button type="button" class="tw-go" data-tw="add">+ ${L("เพิ่มเข้าวันนี้", "Add to today")}</button></div></div>`;
      const lead = tKs.find(inProg) || tKs.find(q => !planItemDone(q) && !isCardio(PROGS[q])) || tKs.find(q => !planItemDone(q)) || tKs[0];
      const k = tKs.includes(pickK) ? pickK : lead, P = PROGS[k], v = planItemDone(k), ip = inProg(k);
      const sameName = tKs.filter(q => PROGS[q] && PROGS[q].name === P.name);
      const tabs = tKs.length > 1 ? `<span class="tw-tabs">${tKs.map(q => `<button type="button" data-twk="${esc(q)}" aria-pressed="${q === k}">${sameName.length > 1 && PROGS[q].name === P.name ? esc(placeOf(q)) : nm(q)}${planItemDone(q) ? " ✓" : ""}</button>`).join("")}</span>` : "";
      const go = v ? `<button type="button" class="tw-go" data-tw="done" data-k="${esc(k)}">✓ ${L("เสร็จแล้ว", "Done")} ›</button>`
        : ip ? `<button type="button" class="tw-go" data-tw="resume">▶ ${L("กลับไปเล่น", "Resume")}</button>`
        : `<button type="button" class="tw-go" data-tw="start" data-k="${esc(k)}">▶ ${isCardio(P) ? L("บันทึก", "Log") : L("เริ่ม", "Start")}</button>`;
      return `<div class="tw-card"><div class="tw-ch"><span class="tw-d">${dayName(today)}</span><b data-tw="prev" data-k="${esc(k)}">${nm(k)}</b>${placeOf(k) ? `<span class="tw-pl">· ${esc(placeOf(k))}</span>` : ""}</div>${tabs}
        <small class="tw-s">${v ? esc(planSummary(k, v)) : sub(k)}</small>${v ? "" : exList(k, 5)}
        <div class="tw-act"><span class="tw-l2"><button type="button" class="tw-lnk" data-tw="rest">${L("พักวันนี้", "Rest today")}</button><button type="button" class="tw-lnk" data-tw="add">${L("เปลี่ยนวันนี้", "Change today")}</button></span>${go}</div></div>`;
    };
    const row = ds => {
      if (ds === today) return todayCard();
      const past = ds < today, done = doneOn(ds), cx = cxAny(ds), ks = progsOn(ds), op = open === ds;
      let title, s, mark;
      if (past) {
        if (done.length || cx) { title = names(done) || L("คาร์ดิโอ", "Cardio"); s = "✓ " + L("เสร็จแล้ว", "done"); mark = `<span class="tw-ok">✓</span>`; }
        else { title = ks.length ? names(ks) : L("พัก", "Rest"); s = ks.length ? L("ไม่ได้เล่น", "missed") : ""; mark = ""; }
      } else { title = ks.length ? names(ks) : L("พัก", "Rest"); s = ks.length === 1 ? [placeOf(ks[0]), sub(ks[0])].filter(Boolean).join(" · ") : ks.length ? [...new Set(ks.map(placeOf).filter(Boolean))].join(" · ") : ""; mark = `<button type="button" class="tw-sw" data-twsw="${ds}" aria-label="${L("เปลี่ยนโปรแกรมวัน", "Change programs on")} ${dayName(ds)}">${ks.length ? "⇄" : "+"}</button>`; }
      const body = op && !past && ks.length ? `<div class="tw-open">${ks.map(k => `<div class="tw-ob"><b>${nm(k)}</b> <small>${esc(placeOf(k))}</small>${exList(k, 8)}</div>`).join("")}</div>` : "";
      return `<div class="tw-row${past ? " past" : ""}${op ? " open" : ""}${!ks.length && !done.length && !cx ? " tw-rest" : ""}"><button type="button" class="tw-line" data-twopen="${ds}"><span class="tw-d">${dayName(ds)}</span><span class="tw-t"><b>${title}</b>${s ? `<small>${esc(s)}</small>` : ""}</span></button>${mark}${body}</div>`;
    };
    const all = Object.keys(PROGS).filter(k => k !== "free" && PROGS[k] && (PROGS[k].ex || isCardio(PROGS[k])));
    const byPlace = {}; all.forEach(k => { const p = isCardio(PROGS[k]) && locOf(PROGS[k]) === "*" ? L("ทุกที่", "Anywhere") : placeOf(k) || "?"; byPlace[p] = (byPlace[p] || 0) + 1; });

    const sec = document.createElement("section"); sec.className = "tw";
    sec.innerHTML = `<div class="tw-h"><span>${L("สัปดาห์นี้", "This week")} · ${doneCnt}/${plannedCnt}</span></div>${days.map(row).join("")}
      <div class="tw-h tw-allh"><span>${L("โปรแกรมทั้งหมด", "All programs")} · ${all.length}</span><button type="button" class="tw-man" data-tw="manage">${L("จัดการ", "Manage")} ›</button></div>
      <button type="button" class="tw-line tw-all" data-tw="all" aria-expanded="${allOpen}"><span class="tw-t"><small>${Object.entries(byPlace).map(([p, n]) => `${esc(p)} ${n}`).join(" · ")}</small></span><span class="tw-chev">⌄</span></button>`;
    const anchor = box.querySelector(".pl-h") || box.querySelector(".pl-allh"); (anchor || box.lastElementChild).before(sec);
    box.classList.toggle("tw-allopen", allOpen);
    const pl = box.querySelector(".pl-all"); if (pl) sec.after(pl);        // the original program list shows only when unfolded

    const again = () => { try { renderGym(); } catch (e) { week(box); } };
    sec.querySelectorAll("[data-twk]").forEach(b => b.addEventListener("click", () => { pickK = b.dataset.twk; week(box); }));
    sec.querySelectorAll("[data-twopen]").forEach(b => b.addEventListener("click", () => { const ds = b.dataset.twopen; if (ds === today) return; open = open === ds ? null : ds; week(box); }));
    sec.querySelectorAll("[data-twsw]").forEach(b => b.addEventListener("click", e => { e.stopPropagation(); editDay(b.dataset.twsw); }));
    sec.querySelectorAll("[data-tw]").forEach(b => b.addEventListener("click", e => { const a = b.dataset.tw, k = b.dataset.k;
      if (a === "start") startPlanItem(k, true);
      else if (a === "resume") { setDayMode("train"); renderGym(); setTimeout(() => document.getElementById("step3")?.scrollIntoView({ block: "start" }), 50); }
      else if (a === "done") openDoneItem(k);
      else if (a === "prev") openPlanItem(k);
      else if (a === "rest") { setDayMode("rest"); renderGym(); }
      else if (a === "unrest") { setDayMode(null); renderGym(); }
      else if (a === "add") { window._sheetFrom = e.currentTarget; openPlanAdd(); }
      else if (a === "manage") box.querySelector("[data-plmine]")?.click();
      else if (a === "all") { allOpen = !allOpen; week(box); }
    }));

    // ⇄ on a weekday: which programs are on it (writes each program's days = the weekly schedule)
    function editDay(ds) {
      const wd = new Date(ds + "T12:00:00").getDay(), on = new Set(all.filter(k => daysOf(k).includes(wd)));
      openGen(`${L("ตาราง", "Schedule")} · ${dayName(ds)}`, `<div class="tw-ed">${all.map(k => `<button type="button" class="tw-edr" data-twe="${esc(k)}" aria-pressed="${on.has(k)}"><span class="tw-t"><b>${nm(k)}</b><small>${esc([placeOf(k), sub(k)].filter(Boolean).join(" · "))}</small></span><span class="tw-ck"></span></button>`).join("")}
        <small class="tw-note">${L("ใช้ทุกสัปดาห์ — เหมือนเลือกวันใน Edit program", "Repeats every week — same as the days in Edit program")}</small>
        <div class="actions sheet-act"><button type="button" class="btn" data-gen-close>${L("ยกเลิก", "Cancel")}</button><button type="button" class="btn primary" data-twsave>✓ ${L("บันทึก", "Save")}</button></div></div>`, g => {
        g.querySelectorAll("[data-twe]").forEach(r => r.addEventListener("click", () => { const k = r.dataset.twe; on.has(k) ? on.delete(k) : on.add(k); r.setAttribute("aria-pressed", String(on.has(k))); }));
        g.querySelector("[data-twsave]").addEventListener("click", () => {
          all.forEach(k => { const d = new Set(daysOf(k)), had = d.has(wd); if (on.has(k) === had) return; on.has(k) ? d.add(wd) : d.delete(wd); PROGS[k].days = [...d].sort(); });
          saveProgs(); closeGen(); again(); toast("✓ " + L("บันทึกตารางแล้ว", "Schedule saved"));
        });
      });
    }
  }
})();
