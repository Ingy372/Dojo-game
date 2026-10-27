// Q-FAIR-EDGE: two Challenge fairness edges. (1) The on-screen check for a pattern attack counts a
// downed player, so with everyone down a pattern attack (or a 2nd hit) can't start off screen.
// (2) A flagged dash lane and a red circle never overlap whichever enemy steps first in a tick.
import { describe, expect, it } from 'vitest';
import {
  attackBox, createRng, createRunWorld, createWorld, currentAttack, currentRoom, distance, flaggedLaneOn, loadEnemy, loadRoom, simViewRect, startRun, stepWorld,
  type Difficulty, type EnemyAttackDef, type EnemyDef, type EnemyState, type Room, type WorldState,
} from '../src';
import bruteData from '../../../content/enemies/brute.json';
import rollingPinData from '../../../content/enemies/rolling-pin.json';
import { testContent } from './load-content';
import { holdSwing } from './hold-swing';
import { playRoom, SKILLS } from './balance/bot';

const DOUBLE = { name: 'double slam', strength: 1, startRange: 1.3, reach: 0.9, areaRadius: 0.95, telegraphTicks: 20, recoverTicks: 18, followUp: { strength: 0.6, gapTicks: 30 } };

describe('Q-FAIR-EDGE: a downed player still counts for "on screen"', () => {
  const wide = loadRoom({ id: 'wide', name: 'Wide', tiles: ['#' + '#'.repeat(28) + '#', '#' + '.'.repeat(28) + '#', '#' + '.'.repeat(12) + 'P' + '.'.repeat(15) + '#', '#' + '.'.repeat(28) + '#', '#' + '#'.repeat(28) + '#'], enemies: [{ enemy: 'dbl', column: 11, row: 2 }] });
  const dbl = loadEnemy({ ...bruteData, id: 'dbl', challenge: { fromBelt: 4, attacks: [DOUBLE], pattern: ['double slam'] } });

  const run = (knockDown: boolean) => {
    const w = createWorld(wide, ['p1'], { enemyTypes: { dbl }, difficulty: 'challenge', challengeAt: { belt: 4, room: 2 }, player: { maxHealth: 1e6, power: 1, guard: 0 } });
    let tells = 0;
    let moved = false;
    for (let t = 0; t < 400; t++) {
      holdSwing(w.players.p1);
      stepWorld(w, wide, { p1: { kind: 'none' } });
      for (const ev of w.events) if (ev.kind === 'telegraph') tells++;
      if (!moved && w.enemies[0].followUpStage !== undefined && w.enemies[0].mode !== 'windup') {
        moved = true;
        if (knockDown) { w.players.p1.downTicks = 300; w.players.p1.pos = { x: 27.5, y: 2.5 }; }
      }
      if (moved && knockDown) w.players.p1.downTicks = Math.max(w.players.p1.downTicks, 2);
    }
    return { tells, moved };
  };

  it('the 2nd hit is dropped when the only player is down and the hit is off their screen', () => {
    const r = run(true);
    expect(r.moved).toBe(true);
    expect(r.tells).toBe(1); // the 1st hit only; before the fix the 2nd hit started off screen
  });
  it('control: with the player up and close, the 2nd hit does start', () => {
    expect(run(false).tells).toBeGreaterThanOrEqual(2);
  });
});

describe('Q-FAIR-EDGE: no lane/red-circle overlap, either step order (Challenge only)', () => {
  const types = { brute: loadEnemy(bruteData), 'rolling-pin': loadEnemy(rollingPinData) };
  const build = (pinFirst: boolean) => {
    const pin = { enemy: 'rolling-pin', column: 6, row: 2 };
    const brute = { enemy: 'brute', column: 3, row: 2 };
    return loadRoom({ id: 'pin', name: 'Pin', tiles: ['##########', '#........#', '#...P....#', '#........#', '##########'], enemies: pinFirst ? [pin, brute] : [brute, pin] });
  };
  const overlaps = (room: Room, d: Difficulty) => {
    let n = 0;
    let starts = 0;
    const w = createWorld(room, ['p1'], { enemyTypes: types, difficulty: d, player: { maxHealth: 1e6, power: 1, guard: 0 } });
    for (let t = 0; t < 2400; t++) {
      holdSwing(w.players.p1);
      stepWorld(w, room, { p1: { kind: 'none' } });
      const b = w.enemies.find((e) => e.def.id === 'brute')!;
      for (const ev of w.events) {
        if (ev.kind !== 'telegraph' || ev.enemyId !== b.id) continue;
        starts++;
        if (flaggedLaneOn(w, b, w.players.p1.pos)) n++;
      }
    }
    return { n, starts };
  };
  it('the brute never starts its red circle under a winding-up Rolling Pin lane, pin stepping first', () => {
    const ch = overlaps(build(true), 'challenge');
    expect(ch.starts).toBeGreaterThan(3);
    expect(ch.n).toBe(0);
    expect(overlaps(build(true), 'standard').n).toBeGreaterThan(0); // the edge is real
  });
  it('and with the brute stepping first', () => {
    expect(overlaps(build(false), 'challenge').n).toBe(0);
  });
});

function patterned(): ReturnType<typeof testContent> {
  const content = testContent();
  return { ...content, enemies: Object.fromEntries(Object.entries(content.enemies).map(([id, def], k): [string, EnemyDef] => {
    const base = def.attacks[0];
    const extra: EnemyAttackDef = { ...base, name: 'qfe-extra', telegraphTicks: Math.max(base.telegraphTicks, 22), strength: Math.min(1, base.strength), reach: base.reach + (k % 3), challenge: true, ...(k % 2 === 0 ? { followUp: { strength: 0.6, gapTicks: Math.max(base.recoverTicks, 20) } } : {}) };
    return [id, { ...def, challenge: { fromBelt: 4, fromRoom: 1, attacks: [extra], pattern: [0, def.attacks.length, def.attacks.length], phases: null } }];
  })) };
}

const isLane = (e: EnemyState) => { const a = currentAttack(e); return !!a.noOverlapWithRedCircle && a.counterable === false; };
const isRed = (e: EnemyState) => currentAttack(e).counterable !== false;

describe('Q-FAIR-EDGE: 1,000-room sweep, belts 4-10', () => {
  it('0 off-screen pattern starts (downed counts), 0 lane/red overlaps including same-tick, both directions', { timeout: 600_000 }, () => {
    const c = patterned();
    const offScreen: string[] = [];
    const overlap: string[] = [];
    let rooms = 0;
    let checked = 0;
    let downedChecks = 0;
    let pairs = 0;
    for (let seed = 1; rooms < 1000; seed++) {
      const run = startRun(c, { seed, dryRuns: 0, tier: 4 + (seed % 7), difficulty: 'challenge' });
      const rng = createRng(seed * 31 + 5);
      while (run.status === 'playing' && rooms < 1000) {
        const room = currentRoom(c, run);
        const world = createRunWorld(c, run, { maxHealth: 400, power: 10, guard: 0 }, [], 'challenge');
        rooms++;
        playRoom(c, run, world, room, 'smart', SKILLS[Object.keys(SKILLS)[seed % Object.keys(SKILLS).length]], rng, (w: WorldState) => {
          const starters = w.events.filter((ev) => ev.kind === 'telegraph').map((ev) => w.enemies.find((e) => e.id === (ev as { enemyId: string }).enemyId)!);
          const p = w.players.p1;
          for (const e of starters) {
            const a = currentAttack(e);
            const tag = `seed ${seed} room ${room.id} tick ${w.tick} ${e.id} ${a.name}`;
            if (a.challenge || e.followUpStage === 2) {
              checked++;
              if (p.downTicks > 0) downedChecks++;
              const box = attackBox(e.pos, e.def.radius, e.facing, a);
              const v = simViewRect(room, p.pos);
              const slack = 0.5; // the player may be pushed apart from enemies after they decide
              if (box.x0 < v.x0 - slack || box.y0 < v.y0 - slack || box.x1 > v.x1 + slack || box.y1 > v.y1 + slack) offScreen.push(`${tag}: off screen`);
            }
            // Any winding-up pair (one started this tick, same-tick partner included) on the player.
            for (const o of w.enemies) {
              if (o === e || o.mode !== 'windup' || !o.attackCenter) continue;
              const [lane, red] = isLane(e) && isRed(o) ? [e, o] : isLane(o) && isRed(e) ? [o, e] : [null, null];
              if (!lane || !red || !red.attackCenter) continue;
              pairs++;
              const onRed = distance(p.pos, red.attackCenter) <= currentAttack(red).areaRadius;
              const onLane = flaggedLaneOn(w, red, p.pos);
              if (onRed && onLane) overlap.push(`${tag}: lane ${lane.id} and red ${red.id} both on the player`);
            }
          }
        });
      }
    }
    console.log(`Q-FAIR-EDGE sweep: rooms ${rooms}, pattern/2nd-hit starts ${checked} (${downedChecks} while down), off-screen ${offScreen.length}, lane+red pairs ${pairs}, overlaps ${overlap.length}`);
    expect(offScreen.slice(0, 10)).toEqual([]);
    expect(overlap.slice(0, 10)).toEqual([]);
    expect(rooms).toBe(1000);
    expect(checked).toBeGreaterThan(500);
  });
});
