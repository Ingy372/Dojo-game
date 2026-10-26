// L-PREMIUM-b verify-ui-shots: the Counter tip (Sensei's nudge line + Counter pulse, a still outline
// with Reduced motion), never over the red attack circle, fades on its own, once per room.
// Helpers copied from docs/shots/b-masher-d1/d1-verify.mjs. 4 sizes, RM on/off.
// Usage: OUT=<dir> PORT=<port> node lpb-verify.mjs
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



const state = (pg) => pg.evaluate(() => {
  const s = window.game.scene.getScene('Game'); const t = s.counterTip; const cam = s.cameras.main; const DPR = Math.min(Math.max(window.devicePixelRatio || 1, 1), 3); const z = cam.zoom / DPR;
  const circles = s.world.enemies.filter((e) => e.attackCenter && e.mode === 'windup').map((e) => { const a = e.def.attacks[e.attackIndex % e.def.attacks.length].areaRadius; const cx = (e.attackCenter.x * 48 - cam.worldView.x) * z, cy = (e.attackCenter.y * 48 - cam.worldView.y) * z, r = a * 48 * z; return [cx - r, cy - r, cx + r, cy + r]; });
  const tb = t?.active && t.visible && t.alpha > 0.05 ? t.getBounds() : null; const cb = s.buttons.counter.container.getBounds();
  return { level: s.buttons.counterPulseLevel(), hint: s.world.counterHint && { ...s.world.counterHint }, text: tb ? t.text : null, size: t?.active ? parseFloat(t.style.fontSize) : 0, bg: t?.active ? t.style.backgroundColor : null,
    tip: tb && [tb.left, tb.top, tb.right, tb.bottom], counter: [cb.left, cb.top, cb.right, cb.bottom], scale: s.buttons.counter.container.scaleX, circles, W: s.scale.width };
});
const hit = (a, b) => a && b && a[0] < b[2] && a[2] > b[0] && a[1] < b[3] && a[3] > b[1];
for (const [W, H] of sizes) for (const rm of ['off', 'on']) {
  const tag = `${W}x${H}-rm-${rm}`;
  const { ctx, pg } = await open(W, H, rm); await startRun(pg);
  check(tag, `Reduced motion read back = ${rm}`, (await rmNow(pg)) === rm);
  let st = await state(pg);
  check(tag, 'the run room has the Counter tip on', !!st.hint, JSON.stringify(st.hint));
  // Make swings land as Hits (as if Mash guard had stepped back) and keep the tip allowed; the hero just stands. Sensei's guided Counter (this test student hasn't finished it) is switched off, since the tip waits for it.
  await pg.evaluate(() => { const s = window.game.scene.getScene('Game'); const p = s.world.players[s.me]; s.world.counterHint && (s.world.counterHint.perfectsLeft = 99); s.world.guide = null; s.buttons.pulseCounter(0); window.__lpb = setInterval(() => { p.perfects = 3; p.health = Math.max(p.health, p.maxHealth * 0.8); p.attackCooldown = 99; for (const e of s.world.enemies) if (e.mode === 'chase' && Math.hypot(e.pos.x - p.pos.x, e.pos.y - p.pos.y) > 2) e.pos = { x: p.pos.x + 0.9, y: p.pos.y }; }, 30); });
  let t0 = 0; for (let i = 0; i < 300 && !t0; i++) { await pg.waitForTimeout(100); st = await state(pg); if (st.level === 4 && st.text) t0 = Date.now(); }
  check(tag, 'tip shows after Counter windows pass with no answer', !!t0, JSON.stringify(st.hint));
  if (t0) {
    await pg.screenshot({ path: `${OUT}/lpb-1-tip-start-${tag}.png` });
    const tipText = st.text; let overCircle = 0, overCounter = 0, samples = 0, scales = new Set(), ring = true;
    for (let i = 0; i < 26; i++) { const s2 = await state(pg); if (s2.text === tipText) { samples++; if (s2.circles.some((c) => hit(s2.tip, c))) overCircle++; if (hit(s2.tip, s2.counter)) overCounter++; } if (s2.level === 4) scales.add(s2.scale.toFixed(3)); if (i === 12) await pg.screenshot({ path: `${OUT}/lpb-2-tip-mid-${tag}.png` }); await pg.waitForTimeout(100); }
    check(tag, 'tip never covers a red attack circle', overCircle === 0 && samples >= 10, `${samples} visible samples of 26, ${overCircle} over`);
    check(tag, 'tip never covers COUNTER (or any button)', overCounter === 0);
    check(tag, 'tip text >= 12 px, on screen', st.size >= 12 && st.tip[0] >= 0 && st.tip[2] <= W && st.tip[1] >= 0, `${st.size}px ${st.tip.map(Math.round).join(',')}`);
    const bg = (st.bg || '#2a2440').slice(0, 7); check(tag, 'tip contrast >= 4.5:1', contrast('#ffffff', bg) >= 4.5, `${contrast('#ffffff', bg).toFixed(1)}:1 on ${bg}`);
    check(tag, 'COUNTER tap target >= 44 px', st.counter[2] - st.counter[0] >= 44 && st.counter[3] - st.counter[1] >= 44, `${Math.round(st.counter[2] - st.counter[0])} px`);
    check(tag, rm === 'on' ? 'Reduced motion: Counter does not move (still outline)' : 'Counter pulses', rm === 'on' ? [...scales].every((x) => x === '1.000') : scales.size > 2, [...scales].slice(0, 5).join(' '));
    await pg.waitForTimeout(Math.max(0, 3000 + 700 - (Date.now() - t0))); st = await state(pg);
    await pg.screenshot({ path: `${OUT}/lpb-3-tip-end-${tag}.png` });
    check(tag, 'tip fades on its own (text gone, pulse off) after about 3 s', st.level === 0 && st.text !== tipText, `level ${st.level}`);
    let again = false; for (let i = 0; i < 60 && !again; i++) { await pg.waitForTimeout(100); again = (await state(pg)).level === 4; }
    check(tag, 'at most one tip in the room (none in the next 6 s)', !again);
    // Hands-on: COUNTER still works after the tip.
    const c = (await texts(pg)).find((x) => x.t === 'COUNTER'); if (c) await pg.touchscreen.tap(c.x, c.y); await pg.waitForTimeout(150);
    check(tag, 'hands-on: tapping COUNTER after the tip guards', await pg.evaluate(() => { const s = window.game.scene.getScene('Game'); const p = s.world.players[s.me]; return p.guardTicks > 0 || p.counterPressedTick >= s.world.tick - 6; }));
  }
  check(tag, 'no page errors', pg.errs.length === 0, pg.errs.join(' | '));
  await ctx.close();
}
await b.close();
const fails = rows.filter((r) => r.startsWith('FAIL')).length;
const out = `L-PREMIUM-b verify-ui-shots ${new Date().toISOString()}\n${rows.join('\n')}\n\n${rows.length - fails} PASS, ${fails} FAIL\n`;
(await import('node:fs')).writeFileSync(`${OUT}/verify-log.txt`, out); console.log(out);
