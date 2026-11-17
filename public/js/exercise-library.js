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
const libPick=e=>{const o={id:e.id,n:e.n,z:e.z||"🔩"};if(e.g)o.g=e.g;if(e.u)o.u=e.u;if(e.link)o.link=e.link;return o};
function ensureLib(){let ch=false;const have=new Set(EXLIB.map(x=>x.id));
  [PROGS,DEFAULT_PROGS].forEach(P=>Object.values(P).forEach(p=>p.ex.forEach(e=>{if(!have.has(e.id)){have.add(e.id);EXLIB.push(libPick(e));ch=true}})));return ch}
if(ensureLib())try{localStorage.setItem("exlib",JSON.stringify(EXLIB))}catch(e){}
const libUsed=id=>Object.values(PROGS).filter(p=>p.ex.some(e=>e.id===id)).map(p=>p.name);
function libUpdate(id,patch){const x=EXLIB.find(q=>q.id===id);if(x)Object.assign(x,patch);
  Object.values(PROGS).forEach(p=>p.ex.forEach(e=>{if(e.id===id)Object.assign(e,patch)}));saveProgs();save("exlib",EXLIB)}

let libMode=null,libEdit=null,libGroup="all";         // libMode: null = manage, {skip:Set,onPick:fn} = pick for a program
const libNamed=x=>!!(x.n&&x.n.trim());
function openLib(mode){libMode=mode||null;libEdit=null;libGroup="all";renderLib();document.getElementById("lib-modal").hidden=false}
function closeLib(){const n=EXLIB.length;EXLIB=EXLIB.filter(libNamed);if(EXLIB.length!==n)save("exlib",EXLIB);
  libEdit=null;libMode=null;document.getElementById("lib-modal").hidden=true;renderGym()}
function libDone(x){
  if(!libNamed(x)){toast(t("ใส่ชื่อท่าก่อน"));return}
  if(EXLIB.some(q=>q!==x&&q.n.trim().toLowerCase()===x.n.trim().toLowerCase())){toast(t("มีท่าชื่อนี้อยู่แล้ว"));return}
  libEdit=null;if(libMode){const m=libMode;closeLib();m.onPick(x)}else renderLib()}
function libForm(x){
  const c=document.createElement("div");c.className="ex";const used=libUsed(x.id);
  const fld="width:100%;box-sizing:border-box;background:var(--bg);color:var(--fg);border:1px solid var(--line);border-radius:4px;padding:8px;font:inherit";
  const sel="background:var(--bg);color:var(--fg);border:1px solid var(--line);border-radius:6px;padding:7px;font:inherit;min-width:0";
  c.innerHTML=`<input data-f="n" value="${esc(x.n)}" placeholder="${t("ชื่อท่า")}" aria-label="${t("ชื่อท่า")}" style="${fld}">
    <div class="sets" style="grid-template-columns:1fr 1fr 4.5em"><span class="h">${t("กล้ามเนื้อ")}</span><span class="h">${t("อุปกรณ์")}</span><span class="h">${t("หน่วย")}</span>
      <select data-f="g" aria-label="${t("กล้ามเนื้อ")}" style="${sel}">${GROUPS.map(([v,l])=>`<option value="${v}" ${groupOf(x)===v?"selected":""}>${t(l)}</option>`).join("")}</select>
      <select data-f="z" aria-label="${t("อุปกรณ์")}" style="${sel}">${[["🔩","🔩 "+t("เครื่อง")],["🏋️","🏋️ "+t("ดัมเบล/บาร์")],["🔗","🔗 "+t("เคเบิล")]].map(([v,l])=>`<option value="${v}" ${x.z===v?"selected":""}>${l}</option>`).join("")}</select>
      <select data-f="u" aria-label="${t("หน่วย")}" style="${sel}"><option value="kg" ${(x.u||"kg")==="kg"?"selected":""}>kg</option><option value="lb" ${x.u==="lb"?"selected":""}>lb</option></select></div>
    <input data-f="link" type="url" inputmode="url" value="${esc(x.link||"")}" placeholder="${t("ลิงก์วิธีเล่น (YouTube / TikTok)")}" aria-label="link" style="${fld};font-size:.85rem">
    <div class="zone">${used.length?t("ใช้ใน")+": "+used.map(esc).join(", "):t("ยังไม่ได้ใช้ในโปรแกรม")}</div>
    <div class="actions"><button class="btn sm ghost" data-del>${t("ลบท่า")}</button><button class="btn sm primary" data-done style="margin-left:auto">${t("เสร็จ")}</button></div>`;
  const on=(s,ev,fn)=>c.querySelector(s).addEventListener(ev,fn);
  on('[data-f="n"]',"input",ev=>{const v=ev.target.value.trim();if(v||!libUsed(x.id).length)libUpdate(x.id,{n:v})});
  on('[data-f="g"]',"change",ev=>libUpdate(x.id,{g:ev.target.value}));
  on('[data-f="z"]',"change",ev=>libUpdate(x.id,{z:ev.target.value}));
  on('[data-f="u"]',"change",ev=>libUpdate(x.id,{u:ev.target.value}));
  on('[data-f="link"]',"change",ev=>{const v=ev.target.value.trim();if(v&&!safeUrl(v)){toast(t("ลิงก์ต้องขึ้นต้นด้วย https://"));return}libUpdate(x.id,{link:v})});
  on("[data-done]","click",()=>libDone(x));
  on("[data-del]","click",ev=>{const b=ev.target;
    if(libUsed(x.id).length){toast(t("ยังใช้อยู่ในโปรแกรม ลบออกจากโปรแกรมก่อน"));return}
    if(libNamed(x)&&!b.dataset.sure){b.dataset.sure=1;b.textContent=t("กดอีกครั้งเพื่อยืนยัน");return}
    EXLIB=EXLIB.filter(q=>q!==x);save("exlib",EXLIB);libEdit=null;renderLib();if(libNamed(x))toast(t("ลบท่าแล้ว"))});
  return c}
function renderLib(){
  document.getElementById("lib-title").textContent=t(libMode?"เลือกท่า":"คลังท่า");
  const box=document.getElementById("lib-list");box.innerHTML="";
  const all=EXLIB.filter(x=>x.id===libEdit||!libMode||!libMode.skip.has(x.id));
  const count={};all.forEach(x=>{const g=groupOf(x);count[g]=(count[g]||0)+1});
  const chips=document.getElementById("lib-groups");chips.innerHTML="";
  [["all","ทั้งหมด"],...GROUPS].forEach(([g,l])=>{if(g!=="all"&&!count[g])return;const b=document.createElement("button");b.className="chip";b.setAttribute("aria-pressed",libGroup===g);
    b.textContent=`${t(l)} ${g==="all"?all.length:count[g]}`;b.addEventListener("click",()=>{libGroup=g;renderLib()});chips.appendChild(b)});
  const order=g=>GROUPS.findIndex(q=>q[0]===g);
  const items=all.filter(x=>x.id===libEdit||libGroup==="all"||groupOf(x)===libGroup).sort((a,b)=>order(groupOf(a))-order(groupOf(b))||(a.n||"").localeCompare(b.n||""));
  const hint=document.createElement("p");hint.className="note";
  hint.textContent=t(!all.length?"ไม่มีท่าอื่นให้เลือก สร้างท่าใหม่ได้เลย":!items.length?"ไม่มีท่าในหมวดนี้":libMode?"แตะท่าเพื่อเลือก":"แตะท่าเพื่อแก้ไข");box.appendChild(hint);
  let lastG=null;
  items.forEach(x=>{const g=groupOf(x);if(libGroup==="all"&&g!==lastG){lastG=g;const h=document.createElement("div");h.className="pick-h";h.textContent=groupName(g);box.appendChild(h)}
    if(x.id===libEdit){box.appendChild(libForm(x));return}
    const used=libUsed(x.id);const b=document.createElement("button");b.className="prog lib-row";
    b.innerHTML=`<b>${x.z||"🔩"} ${esc(x.n)}</b><small>${groupName(groupOf(x))} · ${(x.u||"kg")} · ${used.length?esc(used.join(", ")):t("ยังไม่ได้ใช้ในโปรแกรม")}</small>`;
    b.addEventListener("click",()=>{if(libMode){const m=libMode;closeLib();m.onPick(x)}else{libEdit=x.id;renderLib()}});box.appendChild(b)})}
document.getElementById("lib-new").addEventListener("click",()=>{
  EXLIB=EXLIB.filter(libNamed);const x={id:"c"+Date.now().toString(36),n:"",z:"🔩"};if(libGroup!=="all")x.g=libGroup;EXLIB.push(x);libEdit=x.id;renderLib();
  const inp=document.querySelector('#lib-list [data-f="n"]');if(inp){inp.scrollIntoView({block:"center"});inp.focus()}});
document.getElementById("lib-close").addEventListener("click",closeLib);
document.getElementById("lib-open").addEventListener("click",()=>openLib());
