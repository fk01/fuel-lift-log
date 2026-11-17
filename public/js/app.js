// app.js — tabs, renderAll and startup (must load last)
// Classic script: shares globals with the other files in /js (load order is set in index.html).
/* ---------- tabs ---------- */
// four screens behind a bottom tab bar (same layout an iOS app would use): food · workout · stats · more
const VIEWS=["food","gym","stats","more"],TITLES={food:"วันนี้กินครบหรือยัง",gym:"เวทวันนี้",stats:"สถิติ",more:"เพิ่มเติม"};
let curView="food",lastMain="gym";
function show(v){if(!VIEWS.includes(v))v="food";curView=v;if(v==="food"||v==="gym")lastMain=v;
  VIEWS.forEach(x=>document.getElementById("v-"+x).hidden=x!==v);
  document.getElementById("step1").hidden=!(v==="food"||v==="gym");
  document.querySelectorAll(".tabbar .tab").forEach(b=>b.setAttribute("aria-selected",b.dataset.v===v));
  document.getElementById("h1").textContent=t(TITLES[v]);window.scrollTo(0,0);
  if(v==="stats")try{renderHistChart()}catch(e){}}
const viewOf=()=>location.hash.slice(1)||"food";
document.querySelectorAll(".tabbar .tab").forEach(b=>b.addEventListener("click",()=>{if(location.hash==="#"+b.dataset.v)show(b.dataset.v);else location.hash=b.dataset.v}));
window.addEventListener("hashchange",()=>show(viewOf()));
function renderAll(){applyStatic();document.getElementById("today-btn").hidden=DAY===TODAY;document.getElementById("save-day").textContent="→ "+new Date(DAY+"T12:00:00").toLocaleDateString(LOC(),{day:"numeric",month:"short",year:"numeric"});document.getElementById("date").textContent=new Date(DAY+"T12:00:00").toLocaleDateString(LOC(),{weekday:"long",day:"numeric",month:"long",year:"numeric"})+(DAY===TODAY?"":" · "+(lang==="th"?"ย้อนหลัง":"Backfill"));updUnitBtn();renderFood();renderGym();show(viewOf())}
document.getElementById("lang").addEventListener("click",()=>{lang=lang==="th"?"en":"th";try{localStorage.setItem("lang",lang)}catch(e){}renderAll()});
/* ---------- lock page scroll while a full-screen modal is open (iOS scrolled the page behind it) ---------- */
(()=>{const sync=()=>document.documentElement.classList.toggle("modal-open",[...document.querySelectorAll(".modal:not(.pad)")].some(m=>!m.hidden));
  const mo=new MutationObserver(sync);document.querySelectorAll(".modal").forEach(m=>mo.observe(m,{attributes:true,attributeFilter:["hidden"]}));sync()})();
/* ---------- startup ---------- */
pkState();
if("serviceWorker" in navigator){navigator.serviceWorker.register("/sw.js").then(pushState).catch(()=>{})}else{pushState()}
cloudLoad();
autoCommitOld();
document.querySelectorAll("#sessions").forEach(()=>{});
document.getElementById("today-btn").addEventListener("click",()=>{DAY=TODAY;draft.ex={};renderAll()});
renderAll();
