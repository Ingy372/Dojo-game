import { describe, expect, it } from 'vitest';
import {
  beatNamed,
  createRunWorld,
  loadProfile,
  meetNamed,
  namedDef,
  newProfile,
  startRun,
  updateRun,
  type RunOptions,
  type RunState,
  type WorldState,
} from '../src';
import { testContent } from './load-content';

const content = testContent();
const named = content.named;
const PLAYER = { maxHealth: 100, power: 10, guard: 0 };

/** Walks a run through every room without fighting, recording where the named monster is. */
function walkFloor(opts: Omit<RunOptions, 'dryRuns'>, c = content) {
  const run = startRun(c, { dryRuns: 0, ...opts });
  const rooms: Array<{ depth: number; kind: string; named: RunState['named']; elites: number; enemy: string | null }> = [];
  const record = (r: RunState) => {
    const room = c.rooms.find((x) => x.id === r.roomId)!;
    rooms.push({ depth: r.depth, kind: room.kind, named: r.named, elites: r.elites.length, enemy: r.named ? room.enemySpawns[r.named.spawn].enemy : null });
  };
  record(run);
  for (let guard = 0; guard < 20 && run.status === 'playing'; guard++) {
    const fake = { events: [{ kind: 'doorEntered', playerId: 'p1', door: 0 }], players: { p1: { health: 100, pos: { x: 0, y: 0 } } }, progress: { bestCombo: 0 }, enemies: [] } as unknown as WorldState;
    updateRun(c, run, fake);
    if (run.status === 'playing') record(run);
  }
  return { run, rooms };
}

describe('named monster stats', () => {
  it('x1.5 Health (Old Thumper 189 after R-BAL-9c); Power, Guard, speed, wind-up and Counter window unchanged', () => {
    const b = content.enemies.brute;
    const t = namedDef(b, named.rules);
    expect(t.maxHealth).toBe(189);
    expect(namedDef(content.enemies.swarmer, named.rules).maxHealth).toBe(Math.round(content.enemies.swarmer.maxHealth * 1.5));
    expect(namedDef(content.enemies.shield, named.rules).maxHealth).toBe(Math.round(content.enemies.shield.maxHealth * 1.5));
    expect({ ...t, maxHealth: b.maxHealth }).toEqual(b);
  });
});

describe('where named monsters appear (1,000 floors at tier 2)', () => {
  it('about 1 in 30 floors (~3%), at most one per floor, only in battle rooms from room 3, never with an elite', () => {
    let floors = 0;
    let appeared = 0;
    for (let seed = 1; seed <= 1000; seed++) {
      const { rooms } = walkFloor({ seed, tier: 2, runsStarted: 10 });
      floors++;
      const withNamed = rooms.filter((r) => r.named);
      expect(withNamed.length).toBeLessThanOrEqual(1);
      for (const r of withNamed) {
        appeared++;
        expect(r.kind).toBe('battle');
        expect(r.depth + 1).toBeGreaterThanOrEqual(named.rules.earliestRoom);
        expect(r.elites).toBe(0);
        const def = named.monsters.find((m) => m.id === r.named!.id)!;
        expect(r.enemy).toBe(def.baseEnemy);
      }
    }
    const rate = appeared / floors;
    // 1-in-30 roll (rules.chancePerRun 0.0333). A few floors have no battle room with the rolled
    // type after room 3, so it comes out a bit under (2.8% on these 1,000 seeds).
    expect(rate).toBeGreaterThanOrEqual(0.02);
    expect(rate).toBeLessThanOrEqual(0.045);
  });

  it('K12: the three named monsters come equally often (each about 1/3 over 6,000 floors)', () => {
    const always = { ...content, named: { ...named, rules: { ...named.rules, chancePerRun: 1 } } };
    const counts: Record<string, number> = {};
    let total = 0;
    for (let seed = 1; seed <= 6000; seed++) {
      const at = walkFloor({ seed, tier: 2, runsStarted: 10 }, always).rooms.find((r) => r.named);
      if (!at) continue;
      counts[at.named!.id] = (counts[at.named!.id] ?? 0) + 1;
      total++;
    }
    expect(Object.keys(counts).sort()).toEqual(named.monsters.map((m) => m.id).sort());
    for (const id of Object.keys(counts)) {
      expect(counts[id] / total).toBeGreaterThan(0.28);
      expect(counts[id] / total).toBeLessThan(0.39);
    }
  });

  it('K12: ?named=X without &room= always gives X (every monster, 200 seeds each)', () => {
    for (const m of named.monsters) {
      for (let seed = 1; seed <= 200; seed++) {
        const at = walkFloor({ seed, tier: 1, forcedNamed: m.id }).rooms.find((r) => r.named);
        expect(at?.named?.id).toBe(m.id);
        expect(at!.enemy).toBe(m.baseEnemy);
      }
    }
  });

  it('never below tier 2, in the first 3 runs, or in test runs', () => {
    for (let seed = 1; seed <= 400; seed++) {
      expect(walkFloor({ seed, tier: 1, runsStarted: 10 }).rooms.some((r) => r.named)).toBe(false);
      expect(walkFloor({ seed, tier: 3, runsStarted: 2 }).rooms.some((r) => r.named)).toBe(false);
      expect(startRun(content, { seed, dryRuns: 0, tier: 3, runsStarted: 10, firstRoomId: 'bamboo-hall' }).namedPending).toBeNull();
    }
  });

  it('the roll uses its own random stream: the same rooms with or without it, and no elite in its room', () => {
    for (let seed = 1; seed <= 600; seed++) {
      const a = walkFloor({ seed, tier: 5, runsStarted: 0, forcedNamed: undefined }).rooms;
      const b = walkFloor({ seed, tier: 5, runsStarted: seed % 2 ? 10 : 0, forcedNamed: seed % 3 ? undefined : 'captain-clank' }).rooms;
      // After the named room the elite cap has one more to give (its room doesn't count), which
      // can change later rolls, so rooms must match up to and including it.
      const at = b.findIndex((r) => r.named);
      const upTo = at < 0 ? b.length : at + 1;
      expect(b.slice(0, upTo).map((r) => r.kind)).toEqual(a.slice(0, upTo).map((r) => r.kind));
      b.forEach((r, i) => {
        if (r.named) expect(r.elites).toBe(0);
        else if (at < 0 || i < at) expect(r.elites).toBe(a[i].elites);
      });
    }
  });

  it('?named=old-thumper comes in the first battle room from room 3 as a 189-Health brute', () => {
    let seen = 0;
    for (let seed = 1; seed <= 50; seed++) {
      const { rooms } = walkFloor({ seed, tier: 1, forcedNamed: 'old-thumper' });
      const first = rooms.find((r) => (r.kind === 'battle' || r.kind === 'challenge') && r.depth + 1 >= named.rules.earliestRoom);
      const at = rooms.find((r) => r.named);
      if (!first) continue;
      expect(at).toBe(first);
      if (at!.named!.id === 'old-thumper') seen++;
    }
    expect(seen).toBeGreaterThan(0);
    const run = startRun(content, { seed: 7, dryRuns: 0, firstRoomId: 'brute-and-swarm', forcedNamed: 'old-thumper' });
    expect(run.named?.id).toBe('old-thumper');
    const world = createRunWorld(content, run, PLAYER);
    const e = world.enemies.find((x) => x.named === 'old-thumper')!;
    expect(e.health).toBe(189);
    expect(e.elite).toBeNull();
    expect(world.enemies.filter((x) => x.named).length).toBe(1);
  });

  it('defeating it tells the game (namedDefeated)', () => {
    const run = startRun(content, { seed: 7, dryRuns: 0, firstRoomId: 'brute-and-swarm', forcedNamed: 'old-thumper' });
    const world = createRunWorld(content, run, PLAYER);
    const e = world.enemies.find((x) => x.named)!;
    world.events = [{ kind: 'playerAttack', playerId: 'p1', enemyId: e.id, damage: 999, defeated: true } as never];
    const out = updateRun(content, run, world);
    expect(out.some((ev) => ev.kind === 'namedDefeated' && ev.id === 'old-thumper')).toBe(true);
  });
});

describe('Monster Journal', () => {
  const real = { test: false };

  it('a ?named= test run never writes the journal or gives the sticker', () => {
    const run = startRun(content, { seed: 7, dryRuns: 0, firstRoomId: 'brute-and-swarm', forcedNamed: 'old-thumper' });
    expect(run.test).toBe(true);
    const p = newProfile();
    expect(meetNamed(p, run, 'old-thumper')).toBe(false);
    expect(beatNamed(p, run, named, 'old-thumper')).toBeNull();
    expect(p.monsterJournal).toEqual({});
  });

  it('meeting marks met; the first win gives the sticker once; later wins give nothing', () => {
    const p = newProfile();
    expect(meetNamed(p, real, 'zippy-zoom')).toBe(true);
    expect(meetNamed(p, real, 'zippy-zoom')).toBe(false);
    expect(p.monsterJournal['zippy-zoom']).toEqual({ met: true, beaten: false });
    expect(beatNamed(p, real, named, 'zippy-zoom')).toBe('sticker-swarmer');
    expect(beatNamed(p, real, named, 'zippy-zoom')).toBeNull();
    expect(p.monsterJournal['zippy-zoom']).toEqual({ met: true, beaten: true });
    const back = loadProfile(JSON.parse(JSON.stringify(p)));
    expect(back.monsterJournal['zippy-zoom']).toEqual({ met: true, beaten: true });
  });

  it('an old save loads with an empty journal and runsStarted from runsPlayed', () => {
    const old = JSON.parse(JSON.stringify(newProfile()));
    delete old.monsterJournal;
    delete old.runsStarted;
    old.runsPlayed = 5;
    const p = loadProfile(old);
    expect(p.monsterJournal).toEqual({});
    expect(p.runsStarted).toBe(5);
  });

  it('every sticker is a wall decoration that chests never give', () => {
    for (const m of named.monsters) {
      const d = content.dojo.decorations.find((x) => x.id === m.sticker)!;
      expect(d.source).toBe('named');
      expect(d.place).toBe('wall');
    }
  });
});
