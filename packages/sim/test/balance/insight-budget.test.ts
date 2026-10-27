/// <reference types="vite/client" />
// R-INSIGHT-BAL layer 2: the Insight budget lines B1-B7 and B10 (and B9, printed only), measured by playing runs.
// Slow, so not in the normal tests. Run it with:  BALANCE=1 npx vitest run test/balance/insight-budget   (in packages/sim),
// (`npm run balance` runs it with the other balance reports). Every line prints a table (card or combo, bot, PE, limit) and fails by naming its line.
//
// Setup: seeds 1000..1000+N-1 (see SEED_BASE in insight-sim.ts), belts 1-10 pooled, Standard, the typical model student's stats per belt, bots kid / newer / careful.
// Seeds (SEEDS below): the counts the spec tables were measured with, kid 100 singles / 60 pairs / 40 ruler, newer and careful 50 / 30 / 20;
// routes 150, pool 150 per belt, pickers 60. The runs are seeded, so the same code gives the same numbers every time. Noise against another
// seed set is about +/-5 PE for the kid and more for newer and careful, whose PE is read from small Health and tick differences (careful
// Ripple Counter reads 19 with a 20-seed ruler and 26 with a 100-seed ruler). The limits were set on these counts, so keep them: more
// seeds do not make a line fairer, they just read another sample. If a sim change moves a result by more than 3 PE, re-run at 2x seeds
// before changing any limit here or in the CAPS table of test/insight-budget.test.ts.
//
// Floors for skilled bots are not tested (B1 floor is the kid only). Why a card may read near PE 0 for a skilled bot:
//  - Rally: skill-gated; it pays only at low Health, which a skilled bot rarely reaches.
//  - Iron Skin: kid-leaning; the kid blocks by mashing and takes hits, skilled bots dodge or counter instead.
//  - Wind Step: needs long combos, so a skilled bot's rhythm wastes the burst.
//  - Quick Hands and Shield Breaker: a skilled bot already fills its Focus and breaks shields.
//  - Calm Breath and Steady Start (placeholders): Focus cards, where a skilled bot has Focus to spare.
import { describe, expect, it } from 'vitest';
import type { InsightDef } from '../../src';
import { testContent } from '../load-content';
import { allCards, BELTS, BOT_NAMES, buildRuler, leanPicker, pe, peOf, play, read, sum, type BotName, type Ruler, type Setup } from './insight-sim';

declare const console: { log(...args: unknown[]): void };
const enabled = !!(import.meta.env as Record<string, string | undefined>).BALANCE;
const HOUR = 3_600_000;

/** Seeds per belt, the counts the spec tables were measured with: the kid has the noisy win rate, so it gets the most; the ruler is the same for every line. */
const SEEDS: Record<BotName, { single: number; pair: number; ruler: number }> = {
  kid: { single: 100, pair: 60, ruler: 40 },
  newer: { single: 50, pair: 30, ruler: 20 },
  careful: { single: 50, pair: 30, ruler: 20 },
};
const ROUTES = 150;
const POOL = 150;
const PICKERS = 60;
const FAMILIES = ['rooted', 'flowing', 'power', 'virtue'] as const;
/** B5: the kid's pool win % per belt before the rebalance, and its mean. */
const POOL_BEFORE = [60, 67, 67, 61, 57, 57, 47, 50, 53, 51];
const POOL_BEFORE_MEAN = 59;

const f1 = (n: number) => n.toFixed(1);
const pad = (s: string | number, n: number) => String(s).padEnd(n);
/** Prints a table and returns the rows that broke their limit. */
function table(title: string, head: string, rows: { name: string; bot: string; value: number; limit: string; bad: boolean }[]): string[] {
  console.log(`\n=== ${title} ===\n${head}`);
  for (const r of rows) console.log(`${pad(r.name, 32)} ${pad(r.bot, 8)} ${pad(f1(r.value), 6)} ${pad(r.limit, 18)}${r.bad ? '  <-- FAIL' : ''}`);
  return rows.filter((r) => r.bad).map((r) => `${r.name} (${r.bot}) ${f1(r.value)}, limit ${r.limit}`);
}
const HEAD = `${pad('card or combo', 32)} ${pad('bot', 8)} ${pad('PE', 6)} limit`;
const winPct = (setup: Setup, seeds: number) => read(sum(play(setup, 'kid', 'standard', seeds))).win;
const pairName = (a: string, b: string) => [a, b].sort().join('|');

describe.skipIf(!enabled)('Insight budget (R-INSIGHT-BAL layer 2)', () => {
  const cards: InsightDef[] = allCards(testContent());
  const ids = cards.map((c) => c.id);
  const rulers = {} as Record<BotName, Ruler>;
  const ruler = (bot: BotName) => (rulers[bot] ??= buildRuler(bot, 'standard', SEEDS[bot].ruler));
  const solo = (id: string, bot: BotName) => peOf({ kind: 'held', ids: [id] }, bot, 'standard', SEEDS[bot].single, ruler(bot));

  it('B1 and B2: every single card', () => {
    const rows = ids.flatMap((id) =>
      BOT_NAMES.map((bot) => {
        const v = solo(id, bot);
        const bad = v > 26 || (bot === 'kid' && v < 12);
        return { name: id, bot, value: v, limit: bot === 'kid' ? '12 to 26' : 'max 26', bad };
      }),
    );
    const fails = table('B1 single card, held all run, Standard', HEAD, rows);
    const notOneBot = ids.filter((id) => BOT_NAMES.every((bot) => solo(id, bot) < 12));
    // B2 (skilled cap 30) is looser than the B1 cap of 26 on the same cards, so B1 above already covers it; it is checked on its own so that it still holds if B1's cap is ever raised.
    const b2 = ids.flatMap((id) => (['newer', 'careful'] as const).map((bot) => ({ name: id, bot, value: solo(id, bot), limit: 'max 30', bad: solo(id, bot) > 30 })));
    const fails2 = table('B2 skilled-bot single card cap', HEAD, b2);
    expect(notOneBot, 'B1: every card must reach PE 12 on at least one bot').toEqual([]);
    expect(fails, 'B1 single card PE 12-26 (floor kid only, cap all bots)').toEqual([]);
    expect(fails2, 'B2 skilled-bot single card cap 30').toEqual([]);
  }, HOUR);

  it('B3: every pair', () => {
    const rows = [];
    for (let i = 0; i < ids.length; i++)
      for (let j = i + 1; j < ids.length; j++)
        for (const bot of BOT_NAMES) {
          const v = peOf({ kind: 'held', ids: [ids[i], ids[j]] }, bot, 'standard', SEEDS[bot].pair, ruler(bot));
          rows.push({ name: pairName(ids[i], ids[j]), bot, value: v, limit: bot === 'kid' ? '20 to 50' : 'max 50', bad: v > 50 || (bot === 'kid' && v < 20) });
        }
    const fails = table(`B3 pairs (${rows.length / 3} pairs)`, HEAD, rows);
    expect(fails, 'B3 any pair PE <= 50 on all bots, kid no pair under 20').toEqual([]);
  }, HOUR);

  it('B4 and B10: the four family routes', () => {
    const kidRuler = ruler('kid');
    const routes = FAMILIES.map((f) => {
      const members = cards.filter((c) => c.family === f).map((c) => c.id);
      const held = read(sum(play({ kind: 'held', ids: members }, 'kid', 'standard', ROUTES)));
      const lean = read(sum(play({ kind: 'picker', pick: leanPicker(members) }, 'kid', 'standard', ROUTES)));
      return { f, n: members.length, pe: pe(held, kidRuler), held: held.win, lean: lean.win };
    });
    const perCard = routes.map((r) => r.pe / r.n);
    const mean = perCard.reduce((a, b) => a + b, 0) / perCard.length;
    const rows = routes.map((r, i) => ({
      name: `${r.f} route (${r.n} cards, win ${f1(r.held)}%)`,
      bot: 'kid',
      value: perCard[i],
      limit: `${f1(0.75 * mean)}-${f1(1.25 * mean)}, route <= 55`,
      bad: perCard[i] < 0.75 * mean || perCard[i] > 1.25 * mean || r.pe > 55,
    }));
    const fails4 = table('B4 route PE per card (route PE in the next table)', HEAD, rows);
    table('B4 route PE', HEAD, routes.map((r) => ({ name: r.f, bot: 'kid', value: r.pe, limit: 'max 55', bad: r.pe > 55 })));
    const spread = (xs: number[]) => Math.max(...xs) - Math.min(...xs);
    const heldSpread = spread(routes.map((r) => r.held));
    const leanSpread = spread(routes.map((r) => r.lean));
    console.log(`\nB10 route win % (kid, Standard, ${ROUTES} seeds): ${routes.map((r) => `${r.f} held ${f1(r.held)} / lean ${f1(r.lean)}`).join(',  ')}`);
    console.log(`B10 held spread ${f1(heldSpread)} (limit 14, target 10)   lean-picker spread ${f1(leanSpread)} (limit 10)`);
    expect(fails4, 'B4 full-family route, per card within +/-25% of the mean, route PE <= 55').toEqual([]);
    expect(heldSpread, `B10 held route spread (${routes.map((r) => `${r.f} ${f1(r.held)}`).join(', ')})`).toBeLessThanOrEqual(14);
    expect(leanSpread, `B10 lean-picker route spread (${routes.map((r) => `${r.f} ${f1(r.lean)}`).join(', ')})`).toBeLessThanOrEqual(10);
  }, HOUR);

  it('B5: random pool', () => {
    const belts = play({ kind: 'pool' }, 'kid', 'standard', POOL).map((t) => read(t).win);
    const mean = belts.reduce((a, b) => a + b, 0) / belts.length;
    console.log(`\n=== B5 random pool (${testContent().insights.length} cards), kid, Standard, ${POOL} seeds per belt ===`);
    console.log(`belt   ${BELTS.map((b) => pad(b, 5)).join('')}\nwin %  ${belts.map((w) => pad(f1(w), 5)).join('')}\nbefore ${POOL_BEFORE.map((w) => pad(w, 5)).join('')}\nmean ${f1(mean)} (limit ${POOL_BEFORE_MEAN} +/- 6)`);
    // Informational: Guided pool >= 90 and Challenge pool within 10 of 30.
    for (const [diff, goal] of [['guided', '>= 90'], ['challenge', 'about 30 +/- 10']] as const) {
      console.log(`B5 (info only) ${diff} pool win ${f1(read(sum(play({ kind: 'pool' }, 'kid', diff, PICKERS))).win)}%, goal ${goal}`);
    }
    expect(Math.abs(mean - POOL_BEFORE_MEAN), `B5 pool mean ${f1(mean)} must be within 6 of ${POOL_BEFORE_MEAN}`).toBeLessThanOrEqual(6);
    belts.forEach((w, i) => {
      expect(Math.abs(w - POOL_BEFORE[i]), `B5 belt ${i + 1} win ${f1(w)} must be within 15 of ${POOL_BEFORE[i]}`).toBeLessThanOrEqual(15);
      expect(w, `B5 belt ${i + 1} win must not be under 45`).toBeGreaterThanOrEqual(45);
    });
  }, HOUR);

  it('B6: best-pick against worst-pick', () => {
    // A pick is scored by our own kid readings: its single-card PE, plus how it combines with the cards already held.
    const pair = (a: string, b: string) => peOf({ kind: 'held', ids: [a, b] }, 'kid', 'standard', SEEDS.kid.pair, ruler('kid'));
    const score = (held: string[], id: string) => {
      const s = solo(id, 'kid');
      if (!held.length) return s;
      return s + held.reduce((acc, h) => acc + (pair(h, id) - solo(h, 'kid') - s), 0) / held.length;
    };
    const best = winPct({ kind: 'picker', pick: (run, c) => c.reduce((a, b) => (score(run.insights, b) > score(run.insights, a) ? b : a)) }, PICKERS);
    const worst = winPct({ kind: 'picker', pick: (run, c) => c.reduce((a, b) => (score(run.insights, b) < score(run.insights, a) ? b : a)) }, PICKERS);
    console.log(`\n=== B6 best-pick ${f1(best)}% against worst-pick ${f1(worst)}%, kid, Standard, ${PICKERS} seeds per belt: gap ${f1(best - worst)} (limit 25) ===`);
    expect(best - worst, 'B6 best-pick vs worst-pick gap').toBeLessThanOrEqual(25);
  }, HOUR);

  it('B7: neighbour jump', () => {
    const v = ids.map((id) => ({ id, pe: solo(id, 'kid') }));
    const hi = v.reduce((a, b) => (b.pe > a.pe ? b : a));
    const lo = v.reduce((a, b) => (b.pe < a.pe ? b : a));
    console.log(`\n=== B7 kid single cards: highest ${hi.id} ${f1(hi.pe)}, lowest ${lo.id} ${f1(lo.pe)}, ratio ${f1(hi.pe / lo.pe)} (limit 2) ===`);
    expect(hi.pe / lo.pe, `B7 highest (${hi.id}) over lowest (${lo.id})`).toBeLessThanOrEqual(2);
  }, HOUR);

  it('B9: Guided and Challenge single cards (printed only)', () => {
    for (const diff of ['guided', 'challenge'] as const) {
      const r = buildRuler('kid', diff, PICKERS);
      const rows = ids.map((id) => {
        const v = pe(read(sum(play({ kind: 'held', ids: [id] }, 'kid', diff, PICKERS))), r);
        return { name: id, bot: 'kid', value: v, limit: 'info, max 32', bad: v > 32 };
      });
      table(`B9 (information only) ${diff} single card`, HEAD, rows);
    }
  }, HOUR);
});
