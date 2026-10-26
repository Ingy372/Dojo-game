// R-STANCE-g shots: a new player in Beginner with Open Leg locked (fixture 1), its not-yet card,
// a grandfathered old player in Open Leg, and the new-player welcome. Usage: RM=on|off node shots.mjs W H
import { chromium } from 'playwright'; import fs from 'fs';
const [W, H] = [+process.argv[2], +process.argv[3]]; const RM = process.env.RM || 'off'; const URL = 'http://localhost:5531/';
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

const clearOverlays = (pg) => pg.evaluate(() => { const h = window.game.scene.getScene('Home'); h.children.list.filter((c) => c.depth >= 90).forEach((c) => c.destroy()); h.celebrating = false; });
const openStance = async (pg) => { await pg.evaluate(() => { const h = window.game.scene.getScene('Home'); h.tab = 'abilities'; h.part = 'style'; h.styleSlot = 'stance'; h.trayPageNo = 0; h.render(); }); await pg.waitForTimeout(1500); };
const state = (pg) => pg.evaluate(() => { const h = window.game.scene.getScene('Home'); const m = h.styleModel(); return { current: m.current.stance?.id, tray: m.trays.stance.map((p) => [p.id, p.earned]), loadout: h.profile.loadout, gf: h.profile.grandfatheredStances }; });
// 1. New player (fixture 1): Beginner equipped, Open Leg locked; tap Open Leg for the not-yet card.
await session('1-white-belt-new', async (pg, texts) => {
  await toHome(pg); await pg.waitForTimeout(3000); await clearOverlays(pg); await openStance(pg);
  report.states.newPlayer = await state(pg);
  report.states.newPlayerTexts = (await texts()).map((t) => t.t).filter((t) => /Stance|dojo/i.test(t));
  await pg.screenshot({ path: `${OUT}/${tag}-new-player.png` });
  const i = report.states.newPlayer.tray.findIndex((p) => p[0] === 'ready-stance');
  await pg.evaluate((i) => window.game.scene.getScene('Home').tapStyleTile(i), i); await pg.waitForTimeout(1500);
  report.states.lockedTexts = (await texts()).map((t) => t.t).filter((t) => t.length < 160);
  await pg.screenshot({ path: `${OUT}/${tag}-open-leg-locked.png` });
});
// 2. Old player: a pre-g save (no marker, runs played, no pick) loads into Open Leg.
await session('1-white-belt-new', async (pg, texts) => {
  await pg.evaluate(() => { const k = 'dojo-ascent-profile-v1'; const p = JSON.parse(localStorage.getItem(k)); delete p.stanceMigrated; delete p.grandfatheredStances; p.loadout = null; p.runsPlayed = 7; localStorage.setItem(k, JSON.stringify(p)); });
  await pg.reload(); await pg.waitForFunction(() => window.game?.scene?.getScenes?.(true).length); await pg.waitForTimeout(1500);
  await toHome(pg); await pg.waitForTimeout(3000); await clearOverlays(pg); await openStance(pg);
  report.states.oldPlayer = await state(pg);
  await pg.screenshot({ path: `${OUT}/${tag}-old-player.png` });
});
// 3. Welcome for a brand-new white belt (seen null).
await session('1-white-belt-new', async (pg, texts) => {
  await pg.evaluate(() => { const k = 'dojo-ascent-profile-v1'; const p = JSON.parse(localStorage.getItem(k)); p.seen = null; p.lastRun = null; localStorage.setItem(k, JSON.stringify(p)); });
  await toHome(pg); await pg.waitForTimeout(RM === 'on' ? 1500 : 2500);
  report.states.welcomeTexts = (await texts()).map((t) => t.t).filter((t) => t.length < 160);
  await pg.screenshot({ path: `${OUT}/${tag}-welcome.png` });
});
report.reducedMotionFlag = RM;
fs.writeFileSync(`${OUT}/report-${tag}.json`, JSON.stringify(report, null, 1)); await b.close(); console.log(tag, 'errors', report.errs.length);
