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
// custom food entries per day: food[ds].log=[{id,n,k,p,slot,q}] (k / p per serving, q servings)
const logOf=ds=>((food[ds]||{}).log)||[];
const logSum=ds=>logOf(ds).reduce((a,x)=>({k:a.k+Math.round((+x.k||0)*(+x.q||1)),p:a.p+Math.round((+x.p||0)*(+x.q||1))}),{k:0,p:0});
let food=load("mealcheck",{}); food[TODAY]=food[TODAY]||{done:{},tags:{}};
let DAY=TODAY;
const fs=()=>(food[DAY]=food[DAY]||{done:{},tags:{}});
function mealList(){const t=fs().tags;const l=MEALS.map(m=>({...m}));if(t.late){l.find(x=>x.id==="m4").time="18:00";l.find(x=>x.id==="v2").time="18:15"}if(t.run)l.push(EXTRAS.run);if(t.bad)l.push(EXTRAS.bad);return l}
function dayP(day){const d=food[day];if(!d)return null;let p=logSum(day).p;[...MEALS,EXTRAS.run,EXTRAS.bad].forEach(m=>{if((d.done||{})[m.id])p+=m.p});return p}
let fhMetric="p",fhRange=7,fhAll=false;const K_GOAL=2032;
const addDays=(ds,n)=>{const d=new Date(ds+"T12:00:00");d.setDate(d.getDate()+n);return d};
Object.assign(EN,{"มื้อถัดไป":"Next","เลยเวลา":"Overdue","ถึงเป้า":"Hit target","ยังไม่ถึง":"Below","เป้า":"Target","ดูทั้งหมด":"Show all","ย่อ":"Show less"});
function renderFoodHist(){
  const box=document.getElementById("food-hist");box.innerHTML="";
  const all30=Object.keys(food).filter(d=>food[d]&&(Object.values(food[d].done||{}).some(Boolean)||logOf(d).length)).sort().reverse().slice(0,60);
  if(!all30.length){box.innerHTML=emptyBox('bowl','ยังไม่มีบันทึกอาหาร','ติ๊กมื้อในหน้าอาหาร');return}
  // chart card: protein (or kcal) per day vs target, like the Stats cards
  const tot=ds=>{const d=food[ds]||{done:{}},e=[...MEALS,EXTRAS.run,EXTRAS.bad].filter(m=>(d.done||{})[m.id]),x=logSum(ds);return{k:x.k+e.reduce((a,m)=>a+m.k,0),p:x.p+e.reduce((a,m)=>a+m.p,0)}};
  const n=fhRange,days7=[...Array(n)].map((_,i)=>dkey(addDays(TODAY,i-n+1))),vals=days7.map(ds=>tot(ds)[fhMetric]),tg=fhMetric==="p"?P_TARGET:K_GOAL;
  const W=320,H=110,mx=Math.max(tg*1.15,...vals,1),gap=n>10?2:6,bw=(W-gap*(n-1))/n,Y=v=>H-v/mx*H,hit=vals.filter(v=>v>=tg).length,avg=Math.round(vals.reduce((a,b)=>a+b,0)/Math.max(1,vals.filter(Boolean).length));
  const card=document.createElement("div");card.className="card stack";card.style.gap="8px";
  card.innerHTML=`<div class="chips seg">${[["p","โปรตีน"],["k","แคลอรี"]].map(([k,l])=>`<button class="chip" data-fm="${k}" aria-pressed="${fhMetric===k}">${t(l)}</button>`).join("")}${[[7,"1 สัปดาห์"],[30,"1 เดือน"]].map(([k,l])=>`<button class="chip" data-fr="${k}" aria-pressed="${fhRange===k}">${t(l)}</button>`).join("")}</div>
    <div class="row-head"><span class="vol-h" style="margin:0"><small>${t("เฉลี่ยต่อวัน")}</small><b>${avg.toLocaleString()} <small>${fhMetric==="p"?"g":"kcal"}</small></b></span><span class="vol-h" style="margin:0;text-align:right"><small>${t("ถึงเป้า")}</small><b>${hit}<small> / ${n}</small></b></span></div>
    <div class="fh-tg"><i class="ok"></i>${t("ถึงเป้า")} ≥ ${tg} ${fhMetric==="p"?"g":"kcal"}<i class="no"></i>${t("ยังไม่ถึง")}</div><svg viewBox="0 0 ${W} ${H+16}" width="100%">${vals.map((v,i)=>{const X=i*(bw+gap),h=v?Math.max(3,H-Y(v)):3;return `<rect x="${X.toFixed(1)}" y="${(H-h).toFixed(1)}" width="${bw.toFixed(1)}" height="${h.toFixed(1)}" rx="${Math.min(4,bw/2)}" fill="${!v?"var(--line)":v>=tg?"var(--up)":"var(--series,#2ee6ff)"}"><title>${days7[i]}: ${v}</title></rect>${n<=7||i%7===n%7-1?`<text x="${(X+bw/2).toFixed(1)}" y="${H+12}" text-anchor="middle" font-size="9" fill="var(--muted)" font-family="var(--f-num)">${n<=7?new Date(days7[i]+"T12:00:00").toLocaleDateString(LOC(),{weekday:"narrow"}):new Date(days7[i]+"T12:00:00").getDate()}</text>`:""}`}).join("")}
      </svg>`;
  card.querySelectorAll("[data-fm]").forEach(b=>b.addEventListener("click",()=>{fhMetric=b.dataset.fm;renderFoodHist()}));
  card.querySelectorAll("[data-fr]").forEach(b=>b.addEventListener("click",()=>{fhRange=+b.dataset.fr;renderFoodHist()}));
  box.appendChild(card);
  const days=fhAll?all30:all30.slice(0,7);
  days.forEach(ds=>{const d=food[ds],tg=d.tags||{};const all=[...MEALS,EXTRAS.run,EXTRAS.bad];
    const eaten=all.filter(m=>(d.done||{})[m.id]),xs=logSum(ds);const k=xs.k+eaten.reduce((a,m)=>a+m.k,0),p=xs.p+eaten.reduce((a,m)=>a+m.p,0);
    const planned=MEALS.length+(tg.run?1:0)+(tg.bad?1:0);
    const el=document.createElement("details");el.className="ex log";
    el.innerHTML=`<summary><b>${thDate(ds,{weekday:"short",day:"numeric",month:"short"})}</b> · ${k} kcal · <span style="color:${p>=P_TARGET?"var(--up)":"inherit"}">P${p}</span> · ${eaten.length}/${planned}${tg.run?" 🏃":""}${tg.bad?" 🏸":""}${tg.late?" 🏋️":""}</summary>
      <table>${all.filter(m=>m.id[0]!=="x"||(m.id==="x-run"&&tg.run)||(m.id==="x-bad"&&tg.bad)).map(m=>`<tr><td>${(d.done||{})[m.id]?"✓":"·"}</td><td>${m.time.length<6?m.time:t(m.time)}</td><td>${t(m.name)}</td><td>${m.vit?"💊":m.k+" kcal"}</td></tr>`).join("")}${logOf(ds).map(x=>`<tr><td>✎</td><td></td><td>${esc(x.n)}${x.q!=1?" ×"+x.q:""}</td><td>${Math.round(x.k*x.q)} kcal</td></tr>`).join("")}</table>
      <div class="actions" style="margin-top:8px"><button class="btn sm" data-open>✎ ${t("แก้ไข")}</button></div>`;
    el.querySelector("[data-open]").addEventListener("click",()=>{DAY=ds;draft.ex={};picked=false;renderAll();scrollAppTop(true)});
    box.appendChild(el)});
  if(all30.length>7){const more=document.createElement("button");more.className="btn ghost";more.textContent=fhAll?t("ย่อ"):`${t("ดูทั้งหมด")} (${all30.length})`;more.addEventListener("click",()=>{fhAll=!fhAll;renderFoodHist()});box.appendChild(more)}
}
function renderFood(){renderFoodHist();
  document.querySelectorAll(".chip[data-k]").forEach(c=>c.setAttribute("aria-pressed",!!fs().tags[c.dataset.k]));
  const box=document.getElementById("meals");box.innerHTML="";
  const meals=mealList();
  // next meal = first one not ticked; meals past their time (today only) are flagged
  const nowHM=(()=>{const d=new Date();return String(d.getHours()).padStart(2,"0")+":"+String(d.getMinutes()).padStart(2,"0")})();
  const nextId=(meals.find(m=>!fs().done[m.id])||{}).id;
  meals.forEach(m=>{
    const done=!!fs().done[m.id],late=!done&&DAY===TODAY&&/^\d\d:\d\d$/.test(m.time)&&m.time<nowHM,isNext=m.id===nextId;
    const el=document.createElement("label");el.className="meal"+(done?" done mini":"")+(m.id.startsWith("x")?" extra":"")+(isNext?" next":"");
    el.dataset.flag=isNext?(late?t("เลยเวลา"):t("มื้อถัดไป")):late?t("เลยเวลา"):"";if(late)el.classList.add("late");
    el.innerHTML=`<input type="checkbox" id="c-${m.id}" ${done?"checked":""}><div><div class="row-head"><span><span class="time">${t(m.time)}</span> · ${t(m.name)}</span><span class="macro">${m.vit?"💊":`${m.k} kcal · P${m.p}`}</span></div><ul>${m.items.map(i=>`<li>${t(i)}</li>`).join("")}</ul></div>`;
    el.querySelector("input").addEventListener("change",e=>{fs().done[m.id]=e.target.checked;save("mealcheck",food);renderFood()});
    box.appendChild(el);
    const xs=logOf(DAY).filter(x=>x.slot===m.id);if(xs.length)box.appendChild(logRows(xs));
  });
  const sn=logOf(DAY).filter(x=>!meals.some(m=>m.id===x.slot));if(sn.length){const h=document.createElement("div");h.className="label";h.style.margin="6px 0 -6px";h.textContent=t("ของว่าง");box.appendChild(h);box.appendChild(logRows(sn))}
  const xs0=logSum(DAY);let k=xs0.k,p=xs0.p,kt=0;meals.forEach(m=>{kt+=m.k;if(fs().done[m.id]){k+=m.k;p+=m.p}});
  document.getElementById("kcal-t").textContent=`${k} / ${kt}`;drawFoodRing(k,kt,p);
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

/* ---------- log your own food ---------- */
Object.assign(EN,{"บันทึกอาหาร":"Log food","ที่เคยกิน":"Recent","จำนวน":"Servings","ของว่าง":"Snack","ชื่ออาหาร":"Food name","โปรตีน (g)":"Protein (g)","มื้อ":"Meal",
  "ใส่ชื่ออาหาร":"Enter a name","ใส่ kcal หรือโปรตีน":"Enter kcal or protein","แก้รายการ":"Edit entry"});
const SLOTS=[["m1","เช้า"],["m2","กลางวัน"],["m3","บ่าย"],["m4","เย็น"],["snack","ของว่าง"]];
function slotNow(){const d=new Date(),h=d.getHours()+d.getMinutes()/60;return h<10.5?"m1":h<14?"m2":h<17?"m3":h<21?"m4":"snack"}
function logRows(xs){const w=document.createElement("div");w.className="flog";
  xs.forEach(x=>{const b=document.createElement("button");b.className="flog-row";const q=+x.q||1;
    b.innerHTML=`<span>✎ ${esc(x.n)}${q!==1?` ×${q}`:""}</span><span class="macro">${Math.round(x.k*q)} kcal · P${Math.round(x.p*q)}</span>`;
    b.addEventListener("click",()=>openFoodLog(x.id));w.appendChild(b)});return w}
// recent foods across all days: newest first, one per name
function recentFoods(){const seen=new Set(),out=[];Object.keys(food).sort().reverse().forEach(ds=>logOf(ds).slice().reverse().forEach(x=>{const k=(x.n||"").trim().toLowerCase();if(k&&!seen.has(k)){seen.add(k);out.push(x)}}));return out.slice(0,8)}
function openFoodLog(id){const L=(fs().log=fs().log||[]),cur0=id?L.find(x=>x.id===id):null,x=cur0?{...cur0}:{n:"",k:"",p:"",q:1,slot:slotNow()};
  const rec=id?[]:recentFoods();
  openGen(t(id?"แก้รายการ":"บันทึกอาหาร"),`<div class="le">
    ${rec.length?`<div class="label" style="margin:0">${t("ที่เคยกิน")}</div><div class="chips flog-rec">${rec.map((r,i)=>`<button class="chip" data-r="${i}">${esc(r.n)} · ${Math.round(r.k)}</button>`).join("")}</div>`:""}
    <input class="le-in" id="fl-n" placeholder="${t("ชื่ออาหาร")}" aria-label="${t("ชื่ออาหาร")}" value="${esc(x.n)}">
    <div class="le-row"><label class="fl-num"><input class="le-in" id="fl-k" type="number" inputmode="decimal" min="0" value="${x.k}"><span>kcal</span></label><label class="fl-num"><input class="le-in" id="fl-p" type="number" inputmode="decimal" min="0" value="${x.p}"><span>${t("โปรตีน (g)")}</span></label></div>
    <div class="label" style="margin:0">${t("จำนวน")}</div><div class="segc">${[0.5,1,1.5,2].map(q=>`<button class="chip" data-q="${q}">×${q}</button>`).join("")}</div><small class="note" id="fl-sum"></small>
    <div class="label" style="margin:0">${t("มื้อ")}</div><div class="chips">${SLOTS.map(([k,n])=>`<button class="chip" data-s="${k}">${t(n)}</button>`).join("")}</div>
    <button class="btn primary sticky-b" id="fl-save">${t("บันทึก")}</button>${id?`<button class="btn ghost warn" id="fl-del">${t("ลบ")}</button>`:""}</div>`,b=>{
    const $=s=>b.querySelector(s);
    const draw=()=>{b.querySelectorAll("[data-q]").forEach(c=>c.setAttribute("aria-pressed",+c.dataset.q===+x.q));b.querySelectorAll("[data-s]").forEach(c=>c.setAttribute("aria-pressed",c.dataset.s===x.slot));
      const k=+$("#fl-k").value||0,p=+$("#fl-p").value||0;$("#fl-sum").textContent=`= ${Math.round(k*x.q)} kcal · P${Math.round(p*x.q)}`};
    b.querySelectorAll("[data-q]").forEach(c=>c.addEventListener("click",()=>{x.q=+c.dataset.q;draw()}));
    b.querySelectorAll("[data-s]").forEach(c=>c.addEventListener("click",()=>{x.slot=c.dataset.s;draw()}));
    b.querySelectorAll("[data-r]").forEach(c=>c.addEventListener("click",()=>{const r=rec[+c.dataset.r];$("#fl-n").value=r.n;$("#fl-k").value=r.k;$("#fl-p").value=r.p;draw()}));
    ["#fl-k","#fl-p"].forEach(s=>$(s).addEventListener("input",draw));draw();if(!id)setTimeout(()=>$("#fl-n").focus(),50);
    $("#fl-save").addEventListener("click",()=>{const n=$("#fl-n").value.trim(),k=Math.max(0,+$("#fl-k").value||0),p=Math.max(0,+$("#fl-p").value||0);
      if(!n){toast(t("ใส่ชื่ออาหาร"));return}if(!(k>0||p>0)){toast(t("ใส่ kcal หรือโปรตีน"));return}
      const rec2={id:cur0?cur0.id:"l"+Date.now().toString(36),n,k,p,q:x.q,slot:x.slot};const i=L.findIndex(q=>q.id===rec2.id);if(i>=0)L[i]=rec2;else L.push(rec2);
      save("mealcheck",food);closeGen();renderFood();toast(`${n} ✓`)});
    const d=$("#fl-del");if(d)d.addEventListener("click",()=>{if(!d.dataset.sure){d.dataset.sure=1;d.textContent=t("ลบ")+"?";return}fs().log=L.filter(q=>q.id!==id);save("mealcheck",food);closeGen();renderFood()})})}
document.getElementById("food-add")?.addEventListener("click",()=>openFoodLog(null));

/* ---------- neon ring: kcal (outer, cyan) + protein (inner, green) ---------- */
function drawFoodRing(k,kt,p){const el=document.getElementById("food-ring");if(!el)return;
  const arc=(r,f,c,w)=>{const C=2*Math.PI*r;return `<circle cx="110" cy="110" r="${r}" fill="none" stroke="var(--line)" stroke-width="${w}"/><circle cx="110" cy="110" r="${r}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-dasharray="${Math.max(.001,Math.min(1,f))*C} ${C}" transform="rotate(-90 110 110)"/>`};
  el.innerHTML=`<svg viewBox="0 0 220 220" role="img" aria-label="kcal ${k}/${kt}, protein ${p}/${P_TARGET}">${arc(96,k/kt,"var(--cyan,#2ee6ff)",12)}${arc(76,p/P_TARGET,"var(--green,#3dff8c)",10)}
    <text x="110" y="102" text-anchor="middle" class="fr-big">${k.toLocaleString()}</text><text x="110" y="121" text-anchor="middle" class="fr-sm">/ ${kt.toLocaleString()} kcal</text>
    <text x="110" y="150" text-anchor="middle" class="fr-mid">${p} g</text><text x="110" y="166" text-anchor="middle" class="fr-sm">${t("โปรตีน")} / ${P_TARGET}</text></svg>`}
document.getElementById("day-gear")?.addEventListener("click",ev=>{const s=document.getElementById("day-type");s.hidden=!s.hidden;ev.currentTarget.setAttribute("aria-expanded",!s.hidden)});
