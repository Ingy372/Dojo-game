import { chromium } from 'playwright'; import fs from 'fs';
const [W, H] = [+process.argv[2], +process.argv[3]]; const D = process.argv[4]; const tag = `grade-${W}x${H}-${D}`;
const out = []; const log = (s) => { out.push(s); console.log(s); };
const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
await ctx.addInitScript(() => { if (!sessionStorage.getItem('init')) { localStorage.clear(); sessionStorage.setItem('init', '1'); } localStorage.setItem('dojo-ascent-test-student', '4-green-belt'); localStorage.setItem('dojo.reducedMotion', 'off'); });
const pg = await ctx.newPage(); const errs = []; pg.on('pageerror', (e) => errs.push(e.stack)); pg.on('console', (m) => { if (m.type() === 'error') errs.push('console: ' + m.text()); });
const acts = () => pg.evaluate(() => window.game.scene.getScenes(true).map((s) => s.scene.key));
const texts = () => pg.evaluate(() => { const o = []; for (const s of window.game.scene.getScenes(true)) { const w = (l) => { for (const c of l) { if (c.list) w(c.list); if (c.type === 'Text' && c.visible && c.alpha > 0.01 && (!c.parentContainer || c.parentContainer.visible)) { const bb = c.getBounds(); o.push({ s: s.scene.key, t: c.text, size: c.style.fontSize, color: c.style.color, x: bb.centerX, y: bb.centerY, l: Math.round(bb.left), r: Math.round(bb.right), top: Math.round(bb.top), bot: Math.round(bb.bottom) }); } } }; w(s.children.list); } return o; });
await pg.goto(`http://localhost:5481/?room=keepers-hall&difficulty=${D}`); await pg.waitForFunction(() => window.game?.scene?.getScenes?.(true).length);
for (let i = 0; i < 40; i++) { const a = await acts(); if (a.includes('Game') || a.includes('Dojo') || a.includes('Home')) break; if (a.includes('Title')) await pg.mouse.click(W / 2, H / 2); if (a.includes('Create')) { const g = (await texts()).find((t) => /Let's go/.test(t.t)); if (g) await pg.mouse.click(g.x, g.y); } await pg.waitForTimeout(400); }
await pg.evaluate(() => { const g = window.game; g.scene.getScenes(true).forEach((s) => g.scene.stop(s.scene.key)); g.scene.start('Game'); }); await pg.waitForTimeout(2500);
// 1) GameScene grade moment on this difficulty
await pg.evaluate((d) => { const s = window.game.scene.getScene('Game'); s.world.difficulty = d; s.showGrade('S', 3, 0, 600, null); }, D);
await pg.waitForTimeout(500); await pg.screenshot({ path: `${tag}-game.png` });
const gt = (await texts()).filter((t) => t.s === 'Game');
log(`game: letter=${gt.some((t) => t.t === 'S')} line=${JSON.stringify(gt.filter((t) => /Room clear!/.test(t.t)).map((t) => ({ t: t.t, size: t.size, l: t.l, r: t.r })))}`);
await pg.waitForTimeout(2200);
// 2) Home Last run for a run played on this difficulty, player on this difficulty
await pg.evaluate((d) => { const K = 'dojo-ascent-profile-v1'; const p = JSON.parse(localStorage.getItem(K)); const room = (g, kind = 'combat') => ({ roomId: 'r', kind, grade: g, perfects: 1, damageTaken: 0, ticks: 300, inTime: null });
  p.difficulty = d; p.bests.mostSGrades = 2; p.lastRun = { summary: { result: 'cleared', roomsCleared: 4, totalRooms: 4, results: [room('S'), room('A'), room(null, 'rest'), room('B')], items: [], perfects: 3, bestCombo: 5, ticks: 3600, sGrades: 1, insights: [], decorations: [], decorationColours: [], defeated: [], test: false, tier: 1, tutorial: false, difficulty: d }, newBests: ['mostSGrades'] };
  localStorage.setItem(K, JSON.stringify(p)); const g = window.game; g.scene.getScenes(true).forEach((s) => g.scene.stop(s.scene.key)); g.scene.start('Home', {}); }, D);
await pg.waitForTimeout(2500); for (let i = 0; i < 3; i++) { if ((await texts()).some((t) => /Tap to continue/.test(t.t))) { await pg.mouse.click(W / 2, H * 0.9); await pg.waitForTimeout(900); } } await pg.screenshot({ path: `${tag}-lastrun.png` });
const ht = (await texts()).filter((t) => t.s === 'Home');
log(`lastrun: gradeLetters=${JSON.stringify(ht.filter((t) => /^[SAB]$/.test(t.t)).map((t) => t.t))} small=${JSON.stringify(ht.filter((t) => parseFloat(t.size) < 12).map((t) => t.t + ':' + t.size))}`);
await pg.evaluate(() => window.game.scene.getScene('Home').openBests()); await pg.waitForTimeout(600); await pg.screenshot({ path: `${tag}-bests.png` });
const bt = (await texts()).filter((t) => t.s === 'Home');
log(`bests: mostS=${bt.some((t) => /Most S grades/.test(t.t))} rows=${JSON.stringify(bt.filter((t) => /:/.test(t.t)).map((t) => t.t))}`);
log('errors: ' + JSON.stringify(errs)); fs.writeFileSync(`report-${tag}.txt`, out.join('\n') + '\n'); await b.close();
