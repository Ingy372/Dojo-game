import { describe, expect, it } from 'vitest';
import {
  COMBAT,
  DIFFICULTY,
  EnemyError,
  RoomError,
  comboBonus,
  createWorld,
  damage,
  loadEnemy,
  loadRoom,
  stepWorld,
  type CombatEvent,
  type Difficulty,
  type PlayerInput,
  type WorldState,
} from '../src';
import bruteData from '../../../content/enemies/brute.json';
import trainingRoom from '../../../content/rooms/training-room.json';

const brute = loadEnemy(bruteData);
const enemyTypes = { brute };

/** A small open room: player start on the left, a brute close by. */
function arena(enemies = [{ enemy: 'brute', column: 5, row: 4 }]) {
  return loadRoom({
    id: 'arena',
    name: 'Arena',
    tiles: ['############', '#..........#', '#..........#', '#..P.......#', '#..........#', '#..........#', '############'],
    enemies,
  });
}

function setup(difficulty: Difficulty = 'standard', enemies?: { enemy: string; column: number; row: number }[]) {
  const room = arena(enemies);
  const world = createWorld(room, ['p1'], { enemyTypes, difficulty });
  return { room, world, p: world.players.p1, e: world.enemies[0] };
}

const IDLE: PlayerInput = { kind: 'none' };

/** Steps until an event of this kind happens; returns the tick it happened on. */
function stepUntil(world: WorldState, room: ReturnType<typeof arena>, kind: CombatEvent['kind'], max = 400): number {
  for (let i = 0; i < max; i++) {
    const tick = world.tick;
    stepWorld(world, room, { p1: IDLE });
    if (world.events.some((ev) => ev.kind === kind)) return tick;
  }
  throw new Error(`no ${kind} event within ${max} ticks`);
}

/** Waits for a telegraph, presses Counter `early` ticks before impact, and returns the impact's events. */
function counterAt(world: WorldState, room: ReturnType<typeof arena>, early: number | null): CombatEvent[] {
  const start = stepUntil(world, room, 'telegraph');
  const ticks = world.enemies[0].windupTotal;
  const impact = start + ticks;
  const press = early === null ? -1 : impact - early;
  while (world.tick < impact) {
    stepWorld(world, room, { p1: world.tick === press ? { kind: 'none', action: 'counter' } : IDLE });
  }
  const p = world.players.p1;
  focusBeforeImpact = p.focus;
  comboBeforeImpact = p.combo;
  stepWorld(world, room, { p1: world.tick === press ? { kind: 'none', action: 'counter' } : IDLE });
  return world.events;
}
let focusBeforeImpact = 0;
let comboBeforeImpact = 0;
const basicHits = (events: CombatEvent[]) =>
  events.filter((ev) => ev.kind === 'playerAttack' && ev.move === 'basic').length;

describe('damage formula', () => {
  it('is Power x strength x 100 / (100 + Guard)', () => {
    expect(damage(10, 1, 0)).toBe(10);
    expect(damage(10, 1, 25)).toBe(8);
    expect(damage(10, 2.5, 25)).toBe(20);
    expect(damage(25, 1, 0)).toBe(25);
  });

  it('Guard always helps but never makes anyone invincible', () => {
    expect(damage(10, 1, 100)).toBeLessThan(damage(10, 1, 50));
    expect(damage(1, 1, 100000)).toBe(1);
  });

  it('adds the combo bonus at 10, 20 and 30 hits', () => {
    expect(comboBonus(9)).toBe(0);
    expect(comboBonus(10)).toBe(0.05);
    expect(comboBonus(20)).toBe(0.1);
    expect(comboBonus(30)).toBe(0.15);
    expect(comboBonus(99)).toBe(0.15);
    expect(damage(100, 1, 0, comboBonus(30))).toBe(115);
  });
});

describe('enemy and room data', () => {
  it('loads the brute', () => {
    expect(brute.id).toBe('brute');
    expect(brute.attack.telegraphTicks).toBeGreaterThanOrEqual(10);
  });

  it('refuses an attack without enough warning', () => {
    const bad = { ...bruteData, attack: { ...bruteData.attack, telegraphTicks: 3 } };
    expect(() => loadEnemy(bad)).toThrow(EnemyError);
    expect(() => loadEnemy({ ...bruteData, radius: 0.6 })).toThrow(/one-tile gaps/);
  });

  it('reads enemy start spots, and refuses one on a wall', () => {
    const room = loadRoom(trainingRoom);
    expect(room.enemySpawns).toEqual([{ enemy: 'brute', pos: { x: 11.5, y: 5.5 } }]);
    expect(() => arena([{ enemy: 'brute', column: 1, row: 1 }])).toThrow(RoomError);
  });

  it('complains if the room uses an enemy type that was not loaded', () => {
    expect(() => createWorld(arena([{ enemy: 'ghost', column: 6, row: 4 }]), ['p1'], { enemyTypes })).toThrow(/ghost/);
  });
});

describe('basic attacks', () => {
  it('hits the nearest enemy automatically, adding Focus and combo', () => {
    const { room, world, p, e } = setup();
    stepUntil(world, room, 'playerAttack');
    expect(e.health).toBe(brute.maxHealth - 8);
    expect(p.focus).toBe(COMBAT.focus.perHit);
    expect(p.combo).toBe(1);
  });

  it('attacks at a steady rhythm, not every tick', () => {
    const { room, world } = setup();
    const ticks: number[] = [];
    for (let i = 0; i < 60; i++) {
      stepWorld(world, room, { p1: IDLE });
      if (world.events.some((ev) => ev.kind === 'playerAttack' && ev.move === 'basic')) ticks.push(world.tick);
    }
    expect(ticks.length).toBeGreaterThan(2);
    for (let i = 1; i < ticks.length; i++) expect(ticks[i] - ticks[i - 1]).toBeGreaterThanOrEqual(COMBAT.basicAttack.cooldownTicks);
  });

  it('does nothing when no enemy is in reach', () => {
    const room = loadRoom(trainingRoom);
    const world = createWorld(room, ['p1'], { enemyTypes });
    stepWorld(world, room, { p1: IDLE });
    expect(world.events.filter((ev) => ev.kind === 'playerAttack')).toHaveLength(0);
  });
});

describe('enemy telegraphs', () => {
  it('every brute attack is telegraphed for its full wind-up before it lands', () => {
    const { room, world } = setup();
    let telegraphTick = -1;
    let swings = 0;
    for (let i = 0; i < 600; i++) {
      const tick = world.tick;
      stepWorld(world, room, { p1: IDLE });
      for (const ev of world.events) {
        if (ev.kind === 'telegraph') telegraphTick = tick;
        if (ev.kind === 'enemySwing') {
          expect(telegraphTick).toBeGreaterThanOrEqual(0);
          expect(tick - telegraphTick).toBe(brute.attack.telegraphTicks);
          telegraphTick = -1;
          swings++;
        }
      }
    }
    expect(swings).toBeGreaterThan(0);
  });

  it('telegraphs longer on Guided and shorter on Challenge', () => {
    for (const d of ['guided', 'standard', 'challenge'] as Difficulty[]) {
      const { room, world } = setup(d);
      stepUntil(world, room, 'telegraph');
      expect(world.enemies[0].windupTotal).toBe(Math.round(brute.attack.telegraphTicks * DIFFICULTY[d].telegraphScale));
    }
  });

  it('a player who steps out of the danger area takes no damage', () => {
    const { room, world, p } = setup();
    stepUntil(world, room, 'telegraph');
    for (let i = 0; i < brute.attack.telegraphTicks; i++) stepWorld(world, room, { p1: { kind: 'stick', x: -1, y: 0 } });
    expect(world.events.some((ev) => ev.kind === 'enemySwing')).toBe(true);
    expect(p.health).toBe(p.maxHealth);
  });
});

describe('the counter', () => {
  const window = DIFFICULTY.standard.counterWindowTicks;

  it(`gives a Perfect Counter when pressed 0 to ${window - 1} ticks before impact`, () => {
    for (let early = 0; early < window; early++) {
      const { room, world, p, e } = setup();
      const before = e.health;
      const events = counterAt(world, room, early);
      expect(events.some((ev) => ev.kind === 'perfectCounter')).toBe(true);
      expect(p.health).toBe(p.maxHealth);
      const basics = basicHits(events);
      expect(p.focus - focusBeforeImpact).toBe(COMBAT.focus.perPerfectCounter + COMBAT.focus.perHit * basics);
      expect(e.mode).toBe('stagger');
      expect(e.modeTicks).toBe(COMBAT.counter.perfectStaggerTicks);
      const counterHit = events.find((ev) => ev.kind === 'playerAttack' && ev.move === 'counter');
      expect(counterHit).toMatchObject({ damage: damage(COMBAT.player.power, 2, brute.guard) });
      expect(before).toBeGreaterThan(e.health);
    }
  });

  it('gives a Block (half damage, no stagger, combo kept) when pressed earlier', () => {
    for (let early = window; early < COMBAT.counter.guardTicks; early++) {
      const { room, world, p, e } = setup();
      const events = counterAt(world, room, early);
      expect(events.some((ev) => ev.kind === 'block')).toBe(true);
      expect(p.health).toBe(p.maxHealth - damage(brute.power, 0.5, 0));
      expect(e.mode).toBe('recover');
      expect(comboBeforeImpact).toBeGreaterThan(0);
      expect(p.combo).toBe(comboBeforeImpact + basicHits(events));
    }
  });

  it('gives a Hit (full damage, combo reset) with no counter or a counter far too early', () => {
    for (const early of [null, COMBAT.counter.guardTicks + 2]) {
      const { room, world, p } = setup();
      const events = counterAt(world, room, early);
      expect(events.some((ev) => ev.kind === 'hit')).toBe(true);
      expect(p.health).toBe(p.maxHealth - brute.power);
      expect(p.combo).toBe(0);
    }
  });

  it('uses the right window on each difficulty, plus the Rooted Form bonus', () => {
    for (const d of ['guided', 'standard', 'challenge'] as Difficulty[]) {
      const w = DIFFICULTY[d].counterWindowTicks;
      const inside = setup(d);
      expect(counterAt(inside.world, inside.room, w - 1).some((ev) => ev.kind === 'perfectCounter')).toBe(true);
      const outside = setup(d);
      expect(counterAt(outside.world, outside.room, w).some((ev) => ev.kind === 'perfectCounter')).toBe(false);
    }
    const rooted = setup();
    rooted.p.counterBonusTicks = COMBAT.rootedFormBonusTicks;
    expect(counterAt(rooted.world, rooted.room, window + 1).some((ev) => ev.kind === 'perfectCounter')).toBe(true);
  });

  it('cannot be spammed: a guard that counters nothing rests the button', () => {
    const room = loadRoom(trainingRoom);
    const world = createWorld(room, ['p1']);
    const presses: number[] = [];
    for (let i = 0; i < 60; i++) {
      stepWorld(world, room, { p1: { kind: 'none', action: 'counter' } });
      if (world.events.some((ev) => ev.kind === 'counterPressed')) presses.push(world.tick);
    }
    const gap = COMBAT.counter.guardTicks + COMBAT.counter.missLockoutTicks;
    for (let i = 1; i < presses.length; i++) expect(presses[i] - presses[i - 1]).toBeGreaterThanOrEqual(gap);
  });

  it('holds the player still while guarding', () => {
    const { room, world, p } = setup();
    const start = { ...p.pos };
    stepWorld(world, room, { p1: { kind: 'stick', x: 1, y: 0, action: 'counter' } });
    stepWorld(world, room, { p1: { kind: 'stick', x: 1, y: 0 } });
    expect(p.pos).toEqual(start);
  });
});

describe('Strike', () => {
  it('is refused without enough Focus', () => {
    const { room, world, p, e } = setup();
    stepWorld(world, room, { p1: { kind: 'none', action: 'strike' } });
    expect(world.events).toContainEqual({ kind: 'strikeRefused', playerId: 'p1', reason: 'focus' });
    expect(e.health).toBe(brute.maxHealth - 8); // only the basic attack landed
    expect(p.focus).toBe(5);
  });

  it('spends Focus for a heavy hit', () => {
    const { room, world, p, e } = setup();
    p.focus = 30;
    p.attackCooldown = 5; // no basic attack this tick
    stepWorld(world, room, { p1: { kind: 'none', action: 'strike' } });
    expect(e.health).toBe(brute.maxHealth - damage(COMBAT.player.power, COMBAT.strike.strength, brute.guard));
    expect(p.focus).toBe(COMBAT.focus.perHit);
  });

  it('is refused with no enemy in reach', () => {
    const room = loadRoom(trainingRoom);
    const world = createWorld(room, ['p1'], { enemyTypes });
    world.players.p1.focus = 50;
    stepWorld(world, room, { p1: { kind: 'none', action: 'strike' } });
    expect(world.events).toContainEqual({ kind: 'strikeRefused', playerId: 'p1', reason: 'noTarget' });
    expect(world.players.p1.focus).toBe(50);
  });

  it('keeps Focus within 0 to 100', () => {
    const { room, world, p } = setup();
    p.focus = 99;
    stepUntil(world, room, 'playerAttack');
    expect(p.focus).toBe(100);
  });
});

describe('defeat and coming back', () => {
  it('a defeated player returns to the room start with full health, and the room resets', () => {
    const { room, world, p, e } = setup();
    p.health = 1;
    p.focus = 60;
    stepUntil(world, room, 'playerDown');
    expect(p.downTicks).toBe(COMBAT.defeatTicks);
    const damaged = e.health;
    expect(damaged).toBeLessThan(brute.maxHealth);
    stepUntil(world, room, 'playerReturn', COMBAT.defeatTicks + 1);
    expect(p.pos).toEqual(room.playerStart);
    expect(p.health).toBe(p.maxHealth);
    expect(p.focus).toBe(0);
    expect(e.health).toBe(brute.maxHealth);
    expect(e.pos).toEqual(e.spawn);
  });

  it('a defeated enemy comes back after a short rest', () => {
    const { room, world, e } = setup();
    e.health = 1;
    stepUntil(world, room, 'playerAttack');
    expect(e.mode).toBe('defeated');
    stepUntil(world, room, 'enemySpawn', COMBAT.enemyRespawnTicks + 1);
    expect(e.health).toBe(brute.maxHealth);
  });
});

describe('fair and repeatable', () => {
  it('never lets more than two enemies attack at once', () => {
    const many = [2, 3, 5, 6].map((row) => ({ enemy: 'brute', column: 6, row }));
    const { room, world } = setup('standard', many);
    world.players.p1.health = 1e9;
    world.players.p1.maxHealth = 1e9;
    let most = 0;
    for (let i = 0; i < 600; i++) {
      stepWorld(world, room, { p1: IDLE });
      most = Math.max(most, world.enemies.filter((e) => e.mode === 'windup').length);
    }
    expect(most).toBe(COMBAT.maxAttackersAtOnce);
  });

  it('gives exactly the same fight for the same button presses', () => {
    const script = (i: number): PlayerInput =>
      i % 37 === 0 ? { kind: 'none', action: 'counter' } : i % 53 === 0 ? { kind: 'stick', x: 0.5, y: -1, action: 'strike' } : IDLE;
    const runOnce = () => {
      const { room, world } = setup();
      for (let i = 0; i < 800; i++) stepWorld(world, room, { p1: script(i) });
      return JSON.stringify(world);
    };
    expect(runOnce()).toBe(runOnce());
  });

  it('keeps the whole world saveable as plain data', () => {
    const { room, world } = setup();
    for (let i = 0; i < 100; i++) stepWorld(world, room, { p1: IDLE });
    expect(JSON.parse(JSON.stringify(world))).toEqual(world);
  });
});
