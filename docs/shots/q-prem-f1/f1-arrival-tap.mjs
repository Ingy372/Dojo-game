import { chromium } from 'playwright';
const PORT = process.env.PORT || 5494; const sizes = (process.env.SIZES || '667x375,844x390,932x430').split(',').map((s) => s.split('x').map(Number));
const b = await chromium.launch(); let bad = 0, total = 0; const out = [];
for (const [W, H] of sizes) for (const rm of ['off', 'on']) {
  const ctx = await b.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
  await ctx.addInitScript((rm) => { localStorage.setItem('dojo-ascent-test-student', '4-green-belt'); localStorage.setItem('dojo.reducedMotion', rm); }, rm);
  const pg = await ctx.newPage(); await pg.goto(`http://localhost:${PORT}/`); await pg.waitForFunction(() => window.game?.scene?.getScenes?.(true).length); await pg.waitForTimeout(1500);
  await pg.evaluate(() => { const g = window.game; g.scene.getScenes(true).forEach((s) => g.scene.stop(s.scene.key)); sessionStorage.removeItem('dojo-ascent-bowed'); g.scene.start('Dojo'); });
  const T = () => pg.evaluate(() => { const o = []; for (const s of window.game.scene.getScenes(true)) { const w = (l, d) => l.forEach((c) => { const dd = d ?? c.depth; if (c.list) w(c.list, dd); if (c.type === 'Text' && c.visible) { const bb = c.getBounds(); o.push({ t: c.text, x: bb.centerX, y: bb.centerY, d: dd }); } }); w(s.children.list); } return o; });
  const st = () => pg.evaluate(() => { const g = window.game; const d = g.scene.getScene('Dojo'); return { scenes: g.scene.getScenes(true).map((s) => s.scene.key).join('+'), mode: d?.mode, pos: d?.world?.players?.p1?.pos ? { ...d.world.players.p1.pos } : null }; });
  let saw = 0;
  for (let i = 0; i < 80; i++) {
    await pg.waitForTimeout(300);
    const t = await T(); const bow = t.find((x) => x.t === 'Bow');
    if (bow) { await pg.touchscreen.tap(bow.x, bow.y); continue; }
    const tc = t.find((x) => x.t === 'Tap to continue');
    if (tc) {
      const before = await st(); const ty = process.env.TAP === 'center' ? H / 2 : tc.y; await pg.touchscreen.tap(W / 2, ty); await pg.waitForTimeout(1500); const after = await st();
      const moved = !before.pos || !after.pos ? false : Math.hypot(after.pos.x - before.pos.x, after.pos.y - before.pos.y) > 0.01;
      const run = /Game/.test(after.scenes); total++; saw++; if (moved || run) bad++;
      out.push(`${W}x${H} rm=${rm}: Tap to continue @${(W / 2).toFixed(0)},${tc.y.toFixed(0)} pos ${JSON.stringify(before.pos)} -> ${JSON.stringify(after.pos)} scenes=${after.scenes} mode=${after.mode} => ${moved || run ? 'FAIL (moved/run)' : 'ok'}`);
      continue;
    }
    const p = t.find((x) => /^(Let's go!|Got it|OK|Continue|Thank you!|Nice!|Okay!|Not now)$/.test(x.t) && x.d >= 60);
    if (p) { await pg.touchscreen.tap(p.x, p.y); continue; }
    if ((await st()).mode === 'play') break;
  }
  // (c-last) Run the real arrival again with only the celebration left (welcomed, no time away, Sensei card already seen, no saved run),
  // so its 'Tap to continue' is the LAST step and closing it starts play: the case a phone hits.
  if ((await st()).mode === 'play') for (const variant of (process.env.VARIANTS || 'touch,touch+compat-mouse,control-play-tap').split(',')) {
    if (variant === 'control-play-tap') { const b0 = await st(); await pg.touchscreen.tap(W / 2 + 60, H / 2 - 40); await pg.waitForTimeout(1500); const a0 = await st(); out.push(`${W}x${H} rm=${rm} control tap in play: ${JSON.stringify(b0.pos)} -> ${JSON.stringify(a0.pos)} (should move; proves the check can see a walk)`); continue; }
    const ok = await pg.evaluate(() => { const d = window.game.scene.getScene('Dojo'); d.profile.seen = null; d.mode = 'arriving'; d.renderUi(); d.arrive(0); return 'ok'; });
    if (!ok.startsWith('ok')) { out.push(`${W}x${H} rm=${rm} last-step: ${ok}`); break; }
    // Tap through the celebration; judge the tap that ends the arrival (mode turns 'play').
    let tc = null, before = null, after = null, y = 0, steps = 0;
    for (let k = 0; k < 60; k++) {
      await pg.waitForTimeout(300);
      const t = await T(); tc = t.find((x) => x.t === 'Tap to continue' && x.d >= 60);
      const card = t.find((x) => /^(Let's go!|Got it|OK|Continue|Thank you!|Nice!|Okay!|Not now)$/.test(x.t) && x.d >= 60);
      if (card) { steps++; await pg.touchscreen.tap(card.x, card.y); continue; }
      if (!tc) break;
      await pg.waitForTimeout(1300);
      before = await st(); y = process.env.TAP === 'center' ? H / 2 : tc.y;
      await pg.touchscreen.tap(W / 2, y);
      if (variant !== 'touch') { await pg.mouse.move(W / 2, y); await pg.mouse.down(); await pg.mouse.up(); }
      await pg.waitForTimeout(1500); after = await st(); steps++;
      if (after.mode === 'play') break;
    }
    if (!after || after.mode !== 'play') { out.push(`${W}x${H} rm=${rm} last-step [${variant}]: arrival did not end (${after?.mode})`); continue; }
    tc = { last: (await T()).length };
    const moved = Math.hypot(after.pos.x - before.pos.x, after.pos.y - before.pos.y) > 0.01; const run = /Game/.test(after.scenes) || (await pg.evaluate(() => window.game.scene.getScene('Dojo').leaving)); total++; if (moved || run) bad++;
    out.push(`${W}x${H} rm=${rm} last-step [${variant}]: last of ${steps} taps pos ${JSON.stringify(before.pos)} -> ${JSON.stringify(after.pos)} scenes=${after.scenes} mode=${after.mode} => ${moved || run ? 'FAIL (moved/run)' : 'ok'}`);
  }
  if (!saw) out.push(`${W}x${H} rm=${rm}: no 'Tap to continue' seen`);
  if (process.env.SHOTS) await pg.screenshot({ path: `${process.env.SHOTS}/arrival-${W}x${H}-rm-${rm}.png` });
  await ctx.close();
}
console.log(out.join('\n')); console.log(`(c) ${total - bad}/${total} Tap to continue taps left the hero still with no run`); await b.close();
