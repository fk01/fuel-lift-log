// stats-extra.js — Stats tab extras: volume chart by range, sets per muscle group this week, 1RM highlights, body weight log
// Classic script: shares globals with the other files in /js (load order is set in index.html).
Object.assign(EN,{"วอลุ่ม":"Volume","เฉลี่ยต่อวัน":"Daily average","รวม":"Total","1 สัปดาห์":"1 week","6 เดือน":"6 months","1 ปี":"1 year",
  "เซ็ตต่อกล้ามเนื้อสัปดาห์นี้":"Sets per muscle this week","1RM เด่น":"1RM highlights","น้ำหนักตัว":"Body weight","บันทึกน้ำหนัก":"Log weight",
  "ยังไม่มีบันทึก":"Nothing logged","เทียบ 30 วันก่อน":"vs 30 days before"});
const SET_TARGET={chest:10,back:12,shoulder:10,arms:12,legs:16,core:6};
let volRange="1w",BODY=load("body",[]);           // BODY: [{d:"YYYY-MM-DD",kg}]
const exOf=(id,l)=>EXLIB.find(x=>x.id===id)||{id,n:(l&&l.names&&l.names[id])||exName(id)};
const ds2d=ds=>new Date(ds+"T12:00:00"),addD=(d,n)=>{const x=new Date(d);x.setDate(x.getDate()+n);return x};
function volBuckets(){const today=ds2d(TODAY),vol={};logs.forEach(l=>{vol[l.date]=(vol[l.date]||0)+volOf(l)});const out=[];
  if(volRange==="1w"){const mon=addD(today,-((today.getDay()+6)%7));for(let i=0;i<7;i++){const d=addD(mon,i),k=dkey(d);out.push({lab:d.toLocaleDateString(LOC(),{weekday:"narrow"}),v:vol[k]||0,days:1})}}
  else if(volRange==="1m"){for(let i=29;i>=0;i--){const d=addD(today,-i),k=dkey(d);out.push({lab:i%7===0?String(d.getDate()):"",v:vol[k]||0,days:1})}}
  else if(volRange==="6m"){for(let w=25;w>=0;w--){let v=0;for(let i=0;i<7;i++)v+=vol[dkey(addD(today,-w*7-i))]||0;const d=addD(today,-w*7);out.push({lab:w%4===0?d.toLocaleDateString(LOC(),{month:"short"}):"",v,days:7})}}
  else{for(let m=11;m>=0;m--){const d=new Date(today.getFullYear(),today.getMonth()-m,1),pre=dkey(d).slice(0,7);let v=0;Object.keys(vol).forEach(k=>{if(k.startsWith(pre))v+=vol[k]});out.push({lab:d.toLocaleDateString(LOC(),{month:"narrow"}),v,days:new Date(d.getFullYear(),d.getMonth()+1,0).getDate()})}}
  return out}
function renderVolume(){const box=document.getElementById("vol-card");if(!box)return;const b=volBuckets(),tot=b.reduce((a,x)=>a+x.v,0),days=b.reduce((a,x)=>a+x.days,0),mx=Math.max(1,...b.map(x=>x.v));
  const W=340,H=120,gap=b.length>12?2:6,bw=(W-gap*(b.length-1))/b.length;
  box.innerHTML=`<div class="chips seg">${[["1w","1 สัปดาห์"],["1m","1 เดือน"],["6m","6 เดือน"],["1y","1 ปี"]].map(([k,l])=>`<button class="chip" data-vr="${k}" aria-pressed="${k===volRange}">${t(l)}</button>`).join("")}</div>
    <div class="vol-h"><small>${t("เฉลี่ยต่อวัน")}</small><b>${Math.round(tot/days).toLocaleString()} <small>kg</small></b></div>
    <svg viewBox="0 0 ${W} ${H+18}" width="100%" role="img" aria-label="volume">${b.map((x,i)=>{const h=x.v?Math.max(4,x.v/mx*H):3,X=i*(bw+gap);
      return `<rect x="${X.toFixed(1)}" y="${(H-h).toFixed(1)}" width="${bw.toFixed(1)}" height="${h.toFixed(1)}" rx="${Math.min(4,bw/2)}" fill="${x.v?"var(--series,#4f93f5)":"var(--line)"}"><title>${Math.round(x.v)} kg</title></rect>${x.lab?`<text x="${(X+bw/2).toFixed(1)}" y="${H+14}" text-anchor="middle" fill="var(--muted)" font-size="10" font-family="var(--f-num)">${x.lab}</text>`:""}`}).join("")}</svg>
    <div class="row-head vol-f"><span>${t("รวม")}</span><b>${Math.round(tot).toLocaleString()} kg</b></div>`;
  box.querySelectorAll("[data-vr]").forEach(c=>c.addEventListener("click",()=>{volRange=c.dataset.vr;renderVolume()}))}
function renderMuscleSets(){const box=document.getElementById("mset-card");if(!box)return;const today=ds2d(TODAY),mon=dkey(addD(today,-((today.getDay()+6)%7)));const n={};
  logs.filter(l=>l.date>=mon&&l.date<=TODAY).forEach(l=>Object.entries(l.ex).forEach(([id,s])=>{const g=groupOf(exOf(id,l));n[g]=(n[g]||0)+s.length}));
  box.innerHTML=`<div class="rings">${Object.entries(SET_TARGET).map(([g,tg])=>{const v=n[g]||0,f=Math.min(1,v/tg),r=26,C=2*Math.PI*r;
    return `<div class="ring"><svg viewBox="0 0 64 64" width="64" height="64"><circle cx="32" cy="32" r="${r}" fill="none" stroke="var(--line)" stroke-width="6"/><circle cx="32" cy="32" r="${r}" fill="none" stroke="${v>=tg?"var(--up)":"var(--series,#4f93f5)"}" stroke-width="6" stroke-linecap="round" stroke-dasharray="${(C*f).toFixed(1)} ${C.toFixed(1)}" transform="rotate(-90 32 32)"/></svg><b>${groupName(g)}</b><small>${v} / ${tg} ${t("เซ็ต")}</small></div>`}).join("")}</div>`}
function renderPRs(){const box=document.getElementById("pr-card");if(!box)return;const e1=s=>Math.max(...s.map(q=>(+q.kg||0)*(1+(+q.reps||0)/30)));
  const cut=dkey(addD(ds2d(TODAY),-30)),rows=[];
  HEAVY.forEach(id=>{const h=logs.filter(l=>l.ex[id]&&l.ex[id].length);if(!h.length)return;const recent=h.filter(l=>l.date>=cut),old=h.filter(l=>l.date<cut);
    const now=Math.max(...(recent.length?recent:h).map(l=>e1(l.ex[id]))),was=old.length?Math.max(...old.map(l=>e1(l.ex[id]))):null;
    rows.push({id,n:exName(id),now,d:was==null?null:now-was,sets:h.reduce((a,l)=>a+l.ex[id].length,0),last:h[h.length-1].date})});
  rows.sort((a,b)=>b.last.localeCompare(a.last));
  box.innerHTML=rows.length?rows.slice(0,5).map(r=>{const g=gifOf({id:r.id,n:r.n});return `<div class="sx-row">${g?`<img src="${esc(g)}" alt="" loading="lazy">`:`<span class="sx-ph">🏋️</span>`}<span><b>${esc(r.n)}</b><small>${r.sets} ${t("เซ็ต")}${r.d!=null?` · ${t("เทียบ 30 วันก่อน")} <i class="${Math.round(r.d)>0?"up":Math.round(r.d)<0?"dn":""}">${Math.round(r.d)>0?"▲ ":Math.round(r.d)<0?"▼ ":"= "}${Math.abs(Math.round(r.d))} kg</i>`:""}</small></span><b class="pr-v">${Math.round(r.now)}<small> kg</small></b></div>`}).join(""):`<p class="note">${t("ยังไม่มีบันทึก")}</p>`}
function renderBody(){const box=document.getElementById("body-card");if(!box)return;const L=BODY.slice().sort((a,b)=>a.d.localeCompare(b.d)),last=L[L.length-1],first=L[0];
  let chart="";if(L.length>1){const W=300,H=70,v=L.map(x=>x.kg),lo=Math.min(...v),hi=Math.max(...v),sp=hi-lo||1,X=i=>i/(L.length-1)*W,Y=k=>H-(k-lo)/sp*(H-10)-5;
    chart=`<svg viewBox="0 0 ${W} ${H}" width="100%" height="${H}"><path d="${L.map((x,i)=>(i?"L":"M")+X(i).toFixed(1)+" "+Y(x.kg).toFixed(1)).join(" ")}" fill="none" stroke="var(--series,#4f93f5)" stroke-width="2.5" stroke-linejoin="round"/>${L.map((x,i)=>`<circle cx="${X(i).toFixed(1)}" cy="${Y(x.kg).toFixed(1)}" r="3.5" fill="var(--series,#4f93f5)"/>`).join("")}</svg>`}
  box.innerHTML=`<div class="row-head" style="align-items:center"><span class="vol-h"><small>${last?thDate(last.d,{day:"numeric",month:"short"}):t("ยังไม่มีบันทึก")}</small><b>${last?last.kg:"–"} <small>kg</small>${last&&first&&L.length>1?` <i class="${last.kg<=first.kg?"up":"dn"}" style="font-style:normal;font-size:.8rem">${last.kg-first.kg>0?"+":""}${(last.kg-first.kg).toFixed(1)}</i>`:""}</b></span>
    <input id="bw-in" type="number" readonly inputmode="none" data-pad="bw" value="${last?last.kg:""}" aria-label="${t("น้ำหนักตัว")}" hidden><button class="btn sm primary" id="bw-add">+ ${t("บันทึกน้ำหนัก")}</button></div>${chart}`;
  box.querySelector("#bw-add").addEventListener("click",()=>{PAD.bw=PAD.bw||{steps:[.1,.5,1,5],def:70,fix:1};openPad(box.querySelector("#bw-in"))});
  box.querySelector("#bw-in").addEventListener("change",ev=>{const kg=Math.round(+ev.target.value*10)/10;if(!(kg>0))return;BODY=BODY.filter(x=>x.d!==TODAY);BODY.push({d:TODAY,kg});save("body",BODY);renderBody();toast(`${t("น้ำหนักตัว")} ${kg} kg ✓`)})}

function renderStatsExtra(){try{renderVolume();renderMuscleSets();renderPRs();renderBody()}catch(e){console.error(e)}}
addEventListener("hashchange",()=>{if(location.hash==="#stats")renderStatsExtra()});setTimeout(renderStatsExtra,300);
