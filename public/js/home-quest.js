/* home-quest.js — Today, option F (user choice): HP / SP / EXP bars + one timeline of today's quests.
   HP = kcal eaten / goal, SP = protein / target, EXP = days trained this week / challenge goal.
   Quests = every meal of the plan + every planned workout, sorted by time, each with a checkbox (meals) or
   ▶ Start (workouts). A NOW marker shows where the day is. Loads after home.js and wraps renderHome():
   the old train / eat cards stay in the DOM (hidden) so their handlers keep working — rows here click them. */
(() => {
  if (typeof renderHome !== "function") return;
  const L = (th, en) => (typeof lang !== "undefined" && lang === "th" ? th : en);
  const TODH = { am: 7, noon: 12, pm: 18, night: 20 };
  const RANKH = r => ({ 0: 7, 0.5: 9, 1: 12, 1.5: 15, 2: 18, 2.5: 19, 3: 20 })[r] ?? 12;
  const hm = s => { const [h, m] = String(s || "").split(":").map(Number); return (h || 0) + (m || 0) / 60; };
  const hhmm = h => String(Math.floor(h)).padStart(2, "0") + ":" + String(Math.round((h % 1) * 60)).padStart(2, "0");
  const pct = (a, b) => Math.max(0, Math.min(100, b > 0 ? a / b * 100 : 0)).toFixed(0);
  const N = v => (+v || 0).toLocaleString();

  const orig = renderHome;
  window.renderHome = function () { const r = orig.apply(this, arguments); try { quest(); } catch (e) { console.error(e); } return r; };

  function quest() {
    const box = document.getElementById("v-home"); if (!box) return;
    box.classList.add("hq-f");
    box.querySelector(".hq-quest")?.remove();
    const week = typeof homeSeg !== "undefined" && homeSeg === "week";
    box.classList.toggle("hq-f-week", week);

    // ---- numbers (same sums as the old Eat card) ----
    const meals = mealList(), dn = ((food[DAY] || {}).done) || {}, x = logSum(DAY);
    let k = x.k, p = x.p; meals.forEach(m => { if (dn[m.id]) { k += +m.k || 0; p += +m.p || 0; } });
    const kg = typeof K_GOAL !== "undefined" ? K_GOAL : 0, pg = typeof P_TARGET !== "undefined" ? P_TARGET : 0;
    const ch = box.querySelector(".hq-chal small span:last-child"), ex = ch && /(\d+)\s*\/\s*(\d+)/.exec(ch.textContent);
    const bar = (key, lab, a, b, txt) => `<button type="button" class="hqq-b" data-hqq="${key}"><span class="hqq-k">${lab}</span><span class="hqq-t"><i style="width:${pct(a, b)}%"></i></span><span class="hqq-v">${txt}</span></button>`;

    // ---- quests ----
    const items = meals.map(m => ({ kind: "meal", h: hm(m.time), time: m.time, id: m.id, n: t(m.name), sub: +m.k ? `${N(m.k)} kcal · ${+m.p || 0} g` : "", done: !!dn[m.id] }));
    let ks = []; try { ks = planList(); } catch (e) {}
    ks.forEach(q => { const P = PROGS[q]; if (!P) return;
      let h = TODH[P.tod]; if (h == null) { try { h = RANKH(todRank(q)); } catch (e) { h = 12; } }
      const sub = isCardio(P) ? L("คาร์ดิโอ", "Cardio") : nU(P.ex.length, "ท่า");
      items.push({ kind: "train", h, time: P.tod ? hhmm(h) : "", id: q, n: P.name, sub, done: !!planItemDone(q) }); });
    items.sort((a, b) => a.h - b.h || (a.kind === "train") - (b.kind === "train"));
    const done = items.filter(i => i.done).length;
    const now = new Date(), nowH = now.getHours() + now.getMinutes() / 60, today = DAY === TODAY;
    let nowAt = today ? items.findIndex(i => i.h > nowH) : -1; if (today && nowAt < 0) nowAt = items.length;
    const nextAt = items.findIndex((i, j) => !i.done && (!today || j >= nowAt));
    const row = (i, j) => {
      const cls = ["hqq-r", i.done ? "done" : "", j === nextAt ? "next" : "", "q-" + i.kind].filter(Boolean).join(" ");
      const right = i.kind === "meal"
        ? `<button type="button" class="hqq-ck" data-hqm="${i.id}" aria-pressed="${i.done}" aria-label="${esc(i.n)}"></button>`
        : i.done ? `<span class="hqq-ok">✓</span>` : `<button type="button" class="hqq-go" data-hqs="${i.id}">▶ ${L("เริ่ม", "Start")}</button>`;
      return `<div class="${cls}"><span class="hqq-tm">${i.time || ""}</span><span class="hqq-mid"${i.kind === "train" ? ` data-hqp="${i.id}"` : ` data-hqm="${i.id}"`}><b>${esc(i.n)}</b>${i.sub ? `<small>${i.sub}</small>` : ""}</span>${right}</div>`;
    };
    let rows = items.map(row);
    if (today && items.length) rows.splice(nowAt, 0, `<div class="hqq-now">${L("ตอนนี้", "NOW")} ${hhmm(nowH)}</div>`);
    const rest = !ks.length && typeof dayMode === "function" && dayMode() === "rest";
    if (rest && box.querySelector("[data-anyway]")) rows.push(`<div class="hqq-r rest"><span class="hqq-tm"></span><span class="hqq-mid"><b>${L("วันพัก", "Rest day")}</b></span><button type="button" class="hqq-go" data-hqany>${L("ออกกำลังอยู่ดี", "Train anyway")} ›</button></div>`);

    const sec = document.createElement("section"); sec.className = "hq-quest";
    sec.innerHTML = `<div class="hqq-bars">${bar("hp", "HP", k, kg, `${N(k)}/${N(kg)}`)}${bar("sp", "SP", p, pg, `${p}/${pg} g`)}${ex ? bar("exp", "EXP", +ex[1], +ex[2], `${ex[1]}/${ex[2]} ${L("สัปดาห์", "week")}`) : ""}</div>
      ${week ? "" : `<div class="hqq-h"><span>${L("ภารกิจวันนี้", "Today's quests")} · ${done}/${items.length}</span></div>
      <div class="hqq-tl">${rows.join("")}</div>
      <button type="button" class="hqq-other">+ ${L("กินอย่างอื่น", "Ate something else")}</button>`}`;
    (box.querySelector("#home-cal") || box.firstElementChild).after(sec);

    // ---- actions: reuse the hidden originals where they exist ----
    const orig = s => box.querySelector(s);
    sec.querySelector('[data-hqq="hp"]').addEventListener("click", () => { location.hash = "food"; });
    sec.querySelector('[data-hqq="sp"]').addEventListener("click", () => { location.hash = "food"; });
    sec.querySelector('[data-hqq="exp"]')?.addEventListener("click", () => orig(".hq-chal")?.click());
    sec.querySelectorAll("[data-hqm]").forEach(b => b.addEventListener("click", () => {
      if (!food[DAY]) food[DAY] = { done: {}, tags: {} };
      const d = food[DAY].done = food[DAY].done || {}, id = b.dataset.hqm;
      if (d[id]) delete d[id]; else d[id] = true;
      save("mealcheck", food); renderHome();
    }));
    sec.querySelectorAll("[data-hqs]").forEach(b => b.addEventListener("click", () => {
      const o = orig(`[data-start="${b.dataset.hqs}"]`); if (o) { o.click(); return; }
      location.hash = "gym"; try { startPlanItem(b.dataset.hqs, true); } catch (e) { console.error(e); }
    }));
    sec.querySelectorAll("[data-hqp]").forEach(b => b.addEventListener("click", () => { const o = orig(`[data-prev="${b.dataset.hqp}"]`); if (o) o.click(); else location.hash = "gym"; }));
    sec.querySelector("[data-hqany]")?.addEventListener("click", () => orig("[data-anyway]")?.click());
    sec.querySelector(".hqq-other")?.addEventListener("click", () => { const o = orig("[data-other]"); if (o) o.click(); else { location.hash = "food"; setTimeout(() => { try { openFoodLog(null); } catch (e) {} }, 80); } });
  }
  try { if (document.getElementById("v-home")) quest(); } catch (e) {}
})();
