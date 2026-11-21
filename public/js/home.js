// home.js — "วันนี้": one screen answering the three morning questions; each card leads to its tab.
// Classic script: shares globals with the other files in /js (load order is set in index.html).
// "Details" on the body card shows/hides the muscle map; remembered per device
// chosen place per program name when the same program is planned at several places
const homePick={};
let mealsOpen=false;   // Today shows the next + ticked meals; the rest fold behind "+N"
let recOpen=(()=>{try{return localStorage.getItem("homeRecOpen")==="1"}catch(e){return false}})();
function renderHome(){const box=document.getElementById("v-home");if(!box)return;
  const R=recPct(),st=m=>recState(R[m]),ready=REC_ORDER.filter(m=>[0,3,4].includes(st(m))),fresh=REC_ORDER.filter(m=>st(m)===1);
  const bw=(typeof BODY!=="undefined"&&BODY.length)?BODY.slice().sort((a,b)=>a.d.localeCompare(b.d)).slice(-1)[0]:null;
  const meals=mealList(),d=food[DAY]||{done:{}},x=logSum(DAY);let k=x.k,p=x.p;meals.forEach(m=>{if((d.done||{})[m.id]){k+=m.k;p+=m.p}});
  const nx=meals.find(m=>!(d.done||{})[m.id]&&m.k>0);   // 0-kcal items (vitamins) never block "all done"
  const ks=planList(),[dn,n]=planStat(),plc=q=>{const P=PROGS[q],L=locById(locOf(P)==="*"?P.lastLoc:locOf(P));return L?` · ${t(L.name)}`:""};
  let sug=null;try{sug=recSuggest()}catch(e){}
  const hasHist=REC_ORDER.some(m=>R[m]);
  const restDay=dayMode()==="rest";
  const uks=ks.slice();   // one row per plan item, same as the Train tab (Push B @Gym and Push B @Condo are two rows)
  // one weights session a day: once any lift is logged, other planned lifts are skipped (a taken swap counts); cardio counts on its own
  const wDone=ks.some(q=>!isCardio(PROGS[q])&&planItemDone(q)),doneQ=q=>!!planItemDone(q)||(wDone&&!isCardio(PROGS[q]));
  const udn=uks.filter(q=>doneQ(q)).length,un=uks.length;
  const sib=q=>q&&PROGS[q]?[q]:[],pick=q=>{if(!q||!PROGS[q])return q;const c=sib(q),w=homePick[PROGS[q].name];return c.includes(w)?w:q};   // q may be undefined: empty plan / rest day
  const tiredOf=q=>{try{return [...new Set(PROGS[q].ex.flatMap(e=>musOf(exOf(e.id))[0]))].filter(m=>st(m)===1)}catch(e){return []}};   /* the planned lift with the fewest recovering muscles leads */
  const allDone=un>0&&udn===un,pk=pick(ks.filter(q=>!doneQ(q)&&!isCardio(PROGS[q])).sort((a,b)=>tiredOf(a).length-tiredOf(b).length)[0]||ks.find(q=>!doneQ(q))||ks[0]),more=uks.length-1;
  const locOfK=q=>{const P=PROGS[q];return locById(locOf(P)==="*"?P.lastLoc:locOf(P))};
  const fitMs=q=>{try{return [...new Set(PROGS[q].ex.flatMap(e=>musOf(exOf(e.id))[0]))].filter(m=>[0,3,4].includes(st(m))).slice(0,2)}catch(e){return []}};
  // where: one inline place tag per item; a picker only when the same program is planned at places that really differ
  const placeKeys=q=>{if(!q||!PROGS[q]||isCardio(PROGS[q]))return [];const c=ks.includes(q)?sib(q):[q],seen=new Set();return c.filter(z=>{const L=locOfK(z),id=L?L.id:"";if(seen.has(id))return false;seen.add(id);return true})};
  const multiLoc=q=>placeKeys(q).length>1;
  const where=q=>{const c=placeKeys(q);if(!c.length)return "";
    if(c.length>1){const cur=pick(q);return `<span class="hq-locs" role="group" aria-label="${t("ที่ไหน")}">${c.map(z=>{const L=locOfK(z),on=z===cur||(!c.includes(cur)&&z===c[0]);return `<button class="hq-loc${on?" on":""}" data-pick="${esc(z)}" aria-pressed="${on}">${esc((L&&L.icon)||"📍")} ${esc(L?t(L.name):t("ที่ไหนก็ได้"))}</button>`}).join("")}</span>`}
    const L=locOfK(c[0]);return L?` <span class="loc-chip loc-tag">${esc(L.icon||"📍")} ${esc(t(L.name||""))}</span>`:""};
  // planned program hits muscles still recovering? say so, and offer the rested pick
  let tired=[];try{if(pk&&!restDay&&!udn&&!isCardio(PROGS[pk]))tired=[...new Set(PROGS[pk].ex.flatMap(e=>musOf(exOf(e.id))[0]))].filter(m=>st(m)===1)}catch(e){}
  const swap=tired.length&&sug&&sug[0]!==pk&&PROGS[sug[0]]&&!ks.some(z=>PROGS[z].name===PROGS[sug[0]].name)?sug[0]:null;   /* never suggest something already in today's plan */
  const bar=(v,g,ok)=>(!ok&&g&&v>g*1.1?` <b class="hq-over">${t("เกินเป้า")}</b>`:"")+`<span class="hq-bar"><i${!ok&&g&&v>g*1.1?' class="over"':""} style="width:${g?Math.min(100,Math.round(v/g*100)):0}%"></i></span>`;
  const nm=q=>esc(PROGS[q].name);
  // beginner preview: how many exercises + main muscles
  const pv=q=>{try{const P=PROGS[q];if(isCardio(P))return "";const ms=[...new Set(P.ex.flatMap(e=>musOf(exOf(e.id))[0]))].slice(0,3).map(m=>t(MUS_NAME[m]));return `${P.ex.length} ${t("ท่า")}${ms.length?" · "+ms.join(", "):""}`}catch(e){return ""}};
  const gymAns=restDay?t("พักวันนี้"):(!allDone&&uks.length>1)?`${uks.length} ${t("รายการวันนี้_")}`.replace("_",""):allDone?`✓ ${DAY===TODAY?t("เสร็จแล้ววันนี้"):t("เสร็จแล้ว_วัน").replace(/_วัน$/,"")} <small class="hq-more">${uks.filter(q=>planItemDone(q)).map(nm).join(", ")}</small>`:swap?`${nm(swap)} <small class="hq-more">${t("แนะนำแทน")} ${nm(pk)}</small>`:pk?nm(pk)+(uks.some(q=>PROGS[q].name!==PROGS[pk].name&&!doneQ(q))?` <small class="hq-more">+ ${uks.filter(q=>q!==pk&&!doneQ(q)).map(nm).join(", ")}</small>`:""):sug?`${t("แนะนำ")}: ${esc(PROGS[sug[0]].name)}`:t("ยังไม่ได้วางแผน");
  const gymSub=restDay?t("ให้ร่างกายฟื้นตัว"):allDone?(p<P_TARGET?`${t("ต่อไป")}: ${t("โปรตีนเหลือ")} <span class="hq-num">${P_TARGET-p}</span> g`:""):udn?`${t("ทำเสร็จ")} <span class="hq-num">${udn-uks.filter(q=>!planItemDone(q)&&doneQ(q)).length}</span> ${t("จาก")} <span class="hq-num">${un}</span> ${t("รายการวันนี้")}${uks.filter(q=>!planItemDone(q)&&doneQ(q)).length?` · ${t("ข้าม_").replace(/_$/,"")} ${uks.filter(q=>!planItemDone(q)&&doneQ(q)).length}`:""}${bar(udn,un)}`:pk?"":hasHist?t("เลือกโปรแกรมที่กล้ามพร้อม"):t("ยังไม่ได้เล่น — เริ่มโปรแกรมแรก");
  const multi=!restDay&&!allDone&&uks.length>1;
  const rowOf=q=>{const done=doneQ(q),isPk=q===pk,sw=isPk&&swap;
    return `<div class="hq-pi${done?" done":""}"><span class="hq-pt"><b>${done?"✓ ":""}${sw?nm(swap):nm(q)}${sw?` <small class="hq-more">${t("แนะนำแทน")} ${nm(q)}</small>`:""}</b><small class="hq-s">${pv(sw?swap:q)?`<button class="hq-pvb" data-prev="${esc(sw?swap:q)}">${pv(sw?swap:q)} ›</button>`:(isCardio(PROGS[q])?t("คาร์ดิโอ"):"")}${multiLoc(sw?swap:q)?"":where(sw?swap:q)}</small>${multiLoc(sw?swap:q)&&!done?where(sw?swap:q):""}</span>`+
      (done?"":`<button class="btn ${isPk?"primary ":""}sm hq-ps" data-start="${esc(sw?swap:pick(q))}">${t("เริ่ม")}</button>`)+`</div>`};
  const gymBtn=restDay?"":pk?`${t("เริ่ม")} ${esc(PROGS[pk].name)}`:sug&&PROGS[sug[0]]?`${t("เริ่ม")} ${esc(PROGS[sug[0]].name)}`:t("วางแผนวันนี้");
  const late=nx&&DAY===TODAY&&(()=>{const [h,mi]=String(nx.time).split(":").map(Number);const n0=new Date();return n0.getHours()*60+n0.getMinutes()-(h*60+(mi||0))>120})();
  const foodAns=DAY!==TODAY?`${t("ติ๊กแล้ว")} ${meals.filter(m=>(d.done||{})[m.id]).length}/${meals.length} ${t("มื้อ_n").replace(/_n$/,"")}`:nx?`${late?t("ยังไม่ติ๊ก"):t("มื้อถัดไป")} ${esc(t(nx.time))} ${esc(t(nx.name))}`:t("ครบทุกมื้อแล้ว");
  // body weight: latest, change vs ~a week ago, one-tap weigh-in when today has none
  const BL=(typeof BODY!=="undefined"?BODY:[]).slice().sort((x,y)=>x.d.localeCompare(y.d)),bwL=BL.filter(x=>x.kg>0).slice(-1)[0];
  const stat=(k,lbl,u)=>{const L=BL.filter(x=>x[k]>0),z=L.slice(-1)[0];if(!z)return `<span class="hq-st"><small>${t(lbl)}</small><b>–</b></span>`;
    const w=L.filter(x=>(ds2d(z.d)-ds2d(x.d))/864e5>=6).slice(-1)[0],dl=w?Math.round((z[k]-w[k])*10)/10:null;
    return `<span class="hq-st"><small>${t(lbl)}</small><b><span class="hq-num">${z[k]}</span> ${u}</b>${dl!==null?`<i>${dl>0?"+":""}${dl} ${k==="fat"?t("จุด"):u} · 7 ${t("วัน")}</i>`:""}</span>`};
  const bwRow=!BL.length?`<button class="hq-l hq-first" data-weigh>${t("ยังไม่ได้บันทึก — ชั่งครั้งแรกเพื่อดูความเปลี่ยนแปลง")} ›</button>`:`<span class="hq-bw">${stat("kg","น้ำหนักตัว","kg")}${stat("mm","มวลกล้ามเนื้อ","kg")}${stat("fat","ไขมัน","%")}</span>`;
  const recSum=!hasHist?t("ยังไม่มีประวัติ — เล่นครั้งแรกแล้วจะเห็นว่ากล้ามส่วนไหนพร้อม")
    :[[REC_ORDER.filter(m=>[0,3,4].includes(st(m))).length,"พร้อมเล่น",1],[REC_ORDER.filter(m=>[1,2].includes(st(m))).length,"กำลังฟื้น"]].filter(x=>x[0]).map(([c,l])=>`<b class="hq-num">${c}</b> ${t(l).replace(/_$/,"")}`).join(" · ")+(()=>{const nm0=REC_ORDER.filter(m=>[1,2].includes(st(m))&&R[m].ready>Date.now()).sort((x,y)=>R[x].ready-R[y].ready)[0];return nm0?` · ${t(MUS_NAME[nm0])} ${t("พร้อมใน")} ~${Math.max(1,Math.round((R[nm0].ready-Date.now())/36e5))} ${t("ชม.")}`:""})();
  {const rw=document.getElementById("rec-wrap");if(rw&&box.contains(rw))document.body.appendChild(rw);const rc=document.getElementById("rec-cfg");if(rc&&box.contains(rc)&&rw)rw.appendChild(rc)}   // park it: innerHTML below would destroy it
  box.innerHTML=`<div class="date">${thDate(DAY,{weekday:"long",day:"numeric",month:"short"})}</div><div class="card hq-calc" id="home-cal"></div>
    <section class="hq-card hq-main"><span class="hq-h"><span class="hq-q">${licon("dumbbell")} ${t("วันนี้ออกกำลังยังไง")}</span><button class="hq-l" data-go="gym">${t("ดูแผน_ฝึก").replace(/_ฝึก$/,"")} ›</button></span>
      <b class="hq-a">${gymAns}</b>${!restDay&&!allDone&&!(uks.length>1)&&(swap||pk)&&pv(swap||pk)?`<small class="hq-s hq-pv"><button class="hq-pvb" data-prev="${esc(swap||pk)}">${pv(swap||pk)} ›</button>${multiLoc(swap||pk)?"":where(swap||pk)}</small>${multiLoc(swap||pk)?where(swap||pk):""}`:""}${gymSub&&!tired.length?`<small class="hq-s">${gymSub}</small>`:""}
      ${hasHist&&!restDay&&!allDone&&(swap||pk)&&!isCardio(PROGS[swap||pk])&&fitMs(swap||pk).length?`<small class="hq-fit">${licon("checkc")} ${fitMs(swap||pk).map(m=>t(MUS_NAME[m])).join(", ")} ${t("พักพอแล้ว")}${swap?` → ${t("เหมาะกับวันนี้")}`:""}</small>`:""}
      ${tired.length?`<small class="hq-warn">${licon("moon")} ${tired.slice(0,2).map(m=>t(MUS_NAME[m])).join(", ")} ${t("ยังฟื้นไม่เต็มที่")}</small>`:""}
      ${multi?`<div class="hq-plist">${[...uks].sort((a,b)=>(a===pk?-1:b===pk?1:0)||(doneQ(a)-doneQ(b))).map(rowOf).join("")}</div>${swap?`<button class="hq-l hq-alt" data-start="${esc(pk)}">${t("เล่นตามแผน")}: ${nm(pk)}</button>`:""}`:allDone?`<button class="hq-l hq-alt" data-go="gym">${DAY===TODAY?t("ดูบันทึกวันนี้"):t("ดูบันทึก_วัน").replace(/_วัน$/,"")} ›</button>`:swap?`<button class="btn primary hq-go" data-start="${esc(swap)}">${t("เริ่ม")} ${esc(PROGS[swap].name)} ›</button><button class="hq-l hq-alt" data-start="${esc(pk)}">${t("เล่นตามแผน")}: ${nm(pk)}</button>`
        :gymBtn?`<button class="btn primary hq-go" ${pk?`data-start="${esc(pk)}"`:sug&&PROGS[sug[0]]?`data-start="${esc(sug[0])}"`:'data-go="gym"'}>${gymBtn} ›</button>`
        :restDay?`<button class="btn hq-swap" data-anyway>${t("ออกกำลังอยู่ดี")}</button>`:""}</section>
    <section class="hq-card"><span class="hq-h"><span class="hq-q">${licon("bowl")} ${t("วันนี้กินอะไร")}</span><button class="hq-l" data-go="food">${t("ดูแผน")} ›</button></span>
      <b class="hq-a">${foodAns}</b><span class="hq-prog"><small class="hq-s"><span class="hq-num">${k.toLocaleString()}</span> / ${K_GOAL.toLocaleString()} kcal${bar(k,K_GOAL)}</small><small class="hq-s">${t("โปรตีน")} <span class="hq-num">${p}</span> / ${P_TARGET} g${bar(p,P_TARGET,1)}</small></span>
      <span class="hq-meals" role="group" aria-label="${t("ติ๊กมื้อที่กินแล้ว")}">${meals.filter(m=>mealsOpen||(d.done||{})[m.id]||(nx&&m.id===nx.id)).map(m=>{const on=!!(d.done||{})[m.id];return `<button class="hq-mc${on?" on":""}${nx&&m.id===nx.id?" next":""}${m.k>0?"":" mini"}" data-meal="${esc(m.id)}" aria-pressed="${on}" aria-label="${esc(t(m.name))}">${on?licon("checkc"):""}<span class="hq-mt"><small>${esc(t(m.time))}</small>${esc(t(m.name).split(/[(/]/)[0].trim())}</span></button>`}).join("")}${(()=>{const hid=meals.filter(m=>!((d.done||{})[m.id]||(nx&&m.id===nx.id))).length;return hid?`<button class="hq-mc hq-more-m" data-moremeals aria-expanded="${mealsOpen}">${mealsOpen?t("ย่อ"):`+${hid} ${t("มื้ออื่น")}`}</button>`:""})()}</span><button class="hq-l hq-other" data-other>+ ${t("กินอย่างอื่น")}</button></section>
    <section class="hq-card hq-body"><span class="hq-h"><span class="hq-q">${licon("body")} ${t("ร่างกายฉันเป็นยังไง")}</span><button class="hq-l hq-det" data-det aria-expanded="${recOpen}" aria-controls="hq-rec">${t(recOpen?"ซ่อนรายละเอียด":"ดูรายละเอียด")} <span class="hq-chev" aria-hidden="true">›</span></button></span>
      <small class="hq-s">${recSum}</small>${bwRow}
      <div class="hq-rec" id="hq-rec"${recOpen?"":" hidden"}><span class="hq-acts"><button class="btn hq-weigh" data-weigh>+ ${bwL&&bwL.d===DAY?t("แก้บันทึกวันนี้"):t("บันทึกร่างกาย")}</button><span class="hq-cfg-slot"></span></span></div></section>`;
  // looking at another day: say which day, show what happened instead of what to do next
  const past=DAY!==TODAY;
  if(!box.hidden){const h=document.getElementById("h1");if(h)h.textContent=past?thDate(DAY,{weekday:"short",day:"numeric",month:"short"}):t("แท็บวันนี้")}
  if(past){const dl=logs.filter(l=>l.date===DAY),cx=ks.filter(q=>isCardio(PROGS[q])&&planItemDone(q)),done=[...new Set(dl.map(l=>PROGS[l.prog]?PROGS[l.prog].name:l.prog).concat(cx.map(q=>PROGS[q].name)))];
    const mc=box.querySelector(".hq-main");if(mc)mc.innerHTML=`<span class="hq-h"><span class="hq-q">${licon("dumbbell")} ${t("วันนั้นออกกำลังอะไร")}</span><button class="hq-l" data-go="gym">${t("ดูบันทึก_วัน").replace(/_วัน$/,"")} ›</button></span>
      <b class="hq-a">${done.length?"✓ "+done.map(esc).join(", "):t("ไม่ได้ออกกำลัง")}</b>${!done.length&&ks.length?`<small class="hq-s">${t("แผนวันนั้น")}: ${uks.map(nm).join(", ")}</small>`:""}`;
    const fq=box.querySelectorAll(".hq-card .hq-q")[1];if(fq)fq.innerHTML=`${licon("bowl")} ${t("วันนั้นกินอะไร")}`}
  box.querySelectorAll("[data-weigh]").forEach(w=>w.addEventListener("click",e=>{e.preventDefault();e.stopPropagation();try{renderBody();openBodyLog&&openBodyLog(DAY,true);window._sheetFrom=e.currentTarget;setTimeout(()=>(document.querySelector("#gen-sheet input:not([type=date])")||document.querySelector("#gen-sheet .bst"))?.focus(),50)}catch(err){console.error(err);toast(t("เปิดไม่สำเร็จ"))}}));
  box.querySelectorAll("[data-start]").forEach(b=>b.addEventListener("click",()=>{location.hash="gym";try{startPlanItem(b.dataset.start,true)}catch(e){console.error(e);toast(t("เปิดโปรแกรมไม่สำเร็จ — เลือกจากแท็บออกกำลัง"))}}));
  box.querySelector("[data-anyway]")?.addEventListener("click",()=>{try{setDayMode("train")}catch(e){}location.hash="gym"});
  box.querySelector("[data-det]")?.addEventListener("click",()=>{recOpen=!recOpen;try{localStorage.setItem("homeRecOpen",recOpen?"1":"0")}catch(e){}renderHome();box.querySelector("[data-det]")?.focus()});
  box.querySelectorAll("[data-pick]").forEach(b=>b.addEventListener("click",()=>{homePick[PROGS[b.dataset.pick].name]=b.dataset.pick;renderHome();box.querySelector(`[data-pick="${b.dataset.pick}"]`)?.focus()}));
  box.querySelector("[data-moremeals]")?.addEventListener("click",()=>{mealsOpen=!mealsOpen;renderHome();box.querySelector("[data-moremeals]")?.focus()});
  box.querySelector("[data-other]")?.addEventListener("click",()=>{location.hash="food";setTimeout(()=>{try{openFoodLog(null)}catch(e){}},80)});
  box.querySelectorAll("[data-prev]").forEach(b=>b.addEventListener("click",()=>{const P=PROGS[b.dataset.prev];if(!P)return;
    openGen(esc(P.name),`<div class="pm-menu">${P.ex.map(e=>{const x=exOf(e.id),ms=musOf(x)[0].slice(0,2).map(m=>t(MUS_NAME[m])).join(", ");return `<div class="menu-row"><span class="mt"><b>${esc(x.n||e.id)}</b><small>${e.s||3} × ${e.r||"8-12"}${ms?" · "+ms:""}</small></span></div>`}).join("")}</div>
      <div class="actions sheet-act"><button class="btn" data-gen-close>${t("ปิด")}</button><button class="btn primary" data-pstart style="flex:1">${t("เริ่ม")} ${esc(P.name)} ›</button></div>`,g=>{g.querySelector("[data-pstart]").addEventListener("click",()=>{closeGen();location.hash="gym";try{startPlanItem(b.dataset.prev,true)}catch(e){}})})}));
  box.querySelectorAll("[data-go]").forEach(b=>b.addEventListener("click",()=>{location.hash=b.dataset.go}));
  box.querySelectorAll("[data-meal]").forEach(b=>b.addEventListener("click",()=>{if(!food[DAY])food[DAY]={done:{},tags:{}};const dn=food[DAY].done=food[DAY].done||{},id=b.dataset.meal;if(dn[id])delete dn[id];else dn[id]=true;save("mealcheck",food);renderHome()}));
  // same week calendar as Eat/Train: picking a day moves every tab to it
  const hc=box.querySelector("#home-cal");
  const wk=(()=>{const a=new Date(DAY+"T12:00:00"),off=(a.getDay()+6)%7;return [...Array(7)].map((_,i)=>{const d=new Date(a);d.setDate(a.getDate()-off+i);return dkey(d)}).filter(ds=>ds<=TODAY)})();
  const trained=wk.filter(ds=>logs.some(l=>l.date===ds)||(typeof cxAny==="function"&&cxAny(ds))).length,fed=wk.filter(ds=>typeof dayKcal==="function"&&K_GOAL>0&&dayKcal(ds)>=K_GOAL).length;
  let lv="";try{const xp=heroXP(),L=lvOf(xp);lv=` · <b>Lv ${L}</b> ${(lang==="th"?["มือใหม่","สายฟิต","ตัวท็อป","ตำนาน"]:["Rookie","Fit","Beast","Legend"])[tierOf(L)]}`}catch(e){}
  if(hc&&typeof calCard==="function")calCard(hc,{key:"home",sel:DAY,redraw:renderHome,
    extra:()=>DAY!==TODAY?`<button class="btn sm hq-back" data-backtoday>${t("กลับวันนี้")}</button>`:"<span></span>",
    foot:`<small class="hq-streak">${licon("dumbbell")} ${t("สัปดาห์นี้เล่น")} <b class="hq-num">${trained}</b> ${t("วัน_s").replace(/_s$/,"")} · ${t("กินถึงเป้า")} <b class="hq-num">${fed}/${wk.length}</b>${lv}</small>`,
    cell:ds=>{const L=logs.filter(l=>l.date===ds),k=typeof dayKcal==="function"?dayKcal(ds):0;if(!L.length&&!k)return{sub:"",cls:"none"};
      return{sub:L.length?progName(L[0].prog):k.toLocaleString(),mark:L.length?"●":k>=K_GOAL?"✓":"",cls:L.length||k>=K_GOAL?"ok":"low"}},
    pick:ds=>{if(ds===DAY)return renderHome();DAY=ds;food[DAY]=food[DAY]||{done:{},tags:{}};try{draft.ex={};picked=false}catch(e){}renderAll()}});
  // full recovery map sits inside the collapsed "How's my body?" row (moved node keeps its handlers)
  const rw=document.getElementById("rec-wrap"),slot=box.querySelector(".hq-rec");{const rc=document.getElementById("rec-cfg"),cs=box.querySelector(".hq-cfg-slot");if(rc&&cs)cs.replaceWith(rc)}if(rw&&slot){slot.appendChild(rw);rw.hidden=false;box.querySelectorAll("[data-i]").forEach(e=>e.textContent=t(e.dataset.i));try{renderRecovery(document.getElementById("rec-body"))}catch(e){console.error(e)}}}
Object.assign(EN,{"วัน":"days","ร่างกายฉันเป็นยังไง":"How's my body?","วันนี้กินอะไร":"What do I eat today?","วันนี้ออกกำลังยังไง":"How do I train today?","ส่วน":"areas","กล้ามพร้อมทุกส่วน":"All muscles ready","น้ำหนัก":"Weight","มื้อถัดไป":"Next","ดูแผน":"View meals","ดู":"View","เริ่ม":"Start","วางแผน":"Plan","วางแผนวันนี้":"Plan today","ทำเสร็จ":"Done","พร้อมเล่น":"ready","ดูแผน_ฝึก":"View plan","วันนั้นออกกำลังอะไร":"Training that day","วันนั้นกินอะไร":"Eating that day","ไม่ได้ออกกำลัง":"No training","แผนวันนั้น":"Planned","กลับวันนี้":"Back to today","สัปดาห์นี้เล่น":"Trained this week","วัน_s":"days","กินถึงเป้า":"ate to goal","ติ๊กแล้ว":"Ticked","มื้อ_n":"meals","มื้ออื่น":"more meals","ย่อ":"Less","กินอย่างอื่น":"Ate something else","เสร็จแล้ว_วัน":"Done","ดูบันทึก_วัน":"See log","พักพอแล้ว":"rested","เหมาะกับวันนี้":"good for today","ต่อไป":"Next","โปรตีนเหลือ":"protein left","ที่ไหนก็ได้":"Anywhere","รายการวันนี้_":"things today","คาร์ดิโอ":"Cardio","ดูรายละเอียด":"View details","ซ่อนรายละเอียด":"Hide details","ข้าม_":"skipped","ยังไม่ติ๊ก":"Not ticked yet","พร้อมใน":"ready in","จุด":"pts","แนะนำแทน":"instead of","ดูบันทึกวันนี้":"See today's log","เปิดไม่สำเร็จ":"Couldn't open","ยังไม่เคยเล่น_":"never trained","ยังไม่ได้บันทึก — ชั่งครั้งแรกเพื่อดูความเปลี่ยนแปลง":"Nothing logged yet — log once to start tracking change","เปิดโปรแกรมไม่สำเร็จ — เลือกจากแท็บออกกำลัง":"Couldn't open the program — pick it in Train","100% = กล้ามพักพอ เล่นหนักได้อีกครั้ง":"100% = rested, ready to train hard again","เกินเป้า":"over target","ดูแผนที่กล้าม":"Muscle map","จาก":"of","รายการวันนี้":"today","กลุ่มกล้าม":"muscle groups","ติ๊กมื้อที่กินแล้ว":"Tick meals eaten","แก้บันทึกวันนี้":"Edit today","บันทึกร่างกาย":"Log body","แนะนำวันนี้":"suggested today","ใน 7 วัน":"in 7 days","ยังไม่ได้บันทึกน้ำหนัก":"No weight logged yet","ชั่งวันนี้":"Weigh in","เล่นตามแผน":"Stick to plan","ออกกำลังอยู่ดี":"Train anyway","ยังฟื้นไม่เต็มที่":"still recovering","แทน":"instead","กินมื้อนี้แล้ว":"Ate this meal","กำลังฟื้น":"recovering","เลือกโปรแกรมที่กล้ามพร้อม":"Pick a program for rested muscles","ยังไม่ได้เล่น — เริ่มโปรแกรมแรก":"No workouts yet — start your first program","ยังไม่มีประวัติ — เล่นครั้งแรกแล้วจะเห็นว่ากล้ามส่วนไหนพร้อม":"No history yet — after your first workout you will see which muscles are ready","ครบทุกมื้อแล้ว":"All meals done","ยังไม่ได้วางแผน":"Nothing planned yet","เสร็จแล้ว":"done","ให้ร่างกายฟื้นตัว":"Let your body recover","กิน":"Eat","ออกกำลัง":"Train","ร่างกาย":"Body","สถิติการฝึก":"Training stats","สถิติสัปดาห์นี้":"This week's stats","โปรแกรม · คลังท่า · สถานที่":"Programs · library · places"});
// bottom of the training tab: weekly stats + setup shortcuts
// #rec-cfg sits after the scripts in index.html — delegate so the button works whenever it exists
document.addEventListener("click",e=>{const b=e.target.closest&&e.target.closest("#rec-cfg");if(!b)return;openRecCfg();window._sheetFrom=b;setTimeout(()=>document.querySelector("#gen-sheet [data-rh], #gen-sheet button")?.focus(),50)});

// any bottom sheet: Escape or a tap on the dimmed backdrop closes it
document.addEventListener("keydown",e=>{if(e.key!=="Escape")return;const g=document.getElementById("gen-sheet");if(g&&!g.hidden)closeGen()});
document.getElementById("gen-sheet")?.addEventListener("click",e=>{if(e.target.id==="gen-sheet")closeGen()});
// return focus to whatever opened a sheet from Today
(()=>{const g=document.getElementById("gen-sheet");if(!g)return;new MutationObserver(()=>{if(g.hidden&&window._sheetFrom){const f=window._sheetFrom;window._sheetFrom=null;if(document.contains(f))f.focus();else document.querySelector("[data-weigh]")?.focus()}}).observe(g,{attributes:true,attributeFilter:["hidden"]})})();
// "Back to today" lives in the calendar header, drawn after the cards — delegate
document.addEventListener("click",e=>{if(!(e.target.closest&&e.target.closest("[data-backtoday]")))return;DAY=TODAY;try{draft.ex={};picked=false}catch(x){}renderAll()});
