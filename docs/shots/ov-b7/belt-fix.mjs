// OV-B7: the belt screen behind the grown-up gate shows the parent note; Save only raises the belt;
// "Fix a mistake" lowers a wrong entry after "Change the saved belt to ...?" with "Keep {belt}".
// The child then sees "Your belt was updated." Taps only, after the start set-up opens the Dojo.
// Usage: URL=http://localhost:5191/ OUT=/workspace/ovb7-shots node docs/shots/ov-b7/belt-fix.mjs
import { chromium } from 'playwright';
import fs from 'fs';

const URL = process.env.URL || 'http://localhost:5173/';
const OUT = process.env.OUT || '/opt/cursor/artifacts/ov-b7';
fs.mkdirSync(OUT, { recursive: true });
const rows = [];
const check = (where, name, ok, info = '') => rows.push(`${ok ? 'PASS' : 'FAIL'}  ${where}  ${name}${info ? '  (' + info + ')' : ''}`);
const b = await chromium.launch();
const KEY = 'dojo-ascent-profile-v1';

/** Visible text inside the newest overlay (depth 70 to 90), with screen bounds. */
const texts = (pg) => pg.evaluate(() => {
  const o = [];
  const s = window.game.scene.getScene('Dojo');
  const top = s.children.list.filter((c) => c.type === 'Container' && c.visible && c.depth >= 70 && c.depth <= 90 && c.list.length > 1).pop();
  const w = (l) => { for (const c of l) { if (c.list) w(c.list); if (c.type === 'Text' && c.visible && c.text && c.alpha > 0) { const b = c.getBounds(); o.push({ t: c.text, x: b.centerX, y: b.centerY, l: b.left, top: b.top, r: b.right, bot: b.bottom }); } } };
  if (top) w(top.list);
  return o;
});
const find = async (pg, re) => (await texts(pg)).find((t) => re.test(t.t));
const tap = async (pg, re) => { const t = await find(pg, re); if (!t) return false; await pg.touchscreen.tap(t.x, t.y); await pg.waitForTimeout(250); return true; };
const entry = (pg) => pg.evaluate((k) => JSON.parse(localStorage.getItem(k) || '{}').beltEntry ?? null, KEY);
function layout(tag, name, ts, W, H) {
  const out = ts.filter((t) => t.l < 8 || t.r > W - 8 || t.top < 4 || t.bot > H - 4);
  check(tag, `${name}: all text on screen with 8px edge`, out.length === 0, out.map((t) => t.t).join(' | '));
  const lap = [];
  for (let i = 0; i < ts.length; i++) for (let j = i + 1; j < ts.length; j++) {
    const a = ts[i], c = ts[j];
    if (a.l < c.r - 1 && c.l < a.r - 1 && a.top < c.bot - 1 && c.top < a.bot - 1) lap.push(`${a.t}/${c.t}`);
  }
  check(tag, `${name}: no text overlaps`, lap.length === 0, lap.join(' | '));
}
async function gate(pg) {
  await pg.evaluate(() => window.game.scene.getScene('Dojo').openGrownUpGate('play'));
  await pg.waitForTimeout(250);
  const q = await find(pg, /what is \d+ \+ \d+/);
  const [, a, c] = q.t.match(/(\d+) \+ (\d+)/);
  await tap(pg, new RegExp(`^${Number(a) + Number(c)}$`));
  return tap(pg, /^Belt & stripes$/);
}
async function shot(pg, tag, name) { await pg.screenshot({ path: `${OUT}/${tag}-${name}.png` }); }

for (const [W, H] of [[844, 390], [667, 375]]) for (const rm of ['off', 'on']) {
  const tag = `${W}x${H}-rm-${rm}`;
  const ctx = await b.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
  await ctx.addInitScript((k) => {
    if (!sessionStorage.getItem('ovb7-init')) {
      localStorage.clear();
      sessionStorage.setItem('ovb7-init', '1');
      localStorage.setItem('dojo-ascent-test-student', '2-white-belt-3-signoffs');
      localStorage.setItem('dojo.reducedMotion', k);
    }
  }, rm);
  const pg = await ctx.newPage();
  await pg.goto(URL);
  await pg.waitForFunction(() => window.game?.scene?.getScenes?.(true).length);
  // Start set-up (not a tap): a finished guide, then straight into the Dojo.
  await pg.evaluate((k) => {
    const p = JSON.parse(localStorage.getItem(k) || '{}');
    Object.assign(p, { runsPlayed: 5, runsStarted: 5, guideStep: 99 });
    localStorage.setItem(k, JSON.stringify(p));
    const g = window.game;
    g.scene.getScenes(true).forEach((s) => g.scene.stop(s.scene.key));
    g.scene.start('Dojo');
  }, KEY);
  await pg.waitForFunction(() => window.game.scene.getScene('Dojo')?.sys.isActive());
  await pg.waitForTimeout(1500);
  // The Dojo opens with "Bow as you enter your dojo": bow first, as a player would.
  await tap(pg, /^Bow$/);
  for (let i = 0; i < 40 && (await pg.evaluate(() => window.game.scene.getScene('Dojo').mode)) !== 'play'; i++) await pg.waitForTimeout(500);
  check(tag, 'reduced motion reads back', (await pg.evaluate(() => localStorage.getItem('dojo.reducedMotion'))) === rm);

  check(tag, 'gate passes into the belt screen', await gate(pg));
  let ts = await texts(pg);
  await shot(pg, tag, '01-entry');
  check(tag, 'parent note shown', ts.some((t) => t.t.startsWith('A grown-up should set the belt, not the student.')));
  check(tag, 'no "only go up" words', !ts.some((t) => /only go up|can't be lowered/.test(t.t)));
  check(tag, 'Back, Fix a mistake and Save shown', ['Back', 'Fix a mistake', 'Save'].every((s) => ts.some((t) => t.t === s)));
  layout(tag, 'entry', ts, W, H);

  await tap(pg, /^Green Belt$/);
  await tap(pg, /^Save$/);
  ts = await texts(pg);
  await shot(pg, tag, '02-confirm-save');
  check(tag, 'save confirm says a grown-up can fix it', ts.some((t) => t.t === 'Save Green Belt? If it is wrong, a grown-up can fix it here.'), ts.map((t) => t.t).join(' | '));
  layout(tag, 'save confirm', ts, W, H);
  await tap(pg, /^Yes, save$/);
  check(tag, 'Green saved', JSON.stringify(await entry(pg)) === JSON.stringify({ belt: 'green', stripes: 0 }), JSON.stringify(await entry(pg)));

  await pg.waitForTimeout(2500);
  check(tag, 'gate again for the fix', await gate(pg));
  await tap(pg, /^Yellow Belt$/);
  await tap(pg, /^Save$/);
  check(tag, 'normal Save cannot lower (no confirm for Yellow)', !(await find(pg, /Save Yellow/)));
  await tap(pg, /^Not yet$/);
  check(tag, 'Fix a mistake opens', await tap(pg, /^Fix a mistake$/));
  ts = await texts(pg);
  await shot(pg, tag, '03-fix');
  check(tag, 'fix title and help', ts.some((t) => t.t === 'Fix the belt') && ts.some((t) => t.t === 'A grown-up can correct a wrong belt here.'));
  layout(tag, 'fix', ts, W, H);
  await tap(pg, /^Yellow Belt$/);
  await tap(pg, /^Save$/);
  ts = await texts(pg);
  await shot(pg, tag, '04-confirm-fix');
  check(tag, 'fix confirm words', ts.some((t) => t.t === 'Change the saved belt to Yellow Belt?'), ts.map((t) => t.t).join(' | '));
  check(tag, '"Keep Green Belt" and "Yes, fix it"', ts.some((t) => t.t === 'Keep Green Belt') && ts.some((t) => t.t === 'Yes, fix it'));
  layout(tag, 'fix confirm', ts, W, H);
  await tap(pg, /^Keep Green Belt$/);
  check(tag, 'Keep leaves Green saved', (await entry(pg))?.belt === 'green');
  await tap(pg, /^Save$/);
  await tap(pg, /^Yes, fix it$/);
  await pg.waitForTimeout(300);
  const toast = await pg.evaluate(() => {
    const o = [];
    const w = (l) => { for (const c of l) { if (c.list) w(c.list); if (c.type === 'Text' && c.visible) o.push(c.text); } };
    w(window.game.scene.getScene('Dojo').children.list);
    return o;
  });
  await shot(pg, tag, '05-fixed');
  check(tag, 'child sees "Your belt was updated."', toast.includes('Your belt was updated.'));
  check(tag, 'Yellow saved after fix', JSON.stringify(await entry(pg)) === JSON.stringify({ belt: 'yellow', stripes: 0 }), JSON.stringify(await entry(pg)));
  check(tag, 'Dojo shows Yellow now', await pg.evaluate(() => window.game.scene.getScene('Dojo').training.belt.id) === 'yellow');

  await pg.waitForTimeout(2500);
  await gate(pg);
  await tap(pg, /^Fix a mistake$/);
  check(tag, 'Back from the fix returns to the belt screen', (await tap(pg, /^Back$/)) && !!(await find(pg, /^Belt and stripes$/)));
  check(tag, 'Back closes the belt screen', (await tap(pg, /^Back$/)) && !(await find(pg, /^Belt and stripes$/)));
  await ctx.close();
}
await b.close();
fs.writeFileSync(`${OUT}/results.txt`, rows.join('\n') + '\n');
console.log(rows.join('\n'));
console.log(`${rows.filter((r) => r.startsWith('PASS')).length}/${rows.filter((r) => r.startsWith('FAIL')).length}`);
