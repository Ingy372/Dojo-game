// OV-B5: the Dojo Blessing counted in runs. Home line for 7, 1 and 10 runs and none at 0; a new
// class plays the Blessing card (five-runs line, or the full line when already at 10); Enter the
// Tower uses one run. No hours anywhere. Taps only after the start set-up.
// Usage: OUT=/tmp/ovb5 PORT=5191 node docs/shots/ov-b5/blessing.mjs
import { chromium } from 'playwright';
import fs from 'fs';

const URL = process.env.URL || `http://127.0.0.1:${process.env.PORT || '5173'}/`;
const OUT = process.env.OUT || '/opt/cursor/artifacts/ov-b5';
fs.mkdirSync(OUT, { recursive: true });
const rows = [];
const check = (where, name, ok, info = '') => rows.push(`${ok ? 'PASS' : 'FAIL'}  ${where}  ${name}${info ? '  (' + info + ')' : ''}`);
const b = await chromium.launch();
const KEY = 'dojo-ascent-profile-v1';
const CLOCK = /\d+\s*h left|hour|48/i;

const texts = (pg) => pg.evaluate(() => {
  const o = [];
  for (const s of window.game.scene.getScenes(true)) {
    const w = (l) => { for (const c of l) { if (c.list) w(c.list); if (c.type === 'Text' && c.visible && c.text && c.alpha > 0) { const b = c.getBounds(); o.push({ t: c.text, x: b.centerX, y: b.centerY, l: b.left, top: b.top, r: b.right, bot: b.bottom }); } } };
    w(s.children.list);
  }
  return o;
});
const celebrating = (pg) => pg.evaluate(() => window.game.scene.getScene('Home')?.celebrating === true);
async function drain(pg, W, H, stop) {
  for (let i = 0; i < 30 && (await celebrating(pg)); i++) {
    await pg.waitForTimeout(1900);
    const t = await texts(pg);
    if (stop && t.some((x) => stop.test(x.t))) return t;
    await pg.touchscreen.tap(W / 2, H - 22);
  }
  await pg.waitForTimeout(300);
  return null;
}

async function open(W, H, rm) {
  const ctx = await b.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
  await ctx.addInitScript((k) => {
    if (!sessionStorage.getItem('ovb5-init')) {
      localStorage.clear();
      sessionStorage.setItem('ovb5-init', '1');
      localStorage.setItem('dojo-ascent-test-student', '2-white-belt-3-signoffs');
      localStorage.setItem('dojo.reducedMotion', k);
    }
  }, rm);
  const pg = await ctx.newPage();
  await pg.goto(URL);
  await pg.waitForFunction(() => window.game?.scene?.getScenes?.(true).length);
  for (let i = 0; i < 40; i++) {
    const keys = await pg.evaluate(() => window.game.scene.getScenes(true).map((s) => s.scene.key));
    if (keys.includes('Home') || keys.includes('Dojo')) break;
    if (keys.includes('Title')) await pg.touchscreen.tap(W / 2, H / 2);
    if (keys.includes('Create')) { const g = (await texts(pg)).find((t) => /Let's go/.test(t.t)); if (g) await pg.touchscreen.tap(g.x, g.y); }
    await pg.waitForTimeout(300);
  }
  await home(pg, {});
  await drain(pg, W, H);
  return { ctx, pg };
}
/** Start set-up (not a tap): writes the save and reopens the Training Board. */
async function home(pg, blessing) {
  await pg.evaluate(([k, bl]) => {
    const p = JSON.parse(localStorage.getItem(k) || '{}');
    Object.assign(p, { runsPlayed: 5, runsStarted: 5, guideStep: 99 });
    if (bl) p.blessing = { ...(p.blessing ?? {}), ...bl };
    localStorage.setItem(k, JSON.stringify(p));
    const g = window.game;
    g.scene.getScenes(true).forEach((s) => g.scene.stop(s.scene.key));
    g.scene.start('Home');
  }, [KEY, blessing]);
  await pg.waitForTimeout(800);
}
const runs = (pg) => pg.evaluate(() => window.game.scene.getScene('Home').profile.blessing);
const blessLine = async (pg) => (await texts(pg)).find((t) => /Blessing/.test(t.t) && /✦/.test(t.t));

for (const [W, H] of [[844, 390], [667, 375]]) for (const rm of ['off', 'on']) {
  const tag = `${W}x${H}-rm-${rm}`;
  const { ctx, pg } = await open(W, H, rm);
  check(tag, 'reduced motion reads back', (await pg.evaluate(() => localStorage.getItem('dojo.reducedMotion'))) === rm);
  // Home line for 7, 1, 10 and 0 runs.
  for (const [n, want] of [[7, '✦ Blessing on for 7 more runs.'], [1, '✦ Blessing on for one more run.'], [10, '✦ Blessing ready for ten Tower runs.'], [0, null]]) {
    const cur = await runs(pg);
    await home(pg, { runs: n, counted: cur.counted });
    await drain(pg, W, H);
    const line = await blessLine(pg);
    await pg.screenshot({ path: `${OUT}/${tag}-home-${n}.png` });
    if (want === null) check(tag, 'no Blessing line at 0 runs', !line, line?.t);
    else {
      check(tag, `home line at ${n}`, line?.t === want, line?.t);
      check(tag, `home line at ${n} inside the screen, 8px clear`, !!line && line.l >= 8 && line.r <= W - 8, line && `${Math.round(line.l)}-${Math.round(line.r)}`);
    }
    check(tag, `no clock text (runs ${n})`, !(await texts(pg)).some((t) => CLOCK.test(t.t) && /Bless/.test(t.t)));
  }
  // A new class: forget the counted dates so every check-in is new.
  for (const [start, want] of [[3, 'Class time helps your next five runs!'], [10, 'Blessing ready for ten Tower runs.']]) {
    await home(pg, { runs: start, counted: [] });
    const seen = await drain(pg, W, H, /^Dojo Blessing!$/);
    await pg.screenshot({ path: `${OUT}/${tag}-card-from-${start}.png` });
    const sub = seen?.find((t) => t.t === want);
    check(tag, `Blessing card from ${start}: "${want}"`, !!sub, seen?.map((t) => t.t).join(' | ').slice(0, 160));
    check(tag, `card line inside the screen (from ${start})`, !!sub && sub.l >= 8 && sub.r <= W - 8);
    await drain(pg, W, H);
    check(tag, `runs after class from ${start}`, (await runs(pg)).runs === 10, JSON.stringify((await runs(pg)).runs));
  }
  // Hands-on: Enter the Tower uses one run.
  const enter = (await texts(pg)).find((t) => t.t === 'ENTER THE TOWER');
  if (enter) await pg.touchscreen.tap(enter.x, enter.y);
  await pg.waitForTimeout(1500);
  const after = await pg.evaluate((k) => JSON.parse(localStorage.getItem(k)).blessing.runs, KEY);
  const blessedRun = await pg.evaluate(() => window.game.scene.getScene('Game')?.run?.blessed);
  check(tag, 'Enter the Tower uses one run (10 to 9) and the run is blessed', !!enter && after === 9 && blessedRun === true, `runs ${after}, run.blessed ${blessedRun}`);
  await ctx.close();
}
await b.close();
fs.writeFileSync(`${OUT}/results.txt`, rows.join('\n') + '\n');
console.log(rows.join('\n'));
console.log(`${rows.filter((r) => r.startsWith('PASS')).length}/${rows.filter((r) => r.startsWith('FAIL')).length}`);
