/// <reference types="vite/client" />
import { describe, expect, it } from 'vitest';
import { floorRooms, loadContent, type Content } from '../src';
import { testContent, testRawContent } from './load-content';
import floorSetsRaw from '../../../content/settings/floor-sets.json';

/**
 * L11-B2a: each tier 4-10 floor set turns on with one setting (content/settings/floor-sets.json).
 * The 56 L11-C1 draft rooms stay in drafts/ and are added here in test content only.
 */
const draftFiles = import.meta.glob('../../../drafts/content/rooms/L11/*.json', { eager: true, import: 'default' });
const draftRooms = Object.keys(draftFiles).sort().map((k) => draftFiles[k]);
const SETS: Record<number, [string, string]> = {
  4: ['giants-steps', 'stone-giant'],
  5: ['quiet-river', 'river-watcher'],
  6: ['forge-of-courage', 'ember-knight'],
  7: ['hall-of-echoes', 'echo-mask'],
  8: ['root-library', 'root-keeper'],
  9: ['storm-stair', 'storm-herald'],
  10: ['summit', 'lost-lightbearer'],
};
const TIERS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

const live = testContent();
const ids = (c: Content, tier: number) => floorRooms(c, tier).map((r) => r.id);
function withDrafts(on: string[] = []): Content {
  const sets = { ...floorSetsRaw.sets, ...Object.fromEntries(on.map((s) => [s, true])) };
  return loadContent({ ...testRawContent(), rooms: [...testRawContent().rooms, ...draftRooms], floorSets: { ...floorSetsRaw, sets } });
}

describe('L11-B2a: the floor-set switch', () => {
  it('ships with only White Dojo, Sunrise Garden (Yellow, Nov 25) and Ember Kitchens on', () => {
    expect(Object.entries(floorSetsRaw.sets).filter(([, v]) => v).map(([k]) => k)).toEqual(['white-dojo', 'sunrise-garden', 'ember-kitchens']);
    expect(Object.values(SETS).every(([s]) => floorSetsRaw.sets[s as keyof typeof floorSetsRaw.sets] === false)).toBe(true);
  });

  it('with every tier off, the draft rooms change no floor', () => {
    const c = withDrafts();
    for (const t of TIERS) expect(ids(c, t), `tier ${t}`).toEqual(ids(live, t));
  });

  for (const [tier, [set, guardian]] of Object.entries(SETS).map(([t, v]) => [Number(t), v] as const)) {
    it(`turning on ${set} gives tier ${tier} only its own 8 rooms and ${guardian}, and no other tier changes`, () => {
      const c = withDrafts([set]);
      const own = floorRooms(c, tier);
      expect(own.map((r) => r.id).every((id) => id.startsWith(`t${tier}-`))).toBe(true);
      expect(own.map((r) => r.kind).sort()).toEqual(['battle', 'battle', 'battle', 'battle', 'boss', 'challenge', 'rest', 'treasure']);
      const bosses = own.flatMap((r) => r.enemySpawns.map((s) => s.enemy)).filter((e) => c.enemies[e].boss);
      expect([...new Set(bosses)]).toEqual([guardian]);
      for (const t of TIERS.filter((x) => x !== tier)) expect(ids(c, t), `tier ${t}`).toEqual(ids(live, t));
    });
  }

  it('fails safe: a missing file, an unlisted set or a value that is not true leaves that tier on the shared rooms', () => {
    const shared = (c: Content, t: number) => floorRooms(c, t).every((r) => r.floorSet === null);
    const raw = testRawContent();
    const { 'ember-kitchens': _, ...rest } = floorSetsRaw.sets;
    expect(shared(loadContent({ ...raw, floorSets: undefined }), 3)).toBe(true);
    expect(shared(loadContent({ ...raw, floorSets: { sets: rest } }), 3)).toBe(true);
    expect(shared(loadContent({ ...raw, floorSets: { sets: { ...floorSetsRaw.sets, 'ember-kitchens': 'yes' } } }), 3)).toBe(true);
    expect(shared(loadContent({ ...raw, floorSets: 'broken' }), 3)).toBe(true);
    expect(shared(live, 3)).toBe(false);
  });
});
