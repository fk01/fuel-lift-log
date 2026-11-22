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
   if(g){g.hidden=!src;if(src){g.querySelector("img").src=src;g.querySelector("figcaption").textContent=up.n}}}
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
