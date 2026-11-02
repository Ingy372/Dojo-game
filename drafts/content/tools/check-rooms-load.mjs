// R-G2B-07: load every drafted room with the game's own loadRoom (packages/sim/src/room.ts) and report any error.
// Reads the game file only; changes nothing. Needs Node 22.6 or newer.
// Usage: node --experimental-strip-types drafts/content/tools/check-rooms-load.mjs [rooms.json]
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const file = process.argv[2] ?? path.join(root, 'drafts/content/rooms/giants-steps.json');
const { loadRoom } = await import(pathToFileURL(path.join(root, 'packages/sim/src/room.ts')).href);
const data = JSON.parse(fs.readFileSync(file, 'utf8'));
let bad = 0;
for (const room of data.rooms) {
  try {
    loadRoom(room);
  } catch (err) {
    bad++;
    console.log(`FAIL ${room.id}: ${err.message}`);
  }
}
console.log(bad ? `${bad} of ${data.rooms.length} rooms failed to load` : `OK: all ${data.rooms.length} rooms load with loadRoom`);
process.exit(bad ? 1 : 0);
