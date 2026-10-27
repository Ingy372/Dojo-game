import { describe, expect, it } from 'vitest';
import { testContent } from './load-content';
import { SKILLS, playRun } from './balance/bot';

describe('enemy mixes', () => {
  const content = testContent();
  /** A room's mix: which enemy types are in it, e.g. "shield+swarmer". */
  const mixOf = (roomId: string) => {
    const room = content.rooms.find((r) => r.id === roomId)!;
    return [...new Set(room.enemySpawns.map((s) => s.enemy))].sort().join('+');
  };

  const mixesAt = (tier?: number) => {
    const mixes = new Set<string>();
    for (let seed = 1; seed <= 5; seed++) {
      const run = playRun(content, seed, 'smart', SKILLS.sharp, 'standard', undefined, undefined, tier === undefined ? {} : { tier });
      for (const r of run.rooms) if (r.kind === 'battle' || r.kind === 'challenge') mixes.add(mixOf(r.roomId));
    }
    return mixes;
  };

  // C-B1-ROOMS: white-belt rooms use only swarmers and shields, so a white floor has fewer mixes.
  it('white belt: at least 2 different mixes over 5 runs, all swarmers and shields only', () => {
    const mixes = mixesAt();
    expect(mixes.size).toBeGreaterThanOrEqual(2);
    for (const m of mixes) for (const e of m.split('+')) expect(['shield', 'swarmer']).toContain(e);
  });

  it('belt 2: shows at least 4 different enemy mixes over 5 runs', () => {
    expect(mixesAt(2).size).toBeGreaterThanOrEqual(4);
  });

  it('keeps hard rooms out of the start of a floor', () => {
    for (let seed = 1; seed <= 5; seed++) {
      const run = playRun(content, seed, 'smart', SKILLS.sharp, 'standard');
      run.rooms.forEach((r, i) => {
        const room = content.rooms.find((x) => x.id === r.roomId)!;
        expect(room.earliestRoom).toBeLessThanOrEqual(i + 1);
      });
    }
  });
});
