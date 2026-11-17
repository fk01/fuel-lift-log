// programs.js — workout programs, weekly schedule, program picker
// Classic script: shares globals with the other files in /js (load order is set in index.html).
/* ---------- GYM ---------- */
const DEFAULT_PROGS={
 push:{name:"Push A",sub:"อ. · อก ไหล่ + ต้นขาหน้า ขาหลัง",ex:[
  {id:"chest-press",n:"Chest Press Machine",z:"🔩",s:5,r:"5",alt:"pec-fly"},
  {id:"incline-db",n:"Incline Dumbbell Press",z:"🏋️",s:5,r:"5",main:1},
  {id:"db-shoulder-press",n:"Dumbbell Shoulder Press",z:"🏋️",s:5,r:"5",main:1},
  {id:"cable-lat-raise",n:"Cable Side Lateral Raise",z:"🔗",s:5,r:"5",main:1},
  {id:"cable-oh-tri",n:"Cable Overhead Triceps Extension",z:"🔗",s:5,r:"5",main:1},
  {id:"leg-ext",n:"Leg Extension",z:"🔩",s:3,r:"5"},
  {id:"leg-curl",n:"Leg Curl",z:"🔩",s:3,r:"5"}]},
 pull:{name:"Pull A",sub:"พ. · หลัง แขน + Squat แกนกลาง",ex:[
  {id:"lat-pulldown",n:"Lat Pulldown",z:"🔩",s:5,r:"5",main:1},
  {id:"wide-cable-row",n:"Lat Row",z:"🔗",s:5,r:"5",main:1},
  {id:"seated-cable-row",n:"Seated Cable Row",z:"🔗",s:5,r:"5",main:1},
  {id:"squat",n:"Squat",z:"🏋️",s:3,r:"5"},
  {id:"reverse-fly",n:"Reverse Peck Deck Fly",z:"🔩",s:5,r:"5"},
  {id:"machine-curl",n:"Machine Biceps Curl",z:"🔩",s:5,r:"5"},
  {id:"abdominal",n:"Crunch Machine (Abdominal Machine)",z:"🔩",s:5,r:"5"}]},
 push2:{name:"Push B",sub:"ส. · อก ไหล่ + น่อง ขาใน ขานอก",ex:[
  {id:"pec-fly",n:"Peck Deck Fly",z:"🔩",s:5,r:"5",alt:"chest-press"},
  {id:"incline-db",n:"Incline Dumbbell Press",z:"🏋️",s:5,r:"5",main:1},
  {id:"db-shoulder-press",n:"Dumbbell Shoulder Press",z:"🏋️",s:5,r:"5",main:1},
  {id:"cable-lat-raise",n:"Cable Side Lateral Raise",z:"🔗",s:5,r:"5",main:1},
  {id:"cable-oh-tri",n:"Cable Overhead Triceps Extension",z:"🔗",s:5,r:"5",main:1},
  {id:"seated-calf",n:"Seated Calf Raise",z:"🔩",s:3,r:"5"},
  {id:"hip-add",n:"Hip Adduction (Inner Thigh)",z:"🔩",s:3,r:"5"},
  {id:"hip-abd",n:"Hip Abduction (Outer Thigh)",z:"🔩",s:3,r:"5"}]},
 pull2:{name:"Pull B",sub:"อา. · หลัง แขน + Deadlift แกนกลาง",ex:[
  {id:"lat-pulldown",n:"Lat Pulldown",z:"🔩",s:5,r:"5",main:1},
  {id:"wide-cable-row",n:"Lat Row",z:"🔗",s:5,r:"5",main:1},
  {id:"seated-cable-row",n:"Seated Cable Row",z:"🔗",s:5,r:"5",main:1},
  {id:"deadlift",n:"Deadlift",z:"🏋️",g:"legs",s:3,r:"5"},
  {id:"reverse-fly",n:"Reverse Peck Deck Fly",z:"🔩",s:5,r:"5"},
  {id:"machine-curl",n:"Machine Biceps Curl",z:"🔩",s:5,r:"5"},
  {id:"woodchop",n:"Cable Wood Chop",z:"🔗",s:5,r:"5"}]},
};
/* ตารางสัปดาห์: จ.=วิ่ง 10K · อ.=Push A · พ.=Pull A · พฤ.=แบด · ศ.=พัก · ส.=Push B · อา.=Pull B (ขากระจายทุกวันเวท) */
const WEEK={1:"run",2:"push",3:"pull",4:"bad",6:"push2",0:"pull2"};
const SCHEME=4;
const progName=k=>(PROGS[k]||{name:k==="legs"?"Legs":k}).name;
let PROGS=load("progs",null)||JSON.parse(JSON.stringify(DEFAULT_PROGS));
function to5x5(){const keep={};Object.values(PROGS).forEach(p=>p.ex.forEach(e=>keep[e.id]=e));PROGS=JSON.parse(JSON.stringify(DEFAULT_PROGS));Object.values(PROGS).forEach(p=>p.ex.forEach(e=>{const o=keep[e.id];if(o){if(o.u)e.u=o.u;if(o.link)e.link=o.link}}))}
if(load("scheme",1)<SCHEME){to5x5();try{localStorage.setItem("progs",JSON.stringify(PROGS));localStorage.setItem("scheme",String(SCHEME))}catch(e){};var _clearDraft=true}
let unit=load("unit","kg");let editing=false;let editId=null;let picked=false;let chosen=false;   // chosen = a program card is selected; picked = workout started (steps 3 & 4 shown)
const LB=2.20462;
const toDisp=(kg,u)=>kg===""||kg==null?"":u!=="lb"?+kg:Math.round(kg*LB*2)/2;
const fromDisp=(v,u)=>v===""?"":u!=="lb"?+v:Math.round(v/LB*1000)/1000;
function uOf(id){for(const p of Object.values(PROGS)){const e=p.ex.find(x=>x.id===id);if(e)return e.u||"kg"}return "kg"}
function exName(id,l){if(l&&l.names&&l.names[id])return l.names[id];for(const p of Object.values(PROGS)){const e=p.ex.find(x=>x.id===id);if(e)return e.n}return id}
let restCfg=load("restcfg",{});
// rest by movement, not by "main": heavy compounds 2:30, small isolation 1:00, everything else 1:30
const HEAVY=["chest-press","incline-db","db-shoulder-press","squat","deadlift","lat-pulldown","wide-cable-row","seated-cable-row"];
function restDefault(e){return HEAVY.includes(e.id)?150:["cable-lat-raise","seated-calf","woodchop","hip-abd","hip-add","abdominal"].includes(e.id)?60:90}
function restFor(e){return restCfg[e.id]??restDefault(e)}
function fmt(s){s=Math.max(0,Math.ceil(s));return Math.floor(s/60)+":"+String(s%60).padStart(2,"0")}
let logs=load("gymlog",[]);           // [{date,prog,ex:{id:[{kg,reps}]}}]
let draft=load("gymdraft",{});
if(typeof _clearDraft!=="undefined"){draft={prog:draft.prog}}        // {prog, ex:{id:[{kg,reps,ok}]}}
function planFor(ds){return WEEK[new Date(ds+"T12:00:00").getDay()]||null}
function nextProg(){const wd=new Date(DAY+"T12:00:00").getDay();
  for(let i=0;i<7;i++){const k=WEEK[(wd+i)%7];if(PROGS[k]&&!(i===0&&logs.some(l=>l.date===DAY&&l.prog===k)))return k}
  return Object.keys(PROGS)[0]}
let cur=draft.prog&&PROGS[draft.prog]?draft.prog:nextProg();
function lastFor(id){for(let i=logs.length-1;i>=0;i--){if(logs[i].date>DAY)continue;const s=logs[i].ex[id];if(s&&s.length)return{date:logs[i].date,sets:s}}return null}
function best(sets){return sets.reduce((m,s)=>Math.max(m,+s.kg||0),0)}
function renderProgs(){
  const pl=planFor(DAY);const nx=pl==="run"||pl==="bad"?null:nextProg();const box=document.getElementById("progs");box.innerHTML="";
  const hd=s=>{const d=document.createElement("div");d.className="pick-h";d.textContent=t(s);box.appendChild(d)};
  hd("เวทเทรนนิ่ง");
  Object.entries(PROGS).forEach(([k,p])=>{
    const last=[...logs].reverse().find(l=>l.prog===k);
    const b=document.createElement("button");b.className="prog";b.id="p-"+k;b.setAttribute("aria-pressed",(picked||chosen)&&k===cur);
    const groups=[...new Set(p.ex.map(e=>groupName(groupOf(e))))].join(", "),open=(picked||chosen)&&k===cur;
    b.innerHTML=`<span class="pc-top"><b>${esc(p.name)}</b>${k===nx?`<em class="pc-tag">${t("คิวถัดไป")}</em>`:""}</span><small>${esc(groups)}</small>
      <small>${p.ex.length} ${t("ท่า")}${p.ex[0]?` | ${esc(p.ex[0].n)} ${t("และอื่นๆ")}`:""}</small>
      <small class="pc-when">${last?t("ล่าสุด")+" "+thDate(last.date,{day:"numeric",month:"short"}):t("ยังไม่เคยเล่น")}</small>
      <ul class="prog-ex"${open?"":" hidden"}>${p.ex.map((e,n)=>`<li><b class="no">${n+1}</b><em class="nm">${e.z} ${esc(e.n)}</em><span class="ss">${e.s}×${e.r}</span><i class="mg">${groupName(groupOf(e))}</i></li>`).join("")}</ul>`;
    b.addEventListener("click",()=>{if(!picked){if(chosen&&cur===k){chosen=false;renderGym();return}if(cur!==k){draft.ex={}}cur=k;draft.prog=k;chosen=true;save("gymdraft",draft);renderGym();setTimeout(()=>document.getElementById("start-row").scrollIntoView({behavior:"smooth",block:"center"}),50);return}
      if(cur===k){cancelProg();return}draft.ex={};cur=k;draft.prog=k;save("gymdraft",draft);renderGym();setTimeout(()=>document.getElementById("step3").scrollIntoView({behavior:"smooth",block:"start"}),50)});box.appendChild(b)});
  hd("คาร์ดิโอ");
  const tg=fs().tags,rd=tg.runData;
  const run=document.createElement("button");run.className="prog cardio";run.setAttribute("aria-pressed",!!tg.run);
  run.innerHTML=`<span class="ic">🏃</span><b>${t("วิ่ง")}</b><small>${tg.run?(rd&&rd.km?`${rd.km} km · ${fmtPace(rd.sec/rd.km)}/km`:"✓ "+t("บันทึกแล้ว")):pl==="run"?`<span class="next">${t("คิวถัดไป")} · 10 km</span>`:t("ใส่ระยะ / เวลา")}</small>`;
  run.addEventListener("click",openRun);box.appendChild(run);
  const bad=document.createElement("button");bad.className="prog cardio";bad.setAttribute("aria-pressed",!!tg.bad);
  bad.innerHTML=`<span class="ic">🏸</span><b>${t("ตีแบด")}</b><small>${tg.bad?"✓ "+t("บันทึกแล้ว")+" +50 XP":pl==="bad"?`<span class="next">${t("คิวถัดไป")}</span>`:t("แตะเพื่อบันทึก")}</small>`;
  bad.addEventListener("click",()=>{tg.bad=!tg.bad;save("mealcheck",food);try{renderFood()}catch(e){}renderGym();toast(tg.bad?t("ตีแบด")+" ✓":t("ยกเลิกแล้ว"))});box.appendChild(bad);
}
