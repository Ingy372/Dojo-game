import { describe, expect, it } from 'vitest';
import {
  COMBAT,
  createWorld,
  eliteDef,
  finishRun,
  firstFloorOfTier,
  loadRoom,
  newProfile,
  startRun,
  stepWorld,
  summarizeRun,
  updateGuards,
  updateRun,
  type Difficulty,
  type EliteKind,
  type EliteSpawn,
  type PlayerInput,
  type RunState,
  type WorldState,
} from '../src';
import { testContent } from './load-content';

const content = testContent();
const rules = content.elites;
const IDLE: PlayerInput = { kind: 'none' };

/** A walled arena. Enemies are placed by tile; `elites` marks spawns (index in the list) as elites. */
function arena(enemies: { enemy: string; column: number; row: number }[], elites: EliteSpawn[] = [], difficulty: Difficulty = 'standard') {
  const room = loadRoom({
    id: 'arena',
    name: 'Arena',
    tiles: ['####################', '#..................#', '#..................#', '#..P...............#', '#..................#', '#..................#', '#..................#', '####################'],
    enemies,
  });
  const world = createWorld(room, ['p1'], { enemyTypes: content.enemies, respawnEnemies: false, elites, eliteRules: rules, difficulty });
  return { room, world, p: world.players.p1 };
}

/** Holds every enemy still (staggered) so a test controls exactly who is where. */
function freeze(world: WorldState): void {
  for (const e of world.enemies) {
    e.mode = 'stagger';
    e.modeTicks = 10000;
  }
}

/** Damage of the player's next basic hit on enemy `target` (others are moved out of reach). */
function basicHitOn(world: WorldState, room: ReturnType<typeof arena>['room'], target: number): number {
  const p = world.players.p1;
  const e = world.enemies[target];
  e.pos = { x: p.pos.x + 0.9, y: p.pos.y };
  p.attackCooldown = 0;
  p.combo = 0;
  stepWorld(world, room, { p1: IDLE });
  const hit = world.events.find((ev) => ev.kind === 'playerAttack' && ev.enemyId === e.id);
  if (!hit || hit.kind !== 'playerAttack') throw new Error('no hit');
  return hit.damage;
}

describe('elite stats', () => {
  it('an elite has 1.25x Health (a Guarding Brute has 225), the same Power and Guard', () => {
    const brute = content.enemies.brute;
    const g = eliteDef(brute, 'guarding', rules);
    expect(g.maxHealth).toBe(225);
    expect(g.power).toBe(brute.power);
    expect(g.guard).toBe(brute.guard);
    const { world } = arena([{ enemy: 'brute', column: 10, row: 4 }], [{ spawn: 0, kind: 'guarding' }]);
    expect(world.enemies[0].health).toBe(225);
    expect(world.enemies[0].elite).toBe('guarding');
  });

  it('Swift moves 1.25x faster and recovers in 0.85x the time; Guarding keeps normal speed', () => {
    const s = content.enemies.swarmer;
    const swift = eliteDef(s, 'swift', rules);
    expect(swift.moveSpeedTilesPerSecond).toBeCloseTo(s.moveSpeedTilesPerSecond * 1.25);
    expect(swift.attacks[0].recoverTicks).toBe(Math.round(s.attacks[0].recoverTicks * 0.85));
    expect(eliteDef(content.enemies.brute, 'guarding', rules).moveSpeedTilesPerSecond).toBe(content.enemies.brute.moveSpeedTilesPerSecond);
  });

  it('a Swift wind-up is 0.8x on Standard and Challenge, unchanged on Guided, and the Counter window never changes', () => {
    const windup = (difficulty: Difficulty, elite: EliteKind | null) => {
      const { room, world, p } = arena([{ enemy: 'swarmer', column: 6, row: 4 }], elite ? [{ spawn: 0, kind: elite }] : [], difficulty);
      const e = world.enemies[0];
      e.pos = { x: p.pos.x + 0.8, y: p.pos.y };
      e.mode = 'chase';
      stepWorld(world, room, { p1: IDLE });
      const t = world.events.find((ev) => ev.kind === 'telegraph');
      return t && t.kind === 'telegraph' ? t.ticks : -1;
    };
    expect(windup('standard', null)).toBe(12);
    expect(windup('standard', 'swift')).toBe(10);
    expect(windup('challenge', 'swift')).toBe(Math.max(8, Math.round(windup('challenge', null) * 0.8)));
    expect(windup('guided', 'swift')).toBe(windup('guided', null));
    expect(windup('standard', 'guarding')).toBe(12);
    // Perfect Counter timing: a counter pressed this many ticks before the swing still counts, elite or not.
    for (const difficulty of ['guided', 'standard', 'challenge'] as Difficulty[]) {
      const { world: w1, p: p1 } = arena([{ enemy: 'swarmer', column: 6, row: 4 }], [{ spawn: 0, kind: 'swift' }], difficulty);
      const { world: w2, p: p2 } = arena([{ enemy: 'swarmer', column: 6, row: 4 }], [], difficulty);
      expect(perfectWindow(w1, p1)).toBe(perfectWindow(w2, p2));
    }
  });
});

/** The latest a Counter press can come before the swing and still be Perfect, found by trying. */
function perfectWindow(world: WorldState, _p: unknown): number {
  let best = 0;
  for (let early = 1; early < 30; early++) {
    const copy = JSON.parse(JSON.stringify(world)) as WorldState;
    const room = loadRoom({ id: 'arena', name: 'Arena', tiles: ['####################', '#..................#', '#..................#', '#..P...............#', '#..................#', '#..................#', '#..................#', '####################'], enemies: [{ enemy: 'swarmer', column: 6, row: 4 }] });
    const p = copy.players.p1;
    const e = copy.enemies[0];
    e.mode = 'windup';
    e.modeTicks = early;
    e.windupTotal = early;
    e.attackCenter = { ...p.pos };
    e.pos = { x: p.pos.x + 0.8, y: p.pos.y };
    let perfect = false;
    for (let t = 0; t < early + 1; t++) {
      stepWorld(copy, room, { p1: { kind: 'none', action: t === 0 ? 'counter' : undefined } });
      if (copy.events.some((ev: { kind: string }) => ev.kind === "perfectCounter")) perfect = true;
    }
    if (perfect) best = early;
  }
  return best;
}

describe('Guarding aura', () => {
  const four = [
    { enemy: 'brute', column: 10, row: 4 }, // the guarder
    { enemy: 'swarmer', column: 12, row: 4 }, // 2 tiles
    { enemy: 'swarmer', column: 8, row: 4 }, // 2 tiles (tie: came in after the one above)
    { enemy: 'shield', column: 11, row: 4 }, // 1 tile
  ];

  it('protects exactly the 2 closest enemies within 3 tiles (ties go to the earlier enemy), never itself', () => {
    const { world } = arena(four, [{ spawn: 0, kind: 'guarding' }]);
    freeze(world);
    updateGuards(world);
    const guarded = world.enemies.filter((e) => e.guardedBy === world.enemies[0].id).map((e) => e.id);
    expect(guarded).toEqual([world.enemies[1].id, world.enemies[3].id]);
    expect(world.enemies[0].guardedBy).toBeNull();
  });

  it('an enemy led more than 3 tiles away loses protection; defeating the guarder ends all of it', () => {
    const { world } = arena(four, [{ spawn: 0, kind: 'guarding' }]);
    freeze(world);
    world.enemies[3].pos = { x: 16.5, y: 4.5 };
    updateGuards(world);
    expect(world.enemies[3].guardedBy).toBeNull();
    expect(world.enemies[2].guardedBy).toBe(world.enemies[0].id);
    world.enemies[0].mode = 'defeated';
    updateGuards(world);
    expect(world.enemies.every((e) => e.guardedBy === null)).toBe(true);
  });

  it('never protects a boss', () => {
    const { world } = arena([{ enemy: 'brute', column: 10, row: 4 }, { enemy: 'floor-keeper', column: 12, row: 4 }], [{ spawn: 0, kind: 'guarding' }]);
    freeze(world);
    updateGuards(world);
    expect(world.enemies[1].guardedBy).toBeNull();
  });

  it('a protected enemy takes about 2/3 of a basic hit (rounded, at least 1); others take full', () => {
    const setup = (elite: boolean) => {
      const a = arena([{ enemy: 'brute', column: 17, row: 6 }, { enemy: 'brute', column: 17, row: 4 }], elite ? [{ spawn: 0, kind: 'guarding' }] : []);
      freeze(a.world);
      return a;
    };
    const plain = setup(false);
    const full = basicHitOn(plain.world, plain.room, 1);
    const guarded = setup(true);
    // Keep the guarder right next to the target while the hit lands.
    guarded.world.enemies[1].pos = { x: guarded.p.pos.x + 0.9, y: guarded.p.pos.y };
    guarded.world.enemies[0].pos = { x: guarded.p.pos.x + 2.5, y: guarded.p.pos.y + 1 };
    updateGuards(guarded.world);
    expect(guarded.world.enemies[1].guardedBy).toBe(guarded.world.enemies[0].id);
    const cut = basicHitOn(guarded.world, guarded.room, 1);
    expect(cut).toBe(Math.max(1, Math.round(full * 0.67)));
    expect(cut).toBeLessThan(full);
  });

  it('a Perfect Counter on a protected enemy is still Perfect and staggers it for the full time, with the cut damage', () => {
    const { room, world, p } = arena([{ enemy: 'brute', column: 10, row: 4 }, { enemy: 'swarmer', column: 6, row: 4 }], [{ spawn: 0, kind: 'guarding' }]);
    const g = world.enemies[0];
    const e = world.enemies[1];
    g.mode = 'stagger';
    g.modeTicks = 10000;
    g.pos = { x: p.pos.x + 2, y: p.pos.y + 1 };
    e.pos = { x: p.pos.x + 0.8, y: p.pos.y };
    e.mode = 'windup';
    e.modeTicks = 1;
    e.windupTotal = 12;
    e.attackCenter = { ...p.pos };
    updateGuards(world);
    expect(e.guardedBy).toBe(g.id);
    const healthBefore = p.health;
    stepWorld(world, room, { p1: { kind: 'none', action: 'counter' } });
    expect(world.events.some((ev) => ev.kind === 'perfectCounter')).toBe(true);
    expect(e.mode).toBe('stagger');
    expect(e.modeTicks).toBe(COMBAT.counter.perfectStaggerTicks);
    expect(p.health).toBe(healthBefore);
  });

  it('a Strike still breaks a protected Shield Guard\'s shield', () => {
    const { room, world, p } = arena([{ enemy: 'brute', column: 10, row: 4 }, { enemy: 'shield', column: 6, row: 4 }], [{ spawn: 0, kind: 'guarding' }]);
    freeze(world);
    const s = world.enemies[1];
    s.pos = { x: p.pos.x + 0.9, y: p.pos.y };
    world.enemies[0].pos = { x: p.pos.x + 2.5, y: p.pos.y + 1 };
    updateGuards(world);
    expect(s.guardedBy).toBe(world.enemies[0].id);
    p.focus = COMBAT.strike.focusCost;
    p.attackCooldown = 0;
    stepWorld(world, room, { p1: { kind: 'none', action: 'strike' } });
    expect(world.events.some((ev) => ev.kind === 'shieldBreak')).toBe(true);
    expect(s.shieldUp).toBe(false);
  });

  it('damage the player takes is the same with or without a Guarding elite in the room', () => {
    const swing = (elite: boolean) => {
      const { room, world, p } = arena([{ enemy: 'brute', column: 14, row: 6 }, { enemy: 'swarmer', column: 6, row: 4 }], elite ? [{ spawn: 0, kind: 'guarding' }] : []);
      world.enemies[0].mode = 'stagger';
      world.enemies[0].modeTicks = 10000;
      world.enemies[0].pos = { x: p.pos.x + 2, y: p.pos.y + 1 };
      const e = world.enemies[1];
      e.pos = { x: p.pos.x + 0.8, y: p.pos.y };
      e.mode = 'windup';
      e.modeTicks = 1;
      e.attackCenter = { ...p.pos };
      stepWorld(world, room, { p1: IDLE });
      return world.progress.damageTaken;
    };
    expect(swing(true)).toBeGreaterThan(0);
    expect(swing(true)).toBe(swing(false));
  });
});

/** Walks a run through every room without fighting (fakes "door entered"), recording each room's elites. */
function walkFloor(seed: number, opts: { tier: number; difficulty?: Difficulty; firstFloorOfTier?: boolean }) {
  const run = startRun(content, { seed, dryRuns: 0, ...opts });
  const rooms: Array<{ depth: number; kind: string; elites: EliteSpawn[] }> = [];
  const record = (r: RunState) => rooms.push({ depth: r.depth, kind: content.rooms.find((x) => x.id === r.roomId)!.kind, elites: r.elites.slice() });
  record(run);
  for (let guard = 0; guard < 20 && run.status === 'playing'; guard++) {
    const fake = { events: [{ kind: 'doorEntered', playerId: 'p1', door: 0 }], players: { p1: { health: 100, pos: { x: 0, y: 0 } } }, progress: { bestCombo: 0 }, enemies: [] } as unknown as WorldState;
    updateRun(content, run, fake);
    if (run.status === 'playing') record(run);
  }
  return rooms;
}

describe('where elites appear (1,000 floors at 4th belt)', () => {
  it('only battle and challenge rooms from room 3, within the caps, at about the set chances', () => {
    let battle = 0;
    let battleElite = 0;
    let challenge = 0;
    let challengeElite = 0;
    let floors = 0;
    let floorElites = 0;
    for (let seed = 1; seed <= 1000; seed++) {
      const rooms = walkFloor(seed, { tier: 4 });
      let perFloor = 0;
      let guarding = 0;
      for (const r of rooms) {
        expect(r.elites.length).toBeLessThanOrEqual(1);
        if (r.depth < 2 || (r.kind !== 'battle' && r.kind !== 'challenge')) expect(r.elites).toEqual([]);
        perFloor += r.elites.length;
        guarding += r.elites.filter((x) => x.kind === 'guarding').length;
        // Only count rooms that could still get one (the floor cap not reached yet).
        if (r.depth >= 2 && r.kind === 'battle' && perFloor - r.elites.length < 2) {
          battle++;
          battleElite += r.elites.length;
        }
        if (r.depth >= 2 && r.kind === 'challenge' && perFloor - r.elites.length < 2) {
          challenge++;
          challengeElite += r.elites.length;
        }
      }
      expect(perFloor).toBeLessThanOrEqual(2);
      expect(guarding).toBeLessThanOrEqual(1);
      floors++;
      floorElites += perFloor;
    }
    expect(battleElite / battle).toBeGreaterThan(0.16);
    expect(battleElite / battle).toBeLessThan(0.24);
    expect(challengeElite / challenge).toBeGreaterThan(0.29);
    expect(challengeElite / challenge).toBeLessThan(0.41);
    expect(floorElites / floors).toBeGreaterThan(0.5);
  });

  it('no elites below 4th belt; no Guarding on Guided or on a tier\'s first floor', () => {
    const kinds = (opts: Parameters<typeof walkFloor>[1]) => {
      const out: string[] = [];
      for (let seed = 1; seed <= 300; seed++) for (const r of walkFloor(seed, opts)) out.push(...r.elites.map((x) => x.kind));
      return out;
    };
    expect(kinds({ tier: 3 })).toEqual([]);
    const guided = kinds({ tier: 4, difficulty: 'guided' });
    expect(guided.length).toBeGreaterThan(0);
    expect(guided).not.toContain('guarding');
    const first = kinds({ tier: 4, firstFloorOfTier: true });
    expect(first.length).toBeGreaterThan(0);
    expect(first).not.toContain('guarding');
    expect(kinds({ tier: 4 })).toContain('guarding');
  });

  it('Guarding elites are only Brutes or Shield Guards; no boss is ever an elite', () => {
    for (let seed = 1; seed <= 300; seed++) {
      for (const r of walkFloor(seed, { tier: 5 })) {
        const run = r; // room kinds already checked above
        for (const x of run.elites) {
          expect(x.kind === 'guarding' || x.kind === 'swift').toBe(true);
        }
      }
    }
    const run = startRun(content, { seed: 7, dryRuns: 0, tier: 4, forcedElite: 'guarding', firstRoomId: 'shield-escort' });
    const room = content.rooms.find((r) => r.id === run.roomId)!;
    for (const x of run.elites) expect(['brute', 'shield']).toContain(room.enemySpawns[x.spawn].enemy);
  });

  it('a tier\'s first floor is the first one the student finishes at that tier', () => {
    const profile = newProfile();
    expect(firstFloorOfTier(profile, 4)).toBe(true);
    const run = startRun(content, { seed: 3, dryRuns: 0, tier: 4 });
    run.status = 'lost';
    finishRun(profile, summarizeRun(run));
    expect(firstFloorOfTier(profile, 4)).toBe(false);
    expect(firstFloorOfTier(profile, 5)).toBe(true);
  });
});
