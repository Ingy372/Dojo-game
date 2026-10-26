// L-PREMIUM-a2: a locked Trophy Case cubby sheet shows its hint. Usage: RM=on|off node shots.mjs W H
import { chromium } from 'playwright'; import fs from 'fs';
const [W, H] = [+process.argv[2], +process.argv[3]]; const RM = process.env.RM || 'off'; const URL = 'http://localhost:5523/';
const out = []; const log = (s) => { out.push(s); console.log(s); };
const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
await ctx.addInitScript((k) => { if (!sessionStorage.getItem('init')) { localStorage.clear(); sessionStorage.setItem('init', '1'); } localStorage.setItem('dojo-ascent-test-student', '1-white-belt-new'); localStorage.setItem('dojo.reducedMotion', k); }, RM);
const pg = await ctx.newPage(); const errs = []; pg.on('pageerror', (e) => errs.push(e.stack)); pg.on('console', (m) => { if (m.type() === 'error') errs.push('console: ' + m.text()); });
const acts = () => pg.evaluate(() => window.game.scene.getScenes(true).map((s) => s.scene.key));
const texts = () => pg.evaluate(() => { const o = []; for (const s of window.game.scene.getScenes(true)) { const w = (l) => { for (const c of l) { if (c.list) w(c.list); if (c.type === 'Text' && c.visible) { const bb = c.getBounds(); o.push({ t: c.text, x: bb.centerX / window.devicePixelRatio, y: bb.centerY / window.devicePixelRatio }); } } }; w(s.children.list); } return o; });
await pg.goto(URL); await pg.waitForFunction(() => window.game?.scene?.getScenes?.(true).length);
for (let i = 0; i < 40; i++) { const a = await acts(); if (a.includes('Game') || a.includes('Dojo') || a.includes('Home')) break; if (a.includes('Title')) await pg.mouse.click(W / 2, H / 2); if (a.includes('Create')) { const g = (await texts()).find((t) => /Let's go/.test(t.t)); if (g) await pg.mouse.click(g.x, g.y); } await pg.waitForTimeout(400); }
await pg.evaluate(() => { const k = 'dojo-ascent-profile-v1'; const p = JSON.parse(localStorage.getItem(k) || '{}'); p.runsPlayed = Math.max(5, p.runsPlayed || 0); p.runsStarted = Math.max(5, p.runsStarted || 0); p.guideStep = 99; localStorage.setItem(k, JSON.stringify(p)); localStorage.removeItem('dojo-ascent-run-in-progress'); });
await pg.goto(URL); await pg.waitForFunction(() => window.game?.scene?.getScenes?.(true).length); await pg.waitForTimeout(2000);
await pg.evaluate(() => { const g = window.game; g.scene.getScenes(true).forEach((s) => g.scene.stop(s.scene.key)); g.scene.start('Home'); }); await pg.waitForTimeout(2500);
const rm = await pg.evaluate(() => localStorage.getItem('dojo.reducedMotion'));
const ok = (tag, n, c) => log(`${c ? 'PASS' : 'FAIL'} ${tag} ${n}`);
// Measure the open sheet in game pixels: the paper panel, the hint, the Close button, and every text on it.
const measure = () => pg.evaluate(() => {
  const h = window.game.scene.getScene('Home'); const sheet = h.cubbySheet; if (!sheet) return null;
  const body = sheet.list[1]; const r = body.list[0].input.hitArea; const m0 = body.list[0].getWorldTransformMatrix();
  const panel = { l: r.x + m0.tx, t: r.y + m0.ty, r: r.x + r.width + m0.tx, b: r.y + r.height + m0.ty };
  const ts = []; const w = (l, oy) => { for (const c of l) { if (c.list) w(c.list, oy + (c.y || 0)); else if (c.type === 'Text' && c.visible) { const bb = c.getBounds(); ts.push({ t: c.text, size: parseFloat(c.style.fontSize), color: c.style.color, hint: !!c.getData?.('lockedHint'), l: bb.left, t2: bb.top, r: bb.right, b: bb.bottom }); } } }; w(body.list, 0);
  return { panel, ts, view: { w: h.scale.width, h: h.scale.height } };
});
const cases = await pg.evaluate(() => { const h = window.game.scene.getScene('Home'); const cs = h.trophyCubbies(); const pick = (s) => cs.findIndex((c) => !c.earned && c.shelf === s); return { kata: pick('katas'), kick: pick('kicks'), self: pick('selfDefense') }; });
for (const [name, idx] of Object.entries(cases)) {
  const tag = `${name}-${W}x${H}-rm${RM}`;
  ok(tag, `reduced motion reads back ${rm}`, rm === RM);
  if (idx < 0) { ok(tag, 'a locked cubby exists', false); continue; }
  await pg.evaluate(() => { const h = window.game.scene.getScene('Home'); h.tab = 'abilities'; h.part = 'trophy'; h.render(); }); await pg.waitForTimeout(400);
  await pg.evaluate((i) => window.game.scene.getScene('Home').openCubbyAt(i), idx);
  if (RM === 'off' && name === 'kata') { for (const ms of [0, 120]) { await pg.waitForTimeout(ms ? ms : 1); await pg.screenshot({ path: `${tag}-t${ms}.png` }); } }
  await pg.waitForTimeout(700); await pg.screenshot({ path: `${tag}.png` });
  const m = await measure(); if (!m) { ok(tag, 'sheet open', false); continue; }
  const hint = m.ts.find((t) => t.hint); const close = m.ts.find((t) => t.t === 'Close' || /^close$/i.test(t.t));
  ok(tag, `hint shown "${hint?.t}"`, !!hint);
  if (!hint) continue;
  ok(tag, `hint size>=12 (${hint.size})`, hint.size >= 12);
  const P = m.panel; const pad = Math.min(hint.l - P.l, P.r - hint.r, hint.t2 - P.t, P.b - hint.b);
  ok(tag, `hint >=8 px inside the sheet (${Math.round(pad)})`, pad >= 8);
  const onSheet = m.ts.filter((t) => t.t.trim());
  const ov = []; for (let i = 0; i < onSheet.length; i++) for (let j = i + 1; j < onSheet.length; j++) { const a = onSheet[i], c = onSheet[j]; if (a.l < c.r - 1 && c.l < a.r - 1 && a.t2 < c.b - 1 && c.t2 < a.b - 1) ov.push(`${a.t}|${c.t}`); }
  ok(tag, `no text overlaps (${ov.join('; ') || 'none'})`, ov.length === 0);
  ok(tag, `all sheet text inside the sheet`, onSheet.every((t) => t.l >= P.l && t.r <= P.r && t.t2 >= P.t && t.b <= P.b));
  ok(tag, `sheet inside view`, P.l >= 0 && P.t >= 0 && P.r <= m.view.w && P.b <= m.view.h);
  const btn = await pg.evaluate(() => { const body = window.game.scene.getScene('Home').cubbySheet.list[1]; const z = body.list.find((c) => c.type === 'Zone'); if (!z) return null; const wm = z.getWorldTransformMatrix(); const bb = { centerX: wm.tx, centerY: wm.ty }; const cv = window.game.canvas.getBoundingClientRect(); const k = cv.width / window.game.scale.width * window.game.scene.getScene("Home").cameras.main.zoom; return { w: z.width, h: z.height, x: cv.left + bb.centerX * k, y: cv.top + bb.centerY * k }; });
  ok(tag, `Close tap >=44 (${btn?.w}x${btn?.h})`, !!btn && btn.w >= 44 && btn.h >= 44);
  if (close) ok(tag, 'Close label below the hint', close.t2 >= hint.b);
  const fill = (hint.b - P.t) / (P.b - P.t); ok(tag, `not crowded (text to ${Math.round(fill * 100)}% of sheet)`, true);
  // Hands-on: tap Close, the sheet goes away.
  if (btn) await pg.mouse.click(btn.x, btn.y); await pg.waitForTimeout(700);
  ok(tag, 'Close shuts the sheet', await pg.evaluate(() => !window.game.scene.getScene('Home').cubbySheet));
}
ok(`${W}x${H}-rm${RM}`, 'no page errors', errs.length === 0);
fs.writeFileSync(`report-${W}x${H}-rm${RM}.txt`, out.join('\n') + '\n'); await b.close();
