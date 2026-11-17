// push.js — push notification settings
// Classic script: shares globals with the other files in /js (load order is set in index.html).
/* ---------- push notifications ---------- */
const b64uToU8=s=>{s=s.replace(/-/g,"+").replace(/_/g,"/");while(s.length%4)s+="=";return Uint8Array.from(atob(s),c=>c.charCodeAt(0))};
async function pushState(){const el=document.getElementById("push-state"),btn=document.getElementById("push-on"),test=document.getElementById("push-test");
  if(!("serviceWorker" in navigator)||!("PushManager" in window)){el.textContent=t("เครื่องนี้ยังไม่รองรับการแจ้งเตือน (iPhone: เพิ่มลงหน้าโฮมก่อน)");btn.hidden=true;test.hidden=true;return}
  const reg=await navigator.serviceWorker.ready;const sub=await reg.pushManager.getSubscription();
  el.textContent=sub?t("เปิดแจ้งเตือนมื้ออาหารแล้ว 🔔"):t("ยังไม่เปิดแจ้งเตือน");btn.textContent=sub?t("ปิดแจ้งเตือน"):t("เปิดแจ้งเตือน");test.hidden=!sub}
document.getElementById("push-on").addEventListener("click",async()=>{try{
  const reg=await navigator.serviceWorker.ready;const cur=await reg.pushManager.getSubscription();
  if(cur){await fetch("/api/push/unsubscribe",{method:"POST",credentials:"same-origin",headers:{"content-type":"application/json"},body:JSON.stringify({endpoint:cur.endpoint})});await cur.unsubscribe();return pushState()}
  if(await Notification.requestPermission()!=="granted"){toast(t("ไม่ได้รับอนุญาตแจ้งเตือน"));return}
  const {key}=await (await fetch("/api/push/key",{credentials:"same-origin"})).json();if(!key){toast("VAPID key missing");return}
  const sub=await reg.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:b64uToU8(key)});
  await fetch("/api/push/subscribe",{method:"POST",credentials:"same-origin",headers:{"content-type":"application/json"},body:JSON.stringify(sub)});
  toast(t("เปิดแจ้งเตือนแล้ว 🔔"));pushState()}catch(e){toast(String(e.message||e))}});
document.getElementById("push-test").addEventListener("click",async()=>{const r=await fetch("/api/push/test",{method:"POST",credentials:"same-origin"});const j=await r.json();toast(j.sent?t("ส่งทดสอบแล้ว"):t("ไม่มีเครื่องที่รับแจ้งเตือน"))});
