/* workout-pager-fix.js — blank screen, pager, scroll-jump, Add exercise as label */
(function () {
  function injectCSS() {
    var st = document.getElementById("wo-pager-fix");
    if (!st) {
      st = document.createElement("style");
      st.id = "wo-pager-fix";
      document.head.appendChild(st);
    }
    st.textContent = [
      /* show pager */
      "#v-gym .wo-pager{display:flex!important}",
      "#v-gym #exs.paged .wo-pager{display:flex!important;align-items:center;justify-content:space-between;gap:10px;margin:0 0 12px;padding:8px 4px;position:relative;z-index:2}",
      "#v-gym #exs.paged .wo-pager .btn{min-width:48px;min-height:44px;border-radius:14px;background:rgba(255,255,255,.10)!important;border:1px solid rgba(255,255,255,.18)!important;color:#fff!important;font-size:22px;font-weight:700}",
      "#v-gym #exs.paged .wo-pager .pg-mid{color:rgba(255,255,255,.75);text-align:center}",
      "#v-gym #exs.paged .wo-pager .pg-dots{display:flex;gap:5px;justify-content:center;margin-top:4px}",
      "#v-gym #exs.paged .wo-pager .pg-dots i{width:6px;height:6px;border-radius:50%;background:rgba(255,255,255,.25);display:inline-block}",
      "#v-gym #exs.paged .wo-pager .pg-dots i.cur{background:#fff}",
      "#v-gym #exs.paged .wo-pager .pg-dots i.ok{background:rgba(255,255,255,.55)}",
      /* one visible card */
      "#exs.paged>.ex.pg-on{display:block!important}",
      "#exs.paged>.ex:not(.pg-on){display:none!important}",
      "#v-gym #step3{overflow-x:hidden;overflow-y:visible}",
      /* Next teaser under current card */
      "#exs.paged .ls-next{display:flex!important;order:99;margin-top:12px!important;position:relative;z-index:2}",
      "#exs.paged{display:flex;flex-direction:column}",
      "#exs.paged>.wo-pager{order:0}",
      "#exs.paged>.ex.pg-on{order:1}",
      "#exs.paged>.ex:not(.pg-on){order:2}",
      "#exs.paged>.ls-next{order:3}",
      /* + Add exercise: plain text label only (still tappable) */
      "#v-gym #wo-add,body.wo-focus #v-gym #wo-add{",
      "position:static!important;left:auto!important;right:auto!important;bottom:auto!important;z-index:auto!important;",
      "display:block!important;width:auto!important;max-width:100%!important;",
      "margin:10px 4px 18px!important;padding:8px 4px!important;",
      "height:auto!important;min-height:0!important;",
      "background:transparent!important;border:0!important;border-radius:0!important;",
      "box-shadow:none!important;outline:none!important;",
      "color:rgba(255,255,255,.55)!important;font-size:14px!important;font-weight:500!important;",
      "text-align:left!important;cursor:pointer;",
      "}",
      "#v-gym #wo-add:active{color:rgba(255,255,255,.85)!important}",
      /* reduce comic clutter while training */
      "body.wo-focus #v-gym #step3::before,body.wo-focus #v-gym #step3::after{opacity:.12!important;max-height:40%!important}"
    ].join("");
  }

  function pinAddExercise() {
    var btn = document.getElementById("wo-add");
    var box = document.getElementById("exs");
    if (!btn || !box) return;
    if (btn.previousElementSibling !== box) box.after(btn);
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
    var cur = cards[woIdx];
    var nextBtn = box.querySelector(".ls-next");
    if (cur && nextBtn && nextBtn.previousElementSibling !== cur) cur.after(nextBtn);
    pinAddExercise();
  }

  function syncTopPos() {
    var p = document.getElementById("wt-pos");
    var n = document.querySelectorAll("#exs > .ex").length;
    if (p && n) p.textContent = " · " + ((+woIdx || 0) + 1) + "/" + n;
  }

  function softScrollToCurrent() {
    var cur = document.querySelector("#exs > .ex.pg-on");
    if (!cur) return;
    try { cur.scrollIntoView({ block: "nearest", inline: "nearest", behavior: "smooth" }); } catch (e) {}
  }

  function patchApplyPager() {
    if (typeof applyPager !== "function") return false;
    if (applyPager.__wgFixed) return true;
    var original = applyPager;
    window.applyPager = function () {
      try { original.apply(this, arguments); } catch (e) { console.error(e); }
      forceVisibleCard();
      syncTopPos();
      pinAddExercise();
      var box = document.getElementById("exs");
      if (!box || !box.classList.contains("paged")) return;
      var mid = box.querySelector(".wo-pager .pg-mid small");
      var cards = [].slice.call(box.querySelectorAll(":scope > .ex"));
      if (mid && cards.length) mid.textContent = ((+woIdx || 0) + 1) + "/" + cards.length;
      if (box.querySelector(".wo-pager")) return;
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

  function patchGoEx() {
    if (typeof goEx !== "function" || goEx.__wgFixed) return;
    window.goEx = function (i) {
      var nc = document.querySelectorAll("#exs > .ex").length || 1;
      woIdx = ((i % nc) + nc) % nc;
      try {
        if (typeof draft !== "undefined") {
          draft.idx = woIdx;
          localStorage.setItem("gymdraft", JSON.stringify(draft));
        }
      } catch (_) {}
      if (typeof applyPager === "function") applyPager();
      if (typeof decorateSets === "function") {
        try { decorateSets(); } catch (e) {}
      }
      forceVisibleCard();
      syncTopPos();
      pinAddExercise();
      setTimeout(softScrollToCurrent, 30);
    };
    window.goEx.__wgFixed = true;
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
    patchGoEx();
    patchRenderGym();
    forceVisibleCard();
    pinAddExercise();
    syncTopPos();
    if (typeof applyPager === "function") {
      try { applyPager(); } catch (e) {}
    }
    if (typeof mockTop === "function") {
      try { mockTop(); } catch (e) {}
    }
    pinAddExercise();
    syncTopPos();
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
