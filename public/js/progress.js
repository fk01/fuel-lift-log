// progress.js — XP, level and achievements
// Classic script: shares globals with the other files in /js (load order is set in index.html).
/* ---------- progress + achievements ---------- */
let calM=null;
function workoutDays(){return [...new Set(logs.map(l=>l.date))].sort()}
function weekKey(ds){const d=new Date(ds+"T12:00:00");const day=(d.getDay()+6)%7;d.setDate(d.getDate()-day);return dkey(d)}
function weekStreak(){const wk=new Set(logs.map(l=>weekKey(l.date)));let d=new Date(TODAY+"T12:00:00");let k=weekKey(TODAY);if(!wk.has(k)){d.setDate(d.getDate()-7);k=weekKey(dkey(d))}let n=0;while(wk.has(k)){n++;d.setDate(d.getDate()-7);k=weekKey(dkey(d))}return n}
function bestStreak(){const wk=[...new Set(logs.map(l=>weekKey(l.date)))].sort();let best=0,c=0,prev=null;wk.forEach(w=>{if(prev){const p=new Date(prev+"T12:00:00");p.setDate(p.getDate()+7);c=dkey(p)===w?c+1:1}else c=1;best=Math.max(best,c);prev=w});return best}
const volOf=l=>Object.values(l.ex).flat().reduce((a,s)=>a+(+s.kg||0)*(+s.reps||0),0);
// small label under a calendar day: programs logged that day (+ run/badminton); future days show the weekly plan, faded
function calTag(ds){const tg=(food[ds]||{}).tags||{};
  const done=logs.filter(l=>l.date===ds).map(l=>progName(l.prog));if(tg.run)done.push("🏃");if(tg.bad)done.push("🏸");Object.keys(tg.cx||{}).forEach(k=>done.push((PROGS[k]||{}).icon||"🏃"));
  if(done.length)return `<small>${esc(done.join(" "))}</small>`;
  if(ds<=TODAY)return "";const pl=planFor(ds);
  return pl?`<small class="plan">${pl==="run"?"🏃":pl==="bad"?"🏸":esc(progName(pl))}</small>`:""}
function renderProgress(){
  const days=workoutDays(),streak=weekStreak(),best=bestStreak();
  const ym=(calM||DAY).slice(0,7);const monthCount=days.filter(d=>d.startsWith(ym)).length;
  const pm=(()=>{const d=new Date(ym+"-15T12:00:00");d.setMonth(d.getMonth()-1);return dkey(d).slice(0,7)})(),prevCount=days.filter(d=>d.startsWith(pm)).length,df=monthCount-prevCount;
  const tr=df>0?`<i class="st-up">▲ ${df} ${t("วัน_s").replace(/_s$/,"")} ${t("จากเดือนก่อน")}</i>`:df<0?`<i class="st-dn">▼ ${-df} ${t("วัน_s").replace(/_s$/,"")} ${t("จากเดือนก่อน")}</i>`:`<i>${t("เท่าเดือนก่อน")}</i>`;
  document.getElementById("stats").innerHTML=[[monthCount,t("เดือนนี้"),tr],[streak,t("สัปดาห์ติดกัน"),streak?`<i>${t("ดีสุด")} ${best}</i>`:`<i>${t("เล่น 1 ครั้งเพื่อเริ่มนับ")}</i>`],[days.length,t("วันที่เล่นทั้งหมด"),""]].map(([v,l,x])=>`<div class="stat"><b>${v}</b><span>${l}</span>${x}</div>`).join("");
  const [Y,M]=ym.split("-").map(Number);const first=new Date(Y,M-1,1);const lead=(first.getDay()+6)%7;const n=new Date(Y,M,0).getDate();
  document.getElementById("cal-title").textContent=first.toLocaleDateString(LOC(),{month:"long",year:"numeric"});
  const set=new Set(days);const dows=lang==="th"?["จ","อ","พ","พฤ","ศ","ส","อา"]:["M","T","W","T","F","S","S"];
  let h=dows.map(d=>`<span class="dow">${d}</span>`).join("")+"<span></span>".repeat(lead);
  for(let i=1;i<=n;i++){const ds=`${ym}-${String(i).padStart(2,"0")}`;h+=`<button class="d in${set.has(ds)?" on":""}${ds===TODAY?" today":""}${ds===DAY?" sel":""}" data-ds="${ds}" ${ds>TODAY?"disabled":""} aria-label="${ds}"><span>${i}</span>${calTag(ds)}</button>`}
  document.getElementById("cal-grid").innerHTML=h;
  document.querySelectorAll("#cal-grid [data-ds]").forEach(b=>b.addEventListener("click",()=>openDay(b.dataset.ds)));
  const total=days.length,vol=logs.reduce((a,l)=>a+volOf(l),0);
  const B=[["🥇",t("ครั้งแรก"),total>=1],["🔥","5 "+t("วันที่เล่น"),total>=5],["💪","10 "+t("วันที่เล่น"),total>=10],["🏅","25 "+t("วันที่เล่น"),total>=25],["🏆","50 "+t("วันที่เล่น"),total>=50],["👑","100 "+t("วันที่เล่น"),total>=100],["💎","250 "+t("วันที่เล่น"),total>=250],
    ["📅","2 "+t("สัปดาห์"),best>=2],["⚡","4 "+t("สัปดาห์"),best>=4],["🌙","8 "+t("สัปดาห์"),best>=8],["☀️","12 "+t("สัปดาห์"),best>=12],["🌋","26 "+t("สัปดาห์"),best>=26],
    ["🧱","10,000 kg "+t("ยกรวม"),vol>=1e4],["🏔️","50,000 kg "+t("ยกรวม"),vol>=5e4],["🚀","100,000 kg "+t("ยกรวม"),vol>=1e5]];
  if(document.getElementById("badges"))document.getElementById("badges").innerHTML=B.map(([i,l,ok])=>`<div class="badge ${ok?"got":"lock"}"><i>${i}</i><small>${l}</small></div>`).join("");
}
document.getElementById("cal-prev").addEventListener("click",()=>{const [y,m]=(calM||DAY).slice(0,7).split("-").map(Number);const d=new Date(y,m-2,1);calM=dkey(d);renderProgress()});
document.getElementById("cal-next").addEventListener("click",()=>{const [y,m]=(calM||DAY).slice(0,7).split("-").map(Number);const d=new Date(y,m,1);calM=dkey(d);renderProgress()});

/* ---------- tap a calendar day → summary sheet (what was done), then open it in Workout or Food ---------- */
let dayDs=null;
function openDay(ds){dayDs=ds;const d=food[ds]||{done:{},tags:{}},tg=d.tags||{},ls=logs.filter(l=>l.date===ds);
  const all=[...MEALS,EXTRAS.run,EXTRAS.bad],eaten=all.filter(m=>(d.done||{})[m.id]),k=eaten.reduce((a,m)=>a+m.k,0),p=eaten.reduce((a,m)=>a+m.p,0);
  const rows=[];
  ls.forEach(l=>{const n=Object.values(l.ex).reduce((a,s)=>a+s.length,0);rows.push(`<li><b class="no">🏋️</b><em class="nm">${esc(progName(l.prog))}</em><span class="ss">${nU(Object.keys(l.ex).length,"ท่า")} · ${nU(n,"เซ็ต")}</span></li>`)});
  if(tg.run){const r=tg.runData;rows.push(`<li><b class="no">🏃</b><em class="nm">${t("วิ่ง")}</em><span class="ss">${r&&r.km?`${r.km} km · ${fmtPace(r.sec/r.km)}/km`:"✓"}</span></li>`)}
  if(tg.bad)rows.push(`<li><b class="no">🏸</b><em class="nm">${t("ตีแบด")}</em><span class="ss">✓</span></li>`);Object.entries(tg.cx||{}).forEach(([k,v])=>{const p=PROGS[k]||{};rows.push(`<li><b class="no">${esc(p.icon||"🏃")}</b><em class="nm">${esc(p.name||k)}</em><span class="ss">${v&&v.km?`${v.km} km`:"✓"}</span></li>`)});
  rows.push(`<li><b class="no">🍽️</b><em class="nm">${t("อาหาร")}</em><span class="ss">${k} kcal · P${p}</span></li>`);
  const plan=planFor(ds);
  document.getElementById("day-body").innerHTML=`<div class="sheet-h"><b>${thDate(ds,{weekday:"long",day:"numeric",month:"long"})}</b>
    <small>${ls.length||cxAny(ds)?t("สิ่งที่ทำวันนั้น"):plan&&PROGS[plan]?t("ตามตาราง")+": "+esc(progName(plan)):t("ยังไม่มีบันทึก")}</small></div><ul class="prog-ex">${rows.join("")}</ul>`;
  document.getElementById("day-sheet").hidden=false}
const closeDay=()=>{document.getElementById("day-sheet").hidden=true};
const goDay=v=>{const ds=dayDs;closeDay();weekOpen=false;wkMonth=null;try{renderWeek()}catch(e){}if(ds&&ds!==DAY){DAY=ds;draft.ex={};picked=false;renderAll()}location.hash=v};
document.getElementById("day-sheet").addEventListener("click",ev=>{if(ev.target.id==="day-sheet")closeDay()});
document.getElementById("day-gym").addEventListener("click",()=>goDay(curView==="food"?"gym":"gym"));
document.getElementById("day-food").addEventListener("click",()=>goDay("food"));

Object.assign(EN,{"จากเดือนก่อน":"vs last month","เท่าเดือนก่อน":"same as last month","ดีสุด":"best","เล่น 1 ครั้งเพื่อเริ่มนับ":"train once to start","วันที่เล่นทั้งหมด":"days trained total"});
