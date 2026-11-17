// program-manager.js — manage programs: rename, add, delete, reorder, edit exercises (UI) or edit everything as JSON text
// Classic script: shares globals with the other files in /js (load order is set in index.html).
/* ---------- program manager ---------- */
Object.assign(EN,{"จัดการโปรแกรม":"Manage programs","แบบปุ่ม":"Form","แบบ JSON":"JSON","ชื่อโปรแกรม":"Program name","คำอธิบาย":"Description",
  "แก้ท่า":"Edit exercises","เพิ่มโปรแกรม":"Add program","ลบโปรแกรม":"Delete program","โปรแกรมใหม่":"New program","บันทึก JSON":"Save JSON",
  "บันทึกโปรแกรมแล้ว":"Programs saved","ต้องมีอย่างน้อย 1 โปรแกรม":"Keep at least one program","คัดลอก":"Copy",
  "แก้ JSON แล้วกดบันทึก · ท่าที่ไม่มีในคลังจะถูกสร้างให้":"Edit and save · exercises not in the library are created"});
let pmTab="ui";
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
  return{progs:out,newLib}}
function pmCommit(P,newLib){PROGS=P;if(newLib&&newLib.length){EXLIB.push(...newLib);save("exlib",EXLIB)}
  if(!PROGS[cur]){cur=nextProg();picked=false;editing=false;draft.ex={};save("gymdraft",draft)}saveProgs()}
function renderPM(){
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
  const keys=Object.keys(PROGS);
  keys.forEach((k,i)=>{const p=PROGS[k];const c=document.createElement("div");c.className="ex";
    c.innerHTML=`<input data-f="name" value="${esc(p.name)}" aria-label="${t("ชื่อโปรแกรม")}" style="${pmFld};font-family:var(--f-display);font-size:1.05rem">
      <input data-f="sub" value="${esc(p.sub||"")}" placeholder="${t("คำอธิบาย")}" aria-label="${t("คำอธิบาย")}" style="${pmFld};font-size:.85rem">
      <ul class="prog-ex" style="margin:0">${p.ex.map(e=>`<li>${e.z} ${esc(e.n)} <i class="mg">${groupName(groupOf(e))}</i><span>${e.s}×${e.r}</span></li>`).join("")}</ul>
      <div class="actions"><button class="btn sm" data-up ${i===0?"disabled":""}>↑</button><button class="btn sm" data-down ${i===keys.length-1?"disabled":""}>↓</button>
        <button class="btn sm ghost" data-del>${t("ลบโปรแกรม")}</button><button class="btn sm primary" data-ex style="margin-left:auto">✎ ${t("แก้ท่า")}</button></div>`;
    const on=(s,ev,fn)=>c.querySelector(s).addEventListener(ev,fn);
    on('[data-f="name"]',"change",ev=>{p.name=ev.target.value.trim()||p.name;saveProgs();renderGym()});
    on('[data-f="sub"]',"change",ev=>{p.sub=ev.target.value.trim();saveProgs();renderGym()});
    const move=d=>{const o={};const ks=keys.slice();ks.splice(i+d,0,ks.splice(i,1)[0]);ks.forEach(x=>o[x]=PROGS[x]);PROGS=o;saveProgs();renderPM();renderGym()};
    on("[data-up]","click",()=>move(-1));on("[data-down]","click",()=>move(1));
    on("[data-del]","click",ev=>{const b=ev.target;if(keys.length<2){toast(t("ต้องมีอย่างน้อย 1 โปรแกรม"));return}
      if(!b.dataset.sure){b.dataset.sure=1;b.textContent=t("กดอีกครั้งเพื่อยืนยัน");return}
      const o={...PROGS};delete o[k];pmCommit(o);renderPM();renderGym()});
    on("[data-ex]","click",()=>{document.getElementById("pm-modal").hidden=true;
      if(cur!==k)draft.ex={};cur=k;draft.prog=k;picked=true;editing=true;editId=null;save("gymdraft",draft);updUnitBtn();renderGym();
      setTimeout(()=>document.getElementById("step3").scrollIntoView({behavior:"smooth",block:"start"}),50)});
    box.appendChild(c)});
  const a=document.createElement("button");a.className="btn primary";a.textContent="+ "+t("เพิ่มโปรแกรม");
  a.addEventListener("click",()=>{const k="p"+Date.now().toString(36);PROGS[k]={name:t("โปรแกรมใหม่"),sub:"",ex:[]};saveProgs();renderPM();renderGym();
    const ins=document.querySelectorAll('#pm-body [data-f="name"]');const l=ins[ins.length-1];if(l){l.scrollIntoView({block:"center"});l.focus();l.select()}});
  box.appendChild(a)}
document.getElementById("pm-open").addEventListener("click",()=>{renderPM();document.getElementById("pm-modal").hidden=false});
document.getElementById("pm-close").addEventListener("click",()=>{document.getElementById("pm-modal").hidden=true;renderGym()});
document.querySelectorAll("#pm-tabs .chip").forEach(c=>c.addEventListener("click",()=>{pmTab=c.dataset.tab;renderPM()}));
