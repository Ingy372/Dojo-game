import { chromium } from 'playwright'; import fs from 'fs';
const [W, H] = [+process.argv[2], +process.argv[3]]; const RM = process.env.RM || 'off'; const PRE = process.env.PRE || 'after'; const tag = `${PRE}-${W}x${H}-rm${RM}`; const URL = 'http://localhost:5491/';
fs.mkdirSync(PRE, { recursive: true });
const out = []; const log = (s) => { out.push(s); console.log(s); };
const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
await ctx.addInitScript((k) => { if (!sessionStorage.getItem('init')) { localStorage.clear(); sessionStorage.setItem('init', '1'); } localStorage.setItem('dojo-ascent-test-student', '4-green-belt'); localStorage.setItem('dojo.reducedMotion', k === 'on' ? 'on' : 'off'); }, RM);
const pg = await ctx.newPage(); const errs = []; pg.on('pageerror', (e) => errs.push(e.stack)); pg.on('console', (m) => { if (m.type() === 'error') errs.push('console: ' + m.text()); });
const acts = () => pg.evaluate(() => window.game.scene.getScenes(true).map((s) => s.scene.key));
const textsXY = () => pg.evaluate(() => { const o = []; for (const s of window.game.scene.getScenes(true)) { const m = s.cameras.main; const w = (l) => { for (const c of l) { if (c.list) w(c.list); if (c.type === 'Text' && c.visible) { const bb = c.getBounds(); o.push({ t: c.text, x: bb.centerX * m.zoom / window.devicePixelRatio, y: bb.centerY * m.zoom / window.devicePixelRatio }); } } }; w(s.children.list); } return o; });
await pg.goto(URL); await pg.waitForFunction(() => window.game?.scene?.getScenes?.(true).length);
for (let i = 0; i < 40; i++) { const a = await acts(); if (a.includes('Game') || a.includes('Dojo') || a.includes('Home')) break; if (a.includes('Title')) await pg.mouse.click(W / 2, H / 2); if (a.includes('Create')) { const g = (await textsXY()).find((t) => /Let's go/.test(t.t)); if (g) await pg.mouse.click(g.x, g.y); } await pg.waitForTimeout(400); }
await pg.evaluate(() => { const k = 'dojo-ascent-profile-v1'; const p = JSON.parse(localStorage.getItem(k) || '{}'); p.runsPlayed = Math.max(5, p.runsPlayed || 0); p.runsStarted = Math.max(5, p.runsStarted || 0); p.guideStep = 99; const mk = (uid, base, name, slot, rarity, extra = {}) => ({ uid, base, name, slot, rarity, stats: { power: 2, maxHealth: 3, guard: 1 }, effect: null, effectText: '', ...extra }); p.inventory = [mk('i1', 'cloth-wraps', 'Cloth Hand Wraps', 'hands', 'rare'), mk('i2', 'training-gi', 'Training Gi', 'gi', 'uncommon'), mk('i3', 'jade-charm', 'Jade Charm', 'charm', 'epic', { effect: { type: 'powerScale', amount: 0.03 }, effectText: '+3% Power' }), mk('i4', 'training-gi', 'Training Gi', 'gi', 'common')]; p.equipped = { hands: 'i1', gi: null, charm: 'i3' }; localStorage.setItem(k, JSON.stringify(p)); localStorage.removeItem('dojo-ascent-run-in-progress'); });
await pg.goto(URL); await pg.waitForFunction(() => window.game?.scene?.getScenes?.(true).length); await pg.waitForTimeout(2000);
await pg.evaluate(() => { const g = window.game; g.scene.getScenes(true).forEach((s) => g.scene.stop(s.scene.key)); g.scene.start('Home'); }); await pg.waitForTimeout(3000);
// P-MENU2-SPACE: for every tab, at several scroll positions, every tap area the window cuts is touched
// 2 px outside the window (must get no pointerdown/pointerup) and 3 px inside its visible part (must get a pointerdown).
await pg.evaluate(() => { const h = window.game.scene.getScene('Home'); h.children.list.filter((c) => c.depth >= 90).forEach((c) => c.destroy()); h.celebrating = false; });
const states = {
  gate: () => { const h = window.game.scene.getScene('Home'); h.tab = 'gate'; h.render(); },
  style: () => { const h = window.game.scene.getScene('Home'); h.tab = 'abilities'; h.part = 'style'; h.render(); },
  trophies: () => { const h = window.game.scene.getScene('Home'); h.tab = 'abilities'; h.part = 'trophy'; h.render(); },
  gear: () => { const h = window.game.scene.getScene('Home'); h.tab = 'gear'; h.render(); },
  'run-empty': () => { const h = window.game.scene.getScene('Home'); h.profile.lastRun = null; h.tab = 'run'; h.render(); },
  run: () => { const h = window.game.scene.getScene('Home');
    const results = Array.from({ length: 9 }, (_, i) => i === 3 ? { kind: 'treasure' } : i === 6 ? { kind: 'rest' } : { kind: 'fight', grade: ['S','A','B','S','B','A','S','B','S'][i] });
    h.profile.lastRun = { summary: { result: 'cleared', roomsCleared: 9, totalRooms: 9, results, items: (h.profile.inventory || []).slice(0, 4), perfects: 7, bestCombo: 12, ticks: 60 * 260, sGrades: 4, insights: [], decorations: ['training-mat'], decorationColours: [], defeated: [], test: false, tier: 1, tutorial: false }, newBests: [], xp: { gained: 180, blessed: false, catchUp: false, levelsGained: 0, atCap: false }, earned: [] };
    h.tab = 'run'; h.render(); },
};
let fails = 0, checks = 0;
for (const [name, fn] of Object.entries(states)) {
  await pg.evaluate(fn); await pg.waitForTimeout(1500);
  const max = await pg.evaluate(() => window.game.scene.getScene('Home').panelScroll?.max ?? 0);
  log(`${name}: scroll max=${max.toFixed(0)}`);
  if (!max) continue;
  for (const y of [...new Set([10, Math.round(max / 2), Math.round(max)])].filter((v) => v <= max)) {
    const probes = await pg.evaluate((y) => { const h = window.game.scene.getScene('Home'); h.panelScroll.to(y);
      const { top, panelH, rx, rw } = h.panelBox; const wt = top + 4, wb = top + panelH - 4; const o = [];
      const walk = (l) => l.forEach((c) => c.list ? walk(c.list) : c.input && o.push(c)); walk(h.panelContent.list);
      window.__taps = o; o.forEach((c, i) => { c.__n = 0; c.off('pointerdown', c.__f); c.__f = () => c.__n++; c.on('pointerdown', c.__f); c.on('pointerup', c.__f); });
      return o.map((c, i) => { const b = c.getBounds(); return { i, x: Math.max(rx + 6, Math.min(rx + rw - 14, b.centerX)), t: b.top, b: b.bottom, wt, wb }; }).filter((p) => p.t < p.wt || p.b > p.wb).filter((p) => p.b > p.wt - 2 && p.t < p.wb + 2); }, y);
    for (const p of probes) {
      const tries = [];
      if (p.t < p.wt - 2) tries.push({ y: p.wt - 2, inside: Math.min(p.b, p.wb) > p.wt + 3 ? p.wt + 3 : null });
      if (p.b > p.wb + 2) tries.push({ y: p.wb + 2, inside: Math.max(p.t, p.wt) < p.wb - 3 ? p.wb - 3 : null });
      for (const tr of tries) {
        checks++;
        await pg.evaluate(() => window.__taps.forEach((c) => (c.__n = 0)));
        await pg.mouse.move(p.x, tr.y); await pg.mouse.down(); await pg.mouse.up(); await pg.waitForTimeout(150);
        const hit = await pg.evaluate(() => ({ any: window.__taps.reduce((a, c) => a + c.__n, 0), scene: window.game.scene.getScenes(true).map((s) => s.scene.key).join(','), kids: window.game.scene.getScene('Home').panel.list.length }));
        const bad = hit.any > 0 || !hit.scene.includes('Home') || hit.scene.includes('Game');
        if (bad) fails++;
        let pos = '';
        if (tr.inside !== null) { checks++; await pg.evaluate(() => window.__taps.forEach((c) => (c.__n = 0)));
          await pg.mouse.move(p.x, tr.inside); await pg.mouse.down(); const n = await pg.evaluate((i) => window.__taps[i].__n, p.i); if (n < 1) log("    got: " + await pg.evaluate(() => window.__taps.map((c, j) => c.__n ? j + ":" + c.getBounds().top.toFixed(0) + "-" + c.getBounds().bottom.toFixed(0) + " hit=" + JSON.stringify(c.input.hitArea) : "").filter(Boolean).join(" ")));
          await pg.mouse.move(p.x, 2); await pg.mouse.up(); await pg.waitForTimeout(100); await pg.evaluate((y) => window.game.scene.getScene('Home').panelScroll.to(y), y); if (n < 1) fails++; pos = ` | inside y=${tr.inside.toFixed(1)}: pointerdown=${n} ${n >= 1 ? 'OK' : 'FAIL'}`; }
        log(`  scroll ${y} zone ${p.t.toFixed(1)}–${p.b.toFixed(1)} window ${p.wt.toFixed(0)}–${p.wb.toFixed(0)}: outside y=${tr.y.toFixed(1)} events=${hit.any} scenes=${hit.scene} ${bad ? 'FAIL' : 'OK'}${pos}`);
        if (bad) { await pg.evaluate(fn); await pg.waitForTimeout(1500); }
      }
    }
  }
  await pg.evaluate(() => { document.activeElement?.blur?.(); });
}
log(`edge taps: ${checks} checks, ${fails} failed`);
fs.writeFileSync(`edgetap-${W}x${H}-rm${RM}.txt`, out.join('\n') + '\n'); await b.close(); process.exit(fails ? 1 : 0);
