// Q-PREM-F9 verify-ui-shots: readable COUNTER/STRIKE/VIRTUE faces, and 44 pt Dojo top buttons.
// 4 sizes x Reduced motion on/off. Fight: each button ready, not ready, and COUNTER's flash, pixel-sampled
// face vs label colour; hands-on touches land on each button. Dojo: Decorate start/mid/end frames, the
// Done row and the second row (Street Smarts, Journal, Scroll): heights, gaps, padding, text, contrast;
// hands-on Done closes Decorate and Street Smarts opens its scene.
// Run from apps/client: npx vite --port 5501; then `PORT=5501 node f9-verify.mjs > verify-log.txt`.
import { chromium } from 'playwright';
const PORT = process.env.PORT || 5501;
const sizes = (process.env.SIZES || '667x320,667x375,844x390,932x430').split(',').map((s) => s.split('x').map(Number));
const rows = []; const check = (where, what, ok, info = '') => rows.push(`${ok ? 'PASS' : 'FAIL'}  ${where}  ${what}${info ? `  (${info})` : ''}`);
const lum = (hex) => { const v = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)); return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2]; };
const contrast = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
const b = await chromium.launch();
const sampler = (pg) => async (buf, x, y) => pg.evaluate(async ([src, x, y]) => { const img = new Image(); img.src = src; await img.decode(); const c = document.createElement('canvas'); c.width = img.width; c.height = img.height; const g = c.getContext('2d'); g.drawImage(img, 0, 0); const d = g.getImageData(Math.round(x * 2), Math.round(y * 2), 1, 1).data; return '#' + [d[0], d[1], d[2]].map((v) => v.toString(16).padStart(2, '0')).join(''); }, ['data:image/png;base64,' + buf.toString('base64'), x, y]);
const newPage = async (W, H, rm, url) => {
  const ctx = await b.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
  await ctx.addInitScript((k) => { if (!sessionStorage.getItem('init')) { localStorage.clear(); sessionStorage.setItem('init', '1'); } localStorage.setItem('dojo-ascent-test-student', '4-green-belt'); localStorage.setItem('dojo.reducedMotion', k); }, rm);
  const pg = await ctx.newPage(); const errs = []; pg.on('pageerror', (e) => errs.push(String(e))); pg.on('console', (m) => { if (m.type() === 'error') errs.push('console: ' + m.text()); });
  await pg.goto(`http://localhost:${PORT}${url}`); await pg.waitForFunction(() => window.game?.scene?.getScenes?.(true).length); await pg.waitForTimeout(3000);
  const rmNow = await pg.evaluate(async () => ((await import('/src/game/motion.ts')).reducedMotion() ? 'on' : 'off'));
  return { ctx, pg, errs, rmNow };
};

for (const [W, H] of sizes) for (const rm of ['on', 'off']) {
  // ---- Fight: the action buttons ----
  {
    const where = `fight ${W}x${H} rm=${rm}`;
    const { ctx, pg, errs, rmNow } = await newPage(W, H, rm, '/?room=training');
    check(where, `Reduced motion read back = ${rm}`, rmNow === rm, `read ${rmNow}`);
    for (let i = 0; i < 2; i++) { await pg.touchscreen.tap(W / 2, H * 0.9); await pg.waitForTimeout(2500); }
    const ok = await pg.waitForFunction(() => window.game.scene.getScene('Game')?.buttons, null, { timeout: 15000 }).then(() => true, () => false);
    check(where, 'Game scene with action buttons', ok);
    if (ok) {
      const sample = sampler(pg);
      // Freeze the loop; style the buttons for a state, then stop update() from overwriting it.
      await pg.evaluate(() => { const g = window.game; g.loop.sleep(); window.__t = performance.now(); window.__step = (n) => { for (let k = 0; k < n; k++) { window.__t += 16; g.step(window.__t, 16); } }; const s = g.scene.getScene('Game'); window.__upd = s.buttons.update.bind(s.buttons); s.buttons.update = () => {}; });
      const states = { ready: { downTicks: 0, guardTicks: 0, counterLockout: 0, focus: 999, virtueTicks: 0, dashCooldown: 0, stanceCooldown: 0 }, 'not-ready': { downTicks: 0, guardTicks: 30, counterLockout: 30, focus: 0, virtueTicks: 0, dashCooldown: 20, stanceCooldown: 20 }, lockout: { downTicks: 0, guardTicks: 0, counterLockout: 5, focus: 999, virtueTicks: 0, dashCooldown: 0, stanceCooldown: 0 }, flash: { downTicks: 0, guardTicks: 0, counterLockout: 0, focus: 999, virtueTicks: 0, window: true } };
      for (const [st, over] of Object.entries(states)) {
        const info = await pg.evaluate((o) => { const s = window.game.scene.getScene('Game'); const B = s.buttons; const p = { ...s.world.players[s.me], ...o }; for (let k = 0; k < 40; k++) { B.counterWindow(!!o.window); window.__upd(p); if (!o.window || B.counter.face.fillColor === 0x6fa8ff) break; s.time.now += 35; } window.__step(1);
          const out = {}; for (const k of ['counter', 'strike', 'virtue', 'dash', 'stance']) { const btn = B[k]; if (!btn) continue; const lb = btn.label.getBounds(); const m = btn.container.getWorldTransformMatrix(); out[k] = { ring: k === 'counter' ? B.counterRing.commandBuffer.length : 0, color: btn.label.style.color, size: parseFloat(btn.label.style.fontSize), l: lb.left, t: lb.top, r: lb.right, b: lb.bottom, cx: m.tx, cy: m.ty, r0: btn.radius, alpha: btn.container.alpha, fill: btn.face.fillColor.toString(16).padStart(6, '0') }; } return out; }, over).catch((e) => ({ err: String(e) }));
        if (info.err) { check(where, `state ${st}`, false, info.err); continue; }
        const file = `f9-fight-${st}-${W}x${H}-rm-${rm}.png`; const buf = await pg.screenshot({ path: file });
        for (const [k, v] of Object.entries(info)) {
          if ((st === 'flash' || st === 'lockout') && k !== 'counter') continue;
          if (st === 'lockout') check(file, `COUNTER lockout: dim face #${v.fill} and a refill ring`, v.fill === '2e3c55' && v.ring > 0, `ring cmds ${v.ring}`);
          if (st === 'ready' && k === 'counter') check(file, 'COUNTER ready: no lockout ring', v.ring === 0);
          const bg = await sample(buf, (v.l + v.r) / 2, v.t - 3); const r = contrast(v.color, bg);
          check(file, `${k.toUpperCase()} ${st}: label ${v.color} on face (sampled ${bg}, fill #${v.fill}) >= 4.5:1`, r >= 4.5, `${r.toFixed(2)}:1`);
          check(file, `${k.toUpperCase()} ${st}: solid (container alpha 1), text >= 12 px, tap >= 44`, v.alpha === 1 && v.size >= 12 && v.r0 * 2 >= 44, `alpha ${v.alpha}, ${v.size} px, ${v.r0 * 2} px`);
          check(file, `${k.toUpperCase()} ${st}: >= 8 px inside the screen`, v.cx - v.r0 >= 8 && v.cx + v.r0 <= W - 8 && v.cy - v.r0 >= 8 && v.cy + v.r0 <= H - 8, `x ${Math.round(v.cx - v.r0)}-${Math.round(v.cx + v.r0)}, y ${Math.round(v.cy - v.r0)}-${Math.round(v.cy + v.r0)}`);
        }
        if (st === 'ready') {
          check(where, 'VIRTUE button present (green belt)', !!info.virtue);
          // Hands-on: touch each button; it registers that action.
          for (const [k, v] of Object.entries(info)) {
            await pg.touchscreen.tap(v.cx, v.cy); const got = await pg.evaluate(() => { const B = window.game.scene.getScene('Game').buttons; const a = B.pending; B.reset(); return a; });
            check(where, `hands-on: touch ${k.toUpperCase()} registers ${k}`, got === k, `got ${got}`);
          }
        }
      }
    }
    check(where, 'no page errors', errs.length === 0, errs.join(' | ').slice(0, 300));
    await ctx.close();
  }
  // ---- Dojo: Decorate's Done row and the second row ----
  {
    const where = `dojo ${W}x${H} rm=${rm}`;
    const { ctx, pg, errs, rmNow } = await newPage(W, H, rm, '/');
    check(where, `Reduced motion read back = ${rm}`, rmNow === rm, `read ${rmNow}`);
    await pg.evaluate(() => { const g = window.game; g.scene.getScenes(true).forEach((s) => g.scene.stop(s.scene.key)); g.scene.start('Dojo'); });
    await pg.waitForTimeout(2500);
    const clearCards = async () => {
    // Bow in (the arrival step), so the Dojo is really in play mode.
    for (let i = 0; i < 8; i++) { const bow = await pg.evaluate(() => { const d = window.game.scene.getScene('Dojo'); let r = null; const walk = (l) => { for (const c of l) { if (c.list) walk(c.list); else if (c.type === 'Text' && ['Bow', "Let's go!", 'OK', 'Got it', 'Got it!', 'Thank you!', 'Thanks!', 'Continue', 'Next'].includes(c.text) && c.visible && (!c.parentContainer || c.parentContainer.visible)) { const bb = c.getBounds(); r = [bb.centerX, bb.centerY]; } } }; walk(d.children.list); return r; });
      if (!bow) break; await pg.touchscreen.tap(bow[0], bow[1]); await pg.waitForTimeout(1800); }
    };
    await clearCards();
    await pg.waitForFunction(() => window.game.scene.getScene('Dojo')?.mode === 'play', null, { timeout: 20000 }).catch(() => {});
    await pg.waitForTimeout(800);
    // Close any first-time card so the top bar is what's on screen.
    await pg.evaluate(() => { const d = window.game.scene.getScene('Dojo'); d.children.list.filter((c) => c.depth >= 90).forEach((c) => c.destroy());
      // Open the second row (Street Smarts, Journal, Scroll) as an existing student who has met them; pick a move style.
      d.profile.welcomeWeek = { existing: false, introduced: [] }; if (d.mode !== 'decorate') d.mode = 'play'; d.moveStyle = 'tap'; d.renderUi(); });
    await pg.waitForTimeout(600); await clearCards(); await pg.evaluate(() => { const d = window.game.scene.getScene('Dojo'); d.profile.welcomeWeek = { existing: false, introduced: [] }; if (d.mode !== 'decorate') d.mode = 'play'; d.renderUi(); }); await pg.waitForTimeout(300);
    const sample = sampler(pg);
    const measure = (labels) => pg.evaluate((labels) => {
      const d = window.game.scene.getScene('Dojo'); const out = {}; const zones = d.input._list.filter((o) => o.visible !== false && o.input?.enabled !== false && o.getBounds).map((o) => o.getBounds());
      const walk = (l) => { for (const c of l) { if (!c.visible) continue; if (c.list) walk(c.list); else if (c.type === 'Text' && labels.some((t) => c.text.startsWith(t))) { const lb = c.getBounds(); const z = zones.filter((z) => z.contains(lb.centerX, lb.centerY) && z.width < 300).sort((a, b) => a.width * a.height - b.width * b.height)[0];
        // The drawn face: the smallest Graphics/Rectangle around the label is hard to get; use the zone (roundButton's zone = the face, at least 44).
        out[c.text] = { color: c.style.color, size: parseFloat(c.style.fontSize), l: lb.left, t: lb.top, r: lb.right, b: lb.bottom, zone: z ? { l: z.left, t: z.top, r: z.right, b: z.bottom } : null }; } } };
      walk(d.children.list); return { out, zones: zones.map((z) => ({ l: z.left, t: z.top, r: z.right, b: z.bottom })), mode: d.mode };
    }, labels);
    const btnCheck = async (file, buf, m, names) => {
      for (const n of names) {
        const k = Object.keys(m.out).find((t) => t.startsWith(n)); const v = k && m.out[k];
        if (!v) { check(file, `${n} shows`, false); continue; }
        const z = v.zone; check(file, `${n}: tap zone >= 44 tall and wide`, z && z.b - z.t >= 44 && z.r - z.l >= 44, z ? `${Math.round(z.r - z.l)}x${Math.round(z.b - z.t)}` : 'no zone');
        // The drawn face height: scan the screenshot column beside the label for the face's colour run.
        const face = await sample(buf, v.l - 4, (v.t + v.b) / 2);
        let top = (v.t + v.b) / 2, bot = top; while (top > 0 && (await sample(buf, v.l - 4, top - 1)) === face) top--; while (bot < H && (await sample(buf, v.l - 4, bot + 1)) === face) bot++;
        // The fill run inside the 1 px outline reads 42 for a 44 face (an old 32 face reads 30).
        check(file, `${n}: drawn button >= 44 px tall`, bot - top + 1 >= 41 && z && z.b - z.t >= 44, `fill ~${Math.round(bot - top + 1)} px inside the outline, zone ${z ? Math.round(z.b - z.t) : '-'} px`);
        const r = contrast(v.color, face); check(file, `${n}: label ${v.color} on sampled ${face} >= 4.5:1`, r >= 4.5, `${r.toFixed(2)}:1`);
        check(file, `${n}: text >= 12 px`, v.size >= 12, `${v.size} px`);
        check(file, `${n}: >= 8 px from the screen edges`, z && z.t >= 8 - 0.5 && z.r <= W - 8 + 0.5 && z.l >= 8 - 0.5, z ? `top ${z.t.toFixed(1)}, right ${(W - z.r).toFixed(1)}` : '');
      }
      // No two tap zones overlap (rows 1 and 2 used to: 2-50 vs 40-84).
      const zs = m.zones.filter((z) => z.r - z.l < 300 && z.t < 140); let bad = [];
      for (let i = 0; i < zs.length; i++) for (let j = i + 1; j < zs.length; j++) { const a = zs[i], c = zs[j]; if (a.l < c.r && a.r > c.l && a.t < c.b && a.b > c.t) bad.push(`${Math.round(a.l)},${Math.round(a.t)} x ${Math.round(c.l)},${Math.round(c.t)}`); }
      check(file, 'top tap zones do not overlap', bad.length === 0, bad.join(' | '));
    };
    const play = await measure(['Board', 'Decorate', 'Street', 'Monster', 'Scroll', 'Journal']);
    let file = `f9-dojo-play-${W}x${H}-rm-${rm}.png`; let buf = await pg.screenshot({ path: file });
    const row2 = Object.keys(play.out).filter((t) => !['Board', 'Decorate'].some((x) => t.startsWith(x)));
    check(file, 'second-row buttons found', row2.length > 0, row2.join(', '));
    await btnCheck(file, buf, play, row2);
    // Decorate: start/mid/end frames of the switch.
    await pg.evaluate(() => window.game.scene.getScene('Dojo').setDecorating(true));
    for (const [f, ms] of [['start', 0], ['mid', 150], ['end', 1050]]) {
      await pg.waitForTimeout(ms); file = `f9-dojo-decorate-${f}-${W}x${H}-rm-${rm}.png`; buf = await pg.screenshot({ path: file });
    }
    // QA SMALL: the top wall (wall decorations) sits below the 60 px Decorate bar, even scrolled to the top.
    const wallTop = await pg.evaluate(async () => { const d = window.game.scene.getScene('Dojo'); d.panned = true; d.cam = { x: d.cam.x, y: -50 }; d.updateCamera(true); return d.offY; });
    check(file, 'Decorate: room top (wall row 0) at or below the 60 px bar', wallTop >= 60 - 0.5, `room top y ${wallTop.toFixed(1)}`);
    const wallPick = await pg.evaluate(() => { const d = window.game.scene.getScene('Dojo'); const t = d.zoom * 48; return { y: d.offY + 0.5 * t, t }; }).catch(() => null);
    if (wallPick) { check(file, 'Decorate: wall row 0 is clear of the bar (row centre below 60)', wallPick.y > 60, `row 0 centre y ${wallPick.y.toFixed(1)}`); }
    const dec = await measure(['Done', 'Move:']);
    await btnCheck(file, buf, dec, ['Done', 'Move:']);
    const hint = await pg.evaluate(() => { const d = window.game.scene.getScene('Dojo'); let h = null; const walk = (l) => { for (const c of l) { if (c.list) walk(c.list); else if (c.type === 'Text' && /Tap a decoration|arrows|tap where/.test(c.text)) h = c.getBounds().top; } }; walk(d.children.list); return h; });
    const doneB = dec.out.Done?.zone?.b ?? 0; check(file, 'hint sits below the Done row (>= 8 px)', hint !== null && hint - doneB >= 8, `hint top ${hint}, Done bottom ${doneB.toFixed?.(1)}`);
    // Hands-on: Done closes Decorate.
    if (dec.out.Done?.zone) { const z = dec.out.Done.zone; await pg.touchscreen.tap((z.l + z.r) / 2, (z.t + z.b) / 2); await pg.waitForTimeout(900); }
    const modeAfter = await pg.evaluate(() => window.game.scene.getScene('Dojo').mode);
    check(where, 'hands-on: Done closes Decorate', modeAfter === 'play', `mode ${modeAfter}`);
    // Hands-on: a touch near the bottom edge of the Street Smarts button opens Street Smarts.
    const st = Object.keys(play.out).find((t) => t.startsWith('Street')); const sz = st && play.out[st].zone;
    if (sz) { await pg.touchscreen.tap((sz.l + sz.r) / 2, sz.b - 4); await pg.waitForTimeout(2500); const sc = await pg.evaluate(() => window.game.scene.getScenes(true).map((s) => s.scene.key).join(',')); check(where, 'hands-on: Street Smarts (touched 4 px above its bottom edge) opens its scene', /StreetSmarts/.test(sc), `scenes ${sc}`); }
    check(where, 'no page errors', errs.length === 0, errs.join(' | ').slice(0, 300));
    await ctx.close();
  }
}
console.log(rows.join('\n')); console.log(`\n${rows.filter((r) => r.startsWith('PASS')).length} PASS, ${rows.filter((r) => r.startsWith('FAIL')).length} FAIL`); await b.close();
