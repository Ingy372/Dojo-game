// L8-B2: a held enemy wears the placeholder bronze ring (never the ! yellow), steady with Reduced motion on;
// and opening the Board after a Book tab lands on Last climb.
// Usage: URL=http://localhost:5192/ OUT=/workspace/l8b2-shots node docs/shots/l8-b2/hold.mjs
import { chromium } from 'playwright';
import fs from 'fs';

const URL = process.env.URL || 'http://localhost:5173/';
const OUT = process.env.OUT || '/workspace/l8b2-shots';
fs.mkdirSync(OUT, { recursive: true });
const rows = [];
const check = (where, name, ok, info = '') => rows.push(`${ok ? 'PASS' : 'FAIL'}  ${where}  ${name}${info ? '  (' + info + ')' : ''}`);
const b = await chromium.launch();

for (const [W, H] of [[844, 390], [667, 375]]) for (const rm of ['off', 'on']) {
  const tag = `${W}x${H}-rm-${rm}`;
  const ctx = await b.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
  await ctx.addInitScript(([k]) => {
    if (!sessionStorage.getItem('l8b2')) {
      localStorage.clear();
      sessionStorage.setItem('l8b2', '1');
      localStorage.setItem('dojo-ascent-test-student', '4-green-belt');
      localStorage.setItem('dojo.reducedMotion', k);
    }
  }, [rm]);
  const pg = await ctx.newPage();
  const errs = [];
  pg.on('pageerror', (e) => errs.push(e.message));
  await pg.goto(URL);
  await pg.waitForFunction(() => window.game?.scene?.getScenes?.(true).length);
  // Set-up (not a tap): the practice room, which has enemies from the start.
  await pg.evaluate(() => { const g = window.game; g.scene.getScenes(true).forEach((s) => g.scene.stop(s.scene.key)); g.scene.start('Game'); });
  await pg.waitForFunction(() => window.game.scene.getScene('Game')?.sys.isActive() && window.game.scene.getScene('Game').world, null, { timeout: 15000 });
  for (let i = 0; i < 12; i++) { await pg.touchscreen.tap(W / 2, H / 2); await pg.waitForTimeout(300); }
  await pg.waitForFunction(() => window.game.scene.getScene('Game').world.enemies.some((e) => e.mode !== 'defeated' && !e.def.boss), null, { timeout: 15000 });
  await pg.waitForTimeout(1500);
  // Set-up (not a tap): hold the nearest enemy as a Lock Perfect Counter would, long enough to photograph.
  await pg.evaluate(() => {
    const s = window.game.scene.getScene('Game');
    const p = Object.values(s.world.players)[0];
    const e = s.world.enemies.filter((x) => x.mode !== 'defeated' && !x.def.boss).sort((a, c) => Math.hypot(a.pos.x - p.pos.x, a.pos.y - p.pos.y) - Math.hypot(c.pos.x - p.pos.x, c.pos.y - p.pos.y))[0];
    p.pos = { x: e.pos.x - 1.6, y: e.pos.y };
    e.mode = 'stagger'; e.modeTicks = 100000; e.held = true;
  });
  await pg.waitForTimeout(700);
  const ringPx = async () => pg.evaluate(() => {
    const s = window.game.scene.getScene('Game');
    return s.danger.commandBuffer.filter((c) => c === 0xc07a2c).length;
  });
  check(tag, 'held enemy draws the bronze ring', (await ringPx()) > 0);
  const yellow = await pg.evaluate(() => window.game.scene.getScene('Game').danger.commandBuffer.includes(0xffd166));
  check(tag, 'no ! yellow in the ring layer', !yellow);
  await pg.screenshot({ path: `${OUT}/${tag}-held.png` });
  if (rm === 'on') {
    const r1 = await pg.evaluate(() => JSON.stringify(window.game.scene.getScene('Game').danger.commandBuffer));
    await pg.waitForTimeout(400);
    const r2 = await pg.evaluate(() => JSON.stringify(window.game.scene.getScene('Game').danger.commandBuffer));
    check(tag, 'ring holds still with Reduced motion', r1 === r2);
  }
  // Board after the Book.
  await pg.evaluate(() => { const g = window.game; g.scene.getScenes(true).forEach((s) => g.scene.stop(s.scene.key)); g.scene.start('Home'); });
  await pg.waitForFunction(() => window.game.scene.getScene('Home')?.sys.isActive());
  await pg.waitForTimeout(800);
  for (let i = 0; i < 80 && (await pg.evaluate(() => window.game.scene.getScene('Home').celebrating)); i++) { await pg.touchscreen.tap(W / 2, H / 2); await pg.waitForTimeout(250); }
  for (const tab of ['moves', 'monsters', 'faith', 'trophies']) {
    const got = await pg.evaluate((tab) => { const s = window.game.scene.getScene('Home'); s.openBook(tab); s.setView('board'); return { view: s.view, tab: s.tab }; }, tab);
    check(tag, `Board after Book ${tab} opens on Last climb`, got.view === 'board' && got.tab === 'run', JSON.stringify(got));
  }
  await pg.waitForTimeout(500);
  if (rm === 'off') await pg.screenshot({ path: `${OUT}/${tag}-board-after-book.png` });
  check(tag, 'no page errors', errs.length === 0, errs.join(' / '));
  await ctx.close();
}
await b.close();
console.log(rows.join('\n'));
const fails = rows.filter((r) => r.startsWith('FAIL')).length;
console.log(`${rows.length - fails} pass / ${fails} fail`);
process.exit(fails ? 1 : 0);
