// A-LEGENDARY-wire: Gear tab and Last run with forced Legendary items, before (main, :5512) / after (branch, :5511).
import { chromium } from 'playwright'; import fs from 'fs';
const [W, H] = [+process.argv[2], +process.argv[3]]; const RM = process.env.RM || 'off'; const PRE = process.env.PRE || 'after';
const URL = PRE === 'before' ? 'http://localhost:5512/' : 'http://localhost:5511/'; const tag = `${PRE}-${W}x${H}-rm${RM}`;
fs.mkdirSync(PRE, { recursive: true });
const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
await ctx.addInitScript((k) => { if (!sessionStorage.getItem('init')) { localStorage.clear(); sessionStorage.setItem('init', '1'); } localStorage.setItem('dojo-ascent-test-student', '4-green-belt'); localStorage.setItem('dojo.reducedMotion', k); }, RM);
const pg = await ctx.newPage(); const errs = []; pg.on('pageerror', (e) => errs.push(e.stack)); pg.on('console', (m) => { if (m.type() === 'error') errs.push('console: ' + m.text()); });
const acts = () => pg.evaluate(() => window.game.scene.getScenes(true).map((s) => s.scene.key));
const textsXY = () => pg.evaluate(() => { const o = []; for (const s of window.game.scene.getScenes(true)) { const w = (l) => { for (const c of l) { if (c.list) w(c.list); if (c.type === 'Text' && c.visible) { const bb = c.getBounds(); o.push({ t: c.text, x: bb.centerX, y: bb.centerY }); } } }; w(s.children.list); } return o; });
await pg.goto(URL); await pg.waitForFunction(() => window.game?.scene?.getScenes?.(true).length);
for (let i = 0; i < 40; i++) { const a = await acts(); if (a.includes('Game') || a.includes('Dojo') || a.includes('Home')) break; if (a.includes('Title')) await pg.mouse.click(W / 2, H / 2); if (a.includes('Create')) { const g = (await textsXY()).find((t) => /Let's go/.test(t.t)); if (g) await pg.mouse.click(g.x, g.y); } await pg.waitForTimeout(400); }
await pg.evaluate(() => { const k = 'dojo-ascent-profile-v1'; const p = JSON.parse(localStorage.getItem(k) || '{}'); p.runsPlayed = Math.max(5, p.runsPlayed || 0); p.runsStarted = Math.max(5, p.runsStarted || 0); p.guideStep = 99;
  const mk = (uid, base, name, slot, rarity, extra = {}) => ({ uid, base, name, slot, rarity, stats: { power: 2, maxHealth: 3, guard: 1 }, effect: null, effectText: '', ...extra });
  p.inventory = [mk('L1', 'training-gi', 'Training Gi', 'gi', 'legendary'), mk('L2', 'jade-charm', 'Jade Charm', 'charm', 'legendary', { effect: { type: 'powerScale', amount: 0.05 }, effectText: '+5% Power' }), mk('E1', 'jade-charm', 'Jade Charm', 'charm', 'epic', { effect: { type: 'powerScale', amount: 0.03 }, effectText: '+3% Power' }), mk('R1', 'cloth-wraps', 'Cloth Hand Wraps', 'hands', 'rare'), mk('L3', 'cloth-wraps', 'Cloth Hand Wraps', 'hands', 'legendary')];
  p.equipped = { hands: 'R1', gi: 'L1', charm: null }; localStorage.setItem(k, JSON.stringify(p)); localStorage.removeItem('dojo-ascent-run-in-progress'); });
await pg.goto(URL); await pg.waitForFunction(() => window.game?.scene?.getScenes?.(true).length); await pg.waitForTimeout(2000);
await pg.evaluate(() => { const g = window.game; g.scene.getScenes(true).forEach((s) => g.scene.stop(s.scene.key)); g.scene.start('Home'); }); await pg.waitForTimeout(3000);
await pg.evaluate(() => { const h = window.game.scene.getScene('Home'); h.children.list.filter((c) => c.depth >= 90).forEach((c) => c.destroy()); h.celebrating = false; });
const report = { tag, errs, states: {} };
const probe = () => pg.evaluate(() => { const h = window.game.scene.getScene('Home'); const o = { legendTiles: [], rings: [] }; const z = h.cameras.main.zoom / window.devicePixelRatio;
  const walk = (l) => l.forEach((c) => { if (c.list) walk(c.list); if (c.getData?.('gearTile')) { const it = h.profile.inventory.find((i) => i.uid === c.getData('gearTile')); const lab = c.list.find((x) => x.getData?.('rarityWord')); const sk = c.list[1]; const bb = lab?.getBounds();
      const hb = c.getBounds(); o.legendTiles.push({ uid: it.uid, selHl: c.list.some((x) => x.getData?.('legendSelected')), tileBox: { x: hb.x * z, y: hb.y * z, w: hb.width * z, h: hb.height * z }, rarity: it.rarity, legendFrame: !!c.getData('legendFrame'), crest: c.list.some((x) => x.getData?.('legendCrest')), skin: sk?.frame?.name ?? null, skinType: sk?.type, word: lab?.text, ink: lab?.style.color, fontPx: lab ? parseFloat(lab.style.fontSize) : null, wordBox: bb ? { x: bb.x * z, y: bb.y * z, w: bb.width * z, h: bb.height * z } : null }); }
    if (c.getData?.('gearRing')) o.rings.push({ slot: c.getData('gearRing'), skin: c.list[1]?.frame?.name ?? null }); }); walk(h.children.list); return o; });
async function shot(name, fn) { await pg.evaluate(fn); await pg.waitForTimeout(1800); report.states[name] = await probe(); await pg.screenshot({ path: `${PRE}/${tag}-${name}.png` }); }
await shot('gear', () => { const h = window.game.scene.getScene('Home'); h.tab = 'gear'; h.render(); });
// Hide the words for a background-only crop (contrast is measured against what sits behind the word).
await pg.evaluate(() => { const h = window.game.scene.getScene('Home'); const w = (l) => l.forEach((c) => { if (c.list) w(c.list); if (c.getData?.('rarityWord')) c.setVisible(false); }); w(h.children.list); }); await pg.waitForTimeout(300);
await pg.screenshot({ path: `${PRE}/${tag}-gear-nowords.png` });
await shot('gear-picked', () => { const h = window.game.scene.getScene('Home'); h.selected = 'L2'; h.render(); });
await pg.evaluate(() => { const h = window.game.scene.getScene('Home'); const w = (l) => l.forEach((c) => { if (c.list) w(c.list); if (c.getData?.('rarityWord')) c.setVisible(false); }); w(h.children.list); }); await pg.waitForTimeout(300);
await pg.screenshot({ path: `${PRE}/${tag}-gear-picked-nowords.png` });
await shot('run', () => { const h = window.game.scene.getScene('Home'); const inv = h.profile.inventory;
  const results = Array.from({ length: 9 }, (_, i) => i === 3 ? { kind: 'treasure' } : i === 6 ? { kind: 'rest' } : { kind: 'fight', grade: ['S','A','B','S','B','A','S','B','S'][i] });
  h.profile.lastRun = { summary: { result: 'cleared', roomsCleared: 9, totalRooms: 9, results, items: [inv[1], inv[2], inv[3]], perfects: 7, bestCombo: 12, ticks: 60 * 260, sGrades: 4, insights: [], decorations: [], decorationColours: [], defeated: [], test: false, tier: 1, tutorial: false }, newBests: [], xp: { gained: 180, blessed: false, catchUp: false, levelsGained: 0, atCap: false }, earned: [] };
  h.lastRunCounted = true; h.tab = 'run'; h.render(); });
await pg.waitForTimeout(3000); await pg.screenshot({ path: `${PRE}/${tag}-run.png` });
report.foundSkins = await pg.evaluate(() => { const h = window.game.scene.getScene('Home'); const o = []; const w = (l) => l.forEach((c) => { if (c.list) w(c.list); if (c.getData?.('found')) o.push({ id: c.getData('found'), skin: c.list[1]?.frame?.name ?? null }); }); w(h.children.list); return o; });
report.reducedMotion = await pg.evaluate(async () => (await import('/src/game/motion.ts')).reducedMotion());
fs.writeFileSync(`${PRE}/report-${tag}.json`, JSON.stringify(report, null, 1)); await b.close(); console.log(tag, 'errors', errs.length);
