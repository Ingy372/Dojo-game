import { it } from 'vitest';
import { testContent } from './load-content';
import { playRun, SKILLS } from './balance/bot';
import { bandCheck } from './r-bal-12-bands.test';
const T = [
  { power: 17.02, health: 146.96, guard: 9.34 },{ power: 30.70, health: 237.08, guard: 23.05 },{ power: 45.85, health: 332.79, guard: 33.53 }];
const VARIANTS: Record<string, any> = JSON.parse(process.env.VARIANTS ?? '{"current":{}}');
const N = Number(process.env.N ?? 40);
it('probe', () => {
  const out: string[] = [];
  for (const [name, v] of Object.entries(VARIANTS)) {
    const content = testContent();
    const tier = v.tier ?? 3; const id = v.id ?? 'hearth-cook'; const room = v.room ?? 'great-hearth';
    const e = content.enemies[id] as any;
    Object.assign(e, v.stats ?? {});
    if (v.tel) e.attacks.forEach((a: any) => { if (v.tel[a.name] !== undefined) a.telegraphTicks = v.tel[a.name]; });
    if (v.rec) e.attacks.forEach((a: any) => { if (v.rec[a.name] !== undefined) a.recoverTicks = v.rec[a.name]; });
    if (v.summon) e.summon.count = v.summon;
    const bc = bandCheck(id, tier, 'typical');
    out.push(`== ${name} tier${tier} H${e.maxHealth} P${e.power} G${e.guard} static beat std/chal ${bc.beat} ko ${bc.ko}`);
    const a = T[tier - 1]; const base = { maxHealth: a.health, power: a.power, guard: a.guard };
    for (const diff of ['standard', 'challenge'] as const) for (const sk of ['typical', 'novice'] as const) {
      let reached = 0, beat = 0, t = 0, dmg = 0, str = 0, hits = 0;
      for (let s = 1; s <= N; s++) {
        const r = playRun(content, s, (v.style ?? 'smart'), SKILLS[sk], diff, base, undefined, { tier });
        const b = r.rooms.find((x) => x.roomId === room) ?? r.rooms.find((x)=>x.kind==='boss');
        if (!b) continue; reached++; if (!b.died) beat++;
        t += b.ticks / 20; dmg += b.damage / a.health; str += b.strikes; hits += b.hits;
      }
      out.push(`${diff}/${sk}: beat ${beat}/${reached} time ${(t/reached).toFixed(1)}s dmg ${(100*dmg/reached).toFixed(0)}% strikes ${(str/reached).toFixed(0)} hitsTaken ${(hits/reached).toFixed(1)}`);
    }
  }
  require('fs').writeFileSync('/tmp/probe.txt', out.join('\n'));
}, 900000);
