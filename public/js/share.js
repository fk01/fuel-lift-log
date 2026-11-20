// share.js — share a program or a whole gym (place + equipment + programs + exercises) as a link; open a link to preview and import.
// The data travels inside the link (#import=…), compressed when the browser can. No personal data (no history, weights, body).
// Classic script: shares globals with the other files in /js (load order is set in index.html).
const shB64=u8=>{let s="";u8.forEach(c=>s+=String.fromCharCode(c));return btoa(s).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"")};
const shUnb64=s=>{s=s.replace(/-/g,"+").replace(/_/g,"/");const b=atob(s);return Uint8Array.from(b,c=>c.charCodeAt(0))};
async function packShare(obj){const raw=new TextEncoder().encode(JSON.stringify(obj));
  try{if(window.CompressionStream){const z=new Uint8Array(await new Response(new Blob([raw]).stream().pipeThrough(new CompressionStream("deflate-raw"))).arrayBuffer());return "z."+shB64(z)}}catch(e){}return "j."+shB64(raw)}
async function unpackShare(s){const [k,d]=[s.slice(0,1),s.slice(2)];let u=shUnb64(d);
  if(k==="z")u=new Uint8Array(await new Response(new Blob([u]).stream().pipeThrough(new DecompressionStream("deflate-raw"))).arrayBuffer());
  const o=JSON.parse(new TextDecoder().decode(u));if(!o||o.v!==1||!Array.isArray(o.progs))throw new Error("bad");return o}
function shareData(keys,locId){const L=locById(locId)||{},ids=new Set();
  const progs=keys.filter(k=>PROGS[k]&&!isCardio(PROGS[k])).map(k=>{const p=PROGS[k];p.ex.forEach(e=>ids.add(e.id));return{name:p.name,sub:p.sub||"",ex:p.ex.map(e=>({id:e.id,n:e.n,s:e.s,r:e.r,...(e.main?{main:1}:{})}))}});
  const lib=[...ids].map(id=>{const x=EXLIB.find(q=>q.id===id);if(!x)return null;const o={id:x.id,n:x.n};["z","g","u","mp","ms","link"].forEach(f=>{if(x[f]!=null&&x[f]!=="")o[f]=x[f]});return o}).filter(Boolean);
  return{v:1,place:{name:L.name||"",icon:L.icon||"📍",eq:L.eq||[],...(L.dbMax?{dbMax:L.dbMax}:{})},progs,lib}}
async function openShareLink(keys,locId){const d=shareData(keys,locId);if(!d.progs.length){toast(t("ไม่มีโปรแกรมเวทให้แชร์"));return}
  const url=location.origin+location.pathname+"#import="+await packShare(d),nEx=d.progs.reduce((a,p)=>a+p.ex.length,0);
  openGen(t("ลิงก์พร้อมแชร์"),`<div class="card"><b>${esc(d.place.icon)} ${esc(t(d.place.name))}</b><small class="note" style="display:block">${d.progs.length===1?esc(d.progs[0].name)+" · ":nProgs(d.progs.length)+" · "}${nU(nEx,"ท่า")}</small>
    <div class="sh-url">${esc(url)}</div></div><small class="note">${t("ในลิงก์มีแค่ยิม อุปกรณ์ โปรแกรม และท่า — ไม่มีประวัติหรือข้อมูลส่วนตัว")}</small>
    <div class="actions sheet-act"><button class="btn" data-shc>${t("คัดลอก")}</button><button class="btn primary" data-shs style="flex:1">↗ ${t("แชร์")}</button></div>`,b=>{
    const copy=async()=>{try{await navigator.clipboard.writeText(url);toast(t("คัดลอกลิงก์แล้ว"))}catch(e){toast(t("คัดลอกไม่ได้"))}};
    b.querySelector("[data-shc]").addEventListener("click",copy);
    b.querySelector("[data-shs]").addEventListener("click",async()=>{if(navigator.share){try{await navigator.share({title:d.progs.length===1?d.progs[0].name:d.place.name,url})}catch(e){}}else copy()})})}
// ---- import ----
async function checkImport(){const h=location.hash;if(!h.startsWith("#import="))return;const s=decodeURIComponent(h.slice(8));history.replaceState(null,"",location.pathname+"#home");
  let d;try{d=await unpackShare(s)}catch(e){toast(t("ลิงก์ไม่ถูกต้อง"));return}openImport(d)}
function openImport(d){const pick=new Set(d.progs.map((_,i)=>i)),known=id=>EXLIB.some(x=>x.id===id);let dest="new";
  const gl=LOCS.filter(l=>hasType(l,"gym"));
  const draw=b=>{const eq=(d.place.eq||[]).filter(q=>q!=="body").map(q=>t((EQ.find(x=>x[0]===q)||[0,q])[1])).join(" · ")+(d.place.dbMax?` ≤ ${d.place.dbMax} kg`:"");
    b.querySelector(".imp").innerHTML=`<small class="note">${t("มีคนแชร์ให้คุณ — ดูก่อนแล้วค่อยนำเข้า")}</small>
      <div class="card"><b>${esc(d.place.icon||"📍")} ${esc(d.place.name||t("สถานที่"))}</b><small class="note" style="display:block">${t("อุปกรณ์")}: ${esc(eq||t("ตัวเปล่า"))}</small></div>
      <div class="pm-menu">${d.progs.map((p,i)=>{const nw=p.ex.filter(e=>!known(e.id)).length;return `<button class="menu-row pa-row${pick.has(i)?" sel":""}" data-ip="${i}"><span class="mi">${licon("dumbbell")}</span><span class="mt"><b>${esc(p.name)}</b><small>${nU(p.ex.length,"ท่า")} · ${esc(p.ex.slice(0,2).map(e=>e.n).join(", "))}${p.ex.length>2?" …":""}${nw?` · ${nw} ${t("ท่าใหม่จะเพิ่มในคลัง")}`:""}</small></span><span class="pa-box">${pick.has(i)?"✓":""}</span></button>`}).join("")}</div>
      <div class="pa-step">${t("ใส่ไว้ที่")}</div><div class="chips"><button class="chip${dest==="new"?" on":""}" data-id="new">+ ${t("สถานที่ใหม่")} "${esc(d.place.name||t("สถานที่"))}"</button>${gl.map(l=>`<button class="chip${dest===l.id?" on":""}" data-id="${esc(l.id)}">${esc(l.icon||"📍")} ${esc(t(l.name))}</button>`).join("")}</div>
      <div class="actions sheet-act"><button class="btn" data-gen-close>${t("ยกเลิก")}</button><button class="btn primary" data-igo style="flex:1" ${pick.size?"":"disabled"}>↓ ${t("นำเข้า")} ${nProgs(pick.size)}</button></div>`;
    b.querySelectorAll("[data-ip]").forEach(x=>x.addEventListener("click",()=>{const i=+x.dataset.ip;if(pick.has(i))pick.delete(i);else pick.add(i);draw(b)}));
    b.querySelectorAll("[data-id]").forEach(x=>x.addEventListener("click",()=>{dest=x.dataset.id;draw(b)}));
    b.querySelector("[data-igo]").addEventListener("click",()=>{const n=doImport(d,[...pick],dest);closeGen();undoLoud("↓ "+t("นำเข้าแล้ว")+" "+nProgs(n));location.hash="gym";renderGym()})};
  openGen(t("นำเข้าจากลิงก์"),`<div class="imp stack" style="gap:10px"></div>`,draw)}
function doImport(d,idx,dest){let loc=dest;
  if(dest==="new"){const P=d.place||{};loc="l"+Date.now().toString(36);LOCS.push({id:loc,name:String(P.name||t("สถานที่")).slice(0,60),icon:String(P.icon||"📍").slice(0,4),map:"",eq:Array.isArray(P.eq)?P.eq.filter(q=>EQ.some(x=>x[0]===q)):["db","body"],types:["gym"],...(+P.dbMax>0?{dbMax:+P.dbMax}:{})});saveLocs()}
  const idMap={};(d.lib||[]).forEach(x=>{if(!x||!x.id||!x.n)return;const have=EXLIB.find(q=>q.id===x.id)||EXLIB.find(q=>(q.n||"").trim().toLowerCase()===String(x.n).trim().toLowerCase());
    if(have){idMap[x.id]=have.id;return}const o={id:String(x.id).slice(0,40),n:String(x.n).slice(0,80)};["z","g","u"].forEach(f=>{if(typeof x[f]==="string")o[f]=x[f].slice(0,12)});
    ["mp","ms"].forEach(f=>{if(Array.isArray(x[f]))o[f]=x[f].filter(m=>MUS_KEYS.includes(m))});const lk=safeUrl(x.link||"");if(lk)o.link=lk;EXLIB.push(o);idMap[x.id]=o.id});
  const here=Object.values(PROGS).filter(p=>locOf(p)===loc).map(p=>p.name);let n=0;
  idx.forEach((i,j)=>{const p=d.progs[i];if(!p)return;let nm=String(p.name||t("โปรแกรม")).slice(0,60),c=2;const base=nm;while(here.includes(nm))nm=`${base} (${c++})`;here.push(nm);
    const ex=(p.ex||[]).filter(e=>e&&e.id).map(e=>{const id=idMap[e.id]||e.id,x=EXLIB.find(q=>q.id===id)||{};return{...libPick(x.id?x:{id,n:e.n}),s:Math.max(1,Math.min(10,+e.s||3)),r:String(e.r||"8-10").slice(0,12),...(e.main?{main:1}:{})}});
    PROGS["p"+Date.now().toString(36)+j]={name:nm,sub:String(p.sub||"").slice(0,120),ex,loc,days:[]};n++});
  save("exlib",EXLIB);saveProgs();curLoc=loc;return n}
window.addEventListener("hashchange",checkImport);setTimeout(checkImport,300);
Object.assign(EN,{"ลิงก์พร้อมแชร์":"Ready to share","ในลิงก์มีแค่ยิม อุปกรณ์ โปรแกรม และท่า — ไม่มีประวัติหรือข้อมูลส่วนตัว":"The link only holds the gym, equipment, programs and exercises — no history or personal data","คัดลอก":"Copy","แชร์":"Share","คัดลอกลิงก์แล้ว":"Link copied","คัดลอกไม่ได้":"Couldn't copy","ลิงก์ไม่ถูกต้อง":"Invalid link","นำเข้าจากลิงก์":"Import from link","มีคนแชร์ให้คุณ — ดูก่อนแล้วค่อยนำเข้า":"Someone shared this with you — preview, then import","ท่าใหม่จะเพิ่มในคลัง":"new exercises go to your library","ใส่ไว้ที่":"Put it at","สถานที่ใหม่":"New place","นำเข้า":"Import","นำเข้าแล้ว":"Imported","แชร์ลิงก์":"Share link","แชร์ยิมนี้":"Share this gym","ไม่มีโปรแกรมเวทให้แชร์":"No weights programs to share"});
