// P-MENU2-g: the Last run "Scroll of the Climb".
import { describe, expect, it } from 'vitest';
import { newProfile, type GearItem, type Profile } from '../src';
import { COUNT_KEY, LASTRUN_WORDS, bestsRows, buildLastRun, countAt, foundPage, lastRunLayout, newForYou, runId, takeCountUp, type KeyStore } from '../../../apps/client/src/ui/lastRun';
import { MIN_TAP, S2, TYPE } from '../../../apps/client/src/ui/tokens';

const src = Object.values(import.meta.glob(['../../../apps/client/src/scenes/HomeScene.ts'], { query: '?raw', import: 'default', eager: true }))[0] as string;
const run = src.slice(src.indexOf('private renderRun('), src.indexOf('private turnFound('));

const store = (): KeyStore & { m: Map<string, string> } => {
  const m = new Map<string, string>();
  return { m, getItem: (k) => m.get(k) ?? null, setItem: (k, v) => void m.set(k, v) };
};
const item = (i: number, rarity: GearItem['rarity'] = 'common'): GearItem => ({ uid: `I${i}`, base: 'test', name: `Thing ${i}`, slot: 'hands', rarity, stats: { power: 1, maxHealth: 0, guard: 0 }, effect: null, effectText: '' }) as GearItem;
const withRun = (items: GearItem[], extra: Partial<NonNullable<Profile['lastRun']>> = {}): Profile => {
  const p = newProfile();
  p.runsPlayed = 3;
  p.lastRun = { summary: { result: 'lost', roomsCleared: 3, totalRooms: 6, results: [], items, perfects: 7, bestCombo: 12, ticks: 5200, sGrades: 1, insights: [], decorations: ['lantern'] } as never, newBests: ['mostPerfects'], ...extra };
  return p;
};
// Panel inner content sizes at 667×375, 844×390 and 932×430 (panel minus padding and scroll ends).
const SIZES: Array<[number, number]> = [[325, 265], [456, 280], [544, 320]];

describe('P-MENU2-g count-up', () => {
  it('runs once per run, never on reopen', () => {
    const s = store();
    const id = runId(withRun([]));
    expect(takeCountUp(s, id, false)).toBe(true);
    expect(s.m.get(COUNT_KEY)).toBe(id);
    expect(takeCountUp(s, id, false)).toBe(false);
    expect(takeCountUp(s, id, false)).toBe(false);
    const next = withRun([]);
    next.runsPlayed = 4;
    expect(takeCountUp(s, runId(next), false)).toBe(true);
  });
  it('Reduced motion shows final values at once (and still remembers the run)', () => {
    const s = store();
    expect(takeCountUp(s, 'a', true)).toBe(false);
    expect(takeCountUp(s, 'a', false)).toBe(false);
    expect(takeCountUp(null, 'a', false)).toBe(false);
  });
  it('counts land exactly on the target', () => {
    expect(countAt(7, 0)).toBe(0);
    expect(countAt(7, 1)).toBe(7);
    expect(countAt(7, 0.5)).toBeLessThan(7);
  });
  it('the scene draws final values when not counting', () => {
    expect(run).toMatch(/st\.format\(count \? 0 : st\.value\)/);
    expect(run).toMatch(/takeCountUp\(safeStore\(\), runId\(this\.profile\), reducedMotion\(\)\)/);
  });
});

describe('P-MENU2-g found strip', () => {
  it('every found item and dojo piece is a tile, across pages', () => {
    const items = Array.from({ length: 23 }, (_, i) => item(i, (['common', 'rare', 'legendary'] as const)[i % 3]));
    const m = buildLastRun(withRun(items).lastRun!, 'Rest');
    expect(m.found.length).toBe(24);
    for (const [w, h] of SIZES) {
      const L = lastRunLayout(w, h, 6, m.stats.length, m.found.length);
      const seen: unknown[] = [];
      const { pages } = foundPage(m.found, L.foundPerPage, 0);
      for (let p = 0; p < pages; p++) seen.push(...foundPage(m.found, L.foundPerPage, p).tiles);
      expect(seen).toEqual(m.found);
      expect(L.foundTile).toBeGreaterThanOrEqual(MIN_TAP);
      expect(L.arrows).toBe(true);
    }
    expect(m.found[0]).toMatchObject({ kind: 'item', item: { rarity: 'legendary' } });
  });
  it('each tile has a tap that opens a sheet', () => {
    expect(run).toMatch(/onTap: \(\) => this\.openFound\(f\)/);
  });
});

describe('P-MENU2-g layout at 667, 844 and 932', () => {
  for (const [w, h] of SIZES) {
    for (const found of [0, 3, 30]) {
      it(`${w}×${h}, ${found} found: everything fits, taps ≥ 44`, () => {
        const L = lastRunLayout(w, h, 6, 5, found);
        const boxes = [L.banner, L.bests, ...L.tiles, L.bar, L.found, L.newCard, L.again];
        for (const b of boxes) {
          expect(b.x).toBeGreaterThanOrEqual(0);
          expect(b.y).toBeGreaterThanOrEqual(0);
          expect(b.x + b.w).toBeLessThanOrEqual(w + 0.01);
          expect(b.y + b.h).toBeLessThanOrEqual(h + 0.01);
        }
        for (const b of [L.bests, L.newCard, L.again]) expect(Math.min(b.w, b.h)).toBeGreaterThanOrEqual(MIN_TAP);
        expect(L.newCard.y + L.newCard.h).toBeLessThanOrEqual(L.again.y);
        expect(L.found.x + L.found.w).toBeLessThan(L.newCard.x);
        expect(L.perAlways).toBeGreaterThan(0);
        expect(L.alwaysY + L.alwaysIcon).toBeLessThanOrEqual(h);
        for (const t of L.tiles) expect(t.w).toBeGreaterThanOrEqual(64);
        expect(L.tiles.length).toBe(w < 420 ? 4 : 5);
      });
    }
  }
  it('no text under 12', () => {
    const sizes = [...run.matchAll(/TYPE\.(\w+)/g)].map((x) => (TYPE as Record<string, number>)[x[1]]);
    expect(Math.min(...sizes)).toBeGreaterThanOrEqual(12);
    expect(run).not.toMatch(/this\.text\([^;]*,\s*(\d|1[01])\s*,\s*'#/);
    // Every oneLine() floor is a TYPE token (12+), never a bare number.
    const floors = [...run.matchAll(/this\.oneLine\(.*, ([\w.]+)\);$/gm)].map((x) => x[1]);
    expect(floors.length).toBeGreaterThan(0);
    for (const f of floors) expect(f).toMatch(/^TYPE\./);
    expect(S2).toBe(8);
  });
});

describe('P-MENU2-g New for you', () => {
  const cubbies = [{ id: 'a', earned: true }, { id: 'b', earned: true }, { id: 'c', earned: false }];
  it('only when a trophy is earned and not yet seen', () => {
    expect(newForYou(cubbies, ['a', 'b'])).toBeNull();
    expect(newForYou(cubbies, ['a'])?.id).toBe('b');
    expect(newForYou(cubbies, [])?.id).toBe('a');
    expect(newForYou([{ id: 'c', earned: false }], [])).toBeNull();
    expect(newForYou(cubbies, null)).toBeNull();
  });
  it('the scene draws it only when there is one', () => {
    expect(run).toMatch(/const fresh = newForYou\(this\.trophyCubbies\(\), this\.profile\.trophiesSeen\);\s*if \(fresh\)/);
  });
});

describe('P-MENU2-g words', () => {
  it('kind words, personal bests only, Again! starts a climb', () => {
    const m = buildLastRun(withRun([]).lastRun!, 'Rest');
    expect(m.headline).toBe('You reached room 4 of 6!');
    const all = JSON.stringify(LASTRUN_WORDS).toLowerCase();
    for (const bad of ['fail', 'lost', 'lose', 'streak', 'rank', 'friends', 'others', 'beat your', 'don\'t miss']) expect(all.replace(/"notes":"[^"]*"/, '')).not.toMatch(new RegExp(`\\b${bad}`));
    const rows = bestsRows(withRun([]).bests, ['mostPerfects'], true);
    expect(rows.map((r) => r.key)).toEqual(['fastestClearTicks', 'mostPerfects', 'longestCombo', 'mostSGrades']);
    expect(rows.find((r) => r.isNew)?.key).toBe('mostPerfects');
    expect(run).toMatch(/LASTRUN_WORDS\.again[^\n]*this\.enterTower\(\)/);
  });
});
