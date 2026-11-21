// home.js — "วันนี้": one screen answering the three morning questions; each card leads to its tab.
// Classic script: shares globals with the other files in /js (load order is set in index.html).
function renderHome(){const box=document.getElementById("v-home");if(!box)return;
  const R=recPct(),st=m=>recState(R[m]),ready=REC_ORDER.filter(m=>[0,3,4].includes(st(m))),fresh=REC_ORDER.filter(m=>st(m)===1);
  const bw=(typeof BODY!=="undefined"&&BODY.length)?BODY.slice().sort((a,b)=>a.d.localeCompare(b.d)).slice(-1)[0]:null;
  const meals=mealList(),d=food[TODAY]||{done:{}},x=logSum(TODAY);let k=x.k,p=x.p;meals.forEach(m=>{if((d.done||{})[m.id]){k+=m.k;p+=m.p}});
  const nx=meals.find(m=>!(d.done||{})[m.id]);
  const ks=planList(),[dn,n]=planStat(),plc=q=>{const P=PROGS[q],L=locById(locOf(P)==="*"?P.lastLoc:locOf(P));return L?` · ${t(L.name)}`:""};
  let sug=null;try{sug=recSuggest()}catch(e){}
  const card=(go,ic,q,ans,sub,link)=>`<button class="hq-card" data-go="${go}"${link?"":" disabled"}><span class="hq-h"><span class="hq-q">${licon(ic)} ${t(q)}</span>${link?`<span class="hq-l">${t(link)} ›</span>`:""}</span><b class="hq-a">${ans}</b><small class="hq-s">${sub}</small></button>`;
  const restDay=dayMode()==="rest";
  {const rw=document.getElementById("rec-wrap");if(rw&&box.contains(rw))document.body.appendChild(rw)}   // park it: innerHTML below would destroy it
  box.innerHTML=`<div class="date">${thDate(TODAY,{weekday:"long",day:"numeric",month:"short"})}</div>`
    +card("body","dumbbell","ร่างกายฉันเป็นยังไง",`${t("พร้อม")} ${ready.length}/${REC_ORDER.length} ${t("ส่วน")}`,
      [fresh.length?fresh.slice(0,3).map(m=>t(MUS_NAME[m])).join(" ")+" · "+t("เพิ่งเล่น"):t("กล้ามพร้อมทุกส่วน"),bw?`${t("น้ำหนัก")} ${bw.kg} kg`:""].filter(Boolean).join(" · "),"")
    +card("food","bowl","วันนี้กินอะไร",nx?`${t("มื้อถัดไป")} ${esc(t(nx.time))} ${esc(t(nx.name))}`:t("ครบทุกมื้อแล้ว ✅"),
      `${k.toLocaleString()} / ${K_GOAL.toLocaleString()} kcal · ${t("โปรตีน")} ${p} / ${P_TARGET} g`,"ดูแผน")
    +card("gym","dumbbell","วันนี้ออกกำลังยังไง",restDay?t("พักวันนี้"):ks.length?ks.map(q=>esc(PROGS[q].name)+plc(q)).join(" + "):t("ยังไม่ได้วางแผน"),
      restDay?t("ให้ร่างกายฟื้นตัว"):n?`${dn}/${n} ${t("เสร็จแล้ว")}${sug&&!ks.includes(sug[0])?` · ${t("แนะนำ")}: ${esc(PROGS[sug[0]].name)}`:""}`:sug?`${t("แนะนำ")}: ${esc(PROGS[sug[0]].name)}`:"",ks.length&&!restDay?"เริ่ม":"วางแผน");
  box.querySelectorAll("[data-go]").forEach(b=>b.addEventListener("click",()=>{location.hash=b.dataset.go}));
  // muscle recovery lives on Today, right under "How's my body?" (moved node keeps its handlers)
  const rw=document.getElementById("rec-wrap"),bc=box.querySelector('[data-go="body"]');if(rw&&bc){bc.after(rw);rw.hidden=false;rw.querySelectorAll("[data-i]").forEach(e=>e.textContent=t(e.dataset.i));try{renderRecovery(document.getElementById("rec-body"))}catch(e){console.error(e)}}}
Object.assign(EN,{"วัน":"days","ร่างกายฉันเป็นยังไง":"How's my body?","วันนี้กินอะไร":"What do I eat today?","วันนี้ออกกำลังยังไง":"How do I train today?","ส่วน":"areas","กล้ามพร้อมทุกส่วน":"All muscles ready","น้ำหนัก":"Weight","มื้อถัดไป":"Next","ดูแผน":"Plan","ดู":"View","เริ่ม":"Start","วางแผน":"Plan","ยังไม่ได้วางแผน":"Nothing planned yet","เสร็จแล้ว":"done","ให้ร่างกายฟื้นตัว":"Let your body recover","กิน":"Eat","ออกกำลัง":"Train","ร่างกาย":"Body","สถิติการฝึก":"Training stats","สถิติสัปดาห์นี้":"This week's stats","โปรแกรม · คลังท่า · สถานที่":"Programs · library · places"});
// bottom of the training tab: weekly stats + setup shortcuts
document.getElementById("rec-cfg")?.addEventListener("click",openRecCfg);
function trainLinks(box){return;if(!box||box.querySelector(".tr-links"))return;const wk=logs.filter(l=>(ds2d(TODAY)-ds2d(l.date))/864e5<7),v=Math.round(wk.reduce((a,l)=>a+volOf(l),0));
  const c=document.createElement("section");c.className="menu tr-links";
  c.innerHTML=`<!--stats--><button class="menu-row" data-tl="stats" hidden><span class="mi">${licon("chart")||"📊"}</span><span class="mt"><b>${t("สถิติสัปดาห์นี้")}</b><small>${new Set(wk.map(l=>l.date)).size} ${t("วัน")} · ${v.toLocaleString()} kg</small></span><span class="mc">›</span></button>
    `;
  c.querySelector('[data-tl="stats"]').addEventListener("click",()=>{location.hash="stats"});box.appendChild(c)}
