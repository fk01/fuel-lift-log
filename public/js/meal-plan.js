// meal-plan.js — edit the daily meal plan (targets, meals, run/badminton extras). Works on a draft via edit-tx.js.
// Classic script: shares globals with the other files in /js (load order is set in index.html).
const mpClone=()=>JSON.parse(JSON.stringify({meals:MEALS,run:EXTRAS.run,bad:EXTRAS.bad,p:P_TARGET,k:K_GOAL}));
const mpFld="min-width:0;box-sizing:border-box;background:var(--bg);color:var(--fg);border:1px solid var(--line);border-radius:8px;padding:8px;font:inherit";
function mpTouch(){mpApply();save("mealplan",MP)}
function mpMealRow(m,i,kind){const list=MP.meals,fixed=kind!=="meal";
  return `<div class="mp-row" data-i="${i}" data-kind="${kind}">
    <div class="mp-top">${fixed?`<span class="mp-ic">${licon(kind==="run"?"run":"racket")}</span>`:`<input type="time" data-f="time" value="${esc(/^\d\d:\d\d$/.test(m.time)?m.time:"")}" style="${mpFld};width:6.6em">`}
      <input data-f="name" value="${esc(m.name||"")}" placeholder="${t("ชื่อมื้อ")}" style="${mpFld};flex:1">
      ${fixed?"":`<button class="btn sm" data-mv="-1" ${i===0?"disabled":""} aria-label="${t("เลื่อนขึ้น")}">↑</button><button class="btn sm" data-mv="1" ${i===list.length-1?"disabled":""} aria-label="${t("เลื่อนลง")}">↓</button><button class="btn sm ghost" data-del aria-label="${t("ลบมื้อ")}">✕</button>`}</div>
    <div class="mp-num"><label>kcal<input inputmode="numeric" data-f="k" value="${+m.k||0}" style="${mpFld}"></label><label>${t("โปรตีน")} g<input inputmode="numeric" data-f="p" value="${+m.p||0}" style="${mpFld}"></label>${fixed?"":`<label class="mp-vit"><input type="checkbox" data-f="vit" ${m.vit?"checked":""}> ${t("วิตามิน")}</label>`}</div>
    <textarea data-f="items" rows="2" placeholder="${t("รายการอาหาร (บรรทัดละ 1 อย่าง)")}" style="${mpFld};width:100%;resize:vertical">${esc((m.items||[]).join("\n"))}</textarea></div>`}
function openMealPlan(){MP=MP||mpClone();if(!MP.meals)MP=mpClone();
  const draw=b=>{const body=b.querySelector(".mp-body");
    body.innerHTML=`<div class="card mp-card"><b>${t("เป้าต่อวัน")}</b><div class="mp-num"><label>kcal<input inputmode="numeric" data-g="k" value="${K_GOAL}" style="${mpFld}"></label><label>${t("โปรตีน")} g<input inputmode="numeric" data-g="p" value="${P_TARGET}" style="${mpFld}"></label></div></div>
      <div class="card mp-card"><b>${t("มื้อประจำวัน")}</b>${MP.meals.map((m,i)=>mpMealRow(m,i,"meal")).join("")}<button class="pl-add" data-addm>+ ${t("เพิ่มมื้อ")}</button></div>
      <div class="card mp-card"><b>${t("มื้อเสริมตามกิจกรรม")}</b>${mpMealRow(MP.run,0,"run")}${mpMealRow(MP.bad,0,"bad")}</div>`;
    body.querySelectorAll("[data-g]").forEach(x=>x.addEventListener("change",()=>{MP[x.dataset.g]=Math.max(0,+x.value||0);mpTouch()}));
    body.querySelectorAll(".mp-row").forEach(r=>{const kind=r.dataset.kind,i=+r.dataset.i,m=kind==="meal"?MP.meals[i]:MP[kind];
      r.querySelectorAll("[data-f]").forEach(x=>x.addEventListener("change",()=>{const f=x.dataset.f;
        if(f==="k"||f==="p")m[f]=Math.max(0,+x.value||0);else if(f==="vit")m.vit=x.checked?1:0;else if(f==="items")m.items=x.value.split("\n").map(s=>s.trim()).filter(Boolean);else m[f]=x.value.trim();mpTouch()}));
      r.querySelectorAll("[data-mv]").forEach(x=>x.addEventListener("click",()=>{const j=i+ +x.dataset.mv;MP.meals.splice(j,0,MP.meals.splice(i,1)[0]);mpTouch();draw(b)}));
      r.querySelector("[data-del]")?.addEventListener("click",ev=>{const x=ev.currentTarget;if(!x.dataset.sure){x.dataset.sure=1;x.textContent=t("ลบ?");return}MP.meals.splice(i,1);mpTouch();draw(b)})});
    body.querySelector("[data-addm]").addEventListener("click",()=>{MP.meals.push({id:"m"+Date.now().toString(36),time:"",name:"",k:0,p:0,items:[]});mpTouch();draw(b);const r=b.querySelectorAll('.mp-row[data-kind="meal"]');r[r.length-1]?.querySelector('[data-f="name"]').focus()})};
  openGen("✎ "+t("แผนกิน"),`<div class="mp-body stack" style="gap:10px"></div>`,b=>{txBegin("gen",{onEnd:()=>{document.getElementById("gen-sheet").hidden=true;try{renderFood();renderGym()}catch(e){}}});draw(b)})}
Object.assign(EN,{"แผนกิน":"Meal plan","เป้าต่อวัน":"Daily targets","มื้อประจำวัน":"Daily meals","มื้อเสริมตามกิจกรรม":"Activity extras","เพิ่มมื้อ":"Add meal","ชื่อมื้อ":"Meal name","ลบมื้อ":"Delete meal","รายการอาหาร (บรรทัดละ 1 อย่าง)":"Items (one per line)","วิตามิน":"Vitamins","จัดการแผน":"Manage plan","แผนกินวันนี้":"Today's meals","กินแล้ว":"Eaten"});
document.getElementById("mp-open")?.addEventListener("click",openMealPlan);
// "What to eat?" on the Today screen: the whole food view is moved under the plan (and back before each re-render)
const FOOD_HOME=document.createComment("food-home");document.getElementById("v-food").before(FOOD_HOME);
function foodHomeBack(){const fv=document.getElementById("v-food");if(fv&&fv.parentNode!==FOOD_HOME.parentNode)FOOD_HOME.after(fv);if(fv)fv.hidden=true}
function todayMeals(box){if(!box||box.querySelector(".eat-h"))return;const h=document.createElement("h2");h.className="dp-sub eat-h";h.textContent=t("วันนี้กินอะไร?");
  const slot=document.createElement("div");slot.className="eat-slot";const fv=document.getElementById("v-food");fv.hidden=curView!=="gym";slot.appendChild(fv);box.append(h,slot);try{renderFood()}catch(e){}}
Object.assign(EN,{"วันนี้กินอะไร?":"What to eat?"});
