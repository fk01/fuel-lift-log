// history-chart.js — History as charts: per-exercise progress (top weight, est. 1RM, volume) and total volume per day
// Classic script: shares globals with the other files in /js (load order is set in index.html).
/* ---------- history charts ---------- */
Object.assign(EN,{"กราฟ":"Chart","รายการ":"List","รวมทุกท่า":"All exercises","น้ำหนักสูงสุด":"Top weight","วอลุ่มรวม":"Volume","1RM โดยประมาณ":"Est. 1RM",
  "ครั้งล่าสุด":"Latest","สถิติสูงสุด":"Best","เทียบครั้งแรก":"Since first","ครั้งที่บันทึก":"sessions","1 เดือน":"1 month","3 เดือน":"3 months","ทั้งหมด":"All",
  "ยังไม่มีข้อมูลในช่วงนี้":"No data in this range","ดูกราฟ":"Chart","เลือกท่า":"Choose exercise","วอลุ่มต่อวัน":"volume per day"});
let histMode=(()=>{try{return localStorage.getItem("histmode")||"chart"}catch(e){return "chart"}})();
let histEx=null,histMetric="max",histRange="all";
const HIST_METRICS=[["max","น้ำหนักสูงสุด"],["e1rm","1RM โดยประมาณ"],["vol","วอลุ่มรวม"]];
const HIST_RANGES=[["1m","1 เดือน",31],["3m","3 เดือน",92],["all","ทั้งหมด",0]];
const fmtNum=v=>(Math.round(v*10)/10).toLocaleString();
const setsTxt=(sets,u)=>{const out=[];sets.forEach(q=>{const k=`${toDisp(q.kg,u)}×${q.reps}`;const l=out[out.length-1];if(l&&l.k===k)l.n++;else out.push({k,n:1})});return out.map(o=>o.n>1?`${o.k} ×${o.n}`:o.k).join(" · ")};
function histIds(){const seen=new Set();logs.forEach(l=>Object.keys(l.ex).forEach(id=>{if(l.ex[id]&&l.ex[id].length)seen.add(id)}));return [...seen]}
function histSeries(){
  let pts;
  if(histEx==="all"){const by={};logs.forEach(l=>{by[l.date]=(by[l.date]||0)+volOf(l)});
    pts=Object.keys(by).sort().map(d=>({date:d,v:Math.round(by[d]),note:""}));return{pts,unit:"kg"}}
  const u=uOf(histEx),k=u==="lb"?LB:1;
  pts=logs.filter(l=>l.ex[histEx]&&l.ex[histEx].length).map(l=>{const s=l.ex[histEx];
    const v=histMetric==="max"?best(s)*k:histMetric==="vol"?s.reduce((a,q)=>a+(+q.kg||0)*(+q.reps||0),0)*k:Math.max(...s.map(q=>(+q.kg||0)*(1+(+q.reps||0)/30)))*k;
    return{date:l.date,v:Math.round(v*10)/10,note:setsTxt(s,u)+" "+u}}).sort((a,b)=>a.date.localeCompare(b.date));
  return{pts,unit:u}}
function niceTicks(lo,hi,n){if(hi<=lo){hi=lo+1;lo=Math.max(0,lo-1)}const raw=(hi-lo)/n,p=Math.pow(10,Math.floor(Math.log10(raw))),f=raw/p,step=(f<1.5?1:f<3?2:f<7?5:10)*p;
  const a=Math.floor(lo/step)*step,out=[];for(let v=a;v<=hi+step*.999;v+=step)out.push(Math.round(v*1000)/1000);return out}
function lineChart(box,pts,unit){
  const W=Math.max(280,box.clientWidth||340),H=200,L=44,R=16,T=18,B=26,ns="http://www.w3.org/2000/svg";
  const X0=new Date(pts[0].date+"T12:00:00").getTime(),X1=new Date(pts[pts.length-1].date+"T12:00:00").getTime();
  const vs=pts.map(p=>p.v),lo=Math.min(...vs),hi=Math.max(...vs),pad=(hi-lo)*.15||Math.max(1,hi*.05);
  const ticks=niceTicks(Math.max(0,lo-pad),hi+pad,3),y0=ticks[0],y1=ticks[ticks.length-1];
  const x=p=>X1===X0?L+(W-L-R)/2:L+(new Date(p.date+"T12:00:00").getTime()-X0)/(X1-X0)*(W-L-R);
  const y=v=>T+(1-(v-y0)/(y1-y0))*(H-T-B);
  const best=pts.reduce((m,p)=>p.v>=m.v?p:m,pts[0]),last=pts[pts.length-1];
  const dl=d=>thDate(d,{day:"numeric",month:"short"});
  let s=`<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="chart" style="display:block;max-width:100%;touch-action:pan-y">`;
  ticks.forEach(v=>{s+=`<line x1="${L}" x2="${W-R}" y1="${y(v)}" y2="${y(v)}" stroke="var(--line)" stroke-width="1"/><text x="${L-8}" y="${y(v)+4}" text-anchor="end" fill="var(--muted)" font-size="11" font-family="var(--f-num)">${fmtNum(v)}</text>`});
  s+=`<text x="${L}" y="${H-6}" fill="var(--muted)" font-size="11" font-family="var(--f-num)">${dl(pts[0].date)}</text>`;
  if(pts.length>1)s+=`<text x="${W-R}" y="${H-6}" text-anchor="end" fill="var(--muted)" font-size="11" font-family="var(--f-num)">${dl(last.date)}</text>`;
  if(pts.length>1)s+=`<path d="${pts.map((p,i)=>(i?"L":"M")+x(p).toFixed(1)+" "+y(p.v).toFixed(1)).join(" ")}" fill="none" stroke="var(--series)" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>`;
  if(pts.length<=40)pts.forEach(p=>{s+=`<circle cx="${x(p).toFixed(1)}" cy="${y(p.v).toFixed(1)}" r="4" fill="var(--series)" stroke="var(--surface)" stroke-width="2"/>`});
  const lab=(p,txt)=>{const cx=x(p),a=cx>W-R-40?"end":cx<L+40?"start":"middle";return `<text x="${cx}" y="${Math.max(12,y(p.v)-10)}" text-anchor="${a}" fill="var(--fg)" font-size="12" font-weight="600" font-family="var(--f-num)">${txt}</text>`};
  if(best!==last)s+=`<circle cx="${x(best).toFixed(1)}" cy="${y(best.v).toFixed(1)}" r="7" fill="none" stroke="var(--fg)" stroke-width="1.5"/>`+lab(best,"★ "+fmtNum(best.v));
  s+=lab(last,(best===last&&pts.length>1?"★ ":"")+fmtNum(last.v));
  s+=`<line class="hc-x" y1="${T}" y2="${H-B}" stroke="var(--muted)" stroke-width="1" visibility="hidden"/><circle class="hc-d" r="6" fill="var(--fg)" stroke="var(--surface)" stroke-width="2" visibility="hidden"/></svg><div class="hc-tip" hidden></div>`;
  box.innerHTML=s;box.style.position="relative";
  const svg=box.querySelector("svg"),cx=box.querySelector(".hc-x"),cd=box.querySelector(".hc-d"),tip=box.querySelector(".hc-tip");
  const hide=()=>{cx.setAttribute("visibility","hidden");cd.setAttribute("visibility","hidden");tip.hidden=true};
  const show=ev=>{const r=svg.getBoundingClientRect(),px=(ev.clientX-r.left)*W/r.width;let p=pts[0];pts.forEach(q=>{if(Math.abs(x(q)-px)<Math.abs(x(p)-px))p=q});
    cx.setAttribute("x1",x(p));cx.setAttribute("x2",x(p));cx.setAttribute("visibility","visible");cd.setAttribute("cx",x(p));cd.setAttribute("cy",y(p.v));cd.setAttribute("visibility","visible");
    tip.innerHTML=`<b>${fmtNum(p.v)} ${unit}</b><span>${thDate(p.date,{weekday:"short",day:"numeric",month:"short",year:"2-digit"})}</span>${p.note?`<span>${esc(p.note)}</span>`:""}`;tip.hidden=false;
    const tw=tip.offsetWidth,left=Math.max(0,Math.min(r.width-tw,x(p)*r.width/W-tw/2));tip.style.left=left+"px";tip.style.top=(y(p.v)*r.height/H>90?4:H-B-tip.offsetHeight-4)+"px"};
  svg.addEventListener("pointermove",show);svg.addEventListener("pointerdown",show);svg.addEventListener("pointerleave",hide);
}
let histPop=false;   // true while the chart is shown in the pop-up (opened from an exercise card)
function renderHistChart(){
  if(histPop)return renderHistInto(document.getElementById("chart-body"));
  const sec=document.getElementById("hist-chart"),list=document.getElementById("sessions");
  document.querySelectorAll("#hist-mode .chip").forEach(c=>c.setAttribute("aria-pressed",c.dataset.m===histMode));
  sec.hidden=histMode!=="chart";list.hidden=histMode==="chart";if(sec.hidden)return;
  renderHistInto(sec)}
function renderHistInto(sec){
  const ids=histIds();if(!ids.length){sec.innerHTML=`<p class="note">—</p>`;return}
  if(histEx!=="all"&&!ids.includes(histEx)){const l=logs[logs.length-1];histEx=Object.keys(l.ex).find(id=>l.ex[id].length)||ids[0]}
  const byG={};ids.forEach(id=>{const x={id,n:exName(id)};(byG[groupOf(x)]=byG[groupOf(x)]||[]).push(x)});
  const chips=(arr,cur,attr)=>arr.map(([v,l])=>`<button class="chip" data-${attr}="${v}" aria-pressed="${cur===v}">${t(l)}</button>`).join("");
  sec.innerHTML=`<select id="hist-ex" aria-label="${t("เลือกท่า")}" style="background:var(--surface);color:var(--fg);border:1px solid var(--line);border-radius:8px;padding:10px;font:inherit;width:100%">
      <option value="all" ${histEx==="all"?"selected":""}>${t("รวมทุกท่า")} · ${t("วอลุ่มต่อวัน")}</option>
      ${GROUPS.filter(([g])=>byG[g]).map(([g,l])=>`<optgroup label="${t(l)}">${byG[g].sort((a,b)=>a.n.localeCompare(b.n)).map(x=>`<option value="${x.id}" ${histEx===x.id?"selected":""}>${esc(x.n)}</option>`).join("")}</optgroup>`).join("")}</select>
    ${histEx==="all"?"":`<div class="chips">${chips(HIST_METRICS,histMetric,"hm")}</div>`}
    <div class="stats" id="hist-stats"></div>
    <div class="cal"><div id="hist-plot"></div><div class="chips" style="justify-content:flex-end">${chips(HIST_RANGES,histRange,"hr")}</div></div>`;
  sec.querySelector("#hist-ex").addEventListener("change",ev=>{histEx=ev.target.value;renderHistChart()});
  sec.querySelectorAll("[data-hm]").forEach(b=>b.addEventListener("click",()=>{histMetric=b.dataset.hm;renderHistChart()}));
  sec.querySelectorAll("[data-hr]").forEach(b=>b.addEventListener("click",()=>{histRange=b.dataset.hr;renderHistChart()}));
  const {pts:all,unit}=histSeries();const days=HIST_RANGES.find(r=>r[0]===histRange)[2];
  const from=days?dkey(new Date(new Date(TODAY+"T12:00:00").getTime()-days*864e5)):"";const pts=all.filter(p=>p.date>=from);
  const plot=sec.querySelector("#hist-plot"),stats=sec.querySelector("#hist-stats");
  if(!pts.length){stats.innerHTML="";plot.innerHTML=`<p class="note">${t("ยังไม่มีข้อมูลในช่วงนี้")}</p>`;return}
  const last=pts[pts.length-1].v,top=Math.max(...pts.map(p=>p.v)),d=last-pts[0].v;
  stats.innerHTML=[[fmtNum(last),`${t("ครั้งล่าสุด")} · ${unit}`],[fmtNum(top),`${t("สถิติสูงสุด")} · ${unit}`],[pts.length>1?(d>0?"▲ +":d<0?"▼ ":"")+fmtNum(d):"–",`${t("เทียบครั้งแรก")} · ${pts.length} ${t("ครั้งที่บันทึก")}`]]
    .map(([v,l])=>`<div class="stat"><b>${v}</b><span>${l}</span></div>`).join("");
  lineChart(plot,pts,unit)}
document.querySelectorAll("#hist-mode .chip").forEach(c=>c.addEventListener("click",()=>{histMode=c.dataset.m;try{localStorage.setItem("histmode",histMode)}catch(e){}renderHistChart()}));
document.getElementById("exs").addEventListener("click",ev=>{const b=ev.target.closest("[data-chart]");if(!b)return;histEx=b.dataset.chart;histPop=true;
  document.getElementById("chart-modal").hidden=false;renderHistChart()});
document.getElementById("chart-close").addEventListener("click",()=>{histPop=false;document.getElementById("chart-modal").hidden=true;document.getElementById("chart-body").innerHTML="";renderHistChart()});
window.addEventListener("resize",()=>{if(histPop||histMode==="chart"&&!document.getElementById("v-stats").hidden)renderHistChart()});
