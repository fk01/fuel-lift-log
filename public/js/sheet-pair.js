/* sheet-pair.js — every sheet that saves gets the same bottom bar: "Cancel" left, "✓ Save" right.
   Runs after each openGen(): if a save-type primary button is not already in a .sheet-act bar,
   move it into a new bar with a Cancel (data-gen-close → the usual close / leave-edit path). */
(() => {
  const SAVE = /บันทึก|เซฟ|สร้าง|Save|Create|Apply|ใช้ที่นี่|Use here/i;
  function pair(body) {
    if (!body) return;
    const cancelText = typeof t === "function" ? t("ยกเลิก") : "Cancel";
    const existing = body.querySelector(".sheet-act");
    if (existing) {   // a bar is there: make sure a save bar also has its Cancel, on the left
      const hasSave = [...existing.querySelectorAll("button.btn.primary")].some(b => SAVE.test(b.textContent));
      const hasNo = [...existing.querySelectorAll("button")].some(b => b.hasAttribute("data-gen-close") || ["ยกเลิก","Cancel","ปิด","Close","เล่นต่อ","Keep going"].includes(b.textContent.trim()));
      if (hasSave && !hasNo) { const no = document.createElement("button"); no.className = "btn"; no.type = "button"; no.setAttribute("data-gen-close", ""); no.textContent = cancelText; existing.prepend(no); }
      return;
    }
    const btn = [...body.querySelectorAll("button.btn.primary")].find(b =>
      !b.closest(".sheet-act") && !b.hasAttribute("data-gen-close") && SAVE.test(b.textContent));
    if (!btn) return;
    const bar = document.createElement("div");
    bar.className = "actions sheet-act";
    const no = document.createElement("button");
    no.className = "btn"; no.type = "button"; no.setAttribute("data-gen-close", "");
    no.textContent = typeof t === "function" ? t("ยกเลิก") : "Cancel";
    bar.append(no);
    const after = btn.nextElementSibling;   // keep anything after Save (e.g. Delete) below the bar
    btn.replaceWith(bar); bar.append(btn);
    btn.classList.remove("sticky-b");
    if (after && after.parentElement === bar.parentElement) bar.after(after);
    // one label style for every save: "✓ Save"
    if (!/^\s*✓/.test(btn.textContent)) btn.insertAdjacentText("afterbegin", "✓ ");
    // the bar's Cancel replaces any old stand-alone Close / Cancel button
    const closeWords = new Set([no.textContent, "ปิด", "Close", "ยกเลิก", "Cancel"].map(x => x.trim()));
    body.querySelectorAll("button.btn").forEach(b => {
      if (b.closest(".sheet-act") || b.classList.contains("sh-x")) return;
      if (closeWords.has(b.textContent.trim())) b.hidden = true;
    });
  }
  function hook() {
    if (typeof openGen !== "function" || openGen.__paired) return;
    const o = openGen;
    window.openGen = function (title, html, after) {
      const r = o.call(this, title, html, function (b) { if (after) after(b); try { pair(b); } catch (e) { console.error(e); } });
      return r;
    };
    window.openGen.__paired = true;
  }
  hook();
})();
