// L8-B2 (L8-SPEC sections 2 and 6): with a Lock group equipped, a Perfect Counter's stagger is also a hold. The hold
// lasts exactly as long as the stagger (20 ticks, 24 with Counter #6, never over 24), a held enemy can't use its
// shield, Guardians, bosses and elites are never held, and a throw wins when Throw can throw.
import { describe, expect, it } from 'vitest';
import {
  buildTraining,
  canHold,
  characterSetup,
  equippedSealEffects,
  createWorld,
  emptyLoadout,
  isHeld,
  loadEnemy,
  loadFeed,
  loadRoom,
  modsFrom,
  newProfile,
  stepWorld,
  trainingStats,
  TICKS_PER_SECOND,
  type CombatEvent,
  type EnemyState,
  type PlayerInput,
  type PlayerSetup,
  type WorldState,
} from '../src';
import bruteData from '../../../content/enemies/brute.json';
import shieldData from '../../../content/enemies/shield.json';
import green from '../../../fixtures/4-green-belt.json';
import { testContent } from './load-content';

const content = testContent();
const IDLE: PlayerInput = { kind: 'none' };
const arena = (enemy: string) =>
  loadRoom({
    id: 'arena',
    name: 'Arena',
    tiles: ['############', '#..........#', '#..........#', '#..P.......#', '#..........#', '#..........#', '############'],
    enemies: [{ enemy, column: 5, row: 4 }],
  });
const enemyTypes = { brute: loadEnemy(bruteData), shield: loadEnemy(shieldData) };

function setup(seals: string[], staggerTicks?: number): PlayerSetup {
  const feed = loadFeed(green);
  const t = buildTraining(feed, content.abilities, { ms: Date.parse(feed.asOf), weekday: 3 });
  const c = characterSetup({ ...newProfile(), senseiPick: false, loadout: { ...emptyLoadout(), seals } }, t, content.abilities);
  // Tool Belt (Nov 24): Seals no longer reach fights; this file tests the same mechanics as always-on mods (as Insights or gear give them).
  const mods = modsFrom([...c.effects, ...equippedSealEffects(t, content.abilities.families, seals)], TICKS_PER_SECOND);
  return { ...c, power: c.power - trainingStats(t).power, mods: staggerTicks === undefined ? mods : { ...mods, staggerTicks } };
}

function fight(enemy: string, player: PlayerSetup) {
  const room = arena(enemy);
  const w: WorldState = createWorld(room, ['p1'], { enemyTypes, difficulty: 'standard', player });
  const step = (input: PlayerInput = IDLE) => stepWorld(w, room, { p1: input });
  /** A Perfect Counter on the first swing; returns the impact tick's events. */
  const perfect = (): CombatEvent[] => {
    for (let i = 0; i < 400 && !w.events.some((ev) => ev.kind === 'telegraph'); i++) step();
    const impact = w.tick - 1 + w.enemies[0].windupTotal;
    while (w.tick <= impact) step(w.tick === impact - 1 ? { kind: 'none', action: 'counter' } : IDLE);
    return w.events;
  };
  return { w, step, perfect, e: w.enemies[0] };
}

/** Ticks the enemy stays held after the Perfect Counter, with the player out of reach. */
function holdTicks(player: PlayerSetup): number {
  const f = fight('brute', player);
  f.perfect();
  f.w.players.p1.pos = { x: 1.5, y: 1.5 };
  let n = 0;
  while (isHeld(f.e) && n < 100) {
    n++;
    f.step();
  }
  return n;
}

describe('L8-B2 the Lock hold', () => {
  it('a Perfect Counter with Arm Bar (#17) holds the brute and says so; without Lock it only staggers', () => {
    const f = fight('brute', setup(['lock-arm']));
    const events = f.perfect();
    expect(events).toContainEqual({ kind: 'held', playerId: 'p1', enemyId: f.e.id });
    expect(f.e.mode).toBe('stagger');
    expect(isHeld(f.e)).toBe(true);
    const plain = fight('brute', setup([]));
    expect(plain.perfect().some((ev) => ev.kind === 'held')).toBe(false);
    expect(isHeld(plain.e)).toBe(false);
  });

  it('the hold lasts exactly as long as the stagger: 20 ticks, 24 with Counter #6, never over 24', () => {
    expect(holdTicks(setup(['lock-arm'], 0))).toBe(20);
    expect(holdTicks(setup(['lock-arm'], 4))).toBe(24);
    expect(holdTicks(setup(['lock-arm'], 40))).toBe(24);
  });

  it('a held enemy cannot use its shield: basic hits land and the shield does not grow back', () => {
    const f = fight('shield', setup(['lock-arm']));
    f.perfect();
    expect(isHeld(f.e)).toBe(true);
    f.e.shieldUp = true; // even a shield that is up does not stop a hit while held
    f.e.shieldRegrow = 1;
    const h0 = f.e.health;
    for (let i = 0; i < 15 && isHeld(f.e); i++) {
      f.w.players.p1.pos = { x: f.e.pos.x - (f.e.def.radius + 0.35), y: f.e.pos.y };
      f.step();
      expect(f.w.events.some((ev) => ev.kind === 'shieldBlock')).toBe(false);
    }
    expect(f.e.health).toBeLessThan(h0);
    const g = fight('shield', setup(['lock-arm']));
    g.perfect();
    g.e.shieldRegrow = 1;
    g.w.players.p1.pos = { x: 1.5, y: 1.5 };
    while (isHeld(g.e)) {
      g.step();
      if (isHeld(g.e)) expect(g.e.shieldUp).toBe(false);
    }
    g.step();
    expect(g.e.shieldUp).toBe(true);
  });

  it('Guardians, bosses and elites are never held', () => {
    const base = { def: { ...enemyTypes.brute, boss: false }, elite: null } as unknown as EnemyState;
    expect(canHold(base)).toBe(true);
    expect(canHold({ ...base, def: { ...base.def, boss: true } } as EnemyState)).toBe(false);
    expect(canHold({ ...base, elite: 'guarding' } as unknown as EnemyState)).toBe(false);
    for (const d of Object.values(content.enemies)) if (d.boss) expect(canHold({ def: d, elite: null } as EnemyState), d.id).toBe(false);
  });

  it('a throw wins: with Throw and Lock both equipped, a throwable brute is thrown, not held', () => {
    const f = fight('brute', setup(['throw', 'lock-arm']));
    const events = f.perfect();
    expect(events.some((ev) => ev.kind === 'thrown')).toBe(true);
    expect(events.some((ev) => ev.kind === 'held')).toBe(false);
    expect(f.e.mode).toBe('thrown');
    expect(isHeld(f.e)).toBe(false);
  });
});
