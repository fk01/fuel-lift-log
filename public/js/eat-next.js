/* eat-next.js — Eat tab, option B (user choice): the next meal is one glass card with its full food list and
   "✓ Ate it"; every other meal is one line (tap ⌄ to see its foods and tick it). 0-kcal vitamins fold into the
   meal before them and are ticked with it. Loads after food.js and replaces renderNourish(). */
(() => {
  if (typeof renderNourish !== "function") return;
  const L = (th, en) => (typeof lang !== "undefined" && lang === "th" ? th : en);
  const hm = s => { const [h, m] = String(s || "").split(":").map(Number); return (h || 0) + (m || 0) / 60; };
  const open = new Set();

  window.renderNourish = function () {
    const box = document.getElementById("meals"); if (!box) return;
    let v = document.getElementById("nourish"); if (!v) { v = document.createElement("section"); v.id = "nourish"; box.before(v); }
    try { macroTiles(); } catch (e) {}
    const view = document.getElementById("v-food"); view?.classList.add("eat-b");
    const fa = document.getElementById("food-add"); if (fa) view.append(fa);          // park it: innerHTML below would destroy it

    // meals by time, vitamins folded into the meal before them
    const groups = []; mealList().slice().sort((a, b) => hm(a.time) - hm(b.time)).forEach(m => {
      const g = groups[groups.length - 1]; if (m.vit && g) g.vit.push(m); else groups.push({ m, vit: [] });
    });
    const isDone = g => mealDone(g.m.id);
    const next = groups.find(g => !isDone(g) && !g.m.vit) || null;
    const mac = m => [+m.k > 0 ? `${m.k} kcal` : "", +m.p > 0 ? `P ${m.p}` : "", +m.c > 0 ? `C ${m.c}` : "", +m.f > 0 ? `F ${m.f}` : ""].filter(Boolean).join(" · ");
    const items = g => [...(g.m.items || []), ...g.vit.flatMap(x => x.items && x.items.length ? x.items : [x.name])].filter(Boolean);
    const ids = g => [g.m.id, ...g.vit.map(x => x.id)].join(",");
    const list = g => { const its = items(g); return its.length ? `<ul class="en-items">${its.map(x => `<li>${esc(t(x))}</li>`).join("")}</ul>` : ""; };

    const hero = next ? `<div class="en-hero"><span class="en-tag">${L("ถัดไป", "Next")} · ${esc(next.m.time || "")}</span>
        <b class="en-nm">${esc(t(next.m.name))}</b><small class="en-mac">${mac(next.m)}${next.vit.length ? ` · + ${L("วิตามิน", "vitamins")}` : ""}</small>${list(next)}
        <div class="en-act"><button type="button" class="en-chg" data-en-plan>${L("เปลี่ยนเมนู", "Change")} ›</button><button type="button" class="en-ok" data-en-tick="${ids(next)}">✓ ${L("กินแล้ว", "Ate it")}</button></div></div>`
      : `<div class="en-hero en-all"><b class="en-nm">${L("ครบทุกมื้อแล้ว", "All meals done")}</b><small class="en-mac">${L("เก่งมาก", "Nice work")}</small></div>`;
    const rest = groups.filter(g => g !== next);
    const row = g => { const on = isDone(g), op = open.has(g.m.id);
      return `<div class="en-row${on ? " done" : ""}${op ? " open" : ""}"><button type="button" class="en-line" data-en-open="${esc(g.m.id)}" aria-expanded="${op}">
        <span class="en-t"><b>${on ? "✓ " : ""}${esc(t(g.m.name))} · ${esc(g.m.time || "")}</b><small>${[+g.m.k > 0 ? `${g.m.k} kcal` : "", g.vit.length ? `+ ${L("วิตามิน", "vitamins")}` : ""].filter(Boolean).join(" · ")}</small></span><span class="en-chev">⌄</span></button>
        ${op ? `<div class="en-more"><small class="en-mac">${mac(g.m)}</small>${list(g)}<button type="button" class="en-ok sm" data-en-tick="${ids(g)}">${on ? L("ยังไม่ได้กิน", "Not eaten") : "✓ " + L("กินแล้ว", "Ate it")}</button></div>` : ""}</div>`; };
    const done = groups.filter(isDone).length;
    v.innerHTML = `${hero}<div class="en-h dm-h"><span>${L("มื้อที่เหลือวันนี้", "Rest of today")} · ${done}/${groups.length}</span><span class="dm-slot"></span></div>${rest.map(row).join("")}`;
    if (fa) v.querySelector(".dm-slot").append(fa);
    const pr = document.querySelector("#v-food .mp-open-row"); if (pr && v.nextElementSibling !== pr) v.after(pr);   // plan line goes under the list

    v.querySelectorAll("[data-en-tick]").forEach(b => b.addEventListener("click", e => { e.stopPropagation();
      const list = b.dataset.enTick.split(","), on = !mealDone(list[0]);
      list.forEach(id => { if (mealDone(id) !== on) mealTick(id); });                 // the hidden checkbox list does the saving + re-render
    }));
    v.querySelectorAll("[data-en-open]").forEach(b => b.addEventListener("click", () => { const id = b.dataset.enOpen; open.has(id) ? open.delete(id) : open.add(id); renderNourish(); }));
    v.querySelector("[data-en-plan]")?.addEventListener("click", () => document.getElementById("mp-open")?.click());
  };
  try { if (document.getElementById("nourish")) renderNourish(); } catch (e) {}
})();
