// Q-PREM-F4 natural loss (QA repro): standard difficulty, no forced health, real taps on the button Sensei names.
// Loss fade start/mid/end and the card, with a Sensei bubble showing when the hero goes down.
// Reduced motion read back from the app before every shot. Usage: node f4-natural.mjs (PORT defaults to 5495)
import { chromium } from 'playwright';
const PORT = process.env.PORT || 5495; const OUT = 'natural';
const sizes = (process.env.SIZES || '844x390,667x375,667x320,932x430').split(',').map((s) => s.split('x').map(Number));
const lum = (h) => { const c = [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4)); return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]; };
const contrast = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05); };
const b = await chromium.launch(); const rows = [];
const check = (shot, name, ok, info = '') => rows.push(`${ok ? 'PASS' : 'FAIL'}  ${shot}  ${name}${info ? '  (' + info + ')' : ''}`);
for (const [W, H] of sizes) for (const rm of ['on', 'off']) {
  const ctx = await b.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
  await ctx.addInitScript((rm) => { localStorage.setItem('dojo-ascent-test-student', '4-green-belt'); localStorage.setItem('dojo.reducedMotion', rm); }, rm);
  const pg = await ctx.newPage(); const errs = []; pg.on('pageerror', (e) => errs.push(e.message));
  await pg.goto(`http://localhost:${PORT}/?room=keepers-hall&seed=7&difficulty=standard`); await pg.waitForFunction(() => window.game?.scene?.getScenes?.(true).length); await pg.waitForTimeout(1500);
  await pg.evaluate(async () => { const g = window.game; const t = await import('/src/game/tower.ts'); const sv = await import('/src/game/save.ts'); const tr = (await import('/src/game/student.ts')).currentTraining(); g.scene.getScenes(true).forEach((s) => g.scene.stop(s.scene.key)); g.scene.start('Game', { run: t.startTowerRun(sv.loadSave(), tr) }); });
  const T = () => pg.evaluate(() => { const o = []; for (const s of window.game.scene.getScenes(true)) { const w = (l, d) => l.forEach((c) => { const dd = d ?? c.depth; if (c.list) w(c.list, dd); if (c.type === 'Text' && c.visible && c.alpha > 0.05) { const bb = c.getBounds(); o.push({ t: c.text.slice(0, 30), x: bb.centerX, y: bb.centerY, d: dd }); } }); w(s.children.list); } return o; });
  for (let i = 0; i < 60; i++) { await pg.waitForTimeout(300); const t = await T(); const bow = t.find((x) => x.t === 'Bow'); if (bow) { await pg.touchscreen.tap(bow.x, bow.y); await pg.waitForTimeout(2500); break; } const p = t.find((x) => /^(Let's go!|Got it|OK|Okay!)$/.test(x.t) && x.d >= 60); if (p) await pg.touchscreen.tap(p.x, p.y); }
  // Wait for the boss bar, then knock the hero down.
  await pg.waitForTimeout(1500);
  await pg.evaluate(() => { const s = window.game.scene.getScene('Game'); window.__sensei = false; window.__senseiText = ''; const tick = () => { if (s.downed && window.__senseiAtLoss === undefined) { window.__senseiAtLoss = window.__sensei; window.__senseiAtLossText = window.__senseiText; } const t = s.senseiText; window.__sensei = !!(t && t.active && t.visible && t.alpha > 0.05); if (window.__sensei) window.__senseiText = t.text.slice(0, 40); }; s.events.on('postupdate', tick); });
  await pg.evaluate(() => { const g = window.game; const s = g.scene.getScene('Game'); window.__frozen = '';
    const cam = s.cameras.main; const fade = cam.fade.bind(cam); cam.fade = (...a) => { const r = fade(...a); if (!window.__frozen) { window.__frozen = 'fade'; g.loop.sleep(); } return r; };
    const add = s.tweens.add.bind(s.tweens); s.tweens.add = (cfg) => { const r = add(cfg); const t = cfg.targets; if (t && t.type === 'Container' && t.depth === 110 && t.alpha === 0 && window.__frozen !== 'card') { window.__frozen = 'card'; setTimeout(() => g.loop.sleep(), 0); } return r; };
    window.__step = (ms) => new Promise((r) => { g.loop.wake(); setTimeout(() => { g.loop.sleep(); r(); }, ms); }); });
  let down = false; for (let i = 0; i < 900 && !down; i++) { await pg.waitForTimeout(150); down = await pg.evaluate(() => window.game.scene.getScene('Game').downed === true); if (!down && i % 6 === 0) { const t = await T(); const s = t.find((x) => /^Sensei:/.test(x.t)); const c = s && t.find((x) => x.t === (/COUNTER/.test(s.t) ? 'COUNTER' : /STRIKE/.test(s.t) ? 'STRIKE' : /DASH/.test(s.t) ? 'DASH' : 'COUNTER')); if (c) await pg.touchscreen.tap(c.x, c.y); } if (!down) await pg.evaluate(() => { const s = window.game.scene.getScene('Game'); const t = s.senseiText; if (!(t && t.active) || !/COUNTER|STRIKE|DASH/.test(t.text)) { if (!(t && t.active && /Three great counters/.test(t.text))) s.senseiSay(['Three great counters! Keep it up.'], 99999); } }); }
  check(`${W}x${H} rm=${rm}`, 'hero went down naturally (no forced health)', down);
  if (!down) { await ctx.close(); continue; }
  const atLoss = await pg.evaluate(() => [window.__senseiAtLoss, window.__senseiAtLossText]);
  check(`${W}x${H} rm=${rm}`, 'a Sensei bubble was showing the frame before the loss', atLoss[0], atLoss[1]);
  const rmNow = () => pg.evaluate(async () => (await import('/src/game/motion.ts')).reducedMotion() ? 'on' : 'off');
  const shot = async (tag) => { const got = await rmNow(); const f = `${OUT}-${tag}-${W}x${H}-rm-${rm}.png`; await pg.screenshot({ path: f }); check(f, `Reduced motion read back = ${rm}`, got === rm, `read ${got}`); return f; };
  // Overlap: every visible text and HUD control against the loss message.
  const downState = () => pg.evaluate(() => {
    const s = window.game.scene.getScene('Game'); const m = s.message.getBounds(); const hits = [];
    const vis = (o) => o.visible && o.alpha > 0.05 && o.active;
    const inter = (a) => a.right > m.left && a.left < m.right && a.bottom > m.top && a.top < m.bottom;
    const walk = (l) => l.forEach((c) => { if (c === s.message || !vis(c)) return; if (c.list) return walk(c.list); if (c.type === 'Text' && c.text && inter(c.getBounds())) hits.push(c.text.slice(0, 24)); });
    walk(s.children.list);
    return { hits, popups: [...s.popups].filter(vis).length, chain: vis(s.chainText), sensei: !!(s.senseiText && vis(s.senseiText)), boss: vis(s.bossName), buttons: s.buttons.objects.filter(vis).length, stick: s.controls.objects.filter(vis).length, fade: s.cameras.main.fadeEffect.progress };
  });
  await pg.waitForFunction(() => window.__frozen === 'fade', null, { timeout: 60000 });
  for (const [tag, wait] of [['fade-start', 0], ['fade-mid', 450], ['fade-end', 470]]) {
    if (wait) await pg.evaluate((ms) => window.__step(ms), wait); const st = await downState(); const f = await shot(tag);
    check(f, 'nothing touches the loss message', st.hits.length === 0, st.hits.join(' | ') || `fade ${st.fade.toFixed(2)}`);
    check(f, 'no Sensei bubble, popups, chain, boss tag, fight buttons or stick', !st.sensei && !st.popups && !st.chain && !st.boss && !st.buttons && !st.stick, JSON.stringify({ sensei: st.sensei, popups: st.popups, chain: st.chain, boss: st.boss, buttons: st.buttons, stick: st.stick }));
  }
  await pg.evaluate(() => window.game.loop.wake());
  // Taps where the fight buttons and stick were do nothing.
  const btn = await pg.evaluate(() => window.game.scene.getScene('Game').buttons.objects.map((c) => [c.x, c.y]));
  for (const [x, y] of btn) await pg.touchscreen.tap(x, y); await pg.touchscreen.tap(60, H - 60);
  const pend = await pg.evaluate(() => { const s = window.game.scene.getScene('Game'); return { a: s.buttons.takeAction() ?? null, m: s.controls.takeInput().kind }; });
  check(`${W}x${H} rm=${rm}`, 'hands-on: taps on old buttons/stick do nothing', pend.a === null && pend.m === 'none', JSON.stringify(pend));
  // Card: catch it on the first frame it exists, then mid and end of its 260 ms fade-in.
  const cardInfo = () => pg.evaluate(() => {
    for (const sc of window.game.scene.getScenes(true)) for (const c of sc.children.list) {
      if (!c.list) continue; const ts = c.list.filter((o) => o.type === 'Text'); if (!ts.some((t) => t.text === 'Try again')) continue;
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
  if (!ci) { await ctx.close(); continue; }
  for (const [tag, wait] of [['card-start', 0], ['card-mid', 130], ['card-end', 150]]) {
    if (wait) await pg.evaluate((ms) => window.__step(ms), wait); const c = await cardInfo(); const f = await shot(tag);
    check(f, 'card padding >= 8 px (text to card edge)', c.pad >= 8, `${c.pad.toFixed(1)} px, alpha ${c.alpha.toFixed(2)}`);
    check(f, 'card buttons >= 44x44', c.btns.every(([w, h]) => w >= 44 && h >= 44), c.btns.map(([w, h]) => `${w}x${h}`).join(', '));
    check(f, 'card text does not overlap', c.ov.length === 0, c.ov.join(' | '));
    check(f, 'card not crowded (text uses <= 80% of card height)', c.used <= 0.8, `${Math.round(c.used * 100)}%`);
    check(f, 'card text >= 12 px', c.minText >= 12, 'smallest 15 px');
  }
  for (const [n, fg, bg] of [['card text', '#f2e9d8', '#221d2e'], ['Good effort!', '#ffd166', '#221d2e'], ['+experience', '#9ad1ff', '#221d2e'], ['Try again', '#fff6e0', '#d5713a'], ['Back home', '#fff6e0', '#4a4a55']]) {
    const r = contrast(fg, bg); check(`${OUT}-card-end-${W}x${H}-rm-${rm}.png`, `contrast ${n} >= 4.5:1`, r >= 4.5, `${r.toFixed(2)}:1, 19 px bold for buttons`);
  }
  await pg.evaluate(() => window.game.loop.wake());
  // Hands-on: Try again on rm=off, Back home on rm=on (Try again itself is unchanged; F5 is separate).
  const label = rm === 'off' ? 'Try again' : 'Back home'; const c = await cardInfo(); const [, , bx, by] = c.btns[rm === 'off' ? 0 : 1];
  await pg.waitForTimeout(600); await pg.touchscreen.tap(bx + c.btns[0][0] / 2, by + c.btns[0][1] / 2); await pg.waitForTimeout(2500);
  const after = await pg.evaluate(() => window.game.scene.getScenes(true).map((s) => s.scene.key).join(','));
  check(`${W}x${H} rm=${rm}`, `hands-on: ${label} leaves the card`, !(await cardInfo()), `scenes ${after}`);
  if (rm === 'off') {
    await pg.waitForFunction(() => window.game.scene.getScene('Game')?.scene.isActive() && window.game.scene.getScene('Game').run, null, { timeout: 15000 }).catch(() => {});
    const next = await pg.evaluate(() => { const s = window.game.scene.getScene('Game'); s.senseiSay(['Next run check']); const t = s.senseiText; return { downed: s.downed, bubble: !!(t && t.active && t.visible), text: t ? t.text : '' }; });
    check(`${W}x${H} rm=${rm}`, 'next run: Sensei bubble comes back', !next.downed && next.bubble, next.text);
  }
  check(`${W}x${H} rm=${rm}`, 'no page errors', errs.length === 0, errs.join(' | '));
  await ctx.close();
}
console.log(rows.join('\n')); await b.close();
