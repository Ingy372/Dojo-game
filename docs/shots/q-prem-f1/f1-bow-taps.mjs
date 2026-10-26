import { chromium } from 'playwright';
const [W, H] = [+process.argv[2], +process.argv[3]]; const MODE = process.argv[4]; const N = +(process.argv[5] || 10); const PORT = process.env.PORT || 5494;
const b = await chromium.launch(); let ok = 0; const rows = [];
for (let n = 0; n < N; n++) {
  const ctx = await b.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
  await ctx.addInitScript(() => { localStorage.setItem('dojo-ascent-test-student', '4-green-belt'); });
  const pg = await ctx.newPage();
  await pg.addInitScript(() => { window.__ev = []; for (const t of ['touchstart','touchend','mousedown','mouseup','pointerdown','pointerup']) window.addEventListener(t, (e) => window.__ev.push(t), true); });
  const url = `http://localhost:${PORT}/`;
  await pg.goto(url); await pg.waitForFunction(() => window.game?.scene?.getScenes?.(true).length);
  if (MODE === 'floor') { await pg.waitForTimeout(1500); await pg.evaluate(async () => { const g = window.game; const t = await import('/src/game/tower.ts'); const sv = await import('/src/game/save.ts'); const d = g.scene.getScene('Dojo'); const tr = d?.training ?? (await import('/src/game/student.ts').catch(() => null))?.currentTraining?.(); g.scene.getScenes(true).forEach((s) => g.scene.stop(s.scene.key)); g.scene.start('Game', { run: t.startTowerRun(sv.loadSave(), tr) }); }); }
  if (MODE === 'title') { await pg.waitForTimeout(2500); await pg.touchscreen.tap(334, 261); await pg.waitForTimeout(500); await pg.touchscreen.tap(334, 284); }
  if (MODE === 'dojo') { await pg.waitForTimeout(1500); await pg.evaluate(() => { const g = window.game; g.scene.getScenes(true).forEach((s) => g.scene.stop(s.scene.key)); sessionStorage.removeItem('dojo-ascent-bowed'); g.scene.start('Dojo'); }); }
  // wait for the Bow text
  const find = () => pg.evaluate(() => { for (const s of window.game.scene.getScenes(true)) { const m = s.cameras.main; let r = null; const w = (l) => l.forEach((c) => { if (c.list) w(c.list); if (c.type === 'Text' && c.text === 'Bow' && c.visible) { const bb = c.getBounds(); r = { x: bb.centerX, y: bb.centerY, scene: s.scene.key }; } }); w(s.children.list); if (r) return r; } return null; });
  let bw = null; for (let i = 0; i < 40 && !bw; i++) { await pg.waitForTimeout(250); bw = await find(); }
  if (!bw) { rows.push(`#${n + 1}: no Bow prompt`); await ctx.close(); continue; }
  await pg.waitForTimeout(+(process.env.WAIT ?? 400));
  await pg.evaluate(() => (window.__ev = []));
  const OFF = JSON.parse(process.env.OFF || '[0,0]'); const tx = bw.x + OFF[0], ty = bw.y + OFF[1]; if (process.env.HOLD) { const c = await ctx.newCDPSession(pg); const h = { x: 20, y: H - 30, id: 1 }; await c.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [h] }); await pg.waitForTimeout(150); await c.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [h, { x: tx, y: ty, id: 2 }] }); await pg.waitForTimeout(80); await c.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [h] }); await pg.waitForTimeout(300); await c.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); } else if (process.env.DRAG) { const c = await ctx.newCDPSession(pg); const D = +process.env.DRAG; await c.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: tx, y: ty }] }); await pg.waitForTimeout(60); await c.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: tx + D, y: ty + D }] }); await pg.waitForTimeout(40); await c.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); } else await pg.touchscreen.tap(tx, ty);
  await pg.waitForTimeout(1200);
  const gone = !(await find());
  const ev = await pg.evaluate(() => window.__ev.join(','));
  if (gone) ok++;
  rows.push(`#${n + 1}: ${bw.scene} tap at ${bw.x.toFixed(0)},${bw.y.toFixed(0)} -> ${gone ? 'BOWED' : 'still up'} [${ev}]`);
  await ctx.close();
}
console.log(rows.join('\n')); console.log(`${MODE} ${W}x${H}: ${ok}/${N} single taps bowed`); await b.close();
