// workout.js — set logging, session history, saving a workout
// Classic script: shares globals with the other files in /js (load order is set in index.html).
// exercises of the running session: the program's list plus anything added during the workout (draft.extra)
const sessEx=()=>(PROGS[cur]?PROGS[cur].ex:[]).concat(draft.extra||[]);
let foldPref={};   // manual fold/unfold per exercise id; without one, a card folds once every set is ticked
const altName=id=>(EXLIB.find(q=>q.id===id)||{}).n||(exName(id)!==id?exName(id):"");
function renderEx(){
  const box=document.getElementById("exs");box.innerHTML="";
  if(editing){renderEdit(box);return}
  draft.ex=draft.ex||{};
  if(picked&&!editing){const n=document.createElement("input");n.className="note-in";n.placeholder=t("โน้ตวันนี้…");n.value=draft.note||"";n.addEventListener("input",()=>{draft.note=n.value;save("gymdraft",draft)});box.appendChild(n)}
  (editing?PROGS[cur].ex:sessEx()).forEach((e,ei)=>{if(e.id===editId){editCard(box,e,ei);return}
    const last=lastFor(e.id);const u=e.u||"kg";
    const rows=draft.ex[e.id]||(draft.ex[e.id]=Array.from({length:e.s},(_,i)=>({kg:last?.sets[i]?.kg??"",reps:"",ok:false})));
    const hitAll=last&&last.sets.length>=e.s&&last.sets.every(s=>+s.reps>=+(e.r.split("-")[1]||e.r));
    const card=document.createElement("div");card.className="ex";
    let lastTxt=last?`${t("ล่าสุด")} ${thDate(last.date,{day:"numeric",month:"short"})}: ${last.sets.map(s=>`${toDisp(s.kg,u)}×${s.reps}`).join(" · ")} ${u}`:t("ยังไม่มีประวัติ");
    if(hitAll)lastTxt+=` <span class="up">↑ ${t("ลอง")} ${u==="kg"?"+2.5 kg":"+5 lb"}</span>`;
    const th=gifOf(e),e1=last?Math.round(Math.max(...last.sets.map(q=>(+q.kg||0)*(1+(+q.reps||0)/30)))*(u==="lb"?LB:1)):0;
    card.innerHTML=`<div class="row-head"><span class="ex-name" data-fold role="button" tabindex="0" aria-label="${t("ย่อ/ขยาย")} ${esc(e.n)}" style="display:flex;gap:8px;align-items:center;cursor:pointer"><span class="fold-i"></span>${howBtn(e)}<span>${e.z} ${e.n}${safeUrl(e.link)?` <a href="${esc(safeUrl(e.link))}" target="_blank" rel="noopener" style="color:var(--up);font-size:.8rem;white-space:nowrap">▶ ${t("ดูวิธีเล่น")}</a>`:""}</span></span><span style="display:flex;gap:8px;align-items:center"><span class="macro">${e.s} × ${e.r}${HEAVY.includes(e.id)?` · ${t("วอม")}`:""} · <b style="color:var(--fg)">${u}</b></span>${e.alt&&altName(e.alt)?`<button class="btn sm" data-alt>⇄ ${esc(altName(e.alt))}</button>`:""}<button class="btn sm" data-edit aria-label="${t("แก้ไข")} ${esc(e.n)}">✎ ${t("แก้ไข")}</button></span></div>
      <div class="last fold-sum"></div>
      <div class="row-head"><div class="last">${lastTxt}</div><div class="restset">⏱ <button data-rm-rest aria-label="− ${e.n}">−</button><b>${fmt(restFor(e))}</b><button data-add-rest aria-label="+ ${e.n}">+</button></div></div>
      ${HEAVY.includes(e.id)?`<div class="zone">${t("วอม")}: 50% × 8 · 75% × 3</div>`:""}
      <div class="sets"><span class="h">${t("เซ็ต")}</span><button class="h" data-unit aria-label="${t("หน่วย")} ${e.n}" style="border:1px solid var(--line);background:none;color:var(--fg);border-radius:999px;font-family:var(--f-num);font-size:.72rem;cursor:pointer;padding:2px 0">${u} ⇄</button><span class="h">${t("ครั้ง")}</span><span class="h">✓</span>
      ${rows.map((r,i)=>`<span class="n">${i+1}</span><input type="number" readonly inputmode="none" data-pad="kg" id="kg-${e.id}-${i}" value="${toDisp(r.kg,u)}" placeholder="${u}" aria-label="${e.n} ${i+1} weight"><input type="number" readonly inputmode="none" data-pad="reps" id="rp-${e.id}-${i}" value="${r.reps}" placeholder="${e.r}" aria-label="${e.n} ${i+1} reps"><input type="checkbox" id="ok-${e.id}-${i}" ${r.ok?"checked":""} aria-label="${i+1} done">`).join("")}
      </div>
      <input class="memo" data-memo placeholder="${t("เมโม…")}" value="${esc((draft.memo||{})[e.id]||"")}">
      <div class="actions"><button class="btn sm" data-add>+ ${t("เซ็ต")}</button>${(draft.extra||[]).includes(e)?`<button class="btn sm ghost" data-unextra>✕ ${t("เอาท่าออก")}</button>`:""}${last?`<button class="btn sm" data-load>↺ ${t("ใช้ค่าครั้งก่อน")}</button>`:""}<button class="btn sm" data-all>✓✓ ${t("ติ๊กทั้งหมด")}</button>${e1?`<span class="macro" style="margin-left:auto;align-self:center">e1RM ${e1} ${u}</span>`:""}${rows.length>1?`<button class="btn sm ghost" data-del>− ${t("เซ็ต")}</button>`:""}</div>
      ${exHistory(e.id)}`;
    const allOk=()=>rows.length>0&&rows.every(r=>r.ok);
    const foldCard=()=>{const f=foldPref[e.id]??allOk();card.classList.toggle("folded",f);card.querySelector("[data-fold]").setAttribute("aria-expanded",!f);
      const done=rows.filter(r=>r.ok);card.querySelector(".fold-sum").innerHTML=`<span class="${allOk()?"up":""}">✓ ${done.length}/${rows.length}</span>${done.length?" · "+done.map(r=>`${toDisp(r.kg,u)}×${r.reps}`).join(" · ")+" "+u:""}`};
    card.querySelector("[data-fold]").addEventListener("click",ev=>{if(ev.target.closest("a"))return;foldPref[e.id]=!card.classList.contains("folded");foldCard()});
    foldCard();
    rows.forEach((r,i)=>{
      card.querySelector(`#kg-${e.id}-${i}`).addEventListener("input",ev=>{r.kg=fromDisp(ev.target.value,u);save("gymdraft",draft)});
      card.querySelector(`#rp-${e.id}-${i}`).addEventListener("input",ev=>{r.reps=ev.target.value;save("gymdraft",draft)});
      card.querySelector(`#ok-${e.id}-${i}`).addEventListener("change",ev=>{r.ok=ev.target.checked;try{navigator.vibrate&&navigator.vibrate(r.ok?15:0)}catch(_){}updWoBar();
        if(r.ok&&!r.reps){r.reps=e.r.split("-")[0];card.querySelector(`#rp-${e.id}-${i}`).value=r.reps}save("gymdraft",draft);
        delete foldPref[e.id];foldCard();try{renderHero()}catch(_){}if(r.ok)startRest(e,i,rows)});
    });
    card.querySelector("[data-load]")?.addEventListener("click",()=>{   // copy last session's weights and reps into this session
      last.sets.forEach((q,i)=>{if(!rows[i])rows.push({kg:"",reps:"",ok:false});rows[i].kg=q.kg;rows[i].reps=String(q.reps)});save("gymdraft",draft);renderEx();toast("↺ "+e.n)});
    card.querySelector("[data-memo]").addEventListener("input",ev=>{draft.memo=draft.memo||{};draft.memo[e.id]=ev.target.value;save("gymdraft",draft)});
    card.querySelector("[data-unextra]")?.addEventListener("click",()=>{draft.extra=draft.extra.filter(x=>x!==e);if(draft.ex)delete draft.ex[e.id];save("gymdraft",draft);renderEx();updWoBar()});
    card.querySelector("[data-all]").addEventListener("click",()=>{const fill=rows.filter(r=>!r.ok);if(!fill.length)return;
      fill.forEach(r=>{r.ok=true;if(!r.reps)r.reps=e.r.split("-")[0];if(r.kg===""&&last&&last.sets[0])r.kg=last.sets[0].kg});save("gymdraft",draft);renderEx();updWoBar();try{renderHero()}catch(_){}});
    const setRest=d=>{restCfg[e.id]=Math.max(15,Math.min(600,restFor(e)+d));save("restcfg",restCfg);card.querySelector(".restset b").textContent=fmt(restCfg[e.id])};
    card.querySelector("[data-alt]")?.addEventListener("click",()=>{   // swap this slot with its alternate (e.g. Chest Press ⇄ Peck Deck Fly)
      const list=PROGS[cur].ex,i=list.indexOf(e),x=EXLIB.find(q=>q.id===e.alt)||{id:e.alt,n:exName(e.alt),z:"🔩"};if(i<0)return;
      const n={...libPick(x),s:e.s,r:e.r,alt:e.id};if(e.main)n.main=1;list[i]=n;if(draft.ex)delete draft.ex[e.id];saveProgs();save("gymdraft",draft);renderGym();toast("⇄ "+n.n)});
    card.querySelector("[data-edit]").addEventListener("click",()=>{editId=e.id;renderEx()});
    card.querySelector("[data-unit]").addEventListener("click",()=>{libUpdate(e.id,{u:u==="kg"?"lb":"kg"});renderEx()});
    card.querySelector("[data-rm-rest]").addEventListener("click",()=>setRest(-15));
    card.querySelector("[data-add-rest]").addEventListener("click",()=>setRest(15));
    card.querySelector("[data-add]").addEventListener("click",()=>{const l=rows[rows.length-1];rows.push({kg:l?.kg??"",reps:"",ok:false});save("gymdraft",draft);renderEx()});
    card.querySelector("[data-del]")?.addEventListener("click",()=>{rows.pop();save("gymdraft",draft);renderEx()});
    box.appendChild(card);
  });
}
function exHistory(id){const u=uOf(id);
  const all=logs.filter(l=>l.ex[id]&&l.ex[id].length),h=all.slice(-1);   // latest only; the rest lives in the chart
  if(!h.length)return"";
  return `<details class="log"><summary>${t("ประวัติ")} (${all.length})</summary><button class="btn sm" data-chart="${id}" style="margin-top:6px">📈 ${t("ดูกราฟ")}</button><table>${h.map(l=>`<tr><td>${thDate(l.date,{day:"numeric",month:"short"})}</td><td>${l.ex[id].map(s=>`${toDisp(s.kg,u)}×${s.reps}`).join(" · ")} ${u}</td><td>${t("สูงสุด")} ${toDisp(best(l.ex[id]),u)}</td></tr>`).join("")}</table></details>`;
}
function renderSessions(){
  if(typeof renderHistChart==="function")renderHistChart();
  const box=document.getElementById("sessions");box.innerHTML="";
  if(!logs.length){box.innerHTML=emptyBox('bar','ยังไม่มีประวัติเวท','เริ่มจากการ์ดวันนี้ในหน้าเวท');return}
  [...logs].reverse().slice(0,10).forEach((l,ri)=>{
    const idx=logs.length-1-ri;const p={name:progName(l.prog)};
    const d=document.createElement("details");d.className="ex log";
    const vol=Object.values(l.ex).flat().reduce((a,s)=>a+(+s.kg||0)*(+s.reps||0),0);
    d.innerHTML=`<summary><b>${thDate(l.date,{weekday:"short",day:"numeric",month:"short"})}</b> · ${p.name} · ${nU(Object.keys(l.ex).length,"ท่า")} · ${t("วอลุ่ม")} ${Math.round(vol).toLocaleString()} kg</summary>
      <table>${Object.keys(l.ex).map(id=>`<tr><td>${exName(id,l)}</td><td>${l.ex[id].map(s=>`${toDisp(s.kg,uOf(id))}×${s.reps}`).join(" · ")} ${uOf(id)}</td></tr>`).join("")}</table>
      <div class="actions" style="margin-top:8px;align-items:center"><label style="display:flex;align-items:center;gap:6px;border:1px solid var(--line);border-radius:999px;padding:2px 10px">📅<input type="date" data-mv value="${l.date}" max="${TODAY}" aria-label="${t("ย้ายวัน")}" style="background:none;color:var(--fg);border:0;min-width:9.5em;min-height:26px;font-family:var(--f-num);font-size:.8rem"></label>${PROGS[l.prog]?`<button class="btn sm" data-ed>✎ ${t("แก้เซ็ต")}</button>`:""}<button class="btn sm" data-sh>↗ ${t("แชร์")}</button><button class="btn sm ghost" data-rm>${t("ลบรายการนี้")}</button></div>`;
    d.querySelector("[data-sh]").addEventListener("click",()=>openShare(l));
    d.querySelector("[data-mv]").addEventListener("change",ev=>{const v=ev.target.value;if(!v||v>TODAY||v===l.date)return;
      const clash=logs.findIndex(x=>x!==l&&x.date===v&&x.prog===l.prog);if(clash>=0)logs.splice(clash,1);
      l.date=v;logs.sort((a,b)=>a.date.localeCompare(b.date));save("gymlog",logs);renderGym();toast(t("ย้ายวันแล้ว"))});
    d.querySelector("[data-ed]")?.addEventListener("click",()=>{DAY=l.date;cur=l.prog;editId=null;editing=false;picked=true;
      draft={prog:l.prog,ex:{},started:1,day:l.date,fromHist:1};Object.entries(l.ex).forEach(([id,sets])=>draft.ex[id]=sets.map(s=>({kg:s.kg,reps:String(s.reps),ok:true})));
      save("gymdraft",draft);renderAll();scrollAppTop(true);toast(t("แก้แล้วกด Save"))});
    d.querySelector("[data-rm]").addEventListener("click",ev=>{const b=ev.target;
      if(b.dataset.sure){logs.splice(idx,1);save("gymlog",logs);renderGym();toast(t("ลบแล้ว"))}else{b.dataset.sure=1;b.textContent=t("กดอีกครั้งเพื่อยืนยัน")}});
    box.appendChild(d);
  });
}
function commitDraft(day,prog){
  const P=PROGS[prog];if(!P||!draft.ex)return false;
  const all=P.ex.concat(draft.extra||[]),ex={};all.forEach(e=>{const s=(draft.ex[e.id]||[]).filter(r=>r.ok&&r.reps!==""&&r.kg!=="").map(r=>({kg:+r.kg,reps:+r.reps}));if(s.length)ex[e.id]=s});
  if(!Object.keys(ex).length)return false;
  const i=logs.findIndex(l=>l.date===day&&l.prog===prog);
  const names={};all.forEach(e=>{if(ex[e.id])names[e.id]=e.n});
  const memo={};Object.entries(draft.memo||{}).forEach(([k,v])=>{if(ex[k]&&v.trim())memo[k]=v.trim()});const note=(draft.note||"").trim();
  const rec={date:day,prog,ex,names};if(Object.keys(memo).length)rec.memo=memo;if(note)rec.note=note;
  if(i>=0)logs[i]=rec;else logs.push(rec);
  logs.sort((a,b)=>a.date.localeCompare(b.date));
  save("gymlog",logs);draft={};save("gymdraft",draft);return true;
}
// finishing with exercises left untouched: confirm once, listing what will be skipped
function finishWorkout(){const left=sessEx().filter(e=>!((draft.ex||{})[e.id]||[]).some(r=>r.ok));
  if(!sessEx().some(e=>((draft.ex||{})[e.id]||[]).some(r=>r.ok))){toast(t("ยังไม่ได้ติ๊กเซ็ตไหนเลย"));return}
  if(left.length){openGen(t("จบวันนี้เลยไหม?"),`<p class="note">${t("ท่าที่ยังไม่ได้เล่นจะไม่ถูกบันทึก")}</p><ul class="prog-ex" style="margin:0">${left.map(e=>`<li><b class="no">–</b><em class="nm">${e.z} ${esc(e.n)}</em><span class="ss"></span></li>`).join("")}</ul>
    <div class="actions sheet-act"><button class="btn" data-gen-close>${t("เล่นต่อ")}</button><button class="btn primary" id="fin-ok" style="flex:1">✓ ${t("บันทึกเท่าที่เล่น")}</button></div>`,b=>b.querySelector("#fin-ok").addEventListener("click",()=>{document.getElementById("gen-sheet").hidden=true;doSave()}));return}
  doSave()}
document.getElementById("save-w").addEventListener("click",finishWorkout);
function doSave(){
  const back=draft.fromHist;if(!commitDraft(DAY,cur)){toast(t("ยังไม่ได้ติ๊กเซ็ตไหนเลย"));return}
  stopRest&&stopRest();if(back){DAY=TODAY}cur=nextProg();picked=false;chosen=false;editing=false;editId=null;renderAll();const just=logs.find(l=>l.date===DAY);toast(t("บันทึกแล้ว ✅"));if(just)openShare(just);
}
/* auto-save unsaved workout when the day ends */
function autoCommitOld(){if(draft.day&&draft.day<TODAY&&commitDraft(draft.day,draft.prog||cur)){cur=nextProg();toast(t("บันทึกเวทเมื่อวานให้แล้ว"));return true}return false}
setInterval(()=>{const nd=dkey(new Date());if(nd===TODAY)return;
  const prev=TODAY;TODAY=nd;autoCommitOld();if(DAY===prev){DAY=nd;draft.ex=draft.ex||{}}renderAll()},60000);
document.addEventListener("visibilitychange",()=>{if(!document.hidden&&dkey(new Date())!==TODAY){const prev=TODAY;TODAY=dkey(new Date());autoCommitOld();if(DAY===prev)DAY=TODAY;renderAll()}});
// calendar moved to the Stats tab; the 📅 button jumps there
document.getElementById("fold-btn").textContent="📅";document.getElementById("fold-btn").addEventListener("click",()=>{location.hash="stats"});
function woProgress(){const ex=draft.ex||{};let done=0,total=0;sessEx().forEach(e=>{const r=ex[e.id]||[];total+=r.length||e.s;done+=r.filter(x=>x.ok).length});return{done,total,any:Object.values(ex).some(r=>r.some(x=>x.ok||x.reps!==""&&x.reps!=null))}}
function updWoBar(){const c=document.getElementById("wo-count");if(!c)return;const p=woProgress();c.textContent=`${p.done}/${p.total}`;
  const top=document.getElementById("wo-top");top.hidden=!picked||editing;
  const vol=Object.values(draft.ex||{}).flat().filter(r=>r.ok).reduce((a,r)=>a+(+r.kg||0)*(+r.reps||0),0);
  document.getElementById("wo-vol").textContent=Math.round(vol).toLocaleString();document.getElementById("wo-sets").textContent=p.done;tickClock();
  document.getElementById("tab-gym").classList.toggle("live",picked)}
function cancelProg(){const back=draft.fromHist;picked=false;chosen=false;editing=false;editId=null;draft={prog:cur};save("gymdraft",draft);stopRest&&stopRest();updUnitBtn();if(back){DAY=TODAY;renderAll()}else renderGym()}
// cancel: ask once (tap again within 3 s) when sets were already logged, so nothing is lost by accident
document.getElementById("cancel-w").addEventListener("click",ev=>{const b=ev.currentTarget;
  if(woProgress().any&&!b.dataset.sure){b.dataset.sure=1;b.querySelector("span").textContent=t("แตะอีกครั้งเพื่อทิ้ง");b.classList.add("warn");
    clearTimeout(b._t);b._t=setTimeout(()=>{delete b.dataset.sure;b.classList.remove("warn");b.querySelector("span").textContent=t("ยกเลิก")},3000);return}
  delete b.dataset.sure;b.classList.remove("warn");b.querySelector("span").textContent=t("ยกเลิก");cancelProg();toast(t("ยกเลิกการออกแล้ว"))});
function renderGym(){setTimeout(()=>{try{renderToday()}catch(e){console.error(e)}},0);if(draft.prog==="free"&&!PROGS.free)PROGS.free={name:t("ออกแบบอิสระ"),sub:"",ex:[]};try{renderProgress()}catch(e){}try{renderStatsExtra()}catch(e){}try{renderHero()}catch(e){}
  ["step3","step4"].forEach(id=>document.getElementById(id).hidden=!picked&&!editing);
  document.getElementById("step1").classList.toggle("compact",(picked||editing)&&!document.getElementById("v-gym").hidden);document.getElementById("step2").hidden=picked||editing;
  // resume a workout only if sets were actually logged (weights alone are pre-filled from last time)
  if(!picked&&PROGS[draft.prog]&&(draft.started&&(draft.day||DAY)===DAY||draft.ex&&Object.values(draft.ex).some(r=>r.some(x=>x.ok||x.reps!==""&&x.reps!=null)))){picked=true;cur=draft.prog}
  document.getElementById("pick-hint").hidden=picked;document.getElementById("exs").hidden=!picked&&!editing;
  document.getElementById("step4").classList.toggle("locked",!picked);
  document.getElementById("sn-2").classList.toggle("done",picked);document.getElementById("sn-3").classList.toggle("done",picked&&draft.ex&&Object.values(draft.ex).some(r=>r.some(x=>x.ok)));
  document.getElementById("sn-1").classList.add("done");
  const sb=document.getElementById("start-w"),row=document.getElementById("start-row");row.hidden=picked||editing||!chosen||!PROGS[cur];if(!row.hidden)sb.textContent=`▶ ${t("เริ่มออก")} · ${PROGS[cur].name}`;
  document.getElementById("wo-add").hidden=!picked||editing;document.getElementById("edit-mode").hidden=cur==="free";const t3=document.querySelector("#step3 .step-t");if(t3)t3.textContent=PROGS[cur]&&picked?`${PROGS[cur].name} · ${t("กำลังเล่น")}`:t("กรอกน้ำหนัก");
  renderProgs();renderEx();renderSessions();document.getElementById("step4").hidden=editing||!picked;updWoBar()}
document.getElementById("edit-w").addEventListener("click",()=>{if(!PROGS[cur])return;pmOnly=cur;pmFromList=false;renderPM();document.getElementById("pm-modal").hidden=false;window.scrollTo(0,0)});
document.getElementById("start-w").addEventListener("click",()=>{if(!PROGS[cur])return;draft.prog=cur;draft.started=1;draft.day=DAY;draft.t0=Date.now();picked=true;chosen=false;save("gymdraft",draft);renderGym();
  setTimeout(()=>document.getElementById("step3").scrollIntoView({behavior:"smooth",block:"start"}),50)});

/* ---------- collapsible step sections (Pick a program / Log your sets) ---------- */
// step sections are plain headed sections now (no collapse, no numbers)
try{localStorage.removeItem("stepfold")}catch(e){}

/* ---------- workout clock (from Start, kept in the draft so it survives reopening the app) ---------- */
function tickClock(){const el=document.getElementById("wo-clock");if(!el)return;if(!picked){el.textContent="00:00";return}
  if(!draft.t0){draft.t0=Date.now();save("gymdraft",draft)}const s=Math.max(0,Math.floor((Date.now()-draft.t0)/1000));
  const h=Math.floor(s/3600),m=Math.floor(s%3600/60),x=s%60;el.textContent=(h?h+":"+String(m).padStart(2,"0"):String(m).padStart(2,"0"))+":"+String(x).padStart(2,"0")}
setInterval(()=>{if(picked)tickClock()},1000);
document.getElementById("wo-finish").addEventListener("click",finishWorkout);

/* ---------- + add an exercise to the running workout (session only), and the empty "free" workout ---------- */
document.getElementById("wo-add").addEventListener("click",()=>openLib({skip:new Set(sessEx().map(e=>e.id)),onPick:x=>{
  draft.extra=draft.extra||[];draft.extra.push({...libPick(x),s:3,r:"8-12"});save("gymdraft",draft);renderEx();updWoBar();
  setTimeout(()=>{const c=[...document.querySelectorAll("#exs .ex")].pop();if(c)c.scrollIntoView({behavior:"smooth",block:"center"})},60)}}));
function startEmpty(){PROGS.free={name:t("ออกแบบอิสระ"),sub:"",ex:[]};cur="free";draft={prog:"free",ex:{},extra:[],started:1,day:DAY,t0:Date.now()};picked=true;chosen=false;
  save("gymdraft",draft);renderGym();setTimeout(()=>document.getElementById("wo-add").click(),80)}
document.getElementById("empty-w").addEventListener("click",startEmpty);
