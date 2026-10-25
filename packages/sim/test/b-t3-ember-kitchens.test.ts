import { describe, expect, it } from 'vitest';
import { floorRooms } from '../src';
import { testContent } from './load-content';
import { playRun, SKILLS } from './balance/bot';

const content = testContent();
const EMBER = ['ember-pantry', 'oven-row', 'long-table-hall', 'pin-lanes', 'supper-rush', 'spice-cupboard', 'warm-hearth', 'great-hearth'];
/** R-BAL-12 typical Artist at Orange (belt 3), as pinned in r-bal-12-bands.test.ts. */
const ORANGE_TYPICAL = { maxHealth: 332.79, power: 45.85, guard: 33.53 };

describe('B-T3 Ember Kitchens (Orange, tier 3)', () => {
  it('tier 3 uses only the Ember Kitchens rooms', () => {
    expect(floorRooms(content, 3).map((r) => r.id).sort()).toEqual([...EMBER].sort());
  });

  it('other tiers never get Ember Kitchens rooms', () => {
    for (const t of [1, 2, 4, 5]) for (const r of floorRooms(content, t)) expect(EMBER).not.toContain(r.id);
  });

  it('Supper Rush: chest and 90 s challenge (Researcher PR #275, pending Jay)', () => {
    const r = content.rooms.find((x) => x.id === 'supper-rush')!;
    expect(r.challenge?.seconds).toBe(90);
    expect(r.challenge?.text).toBe('Clear the room in 90 seconds for a better chest!');
  });

  it('Supper Rush: in-time and out-of-time words come from content, and a missed time still earns a chest', () => {
    const r = content.rooms.find((x) => x.id === 'supper-rush')!;
    expect(r.challenge?.inTimeText).toBe('In time!');
    expect(r.challenge?.outOfTimeText).toBe("Time's up! The soup cooled, but you still earned a chest.");
    expect(r.challenge?.outOfTimeShort).toBe("Time's up!");
    expect(r.chest).toBeTruthy();
    expect(content.loot.chests.challenge.items).toBeGreaterThan(0);
  });

  it('Dough Blob splits into Doughlings; Hearth Cook has phases', () => {
    expect(content.enemies['dough-blob'].split).toEqual({ into: 'doughling', count: 2 });
    expect(content.enemies['hearth-cook'].phases?.length).toBeGreaterThan(1);
    expect(content.enemies['rolling-pin'].attacks.every((a) => a.counterable === false)).toBe(true);
  });

  for (const difficulty of ['standard', 'challenge'] as const) {
    it(`Orange typical player reaches and beats the Hearth Cook (${difficulty})`, () => {
      const N = 30;
      let reached = 0;
      let beat = 0;
      for (let seed = 1; seed <= N; seed++) {
        const r = playRun(content, seed, 'smart', SKILLS.typical, difficulty, ORANGE_TYPICAL, undefined, { tier: 3 });
        for (const room of r.rooms) expect(EMBER).toContain(room.roomId);
        const boss = r.rooms.find((x) => x.roomId === 'great-hearth');
        if (boss) {
          reached++;
          if (!boss.died) beat++;
        }
      }
      expect(reached).toBe(N);
      expect(beat / N).toBeGreaterThanOrEqual(0.8);
    }, 120000);
  }
});
