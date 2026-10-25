// P-MENU-b: the Training Board redraws only the panel on tab, page and gear taps.
import { describe, expect, it } from 'vitest';
import { MOTION, panelSwap } from '../../../apps/client/src/ui/tokens';

const home = Object.values(import.meta.glob('../../../apps/client/src/scenes/HomeScene.ts', { query: '?raw', import: 'default', eager: true }))[0] as string;
const body = (name: string) => {
  const i = home.indexOf(`  private ${name}(`);
  return home.slice(i, home.indexOf('\n  }\n', i));
};

describe('P-MENU-b panel swap', () => {
  it('a tab slides 12 pt and a page 24 pt in its direction, over 180 ms', () => {
    expect(panelSwap('tab', false)).toEqual({ dx: 12, fromAlpha: 0, ms: 180, ease: 'Cubic.Out' });
    expect(panelSwap('pageNext', false)?.dx).toBe(24);
    expect(panelSwap('pagePrev', false)?.dx).toBe(-24);
    expect(MOTION.swap.ms).toBe(180);
  });
  it('Reduced motion: no slide, only a 120 ms fade', () => {
    for (const c of ['tab', 'pageNext', 'pagePrev'] as const) expect(panelSwap(c, true)).toEqual({ dx: 0, fromAlpha: 0, ms: 120, ease: 'Linear' });
  });
  it('first draw, gear pick, Wear and Let go are instant', () => {
    expect(panelSwap('none', false)).toBeNull();
    expect(panelSwap('none', true)).toBeNull();
  });
});

describe('P-MENU-b: tab, page and gear taps redraw only the panel', () => {
  it.each(['setTab', 'turn', 'wear', 'letGo'])('%s never redraws the whole screen', (fn) => {
    const b = body(fn);
    expect(b).toMatch(/this\.renderPanel\(/);
    expect(b).not.toMatch(/this\.render\(\)|renderShell/);
  });
  it('a tab tap slides the underline and swaps the panel', () => {
    expect(body('setTab')).toMatch(/this\.renderTabs\(true\);\s*this\.renderPanel\('tab'\)/);
  });
  it('a gear card pick redraws the panel instantly', () => {
    expect(home).toMatch(/this\.confirmLetGo = false;\s*this\.renderPanel\('none'\)/);
  });
  it('the old panel (and its tweens) goes before a new one is drawn, so a double tap leaves one panel', () => {
    const b = body('renderPanel');
    expect(b.indexOf('this.panel.destroy(true)')).toBeGreaterThan(-1);
    expect(b.indexOf('killTweensOf(this.panel)')).toBeLessThan(b.indexOf('this.panel.destroy(true)'));
    expect(b.indexOf('this.panel.destroy(true)')).toBeLessThan(b.indexOf('this.add.container'));
  });
  it('the shell no longer draws tabs or panel contents', () => {
    const b = body('renderShell');
    expect(b).not.toMatch(/renderGear|renderRun|renderGate|renderAbilities|setTab/);
  });
});
