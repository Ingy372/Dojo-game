// OV-B1: Sensei's Pick. A Yellow belt with full Seal slots moves up to Orange on the Testing
// screen; the new moves go in by themselves, the swap line names the Seal that rested, the lesson
// shows once, and with the switch Off nothing moves. Real taps only, after the start.
// Usage: OUT=/tmp/ovb1 PORT=5173 node docs/shots/ov-b1/sensei-pick.mjs
import { chromium } from 'playwright';
import fs from 'fs';

const URL = process.env.URL || `http://127.0.0.1:${process.env.PORT || '5173'}/`;
const OUT = process.env.OUT || '/opt/cursor/artifacts/ov-b1';
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
const tapText = async (pg, re) => {
  const hit = (await texts(pg)).find((t) => re.test(t.t));
  if (!hit) return false;
  await pg.touchscreen.tap(hit.x, hit.y);
  await pg.waitForTimeout(450);
  return true;
};
const home = (pg) => pg.evaluate(() => { const p = window.game.scene.getScene('Home').profile; return { pick: p.senseiPick, known: p.picksKnown, loadout: p.loadout, lessons: p.lessons.seen.map((s) => s.id) }; });

const celebrating = (pg) => pg.evaluate(() => window.game.scene.getScene('Home')?.celebrating === true);
/** Taps through the celebration like a player (waiting out each screen), stopping early at `stop`. */
async function drain(pg, W, H, stop) {
  for (let i = 0; i < 30 && (await celebrating(pg)); i++) {
    await pg.waitForTimeout(1900);
    const t = await texts(pg);
    if (stop && t.some((x) => stop.test(x.t))) return t;
    await pg.touchscreen.tap(W / 2, H - 22);
  }
  await pg.waitForTimeout(300);
  return null;
}

async function open(W, H, rm, fixture, prep) {
  const ctx = await b.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
  await ctx.addInitScript(([k, f]) => {
    if (!sessionStorage.getItem('ovb1-init')) {
      localStorage.clear();
      sessionStorage.setItem('ovb1-init', '1');
      localStorage.setItem('dojo-ascent-test-student', f);
      localStorage.setItem('dojo.reducedMotion', k);
    }
  }, [rm, fixture]);
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
  // Start set-up (not a tap): a played save on this belt with everything already celebrated and known.
  await pg.evaluate(([k, prep]) => {
    const p = JSON.parse(localStorage.getItem(k) || '{}');
    Object.assign(p, { runsPlayed: 5, runsStarted: 5, guideStep: 99 }, prep);
    localStorage.setItem(k, JSON.stringify(p));
    const g = window.game;
    g.scene.getScenes(true).forEach((s) => g.scene.stop(s.scene.key));
    g.scene.start('Home');
  }, [KEY, prep]);
  await pg.waitForTimeout(700);
  await drain(pg, W, H);
  return { ctx, pg };
}

async function moveTo(pg, H, label) {
  if (!(await tapText(pg, /^Testing$/))) return false;
  for (let i = 0; i < 6; i++) {
    const row = (await texts(pg)).find((x) => label.test(x.t));
    if (row && row.bot <= H - 24 && row.top >= 0) break;
    await pg.mouse.move(120, H - 40); await pg.mouse.down(); await pg.mouse.move(120, H - 120, { steps: 6 }); await pg.mouse.up();
    await pg.waitForTimeout(200);
  }
  return tapText(pg, label);
}

for (const [W, H] of [[844, 390], [667, 375]].filter(([w]) => !process.env.ONLY || process.env.ONLY === String(w))) for (const rm of ['off', 'on'].filter((r) => !process.env.RM || process.env.RM === r)) {
  const tag = `${W}x${H}-rm-${rm}`;
  // 1) Sensei's Pick on, Yellow with both Seal slots full, then Orange.
  {
    const { ctx, pg } = await open(W, H, rm, '3-yellow-belt', {});
    const before = await home(pg);
    check(tag, 'first visit only records what is earned', Array.isArray(before.known) && before.pick === true, JSON.stringify(before));
    // Fill the slots as a player would have (start set-up), so Orange's new Seal must swap one out.
    const full = await pg.evaluate(() => { const h = window.game.scene.getScene('Home'); const fam = h.profile.picksKnown.filter((id) => !/kick|spin|flow/.test(id)); return fam; });
    await pg.evaluate((fam) => { const h = window.game.scene.getScene('Home'); h.profile.loadout = { stance: null, virtue: null, strike: h.profile.loadout?.strike ?? null, kata: null, seals: fam.slice(0, 2) }; }, full);
    const rmRead = await pg.evaluate(() => localStorage.getItem('dojo.reducedMotion'));
    check(tag, 'Reduced motion read back', rmRead === rm, rmRead);
    check(tag, 'Testing -> Orange', await moveTo(pg, H, /^Orange/));
    const seen = await drain(pg, W, H, /^Sensei's Pick$/);
    check(tag, "Sensei's Pick step shows after the sign-offs", !!seen);
    if (seen) {
            await pg.screenshot({ path: `${OUT}/picks-${tag}.png` });
      const lines = seen.filter((x) => /to your moves!|is resting\.|Add it anytime!|Sensei picks|in class\./.test(x.t));
      check(tag, 'lesson line shows the first time', seen.some((x) => x.t === 'Sensei picks your newest moves for you.'));
      const swap = seen.find((x) => / is in\. .* is resting\./.test(x.t));
      check(tag, 'swap line names the Seal that rested', !!swap, swap?.t ?? lines.map((x) => x.t).join(' | '));
      const inside = lines.every((x) => x.l >= 8 && x.r <= W - 8 && x.top >= 8 && x.bot <= H - 30);
      check(tag, 'every line inside the screen, clear of Tap to continue', inside, lines.map((x) => `${x.t.slice(0, 18)}:${x.top.toFixed(0)}-${x.bot.toFixed(0)}`).join(' '));
    }
    await drain(pg, W, H);
    const after = await home(pg);
    const saved = await pg.evaluate((k) => JSON.parse(localStorage.getItem(k)), KEY);
    // Orange has 3 Seal slots: one new Seal fills the free slot, the other swaps out the oldest.
    check(tag, 'the newest moves are in the slots and saved', JSON.stringify(saved.loadout) === JSON.stringify(after.loadout) && after.loadout.seals.length === 3 && !after.loadout.seals.includes(full[0]), JSON.stringify(after.loadout));
    check(tag, 'lesson saved as seen', after.lessons.includes('lesson-sensei-pick'));
    // Fighting Style: the switch is there, 44 tall, and turning it Off saves.
    check(tag, 'tap Abilities', await tapText(pg, /^Abilities$/));
    check(tag, 'tap Fighting Style', await tapText(pg, /Fighting Style/));
    const sw = (await texts(pg)).find((x) => /^Sensei's Pick: On$/.test(x.t));
    await pg.screenshot({ path: `${OUT}/style-on-${tag}.png` });
    const box = await pg.evaluate(() => { const h = window.game.scene.getScene('Home'); let o = null; const w = (l) => { for (const c of l) { if (c.getData && c.getData('senseiPick') !== undefined) { const b = c.getBounds(); o = { w: b.width, h: b.height, r: b.right, bot: b.bottom }; } if (c.list) w(c.list); } }; w(h.children.list); return o; });
    check(tag, 'switch shows On, at least 44x44, on screen', !!sw && !!box && box.h >= 44 && box.w >= 44 && box.r <= W - 4 && box.bot <= H - 4, JSON.stringify(box));
    const hint = (await texts(pg)).find((x) => /Tap a card|Tap a slot/.test(x.t));
    check(tag, 'hint line does not run under the switch', !hint || !sw || hint.r <= sw.l - 4 || hint.bot <= sw.top || hint.top >= sw.bot, hint ? `${hint.r.toFixed(0)} vs ${sw?.l.toFixed(0)}` : 'no hint');
    check(tag, 'tap the switch', await tapText(pg, /^Sensei's Pick: On$/));
    await pg.screenshot({ path: `${OUT}/style-off-${tag}.png` });
    const off = await pg.evaluate((k) => JSON.parse(localStorage.getItem(k)).senseiPick, KEY);
    check(tag, 'switch Off is saved', off === false && (await texts(pg)).some((x) => x.t === "Sensei's Pick: Off"));
    await ctx.close();
  }
  // 2) Sensei's Pick off: Yellow to Orange moves nothing, and the lines say Add it anytime.
  {
    const { ctx, pg } = await open(W, H, rm, '3-yellow-belt', { senseiPick: false });
    const before = await home(pg);
    check(tag, '[off] save starts with the switch Off', before.pick === false);
    check(tag, '[off] Testing -> Orange', await moveTo(pg, H, /^Orange/));
    const seen = await drain(pg, W, H, /^Sensei's Pick$/);
    if (seen) await pg.screenshot({ path: `${OUT}/picks-off-${tag}.png` });
    check(tag, '[off] lines say ready, nothing added or resting, no lesson', !!seen && seen.some((x) => /Add it anytime!/.test(x.t)) && !seen.some((x) => /to your moves!|is resting|Sensei picks/.test(x.t)));
    await drain(pg, W, H);
    const after = await home(pg);
    check(tag, '[off] the player keeps their choice', JSON.stringify(after.loadout) === JSON.stringify(before.loadout), `${JSON.stringify(before.loadout)} -> ${JSON.stringify(after.loadout)}`);
    await ctx.close();
  }
  // 3) Guided: the switch is hidden.
  {
    const { ctx, pg } = await open(W, H, rm, '3-yellow-belt', { difficulty: 'guided', difficultyChosenByPlayer: true });
    await tapText(pg, /^Abilities$/);
    await tapText(pg, /Fighting Style/);
    await pg.screenshot({ path: `${OUT}/style-guided-${tag}.png` });
    check(tag, '[guided] no switch on Fighting Style', !(await texts(pg)).some((x) => /^Sensei's Pick/.test(x.t)) && (await texts(pg)).some((x) => /^STRIKE$/.test(x.t)));
    await ctx.close();
  }
}
await b.close();
fs.writeFileSync(`${OUT}/sensei-pick.txt`, rows.join('\n') + '\n');
console.log(rows.join('\n'));
console.log(`${rows.filter((r) => r.startsWith('PASS')).length} PASS / ${rows.filter((r) => r.startsWith('FAIL')).length} FAIL`);
