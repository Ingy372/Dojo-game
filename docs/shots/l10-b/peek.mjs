import { chromium } from 'playwright';
const URL = process.env.URL; const OUT = '/workspace/l10b';
const VIEW = process.env.VIEW || 'path';
const b = await chromium.launch();
for (const [W, H] of [[844, 390], [667, 375]]) {
  const ctx = await b.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
  await ctx.addInitScript((fx) => { if (!sessionStorage.getItem('pk')) { localStorage.clear(); sessionStorage.setItem('pk', '1'); localStorage.setItem('dojo-ascent-test-student', fx); } }, process.env.FX || '3-yellow-belt');
  const pg = await ctx.newPage(); const errs = []; pg.on('pageerror', (e) => errs.push(e.message));
  await pg.goto(URL);
  await pg.waitForFunction(() => window.game?.scene?.getScenes?.(true).length);
  await pg.evaluate(() => { const g = window.game; for (const s of g.scene.getScenes(true)) g.scene.stop(s.scene.key); g.scene.start('Home'); });
  await pg.waitForFunction(() => window.game.scene.getScene('Home')?.sys.isActive());
  await pg.waitForTimeout(800);
  for (let i = 0; i < 80 && (await pg.evaluate(() => window.game.scene.getScene('Home').celebrating)); i++) { await pg.touchscreen.tap(W / 2, H / 2); await pg.waitForTimeout(250); }
  if (process.env.JS) await pg.evaluate(process.env.JS);
  await pg.waitForTimeout(600);
  await pg.screenshot({ path: `${OUT}/${W}-${process.env.NAME || VIEW}.png` });
  if (errs.length) console.log(W, 'ERR', errs.join(' / '));
  await ctx.close();
}
await b.close();
