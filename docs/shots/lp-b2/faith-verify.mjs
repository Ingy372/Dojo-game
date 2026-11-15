// LP-B2 verify-ui-shots: the faith layer (FAITH DOES banner, Faith page, verse screen, Creed Scroll).
// Usage: OUT=/workspace/shots/lp-b2 PORT=5173 node docs/shots/lp-b2/faith-verify.mjs
import { chromium } from 'playwright';
import fs from 'fs';
const PACK = JSON.parse(fs.readFileSync(new URL('../../../content/faith/action-zone.json', import.meta.url), 'utf8'));

const PORT = process.env.PORT || '5173';
const OUT = process.env.OUT || '/workspace/shots/lp-b2';
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
  await pg.evaluate((intro) => {
    const k = 'dojo-ascent-profile-v1';
    const p = JSON.parse(localStorage.getItem(k) || '{}');
    p.runsPlayed = Math.max(5, p.runsPlayed || 0);
    p.runsStarted = Math.max(5, p.runsStarted || 0);
    p.guideStep = 99;
    p.pathIntroSeen = intro ? false : true;
    localStorage.setItem(k, JSON.stringify(p));
    localStorage.removeItem('dojo-ascent-run-in-progress');
  }, !!intro);
  await pg.evaluate(() => { const g = window.game; g.scene.getScenes(true).forEach((s) => g.scene.stop(s.scene.key)); g.scene.start('Home'); });
  await pg.waitForTimeout(600);
  await pg.evaluate(() => { const h = window.game.scene.getScene('Home'); h.children.list.filter((c) => c.depth >= 90).forEach((c) => c.destroy()); if (!h.children.list.some((c) => c.depth === 50)) { h.celebrating = false; h.maybePathIntro(); } });
  return { ctx, pg };
}


const texts = (pg) => pg.evaluate(() => {
  const h = window.game.scene.getScene('Home');
  const o = [];
  const w = (l, vis) => { for (const c of l) { const v = vis && c.visible !== false && (c.alpha ?? 1) > 0; if (c.list) w(c.list, v); if (c.type === 'Text' && c.text && v) { const b = c.getBounds(); o.push({ t: c.text, x: b.x, y: b.y, w: b.width, h: b.height, cx: b.centerX, cy: b.centerY, d: c.depth, size: parseInt(c.style.fontSize, 10) }); } } };
  w(h.children.list, true);
  return o;
});
const hits = (pg) => pg.evaluate(() => {
  const h = window.game.scene.getScene('Home');
  return h.input._list.filter((o) => o.input?.enabled && o.active).map((o) => { const b = o.getBounds(); return { w: b.width, h: b.height, x: b.x, y: b.y }; });
});
const tapText = async (pg, re) => {
  const t = (await texts(pg)).find((x) => re.test(x.t));
  if (!t) return false;
  await pg.touchscreen.tap(t.cx, t.cy);
  await pg.waitForTimeout(500);
  return true;
};
const homeView = (pg) => pg.evaluate(() => window.game.scene.getScene('Home').view);


// Texts in the Faith page (depth 60) or the ceremony (depth 100) only.
const layer = (pg, d) => pg.evaluate((d) => {
  const h = window.game.scene.getScene('Home');
  const o = [];
  const w = (l, vis) => { for (const c of l) { const v = vis && c.visible !== false && (c.alpha ?? 1) > 0; if (c.list) w(c.list, v); if (c.type === 'Text' && c.text && v) { const b = c.getBounds(); o.push({ t: c.text, x: b.x, y: b.y, w: b.width, h: b.height, cx: b.centerX, cy: b.centerY, size: parseInt(c.style.fontSize, 10) }); } } };
  w(h.children.list.filter((c) => c.depth === d), true);
  return o;
}, d);
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
const same = (tx, s) => tx.some((t) => t.t === s);
const L = PACK.faithDoesBanner.letters;
const verse = (v) => (v.showText === 'wall' ? v.wallText : v.kjvText);

for (const [W, H] of sizes) {
  for (const rm of ['1', '0']) {
    for (const [student, tag, lit] of [['1-white-belt-new', 'white', 0], ['4-green-belt', 'green', 3]]) {
      const where = `${W}x${H} rm=${rm} ${tag}`;
      const { ctx, pg } = await open(W, H, rm, student);
      await pg.waitForTimeout(rm === '1' ? 300 : 900);
      // The banner.
      const tx = await texts(pg);
      const letters = tx.filter((t) => /^[A-Z]$/.test(t.t) && t.cy < 50);
      check(where, 'banner spells FAITH DOES', letters.map((t) => t.t).join('') === 'FAITHDOES', letters.map((t) => t.t).join(''));
      const names = await pg.evaluate(() => { const o = []; const w = (l) => { for (const c of l) { if (c.list) w(c.list); if (c.name?.startsWith('faith-letter-')) o.push(c.name); } }; w(window.game.scene.getScene('Home').children.list); return o; });
      check(where, `${lit} letters lit`, names.filter((n) => n.endsWith('-lit')).length === lit && names.slice(0, lit).every((n) => n.endsWith('-lit')), names.join(','));
      check(where, 'banner overlaps nothing', overlaps(tx).length === 0, overlaps(tx).join(', '));
      const small = (await hits(pg)).filter((b) => b.w < 44 || b.h < 44);
      check(where, 'every tap target 44 pt', small.length === 0, JSON.stringify(small));
      await pg.screenshot({ path: `${OUT}/path-${tag}-${W}x${H}-rm${rm}.png` });
      // The Faith page.
      const mid = letters[4];
      await pg.touchscreen.tap(mid.cx, mid.cy);
      await pg.waitForTimeout(400);
      let pages = 0;
      for (;;) {
        const f = await layer(pg, 60);
        const p = pages === 0 ? 'banner' : pages === 1 ? 'creed' : `scroll ${pages - 1}`;
        if (pages === 0) {
          check(where, 'Faith page opens on the banner', same(f, lit === 9 ? PACK.faithDoesBanner.lines.complete : PACK.faithDoesBanner.lines.description));
          check(where, 'lit letters show word and meaning, word for word', L.slice(0, lit).every((l) => same(f, l.word) && same(f, l.meaning)) && L.slice(lit).every((l) => !same(f, l.word)));
        } else if (pages === 1) {
          check(where, 'Creed Scroll word for word', same(f, PACK.creedScroll.name) && same(f, PACK.creedScroll.text) && same(f, PACK.creedScroll.signedBy));
        } else {
          const v = PACK.verseScrolls[pages - 2];
          check(where, `${v.id}: verse, reference, covenant word for word`, same(f, v.name) && same(f, verse(v)) && same(f, v.reference) && (!v.covenant || (same(f, v.covenant.name) && same(f, v.covenant.text))) && !same(f, v.lines.sensei));
        }
        check(where, `${p}: on screen`, fits(f, W, H).length === 0, fits(f, W, H).join(','));
        check(where, `${p}: no overlaps`, overlaps(f).length === 0, overlaps(f).join(', '));
        check(where, `${p}: words 11 pt or more`, f.every((t) => t.size >= 11), f.filter((t) => t.size < 11).map((t) => `${t.t.slice(0, 20)}=${t.size}`).join(','));
        if (rm === '1') await pg.screenshot({ path: `${OUT}/faith-${tag}-${W}x${H}-${pages}.png` });
        const next = f.find((t) => t.t === '▶');
        const enabled = await pg.evaluate(() => window.game.scene.getScene('Home').faithPage);
        await pg.touchscreen.tap(next.cx, next.cy);
        await pg.waitForTimeout(250);
        if ((await pg.evaluate(() => window.game.scene.getScene('Home').faithPage)) === enabled) break;
        pages++;
      }
      check(where, `${2 + lit} pages (banner, creed, ${lit} scrolls)`, pages + 1 === 2 + lit, `${pages + 1}`);
      const back = (await layer(pg, 60)).find((t) => t.t === '◀ Path');
      await pg.touchscreen.tap(back.cx, back.cy);
      await pg.waitForTimeout(300);
      check(where, '◀ Path closes the Faith page', (await layer(pg, 60)).length === 0 && (await homeView(pg)) === 'path');
      check(where, 'no page errors', pg.errs.length === 0, pg.errs.join('; '));
      await ctx.close();
    }
  }
  // A promotion (Orange to Green) and the Creed Scroll on first check-in.
  for (const rm of ['1', '0']) {
    const where = `${W}x${H} rm=${rm} promotion`;
    const { ctx, pg } = await open(W, H, rm, '4-green-belt');
    await pg.evaluate(() => {
      const k = 'dojo-ascent-profile-v1';
      const p = JSON.parse(localStorage.getItem(k));
      const t = window.game.scene.getScene('Home').training;
      // What the game remembered before: everything as now, but at Orange (so only the promotion plays).
      const signed = [...t.requirements, ...t.stances.map((s) => s.requirement)].filter((r) => r.signedOff).map((r) => r.id);
      const stripes = t.virtues.flatMap((v) => v.earned.map((s) => `${s.word}|${s.belt}|${s.earnedOn}`));
      p.seen = { studentId: t.studentId, belt: 'orange', tier: 3, signed, stripes, approved: t.gate.sealLit };
      p.creedSeen = false;
      localStorage.setItem(k, JSON.stringify(p));
      const g = window.game;
      g.scene.getScenes(true).forEach((s) => g.scene.stop(s.scene.key));
      g.scene.start('Home');
    });
    await pg.waitForTimeout(800);
    // One entry per screen (a screen's words appear one by one; it is the same screen while any line stays).
    const shots = [];
    for (let i = 0; i < 40; i++) {
      const c = await layer(pg, 100);
      if (!c.length) break;
      if (shots.length && shots[shots.length - 1].some((a) => c.some((x) => x.t === a.t))) shots[shots.length - 1] = c;
      else shots.push(c);
      if (rm === '1') await pg.screenshot({ path: `${OUT}/ceremony-${W}x${H}-${shots.length - 1}.png` });
      check(where, `screen ${shots.length - 1}: on screen`, fits(c, W, H).length === 0, fits(c, W, H).join(','));
      check(where, `screen ${shots.length - 1}: no overlaps`, overlaps(c).length === 0, overlaps(c).join(', '));
      const before = JSON.stringify(c.map((t) => t.t));
      for (let k = 0; k < 20 && JSON.stringify((await layer(pg, 100)).map((t) => t.t)) === before; k++) {
        await pg.touchscreen.tap(W / 2, H - 20);
        await pg.waitForTimeout(300);
      }
    }
    const v = PACK.verseScrolls.find((x) => x.promotion.toBelt === 'green');
    const vi = shots.findIndex((c) => same(c, verse(v)));
    const si = shots.findIndex((c) => same(c, L[2].lit));
    const ci = shots.findIndex((c) => same(c, PACK.creedScroll.text));
    check(where, 'verse screen: found line, verse, reference, covenant, Sensei question word for word', vi >= 0 && [v.lines.found, v.reference, v.covenant.name, v.covenant.text, v.lines.sensei].every((s) => same(shots[vi], s)));
    check(where, 'summary says the new letter shines', si > vi);
    check(where, 'ceremony is at most 4 screens', si >= 0 && si <= 3, `summary at ${si}`);
    check(where, 'Creed Scroll after, once', ci > si && same(shots[ci], PACK.creedScroll.lines.found) && same(shots[ci], PACK.creedScroll.signedBy));
    check(where, 'creedSeen saved', await pg.evaluate(() => JSON.parse(localStorage.getItem('dojo-ascent-profile-v1')).creedSeen === true));
    await pg.evaluate(() => { const g = window.game; g.scene.getScenes(true).forEach((s) => g.scene.stop(s.scene.key)); g.scene.start('Home'); });
    await pg.waitForTimeout(600);
    check(where, 'no ceremony the second time', (await layer(pg, 100)).length === 0);
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
