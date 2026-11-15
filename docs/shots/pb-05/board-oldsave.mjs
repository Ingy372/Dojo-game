// PB-05 QA fixes: the Training Board next-step card is whole on a 375 pt phone with the Testing
// button, and the Testing screen's Old save row brings back the one-time slot note by real taps.
// Usage: OUT=/tmp/pb05 PORT=5173 node docs/shots/pb-05/board-oldsave.mjs (or URL=<preview>)
import { chromium } from 'playwright';
import fs from 'fs';

const URL = process.env.URL || `http://127.0.0.1:${process.env.PORT || '5173'}/`;
const OUT = process.env.OUT || '/opt/cursor/artifacts/pb-05';
fs.mkdirSync(OUT, { recursive: true });
const rows = [];
const check = (where, name, ok, info = '') => rows.push(`${ok ? 'PASS' : 'FAIL'}  ${where}  ${name}${info ? '  (' + info + ')' : ''}`);
const b = await chromium.launch();

async function open(W, H, rm) {
  const ctx = await b.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
  await ctx.addInitScript(([k]) => {
    if (!sessionStorage.getItem('pb05-init')) {
      localStorage.clear();
      sessionStorage.setItem('pb05-init', '1');
      localStorage.setItem('dojo-ascent-test-student', '6-orange-typical');
      localStorage.setItem('dojo.reducedMotion', k);
    }
  }, [rm]);
  const pg = await ctx.newPage();
  await pg.goto(URL);
  await pg.waitForFunction(() => window.game?.scene?.getScenes?.(true).length);
  for (let i = 0; i < 40; i++) {
    const keys = await pg.evaluate(() => window.game.scene.getScenes(true).map((s) => s.scene.key));
    if (keys.includes('Home') || keys.includes('Dojo')) break;
    if (keys.includes('Title')) await pg.touchscreen.tap(W / 2, H / 2);
    if (keys.includes('Create')) { const g = (await texts(pg)).find((t) => /Let's go/.test(t.t)); if (g) await pg.touchscreen.tap(g.x, g.y); }
    await pg.waitForTimeout(300);
  }
  // Skip the first-run guide (as the earlier PB-05 shots do), then show the Training Board.
  await pg.evaluate(() => {
    const k = 'dojo-ascent-profile-v1';
    const p = JSON.parse(localStorage.getItem(k) || '{}');
    p.runsPlayed = Math.max(5, p.runsPlayed || 0);
    p.runsStarted = Math.max(5, p.runsStarted || 0);
    p.guideStep = 99;
    localStorage.setItem(k, JSON.stringify(p));
    const g = window.game;
    g.scene.getScenes(true).forEach((s) => g.scene.stop(s.scene.key));
    g.scene.start('Home');
  });
  await pg.waitForTimeout(700);
  await pg.evaluate(() => { const h = window.game.scene.getScene('Home'); h.children.list.filter((c) => c.depth >= 90).forEach((c) => c.destroy()); h.celebrating = false; });
  return { ctx, pg };
}

const texts = (pg) => pg.evaluate(() => {
  const o = [];
  for (const s of window.game.scene.getScenes(true)) {
    const w = (l) => { for (const c of l) { if (c.list) w(c.list); if (c.type === 'Text' && c.visible && c.text) { const b = c.getBounds(); o.push({ t: c.text, x: b.centerX, y: b.centerY, l: b.left, top: b.top, r: b.right, bot: b.bottom }); } } };
    w(s.children.list);
  }
  return o;
});
const tapText = async (pg, re) => {
  const hit = (await texts(pg)).find((t) => re.test(t.t));
  if (!hit) return false;
  await pg.touchscreen.tap(hit.x, hit.y);
  await pg.waitForTimeout(400);
  return true;
};
const flags = (pg) => pg.evaluate(() => { const p = window.game.scene.getScene('Home').profile; return { note: p.showSlotNote, v2: p.loadoutV2, seals: p.loadout?.seals ?? [], help: p.styleHelpSeen }; });

for (const [W, H] of [[844, 390], [667, 375]]) for (const rm of ['off', 'on']) {
  const tag = `${W}x${H}-rm-${rm}`;
  const { ctx, pg } = await open(W, H, rm);
  // 1) The Training Board: the next-step card's words stay inside the card and the screen.
  await pg.screenshot({ path: `${OUT}/board-${tag}.png` });
  const t = await texts(pg);
  const lab = t.find((x) => x.t === 'YOUR NEXT STEP');
  const test = t.find((x) => x.t === 'Testing');
  const prac = t.find((x) => x.t === 'Practice room');
  check(tag, 'YOUR NEXT STEP label is on the board', !!lab);
  const near = lab ? t.filter((x) => x.l >= lab.l - 2 && x.top >= lab.top - 30 && x.top <= lab.bot + 60 && x.r < W / 2 + 40) : [];
  const low = near.length ? Math.max(...near.map((x) => x.bot)) : 0;
  check(tag, 'next-step words end at least 8 pt above the screen edge', !!lab && low <= H - 8, `lowest word bottom ${low.toFixed(1)} of ${H}`);
  const card = await pg.evaluate(() => { const h = window.game.scene.getScene('Home'); return { h: h.scale.height, short: h.scale.height < 400 }; });
  check(tag, 'Testing and Practice room share one row and do not overlap', !!test && !!prac && Math.abs(test.y - prac.y) < 2 && prac.r < test.l, test && prac ? `Practice room ends ${prac.r.toFixed(0)}, Testing starts ${test.l.toFixed(0)}` : 'missing');
  // 2) Testing -> Old save, with taps only.
  check(tag, 'tap Testing', await tapText(pg, /^Testing$/));
  // The fixture list scrolls: drag it up until the Old save row is wholly in view, then tap it.
  for (let i = 0; i < 6; i++) {
    const row = (await texts(pg)).find((x) => /^Old save/.test(x.t));
    if (row && row.bot <= H - 24) break;
    await pg.mouse.move(120, H - 40); await pg.mouse.down(); await pg.mouse.move(120, H - 200, { steps: 8 }); await pg.mouse.up();
    await pg.waitForTimeout(200);
  }
  await pg.screenshot({ path: `${OUT}/testing-${tag}.png` });
  check(tag, 'tap Old save', await tapText(pg, /^Old save \(show slot note again\)$/));
  const f1 = await flags(pg);
  check(tag, 'real seed ran: note on, slots filled', f1.note === true && f1.v2 === true && f1.seals.length > 0, JSON.stringify(f1));
  // A fresh test save still owes its welcome card; tap through it like a player would.
  for (let i = 0; i < 8 && (await tapText(pg, /^Tap to continue$/)); i++) await pg.waitForTimeout(300);
  // 3) Abilities tab, then the Fighting Style switch.
  check(tag, 'tap Abilities', await tapText(pg, /^Abilities$/));
  check(tag, 'tap Fighting Style', await tapText(pg, /Fighting Style/));
  await pg.screenshot({ path: `${OUT}/note-${tag}.png` });
  const t2 = await texts(pg);
  check(tag, 'slot note and Got it show', t2.some((x) => x.t === 'Got it'));
  check(tag, 'help line waits while the note is up', !t2.some((x) => x.t.includes('Tap a slot, then pick a Seal')));
  const got = t2.find((x) => x.t === 'Got it');
  check(tag, 'Got it is fully on screen', !!got && got.bot <= H - 4 && got.r <= W - 4);
  check(tag, 'tap Got it', await tapText(pg, /^Got it$/));
  await pg.screenshot({ path: `${OUT}/after-got-it-${tag}.png` });
  const f2 = await flags(pg);
  check(tag, 'Got it clears the note', f2.note === false && !(await texts(pg)).some((x) => x.t === 'Got it'), JSON.stringify(f2));
  await pg.reload();
  await pg.waitForFunction(() => window.game?.scene?.getScenes?.(true).length);
  await pg.waitForTimeout(500);
  const kept = await pg.evaluate(() => JSON.parse(localStorage.getItem('dojo-ascent-profile-v1') || '{}').showSlotNote);
  check(tag, 'note stays gone after a reload', kept === false, String(kept));
  await ctx.close();
}
await b.close();
fs.writeFileSync(`${OUT}/board-oldsave.txt`, rows.join('\n') + '\n');
console.log(rows.join('\n'));
console.log(`${rows.filter((r) => r.startsWith('PASS')).length} PASS / ${rows.filter((r) => r.startsWith('FAIL')).length} FAIL`);
