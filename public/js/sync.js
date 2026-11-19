// sync.js — cloud sync with the Worker API
// Classic script: shares globals with the other files in /js (load order is set in index.html).
/* ---------- cloud sync ---------- */
let col=null,dirty=new Set(),syncT=null,syncing=false,syncedLogs={};
const logId=l=>`g-${l.date}-${l.prog}`;
function syncMsg(t){document.getElementById("sync").textContent=t}
let foodDirty=new Set();
function markDirty(k){if(k==="mealcheck")foodDirty.add(DAY);if(!col)return;dirty.add(k);clearTimeout(syncT);syncT=setTimeout(flush,800)}
async function flush(){
  if(syncing){syncT=setTimeout(flush,500);return}
  syncing=true;const keys=[...dirty];dirty.clear();
  try{
    for(const k of keys){
      if(k==="mealcheck"){const ds=[...foodDirty];foodDirty.clear();for(const dd of ds)await col.doc("f-"+dd).set({date:dd,...food[dd]})}
      if(k==="gymlog"){
        const now2={};logs.forEach(l=>now2[logId(l)]=JSON.stringify(l));
        for(const id in now2)if(syncedLogs[id]!==now2[id]){await col.doc(id).set(JSON.parse(now2[id]));syncedLogs[id]=now2[id]}
        for(const id in syncedLogs)if(!(id in now2)){await col.doc(id).delete();delete syncedLogs[id]}
      }
      if(k==="body")await col.doc("body").set({list:BODY});
      if(k==="restcfg"||k==="gymdraft"||k==="progs"||k==="unit"||k==="exlib")await col.doc("settings").set({restCfg,draft,progs:PROGS,locs:LOCS,lib:EXLIB,progsRev,unit,scheme:SCHEME});
    }
    syncMsg(t("ซิงก์แล้ว ✓"));
  }catch(e){keys.forEach(k=>dirty.add(k));syncMsg(t("ซิงก์ไม่สำเร็จ"))}
  syncing=false;
}
async function cloudLoad(){
  const timer=setTimeout(()=>{if(!col)syncMsg(t("ออฟไลน์ · เก็บในเครื่องนี้"))},10000);
  try{
    const c=API;let snap;
    try{snap=await c.get()}catch(e){clearTimeout(timer);if(e&&e.code==="auth"){showLogin();syncMsg(t("ออฟไลน์ · เก็บในเครื่องนี้"));return}throw e}
    clearTimeout(timer);
    const toUpload=new Set();
    if(snap.empty){toUpload.add("gymlog");toUpload.add("restcfg");}
    const seenF=new Set();
    snap.docs.forEach(d=>{const v=JSON.parse(JSON.stringify(d.data()||{}));
      if(d.id.startsWith("f-")){const {date,...rest}=v;food[date]=rest;seenF.add(date)}
      else if(d.id.startsWith("g-")){const i=logs.findIndex(l=>logId(l)===d.id);if(i>=0)logs[i]=v;else logs.push(v);syncedLogs[d.id]=JSON.stringify(v)}
      else if(d.id==="body"){if(Array.isArray(v.list))BODY=v.list;try{localStorage.setItem("body",JSON.stringify(BODY))}catch(e){}}
      else if(d.id==="settings"){Object.assign(restCfg,v.restCfg||{});if(v.progs){PROGS=v.progs;if((v.scheme||1)<SCHEME){to5x5();toUpload.add("progs")}}if(Array.isArray(v.lib))EXLIB=v.lib;if(Array.isArray(v.locs)&&v.locs.length){LOCS=v.locs;try{localStorage.setItem("locs",JSON.stringify(LOCS))}catch(e){}}else if(v.progs)LOCS=null;setProgsRev(+v.progsRev||0);if(v.unit)unit=v.unit;if(v.draft&&v.draft.prog&&!draft.prog)draft=v.draft}
    });
    logs.sort((a,b)=>a.date.localeCompare(b.date));
    food[TODAY]=food[TODAY]||{done:{},tags:{}};
    col=c;
    // ย้ายข้อมูลเดิมในเครื่องที่ยังไม่เคยอยู่บนบัญชี
    for(const date of Object.keys(food))if(!seenF.has(date)&&Object.keys(food[date].done||{}).length){await c.doc("f-"+date).set({date,...food[date]})}
    if(ensureLocs()){addSubsToLib(Object.values(PROGS).flatMap(p=>p.ex));saveProgs();toUpload.add("progs");toUpload.add("exlib")}if(!locById(curLoc))curLoc=LOCS[0].id;
    if(ensureLib())toUpload.add("exlib");
    if(logs.some(l=>!syncedLogs[logId(l)]))toUpload.add("gymlog");
    try{localStorage.setItem("mealcheck",JSON.stringify(food));localStorage.setItem("gymlog",JSON.stringify(logs));localStorage.setItem("exlib",JSON.stringify(EXLIB))}catch(e){}
    toUpload.forEach(k=>dirty.add(k));if(dirty.size)await flush();
    syncMsg(t("ซิงก์แล้ว ✓"));
    autoCommitOld();
    if(!PROGS[cur])cur=nextProg();cur=draft.prog&&PROGS[draft.prog]?draft.prog:nextProg();updUnitBtn();renderFood();renderGym();
  }catch(e){clearTimeout(timer);syncMsg(t("ออฟไลน์ · เก็บในเครื่องนี้"))}
}
