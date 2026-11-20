// exercise-edit.js — edit a program's exercise list (exercises themselves come from exercise-library.js)
// Classic script: shares globals with the other files in /js (load order is set in index.html).
/* ---------- unit + edit exercises ---------- */
function updUnitBtn(){document.getElementById("edit-mode").textContent=editing?t("เสร็จแล้ว"):t("แก้ไขท่า")}
document.getElementById("edit-mode").addEventListener("click",()=>{if(editing){txLeave();return}editing=true;updUnitBtn();renderGym()});
const gymTx=()=>txBegin("gymedit",{onEnd:()=>{editing=false;editId=null;updUnitBtn();renderGym()}});
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
function saveProgs(){save("progs",PROGS)}
function safeUrl(u){if(!u)return "";try{const x=new URL(u.trim());return /^https?:$/.test(x.protocol)?x.href:""}catch(e){return ""}}
// main lifts of Push/Pull programs are locked: they cannot be swapped, removed or un-marked (sets/reps can still change)
const isLocked=(k,e)=>!!e.main&&/^(push|pull)/i.test(k)&&!!DEFAULT_PROGS[k]&&DEFAULT_PROGS[k].ex.some(d=>d.id===e.id&&d.main);
function editCard(box,e,i){
  const lock=isLocked(cur,e);gymTx();
  const list=PROGS[cur].ex;{
    const c=document.createElement("div");c.className="ex";
    c.innerHTML=`<div class="row-head" style="align-items:center"><span class="ex-name">${e.z} ${esc(e.n)}</span>${lock?`<span class="macro">🔒 ${t("ท่าหลัก")}</span>`:""}<button class="btn sm" data-mus-ed>💪 ${t("กล้ามที่โดน")}</button><button class="btn sm" data-swap ${lock?"hidden":""}>⇄ ${t("เปลี่ยนท่า")}</button></div>
      <div class="sets" style="grid-template-columns:1fr 1fr"><span class="h">${t("เซ็ต")}</span><span class="h">${t("ช่วงครั้ง")}</span>
      <input type="number" readonly inputmode="none" data-pad="sets" id="es-${e.id}" value="${e.s}" aria-label="${t("เซ็ต")}">
      <input id="er-${e.id}" readonly inputmode="none" data-pad="rng" value="${esc(e.r)}" aria-label="${t("ช่วงครั้ง")}" style="min-width:0;box-sizing:border-box;border:1px solid var(--line);background:var(--bg);color:var(--fg);border-radius:6px;padding:7px 6px;font-family:var(--f-num);text-align:center"></div>
      <label class="zone" style="display:flex;gap:8px;align-items:center"><input type="checkbox" id="em-${e.id}" ${e.main?"checked":""} ${lock?"disabled":""} style="accent-color:var(--accent)"> ${t("ท่าหลัก")}</label>
      <div class="actions"><button class="btn sm" data-up ${i===0?"disabled":""}>↑</button><button class="btn sm" data-down ${i===list.length-1?"disabled":""}>↓</button><button class="btn sm ghost" data-del ${lock?"hidden":""}>${t("ลบท่า")}</button><button class="btn sm primary" data-done>${t("เสร็จ")}</button></div>`;
    const on=(sel,ev,fn)=>c.querySelector(sel).addEventListener(ev,fn);
    on(`#es-${e.id}`,"change",ev=>{e.s=Math.max(1,Math.min(10,+ev.target.value||1));if(draft.ex)delete draft.ex[e.id];saveProgs()});
    on(`#er-${e.id}`,"change",ev=>{e.r=ev.target.value.trim()||e.r;saveProgs()});
    on("[data-mus-ed]","click",()=>openMusPick(e.id,e.n));
    on("[data-swap]","click",()=>!lock&&openLib({skip:new Set(list.map(q=>q.id)),onPick:x=>{
      if(draft.ex)delete draft.ex[e.id];const n={...libPick(x),s:e.s,r:e.r};if(e.main)n.main=1;list[i]=n;if(editId===e.id)editId=x.id;
      saveProgs();save("gymdraft",draft);renderEx()}}));
    on(`#em-${e.id}`,"change",ev=>{if(lock){ev.target.checked=true;return}e.main=ev.target.checked?1:0;saveProgs()});
    on("[data-done]","click",()=>{if(editing){editId=null;renderGym()}else txSave()});
    on("[data-up]","click",()=>{list.splice(i-1,0,list.splice(i,1)[0]);saveProgs();renderEx()});
    on("[data-down]","click",()=>{list.splice(i+1,0,list.splice(i,1)[0]);saveProgs();renderEx()});
    on("[data-del]","click",ev=>{if(lock)return;const b=ev.target;if(!b.dataset.sure){b.dataset.sure=1;b.textContent=t("กดอีกครั้งเพื่อยืนยัน");return}
      list.splice(i,1);if(draft.ex)delete draft.ex[e.id];saveProgs();save("gymdraft",draft);renderEx();toast(t("ลบท่าแล้ว"))});
    box.appendChild(c);
  }
}
function renderEdit(box){
  const list=PROGS[cur].ex;list.forEach((e,i)=>editCard(box,e,i));
  const a=document.createElement("div");a.className="actions";
  a.innerHTML=`<button class="btn primary" id="add-ex">+ ${t("เพิ่มท่า")}</button><button class="btn ghost" id="reset-ex">${t("คืนค่าเริ่มต้น")}</button>`;
  a.querySelector("#add-ex").addEventListener("click",()=>openLib({skip:new Set(list.map(q=>q.id)),onPick:x=>{list.push({...libPick(x),s:5,r:"5"});saveProgs();renderEx()}}));
  a.querySelector("#reset-ex").addEventListener("click",ev=>{const b=ev.target;if(!b.dataset.sure){b.dataset.sure=1;b.textContent=t("กดอีกครั้งเพื่อยืนยัน");return}
    PROGS[cur]=JSON.parse(JSON.stringify(DEFAULT_PROGS[cur]));draft.ex={};saveProgs();save("gymdraft",draft);renderEx()});
  box.appendChild(a);
}
