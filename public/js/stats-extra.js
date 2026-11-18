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
    return `<div class="ring"><svg viewBox="0 0 64 64" width="64" height="64"><circle cx="32" cy="32" r="${r}" fill="none" stroke="var(--line)" stroke-width="6"/><circle cx="32" cy="32" r="${r}" fill="none" stroke="${v>=tg?"var(--up)":"var(--series,#4f93f5)"}" stroke-width="6" stroke-linecap="round" stroke-dasharray="${(C*f).toFixed(1)} ${C.toFixed(1)}" transform="rotate(-90 32 32)"/></svg><span class="ring-fig">${bodySVG(GROUP_MUS[g]||[],[],36)}</span><b>${groupName(g)}</b><small>${v} / ${tg} ${t("เซ็ต")}</small></div>`}).join("")}</div>`}
function renderPRs(){const box=document.getElementById("pr-card");if(!box)return;const e1=s=>Math.max(...s.map(q=>(+q.kg||0)*(1+(+q.reps||0)/30)));
  const cut=dkey(addD(ds2d(TODAY),-30)),rows=[];
  HEAVY.forEach(id=>{const h=logs.filter(l=>l.ex[id]&&l.ex[id].length);if(!h.length)return;const recent=h.filter(l=>l.date>=cut),old=h.filter(l=>l.date<cut);
    const now=Math.max(...(recent.length?recent:h).map(l=>e1(l.ex[id]))),was=old.length?Math.max(...old.map(l=>e1(l.ex[id]))):null;
    rows.push({id,n:exName(id),now,d:was==null?null:now-was,sets:h.reduce((a,l)=>a+l.ex[id].length,0),last:h[h.length-1].date})});
  rows.sort((a,b)=>b.last.localeCompare(a.last));
  box.innerHTML=rows.length?rows.slice(0,5).map(r=>{const g=gifOf({id:r.id,n:r.n});return `<div class="sx-row">${g?`<img src="${esc(g)}" alt="" loading="lazy">`:`<span class="sx-ph">🏋️</span>`}<span><b>${esc(r.n)}</b><small>${r.sets} ${t("เซ็ต")}${r.d!=null?` · ${t("เทียบ 30 วันก่อน")} <i class="${Math.round(r.d)>0?"up":Math.round(r.d)<0?"dn":""}">${Math.round(r.d)>0?"▲ ":Math.round(r.d)<0?"▼ ":"= "}${Math.abs(Math.round(r.d))} kg</i>`:""}</small></span><b class="pr-v">${Math.round(r.now)}<small> kg</small></b></div>`}).join(""):`<p class="note">${t("ยังไม่มีบันทึก")}</p>`}
let renderBody;renderBody=function(){const box=document.getElementById("body-card");if(!box)return;const L=BODY.slice().sort((a,b)=>a.d.localeCompare(b.d)),last=L[L.length-1],first=L[0];
  let chart="";if(L.length>1){const W=300,H=70,v=L.map(x=>x.kg),lo=Math.min(...v),hi=Math.max(...v),sp=hi-lo||1,X=i=>i/(L.length-1)*W,Y=k=>H-(k-lo)/sp*(H-10)-5;
    chart=`<svg viewBox="0 0 ${W} ${H}" width="100%" height="${H}"><path d="${L.map((x,i)=>(i?"L":"M")+X(i).toFixed(1)+" "+Y(x.kg).toFixed(1)).join(" ")}" fill="none" stroke="var(--series,#4f93f5)" stroke-width="2.5" stroke-linejoin="round"/>${L.map((x,i)=>`<circle cx="${X(i).toFixed(1)}" cy="${Y(x.kg).toFixed(1)}" r="3.5" fill="var(--series,#4f93f5)"/>`).join("")}</svg>`}
  box.innerHTML=`<div class="row-head" style="align-items:center"><span class="vol-h"><small>${last?thDate(last.d,{day:"numeric",month:"short"}):t("ยังไม่มีบันทึก")}</small><b>${last?last.kg:"–"} <small>kg</small>${last&&first&&L.length>1?` <i class="${last.kg<=first.kg?"up":"dn"}" style="font-style:normal;font-size:.8rem">${last.kg-first.kg>0?"+":""}${(last.kg-first.kg).toFixed(1)}</i>`:""}</b></span>
    <input id="bw-in" type="number" readonly inputmode="none" data-pad="bw" value="${last?last.kg:""}" aria-label="${t("น้ำหนักตัว")}" hidden><button class="btn sm primary" id="bw-add">+ ${t("บันทึกน้ำหนัก")}</button></div>${chart}`;
  box.querySelector("#bw-add").addEventListener("click",()=>{PAD.bw=PAD.bw||{steps:[.1,.5,1,5],def:70,fix:1};openPad(box.querySelector("#bw-in"))});
  box.querySelector("#bw-in").addEventListener("change",ev=>{const kg=Math.round(+ev.target.value*10)/10;if(!(kg>0))return;BODY=BODY.filter(x=>x.d!==TODAY);BODY.push({d:TODAY,kg});save("body",BODY);renderBody();toast(`${t("น้ำหนักตัว")} ${kg} kg ✓`)})}

function renderStatsExtra(){try{renderVolume();renderRecovery();renderMuscleSets();renderPRs();renderBody()}catch(e){console.error(e)}}
addEventListener("hashchange",()=>{if(location.hash==="#stats")renderStatsExtra()});setTimeout(renderStatsExtra,300);

/* ---------- recovery map: days since each muscle was last trained (primary) ---------- */

Object.assign(EN,{"การฟื้นตัวของกล้ามเนื้อ":"Muscle recovery","พร้อม":"Ready","กำลังฟื้น":"Recovering","เพิ่งเล่น":"Just trained","วันก่อน":"d ago","วันนี้":"today",
  "อก":"Chest","ไหล่หน้า":"Front delts","ไหล่หลัง":"Rear delts","บ่า":"Traps","หลัง":"Back","หน้าแขน":"Biceps","หลังแขน":"Triceps","แขนท่อนล่าง":"Forearms","หน้าท้อง":"Abs","ข้างลำตัว":"Obliques","ต้นขาหน้า":"Quads","ต้นขาหลัง":"Hamstrings","ก้น":"Glutes","น่อง":"Calves","ขานอก":"Abductors","ขาใน":"Adductors"});
// last date each muscle was a primary target, plus which exercises hit it that day (shown on the tiles so the mapping can be checked)
let recLast={};
function lastTrained(){const out={},by={};logs.filter(l=>l.date<=TODAY).forEach(l=>Object.keys(l.ex).forEach(id=>{const x=exOf(id,l);musOf(x)[0].forEach(m=>{
    if(!out[m]||out[m]<l.date){out[m]=l.date;by[m]=[]}if(out[m]===l.date&&!by[m].includes(x.n))by[m].push(x.n)})}));recLast=by;return out}
let recSel=null;
function renderRecovery(){const box=document.getElementById("rec-card");if(!box)return;const lt=lastTrained(),now=ds2d(TODAY);
  const ago=m=>lt[m]?Math.round((now-ds2d(lt[m]))/864e5):null,state=d=>d==null?0:d<=1?1:d<=2?2:3;
  const C=["#2f2e2b","#e07a6a","#d9a46c","#7cc47a"];
  const rows=Object.keys(MUS_NAME).filter(m=>lt[m]).sort((a,b)=>ago(a)-ago(b)).map(m=>{const d=ago(m);
    return `<button class="rec-t" data-m="${m}" aria-pressed="${recSel===m}"><b><span>${t(MUS_NAME[m])}</span><small style="color:${C[state(d)]}">${d===0?t("วันนี้"):d+" "+t("วันก่อน")}</small></b><em>${(recLast[m]||[]).map(esc).join(" · ")}</em></button>`}).join("");
  box.innerHTML=`<div class="rec-wrap"><div class="rec-fig">${bodySVG([],[],170,m=>recSel&&m!==recSel?(lt[m]?"#3a3936":null):C[state(ago(m))])}</div><div class="rec-list">${rows||`<p class="note">${t("ยังไม่มีบันทึก")}</p>`}</div></div>
    <div class="rec-leg"><span><i style="background:${C[1]}"></i>${t("เพิ่งเล่น")}</span><span><i style="background:${C[2]}"></i>${t("กำลังฟื้น")}</span><span><i style="background:${C[3]}"></i>${t("พร้อม")}</span></div>
`}
/* ---------- generic bottom sheet ---------- */
function openGen(title,html,after){document.getElementById("gen-body").innerHTML=`<div class="sheet-h"><b>${title}</b></div>${html}`;document.getElementById("gen-sheet").hidden=false;if(after)after(document.getElementById("gen-body"))}
document.getElementById("gen-sheet").addEventListener("click",ev=>{if(ev.target.id==="gen-sheet"||ev.target.closest("[data-gen-close]"))document.getElementById("gen-sheet").hidden=true});
/* ---------- 1RM calculator ---------- */
Object.assign(EN,{"คำนวณ 1RM":"1RM calculator","น้ำหนัก":"Weight","ครั้ง":"Reps","เหรียญรางวัล":"Badges","ปิด":"Close"});
function open1RM(){PAD.kg1={steps:[1,2.5,5,10],def:40};PAD.rp1={chips:Array.from({length:15},(_,i)=>i+1),cols:5};
  openGen("🧮 "+t("คำนวณ 1RM"),`<div class="rm-in"><label>${t("น้ำหนัก")} (kg)<input id="rm-kg" readonly inputmode="none" data-pad="kg1" value="40"></label><label>${t("ครั้ง")}<input id="rm-rp" readonly inputmode="none" data-pad="rp1" value="5"></label></div><div id="rm-out"></div><button class="btn" data-gen-close>${t("ปิด")}</button>`,b=>{
    const calc=()=>{const w=+b.querySelector("#rm-kg").value||0,r=+b.querySelector("#rm-rp").value||1,one=r<=1?w:w*(1+r/30);
      b.querySelector("#rm-out").innerHTML=`<div class="vol-h"><small>1RM</small><b>${Math.round(one*10)/10} <small>kg</small></b></div><div class="rm-t">${[95,90,85,80,75,70,65,60].map(p=>`<span><b>${p}%</b>${Math.round(one*p/100*2)/2} kg</span>`).join("")}</div>`};
    b.querySelectorAll("input").forEach(i=>i.addEventListener("change",calc));calc()})}
function openBadges(){openGen("🏆 "+t("เหรียญรางวัล"),`<div class="badges" id="badges"></div><button class="btn" data-gen-close>${t("ปิด")}</button>`,()=>{try{renderProgress()}catch(e){}})}
/* ---------- body composition: weight + muscle mass + body fat ---------- */
Object.assign(EN,{"มวลกล้ามเนื้อ":"Muscle mass","ไขมัน":"Body fat","บันทึกร่างกาย":"Log body","บันทึก":"Save"});
let bodyMetric="kg";
renderBody=function(){const box=document.getElementById("body-card");if(!box)return;const L=BODY.slice().sort((a,b)=>a.d.localeCompare(b.d));
  const lastOf=k=>{for(let i=L.length-1;i>=0;i--)if(L[i][k]!=null)return L[i];return null};
  const M=[["kg","น้ำหนักตัว","kg"],["mm","มวลกล้ามเนื้อ","kg"],["fat","ไขมัน","%"]];
  const tiles=M.map(([k,l,u])=>{const x=lastOf(k),pts=L.filter(q=>q[k]!=null),d=pts.length>1?x[k]-pts[0][k]:null;
    return `<button class="bt" data-bm="${k}" aria-pressed="${bodyMetric===k}"><small>${t(l)}</small><b>${x?x[k]:"–"}<small> ${u}</small></b>${d!=null?`<i class="${(k==="mm"?d>=0:d<=0)?"up":"dn"}">${d>0?"+":""}${Math.round(d*10)/10}</i>`:"<i>&nbsp;</i>"}</button>`}).join("");
  const P=L.filter(q=>q[bodyMetric]!=null);let chart=`<p class="note">${t("ยังไม่มีบันทึก")}</p>`;
  if(P.length>1){const W=300,H=70,v=P.map(x=>x[bodyMetric]),lo=Math.min(...v),hi=Math.max(...v),sp=hi-lo||1,X=i=>i/(P.length-1)*W,Y=k=>H-(k-lo)/sp*(H-10)-5;
    chart=`<svg viewBox="0 0 ${W} ${H}" width="100%" height="${H}"><path d="${P.map((x,i)=>(i?"L":"M")+X(i).toFixed(1)+" "+Y(x[bodyMetric]).toFixed(1)).join(" ")}" fill="none" stroke="var(--series,#4f93f5)" stroke-width="2.5" stroke-linejoin="round"/>${P.map((x,i)=>`<circle cx="${X(i).toFixed(1)}" cy="${Y(x[bodyMetric]).toFixed(1)}" r="3.5" fill="var(--series,#4f93f5)"/>`).join("")}</svg>`}
  box.innerHTML=`<div class="btiles">${tiles}</div>${chart}<button class="btn primary" id="bw-add">+ ${t("บันทึกร่างกาย")}</button>`;
  box.querySelectorAll("[data-bm]").forEach(b=>b.addEventListener("click",()=>{bodyMetric=b.dataset.bm;renderBody()}));
  box.querySelector("#bw-add").addEventListener("click",()=>{PAD.bw={steps:[.1,.5,1,5],def:70,fix:1};PAD.bf={steps:[.1,.5,1],def:15,fix:1};const t0=L.find(x=>x.d===TODAY)||{},l=lastOf("kg")||{},lm=lastOf("mm")||{},lf=lastOf("fat")||{};
    openGen(t("บันทึกร่างกาย")+" · "+thDate(TODAY,{day:"numeric",month:"short"}),`<div class="rm-in"><label>${t("น้ำหนักตัว")} (kg)<input id="b-kg" readonly inputmode="none" data-pad="bw" value="${t0.kg??l.kg??""}"></label><label>${t("มวลกล้ามเนื้อ")} (kg)<input id="b-mm" readonly inputmode="none" data-pad="bw" value="${t0.mm??lm.mm??""}"></label><label>${t("ไขมัน")} (%)<input id="b-fat" readonly inputmode="none" data-pad="bf" value="${t0.fat??lf.fat??""}"></label></div>
      <div class="actions sheet-act"><button class="btn" data-gen-close>${t("ยกเลิก")}</button><button class="btn primary" id="b-save" style="flex:1">✓ ${t("บันทึก")}</button></div>`,b=>{
      b.querySelector("#b-save").addEventListener("click",()=>{const r={d:TODAY};[["kg","#b-kg"],["mm","#b-mm"],["fat","#b-fat"]].forEach(([k,s])=>{const v=Math.round(+b.querySelector(s).value*10)/10;if(v>0)r[k]=v});
        if(Object.keys(r).length<2)return;BODY=BODY.filter(x=>x.d!==TODAY);BODY.push(r);save("body",BODY);document.getElementById("gen-sheet").hidden=true;renderBody();toast("✓")})})})};

document.getElementById("rec-card").addEventListener("click",ev=>{const f=ev.target.closest("[data-fix]");if(f){const x=EXLIB.find(q=>q.n===f.dataset.fix);if(x){openLib();libEdit=x.id;renderLib();setTimeout(()=>{const e=document.querySelector("#lib-list .mus-pick");if(e)e.scrollIntoView({block:"center"})},60)}return}const b=ev.target.closest(".rec-t");if(!b)return;recSel=recSel===b.dataset.m?null:b.dataset.m;renderRecovery()});
Object.assign(EN,{"แตะกล้ามเพื่อดูบนหุ่น":"Tap a muscle to highlight it · set muscles per exercise in Edit workout (💪)"});
