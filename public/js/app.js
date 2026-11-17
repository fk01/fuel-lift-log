// app.js — tabs, renderAll and startup (must load last)
// Classic script: shares globals with the other files in /js (load order is set in index.html).
/* ---------- tabs ---------- */
function show(v){
  document.getElementById("v-food").hidden=v!=="food";document.getElementById("v-gym").hidden=v!=="gym";
  document.querySelectorAll(".tab").forEach(t=>t.setAttribute("aria-selected",t.dataset.v===v));
  document.getElementById("h1").textContent=v==="food"?t("วันนี้กินครบหรือยัง"):t("เวทวันนี้");
}
document.querySelectorAll(".tab").forEach(t=>t.addEventListener("click",()=>{location.hash=t.dataset.v}));
window.addEventListener("hashchange",()=>show(location.hash==="#gym"?"gym":"food"));
function renderAll(){applyStatic();document.getElementById("today-btn").hidden=DAY===TODAY;document.getElementById("save-day").textContent="→ "+new Date(DAY+"T12:00:00").toLocaleDateString(LOC(),{day:"numeric",month:"short",year:"numeric"});document.getElementById("date").textContent=new Date(DAY+"T12:00:00").toLocaleDateString(LOC(),{weekday:"long",day:"numeric",month:"long",year:"numeric"})+(DAY===TODAY?"":" · "+(lang==="th"?"ย้อนหลัง":"Backfill"));updUnitBtn();renderFood();renderGym();show(location.hash==="#gym"?"gym":"food")}
document.getElementById("lang").addEventListener("click",()=>{lang=lang==="th"?"en":"th";try{localStorage.setItem("lang",lang)}catch(e){}renderAll()});
/* ---------- startup ---------- */
pkState();
if("serviceWorker" in navigator){navigator.serviceWorker.register("/sw.js").then(pushState).catch(()=>{})}else{pushState()}
cloudLoad();
autoCommitOld();
document.querySelectorAll("#sessions").forEach(()=>{});
document.getElementById("today-btn").addEventListener("click",()=>{DAY=TODAY;draft.ex={};renderAll()});
renderAll();
