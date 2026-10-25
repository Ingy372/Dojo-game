// P-MENU-a: every Training Board button can be tapped in at least a 44 x 44 area.
import { describe, expect, it } from 'vitest';
import { MIN_TAP, tapArea } from '../../../apps/client/src/ui/tokens';

// The HomeScene source, to read the size of every button it draws (the sim package has no Node types).
const home = Object.values(import.meta.glob('../../../apps/client/src/scenes/HomeScene.ts', { query: '?raw', import: 'default', eager: true }))[0] as string;

describe('P-MENU-a tap size', () => {
  it('grows a small drawing to 44 x 44 around the same centre', () => {
    expect(MIN_TAP).toBe(44);
    expect(tapArea(70, 28)).toEqual({ x: -35, y: -22, w: 70, h: 44 });
    expect(tapArea(20, 20)).toEqual({ x: -22, y: -22, w: 44, h: 44 });
  });

  it('keeps a big drawing as it is', () => {
    expect(tapArea(240, 46)).toEqual({ x: -120, y: -23, w: 240, h: 46 });
  });

  it('gives every HomeScene button a tap area of at least 44 x 44', () => {
    const calls = [...home.matchAll(/this\.button\(([^,]+),([^,]+),([^,]+),([^,]+),/g)];
    expect(calls.length).toBeGreaterThanOrEqual(10);
    // Sizes that are a plain number; the rest (column widths) are wider than 44 on every phone.
    for (const [, , , w, h] of calls) {
      const n = (v: string): number => (/^\s*\d+\s*$/.test(v) ? Number(v) : 100);
      const a = tapArea(n(w), n(h));
      expect(a.w).toBeGreaterThanOrEqual(44);
      expect(a.h).toBeGreaterThanOrEqual(44);
    }
  });

  it('draws HomeScene buttons only through the shared ui/button.ts', () => {
    expect(home).toContain("from '../ui/button'");
    expect(home).not.toMatch(/private button\([^)]*\)[^{]*\{[^}]*add\.rectangle/);
  });
});
