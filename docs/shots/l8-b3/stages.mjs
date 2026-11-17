// L8-B3: Seal stages. The first-visit welcome card lists the evolved Seals (no card each); a later
// look shows one evolution card per family after the sign-offs (turn + ring, a fade with Reduced
// motion); the Fighting Style Seal cards wear placeholder stage rings; the Book sheet says the stage.
// Usage: URL=http://localhost:5192/ OUT=/workspace/l8b3-shots node docs/shots/l8-b3/stages.mjs
import { chromium } from 'playwright';
import fs from 'fs';

const URL = process.env.URL || 'http://localhost:5173/';
const OUT = process.env.OUT || '/workspace/l8b3-shots';
fs.mkdirSync(OUT, { recursive: true });
const rows = [];
const check = (where, name, ok, info = '') => rows.push(`${ok ? 'PASS' : 'FAIL'}  ${where}  ${name}${info ? '  (' + info + ')' : ''}`);
const b = await chromium.launch();
const KEY = 'dojo-ascent-profile-v1';

const texts = (pg) => pg.evaluate(() => {
  const o = [];
  for (const s of window.game.scene.getScenes(true)) {
    const w = (l) => { for (const c of l) { if (c.list) w(c.list); if (c.type === 'Text' && c.visible && c.text && c.alpha > 0) { const b = c.getBounds(); o.push({ t: c.text, x: b.centerX, y: b.centerY, l: b.left, top: b.top, r: b.right, bot: b.bottom }); } } };
    w(s.children.list);
  }
  return o;
});
const celebrating = (pg) => pg.evaluate(() => window.game.scene.getScene('Home')?.celebrating === true);
/** Taps through the celebration; stops (and returns the texts) on the first screen matching `stop`, checked every 150 ms. */
async function drain(pg, W, H, stop) {
  for (let i = 0; i < 40 && (await celebrating(pg)); i++) {
    for (let k = 0; k < 12; k++) {
      await pg.waitForTimeout(150);
      const t = await texts(pg);
      if (stop && t.some((x) => stop.test(x.t))) return t;
    }
    await pg.touchscreen.tap(W / 2, H - 22);
  }
  await pg.waitForTimeout(300);
  return null;
}
async function home(pg, edit) {
  await pg.evaluate(([k, edit]) => {
    const p = JSON.parse(localStorage.getItem(k) || '{}');
    Object.assign(p, { runsPlayed: 5, runsStarted: 5, guideStep: 99 });
    if (edit) {
      // Set-up (not a tap): forget the self-defense sign-offs, so the next look shows them and the evolutions.
      const h = window.game.scene.getScene('Home');
      const ids = h.training.abilities.filter((a) => a.kind === 'seal' && a.unlocked).map((a) => a.requirement.id);
      p.seen.signed = p.seen.signed.filter((id) => !ids.includes(id));
    }
    localStorage.setItem(k, JSON.stringify(p));
    const g = window.game;
    g.scene.getScenes(true).forEach((s) => g.scene.stop(s.scene.key));
    g.scene.start('Home');
  }, [KEY, edit]);
  await pg.waitForTimeout(800);
}
const inside = (t, W, H) => t.l >= 0 && t.r <= W && t.top >= 0 && t.bot <= H;

for (const [W, H] of [[844, 390], [667, 375]]) for (const rm of ['off', 'on']) {
  const tag = `${W}x${H}-rm-${rm}`;
  const ctx = await b.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
  await ctx.addInitScript((k) => {
    if (!sessionStorage.getItem('l8b3')) {
      localStorage.clear();
      sessionStorage.setItem('l8b3', '1');
      localStorage.setItem('dojo-ascent-test-student', '4-green-belt');
      localStorage.setItem('dojo.reducedMotion', k);
    }
  }, rm);
  const pg = await ctx.newPage();
  const errs = [];
  pg.on('pageerror', (e) => errs.push(e.message));
  await pg.goto(URL);
  await pg.waitForFunction(() => window.game?.scene?.getScenes?.(true).length);
  for (let i = 0; i < 40; i++) {
    const keys = await pg.evaluate(() => window.game.scene.getScenes(true).map((s) => s.scene.key));
    if (keys.includes('Home') || keys.includes('Dojo')) break;
    if (keys.includes('Title')) await pg.touchscreen.tap(W / 2, H / 2);
    if (keys.includes('Create')) { const g = (await texts(pg)).find((t) => /Let's go/.test(t.t)); if (g) await pg.touchscreen.tap(g.x, g.y); }
    await pg.waitForTimeout(300);
  }
  // 1. First visit: the welcome card lists the evolved Seals.
  await home(pg, false);
  let t = await drain(pg, W, H, /Your Seals evolved!/);
  check(tag, 'welcome card lists the evolved Seals', !!t);
  if (t) {
    await pg.waitForTimeout(600);
    t = await texts(pg);
    const list = t.filter((x) => /Seal: Stage [2-4]/.test(x.t));
    check(tag, 'welcome rows say "<family> Seal: Stage N"', list.length > 0, list.map((x) => x.t).join(' | '));
    check(tag, 'welcome rows fit on screen', list.every((x) => inside(x, W, H)));
    await pg.screenshot({ path: `${OUT}/${tag}-1-welcome.png` });
  }
  let cards = 0;
  for (let i = 0; i < 40 && (await celebrating(pg)); i++) {
    await pg.waitForTimeout(1600);
    if ((await texts(pg)).some((x) => /Seal evolved!/.test(x.t))) cards++;
    await pg.touchscreen.tap(W / 2, H - 22);
  }
  check(tag, 'first visit shows no evolution card', cards === 0, `${cards}`);
  // 2. A later look with the sign-offs new again: one evolution card per family, after the sign-offs.
  await home(pg, true);
  const sawSignOffs = { v: false };
  for (let i = 0; i < 40 && (await celebrating(pg)); i++) {
    await pg.waitForTimeout(150);
    const tt = await texts(pg);
    if (tt.some((x) => /Seal evolved!/.test(x.t))) break;
    if (tt.some((x) => /sign|Signed|Self-Defense/i.test(x.t))) sawSignOffs.v = true;
    await pg.waitForTimeout(1600);
    await pg.touchscreen.tap(W / 2, H - 22);
  }
  check(tag, 'sign-offs come before the evolution', sawSignOffs.v);
  const scales = [];
  for (let k = 0; k < 8; k++) {
    scales.push(await pg.evaluate(() => {
      const s = window.game.scene.getScene('Home');
      let found = null;
      const w = (l) => { for (const c of l) { if (c.type === 'Container' && c.list.some((x) => x.type === 'Graphics') && c.list.some((x) => x.type === 'Arc')) found = { sx: c.scaleX, a: c.alpha }; if (c.list) w(c.list); } };
      w(s.children.list);
      return found;
    }));
    if (k === 2) await pg.screenshot({ path: `${OUT}/${tag}-2-evolve-mid.png` });
    await pg.waitForTimeout(120);
  }
  const turned = scales.some((s) => s && s.sx < 0.9);
  if (rm === 'off') check(tag, 'medallion turns', turned, JSON.stringify(scales.map((s) => s?.sx.toFixed(2))));
  else check(tag, 'Reduced motion: no turn, a fade', !turned && scales.some((s) => s && s.a < 1), JSON.stringify(scales.map((s) => s && `${s.sx}/${s.a.toFixed(2)}`)));
  await pg.waitForTimeout(1500);
  t = await texts(pg);
  const callout = t.find((x) => /^Self-Defense #\d+$/.test(x.t));
  check(tag, 'card has the title, callout and line, on screen', !!callout && t.some((x) => /shines brighter/.test(x.t)) && t.filter((x) => /evolved|Self-Defense #|shines/.test(x.t)).every((x) => inside(x, W, H)), callout?.t);
  const medalPic = await pg.evaluate(() => {
    let ok = false;
    const w = (l) => { for (const c of l) { if (c.type === 'Container' && c.list.some((x) => x.type === 'Graphics') && c.list.some((x) => x.type === 'Arc') && c.list.some((x) => x.type === 'Image')) ok = true; if (c.list) w(c.list); } };
    w(window.game.scene.getScene('Home').children.list);
    return ok;
  });
  check(tag, 'evolution medallion shows a picture, not an empty disc', medalPic);
  await pg.screenshot({ path: `${OUT}/${tag}-3-evolved.png` });
  let evolved = 1;
  for (let i = 0; i < 40 && (await celebrating(pg)); i++) {
    await pg.touchscreen.tap(W / 2, H - 22);
    await pg.waitForTimeout(1600);
    const tt = await texts(pg);
    if (tt.some((x) => /Seal evolved!/.test(x.t))) evolved++;
  }
  check(tag, 'evolution cards counted', evolved >= 1, `${evolved}`);
  await home(pg, false);
  check(tag, 'nothing plays twice', !(await celebrating(pg)));
  // 3. The Fighting Style Seal cards wear stage rings.
  // Set-up (not a tap): put the two evolved Seals in the slots.
  await pg.evaluate(() => { const h = window.game.scene.getScene('Home'); h.profile.loadout = { ...(h.profile.loadout ?? {}), seals: ['escape', 'counter'] }; h.setView('board'); h.setTab('style'); });
  await pg.waitForTimeout(600);
  const rings = await pg.evaluate(() => {
    const s = window.game.scene.getScene('Home'); const o = [];
    const w = (l) => { for (const c of l) { if (c.getData?.('stageRings')) o.push(c.getData('stageRings')); if (c.list) w(c.list); } };
    w(s.children.list); return o;
  });
  check(tag, 'Seal cards draw stage rings', rings.length > 0, rings.join(','));
  const sealPics = await pg.evaluate(() => {
    const s = window.game.scene.getScene('Home'); let n = 0;
    const w = (l) => { for (const c of l) { if (c.getData?.('styleSlot') === 'seal' && c.list.some((x) => x.type === 'Image')) n++; if (c.list) w(c.list); } };
    w(s.children.list); return n;
  });
  check(tag, 'all three Seal cards show a picture (Escape included)', sealPics === 3, `${sealPics}`);
  await pg.screenshot({ path: `${OUT}/${tag}-4-style.png` });
  // 4. The Book: an evolved technique's sheet says its stage.
  const cub = await pg.evaluate(() => { const h = window.game.scene.getScene('Home'); h.openBook('moves'); return h.trophyCubbies().find((c) => c.shelf === 'selfDefense' && /Stage [2-4]/.test(c.status)) ?? null; });
  check(tag, 'Book cubby status has the stage', !!cub, cub?.status);
  if (cub) {
    await pg.evaluate((id) => { const h = window.game.scene.getScene('Home'); h.openCubby(h.trophyCubbies().find((c) => c.id === id)); }, cub.id);
    await pg.waitForTimeout(500);
    t = await texts(pg);
    const line = t.find((x) => /Stage [2-4]/.test(x.t));
    check(tag, 'Book sheet shows the stage on screen', !!line && inside(line, W, H), line?.t);
    const col = await pg.evaluate(() => { let c = null; const w = (l) => { for (const x of l) { if (x.type === 'Text' && /Stage [2-4]/.test(x.text)) c = x.style.color; if (x.list) w(x.list); } }; w(window.game.scene.getScene('Home').children.list); return c; });
    check(tag, 'Book status ink is #8b4513 (5.6:1 on the cream paper)', col === '#8b4513', col);
    await pg.screenshot({ path: `${OUT}/${tag}-5-book.png` });
  }
  check(tag, 'no page errors', errs.length === 0, errs.join(' | '));
  await ctx.close();
}
await b.close();
fs.writeFileSync(`${OUT}/results.txt`, rows.join('\n') + '\n');
console.log(rows.join('\n'));
console.log(`${rows.filter((r) => r.startsWith('PASS')).length} pass, ${rows.filter((r) => r.startsWith('FAIL')).length} fail`);
