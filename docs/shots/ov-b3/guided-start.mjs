// OV-B3: a new 6-9 student starts on Guided (an older one on Steady); the one-time Dojo line says
// so, and Steady is one pick away in Settings. Taps only, after the start set-up opens the Dojo.
// Usage: URL=http://localhost:5198/ OUT=/workspace/ovb3-shots node docs/shots/ov-b3/guided-start.mjs
import { chromium } from 'playwright';
import fs from 'fs';

const URL = process.env.URL || 'http://localhost:5173/';
const OUT = process.env.OUT || '/opt/cursor/artifacts/ov-b3';
fs.mkdirSync(OUT, { recursive: true });
const rows = [];
const check = (where, name, ok, info = '') => rows.push(`${ok ? 'PASS' : 'FAIL'}  ${where}  ${name}${info ? '  (' + info + ')' : ''}`);
const b = await chromium.launch();
const KEY = 'dojo-ascent-profile-v1';

/** Visible text in the Dojo, with screen bounds; `overlay` keeps only the newest overlay (depth 70 to 90). */
const texts = (pg, overlay = false) => pg.evaluate((ov) => {
  const o = [];
  const s = window.game.scene.getScene('Dojo');
  const w = (l) => { for (const c of l) { if (c.list) w(c.list); if (c.type === 'Text' && c.visible && c.text && c.alpha > 0) { const b = c.getBounds(); o.push({ t: c.text, x: b.centerX, y: b.centerY, l: b.left, top: b.top, r: b.right, bot: b.bottom }); } } };
  if (ov) { const top = s.children.list.filter((c) => c.type === 'Container' && c.visible && c.depth >= 70 && c.depth <= 90 && c.list.length > 1).pop(); if (top) w(top.list); } else w(s.children.list);
  return o;
}, overlay);
const tap = async (pg, re, overlay = false) => { const t = (await texts(pg, overlay)).find((x) => re.test(x.t)); if (!t) return false; await pg.touchscreen.tap(t.x, t.y); await pg.waitForTimeout(300); return true; };
const difficulty = (pg) => pg.evaluate((k) => JSON.parse(localStorage.getItem(k) || '{}').difficulty ?? null, KEY);

for (const [W, H] of [[844, 390], [667, 375]]) for (const rm of ['off', 'on']) for (const [fixture, want, name] of [['5-white-belt-age-6-9', 'guided', 'Guided'], ['1-white-belt-new', 'standard', 'Steady']]) {
  const tag = `${W}x${H}-rm-${rm}-${want}`;
  const ctx = await b.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
  await ctx.addInitScript(([f, k]) => {
    if (!sessionStorage.getItem('ovb3-init')) {
      localStorage.clear();
      sessionStorage.setItem('ovb3-init', '1');
      localStorage.setItem('dojo-ascent-test-student', f);
      localStorage.setItem('dojo.reducedMotion', k);
    }
  }, [fixture, rm]);
  const pg = await ctx.newPage();
  await pg.goto(URL);
  await pg.waitForFunction(() => window.game?.scene?.getScenes?.(true).length);
  // Start set-up (not a tap): a brand-new save with the guide done, straight into the Dojo.
  await pg.evaluate(() => {
    const g = window.game;
    g.scene.getScenes(true).forEach((s) => g.scene.stop(s.scene.key));
    g.scene.start('Dojo');
  });
  await pg.waitForFunction(() => window.game.scene.getScene('Dojo')?.sys.isActive());
  await pg.waitForTimeout(1500);
  check(tag, 'reduced motion reads back', (await pg.evaluate(() => localStorage.getItem('dojo.reducedMotion'))) === rm);
  check(tag, `new profile starts on ${want}`, (await difficulty(pg)) === want, String(await difficulty(pg)));
  await tap(pg, /^Bow$/);
  for (let i = 0; i < 40 && (await pg.evaluate(() => window.game.scene.getScene('Dojo').mode)) !== 'play'; i++) await pg.waitForTimeout(500);
  // The Dojo line shows as the student arrives, under the first card.
  const line = (await texts(pg)).find((t) => /^You're on /.test(t.t));
  // Arrival cards (welcome, gifts, celebrations): close each one as a player would, until the walk-in ends.
  const mode = () => pg.evaluate(() => window.game.scene.getScene('Dojo').mode);
  for (let i = 0; i < 20 && (await mode()) !== 'play'; i++) {
    const ov = await texts(pg, true);
    const at = ov.length ? ov[ov.length - 1] : { x: W / 2, y: H / 2 };
    await pg.touchscreen.tap(at.x, at.y);
    await pg.waitForTimeout(900);
  }
  await pg.screenshot({ path: `${OUT}/${tag}-01-dojo.png` });
  check(tag, `Dojo line says "${name}"`, line?.t === `You're on ${name}, and you can change it in Settings.`, line?.t);
  check(tag, 'line on screen with 8px edge', !!line && line.l >= 8 && line.r <= W - 8 && line.bot <= H - 8);
  check(tag, 'Settings opens', await tap(pg, /^Settings$/));
  const cards = await texts(pg, true);
  await pg.screenshot({ path: `${OUT}/${tag}-02-settings.png` });
  check(tag, `${name} shows as picked`, cards.some((t) => t.t === `✓ ${name}`), cards.map((t) => t.t).join(' | '));
  if (want === 'guided') {
    check(tag, 'one tap on Steady picks Standard', (await tap(pg, /^Steady$/, true)) && (await difficulty(pg)) === 'standard', String(await difficulty(pg)));
    check(tag, 'Steady sticks after a reload', await (async () => { await pg.reload(); await pg.waitForFunction(() => window.game?.scene?.getScenes?.(true).length); await pg.waitForTimeout(800); return (await difficulty(pg)) === 'standard'; })());
  } else check(tag, 'Done closes Settings', (await tap(pg, /^Done$/, true)) && (await difficulty(pg)) === 'standard');
  await ctx.close();
}
await b.close();
fs.writeFileSync(`${OUT}/results.txt`, rows.join('\n') + '\n');
console.log(rows.join('\n'));
console.log(`${rows.filter((r) => r.startsWith('PASS')).length}/${rows.filter((r) => r.startsWith('FAIL')).length}`);
