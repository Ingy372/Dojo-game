import { describe, expect, it } from 'vitest';
import { floorRooms, type Room } from '../src';
import { testContent } from './load-content';
import floorSetsRaw from '../../../content/settings/floor-sets.json';
import { ENEMY_PACKS } from '../../../apps/client/src/art/enemyPacks';
import { withTestFloorSets } from '../../../apps/client/src/game/floorTest';
import { greenContent } from './balance/green-floors.test';

// Green floors (Nov 26): the Giant's Steps, belt 4. Built from the L11 draft rooms with monsters that already
// have art, switched off for players, with the Floor Keeper standing in for the Green Guardian.

const live = testContent();
const green = greenContent();
const own = (): Room[] => floorRooms(green, 4);
const waves = (r: Room) => Math.max(0, ...r.enemySpawns.map((s) => s.wave));
const inWave = (r: Room, w: number) => r.enemySpawns.filter((s) => s.wave === w);

/** Monsters drawn from the White belt pack, plus every monster with its own art pack. */
const HAS_ART = new Set(['swarmer', 'shield', 'brute', 'floor-keeper', ...Object.keys(ENEMY_PACKS)]);

describe('Green floors: the Giant\'s Steps', () => {
  it('is switched off in the live game, so Green belts still climb the shared rooms', () => {
    expect(floorSetsRaw.sets['giants-steps']).toBe(false);
    expect(floorRooms(live, 4).every((r) => r.floorSet === null)).toBe(true);
  });

  it('switched on, belt 4 gets its own 8 rooms: 4 battles, a challenge, a rest, a treasure and the boss room', () => {
    const rooms = own();
    expect(rooms.every((r) => r.id.startsWith('t4-') && r.minBeltTier === 4 && r.floorSet === 'giants-steps')).toBe(true);
    expect(rooms.map((r) => r.kind).sort()).toEqual(['battle', 'battle', 'battle', 'battle', 'boss', 'challenge', 'rest', 'treasure']);
    // No other belt changes.
    for (const t of [1, 2, 3, 5, 6, 7, 8, 9, 10]) expect(floorRooms(green, t).map((r) => r.id)).toEqual(floorRooms(live, t).map((r) => r.id));
  });

  it('uses only monsters that already have art', () => {
    const used = new Set(own().flatMap((r) => r.enemySpawns.map((s) => s.enemy)));
    for (const id of used) expect(HAS_ART.has(id), id).toBe(true);
  });

  it('the boss room is a marked stand-in: the Floor Keeper, until Jay picks the Green Guardian', () => {
    const boss = own().find((r) => r.kind === 'boss')!;
    const bosses = boss.enemySpawns.filter((s) => green.enemies[s.enemy].boss).map((s) => s.enemy);
    expect(bosses).toEqual(['floor-keeper']);
    expect(JSON.stringify(boss)).not.toContain('stone-giant');
  });

  it('battle rooms have 4 waves of 3-4 like the Orange floors, and grow gently through the floor', () => {
    const battles = own().filter((r) => r.kind === 'battle');
    for (const r of battles) {
      expect(waves(r), r.id).toBe(4);
      for (let w = 1; w <= 4; w++) expect(inWave(r, w).length, `${r.id} wave ${w}`).toBeGreaterThanOrEqual(3);
      for (let w = 1; w <= 4; w++) expect(inWave(r, w).length, `${r.id} wave ${w}`).toBeLessThanOrEqual(4);
    }
    // The rooms that can come first (room 1) have no Brute and no heavy kitchen monsters; those wait for room 3.
    const HEAVY = ['brute', 'dough-blob', 'rolling-pin', 'ladle-lobber'];
    for (const r of battles.filter((x) => x.earliestRoom === 1)) expect(r.enemySpawns.some((s) => HEAVY.includes(s.enemy)), r.id).toBe(false);
    expect(battles.filter((x) => x.earliestRoom === 1).length).toBeGreaterThanOrEqual(2);
    const challenge = own().find((r) => r.kind === 'challenge')!;
    expect(challenge.earliestRoom).toBe(4);
    expect(challenge.challenge?.seconds).toBeGreaterThan(0);
  });

  it('the ?floors= test link switches a set on for testing only, and ignores names it does not know', () => {
    expect(withTestFloorSets(floorSetsRaw, 'giants-steps').sets['giants-steps']).toBe(true);
    expect(withTestFloorSets(floorSetsRaw, 'giants-steps').sets['quiet-river']).toBe(false);
    expect(withTestFloorSets(floorSetsRaw, 'nope')).toBe(floorSetsRaw);
    expect(withTestFloorSets(floorSetsRaw, null)).toBe(floorSetsRaw);
    expect(floorSetsRaw.sets['giants-steps']).toBe(false); // the file itself is never changed
  });
});
