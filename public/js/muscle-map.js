// muscle-map.js — muscle map
// Classic script: shares globals with the other files in /js (load order is set in index.html).
/* ---------- muscle map ---------- */
const MUS={ // id: [primary, secondary]
 "chest-press":[["chest"],["delt","tri"]],"incline-db":[["chest","delt"],["tri"]],"pec-fly":[["chest"],["delt"]],
 "db-shoulder-press":[["delt"],["tri","traps"]],"cable-lat-raise":[["delt"],[]],"cable-oh-tri":[["tri"],[]],
 "lat-pulldown":[["lats"],["bi","rear"]],"wide-cable-row":[["lats","traps","rear"],["bi"]],"seated-cable-row":[["lats","traps"],["bi","rear"]],
 "reverse-fly":[["rear"],["traps"]],"machine-curl":[["bi"],["fore"]],"abdominal":[["abs"],["obl"]],
 "squat":[["quad","glute"],["ham","add"]],"leg-curl":[["ham"],["calf"]],"leg-ext":[["quad"],[]],
 "hip-abd":[["abd"],["glute"]],"hip-add":[["add"],[]],"seated-calf":[["calf"],[]],"woodchop":[["obl"],["abs"]]};
const KW=[["chest","chest"],["press","chest"],["fly","chest"],["shoulder","delt"],["lateral","delt"],["tricep","tri"],["curl","bi"],["bicep","bi"],["row","lats"],["pull","lats"],["squat","quad"],["lunge","quad"],["leg ext","quad"],["deadlift","ham"],["rdl","ham"],["calf","calf"],["crunch","abs"],["ab","abs"],["plank","abs"],["glute","glute"],["hip","glute"]];
function musOf(e){if(MUS[e.id])return MUS[e.id];const n=(e.n||"").toLowerCase();const p=[...new Set(KW.filter(([k])=>n.includes(k)).map(([,m])=>m))].slice(0,2);return [e.g&&GROUP_MUS[e.g]?GROUP_MUS[e.g]:p,[]]}
const FRONT=[["delt","ellipse",30,40,7,6],["delt","ellipse",70,40,7,6],["chest","ellipse",42,49,9,7],["chest","ellipse",58,49,9,7],
 ["bi","ellipse",24,60,4.5,10],["bi","ellipse",76,60,4.5,10],["fore","ellipse",21,82,3.5,11],["fore","ellipse",79,82,3.5,11],
 ["abs","rect",43,58,14,30],["obl","ellipse",37,72,3.5,11],["obl","ellipse",63,72,3.5,11],
 ["quad","ellipse",42,122,7.5,21],["quad","ellipse",58,122,7.5,21],["add","ellipse",48,112,2.5,12],["add","ellipse",52,112,2.5,12],["calf","ellipse",42,165,5,12],["calf","ellipse",58,165,5,12]];
const BACK=[["traps","poly","50,30 38,38 44,52 56,52 62,38"],["rear","ellipse",30,40,7,6],["rear","ellipse",70,40,7,6],["lats","ellipse",39,63,8,13],["lats","ellipse",61,63,8,13],
 ["tri","ellipse",24,60,4.5,10],["tri","ellipse",76,60,4.5,10],["fore","ellipse",21,82,3.5,11],["fore","ellipse",79,82,3.5,11],
 ["glute","ellipse",42,99,8.5,9],["glute","ellipse",58,99,8.5,9],["abd","ellipse",32,98,3.5,8],["abd","ellipse",68,98,3.5,8],
 ["ham","ellipse",42,128,7,18],["ham","ellipse",58,128,7,18],["calf","ellipse",42,165,6,12],["calf","ellipse",58,165,6,12]];
function bodySVG(prim,sec,h=44){
  const P=new Set(prim),S=new Set(sec);const col=m=>P.has(m)?"#e8a46a":S.has(m)?"#7a5a40":"#2f2e2b";
  const base=`<circle cx="50" cy="14" r="9" fill="#3a3936"/><rect x="45" y="22" width="10" height="8" fill="#3a3936"/><path d="M30 34 L70 34 L64 92 L36 92Z" fill="#33322f"/><path d="M36 90 L64 90 L62 182 L52 182 L50 112 L48 182 L38 182Z" fill="#33322f"/><path d="M24 36 L30 36 L26 96 L17 96Z M70 36 L76 36 L83 96 L74 96Z" fill="#33322f"/>`;
  const shp=(a,dx)=>a.map(([m,k,...v])=>k==="ellipse"?`<ellipse cx="${v[0]+dx}" cy="${v[1]}" rx="${v[2]}" ry="${v[3]}" fill="${col(m)}"/>`:k==="rect"?`<rect x="${v[0]+dx}" y="${v[1]}" width="${v[2]}" height="${v[3]}" rx="3" fill="${col(m)}"/>`:`<polygon points="${v[0].split(" ").map(pt=>{const [x,y]=pt.split(",");return (+x+dx)+","+y}).join(" ")}" fill="${col(m)}"/>`).join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 210 190" height="${h}" width="${Math.round(h*210/190)}" aria-hidden="true" style="flex:none"><g>${base}${shp(FRONT,0)}</g><g transform="translate(110,0)">${base}</g>${shp(BACK,110)}</svg>`;
}
function musUnion(list){const p=new Set(),s=new Set();list.forEach(e=>{const [a,b]=musOf(e);a.forEach(x=>p.add(x));b.forEach(x=>s.add(x))});p.forEach(x=>s.delete(x));return [[...p],[...s]]}
