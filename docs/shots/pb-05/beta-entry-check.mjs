// PB-05 QA entry: a beta build must not contain the Training Board "Testing" button.
// The button is the only ordinary-click way into the existing fixture screen.
// Usage: node docs/shots/pb-05/beta-entry-check.mjs apps/client/dist
// Exits 1 if a quoted Testing label is in the built JavaScript.

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const dist = process.argv[2];
if (!dist) {
  console.error('usage: node docs/shots/pb-05/beta-entry-check.mjs <beta-dist-dir>');
  process.exit(2);
}

const files = [];
const walk = (dir) => {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p);
    else if (name.endsWith('.js')) files.push(p);
  }
};
walk(dist);

const js = files.map((p) => readFileSync(p, 'utf8')).join('\n');
// The minifier keeps the label in backticks. "Testing screen" is a different string and does not count.
const button = js.match(/["'`]Testing["'`]/g) ?? [];
const screen = (js.match(/Testing screen/g) ?? []).length;
console.log(`files ${files.length}`);
console.log(`quoted Testing label ${button.length}`);
console.log(`Testing screen string ${screen}`);
if (button.length > 0) {
  console.error('FAIL: beta bundle still has the Testing button label, so the fixture list can be opened from it.');
  process.exit(1);
}
console.log('PASS: beta bundle has no Testing button. The fixture screen cannot be opened through that entry.');
