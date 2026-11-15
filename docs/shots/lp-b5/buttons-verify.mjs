// LP-B5 (L7) verify-ui-shots: no STANCE button in a fight, VIRTUE only at full Focus in one fixed spot
// (calm 200 ms grow, none with Reduced motion), hidden VIRTUE can't be tapped, the first-time line once.
// Usage: OUT=/workspace/shots/lp-b5 URL=http://localhost:5192/ node buttons-verify.mjs
import { chromium } from 'playwright';
import fs from 'fs';
const URL_ = process.env.URL || 'http://localhost:5173/';
const OUT = process.env.OUT || '/workspace/shots/lp-b5';
const LINE = 'Your Focus is full. Tap VIRTUE!';
fs.mkdirSync(OUT, { recursive: true });
const sizes = [[667, 375], [932, 430]];
const STUDENTS = process.env.STUDENTS ? process.env.STUDENTS.split(',') : ['1-white-belt-new', '2-white-belt-3-signoffs', '5-white-belt-age-6-9', '6-orange-typical'];
const rows = [];
const check = (where, name, ok, info = '') => rows.push(`${ok ? 'PASS' : 'FAIL'}  ${where}  ${name}${info ? '  (' + info + ')' : ''}`);
const b = await chromium.launch();

async function open(W, H, rm, student) {
  const ctx = await b.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1, hasTouch: true, isMobile: true });
  await ctx.addInitScript(([s, k]) => {
    if (!sessionStorage.getItem('lpb5-init')) { localStorage.clear(); sessionStorage.setItem('lpb5-init', '1'); }
    localStorage.setItem('dojo-ascent-test-student', s);
    localStorage.setItem('dojo.reducedMotion', k === '1' ? 'on' : 'off');
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
      const g = (await texts(pg, 'Create')).find((t) => /Let's go/.test(t.t));
      if (g) await pg.touchscreen.tap(g.cx, g.cy);
    }
    await pg.waitForTimeout(300);
  }
  return { ctx, pg };
}
const texts = (pg, key) => pg.evaluate((key) => {
  const h = window.game.scene.getScene(key);
  const o = [];
  const w = (l, vis) => { for (const c of l) { const v = vis && c.visible !== false && (c.alpha ?? 1) > 0; if (c.list) w(c.list, v); if (c.type === 'Text' && c.text && v) { const b = c.getBounds(); o.push({ t: c.text, x: b.x, y: b.y, w: b.width, h: b.height, cx: b.centerX, cy: b.centerY }); } } };
  w(h.children.list, true);
  return o;
}, key);
const startRun = async (pg) => {
  await pg.evaluate(() => {
    const k = 'dojo-ascent-profile-v1';
    const p = JSON.parse(localStorage.getItem(k) || '{}');
    // A returning player: past the tutorial, no lessons seen yet, so the VIRTUE line is free to show.
    Object.assign(p, { runsPlayed: 5, runsStarted: 5, guideStep: 99, pathIntroSeen: true, creedSeen: true, lessons: { seen: [], sessionDays: [] } });
    localStorage.setItem(k, JSON.stringify(p));
    localStorage.removeItem('dojo-ascent-run-in-progress');
    const g = window.game;
    g.scene.getScenes(true).forEach((s) => g.scene.stop(s.scene.key));
    g.scene.start('Dojo');
  });
  await pg.waitForTimeout(1500);
  await pg.evaluate(() => window.game.scene.getScene('Dojo').goTower());
  await pg.waitForFunction(() => { const s = window.game.scene.getScene('Game'); return s?.sys.isActive() && s.run; }, null, { timeout: 15000 });
  await pg.waitForTimeout(800);
  const bow = (await texts(pg, 'Game')).find((t) => t.t === 'Bow');
  if (bow) await pg.touchscreen.tap(bow.cx, bow.cy);
  await pg.waitForTimeout(2500);
};
const buttons = (pg) => pg.evaluate(() => {
  const s = window.game.scene.getScene('Game');
  return s.buttons.objects.map((c) => ({ label: c.list.find((o) => o.type === 'Text')?.text, visible: c.visible, x: c.x, y: c.y, alpha: c.alpha, scale: c.scale }));
});
const pause = (pg, on) => pg.evaluate((on) => { window.game.scene.getScene('Game').menuOpen = on; }, on);

for (const [W, H] of sizes) for (const rm of ['1', '0']) for (const student of STUDENTS) {
  const where = `${W}x${H} rm=${rm} ${student}`;
  const tag = `${student.split('-')[0]}-${W}x${H}-rm${rm}`;
  const { ctx, pg } = await open(W, H, rm, student);
  check(where, 'Reduced motion read back', (await pg.evaluate(() => localStorage.getItem('dojo.reducedMotion'))) === (rm === '1' ? 'on' : 'off'));
  await startRun(pg);
  const me = await pg.evaluate(() => { const s = window.game.scene.getScene('Game'); return s.world.players[s.me]; });
  const hasVirtue = !!me.virtue;
  const stances = me.stances?.length ?? 0;
  // Focus empty: the most a player sees at once.
  await pause(pg, true);
  await pg.evaluate(() => { const s = window.game.scene.getScene('Game'); const p = s.world.players[s.me]; p.focus = 0; p.virtueTicks = 0; });
  await pg.waitForTimeout(300);
  let bs = await buttons(pg);
  const shown = bs.filter((x) => x.visible).map((x) => x.label);
  const allTx = (await texts(pg, 'Game')).map((t) => t.t);
  check(where, 'no STANCE button or Stance name in the fight', !bs.some((x) => x.label === 'STANCE') && !allTx.includes('STANCE'), `stances owned ${stances}`);
  check(where, `buttons on screen: ${shown.join('+')}`, shown.length <= 4 && !shown.includes('VIRTUE'), `${shown.length}`);
  const pre = bs.find((x) => x.label === 'VIRTUE');
  check(where, hasVirtue ? 'VIRTUE hidden below full Focus' : 'no Virtue earned: no VIRTUE button', hasVirtue ? !!pre && !pre.visible : !pre);
  await pg.screenshot({ path: `${OUT}/empty-${tag}.png` });
  // Every visible button is a 44pt+ target fully on screen.
  const geo = await pg.evaluate(() => window.game.scene.getScene('Game').buttons.objects.filter((c) => c.visible).map((c) => { const r = c.getBounds(); return { x: r.x, y: r.y, w: r.width, h: r.height }; }));
  check(where, 'buttons 44pt+ and on screen', geo.every((r) => r.w >= 44 && r.h >= 44 && r.x >= 0 && r.y >= 0 && r.x + r.w <= W + 1 && r.y + r.h <= H + 1));
  if (hasVirtue) {
    // Hidden VIRTUE can't be tapped.
    await pause(pg, false);
    await pg.evaluate(() => { const s = window.game.scene.getScene('Game'); s.world.players[s.me].focus = 0; });
    check(where, 'hidden VIRTUE spot is not a button', !(await pg.evaluate(([x, y]) => window.game.scene.getScene('Game').buttons.contains(x, y), [pre.x, pre.y])));
    await pg.touchscreen.tap(pre.x, pre.y);
    await pg.waitForTimeout(300);
    check(where, 'tap on hidden VIRTUE does nothing', (await pg.evaluate(() => { const s = window.game.scene.getScene('Game'); return s.world.players[s.me].virtueTicks; })) === 0);
    // Focus fills: VIRTUE comes in at the same spot. Frames at 0, ~100 and ~250 ms.
    await pause(pg, true);
    await pg.evaluate(() => { const s = window.game.scene.getScene('Game'); s.world.players[s.me].focus = 0; });
    await pg.waitForTimeout(200);
    const frames = await pg.evaluate(async () => {
      const s = window.game.scene.getScene('Game');
      const p = s.world.players[s.me];
      p.focus = 100; // COMBAT.focus.max
      const v = () => { const c = s.buttons.objects.find((c) => c.list.find((o) => o.type === 'Text')?.text === 'VIRTUE'); return { visible: c.visible, alpha: +c.alpha.toFixed(2), scale: +c.scale.toFixed(2), x: c.x, y: c.y }; };
      const out = [];
      const t0 = performance.now();
      for (const at of [0, 50, 100, 250]) { while (performance.now() - t0 < at + 20) await new Promise((r) => requestAnimationFrame(r)); out.push(v()); }
      return out;
    });
    const [f0, , f1, f2] = frames;
    check(where, 'VIRTUE appears at full Focus, same spot', f2.visible && f2.x === pre.x && f2.y === pre.y, JSON.stringify(f2));
    if (rm === '1') check(where, 'Reduced motion: just appears (no grow)', frames.every((f) => f.alpha === 1 && f.scale === 1), JSON.stringify(frames));
    else check(where, 'calm grow in ~200 ms, then still (no pulse)', (f0.alpha < 1 || f0.scale < 1) && f1.scale < 1 && f2.alpha === 1 && f2.scale === 1, JSON.stringify(frames));
    await pg.waitForTimeout(300);
    const settled = [];
    for (let i = 0; i < 6; i++) { settled.push((await buttons(pg)).find((x) => x.label === 'VIRTUE').scale); await pg.waitForTimeout(90); }
    check(where, 'no pulse while waiting', settled.every((s) => s === 1), settled.join(','));
    await pg.waitForTimeout(400);
    const line = (await texts(pg, 'Game')).find((t) => t.t.includes(LINE));
    check(where, 'first-time line shows', !!line);
    if (line) check(where, 'line clear of the buttons', !(await buttons(pg)).filter((x) => x.visible).some((bt) => Math.abs(bt.x - line.cx) < line.w / 2 + 30 && Math.abs(bt.y - line.cy) < line.h / 2 + 30));
    await pg.screenshot({ path: `${OUT}/full-${tag}.png` });
    // Tap it: the Virtue starts and the button steps away until Focus is full again.
    await pause(pg, false);
    await pg.touchscreen.tap(pre.x, pre.y);
    await pg.waitForTimeout(400);
    const after = await pg.evaluate(() => { const s = window.game.scene.getScene('Game'); return s.world.players[s.me].virtueTicks; });
    check(where, 'tap VIRTUE starts it, button hides', after > 0 && !(await buttons(pg)).find((x) => x.label === 'VIRTUE').visible, `ticks ${after}`);
    // Second fill, once the first line has gone: no line again.
    for (let i = 0; i < 40 && (await texts(pg, 'Game')).some((t) => t.t.includes(LINE)); i++) await pg.waitForTimeout(250);
    await pause(pg, true);
    await pg.evaluate(() => { const s = window.game.scene.getScene('Game'); const p = s.world.players[s.me]; p.virtueTicks = 0; p.focus = 0; });
    await pg.waitForTimeout(150);
    await pg.evaluate(() => { const s = window.game.scene.getScene('Game'); s.world.players[s.me].focus = 100; });
    await pg.waitForTimeout(1500);
    check(where, 'second fill: no line again', !(await texts(pg, 'Game')).some((t) => t.t.includes(LINE)));
    const seen = await pg.evaluate(() => JSON.parse(localStorage.getItem('dojo-ascent-profile-v1')).lessons.seen.filter((x) => x.id === 'lesson-virtue-ready').length);
    check(where, 'line saved as seen once (never again)', seen === 1, `${seen}`);
  }
  check(where, 'no page errors', pg.errs.length === 0, pg.errs.join(' | ').slice(0, 200));
  await ctx.close();
}
await b.close();
fs.writeFileSync(`${OUT}/results.txt`, rows.join('\n') + '\n');
console.log(rows.join('\n'));
console.log(`${rows.filter((r) => r.startsWith('PASS')).length} pass, ${rows.filter((r) => r.startsWith('FAIL')).length} fail`);
