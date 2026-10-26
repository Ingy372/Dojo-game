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

  it('shows at least 4 different enemy mixes over 5 runs', () => {
    const mixes = new Set<string>();
    for (let seed = 1; seed <= 5; seed++) {
      const run = playRun(content, seed, 'smart', SKILLS.sharp, 'standard');
      for (const r of run.rooms) if (r.kind === 'battle' || r.kind === 'challenge') mixes.add(mixOf(r.roomId));
    }
    expect(mixes.size).toBeGreaterThanOrEqual(4);
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
