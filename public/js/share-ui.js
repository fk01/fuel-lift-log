/* share-ui.js — share sheet + run card, option A (user choice):
   the app's comic art as background (or the chosen photo), big distance bottom-left, pace · time under it,
   white WEIGHTGRAM wordmark. Formats as labels: Story 9:16 · Square · Transparent. Bar: Close | ↓ Save image.
   Loads after run.js and share-card.js; replaces drawRun() and wraps shareRun2()/openShare(). */
(() => {
  const L = (th, en) => (typeof lang !== "undefined" && lang === "th" ? th : en);
  const sans = '"IBM Plex Sans Thai",system-ui,sans-serif', mono = '"IBM Plex Mono",ui-monospace,monospace';
  let comic = null;
  const comicImg = () => comic || (comic = new Promise(r => { const im = new Image(); im.onload = () => r(im); im.onerror = () => r(null); im.src = "/img/comic-share.jpg"; }));

  // fmt: "story" 1080×1920 · "square" 1080×1080 · "clear" (transparent PNG, 1080×1920)
  window.drawRun = async function (d, clear, fmt) {
    try { await document.fonts.ready; } catch (e) {}
    fmt = clear ? "clear" : (fmt || "story");
    const W = 1080, H = fmt === "square" ? 1080 : 1920, P = 84;
    const c = document.createElement("canvas"); c.width = W; c.height = H; const x = c.getContext("2d");
    if (fmt !== "clear") {
      x.fillStyle = "#121418"; x.fillRect(0, 0, W, H);
      if (runPhoto) {                                   // the user's own photo, greyscaled like before
        const im = runPhoto, sc = Math.max(W / im.width, H / im.height), w = im.width * sc, hh = im.height * sc;
        x.drawImage(im, (W - w) / 2, (H - hh) / 2, w, hh);
        const px = x.getImageData(0, 0, W, H), q = px.data;
        for (let i = 0; i < q.length; i += 4) { let v = q[i] * .3 + q[i + 1] * .59 + q[i + 2] * .11; v = Math.max(0, Math.min(255, (v - 128) * 1.1 + 128)) * .8; q[i] = q[i + 1] = q[i + 2] = v; }
        x.putImageData(px, 0, 0);
      } else {
        const bg = await comicImg();
        if (bg) { x.save(); x.filter = "invert(1) grayscale(1) contrast(1.15)"; x.globalAlpha = .38; const s = Math.max(W / bg.width, H / bg.height); x.drawImage(bg, (W - bg.width * s) / 2, (H - bg.height * s) / 2, bg.width * s, bg.height * s); x.restore(); }
      }
      const g = x.createLinearGradient(0, 0, 0, H); g.addColorStop(0, "rgba(0,0,0,0)"); g.addColorStop(.38, "rgba(0,0,0,.05)"); g.addColorStop(1, "rgba(0,0,0,.86)");
      x.fillStyle = g; x.fillRect(0, 0, W, H);
    }
    x.textAlign = "left"; x.fillStyle = "#fff"; x.shadowColor = "rgba(0,0,0,.55)"; x.shadowBlur = fmt === "clear" ? 16 : 0;
    const k = typeof runProgK === "function" ? runProgK() : null, name = (k && PROGS[k] && PROGS[k].name) || L("วิ่ง", "Run");
    const date = new Date(DAY + "T12:00:00").toLocaleDateString(LOC(), { day: "numeric", month: "short", year: "numeric" });
    let y = H - P - 40;                                   // build bottom-up
    x.font = `800 italic 40px ${sans}`; x.fillText("WEIGHTGRAM", P, y);
    y -= 92;
    const col = (lab, val, cx) => { x.fillStyle = "rgba(255,255,255,.65)"; x.font = `500 28px ${sans}`; x.fillText(lab.toUpperCase(), cx, y - 52); x.fillStyle = "#fff"; x.font = `700 52px ${mono}`; x.fillText(val, cx, y); };
    col(L("เพซ", "Pace"), `${fmtPace(d.sec / d.km)}/km`, P);
    col(L("เวลา", "Time"), fmtDur(d.sec), P + 380);
    y -= 120;
    x.fillStyle = "#fff"; x.font = `700 170px ${mono}`; const km = (+d.km).toFixed(2); x.fillText(km, P, y);
    const kw = x.measureText(km).width; x.font = `600 56px ${mono}`; x.fillText("km", P + kw + 18, y);
    y -= 190;
    x.fillStyle = "rgba(255,255,255,.7)"; x.font = `500 32px ${sans}`; x.fillText(`${name.toUpperCase()} · ${date.toUpperCase()}`, P, y);
    const jpg = runPhoto && fmt !== "clear";
    return new Promise((r, no) => c.toBlob(b => b ? r(b) : no(new Error("toBlob")), jpg ? "image/jpeg" : "image/png", .9));
  };

  /* ---- share sheet chrome: formats row + Close | Save image bar ---- */
  const modal = document.getElementById("share-modal"); if (!modal) return;
  const inn = modal.querySelector(".modal-in"), acts = inn.querySelector(".actions");
  const fmtRow = document.createElement("div"); fmtRow.className = "sh-fmt";
  fmtRow.innerHTML = `<button type="button" data-fmt="card">${L("การ์ด", "Card")}</button><button type="button" data-fmt="story">Story 9:16</button><button type="button" data-fmt="square">Square</button><button type="button" data-fmt="clear">${L("พื้นใส", "Transparent")}</button>`;
  const bar = document.createElement("div"); bar.className = "actions sheet-act sh-bar";
  const close = document.getElementById("share-close"), saveB = document.getElementById("share-save");
  close.classList.remove("primary"); saveB.textContent = "↓ " + L("บันทึกรูป", "Save image"); saveB.removeAttribute("data-i");
  bar.append(close, saveB);
  acts.before(fmtRow); acts.after(bar); acts.hidden = true;     // keeps #share-story in the DOM for existing handlers
  let ctx = null, cur = "story";
  const mark = () => fmtRow.querySelectorAll("[data-fmt]").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.fmt === cur)));
  const show = blob => { shareBlob = blob; const img = document.getElementById("share-img"); if (img.src) URL.revokeObjectURL(img.src); img.src = URL.createObjectURL(blob); };
  fmtRow.addEventListener("click", async ev => {
    const b = ev.target.closest("[data-fmt]"); if (!b || !ctx) return; cur = b.dataset.fmt; mark();
    if (ctx.kind === "run") {
      show(await drawRun(ctx.d, cur === "clear", cur));
      shareName = `run-${DAY}${cur === "clear" ? "-overlay" : cur === "square" ? "-square" : ""}.${runPhoto && cur !== "clear" ? "jpg" : "png"}`;
    } else if (ctx.kind === "wk") {
      if (cur === "story") { shareBlob = ctx.blob; show(await storyBlob()); shareName = ctx.name.replace(/\.png$/, "-story.png"); }
      else { show(ctx.blob); shareName = ctx.name; }
    }
  });

  if (typeof shareRun2 === "function") {
    const o = shareRun2;
    window.shareRun2 = async function (clear) {
      const r = await o.apply(this, arguments);
      if (!modal.hidden) { const d = (() => { try { return runPrev(); } catch (_) { return null; } })(); ctx = { kind: "run", d }; cur = clear ? "clear" : "story"; fmtRow.dataset.kind = "run"; mark(); }
      return r;
    };
  }
  if (typeof openShare === "function") {
    const o = openShare;
    window.openShare = async function () {
      const r = await o.apply(this, arguments);
      if (!modal.hidden && shareBlob) { ctx = { kind: "wk", blob: shareBlob, name: shareName }; cur = "card"; fmtRow.dataset.kind = "wk"; mark(); }
      return r;
    };
  }
})();
