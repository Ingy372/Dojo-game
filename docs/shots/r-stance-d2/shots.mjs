// R-STANCE-d2 shots: Fighting Style stance tray (some locked, some signed off) on fixture 4,
// and the stance sign-off reward moment on fixture 3. Usage: RM=on|off node shots.mjs W H
import { chromium } from 'playwright'; import fs from 'fs';
const [W, H] = [+process.argv[2], +process.argv[3]]; const RM = process.env.RM || 'off'; const URL = 'http://localhost:5521/';
const tag = `${W}x${H}-rm${RM}`; const OUT = 'out'; fs.mkdirSync(OUT, { recursive: true });
const b = await chromium.launch(); const report = { tag, errs: [], states: {} };
async function session(student, fn) {
  const ctx = await b.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
  await ctx.addInitScript(([s, k]) => { if (!sessionStorage.getItem('init')) { localStorage.clear(); sessionStorage.setItem('init', '1'); } localStorage.setItem('dojo-ascent-test-student', s); localStorage.setItem('dojo.reducedMotion', k); }, [student, RM]);
  const pg = await ctx.newPage(); pg.on('pageerror', (e) => report.errs.push(e.stack)); pg.on('console', (m) => { if (m.type() === 'error') report.errs.push('console: ' + m.text()); });
  const acts = () => pg.evaluate(() => window.game.scene.getScenes(true).map((s) => s.scene.key));
  const texts = () => pg.evaluate(() => { const o = []; for (const s of window.game.scene.getScenes(true)) { const w = (l) => { for (const c of l) { if (c.list) w(c.list); if (c.type === 'Text' && c.visible) { const bb = c.getBounds(); o.push({ t: c.text, x: bb.centerX, y: bb.centerY }); } } }; w(s.children.list); } return o; });
  await pg.goto(URL); await pg.waitForFunction(() => window.game?.scene?.getScenes?.(true).length);
  for (let i = 0; i < 40; i++) { const a = await acts(); if (a.includes('Game') || a.includes('Dojo') || a.includes('Home')) break; if (a.includes('Title')) await pg.mouse.click(W / 2, H / 2); if (a.includes('Create')) { const g = (await texts()).find((t) => /Let's go/.test(t.t)); if (g) await pg.mouse.click(g.x, g.y); } await pg.waitForTimeout(400); }
  await pg.evaluate(() => { const k = 'dojo-ascent-profile-v1'; const p = JSON.parse(localStorage.getItem(k) || '{}'); p.runsPlayed = Math.max(5, p.runsPlayed || 0); p.runsStarted = Math.max(5, p.runsStarted || 0); p.guideStep = 99; localStorage.setItem(k, JSON.stringify(p)); localStorage.removeItem('dojo-ascent-run-in-progress'); });
  await fn(pg, texts); await ctx.close();
}
const toHome = async (pg) => { await pg.goto(URL); await pg.waitForFunction(() => window.game?.scene?.getScenes?.(true).length); await pg.waitForTimeout(1500);
  await pg.evaluate(() => { const g = window.game; g.scene.getScenes(true).forEach((s) => g.scene.stop(s.scene.key)); g.scene.start('Home'); }); };
// 1. Picker on green: Front, Fighting, Horse signed; Cat locked.
await session('4-green-belt', async (pg, texts) => {
  await toHome(pg); await pg.waitForTimeout(3000);
  // Let any first-visit celebration settle into the saved snapshot, then clear overlays.
  await pg.evaluate(() => { const h = window.game.scene.getScene('Home'); h.children.list.filter((c) => c.depth >= 90).forEach((c) => c.destroy()); h.celebrating = false; h.profile.seen = null; });
  await pg.evaluate(() => { const h = window.game.scene.getScene('Home'); h.tab = 'abilities'; h.part = 'style'; h.styleSlot = 'stance'; h.trayPageNo = 0; h.render(); });
  await pg.waitForTimeout(1500);
  report.states.picker = await pg.evaluate(() => { const h = window.game.scene.getScene('Home'); return h.styleModel().trays.stance.map((p) => ({ id: p.id, earned: p.earned })); });
  report.states.pickerTexts = (await texts()).map((t) => t.t).filter((t) => /Stance|Ready|dojo/i.test(t));
  await pg.screenshot({ path: `${OUT}/${tag}-picker.png` });
  // Page the tray to the end: signed Horse next to the locked Cat Stance.
  for (let n = 0; n < 4; n++) await pg.evaluate(() => window.game.scene.getScene('Home').turnTray(1));
  await pg.waitForTimeout(1200);
  report.states.lastPageTexts = (await texts()).map((t) => t.t).filter((t) => /Stance/.test(t));
  await pg.screenshot({ path: `${OUT}/${tag}-picker-locked.png` });
  // Tap the locked Cat Stance tile: the not-yet card.
  const i = report.states.picker.findIndex((p) => !p.earned);
  let page = 0; const per = await pg.evaluate(() => window.game.scene.getScene('Home').styleModel().trays.stance.length);
  await pg.evaluate((i) => window.game.scene.getScene('Home').tapStyleTile(i), i); await pg.waitForTimeout(1500);
  report.states.lockedTexts = (await texts()).map((t) => t.t).filter((t) => t.length < 120);
  await pg.screenshot({ path: `${OUT}/${tag}-picker-locked-card.png` });
});
// 2. Reward moment on yellow: the saved snapshot lacks the Front Stance sign-off, so Home plays it.
await session('3-yellow-belt', async (pg, texts) => {
  await toHome(pg); await pg.waitForTimeout(2500);
  await pg.evaluate(() => { const h = window.game.scene.getScene('Home'); h.children.list.filter((c) => c.depth >= 90).forEach((c) => c.destroy()); h.celebrating = false; });
  await pg.evaluate(async () => { const sim = await import('/@fs/workspace/r-stance-d2/packages/sim/src/index.ts'); const h = window.game.scene.getScene('Home');
    const s = sim.snapshot(h.training); s.signed = s.signed.filter((id) => id !== 'PLACEHOLDER-dojoforge-stance-front');
    const k = 'dojo-ascent-profile-v1'; const p = JSON.parse(localStorage.getItem(k)); p.seen = s; p.lastRun = null; localStorage.setItem(k, JSON.stringify(p)); });
  await toHome(pg); await pg.waitForTimeout(RM === 'on' ? 1500 : 2500);
  report.states.rewardTexts = (await texts()).map((t) => t.t).filter((t) => t.length < 160);
  await pg.screenshot({ path: `${OUT}/${tag}-reward.png` });
});
report.reducedMotionFlag = RM;
fs.writeFileSync(`${OUT}/report-${tag}.json`, JSON.stringify(report, null, 1)); await b.close(); console.log(tag, 'errors', report.errs.length);
