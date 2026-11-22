// locations.js — places you train (gym / condo …): equipment, programs per place, picker, editor, copy/move programs
// Classic script: shares globals with the other files in /js (load order is set in index.html). Loaded before programs.js.
Object.assign(EN,{"วันนี้ออกที่ไหน?":"Where today?","เพิ่มสถานที่":"Add place","แก้ไขสถานที่":"Edit place","ล่าสุด":"Last","แปลงแล้ว":"Swapped",
  "คัดลอกไป…":"Copy to…","ย้ายไป…":"Move to…","ลบสถานที่นี้?":"Delete this place?","ลบสถานที่นี้":"Delete this place","อุปกรณ์":"Equipment","ชื่อสถานที่":"Place name",
  "ลิงก์ Google Maps":"Google Maps link","ใช้ตำแหน่งปัจจุบัน":"Use current location","ดัมเบลหนักสุด (kg)":"Heaviest dumbbell (kg)","บันทึก":"Save","แผนที่":"Map",
  "ต้องมีอย่างน้อย 1 สถานที่":"Keep at least one place","ไม่มีท่าแทน → ตัดออก":"No substitute → removed","คัดลอก":"Copy","ย้าย":"Move","คัดลอก แล้วแก้ต่อ":"Copy, then edit",
  "ย้าย แล้วแก้ต่อ":"Move, then edit","ไม่มีสถานที่อื่น":"No other place","ท่าหลักย้ายไม่ได้ ใช้คัดลอกแทน":"Locked lifts can't move — copy instead","ยังไม่เคยเล่นที่นี่":"Not trained here yet",
  "ที่นี่":"Here","ยิม":"Gym","คอนโด":"Condo","สถานที่":"Place","เปลี่ยน":"Change","ประเภท":"Type","ยังไม่มีโปรแกรม":"No programs yet","คาร์ดิโอทำได้ทุกที่ — เลือกที่ตอนบันทึก":"Cardio can be done anywhere — pick the place when you log it","สร้าง + เพิ่มเข้าวันนี้":"Create + add to today","สร้าง":"Create","แก้ไข":"Edit","เสร็จ":"Done","แตะอีกครั้งเพื่อลบโปรแกรมนี้":"Tap again to delete this program","ลบโปรแกรมแล้ว":"Program deleted","โปรแกรมนี้กำลังเล่นหรือทำแล้ววันนี้":"In progress or done today","ใส่ชื่อโปรแกรม":"Enter a name","ที่ใหม่":"New place","ที่ไหน":"Where","ทำแล้ววันนี้":"Done today","กำลังเล่น":"In progress","เลือกได้หลายโปรแกรม":"Tick to add, untick to remove","อยู่ในวันนี้แล้ว":"Already in today","เพิ่มเข้าวันนี้":"Add to today","สร้างโปรแกรมใหม่":"Create new program","พักวันนี้ดีกว่า":"Rest today","กลับไปเล่น":"Resume","เอาออก":"Remove","ครบแล้ววันนี้ ✓":"All done today ✓","ยังไม่มีอะไรในวันนี้ — เพิ่มโปรแกรมที่จะทำ":"Nothing planned yet — add what you'll do","เพิ่มโปรแกรม":"Add program","แผน":"Plan","แผนวันนี้":"Today's plan","ถัดไป":"Next","เพิ่มกิจกรรม":"Add activity","ครบแผนวันนี้":"Plan done","พักวันนี้":"Rest today","เช้า":"Morning","กลางวัน":"Midday","เย็น":"Evening","ค่ำ":"Night","ช่วงเวลา":"Time of day","เวทเทรนนิ่ง":"Weight training","เลือกโปรแกรมเวท":"Pick a weights program","วิ่ง ตีแบด ว่ายน้ำ …":"Run, badminton, swim …","ให้กล้ามได้ฟื้น":"Let muscles recover","วันนี้จะทำอะไร?":"What today?","ความพร้อมของกล้าม":"Muscle readiness","มัด":"muscles","เมื่อวาน":"yesterday","วันนี้…":"Today…","ออกกำลังกาย":"Train","พัก":"Rest","แนะนำ":"Suggested","ตามตาราง":"Scheduled","นอกตาราง — เลือกเองได้":"Off schedule — pick anything","กล้ามฟื้นครบแล้ว":"All recovered","พักวันนี้":"Resting today","ให้กล้ามได้ฟื้น — กลับมาพรุ่งนี้":"Let your muscles recover — back tomorrow","เปลี่ยนใจ ออกกำลังกาย":"Changed my mind — train","พักแทน":"Rest instead","ไปที่ไหน?":"Where to?","กลับ":"Back","ออก":"Train","เลือกโปรแกรม":"Pick a program","ไม่มีโปรแกรมในตารางวันนี้ที่นี่":"Nothing scheduled here today","ดูโปรแกรม":"See programs","วันพัก · ออกได้ถ้าอยากออก":"Rest day · train if you like","หาตำแหน่งไม่ได้":"Couldn't get location",
  "ดัมเบล":"Dumbbells","บาร์เบล":"Barbell","เคเบิล":"Cable","เครื่อง":"Machines","ม้านั่ง":"Bench","บาร์โหน":"Pull-up bar","ยางยืด":"Bands","ตัวเปล่า":"Bodyweight"});
const EQ=[["db","ดัมเบล"],["bb","บาร์เบล"],["cable","เคเบิล"],["machine","เครื่อง"],["bench","ม้านั่ง"],["bar","บาร์โหน"],["band","ยางยืด"],["body","ตัวเปล่า"]];
const EQ_ALL=EQ.map(q=>q[0]);
const TYPES=[["gym","🏋️ เวท"],["cardio","🏃 คาร์ดิโอ"]];
Object.assign(EN,{"เวท":"Weights","คาร์ดิโอ":"Cardio","ประเภทโปรแกรม":"Program types","สนามแบด":"Badminton court","วันนี้:":"Today:","เปลี่ยนที่":"Change place","แทน":"for",
  "เลื่อนขึ้น":"Move up","เลื่อนลง":"Move down","ลบโปรแกรม":"Delete program","วันในตาราง":"Days","ระยะ + เวลา":"Distance + time","✓ ทำแล้ว":"✓ Done","เป้าหมาย (km)":"Goal (km)",
  "โปรแกรมคาร์ดิโอ":"Cardio program","เพิ่มโปรแกรมที่":"Add program at","ท่า · เซ็ต · ครั้ง":"Exercises · sets · reps","บันทึกระยะ/เวลา หรือ ✓":"Log distance/time or ✓",
  "ชื่อโปรแกรม":"Program name","เข้าใจแล้ว":"Got it","แก้แบบ JSON (ขั้นสูง)":"Edit as JSON (advanced)","ท่าเหมือนเดิม":"unchanged","จะเปลี่ยน":"will change","การฝึก":"Training","ข้อมูล":"Data","ตั้งค่า":"Settings","จัดการสถานที่":"Places","บันทึก…":"Log…","ที่นี่มีโปรแกรม":"Programs here","ลบ?":"Delete?"});
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
function cxGet(k,ds){const p=PROGS[k],tg=fsOf(ds||DAY);if(!p)return null;if(p.tag==="run")return tg.run?{...(tg.runData||{}),loc:tg.runLoc}:null;if(p.tag==="bad")return tg.bad?{loc:tg.badLoc}:null;const v=(tg.cx||{})[k];return v?(v===true?{}:v):null}
function cxSet(k,val){if(val&&DAY===TODAY)try{if(hasPlanToday())setTimeout(()=>{setDayMode(null);renderGym()},0)}catch(e){}const p=PROGS[k],tg=fs().tags;if(p.tag==="run"){tg.run=!!val;if(val){tg.runData=val.km?{km:val.km,sec:val.sec}:null;tg.runLoc=curLoc}else delete tg.runData}
  else if(p.tag==="bad"){tg.bad=!!val;if(val)tg.badLoc=curLoc}else{tg.cx=tg.cx||{};if(val)tg.cx[k]={...val,loc:curLoc};else delete tg.cx[k]}if(val&&p.loc==="*"){p.lastLoc=curLoc;saveProgs()}save("mealcheck",food)}
const cxTxt=(k,v)=>(v&&v.km?`${v.km} km · ${fmtPace(v.sec/v.km)}/km`:"✓ "+t("บันทึกแล้ว"))+(v&&v.loc&&locById(v.loc)?" · "+t(locById(v.loc).name):"");
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
const progsHere=()=>Object.keys(PROGS).filter(k=>k!=="free"&&(locOf(PROGS[k])===curLoc||locOf(PROGS[k])==="*"));
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
// a bug re-ran the "add badminton court" step on every load once places had switched to `types`; drop duplicate place ids
function dedupeLocs(){if(!LOCS)return false;const seen=new Set(),n=LOCS.length;LOCS=LOCS.filter(l=>!seen.has(l.id)&&seen.add(l.id));if(LOCS.length===n)return false;try{localStorage.setItem("locs",JSON.stringify(LOCS))}catch(e){}return true}
function ensureLocs(){if(LOCS&&LOCS.length){if(LOCS.some(l=>l.act||l.types))return dedupeLocs();
    // places from before activities existed: weights + run everywhere, add a badminton court, rewrite converted programs' text
    LOCS.forEach(l=>l.act=["gym","run"]);LOCS.push(COURT());Object.values(PROGS).forEach(p=>{if(locOf(p)!=="gym"&&p.ex.some(e=>e.swap))p.sub=descFor(p)});
    try{localStorage.setItem("locs",JSON.stringify(LOCS))}catch(e){}return true}
  LOCS=DEF_LOCS();const condo=LOCS[1];
  ["push","pull","push2","pull2"].forEach(k=>{const p=PROGS[k];if(!p||locOf(p)!=="gym")return;const c=convertEx(p.ex,condo).ex;
    PROGS["c-"+k]={name:p.name,sub:p.sub||"",loc:"condo",slot:k,ex:c};PROGS["c-"+k].sub=descFor(PROGS["c-"+k])});
  try{localStorage.setItem("locs",JSON.stringify(LOCS))}catch(e){}return true}
// v3: places get program types; every program gets its weekdays; run / badminton become cardio programs
function ensureV4(){const cs=Object.keys(PROGS).filter(k=>isCardio(PROGS[k]));if(cs.every(k=>PROGS[k].loc==="*"))return false;
  const keep={};cs.forEach(k=>{const p=PROGS[k],key=(p.tag||p.name||"").toLowerCase().trim();if(!keep[key]){keep[key]=k;if(p.loc!=="*")p.lastLoc=p.loc;p.loc="*";return}
    const q=PROGS[keep[key]];q.days=[...new Set((q.days||[]).concat(p.days||[]))];if(!q.tod&&p.tod)q.tod=p.tod;
    Object.values(food).forEach(d=>{const cx=d&&d.tags&&d.tags.cx;if(cx&&cx[k]){cx[keep[key]]=cx[k];delete cx[k]}});delete PROGS[k]});
  try{localStorage.setItem("mealcheck",JSON.stringify(food))}catch(e){}return true}
function ensureV3(){if(LOCS.every(l=>l.types)&&Object.values(PROGS).some(p=>Array.isArray(p.days)))return false;
  LOCS.forEach(l=>{const a=l.act||["gym","run"];l.types=typesOf(l);
    if(a.includes("run")&&!Object.values(PROGS).some(p=>p.tag==="run"&&p.loc===l.id))PROGS["cr-"+l.id]={name:t("วิ่ง")+" 10 km",kind:"cardio",icon:"🏃",tag:"run",track:"dist",goal:10,loc:l.id,ex:[],days:[1]};
    if(a.includes("bad")&&!Object.values(PROGS).some(p=>p.tag==="bad"&&p.loc===l.id))PROGS["cb-"+l.id]={name:t("ตีแบด"),kind:"cardio",icon:"🏸",tag:"bad",track:"done",loc:l.id,ex:[],days:[4]};
    if(!l.types.includes("cardio")&&(a.includes("run")||a.includes("bad")))l.types.push("cardio");delete l.act});
  Object.keys(PROGS).forEach(k=>{if(k!=="free"&&!Array.isArray(PROGS[k].days))PROGS[k].days=daysOf(k)});
  try{localStorage.setItem("locs",JSON.stringify(LOCS))}catch(e){}return true}
function saveLocs(){save("locs",LOCS);setProgsRev(Date.now());if(typeof markDirty==="function")markDirty("progs")}
function pickLoc(id){pickAnyway=false;locPrev=null;curLoc=id;locDay={date:TODAY,id};save("locday",locDay);if(!picked){cur=nextProg();chosen=false;draft.ex={};draft.prog=cur;save("gymdraft",draft)}renderGym()}
let pickAnyway=false;   // rest day: no picker unless the user taps "train anyway"
// today's decision: train or rest (asked first), then where
let dayModeS=load("daymode",{});
const dayMode=()=>dayModeS.date===TODAY?dayModeS.mode:null;
function setDayMode(m){dayModeS=m?{date:TODAY,mode:m}:{};save("daymode",dayModeS)}
const hasPlanToday=()=>DAY===TODAY;   // today always shows the day list (scheduled + added)
const freshDay=()=>DAY===TODAY&&!editing&&(!picked||!dayMode());
const needDay=()=>freshDay()&&!dayMode();
const resting=()=>freshDay()&&dayMode()==="rest";
const pastDay=()=>DAY!==TODAY&&!picked&&!editing;
const needPick=()=>pastDay()||resting()||needDay()||(freshDay()&&dayMode()==="train"&&(locDay.date!==TODAY||pickAnyway));
let dayKind=load("daykind",{});const kindToday=()=>dayKind.date===TODAY?dayKind.k:null;
function chooseDay(m){if(m==="cardio"||m==="train"){dayKind={date:TODAY,k:m==="cardio"?"cardio":"gym"};save("daykind",dayKind);m="train"}setDayMode(m);if(m==="train"){pickAnyway=false;locPrev=null;if(locDay.date===TODAY){locPrev=locDay;locDay={};save("locday",locDay);pickAnyway=true}}renderGym();scrollAppTop()}
function weakest(n){try{const R=recPct();return REC_ORDER.filter(m=>R[m]&&R[m].pct<100&&R[m].days<=NEGLECT).sort((a,b)=>R[a].pct-R[b].pct).slice(0,n).map(m=>[m,R[m].pct])}catch(e){return []}}
const ICO={cardio:'<circle cx="14" cy="4.5" r="1.8"/><path d="M8 21l3-6 3 2v5M6 12l3-4 4 1 3 4h3M11 15l-2-3"/>',train:'<path d="M3 10v4M6 7v10M18 7v10M21 10v4M6 12h12"/>',rest:'<path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/>'};
const ico=(k,c)=>`<svg class="dp-svg" viewBox="0 0 24 24" fill="none" stroke="${c}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICO[k]}</svg>`;
function renderDayPick(box){setTimeout(()=>todayMeals(box),0);const pk=planFor(DAY),p=pk&&PROGS[pk],sug=!p?"rest":isCardio(p)?"cardio":"train",w=weakest(2);
  const last=logs.filter(l=>l.date<TODAY).slice(-1)[0],ago=last?Math.round((ds2d(TODAY)-ds2d(last.date))/864e5):null;
  const lastW=last?` · ${t("ล่าสุด")} ${ago===1?t("เมื่อวาน"):nU(ago,"วันก่อน")}`:"";
  const tl=(p&&!isCardio(p)?`${t("ตามตาราง")}: ${esc(p.name)}`:t("เลือกโปรแกรมเวท"))+lastW;
  const cl=p&&isCardio(p)?`${t("ตามตาราง")}: ${esc(p.name)}`:t("วิ่ง ตีแบด ว่ายน้ำ …");
  const bars=`<small>${w.length?`${t("ให้กล้ามได้ฟื้น")} · ${w.map(([m])=>t(MUS_NAME[m])).join(", ")}`:t("กล้ามฟื้นครบแล้ว")}</small>`;
  const card=(m,name,body,col)=>`<button class="dp-card${m===sug?" on":""}" data-dm="${m}">${ico(m,col)}<span class="dp-tx"><span class="dp-t"><b>${t(name)}</b>${m===sug?`<span class="sug">${t("แนะนำ")}</span>`:""}</span>${body}</span><span class="dp-go">›</span></button>`;
  let ready=0,tot=0;try{const R=recPct();REC_ORDER.forEach(m=>{if(R[m]){tot++;if(R[m].pct>=100)ready++}})}catch(e){}
  box.innerHTML=`<h1 class="dp-h">${t("ออกกำลัง")}</h1><div class="date">${thDate(DAY,{weekday:"short",day:"numeric",month:"short"})}</div>
    <div class="rec-slot"></div>
    <h2 class="dp-sub">${t("วันนี้จะทำอะไร?")}</h2>${card("train","เวทเทรนนิ่ง",`<small>${tl}</small>`,"var(--cyan)")}${card("cardio","คาร์ดิโอ",`<small>${cl}</small>`,"var(--green)")}${card("rest","พัก",bars,"var(--muted)")}`;
  const rc=document.getElementById("rec-card");if(rc){box.querySelector(".rec-slot").appendChild(rc);try{renderRecovery()}catch(e){}}
  box.querySelectorAll("[data-dm]").forEach(b=>b.addEventListener("click",()=>chooseDay(b.dataset.dm)))}
const nProgs=n=>lang==="th"?`${n} โปรแกรม`:`${n} program${n===1?"":"s"}`;
// breadcrumb of today's choices: วันนี้ › 💪 ออก › 🏢 ยิม › ▶ Push A — tap an earlier step to choose again
const modeChip=()=>hasPlanToday()&&dayMode()!=="rest"?`${t("แผน")} ${planStat()[0]}/${planStat()[1]}`:dayMode()==="rest"?"😴 "+t("พัก"):kindToday()==="cardio"?"🏃 "+t("คาร์ดิโอ"):"🏋️ "+t("เวท");
function crumbs(items,lock){return `<nav class="crumbs${lock?" lock":""}" aria-label="${t("วันนี้")}"><span class="cr-lab">${t("วันนี้")}</span>${items.map(([lab,act],i)=>{const last=i===items.length-1;
    return `<span class="cr-sep">›</span>${lock||!act?`<span class="cr${last?" cur":""}">${esc(lab)}</span>`:`<button class="cr${last?" cur":""}" data-cr="${act}">${esc(lab)} <i>⌄</i></button>`}`}).join("")}</nav>`}
function bindCrumbs(el){el.querySelectorAll("[data-cr]").forEach(b=>b.addEventListener("click",()=>{const a=b.dataset.cr;
  if(a==="mode"){setDayMode(null);pickAnyway=false;locPrev=null;locDay={};save("locday",locDay);renderGym();scrollAppTop()}else if(a==="place")openLocChange();else if(a==="prog")openProgPick()}))}
function renderLocHead(){try{updLocSum()}catch(e){}const h=document.getElementById("lochead");if(!h)return;const L=hereLoc(),it=[];
  if(DAY===TODAY&&dayMode()&&(hasPlanToday()||!planDone()||picked))it.push([modeChip(),"mode"]);
  if(!resting())it.push([`${L.icon||"📍"} ${t(L.name)}`,"place"]);
  if(picked&&PROGS[cur])it.push(["▶ "+PROGS[cur].name,null]);
  else if(DAY===TODAY&&(hasPlanToday()||!planDone())&&!resting()){const k=selProg();it.push([k?`${isCardio(PROGS[k])?(PROGS[k].icon||"🏃"):"📋"} ${PROGS[k].name}`:"📋 "+t("เลือกโปรแกรม"),"prog"])}
  if(picked)it.forEach(x=>{if(x[1]!=="mode")x[1]=null});h.innerHTML=crumbs(it,false);bindCrumbs(h)}
const eqSum=l=>l.eq.filter(q=>q!=="body").map(q=>t((EQ.find(x=>x[0]===q)||[0,q])[1])).join(" · ")+(l.dbMax&&l.eq.includes("db")?` ≤ ${l.dbMax} kg`:"")||t("ตัวเปล่า");
const mapUrl=m=>{m=(m||"").trim();if(!m)return "";return /^https?:\/\//.test(m)?safeUrl(m):"https://maps.google.com/?q="+encodeURIComponent(m)};
const S1_HOME=document.createComment("step1-home");document.getElementById("step1").before(S1_HOME);
function renderLocPick(){const box=document.getElementById("locpick");if(!box)return;foodHomeBack();{const s1=document.getElementById("step1");if(s1.parentNode!==S1_HOME.parentNode)S1_HOME.after(s1)}const rc0=document.getElementById("rec-card"),home=document.querySelector(".rec-home");if(rc0&&home&&box.contains(rc0))home.after(rc0);const show=needPick();box.hidden=!show;{const f=picked&&!editing&&!show,was=document.body.classList.contains("wo-focus");document.body.classList.toggle("wo-focus",f);if(f&&!was)setTimeout(()=>scrollAppTop(),0)}document.getElementById("v-gym").classList.toggle("picking",show);document.getElementById("v-gym").classList.toggle("resting",resting());document.body.classList.toggle("loc-picking",show);renderLocHead();if(!show)return;
  if(pastDay()){renderPastDay(box);return}
  if(needDay()||resting()){renderPlan(box);return}
  const lastId=locDay.id||curLoc,todayAt=l=>planKeys(DAY).find(k=>locOf(PROGS[k])===l.id);
  const kd=pickAnyway?null:kindToday(),list=LOCS.filter(l=>!kd||hasType(l,kd)).sort((x,y)=>(!!todayAt(y)-!!todayAt(x))||((y.id===lastId)-(x.id===lastId)));
  box.innerHTML=crumbs([[modeChip(),"mode"],[t("ไปที่ไหน?"),null]])+`<h1 class="lp-h">${t("ไปที่ไหน?")}</h1><div class="date">${thDate(DAY,{weekday:"short",day:"numeric",month:"short"})}</div>`+list.map(l=>{const k=todayAt(l),p=k&&PROGS[k],n=Object.keys(PROGS).filter(q=>q!=="free"&&locOf(PROGS[q])===l.id).length;
    const line=p?`${isCardio(p)?(p.icon||"🏃"):"▶"} ${esc(p.name)}${isCardio(p)?"":" · "+nU(p.ex.length,"ท่า")} · ${t("วันนี้")}`:nProgs(n);
    return `<div class="lp-card${l.id===lastId?" on":""}" role="button" tabindex="0" data-loc="${esc(l.id)}"><span class="lp-ic">${esc(l.icon||"📍")}</span><span class="lp-tx"><span class="lp-top"><b>${esc(t(l.name))}</b>${l.id===lastId?`<span class="pill">${t("ล่าสุด")}</span>`:""}</span><small>${line}</small></span><span class="lp-more" role="button" tabindex="0" data-locedit="${esc(l.id)}" aria-label="${t("แก้ไขสถานที่")}">•••</span><span class="dp-go">›</span></div>`}).join("")
    +`<button class="btn lp-add" data-locadd>+ ${t("เพิ่มสถานที่")}</button>`;
  box.querySelectorAll("[data-loc]").forEach(c=>c.addEventListener("click",ev=>{if(ev.target.closest("[data-map]"))return;const ed=ev.target.closest("[data-locedit]");if(ed){openLocEdit(ed.dataset.locedit);return}pickLoc(c.dataset.loc)}));
  box.querySelector("[data-locadd]").addEventListener("click",()=>openLocEdit(null));bindCrumbs(box)}
let locPrev=null;   // place picked before tapping Change / Train anyway, so Back can restore it
function closeLocPick(){if(locPrev&&locPrev.date){locDay=locPrev;save("locday",locDay)}else setDayMode(null);pickAnyway=false;locPrev=null;renderGym();scrollAppTop()}
function openLocChange(){if(dayMode()!=="train")setDayMode("train");pickAnyway=true;locPrev=locDay;locDay={};save("locday",locDay);renderGym();scrollAppTop()}
function openLocEdit(id){const isNew=!id,l=isNew?{id:"l"+Date.now().toString(36),name:"",icon:"📍",map:"",eq:["db","body"],types:["gym","cardio"]}:JSON.parse(JSON.stringify(locById(id)));
  openGen(t(isNew?"เพิ่มสถานที่":"แก้ไขสถานที่"),`<div class="le">
    <div class="le-row">${icoPick(l.icon||"📍",["🏢","🏠","🏸","🏊","🏃","📍"])}<input class="le-in" data-f="name" value="${esc(l.name)}" placeholder="${t("ชื่อสถานที่")}" aria-label="${t("ชื่อสถานที่")}"></div>
    <input class="le-in" data-f="map" value="${esc(l.map||"")}" placeholder="📍 ${t("ลิงก์ Google Maps")}" aria-label="${t("ลิงก์ Google Maps")}">
    <button class="btn sm" data-geo style="justify-self:start">📍 ${t("ใช้ตำแหน่งปัจจุบัน")}</button>
    <div class="label" style="margin:4px 0 0">${t("ประเภทโปรแกรม")}</div>
    <div class="chips" data-act>${TYPES.map(([k,n])=>`<button class="chip" data-a="${k}" aria-pressed="${typesOf(l).includes(k)}">${t(n.slice(n.indexOf(" ")+1))}</button>`).join("")}</div>
    <div class="le-eq"><div class="label" style="margin:4px 0 0">${t("อุปกรณ์")}</div>
    <div class="chips" data-eq>${EQ.map(([k,n])=>`<button class="chip" data-q="${k}" aria-pressed="${k==="body"||l.eq.includes(k)}"${k==="body"?" disabled":""}>${t(n)}</button>`).join("")}</div>
    <label class="le-row" style="justify-content:space-between">${t("ดัมเบลหนักสุด (kg)")}<input class="le-in" data-f="dbMax" type="number" inputmode="decimal" value="${l.dbMax||""}" style="width:90px;text-align:right"></label></div>
    <button class="btn primary" data-save>${t("บันทึก")}</button>${isNew?"":`<button class="btn" data-lshare>↗ ${t("แชร์ยิมนี้")}</button><button class="btn" data-lpub>🌐 ${t("แชร์ให้ชุมชน")}</button><button class="btn ghost warn" data-del>${t("ลบสถานที่นี้")}</button>`}<button class="btn" data-gen-close>${t("ปิด")}</button></div>`,b=>{
    b.querySelectorAll("[data-q],[data-a]").forEach(c=>c.addEventListener("click",()=>{if(c.disabled)return;c.setAttribute("aria-pressed",c.getAttribute("aria-pressed")!=="true");eqVis()}));
    const eqVis=()=>{b.querySelector(".le-eq").hidden=b.querySelector('[data-a="gym"]').getAttribute("aria-pressed")!=="true"};eqVis();
    b.querySelector("[data-geo]").addEventListener("click",()=>{if(!navigator.geolocation){toast(t("หาตำแหน่งไม่ได้"));return}
      navigator.geolocation.getCurrentPosition(p=>{b.querySelector('[data-f="map"]').value=`https://maps.google.com/?q=${p.coords.latitude.toFixed(5)},${p.coords.longitude.toFixed(5)}`},()=>toast(t("หาตำแหน่งไม่ได้")),{timeout:10000})});
    b.querySelector("[data-save]").addEventListener("click",()=>{const v=f=>b.querySelector(`[data-f="${f}"]`).value.trim();
      l.name=v("name")||t("สถานที่");l.icon=v("icon")||"📍";l.map=v("map");const m=+v("dbMax");if(m>0)l.dbMax=m;else delete l.dbMax;
      l.types=[...b.querySelectorAll("[data-a]")].filter(c=>c.getAttribute("aria-pressed")==="true").map(c=>c.dataset.a);if(!l.types.length)l.types=["gym"];delete l.act;
      l.eq=[...b.querySelectorAll("[data-q]")].filter(c=>c.getAttribute("aria-pressed")==="true").map(c=>c.dataset.q);
      const i=LOCS.findIndex(q=>q.id===l.id);if(i>=0)LOCS[i]=l;else LOCS.push(l);saveLocs();closeGen();renderGym()});
    b.querySelector("[data-lpub]")?.addEventListener("click",()=>publishWorkout(Object.keys(PROGS).filter(k=>k!=="free"&&locOf(PROGS[k])===l.id),l.id));
    b.querySelector("[data-lshare]")?.addEventListener("click",()=>openShareLink(Object.keys(PROGS).filter(k=>k!=="free"&&locOf(PROGS[k])===l.id),l.id));
    const d=b.querySelector("[data-del]");if(d)d.addEventListener("click",()=>{if(LOCS.length<2){toast(t("ต้องมีอย่างน้อย 1 สถานที่"));return}
      if(!d.dataset.sure){d.dataset.sure=1;d.textContent=t("ลบสถานที่นี้?");return}
      LOCS=LOCS.filter(q=>q.id!==l.id);Object.keys(PROGS).forEach(k=>{if(k!=="free"&&locOf(PROGS[k])===l.id)delete PROGS[k]});saveProgs();saveLocs();
      if(curLoc===l.id){curLoc=LOCS[0].id;locDay={};save("locday",locDay);cur=nextProg()}closeGen();renderGym()})})}
function closeGen(){document.getElementById("gen-sheet").hidden=true;GEN_STACK.length=0;genTitle=""}
// copy / move a program to another place, converting exercises the target can't do
function openProgMove(k,m0){const p=PROGS[k],others=LOCS.filter(l=>l.id!==locOf(p));if(!others.length){toast(t("ไม่มีสถานที่อื่น"));return}
  let to=others[0].id,mode=m0||"copy";
  const draw=b=>{const L=locById(to),{log}=convertEx(p.ex,L);
    const same=p.ex.length-log.length,by={};log.forEach(([e,x])=>{const g=groupName(groupOf(e));(by[g]=by[g]||[]).push([e,x])});
    b.querySelector("[data-prev]").innerHTML=Object.entries(by).map(([g,rs])=>`<div class="label" style="margin:6px 0 0">${esc(g)} · ${t("จะเปลี่ยน")} ${nU(rs.length,"ท่า")}</div>`+rs.map(([e,x])=>`<div class="mv-row"><span class="old">${esc(e.n)}</span>${x?`<b>→ ${esc(x.n)}</b>`:`<i>${t("ไม่มีท่าแทน → ตัดออก")}</i>`}</div>`).join("")).join("")+(same?`<small class="note">✓ ${lang==="th"?`อีก ${same} ท่าเหมือนเดิม`:`${same} unchanged`}</small>`:"");
    b.querySelectorAll("[data-to]").forEach(c=>c.setAttribute("aria-pressed",c.dataset.to===to));b.querySelectorAll("[data-mode]").forEach(c=>c.setAttribute("aria-pressed",c.dataset.mode===mode));
    b.querySelector("[data-go]").textContent=t(mode==="copy"?"คัดลอก แล้วแก้ต่อ":"ย้าย แล้วแก้ต่อ")};
  openGen(`${esc(p.name)} → ${t("สถานที่")}…`,`<div class="chips">${others.map(l=>`<button class="chip" data-to="${esc(l.id)}">${esc(l.icon||"📍")} ${esc(t(l.name))}</button>`).join("")}</div>
    <div class="mv" data-prev></div><div class="chips segc"><button class="chip" data-mode="copy">${t("คัดลอก")}</button><button class="chip" data-mode="move">${t("ย้าย")}</button></div>
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
let addToToday=false;
function newWeights(){const k="p"+Date.now().toString(36);PROGS[k]={name:t("โปรแกรมใหม่"),sub:"",ex:[],loc:curLoc,days:[]};saveProgs();if(addToToday){planAdd(k);addToToday=false}renderGym();
  pmOnly=k;pmFromList=false;renderPM();document.getElementById("pm-modal").hidden=false;const n=document.querySelector('#pm-body [data-f="name"]');if(n){n.focus();n.select()}}
function openAddProg(){openCreateProg({type:hasType(hereLoc(),"gym")?"gym":"cardio"});return;const L=hereLoc(),ty=typesOf(L);if(ty.length===1){ty[0]==="gym"?newWeights():openCardioEdit(null);return}
  openGen(`${t("เพิ่มโปรแกรมที่")} ${esc(L.icon||"📍")} ${esc(t(L.name))}`,`<div class="pm-menu"><button class="menu-row" data-ty="gym"><span class="mi">🏋️</span><span class="mt">${t("เวท")}<small>${t("ท่า · เซ็ต · ครั้ง")}</small></span></button>
    <button class="menu-row" data-ty="cardio"><span class="mi">🏃</span><span class="mt">${t("คาร์ดิโอ")}<small>${t("บันทึกระยะ/เวลา หรือ ✓")}</small></span></button></div><button class="btn" data-gen-close>${t("ปิด")}</button>`,
    b=>b.querySelectorAll("[data-ty]").forEach(c=>c.addEventListener("click",()=>{closeGen();c.dataset.ty==="gym"?newWeights():openCardioEdit(null)})))}
function openCardioEdit(k){const isNew=!k,p=isNew?{name:"",icon:"🏃",kind:"cardio",track:"dist",ex:[],loc:curLoc,days:[]}:PROGS[k];
  openGen(t("โปรแกรมคาร์ดิโอ"),`<div class="le">
    <div class="le-row">${icoPick(p.icon||"🏃",["🏃","🏸","🏊","🚴","🤸","🏋️"])}<input class="le-in" data-f="name" value="${esc(p.name)}" placeholder="${t("ชื่อโปรแกรม")}" aria-label="${t("ชื่อโปรแกรม")}"></div>
    <div class="label" style="margin:4px 0 0">${t("บันทึก")}</div>
    <div class="chips"><button class="chip" data-tr="dist" aria-pressed="${p.track!=="done"}">${t("ระยะ + เวลา")}</button><button class="chip" data-tr="done" aria-pressed="${p.track==="done"}">${t("✓ ทำแล้ว")}</button></div>
    <label class="le-row le-goal" style="justify-content:space-between">${t("เป้าหมาย (km)")}<input class="le-in" data-f="goal" type="number" inputmode="decimal" value="${p.goal||""}" style="width:90px;text-align:right"></label>
    <div class="label" style="margin:4px 0 0">${t("วันในตาราง")}</div>${dayChips(p.days||[])}${todChips(p.tod)}
    <button class="btn primary" data-save>${t("บันทึก")}</button>${isNew?"":`<button class="btn ghost warn" data-del>${t("ลบโปรแกรม")}</button>`}<button class="btn" data-gen-close>${t("ปิด")}</button></div>`,b=>{
    let tr=p.track==="done"?"done":"dist";const vis=()=>{b.querySelectorAll("[data-tr]").forEach(c=>c.setAttribute("aria-pressed",c.dataset.tr===tr));b.querySelector(".le-goal").hidden=tr!=="dist"};vis();
    b.querySelectorAll("[data-tr]").forEach(c=>c.addEventListener("click",()=>{tr=c.dataset.tr;vis()}));bindToggle(b,"[data-d]");bindTod(b,p);
    b.querySelector("[data-save]").addEventListener("click",()=>{const v=f=>b.querySelector(`[data-f="${f}"]`).value.trim();const name=v("name");if(!name){toast(t("ใส่ชื่อท่าก่อน"));return}
      const q=isNew?p:PROGS[k];q.name=name;q.icon=v("icon")||"🏃";q.track=tr;const g=+v("goal");if(tr==="dist"&&g>0)q.goal=g;else delete q.goal;q.days=readDays(b);
      if(isNew){const nk="x"+Date.now().toString(36);PROGS[nk]=q;if(addToToday){planAdd(nk);addToToday=false}}saveProgs();closeGen();renderGym();try{if(!document.getElementById("pm-modal").hidden)renderPM()}catch(e){}});
    const d=b.querySelector("[data-del]");if(d)d.addEventListener("click",()=>{if(!d.dataset.sure){d.dataset.sure=1;d.textContent=t("ลบ?");return}delete PROGS[k];saveProgs();closeGen();renderGym();try{renderPM()}catch(e){}})})}
/* ---------- More › Places: list every place, edit or add ---------- */
function openPlaces(){openGen(t("จัดการสถานที่"),`<div class="pm-menu">${LOCS.map(l=>`<button class="menu-row" data-pl="${esc(l.id)}"><span class="mi">${esc(l.icon||"📍")}</span><span class="mt"><b>${esc(t(l.name))}</b><small>${nProgs(Object.keys(PROGS).filter(k=>k!=="free"&&locOf(PROGS[k])===l.id).length)}</small></span><span class="mc">›</span></button>`).join("")}</div>
  <button class="btn primary" data-pladd>+ ${t("เพิ่มสถานที่")}</button>`,b=>{b.querySelectorAll("[data-pl]").forEach(r=>r.addEventListener("click",()=>openLocEdit(r.dataset.pl)));b.querySelector("[data-pladd]").addEventListener("click",()=>openLocEdit(null))})}
document.getElementById("loc-open")?.addEventListener("click",openPlaces);
function updLocSum(){const e=document.getElementById("loc-sum");if(e&&LOCS)e.textContent=LOCS.map(l=>t(l.name)).join(" · ")}

/* ---------- program chip: today's program at this place (picked, else scheduled) ---------- */
const kindOk=k=>{const kd=kindToday();return !kd||(kd==="cardio")===isCardio(PROGS[k])};
function selProg(){const k=locDay.date===TODAY&&locDay.prog;if(k&&PROGS[k]&&locOf(PROGS[k])===curLoc)return k;const pl=planFor(DAY);return pl&&PROGS[pl]&&locOf(PROGS[pl])===curLoc&&kindOk(pl)?pl:null}
function chooseProg(k){dayKind={date:TODAY,k:isCardio(PROGS[k])?"cardio":"gym"};save("daykind",dayKind);locDay={...locDay,date:TODAY,id:curLoc,prog:k};save("locday",locDay);if(!isCardio(PROGS[k])&&!picked){if(cur!==k)draft.ex={};cur=k;draft.prog=k;save("gymdraft",draft)}closeGen();renderGym()}
function openProgPick(){const L=hereLoc(),sel=selProg(),pl=planFor(DAY),w=weightsHere(),c=cardioHere();
  const row=k=>{const p=PROGS[k],cx=isCardio(p);return `<button class="menu-row" data-pp="${esc(k)}"><span class="mi">${cx?esc(p.icon||"🏃"):"📋"}</span><span class="mt"><b>${esc(p.name)}</b><small>${cx?"":nU(p.ex.length,"ท่า")+" · "+esc([...new Set(p.ex.map(e=>groupName(groupOf(e))))].join(" "))}${k===pl?" · "+t("ตามตาราง"):""}</small></span><span class="mc">${k===sel?"✓":"›"}</span></button>`};
  openGen(`${t("เลือกโปรแกรม")} · ${esc(L.icon||"📍")} ${esc(t(L.name))}`,`${w.length?`<div class="label" style="margin:0">${t("เวท")}</div><div class="pm-menu">${w.map(row).join("")}</div>`:""}
    ${c.length?`<div class="label" style="margin:0">${t("คาร์ดิโอ")}</div><div class="pm-menu">${c.map(row).join("")}</div>`:""}
    ${hasType(L,"gym")?`<button class="btn ghost" data-ppfree>＋ ${t("ออกแบบอิสระ")}</button>`:""}`,b=>{
    b.querySelectorAll("[data-pp]").forEach(r=>r.addEventListener("click",()=>chooseProg(r.dataset.pp)));
    b.querySelector("[data-ppfree]")?.addEventListener("click",()=>{closeGen();startEmpty()})})}

// icon picker (stores the emoji code, shown as a line icon)
function icoPick(v,set){if(!set.includes(v))set=[v,...set];return `<input type="hidden" data-f="icon" value="${esc(v)}"><div class="chips ico-pick" role="radiogroup" aria-label="icon">${set.map(e=>`<button type="button" class="chip" data-ico="${esc(e)}" aria-pressed="${e===v}">${e}</button>`).join("")}</div>`}
document.addEventListener("click",ev=>{const b=ev.target.closest&&ev.target.closest("[data-ico]");if(!b)return;const g=b.closest(".le")||b.parentNode.parentNode;const inp=g.querySelector('[data-f="icon"]');if(inp)inp.value=b.dataset.ico;b.parentNode.querySelectorAll("[data-ico]").forEach(c=>c.setAttribute("aria-pressed",c===b))});

/* ---------- today's plan: every program scheduled today, as a checklist ---------- */
const TOD=[["am","เช้า"],["noon","กลางวัน"],["pm","เย็น"],["night","ค่ำ"]];
const todRank=k=>{const p=PROGS[k],i=TOD.findIndex(q=>q[0]===p.tod);if(i>=0)return i;return isCardio(p)?(p.tag==="run"?.5:2.5):1.5};
let dayPlan=load("dayplan",{});const dp=()=>dayPlan.date===TODAY?dayPlan:(dayPlan={date:TODAY,add:[],del:[]});
const planList=()=>{const d=dp(),ks=[...new Set(planKeys(DAY).filter(k=>!d.del.includes(k)).concat(d.add))].filter(k=>PROGS[k]);
  logs.filter(l=>l.date===DAY&&PROGS[l.prog]&&!ks.includes(l.prog)).forEach(l=>ks.push(l.prog));return ks.sort((a,b)=>todRank(a)-todRank(b))};
function planAdd(k){const d=dp();if(!d.add.includes(k))d.add.push(k);d.del=d.del.filter(x=>x!==k);save("dayplan",dayPlan)}
function planDel(k){const d=dp();d.add=d.add.filter(x=>x!==k);if(!d.del.includes(k))d.del.push(k);save("dayplan",dayPlan)}
const inProg=k=>picked&&cur===k&&!planItemDone(k);
function planItemDone(k){const p=PROGS[k];if(isCardio(p))return cxGet(k);const l=logs.find(x=>x.date===DAY&&x.prog===k);return l||null}
function planStat(){const ks=planList();return [ks.filter(planItemDone).length,ks.length]}
function planSummary(k,v){const p=PROGS[k];if(isCardio(p))return "✓ "+cxTxt(k,v);const n=Object.values(v.ex).reduce((a,s)=>a+s.length,0);return `✓ ${nU(n,"เซ็ต")} · ${Math.round(volOf(v)).toLocaleString()} kg`}
function startPlanItem(k,go){const p=PROGS[k];
  // another weights session is running: ask what to do with it first
  // cardio is logged in a modal; stay on the plan screen (switching day mode here left the old program list up, see docs/work/2026-11-21-cardio-cancel)
  if(go&&isCardio(p)){openCardio(k,true);return}
  if(go&&!isCardio(p)&&picked&&PROGS[cur]&&cur!==k){if(woProgress().any){openSwitchAsk(k);return}cancelProg()}dayKind={date:TODAY,k:isCardio(p)?"cardio":"gym"};save("daykind",dayKind);setDayMode("train");
  curLoc=locOf(p)==="*"?(locById(p.lastLoc)?p.lastLoc:curLoc):locOf(p);pickAnyway=false;locPrev=null;locDay={date:TODAY,id:curLoc,prog:k};save("locday",locDay);
  if(isCardio(p)){renderGym();if(go)openCardio(k);return}
  if(!picked){if(cur!==k)draft.ex={};cur=k;draft.prog=k;save("gymdraft",draft);if(go){chosen=true;document.getElementById("start-w").click();return}}renderGym();scrollAppTop()}
// a past day: what was logged + log something late (no old "pick a program" screen)
function renderPastDay(box){const ls=logs.filter(l=>l.date===DAY),cx=Object.keys(PROGS).filter(k=>isCardio(PROGS[k])&&cxGet(k));
  box.innerHTML=`<div class="cal-slot"></div><h2 class="dp-sub pl-h">${t("ย้อนหลัง")} · ${thDate(DAY,{weekday:"long",day:"numeric",month:"short"})}</h2>
    ${ls.map(l=>`<div class="pl-row st-done" data-pl="${esc(l.prog)}"><span class="row-ic">${licon("checkc")}</span><span class="row-tx"><span class="pl-st st-done">${t("Done")}</span><b>${esc(progName(l.prog))}</b><small>${esc(planSummary(l.prog,l))}</small></span></div>`).join("")}
    ${cx.map(k=>`<div class="pl-row st-done" data-pl="${esc(k)}"><span class="row-ic g">${licon("checkc")}</span><span class="row-tx"><span class="pl-st st-done">${t("Done")}</span><b>${esc(PROGS[k].name)}</b><small>${esc(cxTxt(k,cxGet(k)))}</small></span></div>`).join("")}
    ${ls.length||cx.length?"":`<small class="note pl-empty">${t("วันนี้ไม่ได้บันทึกอะไรไว้")}</small>`}
    <div class="pl-acts"><button class="btn primary pl-add-main" data-late>+ ${t("บันทึกย้อนหลัง")}</button></div>`;
  {const s1=document.getElementById("step1");box.querySelector(".cal-slot").appendChild(s1);s1.hidden=false}
  box.querySelectorAll("[data-pl]").forEach(r=>r.addEventListener("click",()=>openDoneItem(r.dataset.pl)));
  box.querySelector("[data-today]").addEventListener("click",()=>{DAY=TODAY;renderAll()});
  box.querySelector("[data-late]").addEventListener("click",()=>{const ks=Object.keys(PROGS).filter(k=>k!=="free");
    openGen(t("บันทึกย้อนหลัง"),`<div class="pm-menu">${ks.map(k=>`<button class="menu-row" data-lk="${esc(k)}"><span class="mi">${licon(isCardio(PROGS[k])?"run":"dumbbell")}</span><span class="mt"><b>${esc(PROGS[k].name)}</b><small>${esc(t((locById(locOf(PROGS[k]))||{}).name||""))}</small></span><span class="mc">›</span></button>`).join("")}</div>`,
      b=>b.querySelectorAll("[data-lk]").forEach(x=>x.addEventListener("click",()=>{const k=x.dataset.lk;closeGen();if(isCardio(PROGS[k])){openCardio(k);return}
        cur=k;draft={prog:k,ex:{},started:1,day:DAY,loc:locOf(PROGS[k])};save("gymdraft",draft);picked=true;chosen=true;renderGym();scrollAppTop()})))})}
function renderPlan(box){const ks=planList().slice();if(picked&&cur&&PROGS[cur]&&cur!=="free"&&!ks.includes(cur)&&!planItemDone(cur))ks.unshift(cur);const[d,n]=planStat();let sugK=null;try{sugK=(recSuggest()||[])[0]}catch(e){}
  const lead=ks.some(inProg)?null:ks.find(q=>!planItemDone(q)&&!inProg(q)&&!isCardio(PROGS[q]))||ks.find(q=>!planItemDone(q)&&!inProg(q));
  const row=k=>{const p=PROGS[k],v=planItemDone(k),ip=inProg(k),L=locById(locOf(p)==="*"?p.lastLoc:locOf(p))||{},tod=(TOD.find(q=>q[0]===p.tod)||[])[1];
    const st=v?["done","Done"]:ip?["prog","In progress"]:["pend","Pending"];
    const sets=ip?Object.values(draft.ex||{}).flat():[],sub=v?planSummary(k,v):ip?`${t(L.name||"")} · ${sets.filter(x=>x.ok).length}/${sets.length} ${t("เซ็ต")}`:`${isCardio(p)?t("คาร์ดิโอ"):nU(p.ex.length,"ท่า")}${tod?" · "+t(tod):""}`;
    return `<div class="pl-row st-${st[0]}${k===lead?" lead":""}" data-pl="${esc(k)}"><span class="hq-th" aria-hidden="true">${(()=>{if(isCardio(p))return licon(LI[EMO[p.icon]]?EMO[p.icon]:"run");try{const [pp,ss]=musUnion(p.ex.map(e=>exOf(e.id)));return bodySVG([...pp],[...ss],52)}catch(e){return licon("dumbbell")}})()}</span>
      <span class="row-tx">${st[0]==="pend"?"":`<span class="pl-st st-${st[0]}">${t(st[1]==="Done"?"เสร็จแล้ว_pl":"กำลังเล่น")}</span>`}${sugK===k&&!v&&!ip?`<span class="pl-sug">${t("แนะนำ")}</span>`:""}<span class="hq-chip">${isCardio(p)?t("คาร์ดิโอ"):t("เวท")}</span><b class="hq-pn">${v?"✓ ":""}${esc(p.name)}${v||ip?"":` <span class="loc-chip loc-tag">${esc(L.icon||"📍")} ${esc(t(L.name||""))}</span>`}</b><span class="pl-sub"><small>${esc(v||ip||isCardio(p)?sub:`${nU(p.ex.length,"ท่า")} · ~${p.ex.length*6} ${t("นาที")}`)}</small></span></span><span class="pc-act">${v?"":ip?`<span class="pl-ipa"><button class="btn primary sm hq-ps" data-plgo="resume">${t("กลับไปเล่น")}</button><button class="pl-disc" data-plgo="discard">${t("ยกเลิกทั้งหมด")}</button></span>`:(k===lead?`<button class="btn primary sm hq-ps" data-plgo="start">${t("เริ่ม")}</button>`:`<span class="pc-chev" aria-hidden="true">›</span>`)}</span></div>`};
  box.innerHTML=`<h1 class="dp-h">${t("ออกกำลัง")}</h1><div class="cal-slot"></div><div class="rec-slot"></div>
    ${dayMode()==="rest"?`<div class="card rest-card"><b>${licon("moon")} ${t("พักวันนี้")}</b><small class="note">${t("ให้กล้ามได้ฟื้น — พรุ่งนี้กลับมาใหม่")}</small><button class="btn sm" data-unrest>${t("เปลี่ยนใจ — ออกกำลังกาย")}</button></div>`:""}<h2 class="dp-sub pl-h">${t(n&&d===n?"ครบแล้ววันนี้ ✓":"วันนี้จะทำอะไร?")} ${n?`<span class="pill">${d}/${n}</span>`:""}</h2>${ks.map(row).join("")||`<small class="note pl-empty">${t("ยังไม่มีอะไรในวันนี้ — เพิ่มโปรแกรมที่จะทำ")}</small>`}
    <div class="pl-acts"><button class="${n?"pl-add":"btn primary pl-add-main"}" data-pladd>+ ${t("เพิ่มเข้าวันนี้")}</button>${d||ks.some(inProg)||dayMode()==="rest"?"":`<button class="btn pl-rest" data-plrest>${licon("moon")||""} ${t("พักวันนี้ดีกว่า")}</button>`}</div>`;
  const rc=document.getElementById("rec-card");if(rc){box.querySelector(".rec-slot").appendChild(rc);try{renderRecovery()}catch(e){}}
  {const s1=document.getElementById("step1");box.querySelector(".cal-slot").appendChild(s1);s1.hidden=false}
  box.querySelectorAll("[data-pl]").forEach(r=>{const k=r.dataset.pl;r.addEventListener("click",ev=>{if(ev.target.closest("[data-pldel]")){planDel(k);renderGym();return}if(ev.target.closest("[data-plloc]")){openPlanPlace(k);return}
    const g=ev.target.closest("[data-plgo]");if(g&&g.dataset.plgo==="discard"){cfm(`${t("ยกเลิกทั้งหมด")}?<br>${esc(PROGS[k].name)}`,t("เซ็ตที่ทำไว้จะหายทั้งหมด"),t("ยกเลิกทั้งหมด"),1).then(ok=>{if(ok){cancelProg();toast(t("ทิ้งแล้ว"))}});return}if(g&&g.dataset.plgo==="resume"){setDayMode("train");renderGym();setTimeout(()=>document.getElementById("step3")?.scrollIntoView({block:"start"}),50);return}
    if(planItemDone(k)){openDoneItem(k);return}if(g)startPlanItem(k,true);else openPlanItem(k)})});
  box.querySelector("[data-plrest]")?.addEventListener("click",()=>{setDayMode("rest");renderGym()});box.querySelector("[data-unrest]")?.addEventListener("click",()=>{setDayMode(null);renderGym()});
  box.querySelector("[data-pladd]").addEventListener("click",e=>{window._sheetFrom=e.currentTarget;openPlanAdd();setTimeout(()=>document.querySelector("#gen-sheet button:not([data-gen-close]), #gen-sheet input")?.focus(),50)})}
// "where?" sheet for one row of today's plan. Weights (option A): each place has its own copy of a program,
// so picking a place swaps today's row to that place's copy. Cardio: any cardio place, remembered as lastLoc.
// a done row can always be reopened: edit (cardio) or remove what was saved
function openSwitchAsk(k){const o=PROGS[cur].name,n=PROGS[k].name,s=woProgress();
  openGen(`${esc(o)} ${t("ยังเล่นค้างอยู่")} (${s.done}/${s.total})`,`<small class="note">${t("จะทำยังไงกับ")} ${esc(o)} ${t("ก่อนเริ่ม")} ${esc(n)}?</small><div class="pm-menu">
    <button class="menu-row" data-sw="keep"><span class="mi">▶</span><span class="mt"><b>${t("เล่นต่อ")} ${esc(o)}</b><small>${t("ยังไม่เริ่ม")} ${esc(n)}</small></span></button>
    <button class="menu-row" data-sw="save"><span class="mi">✓</span><span class="mt"><b>${t("บันทึก")} ${esc(o)} ${t("แล้วเริ่ม")} ${esc(n)}</b><small>${t("เก็บเซ็ตที่ทำไว้")}</small></span></button>
    <button class="menu-row warn" data-sw="drop"><span class="mi">✕</span><span class="mt"><b>${t("ทิ้ง")} ${esc(o)} ${t("แล้วเริ่ม")} ${esc(n)}</b><small>${t("กด ↺ เลิกทำ ได้")}</small></span></button></div>
    <button class="btn" data-gen-close>${t("ยกเลิก")}</button>`,b=>b.querySelectorAll("[data-sw]").forEach(x=>x.addEventListener("click",()=>{const a=x.dataset.sw;closeGen();
      if(a==="keep"){setDayMode("train");renderGym();return}
      if(a==="save"){if(!commitDraft(DAY,cur)){toast(t("เซ็ตที่ติ๊กยังไม่ได้ใส่น้ำหนัก"));return}picked=false;chosen=false;stopRest&&stopRest()}
      else{cancelProg();undoLoud(t("ทิ้งแล้ว"))}startPlanItem(k,true)})))}
// tapping a row (not ▶): details sheet — exercises, place, edit, remove, Start
function openPlanItem(k){const p=PROGS[k],cx=isCardio(p),L=locById(locOf(p)==="*"?p.lastLoc:locOf(p))||hereLoc(),ip=inProg(k);
  const last=logs.filter(l=>l.prog===k).slice(-1)[0];
  const ex=cx?"":p.ex.map((e,i)=>`<button type="button" class="pi-ex" data-pihow="${i}"><i class="pi-no">${i+1}</i><span class="pi-nm"><span class="pi-t">${esc(e.n)}</span><small>${e.s}×${esc(e.r)}</small></span><span class="pi-how">${t("วิธีเล่น")} ›</span></button>`).join("");
  openGen(esc(p.name),`<div class="pi-top"><small class="note">${cx?t("คาร์ดิโอ"):nU(p.ex.length,"ท่า")}${last?" · "+t("ล่าสุด")+" "+thDate(last.date,{day:"numeric",month:"short"}):""}</small></div>${ex}
    <div class="pm-menu">${cx?"":`<button class="menu-row" data-pis2><span class="mi">↗</span><span class="mt"><b>${t("แชร์ลิงก์")}</b></span><span class="mc">›</span></button><button class="menu-row" data-pub2><span class="mi">🌐</span><span class="mt"><b>${t("แชร์ให้ชุมชน")}</b></span><span class="mc">›</span></button><button class="menu-row" data-pie><span class="mi">✎</span><span class="mt"><b>${t("แก้โปรแกรม")}</b></span><span class="mc">›</span></button>`}${ip?"":`<button class="menu-row" data-pid><span class="mi">✕</span><span class="mt"><b>${t("เอาออกจากวันนี้")}</b></span></button>`}</div>
    <div class="actions sheet-act"><button class="btn" data-gen-close>${t("ปิด")}</button><button class="btn primary" data-pis style="flex:1">▶ ${t(ip?"กลับไปเล่น":"เริ่ม")}</button></div>`,
    b=>{b.querySelectorAll("[data-pihow]").forEach(x=>x.addEventListener("click",()=>{const e=p.ex[+x.dataset.pihow],lc=v=>String(v||"").trim().toLowerCase(),q=(typeof EXLIB!=="undefined"&&EXLIB.find(z=>(e.id&&z.id===e.id)||lc(z.n)===lc(e.n)))||e;openHowTo(q.id||e.id||"",e.n);document.querySelectorAll("#gen-body [data-gen-close]").forEach(c=>c.addEventListener("click",()=>setTimeout(()=>openPlanItem(k),0),{once:true}))}));b.querySelector("[data-pil]")?.addEventListener("click",()=>openPlanPlace(k));b.querySelector("[data-pis2]")?.addEventListener("click",()=>openShareLink([k],locOf(p)));b.querySelector("[data-pub2]")?.addEventListener("click",()=>publishWorkout([k],locOf(p)));
      b.querySelector("[data-pie]")?.addEventListener("click",()=>{closeGen();pmReturn=()=>openPlanItem(k);pmOnly=k;pmFromList=false;renderPM();document.getElementById("pm-modal").hidden=false});
      b.querySelector("[data-pid]")?.addEventListener("click",()=>{closeGen();planDel(k);renderGym()});
      b.querySelector("[data-pis]").addEventListener("click",()=>{closeGen();if(ip){setDayMode("train");renderGym();scrollAppTop();return}startPlanItem(k,true)})})}
Object.assign(EN,{"ยกเลิกทั้งหมด":"Discard all","เซ็ตที่ทำไว้จะหายทั้งหมด":"All sets you did will be lost","ออกไปก่อนได้ — กลับมาเล่นต่อได้":"Step away anytime — it's saved","ย้อนหลัง":"Past day","วันนี้ไม่ได้บันทึกอะไรไว้":"Nothing logged this day","บันทึกย้อนหลัง":"Log for this day","กลับวันนี้":"Back to today","ให้กล้ามได้ฟื้น — พรุ่งนี้กลับมาใหม่":"Let your muscles recover — back tomorrow","เปลี่ยนใจ — ออกกำลังกาย":"Changed my mind — train","ยังเล่นค้างอยู่":"is still in progress","จะทำยังไงกับ":"What to do with","ก่อนเริ่ม":"before starting","ยังไม่เริ่ม":"Don't start","แล้วเริ่ม":"and start","เก็บเซ็ตที่ทำไว้":"Keeps the sets you did","กด ↺ เลิกทำ ได้":"You can ↺ Undo","เอาออกจากวันนี้":"Remove from today","เล่นต่อ":"Continue"});
function openDoneItem(k){const p=PROGS[k],cx=isCardio(p),v=planItemDone(k);
  openGen(esc(p.name),`<small class="note">${esc(planSummary(k,v))}</small><div class="pm-menu">${cx?`<button class="menu-row" data-dm="edit"><span class="mi">✎</span><span class="mt"><b>${t("แก้ไข")}</b></span></button>`:""}
    <button class="menu-row warn" data-dm="del"><span class="mi">↺</span><span class="mt"><b>${t("ยกเลิกที่บันทึก")}</b><small>${t("กลับเป็นยังไม่ได้ทำ")}</small></span></button></div><button class="btn" data-gen-close>${t("ปิด")}</button>`,
    b=>b.querySelectorAll("[data-dm]").forEach(x=>x.addEventListener("click",()=>{closeGen();if(x.dataset.dm==="edit"){openCardio(k,true);return}
      if(cx)cxSet(k,null);else{logs=logs.filter(l=>!(l.date===DAY&&l.prog===k));save("gymlog",logs)}renderAll()})))}
Object.assign(EN,{"ยกเลิกที่บันทึก":"Undo this entry","กลับเป็นยังไม่ได้ทำ":"Back to not done"});
function openPlanPlace(k){const p=PROGS[k],cx=isCardio(p);
  const sib=cx?[]:Object.keys(PROGS).filter(q=>q!=="free"&&!isCardio(PROGS[q])&&PROGS[q].name.trim().toLowerCase()===p.name.trim().toLowerCase());
  const opts=cx?LOCS.filter(l=>hasType(l,"cardio")).map(l=>[l.id,l.id]):sib.map(q=>[locOf(PROGS[q]),q]).filter(([id])=>locById(id));
  let sel=cx?(locById(p.lastLoc)?p.lastLoc:curLoc):locOf(p);const missing=cx?[]:LOCS.filter(l=>hasType(l,"gym")&&!opts.some(([id])=>id===l.id));
  const draw=b=>{b.querySelector(".pp-body").innerHTML=`<small class="note">${cx?t("คาร์ดิโอทำได้ทุกที่"):t("เวท: แต่ละที่มีชุดโปรแกรมของตัวเอง")}</small>
    <div class="chips">${opts.map(([id])=>{const l=locById(id);return `<button class="chip${id===sel?" on":""}" data-pp="${esc(id)}" aria-pressed="${id===sel}">${esc(l.icon||"📍")} ${esc(t(l.name))}</button>`}).join("")}${cx?`<button class="chip" data-ppnew>+ ${t("ที่ใหม่")}</button>`:""}</div>
    ${missing.length?`<small class="note">${t("ที่อื่นยังไม่มีโปรแกรมนี้")}: ${missing.map(l=>esc(t(l.name))).join(", ")}</small><button class="btn sm" data-ppcopy style="justify-self:start">⧉ ${t("ก๊อปไปที่…")}</button>`:""}
    <button class="menu-row" data-ppman><span class="mi">⚙</span><span class="mt"><b>${t("จัดการสถานที่")}</b><small>${t("เพิ่ม · แก้อุปกรณ์ · ลบ")}</small></span><span class="mc">›</span></button>
    <div class="actions sheet-act"><button class="btn" data-gen-close>${t("ยกเลิก")}</button><button class="btn primary" data-ppok style="flex:1">✓ ${t("ใช้ที่นี่")}</button></div>`;
    b.querySelectorAll("[data-pp]").forEach(c=>c.addEventListener("click",()=>{sel=c.dataset.pp;draw(b)}));
    b.querySelector("[data-ppnew]")?.addEventListener("click",()=>openLocEdit(null));
    b.querySelector("[data-ppcopy]")?.addEventListener("click",()=>openProgMove(k,"copy"));
    b.querySelector("[data-ppman]").addEventListener("click",openPlaces);
    b.querySelector("[data-ppok]").addEventListener("click",()=>{if(cx){p.lastLoc=sel;saveProgs()}else{const nk=(opts.find(([id])=>id===sel)||[])[1];if(nk&&nk!==k){planDel(k);planAdd(nk)}}closeGen();renderGym()})};
  openGen(esc(p.name)+" — "+t("เล่นที่ไหน?"),`<div class="pp-body stack" style="gap:10px"></div>`,draw)}
let paTab="gym";
// Add to today. Weights: place first, then that place's programs. Cardio: sport first, then where (per sport).
let paLoc=null,paCx={},paEdit=false;
function openPlanAdd(keepSel){const fresh=!(keepSel instanceof Set),ks=new Set(planList()),sel=fresh?new Set(ks):keepSel,locked=k=>!!planItemDone(k)||inProg(k);if(fresh){paCx={};paEdit=false}
  const gymLocs=LOCS.filter(l=>hasType(l,"gym")),cxLocs=LOCS.filter(l=>hasType(l,"cardio"));
  if(!paLoc||!gymLocs.some(l=>l.id===paLoc))paLoc=(gymLocs.find(l=>l.id===curLoc)||gymLocs[0]||{}).id;
  const row=k=>{const p=PROGS[k],cx=isCardio(p),on=sel.has(k),lk=locked(k);
    const sub=lk?t(planItemDone(k)?"ทำแล้ววันนี้":"กำลังเล่น"):cx?"":nU(p.ex.length,"ท่า")+(p.sub?" · "+t(p.sub):"");
    if(paEdit)return `<button class="menu-row pa-row pa-delrow" data-pdel="${esc(k)}"><span class="mi">${cx?licon(LI[EMO[p.icon]]?EMO[p.icon]:"run"):licon("dumbbell")}</span><span class="mt"><b>${esc(p.name)}</b><small>${esc(sub)}</small></span><span class="pa-x">${licon("trash")||"🗑"}</span></button>`;
    return `<button class="menu-row pa-row${on?" sel":""}${lk?" in":""}" data-padd="${esc(k)}"${lk?" disabled":""}><span class="mi">${cx?licon(LI[EMO[p.icon]]?EMO[p.icon]:"run"):licon("dumbbell")}</span><span class="mt"><b>${esc(p.name)}</b>${sub?`<small>${esc(sub)}</small>`:""}</span><span class="pa-box">${on?"✓":""}</span></button>`};
  const cxWhere=k=>{const p=PROGS[k],cur0=paCx[k]||(locById(p.lastLoc)?p.lastLoc:curLoc);paCx[k]=cur0;
    return `<div class="pa-where"><small>${t("ที่ไหน?")}</small>${cxLocs.map(l=>`<button class="chip${l.id===cur0?" on":""}" data-pcx="${esc(k)}" data-pcl="${esc(l.id)}">${esc(l.icon||"📍")} ${esc(t(l.name))}</button>`).join("")}<button class="chip" data-pcnew>+ ${t("ที่ใหม่")}</button></div>`};
  const all=Object.keys(PROGS).filter(k=>k!=="free");let body;
  if(paTab==="cardio"){const list=all.filter(k=>isCardio(PROGS[k]));
    body=`<div class="pa-step">1 · ${t("กีฬาอะไร?")}<span class="pa-hb"><button class="pa-new" data-pedit>${t(paEdit?"เสร็จ":"แก้ไข")}</button>${paEdit?"":`<button class="pa-new" data-pnew>+ ${t("สร้างใหม่")}</button>`}</span></div><div class="pm-menu">${list.map(k=>row(k)+(sel.has(k)&&!locked(k)?cxWhere(k):"")).join("")||`<small class="note" style="padding:12px">${t("ยังไม่มีโปรแกรม")}</small>`}</div>`}
  else{const list=all.filter(k=>!isCardio(PROGS[k])&&locOf(PROGS[k])===paLoc),cnt=id=>[...sel].filter(k=>PROGS[k]&&!isCardio(PROGS[k])&&locOf(PROGS[k])===id).length;
    body=`<div class="pa-step">1 · ${t("ไปที่ไหน?")}</div><div class="chips">${gymLocs.map(l=>`<button class="chip${l.id===paLoc?" on":""}" data-pl0="${esc(l.id)}">${esc(l.icon||"📍")} ${esc(t(l.name))}${cnt(l.id)?` · ${cnt(l.id)}`:""}</button>`).join("")}<button class="chip" data-pcnew>+ ${t("ที่ใหม่")}</button></div>
      <div class="pa-step">2 · ${t("โปรแกรม")}<span class="pa-hb"><button class="pa-new" data-pedit>${t(paEdit?"เสร็จ":"แก้ไข")}</button>${paEdit?"":`<button class="pa-new" data-pnew>+ ${t("สร้างใหม่")}</button>`}</span></div><div class="pm-menu">${list.map(row).join("")||`<small class="note" style="padding:12px">${t("ที่นี่ยังไม่มีโปรแกรม")}</small>`}</div>`}
  openGen(t("เพิ่มเข้าวันนี้"),`<div class="segc pa-tabs"><button class="chip" data-pt="gym" aria-pressed="${paTab==="gym"}">${t("เวท")}</button><button class="chip" data-pt="cardio" aria-pressed="${paTab==="cardio"}">${t("คาร์ดิโอ")}</button></div>
    ${body}<button class="btn primary sticky-b" data-pgo disabled>${t("เลือกโปรแกรม")}</button>`,
    b=>{const go=b.querySelector("[data-pgo]");const cxCh=()=>Object.entries(paCx).some(([k,l])=>sel.has(k)&&PROGS[k]&&PROGS[k].lastLoc!==l);
      const upd=()=>{const add=[...sel].filter(k=>!ks.has(k)).length,del=[...ks].filter(k=>!sel.has(k)).length,ch=add||del||cxCh();go.disabled=!ch;go.textContent=ch?(lang==="th"?`บันทึก · วันนี้ ${sel.size} โปรแกรม`:`Save · ${sel.size} today`):t("เลือกโปรแกรม")};upd();
      b.querySelectorAll("[data-pt]").forEach(x=>x.addEventListener("click",()=>{paTab=x.dataset.pt;openPlanAdd(sel)}));
      b.querySelectorAll("[data-pl0]").forEach(x=>x.addEventListener("click",()=>{paLoc=x.dataset.pl0;openPlanAdd(sel)}));
      b.querySelectorAll("[data-pcx]").forEach(x=>x.addEventListener("click",()=>{paCx[x.dataset.pcx]=x.dataset.pcl;openPlanAdd(sel)}));
      b.querySelectorAll("[data-pcnew]").forEach(x=>x.addEventListener("click",()=>quickPlace(paTab==="cardio"?"cardio":"gym",id=>{if(paTab==="cardio"){const k=x.closest(".pa-where")?.querySelector("[data-pcx]")?.dataset.pcx;if(k)paCx[k]=id}else paLoc=id;openPlanAdd(sel)},()=>openPlanAdd(sel))));
      b.querySelectorAll("[data-padd]").forEach(x=>x.addEventListener("click",()=>{const k=x.dataset.padd;if(sel.has(k))sel.delete(k);else sel.add(k);if(isCardio(PROGS[k])){openPlanAdd(sel);return}x.classList.toggle("sel",sel.has(k));x.querySelector(".pa-box").textContent=sel.has(k)?"✓":"";upd()}));
      go.addEventListener("click",()=>{let pc=false;Object.entries(paCx).forEach(([k,l])=>{if(sel.has(k)&&PROGS[k]&&PROGS[k].lastLoc!==l){PROGS[k].lastLoc=l;pc=true}});if(pc)saveProgs();
        sel.forEach(k=>{if(!ks.has(k))planAdd(k)});ks.forEach(k=>{if(!sel.has(k))planDel(k)});closeGen();renderGym()});
      b.querySelector("[data-pedit]")?.addEventListener("click",()=>{paEdit=!paEdit;openPlanAdd(sel)});
      b.querySelectorAll("[data-pdel]").forEach(x=>x.addEventListener("click",()=>{const k=x.dataset.pdel,p=PROGS[k];
        if(locked(k)){toast(t("โปรแกรมนี้กำลังเล่นหรือทำแล้ววันนี้"));return}if(!isCardio(p)&&p.ex.some(e=>isLocked(k,e))){toast("🔒 "+t("ท่าหลักห้ามลบหรือเปลี่ยน"));return}
        if(!x.dataset.sure){b.querySelectorAll("[data-pdel]").forEach(y=>{delete y.dataset.sure;y.classList.remove("warn")});x.dataset.sure=1;x.classList.add("warn");x.querySelector("small").textContent=t("แตะอีกครั้งเพื่อลบโปรแกรมนี้");return}
        delete PROGS[k];sel.delete(k);ks.delete(k);planDel(k);saveProgs();undoLoud("🗑 "+t("ลบโปรแกรมแล้ว"));openPlanAdd(sel)}));
      b.querySelector("[data-pnew]")?.addEventListener("click",()=>quickProg(paTab,paLoc,k=>{sel.add(k);openPlanAdd(sel)},()=>openPlanAdd(sel)))})}
// Add to today → "+ New place": only a place (name + icon); "+ New": only a program under the chosen place (name).
// Both return to the Add sheet with the new item picked; details (equipment, exercises) are edited later.
function quickPlace(type,done,back){let ic=type==="cardio"?"🏃":"🏢";const ics=["🏢","🏠","🏸","🏊","🏃","🌳","📍"];
  const draw=b=>{b.querySelector(".qp").innerHTML=`<div class="chips">${ics.map(x=>`<button class="chip${x===ic?" on":""}" data-qi="${x}">${x}</button>`).join("")}</div>
    <input class="le-in" id="qp-name" placeholder="${t("ชื่อสถานที่")}" aria-label="${t("ชื่อสถานที่")}" value="${esc(b._n||"")}">
    <small class="note">${t(type==="cardio"?"ใช้สำหรับคาร์ดิโอ":"ใช้สำหรับเวท")} · ${t("แก้อุปกรณ์ได้ภายหลังที่ เพิ่มเติม › สถานที่")}</small>
    <div class="actions sheet-act"><button class="btn" data-qb>${t("ยกเลิก")}</button><button class="btn primary" data-qs style="flex:1">✓ ${t("สร้างสถานที่")}</button></div>`;
    b.querySelectorAll("[data-qi]").forEach(x=>x.addEventListener("click",()=>{b._n=b.querySelector("#qp-name").value;ic=x.dataset.qi;draw(b)}));
    b.querySelector("[data-qb]").addEventListener("click",()=>genBack());setTimeout(()=>b.querySelector("#qp-name")?.focus(),50);
    b.querySelector("[data-qs]").addEventListener("click",()=>{const n=b.querySelector("#qp-name").value.trim();if(!n){toast(t("ใส่ชื่อสถานที่"));return}
      const l={id:"l"+Date.now().toString(36),name:n,icon:ic,map:"",eq:type==="cardio"?[]:["db","body"],types:[type]};LOCS.push(l);saveLocs();done(l.id)})};
  openGen(t("สถานที่ใหม่"),`<div class="qp stack" style="gap:10px"></div>`,draw)}
function quickProg(type,loc,done,back){const L=locById(loc),cx=type==="cardio",ex=[];let nm="";
  const draw=b=>{const box=b.querySelector(".qg");box.innerHTML=`${cx?"":`<small class="note">${t("ที่")} ${esc(L?L.icon+" "+t(L.name):"")}</small>`}
    <input class="le-in" id="qg-name" placeholder="${t(cx?"เช่น ว่ายน้ำ, ปั่นจักรยาน":"ชื่อโปรแกรม")}" aria-label="${t("ชื่อ")}" value="${esc(nm)}">
    ${cx?`<small class="note">${t("เลือกที่ได้ตอนเพิ่มเข้าวันนี้")}</small>`:`<div class="pa-step">${t("ท่าในโปรแกรม")} · ${ex.length}</div>
    <div class="pm-menu qg-ex">${ex.map((e,i)=>`<div class="menu-row qg-row"><span class="mt"><b>${esc(e.n)}</b></span><span class="qg-sr"><button class="btn sm" data-qd="${i}" data-dd="-1" aria-label="−">−</button><span>${e.s}×${esc(e.r)}</span><button class="btn sm" data-qd="${i}" data-dd="1" aria-label="+">+</button><button class="btn sm ghost" data-qx="${i}" aria-label="${t("ลบท่า")}">✕</button></span></div>`).join("")||`<small class="note" style="padding:12px">${t("ยังไม่มีท่า")}</small>`}</div>
    <button class="btn" data-qa>+ ${t("เพิ่มท่า")}</button>`}
    <div class="actions sheet-act"><button class="btn" data-qb>${t("ยกเลิก")}</button><button class="btn primary" data-qs style="flex:1">✓ ${t("สร้าง")}${ex.length?` · ${nU(ex.length,"ท่า")}`:""}</button></div>`;
    const keep=()=>{nm=box.querySelector("#qg-name").value};
    box.querySelector("[data-qb]").addEventListener("click",()=>genBack());if(!nm)setTimeout(()=>box.querySelector("#qg-name")?.focus(),50);
    box.querySelector("[data-qa]")?.addEventListener("click",()=>{keep();openLib({skip:new Set(ex.map(e=>e.id)),onPick:x=>{ex.push({...libPick(x),s:3,r:"10"});openGen(t("โปรแกรมใหม่"),`<div class="qg stack" style="gap:10px"></div>`,draw)}})});
    box.querySelectorAll("[data-qd]").forEach(x=>x.addEventListener("click",()=>{keep();const e=ex[+x.dataset.qd];e.s=Math.max(1,Math.min(10,e.s+ +x.dataset.dd));draw(b)}));
    box.querySelectorAll("[data-qx]").forEach(x=>x.addEventListener("click",()=>{keep();ex.splice(+x.dataset.qx,1);draw(b)}));
    box.querySelector("[data-qs]").addEventListener("click",()=>{keep();const n=nm.trim();if(!n){toast(t("ใส่ชื่อโปรแกรม"));return}
      const k=(cx?"x":"p")+Date.now().toString(36);PROGS[k]=cx?{name:n,kind:"cardio",icon:"🏃",track:"dist",ex:[],loc:"*",days:[]}:{name:n,sub:"",ex:ex.slice(),loc,days:[]};saveProgs();done(k)})};
  openGen(t(cx?"กีฬาใหม่":"โปรแกรมใหม่"),`<div class="qg stack" style="gap:10px"></div>`,draw)}
Object.assign(EN,{"สถานที่ใหม่":"New place","สร้างสถานที่":"Create place","ใช้สำหรับคาร์ดิโอ":"For cardio","ใช้สำหรับเวท":"For weights","แก้อุปกรณ์ได้ภายหลังที่ เพิ่มเติม › สถานที่":"Edit equipment later in More › Places","ใส่ชื่อสถานที่":"Enter a place name","กีฬาใหม่":"New sport","โปรแกรมใหม่":"New program","ที่":"At","เช่น ว่ายน้ำ, ปั่นจักรยาน":"e.g. swimming, cycling","ชื่อ":"Name","เลือกที่ได้ตอนเพิ่มเข้าวันนี้":"Pick the place when adding to today","เพิ่มท่าได้ภายหลังที่ ✎ แก้โปรแกรม":"Add exercises later via ✎ Edit program","สร้าง":"Create","ท่าในโปรแกรม":"Exercises","ยังไม่มีท่า":"No exercises yet"});
Object.assign(EN,{"สร้างใหม่":"New","กีฬาอะไร?":"Which sport?","ที่ไหน?":"Where?","ที่นี่ยังไม่มีโปรแกรม":"No programs here yet"});
// one form, nothing is created until Create is tapped
function openCreateProg(o){o=o||{};let ty=o.type||"gym",loc=o.loc&&locById(o.loc)?o.loc:hasType(hereLoc(),"gym")?curLoc:(LOCS.find(l=>hasType(l,"gym"))||{}).id;
  const draw=()=>{const gl=LOCS.filter(l=>hasType(l,"gym"));
    openGen(t("สร้างโปรแกรมใหม่"),`<div class="le"><div class="label" style="margin:0">${t("ประเภท")}</div><div class="segc"><button class="chip" data-ct="gym" aria-pressed="${ty==="gym"}">${t("เวท")}</button><button class="chip" data-ct="cardio" aria-pressed="${ty==="cardio"}">${t("คาร์ดิโอ")}</button></div>
      ${ty==="gym"?`<div class="label" style="margin:0">${t("สถานที่")}</div><div class="chips">${gl.map(l=>`<button class="chip" data-cl="${esc(l.id)}" aria-pressed="${l.id===loc}">${esc(l.icon||"📍")} ${esc(t(l.name))}</button>`).join("")}</div>`:`<small class="note">${t("คาร์ดิโอทำได้ทุกที่ — เลือกที่ตอนบันทึก")}</small>`}
      <input class="le-in" id="cp-name" placeholder="${t("ชื่อโปรแกรม")}" aria-label="${t("ชื่อโปรแกรม")}" value="${esc(o.name||"")}">
      <button class="btn primary" data-cgo>${t(o.today?"สร้าง + เพิ่มเข้าวันนี้":"สร้าง")}</button></div>`,b=>{
      const keepName=()=>{o.name=b.querySelector("#cp-name").value};
      b.querySelectorAll("[data-ct]").forEach(x=>x.addEventListener("click",()=>{keepName();ty=x.dataset.ct;draw()}));
      b.querySelectorAll("[data-cl]").forEach(x=>x.addEventListener("click",()=>{keepName();loc=x.dataset.cl;draw()}));
      setTimeout(()=>b.querySelector("#cp-name")?.focus(),50);
      b.querySelector("[data-cgo]").addEventListener("click",()=>{const n=b.querySelector("#cp-name").value.trim();if(!n){toast(t("ใส่ชื่อโปรแกรม"));return}
        const k=(ty==="gym"?"p":"x")+Date.now().toString(36);
        PROGS[k]=ty==="gym"?{name:n,sub:"",ex:[],loc,days:[]}:{name:n,kind:"cardio",icon:"🏃",track:"dist",ex:[],loc:"*",days:[]};saveProgs();if(o.today)planAdd(k);closeGen();
        if(ty==="gym"){curLoc=loc;pmOnly=k;pmFromList=false;renderPM();document.getElementById("pm-modal").hidden=false}else openCardioEdit(k);renderGym()})})};draw()}

const todChips=sel=>`<div class="label" style="margin:2px 0 0">${t("ช่วงเวลา")}</div><div class="chips" data-todc>${TOD.map(([k,n])=>`<button type="button" class="chip" data-tod="${k}" aria-pressed="${sel===k}">${t(n)}</button>`).join("")}</div>`;
function bindTod(box,p,after){box.querySelectorAll("[data-tod]").forEach(c=>c.addEventListener("click",()=>{p.tod=p.tod===c.dataset.tod?undefined:c.dataset.tod;if(!p.tod)delete p.tod;box.querySelectorAll("[data-tod]").forEach(x=>x.setAttribute("aria-pressed",x.dataset.tod===p.tod));after&&after()}))}

/* ---------- cardio: where did you do it? ---------- */
function cardioWhere(host,k){if(!host)return;let w=host.querySelector(".cw");if(!w){w=document.createElement("div");w.className="cw";const h=host.querySelector(":scope>.sheet-h,:scope>.label");if(h)h.after(w);else host.prepend(w)}
  const p=PROGS[k];if(!p){w.innerHTML="";return}if(!locById(curLoc)||(p.lastLoc&&locById(p.lastLoc)&&locDay.date!==TODAY))curLoc=p.lastLoc||curLoc;
  w.innerHTML=`<div class="label" style="margin:0">${t("ที่ไหน")}</div><div class="chips">${LOCS.map(l=>`<button type="button" class="chip" data-cw="${esc(l.id)}" aria-pressed="${l.id===curLoc}">${esc(l.icon||"📍")} ${esc(t(l.name))}</button>`).join("")}<button type="button" class="chip" data-cwnew>＋ ${t("ที่ใหม่")}</button></div><div class="cw-new" hidden><input class="le-in" placeholder="${t("ชื่อสถานที่")}"><button type="button" class="btn sm primary">${t("บันทึก")}</button></div>`;
  w.querySelectorAll("[data-cw]").forEach(c=>c.addEventListener("click",()=>{curLoc=c.dataset.cw;cardioWhere(host,k)}));
  w.querySelector("[data-cwnew]").addEventListener("click",()=>{const n=w.querySelector(".cw-new");n.hidden=false;n.querySelector("input").focus()});
  w.querySelector(".cw-new .btn").addEventListener("click",()=>{const v=w.querySelector(".cw-new input").value.trim();if(!v)return;const l={id:"l"+Date.now().toString(36),name:v,icon:"📍",map:"",eq:["body"],types:["cardio"]};LOCS.push(l);saveLocs();curLoc=l.id;cardioWhere(host,k)})}

Object.assign(EN,{"เสร็จแล้ว_pl":"Done"});
