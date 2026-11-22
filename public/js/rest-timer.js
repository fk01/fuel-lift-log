// rest-timer.js — rest countdown between sets
// Classic script: shares globals with the other files in /js (load order is set in index.html).
/* ---------- rest timer ---------- */
let rt={end:0,total:0,iv:null,beeped:false};let actx=null;
function beep(){try{navigator.vibrate&&navigator.vibrate([80,60,80])}catch(_){}try{actx=actx||new (window.AudioContext||window.webkitAudioContext)();[0,.25,.5].forEach(t=>{const o=actx.createOscillator(),g=actx.createGain();o.frequency.value=880;g.gain.value=.15;o.connect(g);g.connect(actx.destination);o.start(actx.currentTime+t);o.stop(actx.currentTime+t+.15)})}catch(e){}try{navigator.vibrate&&navigator.vibrate([200,100,200])}catch(e){}}
function startRest(e,i,rows){
  try{actx=actx||new (window.AudioContext||window.webkitAudioContext)();actx.resume()}catch(_){}
  const secs=restFor(e);
  const ex=sessEx();const k=ex.indexOf(e);
  let next;
  if(i+1<rows.length)next=`<b>${e.n}</b> ${t("เซ็ต")} ${i+2}/${rows.length}${rows[i+1].kg!==""?` · ${toDisp(rows[i+1].kg,e.u)} ${e.u||"kg"}`:""}`;
  else if(ex[k+1]){next=`${t("ท่าถัดไป")} <b>${ex[k+1].n}</b>`;if(typeof goEx==="function"&&woIdx===k)setTimeout(()=>goEx(k+1),400)}
  else next=`<b>${t("ครบทุกท่าแล้ว")}</b>`;
  document.getElementById("rest-next").innerHTML=next;
  {const up=i+1<rows.length?e:(ex[k+1]||e),g=document.getElementById("rest-gif");let src="";try{src=gifOf(EXLIB.find(q=>q.id===up.id)||up)}catch(_){}
   if(g){g.hidden=false;const im=g.querySelector("img");let sv=g.querySelector(".rest-anim");
     if(src){im.hidden=false;im.src=src;if(sv)sv.remove();g.querySelector("figcaption").textContent=up.n}
     else{im.hidden=true;im.removeAttribute("src");if(!sv){g.insertAdjacentHTML("afterbegin",REST_SVG)}g.querySelector("figcaption").textContent=t("หายใจลึกๆ ดื่มน้ำ")+" · "+up.n}}}
  rt={end:Date.now()+secs*1000,total:secs,iv:rt.iv,beeped:false};
  document.getElementById("rest").hidden=false;document.querySelector(".wrap").classList.add("has-rest");
  clearInterval(rt.iv);rt.iv=setInterval(tick,250);tick();
}
function tick(){const left=(rt.end-Date.now())/1000;const el=document.getElementById("rest-time");
  el.textContent=left>0?fmt(left):t("ไปต่อ!");el.classList.toggle("done",left<=0);
  const f=Math.max(0,Math.min(1,left/rt.total));document.getElementById("rest-fill").style.width=(1-f)*100+"%";const rg=document.getElementById("rest-ring");if(rg)rg.style.strokeDashoffset=String(565*(1-f));
  if(left<=0&&!rt.beeped){rt.beeped=true;beep()}
  if(left<-20)stopRest()}
function stopRest(){clearInterval(rt.iv);document.getElementById("rest").hidden=true;document.querySelector(".wrap").classList.remove("has-rest")}
document.getElementById("rest-minus").addEventListener("click",()=>{rt.end-=15000;rt.total=Math.max(15,rt.total-15);tick()});
document.getElementById("rest-plus").addEventListener("click",()=>{rt.end+=15000;rt.total+=15;rt.beeped=false;tick()});
document.getElementById("rest-skip").addEventListener("click",stopRest);
// neon dial: the countdown sits inside the ring
(()=>{const ring=document.querySelector("#rest .rest-ring"),tm=document.getElementById("rest-time");if(!ring||!tm)return;const d=document.createElement("div");d.className="rest-dial";ring.before(d);d.appendChild(ring);d.appendChild(tm)})();

document.getElementById("rest-x")?.addEventListener("click",()=>document.getElementById("rest-skip").click());

/* fallback when the exercise has no gif: a figure sitting on a bench, breathing, sipping water */
const REST_SVG=`<svg class="rest-anim" viewBox="0 0 240 170" role="img" aria-label="rest">
<defs><linearGradient id="ra-g" x1="0" x2="1"><stop offset="0" stop-color="#2ee6ff"/><stop offset="1" stop-color="#3dff8c"/></linearGradient></defs>
<ellipse cx="120" cy="158" rx="90" ry="6" fill="#000" opacity=".35"/>
<g stroke="#5b6b82" stroke-width="6" stroke-linecap="round"><path d="M50 128h140"/><path d="M62 128v28M178 128v28"/></g>
<g class="ra-body" fill="none" stroke="#e8eef7" stroke-width="7" stroke-linecap="round" stroke-linejoin="round">
 <path d="M118 124 L112 82"/>
 <path d="M118 124 L146 126 L150 154"/><path d="M118 124 L136 132 L132 156"/>
 <g class="ra-arm"><path d="M113 92 L132 104 L140 88"/><g class="ra-bottle"><rect x="134" y="66" width="12" height="22" rx="3" fill="url(#ra-g)" stroke="none"/><rect x="137" y="61" width="6" height="6" rx="1" fill="#9fb3c8" stroke="none"/></g></g>
 <path d="M113 92 L98 110 L104 124"/>
</g>
<circle class="ra-head" cx="110" cy="68" r="13" fill="#e8eef7"/>
<path class="ra-towel" d="M100 84 q12 8 24 0" fill="none" stroke="url(#ra-g)" stroke-width="5" stroke-linecap="round"/>
<g class="ra-breath" fill="none" stroke="#2ee6ff" stroke-width="2.5" stroke-linecap="round"><path d="M84 66 q-8 -4 -14 0"/><path d="M82 74 q-10 -2 -18 2"/></g>
<circle class="ra-drop" cx="124" cy="60" r="2.6" fill="#2ee6ff"/>
</svg>`;
Object.assign(EN,{"หายใจลึกๆ ดื่มน้ำ":"Breathe, sip water"});
