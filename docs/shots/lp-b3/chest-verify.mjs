// LP-B3 verify-ui-shots: the Class Chest card in the Dojo, gear in the bag, and the best-streak aura (Dojo and Tower).
// Usage: OUT=/workspace/shots/lp-b3 PORT=5173 node docs/shots/lp-b3/chest-verify.mjs
import { chromium } from 'playwright';
import fs from 'fs';
const CW = JSON.parse(fs.readFileSync(process.env.CHEST_JSON || new URL('../../../content/settings/class-chest.json', import.meta.url), 'utf8'));

const PORT = process.env.PORT || '5173';
const OUT = process.env.OUT || '/workspace/shots/lp-b3';
fs.mkdirSync(OUT, { recursive: true });
const sizes = process.env.ONLY ? [process.env.ONLY.split("x").map(Number)] : [[667, 375], [932, 430], [844, 390]];
const rows = [];
const check = (where, name, ok, info = '') => rows.push(`${ok ? 'PASS' : 'FAIL'}  ${where}  ${name}${info ? '  (' + info + ')' : ''}`);

const b = await chromium.launch();

async function open(W, H, rm, student, intro = false) {
  const ctx = await b.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1, hasTouch: true, isMobile: true });
  await ctx.addInitScript(([s, k]) => {
    if (!sessionStorage.getItem('lpb3-init')) {
      localStorage.clear();
      sessionStorage.setItem('lpb3-init', '1');
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


// Restart the Dojo with a profile edit (a fresh visit, past the tutorial).
const restartDojo = (pg, edit) => pg.evaluate((edit) => {
  const k = 'dojo-ascent-profile-v1';
  const p = JSON.parse(localStorage.getItem(k) || '{}');
  p.runsPlayed = Math.max(5, p.runsPlayed || 0);
  p.runsStarted = Math.max(5, p.runsStarted || 0);
  p.guideStep = 99;
  p.pathIntroSeen = true;
  p.creedSeen = true;
  Object.assign(p, edit);
  localStorage.setItem(k, JSON.stringify(p));
  localStorage.removeItem('dojo-ascent-run-in-progress');
  const g = window.game;
  g.scene.getScenes(true).forEach((s) => g.scene.stop(s.scene.key));
  g.scene.start('Dojo');
}, edit);
const profile = (pg) => pg.evaluate(() => JSON.parse(localStorage.getItem('dojo-ascent-profile-v1')));
const hasAura = (pg, key) => pg.evaluate((key) => window.game.scene.getScene(key).player.list[0]?.type === 'Graphics', key);
// Tap through arrival cards (bow, welcome back) until the Class Chest card shows, or none is left.
async function chestCard(pg) {
  for (let i = 0; i < 30; i++) {
    const tx = await sceneTexts(pg, 'Dojo', 70);
    if (tx.some((t) => t.t === CW.title || /Class Chests!$/.test(t.t))) return tx;
    const btn = tx.find((t) => /^(Bow|Let's go!|Let's clean up|Okay!|Thank you!|OK)$/.test(t.t));
    const bow = (await sceneTexts(pg, 'Dojo')).find((t) => t.t === 'Bow');
    const tap = btn || bow;
    if (tap) { await pg.touchscreen.tap(tap.cx, tap.cy); await pg.waitForTimeout(tap === bow ? 2500 : 500); }
    else await pg.waitForTimeout(300);
  }
  return [];
}

for (const [W, H] of sizes) {
  for (const rm of ['1', '0']) {
    const where = `${W}x${H} rm=${rm}`;
    const { ctx, pg } = await open(W, H, rm, '3-yellow-belt');
    // Every check-in in the feed is new, and the class pieces are 2 from the end: chests hold 2 pieces, then gear.
    const before = (await profile(pg)).inventory?.length ?? 0;
    await restartDojo(pg, { decorEarning: { classesCounted: 0, countedCheckIns: [], classPiecesGiven: 11, given: [] }, bestStreakWeeks: 0 });
    await pg.waitForTimeout(800);
    const want = await pg.evaluate(() => new Set(window.game.scene.getScene('Dojo').training.classCheckIns.map((c) => c.slice(0, 10))).size);
    const card = await chestCard(pg);
    const title = want === 1 ? CW.title : CW.titleMany.replace('{n}', want);
    check(where, `chest card title: ${title}`, card.some((t) => t.t === title), card.map((t) => t.t.slice(0, 30)).join(' | '));
    check(where, 'chest card says where it came from', card.some((t) => t.t.includes(CW.line)));
    const body = card.map((t) => t.t).join('\n');
    check(where, 'chest card lists the dojo pieces and the gear', body.includes(CW.decor.split('{')[0]) && body.includes(CW.gear.split('{')[0]) && body.includes(CW.storage));
    check(where, 'chest card on screen, no overlaps', card.length > 0 && fits(card, W, H).length === 0 && overlaps(card).length === 0, [...fits(card, W, H), ...overlaps(card)].join(','));
    if (rm === '1') await pg.screenshot({ path: `${OUT}/chest-${W}x${H}.png` });
    const ok = card.find((t) => t.t === CW.button);
    if (ok) await pg.touchscreen.tap(ok.cx, ok.cy);
    await pg.waitForTimeout(600);
    const p = await profile(pg);
    check(where, `${want} chests: gear for the rest went into the bag`, (p.inventory?.length ?? 0) - before === Math.max(0, want - 2), `${before} -> ${p.inventory?.length}`);
    check(where, 'best streak saved from the feed (14 weeks)', p.bestStreakWeeks === 14, String(p.bestStreakWeeks));
    check(where, 'aura around the hero in the Dojo', await hasAura(pg, 'Dojo'));
    // Close what is left of the arrival (celebrations, cards), then look at the hero.
    for (let i = 0; i < 25 && (await pg.evaluate(() => window.game.scene.getScene('Dojo').mode)) !== 'play'; i++) {
      const b2 = (await sceneTexts(pg, 'Dojo', 70)).find((t) => /^(Okay!|Thank you!|Let's go!|OK|Continue|Bow)$/.test(t.t));
      if (b2) await pg.touchscreen.tap(b2.cx, b2.cy);
      else await pg.touchscreen.tap(W / 2, H * 0.8);
      await pg.waitForTimeout(700);
    }
    await pg.waitForTimeout(1500);
    if (rm === '1') await pg.screenshot({ path: `${OUT}/aura-dojo-${W}x${H}.png` });
    if (rm === '1') {
      const c = await pg.evaluate(() => { const s = window.game.scene.getScene('Dojo'); const b = s.player.getBounds(); const cam = s.cameras.main; return { x: (b.centerX - cam.scrollX) * cam.zoom, y: (b.centerY - cam.scrollY) * cam.zoom }; });
      await pg.screenshot({ path: `${OUT}/aura-dojo-close-${W}x${H}.png`, clip: { x: Math.max(0, c.x - 80), y: Math.max(0, c.y - 80), width: 160, height: 160 } });
    }

    // A bigger best from before stays: the feed's 14 weeks never shrinks it.
    await restartDojo(pg, { bestStreakWeeks: 30 });
    await pg.waitForTimeout(1200);
    check(where, 'a lower streak now never lowers the best', (await profile(pg)).bestStreakWeeks === 30);
    check(where, 'no chest card when no class is new', (await sceneTexts(pg, 'Dojo', 70)).every((t) => !/Class Chest/.test(t.t)));

    // The Tower practice room shows the aura too.
    await pg.evaluate(() => {
      const g = window.game;
      g.scene.getScenes(true).forEach((s) => g.scene.stop(s.scene.key));
      g.scene.start('Game');
    });
    await pg.waitForTimeout(1500);
    // Bow at the door (the button covers the hero until then).
    for (const k of await keys(pg)) {
      const bowT = (await sceneTexts(pg, k)).find((t) => t.t === 'Bow');
      if (bowT) { await pg.touchscreen.tap(bowT.cx, bowT.cy); await pg.waitForTimeout(2500); break; }
    }
    check(where, 'aura around the hero in the Tower', await hasAura(pg, 'Game'));
    if (rm === '1') await pg.screenshot({ path: `${OUT}/aura-tower-${W}x${H}.png` });
    if (rm === '1') {
      const c = await pg.evaluate(() => { const s = window.game.scene.getScene('Game'); const b = s.player.getBounds(); const cam = s.cameras.main; return { x: (b.centerX - cam.scrollX) * cam.zoom, y: (b.centerY - cam.scrollY) * cam.zoom }; });
      await pg.screenshot({ path: `${OUT}/aura-tower-close-${W}x${H}.png`, clip: { x: Math.max(0, c.x - 80), y: Math.max(0, c.y - 80), width: 160, height: 160 } });
    }
    check(where, 'no page errors', pg.errs.length === 0, pg.errs.join(' / '));
    await ctx.close();

    // A student with no streak yet: no aura, and nothing about streaks shows.
    const fresh = await open(W, H, rm, '1-white-belt-new');
    await restartDojo(fresh.pg, {});
    await fresh.pg.waitForTimeout(1200);
    check(where, 'no streak yet: no aura', !(await hasAura(fresh.pg, 'Dojo')));
    await fresh.ctx.close();
  }
}
await b.close();
fs.writeFileSync(`${OUT}/results.txt`, rows.join('\n') + '\n');
console.log(rows.join('\n'));
console.log(`${rows.filter((r) => r.startsWith('PASS')).length} pass, ${rows.filter((r) => r.startsWith('FAIL')).length} fail`);
