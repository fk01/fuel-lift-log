// food.js — meal checklist, calorie/protein totals, 7-day strip
// Classic script: shares globals with the other files in /js (load order is set in index.html).
/* ---------- FOOD ---------- */
const MEALS=[
 {id:"m1",time:"08:00",name:"เช้า",k:560,p:45,items:["Iso Soy 2 สกู๊ป + Mass 2 สกู๊ป ชงน้ำ","กล้วย 2 ลูก"]},
 {id:"v1",time:"08:15",name:"วิตามินหลังมื้อเช้า",k:0,p:0,vit:1,items:["วิตามินชุดเช้า"]},
 {id:"m2",time:"12:30",name:"กลางวัน",k:444,p:31,items:["ข้าวกล้อง 150 g","เนื้อวัว 90% 100 g","ไข่ต้ม 1 + ผัก 1-2 ถ้วย"]},
 {id:"m3",time:"15:00",name:"บ่าย",k:500,p:48,items:["Iso Soy 2 สกู๊ป + Mass 2 สกู๊ป ชงน้ำ","อัลมอนด์ / ถั่วอบ 1 กำมือ (~25 g)"]},
 {id:"m4",time:"19:00",name:"เย็น (มื้อสุดท้าย)",k:388,p:34,items:["ข้าวกล้อง 150 g","ปลาหรืออกไก่ 100 g","ไข่ต้ม 1 + ผัก 1-2 ถ้วย"]},
 {id:"v2",time:"19:15",name:"วิตามินหลังมื้อเย็น",k:0,p:0,vit:1,items:["วิตามินชุดเย็น"]},
 {id:"m5",time:"21:00",name:"หลังเวท / ก่อนนอน",k:140,p:30,items:["Iso Soy 2 สกู๊ป ชงน้ำ"]},
];
const EXTRAS={
 run:{id:"x-run",time:"หลังวิ่ง",name:"เติมหลังวิ่ง",k:210,p:13,items:["Mass 2 สกู๊ป ชงน้ำ"]},
 bad:{id:"x-bad",time:"19:00",name:"เพิ่มวันแบด",k:105,p:1,items:["กล้วย 1 ลูก (กินพร้อมมื้อเย็น)"]},
};
const P_TARGET=160;
let food=load("mealcheck",{}); food[TODAY]=food[TODAY]||{done:{},tags:{}};
let DAY=TODAY;
const fs=()=>(food[DAY]=food[DAY]||{done:{},tags:{}});
function mealList(){const t=fs().tags;const l=MEALS.map(m=>({...m}));if(t.late){l.find(x=>x.id==="m4").time="18:00";l.find(x=>x.id==="v2").time="18:15"}if(t.run)l.push(EXTRAS.run);if(t.bad)l.push(EXTRAS.bad);return l}
function dayP(day){const d=food[day];if(!d)return null;let p=0;[...MEALS,EXTRAS.run,EXTRAS.bad].forEach(m=>{if(d.done[m.id])p+=m.p});return p}
function renderFoodHist(){
  const box=document.getElementById("food-hist");box.innerHTML="";
  const days=Object.keys(food).filter(d=>food[d]&&Object.values(food[d].done||{}).some(Boolean)).sort().reverse().slice(0,30);
  if(!days.length){box.innerHTML='<p class="note">—</p>';return}
  days.forEach(ds=>{const d=food[ds],tg=d.tags||{};const all=[...MEALS,EXTRAS.run,EXTRAS.bad];
    const eaten=all.filter(m=>d.done[m.id]);const k=eaten.reduce((a,m)=>a+m.k,0),p=eaten.reduce((a,m)=>a+m.p,0);
    const planned=MEALS.length+(tg.run?1:0)+(tg.bad?1:0);
    const el=document.createElement("details");el.className="ex log";
    el.innerHTML=`<summary><b>${thDate(ds,{weekday:"short",day:"numeric",month:"short"})}</b> · ${k} kcal · <span style="color:${p>=P_TARGET?"var(--up)":"inherit"}">P${p}</span> · ${eaten.length}/${planned}${tg.run?" 🏃":""}${tg.bad?" 🏸":""}${tg.late?" 🏋️":""}</summary>
      <table>${all.filter(m=>m.id[0]!=="x"||(m.id==="x-run"&&tg.run)||(m.id==="x-bad"&&tg.bad)).map(m=>`<tr><td>${d.done[m.id]?"✓":"·"}</td><td>${m.time.length<6?m.time:t(m.time)}</td><td>${t(m.name)}</td><td>${m.vit?"💊":m.k+" kcal"}</td></tr>`).join("")}</table>
      <div class="actions" style="margin-top:8px"><button class="btn sm" data-open>✎ ${t("แก้ไข")}</button></div>`;
    el.querySelector("[data-open]").addEventListener("click",()=>{DAY=ds;draft.ex={};picked=false;renderAll();window.scrollTo({top:0,behavior:"smooth"})});
    box.appendChild(el)});
}
function renderFood(){renderFoodHist();
  document.querySelectorAll(".chip").forEach(c=>c.setAttribute("aria-pressed",!!fs().tags[c.dataset.k]));
  const box=document.getElementById("meals");box.innerHTML="";
  const meals=mealList();
  meals.forEach(m=>{
    const done=!!fs().done[m.id];
    const el=document.createElement("label");el.className="meal"+(done?" done":"")+(m.id.startsWith("x")?" extra":"");
    el.innerHTML=`<input type="checkbox" id="c-${m.id}" ${done?"checked":""}><div><div class="row-head"><span><span class="time">${t(m.time)}</span> · ${t(m.name)}</span><span class="macro">${m.vit?"💊":`${m.k} kcal · P${m.p}`}</span></div><ul>${m.items.map(i=>`<li>${t(i)}</li>`).join("")}</ul></div>`;
    el.querySelector("input").addEventListener("change",e=>{fs().done[m.id]=e.target.checked;save("mealcheck",food);renderFood()});
    box.appendChild(el);
  });
  let k=0,p=0,kt=0;meals.forEach(m=>{kt+=m.k;if(fs().done[m.id]){k+=m.k;p+=m.p}});
  document.getElementById("kcal-t").textContent=`${k} / ${kt}`;
  document.getElementById("p-t").textContent=`${p} / ${P_TARGET} g`;
  document.getElementById("kcal-f").style.width=Math.min(100,k/kt*100)+"%";
  document.getElementById("p-f").style.width=Math.min(100,p/P_TARGET*100)+"%";
  const left=meals.filter(m=>!fs().done[m.id]);
  document.getElementById("status").textContent=left.length===0?t("ครบทุกมื้อแล้ว ✅"):
    p>=P_TARGET?`${t("ถึงเป้าแล้ว")} · ${left.length} ${t("เหลือ")}`:`${t("ขาดโปรตีน")} ${P_TARGET-p} g · ${t("ถัดไป")} ${left[0].time} ${t(left[0].name)}`;
  const h=document.getElementById("hist");h.innerHTML="";
  for(let i=6;i>=0;i--){const d=new Date(DAY+"T12:00:00");d.setDate(d.getDate()-i);const kk=dkey(d);const p2=dayP(kk);
    const el=document.createElement("div");el.className="day"+(p2!==null&&p2>=P_TARGET?" hit":"");
    el.innerHTML=`${d.toLocaleDateString(LOC(),{weekday:"short"})}<b>${p2===null?"–":p2}</b>`;h.appendChild(el)}
}
document.querySelectorAll(".chip").forEach(c=>c.addEventListener("click",()=>{const t=fs().tags;t[c.dataset.k]=!t[c.dataset.k];save("mealcheck",food);renderFood()}));
document.getElementById("reset").addEventListener("click",()=>{fs().done={};save("mealcheck",food);renderFood()});
