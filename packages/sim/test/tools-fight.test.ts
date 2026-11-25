// Tool Belt stage 1, Task 4: tools fire in a fight from what the player does, then wait their cooldown.
import { describe, expect, it } from 'vitest';
import { MOVEMENT, createWorld, loadEnemy, loadRoom, modsFrom, stepWorld, toolSetups, type CombatEvent, type Effect, type PlayerInput, type ToolSetup, type ToolTrigger, type WorldState } from '../src';
import bruteData from '../../../content/enemies/brute.json';
import dummyData from '../../../content/enemies/practice-dummy.json';
import toolData from '../../../content/abilities/tools.json';
import { loadTools } from '../src';

const brute = loadEnemy(bruteData);
const dummy = loadEnemy(dummyData);
const R = MOVEMENT.playerRadius;
const IDLE: PlayerInput = { kind: 'none' };

const room = loadRoom({
  id: 'arena',
  name: 'Arena',
  tiles: ['##############', '#............#', '#............#', '#..P.........#', '#............#', '#............#', '##############'],
  enemies: [{ enemy: 'brute', column: 5, row: 3 }],
});

function tool(technique: number, trigger: ToolTrigger, cooldownTicks: number, effects: Effect[]): ToolSetup {
  return { technique, trigger, cooldownTicks, mods: modsFrom(effects, 20) };
}

function bruteWorld(tools?: ToolSetup[]): WorldState {
  const world = createWorld(room, ['p1'], { enemyTypes: { brute }, player: { maxHealth: 100, power: 10, guard: 0, ...(tools ? { tools } : {}) } });
  world.enemies[0].health = 5000;
  return world;
}

/** Waits for the brute's wind-up and presses Counter 2 ticks before impact. Returns every event from the press to impact. */
function greatCounter(world: WorldState): CombatEvent[] {
  for (let i = 0; i < 600 && world.enemies[0].mode !== 'windup'; i++) stepWorld(world, room, { p1: IDLE });
  const e = world.enemies[0];
  const impact = world.tick + e.modeTicks;
  const out: CombatEvent[] = [];
  while (world.tick <= impact) {
    stepWorld(world, room, { p1: world.tick === impact - 2 ? { kind: 'none', action: 'counter' } : IDLE });
    out.push(...world.events);
  }
  return out;
}

const fired = (events: CombatEvent[]) => events.filter((ev) => ev.kind === 'toolFired').map((ev) => (ev as { technique: number }).technique);
const counterHits = (events: CombatEvent[]) => events.filter((ev) => ev.kind === 'playerAttack' && ev.move === 'counter').length;

/** Dummies (never move, never attack) at these gaps from the player, side by side. */
function dummyWorld(gaps: number[], tools: ToolSetup[]): WorldState {
  const world = createWorld(room, ['p1'], { enemyTypes: { brute: dummy }, player: { maxHealth: 100, power: 10, guard: 0, tools } });
  const p = world.players.p1;
  const base = world.enemies[0];
  world.enemies = gaps.map((gap, i) => {
    const angle = (i * 2 * Math.PI) / gaps.length;
    const d = gap + R + dummy.radius;
    return { ...base, id: `d${i + 1}`, health: 1000, pos: { x: p.pos.x + Math.cos(angle) * d, y: p.pos.y + Math.sin(angle) * d } };
  });
  return world;
}

describe('tools in a fight', () => {
  it('toolSetups keeps the equipped order and skips unknown techniques', () => {
    const defs = loadTools(toolData);
    expect(toolSetups(defs, [7, 99, 3]).map((t) => t.technique)).toEqual([7, 3]);
  });

  it('a greatCounter tool fires once, then waits its cooldown', () => {
    const world = bruteWorld([tool(1, 'greatCounter', 2000, [{ type: 'counterHits', amount: 0.3, hits: 2 }])]);
    const first = greatCounter(world);
    expect(first.some((ev) => ev.kind === 'perfectCounter')).toBe(true);
    expect(fired(first)).toEqual([1]);
    expect(counterHits(first)).toBe(3);
    const second = greatCounter(world);
    expect(second.some((ev) => ev.kind === 'perfectCounter')).toBe(true);
    expect(fired(second)).toEqual([]);
    expect(counterHits(second)).toBe(1);
  });

  it('two tools on the same trigger both fire, in technique order', () => {
    const world = bruteWorld([tool(7, 'greatCounter', 200, [{ type: 'counterStrength', amount: 1.5 }]), tool(3, 'greatCounter', 200, [{ type: 'counterHits', amount: 0.3, hits: 1 }])]);
    const events = greatCounter(world);
    expect(fired(events)).toEqual([3, 7]);
    expect(counterHits(events)).toBe(2);
  });

  it('a tool does not fire while the player stands still', () => {
    const all: ToolTrigger[] = ['greatCounter', 'block', 'strike', 'dash', 'crowded', 'hit'];
    const world = dummyWorld([0.2], all.map((t, i) => tool(i + 1, t, 20, [{ type: 'areaHit', amount: 1, radius: 2 }])));
    const events: CombatEvent[] = [];
    for (let i = 0; i < 600; i++) {
      stepWorld(world, room, { p1: IDLE });
      events.push(...world.events);
    }
    expect(fired(events)).toEqual([]);
  });

  it('crowded fires only while fighting', () => {
    const world = dummyWorld([1.0, 1.0, 1.0], [tool(5, 'crowded', 200, [{ type: 'areaHit', amount: 1, radius: 1.4 }])]);
    const events: CombatEvent[] = [];
    for (let i = 0; i < 100; i++) {
      stepWorld(world, room, { p1: IDLE });
      events.push(...world.events);
    }
    expect(fired(events)).toEqual([]);
    // One dummy steps into reach: the auto attack lands, so the player is fighting.
    const p = world.players.p1;
    const e = world.enemies[0];
    const dir = { x: (e.pos.x - p.pos.x) / Math.hypot(e.pos.x - p.pos.x, e.pos.y - p.pos.y), y: (e.pos.y - p.pos.y) / Math.hypot(e.pos.x - p.pos.x, e.pos.y - p.pos.y) };
    e.pos = { x: p.pos.x + dir.x * (R + dummy.radius + 0.2), y: p.pos.y + dir.y * (R + dummy.radius + 0.2) };
    for (let i = 0; i < 40; i++) {
      stepWorld(world, room, { p1: IDLE });
      events.push(...world.events);
    }
    expect(fired(events)).toEqual([5]);
  });

  it('an areaHit tool hits every enemy in its radius and none outside', () => {
    const world = dummyWorld([1.0, 1.0, 2.5], [tool(14, 'dash', 200, [{ type: 'areaHit', amount: 1.2, radius: 1.2 }])]);
    stepWorld(world, room, { p1: { kind: 'none', action: 'dash' } });
    const hits = world.events.filter((ev) => ev.kind === 'playerAttack' && ev.move === 'ripple').map((ev) => (ev as unknown as { enemyId: string }).enemyId);
    expect(fired(world.events)).toEqual([14]);
    expect(hits.sort()).toEqual(['d1', 'd2']);
  });

  it('no tools changes nothing', () => {
    const run = (tools?: ToolSetup[]) => {
      const world = bruteWorld(tools);
      const log: CombatEvent[] = [];
      for (let i = 0; i < 400; i++) {
        stepWorld(world, room, { p1: i % 37 === 0 ? { kind: 'none', action: 'counter' } : IDLE });
        log.push(...world.events);
      }
      return JSON.stringify(log);
    };
    expect(run([])).toBe(run(undefined));
  });
});
