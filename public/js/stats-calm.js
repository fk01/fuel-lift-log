// stats-calm.js — Stats tab in the calm style: greeting + week strip header (same spot as Today/Eat/Train),
// body weight lives on Today, empty states point to where to act.
function renderStatsHead(){const v=document.getElementById("v-stats");if(!v)return;let h=document.getElementById("st-head");
  if(!h){h=document.createElement("div");h.id="st-head";v.prepend(h)}
  const nameOf=(typeof PROFILE!=="undefined"&&PROFILE&&PROFILE.name)||(typeof ME!=="undefined"&&ME&&ME.name)||"";
  const a=new Date(TODAY+"T12:00:00"),off=(a.getDay()+6)%7,wk=[...Array(7)].map((_,i)=>{const d=new Date(a);d.setDate(a.getDate()-off+i);return dkey(d)});
  const on=ds=>logs.some(l=>l.date===ds)||(typeof cxAny==="function"&&cxAny(ds)),n=wk.filter(on).length;
  h.innerHTML=`<div class="hq-hello"><span class="hq-av" aria-hidden="true">${esc((nameOf||"W").trim().charAt(0).toUpperCase())}</span><span class="hq-hi"><small>${thDate(TODAY,{weekday:"long",day:"numeric",month:"long"})}</small><b>${t("ฉันก้าวหน้าแค่ไหน")}</b></span></div>
  <div class="hq-week st-week"><span class="hq-wnav" aria-hidden="true"></span>${wk.map(ds=>`<span class="hq-day ${ds>TODAY?"fut":on(ds)?"ok":ds<TODAY?"miss":"now"}${ds===TODAY?" today sel":""}" aria-label="${thDate(ds,{weekday:"long",day:"numeric"})}${on(ds)?" ✓":""}"><small>${new Date(ds+"T12:00:00").getDate()}</small><span class="hq-dot">${on(ds)?licon("checkc"):ds<TODAY?'<span class="hq-rest"></span>':""}</span><small>${new Date(ds+"T12:00:00").toLocaleDateString(LOC(),{weekday:"narrow"})}</small></span>`).join("")}<span class="hq-wnav" aria-hidden="true"></span></div>
  <small class="hq-streak">${t("สัปดาห์นี้เล่น")} <b class="hq-num">${n}</b> ${t("วัน_s").replace(/_s$/,"")}</small>`}
function decorateStats(){try{renderStatsHead()}catch(e){console.error(e)}
  const fh=document.getElementById("food-hist");if(fh&&fh.querySelector(".empty")&&!fh.querySelector("[data-go-food]"))fh.querySelector(".empty").insertAdjacentHTML("beforeend",`<button class="btn sm" data-go-food>${t("ไปติ๊กมื้อ")} ›</button>`);
  ["hist-chart","sessions"].forEach(id=>{const b=document.getElementById(id);if(b&&b.querySelector(".empty")&&!b.querySelector("[data-go-gym]"))b.querySelector(".empty").insertAdjacentHTML("beforeend",`<button class="btn sm" data-go-gym>${t("ไปเริ่มเล่น")} ›</button>`)});
  const v=document.getElementById("v-stats");if(v&&!document.getElementById("st-bodylink")){const p=document.createElement("button");p.id="st-bodylink";p.className="menu-row";p.innerHTML=`<span class="mi">${licon("body")||licon("scale")}</span><span class="mt"><b>${t("น้ำหนักตัว · BMI")}</b><small>${t("ดูในหน้า Today")}</small></span><span class="mc">›</span>`;p.addEventListener("click",()=>{location.hash="home";setTimeout(()=>{if(!recOpen)document.querySelector("#v-home [data-det]")?.click();document.querySelector("#v-home .hq-body")?.scrollIntoView({block:"start",behavior:"smooth"})},120)});const tools=v.querySelector(".stats-tools");if(tools)tools.prepend(p)}}
document.addEventListener("click",e=>{if(e.target.closest("[data-go-food]"))location.hash="food";else if(e.target.closest("[data-go-gym]"))location.hash="gym"});
window.addEventListener("DOMContentLoaded",()=>{const _ra=renderAll;renderAll=function(){const r=_ra.apply(this,arguments);try{decorateStats()}catch(e){}return r};
  const _show=show;show=function(v){document.body.classList.toggle("on-stats",v==="stats"||v==="body");const r=_show.apply(this,arguments);if(v==="stats"||v==="body"){decorateStats()}return r};setTimeout(decorateStats,0)});
Object.assign(EN,{"ฉันก้าวหน้าแค่ไหน":"How am I progressing?","ไปติ๊กมื้อ":"Tick meals","ไปเริ่มเล่น":"Start a workout","น้ำหนักตัว · BMI":"Body weight · BMI","ดูในหน้า Today":"On the Today tab"});
/* ---- "Copy for AI": a markdown report the user pastes into any chatbot ---- */
function aiReport(){const L=[],d0=new Date(TODAY+"T12:00:00"),ago=n=>{const d=new Date(d0);d.setDate(d.getDate()-n);return dkey(d)},r1=x=>Math.round(x*10)/10;
  const P=(typeof PROFILE!=="undefined"&&PROFILE)||{},goal={cut:"lose fat",bulk:"build muscle",keep:"maintain"}[P.goal]||P.goal||"-";
  L.push(`# My training & nutrition data (WeightGram, exported ${TODAY})`,"",`Please analyse this data like a coach: what is going well, what is lagging, and give me 3–5 concrete changes for the next 4 weeks.`,"");
  L.push("## Profile",`- Sex: ${P.sex==="f"?"female":P.sex==="m"?"male":"-"} · Age: ${P.age||"-"} · Height: ${P.h||"-"} cm`,`- Goal: ${goal} · Activity: ${P.act||"-"}`,`- Daily targets: ${typeof K_GOAL!=="undefined"?K_GOAL:"-"} kcal, protein ${typeof P_TARGET!=="undefined"?P_TARGET:"-"} g${MP&&+MP.c?`, carbs ${MP.c} g`:""}${MP&&+MP.f?`, fat ${MP.f} g`:""}`,"");
  const B=(typeof BODY!=="undefined"?BODY:[]).filter(x=>x.kg>0).slice().sort((a,b)=>a.d.localeCompare(b.d));
  L.push("## Body");if(B.length){const z=B[B.length-1],w4=B.filter(x=>x.d>=ago(28))[0]||B[0];L.push(`- Latest weight: ${z.kg} kg (${z.d})${z.mm?` · muscle ${z.mm} kg`:""}${z.fat?` · body fat ${z.fat}%`:""}`,`- 4-week change: ${r1(z.kg-w4.kg)>0?"+":""}${r1(z.kg-w4.kg)} kg (from ${w4.kg} kg on ${w4.d})`);
    if(P.h){try{const b=bmiOf(z.kg,P.h);L.push(`- BMI: ${b.toFixed(1)} (${EN[bmiZ(b)[2]]||bmiZ(b)[2]}, Asian cut-offs)`)}catch(e){}}
    L.push("","| Date | Weight kg | Muscle kg | Fat % |","|---|---|---|---|",...B.slice(-12).map(x=>`| ${x.d} | ${x.kg} | ${x.mm||""} | ${x.fat||""} |`))}else L.push("- No weigh-ins logged");L.push("");
  const days=[...new Set(logs.map(l=>l.date))].sort(),vol=l=>Object.values(l.ex||{}).flat().filter(s=>s.ok!==false).reduce((a,s)=>a+(+s.kg||0)*(+s.reps||0),0);
  L.push("## Training summary",`- Days trained: ${days.length} total · last 4 weeks ${days.filter(d=>d>=ago(28)).length} · this week ${days.filter(d=>d>=ago((d0.getDay()+6)%7)).length}`);
  try{L.push(`- Week streak: ${weekStreak()} (best ${bestStreak()})`)}catch(e){}
  L.push(`- Total volume lifted: ${Math.round(logs.reduce((a,l)=>a+vol(l),0)).toLocaleString("en")} kg`,"");
  const recent=logs.filter(l=>l.date>=ago(28)).sort((a,b)=>b.date.localeCompare(a.date));
  if(recent.length){L.push("## Sessions (last 4 weeks)","| Date | Program | Sets | Volume kg |","|---|---|---|---|",...recent.map(l=>`| ${l.date} | ${(PROGS[l.prog]||{}).name||l.prog} | ${Object.values(l.ex||{}).flat().length} | ${Math.round(vol(l))} |`),"")}
  const ex={};logs.slice().sort((a,b)=>a.date.localeCompare(b.date)).forEach(l=>Object.entries(l.ex||{}).forEach(([id,ss])=>{const ok=ss.filter(s=>+s.kg>0&&+s.reps>0);if(!ok.length)return;const top=ok.reduce((a,s)=>+s.kg>+a.kg?s:a),e1=Math.max(...ok.map(s=>s.kg*(1+s.reps/30)));const o=ex[id]=ex[id]||{n:exName(id),first:null,best:0,bestE:0,last:null,count:0};o.count++;if(!o.first)o.first={d:l.date,kg:+top.kg,r:top.reps};o.last={d:l.date,kg:+top.kg,r:top.reps};o.best=Math.max(o.best,+top.kg);o.bestE=Math.max(o.bestE,e1)}));
  const xs=Object.values(ex).sort((a,b)=>b.count-a.count);
  if(xs.length){L.push("## Exercise progress (top set per session)","| Exercise | Sessions | First | Latest | Best kg | Est. 1RM kg |","|---|---|---|---|---|---|",...xs.slice(0,25).map(o=>`| ${o.n} | ${o.count} | ${o.first.kg}×${o.first.r} (${o.first.d}) | ${o.last.kg}×${o.last.r} (${o.last.d}) | ${o.best} | ${Math.round(o.bestE)} |`),"")}
  try{const R=recPct();L.push("## Muscle recovery now","| Muscle | Recovered | Last trained |","|---|---|---|",...REC_ORDER.map(m=>`| ${EN[MUS_NAME[m]]||MUS_NAME[m]} | ${R[m]?R[m].pct+"%":"never"} | ${R[m]&&R[m].days!=null?R[m].days+" days ago":"-"} |`),"")}catch(e){}
  try{const wk=[...Array(14)].map((_,i)=>ago(13-i)).filter(ds=>food[ds]);if(wk.length){const ms=mealList();L.push("## Nutrition (last 14 days)","| Date | kcal | Meals ticked |","|---|---|---|",...wk.map(ds=>`| ${ds} | ${typeof dayKcal==="function"?dayKcal(ds):"-"} | ${Object.keys((food[ds]||{}).done||{}).length}/${ms.length} |`),"")}else L.push("## Nutrition","- No meals ticked yet","")}catch(e){}
  const T=days.length,BS=(()=>{try{return bestStreak()}catch(e){return 0}})(),V=logs.reduce((a,l)=>a+vol(l),0);
  const ach=[[T>=1,"First workout"],[T>=10,"10 training days"],[T>=25,"25 training days"],[T>=50,"50 training days"],[BS>=4,"4-week streak"],[BS>=12,"12-week streak"],[V>=1e4,"10,000 kg lifted"],[V>=1e5,"100,000 kg lifted"]].filter(a=>a[0]).map(a=>a[1]);
  L.push("## Achievements",ach.length?ach.map(a=>"- ✅ "+a).join("\n"):"- None yet");
  return L.join("\n")}
async function copyAI(){const md=aiReport();let ok=false;try{await navigator.clipboard.writeText(md);ok=true}catch(e){}
  openGen(t("ส่งให้ AI วิเคราะห์"),`<small class="note">${t(ok?"คัดลอกแล้ว — ไปวางในแชท ChatGPT / Claude / Gemini ได้เลย":"กดค้างที่ข้อความ เลือกทั้งหมด แล้วคัดลอก")}</small><textarea class="ai-md" readonly>${esc(md)}</textarea><div class="actions sheet-act"><button class="btn" data-gen-close>${t("ปิด")}</button><button class="btn primary" data-aicopy style="flex:1">⧉ ${t("คัดลอกอีกครั้ง")}</button></div>`,
    b=>{const ta=b.querySelector(".ai-md");b.querySelector("[data-aicopy]").addEventListener("click",async()=>{try{await navigator.clipboard.writeText(md);toast("✓ "+t("คัดลอกแล้ว"))}catch(e){ta.focus();ta.select();try{document.execCommand("copy");toast("✓ "+t("คัดลอกแล้ว"))}catch(_){}}})})}
function placeAIButton(){const h=document.getElementById("st-head");if(!h||h.querySelector("[data-ai]"))return;h.insertAdjacentHTML("beforeend",`<button class="btn st-ai" data-ai><span aria-hidden="true">✦</span> ${t("ให้ AI วิเคราะห์ข้อมูล")}<small>${t("คัดลอกสถิติไปวางในแชทบอท")}</small></button>`);h.querySelector("[data-ai]").addEventListener("click",()=>openAICoach("analyse"))}
{const _d=decorateStats;decorateStats=function(){_d();try{placeAIButton()}catch(e){}}}
Object.assign(EN,{"ส่งให้ AI วิเคราะห์":"Send to AI","คัดลอกแล้ว — ไปวางในแชท ChatGPT / Claude / Gemini ได้เลย":"Copied — paste it into ChatGPT / Claude / Gemini","กดค้างที่ข้อความ เลือกทั้งหมด แล้วคัดลอก":"Press and hold the text, Select All, then Copy","คัดลอกอีกครั้ง":"Copy again","คัดลอกแล้ว":"Copied","ส่งข้อมูลให้ AI วิเคราะห์":"Ask AI to analyse my data","คัดลอกเป็น Markdown ไปวางในแชทบอท":"Copies a Markdown summary to paste in any chatbot"});

Object.assign(EN,{"วิเคราะห์สถิติ · จัดโปรแกรมท่า · จัดตารางอาหาร":"Analyse stats · build programs · plan meals"});

Object.assign(EN,{"ให้ AI วิเคราะห์ข้อมูล":"Ask AI to analyse my data","คัดลอกสถิติไปวางในแชทบอท":"Copy your stats to paste into a chatbot"});
/* first load straight into a tab (#food, #gym…): set the tab class too, so the old big title stays hidden */
window.addEventListener("load",()=>{const v=(typeof curView!=="undefined"&&curView)||location.hash.slice(1)||"home";document.body.classList.toggle("on-home",v==="home");document.body.classList.toggle("on-food",v==="food");document.body.classList.toggle("on-gym",v==="gym");document.body.classList.toggle("on-stats",v==="stats"||v==="body")});
/* Ask AI card sits right under the week strip on Eat and Train too (same spot as Stats) */
function placeAICards(){[["#v-food","[data-aikind=meal]"]].forEach(([v,sel])=>{const box=document.querySelector(v),c=box&&box.querySelector(sel),s=box&&[...box.querySelectorAll(".hq-streak")].find(x=>x.offsetParent);if(c&&s&&s.nextElementSibling!==c)s.after(c)})}
{const _d=decorateStats;decorateStats=function(){_d();try{placeAICards()}catch(e){}}}

window.addEventListener("DOMContentLoaded",()=>{["renderFood","renderEatCal"].forEach(n=>{if(typeof window[n]!=="function")return;const o=window[n];window[n]=function(){const r=o.apply(this,arguments);try{placeAICards()}catch(e){}return r}})});
/* a reload starts at the top of the tab (layout settles after first paint and the browser kept the old offset) */
try{history.scrollRestoration="manual"}catch(e){}
window.addEventListener("load",()=>{const top=()=>{const w=typeof appScroll==="function"&&appScroll();if(w)w.scrollTop=0};top();requestAnimationFrame(top);setTimeout(top,300)});
