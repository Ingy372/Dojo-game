// R-INSIGHT-BAL layer 1: the Insight card numbers stay inside the caps the sim proved. No sim runs here;
// the slow check is balance/insight-budget.test.ts (BALANCE=1).
import { describe, expect, it } from 'vitest';
import { modsFrom, type Effect, type InsightDef } from '../src';
import { PLACEHOLDER_CARDS } from './balance/insight-sim';
import { testContent } from './load-content';

const cards = testContent().insights;

/**
 * One row per card: the proven cap for each effect number. `max` numbers may not go above it, `min` numbers may not go below it
 * (Wind Step's "every N hits" gets weaker as N grows). Numbers not listed (Ripple Counter's radius) are not capped.
 * A card is allowed to be a bit weaker than its cap; to make one stronger, re-run `BALANCE=1 npm run balance`
 * (insight-budget.test.ts), then update this table with the new PE.
 */
type Cap = { type: Effect['type']; max?: Partial<Record<'amount' | 'seconds' | 'focusOnBreak', number>>; min?: Partial<Record<'everyHits', number>> };
const CAPS: Record<string, Cap> = {
  'ripple-counter': { type: 'rippleCounter', max: { amount: 1.2 } },
  'iron-skin': { type: 'blockReflect', max: { amount: 1.2 } },
  'wind-step': { type: 'comboSpeed', max: { amount: 0.3, seconds: 3 }, min: { everyHits: 7 } },
  'double-strike': { type: 'strikeExtraHit', max: { amount: 0.2 } },
  'quick-hands': { type: 'attackSpeed', max: { amount: 0.2 } },
  'press-the-advantage': { type: 'staggerBonus', max: { amount: 0.3 } },
  'shield-breaker': { type: 'shieldBreaker', max: { focusOnBreak: 7 } },
  'heavy-hands': { type: 'powerScale', max: { amount: 0.2 } },
  rally: { type: 'lowHealthFocus', max: { amount: 0.75 } },
  // Virtue placeholders (after the beta). They are checked when the real cards arrive under these ids.
  'calm-breath': { type: 'focusGain', max: { amount: 0.15 } },
  'steady-start': { type: 'startFocus', max: { amount: 40 } },
};
const PLACEHOLDER_IDS = PLACEHOLDER_CARDS.map((c) => c.id);
const RERUN = 'Re-run `BALANCE=1 npm run balance` (test/balance/insight-budget.test.ts) and update the CAPS table with the new PE.';

describe('R-INSIGHT-BAL layer 1: Insight caps', () => {
  const all: InsightDef[] = [...cards, ...PLACEHOLDER_CARDS.filter((p) => !cards.some((c) => c.id === p.id))];

  it.each(all.map((c) => [c.id, c] as const))('%s is inside its cap', (id, card) => {
    const cap = CAPS[id];
    expect(cap, `"${id}" has no row in CAPS. Add one after a BALANCE=1 run.`).toBeDefined();
    expect(card.effect.type, `${id}: the effect type changed, so its cap no longer applies. ${RERUN}`).toBe(cap.type);
    for (const [k, limit] of Object.entries(cap.max ?? {})) {
      const v = (card.effect as unknown as Record<string, number | undefined>)[k];
      expect(v ?? 0, `${id}.${k} is ${v}, over its cap ${limit}. ${RERUN}`).toBeLessThanOrEqual(limit);
    }
    for (const [k, limit] of Object.entries(cap.min ?? {})) {
      const v = (card.effect as unknown as Record<string, number | undefined>)[k];
      expect(v, `${id}.${k} is ${v}, under its minimum ${limit}. ${RERUN}`).toBeGreaterThanOrEqual(limit);
    }
  });

  it('card ids are unique, and the CAPS table and the content list the same cards (placeholders may be missing until Virtue ships)', () => {
    const ids = cards.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids.filter((id) => !(id in CAPS)), 'cards with no CAPS row').toEqual([]);
    expect(Object.keys(CAPS).filter((id) => !ids.includes(id) && !PLACEHOLDER_IDS.includes(id)), 'CAPS rows with no card').toEqual([]);
  });

  it('every family has at least 2 cards, except Virtue until its real cards ship', () => {
    const count = (f: string) => cards.filter((c) => c.family === f).length;
    for (const f of ['rooted', 'flowing', 'power']) expect(count(f), `family ${f}`).toBeGreaterThanOrEqual(2);
    // Expected exception: Virtue has only Rally before the beta. This line fails once Virtue has 2 cards, to retire the exception.
    expect(count('virtue'), 'Virtue now has 2 cards: delete this exception and test it like the others').toBeLessThan(2);
  });

  it('all the cards together cannot reach a stacking limit in effects.ts', () => {
    const effects = all.map((c) => c.effect);
    // Wind Step's burst also speeds basic attacks by half its bonus (rule A).
    const attackSpeed = effects.reduce((s, e) => s + (e.type === 'attackSpeed' ? e.amount : 0) + (e.type === 'comboSpeed' ? e.amount / 2 : 0), 0);
    expect(attackSpeed, 'attack speed from cards alone, before stances and gear, against the 0.6 cap').toBeLessThan(0.6);
    const disarm = effects.reduce((s, e) => s + (e.type === 'disarm' ? e.amount : 0), 0);
    expect(disarm, 'disarm from cards against the 0.9 cap').toBeLessThan(0.9);
    // The game's own sum (which clips at the cap) gives the same number, so nothing is clipped.
    expect(modsFrom(effects, 20).attackSpeed).toBeCloseTo(effects.reduce((s, e) => s + (e.type === 'attackSpeed' ? e.amount : 0), 0), 9);
  });
});
