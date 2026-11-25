// workout.js — restored loader (temporary) then inlined critical pager fix
// Loads last known-good workout module, then applies active-workout pager fixes.
(function(){
  const GOOD = "https://raw.githubusercontent.com/fk01/fuel-lift-log/89ac7cbcdd31e8804eb99ebdcbcfe6d883b114a2/public/js/workout.js";
  const s = document.createElement("script");
  s.src = GOOD + "?t=" + Date.now();
  s.onload = function(){
    try {
      // Ensure one exercise card is always visible after render
      const _ap = window.applyPager;
      if (typeof _ap === "function") {
        window.applyPager = function(){
          const box = document.getElementById("exs"); if (!box) return;
          const cards = [...box.querySelectorAll(":scope>.ex")];
          box.querySelector(".wo-pager")?.remove();
          const on = typeof picked !== "undefined" && picked && !(typeof editing !== "undefined" && editing) && cards.length > 1;
          box.classList.toggle("paged", on);
          cards.forEach(c => c.classList.remove("pg-on"));
          if (!cards.length) return;
          if (typeof woIdx === "undefined") window.woIdx = 0;
          woIdx = Math.max(0, Math.min(cards.length - 1, +woIdx || 0));
          cards[woIdx].classList.add("pg-on");
          if (!on) { box.classList.remove("paged"); return; }
          const ex = (typeof sessEx === "function" ? sessEx() : []);
          const done = r => ((draft.ex || {})[r.id] || []).every(x => x.ok);
          const nav = document.createElement("div"); nav.className = "wo-pager";
          nav.innerHTML = `<button class="btn sm" data-pg="-1" aria-label="prev">‹</button><span class="pg-mid"><small>${woIdx+1}/${cards.length}</small><span class="pg-dots">${ex.map((x,i)=>`<i class="${i===woIdx?"cur":done(x)?"ok":""}"></i>`).join("")}</span></span><button class="btn sm" data-pg="1" aria-label="next">›</button>`;
          cards[0].before(nav);
          nav.querySelectorAll("[data-pg]").forEach(b => b.addEventListener("click", () => goEx(woIdx + +b.dataset.pg)));
        };
      }
      // Force-show pager that mock CSS hid
      if (!document.getElementById("wo-pager-fix")) {
        const st = document.createElement("style");
        st.id = "wo-pager-fix";
        st.textContent = `#v-gym .wo-pager{display:flex!important}#v-gym #exs.paged .wo-pager{display:flex!important;align-items:center;justify-content:space-between;gap:10px;margin:0 0 10px}#v-gym #exs.paged .wo-pager .btn{min-width:48px;min-height:44px;border-radius:14px;background:rgba(255,255,255,.08)!important;border:1px solid rgba(255,255,255,.16)!important;color:#fff!important;font-size:20px}#exs.paged>.ex.pg-on{display:block!important}#exs.paged>.ex:not(.pg-on){display:none!important}#v-gym #step3{overflow-x:hidden;overflow-y:visible}`;
        document.head.appendChild(st);
      }
      if (typeof renderGym === "function") try { renderGym(); } catch (e) {}
    } catch (e) { console.error("workout pager patch", e); }
  };
  s.onerror = function(){ console.error("Failed to load workout.js from good commit"); };
  document.head.appendChild(s);
})();
