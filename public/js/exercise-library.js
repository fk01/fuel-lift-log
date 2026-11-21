// exercise-library.js — exercise library: the one place exercises are created and edited; programs pick from it
// Classic script: shares globals with the other files in /js (load order is set in index.html).
/* ---------- exercise library ---------- */
Object.assign(EN,{"คลังท่า":"Exercise library","เลือกท่า":"Choose exercise","สร้างท่าใหม่":"Create exercise","เปลี่ยนท่า":"Change exercise",
  "ใช้ใน":"Used in","ยังไม่ได้ใช้ในโปรแกรม":"Not in any program","ใส่ชื่อท่าก่อน":"Enter a name first","มีท่าชื่อนี้อยู่แล้ว":"An exercise with this name already exists",
  "ยังใช้อยู่ในโปรแกรม ลบออกจากโปรแกรมก่อน":"Still used in a program — remove it there first","ไม่มีท่าอื่นให้เลือก สร้างท่าใหม่ได้เลย":"No other exercises to choose — create one",
  "กล้ามเนื้อ":"Muscle group","ทั้งหมด":"All","อก":"Chest","หลัง":"Back","ไหล่":"Shoulders","แขน":"Arms","ขา":"Legs","แกนกลาง":"Core","อื่นๆ":"Other","ไม่มีท่าในหมวดนี้":"No exercises in this group",
  "แตะท่าเพื่อแก้ไข":"Tap an exercise to edit","แตะท่าเพื่อเลือก":"Tap an exercise to pick it","ปิด":"Close"});
let EXLIB=load("exlib",[]);            // [{id,n,z,u?,link?}] — name, equipment, unit and how-to link live here
// muscle groups used to sort and filter the library; an exercise without an explicit group gets one from the muscle map
const GROUPS=[["chest","อก"],["back","หลัง"],["shoulder","ไหล่"],["arms","แขน"],["legs","ขา"],["core","แกนกลาง"],["other","อื่นๆ"]];
const MUS_GROUP={chest:"chest",lats:"back",traps:"back",delt:"shoulder",rear:"shoulder",bi:"arms",tri:"arms",fore:"arms",quad:"legs",ham:"legs",glute:"legs",calf:"legs",abd:"legs",add:"legs",abs:"core",obl:"core"};
const GROUP_MUS={chest:["chest"],back:["lats"],shoulder:["delt"],arms:["bi","tri"],legs:["quad","ham"],core:["abs"]};
const groupOf=x=>x.g||MUS_GROUP[musOf({id:x.id,n:x.n})[0][0]]||"other";
const groupName=g=>t((GROUPS.find(q=>q[0]===g)||GROUPS[6])[1]);
const libPick=e=>{const o={id:e.id,n:e.n,z:e.z||"🔩"};if(e.g)o.g=e.g;if(e.mp)o.mp=e.mp;if(e.ms)o.ms=e.ms;if(e.u)o.u=e.u;if(e.link)o.link=e.link;if(e.gif)o.gif=e.gif;return o};
// ex101 catalog (public/data/ex101.json, built by scripts/import-ex101.mjs): read-only, merged into the library view;
// an entry is copied into EXLIB only when picked or edited, so synced settings stay small.
Object.assign(EN,{"กล้ามที่โดน":"Muscles worked","แตะ 1 ครั้ง = หลัก, 2 = รอง, 3 = ไม่โดน":"tap: primary → secondary → off","ทุกอุปกรณ์":"All equipment","ค้นหาท่า":"Search exercises","กำลังโหลดท่า…":"Loading exercises…","แสดง":"Showing","พิมพ์เพื่อค้นหาเพิ่ม":"type to narrow down","วิธีเล่น":"How to"});
let CAT=null,catLoading=false,libQ="";
const lc=s=>(s||"").trim().toLowerCase();
const catOf=x=>CAT&&CAT.find(c=>c.id===x.id||(c.as&&lc(c.as)===lc(x.n)));   // own entry, or one attached to this exercise by name
function loadCat(){if(CAT||catLoading)return;catLoading=true;
  fetch("/data/ex101.json").then(r=>r.ok?r.json():[]).catch(()=>[]).then(d=>{CAT=Array.isArray(d)?d:[];catLoading=false;
    if(!document.getElementById("lib-modal").hidden)renderLib();else try{renderGym()}catch(_){}})}
// collapsible "How to" block (GIF + steps) for an exercise; "" when it has no demo
const gifOf=x=>x.gif||((catOf(x)||{}).gif)||"";
// exercise demos are never shown inline: a ▶ How-to button opens them in a sheet
const hasHow=x=>!!(gifOf(x)||safeUrl(x.link));
function howBtn(x,label){return hasHow(x)?`<span class="how-btn${label?" lbl":""}" role="button" tabindex="0" data-how="${esc(x.id)}" data-hown="${esc(x.n||"")}" aria-label="${t("วิธีเล่น")} ${esc(x.n||"")}"><svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M7 4l13 8-13 8z"/></svg>${label?` ${t("วิธีเล่น")}`:""}</span>`:""}
function howTo(x){return howBtn(x,true)}
function openHowTo(id,name){const x=EXLIB.find(q=>q.id===id)||(CAT||[]).find(q=>q.id===id)||{id,n:name},cat=catOf(x),gif=gifOf(x),link=safeUrl(x.link);
  openGen(esc(x.n||name),`${cat?`<small class="note">${esc(cat.t)} · ${esc(cat.e)}</small>`:""}${gif?`<img class="how-gif" src="${esc(gif)}" alt="">`:""}
    ${cat&&cat.s&&cat.s.length?`<ol class="how-steps">${cat.s.map(s=>{const m=String(s).match(/^(.{3,40}?)([,.:;]\s|\s(?:so|until|with|and|then|to|while)\s)/i);return `<li><span>${m?`<b>${esc(m[1])}</b>${esc(s.slice(m[1].length))}`:esc(s)}</span></li>`}).join("")}</ol>`:""}
    ${link?`<a class="btn" href="${esc(link)}" target="_blank" rel="noopener">▶ YouTube / TikTok</a>`:""}<button class="btn primary sticky-b" data-gen-close>${t("เข้าใจแล้ว")}</button>`)}
document.addEventListener("click",ev=>{const b=ev.target.closest&&ev.target.closest("[data-how]");if(!b)return;ev.preventDefault();ev.stopPropagation();openHowTo(b.dataset.how,b.dataset.hown)},true);
setTimeout(loadCat,0);
function adoptCat(c){let x=EXLIB.find(q=>q.id===c.id);if(!x){x=libPick(c);EXLIB.push(x);save("exlib",EXLIB)}return x}
function ensureLib(){let ch=false;const have=new Set(EXLIB.map(x=>x.id));
  [PROGS,DEFAULT_PROGS].forEach(P=>Object.values(P).forEach(p=>p.ex.forEach(e=>{if(!have.has(e.id)){have.add(e.id);EXLIB.push(libPick(e));ch=true}})));return ch}
if(ensureLib())try{localStorage.setItem("exlib",JSON.stringify(EXLIB))}catch(e){}
const libUsed=id=>Object.values(PROGS).filter(p=>p.ex.some(e=>e.id===id)).map(p=>p.name);
function libUpdate(id,patch){const x=EXLIB.find(q=>q.id===id);if(x)Object.assign(x,patch);
  Object.values(PROGS).forEach(p=>p.ex.forEach(e=>{if(e.id===id)Object.assign(e,patch)}));saveProgs();save("exlib",EXLIB)}

let libMode=null,libEdit=null,libGroup="all",libEq="all";         // libMode: null = manage, {skip:Set,onPick:fn} = pick for a program
const libNamed=x=>!!(x.n&&x.n.trim());
function openLib(mode){libMode=mode||null;libEdit=null;libGroup="all";libQ="";libEq=hereLoc().eq.length<EQ_ALL.length?"here":"all";const q=document.getElementById("lib-q");if(q){q.value="";q.placeholder=t("ค้นหาท่า")}loadCat();renderLib();document.getElementById("lib-modal").hidden=false}
function closeLib(){const n=EXLIB.length;EXLIB=EXLIB.filter(libNamed);if(EXLIB.length!==n)save("exlib",EXLIB);
  libEdit=null;libMode=null;document.getElementById("lib-modal").hidden=true;renderGym()}
function libDone(x){
  if(!libNamed(x)){toast(t("ใส่ชื่อท่าก่อน"));return}
  if(EXLIB.some(q=>q!==x&&q.n.trim().toLowerCase()===x.n.trim().toLowerCase())){toast(t("มีท่าชื่อนี้อยู่แล้ว"));return}
  txSave();if(libMode){const m=libMode;closeLib();m.onPick(x)}}
function libForm(x){
  const c=document.createElement("div");c.className="ex";const used=libUsed(x.id);txBegin("lib",{onEnd:()=>{libEdit=null;renderLib()}});if(txTop().id==="lib")txTop().save=()=>libDone(x);
  const fld="width:100%;box-sizing:border-box;background:var(--bg);color:var(--fg);border:1px solid var(--line);border-radius:var(--r-xs);padding:8px;font:inherit";
  const sel="background:var(--bg);color:var(--fg);border:1px solid var(--line);border-radius:var(--r-sm);padding:7px;font:inherit;min-width:0";
  c.innerHTML=howTo(x)+`<input data-f="n" value="${esc(x.n)}" placeholder="${t("ชื่อท่า")}" aria-label="${t("ชื่อท่า")}" style="${fld}">
    <div class="sets" style="grid-template-columns:1fr 1fr 4.5em"><span class="h">${t("กล้ามเนื้อ")}</span><span class="h">${t("อุปกรณ์")}</span><span class="h">${t("หน่วย")}</span>
      <select data-f="g" aria-label="${t("กล้ามเนื้อ")}" style="${sel}">${GROUPS.map(([v,l])=>`<option value="${v}" ${groupOf(x)===v?"selected":""}>${t(l)}</option>`).join("")}</select>
      <select data-f="z" aria-label="${t("อุปกรณ์")}" style="${sel}">${[["🔩","🔩 "+t("เครื่อง")],["🏋️","🏋️ "+t("ดัมเบล/บาร์")],["🔗","🔗 "+t("เคเบิล")]].map(([v,l])=>`<option value="${v}" ${x.z===v?"selected":""}>${l}</option>`).join("")}</select>
      <select data-f="u" aria-label="${t("หน่วย")}" style="${sel}"><option value="kg" ${(x.u||"kg")==="kg"?"selected":""}>kg</option><option value="lb" ${x.u==="lb"?"selected":""}>lb</option></select></div>
    <div class="mus-pick"><small>${t("กล้ามที่โดน")} · ${t("แตะ 1 ครั้ง = หลัก, 2 = รอง, 3 = ไม่โดน")}</small>
      <div class="mus-fig">${bodySVG(...musOf(x),150)}</div>
      <div class="chips">${MUS_KEYS.map(m=>{const [p,s]=musOf(x),st=p.includes(m)?"p":s.includes(m)?"s":"";return `<button class="chip mchip ${st}" data-mus="${m}">${t(MUS_NAME[m])}</button>`}).join("")}</div></div>
    <input data-f="link" ${gifOf(x)&&!x.link?"hidden":""} type="url" inputmode="url" value="${esc(x.link||"")}" placeholder="${t("ลิงก์วิธีเล่น (YouTube / TikTok)")}" aria-label="link" style="${fld};font-size:.85rem">
    <div class="zone">${used.length?t("ใช้ใน")+": "+used.map(esc).join(", "):t("ยังไม่ได้ใช้ในโปรแกรม")}</div>
    <div class="actions"><button class="btn sm ghost" data-del>${t("ลบท่า")}</button></div>`;
  const on=(s,ev,fn)=>c.querySelector(s).addEventListener(ev,fn);
  on('[data-f="n"]',"input",ev=>{const v=ev.target.value.trim();if(v||!libUsed(x.id).length)libUpdate(x.id,{n:v})});
  on('[data-f="g"]',"change",ev=>libUpdate(x.id,{g:ev.target.value}));
  on('[data-f="z"]',"change",ev=>libUpdate(x.id,{z:ev.target.value}));
  on('[data-f="u"]',"change",ev=>libUpdate(x.id,{u:ev.target.value}));
  on('[data-f="link"]',"change",ev=>{const v=ev.target.value.trim();if(v&&!safeUrl(v)){toast(t("ลิงก์ต้องขึ้นต้นด้วย https://"));return}libUpdate(x.id,{link:v})});
  c.querySelectorAll("[data-mus]").forEach(b=>b.addEventListener("click",()=>{const [p0,s0]=musOf(x),m=b.dataset.mus;let p=p0.filter(q=>q!==m),s=s0.filter(q=>q!==m);
    if(p0.includes(m))s.push(m);else if(!s0.includes(m))p.push(m);
    libUpdate(x.id,{mp:p,ms:s});const keep=libEdit;renderLib();libEdit=keep}));
  on("[data-del]","click",ev=>{const b=ev.target;
    if(libUsed(x.id).length){toast(t("ยังใช้อยู่ในโปรแกรม ลบออกจากโปรแกรมก่อน"));return}
    if(libNamed(x)&&!b.dataset.sure){b.dataset.sure=1;b.textContent=t("กดอีกครั้งเพื่อยืนยัน");return}
    EXLIB=EXLIB.filter(q=>q!==x);save("exlib",EXLIB);txSave();if(libNamed(x))toast(t("ลบท่าแล้ว"))});
  return c}
let libView=(()=>{try{return localStorage.getItem("libView")||"list"}catch(e){return "list"}})();
document.querySelectorAll("[data-lv]").forEach(b=>b.addEventListener("click",()=>{libView=b.dataset.lv;try{localStorage.setItem("libView",libView)}catch(e){}renderLib()}));
function renderLib(){const G=libView==="grid",FS=G?96:40;document.querySelectorAll("[data-lv]").forEach(b=>b.setAttribute("aria-pressed",b.dataset.lv===libView));
  document.getElementById("lib-list").classList.toggle("lib-grid",G);
  document.getElementById("lib-title").textContent=t(libMode?"เลือกท่า":"คลังท่า");
  const box=document.getElementById("lib-list");box.innerHTML="";
  const mine=EXLIB.filter(x=>x.id===libEdit||!libMode||!libMode.skip.has(x.id));
  const haveId=new Set(EXLIB.map(x=>x.id)),haveN=new Set(EXLIB.map(x=>(x.n||"").trim().toLowerCase()));
  const extra=(CAT||[]).filter(c=>!c.as&&!haveId.has(c.id)&&!haveN.has(c.n.toLowerCase())).map(c=>Object.assign({cat:1},c));
  const q=libQ.trim().toLowerCase(),hit=x=>!q||x.id===libEdit||[x.n,x.t,x.e].some(s=>s&&s.toLowerCase().includes(q));
  const all=mine.concat(extra).filter(hit).filter(x=>libEq==="all"||(libEq==="here"?canDo(x):(x.z||"🔩")===libEq));
  const count={};all.forEach(x=>{const g=groupOf(x);count[g]=(count[g]||0)+1});
  const chips=document.getElementById("lib-groups");chips.innerHTML="";
  [["all","ทั้งหมด"],...GROUPS].forEach(([g,l])=>{if(g!=="all"&&!count[g])return;const b=document.createElement("button");b.className="chip";b.setAttribute("aria-pressed",libGroup===g);
    b.textContent=`${t(l)} ${g==="all"?all.length:count[g]}`;b.addEventListener("click",()=>{libGroup=g;renderLib()});chips.appendChild(b)});
  const eq=document.getElementById("lib-eq");if(eq){eq.innerHTML="";[...(hereLoc().eq.length<EQ_ALL.length?[["here",`${hereLoc().icon||"📍"} ${t(hereLoc().name)}`]]:[]),["all","ทุกอุปกรณ์"],["🔩","🔩 "+t("เครื่อง")],["🏋️","🏋️ "+t("ดัมเบล/บาร์")],["🔗","🔗 "+t("เคเบิล")]].forEach(([k,l])=>{const b=document.createElement("button");b.className="chip";b.setAttribute("aria-pressed",libEq===k);b.textContent=t(l);b.addEventListener("click",()=>{libEq=k;renderLib()});eq.appendChild(b)})}
  const order=g=>GROUPS.findIndex(q=>q[0]===g);
  const items=all.filter(x=>x.id===libEdit||libGroup==="all"||groupOf(x)===libGroup).sort((a,b)=>order(groupOf(a))-order(groupOf(b))||(a.n||"").localeCompare(b.n||""));
  const hint=document.createElement("p");hint.className="note";
  const MAX=80,shown=items.filter(x=>!x.cat).concat(items.filter(x=>x.cat)).slice(0,MAX).sort((a,b)=>order(groupOf(a))-order(groupOf(b))||(a.cat||0)-(b.cat||0)||(a.n||"").localeCompare(b.n||""));
  hint.textContent=t(!all.length?"ไม่มีท่าอื่นให้เลือก สร้างท่าใหม่ได้เลย":!items.length?"ไม่มีท่าในหมวดนี้":libMode?"แตะท่าเพื่อเลือก":"แตะท่าเพื่อแก้ไข")
    +(items.length>MAX?` · ${t("แสดง")} ${MAX}/${items.length} — ${t("พิมพ์เพื่อค้นหาเพิ่ม")}`:"")+(catLoading?" · "+t("กำลังโหลดท่า…"):"");box.appendChild(hint);
  let lastG=null;
  shown.forEach(x=>{
    if(x.cat){const g=groupOf(x);if(libGroup==="all"&&g!==lastG){lastG=g;const h=document.createElement("div");h.className="pick-h";h.textContent=groupName(g);box.appendChild(h)}
      const b=document.createElement("button");b.className="prog lib-row";b.style.cssText="display:flex;gap:10px;align-items:center;text-align:left";
      b.innerHTML=`<span class="sx-mini">${bodySVG(...musOf(x),FS)}</span><span style="flex:1;min-width:0"><b>${G?"":x.z+" "}${esc(x.n)}</b><small style="display:block">${groupName(g)} · ${G?"":esc(x.t)+" · "}${esc(x.e)}</small></span>${howBtn(x)}`;
      b.addEventListener("click",()=>{const y=adoptCat(x);if(libMode){const m=libMode;closeLib();m.onPick(y)}else{libEdit=y.id;renderLib()}});box.appendChild(b);return}const g=groupOf(x);if(libGroup==="all"&&g!==lastG){lastG=g;const h=document.createElement("div");h.className="pick-h";h.textContent=groupName(g);box.appendChild(h)}
    if(x.id===libEdit){box.appendChild(libForm(x));return}
    const used=libUsed(x.id);const b=document.createElement("button");b.className="prog lib-row";
    const th="";b.style.cssText="display:flex;gap:10px;align-items:center;text-align:left";
    b.innerHTML=G?`<span class="sx-mini">${bodySVG(...musOf(x),FS)}</span><span style="display:grid;gap:2px;min-width:0"><b>${esc(x.n)}</b><small>${groupName(groupOf(x))} · ${esc(eqOf(x).map(q=>t((EQ.find(e=>e[0]===q)||[0,q])[1])).join(", "))}</small>${used.length?`<small class="lib-used">${t("ใช้ใน")} ${used.length}</small>`:""}</span>${howBtn(x)}`:`<span class="sx-mini">${bodySVG(...musOf(x),40)}</span><span style="display:grid;gap:2px;min-width:0;flex:1"><b>${x.z||"🔩"} ${esc(x.n)}</b><small>${groupName(groupOf(x))} · ${(x.u||"kg")} · ${used.length?esc(used.join(", ")):t("ยังไม่ได้ใช้ในโปรแกรม")}</small></span>${howBtn(x)}`;
    b.addEventListener("click",()=>{if(libMode){const m=libMode;closeLib();m.onPick(x)}else{libEdit=x.id;renderLib()}});box.appendChild(b)})}
document.getElementById("lib-new").addEventListener("click",()=>{
  EXLIB=EXLIB.filter(libNamed);const x={id:"c"+Date.now().toString(36),n:"",z:"🔩"};if(libGroup!=="all")x.g=libGroup;EXLIB.push(x);libEdit=x.id;renderLib();
  const inp=document.querySelector('#lib-list [data-f="n"]');if(inp){inp.scrollIntoView({block:"center"});inp.focus()}});
document.getElementById("lib-close").addEventListener("click",()=>txLeave(closeLib));
document.getElementById("lib-q").addEventListener("input",ev=>{libQ=ev.target.value;renderLib()});
document.getElementById("lib-open").addEventListener("click",()=>openLib());

/* ---------- muscle picker for one exercise (opened from the exercise editors) ---------- */
function openMusPick(id,name,after){const x=EXLIB.find(q=>q.id===id)||{id,n:name};
  const draw=b=>{const [p,s]=musOf(x);b.querySelector(".mus-fig").innerHTML=bodySVG(p,s,170);
    b.querySelectorAll("[data-mus]").forEach(c=>{const m=c.dataset.mus;c.className="chip mchip "+(p.includes(m)?"p":s.includes(m)?"s":"")})};
  openGen("💪 "+esc(name),`<small class="note">${t("แตะ 1 ครั้ง = หลัก, 2 = รอง, 3 = ไม่โดน")}</small><div class="mus-fig"></div>
    <div class="chips">${MUS_KEYS.map(m=>`<button class="chip mchip" data-mus="${m}">${t(MUS_NAME[m])}</button>`).join("")}</div>
`,b=>{txBegin("gen",{onEnd:()=>{genBack();if(after)after()}});draw(b);
    b.querySelectorAll("[data-mus]").forEach(c=>c.addEventListener("click",()=>{const [p0,s0]=musOf(x),m=c.dataset.mus;let p=p0.filter(q=>q!==m),s=s0.filter(q=>q!==m);
      if(p0.includes(m))s.push(m);else if(!s0.includes(m))p.push(m);
      if(!EXLIB.some(q=>q.id===id)){EXLIB.push({...x});}libUpdate(id,{mp:p,ms:s});x.mp=p;x.ms=s;draw(b);if(after)after()}))})}
