// R-INSIGHT-BAL layer 1: the Insight card numbers stay inside the caps the sim proved. No sim runs here;
// the slow check is balance/insight-budget.test.ts (BALANCE=1).
import { describe, expect, it } from 'vitest';
import { modsFrom, type Effect } from '../src';
import { testContent } from './load-content';

const cards = testContent().insights;

/**
 * One row per card: the proven cap for each effect number. `max` numbers may not go above it, `min` numbers may not go below it
 * (Wind Step's "every N hits" gets weaker as N grows). Numbers not listed (Ripple Counter's radius) are not capped.
 * A card is allowed to be a bit weaker than its cap; to make one stronger, run `BALANCE=1 npx vitest run test/balance/insight-budget`
 * (in packages/sim), then update this table with the new PE.
 */
type Cap = { type: Effect['type']; max?: Partial<Record<'amount' | 'seconds' | 'focusOnBreak', number>>; min?: Partial<Record<'everyHits', number>> };
const CAPS: Record<string, Cap> = {
  'ripple-counter': { type: 'rippleCounter', max: { amount: 1.2 } },
  'iron-skin': { type: 'blockReflect', max: { amount: 1.2 } },
  'wind-step': { type: 'comboSpeed', max: { amount: 0.3, seconds: 2 }, min: { everyHits: 5 } },
  'double-strike': { type: 'strikeExtraHit', max: { amount: 0.2 } },
  'quick-hands': { type: 'attackSpeed', max: { amount: 0.2 } },
  'press-the-advantage': { type: 'staggerBonus', max: { amount: 0.3 } },
  'shield-breaker': { type: 'shieldBreaker', max: { focusOnBreak: 7 } },
  'heavy-hands': { type: 'powerScale', max: { amount: 0.2 } },
  rally: { type: 'lowHealthFocus', max: { amount: 0.75 } },
  // OV-B6: the four OV-P1 cards, at the numbers R-POWERUPS-15 measured (drafts/planning/R-POWERUPS-15.md section 4).
  'calm-breath': { type: 'focusGain', max: { amount: 0.25 } },
  'steady-start': { type: 'startFocus', max: { amount: 40 } },
  'lighter-strike': { type: 'strikeCost', max: { amount: 4 } },
  'softer-block': { type: 'blockCut', max: { amount: 0.1 } },
};
const RERUN = 'Re-run `BALANCE=1 npx vitest run test/balance/insight-budget` (in packages/sim) and update the CAPS table with the new PE.';

describe('R-INSIGHT-BAL layer 1: Insight caps', () => {

  it.each(cards.map((c) => [c.id, c] as const))('%s is inside its cap', (id, card) => {
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

  it('card ids are unique, and the CAPS table and the content list the same cards', () => {
    const ids = cards.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids.filter((id) => !(id in CAPS)), 'cards with no CAPS row').toEqual([]);
    expect(Object.keys(CAPS).filter((id) => !ids.includes(id)), 'CAPS rows with no card').toEqual([]);
  });

  it('every family has at least 2 cards', () => {
    const count = (f: string) => cards.filter((c) => c.family === f).length;
    for (const f of ['guard', 'speed', 'power', 'virtue']) expect(count(f), `family ${f}`).toBeGreaterThanOrEqual(2);
  });

  it('all the cards together cannot reach a stacking limit in effects.ts', () => {
    const effects = cards.map((c) => c.effect);
    // Wind Step's burst also speeds basic attacks by half its bonus (rule A).
    const attackSpeed = effects.reduce((s, e) => s + (e.type === 'attackSpeed' ? e.amount : 0) + (e.type === 'comboSpeed' ? e.amount / 2 : 0), 0);
    expect(attackSpeed, 'attack speed from cards alone, before stances and gear, against the 0.6 cap').toBeLessThan(0.6);
    const disarm = effects.reduce((s, e) => s + (e.type === 'disarm' ? e.amount : 0), 0);
    expect(disarm, 'disarm from cards against the 0.9 cap').toBeLessThan(0.9);
    // The game's own sum (which clips at the cap) gives the same number, so nothing is clipped.
    expect(modsFrom(effects, 20).attackSpeed).toBeCloseTo(effects.reduce((s, e) => s + (e.type === 'attackSpeed' ? e.amount : 0), 0), 9);
  });
});
