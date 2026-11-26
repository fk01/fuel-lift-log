// number-pad.js — tap-only number picker
// Classic script: shares globals with the other files in /js (load order is set in index.html).
/* ---------- tap-only number picker (no keyboard) ---------- */
const seq=n=>Array.from({length:n},(_,i)=>i+1);
const PAD={
  kg:{steps:[1,2.5,5,10],sib:1},
  reps:{chips:seq(20),cols:5,steps:[1]},
  sets:{chips:seq(10),cols:5},
  rng:{chips:["5","6","8","10","12","15","5-8","6-10","8-12","10-15","12-15","15-20"],cols:4,text:1},
  km:{steps:[.01,.1,1],chips:[3,5,10,21.1],cols:4,def:10,fix:2},
  time:{steps:[1,10,60,600],lab:["1s","10s","1m","10m"],def:3600,time:1}
};
let pad=null;
function padFmt(){const c=pad.c,v=pad.v;if(v===null||v==="")return "";return c.text?String(v):c.time?fmtDur(v):c.fix?(+v).toFixed(c.fix):String(v)}
function padShow(){document.getElementById("pad-v").textContent=padFmt()||"–";
  document.querySelectorAll("#pad-chips button").forEach(b=>b.setAttribute("aria-pressed",b.dataset.v===String(pad.v)))}
function padCommit(){if(!pad||!pad.dirty)return;pad.dirty=false;const el=pad.el;el.value=padFmt();
  el.dispatchEvent(new Event("input",{bubbles:true}));el.dispatchEvent(new Event("change",{bubbles:true}))}
function padClose(){padCommit();pad=null;document.getElementById("pad").hidden=true}
function openPad(el){const c=PAD[el.dataset.pad];if(!c)return;el.blur();
  const raw=el.value.trim();let v=raw===""?null:c.text?raw:c.time?parseDur(raw):+raw;if(!c.text&&v!==null&&!isFinite(v))v=null;
  pad={el,c,v,dirty:false};if(v===null&&c.def!=null){pad.v=c.def;pad.dirty=true}if(v===null&&el.dataset.pad==="kg"&&+el.placeholder>0){pad.v=+el.placeholder;pad.dirty=true}
  const lab=el.closest("label");document.getElementById("pad-t").textContent=el.getAttribute("aria-label")||(lab&&lab.querySelector("span")?lab.querySelector("span").textContent:"");
  let chips=(c.chips||[]).slice();
  if(c.sib){const g=el.closest(".sets");if(g)chips=[...new Set([...g.querySelectorAll(`[data-pad="${el.dataset.pad}"]`)].map(x=>x.value).filter(x=>x!==""))].slice(0,8)}
  const cb=document.getElementById("pad-chips");cb.hidden=!chips.length;cb.style.gridTemplateColumns=`repeat(${c.cols||Math.min(4,chips.length||1)},minmax(0,1fr))`;
  cb.innerHTML=chips.map(x=>`<button type="button" data-v="${x}">${x}</button>`).join("");
  const st=c.steps||[],sb=document.getElementById("pad-steps");sb.hidden=!st.length;sb.style.gridTemplateColumns=`repeat(${st.length===1?2:st.length||1},minmax(0,1fr))`;
  sb.innerHTML=[-1,1].map(sg=>st.map((d,i)=>`<button type="button" class="${sg<0?"minus":"plus"}" data-d="${sg*d}">${sg<0?"−":"+"}${c.lab?c.lab[i]:d}</button>`).join("")).join("");
  padShow();document.getElementById("pad").hidden=false}
document.addEventListener("click",ev=>{const el=ev.target.closest&&ev.target.closest("input[data-pad]");if(el){ev.preventDefault();openPad(el)}});
document.getElementById("pad-chips").addEventListener("click",ev=>{const b=ev.target.closest("button");if(!b||!pad)return;pad.v=pad.c.text?b.dataset.v:+b.dataset.v;pad.dirty=true;padClose()});
document.getElementById("pad-steps").addEventListener("click",ev=>{const b=ev.target.closest("button");if(!b||!pad)return;
  pad.v=Math.max(0,Math.round(((+pad.v||0)+ +b.dataset.d)*100)/100);pad.dirty=true;padCommit();padShow()});
document.getElementById("pad-clear").addEventListener("click",()=>{if(!pad)return;pad.v=null;pad.dirty=true;padClose()});
document.getElementById("pad-done").addEventListener("click",padClose);
document.getElementById("pad").addEventListener("click",ev=>{if(ev.target.id==="pad")padClose()});

// Done label: set directly (the "เสร็จ" i18n key is overridden elsewhere)
{const d=document.getElementById("pad-done");if(d)d.textContent=typeof lang!=="undefined"&&lang==="th"?"เสร็จ":"Done"}
