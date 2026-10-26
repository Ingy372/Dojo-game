// Q-PREM-F11 verify-ui-shots: a tap on KO Screen 1 goes straight to Screen 2, and Head home is
// at least 48 px tall. Helpers copied from docs/shots/b-masher-d1/d1-verify.mjs. 4 sizes, RM on/off.
// Usage: OUT=<dir> PORT=<port> node f11-verify.mjs
import { chromium } from 'playwright';
const PORT = process.env.PORT || 5497; const OUT = process.env.OUT || '.';
const sizes = (process.env.SIZES || '667x375,667x320,844x390,932x430').split(',').map((s) => s.split('x').map(Number));
const lum = (h) => { const c = [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4)); return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]; };
const contrast = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05); };
const rows = []; const check = (where, name, ok, info = '') => rows.push(`${ok ? 'PASS' : 'FAIL'}  ${where}  ${name}${info ? '  (' + info + ')' : ''}`);
const b = await chromium.launch();
const texts = (pg) => pg.evaluate(() => { const o = []; for (const s of window.game.scene.getScenes(true)) { const w = (l, d, a) => l.forEach((c) => { const dd = d ?? c.depth; const aa = (a ?? 1) * c.alpha; if (!c.visible) return; if (c.list) w(c.list, dd, aa); if (c.type === 'Text' && aa > 0.05 && c.text) { const bb = c.getBounds(); o.push({ t: c.text, x: bb.centerX, y: bb.centerY, l: bb.left, r: bb.right, tp: bb.top, bt: bb.bottom, h: bb.height, size: parseFloat(c.style.fontSize), d: dd, lines: c.getWrappedText().length, scene: s.scene.key }); } }); w(s.children.list); } return o; });
async function open(W, H, rm) {
  const ctx = await b.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
  await ctx.addInitScript((rm) => { localStorage.setItem('dojo-ascent-test-student', '4-green-belt'); localStorage.setItem('dojo.reducedMotion', rm); }, rm);
  const pg = await ctx.newPage(); pg.errs = []; pg.on('pageerror', (e) => pg.errs.push(e.message));
  return { ctx, pg };
}
async function startRun(pg, practice = false) {
  await pg.goto(`http://localhost:${PORT}/?room=keepers-hall&seed=7&difficulty=guided`); await pg.waitForFunction(() => window.game?.scene?.getScenes?.(true).length); await pg.waitForTimeout(1500);
  if (practice) await pg.evaluate(() => { const g = window.game; g.scene.getScenes(true).forEach((s) => g.scene.stop(s.scene.key)); g.scene.start('Game'); });
  else await pg.evaluate(async () => { const g = window.game; const t = await import('/src/game/tower.ts'); const sv = await import('/src/game/save.ts'); const tr = (await import('/src/game/student.ts')).currentTraining(); g.scene.getScenes(true).forEach((s) => g.scene.stop(s.scene.key)); g.scene.start('Game', { run: t.startTowerRun(sv.loadSave(), tr) }); });
  for (let i = 0; i < 60; i++) { await pg.waitForTimeout(300); const t = await texts(pg); const bow = t.find((x) => x.t === 'Bow'); if (bow) { await pg.touchscreen.tap(bow.x, bow.y); await pg.waitForTimeout(2500); break; } const p = t.find((x) => /^(Let's go!|Got it|OK|Okay!)$/.test(x.t) && x.d >= 60); if (p) await pg.touchscreen.tap(p.x, p.y); if (practice && i > 10 && pg.url()) { const g = await pg.evaluate(() => !!window.game.scene.getScene('Game')?.world); if (g) break; } }
  await pg.waitForTimeout(1200);
}
const knockDown = async (pg) => { await pg.evaluate(() => { const s = window.game.scene.getScene('Game'); const p = s.world.players[s.me]; p.health = 1; s.world.minHealth = 0; for (const e of s.world.enemies) e.pos = { ...p.pos, x: p.pos.x + 0.6 }; }); for (let i = 0; i < 300; i++) { await pg.waitForTimeout(150); if (await pg.evaluate(() => window.game.scene.getScene('Game').downed === true)) return true; if (i % 20 === 19) await pg.evaluate(() => { const s = window.game.scene.getScene('Game'); const p = s.world.players[s.me]; p.health = 1; for (const e of s.world.enemies) e.pos = { ...p.pos, x: p.pos.x + 0.6 }; }); if (i % 6 === 0) { const t = await texts(pg); const se = t.find((x) => /^Sensei:/.test(x.t)); const c = se && t.find((x) => x.t === (/COUNTER/.test(se.t) ? 'COUNTER' : /STRIKE/.test(se.t) ? 'STRIKE' : /DASH/.test(se.t) ? 'DASH' : 'COUNTER')); if (c) await pg.touchscreen.tap(c.x, c.y); } } return false; };
const keptCard = (pg) => pg.evaluate(() => { const s = window.game.scene.getScene('Game'); if (!s) return null; for (const c of s.children.list) { if (!c.list || c.depth !== 110) continue; const ts = c.list.filter((o) => o.type === 'Text'); if (!ts.some((t) => t.text === 'Head home')) continue; const rects = c.list.filter((o) => o.type === 'Rectangle'); const card = rects[1].getBounds(); const btn = rects[2].getBounds(); const tb = ts.filter((t) => t.text !== '\u2726').map((t) => ({ t: t.text, b: t.getBounds(), size: parseFloat(t.style.fontSize), lines: t.getWrappedText().length })); const ov = []; for (let i = 0; i < tb.length; i++) for (let j = i + 1; j < tb.length; j++) { const a = tb[i].b, d = tb[j].b; if (a.right > d.left && a.left < d.right && a.bottom > d.top && a.top < d.bottom) ov.push(tb[i].t + '/' + tb[j].t); } const pad = Math.min(...tb.map(({ b }) => Math.min(b.left - card.left, card.right - b.right, b.top - card.top, card.bottom - b.bottom))); return { alpha: c.alpha, card: [card.x, card.y, card.width, card.height], btn: [btn.x, btn.y, btn.width, btn.height], texts: tb.map((x) => x.t), minSize: Math.min(...tb.map((x) => x.size)), maxLines: Math.max(...tb.map((x) => x.lines)), ov, pad }; } return null; });
const rmNow = (pg) => pg.evaluate(async () => ((await import('/src/game/motion.ts')).reducedMotion() ? 'on' : 'off'));
const BANNED = /\b(died|dead|game over|failed|fail|lost|lose|defeat|try harder|don't give up|only|almost|so close|hurry|should have|ouch)\b/i;


for (const [W, H] of sizes) for (const rm of ['off', 'on']) {
  const tag = `${W}x${H}-rm-${rm}`;
  // 1) A tap on Screen 1 goes straight to Screen 2.
  { const { ctx, pg } = await open(W, H, rm); await startRun(pg);
    check(tag, 'hero went down', await knockDown(pg)); await pg.waitForTimeout(500);
    await pg.screenshot({ path: `${OUT}/f11-1-helpup-${tag}.png` });
    check(tag, `Reduced motion read back = ${rm}`, (await rmNow(pg)) === rm);
    const t0 = Date.now(); await pg.touchscreen.tap(W / 2, H / 3);
    let k = null; for (let i = 0; i < 100 && !k; i++) { await pg.waitForTimeout(10); k = await keptCard(pg); }
    const ms = Date.now() - t0;
    check(tag, 'a tap shows Screen 2 at once (was about 1.75 s)', !!k && ms < 400, `${ms} ms after the tap`);
    // Fade frames: start, middle, end (none with Reduced motion).
    await pg.screenshot({ path: `${OUT}/f11-2-kept-0ms-${tag}.png` }); const a0 = (await keptCard(pg))?.alpha ?? -1;
    await pg.waitForTimeout(130); await pg.screenshot({ path: `${OUT}/f11-2-kept-130ms-${tag}.png` });
    await pg.waitForTimeout(170); await pg.screenshot({ path: `${OUT}/f11-2-kept-300ms-${tag}.png` }); k = await keptCard(pg);
    check(tag, rm === 'on' ? 'Reduced motion: Screen 2 is fully shown at once (no fade)' : 'Screen 2 fades in within 0.3 s', rm === 'on' ? a0 >= 0.99 : (k?.alpha ?? 0) >= 0.99, `alpha ${a0.toFixed(2)} at first frame, ${(k?.alpha ?? 0).toFixed(2)} at 300 ms`);
    if (k) {
      check(tag, 'Head home >= 48 px tall and >= 44 wide', k.btn[3] >= 48 && k.btn[2] >= 44, `${Math.round(k.btn[2])}x${Math.round(k.btn[3])}`);
      check(tag, 'card on screen, text >= 12 px, no overlap, padding >= 8', k.card[0] >= 0 && k.card[1] >= 0 && k.card[0] + k.card[2] <= W && k.card[1] + k.card[3] <= H && k.minSize >= 12 && k.ov.length === 0 && k.pad >= 8, `card ${k.card.map(Math.round).join(',')} ${k.minSize}px pad ${k.pad.toFixed(1)}`);
      await pg.waitForTimeout(500); check(tag, 'the skip tap does not also press Head home', !!(await keptCard(pg)));
      await pg.touchscreen.tap(k.btn[0] + k.btn[2] / 2, k.btn[1] + k.btn[3] / 2); await pg.waitForTimeout(900);
      const offer = (await texts(pg)).find((x) => x.t === 'No thanks'); if (offer) { await pg.waitForTimeout(700); await pg.touchscreen.tap(offer.x, offer.y); }
      let home = false; for (let i = 0; i < 50 && !home; i++) { await pg.waitForTimeout(100); home = (await texts(pg)).some((x) => x.t === 'Welcome home!'); }
      check(tag, 'hands-on: Head home goes Home', home);
    }
    check(tag, 'no page errors', pg.errs.length === 0, pg.errs.join(' | '));
    await ctx.close(); }
  // 2) With no tap, Screen 1 still stays its full time.
  { const { ctx, pg } = await open(W, H, rm); await startRun(pg); await knockDown(pg); const t0 = Date.now();
    let k = null; for (let i = 0; i < 80 && !k; i++) { await pg.waitForTimeout(100); k = await keptCard(pg); }
    check(tag, 'no tap: Screen 2 after the full Screen 1 (about 2.5 s)', !!k && Date.now() - t0 >= 1800, `${Date.now() - t0} ms`);
    check(tag, 'no page errors (no tap)', pg.errs.length === 0, pg.errs.join(' | '));
    await ctx.close(); }
}
await b.close();
const fails = rows.filter((r) => r.startsWith('FAIL')).length;
const out = `Q-PREM-F11 verify-ui-shots ${new Date().toISOString()}\n${rows.join('\n')}\n\n${rows.length - fails} PASS, ${fails} FAIL\n`;
(await import('node:fs')).writeFileSync(`${OUT}/verify-log.txt`, out); console.log(out);
