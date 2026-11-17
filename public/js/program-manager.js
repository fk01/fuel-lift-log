// program-manager.js — manage programs: rename, add, delete, reorder, edit exercises (UI) or edit everything as JSON text
// Classic script: shares globals with the other files in /js (load order is set in index.html).
/* ---------- program manager ---------- */
Object.assign(EN,{"จัดการโปรแกรม":"Manage programs","แบบปุ่ม":"Form","แบบ JSON":"JSON","ชื่อโปรแกรม":"Program name","คำอธิบาย":"Description",
  "แก้ท่า":"Edit exercises","เพิ่มโปรแกรม":"Add program","ลบโปรแกรม":"Delete program","โปรแกรมใหม่":"New program","บันทึก JSON":"Save JSON",
  "บันทึกโปรแกรมแล้ว":"Programs saved","ต้องมีอย่างน้อย 1 โปรแกรม":"Keep at least one program","คัดลอก":"Copy","ย้ายโปรแกรม":"Program order","ท่าหลักห้ามลบหรือเปลี่ยน":"main lift can't be removed or changed",
  "แก้ JSON แล้วกดบันทึก · ท่าที่ไม่มีในคลังจะถูกสร้างให้":"Edit and save · exercises not in the library are created"});
let pmTab="ui",pmOnly=null;   // pmOnly: program key when opened from "Edit workout" — show just that program
const pmFld="width:100%;box-sizing:border-box;background:var(--bg);color:var(--fg);border:1px solid var(--line);border-radius:4px;padding:8px;font:inherit";
function progsToJson(){const out={};Object.entries(PROGS).forEach(([k,p])=>{out[k]={name:p.name,sub:p.sub||"",ex:p.ex.map(e=>{const o={id:e.id,n:e.n,s:e.s,r:e.r};if(e.main)o.main=true;return o})}});return JSON.stringify(out,null,2)}
// parse + validate JSON text into PROGS; exercises are matched by id, then by name, else created in the library
function jsonToProgs(txt){
  let d;try{d=JSON.parse(txt)}catch(e){throw new Error("JSON: "+e.message)}
  if(!d||typeof d!=="object"||Array.isArray(d)||!Object.keys(d).length)throw new Error(t("ต้องมีอย่างน้อย 1 โปรแกรม"));
  const out={},newLib=[];
  Object.entries(d).forEach(([k,p])=>{
    if(!/^[\w-]{1,30}$/.test(k))throw new Error(`"${k}": key a-z 0-9 _ -`);
    if(!p||typeof p.name!=="string"||!p.name.trim())throw new Error(`"${k}": name`);
    if(!Array.isArray(p.ex))throw new Error(`"${k}": ex [ ]`);
    const seen=new Set();
    out[k]={name:p.name.trim(),sub:String(p.sub||""),ex:p.ex.map((e,i)=>{
      if(!e||(!e.id&&!e.n))throw new Error(`"${k}" #${i+1}: id / n`);
      let lib=EXLIB.find(x=>x.id===e.id)||newLib.find(x=>x.id===e.id);
      if(!lib&&e.n){const nm=String(e.n).trim().toLowerCase();lib=EXLIB.find(x=>x.n.trim().toLowerCase()===nm)||newLib.find(x=>x.n.trim().toLowerCase()===nm)}
      if(!lib){if(!e.n)throw new Error(`"${k}" #${i+1}: "${e.id}" ?`);
        lib={id:e.id&&/^[\w-]{1,40}$/.test(e.id)?e.id:"c"+Date.now().toString(36)+i,n:String(e.n).trim(),z:["🔩","🏋️","🔗"].includes(e.z)?e.z:"🔩"};
        if(GROUPS.some(g=>g[0]===e.g))lib.g=e.g;if(e.u==="lb")lib.u="lb";newLib.push(lib)}
      if(seen.has(lib.id))throw new Error(`"${k}": ${lib.n} ×2`);seen.add(lib.id);
      const s=Math.round(+e.s||5);if(s<1||s>10)throw new Error(`"${k}" ${lib.n}: s 1–10`);
      const o={...libPick(lib),s,r:String(e.r??"5").trim()||"5"};if(e.main)o.main=1;return o})}});
  // locked main lifts must stay in their Push/Pull program as main
  Object.entries(PROGS).forEach(([k,p])=>p.ex.forEach(e=>{if(!isLocked(k,e))return;
    const n=out[k]&&out[k].ex.find(x=>x.id===e.id);if(!n)throw new Error(`🔒 ${p.name}: ${e.n} — ${t("ท่าหลักห้ามลบหรือเปลี่ยน")}`);n.main=1}));
  return{progs:out,newLib}}
function pmCommit(P,newLib){PROGS=P;if(newLib&&newLib.length){EXLIB.push(...newLib);save("exlib",EXLIB)}
  if(!PROGS[cur]){cur=nextProg();picked=false;editing=false;draft.ex={};save("gymdraft",draft)}saveProgs()}
// inline exercise rows inside the program form: sets / reps (tap pad), reorder, swap from library, remove; locked main lifts can't be swapped or removed
function pmExRows(box,k){const list=PROGS[k].ex;box.innerHTML="";
  list.forEach((e,i)=>{const lock=isLocked(k,e);const r=document.createElement("div");r.className="pm-row";
    r.innerHTML=`<div class="pm-top"><b class="no">${i+1}</b><span class="nm">${lock?"🔒 ":""}${e.z} ${esc(e.n)} <i class="mg">${groupName(groupOf(e))}</i></span></div>
      <div class="pm-ctl"><input type="number" readonly inputmode="none" data-pad="sets" value="${e.s}" aria-label="${esc(e.n)} ${t("เซ็ต")}"><span>×</span>
        <input readonly inputmode="none" data-pad="rng" value="${esc(e.r)}" aria-label="${esc(e.n)} ${t("ช่วงครั้ง")}">
        <button class="btn sm" data-up ${i===0?"disabled":""} aria-label="up">↑</button><button class="btn sm" data-down ${i===list.length-1?"disabled":""} aria-label="down">↓</button>
        ${lock?"":`<button class="btn sm" data-swap aria-label="${t("เปลี่ยนท่า")}">⇄</button><button class="btn sm ghost" data-rm aria-label="${t("ลบท่า")}">✕</button>`}</div>`;
    const q=s=>r.querySelector(s);
    q('[data-pad="sets"]').addEventListener("change",ev=>{e.s=Math.max(1,Math.min(10,+ev.target.value||1));if(draft.ex)delete draft.ex[e.id];saveProgs();renderGym()});
    q('[data-pad="rng"]').addEventListener("change",ev=>{e.r=ev.target.value.trim()||e.r;saveProgs();renderGym()});
    const mv=d=>{list.splice(i+d,0,list.splice(i,1)[0]);saveProgs();pmExRows(box,k);renderGym()};
    q("[data-up]").addEventListener("click",()=>mv(-1));q("[data-down]").addEventListener("click",()=>mv(1));
    if(!lock){q("[data-swap]").addEventListener("click",()=>openLib({skip:new Set(list.map(x=>x.id)),onPick:x=>{const n={...libPick(x),s:e.s,r:e.r};if(e.main)n.main=1;list[i]=n;if(draft.ex)delete draft.ex[e.id];saveProgs();renderPM()}}));
      q("[data-rm]").addEventListener("click",ev=>{const b=ev.currentTarget;if(!b.dataset.sure){b.dataset.sure=1;b.textContent=t("ลบ")+"?";return}
        list.splice(i,1);if(draft.ex)delete draft.ex[e.id];saveProgs();pmExRows(box,k);renderGym()})}
    box.appendChild(r)})}
function renderPM(){
  if(pmOnly&&!PROGS[pmOnly])pmOnly=null;if(pmOnly)pmTab="ui";
  document.getElementById("pm-tabs").hidden=!!pmOnly;document.getElementById("pm-title").textContent=pmOnly?`✎ ${PROGS[pmOnly].name}`:t("จัดการโปรแกรม");
  document.querySelectorAll("#pm-tabs .chip").forEach(c=>c.setAttribute("aria-pressed",c.dataset.tab===pmTab));
  const box=document.getElementById("pm-body");box.innerHTML="";
  if(pmTab==="json"){
    box.innerHTML=`<p class="note">${t("แก้ JSON แล้วกดบันทึก · ท่าที่ไม่มีในคลังจะถูกสร้างให้")}</p>
      <textarea id="pm-json" spellcheck="false" autocapitalize="off" autocomplete="off" style="${pmFld};min-height:55vh;font-family:var(--f-num);font-size:.75rem;line-height:1.4;white-space:pre"></textarea>
      <p class="note" id="pm-err" hidden style="color:var(--warn)"></p>
      <div class="actions"><button class="btn primary" id="pm-save">${t("บันทึก JSON")}</button><button class="btn" id="pm-copy">${t("คัดลอก")}</button></div>`;
    box.querySelector("#pm-json").value=progsToJson();
    box.querySelector("#pm-copy").addEventListener("click",async()=>{try{await navigator.clipboard.writeText(box.querySelector("#pm-json").value);toast(t("คัดลอก JSON แล้ว"))}catch(e){}});
    box.querySelector("#pm-save").addEventListener("click",()=>{const err=box.querySelector("#pm-err");
      try{const {progs,newLib}=jsonToProgs(box.querySelector("#pm-json").value);pmCommit(progs,newLib);err.hidden=true;renderPM();renderGym();toast(t("บันทึกโปรแกรมแล้ว"))}
      catch(e){err.textContent=e.message;err.hidden=false}});
    return}
  const all=Object.keys(PROGS),keys=pmOnly?[pmOnly]:all;
  keys.forEach((k,i)=>{const p=PROGS[k];const c=document.createElement("div");c.className="ex";
    c.innerHTML=`<input data-f="name" value="${esc(p.name)}" aria-label="${t("ชื่อโปรแกรม")}" style="${pmFld};font-family:var(--f-display);font-size:1.05rem">
      <input data-f="sub" value="${esc(p.sub||"")}" placeholder="${t("คำอธิบาย")}" aria-label="${t("คำอธิบาย")}" style="${pmFld};font-size:.85rem">
      <div class="stack pm-ex" style="gap:6px"></div>
      <button class="btn sm" data-add style="justify-self:start">+ ${t("เพิ่มท่า")}</button>
      <div class="actions" style="align-items:center;border-top:1px solid var(--line);padding-top:8px" ${pmOnly?"hidden":""}><span class="note" style="align-self:center">${t("ย้ายโปรแกรม")}</span><button class="btn sm" data-up ${i===0?"disabled":""}>↑</button><button class="btn sm" data-down ${i===keys.length-1?"disabled":""}>↓</button>
        <button class="btn sm ghost" data-del>${t("ลบโปรแกรม")}</button></div>`;
    const on=(s,ev,fn)=>c.querySelector(s).addEventListener(ev,fn);
    pmExRows(c.querySelector(".pm-ex"),k);
    on("[data-add]","click",()=>openLib({skip:new Set(p.ex.map(q=>q.id)),onPick:x=>{p.ex.push({...libPick(x),s:3,r:"5"});saveProgs();renderPM()}}));
    on('[data-f="name"]',"change",ev=>{p.name=ev.target.value.trim()||p.name;saveProgs();renderGym()});
    on('[data-f="sub"]',"change",ev=>{p.sub=ev.target.value.trim();saveProgs();renderGym()});
    const move=d=>{const o={};const ks=keys.slice();ks.splice(i+d,0,ks.splice(i,1)[0]);ks.forEach(x=>o[x]=PROGS[x]);PROGS=o;saveProgs();renderPM();renderGym()};
    on("[data-up]","click",()=>move(-1));on("[data-down]","click",()=>move(1));
    on("[data-del]","click",ev=>{const b=ev.target;if(p.ex.some(e=>isLocked(k,e))){toast("🔒 "+t("ท่าหลักห้ามลบหรือเปลี่ยน"));return}if(keys.length<2){toast(t("ต้องมีอย่างน้อย 1 โปรแกรม"));return}
      if(!b.dataset.sure){b.dataset.sure=1;b.textContent=t("กดอีกครั้งเพื่อยืนยัน");return}
      const o={...PROGS};delete o[k];pmCommit(o);renderPM();renderGym()});
    box.appendChild(c)});
  const a=document.createElement("button");a.className="btn primary";a.textContent="+ "+t("เพิ่มโปรแกรม");
  a.addEventListener("click",()=>{const k="p"+Date.now().toString(36);PROGS[k]={name:t("โปรแกรมใหม่"),sub:"",ex:[]};saveProgs();renderPM();renderGym();
    const ins=document.querySelectorAll('#pm-body [data-f="name"]');const l=ins[ins.length-1];if(l){l.scrollIntoView({block:"center"});l.focus();l.select()}});
  if(!pmOnly)box.appendChild(a)}
document.getElementById("pm-open").addEventListener("click",()=>{pmOnly=null;renderPM();document.getElementById("pm-modal").hidden=false});
document.getElementById("pm-close").addEventListener("click",()=>{document.getElementById("pm-modal").hidden=true;renderGym()});
document.querySelectorAll("#pm-tabs .chip").forEach(c=>c.addEventListener("click",()=>{pmTab=c.dataset.tab;renderPM()}));
