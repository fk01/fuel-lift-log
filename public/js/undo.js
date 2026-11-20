// undo.js — every save the user makes can be undone: save() reports the previous value of each key it writes;
// writes from one tap are grouped, and an "Undo" bar restores them all (memory + storage, then syncs).
// Classic script: shares globals with the other files in /js (load order is set in index.html).
const UNDO_SET={gymlog:v=>logs=v,mealcheck:v=>food=v,progs:v=>PROGS=v,locs:v=>LOCS=v,exlib:v=>EXLIB=v,body:v=>BODY=v,dayplan:v=>dayPlan=v,
  daykind:v=>dayKind=v,locday:v=>locDay=v,daymode:v=>dayModeS=v,gymdraft:v=>draft=v,mealplan:v=>{MP=v;mpApply()}};
// keys that alone are routine (ticking a set / a meal is undone by tapping again) — no Undo bar for them
const UNDO_QUIET=new Set(["gymdraft","mealcheck","daymode","locday","daykind"]);
const UNDO_VIEW=new Set(["daymode","locday","daykind"]);   // screen state, not data — never rolled back
let undoGrp=null,undoLast=null,undoBusy=false,userAt=0,undoMsg="";
// make the current tap's group show the Undo bar even if it only touched quiet keys (e.g. discarding a workout)
function undoLoud(msg){undoMsg=msg||"";if(undoGrp)undoGrp.loud=true}
["pointerdown","keydown","change"].forEach(e=>document.addEventListener(e,()=>{userAt=Date.now()},true));
function undoNote(k,prev){if(undoBusy||!(k in UNDO_SET)||UNDO_VIEW.has(k)||Date.now()-userAt>2500)return;
  if(!undoGrp){undoGrp=new Map();setTimeout(undoShow,0)}if(!undoGrp.has(k))undoGrp.set(k,prev)}
function undoShow(){const g=undoGrp;undoGrp=null;if(!g||!g.loud&&![...g.keys()].some(k=>!UNDO_QUIET.has(k)||(k==="mealcheck"&&foodLogChanged(g.get(k)))))return;
  undoLast=g;let b=document.getElementById("undo-bar");
  if(!b){b=document.createElement("div");b.id="undo-bar";b.className="undo-bar";b.innerHTML=`<span></span><button class="btn sm" data-undo></button>`;document.body.appendChild(b);
    b.querySelector("[data-undo]").addEventListener("click",undoRun)}
  b.querySelector("span").textContent=undoMsg||"✓ "+t("บันทึกแล้ว");undoMsg="";b.querySelector("[data-undo]").textContent="↺ "+t("เลิกทำ");b.hidden=false;
  clearTimeout(b._t);b._t=setTimeout(()=>{b.hidden=true;undoLast=null},8000)}
// a food-log entry added / edited / removed (not just a tick) is worth an Undo bar
function foodLogChanged(prevRaw){try{const a=JSON.parse(prevRaw||"{}")[DAY]||{},b=food[DAY]||{};return JSON.stringify([a.log||[],a.tags||{}])!==JSON.stringify([b.log||[],b.tags||{}])}catch(e){return false}}
function undoRun(){const g=undoLast;undoLast=null;document.getElementById("undo-bar").hidden=true;if(!g)return;undoBusy=true;
  try{g.forEach((raw,k)=>{let v=null;try{v=JSON.parse(raw)}catch(e){}if(v==null)v=k==="gymlog"||k==="body"||k==="exlib"?[]:k==="mealplan"||k==="locs"?null:{};UNDO_SET[k](v);save(k,v)});
    if(g.has("mealcheck"))food[TODAY]=food[TODAY]||{done:{},tags:{}};
    if(g.has("gymdraft")){if(draft.prog&&PROGS[draft.prog]&&Object.values(draft.ex||{}).flat().some(r=>r.ok)){cur=draft.prog;picked=true;chosen=true;setDayMode("train")}else if(!PROGS[cur])cur=nextProg()}
    renderAll()}catch(e){}undoBusy=false;toast("↺ "+t("เลิกทำแล้ว"))}
Object.assign(EN,{"ทิ้งแล้ว":"Discarded","เลิกทำ":"Undo","เลิกทำแล้ว":"Undone"});
// re-rendering Today empties and refills the list; keep the reader where they were unless code asked for the top
{const rg=renderGym;renderGym=function(){const w=appScroll(),y=w?w.scrollTop:0;rg.apply(this,arguments);if(curView==="home")try{renderHome()}catch(e){}if(w&&!scrollReset&&y&&Math.abs(w.scrollTop-y)>2)w.scrollTop=y}}
