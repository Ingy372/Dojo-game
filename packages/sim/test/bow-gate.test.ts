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
  it('holds for the whole arrival ("Welcome home" splash included, even in play mode) and shows once after', () => {
    // The arrival splash is not a card and arrive() can run while the mode still reads 'play',
    // so menuOpen alone is false; the arriving flag must hold it (QA #381).
    const frames = [
      { menuOpen: false, arriving: true },
      { menuOpen: true, arriving: true },
      { menuOpen: false, arriving: true },
      { menuOpen: false, arriving: false },
      { menuOpen: false, arriving: false },
    ];
    let shown = false;
    const out = frames.map((f) => {
      const g = bowGate({ due: true, ...f, shown });
      if (g === 'show') shown = true;
      return g;
    });
    expect(out).toEqual(['hold', 'hold', 'hold', 'show', 'idle']);
  });
});
