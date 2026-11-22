// Fixes from the overnight playthrough of Nov 22 (docs/reviews/playtest-2026-11-22.md).
import { describe, expect, it } from 'vitest';

const files = import.meta.glob('../../../apps/client/src/**/*.ts', { query: '?raw', import: 'default', eager: true }) as Record<string, string>;
const src = (f: string) => files[`../../../apps/client/src/${f}`];

describe('playtest Nov 22', () => {
  it('a quick tap in the stick area walks there (it used to do nothing)', () => {
    const t = src('input/TouchControls.ts');
    expect(t).toMatch(/const QUICK_TAP_MS = 250;/);
    expect(t).toMatch(/const QUICK_TAP_SLOP = 14;/);
    // on letting go of the stick, a quick, still press queues a walk to that spot
    expect(t).toMatch(/if \(isQuickTap\(this\.scene\.time\.now - this\.stickDown\.at, this\.stickDown\.moved\)\) this\.queueTap\(pointer\);/);
    expect(t).toMatch(/return heldMs <= QUICK_TAP_MS && movedPx <= QUICK_TAP_SLOP;/);
  });
});
