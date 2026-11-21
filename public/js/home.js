// home.js — "วันนี้": one screen answering the three morning questions; each card leads to its tab.
// Classic script: shares globals with the other files in /js (load order is set in index.html).
function renderHome(){const box=document.getElementById("v-home");if(!box)return;
  const R=recPct(),st=m=>recState(R[m]),ready=REC_ORDER.filter(m=>[0,3,4].includes(st(m))),fresh=REC_ORDER.filter(m=>st(m)===1);
  const bw=(typeof BODY!=="undefined"&&BODY.length)?BODY.slice().sort((a,b)=>a.d.localeCompare(b.d)).slice(-1)[0]:null;
  const meals=mealList(),d=food[TODAY]||{done:{}},x=logSum(TODAY);let k=x.k,p=x.p;meals.forEach(m=>{if((d.done||{})[m.id]){k+=m.k;p+=m.p}});
  const nx=meals.find(m=>!(d.done||{})[m.id]&&m.k>0)||meals.find(m=>!(d.done||{})[m.id]);
  const ks=planList(),[dn,n]=planStat(),plc=q=>{const P=PROGS[q],L=locById(locOf(P)==="*"?P.lastLoc:locOf(P));return L?` · ${t(L.name)}`:""};
  let sug=null;try{sug=recSuggest()}catch(e){}
  const hasHist=REC_ORDER.some(m=>R[m]);
  const restDay=dayMode()==="rest";
  const pk=ks[0],more=ks.length-1;
  // planned program hits muscles still recovering? say so, and offer the rested pick
  let tired=[];try{if(pk&&!restDay&&!isCardio(PROGS[pk]))tired=[...new Set(PROGS[pk].ex.flatMap(e=>musOf(exOf(e.id))[0]))].filter(m=>st(m)===1)}catch(e){}
  const swap=tired.length&&sug&&sug[0]!==pk&&!ks.slice(0,1).includes(sug[0])?sug[0]:null;
  const bar=(v,g)=>`<span class="hq-bar"><i style="width:${g?Math.min(100,Math.round(v/g*100)):0}%"></i></span>`;
  const gymAns=restDay?t("พักวันนี้"):pk?esc(PROGS[pk].name)+(more>0?` <small class="hq-more">+${more} ${t("อื่นอีก")}</small>`:""):sug?`${t("แนะนำ")}: ${esc(PROGS[sug[0]].name)}`:t("ยังไม่ได้วางแผน");
  const gymSub=restDay?t("ให้ร่างกายฟื้นตัว"):n?`<span class="hq-num">${dn}/${n}</span> ${t("เสร็จแล้ว")}${bar(dn,n)}`:pk?"":hasHist?t("เลือกโปรแกรมที่กล้ามพร้อม"):t("ยังไม่ได้เล่น — เริ่มโปรแกรมแรก");
  const gymBtn=restDay?"":pk?`${t("เริ่ม")} ${esc(PROGS[pk].name)}`:t("วางแผนวันนี้");
  const foodAns=nx?`${t("มื้อถัดไป")} ${esc(t(nx.time))} ${esc(t(nx.name))}`:t("ครบทุกมื้อแล้ว");
  const recSum=!hasHist?t("ยังไม่มีประวัติ — เล่นครั้งแรกแล้วจะเห็นว่ากล้ามส่วนไหนพร้อม")
    :`${t("พร้อม")} ${ready.length}/${REC_ORDER.length} ${t("ส่วน")}`+(fresh.length?` · ${fresh.slice(0,2).map(m=>t(MUS_NAME[m])).join(", ")} ${t("กำลังฟื้น")}`:"");
  {const rw=document.getElementById("rec-wrap");if(rw&&box.contains(rw))document.body.appendChild(rw)}   // park it: innerHTML below would destroy it
  box.innerHTML=`<div class="date">${thDate(TODAY,{weekday:"long",day:"numeric",month:"short"})}</div>
    <section class="hq-card hq-main"><span class="hq-h"><span class="hq-q">${licon("dumbbell")} ${t("วันนี้ออกกำลังยังไง")}</span></span>
      <b class="hq-a">${gymAns}</b>${gymSub?`<small class="hq-s">${gymSub}</small>`:""}
      ${tired.length?`<small class="hq-warn">${licon("moon")} ${tired.slice(0,2).map(m=>t(MUS_NAME[m])).join(", ")} ${t("ยังฟื้นไม่เต็มที่")}</small>`:""}
      ${gymBtn?`<button class="btn primary hq-go" ${pk?`data-start="${esc(pk)}"`:'data-go="gym"'}>${gymBtn} ›</button>`:""}
      ${swap?`<button class="btn hq-swap" data-start="${esc(swap)}">${t("เริ่ม")} ${esc(PROGS[swap].name)} ${t("แทน")}</button>`:""}</section>
    <section class="hq-card"><span class="hq-h"><span class="hq-q">${licon("bowl")} ${t("วันนี้กินอะไร")}</span><button class="hq-l" data-go="food">${t("ดูแผน")} ›</button></span>
      <b class="hq-a">${foodAns}</b><span class="hq-prog"><small class="hq-s"><span class="hq-num">${k.toLocaleString()}</span> / ${K_GOAL.toLocaleString()} kcal${bar(k,K_GOAL)}</small><small class="hq-s">${t("โปรตีน")} <span class="hq-num">${p}</span> / ${P_TARGET} g${bar(p,P_TARGET)}</small></span>
      ${nx?`<button class="btn hq-tick" data-tick="${esc(nx.id)}">${licon("checkc")} ${t("กินมื้อนี้แล้ว")}</button>`:""}</section>
    <details class="hq-card hq-body"${hasHist?"":" data-empty"}><summary><span class="hq-q">${licon("body")} ${t("ร่างกายฉันเป็นยังไง")}</span><small class="hq-s">${recSum}</small></summary><div class="hq-rec"></div></details>`;
  box.querySelector(".hq-body[data-empty] summary")?.addEventListener("click",e=>e.preventDefault());
  box.querySelectorAll("[data-start]").forEach(b=>b.addEventListener("click",()=>{location.hash="gym";try{startPlanItem(b.dataset.start,true)}catch(e){console.error(e)}}));
  box.querySelectorAll("[data-go]").forEach(b=>b.addEventListener("click",()=>{location.hash=b.dataset.go}));
  box.querySelector("[data-tick]")?.addEventListener("click",e=>{if(!food[TODAY])food[TODAY]={done:{}};food[TODAY].done=food[TODAY].done||{};const id=e.currentTarget.dataset.tick,m=meals.find(z=>z.id===id);food[TODAY].done[id]=true;save("mealcheck",food);undoLoud("✓ "+(m?t(m.name):""));renderHome()});
  // full recovery map sits inside the collapsed "How's my body?" row (moved node keeps its handlers)
  const rw=document.getElementById("rec-wrap"),slot=box.querySelector(".hq-rec");if(rw&&slot){slot.appendChild(rw);rw.hidden=false;rw.querySelectorAll("[data-i]").forEach(e=>e.textContent=t(e.dataset.i));try{renderRecovery(document.getElementById("rec-body"))}catch(e){console.error(e)}}}
Object.assign(EN,{"วัน":"days","ร่างกายฉันเป็นยังไง":"How's my body?","วันนี้กินอะไร":"What do I eat today?","วันนี้ออกกำลังยังไง":"How do I train today?","ส่วน":"areas","กล้ามพร้อมทุกส่วน":"All muscles ready","น้ำหนัก":"Weight","มื้อถัดไป":"Next","ดูแผน":"View meals","ดู":"View","เริ่ม":"Start","วางแผน":"Plan","วางแผนวันนี้":"Plan today","อื่นอีก":"more","ยังฟื้นไม่เต็มที่":"still recovering","แทน":"instead","กินมื้อนี้แล้ว":"Ate this meal","กำลังฟื้น":"recovering","เลือกโปรแกรมที่กล้ามพร้อม":"Pick a program for rested muscles","ยังไม่ได้เล่น — เริ่มโปรแกรมแรก":"No workouts yet — start your first program","ยังไม่มีประวัติ — เล่นครั้งแรกแล้วจะเห็นว่ากล้ามส่วนไหนพร้อม":"No history yet — after your first workout you will see which muscles are ready","ครบทุกมื้อแล้ว":"All meals done","ยังไม่ได้วางแผน":"Nothing planned yet","เสร็จแล้ว":"done","ให้ร่างกายฟื้นตัว":"Let your body recover","กิน":"Eat","ออกกำลัง":"Train","ร่างกาย":"Body","สถิติการฝึก":"Training stats","สถิติสัปดาห์นี้":"This week's stats","โปรแกรม · คลังท่า · สถานที่":"Programs · library · places"});
// bottom of the training tab: weekly stats + setup shortcuts
document.getElementById("rec-cfg")?.addEventListener("click",openRecCfg);
