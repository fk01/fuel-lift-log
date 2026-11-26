/* workout-pager-fix.js — active workout UI polish */
(function () {
  function injectCSS() {
    var st = document.getElementById("wo-pager-fix");
    if (!st) {
      st = document.createElement("style");
      st.id = "wo-pager-fix";
      document.head.appendChild(st);
    }
    st.textContent = [
      /* 1) Comic as LARGE full-page background while training */
      "body.wo-focus #v-gym #step3{position:relative;overflow-x:hidden;overflow-y:visible}",
      "body.wo-focus #v-gym #step3::before{",
      "content:\"\"!important;position:fixed!important;inset:0!important;",
      "background:url(/img/comic-active.jpg) center 20%/cover no-repeat!important;",
      "filter:invert(1) grayscale(1) contrast(1.15)!important;",
      "mix-blend-mode:screen!important;opacity:.14!important;",
      "-webkit-mask-image:none!important;mask-image:none!important;",
      "pointer-events:none!important;z-index:0!important;",
      "}",
      "body.wo-focus #v-gym #step3::after{display:none!important}",
      "body.wo-focus #v-gym #step3>*{position:relative;z-index:1}",
      "#v-gym #exs.paged .wo-pager .pg-mid{background:transparent!important}",

      /* 2) Remove Weights highlight chip */
      "#v-gym .ex .mk-t em,.mk-t em{",
      "background:transparent!important;border:0!important;box-shadow:none!important;",
      "color:rgba(255,255,255,.55)!important;font-style:normal!important;",
      "padding:0!important;border-radius:0!important;",
      "}",

      /* 3) Weight pills equal */
      "#v-gym .ex .mk-pill{height:46px!important;min-width:0!important;transform:none!important;animation:none!important}",
      "#v-gym .ex .mk-pill input{width:3.2ch!important;min-width:3.2ch!important;max-width:4.5ch!important;font:600 17px/1 var(--f-body,system-ui)!important;transform:none!important;animation:none!important;color:#fff!important}",
      "#v-gym .ex .mk-pill.dim input,#v-gym .ex .mk-pill.dim i{color:#fff!important;opacity:.85!important}",
      "#v-gym .ex .mk-pill input:focus,#v-gym .ex .mk-pill:active{transform:none!important;animation:none!important}",

      /* pager */
      "#v-gym .wo-pager{display:flex!important}",
      "#v-gym #exs.paged .wo-pager{display:flex!important;align-items:center;justify-content:space-between;gap:10px;margin:0 0 12px;padding:8px 4px;position:relative;z-index:2}",
      "#v-gym #exs.paged .wo-pager .btn{min-width:48px;min-height:44px;border-radius:14px;background:rgba(255,255,255,.10)!important;border:1px solid rgba(255,255,255,.16)!important;color:#fff!important;font-size:22px;font-weight:700}",
      "#v-gym #exs.paged .wo-pager .pg-mid{color:rgba(255,255,255,.7);text-align:center}",
      "#v-gym #exs.paged .wo-pager .pg-dots{display:flex;gap:5px;justify-content:center;margin-top:4px}",
      "#v-gym #exs.paged .wo-pager .pg-dots i{width:6px;height:6px;border-radius:50%;background:rgba(255,255,255,.25);display:inline-block}",
      "#v-gym #exs.paged .wo-pager .pg-dots i.cur{background:#fff}",
      "#v-gym #exs.paged .wo-pager .pg-dots i.ok{background:rgba(255,255,255,.55)}",
      "#exs.paged>.ex.pg-on{display:block!important}",
      "#exs.paged>.ex:not(.pg-on){display:none!important}",
      "#exs.paged{display:flex;flex-direction:column}",
      /* everything that does not grow sits ABOVE the current exercise; the card is last so it can grow downward */
      "#exs.paged>.wo-pager{order:0}",
      "#exs.paged>.ls-next{order:1;display:flex!important;margin:0 0 12px!important}",
      "#exs.paged>.ex.pg-on{order:2}",
      "#exs.paged>.ex:not(.pg-on){order:3}",

      /* kill old reserved space for floating Add button */
      "#v-gym #exs{padding-bottom:0!important;margin-bottom:0!important}",
      "#v-gym #step3{padding-bottom:calc(var(--tabh,84px) + 12px)!important}",

      /* Add exercise: plain label, tight under Next */
      "#v-gym #wo-add,body.wo-focus #v-gym #wo-add{",
      "position:static!important;left:auto!important;right:auto!important;bottom:auto!important;",
      "display:block!important;width:auto!important;",
      "margin:6px 4px 8px!important;padding:4px 4px!important;",
      "height:auto!important;min-height:0!important;background:transparent!important;border:0!important;",
      "border-radius:0!important;box-shadow:none!important;color:rgba(255,255,255,.55)!important;",
      "font-size:14px!important;font-weight:500!important;text-align:left!important;cursor:pointer;",
      "}"
    ].join("");
  }

  function pinAddExercise() {
    var btn = document.getElementById("wo-add");
    var box = document.getElementById("exs");
    if (!btn || !box) return;
    // Keep the button OUTSIDE #exs: renderGym rewrites #exs, which would destroy it and crash the next render.
    if (btn.nextElementSibling !== box) box.before(btn);   // above the pager: only the exercise card grows downward
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
      // no active workout: nothing is "on screen" (the list is hidden), so don't mark cards as current
      var live = typeof picked !== "undefined" && picked;
      cards.forEach(function (c) { c.classList.toggle("pg-on", live); });
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

  function equalizePills() {
    document.querySelectorAll("#exs .mk-pill input").forEach(function (inp) {
      inp.style.width = "3.2ch";
      inp.style.minWidth = "3.2ch";
      inp.style.transform = "none";
    });
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
      equalizePills();
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
      equalizePills();
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
    equalizePills();
    syncTopPos();
    if (typeof applyPager === "function") {
      try { applyPager(); } catch (e) {}
    }
    if (typeof mockTop === "function") {
      try { mockTop(); } catch (e) {}
    }
    pinAddExercise();
    equalizePills();
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
