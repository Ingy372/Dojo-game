// LP-B1 verify-ui-shots: the one Path screen on a landscape phone.
// Usage: OUT=/workspace/shots/lp-b1 PORT=5173 node docs/shots/lp-b1/path-verify.mjs
import { chromium } from 'playwright';
import fs from 'fs';

const PORT = process.env.PORT || '5173';
const OUT = process.env.OUT || '/workspace/shots/lp-b1';
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

for (const [W, H] of sizes) {
  for (const rm of ['1', '0']) {
    for (const [student, tag, step, game] of students) {
      const where = `${W}x${H} rm=${rm} ${tag}`;
      const { ctx, pg } = await open(W, H, rm, student);
      await pg.waitForTimeout(rm === '1' ? 300 : 900);
      check(where, 'Home opens on the Path', (await homeView(pg)) === 'path');
      let tx = await texts(pg);
      const all = tx.map((t) => t.t).join(' | ');
      check(where, 'title My Path', tx.some((t) => t.t === 'My Path'));
      check(where, `next class step ${step}`, tx.some((t) => t.t === step), all.slice(0, 200));
      check(where, 'Show Sensei / in class', tx.some((t) => t.t === 'Show Sensei') && tx.some((t) => t.t === 'in class'));
      check(where, 'next game step', tx.some((t) => t.t.startsWith(game)));
      check(where, 'Enter the Tower', tx.some((t) => t.t === 'Enter the Tower'));
      check(where, 'no Gate tab, Path card or goals card', !tx.some((t) => /^Gate( ✦)?$|YOUR NEXT STEP$|Last run|Next goals/i.test(t.t)));
      check(where, 'no FAITH DOES yet', !tx.some((t) => /FAITH/i.test(t.t)));
      check(where, 'every word on screen', tx.every((t) => t.x >= -1 && t.y >= -1 && t.x + t.w <= W + 1 && t.y + t.h <= H + 1), tx.filter((t) => !(t.x >= -1 && t.y >= -1 && t.x + t.w <= W + 1 && t.y + t.h <= H + 1)).map((t) => t.t).join(','));
      check(where, 'words at least 10 pt', tx.every((t) => t.size >= 10), tx.filter((t) => t.size < 10).map((t) => t.t).join(','));
      const lap = [];
      for (let i = 0; i < tx.length; i++) for (let j = i + 1; j < tx.length; j++) {
        const a = tx[i], c = tx[j];
        const ox = Math.min(a.x + a.w, c.x + c.w) - Math.max(a.x, c.x);
        const oy = Math.min(a.y + a.h, c.y + c.h) - Math.max(a.y, c.y);
        if (ox > 2 && oy > 2) lap.push(`${a.t}~${c.t}`);
      }
      check(where, 'no words overlap', lap.length === 0, lap.join(', '));
      const small = (await hits(pg)).filter((b) => b.w < 44 || b.h < 44);
      check(where, 'every tap target 44 pt', small.length === 0, JSON.stringify(small));
      await pg.screenshot({ path: `${OUT}/path-${tag}-${W}x${H}-rm${rm}.png` });
      // Board and back.
      check(where, 'Board opens', (await tapText(pg, /^Board$/)) && (await homeView(pg)) === 'board');
      tx = await texts(pg);
      check(where, 'Board tabs: Last run, Gear, Abilities, no Gate', tx.some((t) => t.t === 'Last run') && tx.some((t) => t.t.startsWith('Gear')) && tx.some((t) => t.t === 'Abilities') && !tx.some((t) => /^Gate/.test(t.t)));
      if (rm === '1' && tag === 'green') await pg.screenshot({ path: `${OUT}/board-${tag}-${W}x${H}.png` });
      check(where, '◀ Path goes back', (await tapText(pg, /◀ Path/)) && (await homeView(pg)) === 'path');
      // Tower scroll.
      const up = await tapText(pg, /^▲$/);
      const down = await tapText(pg, /^▼$/);
      check(where, 'Tower scrolls', up || down);
      check(where, 'Enter the Tower starts a run', (await tapText(pg, /^Enter the Tower$/)) && (await pg.waitForFunction(() => window.game.scene.getScenes(true).some((s) => s.scene.key === 'Game'), null, { timeout: 4000 }).then(() => true, () => false)));
      check(where, 'no page errors', pg.errs.length === 0, pg.errs.join('; '));
      await ctx.close();
    }
  }
  // The intro card: existing player, first visit only.
  const where = `${W}x${H} intro`;
  const { ctx, pg } = await open(W, H, '1', '4-green-belt', true);
  await pg.waitForTimeout(400);
  let tx = await texts(pg);
  check(where, 'intro shows', tx.some((t) => t.t === 'This is your Path.') && tx.some((t) => t.t === 'Your next step is here.'));
  await pg.screenshot({ path: `${OUT}/intro-green-${W}x${H}.png` });
  check(where, 'Board is blocked under the intro', !(await tapText(pg, /^Board$/)) || (await homeView(pg)) === 'path');
  check(where, 'OK closes it', (await tapText(pg, /^OK$/)) && !(await texts(pg)).some((t) => t.t === 'This is your Path.'));
  check(where, 'OK is saved', await pg.evaluate(() => JSON.parse(localStorage.getItem('dojo-ascent-profile-v1')).pathIntroSeen === true));
  check(where, 'no page errors', pg.errs.length === 0, pg.errs.join('; '));
  await ctx.close();
}
await b.close();
fs.writeFileSync(`${OUT}/results.txt`, rows.join('\n') + '\n');
const fails = rows.filter((r) => r.startsWith('FAIL'));
console.log(rows.filter((r) => r.startsWith('FAIL')).join('\n'));
console.log(`${rows.length - fails.length} pass, ${fails.length} fail`);
process.exit(fails.length ? 1 : 0);
