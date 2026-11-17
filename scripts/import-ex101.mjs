// Build a small exercise catalog + GIFs under public/ from the ex101 dataset,
// shipping only the exercises listed in scripts/ex101-pick.json (add ids there as you start using them).
// Usage: node scripts/import-ex101.mjs [path-to-ex101]   (default: ../ex101)
import { readFileSync, writeFileSync, mkdirSync, copyFileSync, existsSync, readdirSync, rmSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const src = resolve(process.argv[2] || join(root, "..", "ex101"));
const pick = JSON.parse(readFileSync(join(root, "scripts", "ex101-pick.json"), "utf8"));
delete pick._;
const byId = new Map(JSON.parse(readFileSync(join(src, "data", "exercises.json"), "utf8")).map(x => [x.id, x]));

const GROUP = { chest: "chest", back: "back", shoulders: "shoulder", "upper arms": "arms", "lower arms": "arms",
  "upper legs": "legs", "lower legs": "legs", waist: "core" };
const FREE = new Set(["barbell", "dumbbell", "ez barbell", "olympic barbell", "kettlebell", "trap bar", "weighted", "medicine ball"]);
const equip = e => e === "cable" ? "🔗" : FREE.has(e) ? "🏋️" : "🔩";
const title = s => s.replace(/(^|[\s(\-/])([a-z])/g, (m, a, b) => a + b.toUpperCase());

const gifDir = join(root, "public", "ex");
mkdirSync(gifDir, { recursive: true });
mkdirSync(join(root, "public", "data"), { recursive: true });

const out = [], keep = new Set();
for (const [id, as] of Object.entries(pick)) {
  const x = byId.get(id);
  if (!x) { console.warn(`skip ${id}: not in ex101`); continue; }
  const gif = `${id}.gif`, from = join(src, x.gif_url), has = existsSync(from);
  if (has) { copyFileSync(from, join(gifDir, gif)); keep.add(gif); }
  const o = { id: "x" + id, n: title(x.name), g: GROUP[x.body_part] || "other", z: equip(x.equipment),
    t: x.target, e: x.equipment, s: (x.instruction_steps && x.instruction_steps.en) || [] };
  if (has) o.gif = "/ex/" + gif;
  if (as) o.as = as;            // attach to this existing exercise instead of adding a new one
  out.push(o);
}
// drop GIFs no longer in the pick list
let removed = 0;
for (const f of readdirSync(gifDir)) if (!keep.has(f)) { rmSync(join(gifDir, f)); removed++; }
writeFileSync(join(root, "public", "data", "ex101.json"), JSON.stringify(out));
console.log(`catalog: ${out.length} exercises, ${keep.size} GIFs, removed ${removed} old GIFs`);
