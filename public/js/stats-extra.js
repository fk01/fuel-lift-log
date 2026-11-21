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
      return `<rect x="${X.toFixed(1)}" y="${(H-h).toFixed(1)}" width="${bw.toFixed(1)}" height="${h.toFixed(1)}" rx="${Math.min(4,bw/2)}" fill="${x.v?"var(--series,#2ee6ff)":"var(--line)"}"><title>${Math.round(x.v)} kg</title></rect>${x.lab?`<text x="${(X+bw/2).toFixed(1)}" y="${H+14}" text-anchor="middle" fill="var(--muted)" font-size="10" font-family="var(--f-num)">${x.lab}</text>`:""}`}).join("")}</svg>
    <div class="row-head vol-f"><span>${t("รวม")}</span><b>${Math.round(tot).toLocaleString()} kg</b></div>`;
  box.querySelectorAll("[data-vr]").forEach(c=>c.addEventListener("click",()=>{volRange=c.dataset.vr;renderVolume()}))}
function renderMuscleSets(){const box=document.getElementById("mset-card");if(!box)return;const today=ds2d(TODAY),mon=dkey(addD(today,-((today.getDay()+6)%7)));const n={};
  logs.filter(l=>l.date>=mon&&l.date<=TODAY).forEach(l=>Object.entries(l.ex).forEach(([id,s])=>{const g=groupOf(exOf(id,l));n[g]=(n[g]||0)+s.length}));
  box.innerHTML=`<div class="rings">${Object.entries(SET_TARGET).map(([g,tg])=>{const v=n[g]||0,f=Math.min(1,v/tg),r=26,C=2*Math.PI*r;
    return `<div class="ring"><svg viewBox="0 0 64 64" width="64" height="64"><circle cx="32" cy="32" r="${r}" fill="none" stroke="var(--line)" stroke-width="6"/><circle cx="32" cy="32" r="${r}" fill="none" stroke="${v>=tg?"var(--up)":"var(--series,#2ee6ff)"}" stroke-width="6" stroke-linecap="round" stroke-dasharray="${(C*f).toFixed(1)} ${C.toFixed(1)}" transform="rotate(-90 32 32)"/></svg><span class="ring-fig">${bodySVG(GROUP_MUS[g]||[],[],36)}</span><b>${groupName(g)}</b><small>${v} / ${nU(tg,"เซ็ต")}</small></div>`}).join("")}</div>`}
function renderPRs(){const box=document.getElementById("pr-card");if(!box)return;const e1=s=>Math.max(...s.map(q=>(+q.kg||0)*(1+(+q.reps||0)/30)));
  const cut=dkey(addD(ds2d(TODAY),-30)),rows=[];
  HEAVY.forEach(id=>{const h=logs.filter(l=>l.ex[id]&&l.ex[id].length&&logLoc(l)===curLoc);if(!h.length)return;const recent=h.filter(l=>l.date>=cut),old=h.filter(l=>l.date<cut);
    const now=Math.max(...(recent.length?recent:h).map(l=>e1(l.ex[id]))),was=old.length?Math.max(...old.map(l=>e1(l.ex[id]))):null;
    rows.push({id,n:exName(id),now,d:was==null?null:now-was,sets:h.reduce((a,l)=>a+l.ex[id].length,0),last:h[h.length-1].date})});
  rows.sort((a,b)=>b.last.localeCompare(a.last));
  box.innerHTML=rows.length?rows.slice(0,5).map(r=>{const x={id:r.id,n:r.n};return `<div class="sx-row"><span class="sx-mini">${bodySVG(...musOf(x),44)}</span><span><b>${esc(r.n)}</b><small>${nU(r.sets,"เซ็ต")}${r.d!=null?` · ${t("เทียบ 30 วันก่อน")} <i class="${Math.round(r.d)>0?"up":Math.round(r.d)<0?"dn":""}">${Math.round(r.d)>0?"▲ ":Math.round(r.d)<0?"▼ ":"= "}${Math.abs(Math.round(r.d))} kg</i>`:""}</small></span>${howBtn(x)}<b class="pr-v">${Math.round(r.now)}<small> kg</small></b></div>`}).join(""):emptyBox("bar","ยังไม่มีข้อมูลการฝึก")}
let renderBody;renderBody=function(){const box=document.getElementById("body-card");if(!box)return;const L=BODY.slice().sort((a,b)=>a.d.localeCompare(b.d)),last=L[L.length-1],first=L[0];
  let chart="";if(L.length>1){const W=300,H=70,v=L.map(x=>x.kg),lo=Math.min(...v),hi=Math.max(...v),sp=hi-lo||1,X=i=>i/(L.length-1)*W,Y=k=>H-(k-lo)/sp*(H-10)-5;
    chart=`<svg viewBox="0 0 ${W} ${H}" width="100%" height="${H}"><path d="${L.map((x,i)=>(i?"L":"M")+X(i).toFixed(1)+" "+Y(x.kg).toFixed(1)).join(" ")}" fill="none" stroke="var(--series,#2ee6ff)" stroke-width="2.5" stroke-linejoin="round"/>${L.map((x,i)=>`<circle cx="${X(i).toFixed(1)}" cy="${Y(x.kg).toFixed(1)}" r="3.5" fill="var(--series,#2ee6ff)"/>`).join("")}</svg>`}
  box.innerHTML=`<div class="row-head" style="align-items:center"><span class="vol-h"><small>${last?thDate(last.d,{day:"numeric",month:"short"}):t("ยังไม่มีบันทึก")}</small><b>${last?last.kg:"–"} <small>kg</small>${last&&first&&L.length>1?` <i class="${last.kg<=first.kg?"up":"dn"}" style="font-style:normal;font-size:var(--t-meta)">${last.kg-first.kg>0?"+":""}${(last.kg-first.kg).toFixed(1)}</i>`:""}</b></span>
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
// all 16 muscles always shown, fixed anatomical order; state: 0 never · 1 just trained (≤1d) · 2 recovering (2d) · 3 ready (3–7d) · 4 neglected (>7d)
const REC_ORDER=["chest","delt","rear","traps","lats","bi","tri","fore","abs","obl","glute","quad","ham","add","abd","calf"],NEGLECT=7;
// recovery colour sets (never, <40%, recovering, ready, neglected=ready); picked in More › Settings, stored per device
const REC_PALS={heat:["ความร้อน",["#3a4658","#ff5a4e","#ff9f43","#5ad1ff"]],classic:["ไฟจราจร",["#55606f","#e07a6a","#d9a46c","#7cc47a"]],neon:["นีออน",["#3a4658","#ff4f8b","#ffd23f","#2ee6ff"]],app:["โทนแอป",["#3a4658","#b46bff","#2ee6ff","#3dff8c"]],mono:["ฟ้าไล่ระดับ",["#3a4658","#1e5a8a","#2e9bd6","#7fe3ff"]]};
let recPal=(()=>{try{return localStorage.getItem("recpal")||"heat"}catch(e){return "heat"}})();if(!REC_PALS[recPal])recPal="heat";
const REC_C=[];function applyRecPal(){const c=REC_PALS[recPal][1];REC_C.length=0;REC_C.push(...c,c[3])}applyRecPal();
Object.assign(EN,{"สีการฟื้นตัว":"Recovery colours","ความร้อน":"Heat","ไฟจราจร":"Traffic light","นีออน":"Neon","โทนแอป":"App tones","ฟ้าไล่ระดับ":"Blue scale"});
function openRecPal(){openGen(t("สีการฟื้นตัว"),`<div class="pm-menu">${Object.entries(REC_PALS).map(([k,[n,c]])=>`<button class="menu-row" data-pal="${k}"><span class="pal-dots">${c.map(x=>`<i style="background:${x}"></i>`).join("")}</span><span class="mt"><b>${t(n)}</b><small>${[t("ยังไม่เคยเล่น"),"< 40%",t("กำลังฟื้น"),t("พร้อม")].join(" · ")}</small></span><span class="mc">${k===recPal?"✓":""}</span></button>`).join("")}</div>`,
  b=>b.querySelectorAll("[data-pal]").forEach(r=>r.addEventListener("click",()=>{recPal=r.dataset.pal;try{localStorage.setItem("recpal",recPal)}catch(e){}applyRecPal();openRecPal();try{renderGym();renderStatsExtra();updPalSum()}catch(e){}})))}
function updPalSum(){const e=document.getElementById("pal-sum");if(e)e.textContent=t(REC_PALS[recPal][0])}
Object.assign(EN,{"แท็บวันนี้":"Today","เพิ่ม · แก้อุปกรณ์ · ลบ":"Add · equipment · delete","คาร์ดิโอทำได้ทุกที่":"Cardio works anywhere","เวท: แต่ละที่มีชุดโปรแกรมของตัวเอง":"Weights: each place has its own copy","กล้ามพร้อมแล้ว":"Muscles ready","ดูแผนที่กล้าม":"Muscle map","เพิ่งเล่น":"just trained","แนะนำวันนี้":"Suggested today","เล่นที่ไหน?":"Where?","ใช้ที่นี่":"Use this place","ก๊อปไปที่…":"Copy to…","จัดการสถานที่":"Manage places","ที่อื่นยังไม่มีโปรแกรมนี้":"Other places don't have this program yet","ที่ใหม่":"New place","ฟื้น":"Recovered","พร้อมเต็มที่":"fully ready","พร้อมแล้ว":"Ready","พรุ่งนี้":"Tomorrow","เล่นล่าสุด":"last trained","ยังไม่ฟื้นเต็ม":"not fully recovered","กำลังฟื้น":"Recovering","พร้อม":"Ready","ยังไม่เคยเล่น":"Never","ยังไม่เคย":"Never","ละเลย":"Neglected","ควรเล่น":"Due","ท่าที่เล่นล่าสุด":"Last exercises"});
// recovery %: hours since the last session that hit the muscle ÷ full recovery time (by muscle size, scaled by that session's sets)
const REC_H={chest:72,lats:72,quad:72,ham:72,glute:72,delt:48,rear:48,traps:48,bi:48,tri:48,add:48,abd:48,calf:36,abs:36,obl:36,fore:36};
// per-muscle full-recovery hours: user overrides on top of REC_H (people recover at different speeds); synced in settings
let REC_USER=load("rech",{});const recH=m=>+REC_USER[m]||REC_H[m]||48;
function openRecCfg(){const d={...REC_USER};const H=m=>+d[m]||REC_H[m]||48;
  const draw=b=>{b.querySelector(".rc-cfg").innerHTML=`<small class="note">${t("ชั่วโมงที่กล้ามแต่ละมัดใช้ฟื้นเต็มที่ (หลังเล่นเซ็ตปกติ)")}</small>
    <div class="pm-menu">${REC_ORDER.map(m=>`<div class="menu-row rcf-row"><span class="mt"><b>${t(MUS_NAME[m])}</b><small>${H(m)===REC_H[m]?t("ค่าเริ่มต้น"):t("ค่าเริ่มต้น")+" "+REC_H[m]+" h"}</small></span><span class="qg-sr"><button class="btn sm" data-rh="${m}" data-d="-12">−</button><span class="rcf-v${H(m)!==REC_H[m]?" ch":""}">${H(m)} h</span><button class="btn sm" data-rh="${m}" data-d="12">+</button></span></div>`).join("")}</div>
    <button class="btn ghost" data-rreset>${t("คืนค่าเริ่มต้นทั้งหมด")}</button>
    <div class="actions sheet-act"><button class="btn" data-gen-close>${t("ยกเลิก")}</button><button class="btn primary" data-rsave style="flex:1">✓ ${t("บันทึก")}</button></div>`;
    b.querySelectorAll("[data-rh]").forEach(x=>x.addEventListener("click",()=>{const m=x.dataset.rh,v=Math.max(12,Math.min(168,H(m)+ +x.dataset.d));if(v===REC_H[m])delete d[m];else d[m]=v;draw(b)}));
    b.querySelector("[data-rreset]").addEventListener("click",()=>{Object.keys(d).forEach(k=>delete d[k]);draw(b)});
    b.querySelector("[data-rsave]").addEventListener("click",()=>{REC_USER=d;save("rech",REC_USER);if(typeof markDirty==="function")markDirty("progs");closeGen();try{renderRecovery(document.getElementById("rec-body"));renderGym()}catch(e){}toast("✓ "+t("บันทึกแล้ว"))})};
  openGen(t("เวลาฟื้นตัวของกล้าม"),`<div class="rc-cfg stack" style="gap:10px"></div>`,draw)}
Object.assign(EN,{"เวลาฟื้นตัวของกล้าม":"Recovery time per muscle","ชั่วโมงที่กล้ามแต่ละมัดใช้ฟื้นเต็มที่ (หลังเล่นเซ็ตปกติ)":"Hours each muscle needs to fully recover (after a normal session)","ค่าเริ่มต้น":"Default","คืนค่าเริ่มต้นทั้งหมด":"Reset all to default","ตั้งเวลาฟื้นตัว":"Recovery times"});
function recPct(){const out={};logs.forEach(l=>{if(l.date>TODAY)return;const t0=l.at||new Date(l.date+"T20:00:00").getTime(),sets={};
    Object.entries(l.ex).forEach(([id,s])=>{const [p,sc]=musOf(exOf(id,l));p.forEach(m=>sets[m]=(sets[m]||0)+s.length);sc.forEach(m=>sets[m]=(sets[m]||0)+s.length*.5)});
    Object.entries(sets).forEach(([m,n])=>{if(!out[m]||out[m].t0<t0)out[m]={t0,n}})});
  const now=Date.now();Object.entries(out).forEach(([m,o])=>{const H=recH(m)*(o.n<=4?.75:o.n>10?1.25:1)*36e5;o.ready=o.t0+H;o.pct=Math.max(0,Math.min(100,Math.round((now-o.t0)/H*100)));o.days=Math.floor((now-o.t0)/864e5)});return out}
const recState=o=>!o?0:o.days>NEGLECT?4:o.pct>=100?3:o.pct<40?1:2;
// best weights program here for today: highest mean readiness of its primary muscles (never trained = ready)
function recSuggest(){const R=recPct(),sc=k=>{const ms=[...new Set(PROGS[k].ex.flatMap(e=>musOf(exOf(e.id))[0]))];if(!ms.length)return -1;return ms.reduce((a,m)=>a+(R[m]?Math.min(100,R[m].pct):100),0)/ms.length};
  let best=null,bs=-1;weightsHere().forEach(k=>{const s=sc(k);if(s>bs){bs=s;best=k}});return best?[best,Math.round(bs)]:null}
function renderRecCompact(box){const R=recPct(),g={3:[],2:[],1:[],0:[]};REC_ORDER.forEach(m=>{const s=recState(R[m]);g[s===4||s===0?3:s].push(m)});
  const chip=(m,s)=>`<button class="rc-chip s${s}" data-m="${m}" style="--c:${REC_C[s]}">${t(MUS_NAME[m])}${s===2?` · ${R[m].pct}%`:s===1?` · ${t("เพิ่งเล่น")}`:""}</button>`,sug=recSuggest();
  box.innerHTML=`<div class="rc-h"><b>${licon("dumbbell")} ${t("กล้ามพร้อมแล้ว")}</b><button class="rc-map" data-recmap>${t("ดูแผนที่กล้าม")} ›</button></div>
    <div class="rc-chips">${[...g[1].map(m=>chip(m,1)),...g[2].map(m=>chip(m,2)),...g[3].slice(0,6).map(m=>chip(m,3))].join("")}${g[3].length>6?`<span class="rc-more">+${g[3].length-6} ${t("พร้อม")}</span>`:""}</div>
`;
  box.querySelector("[data-recmap]").addEventListener("click",ev=>{ev.stopPropagation();openGen(t("การฟื้นตัวของกล้ามเนื้อ"),`<div class="card" id="rec-full"></div>`,b=>{renderRecovery(b.querySelector("#rec-full"));b.querySelector("#rec-full").addEventListener("click",e=>{const x=e.target.closest(".rec-t");if(x)openMuscle(x.dataset.m)})})})}
function renderRecovery(full){const box=full||document.getElementById("rec-card");if(!box)return;if(!full&&box.closest(".rec-slot"))return renderRecCompact(box);const R=recPct();
  const state=o=>recState(o),ago=m=>R[m];
  const lab=m=>{const o=R[m];return !o?"–":o.pct<40?t("เพิ่งเล่น"):o.pct+"%"},sub=m=>{const o=R[m];return !o?t("ยังไม่เคย"):o.days>NEGLECT?nU(o.days,"วันก่อน"):""};
  const due=REC_ORDER.filter(m=>{const s=state(ago(m));return s===0||s===4});
  const tiles=REC_ORDER.map(m=>{const o=R[m],s=state(o),w=!o?0:s===4?100:o.pct;return `<button class="rec-t s${s}" data-m="${m}"><b>${t(MUS_NAME[m])}</b><span class="rec-p">${lab(m)}</span><small class="rec-sub">${sub(m)||"&nbsp;"}</small><i class="rec-bar"><i style="width:${w}%;background:${REC_C[s]}"></i></i></button>`}).join("");
  box.innerHTML=`<div class="rec-fig">${bodySVG([],[],320,m=>REC_C[state(ago(m))])}</div>
    <div class="rec-grid">${tiles}</div>
    <div class="rec-leg">${[[1,"< 40%"],[2,"กำลังฟื้น"],[3,"พร้อม"],[0,"ยังไม่เคยเล่น"]].map(([k,l])=>`<span><i style="background:${REC_C[k]}"></i>${t(l)}</span>`).join("")}</div>`}
/* ---------- generic bottom sheet ---------- */
// sheet stack: a sheet opened from another sheet remembers it; ✕ / backdrop / Cancel go back ONE level (not to the page).
// Same title = re-render (replace). Re-opening a title that is lower in the stack returns to it. closeGen() closes everything.
const GEN_STACK=[];let genTitle="";
function openGen(title,html,after){const sh=document.getElementById("gen-sheet"),body=document.getElementById("gen-body");
  if(!sh.hidden&&genTitle&&title!==genTitle){const j=GEN_STACK.findIndex(x=>x.title===title);if(j>=0)GEN_STACK.length=j;else{const f=document.createDocumentFragment();while(body.firstChild)f.appendChild(body.firstChild);GEN_STACK.push({title:genTitle,frag:f})}}
  else if(sh.hidden)GEN_STACK.length=0;
  genTitle=title;body.innerHTML=`<div class="sheet-h has-x"><b>${title}</b><button class="sh-x" data-gen-close aria-label="${t("ปิด")}">✕</button></div>${html}`;sh.hidden=false;if(after)after(body)}
function genBack(){const sh=document.getElementById("gen-sheet"),body=document.getElementById("gen-body"),p=GEN_STACK.pop();
  if(!p){sh.hidden=true;genTitle="";return}body.innerHTML="";body.appendChild(p.frag);genTitle=p.title;sh.hidden=false}
document.getElementById("gen-sheet").addEventListener("click",ev=>{if(ev.target.id==="gen-sheet"||ev.target.closest("[data-gen-close]"))genBack()});
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
let bodyMetric="kg",openBodyLog=null;   // body log sheet, exposed so Today can open it
let bodyRange=90,bodyGoal=(()=>{try{return +localStorage.getItem("bodygoal")||0}catch(e){return 0}})();
Object.assign(EN,{"เป้าหมาย":"Goal","ตั้งเป้า":"Set goal","อีก":"to go","ถึงเป้าแล้ว 🎉":"Goal reached 🎉","7 วัน":"7 days","30 วัน":"30 days","ต่อสัปดาห์":"per week","ประวัติ":"History","วันที่":"Date","ลบ":"Delete","แก้":"Edit","ใส่ค่า":"Enter value","สูงสุด":"High","ต่ำสุด":"Low","เพิ่มบันทึก":"Add entry"});
renderBody=function(){const box=document.getElementById("body-card");if(!box)return;const L=BODY.slice().sort((a,b)=>a.d.localeCompare(b.d));
  const lastOf=k=>{for(let i=L.length-1;i>=0;i--)if(L[i][k]!=null)return L[i];return null};
  const M=[["kg","น้ำหนักตัว","kg"],["mm","มวลกล้ามเนื้อ","kg"],["fat","ไขมัน","%"]],U=M.find(m=>m[0]===bodyMetric)[2];
  const tiles=M.map(([k,l,u])=>{const x=lastOf(k);return `<button class="bt" data-bm="${k}" aria-pressed="${bodyMetric===k}"><small>${t(l)}</small><b>${x?x[k]:"–"}<small> ${u}</small></b></button>`}).join("");
  const all=L.filter(q=>q[bodyMetric]!=null),cut=bodyRange?dkey(addD(ds2d(TODAY),-bodyRange)):"",P=all.filter(q=>q.d>=cut);
  // change over 7 / 30 days and average weekly rate
  const last=all[all.length-1],at=n=>{const c=dkey(addD(ds2d(TODAY),-n));let r=null;all.forEach(q=>{if(q.d<=c)r=q});return r};
  const dlt=n=>{const o=at(n);return last&&o&&o!==last?Math.round((last[bodyMetric]-o[bodyMetric])*10)/10:null};
  const wk=all.length>1?Math.round((last[bodyMetric]-all[0][bodyMetric])/Math.max(1,(ds2d(last.d)-ds2d(all[0].d))/6048e5)*100)/100:null;
  const good=v=>bodyMetric==="mm"?v>=0:v<=0,fmtD=v=>v==null?"–":`<i class="${v===0?"":good(v)?"up":"dn"}">${v>0?"+":""}${v}</i>`;
  let chart=emptyBox('scale','ยังไม่มีบันทึกร่างกาย','กด + บันทึกร่างกาย เพื่อเริ่ม');
  if(P.length){const W=320,H=140,PL=34,PB=18,v=P.map(x=>x[bodyMetric]);if(bodyMetric==="kg"&&bodyGoal)v.push(bodyGoal);
    let lo=Math.min(...v),hi=Math.max(...v);const pad=(hi-lo)*.15||1;lo-=pad;hi+=pad;
    const t0=ds2d(P[0].d).getTime(),t1=Math.max(t0+864e5,ds2d(P[P.length-1].d).getTime());
    const X=q=>PL+(ds2d(q.d).getTime()-t0)/(t1-t0)*(W-PL-6),Y=k=>6+(hi-k)/(hi-lo)*(H-PB-6);
    const ticks=[hi-pad,(hi+lo)/2,lo+pad].map(k=>`<line x1="${PL}" x2="${W}" y1="${Y(k)}" y2="${Y(k)}" stroke="var(--line)"/><text x="${PL-4}" y="${Y(k)+3}" text-anchor="end" font-size="9" fill="var(--muted)" font-family="var(--f-num)">${Math.round(k*10)/10}</text>`).join("");
    const goal=bodyMetric==="kg"&&bodyGoal?`<line x1="${PL}" x2="${W}" y1="${Y(bodyGoal)}" y2="${Y(bodyGoal)}" stroke="var(--up)" stroke-dasharray="4 4"/><text x="${W-2}" y="${Y(bodyGoal)-4}" text-anchor="end" font-size="9" fill="var(--up)">${t("เป้าหมาย")} ${bodyGoal}</text>`:"";
    const path=P.map((q,i)=>(i?"L":"M")+X(q).toFixed(1)+" "+Y(q[bodyMetric]).toFixed(1)).join(" ");
    const area=P.length>1?`<path d="${path} L${X(P[P.length-1]).toFixed(1)} ${H-PB} L${X(P[0]).toFixed(1)} ${H-PB}Z" fill="url(#bg)" />`:"";
    chart=`<svg viewBox="0 0 ${W} ${H}" width="100%" role="img" aria-label="trend"><defs><linearGradient id="bg" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#2ee6ff" stop-opacity=".35"/><stop offset="1" stop-color="#2ee6ff" stop-opacity="0"/></linearGradient></defs>${ticks}${goal}${area}
      <path d="${path}" fill="none" stroke="var(--series,#2ee6ff)" stroke-width="2.5" stroke-linejoin="round"/>${P.map(q=>`<circle cx="${X(q).toFixed(1)}" cy="${Y(q[bodyMetric]).toFixed(1)}" r="3.5" fill="var(--series,#2ee6ff)"><title>${q.d}: ${q[bodyMetric]}</title></circle>`).join("")}
      ${(()=>{const lv=P.map(q=>q[bodyMetric]),mx=Math.max(...lv),mn=Math.min(...lv),qm=P.find(q=>q[bodyMetric]===mx),qn=P.find(q=>q[bodyMetric]===mn),ql=P[P.length-1];
        const lab=(q,txt,dy,anc)=>`<text x="${Math.min(W-2,Math.max(PL+2,X(q))).toFixed(1)}" y="${(Y(q[bodyMetric])+dy).toFixed(1)}" text-anchor="${anc}" font-size="10" fill="var(--fg)" font-family="var(--f-num)">${txt}</text>`;
        return `<circle cx="${X(ql).toFixed(1)}" cy="${Y(ql[bodyMetric]).toFixed(1)}" r="6" fill="var(--fg)"/>`+(P.length>2&&qm!==ql?lab(qm,t("สูงสุด")+" "+mx,-8,"start"):"")+(P.length>2&&qn!==ql&&qn!==qm?lab(qn,t("ต่ำสุด")+" "+mn,16,"middle"):"")+`<text x="${(X(ql)-10).toFixed(1)}" y="${(Y(ql[bodyMetric])+18).toFixed(1)}" text-anchor="end" font-size="11" font-weight="600" fill="var(--fg)" font-family="var(--f-num)">${ql[bodyMetric]} ${U}</text>`})()}
      <text x="${PL}" y="${H-4}" font-size="9" fill="var(--muted)" font-family="var(--f-num)">${thDate(P[0].d,{day:"numeric",month:"short"})}</text><text x="${W}" y="${H-4}" text-anchor="end" font-size="9" fill="var(--muted)" font-family="var(--f-num)">${thDate(P[P.length-1].d,{day:"numeric",month:"short"})}</text></svg>`}
  const goalTxt=bodyMetric==="kg"&&bodyGoal&&last?(Math.abs(last.kg-bodyGoal)<.05?t("ถึงเป้าแล้ว 🎉"):`${t("อีก")} ${Math.round(Math.abs(last.kg-bodyGoal)*10)/10} kg`):"";
  box.innerHTML=`<div class="card-h"><b>${t("น้ำหนักตัว")}</b><button class="btn primary sm" id="bw-add">+ ${t("เพิ่มบันทึก")}</button></div>
    <div class="btiles">${tiles}</div>
    <div class="bline"><span>${t("7 วัน")} ${fmtD(dlt(7))}</span><span>${t("30 วัน")} ${fmtD(dlt(30))}</span><span>${t("ต่อสัปดาห์")} ${fmtD(wk)}</span>${bodyMetric==="kg"?`<button class="bgoal" id="b-goal">${t("เป้าหมาย")} <b>${bodyGoal||"–"}</b> <em>${goalTxt||t("ตั้งเป้า")}</em></button>`:""}</div>
    <div class="segc" role="tablist">${[[30,"1 เดือน"],[90,"3 เดือน"],[365,"1 ปี"],[0,"ทั้งหมด"]].map(([k,l])=>`<button class="chip" data-br="${k}" aria-pressed="${bodyRange===k}">${t(l)}</button>`).join("")}</div>
    ${chart}
    ${L.length?`<details class="log"><summary>${t("ประวัติ")} (${L.length})</summary><table class="btab"><tr><th>${t("วันที่")}</th><th>kg</th><th>${t("มวลกล้ามเนื้อ")}</th><th>%</th><th></th></tr>${L.slice().reverse().map(q=>`<tr><td>${thDate(q.d,{day:"numeric",month:"short",year:"2-digit"})}</td><td>${q.kg??"–"}</td><td>${q.mm??"–"}</td><td>${q.fat??"–"}</td><td><button class="btn sm" data-bed="${q.d}">✎</button></td></tr>`).join("")}</table></details>`:""}`;
  box.querySelectorAll("[data-bm]").forEach(b=>b.addEventListener("click",()=>{bodyMetric=b.dataset.bm;renderBody()}));
  box.querySelectorAll("[data-br]").forEach(b=>b.addEventListener("click",()=>{bodyRange=+b.dataset.br;renderBody()}));
  box.querySelector("#b-goal")?.addEventListener("click",()=>{PAD.bg={steps:[.1,.5,1,5],def:last?Math.round(last.kg):70,fix:1};const i=document.createElement("input");i.dataset.pad="bg";i.value=bodyGoal||"";i.setAttribute("aria-label",t("เป้าหมาย"));
    i.addEventListener("change",()=>{bodyGoal=Math.round(+i.value*10)/10||0;try{localStorage.setItem("bodygoal",bodyGoal)}catch(e){}renderBody()});openPad(i)});
  const openLog=ds=>{PAD.bw={steps:[.1,.5,1,5],def:70,fix:1};PAD.bf={steps:[.1,.5,1],def:15,fix:1};const t0=L.find(x=>x.d===ds)||{},l=lastOf("kg")||{},lm=lastOf("mm")||{},lf=lastOf("fat")||{};
    const prev=(k)=>{const a=L.filter(x=>x[k]!=null&&x.d<ds);return a.length?a[a.length-1][k]:null};
    const row=(k,id,lab,u,pad,v,def)=>`<div class="bstep-row"><div class="row-head"><span>${t(lab)} (${u})</span><small class="bdiff" data-diff="${k}"></small></div>
      <div class="bstep"><button class="bst" data-st="-" data-for="${id}" aria-label="−0.1">−</button><input id="${id}" readonly inputmode="none" data-pad="${pad}" data-k="${k}" data-def="${def}" value="${v??""}" placeholder="${t("ใส่ค่า")}" aria-label="${t(lab)}"><button class="bst" data-st="+" data-for="${id}" aria-label="+0.1">+</button></div></div>`;
    openGen(t("บันทึกร่างกาย"),`<label class="rm-in" style="grid-template-columns:1fr"><label>${t("วันที่")}<input id="b-d" type="date" value="${ds}" max="${TODAY}"></label></label>
      ${row("kg","b-kg","น้ำหนักตัว","kg","bw",t0.kg??l.kg,70)}${row("mm","b-mm","มวลกล้ามเนื้อ","kg","bw",t0.mm??lm.mm,30)}${row("fat","b-fat","ไขมัน","%","bf",t0.fat??lf.fat,15)}
      <div class="actions sheet-act">${L.some(x=>x.d===ds)?`<button class="btn ghost" id="b-del">${t("ลบ")}</button>`:""}<button class="btn primary" id="b-save" style="flex:1">✓ ${t("บันทึก")}</button></div>`,b=>{
      const touched=new Set(Object.keys(t0).filter(k=>k!=="d"));
      const diff=()=>b.querySelectorAll("[data-diff]").forEach(el=>{const k=el.dataset.diff,inp=b.querySelector(`[data-k="${k}"]`),v=+inp.value,p=prev(k);
        if(!inp.value||p==null){el.textContent="";return}const d=Math.round((v-p)*10)/10,good=k==="mm"?d>=0:d<=0;el.textContent=d===0?"—":(d>0?"▲":"▼")+Math.abs(d);el.className="bdiff "+(d===0?"":good?"up":"dn")});
      const step=(inp,dir,big)=>{const v=inp.value===""?+inp.dataset.def:+inp.value;inp.value=Math.max(0,Math.round((v+dir*(big?.5:.1))*10)/10).toFixed(1);touched.add(inp.dataset.k);diff();try{navigator.vibrate&&navigator.vibrate(5)}catch(e){}};
      b.querySelectorAll("[data-st]").forEach(btn=>{const inp=b.querySelector("#"+btn.dataset.for),dir=btn.dataset.st==="+"?1:-1;let tm=null,iv=null,t0h=0;
        const stop=()=>{clearTimeout(tm);clearInterval(iv);tm=iv=null};
        btn.addEventListener("pointerdown",ev=>{ev.preventDefault();step(inp,dir);t0h=Date.now();tm=setTimeout(()=>{iv=setInterval(()=>step(inp,dir,Date.now()-t0h>1500),80)},400)});
        ["pointerup","pointerleave","pointercancel"].forEach(e=>btn.addEventListener(e,stop));
        btn.addEventListener("keydown",ev=>{if(ev.key==="Enter"||ev.key===" "){ev.preventDefault();step(inp,dir)}})});
      b.querySelectorAll("[data-k]").forEach(i=>i.addEventListener("change",()=>{touched.add(i.dataset.k);diff()}));diff();
      b.querySelector("#b-del")?.addEventListener("click",()=>{BODY=BODY.filter(x=>x.d!==ds);save("body",BODY);document.getElementById("gen-sheet").hidden=true;renderBody();if(typeof renderHome==="function")renderHome()});
      b.querySelector("#b-save").addEventListener("click",()=>{const d=b.querySelector("#b-d").value||TODAY;if(d>TODAY)return;const r={d};
        if(!touched.size)touched.add("kg");
        [["kg","#b-kg"],["mm","#b-mm"],["fat","#b-fat"]].forEach(([k,sel])=>{if(!touched.has(k))return;const v=Math.round(+b.querySelector(sel).value*10)/10;if(v>0)r[k]=v});
        if(Object.keys(r).length<2)return;BODY=BODY.filter(x=>x.d!==ds&&x.d!==d);BODY.push(r);save("body",BODY);document.getElementById("gen-sheet").hidden=true;renderBody();if(typeof renderHome==="function")renderHome();toast("✓")})})};
  openBodyLog=openLog;
  box.querySelector("#bw-add").addEventListener("click",()=>openLog(TODAY));
  box.querySelectorAll("[data-bed]").forEach(b=>b.addEventListener("click",()=>openLog(b.dataset.bed)))};

document.getElementById("rec-card").addEventListener("click",ev=>{const b=ev.target.closest(".rec-t,.rc-chip");if(b)openMuscle(b.dataset.m)});
/* ---------- muscle sheet: big figure, status, recent exercises that hit it, program exercises that train it ---------- */
Object.assign(EN,{"ท่าที่เล่นล่าสุด":"Recent exercises","ท่าที่ช่วยมัดนี้ในโปรแกรม":"In your programs","หลัก":"primary","รอง":"secondary","ยังไม่มีท่าในโปรแกรมที่โดนมัดนี้":"No program exercise works this muscle yet","เพิ่มท่าได้ที่ จัดการโปรแกรม":"Add one in Manage programs"});
function openMuscle(m){const lt=lastTrained(),d=lt[m]?Math.round((ds2d(TODAY)-ds2d(lt[m]))/864e5):null,ro=recPct()[m],st=recState(ro);
  const rdy=ro&&ro.pct<100?new Date(ro.ready):null,rdyTxt=rdy?(dkey(rdy)===TODAY?t("วันนี้"):dkey(rdy)===dkey(new Date(Date.now()+864e5))?t("พรุ่งนี้"):rdy.toLocaleDateString(LOC(),{weekday:"short"}))+" "+rdy.toLocaleTimeString(LOC(),{hour:"2-digit",minute:"2-digit"}):"";
  const stTxt=!ro?t("ยังไม่เคยเล่น"):st===4?t("ละเลย"):ro.pct>=100?t("พร้อมแล้ว"):`${t("ฟื้น")} ${ro.pct}% · ${t("พร้อมเต็มที่")} ${rdyTxt}`;
  // recent: latest session of each exercise whose primary (or secondary) muscles include m
  const seen={};for(let i=logs.length-1;i>=0;i--){const l=logs[i];if(l.date>TODAY)continue;Object.entries(l.ex).forEach(([id,sets])=>{if(seen[id]||!sets.length)return;const x=exOf(id,l),[p,sc]=musOf(x);
    if(p.includes(m)||sc.includes(m))seen[id]={x,l,sets,role:p.includes(m)?"หลัก":"รอง"}})}
  const rec=Object.values(seen).sort((a,b)=>b.l.date.localeCompare(a.l.date)).slice(0,6);
  const prog=[];weightsHere().map(k=>[k,PROGS[k]]).forEach(([k,P])=>P.ex.forEach(e=>{const [p,sc]=musOf(e);if(p.includes(m)||sc.includes(m)){const o=prog.find(q=>q.e.id===e.id);if(o)o.ps.push(P.name);else prog.push({e,ps:[P.name],role:p.includes(m)?"หลัก":"รอง"})}}));
  prog.sort((a,b)=>(a.role==="หลัก"?0:1)-(b.role==="หลัก"?0:1));
  const row=(x,top,sub,role)=>{return `<div class="sx-row"><span class="sx-mini">${bodySVG(...musOf(x),44)}</span><span><b>${esc(x.n)}</b><small>${top}</small>${sub?`<small>${sub}</small>`:""}</span>${howBtn(x)}<i class="mrole ${role==="หลัก"?"p":""}">${t(role)}</i></div>`};
  const best=s=>s.reduce((a,q)=>(+q.kg||0)>(+a.kg||0)?q:a,s[0]);
  openGen(`<span class="msh-h">${t(MUS_NAME[m])}</span>`,`<div class="msh-st" style="color:${REC_C[st]}"><i style="background:${REC_C[st]}"></i>${stTxt}${d!=null&&(!ro||ro.pct>=100||st===4)?` · ${t("เล่นล่าสุด")} ${d===0?t("วันนี้"):nU(d,"วันก่อน")}`:""}</div>${ro&&st!==4?`<i class="rec-bar big"><i style="width:${ro.pct}%;background:${REC_C[st]}"></i></i>`:""}
    <div class="msh-fig">${bodySVG(m==="none"?[]:[m],[],220,q=>q===m?REC_C[st===0?4:st]:null)}</div>
    ${rec.length?`<div class="sec-t" style="font-size:var(--t-md)">${t("ท่าที่เล่นล่าสุด")}</div><div class="sx">${rec.map(o=>{const u=uOf(o.x.id),b=best(o.sets);return row(o.x,`${o.sets.length} × ${toDisp(b.kg,u)} ${u} · ${b.reps} ${t("ครั้ง")}`,thDate(o.l.date,{weekday:"short",day:"numeric",month:"short"}),o.role)}).join("")}</div>`:""}
    <div class="sec-t" style="font-size:var(--t-md)">${t("ท่าที่ช่วยมัดนี้ในโปรแกรม")}</div>
    ${prog.length?`<div class="sx">${prog.map(o=>row(o.e,o.ps.join(", "),"",o.role)).join("")}</div>`:emptyBox("bar","ยังไม่มีท่าในโปรแกรมที่โดนมัดนี้","เพิ่มท่าได้ที่ จัดการโปรแกรม")}
    <button class="btn" data-gen-close>${t("ปิด")}</button>`)}
Object.assign(EN,{"แตะกล้ามเพื่อดูบนหุ่น":"Tap a muscle to highlight it · set muscles per exercise in Edit workout (💪)"});

setInterval(()=>{try{if(!document.getElementById("v-stats").hidden)renderRecovery()}catch(e){}},3e5);
document.getElementById("pal-open")?.addEventListener("click",openRecPal);setTimeout(updPalSum,0);
