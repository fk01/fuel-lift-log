// auth.js — server API client, PIN and Face ID login
// Classic script: shares globals with the other files in /js (load order is set in index.html).
/* ---------- server API (Cloudflare Worker + D1) ---------- */
const API={
  async get(){const r=await fetch("/api/docs",{credentials:"same-origin"});if(r.status===401){const e=new Error("auth");e.code="auth";throw e}if(!r.ok)throw new Error(r.status);const j=await r.json();return{empty:!j.length,docs:j.map(d=>({id:d.id,data:()=>d.value}))}},
  doc(id){const u="/api/docs/"+encodeURIComponent(id);return{
    set:v=>fetch(u,{method:"PUT",credentials:"same-origin",headers:{"content-type":"application/json"},body:JSON.stringify(v)}).then(r=>{if(!r.ok)throw new Error(r.status)}),
    delete:()=>fetch(u,{method:"DELETE",credentials:"same-origin"}).then(r=>{if(!r.ok)throw new Error(r.status)})}}
};
function downloadBlob(blob,name){const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=name;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},2000)}
async function shareFile(blob,name){try{const f=new File([blob],name,{type:blob.type||"image/png"});if(navigator.canShare&&navigator.canShare({files:[f]})){await navigator.share({files:[f]});return true}}catch(e){if(e&&e.name==="AbortError")return true}return false}
const b64u=b=>btoa(String.fromCharCode(...new Uint8Array(b))).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"");
const unb64u=s=>{s=s.replace(/-/g,"+").replace(/_/g,"/");while(s.length%4)s+="=";return Uint8Array.from(atob(s),c=>c.charCodeAt(0))};
const post=(u,b)=>fetch(u,{method:"POST",credentials:"same-origin",headers:{"content-type":"application/json"},body:JSON.stringify(b||{})});
async function passkeyLogin(){
  const o=await post("/api/passkey/login/options");if(!o.ok)return false;const opt=await o.json();
  const cred=await navigator.credentials.get({publicKey:{challenge:unb64u(opt.challenge),rpId:opt.rpId,allowCredentials:opt.allow.map(id=>({type:"public-key",id:unb64u(id)})),userVerification:"required",timeout:60000}});
  const r=cred.response;const res=await post("/api/passkey/login",{id:b64u(cred.rawId),authenticatorData:b64u(r.authenticatorData),clientDataJSON:b64u(r.clientDataJSON),signature:b64u(r.signature)});
  if(res.ok){location.reload();return true}return false}
async function passkeyRegister(){
  const o=await post("/api/passkey/register/options");const opt=await o.json();
  const cred=await navigator.credentials.create({publicKey:{challenge:unb64u(opt.challenge),rp:{id:opt.rpId,name:"Fuel & Lift"},user:{id:unb64u(opt.userId),name:"owner",displayName:"Fuel & Lift"},
    pubKeyCredParams:[{type:"public-key",alg:-7}],authenticatorSelection:{residentKey:"preferred",userVerification:"required"},excludeCredentials:opt.exclude.map(id=>({type:"public-key",id:unb64u(id)})),timeout:60000}});
  const r=cred.response;const pk=r.getPublicKey&&r.getPublicKey();if(!pk)throw new Error("This browser cannot export the passkey");
  const res=await post("/api/passkey/register",{id:b64u(cred.rawId),publicKey:b64u(pk),alg:r.getPublicKeyAlgorithm(),clientDataJSON:b64u(r.clientDataJSON),name:navigator.platform});
  if(!res.ok)throw new Error((await res.json()).error);try{localStorage.setItem("hasPasskey","1")}catch(e){}}
async function pkState(){const el=document.getElementById("pk-state");if(!el)return;if(!window.PublicKeyCredential){el.textContent="—";document.getElementById("pk-add").hidden=true;return}
  try{const r=await fetch("/api/passkey/list",{credentials:"same-origin"});const l=r.ok?await r.json():[];el.textContent=l.length?`${t("ตั้งค่าแล้ว")} (${l.length})`:t("ยังไม่ได้ตั้งค่า")}catch(e){}}
document.getElementById("pk-add").addEventListener("click",async()=>{try{await passkeyRegister();toast(t("ตั้งค่า Face ID แล้ว"));pkState()}catch(e){if(e.name!=="NotAllowedError")toast(String(e.message||e))}});
document.getElementById("passkey-login").addEventListener("click",()=>passkeyLogin().catch(e=>{if(e.name!=="NotAllowedError")toast(String(e.message||e))}));
function showLogin(){document.getElementById("login").hidden=false;
  const hasPk=(()=>{try{return localStorage.getItem("hasPasskey")==="1"}catch(e){return false}})();
  if(window.PublicKeyCredential){document.getElementById("passkey-login").hidden=false;if(hasPk){passkeyLogin().catch(()=>{});return}}
  setTimeout(()=>document.getElementById("pin").focus(),50)}
document.getElementById("login-form").addEventListener("submit",async ev=>{ev.preventDefault();const pin=document.getElementById("pin").value;
  const r=await fetch("/api/login",{method:"POST",credentials:"same-origin",headers:{"content-type":"application/json"},body:JSON.stringify({pin})});
  if(r.ok)location.reload();else{const j=await r.json().catch(()=>({}));const el=document.getElementById("login-err");el.textContent=r.status===500?"Server: ACCESS_PIN is not set":"Wrong PIN";el.hidden=false}});
