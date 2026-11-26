/* home-quest.js — Today, option P4 (user choice): two groups, no game bars.
   TRAIN = every planned program (place · time, first exercises, ▶ Start / ✓).
   EAT = meals by time with checkboxes (0-kcal vitamins fold into the meal before them), NOW marker, kcal total.
   MY BODY = the existing body card. Loads after home.js and wraps renderHome():
   the old train / eat cards stay in the DOM (hidden) so their handlers keep working — rows here click them. */
(() => {
  if (typeof renderHome !== "function") return;
  const L = (th, en) => (typeof lang !== "undefined" && lang === "th" ? th : en);
  const TODH = { am: 7, noon: 12, pm: 18, night: 20 };
  const RANKH = r => ({ 0: 7, 0.5: 9, 1: 12, 1.5: 15, 2: 18, 2.5: 19, 3: 20 })[r] ?? 12;
  const hm = s => { const [h, m] = String(s || "").split(":").map(Number); return (h || 0) + (m || 0) / 60; };
  const hhmm = h => String(Math.floor(h)).padStart(2, "0") + ":" + String(Math.round((h % 1) * 60)).padStart(2, "0");
  const N = v => (+v || 0).toLocaleString();

  const orig = renderHome;
  window.renderHome = function () { const r = orig.apply(this, arguments); try { quest(); } catch (e) { console.error(e); } return r; };

  function quest() {
    const box = document.getElementById("v-home"); if (!box) return;
    box.classList.add("hq-f");
    box.querySelector(".hq-quest")?.remove();
    const week = typeof homeSeg !== "undefined" && homeSeg === "week";
    box.classList.toggle("hq-f-week", week);
    const now = new Date(), nowH = now.getHours() + now.getMinutes() / 60, today = DAY === TODAY;

    // ---- TRAIN: every planned program, by time ----
    let ks = []; try { ks = planList(); } catch (e) {}
    const train = ks.filter(q => PROGS[q]).map(q => { const P = PROGS[q];
      let h = TODH[P.tod]; if (h == null) { try { h = RANKH(todRank(q)); } catch (e) { h = 12; } }
      let loc = ""; try { const Lc = locById(locOf(P) === "*" ? P.lastLoc : locOf(P)); if (Lc) loc = t(Lc.name); } catch (e) {}
      const names = isCardio(P) ? [] : (P.ex || []).map(e => { try { return exOf(e.id).n || e.n; } catch (_) { return e.n; } }).filter(Boolean);
      const sub = isCardio(P) ? L("คาร์ดิโอ", "Cardio") : names.slice(0, 3).join(" · ") + (names.length > 3 ? ` · +${names.length - 3}` : "");
      return { id: q, h, n: P.name, head: [loc, P.tod ? hhmm(h) : ""].filter(Boolean).join(" · "), sub, done: !!planItemDone(q) }; })
      .sort((a, b) => a.h - b.h);
    const tRow = i => `<div class="hqq-tr${i.done ? " done" : ""}"><span class="hqq-mid" data-hqp="${i.id}"><span><b>${esc(i.n)}</b>${i.head ? ` <span class="hqq-at">· ${esc(i.head)}</span>` : ""}</span>${i.sub ? `<small>${esc(i.sub)}</small>` : ""}</span>${i.done ? `<span class="hqq-ok">✓</span>` : `<button type="button" class="hqq-go" data-hqs="${i.id}">▶ ${L("เริ่ม", "Start")}</button>`}</div>`;
    const rest = !ks.length && typeof dayMode === "function" && dayMode() === "rest";
    let tHtml = train.map(tRow).join("");
    if (!train.length) tHtml = `<div class="hqq-tr"><span class="hqq-mid"><b>${rest ? L("วันพัก", "Rest day") : L("ไม่มีโปรแกรมวันนี้", "Nothing planned")}</b></span>${box.querySelector("[data-anyway]") ? `<button type="button" class="hqq-go" data-hqany>${L("ออกกำลังอยู่ดี", "Train anyway")} ›</button>` : `<button type="button" class="hqq-go" data-hqgym>${L("เลือกโปรแกรม", "Pick")} ›</button>`}</div>`;

    // ---- EAT: meals by time; 0-kcal vitamins fold into the meal before them ----
    const meals = mealList(), dn = ((food[DAY] || {}).done) || {}, x = logSum(DAY);
    let k = x.k; meals.forEach(m => { if (dn[m.id]) k += +m.k || 0; });
    const kg = typeof K_GOAL !== "undefined" ? K_GOAL : 0;
    const groups = []; meals.slice().sort((a, b) => hm(a.time) - hm(b.time)).forEach(m => {
      const g = groups[groups.length - 1];
      if (m.vit && g) g.vit.push(m.id); else groups.push({ m, vit: [] });
    });
    const items = groups.map(({ m, vit }) => ({ id: m.id, ids: [m.id, ...vit], h: hm(m.time), time: m.time, n: t(m.name),
      sub: [+m.k ? `${N(m.k)} kcal · ${+m.p || 0} g` : "", vit.length ? `+ ${L("วิตามิน", "vitamins")}` : ""].filter(Boolean).join(" · "), done: !!dn[m.id] }));
    const mDone = items.filter(i => i.done).length;
    let nowAt = today ? items.findIndex(i => i.h > nowH) : -1; if (today && nowAt < 0) nowAt = items.length;
    const nextAt = items.findIndex((i, j) => !i.done && (!today || j >= nowAt));
    const row = (i, j) => `<div class="hqq-r q-meal${i.done ? " done" : ""}${j === nextAt ? " next" : ""}"><span class="hqq-tm">${i.time || ""}</span><span class="hqq-mid" data-hqm="${i.ids.join(",")}"><b>${esc(i.n)}</b>${i.sub ? `<small>${i.sub}</small>` : ""}</span><button type="button" class="hqq-ck" data-hqm="${i.ids.join(",")}" aria-pressed="${i.done}" aria-label="${esc(i.n)}"></button></div>`;
    const rows = items.map(row);
    if (today && items.length) rows.splice(nowAt, 0, `<div class="hqq-now">${L("ตอนนี้", "NOW")} ${hhmm(nowH)}</div>`);

    const sec = document.createElement("section"); sec.className = "hq-quest";
    sec.innerHTML = week ? "" : `<div class="hqq-h">${L("ออกกำลัง", "Train")} · ${train.filter(i => i.done).length}/${train.length}</div>
      <div class="hqq-train">${tHtml}</div>
      <div class="hqq-h">${L("กิน", "Eat")} · ${mDone}/${items.length}<span class="hqq-kc" data-hqfood>${N(k)} / ${N(kg)} kcal ›</span></div>
      <div class="hqq-tl">${rows.join("")}</div>
      <button type="button" class="hqq-other">+ ${L("กินอย่างอื่น", "Ate something else")}</button>`;
    (box.querySelector("#home-cal") || box.firstElementChild).after(sec);
    // body card = "My body" section header
    const bq = box.querySelector(".hq-body .hq-q"); if (bq) bq.textContent = L("ร่างกาย", "My body");

    // ---- actions: reuse the hidden originals where they exist ----
    const orig = s => box.querySelector(s);
    sec.querySelector("[data-hqfood]")?.addEventListener("click", () => { location.hash = "food"; });
    sec.querySelectorAll("[data-hqm]").forEach(b => b.addEventListener("click", () => {
      if (!food[DAY]) food[DAY] = { done: {}, tags: {} };
      const d = food[DAY].done = food[DAY].done || {}, ids = b.dataset.hqm.split(","), on = !d[ids[0]];
      ids.forEach(id => { if (on) d[id] = true; else delete d[id]; });
      save("mealcheck", food); renderHome();
    }));
    sec.querySelectorAll("[data-hqs]").forEach(b => b.addEventListener("click", () => {
      const o = orig(`[data-start="${b.dataset.hqs}"]`); if (o) { o.click(); return; }
      location.hash = "gym"; try { startPlanItem(b.dataset.hqs, true); } catch (e) { console.error(e); }
    }));
    sec.querySelectorAll("[data-hqp]").forEach(b => b.addEventListener("click", () => { const o = orig(`[data-prev="${b.dataset.hqp}"]`); if (o) o.click(); else location.hash = "gym"; }));
    sec.querySelector("[data-hqany]")?.addEventListener("click", () => orig("[data-anyway]")?.click());
    sec.querySelector("[data-hqgym]")?.addEventListener("click", () => { location.hash = "gym"; });
    sec.querySelector(".hqq-other")?.addEventListener("click", () => { const o = orig("[data-other]"); if (o) o.click(); else { location.hash = "food"; setTimeout(() => { try { openFoodLog(null); } catch (e) {} }, 80); } });
  }
  try { if (document.getElementById("v-home")) quest(); } catch (e) {}
})();
