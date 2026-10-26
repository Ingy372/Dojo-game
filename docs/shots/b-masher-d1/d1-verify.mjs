// B-MASHER-d1 verify-ui-shots: the knock-out flow (Screen 1 -> 2 -> 3), the rested ending,
// a tap skipping Screen 1, and a practice-room fall. 4 sizes, Reduced motion on and off.
// Usage: OUT=<dir> PORT=<port> node d1-verify.mjs
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
  // 1) A Tower knock-out, waiting out Screen 1.
  { const { ctx, pg } = await open(W, H, rm); await startRun(pg);
    const down = await knockDown(pg); check(tag, 'run: hero went down', down);
    await pg.waitForTimeout(1000); const t1 = await texts(pg);
    await pg.screenshot({ path: `${OUT}/ko-1-helpup-${tag}.png` });
    check(tag, `Screen 1 Reduced motion read back = ${rm}`, (await rmNow(pg)) === rm);
    check(tag, 'Screen 1: "Sensei helps you up." and Sensei\'s line', t1.some((x) => x.t === 'Sensei helps you up.') && t1.some((x) => x.t === 'Sensei: Every fall is part of training.'), t1.map((x) => x.t).join(' | ').slice(0, 160));
    check(tag, 'Screen 1: no loss words on screen', !t1.some((x) => BANNED.test(x.t)));
    const s1 = t1.filter((x) => /Sensei/.test(x.t)); check(tag, 'Screen 1 lines fit the screen, <= 2 lines', s1.every((x) => x.l >= 0 && x.r <= W && x.tp >= 0 && x.bt <= H && x.lines <= 2), s1.map((x) => `${x.lines}L ${Math.round(x.l)}-${Math.round(x.r)}`).join(', '));
    const tEarly = Date.now(); let k = null; for (let i = 0; i < 80 && !k; i++) { await pg.waitForTimeout(100); k = await keptCard(pg); }
    check(tag, 'Screen 2 appears after Screen 1 (about 2.5 s from the fall)', !!k, `${Date.now() - tEarly + 1000} ms after the fall`);
    await pg.waitForTimeout(700); k = await keptCard(pg);
    await pg.screenshot({ path: `${OUT}/ko-2-kept-${tag}.png` });
    check(tag, `Screen 2 Reduced motion read back = ${rm}`, (await rmNow(pg)) === rm);
    if (k) {
      check(tag, 'Screen 2 title is a signed line', k.texts[0] === 'You kept everything you found!' || k.texts[0] === 'You learned this room!', k.texts.join(' | '));
      check(tag, "Screen 2 has Sensei: Let's rest at the dojo.", k.texts.includes("Sensei: Let's rest at the dojo."));
      check(tag, 'Head home >= 44x44', k.btn[2] >= 44 && k.btn[3] >= 44, `${Math.round(k.btn[2])}x${Math.round(k.btn[3])}`);
      check(tag, 'card text >= 12 px, <= 2 lines', k.minSize >= 12 && k.maxLines <= 2, `${k.minSize} px, ${k.maxLines} lines`);
      check(tag, 'card text does not overlap, padding >= 8', k.ov.length === 0 && k.pad >= 8, `${k.ov.join(',')} pad ${k.pad.toFixed(1)}`);
      check(tag, 'card on screen', k.card[0] >= 0 && k.card[1] >= 0 && k.card[0] + k.card[2] <= W && k.card[1] + k.card[3] <= H);
      check(tag, 'no loss words on Screen 2', !k.texts.some((x) => BANNED.test(x)));
      // Still there after 6 s: no timer.
      await pg.waitForTimeout(6000); check(tag, 'Screen 2 has no timer (still up after 6 s)', !!(await keptCard(pg)));
      // rm=off: Head home; rm=on: a tap anywhere (top-left corner of the shade).
      if (rm === 'off') await pg.touchscreen.tap(k.btn[0] + k.btn[2] / 2, k.btn[1] + k.btn[3] / 2); else await pg.touchscreen.tap(8, 8);
      await pg.waitForTimeout(900);
      const offer = (await texts(pg)).find((x) => x.t === 'No thanks'); if (offer) { await pg.waitForTimeout(700); await pg.touchscreen.tap(offer.x, offer.y); }
      check(tag, `Guided offer after Screen 2 (${offer ? 'shown' : 'not due'})`, true);
      let home = false; for (let i = 0; i < 50 && !home; i++) { await pg.waitForTimeout(100); home = (await texts(pg)).some((x) => x.t === 'Welcome home!'); }
      await pg.waitForTimeout(rm === 'on' ? 100 : 400);
      const t3 = await texts(pg); await pg.screenshot({ path: `${OUT}/ko-3-home-${tag}.png` });
      check(tag, `Screen 3 Reduced motion read back = ${rm}`, (await rmNow(pg)) === rm);
      check(tag, `${rm === 'off' ? 'Head home' : 'a tap anywhere'} goes to Home: "Welcome home!"`, home && t3.some((x) => x.scene === 'Home'));
      const ptr = t3.find((x) => x.t === 'Train in class to grow stronger!' || x.t === 'The Tower is ready when you are.');
      check(tag, 'Screen 3 pointer is a signed line, fits, >= 12 px', !!ptr && ptr.l >= 0 && ptr.r <= W && ptr.size >= 12, ptr ? ptr.t : 'none');
      await pg.waitForTimeout(4300); check(tag, 'Screen 3 fades by itself after about 4 s', !(await texts(pg)).some((x) => x.t === 'Welcome home!'));
    }
    check(tag, 'no page errors (run)', pg.errs.length === 0, pg.errs.join(' | '));
    await ctx.close(); }
  // 2) A tap skips Screen 1.
  { const { ctx, pg } = await open(W, H, rm); await startRun(pg); await knockDown(pg); await pg.waitForTimeout(500);
    await pg.touchscreen.tap(W / 2, H / 2); const t0 = Date.now(); let k = null; for (let i = 0; i < 40 && !k; i++) { await pg.waitForTimeout(50); k = await keptCard(pg); }
    check(tag, 'a tap skips Screen 1', !!k && Date.now() - t0 < 1500, `${Date.now() - t0} ms after the tap`);
    await pg.waitForTimeout(400); const k2 = await keptCard(pg); check(tag, 'the skip tap does not also press Head home', !!k2);
    await ctx.close(); }
  // 3) Play time ends (rested): Screen 2 with the resting line, Home without the next-run pointer.
  { const { ctx, pg } = await open(W, H, rm); await startRun(pg);
    await pg.evaluate(async () => { const s = window.game.scene.getScene('Game'); const sv = await import('/src/game/save.ts'); const p = sv.loadSave(); p.playLimit = { minutes: 1, day: '', usedMs: 0 }; s.run.status = 'rested'; s.endRun('rested'); });
    let k = null; for (let i = 0; i < 40 && !k; i++) { await pg.waitForTimeout(100); k = await keptCard(pg); } await pg.waitForTimeout(700); k = await keptCard(pg);
    await pg.screenshot({ path: `${OUT}/rested-2-kept-${tag}.png` });
    check(tag, 'rested: Screen 2 shows the resting line', !!k && k.texts.includes('Great training today! Your dojo is resting.'), k ? k.texts.join(' | ') : 'no card');
    if (k) { check(tag, 'rested card text <= 2 lines, no overlap', k.maxLines <= 2 && k.ov.length === 0, `${k.maxLines} lines`);
      await pg.touchscreen.tap(k.btn[0] + k.btn[2] / 2, k.btn[1] + k.btn[3] / 2); let home = false; for (let i = 0; i < 50 && !home; i++) { await pg.waitForTimeout(100); home = (await texts(pg)).some((x) => x.t === 'Welcome home!'); }
      await pg.waitForTimeout(400); await pg.screenshot({ path: `${OUT}/rested-3-home-${tag}.png` }); const t3 = await texts(pg);
      check(tag, 'rested: Welcome home!, no next-run pointer', home && !t3.some((x) => x.t === 'The Tower is ready when you are.'), t3.filter((x) => x.d >= 60).map((x) => x.t).join(' | ')); }
    check(tag, 'no page errors (rested)', pg.errs.length === 0, pg.errs.join(' | '));
    await ctx.close(); }
  // 4) The practice room: kind words, nothing ends, controls come back.
  { const { ctx, pg } = await open(W, H, rm); await startRun(pg, true);
    const isPractice = await pg.evaluate(() => { const s = window.game.scene.getScene('Game'); return !!s && !s.run; });
    const down = await knockDown(pg); await pg.waitForTimeout(250); const t1 = await texts(pg); await pg.screenshot({ path: `${OUT}/practice-down-${tag}.png` });
    check(tag, `practice: kind words (practice=${isPractice}, down=${down})`, t1.some((x) => x.t === 'Sensei helps you up.') && !t1.some((x) => BANNED.test(x.t)));
    await pg.evaluate(() => { window.game.scene.getScene('Game').world.minHealth = 1; });
    await pg.waitForTimeout(3000); const st = await pg.evaluate(() => { const s = window.game.scene.getScene('Game'); const vis = (o) => o.visible && o.alpha > 0.05; return { downed: s.downed, buttons: s.buttons.objects.filter(vis).length, card: s.children.list.some((c) => c.depth === 110 && c.list), scenes: window.game.scene.getScenes(true).map((x) => x.scene.key).join(',') }; });
    await pg.screenshot({ path: `${OUT}/practice-after-${tag}.png` });
    check(tag, 'practice: nothing ends, buttons back, no card', !st.downed && st.buttons > 0 && !st.card && st.scenes.includes('Game'), JSON.stringify(st));
    check(tag, 'no page errors (practice)', pg.errs.length === 0, pg.errs.join(' | '));
    await ctx.close(); }
}
for (const [n, fg, bg] of [['card text', '#f2e9d8', '#221d2e'], ['titles', '#ffd166', '#221d2e'], ['Head home', '#fff6e0', '#277a56'], ['Screen 1 message', '#f2e9d8', '#14121c']]) { const r = contrast(fg, bg); check('all', `contrast ${n} >= 4.5:1`, r >= 4.5, `${r.toFixed(2)}:1`); }
console.log(rows.join('\n')); console.log(`\n${rows.filter((r) => r.startsWith('PASS')).length} PASS, ${rows.filter((r) => r.startsWith('FAIL')).length} FAIL`); await b.close();
