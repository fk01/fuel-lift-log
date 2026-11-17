// refresh.js — soft refresh and pull-to-refresh
// Classic script: shares globals with the other files in /js (load order is set in index.html).
/* ---------- refresh (soft, throttled) ---------- */
let lastRefresh=Date.now(),refreshing=false;const COOLDOWN=15000;
async function doRefresh(){
  if(refreshing)return;
  if(Date.now()-lastRefresh<COOLDOWN){const s=Math.ceil((COOLDOWN-(Date.now()-lastRefresh))/1000);toast(lang==="th"?`เพิ่งอัปเดตไป รีเฟรชได้อีกใน ${s} วินาที`:`Just updated. Refresh again in ${s}s`);return}
  refreshing=true;lastRefresh=Date.now();
  try{clearTimeout(syncT);if(dirty.size)await flush();await cloudLoad();toast(t("อัปเดตแล้ว"))}catch(e){toast(t("ซิงก์ไม่สำเร็จ"))}finally{refreshing=false}
}

/* ---------- pull to refresh ---------- */
(()=>{const el=document.getElementById("ptr"),ic=document.getElementById("ptr-i");let y0=null,dy=0;const MAX=110,TRIG=80;
  const modalOpen=()=>[...document.querySelectorAll(".modal")].some(m=>!m.hidden);
  window.addEventListener("touchstart",e=>{if((appScroll().scrollTop||0)<=0&&!modalOpen()&&e.touches.length===1){y0=e.touches[0].clientY;dy=0}else y0=null},{passive:true});
  window.addEventListener("touchmove",e=>{if(y0===null)return;dy=e.touches[0].clientY-y0;if(dy<=0||(appScroll().scrollTop||0)>0){el.style.opacity=0;el.style.transform="translateY(-80px)";return}
    const d=Math.min(MAX,dy*0.5);el.classList.add("on");el.style.opacity=Math.min(1,d/TRIG*1.2);el.style.transform=`translateY(${d-20}px) rotate(${d*3}deg)`;
    el.classList.toggle("ready",d>=TRIG*0.75);ic.textContent=d>=TRIG*0.75?"↻":"↓"},{passive:true});
  window.addEventListener("touchend",()=>{if(y0===null)return;el.classList.remove("on");
    if(Math.min(MAX,dy*0.5)>=TRIG*0.75){el.classList.add("spin");el.style.transform="translateY(40px)";ic.textContent="↻";doRefresh().finally(()=>{el.classList.remove("spin","ready");el.style.opacity=0;el.style.transform="translateY(-80px)"})}
    else{el.style.opacity=0;el.style.transform="translateY(-80px)";el.classList.remove("ready")}y0=null},{passive:true});
})();
