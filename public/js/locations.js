// locations.js — places you train (gym / condo …): equipment, programs per place, picker, editor, copy/move programs
// Classic script: shares globals with the other files in /js (load order is set in index.html). Loaded before programs.js.
Object.assign(EN,{"วันนี้ออกที่ไหน?":"Where today?","เพิ่มสถานที่":"Add place","แก้ไขสถานที่":"Edit place","ล่าสุด":"Last","แปลงแล้ว":"Swapped",
  "คัดลอกไป…":"Copy to…","ย้ายไป…":"Move to…","ลบสถานที่นี้?":"Delete this place?","ลบสถานที่นี้":"Delete this place","อุปกรณ์":"Equipment","ชื่อสถานที่":"Place name",
  "ลิงก์ Google Maps":"Google Maps link","ใช้ตำแหน่งปัจจุบัน":"Use current location","ดัมเบลหนักสุด (kg)":"Heaviest dumbbell (kg)","บันทึก":"Save","แผนที่":"Map",
  "ต้องมีอย่างน้อย 1 สถานที่":"Keep at least one place","ไม่มีท่าแทน → ตัดออก":"No substitute → removed","คัดลอก":"Copy","ย้าย":"Move","คัดลอก แล้วแก้ต่อ":"Copy, then edit",
  "ย้าย แล้วแก้ต่อ":"Move, then edit","ไม่มีสถานที่อื่น":"No other place","ท่าหลักย้ายไม่ได้ ใช้คัดลอกแทน":"Locked lifts can't move — copy instead","ยังไม่เคยเล่นที่นี่":"Not trained here yet",
  "ที่นี่":"Here","ยิม":"Gym","คอนโด":"Condo","สถานที่":"Place","เปลี่ยน":"Change","เลือกโปรแกรม":"Pick a program","ไม่มีโปรแกรมในตารางวันนี้ที่นี่":"Nothing scheduled here today","ดูโปรแกรม":"See programs","วันพัก · ออกได้ถ้าอยากออก":"Rest day · train if you like","หาตำแหน่งไม่ได้":"Couldn't get location",
  "ดัมเบล":"Dumbbells","บาร์เบล":"Barbell","เคเบิล":"Cable","เครื่อง":"Machines","ม้านั่ง":"Bench","บาร์โหน":"Pull-up bar","ยางยืด":"Bands","ตัวเปล่า":"Bodyweight"});
const EQ=[["db","ดัมเบล"],["bb","บาร์เบล"],["cable","เคเบิล"],["machine","เครื่อง"],["bench","ม้านั่ง"],["bar","บาร์โหน"],["band","ยางยืด"],["body","ตัวเปล่า"]];
const EQ_ALL=EQ.map(q=>q[0]);
const TYPES=[["gym","🏋️ เวท"],["cardio","🏃 คาร์ดิโอ"]];
Object.assign(EN,{"เวท":"Weights","คาร์ดิโอ":"Cardio","ประเภทโปรแกรม":"Program types","สนามแบด":"Badminton court","วันนี้:":"Today:","เปลี่ยนที่":"Change place","แทน":"for",
  "เลื่อนขึ้น":"Move up","เลื่อนลง":"Move down","ลบโปรแกรม":"Delete program","วันในตาราง":"Days","ระยะ + เวลา":"Distance + time","✓ ทำแล้ว":"✓ Done","เป้าหมาย (km)":"Goal (km)",
  "โปรแกรมคาร์ดิโอ":"Cardio program","เพิ่มโปรแกรมที่":"Add program at","ท่า · เซ็ต · ครั้ง":"Exercises · sets · reps","บันทึกระยะ/เวลา หรือ ✓":"Log distance/time or ✓",
  "ชื่อโปรแกรม":"Program name","บันทึก…":"Log…","ที่นี่มีโปรแกรม":"Programs here","ลบ?":"Delete?"});
const WD=["อา","จ","อ","พ","พฤ","ศ","ส"],WD_EN=["Su","Mo","Tu","We","Th","Fr","Sa"];
const typesOf=l=>(l&&l.types)||(l&&l.act?[...(l.act.includes("gym")?["gym"]:[]),...(l.act.some(a=>a!=="gym")?["cardio"]:[])]:["gym","cardio"]);
const hasType=(l,ty)=>typesOf(l).includes(ty);
const isCardio=p=>!!p&&p.kind==="cardio";
const weightsHere=()=>progsHere().filter(k=>!isCardio(PROGS[k]));
const cardioHere=()=>progsHere().filter(k=>isCardio(PROGS[k]));
// weekdays a program is scheduled on (own list, else the old fixed week by slot)
const daysOf=(k,p)=>{p=p||PROGS[k];if(!p)return [];if(Array.isArray(p.days))return p.days;const s=slotOf(k,p);return Object.keys(WEEK).filter(d=>WEEK[d]===s).map(Number)};
const planKeys=ds=>{const wd=new Date(ds+"T12:00:00").getDay();return Object.keys(PROGS).filter(k=>k!=="free"&&daysOf(k).includes(wd))};
// cardio state lives in the day's food tags (run / bad keep their old tags so meals and history still work; others in tags.cx)
const fsOf=ds=>(food[ds]||{}).tags||{};
function cxGet(k,ds){const p=PROGS[k],tg=fsOf(ds||DAY);if(!p)return null;if(p.tag==="run")return tg.run?(tg.runData||{}):null;if(p.tag==="bad")return tg.bad?{}:null;const v=(tg.cx||{})[k];return v?(v===true?{}:v):null}
function cxSet(k,val){const p=PROGS[k],tg=fs().tags;if(p.tag==="run"){tg.run=!!val;if(val){tg.runData=val.km?{km:val.km,sec:val.sec}:null;tg.runLoc=curLoc}else delete tg.runData}
  else if(p.tag==="bad"){tg.bad=!!val;if(val)tg.badLoc=curLoc}else{tg.cx=tg.cx||{};if(val)tg.cx[k]={...val,loc:curLoc};else delete tg.cx[k]}save("mealcheck",food)}
const cxTxt=(k,v)=>v&&v.km?`${v.km} km · ${fmtPace(v.sec/v.km)}/km`:"✓ "+t("บันทึกแล้ว");
const cxAny=ds=>{const tg=fsOf(ds);return !!(tg.run||tg.bad||Object.keys(tg.cx||{}).length)};
// today's plan: the scheduled program at this place first, else anywhere
function planAct(){const k=planFor(DAY);return !k?null:isCardio(PROGS[k])?"cardio":"gym"}
function planDone(){return logs.some(l=>l.date===DAY)||cxAny(DAY)}
// "อ. · อก ไหล่ แขน ขา": weekday prefix kept from the old text, groups rebuilt from the exercises actually in the program
function descFor(p){const pre=(p.sub||"").split(" · ")[0];const g=[...new Set(p.ex.map(e=>groupOf(e)).filter(x=>x!=="other").map(groupName))].join(" ");return (pre&&pre.length<=4?pre+" · ":"")+g}
// equipment each default exercise needs
const EQ_DEF={"chest-press":["machine"],"pec-fly":["machine"],"incline-db":["db","bench"],"db-shoulder-press":["db","bench"],"cable-lat-raise":["cable"],"cable-oh-tri":["cable"],
  "leg-ext":["machine"],"leg-curl":["machine"],"lat-pulldown":["machine"],"wide-cable-row":["cable"],"seated-cable-row":["cable"],"squat":["bb"],"deadlift":["bb"],"reverse-fly":["machine"],
  "machine-curl":["machine"],"abdominal":["machine"],"seated-calf":["machine"],"hip-add":["machine"],"hip-abd":["machine"],"woodchop":["cable"]};
// dumbbell / bodyweight substitutes (same muscles)
const SUB_EX={
  "db-bench":{n:"Dumbbell Bench Press",z:"🏋️",eq:["db","bench"],mp:["chest"],ms:["tri","delt"]},
  "db-fly":{n:"Dumbbell Fly",z:"🏋️",eq:["db","bench"],mp:["chest"],ms:["delt"]},
  "db-lat-raise":{n:"Dumbbell Lateral Raise",z:"🏋️",eq:["db"],mp:["delt"],ms:[]},
  "db-oh-tri":{n:"Dumbbell Overhead Triceps Extension",z:"🏋️",eq:["db"],mp:["tri"],ms:[]},
  "db-split-squat":{n:"Dumbbell Bulgarian Split Squat",z:"🏋️",eq:["db","bench"],mp:["quad"],ms:["glute"]},
  "db-rdl":{n:"Dumbbell Romanian Deadlift",z:"🏋️",eq:["db"],mp:["ham"],ms:["glute"]},
  "db-pullover":{n:"Dumbbell Pullover",z:"🏋️",eq:["db","bench"],mp:["lats"],ms:["chest"]},
  "db-row":{n:"One-Arm Dumbbell Row",z:"🏋️",eq:["db"],mp:["lats"],ms:["bi","rear"]},
  "db-cs-row":{n:"Chest-Supported Dumbbell Row",z:"🏋️",eq:["db","bench"],mp:["lats","traps"],ms:["bi"]},
  "goblet-squat":{n:"Goblet Squat",z:"🏋️",eq:["db"],mp:["quad","glute"],ms:[]},
  "db-rev-fly":{n:"Bent-Over Dumbbell Reverse Fly",z:"🏋️",eq:["db"],mp:["rear"],ms:["traps"]},
  "db-curl":{n:"Dumbbell Curl",z:"🏋️",eq:["db"],mp:["bi"],ms:["fore"]},
  "crunch":{n:"Crunch",z:"🤸",eq:["body"],mp:["abs"],ms:[]},
  "db-woodchop":{n:"Dumbbell Wood Chop",z:"🏋️",eq:["db"],mp:["obl"],ms:["abs"]},
  "db-calf":{n:"Dumbbell Calf Raise",z:"🏋️",eq:["db"],mp:["calf"],ms:[]},
  "side-hip-add":{n:"Side-Lying Hip Adduction",z:"🤸",eq:["body"],mp:["add"],ms:[]},
  "side-hip-abd":{n:"Side-Lying Hip Abduction",z:"🤸",eq:["body"],mp:["abd"],ms:[]}};
const SUB_DEF={"chest-press":["db-bench"],"pec-fly":["db-fly"],"cable-lat-raise":["db-lat-raise"],"cable-oh-tri":["db-oh-tri"],"leg-ext":["db-split-squat","goblet-squat"],
  "leg-curl":["db-rdl"],"lat-pulldown":["db-pullover","db-row"],"wide-cable-row":["db-row"],"seated-cable-row":["db-cs-row","db-row"],"squat":["goblet-squat"],"deadlift":["db-rdl"],
  "reverse-fly":["db-rev-fly"],"machine-curl":["db-curl"],"abdominal":["crunch"],"woodchop":["db-woodchop"],"seated-calf":["db-calf"],"hip-add":["side-hip-add"],"hip-abd":["side-hip-abd"]};
const COURT=()=>({id:"court",name:"สนามแบด",icon:"🏸",map:"",eq:["body"],act:["bad"]});
const DEF_LOCS=()=>[{id:"gym",name:"ยิม",icon:"🏢",map:"",eq:EQ_ALL.slice(),act:["gym","run"]},{id:"condo",name:"คอนโด",icon:"🏠",map:"",eq:["db","bench","body"],act:["gym","run"]},COURT()];
let LOCS=load("locs",null);
let locDay=load("locday",{});                        // {date,id}: the place picked for that day
let curLoc=locDay.id||"gym";
const locById=id=>(LOCS||[]).find(l=>l.id===id);
const locName=id=>{const l=locById(id);return l?t(l.name):"?"};
const hereLoc=()=>locById(curLoc)||(LOCS||[])[0]||DEF_LOCS()[0];
const locOf=p=>(p&&p.loc)||"gym";
const logLoc=l=>l.loc||locOf(PROGS[l.prog]);
const progsHere=()=>Object.keys(PROGS).filter(k=>k!=="free"&&locOf(PROGS[k])===curLoc);
const slotOf=(k,p)=>(p&&p.slot)||k;
function slotKeyAt(s,loc){if(!s||!loc)return null;return Object.keys(PROGS).find(k=>k!=="free"&&locOf(PROGS[k])===loc&&slotOf(k,PROGS[k])===s)||null}
function slotKey(s){return slotKeyAt(s,curLoc)}
// equipment an exercise needs: own setting → default map → catalog text → icon
function eqOf(x){if(!x)return [];if(Array.isArray(x.eq))return x.eq;if(EQ_DEF[x.id])return EQ_DEF[x.id];if(SUB_EX[x.id])return SUB_EX[x.id].eq;
  const lib=(typeof EXLIB!=="undefined"&&EXLIB.find(q=>q.id===x.id))||{};if(Array.isArray(lib.eq))return lib.eq;
  const e=((x.e||lib.e||((typeof catOf==="function"&&catOf(x))||{}).e)||"").toLowerCase();
  if(e){if(/dumbbell/.test(e))return ["db"];if(/barbell|ez/.test(e))return ["bb"];if(/cable/.test(e))return ["cable"];if(/band/.test(e))return ["band"];if(/body/.test(e))return ["body"];return ["machine"]}
  const z=x.z||lib.z;return z==="🔗"?["cable"]:z==="🏋️"?["db"]:z==="🤸"?["body"]:["machine"]}
const canDo=(x,loc)=>{const have=new Set((loc||hereLoc()).eq.concat("body"));return eqOf(x).every(q=>have.has(q))};
function subExObj(id){const lib=typeof EXLIB!=="undefined"&&EXLIB.find(q=>q.id===id);if(lib)return lib;const s=SUB_EX[id];return s?{id,n:s.n,z:s.z,mp:s.mp,ms:s.ms,eq:s.eq}:null}
// best substitute for e at loc: own list → default list → any library exercise with the same primary muscle
function subFor(e,loc){const lib=(typeof EXLIB!=="undefined"&&EXLIB.find(q=>q.id===e.id))||{};
  for(const id of (lib.sub||[]).concat(SUB_DEF[e.id]||[])){const x=subExObj(id);if(x&&canDo(x,loc))return x}
  if(typeof musOf!=="function"||typeof EXLIB==="undefined")return null;const pm=(musOf(e)[0]||[])[0];if(!pm)return null;
  return EXLIB.find(x=>x.id!==e.id&&canDo(x,loc)&&(musOf(x)[0]||[])[0]===pm)||null}
// convert a program's exercises for loc: keep, swap (marked), or drop
function convertEx(ex,loc){const out=[],log=[];ex.forEach(e=>{if(canDo(e,loc)){out.push(JSON.parse(JSON.stringify(e)));return}
  const s=subFor(e,loc);if(!s||out.some(o=>o.id===s.id)){log.push([e,null]);return}
  const o={id:s.id,n:s.n,z:s.z||"🏋️",s:e.s,r:e.r,swap:e.id,swapN:e.n};["g","mp","ms","u","link","gif"].forEach(f=>{if(s[f])o[f]=s[f]});out.push(o);log.push([e,s])});return {ex:out,log}}
function addSubsToLib(ex){if(typeof EXLIB==="undefined")return false;let ch=false;ex.forEach(e=>{if(!EXLIB.some(q=>q.id===e.id)&&SUB_EX[e.id]){EXLIB.push(subExObj(e.id));ch=true}});return ch}
// first run: gym = everything that exists; condo = Push/Pull A/B converted to dumbbells
function ensureLocs(){if(LOCS&&LOCS.length){if(LOCS.some(l=>l.act))return false;
    // places from before activities existed: weights + run everywhere, add a badminton court, rewrite converted programs' text
    LOCS.forEach(l=>l.act=["gym","run"]);LOCS.push(COURT());Object.values(PROGS).forEach(p=>{if(locOf(p)!=="gym"&&p.ex.some(e=>e.swap))p.sub=descFor(p)});
    try{localStorage.setItem("locs",JSON.stringify(LOCS))}catch(e){}return true}
  LOCS=DEF_LOCS();const condo=LOCS[1];
  ["push","pull","push2","pull2"].forEach(k=>{const p=PROGS[k];if(!p||locOf(p)!=="gym")return;const c=convertEx(p.ex,condo).ex;
    PROGS["c-"+k]={name:p.name,sub:p.sub||"",loc:"condo",slot:k,ex:c};PROGS["c-"+k].sub=descFor(PROGS["c-"+k])});
  try{localStorage.setItem("locs",JSON.stringify(LOCS))}catch(e){}return true}
// v3: places get program types; every program gets its weekdays; run / badminton become cardio programs
function ensureV3(){if(LOCS.every(l=>l.types)&&Object.values(PROGS).some(p=>Array.isArray(p.days)))return false;
  LOCS.forEach(l=>{const a=l.act||["gym","run"];l.types=typesOf(l);
    if(a.includes("run")&&!Object.values(PROGS).some(p=>p.tag==="run"&&p.loc===l.id))PROGS["cr-"+l.id]={name:t("วิ่ง")+" 10 km",kind:"cardio",icon:"🏃",tag:"run",track:"dist",goal:10,loc:l.id,ex:[],days:[1]};
    if(a.includes("bad")&&!Object.values(PROGS).some(p=>p.tag==="bad"&&p.loc===l.id))PROGS["cb-"+l.id]={name:t("ตีแบด"),kind:"cardio",icon:"🏸",tag:"bad",track:"done",loc:l.id,ex:[],days:[4]};
    if(!l.types.includes("cardio")&&(a.includes("run")||a.includes("bad")))l.types.push("cardio");delete l.act});
  Object.keys(PROGS).forEach(k=>{if(k!=="free"&&!Array.isArray(PROGS[k].days))PROGS[k].days=daysOf(k)});
  try{localStorage.setItem("locs",JSON.stringify(LOCS))}catch(e){}return true}
function saveLocs(){save("locs",LOCS);setProgsRev(Date.now());if(typeof markDirty==="function")markDirty("progs")}
function pickLoc(id){curLoc=id;locDay={date:TODAY,id};save("locday",locDay);if(!picked){cur=nextProg();chosen=false;draft.ex={};draft.prog=cur;save("gymdraft",draft)}renderGym()}
const needPick=()=>DAY===TODAY&&locDay.date!==TODAY&&!picked&&!editing&&!planDone();
const nProgs=n=>lang==="th"?`${n} โปรแกรม`:`${n} program${n===1?"":"s"}`;
function renderLocHead(){const h=document.getElementById("lochead");if(!h)return;const L=hereLoc();
  h.innerHTML=`<b>${esc(L.icon||"📍")} ${esc(t(L.name))}</b>${picked?"":`<button class="btn sm" data-lc>${t("เปลี่ยน")}</button>`}`;const b=h.querySelector("[data-lc]");if(b)b.addEventListener("click",openLocChange)}
const eqSum=l=>l.eq.filter(q=>q!=="body").map(q=>t((EQ.find(x=>x[0]===q)||[0,q])[1])).join(" · ")+(l.dbMax&&l.eq.includes("db")?` ≤ ${l.dbMax} kg`:"")||t("ตัวเปล่า");
const mapUrl=m=>{m=(m||"").trim();if(!m)return "";return /^https?:\/\//.test(m)?safeUrl(m):"https://maps.google.com/?q="+encodeURIComponent(m)};
function renderLocPick(){const box=document.getElementById("locpick");if(!box)return;const show=needPick();box.hidden=!show;document.getElementById("v-gym").classList.toggle("picking",show);document.body.classList.toggle("loc-picking",show);renderLocHead();if(!show)return;
  const lastId=locDay.id||curLoc,todayAt=l=>planKeys(DAY).find(k=>locOf(PROGS[k])===l.id);
  const list=LOCS.slice().sort((x,y)=>(!!todayAt(y)-!!todayAt(x))||((y.id===lastId)-(x.id===lastId)));
  box.innerHTML=`<h1 class="lp-h">${t("วันนี้ออกที่ไหน?")}</h1><div class="date">${thDate(DAY,{weekday:"short",day:"numeric",month:"short"})}${planKeys(DAY).length?"":" · "+t("วันพัก · ออกได้ถ้าอยากออก")}</div>`+list.map(l=>{const k=todayAt(l),p=k&&PROGS[k],n=Object.keys(PROGS).filter(q=>q!=="free"&&locOf(PROGS[q])===l.id).length;
    const line=p?`${isCardio(p)?(p.icon||"🏃"):"▶"} ${esc(p.name)}${isCardio(p)?"":" · "+nU(p.ex.length,"ท่า")} · ${t("วันนี้")}`:nProgs(n);
    return `<div class="lp-card${l.id===lastId?" on":""}" role="button" tabindex="0" data-loc="${esc(l.id)}"><span class="lp-ic">${esc(l.icon||"📍")}</span><span class="lp-tx"><span class="lp-top"><b>${esc(t(l.name))}</b>${l.id===lastId?`<span class="pill">${t("ล่าสุด")}</span>`:""}</span><small>${line}</small></span><span class="lp-more" role="button" tabindex="0" data-locedit="${esc(l.id)}" aria-label="${t("แก้ไขสถานที่")}">•••</span></div>`}).join("")
    +`<button class="btn lp-add" data-locadd>+ ${t("เพิ่มสถานที่")}</button>`;
  box.querySelectorAll("[data-loc]").forEach(c=>c.addEventListener("click",ev=>{if(ev.target.closest("[data-map]"))return;const ed=ev.target.closest("[data-locedit]");if(ed){openLocEdit(ed.dataset.locedit);return}pickLoc(c.dataset.loc)}));
  box.querySelector("[data-locadd]").addEventListener("click",()=>openLocEdit(null))}
function openLocChange(){locDay={};save("locday",locDay);renderGym();scrollAppTop()}
function openLocEdit(id){const isNew=!id,l=isNew?{id:"l"+Date.now().toString(36),name:"",icon:"📍",map:"",eq:["db","body"],types:["gym","cardio"]}:JSON.parse(JSON.stringify(locById(id)));
  openGen(t(isNew?"เพิ่มสถานที่":"แก้ไขสถานที่"),`<div class="le">
    <div class="le-row"><input class="le-in le-ic" data-f="icon" value="${esc(l.icon||"")}" maxlength="4" aria-label="icon"><input class="le-in" data-f="name" value="${esc(l.name)}" placeholder="${t("ชื่อสถานที่")}" aria-label="${t("ชื่อสถานที่")}"></div>
    <input class="le-in" data-f="map" value="${esc(l.map||"")}" placeholder="📍 ${t("ลิงก์ Google Maps")}" aria-label="${t("ลิงก์ Google Maps")}">
    <button class="btn sm" data-geo style="justify-self:start">📍 ${t("ใช้ตำแหน่งปัจจุบัน")}</button>
    <div class="label" style="margin:4px 0 0">${t("ประเภทโปรแกรม")}</div>
    <div class="chips" data-act>${TYPES.map(([k,n])=>`<button class="chip" data-a="${k}" aria-pressed="${typesOf(l).includes(k)}">${t(n.slice(n.indexOf(" ")+1))}</button>`).join("")}</div>
    <div class="le-eq"><div class="label" style="margin:4px 0 0">${t("อุปกรณ์")}</div>
    <div class="chips" data-eq>${EQ.map(([k,n])=>`<button class="chip" data-q="${k}" aria-pressed="${k==="body"||l.eq.includes(k)}"${k==="body"?" disabled":""}>${t(n)}</button>`).join("")}</div>
    <label class="le-row" style="justify-content:space-between">${t("ดัมเบลหนักสุด (kg)")}<input class="le-in" data-f="dbMax" type="number" inputmode="decimal" value="${l.dbMax||""}" style="width:90px;text-align:right"></label></div>
    <button class="btn primary" data-save>${t("บันทึก")}</button>${isNew?"":`<button class="btn ghost warn" data-del>${t("ลบสถานที่นี้")}</button>`}<button class="btn" data-gen-close>${t("ปิด")}</button></div>`,b=>{
    b.querySelectorAll("[data-q],[data-a]").forEach(c=>c.addEventListener("click",()=>{if(c.disabled)return;c.setAttribute("aria-pressed",c.getAttribute("aria-pressed")!=="true");eqVis()}));
    const eqVis=()=>{b.querySelector(".le-eq").hidden=b.querySelector('[data-a="gym"]').getAttribute("aria-pressed")!=="true"};eqVis();
    b.querySelector("[data-geo]").addEventListener("click",()=>{if(!navigator.geolocation){toast(t("หาตำแหน่งไม่ได้"));return}
      navigator.geolocation.getCurrentPosition(p=>{b.querySelector('[data-f="map"]').value=`https://maps.google.com/?q=${p.coords.latitude.toFixed(5)},${p.coords.longitude.toFixed(5)}`},()=>toast(t("หาตำแหน่งไม่ได้")),{timeout:10000})});
    b.querySelector("[data-save]").addEventListener("click",()=>{const v=f=>b.querySelector(`[data-f="${f}"]`).value.trim();
      l.name=v("name")||t("สถานที่");l.icon=v("icon")||"📍";l.map=v("map");const m=+v("dbMax");if(m>0)l.dbMax=m;else delete l.dbMax;
      l.types=[...b.querySelectorAll("[data-a]")].filter(c=>c.getAttribute("aria-pressed")==="true").map(c=>c.dataset.a);if(!l.types.length)l.types=["gym"];delete l.act;
      l.eq=[...b.querySelectorAll("[data-q]")].filter(c=>c.getAttribute("aria-pressed")==="true").map(c=>c.dataset.q);
      const i=LOCS.findIndex(q=>q.id===l.id);if(i>=0)LOCS[i]=l;else LOCS.push(l);saveLocs();closeGen();renderGym()});
    const d=b.querySelector("[data-del]");if(d)d.addEventListener("click",()=>{if(LOCS.length<2){toast(t("ต้องมีอย่างน้อย 1 สถานที่"));return}
      if(!d.dataset.sure){d.dataset.sure=1;d.textContent=t("ลบสถานที่นี้?");return}
      LOCS=LOCS.filter(q=>q.id!==l.id);Object.keys(PROGS).forEach(k=>{if(k!=="free"&&locOf(PROGS[k])===l.id)delete PROGS[k]});saveProgs();saveLocs();
      if(curLoc===l.id){curLoc=LOCS[0].id;locDay={};save("locday",locDay);cur=nextProg()}closeGen();renderGym()})})}
function closeGen(){document.getElementById("gen-sheet").hidden=true}
// copy / move a program to another place, converting exercises the target can't do
function openProgMove(k,m0){const p=PROGS[k],others=LOCS.filter(l=>l.id!==locOf(p));if(!others.length){toast(t("ไม่มีสถานที่อื่น"));return}
  let to=others[0].id,mode=m0||"copy";
  const draw=b=>{const L=locById(to),{log}=convertEx(p.ex,L);
    b.querySelector("[data-prev]").innerHTML=log.length?log.map(([e,s])=>`<div class="mv-row"><span>${esc(e.n)}</span><span>→ ${s?`<b>${esc(s.n)}</b>`:`<i>${t("ไม่มีท่าแทน → ตัดออก")}</i>`}</span></div>`).join(""):`<small class="note">✓ ${nU(p.ex.length,"ท่า")}</small>`;
    b.querySelectorAll("[data-to]").forEach(c=>c.setAttribute("aria-pressed",c.dataset.to===to));b.querySelectorAll("[data-mode]").forEach(c=>c.setAttribute("aria-pressed",c.dataset.mode===mode));
    b.querySelector("[data-go]").textContent=t(mode==="copy"?"คัดลอก แล้วแก้ต่อ":"ย้าย แล้วแก้ต่อ")};
  openGen(`${esc(p.name)} → ${t("สถานที่")}`,`<div class="chips">${others.map(l=>`<button class="chip" data-to="${esc(l.id)}">${esc(l.icon||"📍")} ${esc(t(l.name))}</button>`).join("")}</div>
    <div class="mv" data-prev></div><div class="chips"><button class="chip" data-mode="copy">${t("คัดลอก")}</button><button class="chip" data-mode="move">${t("ย้าย")}</button></div>
    <button class="btn primary" data-go></button><button class="btn" data-gen-close>${t("ปิด")}</button>`,b=>{draw(b);
    b.querySelectorAll("[data-to]").forEach(c=>c.addEventListener("click",()=>{to=c.dataset.to;draw(b)}));
    b.querySelectorAll("[data-mode]").forEach(c=>c.addEventListener("click",()=>{mode=c.dataset.mode;draw(b)}));
    b.querySelector("[data-go]").addEventListener("click",()=>{if(mode==="move"&&p.ex.some(e=>isLocked(k,e))){toast("🔒 "+t("ท่าหลักย้ายไม่ได้ ใช้คัดลอกแทน"));return}
      const L=locById(to),ex=convertEx(p.ex,L).ex,slot=slotOf(k,p),taken=Object.keys(PROGS).some(q=>q!==k&&locOf(PROGS[q])===to&&slotOf(q,PROGS[q])===slot);
      const nk="p"+Date.now().toString(36),np={name:p.name,sub:p.sub||"",loc:to,ex};if(ex.some(e=>e.swap))np.sub=descFor(np);if(!taken&&/^(push|pull)/.test(slot))np.slot=slot;
      if(addSubsToLib(ex))save("exlib",EXLIB);PROGS[nk]=np;if(mode==="move")delete PROGS[k];saveProgs();
      if(mode==="move"&&cur===k){cur=nextProg()}closeGen();curLoc=to;locDay={date:TODAY,id:to};save("locday",locDay);
      pmOnly=nk;pmFromList=false;renderPM();document.getElementById("pm-modal").hidden=false;renderGym()})})}
/* ---------- add program (weights / cardio) + cardio program editor + schedule days ---------- */
const dayChips=(sel)=>`<div class="chips days" data-days>${[1,2,3,4,5,6,0].map(d=>`<button class="chip" data-d="${d}" aria-pressed="${sel.includes(d)}">${lang==="th"?WD[d]:WD_EN[d]}</button>`).join("")}</div>`;
const readDays=b=>[...b.querySelectorAll("[data-d]")].filter(c=>c.getAttribute("aria-pressed")==="true").map(c=>+c.dataset.d);
function bindToggle(b,sel){b.querySelectorAll(sel).forEach(c=>c.addEventListener("click",()=>c.setAttribute("aria-pressed",c.getAttribute("aria-pressed")!=="true")))}
function newWeights(){const k="p"+Date.now().toString(36);PROGS[k]={name:t("โปรแกรมใหม่"),sub:"",ex:[],loc:curLoc,days:[]};saveProgs();renderGym();
  pmOnly=k;pmFromList=false;renderPM();document.getElementById("pm-modal").hidden=false;const n=document.querySelector('#pm-body [data-f="name"]');if(n){n.focus();n.select()}}
function openAddProg(){const L=hereLoc(),ty=typesOf(L);if(ty.length===1){ty[0]==="gym"?newWeights():openCardioEdit(null);return}
  openGen(`${t("เพิ่มโปรแกรมที่")} ${esc(L.icon||"📍")} ${esc(t(L.name))}`,`<div class="pm-menu"><button class="menu-row" data-ty="gym"><span class="mi">🏋️</span><span class="mt">${t("เวท")}<small>${t("ท่า · เซ็ต · ครั้ง")}</small></span></button>
    <button class="menu-row" data-ty="cardio"><span class="mi">🏃</span><span class="mt">${t("คาร์ดิโอ")}<small>${t("บันทึกระยะ/เวลา หรือ ✓")}</small></span></button></div><button class="btn" data-gen-close>${t("ปิด")}</button>`,
    b=>b.querySelectorAll("[data-ty]").forEach(c=>c.addEventListener("click",()=>{closeGen();c.dataset.ty==="gym"?newWeights():openCardioEdit(null)})))}
function openCardioEdit(k){const isNew=!k,p=isNew?{name:"",icon:"🏃",kind:"cardio",track:"dist",ex:[],loc:curLoc,days:[]}:PROGS[k];
  openGen(t("โปรแกรมคาร์ดิโอ"),`<div class="le">
    <div class="le-row"><input class="le-in le-ic" data-f="icon" value="${esc(p.icon||"")}" maxlength="4" aria-label="icon"><input class="le-in" data-f="name" value="${esc(p.name)}" placeholder="${t("ชื่อโปรแกรม")}" aria-label="${t("ชื่อโปรแกรม")}"></div>
    <div class="label" style="margin:4px 0 0">${t("บันทึก")}</div>
    <div class="chips"><button class="chip" data-tr="dist" aria-pressed="${p.track!=="done"}">${t("ระยะ + เวลา")}</button><button class="chip" data-tr="done" aria-pressed="${p.track==="done"}">${t("✓ ทำแล้ว")}</button></div>
    <label class="le-row le-goal" style="justify-content:space-between">${t("เป้าหมาย (km)")}<input class="le-in" data-f="goal" type="number" inputmode="decimal" value="${p.goal||""}" style="width:90px;text-align:right"></label>
    <div class="label" style="margin:4px 0 0">${t("วันในตาราง")}</div>${dayChips(p.days||[])}
    <button class="btn primary" data-save>${t("บันทึก")}</button>${isNew?"":`<button class="btn ghost warn" data-del>${t("ลบโปรแกรม")}</button>`}<button class="btn" data-gen-close>${t("ปิด")}</button></div>`,b=>{
    let tr=p.track==="done"?"done":"dist";const vis=()=>{b.querySelectorAll("[data-tr]").forEach(c=>c.setAttribute("aria-pressed",c.dataset.tr===tr));b.querySelector(".le-goal").hidden=tr!=="dist"};vis();
    b.querySelectorAll("[data-tr]").forEach(c=>c.addEventListener("click",()=>{tr=c.dataset.tr;vis()}));bindToggle(b,"[data-d]");
    b.querySelector("[data-save]").addEventListener("click",()=>{const v=f=>b.querySelector(`[data-f="${f}"]`).value.trim();const name=v("name");if(!name){toast(t("ใส่ชื่อท่าก่อน"));return}
      const q=isNew?p:PROGS[k];q.name=name;q.icon=v("icon")||"🏃";q.track=tr;const g=+v("goal");if(tr==="dist"&&g>0)q.goal=g;else delete q.goal;q.days=readDays(b);
      if(isNew)PROGS["x"+Date.now().toString(36)]=q;saveProgs();closeGen();renderGym();try{if(!document.getElementById("pm-modal").hidden)renderPM()}catch(e){}});
    const d=b.querySelector("[data-del]");if(d)d.addEventListener("click",()=>{if(!d.dataset.sure){d.dataset.sure=1;d.textContent=t("ลบ?");return}delete PROGS[k];saveProgs();closeGen();renderGym();try{renderPM()}catch(e){}})})}
