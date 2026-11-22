// program-manager.js — manage programs: rename, add, delete, reorder, edit exercises (UI) or edit everything as JSON text
// Classic script: shares globals with the other files in /js (load order is set in index.html).
/* ---------- program manager ---------- */
Object.assign(EN,{"จัดการโปรแกรม":"Manage programs","แบบปุ่ม":"Form","แบบ JSON":"JSON","ชื่อโปรแกรม":"Program name","คำอธิบาย":"Description",
  "แก้ท่า":"Edit exercises","เพิ่มโปรแกรม":"Add program","ลบโปรแกรม":"Delete program","โปรแกรมใหม่":"New program","บันทึก JSON":"Save JSON",
  "บันทึกโปรแกรมแล้ว":"Programs saved","ต้องมีอย่างน้อย 1 โปรแกรม":"Keep at least one program","คัดลอก":"Copy","ทุกโปรแกรม":"All programs","ย้ายโปรแกรม":"Program order","ท่าหลักห้ามลบหรือเปลี่ยน":"main lift can't be removed or changed",
  "แก้ JSON แล้วกดบันทึก · ท่าที่ไม่มีในคลังจะถูกสร้างให้":"Edit and save · exercises not in the library are created"});
let pmTab="ui",pmOnly=null,pmFromList=false;   // pmOnly: program key when opened from "Edit workout" — show just that program
const pmFld="width:100%;box-sizing:border-box;background:var(--bg);color:var(--fg);border:1px solid var(--line);border-radius:var(--r-xs);padding:8px;font:inherit";
function progsToJson(){const out={};weightsHere().map(k=>[k,PROGS[k]]).forEach(([k,p])=>{out[k]={name:p.name,sub:p.sub||"",ex:p.ex.map(e=>{const o={id:e.id,n:e.n,s:e.s,r:e.r};if(e.main)o.main=true;if(e.alt)o.alt=e.alt;return o})}});return JSON.stringify(out,null,2)}
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
      const o={...libPick(lib),s,r:String(e.r??"5").trim()||"5"};if(e.main)o.main=1;if(e.alt)o.alt=String(e.alt);return o})}});
  // locked main lifts must stay in their Push/Pull program as main
  weightsHere().map(k=>[k,PROGS[k]]).forEach(([k,p])=>p.ex.forEach(e=>{if(!isLocked(k,e))return;
    const n=out[k]&&out[k].ex.find(x=>x.id===e.id);if(!n)throw new Error(`🔒 ${p.name}: ${e.n} — ${t("ท่าหลักห้ามลบหรือเปลี่ยน")}`);n.main=1}));
  // keep other places and cardio; carry place / schedule of programs that keep their key
  const here=new Set(weightsHere()),merged={};Object.keys(PROGS).forEach(k=>{if(!here.has(k))merged[k]=PROGS[k]});
  Object.entries(out).forEach(([k,p])=>{const o=here.has(k)?PROGS[k]:null;p.loc=curLoc;p.days=o&&o.days||[];if(o&&o.slot)p.slot=o.slot;merged[k]=p});
  return{progs:merged,newLib}}
function pmCommit(P,newLib){PROGS=P;if(newLib&&newLib.length){EXLIB.push(...newLib);save("exlib",EXLIB)}
  if(!PROGS[cur]){cur=nextProg();picked=false;editing=false;draft.ex={};save("gymdraft",draft)}saveProgs()}
// inline exercise rows inside the program form: sets / reps (tap pad), reorder, swap from library, remove; locked main lifts can't be swapped or removed
function pmExRows(box,k){const list=PROGS[k].ex;box.innerHTML="";
  list.forEach((e,i)=>{const lock=isLocked(k,e);const r=document.createElement("div");r.className="pm-row";
    r.innerHTML=`<div class="pm-top"><i class="pi-no">${i+1}</i><span class="nm"><b>${lock?"🔒 ":""}${esc(e.n)}</b><button type="button" class="mg" data-mus-ed aria-label="${t("กล้ามที่โดน")}">${musOf(e)[0].map(m=>t(MUS_NAME[m])).join(", ")||groupName(groupOf(e))} ✎</button></span></div>
      <div class="pm-ctl"><label class="pm-n"><input type="number" readonly inputmode="none" data-pad="sets" value="${e.s}" aria-label="${nU(esc(e.n),"เซ็ต")}"><small>${t("เซ็ต")}</small></label><span class="pm-x">×</span>
        <label class="pm-n"><input readonly inputmode="none" data-pad="rng" value="${esc(e.r)}" aria-label="${esc(e.n)} ${t("ช่วงครั้ง")}"><small>${t("ครั้ง_pm").replace(/_pm$/,"")}</small></label>
        <span class="pm-ic"><button class="ib" data-up ${i===0?"disabled":""} aria-label="${t("เลื่อนขึ้น")}">↑</button><button class="ib" data-down ${i===list.length-1?"disabled":""} aria-label="${t("เลื่อนลง")}">↓</button>${lock?"":`<button class="ib" data-swap aria-label="${t("เปลี่ยนท่า")}">⇄</button><button class="ib del" data-rm aria-label="${t("ลบท่า")}">🗑</button>`}</span></div>`;
    const q=s=>r.querySelector(s);
    q('[data-pad="sets"]').addEventListener("change",ev=>{e.s=Math.max(1,Math.min(10,+ev.target.value||1));if(draft.ex)delete draft.ex[e.id];saveProgs();renderGym()});
    q('[data-pad="rng"]').addEventListener("change",ev=>{e.r=ev.target.value.trim()||e.r;saveProgs();renderGym()});
    q("[data-mus-ed]").addEventListener("click",()=>openMusPick(e.id,e.n,()=>pmExRows(box,k)));
    const mv=d=>{list.splice(i+d,0,list.splice(i,1)[0]);saveProgs();pmExRows(box,k);renderGym()};
    q("[data-up]").addEventListener("click",()=>mv(-1));q("[data-down]").addEventListener("click",()=>mv(1));
    if(!lock){q("[data-swap]").addEventListener("click",()=>openLib({skip:new Set(list.map(x=>x.id)),onPick:x=>{const n={...libPick(x),s:e.s,r:e.r};if(e.main)n.main=1;list[i]=n;if(draft.ex)delete draft.ex[e.id];saveProgs();renderPM()}}));
      q("[data-rm]").addEventListener("click",async()=>{if(!await cfm(`${t("ลบท่า")}?<br>${esc(e.n)}`,"",t("ลบท่า"),1))return;
        list.splice(i,1);if(draft.ex)delete draft.ex[e.id];saveProgs();pmExRows(box,k);renderGym()})}
    box.appendChild(r)})}
function renderPM(){
  if(pmOnly&&!PROGS[pmOnly])pmOnly=null;if(pmOnly)pmTab="ui";
  document.getElementById("pm-tabs").hidden=pmTab!=="json"||!!pmOnly;document.getElementById("pm-title").textContent=pmOnly?`✎ ${PROGS[pmOnly].name}`:t("จัดการโปรแกรม");
  document.querySelectorAll("#pm-tabs .chip").forEach(c=>c.setAttribute("aria-pressed",c.dataset.tab===pmTab));
  const box=document.getElementById("pm-body");box.innerHTML="";
  if(pmTab==="json"){
    box.innerHTML=`<p class="note">${t("แก้ JSON แล้วกดบันทึก · ท่าที่ไม่มีในคลังจะถูกสร้างให้")}</p>
      <textarea id="pm-json" spellcheck="false" autocapitalize="off" autocomplete="off" style="${pmFld};min-height:55vh;font-family:var(--f-num);font-size:var(--t-label);line-height:1.4;white-space:pre"></textarea>
      <p class="note" id="pm-err" hidden style="color:var(--warn)"></p>
      <div class="actions"><button class="btn primary" id="pm-save">${t("บันทึก JSON")}</button><button class="btn" id="pm-copy">${t("คัดลอก")}</button></div>`;
    box.querySelector("#pm-json").value=progsToJson();
    box.querySelector("#pm-copy").addEventListener("click",async()=>{try{await navigator.clipboard.writeText(box.querySelector("#pm-json").value);toast(t("คัดลอก JSON แล้ว"))}catch(e){}});
    box.querySelector("#pm-save").addEventListener("click",()=>{const err=box.querySelector("#pm-err");
      try{const {progs,newLib}=jsonToProgs(box.querySelector("#pm-json").value);pmCommit(progs,newLib);err.hidden=true;renderPM();renderGym();toast(t("บันทึกโปรแกรมแล้ว"))}
      catch(e){err.textContent=e.message;err.hidden=false}});
    return}
  if(pmOnly)return pmEditOne(box,pmOnly);
  // list view: one compact row per program; tap a row to edit that program
  const keys=progsHere();const lh=document.createElement("div");lh.className="pick-h";lh.textContent=`${hereLoc().icon||"📍"} ${t(hereLoc().name)}`;box.appendChild(lh);
  keys.forEach((k,i)=>{const p=PROGS[k];const r=document.createElement("div");r.className="pm-li";
    r.innerHTML=`<button class="pm-open" aria-label="${t("แก้โปรแกรม")} ${esc(p.name)}"><b>${esc(p.name)}</b><small>${esc(t(p.sub||""))}</small><small>${isCardio(p)?(p.icon||"🏃")+" "+t("คาร์ดิโอ"):nU(p.ex.length,"ท่า")}${(p.days||[]).length?" · "+p.days.map(d=>lang==="th"?WD[d]:WD_EN[d]).join(" "):""} ›</small></button>
      <div class="pm-li-act"><button class="btn sm pm-more" data-menu aria-label="${t("แก้โปรแกรม")} ${esc(p.name)}">•••</button></div>`;
    const on=(s,ev,fn)=>r.querySelector(s).addEventListener(ev,fn);
    on(".pm-open","click",()=>{if(isCardio(p)){openCardioEdit(k);return}pmOnly=k;pmFromList=true;renderPM();document.getElementById("pm-modal").scrollTop=0});
    const move=d=>{const o={};const ks=Object.keys(PROGS),a=ks.indexOf(k),b=ks.indexOf(keys[i+d]);ks[a]=keys[i+d];ks[b]=k;ks.forEach(x=>o[x]=PROGS[x]);PROGS=o;saveProgs();renderPM();renderGym()};
    on("[data-menu]","click",()=>openGen(esc(p.name),`<div class="pm-menu">${i>0?`<button class="menu-row" data-m="up"><span class="mi">↑</span><span class="mt">${t("เลื่อนขึ้น")}</span></button>`:""}${i<keys.length-1?`<button class="menu-row" data-m="down"><span class="mi">↓</span><span class="mt">${t("เลื่อนลง")}</span></button>`:""}
      ${isCardio(p)?"":`<button class="menu-row" data-m="view"><span class="mi">☰</span><span class="mt"><b>${t("ดูท่าทั้งหมด")}</b><small>${nU(p.ex.length,"ท่า")}</small></span></button><button class="menu-row" data-m="edit"><span class="mi">✎</span><span class="mt"><b>${t("แก้ไขโปรแกรม")}</b></span></button>`}<button class="menu-row" data-m="pub"><span class="mi">🌐</span><span class="mt">${t("แชร์ให้ชุมชน")}</span></button><button class="menu-row" data-m="share"><span class="mi">↗</span><span class="mt">${t("แชร์ลิงก์")}</span></button><button class="menu-row" data-m="copy"><span class="mi">⧉</span><span class="mt">${t("คัดลอกไป…")}</span></button><button class="menu-row" data-m="move"><span class="mi">→</span><span class="mt">${t("ย้ายไป…")}</span></button>
      <button class="menu-row warn" data-m="del"><span class="mi">🗑</span><span class="mt">${t("ลบโปรแกรม")}</span></button></div><button class="btn" data-gen-close>${t("ปิด")}</button>`,g=>g.querySelectorAll("[data-m]").forEach(b=>b.addEventListener("click",()=>{const m=b.dataset.m;
      if(m==="view"){closeGen();document.getElementById("pm-modal").hidden=true;openPlanItem(k);return}if(m==="edit"){closeGen();pmOnly=k;pmFromList=true;renderPM();return}if(m==="up"||m==="down"){closeGen();move(m==="up"?-1:1);return}if(m==="copy"||m==="move"){openProgMove(k,m);return}if(m==="share"){openShareLink([k],locOf(p));return}if(m==="pub"){publishWorkout([k],locOf(p));return}
      if(p.ex.some(e=>isLocked(k,e))){toast("🔒 "+t("ท่าหลักห้ามลบหรือเปลี่ยน"));return}if(keys.length<2){toast(t("ต้องมีอย่างน้อย 1 โปรแกรม"));return}
      if(!b.dataset.sure){b.dataset.sure=1;b.querySelector(".mt").textContent=t("ลบ")+"?";return}
      closeGen();const o={...PROGS};delete o[k];pmCommit(o);renderPM();renderGym()}))));
    box.appendChild(r)});
  const a=document.createElement("button");a.className="btn primary";a.textContent="+ "+t("เพิ่มโปรแกรม");
  a.addEventListener("click",openAddProg);
  const j=document.createElement("button");j.className="btn text sm";j.style.justifySelf="center";j.textContent=t("แก้แบบ JSON (ขั้นสูง)");j.addEventListener("click",()=>{pmTab="json";renderPM()});
  box.appendChild(a);box.appendChild(j)}
// single-program editor: name, description, exercises
let pmReturn=null;   // where closing the program editor goes back to (e.g. the plan item sheet it was opened from)
function pmBackOut(){const f=pmReturn;pmReturn=null;if(f)setTimeout(f,0)}
function pmEditOne(box,k){const p=PROGS[k];txBegin("pm",{onEnd:()=>{if(pmFromList){pmOnly=null;pmFromList=false;renderPM()}else{document.getElementById("pm-modal").hidden=true;pmBackOut()}renderGym()}});
  if(pmFromList){const back=document.createElement("button");back.className="btn sm";back.style.justifySelf="start";back.textContent="‹ "+t("ทุกโปรแกรม");
    back.addEventListener("click",()=>txLeave());box.appendChild(back)}
  const c=document.createElement("div");c.className="ex";
  c.innerHTML=`<input data-f="name" value="${esc(p.name)}" aria-label="${t("ชื่อโปรแกรม")}" style="${pmFld};font-family:var(--f-display);font-size:var(--t-title)">
    <input data-f="sub" value="${esc(p.sub||"")}" placeholder="${t("คำอธิบาย (ไม่ใส่ก็ได้)")}" aria-label="${t("คำอธิบาย")}" style="${pmFld};font-size:var(--t-sm)">
    <div class="label" style="margin:2px 0 0">${t("สถานที่")}</div><div class="chips pm-loc">${LOCS.filter(l=>hasType(l,"gym")).map(l=>`<button type="button" class="chip" data-ploc="${esc(l.id)}" aria-pressed="${locOf(p)===l.id}">${esc(l.icon||"📍")} ${esc(t(l.name))}</button>`).join("")}</div>
    <div class="label" style="margin:2px 0 0">${t("วันในตาราง")}</div>${dayChips(daysOf(k))}${todChips(p.tod)}
    <div class="stack pm-ex" style="gap:6px"></div>
    <button class="btn sm" data-add style="justify-self:start">+ ${t("เพิ่มท่า")}</button>`;
  const on=(s,ev,fn)=>c.querySelector(s).addEventListener(ev,fn);
  pmExRows(c.querySelector(".pm-ex"),k);
  c.querySelectorAll("[data-d]").forEach(x=>x.addEventListener("click",()=>{x.setAttribute("aria-pressed",x.getAttribute("aria-pressed")!=="true");p.days=readDays(c);saveProgs();renderGym()}));bindTod(c,p,()=>{saveProgs();renderGym()});
  on("[data-add]","click",()=>openLib({skip:new Set(p.ex.map(q=>q.id)),onPick:x=>{p.ex.push({...libPick(x),s:3,r:"5"});saveProgs();renderPM()}}));
  on('[data-f="name"]',"change",ev=>{p.name=ev.target.value.trim()||p.name;saveProgs();renderGym();document.getElementById("pm-title").textContent="✎ "+p.name});
  c.querySelectorAll("[data-ploc]").forEach(x=>x.addEventListener("click",()=>{p.loc=x.dataset.ploc;c.querySelectorAll("[data-ploc]").forEach(y=>y.setAttribute("aria-pressed",y===x));saveProgs();renderGym()}));
  on('[data-f="sub"]',"change",ev=>{p.sub=ev.target.value.trim();saveProgs();renderGym()});
  box.appendChild(c)}
document.getElementById("pm-open").addEventListener("click",()=>{pmOnly=null;pmFromList=false;renderPM();document.getElementById("pm-modal").hidden=false});
document.getElementById("pm-close").addEventListener("click",()=>txLeave(()=>{const was=!document.getElementById("pm-modal").hidden;document.getElementById("pm-modal").hidden=true;renderGym();if(was)pmBackOut()}));
document.querySelectorAll("#pm-tabs .chip").forEach(c=>c.addEventListener("click",()=>{pmTab=c.dataset.tab;renderPM()}));

Object.assign(EN,{"สถานที่":"Place","ครั้ง_pm":"reps","คำอธิบาย (ไม่ใส่ก็ได้)":"Note (optional)","เลื่อนขึ้น":"Move up","เลื่อนลง":"Move down"});

Object.assign(EN,{"ดูท่าทั้งหมด":"View exercises","แก้ไขโปรแกรม":"Edit program"});
