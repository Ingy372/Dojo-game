// Q-PREM-F4: the guided Keeper's Hall loss. Shots right after the hero goes down and on the run-over card.
// Usage: OUT=<prefix> node f4-loss.mjs   (PORT defaults to 5495)
import { chromium } from 'playwright';
const PORT = process.env.PORT || 5495; const OUT = process.env.OUT || 'loss';
const sizes = (process.env.SIZES || '667x375,667x320,844x390,932x430').split(',').map((s) => s.split('x').map(Number));
const b = await chromium.launch(); const log = [];
for (const [W, H] of sizes) for (const rm of ['off', 'on']) {
  const ctx = await b.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
  await ctx.addInitScript((rm) => { localStorage.setItem('dojo-ascent-test-student', '4-green-belt'); localStorage.setItem('dojo.reducedMotion', rm); }, rm);
  const pg = await ctx.newPage(); const errs = []; pg.on('pageerror', (e) => errs.push(e.message));
  await pg.goto(`http://localhost:${PORT}/?room=keepers-hall&seed=7&difficulty=guided`); await pg.waitForFunction(() => window.game?.scene?.getScenes?.(true).length); await pg.waitForTimeout(1500);
  await pg.evaluate(async () => { const g = window.game; const t = await import('/src/game/tower.ts'); const sv = await import('/src/game/save.ts'); const tr = (await import('/src/game/student.ts')).currentTraining(); g.scene.getScenes(true).forEach((s) => g.scene.stop(s.scene.key)); g.scene.start('Game', { run: t.startTowerRun(sv.loadSave(), tr) }); });
  const T = () => pg.evaluate(() => { const o = []; for (const s of window.game.scene.getScenes(true)) { const w = (l, d) => l.forEach((c) => { const dd = d ?? c.depth; if (c.list) w(c.list, dd); if (c.type === 'Text' && c.visible && c.alpha > 0.05) { const bb = c.getBounds(); o.push({ t: c.text.slice(0, 30), x: bb.centerX, y: bb.centerY, d: dd }); } }); w(s.children.list); } return o; });
  for (let i = 0; i < 60; i++) { await pg.waitForTimeout(300); const t = await T(); const bow = t.find((x) => x.t === 'Bow'); if (bow) { await pg.touchscreen.tap(bow.x, bow.y); await pg.waitForTimeout(2500); break; } const p = t.find((x) => /^(Let's go!|Got it|OK|Okay!)$/.test(x.t) && x.d >= 60); if (p) await pg.touchscreen.tap(p.x, p.y); }
  // Wait for the boss bar, then knock the hero down.
  await pg.waitForTimeout(1500);
  await pg.evaluate(() => { const s = window.game.scene.getScene('Game'); const p = s.world.players[s.me]; p.health = 1; s.world.minHealth = 0; for (const e of s.world.enemies) e.pos = { ...p.pos, x: p.pos.x + 0.6 }; });
  let down = false; for (let i = 0; i < 300 && !down; i++) { await pg.waitForTimeout(150); down = await pg.evaluate(() => window.game.scene.getScene('Game').downed === true); if (!down && i % 6 === 0) { const t = await T(); const s = t.find((x) => /^Sensei:/.test(x.t)); const c = s && t.find((x) => x.t === (/COUNTER/.test(s.t) ? 'COUNTER' : /STRIKE/.test(s.t) ? 'STRIKE' : /DASH/.test(s.t) ? 'DASH' : 'COUNTER')); if (c) await pg.touchscreen.tap(c.x, c.y); } }
  await pg.waitForTimeout(350);
  const state = await pg.evaluate(() => { const s = window.game.scene.getScene('Game'); const vis = (o) => o.visible && o.alpha > 0.05; return { bossName: vis(s.bossName) ? s.bossName.text : '', buttons: s.buttons.objects.filter(vis).length, stick: s.controls.objects.filter(vis).length }; });
  await pg.screenshot({ path: `${OUT}-down-${W}x${H}-rm-${rm}.png` });
  // Taps on the fight buttons and the stick area after going down must do nothing.
  const btn = await pg.evaluate(() => { const s = window.game.scene.getScene('Game'); return s.buttons.objects.map((c) => [c.x, c.y]); });
  for (const [x, y] of btn) await pg.touchscreen.tap(x, y);
  await pg.touchscreen.tap(60, H - 60);
  const pend = await pg.evaluate(() => { const s = window.game.scene.getScene('Game'); return { action: s.buttons.takeAction() ?? null, move: s.controls.takeInput().kind }; });
  let card = null; for (let i = 0; i < 80 && !card; i++) { await pg.waitForTimeout(250); card = (await T()).find((x) => x.t === 'Try again'); }
  await pg.waitForTimeout(700);
  await pg.screenshot({ path: `${OUT}-card-${W}x${H}-rm-${rm}.png` });
  log.push(`${W}x${H} rm=${rm}: down=${down} bossName="${state.bossName}" visibleFightButtons=${state.buttons} visibleStick=${state.stick} afterTaps action=${pend.action} move=${pend.move} card=${card ? card.t : 'none'} errors=${errs.length}`);
  await ctx.close();
}
console.log(log.join('\n')); await b.close();
