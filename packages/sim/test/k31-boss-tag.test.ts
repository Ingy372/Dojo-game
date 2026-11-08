import { describe, it, expect } from 'vitest';
import { bossTagLayout, BOSS_TAG, type BossTagInput, type TagBox } from '../src';

const base: BossTagInput = { bossX: 333, headY: 200, feetY: 280, halfW: 40, screenW: 667, minY: 60, maxY: 371 };
const gapOf = (l: { nameTop: number; barY: number }) => l.barY - BOSS_TAG.barH / 2 - (l.nameTop + BOSS_TAG.nameH);
const pairBox = (l: { x: number; nameTop: number; barY: number }, half: number): TagBox => ({ left: l.x - half, right: l.x + half, top: l.nameTop, bottom: l.barY + BOSS_TAG.barH / 2 });
const touches = (a: TagBox, b: TagBox) => a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;

describe('K31 boss name + small bar layout', () => {
  it('sits above the head with a fixed gap when there is room', () => {
    const l = bossTagLayout(base);
    expect(l.below).toBe(false);
    expect(l.x).toBe(333);
    expect(l.barY + BOSS_TAG.barH / 2).toBeLessThanOrEqual(200);
    expect(gapOf(l)).toBe(BOSS_TAG.gap);
  });
  it('moves both below the boss when the head is near the top, same gap, on screen', () => {
    for (const head of [-40, 0, 20, 40, 80]) {
      const l = bossTagLayout({ ...base, headY: head, feetY: head + 80 });
      expect(l.below).toBe(true);
      expect(l.nameTop).toBeGreaterThanOrEqual(Math.max(60, head + 80));
      expect(gapOf(l)).toBe(BOSS_TAG.gap);
    }
  });
  it('edge clamp: one x for the pair, fully on screen at both side edges', () => {
    for (const bossX of [-30, 0, 10, 650, 667, 700]) {
      const l = bossTagLayout({ ...base, bossX });
      expect(l.x - base.halfW).toBeGreaterThanOrEqual(0);
      expect(l.x + base.halfW).toBeLessThanOrEqual(667);
    }
  });
  it('HOME slide: the pair (one x) slides off HOME together', () => {
    const home: TagBox = { left: 310, right: 356, top: 150, bottom: 166 };
    const l = bossTagLayout({ ...base, avoid: [home] });
    expect(touches(pairBox(l, base.halfW), home)).toBe(false);
    expect(l.x).not.toBe(333);
    expect(gapOf(l)).toBe(BOSS_TAG.gap);
  });
  it('below spot avoids COMBO and its +5% power line top-left', () => {
    const combo: TagBox = { left: 16, right: 150, top: 70, bottom: 100 };
    const power: TagBox = { left: 16, right: 120, top: 100, bottom: 116 };
    const l = bossTagLayout({ ...base, bossX: 20, headY: 0, feetY: 70, avoid: [combo, power] });
    expect(l.below).toBe(true);
    const p = pairBox(l, base.halfW);
    expect(touches(p, combo)).toBe(false);
    expect(touches(p, power)).toBe(false);
    expect(p.left).toBeGreaterThanOrEqual(0);
    expect(gapOf(l)).toBe(BOSS_TAG.gap);
  });

  // C430: at 667x375 the thunder-drum banner sat on Virtue / Strike. The action buttons (screen px, +8 px) are avoid boxes too.
  const circle = (cx: number, cy: number, r: number): TagBox => ({ left: cx - r - 8, right: cx + r + 8, top: cy - r - 8, bottom: cy + r + 8 });
  const buttons667: TagBox[] = [
    circle(476, 180, 30), // Virtue
    circle(484, 267, 38), // Strike
    circle(598, 197, 32), // Dash
    circle(593, 301, 50), // Counter
    { left: 365, right: 430, top: 265, bottom: 345 }, // Stance and its name
  ];
  it('C430: the pair keeps clear of every action button wherever the boss stands at 667x375', () => {
    for (let bossX = 20; bossX <= 650; bossX += 30) {
      for (let feet = 120; feet <= 360; feet += 24) {
        const l = bossTagLayout({ ...base, bossX, headY: feet - 60, feetY: feet, halfW: 48, avoid: buttons667 });
        const p = pairBox(l, 48);
        for (const b of buttons667) expect(touches(p, b), `boss ${bossX},${feet}`).toBe(false);
        expect(p.left).toBeGreaterThanOrEqual(0);
        expect(p.right).toBeLessThanOrEqual(667);
        expect(p.top).toBeGreaterThanOrEqual(base.minY);
        expect(p.bottom).toBeLessThanOrEqual(base.maxY);
        expect(gapOf(l)).toBe(BOSS_TAG.gap);
      }
    }
  });
  it('C430: placeBossTag feeds the button boxes to the layout', () => {
    const SRC = import.meta.glob('../../../apps/client/src/scenes/GameScene.ts', { query: '?raw', import: 'default', eager: true }) as Record<string, string>;
    const src = Object.values(SRC)[0];
    const fn = src.slice(src.indexOf('private placeBossTag'));
    expect(fn.slice(0, fn.indexOf('bossTagLayout(')).includes('this.buttonKeepOut()')).toBe(true);
  });
});
