/* Active workout: show ‹ › pager, keep one card visible, easier swipe */
(function () {
  if (document.getElementById("wo-pager-fix")) return;
  var st = document.createElement("style");
  st.id = "wo-pager-fix";
  st.textContent = [
    "#v-gym .wo-pager{display:flex!important}",
    "#v-gym #exs.paged .wo-pager{display:flex!important;align-items:center;justify-content:space-between;gap:10px;margin:0 0 10px;padding:6px 4px}",
    "#v-gym #exs.paged .wo-pager .btn{min-width:48px;min-height:44px;border-radius:14px;background:rgba(255,255,255,.08)!important;border:1px solid rgba(255,255,255,.16)!important;color:#fff!important;font-size:20px}",
    "#v-gym #exs.paged .wo-pager .pg-mid{color:rgba(255,255,255,.7)}",
    "#exs.paged>.ex.pg-on{display:block!important}",
    "#exs.paged>.ex:not(.pg-on){display:none!important}",
    "#v-gym #step3{overflow-x:hidden;overflow-y:visible}"
  ].join("");
  document.head.appendChild(st);

  function patchPager() {
    if (typeof applyPager !== "function") return;
    var orig = applyPager;
    if (orig.__pagerPatched) return;
    function patched() {
      var box = document.getElementById("exs");
      if (!box) return;
      var cards = [].slice.call(box.querySelectorAll(":scope>.ex"));
      var oldPager = box.querySelector(".wo-pager");
      if (oldPager) oldPager.remove();
      var on = typeof picked !== "undefined" && picked && !(typeof editing !== "undefined" && editing) && cards.length > 1;
      box.classList.toggle("paged", on);
      cards.forEach(function (c) { c.classList.remove("pg-on"); });
      if (!cards.length) return;
      if (typeof woIdx === "undefined") window.woIdx = 0;
      woIdx = Math.max(0, Math.min(cards.length - 1, +woIdx || 0));
      cards[woIdx].classList.add("pg-on");
      if (!on) {
        box.classList.remove("paged");
        return;
      }
      var ex = typeof sessEx === "function" ? sessEx() : [];
      var done = function (r) {
        return ((draft.ex || {})[r.id] || []).every(function (x) { return x.ok; });
      };
      var nav = document.createElement("div");
      nav.className = "wo-pager";
      nav.innerHTML =
        '<button class="btn sm" data-pg="-1" aria-label="prev">‹</button>' +
        '<span class="pg-mid"><small>' + (woIdx + 1) + '/' + cards.length + '</small>' +
        '<span class="pg-dots">' +
        ex.map(function (x, i) {
          return '<i class="' + (i === woIdx ? "cur" : done(x) ? "ok" : "") + '"></i>';
        }).join("") +
        '</span></span>' +
        '<button class="btn sm" data-pg="1" aria-label="next">›</button>';
      cards[0].before(nav);
      nav.querySelectorAll("[data-pg]").forEach(function (b) {
        b.addEventListener("click", function () {
          goEx(woIdx + +b.getAttribute("data-pg"));
        });
      });
    }
    patched.__pagerPatched = true;
    window.applyPager = patched;
  }

  function afterRender() {
    patchPager();
    if (typeof applyPager === "function") {
      try { applyPager(); } catch (e) {}
    }
    if (typeof mockTop === "function") {
      try { mockTop(); } catch (e) {}
    }
  }

  // Patch after core workout script has defined applyPager
  setTimeout(afterRender, 0);
  setTimeout(afterRender, 100);
  setTimeout(afterRender, 500);

  // Re-apply after gym re-renders (e.g. refresh / cloudLoad)
  var _rg = window.renderGym;
  if (typeof _rg === "function" && !_rg.__pagerWrapped) {
    window.renderGym = function () {
      var r = _rg.apply(this, arguments);
      setTimeout(afterRender, 0);
      return r;
    };
    window.renderGym.__pagerWrapped = true;
  }
})();
