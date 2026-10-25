import { it } from 'vitest';
import { testContent } from './load-content';
import { playRun, SKILLS } from './balance/bot';
const a = { power: 45.85, health: 332.79, guard: 33.53 };
const VARIANTS: Record<string, any> = JSON.parse(process.env.VARIANTS ?? '{"current":{}}');
const N = Number(process.env.N ?? 40);
it('probe', () => {
  const out: string[] = [];
  for (const [name, v] of Object.entries(VARIANTS)) {
    const content = testContent();
    const e = content.enemies['hearth-cook'] as any;
    Object.assign(e, v.stats ?? {});
    if (v.addAttacks) e.attacks = [...e.attacks, ...v.addAttacks];
    if (v.atk) e.attacks.forEach((x: any) => { if (v.atk[x.name]) Object.assign(x, v.atk[x.name]); });
    if (v.phases) e.phases = v.phases;
    if (v.summon) e.summon = { ...e.summon, ...v.summon };
    out.push(`== ${name} H${e.maxHealth} P${e.power}`);
    const base = { maxHealth: a.health, power: a.power, guard: a.guard };
    for (const diff of ['standard', 'challenge'] as const) for (const [st, sk] of [['smart','typical'],['smart','novice'],['masher','novice']] as const) {
      let reached = 0, beat = 0, t = 0, dmg = 0, mx = 0;
      for (let s = 1; s <= N; s++) {
        const r = playRun(content, s, st as any, SKILLS[sk], diff, base, undefined, { tier: 3 });
        const b = r.rooms.find((x) => x.roomId === 'great-hearth');
        if (!b) continue; reached++; if (!b.died) beat++;
        t += b.ticks / 20; const d = Math.min(1, b.damage / a.health); dmg += d; mx = Math.max(mx, d);
      }
      out.push(`${diff}/${st}-${sk}: beat ${beat}/${reached} time ${(t/Math.max(1,reached)).toFixed(1)}s dmg avg ${(100*dmg/Math.max(1,reached)).toFixed(0)}% max ${(100*mx).toFixed(0)}%`);
    }
  }
  require('fs').writeFileSync('/tmp/probe.txt', out.join('\n'));
}, 1800000);
