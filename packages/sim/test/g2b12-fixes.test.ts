// G2B12-FIXES: the Green playthrough's small fixes that can be checked without a screen.
import { describe, expect, it } from 'vitest';
import { GEAR_SLOTS, buildTraining, loadFeed, newProfile, seedFakeStudent } from '../src';
import green from '../../../fixtures/4-green-belt.json';
import white from '../../../fixtures/1-white-belt-new.json';
import { gearBoardLayout, gearSheetBox, GEAR_BOARD } from '../../../apps/client/src/ui/gearBoard';
import { systemMayShow } from '../../../apps/client/src/ui/arrivalQueue';
import { testContent } from './load-content';

const content = testContent();
const training = (data: unknown) => {
  const feed = loadFeed(data);
  return buildTraining(feed, content.abilities, { ms: Date.parse(feed.asOf), weekday: 3 });
};

describe('seedFakeStudent (the Green fake profile read as Level 1 with no gear)', () => {
  it('a Green student gets their expected level and one worn Rare per gear slot', () => {
    const t = training(green);
    const p = newProfile();
    expect(p.level).toBe(1);
    expect(seedFakeStudent(p, t, content.loot)).toBe(true);
    expect(p.level).toBe(Math.min(t.expectedLevel, t.levelCap));
    expect(p.level).toBeGreaterThan(1);
    expect(p.inventory).toHaveLength(GEAR_SLOTS.length);
    for (const slot of GEAR_SLOTS) {
      const worn = p.inventory.find((i) => i.uid === p.equipped[slot]);
      expect(worn?.rarity).toBe('rare');
    }
    expect(new Set(p.inventory.map((i) => i.uid)).size).toBe(p.inventory.length);
  });

  it('a White student gets no gear and stays at Level 1', () => {
    const p = newProfile();
    seedFakeStudent(p, training(white), content.loot);
    expect(p.inventory).toHaveLength(0);
    expect(p.level).toBe(1);
  });

  it('is safe to run twice, and the same every time', () => {
    const t = training(green);
    const a = newProfile();
    const b = newProfile();
    seedFakeStudent(a, t, content.loot);
    expect(seedFakeStudent(a, t, content.loot)).toBe(false);
    seedFakeStudent(b, t, content.loot);
    expect(b.inventory).toEqual(a.inventory);
  });

  it('never lowers a level and never touches a bag that has gear', () => {
    const t = training(green);
    const p = newProfile();
    seedFakeStudent(p, t, content.loot);
    const kept = JSON.parse(JSON.stringify(p.inventory));
    p.level = t.levelCap;
    p.inventory.pop();
    p.inventory.pop();
    const before = JSON.parse(JSON.stringify(p.inventory));
    expect(seedFakeStudent(p, t, content.loot)).toBe(false);
    expect(p.level).toBe(t.levelCap);
    expect(p.inventory).toEqual(before);
    expect(kept.length).toBeGreaterThan(before.length);
  });
});

describe('first-visit cards (G2B12-FIXES)', () => {
  it("Welcome Week's new-system card waits until after the very first Dojo visit", () => {
    expect(systemMayShow({ firstVisit: true })).toBe(false);
    expect(systemMayShow({ firstVisit: false })).toBe(true);
  });
});

const src = import.meta.glob(['../../../apps/client/index.html', '../../../apps/client/src/scenes/HomeScene.ts', '../../../apps/client/src/scenes/GameScene.ts', '../../../assets/favicon.*'], { query: '?raw', import: 'default', eager: true }) as Record<string, string>;
const read = (name: string): string => {
  const hit = Object.entries(src).find(([k]) => k.endsWith(name));
  if (!hit) throw new Error(`missing ${name}`);
  return hit[1];
};

describe('the other small fixes stay in place', () => {
  it('the page links a favicon that exists in assets/', () => {
    const html = read('index.html');
    expect(html).toMatch(/rel="icon" href="favicon\.svg"/);
    expect(read('favicon.svg')).toContain('<svg');
    expect(read('favicon.ico').length).toBeGreaterThan(20);
  });
  it('Home no longer shows "Video soon" to students', () => {
    expect(read('scenes/HomeScene.ts')).not.toMatch(/▶ Video soon/);
  });
  it('the door hint is a pinned top-strip label, not a fading world popup', () => {
    const g = read('scenes/GameScene.ts');
    expect(g).toMatch(/this\.doorHint\.setText\(one \?/);
    expect(g).not.toMatch(/floatText\(p\.pos, one \?/);
  });
});

describe('G2B12-FIXES: the gear sheet leaves the Strike row showing', () => {
  it('starts right of the doll column on a wide panel and clears the Strike row', () => {
    const L = gearBoardLayout(564, 332);
    const sb = gearSheetBox(L, 564, 332);
    expect(sb.x).toBe(L.dollW + 8);
    expect(sb.x + sb.w).toBe(564);
    expect(sb.w).toBeGreaterThanOrEqual(GEAR_BOARD.sheetNarrowMin);
  });
  it('stays full width when the narrow sheet would be too small or the Strike row is clear', () => {
    const small = gearBoardLayout(360, 250);
    expect(gearSheetBox(small, 360, 250)).toMatchObject({ x: 0, w: 360 });
    const tall = gearBoardLayout(564, 600);
    expect(gearSheetBox(tall, 564, 600)).toMatchObject({ x: 0, w: 564 });
  });
});
