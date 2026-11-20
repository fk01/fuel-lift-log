// onboarding.js — a new account builds its OWN profile, meal plan, places and workout plan (4 steps, every step skippable).
// Also: More › Profile (edit + recalculate targets). Classic script: shares globals with the other files in /js.
let PROFILE=load("profile",null);
// --- targets: Mifflin-St Jeor × activity, ± goal; protein g/kg by goal ---
function calcTargets(p){const w=+p.w||70,h=+p.h||170,a=+p.age||30,bmr=10*w+6.25*h-5*a+(p.sex==="f"?-161:5);
  const tdee=bmr*({low:1.35,mid:1.55,high:1.75}[p.act]||1.55),k=Math.round(tdee*({cut:.85,bulk:1.1,keep:1}[p.goal]||1)/10)*10;
  return{k,p:Math.round(w*({cut:2,bulk:1.8,keep:1.6}[p.goal]||1.6))}}
const MEAL_SETS={3:[["08:00","เช้า",.3],["12:30","กลางวัน",.4],["19:00","เย็น",.3]],4:[["08:00","เช้า",.25],["12:30","กลางวัน",.3],["16:00","ว่างบ่าย",.15],["19:30","เย็น",.3]],
  5:[["08:00","เช้า",.22],["10:30","ว่างเช้า",.1],["12:30","กลางวัน",.28],["16:00","ว่างบ่าย",.12],["19:30","เย็น",.28]],6:[["08:00","เช้า",.2],["10:30","ว่างเช้า",.1],["12:30","กลางวัน",.25],["16:00","ว่างบ่าย",.12],["19:30","เย็น",.23],["21:30","ก่อนนอน",.1]]};
function buildMeals(n,k,p){return(MEAL_SETS[n]||MEAL_SETS[4]).map(([time,name,r],i)=>({id:"m"+(i+1),time,name,k:Math.round(k*r/10)*10,p:Math.round(p*r),items:[]}))}
// --- workout templates: each movement has a gym / dumbbell / bodyweight version ---
const MOVES={
  squat:{gym:["squat","Squat","🏋️",["quad","glute"],["ham"]],db:["goblet-squat","Goblet Squat","🏋️",["quad","glute"],[]],body:["bw-squat","Bodyweight Squat","🤸",["quad","glute"],[]]},
  hinge:{gym:["deadlift","Deadlift","🏋️",["ham","glute"],["lats"]],db:["db-rdl","Dumbbell Romanian Deadlift","🏋️",["ham"],["glute"]],body:["glute-bridge","Glute Bridge","🤸",["glute"],["ham"]]},
  lunge:{gym:["leg-press","Leg Press","🔩",["quad"],["glute"]],db:["db-split-squat","Dumbbell Bulgarian Split Squat","🏋️",["quad"],["glute"]],body:["lunge","Walking Lunge","🤸",["quad"],["glute"]]},
  legcurl:{gym:["leg-curl","Leg Curl","🔩",["ham"],[]],db:["db-rdl","Dumbbell Romanian Deadlift","🏋️",["ham"],["glute"]],body:["sl-bridge","Single-Leg Glute Bridge","🤸",["ham","glute"],[]]},
  calf:{gym:["seated-calf","Seated Calf Raise","🔩",["calf"],[]],db:["db-calf","Dumbbell Calf Raise","🏋️",["calf"],[]],body:["bw-calf","Calf Raise","🤸",["calf"],[]]},
  press:{gym:["chest-press","Chest Press Machine","🔩",["chest"],["tri","delt"]],db:["db-bench","Dumbbell Bench Press","🏋️",["chest"],["tri","delt"]],body:["pushup","Push-up","🤸",["chest"],["tri","delt"]]},
  incline:{gym:["incline-db","Incline Dumbbell Press","🏋️",["chest"],["delt"]],db:["incline-db","Incline Dumbbell Press","🏋️",["chest"],["delt"]],body:["decline-pushup","Decline Push-up","🤸",["chest"],["delt"]]},
  ohp:{gym:["db-shoulder-press","Dumbbell Shoulder Press","🏋️",["delt"],["tri"]],db:["db-shoulder-press","Dumbbell Shoulder Press","🏋️",["delt"],["tri"]],body:["pike-pushup","Pike Push-up","🤸",["delt"],["tri"]]},
  lateral:{gym:["cable-lat-raise","Cable Side Lateral Raise","🔗",["delt"],[]],db:["db-lat-raise","Dumbbell Lateral Raise","🏋️",["delt"],[]],body:["pike-pushup","Pike Push-up","🤸",["delt"],["tri"]]},
  tri:{gym:["cable-oh-tri","Cable Overhead Triceps Extension","🔗",["tri"],[]],db:["db-oh-tri","Dumbbell Overhead Triceps Extension","🏋️",["tri"],[]],body:["bench-dip","Bench Dip","🤸",["tri"],["chest"]]},
  vpull:{gym:["lat-pulldown","Lat Pulldown","🔩",["lats"],["bi"]],db:["db-pullover","Dumbbell Pullover","🏋️",["lats"],["chest"]],body:["pullup","Pull-up / Australian Row","🤸",["lats"],["bi"]]},
  row:{gym:["seated-cable-row","Seated Cable Row","🔗",["lats","traps"],["bi"]],db:["db-row","One-Arm Dumbbell Row","🏋️",["lats"],["bi","rear"]],body:["inv-row","Inverted Row","🤸",["lats","traps"],["bi"]]},
  rear:{gym:["reverse-fly","Reverse Peck Deck Fly","🔩",["rear"],["traps"]],db:["db-rev-fly","Bent-Over Dumbbell Reverse Fly","🏋️",["rear"],["traps"]],body:["prone-y","Prone Y Raise","🤸",["rear"],["traps"]]},
  curl:{gym:["machine-curl","Machine Biceps Curl","🔩",["bi"],[]],db:["db-curl","Dumbbell Curl","🏋️",["bi"],["fore"]],body:["chin-up","Chin-up (negatives)","🤸",["bi"],["lats"]]},
  core:{gym:["abdominal","Crunch Machine (Abdominal Machine)","🔩",["abs"],[]],db:["db-woodchop","Dumbbell Wood Chop","🏋️",["obl"],["abs"]],body:["plank","Plank","🤸",["abs"],["obl"]]}};
const TEMPLATES={
  3:{name:"Full body",days:[[1,"Full body A",["squat","press","row","ohp","legcurl","core"]],[3,"Full body B",["hinge","incline","vpull","lateral","lunge","core"]],[5,"Full body C",["squat","press","row","curl","tri","calf"]]]},
  4:{name:"Upper / Lower",days:[[1,"Upper A",["press","row","ohp","vpull","curl","tri"]],[2,"Lower A",["squat","legcurl","lunge","calf","core"]],[4,"Upper B",["incline","vpull","lateral","row","rear","tri"]],[5,"Lower B",["hinge","lunge","legcurl","calf","core"]]]},
  6:{name:"Push / Pull / Legs",days:[[1,"Push A",["press","incline","ohp","lateral","tri"]],[2,"Pull A",["vpull","row","rear","curl","core"]],[3,"Legs A",["squat","hinge","lunge","legcurl","calf"]],[4,"Push B",["incline","press","ohp","lateral","tri"]],[5,"Pull B",["row","vpull","rear","curl","core"]],[6,"Legs B",["hinge","squat","lunge","calf","core"]]]}};
const ONB_PLACES={gym:{name:"ฟิตเนส",icon:"🏢",eq:EQ_ALL.slice(),kind:"gym",sub:"เครื่อง · บาร์ · ดัมเบล · เคเบิล"},home:{name:"บ้าน / คอนโด",icon:"🏠",eq:["db","bench","body"],kind:"db",sub:"ดัมเบล · ม้านั่ง"},
  bw:{name:"ตัวเปล่า",icon:"🤸",eq:["body"],kind:"body",sub:"ไม่ต้องใช้อุปกรณ์"},cardio:{name:"นอกบ้าน",icon:"🌳",eq:[],kind:null,sub:"วิ่ง · ว่ายน้ำ · กีฬา"}};
function buildPlan(o){const locs=[],progs={free:{name:t("ออกแบบอิสระ"),sub:"",ex:[]}},lib=[];let first=null;
  o.places.forEach(pk=>{const P=ONB_PLACES[pk];const id="l"+pk+Date.now().toString(36).slice(-4);locs.push({id,name:P.name,icon:P.icon,map:"",eq:P.eq,types:P.kind?["gym","cardio"]:["cardio"]});
    if(!P.kind||o.plan==="blank"||!TEMPLATES[o.days])return;const T=TEMPLATES[o.days];
    T.days.forEach(([wd,name,mv],i)=>{const ex=mv.map((m,j)=>{const [eid,n,z,mp,ms]=MOVES[m][P.kind];if(!lib.some(x=>x.id===eid))lib.push({id:eid,n,z,mp,ms});return{id:eid,n,z,mp,ms,s:j<2?4:3,r:j<2?"6-8":"10-12",...(j===0?{main:1}:{})}});
      progs["p"+pk+i+Date.now().toString(36).slice(-3)]={name,sub:T.name,ex,loc:id,days:first&&first!==id?[]:[wd]}});
    if(!first)first=id});
  if(o.places.includes("cardio"))progs["xrun"+Date.now().toString(36).slice(-3)]={name:t("วิ่ง"),kind:"cardio",icon:"🏃",tag:"run",track:"dist",goal:5,ex:[],loc:"*",days:[],lastLoc:(locs.find(l=>l.types.length===1)||locs[0]||{}).id};
  if(!locs.length)locs.push({id:"lhome",name:t("ที่ออกกำลังกาย"),icon:"📍",map:"",eq:["body"],types:["gym","cardio"]});
  return{locs,progs,lib}}
// --- the 4-step sheet ---
function openOnboarding(){const pr=PROFILE||{name:(ME&&ME.name)||"",sex:"m",age:30,h:170,w:70,goal:"keep",act:"mid"};
  const o={step:0,meals:4,places:["gym"],days:4,plan:"tpl"},m=document.getElementById("onb");m.hidden=false;let tg=calcTargets(pr);
  const chips=(f,opts,cur)=>`<div class="chips">${opts.map(([v,l])=>`<button class="chip${String(v)===String(cur)?" on":""}" data-f="${f}" data-v="${v}">${t(l)}</button>`).join("")}</div>`;
  const draw=()=>{const s=o.step,bar=[0,1,2,3].map(i=>`<i class="${i<=s?"on":""}"></i>`).join("");let body="";
    if(s===0)body=`<h1>${t("เกี่ยวกับคุณ")}</h1><input class="le-in" data-p="name" placeholder="${t("ชื่อ")}" value="${esc(pr.name||"")}">
      ${chips("sex",[["m","ชาย"],["f","หญิง"]],pr.sex)}<div class="onb-3"><label>${t("อายุ")}<input class="le-in" inputmode="numeric" data-p="age" value="${pr.age}"></label><label>${t("ส่วนสูง")} cm<input class="le-in" inputmode="numeric" data-p="h" value="${pr.h}"></label><label>${t("น้ำหนัก")} kg<input class="le-in" inputmode="decimal" data-p="w" value="${pr.w}"></label></div>
      <div class="pa-step">${t("เป้าหมาย")}</div>${chips("goal",[["cut","ลดไขมัน"],["bulk","เพิ่มกล้าม"],["keep","รักษาหุ่น"]],pr.goal)}
      <div class="pa-step">${t("กิจกรรมต่อวัน")}</div>${chips("act",[["low","นั่งทำงาน"],["mid","ปานกลาง"],["high","ออกหนัก"]],pr.act)}`;
    if(s===1){const ms=buildMeals(o.meals,tg.k,tg.p);body=`<h1>${t("แผนการกิน")}</h1><div class="card onb-t"><small class="note">${t("คำนวณจากโปรไฟล์ — แก้ได้")}</small><div class="onb-3" style="grid-template-columns:1fr 1fr"><label>kcal / ${t("วัน")}<input class="le-in" inputmode="numeric" data-t="k" value="${tg.k}"></label><label>${t("โปรตีน")} g<input class="le-in" inputmode="numeric" data-t="p" value="${tg.p}"></label></div></div>
      <div class="pa-step">${t("กินกี่มื้อ")}</div>${chips("meals",[[3,"3"],[4,"4"],[5,"5"],[6,"6"]],o.meals)}
      <div class="card">${ms.map(x=>`<div class="tm-row"><span class="time">${x.time}</span><span class="tm-tx"><b>${t(x.name)}</b><small>${x.k} kcal · P${x.p}</small></span></div>`).join("")}</div><small class="note">${t("เมนูในแต่ละมื้อ เติมเองทีหลังที่ จัดการแผน")}</small>`}
    if(s===2)body=`<h1>${t("ออกกำลังกายที่ไหน")}</h1><small class="note">${t("เลือกได้หลายที่")}</small><div class="pm-menu">${Object.entries(ONB_PLACES).map(([k,P])=>`<button class="menu-row pa-row${o.places.includes(k)?" sel":""}" data-pl0="${k}"><span class="mi">${P.icon}</span><span class="mt"><b>${t(P.name)}</b><small>${t(P.sub)}</small></span><span class="pa-box">${o.places.includes(k)?"✓":""}</span></button>`).join("")}</div>`;
    if(s===3){const T=TEMPLATES[o.days];body=`<h1>${t("แผนออกกำลังกาย")}</h1><div class="pa-step">${t("ว่างกี่วันต่อสัปดาห์")}</div>${chips("days",[[3,"3 วัน"],[4,"4 วัน"],[6,"6 วัน"]],o.days)}
      <div class="pm-menu"><button class="menu-row pa-row${o.plan==="tpl"?" sel":""}" data-plan="tpl"><span class="mt"><b>${T.name}</b><small>${T.days.map(d=>[t("อา."),t("จ."),t("อ."),t("พ."),t("พฤ."),t("ศ."),t("ส.")][d[0]]+" "+d[1]).join(" · ")}</small></span><span class="pa-box">${o.plan==="tpl"?"✓":""}</span></button>
      <button class="menu-row pa-row${o.plan==="blank"?" sel":""}" data-plan="blank"><span class="mt"><b>${t("เริ่มว่าง")}</b><small>${t("สร้างโปรแกรมเอง")}</small></span><span class="pa-box">${o.plan==="blank"?"✓":""}</span></button></div>
      <small class="note">${t("มีลิงก์จากเพื่อน? เปิดลิงก์หลังเริ่มใช้แอปได้เลย")}</small>`}
    m.querySelector(".onb-in").innerHTML=`<div class="onb-bar">${bar}</div><small class="note">${s+1}/4</small>${body}
      <div class="tx-btns onb-nav"><button class="btn" data-onb="${s?"back":"skip"}">${t(s?"‹ ย้อน":"ข้าม")}</button><button class="btn primary" data-onb="next">${t(s<3?"ถัดไป ›":"✓ เริ่มใช้แอป")}</button></div>`;
    const keepInputs=()=>{m.querySelectorAll("[data-p]").forEach(x=>{const f=x.dataset.p;pr[f]=f==="name"?x.value.trim():+x.value||pr[f]});m.querySelectorAll("[data-t]").forEach(x=>{tg[x.dataset.t]=+x.value||tg[x.dataset.t]})};
    m.querySelectorAll("[data-f]").forEach(x=>x.addEventListener("click",()=>{keepInputs();const f=x.dataset.f,v=x.dataset.v;if(f in pr)pr[f]=v;else o[f]=+v;if(s===0)tg=calcTargets(pr);draw()}));
    m.querySelectorAll("[data-pl0]").forEach(x=>x.addEventListener("click",()=>{const k=x.dataset.pl0;o.places=o.places.includes(k)?o.places.filter(q=>q!==k):[...o.places,k];draw()}));
    m.querySelectorAll("[data-plan]").forEach(x=>x.addEventListener("click",()=>{o.plan=x.dataset.plan;draw()}));
    m.querySelector('[data-onb="next"]').addEventListener("click",()=>{keepInputs();if(s===0)tg=calcTargets(pr);if(s<3){o.step++;draw();return}finishOnboarding(pr,tg,o)});
    m.querySelector('[data-onb="back"]')?.addEventListener("click",()=>{keepInputs();o.step--;draw()});
    m.querySelector('[data-onb="skip"]')?.addEventListener("click",()=>{keepInputs();o.step++;draw()});
    m.querySelectorAll("input").forEach(x=>x.addEventListener("change",()=>{keepInputs();if(s===0)tg=calcTargets(pr)}))};
  draw()}
function finishOnboarding(pr,tg,o){PROFILE={...pr,at:Date.now()};save("profile",PROFILE);
  MP={meals:buildMeals(o.meals,tg.k,tg.p),run:EXTRAS_DEF.run,bad:EXTRAS_DEF.bad,k:tg.k,p:tg.p};mpApply();save("mealplan",MP);
  const b=buildPlan(o);LOCS=b.locs;saveLocs();PROGS=b.progs;b.lib.forEach(x=>{if(!EXLIB.some(q=>q.id===x.id))EXLIB.push(x)});save("exlib",EXLIB);saveProgs();
  curLoc=LOCS[0].id;cur=nextProg();draft={};save("gymdraft",draft);document.getElementById("onb").hidden=true;location.hash="home";renderAll();try{renderHome()}catch(e){}toast("✓ "+t("พร้อมแล้ว — นี่คือแผนของคุณ"));setTimeout(()=>{undoLast=null;const u=document.getElementById("undo-bar");if(u)u.hidden=true},50)}
// --- More › Profile ---
function openProfile(){const pr={...(PROFILE||{sex:"m",age:30,h:170,w:70,goal:"keep",act:"mid"})};try{const bw=BODY.slice().sort((a,b)=>a.d.localeCompare(b.d)).pop();if(bw)pr.w=bw.kg}catch(e){}
  const draw=b=>{const tg=calcTargets(pr),ch=(f,opts)=>`<div class="chips">${opts.map(([v,l])=>`<button class="chip${pr[f]===v?" on":""}" data-pf="${f}" data-v="${v}">${t(l)}</button>`).join("")}</div>`;
    b.querySelector(".pf").innerHTML=`<input class="le-in" data-p="name" placeholder="${t("ชื่อ")}" value="${esc(pr.name||"")}">${ch("sex",[["m","ชาย"],["f","หญิง"]])}
      <div class="onb-3"><label>${t("อายุ")}<input class="le-in" inputmode="numeric" data-p="age" value="${pr.age}"></label><label>${t("ส่วนสูง")} cm<input class="le-in" inputmode="numeric" data-p="h" value="${pr.h}"></label><label>${t("น้ำหนัก")} kg<input class="le-in" inputmode="decimal" data-p="w" value="${pr.w}"></label></div>
      <div class="pa-step">${t("เป้าหมาย")}</div>${ch("goal",[["cut","ลดไขมัน"],["bulk","เพิ่มกล้าม"],["keep","รักษาหุ่น"]])}<div class="pa-step">${t("กิจกรรมต่อวัน")}</div>${ch("act",[["low","นั่งทำงาน"],["mid","ปานกลาง"],["high","ออกหนัก"]])}
      <div class="card"><small class="note">${t("เป้าที่แนะนำ")}: <b>${tg.k.toLocaleString()} kcal · ${t("โปรตีน")} ${tg.p} g</b> (${t("ตอนนี้")} ${K_GOAL.toLocaleString()} · ${P_TARGET} g)</small><label class="mp-vit" style="display:flex;gap:8px;margin-top:8px"><input type="checkbox" id="pf-apply"> ${t("ใช้เป้านี้กับแผนกิน (ปรับสัดส่วนทุกมื้อ)")}</label></div>
      <div class="actions sheet-act"><button class="btn" data-gen-close>${t("ยกเลิก")}</button><button class="btn primary" data-pfs style="flex:1">✓ ${t("บันทึก")}</button></div>`;
    const keep=()=>b.querySelectorAll("[data-p]").forEach(x=>{const f=x.dataset.p;pr[f]=f==="name"?x.value.trim():+x.value||pr[f]});
    b.querySelectorAll("[data-pf]").forEach(x=>x.addEventListener("click",()=>{keep();pr[x.dataset.pf]=x.dataset.v;draw(b)}));
    b.querySelectorAll("[data-p]").forEach(x=>x.addEventListener("change",()=>{keep();draw(b)}));
    b.querySelector("[data-pfs]").addEventListener("click",()=>{keep();PROFILE={...pr,at:Date.now()};save("profile",PROFILE);
      if(b.querySelector("#pf-apply").checked){const tg2=calcTargets(pr),sk=K_GOAL||1,sp=P_TARGET||1;MP=MP||{meals:MEALS.map(x=>({...x})),run:EXTRAS.run,bad:EXTRAS.bad};
        MP.meals=(MP.meals||MEALS).map(x=>({...x,k:Math.round((+x.k||0)*tg2.k/sk),p:Math.round((+x.p||0)*tg2.p/sp)}));MP.k=tg2.k;MP.p=tg2.p;mpApply();save("mealplan",MP)}
      closeGen();renderAll();toast("✓ "+t("บันทึกแล้ว"))})};
  openGen(t("โปรไฟล์"),`<div class="pf stack" style="gap:10px"></div>`,draw)}
Object.assign(EN,{"แผนการกิน":"Meal plan","ข้าม":"Skip","เกี่ยวกับคุณ":"About you","ชาย":"Male","หญิง":"Female","อายุ":"Age","ส่วนสูง":"Height","เป้าหมาย":"Goal","ลดไขมัน":"Lose fat","เพิ่มกล้าม":"Build muscle","รักษาหุ่น":"Maintain","กิจกรรมต่อวัน":"Daily activity","นั่งทำงาน":"Desk job","ปานกลาง":"Moderate","ออกหนัก":"Very active","คำนวณจากโปรไฟล์ — แก้ได้":"From your profile — edit if you like","กินกี่มื้อ":"Meals per day","เมนูในแต่ละมื้อ เติมเองทีหลังที่ จัดการแผน":"Add foods to each meal later in Manage plan","ออกกำลังกายที่ไหน":"Where do you train?","เลือกได้หลายที่":"Pick any","ฟิตเนส":"Gym","บ้าน / คอนโด":"Home","นอกบ้าน":"Outdoors","เครื่อง · บาร์ · ดัมเบล · เคเบิล":"Machines · barbell · dumbbells · cables","ดัมเบล · ม้านั่ง":"Dumbbells · bench","ไม่ต้องใช้อุปกรณ์":"No equipment","วิ่ง · ว่ายน้ำ · กีฬา":"Running · swimming · sports","แผนออกกำลังกาย":"Workout plan","ว่างกี่วันต่อสัปดาห์":"Days per week","3 วัน":"3 days","4 วัน":"4 days","6 วัน":"6 days","เริ่มว่าง":"Start empty","สร้างโปรแกรมเอง":"Build your own","มีลิงก์จากเพื่อน? เปิดลิงก์หลังเริ่มใช้แอปได้เลย":"Got a link from a friend? Open it after you start","‹ ย้อน":"‹ Back","ถัดไป ›":"Next ›","✓ เริ่มใช้แอป":"✓ Start","พร้อมแล้ว — นี่คือแผนของคุณ":"Ready — this is your plan","ที่ออกกำลังกาย":"Workout place","วิ่ง":"Run","เช้า":"Breakfast","กลางวัน":"Lunch","เย็น":"Dinner","ว่างบ่าย":"Afternoon snack","ว่างเช้า":"Morning snack","ก่อนนอน":"Before bed","โปรไฟล์":"Profile","เป้าที่แนะนำ":"Suggested","ตอนนี้":"now","ใช้เป้านี้กับแผนกิน (ปรับสัดส่วนทุกมื้อ)":"Apply to my meal plan (scales every meal)","อา.":"Sun","จ.":"Mon","อ.":"Tue","พ.":"Wed","พฤ.":"Thu","ศ.":"Fri","ส.":"Sat"});
