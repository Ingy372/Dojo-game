// L16-B: the staff Power Rating report on the Testing screen has 5 rows (40/10/10/25/15).
// Usage: URL=http://localhost:5192/ OUT=/workspace/l16b-shots node docs/shots/l16-b/power-report.mjs
import { chromium } from 'playwright';
import fs from 'fs';

const URL = process.env.URL || 'http://localhost:5173/';
const OUT = process.env.OUT || '/workspace/l16b-shots';
fs.mkdirSync(OUT, { recursive: true });
const rows = [];
const check = (where, name, ok, info = '') => rows.push(`${ok ? 'PASS' : 'FAIL'}  ${where}  ${name}${info ? '  (' + info + ')' : ''}`);
const b = await chromium.launch();
for (const [W, H] of [[844, 390], [667, 375]]) {
  const tag = `${W}x${H}`;
  const ctx = await b.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
  await ctx.addInitScript(() => { if (!sessionStorage.getItem('l16b')) { localStorage.clear(); sessionStorage.setItem('l16b', '1'); localStorage.setItem('dojo-ascent-test-student', '3-yellow-belt'); } });
  const pg = await ctx.newPage();
  const errs = [];
  pg.on('pageerror', (e) => errs.push(e.message));
  await pg.goto(URL);
  await pg.waitForFunction(() => window.game?.scene?.getScenes?.(true).length);
  await pg.evaluate(() => { const g = window.game; for (const s of g.scene.getScenes(true)) g.scene.stop(s.scene.key); g.scene.start('Home'); });
  await pg.waitForFunction(() => window.game.scene.getScene('Home')?.sys.isActive());
  await pg.waitForTimeout(800);
  // Tap through the welcome cascade so the report is not under it.
  for (let i = 0; i < 80 && (await pg.evaluate(() => window.game.scene.getScene('Home').celebrating)); i++) { await pg.touchscreen.tap(W / 2, H / 2); await pg.waitForTimeout(250); }
  await pg.evaluate(() => window.game.scene.getScene('Home').openTesting());
  await pg.waitForTimeout(500);
  const t = await pg.evaluate(() => { const o = []; const w = (l) => { for (const c of l) { if (c.list) w(c.list); if (c.type === 'Text' && c.visible && c.text) o.push(c.text); } }; w(window.game.scene.getScene('Home').children.list); return o; });
  const pct = t.filter((x) => /^\d+%$/.test(x));
  check(tag, 'five power rows at 40/10/10/25/15', pct.join(',') === '40%,10%,10%,25%,15%', pct.join(','));
  check(tag, 'no Street Smarts or Mastery row', !t.some((x) => /^(Street Smarts|Mastery)$/.test(x)));
  await pg.screenshot({ path: `${OUT}/${tag}-power-report.png` });
  check(tag, 'no page errors', errs.length === 0, errs.join(' / '));
  await ctx.close();
}
await b.close();
console.log(rows.join('\n'));
