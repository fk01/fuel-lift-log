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
let fhMetric="p",fhRange=7,fhAll=false;const K_GOAL=2032;
const addDays=(ds,n)=>{const d=new Date(ds+"T12:00:00");d.setDate(d.getDate()+n);return d};
Object.assign(EN,{"ถึงเป้า":"Hit target","ยังไม่ถึง":"Below","เป้า":"Target","ดูทั้งหมด":"Show all","ย่อ":"Show less"});
function renderFoodHist(){
  const box=document.getElementById("food-hist");box.innerHTML="";
  const all30=Object.keys(food).filter(d=>food[d]&&Object.values(food[d].done||{}).some(Boolean)).sort().reverse().slice(0,60);
  if(!all30.length){box.innerHTML='<p class="note">—</p>';return}
  // chart card: protein (or kcal) per day vs target, like the Stats cards
  const tot=ds=>{const d=food[ds]||{done:{}},e=[...MEALS,EXTRAS.run,EXTRAS.bad].filter(m=>(d.done||{})[m.id]);return{k:e.reduce((a,m)=>a+m.k,0),p:e.reduce((a,m)=>a+m.p,0)}};
  const n=fhRange,days7=[...Array(n)].map((_,i)=>dkey(addDays(TODAY,i-n+1))),vals=days7.map(ds=>tot(ds)[fhMetric]),tg=fhMetric==="p"?P_TARGET:K_GOAL;
  const W=320,H=110,mx=Math.max(tg*1.15,...vals,1),gap=n>10?2:6,bw=(W-gap*(n-1))/n,Y=v=>H-v/mx*H,hit=vals.filter(v=>v>=tg).length,avg=Math.round(vals.reduce((a,b)=>a+b,0)/Math.max(1,vals.filter(Boolean).length));
  const card=document.createElement("div");card.className="card stack";card.style.gap="8px";
  card.innerHTML=`<div class="chips seg">${[["p","โปรตีน"],["k","แคลอรี"]].map(([k,l])=>`<button class="chip" data-fm="${k}" aria-pressed="${fhMetric===k}">${t(l)}</button>`).join("")}${[[7,"1 สัปดาห์"],[30,"1 เดือน"]].map(([k,l])=>`<button class="chip" data-fr="${k}" aria-pressed="${fhRange===k}">${t(l)}</button>`).join("")}</div>
    <div class="row-head"><span class="vol-h" style="margin:0"><small>${t("เฉลี่ยต่อวัน")}</small><b>${avg.toLocaleString()} <small>${fhMetric==="p"?"g":"kcal"}</small></b></span><span class="vol-h" style="margin:0;text-align:right"><small>${t("ถึงเป้า")}</small><b>${hit}<small> / ${n}</small></b></span></div>
    <div class="fh-tg"><i class="ok"></i>${t("ถึงเป้า")} ≥ ${tg} ${fhMetric==="p"?"g":"kcal"}<i class="no"></i>${t("ยังไม่ถึง")}</div><svg viewBox="0 0 ${W} ${H+16}" width="100%">${vals.map((v,i)=>{const X=i*(bw+gap),h=v?Math.max(3,H-Y(v)):3;return `<rect x="${X.toFixed(1)}" y="${(H-h).toFixed(1)}" width="${bw.toFixed(1)}" height="${h.toFixed(1)}" rx="${Math.min(4,bw/2)}" fill="${!v?"var(--line)":v>=tg?"var(--up)":"var(--series,#4f93f5)"}"><title>${days7[i]}: ${v}</title></rect>${n<=7||i%7===n%7-1?`<text x="${(X+bw/2).toFixed(1)}" y="${H+12}" text-anchor="middle" font-size="9" fill="var(--muted)" font-family="var(--f-num)">${n<=7?new Date(days7[i]+"T12:00:00").toLocaleDateString(LOC(),{weekday:"narrow"}):new Date(days7[i]+"T12:00:00").getDate()}</text>`:""}`}).join("")}
      </svg>`;
  card.querySelectorAll("[data-fm]").forEach(b=>b.addEventListener("click",()=>{fhMetric=b.dataset.fm;renderFoodHist()}));
  card.querySelectorAll("[data-fr]").forEach(b=>b.addEventListener("click",()=>{fhRange=+b.dataset.fr;renderFoodHist()}));
  box.appendChild(card);
  const days=fhAll?all30:all30.slice(0,7);
  days.forEach(ds=>{const d=food[ds],tg=d.tags||{};const all=[...MEALS,EXTRAS.run,EXTRAS.bad];
    const eaten=all.filter(m=>d.done[m.id]);const k=eaten.reduce((a,m)=>a+m.k,0),p=eaten.reduce((a,m)=>a+m.p,0);
    const planned=MEALS.length+(tg.run?1:0)+(tg.bad?1:0);
    const el=document.createElement("details");el.className="ex log";
    el.innerHTML=`<summary><b>${thDate(ds,{weekday:"short",day:"numeric",month:"short"})}</b> · ${k} kcal · <span style="color:${p>=P_TARGET?"var(--up)":"inherit"}">P${p}</span> · ${eaten.length}/${planned}${tg.run?" 🏃":""}${tg.bad?" 🏸":""}${tg.late?" 🏋️":""}</summary>
      <table>${all.filter(m=>m.id[0]!=="x"||(m.id==="x-run"&&tg.run)||(m.id==="x-bad"&&tg.bad)).map(m=>`<tr><td>${d.done[m.id]?"✓":"·"}</td><td>${m.time.length<6?m.time:t(m.time)}</td><td>${t(m.name)}</td><td>${m.vit?"💊":m.k+" kcal"}</td></tr>`).join("")}</table>
      <div class="actions" style="margin-top:8px"><button class="btn sm" data-open>✎ ${t("แก้ไข")}</button></div>`;
    el.querySelector("[data-open]").addEventListener("click",()=>{DAY=ds;draft.ex={};picked=false;renderAll();scrollAppTop(true)});
    box.appendChild(el)});
  if(all30.length>7){const more=document.createElement("button");more.className="btn ghost";more.textContent=fhAll?t("ย่อ"):`${t("ดูทั้งหมด")} (${all30.length})`;more.addEventListener("click",()=>{fhAll=!fhAll;renderFoodHist()});box.appendChild(more)}
}
function renderFood(){renderFoodHist();
  document.querySelectorAll(".chip[data-k]").forEach(c=>c.setAttribute("aria-pressed",!!fs().tags[c.dataset.k]));
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
  const h=document.getElementById("hist");if(h){h.innerHTML="";
  for(let i=6;i>=0;i--){const d=new Date(DAY+"T12:00:00");d.setDate(d.getDate()-i);const kk=dkey(d);const p2=dayP(kk);
    const el=document.createElement("div");el.className="day"+(p2!==null&&p2>=P_TARGET?" hit":"");
    el.innerHTML=`${d.toLocaleDateString(LOC(),{weekday:"short"})}<b>${p2===null?"–":p2}</b>`;h.appendChild(el)}}
}
document.querySelectorAll(".chip[data-k]").forEach(c=>c.addEventListener("click",()=>{const t=fs().tags;t[c.dataset.k]=!t[c.dataset.k];save("mealcheck",food);renderFood()}));
document.getElementById("reset").addEventListener("click",()=>{fs().done={};save("mealcheck",food);renderFood()});
