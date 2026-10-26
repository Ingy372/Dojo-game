// Q-PREM-F10 verify-ui-shots (from F8's): stat tile number and label >= 4 px apart, nothing overlaps
// (tile texts, icons, the New for you sparkle and its label/icon), text >= 12, and F8's checks kept
// (nothing tappable within 8 px above Again!, 12 px measured).
// 4 sizes x Reduced motion on/off; start/mid/end frames of the panel swap; a scrolled frame when the
// panel scrolls; padding, tap size, contrast, clipping, overlap, an 8 px tap gap; hands-on taps 2-6 px above
// Again! (must open nothing) and on Again! (starts a run).
// Run from apps/client: npx vite --port 5502, then `PORT=5502 node f10-verify.mjs > verify-log.txt`.
import { chromium } from 'playwright';
const PORT = process.env.PORT || 5497; const OUT = 'f10';
const sizes = (process.env.SIZES || '844x390,667x375,667x320,932x430').split(',').map((s) => s.split('x').map(Number));
const rows = []; const check = (where, what, ok, info = '') => rows.push(`${ok ? 'PASS' : 'FAIL'}  ${where}  ${what}${info ? `  (${info})` : ''}`);
const lum = (hex) => { const v = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)); return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2]; };
const contrast = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
const b = await chromium.launch();
for (const [W, H] of sizes) for (const rm of ['on', 'off']) {
  const where = `${W}x${H} rm=${rm}`;
  const ctx = await b.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
  await ctx.addInitScript((k) => { if (!sessionStorage.getItem('init')) { localStorage.clear(); sessionStorage.setItem('init', '1'); } localStorage.setItem('dojo-ascent-test-student', '4-green-belt'); localStorage.setItem('dojo.reducedMotion', k); }, rm);
  const pg = await ctx.newPage(); const errs = []; pg.on('pageerror', (e) => errs.push(String(e))); pg.on('console', (m) => { if (m.type() === 'error') errs.push('console: ' + m.text()); });
  await pg.goto(`http://localhost:${PORT}/`); await pg.waitForFunction(() => window.game?.scene?.getScenes?.(true).length); await pg.waitForTimeout(2000);
  await pg.evaluate(() => { const g = window.game; g.scene.getScenes(true).forEach((s) => g.scene.stop(s.scene.key)); g.scene.start('Home'); }); await pg.waitForTimeout(2500);
  // A cleared 9-room run with found items; open Gear first so the Last run swap animates in.
  await pg.evaluate(() => { const h = window.game.scene.getScene('Home'); h.children.list.filter((c) => c.depth >= 90).forEach((c) => c.destroy()); h.celebrating = false;
    const results = Array.from({ length: 9 }, () => ({ kind: 'fight', grade: 'A' }));
    h.profile.lastRun = { summary: { result: 'cleared', roomsCleared: 9, totalRooms: 9, results, items: (h.profile.inventory || []).slice(0, 4), perfects: 7, bestCombo: 12, ticks: 60 * 260, sGrades: 4, insights: [], decorations: ['training-mat'], decorationColours: [], defeated: [], test: false, tier: 1, tutorial: false }, newBests: [], xp: { gained: 180, blessed: false, catchUp: false, levelsGained: 0, atCap: false }, earned: [] };
    h.tab = 'gear'; h.render(); });
  await pg.waitForTimeout(1200);
  const rmNow = () => pg.evaluate(async () => (await import('/src/game/motion.ts')).reducedMotion() ? 'on' : 'off');
  // Measure: Again! hit zone, the panel, the scroll window, other visible texts and taps (clipped to the window).
  const measure = () => pg.evaluate(() => {
    const h = window.game.scene.getScene('Home'); const pb = h.panelBox; const foot = h.runFooter;
    const win = { top: pb.top + 4, bottom: pb.top + pb.panelH - 4 - (h.panelScroll ? foot : 0) };
    const r = (bb) => ({ l: bb.left, t: bb.top, r: bb.right, b: bb.bottom });
    let again = null, againText = null; const texts = [], zones = [];
    const walk = (l, inContent) => { for (const c of l) { if (!c.visible) continue; if (c === h.panelContent) { walk(c.list, true); continue; } if (c.list) { const hasAgain = c.list.some((o) => o.type === 'Text' && o.text === 'Again!'); walk(c.list, inContent); continue; }
      if (c.type === 'Text' && c.alpha > 0.05) { if (c.text === 'Again!') againText = { ...r(c.getBounds()), size: parseFloat(c.style.fontSize), color: c.style.color }; else texts.push({ t: c.text.slice(0, 20), inContent, size: parseFloat(c.style.fontSize), ...r(c.getBounds()) }); }
      if (c.type === 'Zone' && c.input) zones.push({ inContent, ...r(c.getBounds()) }); } };
    walk(h.panel.list, false);
    // The Again! zone: the input zone whose box holds the Again! text.
    if (againText) again = zones.find((z) => !z.inContent && z.l <= againText.l && z.r >= againText.r && z.t <= againText.t && z.b >= againText.b) || null;
    const clip = (o) => (o.inContent ? { ...o, t: Math.max(o.t, win.top), b: Math.min(o.b, win.bottom) } : o);
    const hit = (a, z) => a && z.b > z.t && a.r > z.l && a.l < z.r && a.b > z.t && a.t < z.b;
    const overl = again ? [...texts.map(clip).filter((t) => hit(again, t)).map((t) => t.t), ...zones.filter((z) => z !== again).map(clip).filter((z) => hit(again, z)).map((z) => `zone@${Math.round(z.t)}`)] : ['no Again!'];
    // Crowding: clear space between Again! and the nearest content above it (in the window).
    const above = [...texts, ...zones.filter((z) => z !== again)].map(clip).filter((o) => o.b > o.t && again && o.r > again.l && o.l < again.r && o.b <= again.t + 0.5);
    const tapsAbove = zones.filter((z) => z !== again).map(clip).filter((o) => o.b > o.t && again && o.r > again.l && o.l < again.r && o.b <= again.t + 0.5);
    const tapGap = again ? Math.min(...tapsAbove.map((o) => again.t - o.b), 999) : -1;
    const gapAbove = again ? Math.min(...above.map((o) => again.t - o.b), 999) : -1;
    const lowest = Math.max(...[...texts, ...zones].filter((o) => o.inContent).map((o) => o.b));
    // Q-PREM-F10: each stat tile's number, label and icon; the New for you card's label, icon and stars.
    const R = (o) => { const bb = o.getBounds(); return { l: bb.left, t: bb.top, r: bb.right, b: bb.bottom }; };
    const all = []; const flat = (l) => { for (const c of l) { if (!c.visible) continue; all.push(c); if (c.list) flat(c.list); } }; flat(h.panel.list);
    const nums = all.filter((c) => c.type === 'Text' && c.getData('stat'));
    const tiles = nums.map((n) => { const nb = R(n); const lab = all.filter((c) => c.type === 'Text' && !c.getData('stat') && c.getBounds().right > nb.l && c.getBounds().left < nb.r && c.getBounds().top > nb.t && c.getBounds().top < nb.b + 30).sort((a, b) => a.getBounds().top - b.getBounds().top)[0];
      const icon = all.find((c) => c.getData && c.getData('statIcon') === n.getData('stat'));
      return { key: n.getData('stat'), num: nb, numSize: parseFloat(n.style.fontSize), lab: lab ? R(lab) : null, labText: lab?.text, icon: icon ? R(icon) : null }; });
    const nfc = all.find((c) => c.list && c.getData && c.getData('newForYou'));
    let nfy = null;
    if (nfc) { const kids = nfc.list.filter((o) => o.visible); const vis = nfc;
      nfy = { card: R(vis), text: kids.filter((o) => o.type === 'Text' && o.text).map((o) => ({ s: o.text, ...R(o), size: parseFloat(o.style.fontSize) })), stars: all.filter((o) => o.type === 'Star' && o.getData('sparkle')).map(R), heads: all.filter((o) => o.visible && o.getBounds && o.type !== 'Star' && o.type !== 'Container' && o.type !== 'Zone' && (o.type !== 'Text' || o.text) && o !== h.panelContent && o.getBounds().width < 200).map((o) => ({ s: o.text, ...R(o) })), icons: kids.filter((o) => o.getBounds && o.type !== 'Text' && o.type !== 'Star' && o.type !== 'Zone' && o !== vis && !(o.getData && o.getData('newForYou'))).map(R) }; }
    return { tiles, nfy, tileH: h.lastRunTileH, panel: { l: pb.rx, t: pb.top, r: pb.rx + pb.rw, b: pb.top + pb.panelH }, win, again, againText, overl, gapAbove, tapGap, minText: Math.min(...texts.map((t) => t.size), againText ? againText.size : 99), scroll: h.panelScroll ? { y: h.panelScroll.y, max: h.panelScroll.max } : null, lowest, contentY: h.panelContent.y, panelX: h.panel.x };
  });
  // Contrast: sample the button colour beside the label from the real screenshot.
  const sample = async (file, x, y) => pg.evaluate(async ([src, x, y]) => { const img = new Image(); img.src = src; await img.decode(); const c = document.createElement('canvas'); c.width = img.width; c.height = img.height; const g = c.getContext('2d'); g.drawImage(img, 0, 0); const d = g.getImageData(Math.round(x * 2), Math.round(y * 2), 1, 1).data; return '#' + [d[0], d[1], d[2]].map((v) => v.toString(16).padStart(2, '0')).join(''); }, [file, x, y]);
  const shot = async (tag, opts = {}) => {
    const got = await rmNow(); const f = `${OUT}-${tag}-${W}x${H}-rm-${rm}.png`; const buf = await pg.screenshot({ path: f });
    check(f, `Reduced motion read back = ${rm}`, got === rm, `read ${got}`);
    const m = await measure(); const a = m.again;
    check(f, 'Again! is there and tappable', !!a);
    if (!a) return m;
    const dx = m.panelX; // the swap slides the whole panel; edges move with it
    check(f, 'Again! fully inside the visible panel (not clipped)', a.t >= m.panel.t + 4 && a.b <= m.panel.b - 4 && a.l >= m.panel.l + dx && a.r <= m.panel.r + dx, `zone y ${a.t.toFixed(1)}-${a.b.toFixed(1)}, panel ${m.panel.t}-${m.panel.b}`);
    check(f, 'Again! >= 8 px from the panel edge (right, bottom)', m.panel.r + dx - a.r >= 8 && m.panel.b - a.b >= 8, `right ${(m.panel.r + dx - a.r).toFixed(1)}, bottom ${(m.panel.b - a.b).toFixed(1)}`);
    check(f, 'Again! tap >= 44x44', a.r - a.l >= 44 && a.b - a.t >= 44, `${Math.round(a.r - a.l)}x${Math.round(a.b - a.t)}`);
    check(f, 'text >= 12 px', m.minText >= 12, `smallest ${m.minText} px`);
    check(f, 'nothing overlaps Again!', m.overl.length === 0, m.overl.join(' | '));
    check(f, 'not crowded: >= 4 px clear above Again!', m.gapAbove >= 4, `${m.gapAbove === 999 ? 'nothing above' : m.gapAbove.toFixed(1) + ' px'}`);
    check(f, 'Q-PREM-F8: nothing tappable within 8 px above Again!', m.tapGap >= 8, `${m.tapGap === 999 ? 'no tap above' : m.tapGap.toFixed(1) + ' px'}`);
    // Q-PREM-F10 checks.
    const ov = (a, c) => a && c && a.r > c.l + 0.5 && a.l < c.r - 0.5 && a.b > c.t + 0.5 && a.t < c.b - 0.5;
    check(f, 'stat tiles found', m.tiles.length >= 4, `${m.tiles.length}`);
    for (const t of m.tiles) {
      const gap = t.lab ? t.lab.t - t.num.b : -99;
      check(f, `tile ${t.key}: >= 4 px between number and label`, gap >= 4, `${gap.toFixed(1)} px (number ${t.numSize} px, label "${t.labText}")`);
      check(f, `tile ${t.key}: number text >= 12 px`, t.numSize >= 12, `${t.numSize}`);
      if (t.icon) check(f, `tile ${t.key}: icon overlaps nothing`, !ov(t.icon, t.num) && !ov(t.icon, t.lab));
    }
    if (m.nfy) {
      const lab = m.nfy.text[0];
      check(f, 'New for you: sparkle found', m.nfy.stars.length >= 2, `${m.nfy.stars.length}`);
      check(f, 'New for you: sparkle overlaps no text (any panel text or picture)', m.nfy.stars.every((st) => m.nfy.heads.every((x) => !ov(st, x))), `${m.nfy.heads.length} things checked, ` + 'label ' + m.nfy.text.map((x) => JSON.stringify(x.s)).join('/') + ', stars ' + m.nfy.stars.map((x) => [x.l, x.r, x.t, x.b].map(Math.round)).join(';'));
      check(f, 'New for you: sparkle overlaps no icon', m.nfy.stars.every((st) => m.nfy.icons.every((x) => !ov(st, x))), `${m.nfy.stars.length} stars, ${m.nfy.icons.length} icon`);
      check(f, 'New for you: label and icon do not overlap', m.nfy.icons.every((x) => m.nfy.text.every((y) => !ov(x, y))));
      check(f, 'New for you: label inside the card', m.nfy.text.every((x) => x.l >= m.nfy.card.l && x.r <= m.nfy.card.r && x.t >= m.nfy.card.t && x.b <= m.nfy.card.b), lab ? `"${lab.s}"` : '');
      check(f, 'New for you: label text >= 12 px', m.nfy.text.every((x) => x.size >= 12));
    } else check(f, 'New for you card shown', false);
    check(f, 'Q-PREM-F8: >= 12 px clear above Again!', m.gapAbove >= 12, `${m.gapAbove.toFixed(1)} px`);
    if (opts.contrast) { const dataUrl = 'data:image/png;base64,' + buf.toString('base64'); const bg = await sample(dataUrl, m.againText.l - 6, (m.againText.t + m.againText.b) / 2); const r = contrast(m.againText.color, bg); check(f, 'Again! label contrast >= 4.5:1', r >= 4.5, `${m.againText.color} on ${bg} = ${r.toFixed(2)}:1`); }
    return m;
  };
  // Freeze the loop and step the swap by hand for exact start/mid/end frames.
  const swapMs = rm === 'on' ? await pg.evaluate(async () => (await import('/src/ui/tokens.ts')).MOTION.reducedFade.ms) : await pg.evaluate(async () => (await import('/src/ui/tokens.ts')).MOTION.swap.ms);
  await pg.evaluate(() => { const g = window.game; g.loop.sleep(); window.__t = performance.now(); window.__step = (ms) => { for (let k = 0; k < Math.ceil(ms / 16); k++) { window.__t += 16; g.step(window.__t, 16); } }; window.game.scene.getScene('Home').setTab('run'); window.__step(16); });
  await shot('swap-start');
  await pg.evaluate((ms) => window.__step(ms), Math.round(swapMs / 2)); await shot('swap-mid');
  await pg.evaluate((ms) => window.__step(ms), swapMs); const end = await shot('swap-end', { contrast: true });
  await pg.evaluate(() => window.game.loop.wake()); await pg.waitForTimeout(400);
  // Hands-on (Q-PREM-F8): a touch 2, 4 and 6 px above Again! opens nothing.
  const highTaps = async (label, a) => { for (const d of [2, 4, 6]) {
    const before = await pg.evaluate(() => { const h = window.game.scene.getScene('Home'); return JSON.stringify({ tab: h.tab, part: h.part, n: h.panel.list.length, sheet: !!h.cubbySheet, sc: window.game.scene.getScenes(true).map((s) => s.scene.key).join(',') }); });
    await pg.touchscreen.tap((a.l + a.r) / 2, a.t - d); await pg.waitForTimeout(700);
    const after = await pg.evaluate(() => { const h = window.game.scene.getScene('Home'); return JSON.stringify({ tab: h.tab, part: h.part, n: h.panel.list.length, sheet: !!h.cubbySheet, sc: window.game.scene.getScenes(true).map((s) => s.scene.key).join(',') }); });
    check(`${where}`, `hands-on ${label}: tap ${d} px above Again! opens nothing`, before === after, after);
  } };
  await highTaps('not scrolled', end.again);
  let tapAt = end.again;
  if (end.scroll) {
    // Scroll all the way: Again! stays put and the last row shows in the window above it.
    await pg.evaluate(() => { const h = window.game.scene.getScene('Home'); h.panelScroll.to(h.panelScroll.max); }); await pg.waitForTimeout(300);
    const m = await shot('scrolled', { contrast: true });
    check(`${where}`, 'scrolled: Again! did not move', m.again && Math.abs(m.again.t - end.again.t) < 0.5, `${m.again?.t.toFixed(1)} vs ${end.again.t.toFixed(1)}`);
    check(`${where}`, 'scrolled: the last row of the contents shows above Again!', m.lowest + m.contentY - end.contentY <= m.win.bottom + 0.5 || m.lowest <= m.win.bottom + 0.5, `lowest ${m.lowest.toFixed(1)}, window bottom ${m.win.bottom.toFixed(1)}`);
    tapAt = m.again;
    await highTaps('scrolled to the end', m.again);
    await pg.evaluate(() => { const h = window.game.scene.getScene('Home'); h.panelScroll.to(h.panelScroll.max / 2); }); await pg.waitForTimeout(300);
    const mid = await measure();
    check(`${where}`, 'Q-PREM-F8 scrolled halfway: nothing tappable within 8 px above Again!', mid.tapGap >= 8, `${mid.tapGap === 999 ? 'no tap above' : mid.tapGap.toFixed(1) + ' px'}`);
    await highTaps('scrolled halfway', mid.again);
    await pg.evaluate(() => { const h = window.game.scene.getScene('Home'); h.panelScroll.to(h.panelScroll.max); }); await pg.waitForTimeout(300);
  } else check(`${where}`, 'panel fits: nothing scrolls', true, 'no scroll');
  // Hands-on: tap Again! (scrolled to the bottom when it scrolls) and a run starts.
  await pg.touchscreen.tap((tapAt.l + tapAt.r) / 2, (tapAt.t + tapAt.b) / 2); await pg.waitForFunction(() => { const k = window.game.scene.getScenes(true).map((s) => s.scene.key).join(','); return /Game/.test(k) && !/Home/.test(k); }, null, { timeout: 6000 }).catch(() => {});
  const sc = await pg.evaluate(() => window.game.scene.getScenes(true).map((s) => s.scene.key).join(','));
  check(`${where}`, 'hands-on: Again! starts a run', /Game/.test(sc) && !/Home/.test(sc), `scenes ${sc}`);
  check(`${where}`, 'no page errors', errs.length === 0, errs.join(' | '));
  await ctx.close();
}
console.log(rows.join('\n')); console.log(`\n${rows.filter((r) => r.startsWith('PASS')).length} PASS, ${rows.filter((r) => r.startsWith('FAIL')).length} FAIL`); await b.close();
