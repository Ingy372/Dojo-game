import { describe, expect, it } from 'vitest';
import { LOOT, restoreRun, startRun, summarizeRun } from '../src';
import { testContent } from './load-content';

const content = testContent();

describe('saving a run in progress (M7-P11)', () => {
  it('a run saved as JSON comes back the same and keeps playing the same way', () => {
    const run = startRun(content, { seed: 11, dryRuns: LOOT.guaranteedRareOnRun - 1 });
    run.depth = 3;
    run.loot.push({ ...(run.loot[0] ?? { id: 'x' }) } as never);
    const back = restoreRun(content, JSON.parse(JSON.stringify(run)));
    expect(back).toEqual(run);
    expect(summarizeRun(back!)).toEqual(summarizeRun(run));
  });

  it('refuses anything it cannot play on', () => {
    const run = startRun(content, { seed: 11, dryRuns: 0 });
    expect(restoreRun(content, null)).toBeNull();
    expect(restoreRun(content, 'nope')).toBeNull();
    expect(restoreRun(content, { ...run, status: 'cleared' })).toBeNull();
    expect(restoreRun(content, { ...run, roomId: 'a-room-that-was-removed' })).toBeNull();
    expect(restoreRun(content, { ...run, loot: undefined })).toBeNull();
  });

  it('an older save without wrapUp still loads', () => {
    const run = startRun(content, { seed: 11, dryRuns: 0 }) as unknown as Record<string, unknown>;
    delete run.wrapUp;
    expect(restoreRun(content, run)?.wrapUp).toBe(false);
  });
});
