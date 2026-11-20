// app.js — tabs, renderAll and startup (must load last)
// Classic script: shares globals with the other files in /js (load order is set in index.html).
/* ---------- tabs ---------- */
// four screens behind a bottom tab bar (same layout an iOS app would use): food · workout · stats · more
// five screens: วันนี้ (3 questions) · ร่างกาย · กิน · ออกกำลัง · เพิ่มเติม. "body" and "stats" share the stats view (Body / Training pane).
const VIEWS=["home","food","gym","stats","more"],TITLES={home:"แท็บวันนี้",food:"กิน",gym:"ออกกำลัง",stats:"สถิติการฝึก",body:"ร่างกาย",more:"เพิ่มเติม"};
let curView="home",lastMain="gym";
function show(v){const tab=v;if(v==="body"||v==="stats"){stTab=v==="body"?"body":"train";applyStTab();v="stats"}if(!VIEWS.includes(v))v="home";curView=v;if(v==="food"||v==="gym")lastMain=v;
  VIEWS.forEach(x=>document.getElementById("v-"+x).hidden=x!==v);
  document.getElementById("step1").hidden=v!=="gym";document.getElementById("share-last").hidden=v!=="gym";
  const sel=tab;document.querySelectorAll(".tabbar .tab").forEach(b=>b.setAttribute("aria-selected",b.dataset.v===sel));
  document.getElementById("h1").textContent=t(TITLES[tab]||TITLES[v]);scrollAppTop();
  if(v==="food")try{renderFood()}catch(e){}
  if(v==="home")try{renderHome()}catch(e){console.error(e)}
  if(v==="stats")try{renderHistChart();renderStatsExtra();if(stTab==="body")renderRecovery(document.getElementById("rec-body"))}catch(e){}}
const viewOf=()=>location.hash.slice(1)||"home";
document.querySelectorAll(".tabbar .tab").forEach(b=>b.addEventListener("click",()=>{if(location.hash==="#"+b.dataset.v)show(b.dataset.v);else location.hash=b.dataset.v}));
window.addEventListener("hashchange",()=>show(viewOf()));
// week strip: the 7 days of the selected date's week; dot = workout / run / badminton logged
// week strip; tap the date title to expand it into the whole month (and back)
let weekOpen=false,wkMonth=null;
function renderWeek(){const box=document.getElementById("week");if(!box)return;const d0=new Date(DAY+"T12:00:00");const off=(d0.getDay()+6)%7;
  const dt=document.getElementById("date");dt.classList.add("date-tog");dt.setAttribute("aria-expanded",weekOpen);
  let days=[...Array(7)].map((_,i)=>{const d=new Date(d0);d.setDate(d0.getDate()-off+i);return dkey(d)});
  // expanded: show the full calendar (program labels, plan, day summary on tap) in place of the week strip
  box.hidden=weekOpen;const hc=document.getElementById("hdr-cal");if(hc){hc.hidden=!weekOpen;if(weekOpen){if(!wkMonth){calM=DAY;wkMonth=DAY.slice(0,7)}try{renderProgress()}catch(e){}}}
  box.classList.toggle("month",false);let head="";
  if(false){const m=wkMonth||DAY.slice(0,7),[Y,M]=m.split("-").map(Number),first=new Date(Y,M-1,1),lead=(first.getDay()+6)%7,n=new Date(Y,M,0).getDate();
    days=[...Array(lead)].map(()=>null).concat([...Array(n)].map((_,i)=>`${m}-${String(i+1).padStart(2,"0")}`));
    head=`<div class="wk-h"><button class="btn sm" data-mv="-1" aria-label="prev">‹</button><b>${first.toLocaleDateString(LOC(),{month:"long",year:"numeric"})}</b><button class="btn sm" data-mv="1" aria-label="next">›</button></div>`+
      [0,1,2,3,4,5,6].map(i=>`<small class="wk-dow">${new Date(2024,0,1+i).toLocaleDateString(LOC(),{weekday:"narrow"})}</small>`).join("")}
  box.innerHTML=head+days.map(ds=>{if(!ds)return "<span></span>";const d=new Date(ds+"T12:00:00"),tg=(food[ds]||{}).tags||{},did=logs.some(l=>l.date===ds)||cxAny(ds);
    return `<button class="wd${ds===DAY?" sel":""}${ds===TODAY?" today":""}" data-ds="${ds}" ${ds>TODAY?"disabled":""}>${weekOpen?"":`<small>${d.toLocaleDateString(LOC(),{weekday:"narrow"})}</small>`}<b>${d.getDate()}</b><i class="${did?"on":""}"></i></button>`}).join("");
  box.querySelectorAll("[data-ds]").forEach(b=>b.addEventListener("click",()=>{weekOpen=false;wkMonth=null;if(b.dataset.ds===DAY){renderWeek();return}DAY=b.dataset.ds;draft.ex={};picked=false;renderAll()}));
  box.querySelectorAll("[data-mv]").forEach(b=>b.addEventListener("click",()=>{const [y,m]=(wkMonth||DAY.slice(0,7)).split("-").map(Number);wkMonth=dkey(new Date(y,m-1+(+b.dataset.mv),1)).slice(0,7);renderWeek()}))}
document.getElementById("date").addEventListener("click",()=>{weekOpen=!weekOpen;wkMonth=null;renderWeek()});
function renderAll(){applyStatic();try{updMoreLang()}catch(e){}try{renderWeek()}catch(e){}document.getElementById("today-btn").hidden=DAY===TODAY;document.getElementById("save-day").textContent="→ "+new Date(DAY+"T12:00:00").toLocaleDateString(LOC(),{day:"numeric",month:"short",year:"numeric"});document.getElementById("date").textContent=new Date(DAY+"T12:00:00").toLocaleDateString(LOC(),{weekday:"short",day:"numeric",month:"long"})+(DAY===TODAY?"":" · "+(lang==="th"?"ย้อนหลัง":"Backfill"));updUnitBtn();renderFood();renderGym();show(viewOf())}
document.getElementById("lang").addEventListener("click",()=>{lang=lang==="th"?"en":"th";try{localStorage.setItem("lang",lang)}catch(e){}renderAll()});
/* ---------- lock page scroll while a full-screen modal is open (iOS scrolled the page behind it) ---------- */
// iOS resets the page's scroll when overflow is locked/unlocked or the list re-renders: remember it and put it back on close
let modalY=null;(()=>{const sync=()=>{const on=[...document.querySelectorAll(".modal:not(.pad)")].some(m=>!m.hidden),h=document.documentElement,w=appScroll();
  if(on&&!h.classList.contains("modal-open"))modalY=w?w.scrollTop:0;h.classList.toggle("modal-open",on);
  if(!on&&modalY!=null&&w){const y=modalY;modalY=null;const put=()=>{if(Math.abs(w.scrollTop-y)>2&&!scrollReset)w.scrollTop=y};put();requestAnimationFrame(put);setTimeout(put,80)}};
  const mo=new MutationObserver(sync);document.querySelectorAll(".modal").forEach(m=>mo.observe(m,{attributes:true,attributeFilter:["hidden"]}));sync()})();
/* ---------- app height: home-screen iOS can report a viewport shorter than the screen, so size the shell from the screen itself ---------- */
(()=>{const st=navigator.standalone===true||matchMedia("(display-mode: standalone)").matches;document.documentElement.classList.toggle("standalone",st);
  // use the visible height; if iOS already keeps a strip below the web view (home-screen apps), skip our own home-indicator padding
  const fit=()=>{const r=document.documentElement,full=innerHeight>=innerWidth?Math.max(screen.height,screen.width):Math.min(screen.height,screen.width);
    r.style.setProperty("--app-h",innerHeight+"px");r.classList.toggle("reserved-bottom",st&&full-innerHeight>40);};
  fit();addEventListener("resize",fit);addEventListener("orientationchange",()=>setTimeout(fit,300))})();
/* ---------- hide the tab bar while scrolling, show it again when scrolling stops ---------- */
(()=>{const w=document.querySelector(".wrap"),r=document.documentElement;let last=0,tm=null;
  w.addEventListener("scroll",()=>{const y=w.scrollTop,d=y-last;last=y;
    if(y<=10)r.classList.remove("bar-hide");else if(Math.abs(d)>3)r.classList.add("bar-hide");
    clearTimeout(tm);tm=setTimeout(()=>r.classList.remove("bar-hide"),350)},{passive:true})})();
/* ---------- More tab is the one menu: tools, language, sync ---------- */
["v-more","v-stats"].forEach(v=>document.getElementById(v).addEventListener("click",ev=>{const r=ev.target.closest("button[data-act]");if(!r)return;const x=r.dataset.act;
  if(x==="meal")openMealPlan();else if(x==="io"){const b=document.getElementById("io-blk");b.hidden=!b.hidden}else if(x==="pk"){if(ev.target.id!=="pk-add")document.getElementById("pk-add").click()}else if(x==="push"){if(ev.target.id!=="push-on")document.getElementById("push-on").click()}else if(x==="rm")open1RM();else if(x==="badges")openBadges();else if(x==="lang"){document.getElementById("lang").click();updMoreLang()}else if(x==="refresh")doRefresh()}));
function updMoreLang(){const e=document.getElementById("more-lang");if(e)e.textContent=lang==="th"?"ไทย":"English"}
/* ---------- Stats sub-tabs: Training | Body ---------- */
let stTab="train";
function applyStTab(){document.querySelectorAll("#st-tabs [data-st]").forEach(b=>b.setAttribute("aria-pressed",b.dataset.st===stTab));document.querySelectorAll(".st-pane").forEach(p=>p.hidden=p.dataset.pane!==stTab)}
document.getElementById("st-tabs").addEventListener("click",ev=>{const b=ev.target.closest("[data-st]");if(!b)return;stTab=b.dataset.st;try{localStorage.setItem("sttab",stTab)}catch(e){}applyStTab();scrollAppTop();try{renderStatsExtra();renderHistChart()}catch(e){}});
applyStTab();
/* ---------- startup ---------- */
pkState();
if("serviceWorker" in navigator){navigator.serviceWorker.register("/sw.js").then(pushState).catch(()=>{})}else{pushState()}
cloudLoad();
autoCommitOld();
document.querySelectorAll("#sessions").forEach(()=>{});
document.getElementById("today-btn").addEventListener("click",()=>{DAY=TODAY;draft.ex={};renderAll()});
if(ensureLocs()){addSubsToLib(Object.values(PROGS).flatMap(p=>p.ex));save("exlib",EXLIB);saveProgs()}if(ensureV3())saveProgs();if(ensureV4())saveProgs();if(!locById(curLoc))curLoc=LOCS[0].id;cur=draft.prog&&PROGS[draft.prog]?draft.prog:nextProg();
renderAll();
