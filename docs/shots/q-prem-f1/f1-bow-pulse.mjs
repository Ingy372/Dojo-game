import { chromium } from 'playwright';
const [W, H] = [+process.argv[2], +process.argv[3]]; const MODE = process.argv[4]; const PORT = 5494;
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
const RM = process.argv[5] || 'off';
await ctx.addInitScript((rm) => { localStorage.setItem('dojo-ascent-test-student', '4-green-belt'); localStorage.setItem('dojo.reducedMotion', rm); }, RM);
const pg = await ctx.newPage(); await pg.goto(`http://localhost:${PORT}/`); await pg.waitForFunction(() => window.game?.scene?.getScenes?.(true).length); await pg.waitForTimeout(1500);
if (MODE === 'floor') await pg.evaluate(async () => { const g = window.game; const t = await import('/src/game/tower.ts'); const sv = await import('/src/game/save.ts'); const tr = (await import('/src/game/student.ts')).currentTraining(); g.scene.getScenes(true).forEach((s) => g.scene.stop(s.scene.key)); g.scene.start('Game', { run: t.startTowerRun(sv.loadSave(), tr) }); });
else await pg.evaluate(() => { const g = window.game; g.scene.getScenes(true).forEach((s) => g.scene.stop(s.scene.key)); sessionStorage.removeItem('dojo-ascent-bowed'); g.scene.start('Dojo'); });
const T = () => pg.evaluate(() => { const o = []; for (const s of window.game.scene.getScenes(true)) { const w = (l, d) => l.forEach((c) => { const dd = d ?? c.depth; if (c.list) w(c.list, dd); if (c.type === 'Text' && c.visible) { const bb = c.getBounds(); o.push({ s: s.scene.key, t: c.text.slice(0, 24), x: Math.round(bb.centerX), y: Math.round(bb.centerY), d: dd }); } }); w(s.children.list); } return o; });
let t; for (let i = 0; i < 40; i++) { await pg.waitForTimeout(250); t = await T(); if (t.some((x) => x.t === 'Bow')) break; }
await pg.waitForTimeout(500);
await pg.screenshot({ path: `bow-${MODE}-${W}x${H}-rm-${RM}.png` });
console.log('texts while prompt up:', JSON.stringify(t.filter((x) => x.y < 60 || x.t === 'Bow')));
// Top bar: every text in the top 60 px, plus the right/left corners.
const pts = [...t.filter((x) => x.y > 0 && x.y < 60 && x.d < 80).map((x) => [x.x, x.y, x.t]), [W - 30, 24, 'top-right corner'], [30, 24, 'top-left corner']];
let pulses = 0;
for (const [x, y, name] of pts) {
  const r = await pg.evaluate(() => { const s = window.game.scene.getScenes(true).find((s) => { let f = false; const w = (l) => l.forEach((c) => { if (c.list) w(c.list); if (c.type === 'Text' && c.text === 'Bow') f = true; }); w(s.children.list); return f; }); if (!s) return null; let bt = null; const w = (l) => l.forEach((c) => { if (c.list) w(c.list); if (c.type === 'Text' && c.text === 'Bow') bt = c; }); w(s.children.list); window.__bt = bt; window.__maxs = 1; window.__poll && clearInterval(window.__poll); window.__poll = setInterval(() => { window.__maxs = Math.max(window.__maxs, bt.scaleX); }, 10); return s.scene.key; });
  if (!r) { console.log('prompt gone'); break; }
  const before = (await T()).length;
  await pg.touchscreen.tap(x, y); await pg.waitForTimeout(400);
  const res = await pg.evaluate(() => ({ max: window.__maxs }));
  const after = await T(); const stillUp = after.some((q) => q.t === 'Bow');
  const pulsed = res.max > 1.05; if (pulsed && stillUp) pulses++;
  console.log(`${MODE} ${W}x${H} tap "${name}" @${x},${y}: Bow pulse max scale ${res.max.toFixed(2)} -> ${pulsed ? 'PULSED' : 'no pulse'}; prompt ${stillUp ? 'still up' : 'GONE'}; texts ${before}->${after.length}`);
}
console.log(`(b) ${MODE} ${W}x${H} rm=${RM}: ${pulses}/${pts.length} top-bar taps pulsed Bow`);
await b.close();
