// hero.js — pixel hero sprite
// Classic script: shares globals with the other files in /js (load order is set in index.html).
/* ---------- pixel hero ---------- */
const HERO_IMG=[1,2,3].map(n=>{const i=new Image();i.src="/hero-"+n+".png";return i});
function heroXP(){let n=0;logs.forEach(l=>Object.values(l.ex).forEach(s=>s.forEach(x=>{if(+x.reps>0)n++})));
  if(draft&&draft.ex)Object.values(draft.ex).forEach(s=>s.forEach(x=>{if(x.ok)n++}));let c=0;Object.values(food).forEach(d=>{const g=d&&d.tags||{};if(g.run)c++;if(g.bad)c++});return n*10+c*50}
function lvOf(xp){let L=1;while(xp>=25*L*(L+1))L++;return L}
function tierOf(L){return L<5?0:L<12?1:2}
function drawHero(cv,tier,pose,f){const c=cv.getContext("2d"),W=cv.width,H=cv.height,im=HERO_IMG[tier];c.imageSmoothingEnabled=false;c.clearRect(0,0,W,H);
  if(!im.complete)return;
  const bar=(y)=>{c.fillStyle="#c9c9c9";c.fillRect(4,y,W-8,3);c.fillStyle="#555";c.fillRect(2,y-5,6,13);c.fillRect(W-8,y-5,6,13)};
  if(pose==="idle"){c.drawImage(im,0,f?1:0,W,H-(f?1:0));return}
  if(pose==="legs"){const d=f?8:0;bar(25+d);c.drawImage(im,0,d,W,H-d);return}
  const d=pose==="pull"?(f?3:0):(f?0:2);c.drawImage(im,0,d,W,H-d);bar(pose==="pull"?(f?4:0):(f?0:5))}
let heroLv=null,heroF=0;
function renderHero(){const xp=heroXP(),L=lvOf(xp),lo=25*(L-1)*L,hi=25*L*(L+1),tr=tierOf(L);
  document.getElementById("hero-lv").textContent="Lv "+L;
  document.getElementById("hero-tier").textContent=(lang==="th"?["มือใหม่","สายฟิต","ตัวท็อป"]:["Rookie","Fit","Beast"])[tr];
  document.getElementById("hero-fill").style.width=((xp-lo)/(hi-lo)*100)+"%";
  document.getElementById("hero-xp").textContent=xp+" XP";
  document.getElementById("hero-next").textContent=(lang==="th"?"อีก ":"")+(hi-xp)+(lang==="th"?" XP ถึงเลเวลถัดไป":" XP to next");
  if(heroLv!==null&&L>heroLv){const el=document.getElementById("hero");el.classList.remove("lv");void el.offsetWidth;el.classList.add("lv");toast((lang==="th"?"เลเวลอัป! Lv ":"LEVEL UP! Lv ")+L+(tierOf(heroLv)<tr?" 💪":""))}
  heroLv=L;return tr}
setInterval(()=>{heroF^=1;try{const tr=tierOf(lvOf(heroXP()));const hv=document.getElementById("hero-cv");if(hv&&!document.getElementById("v-gym").hidden)drawHero(hv,tr,"idle",heroF);
  if(!document.getElementById("rest").hidden){const p=(PROGS[cur]&&/pull|back/i.test(cur))?"pull":/leg|lower/i.test(cur)?"legs":"push";drawHero(document.getElementById("rest-cv"),tr,p,heroF)}}catch(e){}},450);
