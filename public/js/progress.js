// progress.js — XP, level and achievements
// Classic script: shares globals with the other files in /js (load order is set in index.html).
/* ---------- progress + achievements ---------- */
let calM=null;
function workoutDays(){return [...new Set(logs.map(l=>l.date))].sort()}
function weekKey(ds){const d=new Date(ds+"T12:00:00");const day=(d.getDay()+6)%7;d.setDate(d.getDate()-day);return dkey(d)}
function weekStreak(){const wk=new Set(logs.map(l=>weekKey(l.date)));let d=new Date(TODAY+"T12:00:00");let k=weekKey(TODAY);if(!wk.has(k)){d.setDate(d.getDate()-7);k=weekKey(dkey(d))}let n=0;while(wk.has(k)){n++;d.setDate(d.getDate()-7);k=weekKey(dkey(d))}return n}
function bestStreak(){const wk=[...new Set(logs.map(l=>weekKey(l.date)))].sort();let best=0,c=0,prev=null;wk.forEach(w=>{if(prev){const p=new Date(prev+"T12:00:00");p.setDate(p.getDate()+7);c=dkey(p)===w?c+1:1}else c=1;best=Math.max(best,c);prev=w});return best}
const volOf=l=>Object.values(l.ex).flat().reduce((a,s)=>a+(+s.kg||0)*(+s.reps||0),0);
function renderProgress(){
  const days=workoutDays(),streak=weekStreak(),best=bestStreak();
  const ym=(calM||DAY).slice(0,7);const monthCount=days.filter(d=>d.startsWith(ym)).length;
  document.getElementById("stats").innerHTML=[[days.length,t("วันที่เล่น")],[streak,t("สัปดาห์ติดกัน")],[monthCount,t("เดือนนี้")]].map(([v,l])=>`<div class="stat"><b>${v}</b><span>${l}</span></div>`).join("");
  const [Y,M]=ym.split("-").map(Number);const first=new Date(Y,M-1,1);const lead=(first.getDay()+6)%7;const n=new Date(Y,M,0).getDate();
  document.getElementById("cal-title").textContent=first.toLocaleDateString(LOC(),{month:"long",year:"numeric"});
  const set=new Set(days);const dows=lang==="th"?["จ","อ","พ","พฤ","ศ","ส","อา"]:["M","T","W","T","F","S","S"];
  let h=dows.map(d=>`<span class="dow">${d}</span>`).join("")+"<span></span>".repeat(lead);
  for(let i=1;i<=n;i++){const ds=`${ym}-${String(i).padStart(2,"0")}`;h+=`<button class="d in${set.has(ds)?" on":""}${ds===TODAY?" today":""}${ds===DAY?" sel":""}" data-ds="${ds}" ${ds>TODAY?"disabled":""} aria-label="${ds}">${i}</button>`}
  document.getElementById("cal-grid").innerHTML=h;
  document.querySelectorAll("#cal-grid [data-ds]").forEach(b=>b.addEventListener("click",()=>{if(b.dataset.ds===DAY)return;DAY=b.dataset.ds;draft.ex={};picked=false;renderAll()}));
  const total=days.length,vol=logs.reduce((a,l)=>a+volOf(l),0);
  const B=[["🥇",t("ครั้งแรก"),total>=1],["🔥","5 "+t("วันที่เล่น"),total>=5],["💪","10 "+t("วันที่เล่น"),total>=10],["🏅","25 "+t("วันที่เล่น"),total>=25],["🏆","50 "+t("วันที่เล่น"),total>=50],["👑","100 "+t("วันที่เล่น"),total>=100],["💎","250 "+t("วันที่เล่น"),total>=250],
    ["📅","2 "+t("สัปดาห์"),best>=2],["⚡","4 "+t("สัปดาห์"),best>=4],["🌙","8 "+t("สัปดาห์"),best>=8],["☀️","12 "+t("สัปดาห์"),best>=12],["🌋","26 "+t("สัปดาห์"),best>=26],
    ["🧱","10,000 kg "+t("ยกรวม"),vol>=1e4],["🏔️","50,000 kg "+t("ยกรวม"),vol>=5e4],["🚀","100,000 kg "+t("ยกรวม"),vol>=1e5]];
  if(document.getElementById("badges"))document.getElementById("badges").innerHTML=B.map(([i,l,ok])=>`<div class="badge ${ok?"got":"lock"}"><i>${i}</i><small>${l}</small></div>`).join("");
}
document.getElementById("cal-prev").addEventListener("click",()=>{const [y,m]=(calM||DAY).slice(0,7).split("-").map(Number);const d=new Date(y,m-2,1);calM=dkey(d);renderProgress()});
document.getElementById("cal-next").addEventListener("click",()=>{const [y,m]=(calM||DAY).slice(0,7).split("-").map(Number);const d=new Date(y,m,1);calM=dkey(d);renderProgress()});
