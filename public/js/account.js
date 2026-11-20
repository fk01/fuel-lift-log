// account.js — sign in (Google, email + password, Face ID), first-run claim of the old single-user data, account menu, sign out.
// Classic script: shares globals with the other files in /js (load order is set in index.html; must load before app.js).
// Local data belongs to one account: localStorage "uid" remembers whose it is; another account on this device starts clean.
const ACCT_KEEP=["lang","recpal","libView","sttab","hasPasskey"];
let ME=null,acctMode="login";
async function acctStatus(){const r=await fetch("/api/auth/status",{credentials:"same-origin"});if(!r.ok)throw new Error(r.status);return r.json()}
function wipeLocal(uid){const keep={};ACCT_KEEP.forEach(k=>{try{const v=localStorage.getItem(k);if(v!=null)keep[k]=v}catch(e){}});
  try{localStorage.clear();Object.entries(keep).forEach(([k,v])=>localStorage.setItem(k,v));if(uid)localStorage.setItem("uid",uid)}catch(e){}}
const localUid=()=>{try{return localStorage.getItem("uid")}catch(e){return null}};
// startup gate: nothing is synced until we know who is signed in and the local data is theirs
async function acctBoot(){let st;try{st=await acctStatus()}catch(e){cloudLoad();return}   // offline → keep working locally
  ME=st.me;window.GOOGLE_CLIENT_ID=st.googleClientId;
  if(!ME){showLogin();return}
  const lu=localUid();
  if(st.legacy&&!lu){showClaim(st);return}
  if(lu!==ME.id){if(lu||!st.legacy){wipeLocal(ME.id);location.reload();return}}
  renderAcct();cloudLoad()}
/* ---- sign in ---- */
function showLogin(){const m=document.getElementById("login");m.hidden=false;acctSetMode("login");
  if(window.PublicKeyCredential)document.getElementById("passkey-login").hidden=false;
  const gid=window.GOOGLE_CLIENT_ID;if(gid&&!document.getElementById("g-btn").dataset.on){
    const s=document.createElement("script");s.src="https://accounts.google.com/gsi/client";s.async=true;s.onload=()=>{try{
      google.accounts.id.initialize({client_id:gid,callback:r=>acctPost("/api/auth/google",{credential:r.credential})});
      google.accounts.id.renderButton(document.getElementById("g-btn"),{theme:"filled_white",size:"large",shape:"pill",width:300,text:"continue_with",locale:lang==="th"?"th":"en"});
      document.getElementById("g-btn").dataset.on=1}catch(e){}};document.head.appendChild(s)}}
function acctSetMode(m){acctMode=m;const su=m==="signup";[["acct-name","ชื่อ"],["acct-email","อีเมล"],["acct-pw","รหัสผ่าน"]].forEach(([i,p])=>document.getElementById(i).placeholder=t(p));document.getElementById("acct-name").hidden=!su;
  document.getElementById("acct-pw").autocomplete=su?"new-password":"current-password";
  document.getElementById("acct-go").textContent=t(su?"สมัคร":"เข้าสู่ระบบ");document.getElementById("acct-sw-t").textContent=t(su?"มีบัญชีแล้ว?":"ยังไม่มีบัญชี?");
  document.getElementById("acct-sw").textContent=t(su?"เข้าสู่ระบบ":"สมัคร");document.getElementById("login-err").hidden=true}
async function acctPost(u,b){const e=document.getElementById("login-err");e.hidden=true;
  const r=await post(u,b);if(r.ok){location.reload();return}
  const j=await r.json().catch(()=>({}));const map={"email taken":"อีเมลนี้มีบัญชีแล้ว — เข้าสู่ระบบแทน","wrong email or password":"อีเมลหรือรหัสผ่านไม่ถูกต้อง","password too short":"รหัสผ่านอย่างน้อย 8 ตัว","bad email":"อีเมลไม่ถูกต้อง","too many attempts":"ลองบ่อยเกินไป รอสักครู่","google sign-in failed":"เข้าสู่ระบบด้วย Google ไม่สำเร็จ"};
  e.textContent=t(map[j.error]||"เข้าสู่ระบบไม่สำเร็จ");e.hidden=false}
document.getElementById("acct-sw").addEventListener("click",()=>acctSetMode(acctMode==="login"?"signup":"login"));
document.getElementById("login-form").addEventListener("submit",ev=>{ev.preventDefault();const em=document.getElementById("acct-email").value.trim(),pw=document.getElementById("acct-pw").value;
  if(acctMode==="signup")acctPost("/api/auth/signup",{email:em,password:pw,name:document.getElementById("acct-name").value.trim()});else acctPost("/api/auth/login",{email:em,password:pw})});
/* ---- first run: move the old PIN data into this account ---- */
function showClaim(st){const m=document.getElementById("claim");m.hidden=false;document.getElementById("claim-pin").placeholder=t("PIN เดิม");
  document.getElementById("claim-sum").textContent=t("แอปนี้มีข้อมูลเดิม (ล็อกด้วย PIN) อยู่")+` · ${st.docs} ${t("รายการ")} — `+t("ใส่ PIN เดิมเพื่อย้ายทั้งหมดเข้าบัญชี")+` ${ME.email||ME.name}`;
  document.getElementById("claim-go").onclick=async()=>{const e=document.getElementById("claim-err");e.hidden=true;
    const r=await post("/api/auth/claim",{pin:document.getElementById("claim-pin").value});
    if(r.ok){wipeLocal(ME.id);location.reload();return}   // the server copy is the truth: start from it so stale local data is not uploaded again
    const j=await r.json().catch(()=>({}));e.textContent=t(j.error==="wrong pin"?"PIN ไม่ถูกต้อง":j.error==="too many attempts"?"ลองบ่อยเกินไป รอสักครู่":"ย้ายไม่สำเร็จ");e.hidden=false};
  document.getElementById("claim-skip").onclick=()=>{wipeLocal(ME.id);location.reload()}}
/* ---- More › account ---- */
function renderAcct(){const box=document.getElementById("acct-menu");if(!box||!ME)return;
  const how=[ME.google?"Google":"",ME.password?t("อีเมล + รหัสผ่าน"):""].filter(Boolean).join(" · ");
  box.innerHTML=`<div class="menu-row" style="cursor:default"><span class="mi">${licon("user")||"👤"}</span><span class="mt"><b>${esc(ME.name||ME.email||"")}</b><small>${esc(ME.email||"")}${how?" · "+esc(how):""}</small></span></div>
    <button class="menu-row warn" data-logout><span class="mi">↩</span><span class="mt"><b>${t("ออกจากระบบ")}</b><small>${t("ล้างข้อมูลในเครื่องนี้")}</small></span></button>`;
  box.querySelector("[data-logout]").addEventListener("click",async ev=>{const b=ev.currentTarget;if(!b.dataset.sure){b.dataset.sure=1;b.querySelector("b").textContent=t("แตะอีกครั้งเพื่อออก");return}
    try{if(dirty&&dirty.size)await flush()}catch(e){}await post("/api/logout");wipeLocal(null);try{localStorage.removeItem("uid")}catch(e){}location.reload()})}
Object.assign(EN,{"PIN เดิม":"Old PIN","บัญชี":"Account","หรือ":"or","สมัคร":"Sign up","เข้าสู่ระบบ":"Sign in","มีบัญชีแล้ว?":"Have an account?","ยังไม่มีบัญชี?":"No account yet?","อีเมลนี้มีบัญชีแล้ว — เข้าสู่ระบบแทน":"This email already has an account — sign in instead","อีเมลหรือรหัสผ่านไม่ถูกต้อง":"Wrong email or password","รหัสผ่านอย่างน้อย 8 ตัว":"Password needs at least 8 characters","อีเมลไม่ถูกต้อง":"Invalid email","ลองบ่อยเกินไป รอสักครู่":"Too many tries — wait a moment","เข้าสู่ระบบด้วย Google ไม่สำเร็จ":"Google sign-in failed","เข้าสู่ระบบไม่สำเร็จ":"Sign-in failed","ย้ายข้อมูลเดิมเข้าบัญชี":"Move your old data into this account","แอปนี้มีข้อมูลเดิม (ล็อกด้วย PIN) อยู่":"This app has older data (PIN-locked)","รายการ":"items","ใส่ PIN เดิมเพื่อย้ายทั้งหมดเข้าบัญชี":"enter the old PIN to move it all into","PIN ไม่ถูกต้อง":"Wrong PIN","ย้ายไม่สำเร็จ":"Couldn't move the data","ย้ายข้อมูลเข้าบัญชีนี้":"Move into this account","ไม่ใช่ข้อมูลของฉัน — ข้าม":"Not my data — skip","อีเมล + รหัสผ่าน":"email + password","ออกจากระบบ":"Sign out","ล้างข้อมูลในเครื่องนี้":"Clears data on this device","แตะอีกครั้งเพื่อออก":"Tap again to sign out","ร่างกาย · กิน · ออกกำลัง — วันนี้":"Body · Eat · Train — today","ชื่อ":"Name","อีเมล":"Email","รหัสผ่าน":"Password"});
