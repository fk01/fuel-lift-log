/* rest-ui.js — rest screen redesign (user choice):
   exercise has a demo image → option B: the image fills the screen (dimmed), big countdown + bar at the bottom
   no image                  → option A: big countdown ring, nothing else competing
   Controls are bare labels: −15s · +15s · Skip. Loads after rest-timer.js and wraps startRest(). */
(() => {
  const R = document.getElementById("rest"); if (!R || typeof startRest !== "function") return;
  const L = (th, en) => (typeof lang !== "undefined" && lang === "th" ? th : en);
  const inn = R.querySelector(".rest-in");
  inn.insertAdjacentHTML("beforeend", `
    <div class="rv">
      <div class="rv-next" id="rv-next"></div>
      <div class="rv-ring"><svg viewBox="0 0 220 220" aria-hidden="true"><circle cx="110" cy="110" r="100" fill="none" stroke="rgba(255,255,255,.12)" stroke-width="6"/><circle id="rv-arc" cx="110" cy="110" r="100" fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round" stroke-dasharray="628.3" transform="rotate(-90 110 110)"/></svg><div class="rv-in"><b class="rv-t" data-rvt>0:00</b><small id="rv-of"></small></div></div>
      <b class="rv-t rv-big" data-rvt>0:00</b>
      <div class="rv-bar"><i id="rv-fill"></i></div>
      <div class="rv-ctl"><button type="button" id="rv-minus">−15s</button><button type="button" id="rv-plus">+15s</button><button type="button" id="rv-skip">${L("ข้าม", "Skip")} ›</button></div>
      <div class="rv-up" id="rv-up"></div>
    </div>`);
  const $ = id => document.getElementById(id);
  $("rv-minus").addEventListener("click", () => $("rest-minus").click());
  $("rv-plus").addEventListener("click", () => $("rest-plus").click());
  $("rv-skip").addEventListener("click", () => { try { rt.paused = 0; } catch (_) {} stopRest(); });

  const o = window.startRest;
  window.startRest = function (e, i, rows) {
    const r = o.apply(this, arguments);
    try {
      const ex = sessEx(), k = ex.indexOf(e), more = i + 1 < rows.length;
      const up = more ? e : ex[k + 1], set = more ? i + 2 : 1;
      const nr = more ? rows[i + 1] : ((draft.ex || {})[up?.id] || [])[0];
      const load = nr && nr.kg !== "" && nr.kg != null ? ` · ${toDisp(nr.kg, up?.u)} ${up?.u || "kg"}${nr.reps ? " × " + nr.reps : ""}` : "";
      const img = !R.classList.contains("photo");               // rest-timer.js sets .photo when there is no gif
      R.classList.add("rv-on"); R.classList.toggle("rv-b", img); R.classList.toggle("rv-a", !img);
      $("rv-next").innerHTML = up ? `<small>${L("ถัดไป", "Next")}</small> ${esc(t(up.n))} · ${L("เซ็ต", "Set")} ${set}` : `<small>${L("ครบทุกท่าแล้ว", "All exercises done")}</small>`;
      $("rv-up").innerHTML = up ? `<span class="mut">${L("ถัดไป", "Next")}</span><span>${esc(t(up.n))} · ${L("เซ็ต", "Set")} ${set}${esc(load)}</span>` : "";
      $("rv-of").textContent = `${L("จาก", "of")} ${fmt(rt.total)}`;
      paint();
    } catch (err) { console.error(err); }
    return r;
  };

  function paint() {
    if (R.hidden || !R.classList.contains("rv-on")) return;
    const left = rt.paused ? rt.paused / 1000 : (rt.end - Date.now()) / 1000;
    const f = Math.max(0, Math.min(1, left / (rt.total || 1)));
    document.querySelectorAll("[data-rvt]").forEach(x => { x.textContent = left > 0 ? fmt(left) : L("ไปต่อ!", "Go!"); });
    $("rv-fill").style.width = (1 - f) * 100 + "%";
    $("rv-arc").style.strokeDashoffset = String(628.3 * (1 - f));
    $("rv-of").textContent = `${L("จาก", "of")} ${fmt(rt.total)}`;
  }
  setInterval(paint, 250);
})();
