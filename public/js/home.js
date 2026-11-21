// home.js — "วันนี้": one screen answering the three morning questions; each card leads to its tab.
// Classic script: shares globals with the other files in /js (load order is set in index.html).
function renderHome(){const box=document.getElementById("v-home");if(!box)return;
  const R=recPct(),st=m=>recState(R[m]),ready=REC_ORDER.filter(m=>[0,3,4].includes(st(m))),fresh=REC_ORDER.filter(m=>st(m)===1);
  const bw=(typeof BODY!=="undefined"&&BODY.length)?BODY.slice().sort((a,b)=>a.d.localeCompare(b.d)).slice(-1)[0]:null;
  const meals=mealList(),d=food[TODAY]||{done:{}},x=logSum(TODAY);let k=x.k,p=x.p;meals.forEach(m=>{if((d.done||{})[m.id]){k+=m.k;p+=m.p}});
  const nx=meals.find(m=>!(d.done||{})[m.id]&&m.k>0);   // 0-kcal items (vitamins) never block "all done"
  const ks=planList(),[dn,n]=planStat(),plc=q=>{const P=PROGS[q],L=locById(locOf(P)==="*"?P.lastLoc:locOf(P));return L?` · ${t(L.name)}`:""};
  let sug=null;try{sug=recSuggest()}catch(e){}
  const hasHist=REC_ORDER.some(m=>R[m]);
  const restDay=dayMode()==="rest";
  const uks=ks.filter((q,i)=>ks.findIndex(z=>PROGS[z].name===PROGS[q].name)===i);   // same program at two places = one item
  const udn=uks.filter(q=>ks.some(z=>PROGS[z].name===PROGS[q].name&&planItemDone(z))).length,un=uks.length;
  const allDone=un>0&&udn===un,pk=ks.find(q=>!planItemDone(q))||ks[0],more=uks.length-1;
  // planned program hits muscles still recovering? say so, and offer the rested pick
  let tired=[];try{if(pk&&!restDay&&!udn&&!isCardio(PROGS[pk]))tired=[...new Set(PROGS[pk].ex.flatMap(e=>musOf(exOf(e.id))[0]))].filter(m=>st(m)===1)}catch(e){}
  const swap=tired.length&&sug&&sug[0]!==pk&&!ks.slice(0,1).includes(sug[0])?sug[0]:null;
  const bar=(v,g,ok)=>(!ok&&g&&v>g*1.1?` <b class="hq-over">${t("เกินเป้า")}</b>`:"")+`<span class="hq-bar"><i${!ok&&g&&v>g*1.1?' class="over"':""} style="width:${g?Math.min(100,Math.round(v/g*100)):0}%"></i></span>`;
  const nm=q=>esc(PROGS[q].name);
  // beginner preview: how many exercises + main muscles
  const pv=q=>{try{const P=PROGS[q];if(isCardio(P))return "";const ms=[...new Set(P.ex.flatMap(e=>musOf(exOf(e.id))[0]))].slice(0,3).map(m=>t(MUS_NAME[m]));return `${P.ex.length} ${t("ท่า")}${ms.length?" · "+ms.join(", "):""}`}catch(e){return ""}};
  const gymAns=restDay?t("พักวันนี้"):allDone?`✓ ${t("เสร็จแล้ววันนี้")} <small class="hq-more">${uks.map(nm).join(", ")}</small>`:swap?`${nm(swap)} <small class="hq-more">${t("แนะนำแทน")} ${nm(pk)}</small>`:pk?nm(pk)+(more>0?` <small class="hq-more">+ ${uks.slice(1).map(nm).join(", ")}</small>`:""):sug?`${t("แนะนำ")}: ${esc(PROGS[sug[0]].name)}`:t("ยังไม่ได้วางแผน");
  const gymSub=restDay?t("ให้ร่างกายฟื้นตัว"):udn?`${t("ทำเสร็จ")} <span class="hq-num">${udn}</span> ${t("จาก")} <span class="hq-num">${un}</span> ${t("รายการวันนี้")}${udn?bar(udn,un):""}`:pk?"":hasHist?t("เลือกโปรแกรมที่กล้ามพร้อม"):t("ยังไม่ได้เล่น — เริ่มโปรแกรมแรก");
  const gymBtn=restDay?"":pk?`${t("เริ่ม")} ${esc(PROGS[pk].name)}`:t("วางแผนวันนี้");
  const foodAns=nx?`${t("มื้อถัดไป")} ${esc(t(nx.time))} ${esc(t(nx.name))}`:t("ครบทุกมื้อแล้ว");
  // body weight: latest, change vs ~a week ago, one-tap weigh-in when today has none
  const BL=(typeof BODY!=="undefined"?BODY:[]).slice().sort((x,y)=>x.d.localeCompare(y.d)),bwL=BL.filter(x=>x.kg>0).slice(-1)[0];
  const stat=(k,lbl,u)=>{const L=BL.filter(x=>x[k]>0),z=L.slice(-1)[0];if(!z)return `<span class="hq-st"><small>${t(lbl)}</small><b>–</b></span>`;
    const w=L.filter(x=>(ds2d(z.d)-ds2d(x.d))/864e5>=6).slice(-1)[0],dl=w?Math.round((z[k]-w[k])*10)/10:null;
    return `<span class="hq-st"><small>${t(lbl)}</small><b><span class="hq-num">${z[k]}</span> ${u}</b>${dl!==null?`<i>${dl>0?"+":""}${dl} ${u} · 7 ${t("วัน")}</i>`:""}</span>`};
  const bwRow=!BL.length?`<small class="hq-s">${t("ยังไม่ได้บันทึก — ชั่งครั้งแรกเพื่อดูความเปลี่ยนแปลง")}</small>`:`<span class="hq-bw">${stat("kg","น้ำหนักตัว","kg")}${stat("mm","มวลกล้ามเนื้อ","kg")}${stat("fat","ไขมัน","%")}</span>`;
  const recSum=!hasHist?t("ยังไม่มีประวัติ — เล่นครั้งแรกแล้วจะเห็นว่ากล้ามส่วนไหนพร้อม")
    :[[REC_ORDER.filter(m=>[3,4].includes(st(m))).length,"พร้อมเล่น",1],[REC_ORDER.filter(m=>[1,2].includes(st(m))).length,"กำลังฟื้น"],[REC_ORDER.filter(m=>st(m)===0).length,"ยังไม่เคยเล่น_"]].filter(x=>x[0]).map(([c,l])=>`<b class="hq-num">${c}</b> ${t(l).replace(/_$/,"")}`).join(" · ");
  {const rw=document.getElementById("rec-wrap");if(rw&&box.contains(rw))document.body.appendChild(rw)}   // park it: innerHTML below would destroy it
  box.innerHTML=`<div class="date">${thDate(TODAY,{weekday:"long",day:"numeric",month:"short"})}</div>
    <section class="hq-card hq-main"><span class="hq-h"><span class="hq-q">${licon("dumbbell")} ${t("วันนี้ออกกำลังยังไง")}</span><button class="hq-l" data-go="gym">${t("แผน_today").replace(/_today$/,"")} ›</button></span>
      <b class="hq-a">${gymAns}</b>${!restDay&&!allDone&&!tired.length&&(swap||pk)&&pv(swap||pk)?`<small class="hq-s hq-pv">${pv(swap||pk)}</small>`:""}${gymSub&&!tired.length?`<small class="hq-s">${gymSub}</small>`:""}
      ${tired.length?`<small class="hq-warn">${licon("moon")} ${tired.slice(0,2).map(m=>t(MUS_NAME[m])).join(", ")} ${t("ยังฟื้นไม่เต็มที่")}</small>`:""}
      ${allDone?`<button class="hq-l hq-alt" data-go="gym">${t("ดูบันทึกวันนี้")} ›</button>`:swap?`<button class="btn primary hq-go" data-start="${esc(swap)}">${t("เริ่ม")} ${esc(PROGS[swap].name)} ›</button><button class="hq-l hq-alt" data-start="${esc(pk)}">${t("เล่นตามแผน")}: ${nm(pk)}</button>`
        :gymBtn?`<button class="btn primary hq-go" ${pk?`data-start="${esc(pk)}"`:'data-go="gym"'}>${gymBtn} ›</button>`
        :restDay?`<button class="btn hq-swap" data-go="gym">${t("ออกกำลังอยู่ดี")}</button>`:""}</section>
    <section class="hq-card"><span class="hq-h"><span class="hq-q">${licon("bowl")} ${t("วันนี้กินอะไร")}</span><button class="hq-l" data-go="food">${t("ดูแผน")} ›</button></span>
      <b class="hq-a">${foodAns}</b><span class="hq-prog"><small class="hq-s"><span class="hq-num">${k.toLocaleString()}</span> / ${K_GOAL.toLocaleString()} kcal${bar(k,K_GOAL)}</small><small class="hq-s">${t("โปรตีน")} <span class="hq-num">${p}</span> / ${P_TARGET} g${bar(p,P_TARGET,1)}</small></span>
      <span class="hq-meals" role="group" aria-label="${t("ติ๊กมื้อที่กินแล้ว")}">${meals.filter(m=>m.k>0).map(m=>{const on=!!(d.done||{})[m.id];return `<button class="hq-mc${on?" on":""}" data-meal="${esc(m.id)}" aria-pressed="${on}" aria-label="${esc(t(m.name))}">${on?licon("checkc"):""}<span>${esc(t(m.name).split(/[(/]/)[0].trim())}</span></button>`}).join("")}</span></section>
    <details class="hq-card hq-body"${hasHist?"":" data-empty"}><summary><span class="hq-h"><span class="hq-q">${licon("body")} ${t("ร่างกายฉันเป็นยังไง")}</span><button class="hq-l hq-weigh" data-weigh>+ ${bwL&&bwL.d===TODAY?t("แก้บันทึกวันนี้"):t("บันทึกร่างกาย")}</button></span><small class="hq-s">${recSum}</small>${bwRow}${hasHist?`<span class="hq-xp">${t("ดูแผนที่กล้าม")}</span>`:""}</summary><div class="hq-rec"><small class="hq-s hq-hint">${t("100% = กล้ามพักพอ เล่นหนักได้อีกครั้ง")}</small></div></details>`;
  box.querySelector("[data-weigh]")?.addEventListener("click",e=>{e.preventDefault();e.stopPropagation();try{renderBody();openBodyLog&&openBodyLog(TODAY,true)}catch(err){console.error(err);toast(t("เปิดไม่สำเร็จ"))}});
  box.querySelector(".hq-body[data-empty] summary")?.addEventListener("click",e=>e.preventDefault());
  box.querySelectorAll("[data-start]").forEach(b=>b.addEventListener("click",()=>{location.hash="gym";try{startPlanItem(b.dataset.start,true)}catch(e){console.error(e);toast(t("เปิดโปรแกรมไม่สำเร็จ — เลือกจากแท็บออกกำลัง"))}}));
  box.querySelectorAll("[data-go]").forEach(b=>b.addEventListener("click",()=>{location.hash=b.dataset.go}));
  box.querySelectorAll("[data-meal]").forEach(b=>b.addEventListener("click",()=>{if(!food[TODAY])food[TODAY]={done:{}};const dn=food[TODAY].done=food[TODAY].done||{},id=b.dataset.meal;if(dn[id])delete dn[id];else dn[id]=true;save("mealcheck",food);renderHome()}));
  // full recovery map sits inside the collapsed "How's my body?" row (moved node keeps its handlers)
  const rw=document.getElementById("rec-wrap"),slot=box.querySelector(".hq-rec");if(rw&&slot){slot.appendChild(rw);rw.hidden=false;rw.querySelectorAll("[data-i]").forEach(e=>e.textContent=t(e.dataset.i));try{renderRecovery(document.getElementById("rec-body"))}catch(e){console.error(e)}}}
Object.assign(EN,{"วัน":"days","ร่างกายฉันเป็นยังไง":"How's my body?","วันนี้กินอะไร":"What do I eat today?","วันนี้ออกกำลังยังไง":"How do I train today?","ส่วน":"areas","กล้ามพร้อมทุกส่วน":"All muscles ready","น้ำหนัก":"Weight","มื้อถัดไป":"Next","ดูแผน":"View meals","ดู":"View","เริ่ม":"Start","วางแผน":"Plan","วางแผนวันนี้":"Plan today","ทำเสร็จ":"Done","พร้อมเล่น":"ready","แผน_today":"Plan","แนะนำแทน":"instead of","ดูบันทึกวันนี้":"See today's log","เปิดไม่สำเร็จ":"Couldn't open","ยังไม่เคยเล่น_":"not trained yet","ยังไม่ได้บันทึก — ชั่งครั้งแรกเพื่อดูความเปลี่ยนแปลง":"Nothing logged yet — log once to start tracking change","เปิดโปรแกรมไม่สำเร็จ — เลือกจากแท็บออกกำลัง":"Couldn't open the program — pick it in Train","100% = กล้ามพักพอ เล่นหนักได้อีกครั้ง":"100% = rested, ready to train hard again","เกินเป้า":"over target","ดูแผนที่กล้าม":"Muscle map","จาก":"of","รายการวันนี้":"today","กลุ่มกล้าม":"muscle groups","ติ๊กมื้อที่กินแล้ว":"Tick meals eaten","แก้บันทึกวันนี้":"Edit today","บันทึกร่างกาย":"Log body","แนะนำวันนี้":"suggested today","ใน 7 วัน":"in 7 days","ยังไม่ได้บันทึกน้ำหนัก":"No weight logged yet","ชั่งวันนี้":"Weigh in","เล่นตามแผน":"Stick to plan","ออกกำลังอยู่ดี":"Train anyway","ยังฟื้นไม่เต็มที่":"still recovering","แทน":"instead","กินมื้อนี้แล้ว":"Ate this meal","กำลังฟื้น":"recovering","เลือกโปรแกรมที่กล้ามพร้อม":"Pick a program for rested muscles","ยังไม่ได้เล่น — เริ่มโปรแกรมแรก":"No workouts yet — start your first program","ยังไม่มีประวัติ — เล่นครั้งแรกแล้วจะเห็นว่ากล้ามส่วนไหนพร้อม":"No history yet — after your first workout you will see which muscles are ready","ครบทุกมื้อแล้ว":"All meals done","ยังไม่ได้วางแผน":"Nothing planned yet","เสร็จแล้ว":"done","ให้ร่างกายฟื้นตัว":"Let your body recover","กิน":"Eat","ออกกำลัง":"Train","ร่างกาย":"Body","สถิติการฝึก":"Training stats","สถิติสัปดาห์นี้":"This week's stats","โปรแกรม · คลังท่า · สถานที่":"Programs · library · places"});
// bottom of the training tab: weekly stats + setup shortcuts
// #rec-cfg sits after the scripts in index.html — delegate so the button works whenever it exists
document.addEventListener("click",e=>{if(e.target.closest&&e.target.closest("#rec-cfg"))openRecCfg()});

// any bottom sheet: Escape or a tap on the dimmed backdrop closes it
document.addEventListener("keydown",e=>{if(e.key!=="Escape")return;const g=document.getElementById("gen-sheet");if(g&&!g.hidden)closeGen()});
document.getElementById("gen-sheet")?.addEventListener("click",e=>{if(e.target.id==="gen-sheet")closeGen()});
