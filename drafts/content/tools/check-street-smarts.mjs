// L17-C: load each drafted Street Smarts script with the game's own loadScenario and check kid lines.
// Kid lines (every line, choice, badge and town-light line) are 8 words or fewer; no banned words;
// only {player} and {grownup} placeholders. Reads files only. Needs Node 22.6+.
// Usage: node --experimental-strip-types drafts/content/tools/check-street-smarts.mjs [file.json ...]
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const files = process.argv.slice(2).length ? process.argv.slice(2)
  : ['park-treat', 'busstop-ride'].map((n) => path.join(root, `drafts/content/street-smarts/${n}.json`));
const { loadScenario } = await import(pathToFileURL(path.join(root, 'packages/sim/src/streetSmarts.ts')).href);
const BANNED = ['perfect', 'loot box', 'buy', 'purchase', 'streak', 'hurry', 'stupid', 'kidnap', 'hurt', 'blood', 'kill', 'scary', 'grab'];
let bad = 0;
const fail = (m) => { bad++; console.log('FAIL ' + m); };
const words = (s) => (s.replace(/\{(player|grownup)\}/g, 'x').match(/[A-Za-z0-9']+/g) ?? []).length;
function kid(where, s) {
  if (!s) return;
  if (words(s) > 8) fail(`${where}: ${words(s)} words (max 8): ${s}`);
  for (const w of BANNED) if (new RegExp(`\\b${w}`, 'i').test(s)) fail(`${where}: banned "${w}": ${s}`);
  for (const m of s.match(/\{[^}]*\}/g) ?? []) if (m !== '{player}' && m !== '{grownup}') fail(`${where}: placeholder ${m}`);
}
for (const f of files) {
  const d = JSON.parse(fs.readFileSync(f, 'utf8'));
  const n = path.basename(f);
  try { loadScenario(d); } catch (e) { fail(`${n}: loader: ${e.message}`); }
  if (d.status !== 'DRAFT') fail(`${n}: not marked DRAFT`);
  const chars = new Set(['narrator', 'player', ...d.characters.map((c) => c.id)]);
  for (const sc of d.scenes) {
    const all = [...sc.lines, ...Object.values(sc.branches ?? {}).flat()];
    for (const l of all) {
      if (!chars.has(l.speaker)) fail(`${n}: ${sc.id}: unknown speaker ${l.speaker}`);
      kid(`${n} ${sc.id}`, l.text);
      for (const c of l.choices ?? []) kid(`${n} ${l.id} choice`, c.text);
    }
  }
  kid(`${n} badge`, d.badge?.earned); kid(`${n} badge book`, d.badge?.book); kid(`${n} townLight`, d.townLight?.line);
  if (!d.badge || !d.townLight) fail(`${n}: needs badge and townLight`);
}
console.log(bad ? `${bad} problem(s)` : `ok ${files.length} scripts`);
process.exit(bad ? 1 : 0);
