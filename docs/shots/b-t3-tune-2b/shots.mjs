import { chromium } from 'playwright'; import fs from 'fs';
const [W, H] = [+process.argv[2], +process.argv[3]]; const RM = process.env.RM === '1' ? 'on' : 'off'; const tag = `rm-${RM}-${W}x${H}`;
const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 2 });
await ctx.addInitScript(k => { if (!sessionStorage.getItem('init')) { localStorage.clear(); sessionStorage.setItem('init', '1'); } localStorage.setItem('dojo-ascent-test-student', '3-yellow-belt'); localStorage.setItem('dojo.reducedMotion', k); }, RM);
const pg = await ctx.newPage(); const errs = []; pg.on('pageerror', e => errs.push(e.message)); pg.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
await pg.goto('http://localhost:5501/?room=great-hearth&guide=3'); await pg.waitForFunction(() => window.game?.scene?.getScenes?.(true).length); await pg.waitForTimeout(3000);
await pg.evaluate(async () => { const t = await import('/src/game/tower.ts'); const tr = await import('/src/game/student.ts').catch(() => null);
  const save = await import('/src/game/save.ts'); const g = window.game;
  g.scene.getScenes(true).forEach(s => g.scene.stop(s.scene.key));
  g.scene.start('Game', { run: t.startTowerRun(save.loadSave(), tr?.currentTraining ? tr.currentTraining() : null) }); });
await pg.waitForTimeout(4000);
await pg.mouse.click(W / 2, H * 0.66); await pg.waitForTimeout(7000);
const report = { errs, shots: [] };
// Keep the player alive and near the boss; force the attack we want next.
await pg.evaluate(() => { window.__want = null; setInterval(() => { const s = window.game.scene.getScene('Game'); if (!s?.world) return; const boss = s.world.enemies.find(e => e.def.boss); const p = s.world.players[s.me]; if (!boss || !p) return;
  p.health = p.maxHealth ?? p.health; s.world.enemies.forEach(e => { if (e.summoned && e.mode !== 'defeated') e.health = Math.max(e.health, e.def.maxHealth); }); if (window.__want != null && boss.mode !== 'windup' && boss.mode !== 'recover') boss.attackIndex = window.__want; }, 16); });
const probe = (label) => pg.evaluate(async (label) => { const s = window.game.scene.getScene('Game'); const w = await import('/@fs/workspace/b-t3-tune-2b/packages/sim/src/world.ts').catch(() => null); const m = await import('/src/game/motion.ts');
  const boss = s.world.enemies.find(e => e.def.boss); const v = s.enemyViews.get(boss.id); const sp = v?.sprite ?? v?.body ?? null;
  const lidImg = sp?.images?.get?.('lid'); const icon = s.lidIcon; const ib = icon?.visible ? icon.getBounds() : null;
  return { label, reducedMotion: m.reducedMotion(), mode: boss.mode, attack: boss.def.attacks[boss.attackIndex % boss.def.attacks.length].name, modeTicks: boss.modeTicks, windupTotal: boss.windupTotal, share: +(boss.health / boss.def.maxHealth).toFixed(2), rig: v?.rig, anim: sp?.current ?? sp?.anim ?? null,
    lidLayerVisible: lidImg ? !sp.hidden.has('lid') : null, lidDrawnThisFrame: lidImg ? lidImg.visible : null, dir: sp?.dir, helpers: s.world.enemies.filter(e => e.summoned && e.mode !== 'defeated').length,
    icon: ib ? { visible: true, w: Math.round(ib.width), h: Math.round(ib.height), x: Math.round(ib.x), y: Math.round(ib.y) } : { visible: !!icon?.visible } }; }, label);
async function phase(frac, dx = -1.8, dy = -0.4) { await pg.evaluate(([f, dx, dy]) => { const s = window.game.scene.getScene('Game'); const boss = s.world.enemies.find(e => e.def.boss); const p = s.world.players[s.me]; boss.health = Math.floor(boss.def.maxHealth * f); boss.pos = { x: p.pos.x + dx, y: p.pos.y + dy }; p.pos = { ...p.pos }; }, [frac, dx, dy]); await pg.waitForTimeout(3500); }
async function attack(name, key) {
  await pg.evaluate((n) => { const s = window.game.scene.getScene('Game'); const boss = s.world.enemies.find(e => e.def.boss); window.__want = boss.def.attacks.findIndex(a => a.name === n); }, name);
  await pg.waitForFunction((n) => { const b = window.game.scene.getScene('Game').world.enemies.find(e => e.def.boss); return b.mode === 'windup' && b.def.attacks[b.attackIndex].name === n && b.modeTicks <= b.windupTotal / 2; }, name, { timeout: 30000, polling: 16 });
  report.shots.push(await probe(`${key}-windup`)); await pg.screenshot({ path: `${tag}-${key}-windup.jpg` });
  await pg.waitForFunction(() => window.game.scene.getScene('Game').world.enemies.find(e => e.def.boss).mode === 'recover', null, { timeout: 10000, polling: 16 });
  await pg.waitForTimeout(150); report.shots.push(await probe(`${key}-attack`)); await pg.screenshot({ path: `${tag}-${key}-attack.jpg` });
}
try {
  await phase(0.9); await attack('rolling pin lane', 'p1-pin');
  await phase(0.5); await pg.waitForFunction(() => window.game.scene.getScene('Game').world.enemies.some(e => e.summoned && e.mode !== 'defeated'), null, { timeout: 15000 });
  await pg.waitForTimeout(800); report.shots.push(await probe('p2-lid')); await pg.screenshot({ path: `${tag}-p2-lid.jpg` });
  await attack('rolling pin lane', 'p2-pin');
  await phase(0.2, -0.6, -1.7); await attack('ladle bonk', 'p3-bonk');
  await pg.evaluate(() => { window.__want = null; });
  await pg.waitForFunction(() => { const s = window.game.scene.getScene('Game'); const b = s.world.enemies.find(e => e.def.boss); return s.enemyViews.get(b.id)?.sprite?.images?.get('lid')?.visible; }, null, { timeout: 25000, polling: 16 }).catch(() => {});
  report.shots.push(await probe('p3-lid')); await pg.screenshot({ path: `${tag}-p3-lid.jpg` });
} catch (e) { report.fail = String(e); }
fs.writeFileSync(`report-${tag}.json`, JSON.stringify(report, null, 1)); await b.close(); console.log(tag, report.fail ?? 'ok', errs.length);
