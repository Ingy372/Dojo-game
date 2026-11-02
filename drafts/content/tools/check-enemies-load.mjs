// R-G2B-27 fix: run the game's own enemy loader (packages/sim/src/enemy.ts loadEnemy) on every drafted enemy and
// Guardian file, then check what loadContent checks across files: every split.into and summon.enemy must have its
// OWN enemy file (in content/enemies/ or drafts/content/enemies/). A name that exists only inside a "variants"
// block does not count. Reads game files only; changes nothing. Needs Node 22.6 or newer.
// Usage: node --experimental-strip-types drafts/content/tools/check-enemies-load.mjs [files...]
import fs from 'node:fs';
import path from 'node:path';
import { register } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
// enemy.ts imports './config' with no extension; teach Node to find the .ts file.
register('data:text/javascript,' + encodeURIComponent(`
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
export async function resolve(spec, ctx, next) {
  if (spec.startsWith('.') && !/\\.[a-z]+$/.test(spec) && ctx.parentURL) {
    const p = fileURLToPath(new URL(spec + '.ts', ctx.parentURL));
    if (fs.existsSync(p)) return next(spec + '.ts', ctx);
  }
  return next(spec, ctx);
}`));
const { loadEnemy } = await import(pathToFileURL(path.join(root, 'packages/sim/src/enemy.ts')).href);

const list = (dir) => fs.existsSync(path.join(root, dir)) ? fs.readdirSync(path.join(root, dir)).filter((f) => f.endsWith('.json')).map((f) => path.join(root, dir, f)) : [];
const isEnemy = (d) => d && typeof d === 'object' && typeof d.id === 'string' && 'attack' in d && 'maxHealth' in d;
const read = (p) => JSON.parse(fs.readFileSync(p, 'utf8'));

const draftFiles = process.argv.length > 2 ? process.argv.slice(2).map((f) => path.resolve(f)) : [...list('drafts/content/enemies'), ...list('drafts/content/bosses')];
const known = new Set();
for (const p of [...list('content/enemies'), ...list('drafts/content/enemies'), ...list('drafts/content/bosses')]) {
  const d = read(p);
  if (isEnemy(d)) known.add(d.id);
}

let bad = 0, n = 0;
const fail = (p, msg) => { bad++; console.log(`FAIL ${path.relative(root, p)}: ${msg}`); };
for (const p of draftFiles) {
  const d = read(p);
  if (!isEnemy(d)) continue;
  n++;
  let def;
  try { def = loadEnemy(d); } catch (err) { fail(p, err.message); continue; }
  if (def.split && !known.has(def.split.into)) fail(p, `splits into "${def.split.into}", which has no enemy file of its own (a "variants" entry does not count)`);
  if (def.summon && !known.has(def.summon.enemy)) fail(p, `calls in "${def.summon.enemy}", which has no enemy file of its own`);
}
console.log(bad ? `${bad} problems in ${n} enemy files` : `OK: ${n} enemy files pass loadEnemy and every split/summon target has its own file`);
process.exit(bad ? 1 : 0);
