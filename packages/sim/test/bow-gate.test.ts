import { describe, expect, it } from 'vitest';
import { bowGate } from '../../../apps/client/src/ui/bowGate';

describe('bowGate (Q-BOW-OVER-MENU)', () => {
  it('holds while a menu is open, shows once it closes, and never twice', () => {
    let shown = false;
    const frames = [true, true, false, false, true, false];
    const shows: number[] = [];
    frames.forEach((menuOpen, i) => {
      const g = bowGate({ due: true, menuOpen, shown });
      if (i < 2) expect(g).toBe('hold');
      if (g === 'show') { shows.push(i); shown = true; }
    });
    expect(shows).toEqual([2]);
  });
  it('does nothing when no bow is due', () => {
    expect(bowGate({ due: false, menuOpen: false, shown: false })).toBe('idle');
  });
});
