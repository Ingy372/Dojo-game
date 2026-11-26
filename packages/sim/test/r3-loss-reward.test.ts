// R3-1 (Jay, Nov 25: "Small reward on loss"): a lost run always pays a little XP, never more than clearing a room.
import { describe, expect, it } from 'vitest';
import { PROGRESSION, runXp, type RunSummary } from '../src';
import { buildLastRun, lastRunLayout } from '../../../apps/client/src/ui/lastRun';

const run = (result: RunSummary['result'], kinds: string[] = [], test = false) =>
  ({ result, test, results: kinds.map((kind) => ({ kind })) }) as unknown as RunSummary;

describe('R3-1 loss reward', () => {
  it('a run lost in the first room pays the small loss XP', () => {
    expect(runXp(run('lost'))).toBe(PROGRESSION.xpLoss);
    expect(PROGRESSION.xpLoss).toBeGreaterThan(0);
  });

  it('the loss XP is smaller than one cleared battle room', () => {
    expect(PROGRESSION.xpLoss).toBeLessThan(PROGRESSION.xpPerRoom.battle);
  });

  it('a lost run adds the loss XP on top of the rooms it cleared', () => {
    expect(runXp(run('lost', ['battle']))).toBe(PROGRESSION.xpPerRoom.battle + PROGRESSION.xpLoss);
  });

  it('a rest, a win and a test-link loss pay no loss XP', () => {
    expect(runXp(run('rested'))).toBe(0);
    expect(runXp(run('cleared', ['battle']))).toBe(PROGRESSION.xpPerRoom.battle + PROGRESSION.xpFloorClear);
    expect(runXp(run('lost', [], true))).toBe(0);
  });
});

describe('R3-1 coins on the run scroll', () => {
  const last = (coins?: number) =>
    ({ summary: { result: 'lost', roomsCleared: 0, totalRooms: 6, results: [], items: [], perfects: 0, bestCombo: 4, ticks: 300, sGrades: 0, insights: [] }, newBests: [], coins, xp: { gained: 12, levelsGained: 0 } }) as never;

  it('a lost run shows its coins as the 4th tile, so even a narrow scroll shows them', () => {
    const keys = buildLastRun(last(60), 'Rest').stats.map((s) => s.key);
    expect(keys).toEqual(['rooms', 'perfects', 'combo', 'coins', 'xp', 'time']);
    expect(buildLastRun(last(60), 'Rest').stats[3].format(60)).toBe('+60');
  });

  it('a run that paid nothing (a test link) shows no coins tile', () => {
    expect(buildLastRun(last(0), 'Rest').stats.map((s) => s.key)).not.toContain('coins');
  });

  it('wide scrolls fit all 6 tiles; narrow ones 4', () => {
    expect(lastRunLayout(640, 400, 6, 6, 0).tiles).toHaveLength(6);
    expect(lastRunLayout(500, 400, 6, 6, 0).tiles).toHaveLength(5);
    expect(lastRunLayout(380, 400, 6, 6, 0).tiles).toHaveLength(4);
  });
});
