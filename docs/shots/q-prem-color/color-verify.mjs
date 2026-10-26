// Q-PREM-COLOR verify-ui-shots: the main green buttons after #3aa57a -> GREEN #277a56.
// 4 sizes x Reduced motion on/off; start/mid/end frames; boxes for label + tap zone written to boxes.json.
// color-check.py then samples the shots' pixels (background colour, label contrast) and writes the log.
// Run from apps/client: npx vite --port 5499; then `node color-verify.mjs && python3 color-check.py > verify-log.txt`.
import { chromium } from 'playwright';
import { writeFileSync } from 'node:fs';
const PORT = process.env.PORT || 5499;
const sizes = (process.env.SIZES || '667x320,667x375,844x390,932x430').split(',').map((s) => s.split('x').map(Number));
// open: a scene to start in the page; pre: taps from the Title first (dash: OK on the saved note, then tap to start).
const targets = {
  title: { label: 'OK', url: '/' },
  create: { open: 'create', label: "Let's go!" },
  street: { open: 'street', label: 'Mom' },
  rest: { open: 'rest', label: '#fff6e0' },
  dash: { url: '/?room=training', pre: 2, label: 'DASH' },
};
const out = [];
const b = await chromium.launch();
for (const [W, H] of sizes) for (const rm of ['on', 'off']) for (const [name, t] of Object.entries(targets)) {
  const where = `${name} ${W}x${H} rm=${rm}`;
  const ctx = await b.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
  await ctx.addInitScript((k) => { if (!sessionStorage.getItem('init')) { localStorage.clear(); sessionStorage.setItem('init', '1'); } localStorage.setItem('dojo-ascent-test-student', '4-green-belt'); localStorage.setItem('dojo.reducedMotion', k); }, rm);
  const pg = await ctx.newPage(); const errs = []; pg.on('pageerror', (e) => errs.push(String(e)));
  await pg.goto(`http://localhost:${PORT}${t.url || '/'}`); await pg.waitForFunction(() => window.game?.scene?.getScenes?.(true).length); await pg.waitForTimeout(t.url ? 3500 : 1500);
  const rmNow = await pg.evaluate(async () => ((await import('/src/game/motion.ts')).reducedMotion() ? 'on' : 'off'));
  if (t.pre) for (let i = 0; i < t.pre; i++) { await pg.touchscreen.tap(W / 2, H * 0.9); await pg.waitForTimeout(2500); }
  if (t.open) await pg.evaluate(async (n) => { const g = window.game; if (n !== 'rest') g.scene.getScenes(true).forEach((s) => g.scene.stop(s.scene.key)); await ({ create: (g) => g.scene.start('Create', { first: true }), street: (g) => g.scene.start('StreetSmarts', { id: 'store-separated' }), rest: async (g) => { g.scene.getScenes(true).forEach((s) => g.scene.stop(s.scene.key)); g.scene.start('Home'); await new Promise((r) => setTimeout(r, 1500)); const m = await import('/src/ui/RunOverCard.ts'); const h = g.scene.getScene('Home'); window.__restHome = 0; m.restCard(h, () => { window.__restHome++; }); } })[n](g); }, t.open);
  await pg.waitForTimeout(60);
  const box = () => pg.evaluate((lab) => {
    const g = window.game; let label = null, sc = null;
    for (const s of g.scene.getScenes(true)) { const walk = (l) => { for (const c of l) { if (!c.visible) continue; if (c.list) walk(c.list); else if (c.type === 'Text' && (lab.startsWith('#') ? c.style.color === lab && c.parentContainer?.depth >= 110 : c.text.includes(lab))) { label = c; sc = s; } } }; walk(s.children.list); }
    if (!label) return null; const lb = label.getBounds(); const cx = lb.centerX, cy = lb.centerY;
    const zs = sc.input._list.filter((o) => o.visible !== false && o.getBounds && o.getBounds().contains(cx, cy)).map((o) => o.getBounds()).sort((a, b) => a.width * a.height - b.width * b.height);
    // No input zone (Title: tap anywhere; action buttons: touch by distance): use the button's own shape.
    const shapes = []; const walkS = (l) => { for (const c of l) { if (!c.visible) continue; if (c.list) walkS(c.list); else if ((c.type === 'Rectangle' || c.type === 'Arc') && c.getBounds().contains(cx, cy) && c.getBounds().width < g.scale.width * 0.8) shapes.push(c.getBounds()); } }; walkS(sc.children.list);
    shapes.sort((a, b) => a.width * a.height - b.width * b.height);
    const z = zs.find((b) => b.width < g.scale.width * 0.8) || shapes[0]; const a = (o) => { let p = label, al = label.alpha; while ((p = p.parentContainer)) al *= p.alpha; return al; };
    return { text: label.text, size: parseFloat(label.style.fontSize), color: label.style.color, alpha: a(), label: { l: lb.left, t: lb.top, r: lb.right, b: lb.bottom }, zone: z ? { l: z.left, t: z.top, r: z.right, b: z.bottom } : null, scene: sc.scene.key };
  }, t.label);
  const frames = {};
  for (const [f, ms] of [['start', 0], ['mid', 150], ['end', 1200]]) {
    if (ms) await pg.waitForTimeout(ms - (f === 'end' ? 150 : 0));
    const file = `color-${name}-${f}-${W}x${H}-rm-${rm}.png`; const bx = await box(); await pg.screenshot({ path: file }); frames[f] = { file, ...bx };
  }
  // Hands-on: tap the button for real (touch) and check what it did.
  let tap = 'n/a';
  const e = frames.end;
  if (e?.zone && ['create', 'rest', 'title'].includes(name)) {
    await pg.touchscreen.tap((e.zone.l + e.zone.r) / 2, (e.zone.t + e.zone.b) / 2); await pg.waitForTimeout(1500);
    tap = name === 'title' ? ((await box()) ? 'note still up' : 'note closed') : name === 'create' ? (await pg.evaluate(() => window.game.scene.getScenes(true).map((s) => s.scene.key).join(','))) : String(await pg.evaluate(() => window.__restHome));
  }
  out.push({ where, name, W, H, rm, rmNow, frames, tap, errs });
  await ctx.close();
}
await b.close();
writeFileSync('boxes.json', JSON.stringify(out, null, 1));
