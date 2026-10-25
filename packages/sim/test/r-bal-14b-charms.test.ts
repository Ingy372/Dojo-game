import { describe, expect, it } from 'vitest';
import { modsFrom, type Effect } from '../src/effects';
import { TICKS_PER_SECOND } from '../src/config';
import draft from '../../../drafts/content/loot/gear.json';
import insights from '../../../content/insights/insights.json';

// R-BAL-14b: the #237 charm amounts, as the game reads them.
type Charm = { id: string; text: string; slot: string; effect: { type: string; below?: number }; amounts: number[] };
const charms = (draft.items as unknown as Charm[]).filter((i) => i.slot === 'charm');
const charm = (id: string) => charms.find((c) => c.id === id)!;
const mods = (c: Charm, i: number) => modsFrom([{ ...c.effect, amount: c.amounts[i] } as Effect], TICKS_PER_SECOND);
const raw = (p: string) => Object.values(import.meta.glob(['../src/world.ts', '../../../drafts/content/tools/check-c7.py'], { query: '?raw', import: 'default', eager: true }) as Record<string, string>).find((s) => s.includes(p))!;

describe('R-BAL-14b charm amounts', () => {
  it('Kind Stone multiplies low-health Focus by 1 + amount', () => {
    expect([0, 1, 2, 3].map((i) => mods(charm('red-black-charm-1'), i).lowHealthFocusScale)).toEqual([1.25, 1.5, 1.75, 2]);
  });
  it('Rally (Insight) keeps x2 with the extra-share rule', () => {
    const rally = insights.insights.find((x: { id: string }) => x.id === 'rally')!;
    expect(modsFrom([rally.effect as Effect], TICKS_PER_SECOND).lowHealthFocusScale).toBe(2);
  });
  it('Great Lamp fully recharges DASH on a block at every rarity', () => {
    for (let i = 0; i < 4; i++) expect(mods(charm('black-charm-1'), i).dashOnBlock).toBe(true);
    expect(charm('black-charm-1').amounts).toEqual([1, 1, 1, 1]);
    expect(raw('function counterWindowTicks')).toMatch(/if \(p\.mods\.dashOnBlock\) p\.dashCooldown = 0;/);
  });
  it('Feather adds 1 COUNTER window tick at every rarity, with the kid text kept', () => {
    for (let i = 0; i < 4; i++) expect(mods(charm('brown-black-charm-1'), i).counterWindow).toBe(1);
    expect(charm('brown-black-charm-1').text).toBe('COUNTER window lasts a little longer');
    expect(raw('function counterWindowTicks')).toMatch(/counterWindowTicks \+ p\.counterBonusTicks \+ p\.mods\.counterWindow/);
  });
  it('check-c7 accepts whole-tick COUNTER charms without {n} or {pct}', () => {
    for (const c of charms.filter((x) => x.effect.type === 'counterWindow')) expect(c.amounts.every((a) => Number.isInteger(a) && a >= 1)).toBe(true);
    for (const c of charms.filter((x) => x.effect.type !== 'counterWindow')) expect(c.text).toMatch(/\{(n|pct)\}/);
    const py = raw('C7 check');
    expect(py).toMatch(/ticks = i\["effect"\]\["type"\] == "counterWindow" and all\(isinstance\(a, int\) and a >= 1/);
    expect(py).toMatch(/if not ticks and not re\.search/);
  });
});
