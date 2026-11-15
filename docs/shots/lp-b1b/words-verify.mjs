// LP-B1b verify-ui-shots: the My Path words in the Dojo (tour card, button, wall label, grown-ups hint) and the promotion summary.
// Usage: OUT=/workspace/shots/lp-b1b PORT=5173 node docs/shots/lp-b1b/words-verify.mjs
import { chromium } from 'playwright';
import fs from 'fs';
const PW = JSON.parse(fs.readFileSync(process.env.PATH_JSON || new URL('../../../content/settings/path.json', import.meta.url), 'utf8'));

const PORT = process.env.PORT || '5173';
const OUT = process.env.OUT || '/workspace/shots/lp-b1b';
fs.mkdirSync(OUT, { recursive: true });
const sizes = process.env.ONLY ? [process.env.ONLY.split("x").map(Number)] : [[667, 375], [932, 430], [844, 390]];
const students = [
  ['2-white-belt-3-signoffs', 'white', 'Self-Defense #2', 'Reach level 2 in the Tower'],
  ['4-green-belt', 'green', 'Self-Defense #18', 'Reach level'],
];
const rows = [];
const check = (where, name, ok, info = '') => rows.push(`${ok ? 'PASS' : 'FAIL'}  ${where}  ${name}${info ? '  (' + info + ')' : ''}`);

const b = await chromium.launch();

async function open(W, H, rm, student, intro = false) {
  const ctx = await b.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1, hasTouch: true, isMobile: true });
  await ctx.addInitScript(([s, k]) => {
    if (!sessionStorage.getItem('lpb1-init')) {
      localStorage.clear();
      sessionStorage.setItem('lpb1-init', '1');
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
  return { ctx, pg };
}

const sceneTexts = (pg, key, minDepth = -1) => pg.evaluate(([key, minDepth]) => {
  const h = window.game.scene.getScene(key);
  const o = [];
  const w = (l, vis, d) => { for (const c of l) { const dd = d ?? c.depth; const v = vis && c.visible !== false && (c.alpha ?? 1) > 0; if (c.list) w(c.list, v, dd); if (c.type === 'Text' && c.text && v && dd >= minDepth) { const b = c.getBounds(); o.push({ t: c.text, x: b.x, y: b.y, w: b.width, h: b.height, cx: b.centerX, cy: b.centerY }); } } };
  w(h.children.list, true);
  return o;
}, [key, minDepth]);
const fits = (tx, W, H) => tx.filter((t) => !(t.x >= -1 && t.y >= -1 && t.x + t.w <= W + 1 && t.y + t.h <= H + 1)).map((t) => t.t.slice(0, 30));
const overlaps = (tx) => {
  const lap = [];
  for (let i = 0; i < tx.length; i++) for (let j = i + 1; j < tx.length; j++) {
    const a = tx[i], c = tx[j];
    const ox = Math.min(a.x + a.w, c.x + c.w) - Math.max(a.x, c.x);
    const oy = Math.min(a.y + a.h, c.y + c.h) - Math.max(a.y, c.y);
    if (ox > 2 && oy > 2) lap.push(`${a.t.slice(0, 20)}~${c.t.slice(0, 20)}`);
  }
  return lap;
};
const keys = (pg) => pg.evaluate(() => window.game.scene.getScenes(true).map((s) => s.scene.key));

for (const [W, H] of sizes) {
  for (const rm of ['1', '0']) {
    const where = `${W}x${H} rm=${rm}`;
    const { ctx, pg } = await open(W, H, rm, '4-green-belt');
    // A player past the tutorial, on a first Home Dojo visit (fresh room, so the tour card shows).
    await pg.evaluate(() => {
      const k = 'dojo-ascent-profile-v1';
      const p = JSON.parse(localStorage.getItem(k) || '{}');
      p.runsPlayed = Math.max(5, p.runsPlayed || 0);
      p.runsStarted = Math.max(5, p.runsStarted || 0);
      p.guideStep = 99;
      p.pathIntroSeen = true;
      p.creedSeen = true;
      delete p.dojo;
      localStorage.setItem(k, JSON.stringify(p));
      localStorage.removeItem('dojo-ascent-run-in-progress');
      const g = window.game;
      g.scene.getScenes(true).forEach((s) => g.scene.stop(s.scene.key));
      g.scene.start('Dojo');
    });
    await pg.waitForTimeout(800);
    // First visit: the tour card.
    let card = [];
    for (let i = 0; i < 30 && !card.some((t) => t.t.replace(/\s+/g, " ").includes(PW.tourDoor)); i++) {
      if ((await keys(pg)).includes('Dojo')) card = await sceneTexts(pg, 'Dojo', 50);
      const bow = (await sceneTexts(pg, 'Dojo')).find((t) => t.t === 'Bow');
      if (bow) { await pg.touchscreen.tap(bow.cx, bow.cy); await pg.waitForTimeout(2500); }
      await pg.waitForTimeout(300);
    }
    check(where, 'tour card says the Path line, then the door line', card.some((t) => t.t.replace(/\s+/g, " ").includes(`${PW.tourBoard} ${PW.tourDoor}`)), card.map((t) => t.t.slice(0, 40)).join(' | '));
    check(where, 'tour card on screen, no overlaps', fits(card, W, H).length === 0 && overlaps(card).length === 0, [...fits(card, W, H), ...overlaps(card)].join(','));
    if (rm === '1') await pg.screenshot({ path: `${OUT}/tour-${W}x${H}.png` });
    await pg.evaluate(() => { const d = window.game.scene.getScene('Dojo'); d.children.list.filter((c) => c.depth >= 50).forEach((c) => c.destroy()); d.mode = 'walk'; });
    await pg.waitForTimeout(400);
    // The Dojo: My Path button and wall label.
    const tx = await sceneTexts(pg, 'Dojo');
    const btnT = tx.find((t) => t.t === PW.dojoButton);
    const rects = await pg.evaluate(() => window.game.scene.getScene('Dojo').uiRects.map((r) => ({ x: r.x, y: r.y, w: r.width, h: r.height })));
    const host = btnT && rects.find((r) => btnT.cx > r.x && btnT.cx < r.x + r.w && btnT.cy > r.y && btnT.cy < r.y + r.h);
    // The drawn button is 80 wide; its words need room inside it.
    check(where, 'My Path button: words fit inside it', !!host && btnT.w <= 80 - 12 && btnT.x >= host.x, JSON.stringify({ btnT, host }));
    // The wall label sits on the back wall: pan up to it.
    const wall = await pg.evaluate((label) => {
      const d = window.game.scene.getScene('Dojo');
      const o = [];
      const w = (l) => { for (const c of l) { if (c.list) w(c.list); if (c.type === 'Text' && c.text === label) o.push(c); } };
      w(d.children.list);
      const t = o[0];
      if (!t) return null;
      const cam = d.cameras.main;
      cam.stopFollow();
      cam.setScroll(t.getBounds().centerX - cam.width / 2 / cam.zoom, t.getBounds().y - 80);
      return true;
    }, PW.dojoWallLabel);
    await pg.waitForTimeout(200);
    const near = await pg.evaluate((label) => {
      const d = window.game.scene.getScene('Dojo');
      const cam = d.cameras.main;
      const o = [];
      const w = (l) => { for (const c of l) { if (c.list) w(c.list); if (c.type === 'Text' && c.text && c.visible !== false && c.scrollFactorX !== 0) { const b = c.getBounds(); o.push({ t: c.text, x: (b.x - cam.scrollX) * cam.zoom, y: (b.y - cam.scrollY) * cam.zoom, w: b.width * cam.zoom, h: b.height * cam.zoom }); } } };
      w(d.children.list);
      return o;
    }, PW.dojoWallLabel);
    const wl = near.find((t) => t.t === PW.dojoWallLabel);
    check(where, 'MY PATH wall label is drawn, on screen when panned to', !!wall && !!wl && fits([wl], W, H).length === 0, JSON.stringify(wl));
    if (rm === '1') await pg.screenshot({ path: `${OUT}/wall-${W}x${H}.png` });
    check(where, 'no Board words left in the Dojo', !tx.some((t) => /^Board$|^BOARD$/.test(t.t)));
    check(where, 'Dojo words do not overlap', overlaps(tx).length === 0, overlaps(tx).join(', '));
    if (rm === '1') await pg.screenshot({ path: `${OUT}/dojo-${W}x${H}.png` });
    // Grown-ups hint (Testing panel).
    await pg.evaluate(() => window.game.scene.getScene('Dojo').openTesting());
    await pg.waitForTimeout(300);
    const panel = await sceneTexts(pg, 'Dojo', 90);
    check(where, 'grown-ups hint shown, on screen', panel.some((t) => t.t === PW.adultProfilesHint) && fits(panel.filter((t) => t.t === PW.adultProfilesHint), W, H).length === 0);
    check(where, 'Testing panel: no overlaps', overlaps(panel).length === 0, overlaps(panel).join(', '));
    if (rm === '1') await pg.screenshot({ path: `${OUT}/testing-${W}x${H}.png` });
    // The hint's steps work: My Path, Board, title 5 times.
    await pg.evaluate(() => { const g = window.game; g.scene.getScenes(true).forEach((s) => g.scene.stop(s.scene.key)); g.scene.start('Home'); });
    await pg.waitForTimeout(700);
    await pg.evaluate(() => { const h = window.game.scene.getScene('Home'); h.children.list.filter((c) => c.depth >= 90).forEach((c) => c.destroy()); h.celebrating = false; h.setView('board'); });
    await pg.waitForTimeout(400);
    const title = await pg.evaluate(() => { const h = window.game.scene.getScene('Home'); const t = h.input._list.find((o) => o.type === 'Text' && o.listenerCount?.('pointerup')); const b = t.getBounds(); return { x: b.centerX, y: b.centerY }; });
    for (let i = 0; i < 5; i++) { await pg.touchscreen.tap(title.x, title.y); await pg.waitForTimeout(120); }
    await pg.waitForTimeout(400);
    const adult = await sceneTexts(pg, 'Home', 60);
    check(where, 'Board title 5 taps opens the grown-ups screen', adult.length > 0, adult.map((t) => t.t.slice(0, 20)).join(' | '));
    // Promotion summary: the powers line.
    await pg.evaluate(() => {
      const k = 'dojo-ascent-profile-v1';
      const p = JSON.parse(localStorage.getItem(k));
      const t = window.game.scene.getScene('Home').training;
      const signed = [...t.requirements, ...t.stances.map((s) => s.requirement)].filter((r) => r.signedOff).map((r) => r.id);
      const stripes = t.virtues.flatMap((v) => v.earned.map((s) => `${s.word}|${s.belt}|${s.earnedOn}`));
      p.seen = { studentId: t.studentId, belt: 'orange', tier: 3, signed, stripes, approved: t.gate.sealLit };
      p.creedSeen = true;
      localStorage.setItem(k, JSON.stringify(p));
      const g = window.game;
      g.scene.getScenes(true).forEach((s) => g.scene.stop(s.scene.key));
      g.scene.start('Home');
    });
    await pg.waitForTimeout(800);
    let sum = [];
    for (let i = 0; i < 40; i++) {
      sum = await sceneTexts(pg, 'Home', 100);
      if (sum.some((t) => t.t === `${PW.powersNew} ${PW.powersWhere}`) && sum.some((t) => t.t === 'Tap to continue')) break;
      await pg.touchscreen.tap(W / 2, H - 20);
      await pg.waitForTimeout(300);
    }
    check(where, 'summary powers line from path.json', sum.some((t) => t.t === `${PW.powersNew} ${PW.powersWhere}`), sum.map((t) => t.t.slice(0, 30)).join(' | '));
    check(where, 'summary on screen, no overlaps', fits(sum, W, H).length === 0 && overlaps(sum).length === 0, [...fits(sum, W, H), ...overlaps(sum)].join(','));
    if (rm === '1') await pg.screenshot({ path: `${OUT}/summary-${W}x${H}.png` });
    check(where, 'no page errors', pg.errs.length === 0, pg.errs.join('; '));
    await ctx.close();
  }
}
await b.close();
fs.writeFileSync(`${OUT}/results.txt`, rows.join('\n') + '\n');
const fails = rows.filter((r) => r.startsWith('FAIL'));
console.log(fails.join('\n'));
console.log(`${rows.length - fails.length} pass, ${fails.length} fail`);
process.exit(fails.length ? 1 : 0);
