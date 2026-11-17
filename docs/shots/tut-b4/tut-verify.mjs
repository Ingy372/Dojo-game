// TUT-B4: TUT-B3's walk of the tutorial floor (story, path, stones, bow, dummies, STRIKE, Swarmers,
// Counter, Dash, vault chest, boss, close) plus the #536 QA fixes: a success line shows alone, no
// room words on tutorial doors but BOSS, no combo in the Training Hall, the Shadows! tip goes on clear,
// the Brute waits under its tip, and the vault chest shows at once and counts the moment it opens.
// Moves are set up from the page (the hero is placed next to what it should reach); every tip,
// Got it, Bow, STRIKE and COUNTER is a real tap.
// Usage: URL=http://localhost:5192/ OUT=/workspace/tutb4-shots node tut-verify.mjs
import { chromium } from 'playwright';
import fs from 'fs';

const URL = process.env.URL || 'http://localhost:5173/';
const OUT = process.env.OUT || '/workspace/tutb4-shots';
const SIZES = process.env.SIZES ? JSON.parse(process.env.SIZES) : [[844, 390], [667, 375]];
fs.mkdirSync(OUT, { recursive: true });
const rows = [];
const check = (where, name, ok, info = '') => rows.push(`${ok ? 'PASS' : 'FAIL'}  ${where}  ${name}${info ? '  (' + info + ')' : ''}`);
const b = await chromium.launch();

const texts = (pg) => pg.evaluate(() => {
  const o = [];
  for (const s of window.game.scene.getScenes(true)) {
    const w = (l, vis) => { for (const c of l) { const v = vis && c.visible !== false && (c.alpha ?? 1) > 0; if (c.list) w(c.list, v); if (c.type === 'Text' && c.text && v) { const bb = c.getBounds(); o.push({ t: c.text, x: bb.x, y: bb.y, w: bb.width, h: bb.height, cx: bb.centerX, cy: bb.centerY }); } } };
    w(s.children.list, true);
  }
  return o;
});
const st = (pg) => pg.evaluate(() => {
  const s = window.game.scene.getScene('Game');
  if (!s?.sys.isActive() || !s.world) return null;
  const f = s.tflow;
  const p = s.world.players[s.me];
  return {
    room: s.room.id, step: f ? f.order?.[f.index] ?? null : null, index: f?.index, phase: f?.phase, menu: s.menuOpen, focus: p.focus,
    enemies: s.world.enemies.filter((e) => e.mode !== 'defeated').map((e) => ({ id: e.def.id, x: e.pos.x, y: e.pos.y })),
    goal: s.world.goal, stones: s.world.stones && { wave: s.world.stones.wave, fill: s.world.stones.fillLeft, safe: s.world.stones.safeSpot, done: s.world.stones.done },
    cleared: s.world.progress.cleared, doorsOpen: s.world.progress.doorsOpen, gotIt: !!s.gotItBtn, sensei: s.senseiText?.text ?? '',
    doors: s.doorViews.map((d) => d.at), chest: s.room.chest, words: s.doorViews.map((d) => d.label.text).filter(Boolean),
    chestShown: (s.chestImgs[0]?.alpha ?? 0) > 0, chestOpened: s.world.progress.chestOpened, combo: s.comboText.visible,
  };
});
const tapText = async (pg, re) => {
  const t = (await texts(pg)).find((x) => re.test(x.t));
  if (!t) return false;
  await pg.touchscreen.tap(t.cx, t.cy);
  await pg.waitForTimeout(250);
  return true;
};
const until = async (pg, fn, ms = 15000) => {
  const end = Date.now() + ms;
  while (Date.now() < end) { const s = await st(pg); if (s && fn(s)) return s; await pg.waitForTimeout(100); }
  return null;
};
const place = (pg, x, y) => pg.evaluate(([x, y]) => {
  const s = window.game.scene.getScene('Game');
  const p = s.world.players[s.me];
  p.pos = { x, y };
  p.path = null;
  s.prevPos = { x, y };
}, [x, y]);
const gotIt = async (pg) => (await until(pg, (s) => s.gotIt, 20000)) && tapText(pg, /^Got it$/);
const onScreen = (tx, W, H) => tx.every((t) => t.x >= -1 && t.y >= -1 && t.x + t.w <= W + 1 && t.y + t.h <= H + 1);

for (const [W, H] of SIZES) {
  const tag = `${W}x${H}`;
  const ctx = await b.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
  await ctx.addInitScript(() => {
    if (!sessionStorage.getItem('tutb4')) {
      localStorage.clear();
      sessionStorage.setItem('tutb4', '1');
      localStorage.setItem('dojo-ascent-test-student', '1-white-belt-new');
      localStorage.setItem('dojo.reducedMotion', '0');
    }
  });
  const pg = await ctx.newPage();
  const errs = [];
  pg.on('pageerror', (e) => errs.push(e.message));
  await pg.goto(URL);
  await pg.waitForFunction(() => window.game?.scene?.getScenes?.(true).length);
  const shot = (n) => pg.screenshot({ path: `${OUT}/${tag}-${n}.png` });
  for (let i = 0; i < 60; i++) {
    const keys = await pg.evaluate(() => window.game.scene.getScenes(true).map((s) => s.scene.key));
    if (keys.includes('Game')) break;
    if (keys.includes('Title')) await pg.touchscreen.tap(W / 2, H / 2);
    if (keys.includes('Create')) await pg.touchscreen.tap(W * 0.2, H - 37);
    await pg.waitForTimeout(400);
  }
  let s = await until(pg, (s) => s.room === 'tutorial-path');
  check(tag, 'a new student starts on the Tower Path', !!s, s?.room);
  await pg.waitForTimeout(800);
  let tx = await texts(pg);
  check(tag, 'story card 1 shows', tx.some((t) => t.t === 'Long ago, a great light shone.'), tx.map((t) => t.t).join(' | '));
  check(tag, 'story card words on screen', onScreen(tx, W, H));
  await shot('01-story');
  for (let i = 0; i < 4; i++) { await pg.touchscreen.tap(W / 2, H / 2); await pg.waitForTimeout(400); }
  s = await until(pg, (s) => s.gotIt);
  check(tag, 'path tip after the cards, Sensei line first', !!s && /The Tower is waking up/.test(s.sensei) && /Tap to walk/.test(s.sensei), s?.sensei);
  await shot('02-path-tip');
  await tapText(pg, /^Got it$/);
  check(tag, 'no stones before the glowing spot', (await st(pg)).stones.fill === 0);
  s = await st(pg);
  await place(pg, s.goal.pos?.x ?? s.goal.x, s.goal.pos?.y ?? s.goal.y);
  s = await until(pg, (s) => s.gotIt && /Red circle/.test(s.sensei));
  check(tag, 'stones tip after the spot', !!s, s?.sensei);
  await shot('03-stones-tip');
  await tapText(pg, /^Got it$/);
  // Wave 1: stand in the circle twice (stumble), then the help arrow shows.
  for (let miss = 0; miss < 2; miss++) {
    s = await until(pg, (s) => s.stones.fill > 0);
    const spot = await pg.evaluate(() => window.game.scene.getScene('Game').stoneWarn.spots[0]);
    await place(pg, spot.x, spot.y);
    if (miss === 0) { await pg.waitForTimeout(500); await shot('04-stone-wave'); }
    s = await until(pg, (s) => s.stones.fill === 0);
    await pg.waitForTimeout(250);
    if (miss === 0) {
      s = await st(pg);
      check(tag, 'stumble says the retry line', /Oops! Dust off/.test(s.sensei), s.sensei);
      await shot('05-stumble');
    }
  }
  s = await until(pg, (s) => s.stones.fill > 0 && !!s.stones.safe);
  check(tag, 'help arrow after 2 misses', !!s, JSON.stringify(s?.stones));
  await pg.waitForTimeout(300);
  check(tag, 'help line shows', /Watch the red/.test((await st(pg)).sensei));
  await shot('06-help-arrow');
  await place(pg, s.stones.safe.x, s.stones.safe.y);
  // Waves 2 and 3: stand well away.
  s = await until(pg, (s) => s.stones.wave >= 1);
  await place(pg, 2.5, 9.5);
  s = await until(pg, (s) => /Bow at the door/.test(JSON.stringify(s)) || s.stones.done, 90000);
  await pg.waitForTimeout(600);
  tx = await texts(pg);
  check(tag, 'bow prompt after the stones', tx.some((t) => /Bow at the door/.test(t.t)), tx.map((t) => t.t).join(' | '));
  await shot('07-bow');
  await tapText(pg, /^Bow$/) || await tapText(pg, /Bow/);
  s = await until(pg, (s) => s.doorsOpen && !s.menu, 10000);
  await pg.waitForTimeout(800);
  s = await st(pg);
  check(tag, 'door open after the bow', !!s?.doorsOpen, JSON.stringify(s));
  await shot('08-door');
  await place(pg, s.doors[0].x, s.doors[0].y + 0.6);
  // Training Hall.
  s = await until(pg, (s) => s.room === 'training-hall' && s.gotIt, 20000);
  check(tag, 'Training Hall dummies tip', !!s && /Walk close/.test(s.sensei), s?.sensei);
  await shot('09-dummies');
  await tapText(pg, /^Got it$/);
  for (let i = 0; i < 40; i++) {
    s = await st(pg);
    if (s.gotIt || !s.enemies.some((e) => e.id === 'practice-dummy')) break;
    const e = s.enemies[0];
    await place(pg, e.x, e.y + 0.9);
    await pg.waitForTimeout(500);
  }
  s = await until(pg, (s) => /Every hit fills your Focus!/.test(s.sensei), 8000);
  check(tag, 'the dummies success line shows alone', !!s && !s.gotIt && !/\n/.test(s.sensei), s?.sensei);
  await shot('S1-success-alone');
  check(tag, 'no wave words in the tutorial', !(await texts(pg)).some((x) => /Wave|Final wave/.test(x.t)));
  let combo = false;
  s = await until(pg, (s) => s.gotIt && /STRIKE/.test(s.sensei), 30000);
  if (!s) {
    // Focus not full yet: hit the big dummy until it is.
    for (let i = 0; i < 60 && !(s = await st(pg)).gotIt; i++) { const e = s.enemies[0]; if (e) await place(pg, e.x, e.y + 1.1); await pg.waitForTimeout(300); }
  }
  s = await st(pg);
  check(tag, 'STRIKE tip with the big dummy', s.gotIt && /STRIKE/.test(s.sensei) && s.enemies.some((e) => e.id === 'big-practice-dummy'), s.sensei);
  await shot('10-strike-tip');
  await tapText(pg, /^Got it$/);
  await pg.waitForTimeout(400);
  await shot('11-strike-glow');
  const e = (await st(pg)).enemies[0];
  await place(pg, e.x, e.y + 0.9);
  await tapText(pg, /^STRIKE$/);
  s = await until(pg, (s) => /What a STRIKE/.test(s.sensei) || s.gotIt, 8000);
  check(tag, 'STRIKE well done', !!s && /What a STRIKE/.test(s.sensei), s?.sensei);
  for (let i = 0; i < 60 && !(s = await st(pg)).gotIt; i++) { const e = s.enemies[0]; if (e) await place(pg, e.x, e.y + 1.1); await pg.waitForTimeout(300); }
  check(tag, 'Swarmers tip', /Shadows!/.test(s.sensei), s.sensei);
  await shot('12-swarmers-tip');
  await tapText(pg, /^Got it$/);
  for (let i = 0; i < 120; i++) {
    s = await st(pg);
    if (s.doorsOpen) break;
    const e = s.enemies[0];
    if (e) { await pg.evaluate(() => { const g = window.game.scene.getScene('Game'); g.world.players[g.me].health = 99; }); await place(pg, e.x + 0.6, e.y); }
    combo ||= s.combo;
    await pg.waitForTimeout(300);
  }
  check(tag, 'Training Hall cleared', s.doorsOpen);
  check(tag, 'no combo count in the Training Hall', !combo);
  await pg.waitForTimeout(800);
  s = await st(pg);
  check(tag, 'Shadows! tip gone after the clear', !/Shadows!/.test(s.sensei), s.sensei);
  check(tag, 'no room word on the Training Hall door', s.words.length === 0, s.words.join(','));
  await shot('13-hall-clear');
  s = await st(pg);
  await place(pg, s.doors[0].x, s.doors[0].y + 0.6);
  // First Steps Hall: the guided Counter (tap COUNTER when it glows), then Dash.
  s = await until(pg, (s) => s.room === 'tutorial-hall', 20000);
  check(tag, 'First Steps Hall next', !!s);
  s = await until(pg, (s) => s.gotIt, 8000);
  check(tag, 'the Brute waits under its tip', !!s && /Red circle again/.test(s.sensei) && s.enemies.some((e) => e.id === 'brute'), s?.sensei);
  await shot('14-first-steps');
  for (let i = 0; i < 300; i++) {
    s = await st(pg);
    if (s.doorsOpen || s.room !== 'tutorial-hall') break;
    if (s.gotIt) { if (/DASH/.test(s.sensei)) await shot('15-dash-tip'); await tapText(pg, /^Got it$/); continue; }
    await pg.evaluate(() => { const g = window.game.scene.getScene('Game'); g.world.players[g.me].health = 99; });
    const brute = s.enemies.find((e) => e.id === 'brute');
    if (brute) { await place(pg, brute.x, brute.y + 1.4); await tapText(pg, /^COUNTER$/); }
    else if (s.enemies[0]) { if (i % 6 === 0) await tapText(pg, /^DASH$/); const e = s.enemies[0]; await place(pg, e.x + 0.6, e.y); }
    else if (!s.menu) { await tapText(pg, /^(Got it|Continue|OK|Take it)$/); }
    await pg.waitForTimeout(250);
  }
  check(tag, 'First Steps Hall cleared', (await st(pg)).doorsOpen || (await st(pg)).room !== 'tutorial-hall');
  await shot('16-insight');
  // The vault (chest) and the Keep (boss), then the close line on the door tip.
  let vault = null;
  let opened = false;
  for (let i = 0; i < 200; i++) {
    s = await st(pg);
    if (!s) break;
    if (s.room === 'tutorial-keep' && s.gotIt && /door home/.test(s.sensei)) break;
    if (s.room === 'tutorial-vault' && !vault) {
      vault = await until(pg, (s) => s.gotIt, 8000);
      check(tag, 'vault chest shows with its tip, door shut', !!vault && vault.chestShown && !vault.doorsOpen && /treasure chest/.test(vault.sensei), JSON.stringify(vault));
      await shot('V1-vault-chest');
      continue;
    }
    if (s.room === 'tutorial-vault' && s.chestOpened && !opened) {
      opened = true;
      check(tag, 'the chest step counts the moment it opens', s.index >= 10, `index ${s.index}`);
    }
    if (s.gotIt) { await tapText(pg, /^Got it$/); continue; }
    await pg.evaluate(() => { const g = window.game.scene.getScene('Game'); g.world.players[g.me].health = 99; for (const e of g.world.enemies) if (e.mode !== 'defeated') e.health = Math.min(e.health, 1); });
    if (s.menu) { const t = (await texts(pg)).filter((x) => /^(Take|Keep|OK|Continue|Next|Tap)/.test(x.t)); if (t[0]) await pg.touchscreen.tap(t[0].cx, t[0].cy); else await pg.touchscreen.tap(W / 2, H / 2); }
    else if (s.doorsOpen) await place(pg, s.doors[0].x, s.doors[0].y + 0.6);
    else if (s.enemies[0]) await place(pg, s.enemies[0].x, s.enemies[0].y + 1.2);
    else if (s.chest) await place(pg, s.chest.x, s.chest.y + 0.8);
    await pg.waitForTimeout(400);
  }
  s = await st(pg);
  check(tag, 'the vault was seen and its chest opened', !!vault && opened);
  check(tag, 'the close line on the last door', s.room === 'tutorial-keep' && /Train in class\. Your belt opens the Gate\./.test(s.sensei), `${s.room}: ${s.sensei}`);
  await pg.waitForTimeout(300);
  await shot('17-close');
  await ctx.close();
  check(tag, 'no page errors', errs.length === 0, errs.join(' / '));
}
await b.close();
fs.writeFileSync(`${OUT}/results.txt`, rows.join('\n') + '\n');
console.log(rows.join('\n'));
console.log(`${rows.filter((r) => r.startsWith('PASS')).length}/${rows.filter((r) => r.startsWith('FAIL')).length}`);
