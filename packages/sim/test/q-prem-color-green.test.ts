import { describe, expect, it } from 'vitest';
import { GREEN, contrast } from '../../../apps/client/src/ui/tokens';

// Vite's glob reads the client source at test time (the sim package has no Node types).
const SRC = import.meta.glob(['../../../apps/client/src/**/*.ts'], { query: '?raw', import: 'default', eager: true }) as Record<string, string>;
const src = (f: string) => SRC[`../../../apps/client/src/${f}`];

describe('Q-PREM-COLOR shared green', () => {
  it('is #277a56', () => expect(GREEN).toBe(0x277a56));

  it('is at least 4.5:1 behind white and cream text', () => {
    expect(contrast(GREEN, 0xffffff)).toBeGreaterThanOrEqual(4.5);
    expect(contrast(GREEN, 0xfff6e0)).toBeGreaterThanOrEqual(4.5);
  });

  it('the old faint green #3aa57a is gone from the client', () => {
    expect(Object.keys(SRC).length).toBeGreaterThan(20);
    const hits = Object.keys(SRC).filter((f) => /3aa57a/i.test(SRC[f]));
    expect(hits).toEqual([]);
  });

  it('the 8 files that used it now use GREEN (26 uses)', () => {
    const want: Record<string, number> = {
      'scenes/DojoScene.ts': 13, 'scenes/StreetSmartsScene.ts': 4, 'scenes/HomeScene.ts': 2, 'ui/RunOverCard.ts': 2,
      'scenes/CreateScene.ts': 1, 'scenes/TitleScene.ts': 1, 'input/ActionButtons.ts': 1, 'ui/TestingPanel.ts': 1,
    };
    for (const [f, n] of Object.entries(want)) {
      const text = src(f);
      expect((text.match(/\bGREEN\b/g) ?? []).length - 1, f).toBe(n);
    }
  });
});
