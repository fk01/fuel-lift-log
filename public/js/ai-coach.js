// ai-coach.js — round-trip with any chatbot: copy a prompt (my data + an exact JSON format),
// paste the AI reply back, preview, then create programs / replace the meal plan.
const AI_PROG_SCHEMA=`{
  "type": "weightgram.programs",
  "version": 1,
  "programs": [
    {
      "name": "Push A",                 // short program name
      "place": "gym",                   // one of: PLACES
      "days": [1, 4],                   // weekdays to train: 0=Sun 1=Mon … 6=Sat (optional)
      "exercises": [
        { "name": "Barbell Bench Press", "sets": 4, "reps": "6-8", "rest_sec": 120 }
      ]
    }
  ]
}`;
const AI_MEAL_SCHEMA=`{
  "type": "weightgram.mealplan",
  "version": 1,
  "daily_kcal": 2200,
  "daily_protein_g": 160,
  "daily_carbs_g": 230,
  "daily_fat_g": 65,
  "meals": [
    { "time": "08:00", "name": "Breakfast", "kcal": 550, "protein_g": 40, "carbs_g": 70, "fat_g": 12, "items": ["Oats 80 g", "Whey 1 scoop", "Banana 1"] }
  ]
}`;
function aiPlaces(){return (LOCS||[]).filter(l=>hasType(l,"gym")).map(l=>`"${l.id}" (${EN[l.name]||l.name}: ${(l.eq||[]).join(", ")||"bodyweight"})`).join(", ")}
function aiPrompt(kind){const prog=kind==="prog",cur=prog?Object.values(PROGS).filter(p=>p.ex&&p.ex.length&&!isCardio(p)).map(p=>`- ${p.name} (${locOf(p)}): ${p.ex.map(e=>`${e.n} ${e.s}×${e.r}`).join(", ")}`).join("\n")
    :(MEALS||[]).map(m=>`- ${m.time} ${EN[m.name]||m.name}: ${m.k} kcal, P ${m.p} g, C ${+m.c||0} g, F ${+m.f||0} g — ${(m.items||[]).join(", ")}`).join("\n");
  return [aiReport(),"","---","",prog?"## Task: design my weekly workout programs":"## Task: design my daily meal plan","",
    prog?"Based on my data above, build a weekly training plan that fits my goal, recovery and available places/equipment. Use common exercise names (e.g. from ExerciseDB) so they match my library.":"Based on my data above, build one daily meal plan that hits my calorie and protein targets for my goal. Use simple, easy-to-buy foods with grams, and give protein, carbs and fat for every meal.",
    "",`### My current ${prog?"programs":"meal plan"}`,cur||"- none","",
    prog?`### Places I can train\n${aiPlaces()}`:"",
    "","### Reply format (required)","Explain briefly, then put the plan in ONE ```json code block that matches exactly this format (no comments, valid JSON):","```json",(prog?AI_PROG_SCHEMA.replace("one of: PLACES","one of the place ids above"):AI_MEAL_SCHEMA).replace(/\s*\/\/.*$/gm,""),"```"].filter(x=>x!==undefined).join("\n")}
function aiExtractJSON(txt){const m=txt.match(/```(?:json)?\s*([\s\S]*?)```/i);let s=(m?m[1]:txt).trim();const a=s.indexOf("{"),b=s.lastIndexOf("}");if(a<0||b<a)throw new Error(t("ไม่เจอ JSON ในข้อความ"));s=s.slice(a,b+1).replace(/\/\/[^\n"]*$/gm,"").replace(/,\s*([}\]])/g,"$1");return JSON.parse(s)}
const aiSlug=s=>String(s).toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"").slice(0,40)||"x";
function aiFindEx(name){const n=String(name).trim().toLowerCase(),pool=EXLIB.concat(CAT||[]);return pool.find(x=>x.n.toLowerCase()===n)||pool.find(x=>x.n.toLowerCase().replace(/[^a-z]/g,"")===n.replace(/[^a-z]/g,""))}
function aiParse(txt){const j=aiExtractJSON(txt);
  if(j.type==="weightgram.programs"||Array.isArray(j.programs)){const ps=(j.programs||[]).filter(p=>p&&p.name&&Array.isArray(p.exercises)&&p.exercises.length);if(!ps.length)throw new Error(t("ไม่มีโปรแกรมในข้อมูล"));
    return{kind:"prog",items:ps.map(p=>({name:String(p.name).slice(0,40),place:locById(p.place)?p.place:(LOCS[0]||{}).id||"gym",days:(p.days||[]).map(Number).filter(d=>d>=0&&d<=6),ex:p.exercises.filter(e=>e&&e.name).map(e=>{const f=aiFindEx(e.name);return{name:String(e.name),match:f,s:Math.max(1,Math.min(10,+e.sets||3)),r:String(e.reps||"8-12").slice(0,10),rest:+e.rest_sec||0}})}))}}
  if(j.type==="weightgram.mealplan"||Array.isArray(j.meals)){const ms=(j.meals||[]).filter(m=>m&&m.name);if(!ms.length)throw new Error(t("ไม่มีมื้อในข้อมูล"));
    const sum=k=>ms.reduce((a,m)=>a+(+m[k]||0),0);return{kind:"meal",name:j.name?String(j.name).slice(0,40):"",c:Math.round(+j.daily_carbs_g||sum("carbs_g")),f:Math.round(+j.daily_fat_g||sum("fat_g")),k:Math.round(+j.daily_kcal||ms.reduce((a,m)=>a+(+m.kcal||0),0)),p:Math.round(+j.daily_protein_g||ms.reduce((a,m)=>a+(+m.protein_g||0),0)),meals:ms.map((m,i)=>({id:"m"+(i+1),time:/^\d{1,2}:\d{2}$/.test(m.time)?m.time.padStart(5,"0"):"",name:String(m.name).slice(0,40),k:Math.round(+m.kcal||0),p:Math.round(+m.protein_g||0),c:Math.round(+m.carbs_g||0),f:Math.round(+m.fat_g||0),items:(m.items||[]).map(String).slice(0,12)})).sort((a,b)=>a.time.localeCompare(b.time))}}
  throw new Error(t("รูปแบบไม่ตรง — ต้องเป็น weightgram.programs หรือ weightgram.mealplan"))}
function aiApply(d){
  if(d.kind==="prog"){const made=[];d.items.forEach(p=>{let k="ai-"+aiSlug(p.name)+"-"+p.place;while(PROGS[k])k+="-2";
      const ex=p.ex.map(e=>{let x=e.match?adoptCat(e.match):null;if(!x){x={id:"ai-"+aiSlug(e.name),n:e.name,z:"🔩"};if(!EXLIB.some(q=>q.id===x.id)){EXLIB.push(x);save("exlib",EXLIB)}}const o={...libPick(x),s:e.s,r:e.r};if(e.rest>=15)restCfg[x.id]=Math.min(600,e.rest);return o});
      PROGS[k]={name:p.name,sub:"AI",loc:p.place,ex,...(p.days.length?{days:p.days}:{})};made.push(p.name)});saveProgs();save("restcfg",restCfg);renderAll();toast("✓ "+t("สร้างโปรแกรมแล้ว")+": "+made.join(", "))}
  else{mpAdd({k:d.k,p:d.p,c:d.c,f:d.f,meals:d.meals},d.name||"AI "+new Date().toLocaleDateString(LOC(),{day:"numeric",month:"short"}));renderAll();toast("✓ "+t("ใช้แผนกินใหม่แล้ว"))}}
function aiPreview(d){if(d.kind==="prog")return d.items.map(p=>`<div class="card ai-pv"><b>${esc(p.name)}</b><small>${esc(t((locById(p.place)||{}).name||p.place))}${p.days.length?" · "+p.days.map(x=>new Date(2026,10,22+x).toLocaleDateString(LOC(),{weekday:"short"})).join(" "):""}</small><ol>${p.ex.map(e=>`<li>${esc(e.name)} <small>${e.s}×${esc(e.r)}${e.match?"":` · <i class="ai-new">${t("ท่าใหม่")}</i>`}</small></li>`).join("")}</ol></div>`).join("");
  return `<div class="card ai-pv"><b>${d.k} kcal · P ${d.p} g · C ${d.c} g · F ${d.f} g</b><ol>${d.meals.map(m=>`<li>${esc(m.time)} ${esc(m.name)} <small>${m.k} kcal · P ${m.p} · C ${m.c} · F ${m.f} g</small><br><small>${esc(m.items.join(", "))}</small></li>`).join("")}</ol><small class="note">${t("บันทึกเป็นแผนใหม่ แผนเดิมยังอยู่ใน Manage plan")}</small></div>`}
async function aiCopy(txt){try{await navigator.clipboard.writeText(txt);return true}catch(e){return false}}
function openAICoach(only){const box=b=>{
    b.querySelectorAll("[data-aiask]").forEach(x=>x.addEventListener("click",async()=>{const k=x.dataset.aiask,txt=k==="analyse"?aiReport():aiPrompt(k),ok=await aiCopy(txt);const ta=b.querySelector(".ai-md");ta.hidden=false;ta.value=txt;if(!ok){ta.focus();ta.select()}toast(ok?"✓ "+t("คัดลอกแล้ว — ไปวางในแชทบอท"):t("กดค้าง เลือกทั้งหมด แล้วคัดลอก"))}));
    b.querySelector("[data-aipaste]")?.addEventListener("click",async()=>{const ta=b.querySelector(".ai-in");try{if(!ta.value&&navigator.clipboard.readText)ta.value=await navigator.clipboard.readText()}catch(e){}
      const out=b.querySelector(".ai-out");try{const d=aiParse(ta.value);out.innerHTML=aiPreview(d)+`<button class="btn primary" data-aiok style="width:100%">✓ ${t(d.kind==="prog"?"สร้างโปรแกรมนี้":"ใช้แผนกินนี้")}</button>`;out.querySelector("[data-aiok]").addEventListener("click",()=>{aiApply(d);closeGen()})}
      catch(e){out.innerHTML=`<p class="field-err">${esc(e.message||String(e))}</p>`}})};
  try{loadCat()}catch(e){}
  openGen("✦ "+t(only==="prog"?"ให้ AI จัดโปรแกรมท่า":only==="meal"?"ให้ AI จัดตารางอาหาร":only==="analyse"?"ให้ AI วิเคราะห์ข้อมูล":"โค้ช AI"),`<small class="note">${t(only==="analyse"?"กดเพื่อคัดลอก แล้วไปวางในแชท ChatGPT / Claude / Gemini":"1) คัดลอกคำขอ ไปวางในแชทบอท  2) คัดลอกคำตอบกลับมา วางด้านล่าง")}</small>
    <div class="ai-acts${only?" only-"+only:""}"><button class="menu-row" data-aiask="analyse"><span class="mi">${licon("bar")}</span><span class="mt"><b>${t("วิเคราะห์ข้อมูลของฉัน")}</b><small>${t("คำแนะนำจากสถิติ")}</small></span><span class="mc">⧉</span></button>
    <button class="menu-row" data-aiask="prog"><span class="mi">${licon("dumbbell")}</span><span class="mt"><b>${t("ให้ AI จัดโปรแกรมท่า")}</b><small>${t("ได้ JSON กลับมาสร้างโปรแกรม")}</small></span><span class="mc">⧉</span></button>
    <button class="menu-row" data-aiask="meal"><span class="mi">${licon("bowl")}</span><span class="mt"><b>${t("ให้ AI จัดตารางอาหาร")}</b><small>${t("ได้ JSON กลับมาเป็นแผนกิน")}</small></span><span class="mc">⧉</span></button></div>
    <textarea class="ai-md" readonly hidden></textarea>
    ${only==="analyse"?"":`<b class="ai-h">${t("วางคำตอบจาก AI")}</b><textarea class="ai-in" placeholder="${t("วางคำตอบทั้งหมดที่มี ```json ... ``` ตรงนี้")}"></textarea>
    <button class="btn" data-aipaste>${t("ตรวจและดูตัวอย่าง")}</button><div class="ai-out stack" style="gap:10px"></div>`}
    <button class="btn ghost" data-gen-close>${t("ปิด")}</button>`,box)}
Object.assign(EN,{"โค้ช AI":"AI coach","1) คัดลอกคำขอ ไปวางในแชทบอท  2) คัดลอกคำตอบกลับมา วางด้านล่าง":"1) Copy a request and paste it into a chatbot  2) Copy its reply and paste it below","วิเคราะห์ข้อมูลของฉัน":"Analyse my data","คำแนะนำจากสถิติ":"Advice from my stats","ให้ AI จัดโปรแกรมท่า":"Ask AI for workout programs","ได้ JSON กลับมาสร้างโปรแกรม":"Reply comes back as JSON to create programs","ให้ AI จัดตารางอาหาร":"Ask AI for a meal plan","ได้ JSON กลับมาเป็นแผนกิน":"Reply comes back as JSON for your meal plan","วางคำตอบจาก AI":"Paste the AI reply","วางคำตอบทั้งหมดที่มี ```json ... ``` ตรงนี้":"Paste the whole reply with ```json … ``` here","ตรวจและดูตัวอย่าง":"Check & preview","สร้างโปรแกรมนี้":"Create these programs","ใช้แผนกินนี้":"Use this meal plan","สร้างโปรแกรมแล้ว":"Programs created","ใช้แผนกินใหม่แล้ว":"New meal plan in use","ท่าใหม่":"new exercise","บันทึกเป็นแผนใหม่ แผนเดิมยังอยู่ใน Manage plan":"Your current meal plan will be replaced","ไม่เจอ JSON ในข้อความ":"No JSON found in the reply","ไม่มีโปรแกรมในข้อมูล":"No programs in the JSON","ไม่มีมื้อในข้อมูล":"No meals in the JSON","รูปแบบไม่ตรง — ต้องเป็น weightgram.programs หรือ weightgram.mealplan":"Wrong format — must be weightgram.programs or weightgram.mealplan","คัดลอกแล้ว — ไปวางในแชทบอท":"Copied — paste it into the chatbot","กดค้าง เลือกทั้งหมด แล้วคัดลอก":"Press and hold, Select All, then Copy"});

document.addEventListener("click",e=>{const b=e.target.closest&&e.target.closest("[data-aikind]");if(b){e.stopPropagation();openAICoach(b.dataset.aikind)}});
Object.assign(EN,{"ให้ AI จัด":"Ask AI"});

Object.assign(EN,{"กดเพื่อคัดลอก แล้วไปวางในแชท ChatGPT / Claude / Gemini":"Tap to copy, then paste into ChatGPT / Claude / Gemini"});
