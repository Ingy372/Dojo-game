import { describe, expect, it } from 'vitest';
import { ACTION_COLORS, ACTION_LABEL, MIN_TAP, contrast } from '../../../apps/client/src/ui/tokens';

// Vite's glob reads the client source at test time (the sim package has no Node types).
const SRC = import.meta.glob(['../../../apps/client/src/**/*.ts'], { query: '?raw', import: 'default', eager: true }) as Record<string, string>;
const src = (f: string) => SRC[`../../../apps/client/src/${f}`];
const hex = (s: string) => parseInt(s.slice(1), 16);

describe('Q-PREM-F9 action button contrast', () => {
  const pairs: Array<[string, number, string]> = [
    ['COUNTER ready', ACTION_COLORS.counter.ready, ACTION_LABEL.light],
    ['COUNTER flash', ACTION_COLORS.counter.flash, ACTION_LABEL.dark],
    ['COUNTER not ready', ACTION_COLORS.counter.dim, ACTION_LABEL.dim],
    ['STRIKE ready', ACTION_COLORS.strike.ready, ACTION_LABEL.light],
    ['STRIKE not ready', ACTION_COLORS.strike.dim, ACTION_LABEL.dim],
    ['VIRTUE ready', ACTION_COLORS.virtue.ready, ACTION_LABEL.dark],
    ['VIRTUE not ready', ACTION_COLORS.virtue.dim, ACTION_LABEL.dim],
    ['DASH ready', ACTION_COLORS.dash.ready, ACTION_LABEL.light],
    ['DASH not ready', ACTION_COLORS.dash.dim, ACTION_LABEL.dim],
    ['STANCE ready', ACTION_COLORS.stance.ready, ACTION_LABEL.light],
    ['STANCE not ready', ACTION_COLORS.stance.dim, ACTION_LABEL.dim],
  ];
  for (const [name, face, label] of pairs) it(`${name} label is at least 4.5:1`, () => expect(contrast(face, hex(label))).toBeGreaterThanOrEqual(4.5));

  it('each ready colour keeps its family (blue, orange, gold)', () => {
    const rgb = (c: number) => [(c >> 16) & 255, (c >> 8) & 255, c & 255];
    const [cr, , cb] = rgb(ACTION_COLORS.counter.ready); expect(cb).toBeGreaterThan(cr);
    const [sr, sg, sb] = rgb(ACTION_COLORS.strike.ready); expect(sr > sg && sg > sb).toBe(true);
    const [vr, vg, vb] = rgb(ACTION_COLORS.virtue.ready); expect(vr > vg && vg > vb).toBe(true);
  });

  it('ActionButtons uses the tokens (no old faces) and no longer dims by see-through alpha', () => {
    const t = src('input/ActionButtons.ts');
    expect(t).not.toMatch(/0x3a7bd5|0xd5713a|0xb08a3c|0xffb02e|0x5a4a44|0x5a4a34/);
    expect(t).not.toMatch(/(counter|strike|virtue|dash|stance)\.container\.setAlpha\([^1]/);
  });

  it('a missed Counter lockout draws a refill ring', () => {
    expect(src('input/ActionButtons.ts')).toMatch(/p\.counterLockout \/ COMBAT\.counter\.missLockoutTicks/);
  });
});

describe('Q-PREM-F9 Dojo top buttons are at least 44 px tall', () => {
  const t = () => src('scenes/DojoScene.ts');
  for (const label of ["'Done'", 'streetUi.button', "'Put away'", 'CONTENT.named.journalButton', "'Scroll'"]) {
    it(`${label} uses MIN_TAP`, () => {
      const line = t().split('\n').find((l) => l.includes('this.button(') && l.includes(label));
      expect(line, label).toBeTruthy();
      expect(line).toMatch(/, MIN_TAP, /);
    });
  }
  it('Move style uses MIN_TAP too, and the bars fit (8 + 44 + 8)', () => {
    expect(t()).toMatch(/130, MIN_TAP, arrows/);
    expect(MIN_TAP).toBe(44);
    expect(t()).toMatch(/const DECOR_TOP = 60;/);
    expect(t()).toMatch(/const ROW2_Y = 60;/);
  });
  it('the Decorate camera keeps the top wall below the 60 px bar', () => {
    expect(t()).toMatch(/this\.mode === 'decorate' \? DECOR_TOP : TOP\) \/ t/);
  });
});
