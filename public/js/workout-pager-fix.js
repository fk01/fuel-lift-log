/* workout-pager-fix.js — hard fix for blank active workout + hidden pager */
(function () {
  function injectCSS() {
    if (document.getElementById("wo-pager-fix")) return;
    var st = document.createElement("style");
    st.id = "wo-pager-fix";
    st.textContent = [
      "#v-gym .wo-pager{display:flex!important}",
      "#v-gym #exs.paged .wo-pager{display:flex!important;align-items:center;justify-content:space-between;gap:10px;margin:0 0 12px;padding:8px 4px}",
      "#v-gym #exs.paged .wo-pager .btn{min-width:48px;min-height:44px;border-radius:14px;background:rgba(255,255,255,.10)!important;border:1px solid rgba(255,255,255,.18)!important;color:#fff!important;font-size:22px;font-weight:700}",
      "#v-gym #exs.paged .wo-pager .pg-mid{color:rgba(255,255,255,.75);text-align:center}",
      "#v-gym #exs.paged .wo-pager .pg-dots{display:flex;gap:5px;justify-content:center;margin-top:4px}",
      "#v-gym #exs.paged .wo-pager .pg-dots i{width:6px;height:6px;border-radius:50%;background:rgba(255,255,255,.25);display:inline-block}",
      "#v-gym #exs.paged .wo-pager .pg-dots i.cur{background:#fff}",
      "#v-gym #exs.paged .wo-pager .pg-dots i.ok{background:rgba(255,255,255,.55)}",
      "#exs.paged>.ex.pg-on{display:block!important}",
      "#exs.paged>.ex:not(.pg-on){display:none!important}",
      "#v-gym #step3{overflow-x:hidden;overflow-y:visible}"
    ].join("");
    document.head.appendChild(st);
  }

  function forceVisibleCard() {
    var box = document.getElementById("exs");
    if (!box) return;
    var cards = [].slice.call(box.querySelectorAll(":scope > .ex"));
    if (!cards.length) return;
    if (typeof woIdx === "undefined" || woIdx == null) window.woIdx = 0;
    woIdx = Math.max(0, Math.min(cards.length - 1, +woIdx || 0));
    if (box.classList.contains("paged") || (typeof picked !== "undefined" && picked && cards.length > 1)) {
      box.classList.add("paged");
      cards.forEach(function (c) { c.classList.remove("pg-on"); });
      cards[woIdx].classList.add("pg-on");
    } else {
      cards.forEach(function (c) { c.classList.add("pg-on"); });
    }
  }

  function patchApplyPager() {
    if (typeof applyPager !== "function") return false;
    if (applyPager.__wgFixed) return true;
    var original = applyPager;
    window.applyPager = function () {
      try { original.apply(this, arguments); } catch (e) { console.error(e); }
      forceVisibleCard();
      var box = document.getElementById("exs");
      if (!box || !box.classList.contains("paged")) return;
      if (box.querySelector(".wo-pager")) return;
      var cards = [].slice.call(box.querySelectorAll(":scope > .ex"));
      if (cards.length < 2) return;
      var ex = typeof sessEx === "function" ? sessEx() : [];
      var done = function (r) {
        return ((typeof draft !== "undefined" && draft.ex || {})[r.id] || []).every(function (x) { return x.ok; });
      };
      var nav = document.createElement("div");
      nav.className = "wo-pager";
      nav.innerHTML =
        '<button type="button" class="btn sm" data-pg="-1" aria-label="prev">‹</button>' +
        '<span class="pg-mid"><small>' + (woIdx + 1) + "/" + cards.length + "</small>" +
        '<span class="pg-dots">' +
        ex.map(function (x, i) {
          return '<i class="' + (i === woIdx ? "cur" : done(x) ? "ok" : "") + '"></i>';
        }).join("") +
        "</span></span>" +
        '<button type="button" class="btn sm" data-pg="1" aria-label="next">›</button>';
      if (cards[0] && cards[0].parentNode) cards[0].parentNode.insertBefore(nav, cards[0]);
      nav.querySelectorAll("[data-pg]").forEach(function (b) {
        b.addEventListener("click", function () {
          if (typeof goEx === "function") goEx(woIdx + +b.getAttribute("data-pg"));
        });
      });
    };
    window.applyPager.__wgFixed = true;
    return true;
  }

  function patchRenderGym() {
    if (typeof renderGym !== "function" || renderGym.__wgFixed) return;
    var orig = renderGym;
    window.renderGym = function () {
      var r = orig.apply(this, arguments);
      setTimeout(run, 0);
      return r;
    };
    window.renderGym.__wgFixed = true;
  }

  function run() {
    injectCSS();
    patchApplyPager();
    patchRenderGym();
    forceVisibleCard();
    if (typeof applyPager === "function") {
      try { applyPager(); } catch (e) {}
    }
    if (typeof mockTop === "function") {
      try { mockTop(); } catch (e) {}
    }
  }

  run();
  setTimeout(run, 50);
  setTimeout(run, 200);
  setTimeout(run, 800);
  setTimeout(run, 2000);
  window.addEventListener("hashchange", function () { setTimeout(run, 50); });
  document.addEventListener("visibilitychange", function () {
    if (!document.hidden) setTimeout(run, 50);
  });
})();
