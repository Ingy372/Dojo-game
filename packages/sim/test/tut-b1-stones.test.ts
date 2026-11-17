import { describe, expect, it } from 'vitest';
import { STONES, TICKS_PER_SECOND, createWorld, loadRoom, secondsToTicks, stepWorld, RoomError, type CombatEvent, type PlayerInput, type Room, type WorldState } from '../src';

// A tutorial room: stones fall at (4,3), then (2,3)+(6,3), then three spots.
const tiles = ['#DDD#####', '#.......#', '#...P...#', '#.......#', '#..S....#', '#.......#', '#########'];
const hazards = {
  stones: [
    { fillSeconds: 1.5, spots: [{ column: 5, row: 3 }] },
    { fillSeconds: 1.2, spots: [{ column: 3, row: 3 }, { column: 7, row: 3 }] },
    { fillSeconds: 1.2, spots: [{ column: 3, row: 2 }, { column: 5, row: 2 }, { column: 7, row: 2 }] },
  ],
};
const room: Room = loadRoom({ id: 'stone-path', name: 'Tower Path', kind: 'rest', tutorial: true, tiles, hazards });
const IDLE: PlayerInput = { kind: 'none' };
const SAFE = { x: 4.5, y: 5.5 }; // far from every spot

function run(world: WorldState, ticks: number, input: (w: WorldState) => PlayerInput = () => IDLE): CombatEvent[] {
  const out: CombatEvent[] = [];
  for (let i = 0; i < ticks; i++) {
    stepWorld(world, room, { p1: input(world) });
    out.push(...world.events);
  }
  return out;
}
const kinds = (evs: CombatEvent[]) => evs.map((e) => e.kind).filter((k) => k.startsWith('stone') || k === 'stumble' || k === 'roomCleared');

describe('TUT-B1 falling stones', () => {
  it('a stone lands only after its circle has filled for the wave fill time', () => {
    const w = createWorld(room, ['p1']);
    const evs: Array<{ tick: number; ev: CombatEvent }> = [];
    for (let i = 0; i < 5 * TICKS_PER_SECOND; i++) {
      stepWorld(w, room, { p1: IDLE });
      for (const ev of w.events) evs.push({ tick: w.tick, ev });
    }
    const warn = evs.find((e) => e.ev.kind === 'stoneWarn')!;
    const land = evs.find((e) => e.ev.kind === 'stoneLand')!;
    expect(warn.ev).toMatchObject({ wave: 1, ticks: secondsToTicks(1.5), safeSpot: null });
    expect(land.tick - warn.tick).toBe(secondsToTicks(1.5));
  });

  it('the hero inside stumbles with no health change, and the same wave drops again', () => {
    const w = createWorld(room, ['p1']);
    const health = w.players.p1.health;
    const evs = run(w, 3 * TICKS_PER_SECOND); // standing on the first spot
    expect(kinds(evs)).toEqual(['stoneWarn', 'stoneLand', 'stumble']);
    expect(w.players.p1.health).toBe(health);
    // During the stumble the hero can't walk.
    const w2 = createWorld(room, ['p1']);
    run(w2, secondsToTicks(STONES.gapSeconds) + secondsToTicks(1.5));
    const at = { ...w2.players.p1.pos };
    run(w2, secondsToTicks(STONES.stumbleSeconds) - 1, () => ({ kind: 'stick', x: 1, y: 0 }));
    expect(w2.players.p1.pos).toEqual(at);
    const again = run(w, 3 * TICKS_PER_SECOND);
    expect(again.find((e) => e.kind === 'stoneWarn')).toMatchObject({ wave: 1 });
  });

  it('after 2 misses the circle fills slower and shows a safe spot; the 3rd miss passes the wave', () => {
    const w = createWorld(room, ['p1']);
    const evs = run(w, 15 * TICKS_PER_SECOND, (x) => (x.stones!.wave === 0 ? IDLE : { kind: 'moveTo', ...SAFE }));
    const warns = evs.filter((e): e is Extract<CombatEvent, { kind: 'stoneWarn' }> => e.kind === 'stoneWarn' && e.wave === 1);
    expect(warns.map((e) => e.ticks)).toEqual([30, 30, Math.round(30 * STONES.helpFillScale)]);
    const spot = warns[2].safeSpot!;
    expect(room.walls[Math.floor(spot.y)][Math.floor(spot.x)]).toBe(false);
    expect(Math.hypot(spot.x - 4.5, spot.y - 2.5)).toBeGreaterThan(STONES.radius);
    expect(evs.find((e) => e.kind === 'stoneWaveDone')).toEqual({ kind: 'stoneWaveDone', wave: 1, dodged: false });
    expect(w.stones!.wave).toBeGreaterThan(0);
  });

  it('the step completes after 3 dodged waves, and only then is the room done', () => {
    const w = createWorld(room, ['p1'], { respawnEnemies: false });
    const evs = run(w, 12 * TICKS_PER_SECOND, () => ({ kind: 'moveTo', ...SAFE }));
    expect(kinds(evs)).toEqual([
      'stoneWarn', 'stoneLand', 'stoneWaveDone',
      'stoneWarn', 'stoneLand', 'stoneWaveDone',
      'stoneWarn', 'stoneLand', 'stoneWaveDone', 'stonesDone', 'roomCleared',
    ]);
    expect(evs.filter((e) => e.kind === 'stoneLand').map((e) => (e as { spots: unknown[] }).spots.length)).toEqual([1, 2, 3]);
    expect(evs.some((e) => e.kind === 'stumble')).toBe(false);
    expect(w.stones!.done).toBe(true);
    const early = createWorld(room, ['p1'], { respawnEnemies: false });
    run(early, 3 * TICKS_PER_SECOND, () => ({ kind: 'moveTo', ...SAFE }));
    expect(early.progress.cleared).toBe(false);
  });

  it('a room that is not a tutorial room cannot have stones', () => {
    expect(() => loadRoom({ id: 'x', name: 'X', kind: 'rest', tiles, hazards })).toThrow(/only tutorial rooms can have falling stones/);
    expect(() => loadRoom({ id: 'x', name: 'X', kind: 'rest', tutorial: true, tiles, hazards: { stones: [{ fillSeconds: 0, spots: [{ column: 2, row: 2 }] }] } })).toThrow(RoomError);
    expect(() => loadRoom({ id: 'x', name: 'X', kind: 'rest', tutorial: true, tiles, hazards: { stones: [{ fillSeconds: 1, spots: [{ column: 1, row: 1 }] }] } })).toThrow(/floor tile/);
    expect(loadRoom({ id: 'x', name: 'X', kind: 'rest', tiles }).stoneWaves).toEqual([]);
  });
});
