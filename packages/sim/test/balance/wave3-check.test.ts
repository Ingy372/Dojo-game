/// <reference types="vite/client" />
// Wave-3 check (Nov 26, Grok playtest of Nov 25, section 4 item 4): how much Health a bot loses in each wave of
// each Yellow (Sunrise Garden) and Orange (Ember Kitchens) room, at the stats a real student at that belt has.
// Not part of the normal tests. Run it with:  BALANCE=1 npx vitest run test/balance/wave3-check --silent=false
import { describe, it } from 'vitest';
import { createRng, createRunWorld, currentRoom, startRun, type Content, type Difficulty, type WorldState } from '../../src';
import { testContent } from '../load-content';
import { ARTISTS } from '../r-bal-12-artists';
import { SKILLS, playRoom, type Skill, type Style } from './bot';

declare const console: { log(...args: unknown[]): void };

const env = import.meta.env as Record<string, string | undefined>;
const enabled = !!env.BALANCE;
const RUNS = Number(env.RUNS ?? 60);
/** STATS_BELT=1 plays every floor with a White belt's stats (like a hero left at Level 1 after a belt switch). */
const STATS_BELT = Number(env.STATS_BELT ?? 0);

/** Per room and wave: Health lost (share of max), seconds, and deaths. */
interface Cell {
  lost: number[];
  secs: number[];
  deaths: number;
}

function measure(content: Content, tier: number, difficulty: Difficulty, style: Style, skill: Skill) {
  const a = ARTISTS.typical[(STATS_BELT || tier) - 1];
  const base = { maxHealth: a.health, power: a.power, guard: a.guard };
  const cells = new Map<string, Cell>();
  const cell = (k: string) => cells.get(k) ?? (cells.set(k, { lost: [], secs: [], deaths: 0 }), cells.get(k)!);
  let won = 0;
  for (let i = 0; i < RUNS; i++) {
    const seed = 2000 + i;
    const run = startRun(content, { seed, dryRuns: 0, difficulty, tier });
    const rng = createRng(seed * 7919 + 13);
    let rooms = 0;
    while (run.status === 'playing' && rooms++ < 20) {
      const room = currentRoom(content, run);
      const world = createRunWorld(content, run, base, [], difficulty);
      if (!['battle', 'challenge', 'boss'].includes(room.kind)) {
        playRoom(content, run, world, room, style, skill, rng);
        continue;
      }
      const max = world.players.p1.maxHealth;
      const lost = new Map<number, number>();
      const ticks = new Map<number, number>();
      let hp = world.players.p1.health;
      let lastWave = 1;
      const onTick = (w: WorldState) => {
        const wave = room.kind === 'boss' ? 1 : w.wave;
        lastWave = wave;
        const now = w.players.p1.health;
        if (now < hp) lost.set(wave, (lost.get(wave) ?? 0) + (hp - now));
        hp = now;
        ticks.set(wave, (ticks.get(wave) ?? 0) + 1);
      };
      const stats = playRoom(content, run, world, room, style, skill, rng, onTick);
      const waves = room.kind === 'boss' ? 1 : world.waveCount;
      for (let wv = 1; wv <= waves; wv++) {
        if (!ticks.has(wv)) continue;
        const c = cell(`${room.id}|${room.kind === 'boss' ? 'boss' : `${wv}/${waves}`}`);
        c.lost.push((lost.get(wv) ?? 0) / max);
        c.secs.push((ticks.get(wv) ?? 0) / 20);
      }
      if (stats.died) cell(`${room.id}|${room.kind === 'boss' ? 'boss' : `${lastWave}/${waves}`}`).deaths++;
    }
    if (run.status === 'cleared') won++;
  }
  return { cells, won };
}

const avg = (xs: number[]) => (xs.length ? xs.reduce((s, x) => s + x, 0) / xs.length : 0);
const p90 = (xs: number[]) => (xs.length ? [...xs].sort((x, y) => x - y)[Math.floor(xs.length * 0.9)] : 0);
const pc = (n: number) => `${Math.round(n * 100)}%`.padStart(5);

describe.skipIf(!enabled)('wave-3 check', () => {
  it('Health lost per wave, Yellow and Orange', () => {
    const content = testContent();
    for (const tier of [2, 3])
      for (const difficulty of ['guided', 'standard'] as Difficulty[])
        for (const [skill, style] of [['typical', 'smart'], ['novice', 'smart'], ['novice', 'kid']] as [string, Style][]) {
          const { cells, won } = measure(content, tier, difficulty, style, SKILLS[skill]);
          console.log(`\n=== tier ${tier}, ${difficulty}, ${skill} ${style}: floor cleared ${pc(won / RUNS)} ===`);
          console.log('room              wave   n  lost avg  lost p90  secs  deaths');
          const byWave = new Map<string, number[]>();
          for (const [k, c] of [...cells].sort()) {
            const [id, wave] = k.split('|');
            console.log(`${id.padEnd(18)}${wave.padEnd(6)}${String(c.lost.length).padStart(3)}   ${pc(avg(c.lost))}     ${pc(p90(c.lost))}  ${avg(c.secs).toFixed(1).padStart(5)}  ${String(c.deaths).padStart(4)}`);
            const w = wave === 'boss' ? 'boss' : `wave ${wave.split('/')[0]}`;
            byWave.set(w, [...(byWave.get(w) ?? []), ...c.lost]);
            byWave.set(`${w} deaths`, [...(byWave.get(`${w} deaths`) ?? []), c.deaths]);
          }
          console.log(
            'all rooms: ' +
              [...byWave]
                .filter(([k]) => !k.endsWith('deaths'))
                .sort()
                .map(([k, xs]) => `${k} ${pc(avg(xs)).trim()} (deaths ${(byWave.get(`${k} deaths`) ?? []).reduce((s, x) => s + x, 0)})`)
                .join(' | '),
          );
        }
  }, 1_200_000);
});
