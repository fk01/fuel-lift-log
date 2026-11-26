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

/* UI theme extras */
(() => {
  const files = [
    ["/css/comic-page-bg.css?v=4", "data-comic-page-bg"],
    ["/css/modal-theme.css?v=2", "data-modal-theme"],
    ["/css/clean-controls.css?v=3", "data-clean-controls"],
    ["/css/glass-cards.css?v=89", "data-glass-cards"]
  ];
  files.forEach(([href, attr]) => {
    if (document.querySelector(`link[${attr}]`)) return;
    const l = document.createElement("link");
    l.rel = "stylesheet";
    l.href = href;
    l.setAttribute(attr, "1");
    document.head.appendChild(l);
  });
})();
