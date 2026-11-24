import { describe, expect, it } from 'vitest';
import { COINS, EARN, finishRun, kataCoins, newProfile, payRealCoins, loadProfile, runCoinsToday, scenarioCoins, wishProgress, type TrainingState } from '../src';

const D1 = '2026-11-23';
const D2 = '2026-11-24';

/** Just the parts of a training state the coin rules read. */
const training = (o: { tier?: number; belt?: string; stripes?: string[]; signed?: string[]; seal?: boolean }): TrainingState =>
  ({
    tier: o.tier ?? 1,
    belt: { id: o.belt ?? 'white' },
    virtues: [{ earned: (o.stripes ?? []).map((w) => ({ word: w, belt: 'white', earnedOn: '2026-11-01' })) }],
    requirements: (o.signed ?? []).map((id) => ({ id, signedOff: true })),
    stances: [],
    gate: { sealLit: !!o.seal },
  }) as unknown as TrainingState;

describe('coin economy (Nov 23, "Hard work = Reward")', () => {
  it('a promotion is the biggest coin gift in the game', () => {
    const others = [EARN.stripe, EARN.signOff, EARN.testApproved, EARN.kataFirstClean, EARN.scenarioFirst + 3 * EARN.scenarioStar, COINS.classChest, COINS.run + 10 * COINS.fightRoom + COINS.bossRoom + COINS.win];
    for (const n of others) expect(EARN.promotion).toBeGreaterThan(n);
  });

  it('real training pays once each; the first look only notes what was already earned', () => {
    const p = newProfile();
    const before = training({ tier: 2, belt: 'yellow', stripes: ['Respect'], signed: ['a', 'b'] });
    expect(payRealCoins(p, before).coins).toBe(0);
    expect(p.coins).toBe(0);
    const after = training({ tier: 3, belt: 'orange', stripes: ['Respect', 'Focus'], signed: ['a', 'b', 'c'], seal: true });
    const pay = payRealCoins(p, after);
    expect(pay).toEqual({ coins: EARN.promotion + EARN.stripe + EARN.signOff + EARN.testApproved, promotions: 1, stripes: 1, signOffs: 1, tests: 1 });
    expect(p.coins).toBe(pay.coins);
    expect(payRealCoins(p, after).coins).toBe(0);
  });

  it('kata (Jay, Nov 23): a big one-time amount for the first clean run, ok for every clean run, very little with mistakes', () => {
    const p = newProfile();
    expect(kataCoins(p, 'keon', 5)).toEqual({ coins: EARN.kataWithMistakes, firstClean: false });
    expect(kataCoins(p, 'keon', 0)).toEqual({ coins: EARN.kataFirstClean, firstClean: true });
    for (let i = 0; i < 10; i++) expect(kataCoins(p, 'keon', 0)).toEqual({ coins: EARN.kataClean, firstClean: false });
    expect(kataCoins(p, 'keon', 1).coins).toBe(EARN.kataWithMistakes);
    expect(kataCoins(p, 'basic-form-1', 0).firstClean).toBe(true);
    expect(EARN.kataFirstClean).toBeGreaterThan(EARN.kataClean * 5);
    expect(EARN.kataClean).toBeGreaterThan(EARN.kataWithMistakes * 5);
  });

  it('Street Smarts: first finish and each new star pay well; replays pay a little, a few times a day', () => {
    const p = newProfile();
    expect(scenarioCoins(p, 'stranger', 2, undefined, D1)).toBe(EARN.scenarioFirst + 2 * EARN.scenarioStar);
    expect(scenarioCoins(p, 'stranger', 3, 2, D1)).toBe(EARN.scenarioStar);
    expect(scenarioCoins(p, 'stranger', 3, 3, D1)).toBe(EARN.scenarioReplay);
    expect(scenarioCoins(p, 'stranger', 3, 3, D1)).toBe(EARN.scenarioReplay);
    expect(scenarioCoins(p, 'stranger', 3, 3, D1)).toBe(0);
    expect(scenarioCoins(p, 'stranger', 3, 3, D2)).toBe(EARN.scenarioReplay);
  });

  it('Tower runs pay full for the first few runs of a day, then half; never below 0', () => {
    const p = newProfile();
    for (let i = 0; i < EARN.runsFullPerDay; i++) expect(runCoinsToday(p, 80, D1)).toBe(80);
    expect(runCoinsToday(p, 80, D1)).toBe(40);
    expect(runCoinsToday(p, 0, D1)).toBe(0);
    expect(runCoinsToday(p, 80, D2)).toBe(80);
  });

  it('finishRun applies the daily rule only when given the day (old callers unchanged)', () => {
    const p = newProfile();
    const summary = { items: [], results: [], result: 'lost', test: false, tier: 1 } as unknown as Parameters<typeof finishRun>[1];
    finishRun(p, summary);
    expect(p.coins).toBe(COINS.run);
    p.coinDay = { day: D1, runs: EARN.runsFullPerDay, kata: {}, scenarios: {} };
    finishRun(p, summary, D1);
    expect(p.coins).toBe(COINS.run + COINS.run * EARN.runAfterShare);
  });

  it('the wish shows how close the student is', () => {
    const p = newProfile();
    p.coins = 300;
    expect(wishProgress(p, 1500)).toBeNull();
    p.shop.wish = 'crimson-dragon';
    expect(wishProgress(p, 1500)).toEqual({ have: 300, need: 1500, ready: false });
    p.coins = 2000;
    expect(wishProgress(p, 1500)?.ready).toBe(true);
    p.shop.owned.push('crimson-dragon');
    expect(wishProgress(p, 1500)).toBeNull();
  });

  it('old saves read fine (no coin day, nothing paid yet)', () => {
    const p = loadProfile({ version: 1, inventory: [], equipped: {}, bests: {}, coins: 50 });
    expect(p?.realPaid).toBeNull();
    expect(p?.coinOnce).toEqual([]);
    expect(p?.coinDay.runs).toBe(0);
    expect(p?.shop.wish).toBeNull();
  });
});
