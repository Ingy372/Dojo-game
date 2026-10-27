// R-B1-RAMP-2 background check: each w- copy (white belt) vs its original (yellow belt), same art pack (?tower=t1).
// Run from /workspace/al-shots: RM=on|off node shots.mjs W H. Hides every object, redraws only the room art, then pixel-diffs.
import { chromium } from 'playwright'; import fs from 'fs';
const [W, H] = [+process.argv[2], +process.argv[3]]; const RM = process.env.RM || 'off'; const OUT = process.env.OUT; const tag = `${W}x${H}-rm${RM}`;
const ids = JSON.parse(fs.readFileSync(`${OUT}/ids.json`, 'utf8'));
const b = await chromium.launch(); const lines = [];
async function shot(student, room, file) {
  const ctx = await b.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1, hasTouch: true, isMobile: true });
  await ctx.addInitScript(([s, rm]) => { localStorage.clear(); localStorage.setItem('dojo-ascent-test-student', s); localStorage.setItem('dojo.reducedMotion', rm); }, [student, RM]);
  const pg = await ctx.newPage(); const errs = []; pg.on('pageerror', (e) => errs.push(e.message));
  await pg.goto(`http://localhost:5481/?room=${room}&tower=t1&seed=1`); await pg.waitForFunction(() => window.game?.scene?.getScenes?.(true).length);
  const acts = () => pg.evaluate(() => window.game.scene.getScenes(true).map((s) => s.scene.key));
  for (let i = 0; i < 60 && !(await acts()).some((a) => /Game|Dojo|Home/.test(a)); i++) { const a = await acts(); if (a.includes('Title')) await pg.mouse.click(W / 2, H / 2);
    if (a.includes('Create')) { const go = await pg.evaluate(() => { const s = window.game.scene.getScene('Create'); const f = (l) => { for (const c of l) { if (c.list) { const r = f(c.list); if (r) return r; } if (c.type === 'Text' && /Let's go/.test(c.text) && c.visible) { const bb = c.getBounds(); return { x: bb.centerX, y: bb.centerY }; } } }; return f(s.children.list); }); if (go) await pg.mouse.click(go.x, go.y); } await pg.waitForTimeout(300); }
  await pg.waitForFunction(() => { const g = window.game; return g.scene.isActive('Game') || ['Home', 'Dojo'].some((k) => g.scene.isActive(k) && g.scene.getScene(k).profile); }, null, { timeout: 30000 }); await pg.waitForTimeout(800);
  // Enter the tower the real way (Home or Dojo door), so ?room= goes through startTowerRun.
  await pg.evaluate(() => { const g = window.game; if (g.scene.isActive('Game')) return; const h = g.scene.getScene('Home'), d = g.scene.getScene('Dojo'); if (g.scene.isActive('Home')) h.enterTower(); else { d.leaving = false; d.goTower(); } });
  await pg.waitForFunction(() => window.game.scene.getScene('Game')?.room); await pg.waitForTimeout(1500);
  const got = await pg.evaluate(() => { const g = window.game; const s = g.scene.getScene('Game'); g.scene.getScenes(true).forEach((o) => { if (o !== s) g.scene.stop(o.scene.key); });
    s.scene.pause(); s.children.list.forEach((c) => c.setVisible?.(false)); s.drawRoom(); return s.room.id; });
  await pg.waitForTimeout(300); await pg.screenshot({ path: file }); await ctx.close(); return { got, errs };
}
for (const w of ids) {
  const o = w.slice(2); const fa = `${OUT}/${tag}-${w}.png`, fb = `${OUT}/${tag}-${o}.png`;
  const a = await shot('2-white-belt-3-signoffs', w, fa), c = await shot('3-yellow-belt', o, fb);
  lines.push(JSON.stringify({ tag, copy: w, gotCopy: a.got, orig: o, gotOrig: c.got, a: fa, b: fb, errs: [...a.errs, ...c.errs] }));
}
fs.writeFileSync(`${OUT}/pairs-${tag}.jsonl`, lines.join('\n') + '\n'); await b.close();
