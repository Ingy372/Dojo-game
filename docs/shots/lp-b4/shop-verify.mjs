// LP-B4 verify-ui-shots: the looks shop. Open it from the Path's Shop button, preview a colour on the hero,
// get it with one tap, wear it, go back to your own colour; locked looks at white belt; dyes on the Dojo hero
// with the belt untouched. Usage: OUT=/workspace/shots/lp-b4 URL=http://127.0.0.1:5192/ node shop-verify.mjs
import { chromium } from 'playwright';
import fs from 'fs';
const CAT = JSON.parse(fs.readFileSync(process.env.SHOP_JSON || new URL('../../../content/shop/catalog.json', import.meta.url), 'utf8'));
const W_ = CAT.words;
const fill = (s, o) => s.replace(/\{(\w+)\}/g, (_, k) => String(o[k]));

const URL_ = process.env.URL || 'http://127.0.0.1:5173/';
const OUT = process.env.OUT || '/workspace/shots/lp-b4';
fs.mkdirSync(OUT, { recursive: true });
const sizes = process.env.ONLY ? [process.env.ONLY.split('x').map(Number)] : [[667, 375], [844, 390], [932, 430]];
const rows = [];
const check = (where, name, ok, info = '') => rows.push(`${ok ? 'PASS' : 'FAIL'}  ${where}  ${name}${info ? '  (' + info + ')' : ''}`);
const b = await chromium.launch();

async function open(W, H, rm, student) {
  const ctx = await b.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1, hasTouch: true, isMobile: true });
  await ctx.addInitScript(([s, k]) => {
    if (!sessionStorage.getItem('lpb4-init')) { localStorage.clear(); sessionStorage.setItem('lpb4-init', '1'); }
    localStorage.setItem('dojo-ascent-test-student', s);
    localStorage.setItem('dojo.reducedMotion', k);
  }, [student, rm]);
  const pg = await ctx.newPage();
  pg.errs = [];
  pg.on('pageerror', (e) => pg.errs.push(e.message));
  await pg.goto(URL_);
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

const texts = (pg, key, minDepth = -1) => pg.evaluate(([key, minDepth]) => {
  const h = window.game.scene.getScene(key);
  const o = [];
  const w = (l, vis, d) => { for (const c of l) { const dd = d ?? c.depth; const v = vis && c.visible !== false && (c.alpha ?? 1) > 0; if (c.list) w(c.list, v, dd); if (c.type === 'Text' && c.text && v && dd >= minDepth) { const b = c.getBounds(); o.push({ t: c.text, x: b.x, y: b.y, w: b.width, h: b.height, cx: b.centerX, cy: b.centerY, a: c.parentContainer?.alpha ?? 1 }); } } };
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
const profile = (pg) => pg.evaluate(() => JSON.parse(localStorage.getItem('dojo-ascent-profile-v1')));
const restart = (pg, scene, edit) => pg.evaluate(([scene, edit]) => {
  const k = 'dojo-ascent-profile-v1';
  const p = JSON.parse(localStorage.getItem(k) || '{}');
  Object.assign(p, { runsPlayed: Math.max(5, p.runsPlayed || 0), runsStarted: Math.max(5, p.runsStarted || 0), guideStep: 99, pathIntroSeen: true, creedSeen: true }, edit);
  localStorage.setItem(k, JSON.stringify(p));
  localStorage.removeItem('dojo-ascent-run-in-progress');
  const g = window.game;
  g.scene.getScenes(true).forEach((s) => g.scene.stop(s.scene.key));
  g.scene.start(scene);
}, [scene, edit]);
const tapText = async (pg, key, want, minDepth = -1) => {
  const t = (await texts(pg, key, minDepth)).find((x) => x.t === want);
  if (t) { await pg.touchscreen.tap(t.cx, t.cy); await pg.waitForTimeout(400); }
  return !!t;
};
// Tap through the welcome celebrations until the Path is free.
const settleHome = async (pg, W, H) => {
  await pg.waitForTimeout(1200);
  for (let i = 0; i < 30 && (await pg.evaluate(() => window.game.scene.getScene('Home').celebrating)); i++) {
    await pg.touchscreen.tap(W / 2, H * 0.85);
    await pg.waitForTimeout(700);
  }
  await pg.waitForTimeout(500);
};
const pick = async (pg, id) => { await pg.evaluate((id) => window.game.scene.getScene('Home').shop.pick(id), id); await pg.waitForTimeout(250); };
const shopTexts = (pg) => texts(pg, 'Home', 60);
const has = (tx, s) => tx.some((t) => t.t === s);
const layout = (where, name, tx, W, H) => check(where, `${name}: on screen, no overlaps`, tx.length > 0 && fits(tx, W, H).length === 0 && overlaps(tx).length === 0, [...fits(tx, W, H), ...overlaps(tx)].join(','));

for (const [W, H] of sizes) {
  for (const rm of ['1', '0']) {
    const where = `${W}x${H} rm=${rm}`;
    const { ctx, pg } = await open(W, H, rm, '3-yellow-belt');
    await restart(pg, 'Home', { coins: 450, shop: { owned: [], wearing: { gi: null, hair: null } } });
    await settleHome(pg, W, H);
    const path = await texts(pg, 'Home');
    check(where, 'Path top bar has the Shop button', has(path, W_.button));
    layout(where, 'Path screen', path.filter((t) => t.y < 60), W, H);
    if (rm === '1') await pg.screenshot({ path: `${OUT}/path-${W}x${H}.png` });
    await tapText(pg, 'Home', W_.button);
    let tx = await shopTexts(pg);
    check(where, 'shop opens with the coins shown', has(tx, W_.title) && has(tx, fill(W_.coins, { n: 450 })), tx.map((t) => t.t).join(' | ').slice(0, 160));
    check(where, 'both groups on the shelf', CAT.groups.every((g) => has(tx, g.name)));
    layout(where, 'shop', tx, W, H);
    const tiles = await pg.evaluate(() => window.game.scene.getScene('Home').shop.layer.list.filter((o) => o.type === 'Zone').map((z) => ({ x: z.x - z.width / 2, y: z.y - z.height / 2, w: z.width, h: z.height })));
    const inside = tiles.every((z) => z.x >= 0 && z.y >= 0 && z.x + z.w <= W + 1 && z.y + z.h <= H + 1);
    check(where, `all ${CAT.items.length + 2} tiles on screen, 44pt+ taps`, tiles.filter((z) => z.w >= 44 && z.h >= 44).length >= CAT.items.length + 2 && inside, `${tiles.length} zones`);

    // Preview: the picked colour on the hero, the price and the coins before and after.
    await pick(pg, 'gi-rose');
    tx = await shopTexts(pg);
    check(where, 'preview shows price, before and after, and Get it', has(tx, 'Rose') && has(tx, fill(W_.price, { n: 200 })) && has(tx, fill(W_.afterLine, { before: 450, after: 250 })) && has(tx, W_.get));
    layout(where, 'preview', tx, W, H);
    check(where, 'previewing costs nothing', (await profile(pg)).coins === 450);
    if (rm === '1') await pg.screenshot({ path: `${OUT}/preview-${W}x${H}.png` });
    // One tap gets it and wears it.
    await tapText(pg, 'Home', W_.get, 60);
    let p = await profile(pg);
    tx = await shopTexts(pg);
    check(where, 'one tap: 200 coins down, owned, worn', p.coins === 250 && p.shop.owned.includes('gi-rose') && p.shop.wearing.gi === 'gi-rose', JSON.stringify({ c: p.coins, s: p.shop }));
    check(where, "it says it's yours and shows Wearing", has(tx, W_.got) && has(tx, W_.wearing) && has(tx, fill(W_.coins, { n: 250 })));
    if (rm === '1') await pg.screenshot({ path: `${OUT}/bought-${W}x${H}.png` });
    // A belt-2 hair colour at yellow belt, then too few coins for the next.
    await pick(pg, 'hair-aqua');
    await tapText(pg, 'Home', W_.get, 60);
    await pick(pg, 'gi-mint');
    tx = await shopTexts(pg);
    check(where, 'too few coins: says how many more, no buying', has(tx, fill(W_.short, { n: 150 })), tx.map((t) => t.t).join('|').slice(0, 120));
    await tapText(pg, 'Home', W_.get, 60);
    p = await profile(pg);
    check(where, 'coins never below 0; short tap buys nothing', p.coins === 50 && !p.shop.owned.includes('gi-mint'), String(p.coins));
    layout(where, 'too few coins', tx, W, H);
    // Wear an owned colour again, and go back to your own colour.
    await pick(pg, 'own-gi');
    await tapText(pg, 'Home', W_.wear, 60);
    p = await profile(pg);
    check(where, 'My color takes the gi back to your own', p.shop.wearing.gi === null && p.coins === 50);
    await pick(pg, 'gi-rose');
    await tapText(pg, 'Home', W_.wear, 60);
    p = await profile(pg);
    check(where, 'an owned colour can be worn again for free', p.shop.wearing.gi === 'gi-rose' && p.coins === 50);
    await tapText(pg, 'Home', W_.back, 60);
    check(where, 'Back closes the shop', !(await pg.evaluate(() => window.game.scene.getScene('Home').shop)) && has(await texts(pg, 'Home'), W_.button));

    // The Dojo hero wears the dyes; the belt layers keep their colours.
    await restart(pg, 'Dojo', { shop: { owned: [], wearing: { gi: null, hair: null } } });
    await pg.waitForTimeout(1500);
    const tintsOff = await pg.evaluate(() => Object.fromEntries(window.game.scene.getScene('Dojo').hero.baseTints));
    await restart(pg, 'Dojo', { shop: p.shop });
    await pg.waitForTimeout(1500);
    const tintsOn = await pg.evaluate(() => Object.fromEntries(window.game.scene.getScene('Dojo').hero.baseTints));
    const hairKey = Object.keys(tintsOn).find((k) => k.startsWith('hair-') && tintsOn[k] !== tintsOff[k]);
    check(where, 'Dojo hero: gi and hair take the dyes', tintsOn.gi === 0xe8a0b4 && tintsOn[hairKey] === 0x5cc8d6, `${tintsOn.gi?.toString(16)} ${tintsOn[hairKey]?.toString(16)}`);
    const changed = Object.keys(tintsOn).filter((k) => tintsOn[k] !== tintsOff[k] && k !== 'gi' && !k.startsWith('hair-'));
    check(where, 'belt and every other layer untouched', changed.length === 0, changed.join(','));
    if (rm === '1') {
      // Bow in (the Bow button covers the hero until then), then close any arrival card.
      for (let i = 0; i < 8; i++) {
        const bt = (await texts(pg, 'Dojo')).find((t) => /^(Bow|Okay!|Thank you!|Let's go!|Let's clean up|OK)$/.test(t.t));
        if (!bt) break;
        await pg.touchscreen.tap(bt.cx, bt.cy);
        await pg.waitForTimeout(bt.t === 'Bow' ? 2500 : 700);
      }
      const c = await pg.evaluate(() => { const s = window.game.scene.getScene('Dojo'); const b = s.player.getBounds(); const cam = s.cameras.main; return { x: (b.centerX - cam.scrollX) * cam.zoom, y: (b.centerY - cam.scrollY) * cam.zoom }; });
      await pg.screenshot({ path: `${OUT}/dojo-hero-${W}x${H}.png`, clip: { x: Math.max(0, c.x - 80), y: Math.max(0, c.y - 80), width: 160, height: 160 } });
    }
    check(where, 'no page errors', pg.errs.length === 0, pg.errs.join(' / '));
    await ctx.close();

    // White belt: belt-2 colours are on the shelf but locked; nothing can get them.
    const w = await open(W, H, rm, '1-white-belt-new');
    await restart(w.pg, 'Home', { coins: 1000, shop: { owned: [], wearing: { gi: null, hair: null } } });
    await settleHome(w.pg, W, H);
    await tapText(w.pg, 'Home', W_.button);
    await pick(w.pg, 'gi-plum');
    tx = await shopTexts(w.pg);
    check(where, 'white belt: a belt-2 colour says it comes with a new belt, no Get it', has(tx, W_.locked) && !has(tx, W_.get));
    layout(where, 'locked', tx, W, H);
    if (rm === '1') await w.pg.screenshot({ path: `${OUT}/locked-${W}x${H}.png` });
    check(where, 'white belt: no page errors', w.pg.errs.length === 0, w.pg.errs.join(' / '));
    await w.ctx.close();
  }
}
await b.close();
fs.writeFileSync(`${OUT}/results.txt`, rows.join('\n') + '\n');
console.log(rows.join('\n'));
console.log(`${rows.filter((r) => r.startsWith('PASS')).length} pass, ${rows.filter((r) => r.startsWith('FAIL')).length} fail`);
