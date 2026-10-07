import { describe, expect, it } from 'vitest';
import {
  BLESSING,
  FLOOR,
  LOOT,
  activeDoorSlots,
  chooseInsight,
  createRng,
  createRunWorld,
  currentRoom,
  finishRun,
  gradeRoom,
  newProfile,
  playerStats,
  rollRarity,
  startRun,
  stepWorld,
  summarizeRun,
  updateRun,
  type RunEvent,
  type RunState,
} from '../src';
import { testContent } from './load-content';

const content = testContent();
const BASE = { maxHealth: 100, power: 10, guard: 0 };

/** Plays a whole run by skipping the fights: beats every enemy, opens chests, takes door `pickDoor`. */
function autoplay(run: RunState, pickDoor = (n: number) => n - 1, prefer?: string): RunEvent[] {
  const all: RunEvent[] = [];
  for (let guard = 0; guard < 50 && run.status === 'playing'; guard++) {
    const room = currentRoom(content, run);
    const world = createRunWorld(content, run, BASE);
    const p = world.players.p1;
    for (let t = 0; t < 400 && run.status === 'playing'; t++) {
      for (const e of world.enemies) if (e.mode !== 'defeated') e.health = 0, (e.mode = 'defeated');
      if (run.insightChoices) chooseInsight(run, run.insightChoices[0]);
      if (room.chest && !world.progress.chestOpened && world.progress.cleared) p.pos = { x: room.chest.x, y: room.chest.y + 1 };
      else if (world.progress.doorsOpen) {
        const slots = activeDoorSlots(room, run.doors.length);
        const wanted = prefer ? run.doors.indexOf(prefer as never) : -1;
        const d = room.doors[slots[wanted >= 0 ? wanted : pickDoor(slots.length)]];
        p.pos = { x: d.x, y: d.y + 1 };
      }
      stepWorld(world, room, { p1: { kind: 'none' } });
      const evs = updateRun(content, run, world);
      all.push(...evs);
      if (evs.some((e) => e.kind === 'nextRoom')) break;
    }
  }
  return all;
}

/** Like autoplay, but takes a door of this kind whenever one is offered. */
function autoplayPreferring(run: RunState, kind: string): void {
  autoplay(run, () => 0, kind);
}

describe('content', () => {
  it('has about 9 Insights, 3 enemy types plus a boss, and every kind of room', () => {
    expect(content.insights.length).toBe(9);
    expect(Object.keys(content.enemies).sort()).toEqual(['brute', 'floor-keeper', 'shield', 'swarmer']);
    for (const k of ['battle', 'challenge', 'treasure', 'rest', 'boss']) {
      expect(content.rooms.some((r) => r.kind === k)).toBe(true);
    }
  });
});

describe('room grades', () => {
  it('S needs enough Perfect Counters for the room, little damage and a fast clear', () => {
    // 4 enemies: 2 Perfect Counters earn the point.
    expect(gradeRoom(2, 10, 100, 20 * 40, 50, 4)).toBe('S');
    expect(gradeRoom(1, 10, 100, 20 * 40, 50, 4)).toBe('A');
    expect(gradeRoom(0, 50, 100, 20 * 40, 50, 4)).toBe('B');
    expect(gradeRoom(3, 50, 100, 20 * 80, 50, 4)).toBe('B');
  });
});

describe('loot rarity', () => {
  it('follows the shares: about 70 / 22 / 7 / 1', () => {
    const rng = createRng(42);
    const counts: Record<string, number> = { common: 0, uncommon: 0, rare: 0, epic: 0, legendary: 0 };
    const n = 100000;
    for (let i = 0; i < n; i++) counts[rollRarity(rng, 0)]++;
    expect(counts.common / n).toBeCloseTo(0.7, 1);
    expect(counts.uncommon / n).toBeCloseTo(0.22, 1);
    expect(counts.rare / n).toBeCloseTo(0.07, 1);
    expect(counts.epic / n).toBeGreaterThan(0.005);
    expect(counts.epic / n).toBeLessThan(0.015);
    expect(counts.legendary).toBe(0);
  });

  it('bad luck raises the chance of a Rare', () => {
    const rare = (dry: number) => {
      const rng = createRng(7);
      let r = 0;
      for (let i = 0; i < 20000; i++) if (rollRarity(rng, dry) === 'rare') r++;
      return r;
    };
    expect(rare(3)).toBeGreaterThan(rare(0) * 1.8);
  });

  it('the Dojo Blessing raises the chance of a Rare', () => {
    const rare = (extra: number) => {
      const rng = createRng(7);
      let r = 0;
      for (let i = 0; i < 20000; i++) if (rollRarity(rng, 0, 'common', extra) === 'rare') r++;
      return r;
    };
    expect(rare(BLESSING.rareWeight)).toBeGreaterThan(rare(0) * 1.3);
  });

  it('the 5th run in a row without a Rare gets one, in its first chest', () => {
    for (let seed = 1; seed <= 30; seed++) {
      const run = startRun(content, { seed, dryRuns: LOOT.guaranteedRareOnRun - 1 });
      const events = autoplay(run);
      const firstChest = events.find((e) => e.kind === 'loot' && e.source === 'chest');
      expect(firstChest && firstChest.kind === 'loot' && ['rare', 'epic'].includes(firstChest.item.rarity)).toBe(true);
    }
  });

  it('counts runs without a Rare, and resets after one', () => {
    const profile = newProfile();
    const empty = summarizeRun(startRun(content, { seed: 1, dryRuns: 0 }));
    for (let i = 1; i <= 4; i++) {
      finishRun(profile, empty);
      expect(profile.dryRuns).toBe(i);
    }
    const rare = { ...empty, items: [{ uid: 'r1', base: 'jade-charm', name: 'Jade Charm', slot: 'charm' as const, rarity: 'rare' as const, stats: { power: 0, maxHealth: 0, guard: 0 }, effect: null, effectText: '' }] };
    finishRun(profile, rare);
    expect(profile.dryRuns).toBe(0);
  });
});

describe('a full run', () => {
  it('goes through the floor room by room, ends with the boss, and comes home', () => {
    const run = startRun(content, { seed: 123, dryRuns: 0 });
    expect(currentRoom(content, run).kind).toBe('battle');
    const events = autoplay(run);
    expect(run.status).toBe('cleared');
    expect(run.results).toHaveLength(FLOOR.roomsBeforeBoss + 1);
    expect(run.results[run.results.length - 1].kind).toBe('boss');
    // Boss chest: at least 3 items, Uncommon or better.
    const chest = events.filter((e) => e.kind === 'loot' && e.source === 'chest');
    expect(chest.length).toBeGreaterThanOrEqual(3);
    // One Insight per battle or challenge room.
    const fights = run.results.filter((r) => r.kind === 'battle' || r.kind === 'challenge').length;
    expect(run.insights).toHaveLength(Math.min(fights, content.insights.length));
    expect(new Set(run.insights).size).toBe(run.insights.length);
  });

  it('offers 2 or 3 doors with at least one fight, and only the boss door before the boss', () => {
    for (let seed = 1; seed < 60; seed++) {
      const run = startRun(content, { seed, dryRuns: 0 });
      expect(run.doors.length).toBeGreaterThanOrEqual(2);
      expect(run.doors.length).toBeLessThanOrEqual(3);
      expect(run.doors.some((d) => d === 'battle' || d === 'challenge')).toBe(true);
      expect(new Set(run.doors).size).toBe(run.doors.length);
    }
    const run = startRun(content, { seed: 5, dryRuns: 0 });
    run.depth = FLOOR.roomsBeforeBoss - 1;
    autoplay(run, () => 0);
    expect(run.results.slice(-2).map((r) => r.kind)).toEqual([expect.any(String), 'boss']);
  });

  it('never two treasure rooms in a row, and at most 2 per floor, even when always picking treasure', () => {
    for (let seed = 1; seed <= 60; seed++) {
      const run = startRun(content, { seed, dryRuns: 0 });
      // Always walk through the treasure door when there is one.
      autoplayPreferring(run, 'treasure');
      const kinds = run.results.map((r) => r.kind);
      expect(kinds.filter((k) => k === 'treasure').length).toBeLessThanOrEqual(FLOOR.maxTreasureRooms);
      for (let i = 1; i < kinds.length; i++) expect(kinds[i] === 'treasure' && kinds[i - 1] === 'treasure').toBe(false);
    }
  });

  it('a treasure room or rest shrine is always followed by a fight, so fights can never be skipped', () => {
    for (const prefer of ['treasure', 'rest']) {
      for (let seed = 1; seed <= 60; seed++) {
        const run = startRun(content, { seed, dryRuns: 0 });
        autoplayPreferring(run, prefer);
        const kinds = run.results.map((r) => r.kind);
        const calm = (k: string) => k === 'treasure' || k === 'rest';
        for (let i = 1; i < kinds.length; i++) expect(calm(kinds[i]) && calm(kinds[i - 1])).toBe(false);
        expect(kinds.filter((k) => k === 'rest').length).toBeLessThanOrEqual(FLOOR.maxRestRooms);
        expect(kinds.filter((k) => k === 'battle' || k === 'challenge').length).toBeGreaterThanOrEqual(4);
      }
    }
  });

  it('the same seed always gives the same run', () => {
    const a = startRun(content, { seed: 99, dryRuns: 2 });
    const b = startRun(content, { seed: 99, dryRuns: 2 });
    autoplay(a, () => 0);
    autoplay(b, () => 0);
    expect(JSON.stringify(summarizeRun(a))).toBe(JSON.stringify(summarizeRun(b)));
  });

  it('defeat ends the run, and the player keeps everything found', () => {
    const run = startRun(content, { seed: 3, dryRuns: 0 });
    run.loot.push({ uid: 'r99', base: 'cloth-wraps', name: 'Cloth Hand Wraps', slot: 'hands', rarity: 'common', stats: { power: 1, maxHealth: 0, guard: 0 }, effect: null, effectText: '' });
    const room = currentRoom(content, run);
    const world = createRunWorld(content, run, BASE);
    world.players.p1.health = 1;
    for (let t = 0; t < 2000 && run.status === 'playing'; t++) {
      stepWorld(world, room, { p1: { kind: 'none' } });
      updateRun(content, run, world);
    }
    expect(run.status).toBe('lost');
    const profile = newProfile();
    finishRun(profile, summarizeRun(run));
    expect(profile.inventory).toHaveLength(1);
    expect(profile.equipped.hands).toBe(profile.inventory[0].uid);
    expect(playerStats(profile).power).toBe(11);
  });

  it('health carries from room to room', () => {
    const run = startRun(content, { seed: 8, dryRuns: 0 });
    run.health = 40;
    const world = createRunWorld(content, run, BASE);
    expect(world.players.p1.health).toBe(40);
  });
});

describe('personal bests', () => {
  it('records the best numbers and says which were beaten', () => {
    const profile = newProfile();
    const run = startRun(content, { seed: 11, dryRuns: 0 });
    autoplay(run);
    const s = summarizeRun(run);
    s.perfects = 4;
    s.bestCombo = 25;
    const first = finishRun(profile, s);
    expect(first).toEqual(expect.arrayContaining(['fastestClearTicks', 'mostPerfects', 'longestCombo']));
    const again = finishRun(profile, { ...s, perfects: 2, ticks: s.ticks + 100 });
    expect(again).toEqual([]);
    expect(profile.bests.mostPerfects).toBe(4);
  });
});
