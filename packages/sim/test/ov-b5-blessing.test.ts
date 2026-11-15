// OV-B5 (review 8.6): the Dojo Blessing is counted in Tower runs, never hours.
import { describe, expect, it } from 'vitest';
import { BLESSING, creditBlessing, loadProfile, newBlessing, newProfile, readBlessing, useBlessing } from '../src';
import words from '../../../content/settings/blessing.json';

const client = import.meta.glob('../../../apps/client/src/**/*.ts', { query: '?raw', import: 'default', eager: true }) as Record<string, string>;

describe('OV-B5 Blessing in runs', () => {
  it('a new save starts with no Blessing; the first check gives one class worth, quietly', () => {
    const b = newProfile().blessing;
    expect(b).toEqual({ runs: 0, counted: null });
    expect(creditBlessing(b, ['2026-11-10T18:00:00', '2026-11-12T18:00:00'])).toBeNull();
    expect(b.runs).toBe(BLESSING.runsPerClass);
    const none = newBlessing();
    expect(creditBlessing(none, [])).toBeNull();
    expect(none.runs).toBe(0);
  });

  it('each new class date adds 5 runs, the same day twice counts once, and it holds at most 10', () => {
    const b = { runs: 0, counted: ['2026-11-10'] };
    expect(creditBlessing(b, ['2026-11-10', '2026-11-12T18:00:00', '2026-11-12T19:00:00'])).toBe(5);
    expect(b.runs).toBe(5);
    expect(creditBlessing(b, ['2026-11-10', '2026-11-12'])).toBeNull();
    expect(creditBlessing(b, ['2026-11-10', '2026-11-12', '2026-11-13', '2026-11-14'])).toBe(5);
    expect(b.runs).toBe(BLESSING.maxRuns);
    // Already full: the class counts but adds nothing (the celebration shows the full line).
    expect(creditBlessing(b, ['2026-11-15'])).toBe(0);
    expect(b.runs).toBe(10);
  });

  it('each counted run uses one; missing class takes nothing away', () => {
    const b = { runs: 2, counted: [] };
    expect(useBlessing(b)).toBe(true);
    expect(useBlessing(b)).toBe(true);
    expect(useBlessing(b)).toBe(false);
    expect(b.runs).toBe(0);
    const kept = { runs: 3, counted: ['2026-01-01'] };
    creditBlessing(kept, []);
    expect(kept.runs).toBe(3);
  });

  it('old saves load with no Blessing record, and bad values are clamped', () => {
    const old = JSON.parse(JSON.stringify(newProfile())) as Record<string, unknown>;
    delete old.blessing;
    expect(loadProfile(old).blessing).toEqual({ runs: 0, counted: null });
    expect(readBlessing({ runs: 99, counted: ['a', 3] })).toEqual({ runs: 10, counted: ['a'] });
  });

  it('shows no clock text anywhere', () => {
    const clock = /\d+\s*h left|48 hours|blessingEndsMs|BLESSING\.hours/;
    for (const [file, src] of Object.entries(client)) expect(clock.test(src), file).toBe(false);
    for (const [key, line] of Object.entries(words)) if (!key.startsWith('_')) expect(/hour|\d+\s*h\b/i.test(line)).toBe(false);
    expect(words.celebration).toBe('Dojo Blessing for your next five runs!');
  });
});
