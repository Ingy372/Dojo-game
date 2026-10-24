import { describe, expect, it } from 'vitest';
import {
  COMBAT,
  activeDoorSlots,
  chooseInsight,
  createRunWorld,
  createWorld,
  currentRoom,
  loadEnemy,
  loadRoom,
  startRun,
  stepWorld,
  updateRun,
  type CombatEvent,
  type PlayerInput,
  type RunState,
  type TwistDef,
  type WorldState,
} from '../src';
import bruteData from '../../../content/enemies/brute.json';
import { testContent } from './load-content';

const content = testContent();
const BASE = { maxHealth: 100, power: 10, guard: 0 };
const IDLE: PlayerInput = { kind: 'none' };
const twist = (id: string): TwistDef => content.twists.twists.find((t) => t.id === id)!;

/** Plays a whole run by skipping the fights; returns the twist of every room entered (null = none). */
function roomsOfRun(seed: number): { kind: string; depth: number; twist: string | null }[] {
  const run: RunState = startRun(content, { seed, dryRuns: 0 });
  const rooms: { kind: string; depth: number; twist: string | null }[] = [];
  for (let guard = 0; guard < 50 && run.status === 'playing'; guard++) {
    const room = currentRoom(content, run);
    rooms.push({ kind: room.kind, depth: run.depth, twist: run.twist });
    const world = createRunWorld(content, run, BASE);
    expect(world.twist?.id ?? null).toBe(run.twist);
    const p = world.players.p1;
    for (let t = 0; t < 400 && run.status === 'playing'; t++) {
      for (const e of world.enemies) if (e.mode !== 'defeated') (e.health = 0), (e.mode = 'defeated');
      if (run.insightChoices) chooseInsight(run, run.insightChoices[0]);
      if (room.chest && !world.progress.chestOpened && world.progress.cleared) p.pos = { x: room.chest.x, y: room.chest.y + 1 };
      else if (world.progress.doorsOpen) {
        const d = room.doors[activeDoorSlots(room, run.doors.length)[0]];
        p.pos = { x: d.x, y: d.y + 1 };
      }
      stepWorld(world, room, { p1: IDLE });
      if (updateRun(content, run, world).some((e) => e.kind === 'nextRoom')) break;
    }
  }
  return rooms;
}

describe('room twists', () => {
  it('come in about 1 room in 4, at most one per room, never in the first room or the boss room', () => {
    const rooms = Array.from({ length: 200 }, (_, i) => roomsOfRun(1000 + i)).flat();
    const twisted = rooms.filter((r) => r.twist);
    const share = twisted.length / rooms.length;
    expect(share).toBeGreaterThan(0.18);
    expect(share).toBeLessThan(0.32);
    for (const r of twisted) {
      expect(r.depth).toBeGreaterThan(0);
      expect(['battle', 'challenge']).toContain(r.kind);
    }
    for (const t of content.twists.twists) expect(twisted.some((r) => r.twist === t.id)).toBe(true);
  });

  it('Slippery Floor stays out of the first 3 rooms of a floor', () => {
    expect(twist('slippery-floor').earliestRoom).toBe(4);
    const rooms = Array.from({ length: 200 }, (_, i) => roomsOfRun(3000 + i)).flat();
    const slippery = rooms.filter((r) => r.twist === 'slippery-floor');
    expect(slippery.length).toBeGreaterThan(0);
    for (const r of slippery) expect(r.depth + 1).toBeGreaterThanOrEqual(4);
    // The other twists can still come in rooms 2 and 3.
    expect(rooms.some((r) => r.twist && r.depth + 1 <= 3)).toBe(true);
  });

  it('never hide a warning: every twist room still shows each attack warning at the same time', () => {
    const run = startRun(content, { seed: 7, dryRuns: 0 });
    const firstWarning = (id: string | null) => {
      run.twist = id;
      const room = currentRoom(content, run);
      const world = createRunWorld(content, run, BASE);
      const warnings: CombatEvent[] = [];
      const swings: CombatEvent[] = [];
      for (let t = 0; t < 900; t++) {
        stepWorld(world, room, { p1: IDLE });
        warnings.push(...world.events.filter((e) => e.kind === 'telegraph'));
        swings.push(...world.events.filter((e) => e.kind === 'enemySwing'));
        if (world.players.p1.health <= 0) break;
      }
      expect(swings.length).toBeGreaterThan(0);
      // Every swing had a warning first.
      expect(warnings.length).toBeGreaterThanOrEqual(swings.length);
      return warnings;
    };
    const plain = firstWarning(null);
    for (const t of content.twists.twists) expect(firstWarning(t.id)).toEqual(plain);
  });

  it('Slippery Floor: Dash slides farther', () => {
    const room = loadRoom({ id: 'open', name: 'Open', tiles: ['##############', '#............#', '#..P.........#', '#............#', '##############'] });
    const dashOn = (t: TwistDef | null) => {
      const world = createWorld(room, ['p1'], { twist: t });
      const p = world.players.p1;
      const startX = p.pos.x;
      stepWorld(world, room, { p1: { kind: 'stick', x: 1, y: 0, action: 'dash' } });
      for (let i = 1; i < COMBAT.dash.ticks; i++) stepWorld(world, room, { p1: IDLE });
      return p.pos.x - startX;
    };
    const slippery = twist('slippery-floor');
    expect(slippery.dashScale).toBeGreaterThan(1);
    expect(dashOn(null)).toBeCloseTo(COMBAT.dash.distanceTiles, 5);
    expect(dashOn(slippery)).toBeCloseTo(COMBAT.dash.distanceTiles * slippery.dashScale, 5);
  });

  it('Bell Room: each Perfect Counter rings a bell, and the third gives a bonus prize', () => {
    const brute = loadEnemy(bruteData);
    const room = loadRoom({
      id: 'arena',
      name: 'Arena',
      tiles: ['############', '#..........#', '#..........#', '#..P.......#', '#..........#', '#..........#', '############'],
      enemies: [{ enemy: 'brute', column: 5, row: 4 }],
    });
    const perfects = (t: TwistDef | null) => {
      const world: WorldState = createWorld(room, ['p1'], { enemyTypes: { brute }, twist: t });
      const bells: CombatEvent[] = [];
      for (let n = 0; n < 4; n++) {
        world.enemies[0].health = 9999;
        let impact = -1;
        for (let i = 0; i < 400; i++) {
          stepWorld(world, room, { p1: world.tick === impact - 1 ? { kind: 'none', action: 'counter' } : IDLE });
          if (world.events.some((e) => e.kind === 'telegraph')) impact = world.tick + world.enemies[0].windupTotal - 1;
          bells.push(...world.events.filter((e) => e.kind === 'bell'));
          if (world.events.some((e) => e.kind === 'perfectCounter')) break;
        }
      }
      return bells;
    };
    expect(perfects(null)).toEqual([]);
    expect(perfects(twist('bell-room'))).toEqual([
      { kind: 'bell', count: 1, of: 3 },
      { kind: 'bell', count: 2, of: 3 },
      { kind: 'bell', count: 3, of: 3 },
    ]);

    // The third bell drops a bonus prize; the first two don't.
    const run = startRun(content, { seed: 3, dryRuns: 0 });
    run.twist = 'bell-room';
    const world = createRunWorld(content, run, BASE);
    world.events = [{ kind: 'bell', count: 2, of: 3 }];
    expect(updateRun(content, run, world).filter((e) => e.kind === 'loot')).toEqual([]);
    world.events = [{ kind: 'bell', count: 3, of: 3 }];
    expect(updateRun(content, run, world).filter((e) => e.kind === 'loot' && e.source === 'bell')).toHaveLength(1);
  });
});
