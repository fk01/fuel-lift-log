// muscle-map.js — muscle map
// Classic script: shares globals with the other files in /js (load order is set in index.html).
/* ---------- muscle map ---------- */
const MUS={ // id: [primary, secondary]
 "chest-press":[["chest"],["delt","tri"]],"incline-db":[["chest","delt"],["tri"]],"pec-fly":[["chest"],["delt"]],
 "db-shoulder-press":[["delt"],["tri","traps"]],"cable-lat-raise":[["delt"],[]],"cable-oh-tri":[["tri"],[]],
 "lat-pulldown":[["lats"],["bi","rear"]],"wide-cable-row":[["lats","traps","rear"],["bi"]],"seated-cable-row":[["lats","traps"],["bi","rear"]],
 "reverse-fly":[["rear"],["traps"]],"machine-curl":[["bi"],["fore"]],"abdominal":[["abs"],["obl"]],
 "squat":[["quad","glute"],["ham","add"]],"deadlift":[["ham","glute"],["lats","traps","fore"]],"leg-curl":[["ham"],["calf"]],"leg-ext":[["quad"],[]],
 "hip-abd":[["abd"],["glute"]],"hip-add":[["add"],[]],"seated-calf":[["calf"],[]],"woodchop":[["obl"],["abs"]]};
const KW=[["chest","chest"],["press","chest"],["fly","chest"],["shoulder","delt"],["lateral","delt"],["tricep","tri"],["curl","bi"],["bicep","bi"],["row","lats"],["pull","lats"],["squat","quad"],["lunge","quad"],["leg ext","quad"],["deadlift","ham"],["rdl","ham"],["calf","calf"],["crunch","abs"],["ab","abs"],["plank","abs"],["glute","glute"],["hip","glute"]];
function musOf(e){const L=typeof EXLIB!=="undefined"&&EXLIB.find(x=>x.id===e.id);const mp=(L&&L.mp)||e.mp;if(mp&&mp.length)return [mp,(L&&L.ms)||e.ms||[]];if(MUS[e.id])return MUS[e.id];const n=(e.n||"").toLowerCase();const p=[...new Set(KW.filter(([k])=>n.includes(k)).map(([,m])=>m))].slice(0,2);return [e.g&&GROUP_MUS[e.g]?GROUP_MUS[e.g]:p,[]]}
const FRONT=[["delt","ellipse",30,40,7,6],["delt","ellipse",70,40,7,6],["chest","ellipse",42,49,9,7],["chest","ellipse",58,49,9,7],
 ["bi","ellipse",24,60,4.5,10],["bi","ellipse",76,60,4.5,10],["fore","ellipse",21,82,3.5,11],["fore","ellipse",79,82,3.5,11],
 ["abs","rect",43,58,14,30],["obl","ellipse",37,72,3.5,11],["obl","ellipse",63,72,3.5,11],
 ["quad","ellipse",42,122,7.5,21],["quad","ellipse",58,122,7.5,21],["add","ellipse",48,112,2.5,12],["add","ellipse",52,112,2.5,12],["calf","ellipse",42,165,5,12],["calf","ellipse",58,165,5,12]];
const BACK=[["traps","poly","50,30 38,38 44,52 56,52 62,38"],["rear","ellipse",30,40,7,6],["rear","ellipse",70,40,7,6],["lats","ellipse",39,63,8,13],["lats","ellipse",61,63,8,13],
 ["tri","ellipse",24,60,4.5,10],["tri","ellipse",76,60,4.5,10],["fore","ellipse",21,82,3.5,11],["fore","ellipse",79,82,3.5,11],
 ["glute","ellipse",42,99,8.5,9],["glute","ellipse",58,99,8.5,9],["abd","ellipse",32,98,3.5,8],["abd","ellipse",68,98,3.5,8],
 ["ham","ellipse",42,128,7,18],["ham","ellipse",58,128,7,18],["calf","ellipse",42,165,6,12],["calf","ellipse",58,165,6,12]];
// anatomy figure: base illustration + one mask per muscle (public/img/mus/*.png), each tinted with CSS mask-image
const MUS_NAME={chest:"อก",delt:"ไหล่หน้า",rear:"ไหล่หลัง",traps:"บ่า",lats:"หลัง",bi:"หน้าแขน",tri:"หลังแขน",fore:"แขนท่อนล่าง",abs:"หน้าท้อง",obl:"ข้างลำตัว",quad:"ต้นขาหน้า",ham:"ต้นขาหลัง",glute:"ก้น",calf:"น่อง",abd:"ขานอก",add:"ขาใน"};
const MUS_KEYS=["chest","delt","rear","traps","lats","bi","tri","fore","abs","obl","quad","ham","glute","calf","abd","add"];
function bodySVG(prim,sec,h=44,colFn){
  const P=new Set(prim),S=new Set(sec),col=colFn||(m=>P.has(m)?"#e8a46a":S.has(m)?"#8a6040":null);
  const w=Math.round(h*420/647);
  return `<span class="body-fig" style="width:${w}px;height:${h}px" aria-hidden="true"><img src="/img/mus-base.png" alt="">${MUS_KEYS.map(m=>{const c=col(m);return c&&c!=="#2f2e2b"?`<i style="background:${c};-webkit-mask-image:url(/img/mus/${m}.png);mask-image:url(/img/mus/${m}.png)"></i>`:""}).join("")}<img class="bf-lines" src="/img/mus-base.png" alt=""></span>`;
}
function musUnion(list){const p=new Set(),s=new Set();list.forEach(e=>{const [a,b]=musOf(e);a.forEach(x=>p.add(x));b.forEach(x=>s.add(x))});p.forEach(x=>s.delete(x));return [[...p],[...s]]}
