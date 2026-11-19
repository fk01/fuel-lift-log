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
  else if(ex[k+1])next=`${t("ท่าถัดไป")} <b>${ex[k+1].n}</b>`;
  else next=`<b>${t("ครบทุกท่าแล้ว")}</b>`;
  document.getElementById("rest-next").innerHTML=next;
  rt={end:Date.now()+secs*1000,total:secs,iv:rt.iv,beeped:false};
  document.getElementById("rest").hidden=false;document.querySelector(".wrap").classList.add("has-rest");
  clearInterval(rt.iv);rt.iv=setInterval(tick,250);tick();
}
function tick(){const left=(rt.end-Date.now())/1000;const el=document.getElementById("rest-time");
  el.textContent=left>0?fmt(left):t("ไปต่อ!");el.classList.toggle("done",left<=0);
  document.getElementById("rest-fill").style.width=Math.max(0,Math.min(100,(1-left/rt.total)*100))+"%";
  if(left<=0&&!rt.beeped){rt.beeped=true;beep()}
  if(left<-20)stopRest()}
function stopRest(){clearInterval(rt.iv);document.getElementById("rest").hidden=true;document.querySelector(".wrap").classList.remove("has-rest")}
document.getElementById("rest-minus").addEventListener("click",()=>{rt.end-=15000;rt.total=Math.max(15,rt.total-15);tick()});
document.getElementById("rest-plus").addEventListener("click",()=>{rt.end+=15000;rt.total+=15;rt.beeped=false;tick()});
document.getElementById("rest-skip").addEventListener("click",stopRest);
