// exercise-edit.js — unit switch and exercise editor
// Classic script: shares globals with the other files in /js (load order is set in index.html).
/* ---------- unit + edit exercises ---------- */
function updUnitBtn(){document.getElementById("edit-mode").textContent=editing?t("เสร็จแล้ว"):t("แก้ไขท่า")}
document.getElementById("edit-mode").addEventListener("click",()=>{editing=!editing;updUnitBtn();renderGym()});
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
function saveProgs(){save("progs",PROGS)}
function safeUrl(u){if(!u)return "";try{const x=new URL(u.trim());return /^https?:$/.test(x.protocol)?x.href:""}catch(e){return ""}}
function editCard(box,e,i){
  const list=PROGS[cur].ex;{
    const c=document.createElement("div");c.className="ex";
    c.innerHTML=`<input id="en-${e.id}" value="${esc(e.n)}" aria-label="${t("ชื่อท่า")}" style="width:100%;box-sizing:border-box;background:var(--bg);color:var(--fg);border:1px solid var(--line);border-radius:4px;padding:8px;font:inherit">
      <div class="sets" style="grid-template-columns:1fr 1fr 1fr"><span class="h">${t("อุปกรณ์")}</span><span class="h">${t("เซ็ต")}</span><span class="h">${t("ช่วงครั้ง")}</span>
      <select id="ez-${e.id}" style="background:var(--bg);color:var(--fg);border:1px solid var(--line);border-radius:6px;padding:7px;font:inherit">${[["🔩","🔩 "+t("เครื่อง")],["🏋️","🏋️ "+t("ดัมเบล/บาร์")],["🔗","🔗 "+t("เคเบิล")]].map(([v,t])=>`<option value="${v}" ${e.z===v?"selected":""}>${t}</option>`).join("")}</select>
      <input type="number" readonly inputmode="none" data-pad="sets" id="es-${e.id}" value="${e.s}" aria-label="${t("เซ็ต")}">
      <input id="er-${e.id}" readonly inputmode="none" data-pad="rng" value="${esc(e.r)}" aria-label="${t("ช่วงครั้ง")}" style="min-width:0;box-sizing:border-box;border:1px solid var(--line);background:var(--bg);color:var(--fg);border-radius:6px;padding:7px 6px;font-family:var(--f-num);text-align:center"></div>
      <input id="el-${e.id}" type="url" inputmode="url" value="${esc(e.link||"")}" placeholder="${t("ลิงก์วิธีเล่น (YouTube / TikTok)")}" aria-label="link" style="width:100%;box-sizing:border-box;background:var(--bg);color:var(--fg);border:1px solid var(--line);border-radius:4px;padding:8px;font:inherit;font-size:.85rem">
      <label class="zone" style="display:flex;gap:8px;align-items:center">${t("หน่วย")} <select id="eu-${e.id}" style="background:var(--bg);color:var(--fg);border:1px solid var(--line);border-radius:6px;padding:5px;font:inherit"><option value="kg" ${(e.u||"kg")==="kg"?"selected":""}>kg</option><option value="lb" ${e.u==="lb"?"selected":""}>lb</option></select></label>
      <label class="zone" style="display:flex;gap:8px;align-items:center"><input type="checkbox" id="em-${e.id}" ${e.main?"checked":""} style="accent-color:var(--accent)"> ${t("ท่าหลัก")}</label>
      <div class="actions"><button class="btn sm" data-up ${i===0?"disabled":""}>↑</button><button class="btn sm" data-down ${i===list.length-1?"disabled":""}>↓</button><button class="btn sm ghost" data-del>${t("ลบท่า")}</button><button class="btn sm primary" data-done>${t("เสร็จ")}</button></div>`;
    const on=(sel,ev,fn)=>c.querySelector(sel).addEventListener(ev,fn);
    on(`#en-${e.id}`,"change",ev=>{e.n=ev.target.value.trim()||e.n;saveProgs()});
    on(`#ez-${e.id}`,"change",ev=>{e.z=ev.target.value;saveProgs()});
    on(`#es-${e.id}`,"change",ev=>{e.s=Math.max(1,Math.min(10,+ev.target.value||1));if(draft.ex)delete draft.ex[e.id];saveProgs()});
    on(`#er-${e.id}`,"change",ev=>{e.r=ev.target.value.trim()||e.r;saveProgs()});
    on(`#el-${e.id}`,"change",ev=>{const v=ev.target.value.trim();if(v&&!safeUrl(v)){toast(t("ลิงก์ต้องขึ้นต้นด้วย https://"));return}e.link=v;saveProgs()});
    on(`#eu-${e.id}`,"change",ev=>{e.u=ev.target.value;saveProgs()});
    on(`#em-${e.id}`,"change",ev=>{e.main=ev.target.checked?1:0;saveProgs()});
    on("[data-done]","click",()=>{editId=null;if(editing){editing=false;updUnitBtn()}renderGym()});
    on("[data-up]","click",()=>{list.splice(i-1,0,list.splice(i,1)[0]);saveProgs();renderEx()});
    on("[data-down]","click",()=>{list.splice(i+1,0,list.splice(i,1)[0]);saveProgs();renderEx()});
    on("[data-del]","click",ev=>{const b=ev.target;if(!b.dataset.sure){b.dataset.sure=1;b.textContent=t("กดอีกครั้งเพื่อยืนยัน");return}
      list.splice(i,1);if(draft.ex)delete draft.ex[e.id];saveProgs();save("gymdraft",draft);renderEx();toast(t("ลบท่าแล้ว"))});
    box.appendChild(c);
  }
}
function renderEdit(box){
  const list=PROGS[cur].ex;list.forEach((e,i)=>editCard(box,e,i));
  const a=document.createElement("div");a.className="actions";
  a.innerHTML=`<button class="btn primary" id="add-ex">+ ${t("เพิ่มท่า")}</button><button class="btn ghost" id="reset-ex">${t("คืนค่าเริ่มต้น")}</button>`;
  a.querySelector("#add-ex").addEventListener("click",()=>{list.push({id:"c"+Date.now().toString(36),n:t("ท่าใหม่"),z:"🔩",s:5,r:"5"});saveProgs();renderEx();
    const inp=box.querySelectorAll("input[id^=en-]");const last=inp[inp.length-1];last&&(last.focus(),last.select())});
  a.querySelector("#reset-ex").addEventListener("click",ev=>{const b=ev.target;if(!b.dataset.sure){b.dataset.sure=1;b.textContent=t("กดอีกครั้งเพื่อยืนยัน");return}
    PROGS[cur]=JSON.parse(JSON.stringify(DEFAULT_PROGS[cur]));draft.ex={};saveProgs();save("gymdraft",draft);renderEx()});
  box.appendChild(a);
}
