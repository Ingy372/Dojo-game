// PB-05 verify-ui-shots: Fighting Style slot cards on a landscape phone.
// Hands-on taps, 44 pt targets, Seal swap, Lock, Kata placeholder, New dots, Reduced motion.
// Usage: OUT=/opt/cursor/artifacts/pb-05 PORT=5173 node docs/shots/pb-05/pb05-verify.mjs
import { chromium } from 'playwright';
import fs from 'fs';

const PORT = process.env.PORT || '5173';
const OUT = process.env.OUT || '/opt/cursor/artifacts/pb-05';
fs.mkdirSync(OUT, { recursive: true });
const sizes = [[844, 390], [667, 375]];
const profiles = [
  ['2-white-belt-3-signoffs', 'white'],
  ['3-yellow-belt', 'yellow'],
  ['6-orange-typical', 'orange'],
];
const rows = [];
const check = (where, name, ok, info = '') => rows.push(`${ok ? 'PASS' : 'FAIL'}  ${where}  ${name}${info ? '  (' + info + ')' : ''}`);

const b = await chromium.launch();

async function open(W, H, rm, student) {
  const ctx = await b.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1, hasTouch: true, isMobile: true });
  await ctx.addInitScript(([s, k]) => {
    if (!sessionStorage.getItem('pb05-init')) {
      localStorage.clear();
      sessionStorage.setItem('pb05-init', '1');
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
  await pg.evaluate(() => {
    const k = 'dojo-ascent-profile-v1';
    const p = JSON.parse(localStorage.getItem(k) || '{}');
    p.runsPlayed = Math.max(5, p.runsPlayed || 0);
    p.runsStarted = Math.max(5, p.runsStarted || 0);
    p.guideStep = 99;
    localStorage.setItem(k, JSON.stringify(p));
    localStorage.removeItem('dojo-ascent-run-in-progress');
  });
  await pg.evaluate(() => { const g = window.game; g.scene.getScenes(true).forEach((s) => g.scene.stop(s.scene.key)); g.scene.start('Home'); });
  await pg.waitForTimeout(600);
  await pg.evaluate(() => { const h = window.game.scene.getScene('Home'); h.children.list.filter((c) => c.depth >= 90).forEach((c) => c.destroy()); h.celebrating = false; });
  return { ctx, pg };
}

const cards = (pg) => pg.evaluate(() => {
  const h = window.game.scene.getScene('Home');
  const out = [];
  const w = (l) => { for (const c of l) { if (!c.getData) continue; const key = c.getData('styleKey'); if (key) { const b = c.getBounds(); out.push({ key, x: b.centerX, y: b.centerY, w: b.width, h: b.height, l: b.left, t: b.top, r: b.right, btm: b.bottom }); } if (c.list) w(c.list); } };
  w(h.children.list);
  return out;
});
const texts = (pg) => pg.evaluate(() => {
  const o = [];
  for (const s of window.game.scene.getScenes(true)) {
    const w = (l) => { for (const c of l) { if (c.list) w(c.list); if (c.type === 'Text' && c.visible && c.text) { const b = c.getBounds(); o.push({ t: c.text, x: b.centerX, y: b.centerY, w: b.width, h: b.height }); } } };
    w(s.children.list);
  }
  return o;
});
const loadout = (pg) => pg.evaluate(() => window.game.scene.getScene('Home').profile.loadout);
const rmNow = (pg) => pg.evaluate(async () => ((await import('/src/game/motion.ts')).reducedMotion() ? 'on' : 'off'));
const dotCount = (pg) => pg.evaluate(() => {
  const h = window.game.scene.getScene('Home');
  let n = 0;
  const w = (l) => { for (const c of l) { if (c.getData?.('newDot')) n++; if (c.list) w(c.list); } };
  w(h.children.list);
  return n;
});

function tapCard(list, key) {
  return list.find((c) => c.key === key);
}

/** Page the open tray until `name` is on it. One tile per page on the narrow phone. */
async function findPick(pg, name) {
  await pg.evaluate(() => { const h = window.game.scene.getScene('Home'); h.trayPageNo = 0; h.render(); });
  await pg.waitForTimeout(150);
  for (let page = 0; page < 8; page++) {
    const ts = await texts(pg);
    const hit = ts.find((t) => t.t === name);
    if (hit) return hit;
    const arrow = ts.find((t) => t.t === '▶' && t.y > 200);
    if (!arrow) return null;
    await pg.touchscreen.tap(arrow.x, arrow.y);
    await pg.waitForTimeout(200);
  }
  return null;
}

for (const [W, H] of sizes) for (const rm of ['off', 'on']) for (const [student, belt] of profiles) {
  const tag = `${belt}-${W}x${H}-rm-${rm}`;
  const { ctx, pg } = await open(W, H, rm, student);
  check(tag, 'Reduced motion read back', (await rmNow(pg)) === rm, await rmNow(pg));
  await pg.evaluate(() => { const h = window.game.scene.getScene('Home'); h.tab = 'abilities'; h.part = 'style'; h.styleSlot = null; h.render(); });
  await pg.waitForTimeout(400);
  let cs = await cards(pg);
  await pg.screenshot({ path: `${OUT}/${tag}-cards.png` });
  check(tag, 'five slot kinds are on screen', ['stance:0', 'virtue:0', 'strike:0', 'kata:0'].every((k) => cs.some((c) => c.key === k)) && cs.some((c) => c.key.startsWith('seal:')), cs.map((c) => c.key).join(','));
  for (const c of cs) {
    check(tag, `${c.key} is at least 44 pt`, c.w >= 44 && c.h >= 44, `${Math.round(c.w)}x${Math.round(c.h)}`);
    check(tag, `${c.key} is on screen`, c.l >= -1 && c.t >= -1 && c.r <= W + 1 && c.btm <= H + 1, `${Math.round(c.l)},${Math.round(c.t)}`);
  }
  const ts = await texts(pg);
  const joined = ts.map((t) => t.t).join(' | ');
  check(tag, 'slot words show', /STANCE/.test(joined) && /VIRTUE/.test(joined) && /STRIKE/.test(joined) && /KATA/.test(joined) && /SEAL/.test(joined));
  if (belt !== 'orange') check(tag, 'quiet lock names the belt', /Orange Belt/.test(joined), joined.slice(0, 180));

  // Hands-on: open Kata (tap 1) and read the placeholder, then equip Basic Form 1 if it is there (tap 2).
  const kata = tapCard(cs, 'kata:0');
  await pg.touchscreen.tap(kata.x, kata.y);
  await pg.waitForTimeout(250);
  let after = await texts(pg);
  check(tag, 'Kata card says Power coming soon', after.some((t) => t.t.includes('Power coming soon')));
  const form = after.find((t) => t.t === 'Basic Form 1');
  if (form) {
    await pg.touchscreen.tap(form.x, form.y);
    await pg.waitForTimeout(250);
    const lo = await loadout(pg);
    check(tag, 'Kata equip took 2 taps and saved the placeholder', lo?.kata === 'basic-form-1', JSON.stringify(lo?.kata));
  } else check(tag, 'Basic Form 1 is a pick', false, 'not in the tray');

  // Stance: tap the card, then Cat Stance or Open Leg, whichever is earned and visible.
  cs = await cards(pg);
  const stance = tapCard(cs, 'stance:0');
  await pg.touchscreen.tap(stance.x, stance.y);
  await pg.waitForTimeout(250);
  const earnedStance = await pg.evaluate(() => {
    const h = window.game.scene.getScene('Home');
    return h.styleModel().trays.stance.find((p) => p.earned && p.id !== 'beginners-stance')?.name ?? null;
  });
  const stancePick = earnedStance ? await findPick(pg, earnedStance) : await findPick(pg, 'Beginner\'s Stance');
  if (stancePick) {
    await pg.touchscreen.tap(stancePick.x, stancePick.y);
    await pg.waitForTimeout(250);
    const lo = await loadout(pg);
    const ok = earnedStance ? lo?.stance && lo.stance !== 'beginners-stance' : true;
    check(tag, `Stance equip is 2 taps (${stancePick.t})`, ok, lo?.stance ?? 'beginner');
  } else check(tag, 'a stance pick is in the tray', false);

  // Seal: equip the first earned family, then a second. White and yellow have 2 slots; orange 3.
  cs = await cards(pg);
  const seal0 = tapCard(cs, 'seal:0');
  await pg.touchscreen.tap(seal0.x, seal0.y);
  await pg.waitForTimeout(250);
  const escape = await findPick(pg, 'Escape');
  if (escape) {
    await pg.touchscreen.tap(escape.x, escape.y);
    await pg.waitForTimeout(250);
    check(tag, 'first Seal equips in 2 taps', (await loadout(pg))?.seals?.[0] === 'escape', JSON.stringify((await loadout(pg))?.seals));
  }
  cs = await cards(pg);
  const seal1 = tapCard(cs, 'seal:1');
  await pg.touchscreen.tap(seal1.x, seal1.y);
  await pg.waitForTimeout(200);
  const counter = await findPick(pg, 'Counter');
  if (counter) {
    await pg.touchscreen.tap(counter.x, counter.y);
    await pg.waitForTimeout(250);
    const seals = (await loadout(pg))?.seals ?? [];
    check(tag, 'second Seal equips in 2 taps', seals.includes('counter'), seals.join(','));
  }

  // Lock: open a Seal card and page until Lock is tappable, then tap it.
  cs = await cards(pg);
  await pg.touchscreen.tap(tapCard(cs, 'seal:0').x, tapCard(cs, 'seal:0').y);
  await pg.waitForTimeout(200);
  const lock = await findPick(pg, 'Lock');
  if (lock) {
    await pg.touchscreen.tap(lock.x, lock.y);
    await pg.waitForTimeout(200);
    after = await texts(pg);
    check(tag, 'Lock shows Coming later', after.some((t) => t.t.includes('Coming later')));
    check(tag, 'Lock does not equip', !((await loadout(pg))?.seals ?? []).includes('lock'));
  } else check(tag, 'Lock tile can be reached', false);

  // Yellow: fill is already 2, so a third Seal asks to swap. Orange has a free third slot.
  if (belt === 'yellow') {
    const guard = await findPick(pg, 'Guard');
    if (guard) {
      const before = (await loadout(pg))?.seals?.slice() ?? [];
      await pg.touchscreen.tap(guard.x, guard.y);
      await pg.waitForTimeout(250);
      after = await texts(pg);
      check(tag, 'full Seal row asks which one to swap', after.some((t) => t.t.includes('Swap with which one')));
      const cancel = await pg.evaluate(() => {
        const h = window.game.scene.getScene('Home');
        let box = null;
        const w = (l) => { for (const c of l) { if (c.getData?.('styleCancel')) { const b = c.getBounds(); box = { w: b.width, h: b.height }; } if (c.list) w(c.list); } };
        w(h.children.list);
        return box;
      });
      check(tag, 'Cancel is at least 44 pt', !!cancel && cancel.w >= 44 && cancel.h >= 44, cancel ? `${Math.round(cancel.w)}x${Math.round(cancel.h)}` : 'missing');
      cs = await cards(pg);
      await pg.touchscreen.tap(tapCard(cs, 'seal:0').x, tapCard(cs, 'seal:0').y);
      await pg.waitForTimeout(250);
      const seals = (await loadout(pg))?.seals ?? [];
      check(tag, 'swap replaces the tapped Seal', seals.includes('guard') && seals.join() !== before.join(), `${before.join()} -> ${seals.join()}`);
    } else check(tag, 'Guard is a pick for the swap', false);
  }

  // New dot: mark nothing seen, reopen, tap the Strike card, the dot goes away. No pulse when Reduced motion is on.
  await pg.evaluate(() => {
    const h = window.game.scene.getScene('Home');
    h.profile.styleSeen = [];
    h.styleHelpUsed = true;
    h.tab = 'abilities'; h.part = 'style'; h.styleSlot = null;
    h.render();
  });
  await pg.waitForTimeout(200);
  const dotsBefore = await dotCount(pg);
  check(tag, 'a New dot shows for an unopened pick', dotsBefore > 0, String(dotsBefore));
  if (rm === 'on') {
    const pulsing = await pg.evaluate(() => {
      const h = window.game.scene.getScene('Home');
      return h.tweens.getTweens().some((tw) => tw.targets?.some?.((t) => t.getData?.('newDot')));
    });
    check(tag, 'Reduced motion: the New dot does not pulse', pulsing === false);
  }
  cs = await cards(pg);
  await pg.touchscreen.tap(tapCard(cs, 'strike:0').x, tapCard(cs, 'strike:0').y);
  await pg.waitForTimeout(250);
  check(tag, 'opening the card clears its New dot', (await dotCount(pg)) < dotsBefore, `${dotsBefore} -> ${await dotCount(pg)}`);

  // Persistence across a reload.
  const saved = await loadout(pg);
  await pg.reload();
  await pg.waitForFunction(() => window.game?.scene?.getScenes?.(true).length);
  await pg.waitForTimeout(800);
  await pg.evaluate(() => { const g = window.game; g.scene.getScenes(true).forEach((s) => g.scene.stop(s.scene.key)); g.scene.start('Home'); });
  await pg.waitForTimeout(500);
  const back = await pg.evaluate(() => JSON.parse(localStorage.getItem('dojo-ascent-profile-v1') || '{}').loadout);
  check(tag, 'the picks are still there after a reload', JSON.stringify(back?.seals) === JSON.stringify(saved?.seals) && back?.kata === saved?.kata && back?.stance === saved?.stance, JSON.stringify(back));

  // Trophy cubbies are still there.
  await pg.evaluate(() => { const h = window.game.scene.getScene('Home'); h.tab = 'abilities'; h.part = 'trophy'; h.render(); });
  await pg.waitForTimeout(300);
  const trophy = (await texts(pg)).map((t) => t.t).join(' | ');
  check(tag, 'Trophy Case cubbies still show', /Katas|Kicks|Self-Defense/.test(trophy));
  await pg.screenshot({ path: `${OUT}/${tag}-trophy.png` });
  check(tag, 'no page errors', pg.errs.length === 0, pg.errs.join(' | '));
  await ctx.close();
}

const fails = rows.filter((r) => r.startsWith('FAIL')).length;
const out = `PB-05 verify-ui-shots ${new Date().toISOString()}\n${rows.join('\n')}\n\n${rows.length - fails} PASS, ${fails} FAIL\n`;
fs.writeFileSync(`${OUT}/verify-log.txt`, out);
console.log(out);
await b.close();
process.exit(fails ? 1 : 0);
