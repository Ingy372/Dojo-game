import { chromium } from 'playwright'; import fs from 'fs';
const [W, H] = [+process.argv[2], +process.argv[3]]; const RM = process.env.RM || 'off'; const OUT = process.env.OUT; const tag = `${W}x${H}-rm${RM}`;
const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
await ctx.addInitScript((k) => { if (!sessionStorage.getItem('init')) { localStorage.clear(); sessionStorage.setItem('init', '1'); } localStorage.setItem('dojo-ascent-test-student', '4-green-belt'); localStorage.setItem('dojo.reducedMotion', k); }, RM);
const pg = await ctx.newPage(); const errs = []; pg.on('pageerror', (e) => errs.push(e.message));
const acts = () => pg.evaluate(() => window.game.scene.getScenes(true).map((s) => s.scene.key));
const texts = () => pg.evaluate(() => { const o = []; for (const s of window.game.scene.getScenes(true)) { const m = s.cameras.main; const w = (l) => { for (const c of l) { if (c.list) w(c.list); if (c.type === 'Text' && c.visible) { const bb = c.getBounds(); let r=c; while(r.parentContainer) r=r.parentContainer; o.push({ d: r.depth, t: c.text, x: bb.centerX * m.zoom / devicePixelRatio, y: bb.centerY * m.zoom / devicePixelRatio, w: bb.width*m.zoom/devicePixelRatio }); } } }; w(s.children.list); } return o; });
await pg.goto('http://localhost:5493/'); await pg.waitForFunction(() => window.game?.scene?.getScenes?.(true).length);
for (let i = 0; i < 40; i++) { const a = await acts(); if (a.some((k) => ['Game','Dojo','Home'].includes(k))) break; if (a.includes('Title')) await pg.mouse.click(W/2, H/2); if (a.includes('Create')) { const g = (await texts()).find((t) => /Let's go/.test(t.t)); if (g) await pg.mouse.click(g.x, g.y); } await pg.waitForTimeout(400); }
await pg.evaluate(() => { const k='dojo-ascent-profile-v1'; const p=JSON.parse(localStorage.getItem(k)||'{}'); p.runsPlayed=Math.max(5,p.runsPlayed||0); p.runsStarted=Math.max(5,p.runsStarted||0); p.guideStep=99; localStorage.setItem(k, JSON.stringify(p)); localStorage.removeItem('dojo-ascent-run-in-progress'); });
await pg.goto('http://localhost:5493/'); await pg.waitForFunction(() => window.game?.scene?.getScenes?.(true).length); await pg.waitForTimeout(1500);
await pg.evaluate(() => { const g = window.game; g.scene.getScenes(true).forEach((s) => g.scene.stop(s.scene.key)); g.scene.start('Dojo'); }); await pg.waitForTimeout(2500); console.error('after start', await acts());
for (let i = 0; i < 6; i++) { const m = await pg.evaluate(() => window.game.scene.getScene('Dojo').mode); if (m === 'play') break; const bw = (await texts()).find((t) => t.t === 'Bow'); if (bw) { console.error('bow', i, await acts()); await pg.touchscreen.tap(bw.x, bw.y); } else { await pg.evaluate(() => { const d = window.game.scene.getScene('Dojo'); d.children.list.filter((c) => c.depth >= 75 && c.type==='Container').forEach((c) => c.destroy()); }); } await pg.waitForTimeout(2500); }
await pg.evaluate(() => { const d = window.game.scene.getScene('Dojo'); d.children.list.filter((c) => c.depth >= 90).forEach((c) => c.destroy()); if (d.mode !== 'play') { d.mode = 'play'; d.renderUi(); } });
await pg.waitForTimeout(500);
for (let i = 0; i < 25; i++) { const g = (await texts()).find((t) => /^(Let's go!|Got it|OK|Continue|Thank you!|Nice!|Tap to continue|Okay!)$/.test(t.t) && t.d >= 60); if (!g) break; console.error('tap', g.t, g.d, await acts()); if (g.t === 'Tap to continue') await pg.touchscreen.tap(30, H / 2); else await pg.touchscreen.tap(g.x, g.y); await pg.waitForTimeout(900); console.error(' ->', await acts()); }
console.error('scenes before trials', await acts(), await pg.evaluate(() => window.game.scene.getScene('Dojo').mode));
const log = [];
for (let trial = 1; trial <= 3; trial++) {
  const s = (await texts()).find((t) => t.t === 'Settings' || /Difficulty|Settings/.test(t.t));
  if (s) await pg.touchscreen.tap(s.x, s.y); else await pg.evaluate(() => window.game.scene.getScene('Dojo').openDifficulty());
  await pg.waitForTimeout(700);
  const open = await pg.evaluate(() => window.game.scene.getScene('Dojo').mode);
  const done = (await texts()).find((t) => t.t === 'Done');
  if (trial === 1) await pg.screenshot({ path: `${OUT}/settings-${tag}.png` });
  const pts = [[done.x, done.y], [W - 108 + 4, 12 + 4], [W - 12 - 4, 56 - 4]]; const [tx, ty] = pts[trial - 1]; await pg.touchscreen.tap(tx, ty); await pg.waitForTimeout(600);
  const after = await pg.evaluate(() => ({ mode: window.game.scene.getScene('Dojo').mode, panels: window.game.scene.getScene('Dojo').children.list.filter((c) => c.depth === 70).length }));
  const ok = open === 'menu' && after.mode === 'play' && after.panels === 0;
  log.push(`trial ${trial}: opened mode=${open}, Done at ${done.x.toFixed(0)},${done.y.toFixed(0)} (96x44 zone x ${W-108}-${W-12}, y 12-56), tapped ${tx.toFixed(0)},${ty.toFixed(0)}, one tap -> mode=${after.mode} panels=${after.panels} ${ok ? 'OK' : 'FAIL'}`);
}
if (errs.length) log.push('errors: ' + errs.join(' | '));
console.log(log.join('\n')); fs.writeFileSync(`${OUT}/tap-${tag}.txt`, log.join('\n') + '\n'); await b.close();
