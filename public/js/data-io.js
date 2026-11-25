// data-io.js — JSON import and export
// Classic script: shares globals with the other files in /js (load order is set in index.html).
/* ---------- import JSON ---------- */
document.getElementById("import").addEventListener("click",()=>document.getElementById("import-file").click());
document.getElementById("import-file").addEventListener("change",async ev=>{const f=ev.target.files[0];if(!f)return;
  try{const data=JSON.parse(await f.text());const r=await fetch("/api/import",{method:"POST",credentials:"same-origin",headers:{"content-type":"application/json"},body:JSON.stringify(data)});
  const j=await r.json();if(!r.ok)throw new Error(j.error||r.status);try{["mealcheck","gymlog","progs","exlib","gymdraft","restcfg","scheme"].forEach(k=>localStorage.removeItem(k))}catch(e){}toast(`${t("นำเข้าแล้ว")} ${j.imported}`);setTimeout(()=>location.reload(),800)}catch(e){toast(t("นำเข้าไม่สำเร็จ")+": "+(e.message||e))}});

/* ---------- export ---------- */
document.getElementById("export").addEventListener("click",async()=>{
  const data=JSON.stringify({exportedAt:new Date().toISOString(),weightUnitStored:"kg",displayUnit:unit,food,gymLogs:logs,programs:PROGS,exerciseLibrary:EXLIB,restSettings:restCfg},null,2);
  const name=`fitness-log-${TODAY}.json`;
  downloadBlob(new Blob([data],{type:"application/json"}),name);toast(t("ส่งไฟล์แล้ว"));return;
  const box=document.getElementById("export-box");box.hidden=false;box.value=data;box.select();
  try{await navigator.clipboard.writeText(data);toast(t("คัดลอก JSON แล้ว"))}catch(e){toast("Copy from the box")}
});


/* PO #309: prevent Eat Tracker comic-eat clipping */
(() => {
  const css = `#v-food .tk::after{inset:12px 16px 14px!important;background-position:center 42%!important;background-size:contain!important;background-repeat:no-repeat!important;opacity:.17!important;-webkit-mask-image:radial-gradient(ellipse at 50% 48%,#000 22%,rgba(0,0,0,.55) 60%,transparent 96%)!important;mask-image:radial-gradient(ellipse at 50% 48%,#000 22%,rgba(0,0,0,.55) 60%,transparent 96%)!important}`;
  const s = document.createElement("style");
  s.setAttribute("data-fix", "309-eat-comic");
  s.textContent = css;
  document.head.appendChild(s);
})();
