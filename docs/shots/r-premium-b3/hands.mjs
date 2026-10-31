// R-PREMIUM-b3 hands-on: real taps in the real game; logs which sounds played from files.
import { chromium } from 'playwright';
import { writeFileSync } from 'node:fs';
const browser = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
const ctx = await browser.newContext({ viewport: { width: 844, height: 390 }, hasTouch: true });
await ctx.addInitScript(() => { if (!sessionStorage.getItem('init')) { localStorage.clear(); sessionStorage.setItem('init', '1'); } localStorage.setItem('dojo-ascent-test-student', '4-green-belt'); localStorage.setItem('dojo.musicVol', '0'); });
const pg = await ctx.newPage();
const errs = [], bad = [];
pg.on('pageerror', (e) => errs.push(String(e)));
pg.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
pg.on('response', (r) => { if (r.url().includes('/audio/sfx/') && r.status() >= 400) bad.push(r.url()); });
await pg.goto('http://localhost:5498/?room=training'); await pg.waitForFunction(() => window.game?.isBooted); await pg.waitForTimeout(5000);

await pg.evaluate(async () => {
  const u = performance.getEntriesByType('resource').map((e) => e.name).find((n) => /\/audio\/Sfx\.ts/.test(n)); window.__u = u; const { sfx } = await import(u); window.__log = [];
  const o = sfx.playFile.bind(sfx); sfx.playFile = (e, ...r) => { const ok = o(e, ...r); window.__log.push(`${e}:${ok ? 'file' : 'tone'}`); return ok; };
});

for (let i = 0; i < 6 && !(await pg.evaluate(() => !!window.game.scene.getScene('Game')?.buttons)); i++) { const sc = await pg.evaluate(() => window.game.scene.getScenes(true).map((s) => s.scene.key).join()); console.log(sc); if (false) await pg.evaluate(() => { const g = window.game; g.scene.getScenes(true).forEach((s) => g.scene.stop(s.scene.key)); g.scene.start('Game'); }); else await pg.touchscreen.tap(422, 351); await pg.waitForTimeout(2500); }
const inGame = await pg.waitForFunction(() => window.game.scene.getScene('Game')?.buttons, null, { timeout: 15000 }).then(() => true, () => false);
const btns = await pg.evaluate(() => { const B = window.game.scene.getScene('Game').buttons; const out = []; for (const k of Object.keys(B)) { const b = B[k]; const f = b?.face ?? b; if (f?.getBounds && f.visible !== false) { const bb = f.getBounds(); if (bb.width > 20) out.push([k, bb.centerX, bb.centerY]); } } return out; });
for (let i = 0; i < 80; i++) { const [, x, y] = btns[i % btns.length]; await pg.touchscreen.tap(x, y); await pg.waitForTimeout(220); }
const extra = `in Game: ${inGame}; buttons tapped: ${btns.map((b) => b[0]).join(', ')}`;
await pg.screenshot({ path: '/workspace/r-premium-b3/docs/shots/r-premium-b3/hands-on.png' });
const state = await pg.evaluate(async () => { const { sfx } = await import(window.__u); return [window.__u, window.__log.length, sfx.files.size, sfx.ctx?.state]; });
const log = await pg.evaluate(() => window.__log);
const counts = {}; for (const l of log) counts[l] = (counts[l] ?? 0) + 1;
const out = `R-PREMIUM-b3 hands-on (844x390, 80 real taps on the action buttons)\n${extra}\nfiles loaded: ${state[2]}, audio: ${state[3]}\nsound plays: ${JSON.stringify(counts)}\nmissing sfx files: ${bad.length}\nerrors: ${errs.length}\n${errs.join('\n')}\n`;
writeFileSync('/workspace/r-premium-b3/docs/shots/r-premium-b3/hands-on.txt', out); console.log(out);
await browser.close();
