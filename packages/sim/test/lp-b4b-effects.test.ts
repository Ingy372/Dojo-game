// LP-B4b: the code-drawn effects and wall paint (R-SHOP 3.3). Looks only: they never touch a fight.
import { describe, expect, it } from 'vitest';
import { FX_CAPS, buyLook, loadShopCatalog, newProfile, playerStats, wearLook, wornColors, wornFx, type FxRecipe, type FxSlot } from '../src';
import { FX_DEPTH, STILL_MS, planFx } from '../../../apps/client/src/fx/plan';
import RAW from '../../../content/shop/catalog.json';

const CATALOG = loadShopCatalog(RAW);
const by = (g: string) => CATALOG.items.filter((i) => i.group === g);
const SLOT_OF: Record<string, FxSlot> = { 'walk-trail': 'trail', 'dash-puff': 'puff', 'hit-pop': 'hit', 'win-burst': 'win' };
/** R-SHOP 3.3: belts in list order, and the group price. */
const RSHOP: Record<string, { price: number; belts: number[] }> = {
  'walk-trail': { price: 400, belts: [1, 1, 1, 2, 2, 3, 3, 4, 5, 6] },
  'dash-puff': { price: 200, belts: [1, 1, 1, 1] },
  'hit-pop': { price: 800, belts: [2, 3, 3, 4, 4, 5, 5, 6] },
  'win-burst': { price: 800, belts: [2, 3, 4, 5, 6, 6] },
  'wall-paint': { price: 400, belts: [1, 1, 1, 2, 2, 2] },
};

describe('the effects and wall paint in the catalog', () => {
  it('match R-SHOP 3.3: count, price and the belt each opens at', () => {
    for (const [g, want] of Object.entries(RSHOP)) {
      expect(by(g).map((i) => i.price)).toEqual(want.belts.map(() => want.price));
      expect(by(g).map((i) => i.belt)).toEqual(want.belts);
    }
    // Nov 22: skins, auras, pets and decorations joined the catalog; R-SHOP 3.3's groups keep their counts.
    const rShop = ['gi-dye', 'hair-dye', 'walk-trail', 'dash-puff', 'hit-pop', 'win-burst', 'wall-paint'];
    expect(CATALOG.items.filter((i) => rShop.includes(i.group))).toHaveLength(20 + 10 + 4 + 8 + 6 + 6);
  });

  it('every effect stays inside the caps; wall paint is a colour and no effect', () => {
    for (const [g, slot] of Object.entries(SLOT_OF)) {
      for (const i of by(g)) {
        expect(i.fx, i.id).toBeTruthy();
        expect(i.fx!.count).toBeLessThanOrEqual(FX_CAPS.particles);
        expect(i.fx!.lifeMs).toBeLessThanOrEqual(FX_CAPS.lifeMs[slot]);
      }
    }
    for (const i of by('wall-paint')) {
      expect(i.fx).toBeUndefined();
      expect(i.color).toMatch(/^#[0-9a-f]{6}$/i);
    }
  });

  it('the checker refuses an effect past the caps, a broken recipe, or an effect on a look', () => {
    const trail = by('walk-trail')[0];
    const bad = (fx: Partial<FxRecipe>, it = trail) => () => loadShopCatalog({ ...RAW, items: [{ ...it, fx: { ...trail.fx!, ...fx } }] });
    expect(bad({})).not.toThrow();
    expect(bad({ count: 25 })).toThrow();
    expect(bad({ count: 0 })).toThrow();
    expect(bad({ lifeMs: 801 })).toThrow();
    expect(bad({ shape: 'skull' as never })).toThrow();
    expect(bad({ motion: 'spin' as never })).toThrow();
    expect(bad({ colors: ['red'] })).toThrow();
    expect(bad({ size: 2 })).toThrow();
    expect(bad({}, by('gi-dye')[0])).toThrow(/fx on a look/);
    expect(() => loadShopCatalog({ ...RAW, items: [{ ...trail, fx: undefined }] })).toThrow();
  });
});

describe('playing an effect', () => {
  const rand = () => 0.5;
  const fxItems = CATALOG.items.filter((i) => i.fx);

  it('never shows more than 24 pieces or outlives its cap, and sits under enemy warnings', () => {
    expect(FX_DEPTH).toBeLessThan(1);
    for (const i of fxItems) {
      const slot = SLOT_OF[i.group];
      const plan = planFx(i.fx!, false, rand);
      expect(plan.length).toBeLessThanOrEqual(FX_CAPS.particles);
      for (const p of plan) expect(p.delayMs + p.lifeMs, i.id).toBeLessThanOrEqual(FX_CAPS.lifeMs[slot]);
    }
  });

  it('with Reduced motion: no trail at all, and the rest is one still picture under half a second', () => {
    for (const i of fxItems) {
      const plan = planFx(i.fx!, true, rand);
      if (i.group === 'walk-trail') expect(plan, i.id).toEqual([]);
      else {
        expect(plan.length).toBeGreaterThan(0);
        for (const p of plan) expect(p).toMatchObject({ still: true, delayMs: 0, lifeMs: STILL_MS, x0: p.x1, y0: p.y1 });
      }
    }
    expect(STILL_MS).toBeLessThan(500);
  });
});

describe('wearing them', () => {
  it('each slot holds one; "none" clears it; stats stay the same with everything worn', () => {
    const p = newProfile();
    const before = JSON.stringify(playerStats(p));
    p.coins = 99999;
    for (const id of ['trail-cherry-petals', 'puff-dust-cloud', 'wall-sunrise']) expect(buyLook(p, CATALOG, id, 1)).toBe(true);
    expect(wornFx(p, CATALOG).trail?.shape).toBe('petal');
    expect(wornFx(p, CATALOG).hit).toBeNull();
    expect(wornColors(p, CATALOG).wall).toBe('#f4b183');
    expect(wearLook(p, CATALOG, 'trail', 'puff-dust-cloud')).toBe(false);
    expect(wearLook(p, CATALOG, 'trail', null)).toBe(true);
    expect(wornFx(p, CATALOG).trail).toBeNull();
    for (const i of CATALOG.items) buyLook(p, CATALOG, i.id, 9);
    expect(JSON.stringify(playerStats(p))).toBe(before);
  });
});
