// edit-tx.js — editors work on a draft: nothing in progs/exlib/gymdraft is stored until the user taps Save.
// Classic script: shares globals with the other files in /js (load order is set in index.html).
// TXS is a stack so a nested editor (e.g. muscle picker opened from the program editor) has its own Save/Cancel;
// an inner Save only folds into the outer draft — the outermost Save writes to storage.
const TXS=[];
const TX_KEYS=["progs","exlib","gymdraft"];
const txOn=k=>TXS.length>0&&TX_KEYS.includes(k);
const txTop=()=>TXS[TXS.length-1];
function txBegin(id,o){o=o||{};if(TXS.some(x=>x.id===id))return;
  TXS.push({id,snap:[JSON.stringify(PROGS),JSON.stringify(EXLIB),JSON.stringify(draft)],keys:new Set(),onEnd:o.onEnd,label:o.label||""});txBar()}
function txTouch(k){const x=txTop();if(x){x.keys.add(k);txBar()}}
const txDirty=()=>{const x=txTop();return !!x&&x.keys.size>0};
function txEnd(x){TXS.pop();txBar();if(x.onEnd)x.onEnd()}
function txSave(){const x=txTop();if(!x)return;
  if(TXS.length>1){const o=TXS[TXS.length-2];x.keys.forEach(k=>o.keys.add(k))}
  else{const v={progs:PROGS,exlib:EXLIB,gymdraft:draft};TXS.length=0;x.keys.forEach(k=>save(k,v[k]));TXS.push(x);if(x.keys.size)toast("✓ "+t("บันทึกแล้ว"))}
  txEnd(x)}
function txCancel(){const x=txTop();if(!x)return;PROGS=JSON.parse(x.snap[0]);EXLIB=JSON.parse(x.snap[1]);draft=JSON.parse(x.snap[2]);txEnd(x)}
// ask before throwing away unsaved edits; then = what to do after the editor ends
function txLeave(then){if(!TXS.length){if(then)then();return}
  if(!txDirty()){txCancel();if(then)then();return}
  const d=document.getElementById("tx-ask");d.hidden=false;
  d.querySelector("[data-keep]").onclick=()=>{d.hidden=true};
  d.querySelector("[data-drop]").onclick=()=>{d.hidden=true;txCancel();if(then)then()}}
function txBar(){let b=document.getElementById("tx-bar");
  if(!b){b=document.createElement("div");b.id="tx-bar";b.className="tx-bar";
    b.innerHTML=`<span class="tx-dot"></span><div class="tx-btns"><button class="btn" data-tx-cancel></button><button class="btn primary" data-tx-save></button></div>`;
    b.querySelector("[data-tx-cancel]").addEventListener("click",()=>txLeave());
    b.querySelector("[data-tx-save]").addEventListener("click",()=>{const x=txTop();if(x&&x.save)x.save();else txSave()});document.body.appendChild(b);
    const a=document.createElement("div");a.id="tx-ask";a.className="tx-ask";a.hidden=true;
    a.innerHTML=`<div class="tx-ask-in"><b>${t("ทิ้งการแก้ไข?")}</b><small>${t("สิ่งที่แก้ยังไม่ได้บันทึกจะหายไป")}</small><div class="tx-btns"><button class="btn" data-keep>${t("แก้ต่อ")}</button><button class="btn warn" data-drop>${t("ทิ้ง")}</button></div></div>`;
    document.body.appendChild(a)}
  const on=TXS.length>0;b.hidden=!on;document.body.classList.toggle("tx-open",on);if(!on)return;
  b.querySelector("[data-tx-cancel]").textContent=t("ยกเลิก");
  const s=b.querySelector("[data-tx-save]");s.textContent="✓ "+t("บันทึก");s.disabled=!txDirty();
  b.querySelector(".tx-dot").textContent=txDirty()?"● "+t("ยังไม่บันทึก"):""}
// the generic sheet's ✕ / backdrop must go through txLeave while an editor inside it is open
document.getElementById("gen-sheet").addEventListener("click",ev=>{const x=txTop();if(!x||x.id!=="gen")return;
  if(ev.target.id==="gen-sheet"||ev.target.closest("[data-gen-close]")){ev.stopImmediatePropagation();txLeave()}},true);
