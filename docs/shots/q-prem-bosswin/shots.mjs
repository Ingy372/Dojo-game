import { chromium } from 'playwright'; import fs from 'fs';
const [W, H] = [+process.argv[2], +process.argv[3]]; const RM = process.env.RM || 'off'; const tag = `bosswin-${W}x${H}-rm${RM}`; const URL = 'http://localhost:5480/?room=keepers-hall';
const out = []; const log = (s) => { out.push(s); console.log(s); };
const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
await ctx.addInitScript((k) => { if (!sessionStorage.getItem('init')) { localStorage.clear(); sessionStorage.setItem('init', '1'); } localStorage.setItem('dojo-ascent-test-student', '4-green-belt'); localStorage.setItem('dojo.reducedMotion', k === 'on' ? 'on' : 'off'); }, RM);
const pg = await ctx.newPage(); const errs = []; pg.on('pageerror', (e) => errs.push(e.stack)); pg.on('console', (m) => { if (m.type() === 'error') errs.push('console: ' + m.text()); });
const acts = () => pg.evaluate(() => window.game.scene.getScenes(true).map((s) => s.scene.key));
const textsXY = () => pg.evaluate(() => { const o = []; for (const s of window.game.scene.getScenes(true)) { const z = s.cameras.main.zoom; const w = (l) => { for (const c of l) { if (c.list) w(c.list); if (c.type === 'Text' && c.visible) { const bb = c.getBounds(); o.push({ t: c.text, size: c.style.fontSize, a: c.alpha, color: c.style.color, x: bb.centerX, y: bb.centerY, l: bb.left, r: bb.right, top: bb.top, bot: bb.bottom }); } } }; w(s.children.list); } return o; });
await pg.goto(URL); await pg.waitForFunction(() => window.game?.scene?.getScenes?.(true).length);
for (let i = 0; i < 40; i++) { const a = await acts(); if (a.includes('Game') || a.includes('Dojo') || a.includes('Home')) break; if (a.includes('Title')) await pg.mouse.click(W / 2, H / 2); if (a.includes('Create')) { const g = (await textsXY()).find((t) => /Let's go/.test(t.t)); if (g) await pg.mouse.click(g.x, g.y); } await pg.waitForTimeout(400); }
await pg.evaluate(() => { const g = window.game; g.scene.getScenes(true).forEach((s) => g.scene.stop(s.scene.key)); g.scene.start('Game'); }); await pg.waitForTimeout(2500);
const rm = await pg.evaluate(() => localStorage.getItem('dojo.reducedMotion')); log(`reducedMotion read back: ${rm}`);
await pg.evaluate(() => { const s = window.game.scene.getScene('Game'); window.__done = 0; s.showKeeperWin(() => { window.__done++; }); });
const view = await pg.evaluate(() => { const s = window.game.scene.getScene('Game'); return { w: s.scale.width, h: s.scale.height }; });
for (const ms of [0, 600, 1500]) {
  if (ms) await pg.waitForTimeout(ms - (ms === 1500 ? 600 : 0));
  await pg.screenshot({ path: `${tag}-${ms}ms.png` });
  const t = (await textsXY()).filter((x) => x.a > 0.01);
  const conf = await pg.evaluate(() => { const s = window.game.scene.getScene('Game'); let n = 0, rays = null; const w = (l) => { for (const c of l) { if (c.list) w(c.list); if (c.type === 'Rectangle' && c.width === 6 && c.height === 10) n++; if (c.type === 'Graphics' && c.parentContainer && c.parentContainer.parentContainer && c.parentContainer.parentContainer.depth === 100) rays = c.angle; } }; w(s.children.list); return { n, rays }; });
  log(`${ms}ms: view=${view.w}x${view.h} confetti=${conf.n} raysAngle=${conf.rays} texts=${JSON.stringify(t.map((x) => ({ t: x.t, size: x.size, color: x.color, l: Math.round(x.l), r: Math.round(x.r), top: Math.round(x.top), bot: Math.round(x.bot) })))}`);
}
await pg.waitForTimeout(1000);
const ang = await pg.evaluate(() => { const s = window.game.scene.getScene('Game'); let a = null; const w = (l) => { for (const c of l) { if (c.list) w(c.list); if (c.type === 'Graphics' && c.parentContainer?.parentContainer?.depth === 100) a = c.angle; } }; w(s.children.list); return a; }); log(`rays angle after 2.5s: ${ang}`);
await pg.mouse.click(W / 2, H / 2); await pg.waitForTimeout(400);
log(`after tap: onDone calls=${await pg.evaluate(() => window.__done)}`);
log('errors: ' + JSON.stringify(errs)); fs.writeFileSync(`report-${tag}.txt`, out.join('\n') + '\n'); await b.close();
