// OV-B6: the 4 new Power-ups show on the pick screen with their own icon, name, card text and family stripe
// (GUARD / SPEED / VIRTUE after the rename), every card fits the screen, and tapping one picks it.
// Usage: URL=http://localhost:5199/ OUT=/workspace/ovb6-shots node docs/shots/ov-b6/powerups.mjs
import { chromium } from 'playwright';
import fs from 'fs';

const URL = process.env.URL || 'http://localhost:5173/';
const OUT = process.env.OUT || '/opt/cursor/artifacts/ov-b6';
fs.mkdirSync(OUT, { recursive: true });
const rows = [];
const check = (where, name, ok, info = '') => rows.push(`${ok ? 'PASS' : 'FAIL'}  ${where}  ${name}${info ? '  (' + info + ')' : ''}`);
const WANT = {
  'calm-breath': ['Quiet Mind', 'VIRTUE', 'Your Focus fills up faster.'],
  'steady-start': ['Warm Up', 'VIRTUE', 'Start every room with some Focus.'],
  'lighter-strike': ['Swift Strikes', 'SPEED', 'Your Strikes use less Focus.'],
  'softer-block': ['Iron Block', 'GUARD', 'Iron arms stop more of the hit.'],
  'ripple-counter': ['Ripple Counter', 'GUARD', null],
  'wind-step': ['Wind Step', 'SPEED', null],
};
const OFFERS = [['calm-breath', 'steady-start', 'lighter-strike'], ['softer-block', 'ripple-counter', 'wind-step']];
const b = await chromium.launch();

for (const [W, H] of [[844, 390], [667, 375]]) for (const rm of ['off', 'on']) {
  const tag = `${W}x${H}-rm-${rm}`;
  const ctx = await b.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
  await ctx.addInitScript(([k]) => {
    if (!sessionStorage.getItem('ovb6-init')) {
      localStorage.clear();
      sessionStorage.setItem('ovb6-init', '1');
      localStorage.setItem('dojo-ascent-test-student', '1-white-belt-new');
      localStorage.setItem('dojo.reducedMotion', k);
    }
  }, [rm]);
  const pg = await ctx.newPage();
  await pg.goto(URL);
  await pg.waitForFunction(() => window.game?.scene?.getScenes?.(true).length);
  // Set-up (not a tap): open the Dojo, then go up the Tower the way its door does, so the run is real.
  await pg.evaluate(() => { const g = window.game; g.scene.getScenes(true).forEach((s) => g.scene.stop(s.scene.key)); g.scene.start('Dojo'); });
  await pg.waitForFunction(() => window.game.scene.getScene('Dojo')?.sys.isActive());
  await pg.waitForTimeout(500);
  await pg.evaluate(() => window.game.scene.getScene('Dojo').goTower());
  await pg.waitForFunction(() => window.game.scene.getScene('Game')?.sys.isActive() && window.game.scene.getScene('Game').run, null, { timeout: 15000 });
  await pg.waitForTimeout(2500);
  check(tag, 'reduced motion reads back', (await pg.evaluate(() => localStorage.getItem('dojo.reducedMotion'))) === rm);
  for (const [n, ids] of OFFERS.entries()) {
    // Set-up (not a tap): open the real pick screen with these three cards.
    await pg.evaluate((ids) => { const s = window.game.scene.getScene('Game'); s.picker?.destroy(); s.menuOpen = true; s.run.insightChoices = ids.slice(); s.openInsights(ids); }, ids);
    await pg.waitForTimeout(1200);
    const cards = await pg.evaluate(() => {
      const s = window.game.scene.getScene('Game');
      return s.picker.container.list.filter((c) => c.type === 'Container').map((c) => {
        const bg = c.list[0].getBounds();
        return {
          box: { l: bg.left, t: bg.top, r: bg.right, b: bg.bottom },
          texts: c.list.filter((o) => o.type === 'Text').map((o) => { const r = o.getBounds(); return { t: o.text, l: r.left, t0: r.top, r: r.right, b: r.bottom }; }),
          icon: c.list.find((o) => o.type === 'Image')?.frame?.name ?? null,
          alpha: c.alpha,
        };
      });
    });
    await pg.screenshot({ path: `${OUT}/${tag}-0${n + 1}-picker.png` });
    check(tag, `offer ${n + 1}: three cards`, cards.length === 3, String(cards.length));
    cards.forEach((c, i) => {
      const [name, fam, text] = WANT[ids[i]];
      const t = c.texts.map((x) => x.t);
      check(tag, `${ids[i]}: name ${name}`, t.includes(name), t.join(' / '));
      check(tag, `${ids[i]}: stripe ${fam}`, t.includes(fam));
      if (text) check(tag, `${ids[i]}: card text`, t.includes(text));
      check(tag, `${ids[i]}: has its icon`, c.icon !== null, String(c.icon));
      check(tag, `${ids[i]}: card on screen`, c.box.l >= 0 && c.box.t >= 0 && c.box.r <= W && c.box.b <= H, JSON.stringify(c.box));
      check(tag, `${ids[i]}: text inside its card`, c.texts.every((x) => x.l >= c.box.l - 1 && x.r <= c.box.r + 1 && x.b <= c.box.b + 1));
      if (i > 0) check(tag, `${ids[i]}: no overlap with the card before`, cards[i - 1].box.r <= c.box.l);
    });
    // Tap the last card, as a player would; the run gets it.
    const last = cards[2].box;
    await pg.touchscreen.tap((last.l + last.r) / 2, (last.t + last.b) / 2);
    await pg.waitForTimeout(600);
    const got = await pg.evaluate(() => { const s = window.game.scene.getScene('Game'); return { insights: s.run.insights.slice(), picker: !!s.picker }; });
    check(tag, `offer ${n + 1}: tap picks ${ids[2]}`, got.insights.includes(ids[2]) && !got.picker, JSON.stringify(got));
    await pg.screenshot({ path: `${OUT}/${tag}-0${n + 1}-picked.png` });
  }
  await ctx.close();
}
await b.close();
fs.writeFileSync(`${OUT}/results.txt`, rows.join('\n') + '\n');
const fails = rows.filter((r) => r.startsWith('FAIL'));
console.log(rows.join('\n'));
console.log(`\n${rows.length - fails.length} pass, ${fails.length} fail`);
process.exit(fails.length ? 1 : 0);
