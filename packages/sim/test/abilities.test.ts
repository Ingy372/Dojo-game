import { describe, expect, it } from 'vitest';
import {
  COMBAT,
  DIFFICULTY,
  buildTraining,
  characterSetup,
  createWorld,
  loadEnemy,
  loadFeed,
  loadRoom,
  modsFrom,
  newProfile,
  stepWorld,
  strikeCost,
  TICKS_PER_SECOND,
  type CombatEvent,
  type PlayerInput,
  type PlayerSetup,
  type Room,
  type WorldState,
} from '../src';
import bruteData from '../../../content/enemies/brute.json';
import white3 from '../../../fixtures/2-white-belt-3-signoffs.json';
import yellow from '../../../fixtures/3-yellow-belt.json';
import { testContent } from './load-content';

const content = testContent();
const brute = loadEnemy(bruteData);
const IDLE: PlayerInput = { kind: 'none' };
const room = loadRoom({
  id: 'arena',
  name: 'Arena',
  tiles: ['############', '#..........#', '#..........#', '#..P.......#', '#..........#', '#..........#', '############'],
  enemies: [{ enemy: 'brute', column: 5, row: 4 }],
});

function character(data: unknown) {
  const feed = loadFeed(data);
  const t = buildTraining(feed, content.abilities, { ms: Date.parse(feed.asOf), weekday: 3 });
  const c = characterSetup(newProfile(), t, content.abilities);
  return { ...c, mods: modsFrom(c.effects, TICKS_PER_SECOND) };
}

function world(player?: PlayerSetup): WorldState {
  return createWorld(room, ['p1'], { enemyTypes: { brute }, difficulty: 'standard', player });
}

function stepUntil(w: WorldState, r: Room, kind: CombatEvent['kind'], max = 400): number {
  for (let i = 0; i < max; i++) {
    const tick = w.tick;
    stepWorld(w, r, { p1: IDLE });
    if (w.events.some((ev) => ev.kind === kind)) return tick;
  }
  throw new Error(`no ${kind} within ${max} ticks`);
}

/** Presses Counter `early` ticks before the brute's hit lands; returns that tick's events. */
function counterAt(w: WorldState, early: number): CombatEvent[] {
  const start = stepUntil(w, room, 'telegraph');
  const impact = start + w.enemies[0].windupTotal;
  const press = impact - early;
  while (w.tick <= impact) stepWorld(w, room, { p1: w.tick === press ? { kind: 'none', action: 'counter' } : IDLE });
  return w.events;
}

const standard = DIFFICULTY.standard.counterWindowTicks;

describe('Forms', () => {
  it('starts in the Beginner\'s Stance and switches to Rooted Form with the Form button', () => {
    const w = world(character(white3));
    const p = w.players.p1;
    expect(p.forms.map((f) => f.name)).toEqual(["Beginner's Stance", 'Rooted Form']);
    expect(p.form).toBe(0);
    stepWorld(w, room, { p1: { kind: 'none', action: 'form' } });
    expect(p.form).toBe(1);
    expect(w.events).toContainEqual({ kind: 'formChange', playerId: 'p1', form: 1 });
    // Can't switch again straight away.
    stepWorld(w, room, { p1: { kind: 'none', action: 'form' } });
    expect(p.form).toBe(1);
  });

  it('Rooted Form widens the Perfect Counter window by 2 ticks', () => {
    const plain = world();
    expect(counterAt(plain, standard + 1).some((e) => e.kind === 'perfectCounter')).toBe(false);
    const rooted = world({ ...character(white3), mods: undefined });
    rooted.players.p1.form = 1;
    expect(counterAt(rooted, standard + 1).some((e) => e.kind === 'perfectCounter')).toBe(true);
  });

  it('Rooted Form is slower on its feet, Flowing Form faster', () => {
    const y = character(yellow);
    const speeds = [0, 1, 2].map((form) => {
      const w = world({ ...y, mods: undefined });
      w.players.p1.form = form;
      w.enemies.length = 0;
      const x0 = w.players.p1.pos.x;
      stepWorld(w, room, { p1: { kind: 'stick', x: 1, y: 0 } });
      return w.players.p1.pos.x - x0;
    });
    expect(speeds[1]).toBeLessThan(speeds[0]);
    expect(speeds[2]).toBeGreaterThan(speeds[0]);
  });
});

describe('Technique Seals and Strike upgrades', () => {
  it('Firm Grip makes Perfect Counters stagger longer', () => {
    const w = world(character(white3));
    const events = counterAt(w, 1);
    expect(events.some((e) => e.kind === 'perfectCounter')).toBe(true);
    expect(w.enemies[0].modeTicks).toBe(COMBAT.counter.perfectStaggerTicks + 10);
  });

  it('Quick Combo makes Strikes cheaper', () => {
    const w = world(character(yellow));
    expect(strikeCost(w.players.p1)).toBe(COMBAT.strike.focusCost - 8);
  });

  it('Escape Step recharges Dash on a Block', () => {
    const w = world(character(yellow));
    const p = w.players.p1;
    p.dashCooldown = 25;
    // Press a little too early: a Block, not a Perfect Counter.
    const events = counterAt(w, standard + 2);
    expect(events.some((e) => e.kind === 'block')).toBe(true);
    expect(p.dashCooldown).toBe(0);
  });
});

describe('Virtues', () => {
  it('need a full Focus meter', () => {
    const w = world(character(white3));
    stepWorld(w, room, { p1: { kind: 'none', action: 'virtue' } });
    expect(w.events).toContainEqual({ kind: 'virtueRefused', playerId: 'p1' });
  });

  it('Shield of Respect soaks up a hit, and gets stronger at rank II', () => {
    const w1 = world(character(white3));
    const w2 = world(character(yellow));
    expect(w1.players.p1.virtue?.amount).toBe(40);
    expect(w2.players.p1.virtue?.amount).toBe(50);
    expect(w2.players.p1.virtue?.name).toBe('Shield of Respect II');
    const p = w1.players.p1;
    p.focus = COMBAT.focus.max;
    stepWorld(w1, room, { p1: { kind: 'none', action: 'virtue' } });
    // All Focus is spent (an automatic hit on the same tick may add a little back).
    expect(p.focus).toBeLessThanOrEqual(COMBAT.focus.perHit);
    expect(p.virtueShield).toBe(40);
    const before = p.health;
    stepUntil(w1, room, 'shieldSoak');
    expect(p.health).toBe(before);
    expect(p.virtueShield).toBeLessThan(40);
  });

  it('Second Wind restores Health and gives back half the Focus', () => {
    const w = world({ maxHealth: 100, power: 10, guard: 0, virtue: { id: 'second-wind', name: 'Second Wind', kind: 'heal', rank: 1, amount: 0.3, ticks: 0 } });
    w.enemies.length = 0;
    const p = w.players.p1;
    p.health = 40;
    p.focus = COMBAT.focus.max;
    stepWorld(w, room, { p1: { kind: 'none', action: 'virtue' } });
    expect(p.health).toBe(70);
    expect(p.focus).toBe(50);
  });

  it('Perfect Discipline makes every Counter perfect while it lasts', () => {
    const w = world({ maxHealth: 100, power: 10, guard: 0, virtue: { id: 'pd', name: 'Perfect Discipline', kind: 'discipline', rank: 1, amount: 0, ticks: 200 } });
    const p = w.players.p1;
    p.focus = COMBAT.focus.max;
    stepWorld(w, room, { p1: { kind: 'none', action: 'virtue' } });
    // Far too early for a normal Perfect Counter (it would be a Block).
    expect(counterAt(w, standard + 3).some((e) => e.kind === 'perfectCounter')).toBe(true);
  });
});

describe('character from training and play', () => {
  it('gets stronger with level', () => {
    const feed = loadFeed(yellow);
    const t = buildTraining(feed, content.abilities, { ms: Date.parse(feed.asOf), weekday: 3 });
    const p = newProfile();
    const low = characterSetup(p, t, content.abilities);
    p.level = 15;
    const high = characterSetup(p, t, content.abilities);
    expect(high.maxHealth).toBeGreaterThan(low.maxHealth);
    expect(high.power).toBeGreaterThan(low.power);
    // Never above the rank's cap.
    p.level = 50;
    expect(characterSetup(p, t, content.abilities).level).toBe(20);
  });
});
