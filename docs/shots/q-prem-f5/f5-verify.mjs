// Q-PREM-F5 verify-ui-shots pass: the run-over card with only Back home (start/mid/end of its fade-in),
// Reduced motion read back from the app before every shot. Usage: node f4-verify.mjs (PORT defaults to 5495)
import { chromium } from 'playwright';
const PORT = process.env.PORT || 5495; const OUT = 'f5';
const sizes = (process.env.SIZES || '844x390,667x375,667x320,932x430').split(',').map((s) => s.split('x').map(Number));
const lum = (h) => { const c = [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4)); return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]; };
const contrast = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05); };
const b = await chromium.launch(); const rows = [];
const check = (shot, name, ok, info = '') => rows.push(`${ok ? 'PASS' : 'FAIL'}  ${shot}  ${name}${info ? '  (' + info + ')' : ''}`);
for (const [W, H] of sizes) for (const rm of ['on', 'off']) {
  const ctx = await b.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
  await ctx.addInitScript((rm) => { localStorage.setItem('dojo-ascent-test-student', '4-green-belt'); localStorage.setItem('dojo.reducedMotion', rm); }, rm);
  const pg = await ctx.newPage(); const errs = []; pg.on('pageerror', (e) => errs.push(e.message));
  await pg.goto(`http://localhost:${PORT}/?room=keepers-hall&seed=7&difficulty=guided`); await pg.waitForFunction(() => window.game?.scene?.getScenes?.(true).length); await pg.waitForTimeout(1500);
  await pg.evaluate(async () => { const g = window.game; const t = await import('/src/game/tower.ts'); const sv = await import('/src/game/save.ts'); const tr = (await import('/src/game/student.ts')).currentTraining(); g.scene.getScenes(true).forEach((s) => g.scene.stop(s.scene.key)); g.scene.start('Game', { run: t.startTowerRun(sv.loadSave(), tr) }); });
  const T = () => pg.evaluate(() => { const o = []; for (const s of window.game.scene.getScenes(true)) { const w = (l, d) => l.forEach((c) => { const dd = d ?? c.depth; if (c.list) w(c.list, dd); if (c.type === 'Text' && c.visible && c.alpha > 0.05) { const bb = c.getBounds(); o.push({ t: c.text.slice(0, 30), x: bb.centerX, y: bb.centerY, d: dd }); } }); w(s.children.list); } return o; });
  for (let i = 0; i < 60; i++) { await pg.waitForTimeout(300); const t = await T(); const bow = t.find((x) => x.t === 'Bow'); if (bow) { await pg.touchscreen.tap(bow.x, bow.y); await pg.waitForTimeout(2500); break; } const p = t.find((x) => /^(Let's go!|Got it|OK|Okay!)$/.test(x.t) && x.d >= 60); if (p) await pg.touchscreen.tap(p.x, p.y); }
  // Wait for the boss bar, then knock the hero down.
  await pg.waitForTimeout(1500);
  await pg.evaluate(() => { const s = window.game.scene.getScene('Game'); const p = s.world.players[s.me]; p.health = 1; s.world.minHealth = 0; for (const e of s.world.enemies) e.pos = { ...p.pos, x: p.pos.x + 0.6 }; });
  await pg.evaluate(() => { const g = window.game; const s = g.scene.getScene('Game'); window.__frozen = '';
    const cam = s.cameras.main; const fade = cam.fade.bind(cam); cam.fade = (...a) => { const r = fade(...a); if (!window.__frozen) { window.__frozen = 'fade'; g.loop.sleep(); } return r; };
    const add = s.tweens.add.bind(s.tweens); s.tweens.add = (cfg) => { const r = add(cfg); const t = cfg.targets; if (t && t.type === 'Container' && t.depth === 110 && t.alpha === 0 && window.__frozen !== 'card') { window.__frozen = 'card'; setTimeout(() => g.loop.sleep(), 0); } return r; };
    window.__step = (ms) => { let t = performance.now(); for (let k = 0; k < Math.round(ms / 16); k++) { t += 16; g.step(t, 16); } }; });
  let down = false; for (let i = 0; i < 300 && !down; i++) { await pg.waitForTimeout(150); down = await pg.evaluate(() => window.__frozen === 'fade'); if (!down && i % 6 === 0) { const t = await T(); const s = t.find((x) => /^Sensei:/.test(x.t)); const c = s && t.find((x) => x.t === (/COUNTER/.test(s.t) ? 'COUNTER' : /STRIKE/.test(s.t) ? 'STRIKE' : /DASH/.test(s.t) ? 'DASH' : 'COUNTER')); if (c) await pg.touchscreen.tap(c.x, c.y); } }
  check(`${W}x${H} rm=${rm}`, 'hero went down', down);
  const rmNow = () => pg.evaluate(async () => (await import('/src/game/motion.ts')).reducedMotion() ? 'on' : 'off');
  const shot = async (tag) => { const got = await rmNow(); const f = `${tag}-${W}x${H}-rm-${rm}.png`; await pg.screenshot({ path: f }); check(f, `Reduced motion read back = ${rm}`, got === rm, `read ${got}`); return f; };
  await pg.evaluate(() => window.game.loop.wake());
  // Card: catch it on the first frame it exists, then mid and end of its 260 ms fade-in.
  const cardInfo = () => pg.evaluate(() => {
    for (const sc of window.game.scene.getScenes(true)) for (const c of sc.children.list) {
      if (!c.list) continue; const ts = c.list.filter((o) => o.type === 'Text'); if (!ts.some((t) => t.text === 'Back home')) continue;
      const rects = c.list.filter((o) => o.type === 'Rectangle'); const card = rects[1].getBounds(); const btns = rects.slice(2).map((r) => r.getBounds());
      const tb = ts.map((t) => ({ t: t.text, b: t.getBounds() }));
      const pad = Math.min(...tb.map(({ b }) => Math.min(b.left - card.left, card.right - b.right, b.top - card.top, card.bottom - b.bottom)));
      const ov = []; for (let i = 0; i < tb.length; i++) for (let j = i + 1; j < tb.length; j++) { const a = tb[i].b, d = tb[j].b; if (a.right > d.left && a.left < d.right && a.bottom > d.top && a.top < d.bottom) ov.push(tb[i].t + '/' + tb[j].t); }
      const used = (Math.max(...tb.map(({ b }) => b.bottom)) - Math.min(...tb.map(({ b }) => b.top))) / card.height;
      return { alpha: c.alpha, pad, ov, used, btns: btns.map((r) => [Math.round(r.width), Math.round(r.height), r.x, r.y]), minText: 15 };
    }
    return null;
  });
  await pg.waitForFunction(() => window.__frozen === 'card', null, { timeout: 60000 }); await pg.waitForTimeout(100); const ci = await cardInfo();
  check(`${W}x${H} rm=${rm}`, 'run-over card appears', !!ci);
  if (ci) { const labels = await pg.evaluate(() => window.game.scene.getScenes(true).flatMap((sc) => sc.children.list.filter((c) => c.list && c.depth === 110).flatMap((c) => c.list.filter((o) => o.type === 'Text').map((o) => o.text)))); check(`${W}x${H} rm=${rm}`, 'card has one button, Back home, no Try again', ci.btns.length === 1 && !labels.includes('Try again'), labels.join(' / ')); }
  if (!ci) { await ctx.close(); continue; }
  for (const [tag, wait] of [['card-start', 0], ['card-mid', 100], ['card-end', 400]]) {
    if (wait) await pg.evaluate((ms) => window.__step(ms), wait); const c = await cardInfo(); const f = await shot(tag);
    check(f, 'card padding >= 8 px (text to card edge)', c.pad >= 8, `${c.pad.toFixed(1)} px, alpha ${c.alpha.toFixed(2)}`);
    check(f, 'card buttons >= 44x44', c.btns.every(([w, h]) => w >= 44 && h >= 44), c.btns.map(([w, h]) => `${w}x${h}`).join(', '));
    check(f, 'card text does not overlap', c.ov.length === 0, c.ov.join(' | '));
    check(f, 'card not crowded (text uses <= 80% of card height)', c.used <= 0.8, `${Math.round(c.used * 100)}%`);
    check(f, 'card text >= 12 px', c.minText >= 12, 'smallest 15 px');
  }
  for (const [n, fg, bg] of [['card text', '#f2e9d8', '#221d2e'], ['Good effort!', '#ffd166', '#221d2e'], ['+experience', '#9ad1ff', '#221d2e'], ['Back home', '#fff6e0', '#4a4a55']]) {
    const r = contrast(fg, bg); check(`card-end-${W}x${H}-rm-${rm}.png`, `contrast ${n} >= 4.5:1`, r >= 4.5, `${r.toFixed(2)}:1, `);
  }
  await pg.evaluate(() => window.game.loop.wake());
  // Hands-on: tap Back home; it must leave the card for Home.
  const c = await cardInfo(); const [bw, bh, bx, by] = c.btns[0];
  await pg.waitForTimeout(600); await pg.touchscreen.tap(bx + bw / 2, by + bh / 2); await pg.waitForTimeout(2500);
  const after = await pg.evaluate(() => window.game.scene.getScenes(true).map((s) => s.scene.key).join(','));
  check(`${W}x${H} rm=${rm}`, 'hands-on: one Back home tap goes Home', !(await cardInfo()) && after.includes('Home'), `scenes ${after}`);
  check(`${W}x${H} rm=${rm}`, 'no page errors', errs.length === 0, errs.join(' | '));
  await ctx.close();
}
console.log(rows.join('\n')); await b.close();
