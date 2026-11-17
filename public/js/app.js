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
  document.getElementById("h1").textContent=t(TITLES[v]);scrollAppTop();
  if(v==="stats")try{renderHistChart()}catch(e){}}
const viewOf=()=>location.hash.slice(1)||"food";
document.querySelectorAll(".tabbar .tab").forEach(b=>b.addEventListener("click",()=>{if(location.hash==="#"+b.dataset.v)show(b.dataset.v);else location.hash=b.dataset.v}));
window.addEventListener("hashchange",()=>show(viewOf()));
// week strip: the 7 days of the selected date's week; dot = workout / run / badminton logged
function renderWeek(){const box=document.getElementById("week");if(!box)return;const d0=new Date(DAY+"T12:00:00");const off=(d0.getDay()+6)%7;
  const days=[...Array(7)].map((_,i)=>{const d=new Date(d0);d.setDate(d0.getDate()-off+i);return dkey(d)});
  box.innerHTML=days.map(ds=>{const d=new Date(ds+"T12:00:00"),tg=(food[ds]||{}).tags||{},did=logs.some(l=>l.date===ds)||tg.run||tg.bad;
    return `<button class="wd${ds===DAY?" sel":""}${ds===TODAY?" today":""}" data-ds="${ds}" ${ds>TODAY?"disabled":""}><small>${d.toLocaleDateString(LOC(),{weekday:"narrow"})}</small><b>${d.getDate()}</b><i class="${did?"on":""}"></i></button>`}).join("");
  box.querySelectorAll("[data-ds]").forEach(b=>b.addEventListener("click",()=>{if(b.dataset.ds===DAY)return;DAY=b.dataset.ds;draft.ex={};picked=false;renderAll()}))}
function renderAll(){applyStatic();try{renderWeek()}catch(e){}document.getElementById("today-btn").hidden=DAY===TODAY;document.getElementById("save-day").textContent="→ "+new Date(DAY+"T12:00:00").toLocaleDateString(LOC(),{day:"numeric",month:"short",year:"numeric"});document.getElementById("date").textContent=new Date(DAY+"T12:00:00").toLocaleDateString(LOC(),{weekday:"short",day:"numeric",month:"long"})+(DAY===TODAY?"":" · "+(lang==="th"?"ย้อนหลัง":"Backfill"));updUnitBtn();renderFood();renderGym();show(viewOf())}
document.getElementById("lang").addEventListener("click",()=>{lang=lang==="th"?"en":"th";try{localStorage.setItem("lang",lang)}catch(e){}renderAll()});
/* ---------- lock page scroll while a full-screen modal is open (iOS scrolled the page behind it) ---------- */
(()=>{const sync=()=>document.documentElement.classList.toggle("modal-open",[...document.querySelectorAll(".modal:not(.pad)")].some(m=>!m.hidden));
  const mo=new MutationObserver(sync);document.querySelectorAll(".modal").forEach(m=>mo.observe(m,{attributes:true,attributeFilter:["hidden"]}));sync()})();
/* ---------- app height: home-screen iOS can report a viewport shorter than the screen, so size the shell from the screen itself ---------- */
(()=>{const st=navigator.standalone===true||matchMedia("(display-mode: standalone)").matches;document.documentElement.classList.toggle("standalone",st);
  const fit=()=>{const portrait=innerHeight>=innerWidth,full=portrait?Math.max(screen.height,screen.width):Math.min(screen.height,screen.width);
    const h=st?Math.max(innerHeight,full):innerHeight;document.documentElement.style.setProperty("--app-h",h+"px")};
  fit();addEventListener("resize",fit);addEventListener("orientationchange",()=>setTimeout(fit,300))})();
/* screen-size readout in More → Data (to tune the shell on real iPhones) */
function vpInfo(){const el=document.getElementById("vpinfo");if(!el)return;const pr=v=>{const d=document.createElement("div");d.style.cssText="position:fixed;left:-9px;top:0;width:1px;height:"+v;document.body.appendChild(d);const h=d.getBoundingClientRect().height;d.remove();return Math.round(h)};
  const sb=(()=>{const d=document.createElement("div");d.style.cssText="position:fixed;left:-9px;width:1px;height:env(safe-area-inset-bottom,0px)";document.body.appendChild(d);const h=d.getBoundingClientRect().height;d.remove();return Math.round(h)})();
  el.textContent=`vp ${innerWidth}×${innerHeight} · vv ${Math.round(visualViewport?visualViewport.height:0)} · scr ${screen.width}×${screen.height} · svh ${pr("100svh")} dvh ${pr("100dvh")} lvh ${pr("100lvh")} · sab ${sb} · app-h ${getComputedStyle(document.documentElement).getPropertyValue("--app-h")} · sa ${document.documentElement.classList.contains("standalone")?1:0}`}
addEventListener("hashchange",()=>{if(location.hash==="#more")vpInfo()});setTimeout(vpInfo,500);
/* ---------- startup ---------- */
pkState();
if("serviceWorker" in navigator){navigator.serviceWorker.register("/sw.js").then(pushState).catch(()=>{})}else{pushState()}
cloudLoad();
autoCommitOld();
document.querySelectorAll("#sessions").forEach(()=>{});
document.getElementById("today-btn").addEventListener("click",()=>{DAY=TODAY;draft.ex={};renderAll()});
renderAll();
