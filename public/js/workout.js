// workout.js — set logging, session history, saving a workout
// Classic script: shares globals with the other files in /js (load order is set in index.html).
let foldPref={};   // manual fold/unfold per exercise id; without one, a card folds once every set is ticked
function renderEx(){
  const box=document.getElementById("exs");box.innerHTML="";
  if(editing){renderEdit(box);return}
  draft.ex=draft.ex||{};
  PROGS[cur].ex.forEach((e,ei)=>{if(e.id===editId){editCard(box,e,ei);return}
    const last=lastFor(e.id);const u=e.u||"kg";
    const rows=draft.ex[e.id]||(draft.ex[e.id]=Array.from({length:e.s},(_,i)=>({kg:last?.sets[i]?.kg??"",reps:"",ok:false})));
    const hitAll=last&&last.sets.length>=e.s&&last.sets.every(s=>+s.reps>=+(e.r.split("-")[1]||e.r));
    const card=document.createElement("div");card.className="ex";
    let lastTxt=last?`${t("ล่าสุด")} ${thDate(last.date,{day:"numeric",month:"short"})}: ${last.sets.map(s=>`${toDisp(s.kg,u)}×${s.reps}`).join(" · ")} ${u}`:t("ยังไม่มีประวัติ");
    if(hitAll)lastTxt+=` <span class="up">↑ ${t("ลอง")} ${u==="kg"?"+2.5 kg":"+5 lb"}</span>`;
    card.innerHTML=`<div class="row-head"><span class="ex-name" data-fold role="button" tabindex="0" aria-label="${t("ย่อ/ขยาย")} ${esc(e.n)}" style="display:flex;gap:8px;align-items:center;cursor:pointer"><span class="fold-i"></span><span>${e.z} ${e.n}${safeUrl(e.link)?` <a href="${esc(safeUrl(e.link))}" target="_blank" rel="noopener" style="color:var(--up);font-size:.8rem;white-space:nowrap">▶ ${t("ดูวิธีเล่น")}</a>`:""}</span></span><span style="display:flex;gap:8px;align-items:center"><span class="macro">${e.s} × ${e.r}${e.main?` · ${t("วอม")}`:""} · <b style="color:var(--fg)">${u}</b></span><button class="btn sm" data-edit aria-label="${t("แก้ไข")} ${esc(e.n)}">✎ ${t("แก้ไข")}</button></span></div>
      <div class="last fold-sum"></div>
      <div class="row-head"><div class="last">${lastTxt}</div><div class="restset">⏱ <button data-rm-rest aria-label="− ${e.n}">−</button><b>${fmt(restFor(e))}</b><button data-add-rest aria-label="+ ${e.n}">+</button></div></div>
      ${e.main?`<div class="zone">${t("วอม")}: 50% × 8 · 75% × 3</div>`:""}
      <div class="sets"><span class="h">${t("เซ็ต")}</span><button class="h" data-unit aria-label="${t("หน่วย")} ${e.n}" style="border:1px solid var(--line);background:none;color:var(--fg);border-radius:999px;font-family:var(--f-num);font-size:.72rem;cursor:pointer;padding:2px 0">${u} ⇄</button><span class="h">${t("ครั้ง")}</span><span class="h">✓</span>
      ${rows.map((r,i)=>`<span class="n">${i+1}</span><input type="number" readonly inputmode="none" data-pad="kg" id="kg-${e.id}-${i}" value="${toDisp(r.kg,u)}" placeholder="${u}" aria-label="${e.n} ${i+1} weight"><input type="number" readonly inputmode="none" data-pad="reps" id="rp-${e.id}-${i}" value="${r.reps}" placeholder="${e.r}" aria-label="${e.n} ${i+1} reps"><input type="checkbox" id="ok-${e.id}-${i}" ${r.ok?"checked":""} aria-label="${i+1} done">`).join("")}
      </div>
      <div class="actions"><button class="btn sm" data-add>+ ${t("เซ็ต")}</button>${rows.length>1?`<button class="btn sm ghost" data-del>− ${t("เซ็ต")}</button>`:""}</div>
      ${exHistory(e.id)}`;
    const allOk=()=>rows.length>0&&rows.every(r=>r.ok);
    const foldCard=()=>{const f=foldPref[e.id]??allOk();card.classList.toggle("folded",f);card.querySelector("[data-fold]").setAttribute("aria-expanded",!f);
      const done=rows.filter(r=>r.ok);card.querySelector(".fold-sum").innerHTML=`<span class="${allOk()?"up":""}">✓ ${done.length}/${rows.length}</span>${done.length?" · "+done.map(r=>`${toDisp(r.kg,u)}×${r.reps}`).join(" · ")+" "+u:""}`};
    card.querySelector("[data-fold]").addEventListener("click",ev=>{if(ev.target.closest("a"))return;foldPref[e.id]=!card.classList.contains("folded");foldCard()});
    foldCard();
    rows.forEach((r,i)=>{
      card.querySelector(`#kg-${e.id}-${i}`).addEventListener("input",ev=>{r.kg=fromDisp(ev.target.value,u);save("gymdraft",draft)});
      card.querySelector(`#rp-${e.id}-${i}`).addEventListener("input",ev=>{r.reps=ev.target.value;save("gymdraft",draft)});
      card.querySelector(`#ok-${e.id}-${i}`).addEventListener("change",ev=>{r.ok=ev.target.checked;
        if(r.ok&&!r.reps){r.reps=e.r.split("-")[0];card.querySelector(`#rp-${e.id}-${i}`).value=r.reps}save("gymdraft",draft);
        delete foldPref[e.id];foldCard();try{renderHero()}catch(_){}if(r.ok)startRest(e,i,rows)});
    });
    const setRest=d=>{restCfg[e.id]=Math.max(15,Math.min(600,restFor(e)+d));save("restcfg",restCfg);card.querySelector(".restset b").textContent=fmt(restCfg[e.id])};
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
  if(!logs.length){box.innerHTML=`<p class="note">—</p>`;return}
  [...logs].reverse().slice(0,10).forEach((l,ri)=>{
    const idx=logs.length-1-ri;const p={name:progName(l.prog)};
    const d=document.createElement("details");d.className="ex log";
    const vol=Object.values(l.ex).flat().reduce((a,s)=>a+(+s.kg||0)*(+s.reps||0),0);
    d.innerHTML=`<summary><b>${thDate(l.date,{weekday:"short",day:"numeric",month:"short"})}</b> · ${p.name} · ${Object.keys(l.ex).length} ${t("ท่า")} · ${t("วอลุ่ม")} ${Math.round(vol).toLocaleString()} kg</summary>
      <table>${Object.keys(l.ex).map(id=>`<tr><td>${exName(id,l)}</td><td>${l.ex[id].map(s=>`${toDisp(s.kg,uOf(id))}×${s.reps}`).join(" · ")} ${uOf(id)}</td></tr>`).join("")}</table>
      <div class="actions" style="margin-top:8px;align-items:center"><label style="display:flex;align-items:center;gap:6px;border:1px solid var(--line);border-radius:999px;padding:2px 10px">📅<input type="date" data-mv value="${l.date}" max="${TODAY}" aria-label="${t("ย้ายวัน")}" style="background:none;color:var(--fg);border:0;min-width:9.5em;min-height:26px;font-family:var(--f-num);font-size:.8rem"></label>${PROGS[l.prog]?`<button class="btn sm" data-ed>✎ ${t("แก้เซ็ต")}</button>`:""}<button class="btn sm" data-sh>↗ ${t("แชร์")}</button><button class="btn sm ghost" data-rm>${t("ลบรายการนี้")}</button></div>`;
    d.querySelector("[data-sh]").addEventListener("click",()=>openShare(l));
    d.querySelector("[data-mv]").addEventListener("change",ev=>{const v=ev.target.value;if(!v||v>TODAY||v===l.date)return;
      const clash=logs.findIndex(x=>x!==l&&x.date===v&&x.prog===l.prog);if(clash>=0)logs.splice(clash,1);
      l.date=v;logs.sort((a,b)=>a.date.localeCompare(b.date));save("gymlog",logs);renderGym();toast(t("ย้ายวันแล้ว"))});
    d.querySelector("[data-ed]")?.addEventListener("click",()=>{DAY=l.date;cur=l.prog;editId=null;editing=false;picked=true;
      draft={prog:l.prog,ex:{}};Object.entries(l.ex).forEach(([id,sets])=>draft.ex[id]=sets.map(s=>({kg:s.kg,reps:String(s.reps),ok:true})));
      save("gymdraft",draft);renderAll();window.scrollTo({top:0,behavior:"smooth"});toast(t("แก้แล้วกด Save"))});
    d.querySelector("[data-rm]").addEventListener("click",ev=>{const b=ev.target;
      if(b.dataset.sure){logs.splice(idx,1);save("gymlog",logs);renderGym();toast(t("ลบแล้ว"))}else{b.dataset.sure=1;b.textContent=t("กดอีกครั้งเพื่อยืนยัน")}});
    box.appendChild(d);
  });
}
function commitDraft(day,prog){
  const P=PROGS[prog];if(!P||!draft.ex)return false;
  const ex={};P.ex.forEach(e=>{const s=(draft.ex[e.id]||[]).filter(r=>r.reps!==""&&r.kg!=="").map(r=>({kg:+r.kg,reps:+r.reps}));if(s.length)ex[e.id]=s});
  if(!Object.keys(ex).length)return false;
  const i=logs.findIndex(l=>l.date===day&&l.prog===prog);
  const names={};P.ex.forEach(e=>{if(ex[e.id])names[e.id]=e.n});
  if(i>=0){logs[i].ex=ex;logs[i].names=names}else logs.push({date:day,prog,ex,names});
  logs.sort((a,b)=>a.date.localeCompare(b.date));
  save("gymlog",logs);draft={};save("gymdraft",draft);return true;
}
document.getElementById("save-w").addEventListener("click",()=>{
  if(!commitDraft(DAY,cur)){toast(t("ยังไม่ได้กรอกน้ำหนักและจำนวนครั้ง"));return}
  cur=nextProg();picked=false;chosen=false;renderGym();const just=logs.find(l=>l.date===DAY);toast(t("บันทึกแล้ว ✅"));if(just)openShare(just);
});
/* auto-save unsaved workout when the day ends */
function autoCommitOld(){if(draft.day&&draft.day<TODAY&&commitDraft(draft.day,draft.prog||cur)){cur=nextProg();toast(t("บันทึกเวทเมื่อวานให้แล้ว"));return true}return false}
setInterval(()=>{const nd=dkey(new Date());if(nd===TODAY)return;
  const prev=TODAY;TODAY=nd;autoCommitOld();if(DAY===prev){DAY=nd;draft.ex=draft.ex||{}}renderAll()},60000);
document.addEventListener("visibilitychange",()=>{if(!document.hidden&&dkey(new Date())!==TODAY){const prev=TODAY;TODAY=dkey(new Date());autoCommitOld();if(DAY===prev)DAY=TODAY;renderAll()}});
document.getElementById("clear-w").addEventListener("click",()=>{draft={prog:cur};save("gymdraft",draft);renderGym()});
let folded=(()=>{try{return localStorage.getItem("calFolded")==="1"}catch(e){return false}})();
function applyFold(){document.getElementById("step1").classList.toggle("folded",folded);document.getElementById("fold-btn").textContent="📅 "+(folded?"▸":"▾");document.getElementById("fold-btn").setAttribute("aria-expanded",!folded)}
document.getElementById("fold-btn").addEventListener("click",()=>{folded=!folded;try{localStorage.setItem("calFolded",folded?"1":"0")}catch(e){}if(!folded)document.getElementById("step1").classList.remove("compact");applyFold()});
applyFold();
function cancelProg(){picked=false;chosen=false;editing=false;editId=null;draft.ex={};save("gymdraft",draft);stopRest&&stopRest();updUnitBtn();renderGym()}
document.getElementById("cancel-prog").addEventListener("click",cancelProg);
function renderGym(){try{renderProgress()}catch(e){}try{renderHero()}catch(e){}
  ["step3","step4"].forEach(id=>document.getElementById(id).hidden=!picked&&!editing);
  document.getElementById("step1").classList.toggle("compact",(picked||editing)&&!document.getElementById("v-gym").hidden);document.getElementById("hist-sec").hidden=picked||editing;
  if(!picked&&draft.ex&&Object.values(draft.ex).some(r=>r.some(x=>x.kg!==""||x.ok)))picked=true;
  document.getElementById("pick-hint").hidden=picked;document.getElementById("exs").hidden=!picked&&!editing;
  document.getElementById("step4").classList.toggle("locked",!picked);
  document.getElementById("sn-2").classList.toggle("done",picked);document.getElementById("sn-3").classList.toggle("done",picked&&draft.ex&&Object.values(draft.ex).some(r=>r.some(x=>x.ok)));
  document.getElementById("sn-1").classList.add("done");
  const sb=document.getElementById("start-w");sb.hidden=picked||editing||!chosen||!PROGS[cur];if(!sb.hidden)sb.textContent=`▶ ${t("เริ่มออก")} · ${PROGS[cur].name}`;
  renderProgs();renderEx();renderSessions();document.getElementById("step4").hidden=editing||!picked}
document.getElementById("start-w").addEventListener("click",()=>{if(!PROGS[cur])return;draft.prog=cur;picked=true;chosen=false;save("gymdraft",draft);renderGym();
  setTimeout(()=>document.getElementById("step3").scrollIntoView({behavior:"smooth",block:"start"}),50)});

/* ---------- collapsible step sections (Pick a program / Log your sets) ---------- */
let stepFold=load("stepfold",{});
["step2","step3"].forEach(id=>{const sec=document.getElementById(id),head=sec.querySelector(".step");
  const apply=()=>{const f=!!stepFold[id];sec.classList.toggle("collapsed",f);head.setAttribute("aria-expanded",!f)};
  head.classList.add("step-toggle");head.setAttribute("role","button");head.tabIndex=0;
  const tog=ev=>{if(ev.target.closest("button,a,input"))return;stepFold[id]=!stepFold[id];save("stepfold",stepFold);apply()};
  head.addEventListener("click",tog);head.addEventListener("keydown",ev=>{if(ev.key==="Enter"||ev.key===" "){ev.preventDefault();tog(ev)}});apply()});
