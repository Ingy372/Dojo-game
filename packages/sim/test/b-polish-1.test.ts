import { describe, expect, it } from 'vitest';
import { lastRunItemsFit, lastRunMoreLabel, showEmptyBagHint } from '../../../apps/client/src/ui/tokens';

describe('B-POLISH-1', () => {
  it('empty-bag hint hides while a worn-item sheet is open', () => {
    expect(showEmptyBagHint(0, false)).toBe(true);
    expect(showEmptyBagHint(0, true)).toBe(false);
    expect(showEmptyBagHint(3, false)).toBe(false);
  });

  it('Last run says "N items in your Gear" when no item row fits, "+N more" otherwise', () => {
    expect(lastRunMoreLabel(8, 0)).toBe('8 items in your Gear');
    expect(lastRunMoreLabel(1, 0)).toBe('1 item in your Gear');
    expect(lastRunMoreLabel(8, 3)).toBe('+5 more in your Gear');
    expect(lastRunMoreLabel(8, 8)).toBeNull();
    // A tight panel (667x375-like) fits no rows: the label must not say "+N more".
    const fit = lastRunItemsFit(200, 230, 19, 8);
    expect(fit).toBe(0);
    expect(lastRunMoreLabel(8, fit)).not.toMatch(/^\+/);
  });
});
