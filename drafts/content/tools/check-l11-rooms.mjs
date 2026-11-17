// L11-C1: check the 56 tier 4-10 room drafts in drafts/content/rooms/L11/ with the game's own code.
// 1) every file loads with loadRoom; 2) all of content/ plus these rooms loads with loadContent
// (each not-yet-built Guardian is stood in by a copy of the Floor Keeper, for this check only);
// 3) floorRooms gives each tier 4-10 exactly its 8 rooms (4 battle, 1 challenge, 1 treasure, 1 rest, 1 boss)
// and tiers 1-3 keep the rooms they have today; 4) only live enemies, plus each tier's own Guardian
// in its Guardian room only; 5) kid lines (name, signs, challenge words) are 8 words or fewer, no banned words.
// Reads game files only; changes nothing. Usage: node --experimental-strip-types drafts/content/tools/check-l11-rooms.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { registerHooks } from 'node:module';

// The game's source imports files without ".ts"; let Node find them (Node 23.5 or newer).
registerHooks({
  resolve(spec, ctx, next) {
    try { return next(spec, ctx); } catch (e) {
      if (spec.startsWith('.') && !path.extname(spec)) {
        for (const tail of ['.ts', '/index.ts']) { try { return next(spec + tail, ctx); } catch {} }
      }
      throw e;
    }
  },
});

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const imp = (p) => import(pathToFileURL(path.join(root, p)).href);
const { loadRoom } = await imp('packages/sim/src/room.ts');
const { loadContent } = await imp('packages/sim/src/content.ts');
const { floorRooms } = await imp('packages/sim/src/run.ts');
const json = (p) => JSON.parse(fs.readFileSync(path.join(root, p), 'utf8'));
const dir = (d) => fs.readdirSync(path.join(root, d)).filter((f) => f.endsWith('.json')).sort().map((f) => json(`${d}/${f}`));

const GUARDIAN = { 4: 'stone-giant', 5: 'river-watcher', 6: 'ember-knight', 7: 'echo-mask', 8: 'root-keeper', 9: 'storm-herald', 10: 'lost-lightbearer' };
const BANNED = /\b(perfect|kill|die|dead|blood|stupid|hate|loser|fail(ed)?|weak|lazy|must|buy|pay)\b/i;
const drafts = dir('drafts/content/rooms/L11');
let bad = 0;
const fail = (m) => { bad++; console.log('FAIL ' + m); };

for (const r of drafts) { try { loadRoom(r); } catch (e) { fail(`${r.id}: ${e.message}`); } }

const liveEnemies = dir('content/enemies');
const liveIds = new Set(liveEnemies.map((e) => e.id));
const keeper = liveEnemies.find((e) => e.id === 'floor-keeper');
const stand = Object.values(GUARDIAN).map((id) => ({ ...structuredClone(keeper), id, name: id }));
const liveRooms = dir('content/rooms');
const raw = (rooms, enemies) => ({
  rooms, enemies,
  insights: json('content/insights/insights.json'), gear: json('content/loot/gear.json'), drops: json('content/loot/drops.json'),
  abilities: json('content/abilities/abilities.json'), sealFamilies: json('content/abilities/seal-families.json'),
  strikes: json('content/abilities/strikes.json'), kataPowers: json('content/abilities/kata-powers.json'),
  dojoRoom: json('content/dojo/home-dojo.json'), decorations: json('content/dojo/decorations.json'),
  twists: json('content/twists/twists.json'), elites: json('content/elites/elites.json'), named: json('content/named/named.json'),
  guardianScale: json('content/settings/guardian-scale.json'),
});
const before = loadContent(raw(liveRooms, liveEnemies));
let after;
try { after = loadContent(raw([...liveRooms, ...drafts], [...liveEnemies, ...stand])); } catch (e) { fail('loadContent: ' + e.message); }

if (after) {
  for (const t of [1, 2, 3]) {
    const a = floorRooms(before, t).map((r) => r.id).sort().join(), b = floorRooms(after, t).map((r) => r.id).sort().join();
    if (a !== b) fail(`tier ${t} rooms changed`);
  }
  for (const t of [4, 5, 6, 7, 8, 9, 10]) {
    const rs = floorRooms(after, t);
    const count = (k) => rs.filter((r) => r.kind === k).length;
    const want = { battle: 4, challenge: 1, treasure: 1, rest: 1, boss: 1 };
    if (rs.length !== 8 || Object.entries(want).some(([k, n]) => count(k) !== n)) fail(`tier ${t}: ${rs.length} rooms, kinds ${JSON.stringify(Object.fromEntries(Object.keys(want).map((k) => [k, count(k)])))}`);
    for (const r of rs) {
      if (!r.id.startsWith(`t${t}-`)) fail(`${r.id} is on tier ${t}`);
      for (const s of r.enemySpawns) {
        const g = Object.values(GUARDIAN).includes(s.enemy);
        if (g && !(r.kind === 'boss' && s.enemy === GUARDIAN[t])) fail(`${r.id}: Guardian ${s.enemy} out of place`);
        if (!g && !liveIds.has(s.enemy)) fail(`${r.id}: ${s.enemy} is not a live enemy`);
        if (!g && after.enemies[s.enemy].boss) fail(`${r.id}: boss ${s.enemy} in a room`);
      }
      if (r.kind === 'boss' && !r.enemySpawns.some((s) => s.enemy === GUARDIAN[t])) fail(`${r.id}: no ${GUARDIAN[t]}`);
    }
  }
}

for (const r of drafts) {
  const lines = [r.name, ...(r.signs ?? []), ...(r.challenge ? [r.challenge.text, r.challenge.inTimeText, r.challenge.outOfTimeText, r.challenge.outOfTimeShort] : [])];
  for (const l of lines) {
    const n = l.split(/\s+/).filter(Boolean).length;
    if (n > 8) fail(`${r.id}: ${n} words: "${l}"`);
    if (BANNED.test(l)) fail(`${r.id}: banned word: "${l}"`);
  }
}
console.log(bad ? `${bad} problem(s)` : `OK: ${drafts.length} rooms load; tiers 4-10 each get their own 8 rooms; tiers 1-3 unchanged; live enemies only; kid lines 8 words or fewer`);
process.exit(bad ? 1 : 0);
