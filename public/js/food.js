// food.js — meal checklist, calorie/protein totals, 7-day strip
// Classic script: shares globals with the other files in /js (load order is set in index.html).
/* ---------- FOOD ---------- */
const MEALS_DEF=[
 {id:"m1",time:"08:00",name:"เช้า",k:560,p:45,c:78,f:7,items:["Iso Soy 2 สกู๊ป + Mass 2 สกู๊ป ชงน้ำ","กล้วย 2 ลูก"]},
 {id:"v1",time:"08:15",name:"วิตามินหลังมื้อเช้า",k:0,p:0,vit:1,items:["วิตามินชุดเช้า"]},
 {id:"m2",time:"12:30",name:"กลางวัน",k:444,p:31,c:50,f:13,items:["ข้าวกล้อง 150 g","เนื้อวัว 90% 100 g","ไข่ต้ม 1 + ผัก 1-2 ถ้วย"]},
 {id:"m3",time:"15:00",name:"บ่าย",k:500,p:48,c:38,f:17,items:["Iso Soy 2 สกู๊ป + Mass 2 สกู๊ป ชงน้ำ","อัลมอนด์ / ถั่วอบ 1 กำมือ (~25 g)"]},
 {id:"m4",time:"19:00",name:"เย็น (มื้อสุดท้าย)",k:388,p:34,c:48,f:6,items:["ข้าวกล้อง 150 g","ปลาหรืออกไก่ 100 g","ไข่ต้ม 1 + ผัก 1-2 ถ้วย"]},
 {id:"v2",time:"19:15",name:"วิตามินหลังมื้อเย็น",k:0,p:0,vit:1,items:["วิตามินชุดเย็น"]},
 {id:"m5",time:"21:00",name:"หลังเวท / ก่อนนอน",k:140,p:30,c:2,f:2,items:["Iso Soy 2 สกู๊ป ชงน้ำ"]},
];
const EXTRAS_DEF={
 run:{id:"x-run",time:"หลังวิ่ง",name:"เติมหลังวิ่ง",k:210,p:13,c:38,f:1,items:["Mass 2 สกู๊ป ชงน้ำ"]},
 bad:{id:"x-bad",time:"19:00",name:"เพิ่มวันแบด",k:105,p:1,c:27,f:0,items:["กล้วย 1 ลูก (กินพร้อมมื้อเย็น)"]},
};
// the live meal plan is editable (meal-plan.js) and synced in the settings doc; MEALS_DEF / EXTRAS_DEF are only defaults
let MP=load("mealplan",null),MEALS,EXTRAS,P_TARGET,K_GOAL;
function mpApply(){const m=MP||{};MEALS=Array.isArray(m.meals)&&m.meals.length?m.meals:MEALS_DEF;/* plans saved before carbs/fat existed: fill C/F from the default meal with the same id */const fill=x=>{if(!x||x.c!=null)return;const d=MEALS_DEF.concat(Object.values(EXTRAS_DEF)).find(q=>q.id===x.id);if(d&&d.k===x.k&&d.p===x.p){x.c=d.c;x.f=d.f}};MEALS.forEach(fill);fill(m.run);fill(m.bad);EXTRAS={run:m.run||EXTRAS_DEF.run,bad:m.bad||EXTRAS_DEF.bad};P_TARGET=+m.p||160;K_GOAL=+m.k||2032}
mpApply();
// custom food entries per day: food[ds].log=[{id,n,k,p,slot,q}] (k / p per serving, q servings)
const logOf=ds=>((food[ds]||{}).log)||[];
const logSum=ds=>logOf(ds).reduce((a,x)=>({k:a.k+Math.round((+x.k||0)*(+x.q||1)),p:a.p+Math.round((+x.p||0)*(+x.q||1))}),{k:0,p:0});
let food=load("mealcheck",{}); food[TODAY]=food[TODAY]||{done:{},tags:{}};
let DAY=TODAY;
const fs=()=>(food[DAY]=food[DAY]||{done:{},tags:{}});
function mealList(){const t=fs().tags;const l=MEALS.map(m=>({...m}));if(t.late){const a=l.find(x=>x.id==="m4"),b=l.find(x=>x.id==="v2");if(a)a.time="18:00";if(b)b.time="18:15"}if(t.run)l.push(EXTRAS.run);if(t.bad)l.push(EXTRAS.bad);return l}
function dayP(day){const d=food[day];if(!d)return null;let p=logSum(day).p;[...MEALS,EXTRAS.run,EXTRAS.bad].forEach(m=>{if((d.done||{})[m.id])p+=m.p});return p}
let fhMetric="p",fhRange=7,fhAll=false;
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
    <div class="fh-tg"><i class="ok"></i>${t("ถึงเป้า")} ≥ ${tg} ${fhMetric==="p"?"g":"kcal"}<i class="no"></i>${t("ยังไม่ถึง")}</div><svg viewBox="0 0 ${W} ${H+16}" width="100%">${vals.map((v,i)=>{const X=i*(bw+gap),h=v?Math.max(3,H-Y(v)):3;return `<rect x="${X.toFixed(1)}" y="${(H-h).toFixed(1)}" width="${bw.toFixed(1)}" height="${h.toFixed(1)}" rx="${Math.min(4,bw/2)}" fill="${!v?"var(--line)":v>=tg?"#ffffff":"#8b93a1"}"><title>${days7[i]}: ${v}</title></rect>${n<=7||i%7===n%7-1?`<text x="${(X+bw/2).toFixed(1)}" y="${H+12}" text-anchor="middle" font-size="9" fill="var(--muted)" font-family="var(--f-num)">${n<=7?new Date(days7[i]+"T12:00:00").toLocaleDateString(LOC(),{weekday:"narrow"}):new Date(days7[i]+"T12:00:00").getDate()}</text>`:""}`}).join("")}
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
  {const b0=document.getElementById("eat-back");if(b0)b0.remove()}
  document.querySelectorAll(".chip[data-k]").forEach(c=>c.setAttribute("aria-pressed",!!fs().tags[c.dataset.k]));
  const box=document.getElementById("meals");box.innerHTML="";
  const meals=mealList();
  // next meal = first one not ticked; meals past their time (today only) are flagged
  const nowHM=(()=>{const d=new Date();return String(d.getHours()).padStart(2,"0")+":"+String(d.getMinutes()).padStart(2,"0")})();
  const nextId=DAY===TODAY?(meals.find(m=>!fs().done[m.id])||{}).id:null;
  meals.forEach(m=>{
    const done=!!fs().done[m.id],late=!done&&DAY===TODAY&&/^\d\d:\d\d$/.test(m.time)&&m.time<nowHM,isNext=m.id===nextId;
    const el=document.createElement("label");el.className="meal"+(done?" done mini":"")+(m.id.startsWith("x")?" extra":"")+(isNext?" next":"");
    el.dataset.flag=isNext?t("มื้อถัดไป"):late?t("ยังไม่ติ๊ก"):"";if(late&&!isNext)el.classList.add("late");el.classList.toggle("lead",isNext);
    el.innerHTML=`<span class="row-ic">${licon(m.vit?"pill":m.id.startsWith("x")?"run":"bowl")}</span><input type="checkbox" id="c-${m.id}" ${done?"checked":""}><div><div class="row-head"><span class="hq-chip time">${t(m.time)}</span><b class="mn">${t(m.name)}</b><span class="macro">${m.vit||!m.k?t("วิตามิน_m").replace(/_m$/,""):`${m.k} kcal · P ${m.p} g · C ${m.c!=null?m.c:"–"} g · F ${m.f!=null?m.f:"–"} g`}</span></div><ul>${m.items.map(i=>`<li>${t(i)}</li>`).join("")}</ul></div>`;
    el.querySelector("input").addEventListener("change",e=>{fs().done[m.id]=e.target.checked;save("mealcheck",food);renderFood()});
    box.appendChild(el);
    const xs=logOf(DAY).filter(x=>x.slot===m.id);if(xs.length)box.appendChild(logRows(xs));
  });
  const sn=logOf(DAY).filter(x=>!meals.some(m=>m.id===x.slot));if(sn.length){const h=document.createElement("div");h.className="label";h.style.margin="6px 0 -6px";h.textContent=t("ของว่าง");box.appendChild(h);box.appendChild(logRows(sn))}
  const xs0=logSum(DAY);let k=xs0.k,p=xs0.p,kt=0;meals.forEach(m=>{kt+=m.k;if(fs().done[m.id]){k+=m.k;p+=m.p}});
  {const c=document.getElementById("mp-cur");if(c){const n=(MP&&MP.name)||t("แผนหลัก"),many=MP&&MP.saved&&MP.saved.length>1;c.innerHTML=`<small>${t("แผนที่ใช้")}</small><b>${esc(n)}</b>${many?`<small>${MP.saved.length} ${t("แผน_n").replace(/_n$/,"")}</small>`:""}`}}
  document.getElementById("kcal-t").textContent=`${k} / ${kt}`;drawFoodRing(k,kt,p);
  {let c=0,f=0,ct=0,ft=0;meals.forEach(m=>{ct+=+m.c||0;ft+=+m.f||0;if(fs().done[m.id]){c+=+m.c||0;f+=+m.f||0}});ct=+(MP&&MP.c)||ct;ft=+(MP&&MP.f)||ft;
   const fr=document.getElementById("food-ring");let mb=document.getElementById("macro-bars");if(fr&&!mb){mb=document.createElement("div");mb.id="macro-bars";fr.after(mb)}
   const bar=(ic,l,v,g,col)=>`<div class="mb"><span class="mb-ic" aria-hidden="true">${ic}</span><small class="mb-n">${l}</small><span class="mb-v"><b>${v}</b><small> / ${g||"–"} g</small></span><i><i style="width:${g?Math.min(100,v/g*100):0}%;background:${col}"></i></i></div>`;
   if(mb)mb.innerHTML=bar(MAC_IC.p,t("โปรตีน"),p,P_TARGET,"#ffffff")+bar(MAC_IC.c,t("คาร์บ"),c,ct,"#d1d5db")+bar(MAC_IC.f,t("ไขมัน"),f,ft,"#9ca3af")}
  document.getElementById("p-t").textContent=`${p} / ${P_TARGET} g`;
  document.getElementById("kcal-f").style.width=Math.min(100,k/kt*100)+"%";
  document.getElementById("p-f").style.width=Math.min(100,p/P_TARGET*100)+"%";
  const left=meals.filter(m=>!fs().done[m.id]);
  const over=k-kt,PAST=DAY!==TODAY;
  document.getElementById("status").textContent=PAST?`${thDate(DAY,{weekday:"short",day:"numeric",month:"short"})} · ${t("กินไป")} ${k.toLocaleString()} kcal`:over>50?`${t("เกินเป้า")} ${over.toLocaleString()} kcal — ${left.length?t("มื้อที่เหลือกินเบาลงได้"):t("พรุ่งนี้กลับมาตามแผน")}`:left.length===0?t("ครบทุกมื้อแล้ว ✅"):
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
function drawFoodRing(k,kt,p){const el=document.getElementById("food-ring");if(!el)return;const pc=kt?Math.min(100,Math.round(k/kt*100)):0,left=kt-k;
  el.innerHTML=`<div class="kc"><svg class="kc-ic" viewBox="0 0 48 48" width="34" height="34" aria-hidden="true"><path d="M24 4c2 7 10 11 10 22a10 10 0 0 1-20 0c0-5 3-8 5-11 0 4 2 6 4 6 0-6-2-11 1-17z" fill="#ffffff"/><path d="M24 22c1 4 6 6 6 12a6 6 0 0 1-12 0c0-3 2-5 3-6 0 2 1 3 2 3 0-3-1-6 1-9z" fill="#d1d5db"/></svg>
    <small class="kc-l">${t("แคลอรี่วันนี้")}</small><b class="kc-v">${k.toLocaleString()}<small> / ${kt.toLocaleString()} kcal</small></b>
    <i class="kc-bar"><i style="width:${pc}%"></i></i><small class="kc-s">${left>=0?`${left.toLocaleString()} kcal ${t("เหลือ_kc").replace(/_kc$/,"")}`:`${t("เกินเป้า")} ${(-left).toLocaleString()} kcal`}</small></div>`}
Object.assign(EN,{"แคลอรี่วันนี้":"Calories today"});
document.getElementById("day-gear")?.addEventListener("click",ev=>{const s=document.getElementById("day-type");s.hidden=!s.hidden;ev.currentTarget.setAttribute("aria-expanded",!s.hidden)});

Object.assign(EN,{"ยังไม่ติ๊ก":"Not ticked yet","วิตามิน_m":"Vitamins","กินไป":"ate","มื้อที่เหลือกินเบาลงได้":"go lighter on the rest","พรุ่งนี้กลับมาตามแผน":"back on plan tomorrow"});

/* macro icons drawn in SVG: steak (protein), rice bowl (carbs), butter (fat) */
const MAC_IC={
 p:`<svg viewBox="0 0 48 48" width="36" height="36"><path d="M9 21c0-8 8-13 17-12 9 1 14 7 13 14-1 6-6 9-10 10-3 1-4 4-8 6-5 2-12-1-12-8 0-4 0-6 0-10z" fill="#c0392b"/><path d="M12 22c0-6 6-10 14-9 7 1 10 6 9 11-1 4-5 6-8 7-3 1-4 3-7 4-4 1-8-1-8-6z" fill="#e74c3c"/><path d="M17 20c3-2 8-2 11 0M16 26c4-2 9-1 12 1" stroke="#f5b7b1" stroke-width="1.6" fill="none" stroke-linecap="round"/><ellipse cx="30" cy="22" rx="3.2" ry="2.6" fill="#fdebd0"/></svg>`,
 c:`<svg viewBox="0 0 48 48" width="36" height="36"><path d="M6 24h36c0 10-8 17-18 17S6 34 6 24z" fill="#5d6d7e"/><path d="M6 24h36c-1 3-3 5-6 6H12c-3-1-5-3-6-6z" fill="#85929e"/><path d="M9 24c0-8 7-13 15-13s15 5 15 13z" fill="#f4f6f7"/><g fill="#d5dbdb"><ellipse cx="17" cy="19" rx="1.6" ry=".9"/><ellipse cx="24" cy="15" rx="1.6" ry=".9"/><ellipse cx="30" cy="19" rx="1.6" ry=".9"/><ellipse cx="21" cy="21" rx="1.6" ry=".9"/><ellipse cx="27" cy="22" rx="1.6" ry=".9"/></g></svg>`,
 f:`<svg viewBox="0 0 48 48" width="36" height="36"><path d="M6 30l20-10 16 6-20 10z" fill="#d4ac0d"/><path d="M6 30v4l16 6v-4z" fill="#b7950b"/><path d="M22 36v4l20-8v-6z" fill="#9a7d0a"/><path d="M10 26l16-8 12 5-16 8z" fill="#f9e79f"/><path d="M10 26v4l12 5v-4z" fill="#f7dc6f"/><path d="M22 31v4l16-7v-5z" fill="#f4d03f"/></svg>`};
Object.assign(EN,{"เหลือ_kc":"to go"});
Object.assign(EN,{"แผนที่ใช้":"Using","แผน_n":"plans"});
/* Eat: filter chips above the meal list (All / To eat / Eaten) */
let mealF="all";
function mealChips(){const box=document.getElementById("meals");if(!box)return;let c=document.getElementById("meal-chips");
  if(!c){c=document.createElement("div");c.id="meal-chips";c.className="chips meal-chips";box.before(c)}
  c.innerHTML=[["all","ทั้งหมด_m"],["todo","ยังไม่กิน"],["done","กินแล้ว_m"]].map(([k,l])=>`<button class="chip${mealF===k?" on":""}" data-mf="${k}" aria-pressed="${mealF===k}">${t(l).replace(/_m$/,"")}</button>`).join("");
  c.querySelectorAll("[data-mf]").forEach(b=>b.addEventListener("click",()=>{mealF=b.dataset.mf;mealChips()}));
  box.querySelectorAll(".meal").forEach(m=>{const d=m.querySelector('input[type=checkbox]')?.checked;m.hidden=mealF==="todo"?d:mealF==="done"?!d:false})}
{const o=renderFood;renderFood=function(){const r=o.apply(this,arguments);try{mealChips()}catch(e){}return r}}
document.addEventListener("change",e=>{if(e.target.closest&&e.target.closest("#meals .meal"))setTimeout(mealChips,0)});
Object.assign(EN,{"ทั้งหมด_m":"All","ยังไม่กิน":"To eat","กินแล้ว_m":"Eaten"});
/* ===== Eat "nourish" view: next meal hero, more-for-today grid, eaten rows, meal detail sheet ===== */
const MEAL_SVG={cup:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M7 7h10l-1.2 13a1 1 0 0 1-1 .9H9.2a1 1 0 0 1-1-.9z"/><path d="M6 7h12M13 7l2-4h3"/><path d="M7.6 12h8.8"/></svg>',fish:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12c3-5 9-6 13-3l5-3-1.5 6L21 18l-5-3c-4 3-10 2-13-3z"/><circle cx="8" cy="11" r=".8" fill="currentColor"/></svg>',egg:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M12 3c3.5 0 6 5 6 9a6 6 0 0 1-12 0c0-4 2.5-9 6-9z"/><circle cx="12" cy="13.5" r="2.5"/></svg>'};
const mealEmo=m=>{const s=((m.name||"")+" "+(m.items||[]).join(" ")).toLowerCase();const ic=m.vit?licon("pill"):/shake|iso|whey|soy|mass|สกู๊ป|เวย์|smoothie|นม/.test(s)?MEAL_SVG.cup:/fish|ปลา|salmon/.test(s)?MEAL_SVG.fish:/egg|ไข่/.test(s)&&/เช้า|break/.test(s)?MEAL_SVG.egg:licon("bowl");return `<span class="nr-ic">${ic}</span>`};
const mealDone=id=>!!((food[DAY]||{}).done||{})[id];
function mealTick(id){const c=document.getElementById("c-"+id);if(c)c.click()}
function eatPhase(){const g=(typeof PROFILE!=="undefined"&&PROFILE&&PROFILE.goal)||"bulk";return g==="cut"?["กินเพื่อ_e","ลีนลง"]:g==="keep"?["กินเพื่อ_e","คงความฟิต"]:["กินเพื่อ_e","ช่วงสร้างกล้าม"]}
function renderNourish(){const box=document.getElementById("meals");if(!box)return;let v=document.getElementById("nourish");
  if(!v){v=document.createElement("section");v.id="nourish";box.before(v)}
  const ms=mealList().filter(m=>!m.vit||true),left=ms.filter(m=>!mealDone(m.id)),done=ms.filter(m=>mealDone(m.id)),nx=left[0];
  let k=0,p=0;done.forEach(m=>{k+=+m.k||0;p+=+m.p||0});const [a,b]=eatPhase();
  const mac=m=>`${m.k||0} kcal · P${m.p||0} · C${m.c??"–"} · F${m.f??"–"}`;
  v.innerHTML=`<h2 class="nr-h">${t(a).replace(/_e$/,"")} <i>${t(b)}</i></h2><p class="nr-sub">${Math.max(0,K_GOAL-k).toLocaleString()} kcal ${t("เหลือ_kc").replace(/_kc$/,"")} · ${t("โปรตีน")} ${Math.max(0,P_TARGET-p)} g</p>
   ${nx?`<div class="nr-hero" data-meal-open="${esc(nx.id)}"><div class="nr-img">${mealEmo(nx)}</div><span class="nr-tag">${t("ถัดไป_n")} · ${esc(t(nx.time||""))} ${esc(t(nx.name))}</span><b class="nr-nm">${esc(t((nx.items||[])[0]||nx.name))}</b><small>${mac(nx)}</small><button class="nr-ok" data-meal-tick="${esc(nx.id)}" aria-label="${t("กินมื้อนี้แล้ว")}">✓</button></div>`:`<div class="nr-hero nr-all"><div class="nr-img">🎉</div><b class="nr-nm">${t("ครบทุกมื้อแล้ว")}</b></div>`}
   ${left.length>1?`<div class="nr-sec">${t("มื้อที่เหลือวันนี้")}</div><div class="nr-grid">${left.slice(1).map(m=>`<button class="nr-sm" data-meal-open="${esc(m.id)}"><div class="nr-img">${mealEmo(m)}</div><b>${esc(t(m.name))}</b><small>${esc(t(m.time||""))} · ${m.k||0} kcal</small></button>`).join("")}</div>`:""}
   ${done.map(m=>`<div class="nr-row" data-meal-open="${esc(m.id)}"><div class="nr-img">${mealEmo(m)}</div><span><span class="nr-tag">${esc(t(m.name))} · ${t("กินแล้ว_m").replace(/_m$/,"")}</span><b>${esc(t((m.items||[])[0]||m.name))}</b><small>${m.k||0} kcal</small></span><button class="nr-ok on" data-meal-tick="${esc(m.id)}" aria-label="${t("ยกเลิก")}">✓</button></div>`).join("")}`;
  v.querySelectorAll("[data-meal-tick]").forEach(x=>x.addEventListener("click",e=>{e.stopPropagation();mealTick(x.dataset.mealTick)}));
  v.querySelectorAll("[data-meal-open]").forEach(x=>x.addEventListener("click",()=>openMeal(x.dataset.mealOpen)))}
function openMeal(id){const m=mealList().find(q=>q.id===id);if(!m)return;const d=food[DAY]=food[DAY]||{done:{},tags:{}},it=(d.items=d.items||{})[id]=(d.items[id]||[]),on=mealDone(id);
  const ring=(v,g,c,l)=>{const C=94.2,f=g?Math.min(1,v/g):0;return `<span class="nr-rg"><svg width="38" height="38" viewBox="0 0 36 36"><circle cx="18" cy="18" r="15" fill="none" stroke="#2a2c31" stroke-width="4"/><circle cx="18" cy="18" r="15" fill="none" stroke="${c}" stroke-width="4" stroke-linecap="round" stroke-dasharray="${(f*C).toFixed(1)} ${C}" transform="rotate(-90 18 18)"/></svg><span><b>${v??"–"} g</b><small>${t(l)}</small></span></span>`};
  const tip=+m.p>=30?"โปรตีนสูง ช่วยกล้ามฟื้นหลังเล่น":+m.c>=50?"คาร์บช่วยเติมพลังก่อน/หลังเล่น":m.vit?"กินพร้อมอาหารจะดูดซึมดีกว่า":"กินให้ตรงเวลาช่วยคุมพลังงานทั้งวัน";
  openGen("",`<div class="nr-dhero">${mealEmo(m)}</div><span class="nr-tag">${esc(t(m.name))} · ${esc(t(m.time||""))}</span><h2 class="nr-dn">${esc(t((m.items||[])[0]||m.name))}</h2>
    <div class="nr-meta"><span>🔥 ${m.k||0} kcal</span><span>🍽 ${(m.items||[]).length} ${t("รายการ_n")}</span></div>
    <div class="nr-rings">${ring(m.p,P_TARGET/4,"#ffffff","โปรตีน")}${ring(m.c,((MP&&MP.c)||216)/4,"#d1d5db","คาร์บ")}${ring(m.f,((MP&&MP.f)||45)/4,"#9ca3af","ไขมัน")}</div>
    <div class="nr-tip">✦ ${t(tip)}</div>
    <div class="nr-items">${(m.items||[]).map((x,i)=>`<label class="nr-it"><input type="checkbox" data-it="${i}" ${it.includes(i)?"checked":""}><span>${esc(t(x))}</span></label>`).join("")}</div>
    <button class="btn primary nr-ate" data-ate>${on?"↺ "+t("ยังไม่ได้กิน"):"✓ "+t("กินมื้อนี้แล้ว")}</button>`,
    b=>{b.querySelectorAll("[data-it]").forEach(c=>c.addEventListener("change",()=>{const i=+c.dataset.it,a=d.items[id];c.checked?a.includes(i)||a.push(i):a.splice(a.indexOf(i),1);save("mealcheck",food)}));
      b.querySelector("[data-ate]").addEventListener("click",()=>{closeGen();mealTick(id)})})}
{const o=renderFood;renderFood=function(){const r=o.apply(this,arguments);try{renderNourish()}catch(e){console.error(e)}return r}}
Object.assign(EN,{"กินเพื่อ_e":"Eat for your","ช่วงสร้างกล้าม":"build phase","ลีนลง":"lean phase","คงความฟิต":"steady phase","ถัดไป_n":"Next","มื้อที่เหลือวันนี้":"More for today","รายการ_n":"items","ยังไม่ได้กิน":"Not eaten yet","โปรตีนสูง ช่วยกล้ามฟื้นหลังเล่น":"High protein — helps muscles recover after training","คาร์บช่วยเติมพลังก่อน/หลังเล่น":"Carbs refuel you around training","กินพร้อมอาหารจะดูดซึมดีกว่า":"Take with food for better absorption","กินให้ตรงเวลาช่วยคุมพลังงานทั้งวัน":"Eating on time keeps your energy steady"});
/* ===== Eat v3: "Calorie Tracker" — tracker rings, pastel macro tiles, daily meals list, meal detail ===== */
// Game-style status block: calories + protein / carbs / fat as four HP/SP-like bars in ONE card
const HP={k:0,kt:0,p:0,c:0,ct:0,f:0,ft:0};
const HP_IC={ka:'<path d="M12 3c1 4 6 6 6 12a6 6 0 0 1-12 0c0-3 2-5 3-6 0 2 1 3 2 3 0-3-1-6 1-9z"/>',p:'<path d="M14 4c4 0 6 3 6 6 0 5-6 9-11 9-3 0-5-2-5-4 0-3 3-4 4-6 1-3 3-5 6-5z"/><circle cx="14" cy="10" r="2"/>',c:'<path d="M12 21V8M12 8c-3 0-4-3-4-5 3 0 4 2 4 5zM12 8c3 0 4-3 4-5-3 0-4 2-4 5zM12 14c-3 0-4-3-4-5 3 0 4 2 4 5zM12 14c3 0 4-3 4-5-3 0-4 2-4 5z"/>',f:'<path d="M12 3s6 7 6 11a6 6 0 0 1-12 0c0-4 6-11 6-11z"/>'};
function drawHp(){const el=document.getElementById("food-ring");if(!el)return;
  const row=(cls,l,v,g,u)=>{const pc=g?Math.min(100,v/g*100):0;return `<div class="hp-r ${cls}"><span class="hp-l"><i><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${HP_IC[cls]}</svg></i>${l}</span><span class="hp-b"><i style="width:${pc}%"></i></span><span class="hp-v"><b>${Math.round(v).toLocaleString()}</b> / ${g?Math.round(g).toLocaleString():"–"}${u}</span></div>`};
  el.innerHTML=`<div class="hp">${row("ka",t("แคลอรี่"),HP.k,HP.kt," kcal")}${row("p",t("โปรตีน"),HP.p,P_TARGET," g")}${row("c",t("คาร์บ"),HP.c,HP.ct," g")}${row("f",t("ไขมัน"),HP.f,HP.ft," g")}</div>`}
drawFoodRing=function(k,kt,p){HP.k=k;HP.kt=kt;HP.p=p;drawHp()};
{const ob=document.getElementById("macro-bars");}
function macroTiles(){const fr=document.getElementById("food-ring");if(!fr)return;let mb=document.getElementById("macro-bars");if(!mb){mb=document.createElement("div");mb.id="macro-bars";fr.after(mb)}
  const ms=mealList(),dn=(fs().done||{});let c=0,f=0,p=0,ct=0,ft=0;ms.forEach(m=>{ct+=+m.c||0;ft+=+m.f||0;if(dn[m.id]){c+=+m.c||0;f+=+m.f||0;p+=+m.p||0}});ct=+(MP&&MP.c)||ct;ft=+(MP&&MP.f)||ft;
  const tile=(cls,ic,l,v,g)=>`<div class="mtl ${cls}"><span class="mtl-h"><i>${ic}</i>${t(l)}</span><span class="mtl-tr"><i style="width:${g?Math.min(100,v/g*100):0}%"></i><b style="left:${g?Math.min(100,v/g*100):0}%"></b></span><span class="mtl-n"><small>${v}</small><small>${g||"–"} g</small></span></div>`;
  HP.c=c;HP.f=f;HP.ct=ct;HP.ft=ft;mb.innerHTML="";drawHp()}
const MEAL_SUB={เช้า:"มื้อเช้าเติมพลังเริ่มวัน",กลางวัน:"เติมพลังระหว่างวัน",บ่าย:"กันหิวช่วงบ่าย",เย็น:"ช่วยฟื้นตัวและพักผ่อน"};
renderNourish=function(){const box=document.getElementById("meals");if(!box)return;let v=document.getElementById("nourish");if(!v){v=document.createElement("section");v.id="nourish";box.before(v)}
  try{macroTiles()}catch(e){}
  const ms=mealList(),nx=ms.find(m=>!mealDone(m.id)&&!m.vit);
  const fa=document.getElementById("food-add");if(fa)document.getElementById("v-food").append(fa);   // park it: innerHTML below would destroy it
  v.innerHTML=`<div class="dm-h"><b>${t("มื้ออาหารวันนี้")}</b><small>${ms.filter(m=>mealDone(m.id)).length}/${ms.length}</small><span class="dm-slot"></span></div>`+ms.map(m=>{const on=mealDone(m.id),sub=(m.items||[])[0]||"";
    return `<div class="dm${on?" on":""}${nx&&nx.id===m.id?" nx":""}" data-meal-open="${esc(m.id)}"><span class="dm-ic">${mealEmo(m)}</span><span class="dm-t"><b>${esc(t(m.name))}</b><small>${esc(t(m.time||""))}${m.k?` · ${m.k} kcal`:""} · ${esc(t(sub))}</small></span><button class="dm-add${on?" on":""}" data-meal-tick="${esc(m.id)}" aria-label="${t(on?"ยังไม่ได้กิน":"กินมื้อนี้แล้ว")}">${on?"✓":"+"}</button></div>`}).join("");
  if(fa)v.querySelector(".dm-slot").append(fa);   // "+ log food" lives in the Daily meals header
  v.querySelectorAll("[data-meal-tick]").forEach(x=>x.addEventListener("click",e=>{e.stopPropagation();mealTick(x.dataset.mealTick)}));
  v.querySelectorAll("[data-meal-open]").forEach(x=>x.addEventListener("click",()=>openMeal(x.dataset.mealOpen)))};
openMeal=function(id){const m=mealList().find(q=>q.id===id);if(!m)return;const on=mealDone(id);
  const col=(cls,l,v,u)=>`<span class="mc ${cls}"><i class="mc-o"></i><small>${t(l)}</small><b>${v??"–"}${u}</b></span>`;
  openGen("",`<div class="md-hero">${mealEmo(m)}</div><div class="md-cols">${col("k","kcal",m.k||0,"")}${col("p","โปรตีน",m.p,"g")}${col("f","ไขมัน",m.f,"g")}${col("c","คาร์บ",m.c,"g")}</div>
    <h2 class="md-t">${esc(t(m.name))}</h2><div class="nr-meta"><span>🔥 ${m.k||0} kcal</span><span>⏱ ${esc(t(m.time||""))}</span></div>
    <div class="md-tags">${(+m.p>=30?["โปรตีนสูง"]:[]).concat(+m.c>=50?["คาร์บสูง"]:[]).concat(m.vit?["วิตามิน"]:[]).concat(["ทำง่าย"]).map(x=>`<span>${t(x)}</span>`).join("")}</div>
    <b class="md-ih">${t("ส่วนผสม")}</b><div class="md-ing">${(m.items||[]).map(x=>{const mm=String(t(x)).match(/^(.*?)\\s+([\\d~.,/-]+\\s*(?:g|ml|ลูก|ฟอง|สกู๊ป|scoops?|cups?|ถ้วย|กำมือ|handful)?.*)$/i);return `<div><span>${esc(mm?mm[1]:t(x))}</span><small>${esc(mm?mm[2]:"")}</small></div>`}).join("")}</div>
    <button class="btn md-go" data-ate>${on?"↺ "+t("ยังไม่ได้กิน"):"✓ "+t("กินมื้อนี้แล้ว")}</button>`,b=>b.querySelector("[data-ate]").addEventListener("click",()=>{closeGen();mealTick(id)}))};
Object.assign(EN,{"ติดตามแคลอรี่":"Tracker","จาก_k":"Of","มื้ออาหารวันนี้":"Daily meals","คาร์บสูง":"High carb","ทำง่าย":"Quick & easy","ส่วนผสม":"Ingredients","โปรตีนสูง":"High protein","วิตามิน":"Vitamins"});
