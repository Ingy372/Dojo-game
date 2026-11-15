// LP-B4b verify-ui-shots: shop tabs, effect and wall-paint previews, buying and wearing them, the walk trail
// in a real run (under enemy warnings, none with Reduced motion), the wall paint in the Home Dojo, and a
// contact sheet of every effect and wall paint at game size next to the hero (cells in OUT/sheet/).
// Usage: OUT=/workspace/shots/lp-b4b URL=http://127.0.0.1:5192/ node fx-verify.mjs   (Vite dev server: the sheet imports /src/fx/shopFx.ts)
import { chromium } from 'playwright';
import fs from 'fs';
const CAT = JSON.parse(fs.readFileSync(process.env.SHOP_JSON || new URL('../../../content/shop/catalog.json', import.meta.url), 'utf8'));
const W_ = CAT.words;
const fill = (s, o) => s.replace(/\{(\w+)\}/g, (_, k) => String(o[k]));
const URL_ = process.env.URL || 'http://127.0.0.1:5173/';
const OUT = process.env.OUT || '/workspace/shots/lp-b4b';
fs.mkdirSync(`${OUT}/sheet`, { recursive: true });
const sizes = process.env.ONLY ? [process.env.ONLY.split('x').map(Number)] : [[667, 375], [844, 390], [932, 430]];
const PARTS = (process.env.PARTS || 'shop,run,dojo,sheet').split(',');
const rows = [];
const check = (where, name, ok, info = '') => rows.push(`${ok ? 'PASS' : 'FAIL'}  ${where}  ${name}${info ? '  (' + info + ')' : ''}`);
const groupOf = Object.fromEntries(CAT.groups.map((g) => [g.id, g]));
const fxItems = CAT.items.filter((i) => i.fx);
const walls = CAT.items.filter((i) => groupOf[i.group].slot === 'wall');
const NONE = { gi: null, hair: null, trail: null, puff: null, hit: null, win: null, wall: null };
const b = await chromium.launch();

async function open(W, H, rm, student) {
  const ctx = await b.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1, hasTouch: true, isMobile: true });
  await ctx.addInitScript(([s, k]) => {
    if (!sessionStorage.getItem('lpb4b-init')) { localStorage.clear(); sessionStorage.setItem('lpb4b-init', '1'); }
    localStorage.setItem('dojo-ascent-test-student', s);
    localStorage.setItem('dojo.reducedMotion', k === '1' ? 'on' : 'off');
  }, [student, rm]);
  const pg = await ctx.newPage();
  pg.errs = [];
  pg.on('pageerror', (e) => pg.errs.push(e.message));
  await pg.goto(URL_);
  await pg.waitForFunction(() => window.game?.scene?.getScenes?.(true).length);
  // Through the title and the character maker, the way a new player arrives.
  for (let i = 0; i < 40; i++) {
    const keys = await pg.evaluate(() => window.game.scene.getScenes(true).map((s) => s.scene.key));
    if (keys.includes('Home') || keys.includes('Dojo')) break;
    if (keys.includes('Title')) await pg.touchscreen.tap(W / 2, H / 2);
    if (keys.includes('Create')) {
      const g = (await texts(pg, 'Create')).find((t) => /Let's go/.test(t.t));
      if (g) await pg.touchscreen.tap(g.cx, g.cy);
    }
    await pg.waitForTimeout(300);
  }
  return { ctx, pg };
}
const texts = (pg, key, minDepth = -1) => pg.evaluate(([key, minDepth]) => {
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
const profile = (pg) => pg.evaluate(() => JSON.parse(localStorage.getItem('dojo-ascent-profile-v1')));
const restart = (pg, scene, edit, data) => pg.evaluate(([scene, edit, data]) => {
  const k = 'dojo-ascent-profile-v1';
  const p = JSON.parse(localStorage.getItem(k) || '{}');
  Object.assign(p, { runsPlayed: Math.max(5, p.runsPlayed || 0), runsStarted: Math.max(5, p.runsStarted || 0), guideStep: 99, pathIntroSeen: true, creedSeen: true }, edit);
  localStorage.setItem(k, JSON.stringify(p));
  localStorage.removeItem('dojo-ascent-run-in-progress');
  const g = window.game;
  g.scene.getScenes(true).forEach((s) => g.scene.stop(s.scene.key));
  g.scene.start(scene, data);
}, [scene, edit, data ?? null]);
const tapText = async (pg, key, want, minDepth = -1) => {
  const t = (await texts(pg, key, minDepth)).find((x) => x.t === want);
  if (t) { await pg.touchscreen.tap(t.cx, t.cy); await pg.waitForTimeout(400); }
  return !!t;
};
const settleHome = async (pg, W, H) => {
  await pg.waitForTimeout(1200);
  for (let i = 0; i < 30 && (await pg.evaluate(() => window.game.scene.getScene('Home').celebrating)); i++) {
    await pg.touchscreen.tap(W / 2, H * 0.85);
    await pg.waitForTimeout(700);
  }
  await pg.waitForTimeout(500);
};
const pick = async (pg, id) => { await pg.evaluate((id) => window.game.scene.getScene('Home').shop.pick(id), id); await pg.waitForTimeout(250); };
const act = (pg) => pg.evaluate(() => window.game.scene.getScene('Home').shop.act());
const shopTexts = (pg) => texts(pg, 'Home', 60);
const bowIn = async (pg) => {
  await tapText(pg, 'Game', 'Bow');
  await pg.waitForTimeout(2500);
};
const has = (tx, s) => tx.some((t) => t.t === s);
const layout = (where, name, tx, W, H) => check(where, `${name}: on screen, no overlaps`, tx.length > 0 && fits(tx, W, H).length === 0 && overlaps(tx).length === 0, [...fits(tx, W, H), ...overlaps(tx)].join(','));
const runParticles = (pg) => pg.evaluate(() => window.game.scene.getScene('Game').children.list.filter((o) => o.name === 'fx' && o.depth === 0.95).length);

if (PARTS.includes('shop')) for (const [W, H] of sizes) {
  for (const rm of ['1', '0']) {
    const where = `${W}x${H} rm=${rm}`;
    const { ctx, pg } = await open(W, H, rm, '6-orange-typical');
    await restart(pg, 'Home', { coins: 99999, shop: { owned: [], wearing: NONE } });
    await settleHome(pg, W, H);
    await tapText(pg, 'Home', W_.button);
    const tabs = [...new Set(CAT.groups.map((g) => g.tab))];
    for (const tab of tabs) {
      await tapText(pg, 'Home', tab, 60);
      const tx = await shopTexts(pg);
      const groups = CAT.groups.filter((g) => g.tab === tab);
      check(where, `${tab} tab shows its groups`, groups.every((g) => has(tx, g.name)) && CAT.groups.filter((g) => g.tab !== tab).every((g) => !has(tx, g.name)));
      layout(where, `${tab} tab`, tx, W, H);
      const zones = await pg.evaluate(() => window.game.scene.getScene('Home').shop.layer.list.filter((o) => o.type === 'Zone' && o.width === 46).map((z) => ({ x: z.x - z.width / 2, y: z.y - z.height / 2, w: z.width, h: z.height })));
      const want = groups.reduce((n, g) => n + 1 + CAT.items.filter((i) => i.group === g.id).length, 0);
      check(where, `${tab}: all ${want} tiles on screen, 44pt+`, zones.length === want && zones.every((z) => z.w >= 44 && z.h >= 44 && z.x >= 0 && z.y >= 0 && z.x + z.w <= W + 1 && z.y + z.h <= H + 1), `${zones.length} zones`);
      if (rm === '1') await pg.screenshot({ path: `${OUT}/tab-${tab}-${W}x${H}.png` });
    }
    // Buy one of each kind, preview first (costs nothing), then one tap gets it and wears it.
    let coins = 99999;
    for (const id of ['trail-cherry-petals', 'puff-dust-cloud', 'hit-star-pop', 'win-lantern-rise', 'wall-sunrise']) {
      const it = CAT.items.find((i) => i.id === id);
      const slot = groupOf[it.group].slot;
      await pick(pg, id);
      let tx = await shopTexts(pg);
      check(where, `${id}: name, price, before/after, Get it`, has(tx, it.name) && has(tx, fill(W_.price, { n: it.price })) && has(tx, fill(W_.afterLine, { before: coins, after: coins - it.price })) && has(tx, W_.get));
      layout(where, `${id} preview`, tx, W, H);
      if (it.fx) {
        const fx = { n: 0, tweening: 0 };
        for (let t = 0; t < Math.max(1200, it.fx.lifeMs + 600); t += 100) {
          const f = await pg.evaluate(() => { const s = window.game.scene.getScene('Home'); const l = s.shop.layer.list.filter((o) => o.name === 'fx'); return { n: l.length, tweening: l.filter((o) => s.tweens.getTweensOf(o).length > 0).length }; });
          fx.n = Math.max(fx.n, f.n); fx.tweening = Math.max(fx.tweening, f.tweening);
          await pg.waitForTimeout(100);
        }
        const want = it.fx.motion === 'drift' && rm === '1' ? 0 : 1;
        if (rm === '0') check(where, `${id}: preview plays around the hero`, fx.n >= 1 && fx.n <= 24 && fx.tweening > 0, JSON.stringify(fx));
        else check(where, `${id}: Reduced motion preview holds still (none for a trail)`, fx.tweening === 0 && (want ? fx.n > 0 : fx.n === 0) && fx.n <= 12, JSON.stringify(fx));
      }
      if (rm === '0' && W === 844) await pg.screenshot({ path: `${OUT}/preview-${slot}-${W}x${H}.png` });
      await act(pg);
      await pg.waitForTimeout(300);
      coins -= it.price;
      const p = await profile(pg);
      tx = await shopTexts(pg);
      check(where, `${id}: bought and worn in the ${slot} slot`, p.coins === coins && p.shop.owned.includes(id) && p.shop.wearing[slot] === id, JSON.stringify(p.shop.wearing));
      check(where, `${id}: says Wearing as plain words`, has(tx, W_.wearing) && has(tx, W_.got));
    }
    // A belt-6 trail at orange belt is locked.
    await pick(pg, 'trail-little-hearts');
    let tx = await shopTexts(pg);
    check(where, 'a higher-belt trail is locked, no Get it', has(tx, W_.locked) && !has(tx, W_.get));
    // None takes an effect off; plain wood takes the paint off.
    await pick(pg, 'own-trail');
    tx = await shopTexts(pg);
    check(where, 'None tile names itself', has(tx, W_.plain) && has(tx, W_.plainLine) && has(tx, W_.wear));
    await act(pg);
    await pick(pg, 'own-wall');
    tx = await shopTexts(pg);
    check(where, 'Plain wood tile names itself', has(tx, W_.wood) && has(tx, W_.woodLine));
    await act(pg);
    const p = await profile(pg);
    check(where, 'None and Plain wood clear their slots for free', p.shop.wearing.trail === null && p.shop.wearing.wall === null && p.coins === coins);
    if (rm === '1') await pg.screenshot({ path: `${OUT}/wood-${W}x${H}.png` });
    await tapText(pg, 'Home', W_.back, 60);
    await pg.waitForTimeout(1500);
    const left = await pg.evaluate(() => window.game.scene.getScene('Home').children.list.filter((o) => o.type === 'Graphics' && o.parentContainer == null && o.alpha < 1).length);
    check(where, 'Back closes the shop and the preview stops', !(await pg.evaluate(() => window.game.scene.getScene('Home').shop)), String(left));
    check(where, 'no page errors', pg.errs.length === 0, pg.errs.join(' / '));
    await ctx.close();
  }
}

// A real run: walk by tapping the floor; the trail drops pieces under enemy warnings; none with Reduced motion.
if (PARTS.includes('run')) for (const [W, H] of sizes) for (const rm of ['0', '1']) {
  const where = `${W}x${H} rm=${rm} run`;
  const { ctx, pg } = await open(W, H, rm, '1-white-belt-new');
  const trail = CAT.items.find((i) => i.id === 'trail-cherry-petals');
  await restart(pg, 'Dojo', { shop: { owned: ['trail-cherry-petals', 'puff-dust-cloud', 'hit-star-pop'], wearing: { ...NONE, trail: 'trail-cherry-petals', puff: 'puff-dust-cloud', hit: 'hit-star-pop' } } });
  await pg.waitForFunction(() => window.game.scene.getScene('Dojo')?.sys.isActive());
  await pg.waitForTimeout(500);
  await pg.evaluate(() => window.game.scene.getScene('Dojo').goTower());
  await pg.waitForFunction(() => window.game.scene.getScene('Game')?.sys.isActive() && window.game.scene.getScene('Game').run, null, { timeout: 15000 });
  await pg.waitForTimeout(2500);
  await bowIn(pg);
  check(where, 'Reduced motion setting reads back', (await pg.evaluate(() => localStorage.getItem('dojo.reducedMotion'))) === (rm === '1' ? 'on' : 'off'));
  check(where, 'the run picked up the worn trail, puff and hit', await pg.evaluate(() => { const s = window.game.scene.getScene('Game'); return !!(s.trail && s.shopFx.puff && s.shopFx.hit); }));
  // Set-up for counting: one effect at a time (walking into an enemy would also land hits).
  await pg.evaluate(() => { const s = window.game.scene.getScene('Game'); s.__fx = { ...s.shopFx }; s.shopFx.puff = null; s.shopFx.hit = null; });
  let most = 0;
  for (const [fx, fy] of [[0.75, 0.5], [0.3, 0.5], [0.7, 0.45]]) {
    await pg.touchscreen.tap(W * fx, H * fy);
    for (let i = 0; i < 6; i++) { await pg.waitForTimeout(120); most = Math.max(most, await runParticles(pg)); }
    if (fx === 0.3 && rm === '0') await pg.screenshot({ path: `${OUT}/run-trail-${W}x${H}.png` });
  }
  if (rm === '0') check(where, 'walking drops trail pieces, never more than the recipe count', most > 0 && most <= trail.fx.count, String(most));
  else check(where, 'Reduced motion: no trail at all', most === 0, String(most));
  // Dash: the puff at the start spot (stills with Reduced motion), never over 24 pieces.
  await pg.waitForTimeout(900);
  await pg.evaluate(() => { const s = window.game.scene.getScene('Game'); s.shopFx.puff = s.__fx.puff; s.__trail = s.trail; s.trail = null; });
  const before = await runParticles(pg);
  await tapText(pg, 'Game', 'DASH');
  const puff = await pg.evaluate(() => { const s = window.game.scene.getScene('Game'); const l = s.children.list.filter((o) => o.name === 'fx'); return { n: l.length, tweening: l.filter((o) => s.tweens.getTweensOf(o).length > 0).length }; });
  check(where, 'Dash plays the puff (still with Reduced motion), at most 24 pieces', puff.n > before && puff.n <= 24 && (rm === '1' ? puff.tweening === 0 : puff.tweening > 0), JSON.stringify({ before, ...puff }));
  if (rm === '0') await pg.screenshot({ path: `${OUT}/run-dash-${W}x${H}.png` });
  // Strike until a hit lands: the hit pop plays where the enemy stands.
  let hit = null;
  await pg.waitForTimeout(600);
  await pg.evaluate(() => { const s = window.game.scene.getScene('Game'); s.shopFx.puff = null; s.shopFx.hit = s.__fx.hit; });
  for (let i = 0; i < 40 && !hit; i++) {
    const e = await pg.evaluate(() => { const s = window.game.scene.getScene('Game'); const me = s.world.players[s.me]; const live = s.world.enemies.filter((x) => x.health > 0).sort((a, b) => Math.hypot(a.pos.x - me.pos.x, a.pos.y - me.pos.y) - Math.hypot(b.pos.x - me.pos.x, b.pos.y - me.pos.y))[0]; if (!live) return null; const cam = s.cameras.main; return { d: Math.hypot(live.pos.x - me.pos.x, live.pos.y - me.pos.y), x: (live.pos.x * 48 - cam.scrollX) * cam.zoom, y: (live.pos.y * 48 - cam.scrollY) * cam.zoom }; });
    if (!e) { await pg.waitForTimeout(300); continue; }
    if (e.d > 1.3) await pg.touchscreen.tap(Math.max(10, Math.min(W - 10, e.x)), Math.max(10, Math.min(H - 10, e.y)));
    else await tapText(pg, 'Game', 'STRIKE');
    await pg.waitForTimeout(150);
    const n = await pg.evaluate(() => window.game.scene.getScene('Game').children.list.filter((o) => o.name === 'fx').length);
    if (n > 0) { hit = n; if (rm === '0') await pg.screenshot({ path: `${OUT}/run-hit-${W}x${H}.png` }); }
  }
  check(where, 'a landed strike plays the hit pop, at most 24 pieces', hit !== null && hit <= 24, String(hit));
  const depths = await pg.evaluate(() => { const s = window.game.scene.getScene('Game'); return { danger: s.danger?.depth, tether: s.tether?.depth }; });
  check(where, 'trail sits under the enemy warning layer', depths.danger === undefined || depths.danger > 0.95, JSON.stringify(depths));
  check(where, 'no page errors', pg.errs.length === 0, pg.errs.join(' / '));
  await ctx.close();
}

// The Home Dojo: wall paint multiplies over the back wall; Plain wood has none.
if (PARTS.includes('dojo')) for (const [W, H] of sizes) {
  const where = `${W}x${H} dojo`;
  const { ctx, pg } = await open(W, H, '1', '1-white-belt-new');
  const paint = () => pg.evaluate(() => window.game.scene.getScene('Dojo').worldLayer.list.filter((o) => o.type === 'Graphics' && o.blendMode === 2).length);
  await restart(pg, 'Dojo', { shop: { owned: [], wearing: NONE } });
  await pg.waitForTimeout(1500);
  check(where, 'Plain wood: no paint layer', (await paint()) === 0);
  await restart(pg, 'Dojo', { shop: { owned: ['wall-seafoam'], wearing: { ...NONE, wall: 'wall-seafoam' } } });
  await pg.waitForTimeout(1500);
  check(where, 'Seafoam: one paint layer over the back wall', (await paint()) === 1);
  check(where, 'no page errors', pg.errs.length === 0, pg.errs.join(' / '));
  await ctx.close();
}

// Contact sheet cells at game size (844x390, motion on): each effect next to the hero in a real run
// (win bursts on Home, the way a cleared floor shows them), and each wall paint in the Home Dojo.
if (PARTS.includes('sheet')) {
  const [W, H] = [844, 390];
  const { ctx, pg } = await open(W, H, '0', '1-white-belt-new');
  await restart(pg, 'Dojo', { shop: { owned: [], wearing: NONE } });
  await pg.waitForFunction(() => window.game.scene.getScene('Dojo')?.sys.isActive());
  await pg.waitForTimeout(500);
  await pg.evaluate(() => window.game.scene.getScene('Dojo').goTower());
  await pg.waitForFunction(() => window.game.scene.getScene('Game')?.sys.isActive() && window.game.scene.getScene('Game').run, null, { timeout: 15000 });
  await pg.waitForTimeout(2500);
  await bowIn(pg);
  // Hold the fight still and hide the enemies, their danger marks, old float words and the buttons, so each cell shows only the
  // hero and the effect (the effects run on tweens, which keep playing while the fight is held).
  await pg.evaluate(() => {
    const s = window.game.scene.getScene('Game');
    s.menuOpen = true;
    s.uiCamera.setVisible(false);
    const hide = () => { s.danger.setVisible(false); for (const v of s.enemyViews.values()) v.container.setVisible(false); };
    hide(); s.events.on('postupdate', hide);
  });
  await pg.waitForTimeout(2000);
  const hero = () => pg.evaluate(() => { const s = window.game.scene.getScene('Game'); const p = s.world.players[s.me].pos; const cam = s.cameras.main; return { x: cam.x + (p.x * 48 - cam.worldView.x) * cam.zoom, y: cam.y + (p.y * 48 - cam.worldView.y) * cam.zoom }; });
  const cell = async (name, w = 220, left = 110) => { const c = await hero(); await pg.screenshot({ path: `${OUT}/sheet/${name}.png`, clip: { x: Math.max(0, Math.min(W - w, c.x - left)), y: Math.max(0, Math.min(H - 200, c.y - 120)), width: w, height: 200 } }); };
  for (const it of fxItems.filter((i) => ['trail', 'puff', 'hit'].includes(groupOf[i.group].slot))) {
    const slot = groupOf[it.group].slot;
    if (slot === 'trail') {
      // The real emitter, walking: a tap far left, then right, so the hero is mid-walk with the trail behind.
      // The real emitter, stepped along the last 3 tiles of a walk that ends at the hero's feet.
      await pg.evaluate(async ([f, dir]) => {
        const m = await import('/src/fx/shopFx.ts');
        const s = window.game.scene.getScene('Game');
        const t = new m.TrailEmitter(s, f, s.fxPlace());
        const p = s.world.players[s.me].pos;
        const t0 = performance.now();
        await new Promise((done) => { const tick = () => { const k = Math.min(1, (performance.now() - t0) / 700); t.step((p.x + dir * 3 * (1 - k)) * 48, (p.y + 0.15) * 48); k < 1 ? requestAnimationFrame(tick) : done(); }; tick(); });
      }, [it.fx, 1]);
      await cell(it.id, 260, 70);
      await pg.waitForTimeout(900);
    } else {
      await pg.evaluate(async ([f, slot]) => {
        const m = await import('/src/fx/shopFx.ts');
        const s = window.game.scene.getScene('Game');
        const p = s.player;
        // Puffs at the feet (where a dash starts), hit pops one tile in front, where a struck enemy stands.
        if (slot === 'puff') m.playFx(s, f, p.x, p.y + 0.15 * 48, s.fxPlace());
        else m.playFx(s, f, p.x + 48, p.y - 12, s.fxPlace());
      }, [it.fx, slot]);
      await pg.waitForTimeout(Math.round(it.fx.lifeMs * 0.35));
      await cell(it.id);
      await pg.waitForTimeout(it.fx.lifeMs);
    }
    rows.push(`SHEET ${it.id}`);
  }
  // Win bursts: on Home over the run summary, sized as winBurst() does.
  await restart(pg, 'Home', {}, { fromRun: false });
  await settleHome(pg, W, H);
  for (const it of fxItems.filter((i) => groupOf[i.group].slot === 'win')) {
    await pg.evaluate(async (f) => { const m = await import('/src/fx/shopFx.ts'); const s = window.game.scene.getScene('Home'); m.playFx(s, f, 844 / 2, 390 * 0.55, { tile: 390 / 4, depth: 58 }); }, it.fx);
    await pg.waitForTimeout(Math.round(it.fx.lifeMs * 0.4));
    await pg.screenshot({ path: `${OUT}/sheet/${it.id}.png` });
    await pg.waitForTimeout(it.fx.lifeMs);
    rows.push(`SHEET ${it.id}`);
  }
  // Wall paint: the hero stands by the back wall of the Home Dojo.
  for (const it of [null, ...walls]) {
    await restart(pg, 'Dojo', { shop: { owned: it ? [it.id] : [], wearing: { ...NONE, wall: it?.id ?? null } } });
    await pg.waitForTimeout(1200);
    for (let i = 0; i < 8; i++) {
      const bt = (await texts(pg, 'Dojo')).find((t) => /^(Bow|Okay!|Thank you!|Let's go!|Let's clean up|OK)$/.test(t.t));
      if (!bt) break;
      await pg.touchscreen.tap(bt.cx, bt.cy);
      await pg.waitForTimeout(bt.t === 'Bow' ? 2500 : 700);
    }
    await pg.evaluate(() => { const s = window.game.scene.getScene('Dojo'); s.world.players.p1.pos = { x: 4.5, y: 1.6 }; s.prevPos = { x: 4.5, y: 1.6 }; });
    await pg.waitForTimeout(700);
    const c = await pg.evaluate(() => { const s = window.game.scene.getScene('Dojo'); const b = s.player.getBounds(); const m = b.getBounds ? b : b; const cam = s.cameras.main; const pt = s.worldLayer.getWorldTransformMatrix().transformPoint(s.player.x, s.player.y); return { x: (pt.x - cam.scrollX) * cam.zoom, y: (pt.y - cam.scrollY) * cam.zoom }; });
    await pg.screenshot({ path: `${OUT}/sheet/${it?.id ?? 'wall-plain-wood'}.png`, clip: { x: Math.max(0, Math.min(W - 260, c.x - 130)), y: 0, width: 260, height: Math.min(H, Math.max(160, c.y + 30)) } });
    rows.push(`SHEET ${it?.id ?? 'wall-plain-wood'}`);
  }
  check('844x390 sheet', 'no page errors', pg.errs.length === 0, pg.errs.join(' / '));
  await ctx.close();
}
await b.close();
const res = rows.filter((r) => !r.startsWith('SHEET'));
fs.writeFileSync(`${OUT}/results.txt`, res.join('\n') + '\n');
console.log(rows.join('\n'));
console.log(`${res.filter((r) => r.startsWith('PASS')).length} pass, ${res.filter((r) => r.startsWith('FAIL')).length} fail`);
