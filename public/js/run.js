// run.js — run log modal and Strava-style share card
// Classic script: shares globals with the other files in /js (load order is set in index.html).
/* ---------- run log + strava-style card ---------- */
const fmtDur=s=>{s=Math.round(s);const hh=Math.floor(s/3600),mm=Math.floor(s%3600/60),ss=s%60;return (hh?hh+":"+String(mm).padStart(2,"0"):mm)+":"+String(ss).padStart(2,"0")};
const fmtPace=s=>isFinite(s)&&s>0?fmtDur(s):"–";
const parseDur=v=>{const p=String(v).trim().split(":").map(Number);if(p.some(isNaN)||!p.length)return 0;return p.reduce((a,b)=>a*60+b,0)};
function runPrev(){const km=+document.getElementById("run-km").value,sec=parseDur(document.getElementById("run-time").value);
  document.getElementById("run-pace").textContent=km>0&&sec>0?fmtPace(sec/km)+" /km":"– /km";return{km,sec}}
let runK=null;   // cardio program being logged (distance + time)
const runProgK=()=>runK&&PROGS[runK]?runK:Object.keys(PROGS).find(k=>PROGS[k].tag==="run");
function openRun(){const k=runProgK();const rd=(k?cxGet(k):fs().tags.runData)||{};const h=document.querySelector("#run-modal .run-in>.label");if(h&&k)h.textContent=`${PROGS[k].icon||"🏃"} ${PROGS[k].name}`;document.getElementById("run-km").value=rd.km||"";document.getElementById("run-time").value=rd.sec?fmtDur(rd.sec):"";
  document.getElementById("run-del").hidden=!(k?cxGet(k):fs().tags.run);runPrev();document.getElementById("run-modal").hidden=false}
function saveRun(){const {km,sec}=runPrev(),k=runProgK(),d=km>0&&sec>0?{km,sec}:null;if(k)cxSet(k,d||{});else{const tg=fs().tags;tg.run=true;tg.runData=d;save("mealcheck",food)}try{renderFood()}catch(e){}renderGym();return d}
let runPhoto=null;
async function drawRun(d,clear){try{await document.fonts.ready}catch(e){}
  const W=1080,H=1920,c=document.createElement("canvas");c.width=W;c.height=H;const x=c.getContext("2d");
  const sans='"IBM Plex Sans Thai",system-ui,sans-serif',OR="#fc5200",FG="#fff";
  if(runPhoto&&!clear){const im=runPhoto,sc=Math.max(W/im.width,H/im.height),w=im.width*sc,hh=im.height*sc;
    x.drawImage(im,(W-w)/2,(H-hh)/2,w,hh);const px=x.getImageData(0,0,W,H),q=px.data;for(let i=0;i<q.length;i+=4){let v=(q[i]*.3+q[i+1]*.59+q[i+2]*.11);v=Math.max(0,Math.min(255,(v-128)*1.1+128))*.8;q[i]=q[i+1]=q[i+2]=v}x.putImageData(px,0,0);
    const g=x.createLinearGradient(0,0,0,H);g.addColorStop(0,"rgba(0,0,0,.35)");g.addColorStop(.55,"rgba(0,0,0,.1)");g.addColorStop(1,"rgba(0,0,0,.45)");x.fillStyle=g;x.fillRect(0,0,W,H)}
  else if(!clear){const g=x.createLinearGradient(0,0,0,H);g.addColorStop(0,"#1c1c1c");g.addColorStop(1,"#050505");x.fillStyle=g;x.fillRect(0,0,W,H)}
  x.shadowColor="rgba(0,0,0,.6)";x.shadowBlur=14;x.textAlign="center";
  let y=clear?700:560;
  [[t("ระยะทาง"),`${(+d.km).toFixed(2)} km`],["Pace",`${fmtPace(d.sec/d.km)} /km`],[t("เวลา"),fmtDur(d.sec)]].forEach(([lab,val])=>{
    x.fillStyle=FG;x.font=`600 30px ${sans}`;x.fillText(lab,W/2,y);x.font=`700 76px ${sans}`;x.fillText(val,W/2,y+80);y+=170});
  const im=HERO_IMG[tierOf(lvOf(heroXP()))];if(im.complete){x.imageSmoothingEnabled=false;x.drawImage(im,W/2-80,y-30,160,160)}
  x.fillStyle=OR;x.font=`800 italic 44px ${sans}`;x.fillText("WEIGHTGRAM",W/2,y+190);
  x.fillStyle="rgba(255,255,255,.75)";x.font=`500 26px ${sans}`;x.fillText(new Date(DAY+"T12:00:00").toLocaleDateString(LOC(),{day:"numeric",month:"short",year:"numeric"}),W/2,y+235);
  const jpg=runPhoto&&!clear;return new Promise((r,no)=>c.toBlob(b=>b?r(b):no(new Error("toBlob")),jpg?"image/jpeg":"image/png",.9))}
document.getElementById("run-photo").addEventListener("change",async ev=>{const f=ev.target.files[0];if(!f){runPhoto=null;return}
  try{const im=new Image();const u=URL.createObjectURL(f);await new Promise((r,no)=>{im.onload=r;im.onerror=()=>no(new Error("decode"));im.src=u});
  const M=1600,s=Math.min(1,M/Math.max(im.naturalWidth,im.naturalHeight)),cv=document.createElement("canvas");cv.width=Math.round(im.naturalWidth*s);cv.height=Math.round(im.naturalHeight*s);
  cv.getContext("2d").drawImage(im,0,0,cv.width,cv.height);URL.revokeObjectURL(u);runPhoto=cv;}catch(e){runPhoto=null;toast(t("เปิดรูปไม่ได้")+" "+(e.message||e));return}document.getElementById("run-photo-n").textContent="✓ "+f.name.slice(0,24)});
async function shareRun(clear){try{await shareRun2(clear)}catch(e){toast(t("สร้างการ์ดไม่สำเร็จ")+": "+(e.message||e))}}
async function shareRun2(clear){const d=saveRun();if(!d){toast(t("ใส่ระยะและเวลาก่อน"));return}
  document.getElementById("run-modal").hidden=true;
  shareBlob=await drawRun(d,clear);shareName=`run-${DAY}${clear?"-overlay":""}.${runPhoto&&!clear?"jpg":"png"}`;
  const img=document.getElementById("share-img");if(img.src)URL.revokeObjectURL(img.src);img.src=URL.createObjectURL(shareBlob);
  document.getElementById("share-hint").hidden=true;document.getElementById("open-ig").hidden=true;document.getElementById("open-ig-web").hidden=true;document.getElementById("share-modal").hidden=false}
document.getElementById("run-km").addEventListener("input",runPrev);document.getElementById("run-time").addEventListener("input",runPrev);
document.getElementById("run-save").addEventListener("click",()=>{saveRun();document.getElementById("run-modal").hidden=true;{const k=runProgK();toast((k?PROGS[k].name:t("วิ่ง"))+" ✓"+(!k||PROGS[k].tag==="run"?" +50 XP":""))}});
document.getElementById("run-share").addEventListener("click",()=>shareRun(false));
document.getElementById("run-overlay").addEventListener("click",()=>shareRun(true));
document.getElementById("run-del").addEventListener("click",()=>{const k=runProgK();if(k)cxSet(k,null);else{const tg=fs().tags;tg.run=false;delete tg.runData;save("mealcheck",food)}try{renderFood()}catch(e){}renderGym();document.getElementById("run-modal").hidden=true;toast(t("ยกเลิกแล้ว"))});
document.getElementById("run-close").addEventListener("click",()=>document.getElementById("run-modal").hidden=true);
