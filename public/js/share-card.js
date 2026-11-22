// share-card.js — workout share card (canvas to PNG)
// Classic script: shares globals with the other files in /js (load order is set in index.html).
/* ---------- share card (canvas → PNG) ---------- */
let shareBlob=null,shareName="";
async function svgImg(svg){const im=new Image();await new Promise((ok,no)=>{im.onload=ok;im.onerror=no;im.src="data:image/svg+xml;charset=utf-8,"+encodeURIComponent(svg)});return im}
async function drawCard(l){
  try{await document.fonts.ready}catch(e){}
  const ids=Object.keys(l.ex);const W=1080,H=2340,P=80;
  const grp=(s,u)=>{const out=[];s.forEach(q=>{const k=`${toDisp(q.kg,u)}${u} × ${q.reps}`;const last=out[out.length-1];if(last&&last.k===k)last.n++;else out.push({k,n:1})});return out.map(o=>[o.k,o.n>1?`×${o.n}`:""])};
  const top=780,avail=H-top-150;const rowRaw=ids.map(id=>Math.max(2,grp(l.ex[id],uOf(id)).length)*52+70);
  const fit=Math.min(1,avail/rowRaw.reduce((a,b)=>a+b,0));const rowH=rowRaw.map(r=>r*fit);
  const c=document.createElement("canvas");c.width=W;c.height=H;const x=c.getContext("2d");
  const sans='"IBM Plex Sans Thai",system-ui,sans-serif',mono='"IBM Plex Mono",monospace',serif=sans;
  const BLUE="#3d7dff",GREEN="#2ad19a",FG="#f2f0ec",MUTED="#8a8780";
  x.fillStyle="#000";x.fillRect(0,0,W,H);
  x.strokeStyle="#262625";x.lineWidth=3;x.beginPath();x.roundRect?x.roundRect(30,30,W-60,H-60,48):x.rect(30,30,W-60,H-60);x.stroke();
  // header
  x.fillStyle=FG;x.font=`700 40px ${mono}`;x.fillText("WEIGHTGRAM",P,P+70);
  x.fillStyle=MUTED;x.font=`400 38px ${sans}`;
  x.fillText(new Date(l.date+"T12:00:00").toLocaleDateString(LOC(),{month:"short",day:"numeric",year:"numeric"}),P,P+135);
  const pname=progName(l.prog);x.fillText(pname,P,P+185);
  // ring + muscle map
  const cx=W-P-160,cy=P+170,R=150;
  const planned=ids.reduce((a,id)=>{for(const p of Object.values(PROGS)){const e=p.ex.find(q=>q.id===id);if(e)return a+e.s}return a+l.ex[id].length},0);
  const sets=Object.values(l.ex).flat().length;
  const wk=weekKey(l.date);const wkDays=new Set(logs.filter(q=>weekKey(q.date)===wk&&q.date<=l.date).map(q=>q.date)).size;
  x.lineCap="round";
  x.strokeStyle="#262a33";x.lineWidth=22;x.beginPath();x.arc(cx,cy,R,0,Math.PI*2);x.stroke();
  x.strokeStyle=BLUE;x.beginPath();x.arc(cx,cy,R,-Math.PI/2,-Math.PI/2+Math.PI*2*Math.min(1,sets/Math.max(1,planned)));x.stroke();
  x.strokeStyle="#1d2b26";x.lineWidth=18;x.beginPath();x.arc(cx,cy,R-30,0,Math.PI*2);x.stroke();
  x.strokeStyle=GREEN;x.beginPath();x.arc(cx,cy,R-30,-Math.PI/2,-Math.PI/2+Math.PI*2*Math.min(1,wkDays/5));x.stroke();
  x.textAlign="center";x.fillStyle=FG;x.font=`700 72px ${sans}`;x.fillText(`${wkDays}/5`,cx,cy+18);x.fillStyle=MUTED;x.font=`500 24px ${mono}`;x.fillText("THIS WEEK",cx,cy+58);x.textAlign="left";
  // stats
  const days=workoutDays().filter(d=>d<=l.date).length;
  const vol=Math.round(volOf(l)).toLocaleString();
  [[String(days),t("วันที่เล่น"),FG],[vol,"Volume kg",BLUE],[String(sets),"Sets",GREEN]].forEach(([v,lab,col],i)=>{
    const mx=W/6+i*W/3;x.textAlign="center";x.fillStyle=col;x.font=`700 84px ${sans}`;x.fillText(v,mx,P+500);
    x.font=`500 34px ${sans}`;x.fillText(lab,mx,P+555);x.textAlign="left"});
  // rows
  let y=top;const f=fit;
  for(let k=0;k<ids.length;k++){const id=ids[k],u=uOf(id),s=l.ex[id];
    const ex=Object.values(PROGS).flatMap(p=>p.ex).find(e=>e.id===id)||{id,n:exName(id,l)};
    x.fillStyle=FG;x.font=`700 ${Math.round(40*f)}px ${sans}`;let nm=exName(id,l);while(x.measureText(nm).width>600&&nm.length>4)nm=nm.slice(0,-2);if(nm!==exName(id,l))nm+="…";x.fillText(nm,P,y+32*f);
    const e1=Math.max(...s.map(q=>(+q.kg||0)*(1+(+q.reps||0)/30)));
    x.fillStyle="#bdbab4";x.font=`400 ${Math.round(34*f)}px ${sans}`;x.fillText(`e1RM ${toDisp(Math.round(e1*10)/10,u)}${u}`,P,y+82*f);
    grp(s,u).forEach(([tx,n],r)=>{const yy=y+32*f+r*52*f;x.font=`400 ${Math.round(36*f)}px ${sans}`;x.fillStyle=FG;x.textAlign="right";x.fillText(tx,W-P-70*f,yy);x.fillStyle=MUTED;x.textAlign="right";if(n)x.fillText(n,W-P,yy)});x.textAlign="left";
    y+=rowH[k]}
  x.fillStyle=MUTED;x.font=`500 30px ${mono}`;x.textAlign="center";x.fillText(`🏆 ${weekStreak()} ${t("สัปดาห์ติดกัน").toUpperCase()}`,W/2,H-100);x.textAlign="left";
  return new Promise(r=>c.toBlob(b=>r(b),"image/png"));
}
async function openShare(l){
  if(!l){toast(t("ยังไม่มีบันทึก"));return}
  shareBlob=await drawCard(l);shareName=`workout-${l.date}-${l.prog}.png`;
  const img=document.getElementById("share-img");if(img.src)URL.revokeObjectURL(img.src);img.src=URL.createObjectURL(shareBlob);
  document.getElementById("share-hint").hidden=true;document.getElementById("open-ig").hidden=true;document.getElementById("open-ig-web").hidden=true;document.getElementById("share-modal").hidden=false;
}
document.getElementById("share-last").addEventListener("click",()=>{
  const ds=logs.filter(l=>l.date===DAY);
  if(!ds.length){toast(t("วันนี้ไม่มีบันทึกเวท"));return}
  if(ds.length===1){openShare(ds[0]);return}
  const ex={},names={};ds.forEach(l=>{Object.assign(ex,l.ex);Object.assign(names,l.names||{})});
  openShare({date:DAY,prog:ds.map(l=>progName(l.prog)).join(" + "),ex,names});
});
document.getElementById("share-close").addEventListener("click",()=>document.getElementById("share-modal").hidden=true);
async function storyBlob(){
  const im=new Image();const url=URL.createObjectURL(shareBlob);await new Promise(r=>{im.onload=r;im.src=url});
  const W=1080,H=1920,c=document.createElement("canvas");c.width=W;c.height=H;const x=c.getContext("2d");
  const g=x.createLinearGradient(0,0,0,H);g.addColorStop(0,"#141414");g.addColorStop(1,"#000");x.fillStyle=g;x.fillRect(0,0,W,H);
  const sc=Math.min((W-80)/im.width,(H-360)/im.height,1);const w=im.width*sc,h=im.height*sc;
  x.drawImage(im,(W-w)/2,(H-h)/2,w,h);URL.revokeObjectURL(url);
  return new Promise(r=>c.toBlob(b=>r(b),"image/png"));
}
document.getElementById("share-story").addEventListener("click",async()=>{
  const b=await storyBlob();const name=shareName.replace(/\.(png|jpg)$/,"-story.png");
  if(await shareFile(b,name))return;
  downloadBlob(b,name);toast(t("บันทึกแล้ว เปิด IG เพื่อลง Story"));document.getElementById("open-ig").hidden=false;document.getElementById("open-ig-web").hidden=false;return;
  const img=document.getElementById("share-img");URL.revokeObjectURL(img.src);img.src=URL.createObjectURL(b);
  const h=document.getElementById("share-hint");h.textContent=t("กดค้างที่รูปเพื่อบันทึก");h.hidden=false;
});
document.getElementById("share-save").addEventListener("click",async()=>{
  if(await shareFile(shareBlob,shareName))return;
  downloadBlob(shareBlob,shareName);toast(t("รูปถูกส่งแล้ว"));return;
  const h=document.getElementById("share-hint");h.textContent=t("กดค้างที่รูปเพื่อบันทึก");h.hidden=false;
});
