// OV-FX1: Settings tapped during the bow/arrival must not leave the Dojo stuck (no top row, no walking),
// and the Music/Sound − and + buttons are at least 44x44. Taps only, after the start set-up opens the Dojo.
// Usage: URL=http://localhost:5198/ OUT=/workspace/ovfx1-shots node docs/shots/ov-fx1/settings-arrival.mjs
import { chromium } from 'playwright';
import fs from 'fs';

const URL = process.env.URL || 'http://localhost:5173/';
const OUT = process.env.OUT || '/opt/cursor/artifacts/ov-fx1';
fs.mkdirSync(OUT, { recursive: true });
const rows = [];
const check = (where, name, ok, info = '') => rows.push(`${ok ? 'PASS' : 'FAIL'}  ${where}  ${name}${info ? '  (' + info + ')' : ''}`);
const b = await chromium.launch();

/** Visible text in the Dojo, with screen bounds; `overlay` keeps only the newest overlay (depth 70 to 90). */
const texts = (pg, overlay = false) => pg.evaluate((ov) => {
  const o = [];
  const s = window.game.scene.getScene('Dojo');
  const w = (l) => { for (const c of l) { if (c.list) w(c.list); if (c.type === 'Text' && c.visible && c.text && c.alpha > 0) { const b = c.getBounds(); o.push({ t: c.text, x: b.centerX, y: b.centerY, l: b.left, top: b.top, r: b.right, bot: b.bottom }); } } };
  if (ov) { const top = s.children.list.filter((c) => c.type === 'Container' && c.visible && c.depth >= 70 && c.depth <= 90 && c.list.length > 1).pop(); if (top) w(top.list); } else w(s.children.list);
  return o;
}, overlay);
const tap = async (pg, re, overlay = false) => { const t = (await texts(pg, overlay)).find((x) => re.test(x.t)); if (!t) return false; await pg.touchscreen.tap(t.x, t.y); await pg.waitForTimeout(300); return true; };

for (const [W, H] of [[844, 390], [667, 375]]) for (const rm of ['off', 'on']) {
  const fixture = '1-white-belt-new';
  const tag = `${W}x${H}-rm-${rm}`;
  const ctx = await b.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
  await ctx.addInitScript(([f, k]) => {
    if (!sessionStorage.getItem('ovfx1-init')) {
      localStorage.clear();
      sessionStorage.setItem('ovfx1-init', '1');
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
  check(tag, 'reduced motion reads back', (await pg.evaluate(() => localStorage.getItem('dojo.reducedMotion'))) === rm);
  const mode = () => pg.evaluate(() => window.game.scene.getScene('Dojo').mode);
  const hud = async () => { const t = (await texts(pg)).map((x) => x.t); return ['Settings', 'Look', 'Decorate', 'Board'].every((n) => t.includes(n)); };
  // The Tester's steps: tap Bow, then Settings in the top row while the bow plays.
  check(tag, 'Bow shows', await tap(pg, /^Bow$/));
  const settings = (await texts(pg)).find((x) => x.t === 'Settings');
  await pg.touchscreen.tap(settings.x, settings.y);
  await pg.waitForTimeout(300);
  check(tag, 'top row does nothing during the bow', (await mode()) === 'arriving', await mode());
  await pg.screenshot({ path: `${OUT}/${tag}-01-settings-during-bow.png` });
  // Close the arrival cards on top, as a player would, until the walk-in ends.
  for (let i = 0; i < 20; i++) {
    const ov = await texts(pg, true);
    const settingsOnTop = ov.some((x) => x.t === 'For grown-ups');
    if (settingsOnTop ? (await mode()) !== 'arriving' : ov.length === 0 && (await mode()) === 'play') break;
    if (settingsOnTop) { await pg.waitForTimeout(500); continue; }
    const at = ov.length ? ov[ov.length - 1] : { x: W / 2, y: H / 2 };
    await pg.touchscreen.tap(at.x, at.y);
    await pg.waitForTimeout(900);
  }
  // If Settings did open, leave it the Tester's way: For grown-ups, then Back on the sum question.
  const opened = await tap(pg, /^For grown-ups$/, true);
  check(tag, 'Settings did not open during the bow', !opened);
  if (opened) await tap(pg, /^Back$/, true);
  await pg.waitForTimeout(800);
  await pg.screenshot({ path: `${OUT}/${tag}-02-after.png` });
  check(tag, 'Dojo is back in play', (await mode()) === 'play', await mode());
  check(tag, 'top row is back (Settings, Look, Decorate, Board)', await hud());
  const pos = () => pg.evaluate(() => ({ ...window.game.scene.getScene('Dojo').world.players.p1.pos }));
  const p0 = await pos();
  await pg.touchscreen.tap(W / 2, H * 0.4);
  await pg.waitForTimeout(1500);
  const p1 = await pos();
  check(tag, 'a floor tap walks the hero', p0.x !== p1.x || p0.y !== p1.y, `${JSON.stringify(p0)} -> ${JSON.stringify(p1)}`);
  // Music/Sound − and + (OV-FX1 add-on): at least 44x44 at every size.
  check(tag, 'Settings opens after arrival', await tap(pg, /^Settings$/));
  const sizes = await pg.evaluate(() => {
    const s = window.game.scene.getScene('Dojo');
    const top = s.children.list.filter((c) => c.type === 'Container' && c.visible && c.depth === 70).pop();
    return top.list.filter((c) => c.type === 'Rectangle' && c.input && c.fillColor === 0x3a3a4a && c.width < 80).map((c) => [Math.round(c.width * 10) / 10, Math.round(c.height * 10) / 10]);
  });
  await pg.screenshot({ path: `${OUT}/${tag}-03-settings.png` });
  check(tag, 'four Music/Sound buttons', sizes.length === 4, JSON.stringify(sizes));
  check(tag, 'each Music/Sound button at least 44x44', sizes.length > 0 && sizes.every(([w, h]) => w >= 44 && h >= 44), JSON.stringify(sizes));
  check(tag, 'Done closes Settings', (await tap(pg, /^Done$/, true)) && (await mode()) === 'play' && (await hud()));
  await ctx.close();
}
await b.close();
fs.writeFileSync(`${OUT}/results.txt`, rows.join('\n') + '\n');
console.log(rows.join('\n'));
console.log(`${rows.filter((r) => r.startsWith('PASS')).length}/${rows.filter((r) => r.startsWith('FAIL')).length}`);
