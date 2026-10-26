import { chromium } from 'playwright'; import fs from 'fs';
const [W, H] = [+process.argv[2], +process.argv[3]]; const tag = `try-${W}x${H}`;
const line = JSON.parse(fs.readFileSync('/workspace/q-prem-try/content/tutorial/first-session-lessons.json', 'utf8')).lessons.find((l) => l.id === 'lesson-warning').retry;
const out = []; const log = (s) => { out.push(s); console.log(s); };
const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
await ctx.addInitScript(() => { if (!sessionStorage.getItem('init')) { localStorage.clear(); sessionStorage.setItem('init', '1'); } localStorage.setItem('dojo-ascent-test-student', '4-green-belt'); });
const pg = await ctx.newPage(); const errs = []; pg.on('pageerror', (e) => errs.push(e.stack));
const acts = () => pg.evaluate(() => window.game.scene.getScenes(true).map((s) => s.scene.key));
const texts = () => pg.evaluate(() => { const o = []; for (const s of window.game.scene.getScenes(true)) { const w = (l) => { for (const c of l) { if (c.list) w(c.list); if (c.type === 'Text' && c.visible && c.alpha > 0.01) { const bb = c.getBounds(); o.push({ t: c.text, size: c.style.fontSize, color: c.style.color, x: bb.centerX, y: bb.centerY, l: Math.round(bb.left), r: Math.round(bb.right), top: Math.round(bb.top), bot: Math.round(bb.bottom), vw: s.scale.width, vh: s.scale.height }); } } }; w(s.children.list); } return o; });
await pg.goto('http://localhost:5482/?room=keepers-hall'); await pg.waitForFunction(() => window.game?.scene?.getScenes?.(true).length);
for (let i = 0; i < 40; i++) { const a = await acts(); if (a.includes('Game') || a.includes('Dojo') || a.includes('Home')) break; if (a.includes('Title')) await pg.mouse.click(W / 2, H / 2); if (a.includes('Create')) { const g = (await texts()).find((t) => /Let's go/.test(t.t)); if (g) await pg.mouse.click(g.x, g.y); } await pg.waitForTimeout(400); }
await pg.evaluate(() => { const g = window.game; g.scene.getScenes(true).forEach((s) => g.scene.stop(s.scene.key)); g.scene.start('Game'); }); await pg.waitForTimeout(2500);
await pg.evaluate((ln) => window.game.scene.getScene('Game').senseiSay([ln]), line); await pg.waitForTimeout(700);
await pg.screenshot({ path: `${tag}.png` });
const t = (await texts()).find((x) => x.t.replace(/\s+/g, ' ').includes(line));
const ok = (n, c) => log(`${c ? 'PASS' : 'FAIL'} ${tag} ${n}`);
ok('line on screen', !!t); if (t) { ok(`size>=12 (${t.size})`, parseFloat(t.size) >= 12); ok(`inside view (${t.l}-${t.r} of ${t.vw}, ${t.top}-${t.bot} of ${t.vh})`, t.l >= 0 && t.r <= t.vw && t.top >= 0 && t.bot <= t.vh); ok(`one-piece text "${t.t.replace(/\n/g, '⏎')}"`, true); }
ok('no page errors', errs.length === 0); fs.writeFileSync(`report-${tag}.txt`, out.join('\n') + '\n'); await b.close();
