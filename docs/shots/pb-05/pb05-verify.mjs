// PB-05 verify-ui-shots: Fighting Style slot cards on a landscape phone.
// Hands-on taps, 44 pt targets, Seal swap, Lock, Kata placeholder, New dots, Reduced motion.
// Usage: OUT=/opt/cursor/artifacts/pb-05 PORT=5173 node docs/shots/pb-05/pb05-verify.mjs
import { chromium } from 'playwright';
import fs from 'fs';

const PORT = process.env.PORT || '5173';
const OUT = process.env.OUT || '/opt/cursor/artifacts/pb-05';
fs.mkdirSync(OUT, { recursive: true });
const sizes = [[844, 390], [667, 375]];
const profiles = [
  ['2-white-belt-3-signoffs', 'white'],
  ['3-yellow-belt', 'yellow'],
  ['6-orange-typical', 'orange'],
];
const rows = [];
const check = (where, name, ok, info = '') => rows.push(`${ok ? 'PASS' : 'FAIL'}  ${where}  ${name}${info ? '  (' + info + ')' : ''}`);

const b = await chromium.launch();

async function open(W, H, rm, student) {
  const ctx = await b.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1, hasTouch: true, isMobile: true });
  await ctx.addInitScript(([s, k]) => {
    if (!sessionStorage.getItem('pb05-init')) {
      localStorage.clear();
      sessionStorage.setItem('pb05-init', '1');
    }
    localStorage.setItem('dojo-ascent-test-student', s);
    localStorage.setItem('dojo.reducedMotion', k);
  }, [student, rm]);
  const pg = await ctx.newPage();
  pg.errs = [];
  pg.on('pageerror', (e) => pg.errs.push(e.message));
  await pg.goto(`http://127.0.0.1:${PORT}/`);
  await pg.waitForFunction(() => window.game?.scene?.getScenes?.(true).length);
  for (let i = 0; i < 40; i++) {
    const keys = await pg.evaluate(() => window.game.scene.getScenes(true).map((s) => s.scene.key));
    if (keys.includes('Home') || keys.includes('Dojo')) break;
    if (keys.includes('Title')) await pg.touchscreen.tap(W / 2, H / 2);
    if (keys.includes('Create')) {
      const g = await pg.evaluate(() => {
        const o = [];
        for (const s of window.game.scene.getScenes(true)) {
          const w = (l) => { for (const c of l) { if (c.list) w(c.list); if (c.type === 'Text' && c.text && /Let's go/.test(c.text)) { const b = c.getBounds(); o.push({ x: b.centerX, y: b.centerY }); } } };
          w(s.children.list);
        }
        return o[0];
      });
      if (g) await pg.touchscreen.tap(g.x, g.y);
    }
    await pg.waitForTimeout(300);
  }
  await pg.evaluate(() => {
    const k = 'dojo-ascent-profile-v1';
    const p = JSON.parse(localStorage.getItem(k) || '{}');
    p.runsPlayed = Math.max(5, p.runsPlayed || 0);
    p.runsStarted = Math.max(5, p.runsStarted || 0);
    p.guideStep = 99;
    localStorage.setItem(k, JSON.stringify(p));
    localStorage.removeItem('dojo-ascent-run-in-progress');
  });
  await pg.evaluate(() => { const g = window.game; g.scene.getScenes(true).forEach((s) => g.scene.stop(s.scene.key)); g.scene.start('Home'); });
  await pg.waitForTimeout(600);
  await pg.evaluate(() => { const h = window.game.scene.getScene('Home'); h.children.list.filter((c) => c.depth >= 90).forEach((c) => c.destroy()); h.celebrating = false; });
  return { ctx, pg };
}

const lum = (hex) => { const v = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)); return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2]; };
const contrast = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };

const cards = (pg) => pg.evaluate(() => {
  const h = window.game.scene.getScene('Home');
  const out = [];
  const w = (l) => { for (const c of l) { if (!c.getData) continue; const key = c.getData('styleKey'); if (key) { const b = c.getBounds(); out.push({ key, x: b.centerX, y: b.centerY, w: b.width, h: b.height, l: b.left, t: b.top, r: b.right, btm: b.bottom }); } if (c.list) w(c.list); } };
  w(h.children.list);
  return out;
});
const texts = (pg) => pg.evaluate(() => {
  const o = [];
  for (const s of window.game.scene.getScenes(true)) {
    const w = (l) => { for (const c of l) { if (c.list) w(c.list); if (c.type === 'Text' && c.visible && c.text) { const b = c.getBounds(); o.push({ t: c.text, x: b.centerX, y: b.centerY, w: b.width, h: b.height }); } } };
    w(s.children.list);
  }
  return o;
});
const loadout = (pg) => pg.evaluate(() => window.game.scene.getScene('Home').profile.loadout);
const rmNow = (pg) => pg.evaluate(async () => ((await import('/src/game/motion.ts')).reducedMotion() ? 'on' : 'off'));
const dotCount = (pg) => pg.evaluate(() => {
  const h = window.game.scene.getScene('Home');
  let n = 0;
  const w = (l) => { for (const c of l) { if (c.getData?.('newDot')) n++; if (c.list) w(c.list); } };
  w(h.children.list);
  return n;
});

function tapCard(list, key) {
  return list.find((c) => c.key === key);
}

const measure = (pg) => pg.evaluate(() => {
  const h = window.game.scene.getScene('Home');
  const pb = h.panelBox;
  const panel = { l: pb.rx, t: pb.top, r: pb.rx + pb.rw, b: pb.top + pb.panelH };
  const items = [];
  const walk = (list) => {
    for (const c of list) {
      if (!c.visible || c.alpha < 0.05) continue;
      if (c.list) walk(c.list);
      const b = c.getBounds?.();
      if (!b || b.width < 1 || b.height < 1) continue;
      if (b.centerX < panel.l || b.centerX > panel.r || b.centerY < panel.t || b.centerY > panel.b) continue;
      if (c.type === 'Text' && c.text) items.push({ kind: 'text', label: c.text.slice(0, 48), l: b.left, top: b.top, r: b.right, bot: b.bottom, size: parseFloat(c.style.fontSize), color: c.style.color });
      if (c.getData?.('styleKey') || c.getData?.('stylePick') || c.getData?.('styleCancel') || c.getData?.('styleTakeOut') || c.getData?.('trayArrow')) items.push({ kind: 'box', label: c.getData('styleKey') || c.getData('stylePick') || 'control', l: b.left, top: b.top, r: b.right, bot: b.bottom });
    }
  };
  walk(h.children.list);
  const overlap = (a, b) => a.r > b.l + 1 && a.l < b.r - 1 && a.bot > b.top + 1 && a.top < b.bot - 1;
  // Include the Trophy Case / Fighting Style switch. A cutoff under the switch hid its label last time.
  const textsOnly = items.filter((i) => i.kind === 'text');
  const overl = [];
  for (let i = 0; i < textsOnly.length; i++) for (let j = i + 1; j < textsOnly.length; j++) if (overlap(textsOnly[i], textsOnly[j])) overl.push(`${textsOnly[i].label}/${textsOnly[j].label}`);
  const boxes = items.filter((i) => i.kind === 'box');
  const content = [...textsOnly, ...boxes];
  const padOf = (o) => Math.min(o.l - panel.l, panel.r - o.r, o.top - panel.t, panel.b - o.bot);
  const pad = content.length ? Math.min(...content.map(padOf)) : 999;
  const bb = content.reduce((a, o) => ({ l: Math.min(a.l, o.l), top: Math.min(a.top, o.top), r: Math.max(a.r, o.r), bot: Math.max(a.bot, o.bot) }), { l: 1e9, top: 1e9, r: -1e9, bot: -1e9 });
  const area = (panel.r - panel.l) * (panel.b - panel.t);
  const occ = area > 0 ? Math.max(0, bb.r - bb.l) * Math.max(0, bb.bot - bb.top) / area : 0;
  const cardsOnly = boxes.filter((i) => String(i.label).includes(':'));
  let minGap = 999;
  for (let i = 0; i < cardsOnly.length; i++) for (let j = i + 1; j < cardsOnly.length; j++) {
    const a = cardsOnly[i], d = cardsOnly[j];
    const xOver = a.r > d.l && a.l < d.r;
    const yOver = a.bot > d.top && a.top < d.bot;
    if (xOver) minGap = Math.min(minGap, Math.max(0, Math.max(a.top, d.top) - Math.min(a.bot, d.bot)));
    if (yOver) minGap = Math.min(minGap, Math.max(0, Math.max(a.l, d.l) - Math.min(a.r, d.r)));
  }
  return { panel, texts: textsOnly, overl, pad, occ, minGap, minText: Math.min(...textsOnly.map((t) => t.size), 99) };
});

const sample = async (pg, buf, x, y, W, H) => pg.evaluate(async ([src, x, y, W, H]) => {
  const img = new Image(); img.src = src; await img.decode();
  const c = document.createElement('canvas'); c.width = img.width; c.height = img.height;
  const g = c.getContext('2d'); g.drawImage(img, 0, 0);
  const sx = img.width / W, sy = img.height / H;
  const px = Math.max(0, Math.min(img.width - 1, Math.round(x * sx)));
  const py = Math.max(0, Math.min(img.height - 1, Math.round(y * sy)));
  const d = g.getImageData(px, py, 1, 1).data;
  return '#' + [d[0], d[1], d[2]].map((v) => v.toString(16).padStart(2, '0')).join('');
}, ['data:image/png;base64,' + buf.toString('base64'), x, y, W, H]);

async function layoutChecks(pg, tag, W, H) {
  const buf = await pg.screenshot({ path: `${OUT}/${tag}.png` });
  const m = await measure(pg);
  check(tag, 'style content >= 8 px inside the visible panel', m.pad >= 8, `${m.pad.toFixed(1)} px`);
  check(tag, 'no style text overlaps another', m.overl.length === 0, m.overl.slice(0, 4).join(' | '));
  check(tag, 'style text is at least 12 px', m.minText >= 12, `${m.minText} px`);
  check(tag, 'not crowded: card gap >= 4 px and panel occupancy <= 80%', m.minGap >= 4 && m.occ <= 0.8, `gap ${m.minGap === 999 ? 'n/a' : m.minGap.toFixed(1)} px (layout gap is 8, each outline takes 2), occupancy ${(m.occ * 100).toFixed(1)}%`);
  let worst = { r: 99, t: '', fg: '', bg: '' };
  const sampled = await glyphContrast(pg, buf, m.texts, W, H);
  for (const row of sampled) {
    // Icons (a footprint, a sparkle) are not the switch or slot words. Word labels are the check.
    if (!/[A-Za-z]{2,}/.test(row.label)) continue;
    if (!row.fg) { check(tag, `contrast >= 4.5:1 "${row.label}"`, false, 'no solid glyph pixels'); continue; }
    const r = contrast(row.fg, row.bg);
    if (r < worst.r) worst = { r, t: row.label, fg: row.fg, bg: row.bg };
    check(tag, `contrast >= 4.5:1 "${row.label}"`, r >= 4.5, `glyph ${row.fg} on fill ${row.bg} = ${r.toFixed(2)}:1 (${row.n} glyph px)`);
  }
  const switchLabel = sampled.find((row) => /Fighting Style/.test(row.label));
  check(tag, 'selected Fighting Style switch label is in the contrast set', !!switchLabel, switchLabel ? switchLabel.label : 'missing');
  return worst;
}

/** Solid glyph pixels inside each label, against the fill just outside the glyphs. Not the CSS color. */
async function glyphContrast(pg, buf, texts, W, H) {
  return pg.evaluate(async ([src, texts, W, H]) => {
    const img = new Image(); img.src = src; await img.decode();
    const c = document.createElement('canvas'); c.width = img.width; c.height = img.height;
    const g = c.getContext('2d', { willReadFrequently: true });
    g.drawImage(img, 0, 0);
    const sx = img.width / W, sy = img.height / H;
    const data = g.getImageData(0, 0, img.width, img.height).data;
    const at = (x, y) => {
      const px = Math.max(0, Math.min(img.width - 1, Math.round(x * sx)));
      const py = Math.max(0, Math.min(img.height - 1, Math.round(y * sy)));
      const i = (py * img.width + px) * 4;
      return [data[i], data[i + 1], data[i + 2]];
    };
    const q = (p) => p.map((v) => Math.min(255, Math.round(v / 8) * 8)).join(',');
    const hex = (k) => '#' + k.split(',').map((v) => Number(v).toString(16).padStart(2, '0')).join('');
    const out = [];
    for (const t of texts) {
      const bg = new Map();
      const addBg = (x, y) => { if (x < 1 || y < 1 || x > W - 2 || y > H - 2) return; const k = q(at(x, y)); bg.set(k, (bg.get(k) || 0) + 1); };
      for (let x = t.l; x <= t.r; x += 2) { addBg(x, t.top - 4); addBg(x, t.bot + 4); }
      for (let y = t.top; y <= t.bot; y += 2) { addBg(t.l - 4, y); addBg(t.r + 4, y); }
      let bgKey = '', bgN = 0;
      for (const [k, n] of bg) if (n > bgN) { bgKey = k; bgN = n; }
      const bgPx = bgKey ? bgKey.split(',').map(Number) : [0, 0, 0];
      const far = (p) => Math.abs(p[0] - bgPx[0]) + Math.abs(p[1] - bgPx[1]) + Math.abs(p[2] - bgPx[2]) >= 80;
      const lum = (p) => 0.2126 * p[0] + 0.7152 * p[1] + 0.0722 * p[2];
      const glyph = new Map();
      for (let y = Math.ceil(t.top); y <= Math.floor(t.bot); y++) {
        for (let x = Math.ceil(t.l); x <= Math.floor(t.r); x++) {
          const p = at(x, y);
          if (!far(p)) continue;
          const k = q(p);
          glyph.set(k, (glyph.get(k) || 0) + 1);
        }
      }
      // Solid letter cores, not the larger cloud of gray antialiasing. Pick the cluster furthest in brightness from the fill.
      const bgL = lum(bgPx);
      let fgKey = '', fgN = 0, fgFar = -1;
      for (const [k, n] of glyph) {
        if (n < 8) continue;
        const p = k.split(',').map(Number);
        const d = Math.abs(lum(p) - bgL);
        if (d > fgFar) { fgFar = d; fgKey = k; fgN = n; }
      }
      out.push({ label: t.label, fg: fgKey ? hex(fgKey) : '', bg: bgKey ? hex(bgKey) : '', n: fgN });
    }
    return out;
  }, ['data:image/png;base64,' + buf.toString('base64'), texts, W, H]);
}

async function controlHit(pg, dataKey) {
  return pg.evaluate((dataKey) => {
    const h = window.game.scene.getScene('Home');
    let visual = null;
    const w = (l) => { for (const c of l || []) { if (c.getData?.(dataKey)) visual = c; if (c.list) w(c.list); } };
    w(h.children.list);
    if (!visual?.parentContainer) return null;
    const list = visual.parentContainer.list;
    const hit = list[list.indexOf(visual) + 1];
    const b = hit?.getBounds?.();
    const drawn = visual.getBounds();
    return {
      zoneW: b ? +b.width.toFixed(1) : 0,
      zoneH: b ? +b.height.toFixed(1) : 0,
      drawnW: +drawn.width.toFixed(1),
      drawnH: +drawn.height.toFixed(1),
      x: b ? b.centerX : 0,
      y: b ? b.centerY : 0,
    };
  }, dataKey);
}

/** From a closed screen: tap the card, then page, then the pick. Every arrow counts. */
async function equipFromClosed(pg, slotKey, pickId) {
  await pg.evaluate(() => { const h = window.game.scene.getScene('Home'); h.styleSlot = null; h.swapFamily = null; h.styleFocus = null; h.trayPageNo = 0; h.render(); });
  await pg.waitForTimeout(150);
  let taps = 0;
  const cs = await cards(pg);
  const card = cs.find((c) => c.key === slotKey);
  if (!card) return { taps, missing: 'card' };
  await pg.touchscreen.tap(card.x, card.y);
  taps++;
  for (let i = 0; i < 6; i++) {
    const hit = await pg.evaluate((id) => {
      const h = window.game.scene.getScene('Home');
      let box = null;
      const w = (l) => { for (const c of l) { if (c.getData?.('stylePick') === id) { const b = c.getBounds(); box = { x: b.centerX, y: b.centerY }; } if (c.list) w(c.list); } };
      w(h.children.list);
      return box;
    }, pickId);
    if (hit) { await pg.touchscreen.tap(hit.x, hit.y); taps++; return { taps }; }
    const arrow = await pg.evaluate(() => {
      const h = window.game.scene.getScene('Home');
      let box = null;
      const w = (l) => { for (const c of l) { if (c.getData?.('trayArrow') === 'next') { const b = c.getBounds(); box = { x: b.centerX, y: b.centerY }; } if (c.list) w(c.list); } };
      w(h.children.list);
      return box;
    });
    if (!arrow) return { taps, missing: pickId };
    await pg.touchscreen.tap(arrow.x, arrow.y);
    taps++;
    await pg.waitForTimeout(150);
  }
  return { taps, missing: pickId };
}

async function pulseFrames(pg, tag, rm) {
  await pg.evaluate(() => {
    const h = window.game.scene.getScene('Home');
    h.profile.styleSeen = [];
    h.styleHelpUsed = true;
    h.tab = 'abilities'; h.part = 'style'; h.styleSlot = null;
    h.render();
  });
  const dot = () => pg.evaluate(() => {
    const h = window.game.scene.getScene('Home');
    let d = null;
    const w = (l) => { for (const c of l) { if (c.getData?.('newDot')) { const b = c.getBounds(); d = { a: +c.alpha.toFixed(3), x: +b.centerX.toFixed(1), y: +b.centerY.toFixed(1) }; } if (c.list) w(c.list); } };
    w(h.children.list);
    return d;
  });
  const a0 = await dot();
  await pg.screenshot({ path: `${OUT}/${tag}-dot-start.png` });
  await pg.waitForTimeout(350);
  const a1 = await dot();
  await pg.screenshot({ path: `${OUT}/${tag}-dot-mid.png` });
  await pg.waitForTimeout(350);
  const a2 = await dot();
  await pg.screenshot({ path: `${OUT}/${tag}-dot-end.png` });
  const spread = a0 && a1 && a2 ? Math.max(a0.a, a1.a, a2.a) - Math.min(a0.a, a1.a, a2.a) : -1;
  if (rm === 'on') check(tag, 'New dot stays still, Reduced motion, start/mid/end', spread >= 0 && spread < 0.02 && Math.abs(a0.x - a1.x) < 0.6 && Math.abs(a0.y - a2.y) < 0.6, `alpha ${a0?.a},${a1?.a},${a2?.a} y ${a0?.y},${a1?.y},${a2?.y}`);
  else check(tag, 'New dot pulse moves across start/mid/end', spread >= 0.2, `alpha ${a0?.a},${a1?.a},${a2?.a}`);
}

if (process.env.FOCUS !== 'gaps') for (const [W, H] of sizes) for (const rm of ['off', 'on']) {
  let pulsed = false;
  for (const [student, belt] of profiles) {
    const tag = `${belt}-${W}x${H}-rm-${rm}`;
    const { ctx, pg } = await open(W, H, rm, student);
    check(tag, 'Reduced motion read back', (await rmNow(pg)) === rm, await rmNow(pg));
    await pg.evaluate(() => { const h = window.game.scene.getScene('Home'); h.children.list.filter((c) => c.depth >= 90).forEach((c) => c.destroy()); h.celebrating = false; h.tab = 'abilities'; h.part = 'style'; h.styleSlot = null; h.render(); });
    await pg.waitForTimeout(300);
    await pg.screenshot({ path: `${OUT}/${tag}-help.png` });
    const help = (await texts(pg)).some((t) => t.t.includes('Tap a slot, then pick a Seal'));
    check(tag, 'first visit shows the slot help line', help);
    await layoutChecks(pg, `${tag}-cards`, W, H);

    const plan = await pg.evaluate(() => {
      const m = window.game.scene.getScene('Home').styleModel();
      const one = (slot, pred) => m.trays[slot].filter(pred).map((p) => ({ id: p.id, name: p.name, earned: p.earned }));
      return {
        stance: one('stance', (p) => p.earned && p.id !== 'beginners-stance'),
        lockedStance: one('stance', (p) => !p.earned)[0] || null,
        virtue: one('virtue', (p) => p.earned),
        strike: one('strike', (p) => p.earned),
        lockedStrike: one('strike', (p) => !p.earned)[0] || null,
        kata: one('kata', (p) => p.earned),
        seal: one('seal', (p) => p.earned && !p.comingLater),
      };
    });

    if (plan.stance[0]) {
      const taps = await equipFromClosed(pg, 'stance:0', plan.stance[0].id);
      const lo = await loadout(pg);
      check(tag, `Stance ${plan.stance[0].name} equips in <= 3 taps including paging`, !taps.missing && taps.taps <= 3 && lo?.stance === plan.stance[0].id, `${taps.taps} taps, ${lo?.stance}`);
      await pg.screenshot({ path: `${OUT}/${tag}-tray-stance.png` });
    }
    if (plan.lockedStance) {
      const before = (await loadout(pg))?.stance ?? null;
      const taps = await equipFromClosed(pg, 'stance:0', plan.lockedStance.id);
      await pg.waitForTimeout(200);
      const sheet = (await texts(pg)).some((t) => t.t === 'Close' || t.t.includes('Ask Sensei') || t.t.includes('Learn this'));
      const close = (await texts(pg)).find((t) => t.t === 'Close');
      if (close) { await pg.touchscreen.tap(close.x, close.y); await pg.waitForTimeout(200); }
      const after = (await loadout(pg))?.stance ?? null;
      check(tag, `locked stance ${plan.lockedStance.name} does not equip, Close returns`, sheet && after === before && !taps.missing, `taps ${taps.taps}, stance ${after}`);
    }
    if (plan.virtue[0]) {
      const taps = await equipFromClosed(pg, 'virtue:0', plan.virtue[0].id);
      const lo = await loadout(pg);
      check(tag, `Virtue ${plan.virtue[0].name} equips in <= 3 taps including paging`, !taps.missing && taps.taps <= 3 && lo?.virtue === plan.virtue[0].id, `${taps.taps} taps, ${lo?.virtue}`);
    } else check(tag, 'no earned Virtue on this profile', true, 'none to equip');
    for (const s of plan.strike) {
      const taps = await equipFromClosed(pg, 'strike:0', s.id);
      const lo = await loadout(pg);
      const shown = s.id === 'spin-kick' ? (lo?.strike ?? null) === null : lo?.strike === s.id;
      check(tag, `Strike ${s.name} equips in <= 3 taps including paging`, !taps.missing && taps.taps <= 3 && shown, `${taps.taps} taps, strike ${lo?.strike ?? 'spin-kick'}`);
    }
    await pg.screenshot({ path: `${OUT}/${tag}-tray-strike.png` });
    if (plan.lockedStrike) {
      const before = (await loadout(pg))?.strike ?? null;
      const taps = await equipFromClosed(pg, 'strike:0', plan.lockedStrike.id);
      await pg.waitForTimeout(200);
      const close = (await texts(pg)).find((t) => t.t === 'Close');
      const sheet = (await texts(pg)).some((t) => t.t === 'Close' || /Learn this|Ask Sensei/.test(t.t));
      if (close) { await pg.touchscreen.tap(close.x, close.y); await pg.waitForTimeout(200); }
      check(tag, `locked strike ${plan.lockedStrike.name} does not equip, Close returns`, sheet && ((await loadout(pg))?.strike ?? null) === before && !taps.missing, `taps ${taps.taps}`);
    }
    if (plan.kata[0]) {
      await pg.screenshot({ path: `${OUT}/${tag}-tray-kata.png` });
      const taps = await equipFromClosed(pg, 'kata:0', plan.kata[0].id);
      const line = (await texts(pg)).some((t) => t.t.includes('Power coming soon'));
      check(tag, `Kata ${plan.kata[0].name} equips in <= 3 taps and stays a placeholder`, !taps.missing && taps.taps <= 3 && line && (await loadout(pg))?.kata === plan.kata[0].id, `${taps.taps} taps`);
    }
    if (plan.seal[0]) {
      const taps = await equipFromClosed(pg, 'seal:0', plan.seal[0].id);
      check(tag, `Seal ${plan.seal[0].name} equips in <= 3 taps including paging`, !taps.missing && taps.taps <= 3 && ((await loadout(pg))?.seals ?? []).includes(plan.seal[0].id), `${taps.taps} taps`);
      await pg.screenshot({ path: `${OUT}/${tag}-tray-seal.png` });
    }
    if (plan.seal[1]) {
      const taps = await equipFromClosed(pg, 'seal:1', plan.seal[1].id);
      check(tag, `Seal ${plan.seal[1].name} equips in <= 3 taps including paging`, !taps.missing && taps.taps <= 3 && ((await loadout(pg))?.seals ?? []).includes(plan.seal[1].id), `${taps.taps} taps`);
    }
    const lock = await equipFromClosed(pg, 'seal:0', 'lock');
    const later = (await texts(pg)).some((t) => t.t.includes('Coming later'));
    check(tag, 'Lock shows Coming later and is not equipped', !lock.missing && later && !((await loadout(pg))?.seals ?? []).includes('lock'), `${lock.taps} taps`);

    if (belt === 'yellow' && plan.seal[2]) {
      const taps = await equipFromClosed(pg, 'seal:0', plan.seal[2].id);
      await pg.screenshot({ path: `${OUT}/${tag}-swap.png` });
      const asked = (await texts(pg)).some((t) => t.t.includes('Swap with which one'));
      const before = ((await loadout(pg))?.seals ?? []).slice();
      const cancel = await pg.evaluate(() => {
        const h = window.game.scene.getScene('Home'); let box = null;
        const w = (l) => { for (const c of l) { if (c.getData?.('styleCancel')) { const b = c.getBounds(); box = { x: b.centerX, y: b.centerY, w: b.width, h: b.height }; } if (c.list) w(c.list); } };
        w(h.children.list); return box;
      });
      check(tag, 'Cancel is at least 44 pt', !!cancel && cancel.w >= 44 && cancel.h >= 44, cancel ? `${Math.round(cancel.w)}x${Math.round(cancel.h)}` : 'missing');
      if (cancel) { await pg.touchscreen.tap(cancel.x, cancel.y); await pg.waitForTimeout(200); }
      const afterCancel = (await loadout(pg))?.seals ?? [];
      check(tag, 'Cancel leaves the Seals unchanged', asked && afterCancel.join() === before.join(), `${before.join()} -> ${afterCancel.join()}, ${taps.taps} taps to the question`);
      await equipFromClosed(pg, 'seal:0', plan.seal[2].id);
      const cs = await cards(pg);
      const target = cs.find((c) => c.key === 'seal:0');
      if (target) { await pg.touchscreen.tap(target.x, target.y); await pg.waitForTimeout(200); }
      const swapped = (await loadout(pg))?.seals ?? [];
      check(tag, 'the swap itself replaces the tapped Seal', swapped.includes(plan.seal[2].id) && swapped.join() !== before.join(), `${before.join()} -> ${swapped.join()}`);
      const take = await pg.evaluate(() => {
        const h = window.game.scene.getScene('Home'); let box = null;
        const w = (l) => { for (const c of l) { if (c.getData?.('styleTakeOut')) { const b = c.getBounds(); box = { x: b.centerX, y: b.centerY, w: b.width, h: b.height }; } if (c.list) w(c.list); } };
        w(h.children.list); return box;
      });
      // Take out is on the open Seal card. Open seal 0 if the button is not up.
      if (!take) {
        const again = await cards(pg);
        const s0 = again.find((c) => c.key === 'seal:0');
        if (s0) { await pg.touchscreen.tap(s0.x, s0.y); await pg.waitForTimeout(200); }
      }
      const take2 = take || await pg.evaluate(() => {
        const h = window.game.scene.getScene('Home'); let box = null;
        const w = (l) => { for (const c of l) { if (c.getData?.('styleTakeOut')) { const b = c.getBounds(); box = { x: b.centerX, y: b.centerY, w: b.width, h: b.height }; } if (c.list) w(c.list); } };
        w(h.children.list); return box;
      });
      const beforeOut = ((await loadout(pg))?.seals ?? []).slice();
      if (take2) { await pg.touchscreen.tap(take2.x, take2.y); await pg.waitForTimeout(200); }
      const afterOut = (await loadout(pg))?.seals ?? [];
      check(tag, 'Take out removes the open Seal', !!take2 && take2.w >= 44 && take2.h >= 44 && afterOut.length === beforeOut.length - 1, `${beforeOut.join()} -> ${afterOut.join()}`);
    }

    if (!pulsed) { await pulseFrames(pg, tag, rm); pulsed = true; }
    const saved = await loadout(pg);
    await pg.reload({ waitUntil: 'domcontentloaded' });
    await pg.waitForFunction(() => window.game?.scene?.getScenes?.(true).length);
    await pg.waitForTimeout(500);
    const back = await pg.evaluate(() => JSON.parse(localStorage.getItem('dojo-ascent-profile-v1') || '{}').loadout);
    check(tag, 'picks survive a reload', JSON.stringify(back?.seals) === JSON.stringify(saved?.seals) && back?.kata === saved?.kata && back?.stance === saved?.stance && (back?.strike ?? null) === (saved?.strike ?? null), JSON.stringify(back));
    check(tag, 'no page errors', pg.errs.length === 0, pg.errs.join(' | '));
    await ctx.close();
  }
}

/** Local-dev only. Seeds the save the way a dev page can; this is not the deployed Testing-button route. */
if (process.env.FOCUS === 'gaps') {
  const tapText = async (pg, re) => {
    const hit = (await texts(pg)).find((t) => re.test(t.t));
    if (!hit) return false;
    await pg.touchscreen.tap(hit.x, hit.y);
    await pg.waitForTimeout(250);
    return true;
  };
  for (const [W, H] of sizes) for (const rm of ['off', 'on']) {
    const tag = `gap-white-${W}x${H}-rm-${rm}`;
    const { ctx, pg } = await open(W, H, rm, '2-white-belt-3-signoffs');
    check(tag, 'Reduced motion read back', (await rmNow(pg)) === rm, await rmNow(pg));
    await pg.evaluate(() => {
      const h = window.game.scene.getScene('Home');
      h.children.list.filter((c) => c.depth >= 90).forEach((c) => c.destroy());
      h.celebrating = false;
      h.profile.styleHelpSeen = [];
      h.profile.styleSeen = null;
      h.profile.showSlotNote = false;
      h.styleHelpUsed = false;
      h.styleHelpLine = null;
      h.styleTriggers = ['open'];
      h.tab = 'abilities';
      h.part = 'trophy';
      h.styleSlot = null;
      h.render();
    });
    await pg.waitForTimeout(200);
    check(tag, 'tap Fighting Style (ordinary switch)', await tapText(pg, /Fighting Style/));
    await pg.screenshot({ path: `${OUT}/${tag}-help.png` });
    const help = (await texts(pg)).some((t) => t.t.includes('Tap a slot, then pick a Seal'));
    check(tag, 'first visit shows the slot help line', help);
    await layoutChecks(pg, `${tag}-cards`, W, H);

    await pg.evaluate(() => {
      const h = window.game.scene.getScene('Home');
      h.profile.showSlotNote = true;
      h.styleHelpUsed = true;
      h.styleHelpLine = null;
      h.render();
    });
    await pg.waitForTimeout(200);
    await pg.screenshot({ path: `${OUT}/${tag}-got-it.png` });
    check(tag, 'slot note shows Got it', (await texts(pg)).some((t) => t.t === 'Got it'));
    await layoutChecks(pg, `${tag}-note`, W, H);
    check(tag, 'tap Got it', await tapText(pg, /^Got it$/));
    const noted = await pg.evaluate(() => window.game.scene.getScene('Home').profile.showSlotNote);
    check(tag, 'Got it clears the note', noted === false && !(await texts(pg)).some((t) => t.t === 'Got it'), `showSlotNote ${noted}`);

    await pulseFrames(pg, tag, rm);
    const dotShot = fs.readFileSync(`${OUT}/${tag}-dot-start.png`);
    check(tag, 'New-dot start frame is a real PNG', dotShot.length > 1000, `${dotShot.length} bytes`);

    await pg.evaluate(() => {
      const h = window.game.scene.getScene('Home');
      h.styleHelpUsed = true;
      h.styleSlot = null;
      h.swapFamily = null;
      h.render();
    });
    const escape = await equipFromClosed(pg, 'seal:0', 'escape');
    await pg.screenshot({ path: `${OUT}/${tag}-take-out.png` });
    const take = await controlHit(pg, 'styleTakeOut');
    check(tag, 'Take out hit target is at least 44 x 44', !!take && take.zoneW >= 44 && take.zoneH >= 44, take ? `zone ${take.zoneW}x${take.zoneH}, drawn ${take.drawnW}x${take.drawnH}` : 'missing');
    const before = ((await loadout(pg))?.seals ?? []).slice();
    if (take) { await pg.touchscreen.tap(take.x, take.y); await pg.waitForTimeout(250); }
    const after = (await loadout(pg))?.seals ?? [];
    check(tag, 'Take out removes the open White Seal', !escape.missing && escape.taps <= 3 && before.includes('escape') && !after.includes('escape'), `${before.join()} -> ${after.join()}`);
    await pg.reload({ waitUntil: 'domcontentloaded' });
    await pg.waitForFunction(() => window.game?.scene?.getScenes?.(true).length);
    await pg.waitForTimeout(400);
    const kept = await pg.evaluate(() => JSON.parse(localStorage.getItem('dojo-ascent-profile-v1') || '{}').loadout?.seals ?? []);
    check(tag, 'White Seal removal survives a reload', !kept.includes('escape'), kept.join() || '(empty)');

    await ctx.close();

    const yellow = await open(W, H, rm, '3-yellow-belt');
    const ytag = `gap-yellow-${W}x${H}-rm-${rm}`;
    check(ytag, 'Reduced motion read back', (await rmNow(yellow.pg)) === rm, await rmNow(yellow.pg));
    await yellow.pg.evaluate(() => {
      const scene = window.game.scene.getScene('Home');
      scene.children.list.filter((c) => c.depth >= 90).forEach((c) => c.destroy());
      scene.celebrating = false;
      scene.styleHelpUsed = true;
      scene.tab = 'abilities';
      scene.part = 'style';
      scene.styleSlot = null;
      scene.profile.styleSeen = scene.profile.styleSeen || [];
      scene.render();
    });
    await yellow.pg.waitForTimeout(200);
    // Ordinary new-dot path: ids earned on Yellow that a prior White visit did not mark.
    await yellow.pg.evaluate(() => {
      const h = window.game.scene.getScene('Home');
      h.profile.styleSeen = ['beginners-stance', 'cat-stance', 'escape', 'counter'];
      h.styleHelpUsed = true;
      h.render();
    });
    await yellow.pg.waitForTimeout(200);
    const dots = await dotCount(yellow.pg);
    await yellow.pg.screenshot({ path: `${OUT}/${ytag}-new-dots.png` });
    check(ytag, 'a later-earned pick shows a New dot', dots > 0, `${dots} dots`);

    for (const id of ['escape', 'counter']) await equipFromClosed(yellow.pg, id === 'escape' ? 'seal:0' : 'seal:1', id);
    const third = await equipFromClosed(yellow.pg, 'seal:0', 'guard');
    await yellow.pg.screenshot({ path: `${OUT}/${ytag}-cancel.png` });
    const asked = (await texts(yellow.pg)).some((t) => t.t.includes('Swap with which one'));
    const cancel = await controlHit(yellow.pg, 'styleCancel');
    check(ytag, 'Cancel hit target is at least 44 x 44', !!cancel && cancel.zoneW >= 44 && cancel.zoneH >= 44, cancel ? `zone ${cancel.zoneW}x${cancel.zoneH}, drawn ${cancel.drawnW}x${cancel.drawnH}, prompt ${asked}, taps ${third.taps}` : 'missing');
    await yellow.ctx.close();

    const orange = await open(W, H, rm, '6-orange-typical');
    const otag = `gap-orange-${W}x${H}-rm-${rm}`;
    check(otag, 'Reduced motion read back', (await rmNow(orange.pg)) === rm, await rmNow(orange.pg));
    await orange.pg.evaluate(() => {
      const h = window.game.scene.getScene('Home');
      h.children.list.filter((c) => c.depth >= 90).forEach((c) => c.destroy());
      h.celebrating = false;
      h.styleHelpUsed = true;
      h.tab = 'abilities';
      h.part = 'style';
      h.styleSlot = null;
      h.render();
    });
    await orange.pg.waitForTimeout(200);
    await layoutChecks(orange.pg, `${otag}-cards`, W, H);
    await orange.pg.evaluate(() => window.game.scene.getScene('Home').pickSlot('seal', 0));
    await orange.pg.waitForTimeout(200);
    await orange.pg.screenshot({ path: `${OUT}/${otag}-seal-tray.png` });
    await orange.ctx.close();
  }
}

const fails = rows.filter((r) => r.startsWith('FAIL')).length;
const out = `PB-05 verify-ui-shots ${new Date().toISOString()}\n${rows.join('\n')}\n\n${rows.length - fails} PASS, ${fails} FAIL\n`;
fs.writeFileSync(`${OUT}/verify-log.txt`, out);
console.log(out);
await b.close();
process.exit(fails ? 1 : 0);


