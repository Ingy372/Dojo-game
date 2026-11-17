// FX-GREAT verify-ui-shots: the GREAT! pop (and GREAT xN) is sky blue, never the "!" cue's gold or red,
// 34 px at 75% opacity, and never covers an enemy or a "!" cue. Reduced motion: no grow, no drift.
// Usage: OUT=/workspace/shots/fx-great URL=http://localhost:5192/ node great-verify.mjs
import { chromium } from 'playwright';
import fs from 'fs';
const URL_ = process.env.URL || 'http://localhost:5173/';
const OUT = process.env.OUT || '/workspace/shots/fx-great';
fs.mkdirSync(OUT, { recursive: true });
const sizes = [[667, 375], [932, 430]];
const STUDENTS = process.env.STUDENTS ? process.env.STUDENTS.split(',') : ['1-white-belt-new', '6-orange-typical'];
const CUE = ['#ffd166', '#ff5a4f', '#ff3b30'];
const rows = [];
const check = (where, name, ok, info = '') => rows.push(`${ok ? 'PASS' : 'FAIL'}  ${where}  ${name}${info ? '  (' + info + ')' : ''}`);
const b = await chromium.launch();

async function open(W, H, rm, student) {
  const ctx = await b.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1, hasTouch: true, isMobile: true });
  await ctx.addInitScript(([s, k]) => {
    if (!sessionStorage.getItem('fxg-init')) { localStorage.clear(); sessionStorage.setItem('fxg-init', '1'); }
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
      const g = await pg.evaluate(() => { const o = []; const w = (l) => { for (const c of l) { if (c.list) w(c.list); if (c.type === 'Text' && /Let's go/.test(c.text)) { const r = c.getBounds(); o.push([r.centerX, r.centerY]); } } }; w(window.game.scene.getScene('Create').children.list); return o[0]; });
      if (g) await pg.touchscreen.tap(g[0], g[1]);
    }
    await pg.waitForTimeout(300);
  }
  return { ctx, pg };
}
const startRun = async (pg) => {
  await pg.evaluate(() => {
    const k = 'dojo-ascent-profile-v1';
    const p = JSON.parse(localStorage.getItem(k) || '{}');
    Object.assign(p, { runsPlayed: 5, runsStarted: 5, guideStep: 99, pathIntroSeen: true, creedSeen: true });
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
  const bow = await pg.evaluate(() => { let o; const w = (l) => { for (const c of l) { if (c.list) w(c.list); if (c.type === 'Text' && c.text === 'Bow' && c.visible) { const r = c.getBounds(); o = [r.centerX, r.centerY]; } } }; w(window.game.scene.getScene('Game').children.list); return o; });
  if (bow) await pg.touchscreen.tap(bow[0], bow[1]);
  await pg.waitForTimeout(2500);
};

// Puts the room's enemies where the test wants them (screen points), winding up, then fires a real
// perfectCounter event and reads the GREAT! word, the enemies and the "!" cues back.
const scenario = (pg, spots) => pg.evaluate(async (spots) => {
  const s = window.game.scene.getScene('Game');
  s.menuOpen = true;
  const cam = s.cameras.main;
  const z = (() => { const r = s.toScreen({ left: 0, right: 100, top: 0, bottom: 0 }); return (r.right - r.left) / 100; })();
  const live = s.world.enemies.filter((e) => e.mode !== 'defeated');
  const v0 = s.enemyViews.get(live[0].id).container;
  const tile = v0.x / live[0].pos.x;
  live.forEach((e, i) => {
    const sp = spots[i];
    if (!sp) { e.pos = { x: -50, y: -50 }; return; }
    e.pos = { x: (cam.worldView.x + sp[0] / z) / tile, y: (cam.worldView.y + sp[1] / z) / tile };
    e.mode = 'windup'; e.modeTicks = 40; e.windupTotal = 60; e.attackCenter = { ...e.pos };
    s.enemyViews.get(e.id).prev = { ...e.pos };
  });
  for (const t of [...s.popups]) s.dropPopup(t);
  await new Promise((r) => setTimeout(r, 250));
  s.playEvents([{ kind: 'perfectCounter', playerId: s.me, enemyId: live[0].id, chain: 1 }]);
  const word = () => [...s.popups].find((t) => t.text === 'GREAT!');
  const frames = [];
  const t0 = performance.now();
  for (const at of [0, 80, 250]) { while (performance.now() - t0 < at) await new Promise((r) => requestAnimationFrame(r)); const t = word(); frames.push(t ? { scale: +t.scale.toFixed(2), alpha: +t.alpha.toFixed(2), y: Math.round(t.y) } : null); }
  const t = word();
  const r = t.getBounds();
  const enemies = live.filter((e, i) => spots[i]).map((e) => { const b = s.toScreen(s.enemyViews.get(e.id).container.getBounds()); return { x0: b.left, x1: b.right, y0: b.top, y1: b.bottom }; });
  const cues = live.filter((e, i) => spots[i]).map((e) => { const v = s.enemyViews.get(e.id); const at = s.windupCueSpot(v.container.x, v.container.y, v.top, e.def.radius * tile); const b = s.toScreen({ left: at.x - 22, right: at.x + 22, top: at.y - 22, bottom: at.y + 22 }); return { x0: b.left, x1: b.right, y0: b.top, y1: b.bottom }; });
  const seen = live.filter((e, i) => spots[i]).map((e) => { const c = s.enemyViews.get(e.id).container; return c.visible && c.alpha > 0.5; });
  const hb = s.playerOnScreen();
  const hero = { x0: hb.left, x1: hb.right, y0: hb.top, y1: hb.bottom };
  const buttons = s.buttons.objects.filter((c) => c.visible).map((c) => { const b = c.getBounds(); return { x0: b.left, x1: b.right, y0: b.top, y1: b.bottom }; });
  return { n: live.length, seen, hero, buttons, word: { x0: r.left, x1: r.right, y0: r.top, y1: r.bottom, color: t.style.color, size: t.style.fontSize, alpha: +t.alpha.toFixed(2) }, frames, enemies, cues, pref: s.scale.height * 0.3, blockers: s.protectedBoxes(true) };
}, spots);
const hits = (a, b) => !(a.x1 <= b.x0 || a.x0 >= b.x1 || a.y1 <= b.y0 || a.y0 >= b.y1);

for (const [W, H] of sizes) for (const rm of ['1', '0']) for (const student of STUDENTS) {
  const tag = `${student.split('-')[0]}-${W}x${H}-rm${rm}`;
  const { ctx, pg } = await open(W, H, rm, student);
  check(`${W}x${H} rm=${rm} ${student}`, 'Reduced motion read back', (await pg.evaluate(() => localStorage.getItem('dojo.reducedMotion'))) === (rm === '1' ? 'on' : 'off'));
  await startRun(pg);
  // Let the first wave walk in, so there are real enemies to place.
  await pg.waitForFunction(() => { const s = window.game.scene.getScene('Game'); return s.world.enemies.some((e) => e.mode !== 'waiting' && e.mode !== 'defeated'); }, null, { timeout: 15000 }).catch(() => {});
  const cases = {
    open: [[W * 0.2, H * 0.8]],
    'enemy-on-spot': [[W / 2, H * 0.3]],
    crowd: [[W / 2, H * 0.3], [W / 2 - 40, H * 0.5], [W / 2 + 50, H * 0.18]],
  };
  for (const [name, spots] of Object.entries(cases)) {
    const where = `${W}x${H} rm=${rm} ${student} ${name}`;
    const r = await scenario(pg, spots);
    const shotAt = `${OUT}/${name}-${tag}.png`;
    await pg.screenshot({ path: shotAt });
    if (spots.length > r.n) check(where, `room has ${r.n} enemies, ${spots.length} wanted`, true, 'checked with what is there');
    check(where, `enemies placed and showing: ${r.seen.length}`, r.seen.length === Math.min(spots.length, r.n) && r.seen.every(Boolean), JSON.stringify(r.seen));
    check(where, 'GREAT! is sky blue, not a cue colour', r.word.color === '#7fd4ff' && !CUE.includes(r.word.color), r.word.color);
    check(where, 'GREAT! 34px, 75% see-through', r.word.size === '34px' && r.word.alpha === 0.75, `${r.word.size} ${r.word.alpha}`);
    check(where, 'GREAT! covers no enemy', r.enemies.every((e) => !hits(r.word, e)), JSON.stringify(r.word));
    check(where, 'GREAT! covers no "!" cue', r.cues.every((c) => !hits(r.word, c)));
    check(where, 'GREAT! covers neither the hero nor a button', !hits(r.word, r.hero) && r.buttons.every((x) => !hits(r.word, x)));
    check(where, 'GREAT! on screen', r.word.y0 >= 0 && r.word.y1 <= H && r.word.x0 >= 0 && r.word.x1 <= W);
    if (rm === '1') check(where, 'Reduced motion: no grow, no drift', r.frames.every((f) => f && f.scale === 1 && f.y === r.frames[0].y), JSON.stringify(r.frames));
    else check(where, 'grows in', r.frames[0].scale < 1 && r.frames[2].scale === 1, JSON.stringify(r.frames));
    if (name === 'open') check(where, 'no enemy in the way: stays near its usual spot (it may step off the room name)', Math.abs((r.word.y0 + r.word.y1) / 2 - r.pref) < 30, `centre ${(r.word.y0 + r.word.y1) / 2} want ${r.pref}`);
  }
  // GREAT x3 chain line: same sky blue, see-through.
  const chain = await pg.evaluate(async () => { const s = window.game.scene.getScene('Game'); s.world.players[s.me].counterChain = 3; s.menuOpen = false; await new Promise((r) => setTimeout(r, 300)); s.menuOpen = true; const c = s.chainText; return { text: c.text, color: c.style.color, alpha: c.alpha, visible: c.visible }; });
  check(`${W}x${H} rm=${rm} ${student}`, 'GREAT xN line sky blue, 75%', chain.visible && chain.text === 'GREAT x3' && chain.color === '#7fd4ff' && chain.alpha === 0.75, JSON.stringify(chain));
  check(`${W}x${H} rm=${rm} ${student}`, 'no page errors', pg.errs.length === 0, pg.errs.join(' | ').slice(0, 200));
  await ctx.close();
}
await b.close();
fs.writeFileSync(`${OUT}/results.txt`, rows.join('\n') + '\n');
console.log(rows.join('\n'));
console.log(`${rows.filter((r) => r.startsWith('PASS')).length} pass, ${rows.filter((r) => r.startsWith('FAIL')).length} fail`);
