// The coin economy (Jay, Nov 23: "Hard work = Reward"). Coins are earned, never bought, never lost. The biggest
// amounts come from real training (promotions, stripes, sign-offs, classes), then from learning in the game (clean
// kata, Street Smarts), then from playing the Tower. Repeat practice of the same thing pays full for the first few
// times each day and a little after that, so learning something new always pays better than grinding.
// Nothing is ever taken away and nothing has a deadline or streak (kids rules). Numbers live in config (EARN).

import { EARN } from './config';
import type { Profile } from './profile';
import type { TrainingState } from './training';

/** Today's counts for the "full pay for the first few" rule (reset when the day string changes). */
export interface CoinDay {
  day: string;
  runs: number;
  kata: Record<string, number>;
  scenarios: Record<string, number>;
}

export function newCoinDay(day = ''): CoinDay {
  return { day, runs: 0, kata: {}, scenarios: {} };
}

export function readCoinDay(v: unknown): CoinDay {
  const d = v as Partial<CoinDay> | null;
  const counts = (x: unknown): Record<string, number> => {
    const out: Record<string, number> = {};
    if (!x || typeof x !== 'object') return out;
    for (const [k, n] of Object.entries(x as Record<string, unknown>)) if (typeof n === 'number' && n >= 0) out[k] = Math.floor(n);
    return out;
  };
  return {
    day: typeof d?.day === 'string' ? d.day : '',
    runs: typeof d?.runs === 'number' && d.runs >= 0 ? Math.floor(d.runs) : 0,
    kata: counts(d?.kata),
    scenarios: counts(d?.scenarios),
  };
}

/** Today's counts, started fresh on a new day. */
function today(profile: Profile, day: string): CoinDay {
  if (profile.coinDay.day !== day) profile.coinDay = newCoinDay(day);
  return profile.coinDay;
}

// ---------------------------------------------------------------- the Tower

/** A finished run's coins after the daily rule: full for the first few runs of the day, then half. */
export function runCoinsToday(profile: Profile, base: number, day: string): number {
  if (base <= 0) return 0;
  const d = today(profile, day);
  const full = d.runs < EARN.runsFullPerDay;
  d.runs++;
  return full ? base : Math.round(base * EARN.runAfterShare);
}

// ---------------------------------------------------------------- kata practice

export interface KataPay {
  coins: number;
  /** The first time this kata was done with no mistakes (the big one-time amount). */
  firstClean: boolean;
}

/**
 * Coins for a finished kata practice (Jay, Nov 23): the first clean run (no mistakes) of each kata pays a big one-time
 * amount, every clean run after that pays an ok amount, and a run with mistakes pays very little.
 */
export function kataCoins(profile: Profile, kataId: string, wrong: number, hinted = false): KataPay {
  const key = 'kata:' + kataId;
  let coins: number = EARN.kataWithMistakes;
  let firstClean = false;
  // Jay, Nov 24: a run that used the Hint button pays like a run with mistakes, never the clean-run coins.
  if (wrong === 0 && !hinted) {
    firstClean = !profile.coinOnce.includes(key);
    if (firstClean) profile.coinOnce.push(key);
    coins = firstClean ? EARN.kataFirstClean : EARN.kataClean;
  }
  profile.coins += coins;
  return { coins, firstClean };
}

// ---------------------------------------------------------------- Street Smarts

/**
 * Coins for a finished Street Smarts scenario: a big amount the first time, more for every new star (a better
 * choice found), and a little for replays (only the first few each day). `prevBest` = the best stars before.
 */
export function scenarioCoins(profile: Profile, id: string, stars: number, prevBest: number | undefined, day: string): number {
  const d = today(profile, day);
  let coins = 0;
  if (prevBest === undefined || prevBest < 0) coins += EARN.scenarioFirst + stars * EARN.scenarioStar;
  else if (stars > prevBest) coins += (stars - prevBest) * EARN.scenarioStar;
  else {
    // a replay with no new star: a little, for the first few replays of the day
    const n = d.scenarios[id] ?? 0;
    d.scenarios[id] = n + 1;
    if (n < EARN.scenarioReplaysPerDay) coins += EARN.scenarioReplay;
  }
  profile.coins += coins;
  return coins;
}

// ---------------------------------------------------------------- real training (the biggest)

export interface RealPay {
  coins: number;
  promotions: number;
  stripes: number;
  signOffs: number;
  tests: number;
}

/** Everything real the student has achieved, as keys (so each pays once). */
export function realKeys(t: TrainingState): Array<{ key: string; kind: 'promotion' | 'stripe' | 'signOff' | 'test' }> {
  const out: Array<{ key: string; kind: 'promotion' | 'stripe' | 'signOff' | 'test' }> = [];
  if (t.tier > 1) out.push({ key: `belt:${t.belt.id}`, kind: 'promotion' });
  for (const v of t.virtues) for (const s of v.earned) out.push({ key: `stripe:${s.word}|${s.belt}|${s.earnedOn}`, kind: 'stripe' });
  for (const r of [...t.requirements, ...t.stances.map((s) => s.requirement)]) if (r.signedOff) out.push({ key: `sign:${r.id}`, kind: 'signOff' });
  if (t.gate.sealLit) out.push({ key: `test:${t.belt.id}`, kind: 'test' });
  return out;
}

/**
 * Pays coins for new real achievements since last time: a promotion pays the most of anything in the game, then
 * stripes, being approved to test, and sign-offs. The very first time (a new player or an old save) everything
 * already earned is only noted, not paid, so a long history doesn't pour in at once (the Class Chests welcome them).
 */
export function payRealCoins(profile: Profile, t: TrainingState): RealPay {
  const pay: RealPay = { coins: 0, promotions: 0, stripes: 0, signOffs: 0, tests: 0 };
  const keys = realKeys(t);
  if (profile.realPaid === null) {
    profile.realPaid = keys.map((k) => k.key);
    return pay;
  }
  const paid = new Set(profile.realPaid);
  for (const k of keys) {
    if (paid.has(k.key)) continue;
    paid.add(k.key);
    if (k.kind === 'promotion') {
      pay.promotions++;
      pay.coins += EARN.promotion;
    } else if (k.kind === 'stripe') {
      pay.stripes++;
      pay.coins += EARN.stripe;
    } else if (k.kind === 'test') {
      pay.tests++;
      pay.coins += EARN.testApproved;
    } else {
      pay.signOffs++;
      pay.coins += EARN.signOff;
    }
  }
  profile.realPaid = [...paid];
  profile.coins += pay.coins;
  return pay;
}

// ---------------------------------------------------------------- the wish list

/** How far the student is toward the look they wished for (null when there's no wish or it's owned). */
export function wishProgress(profile: Profile, price: number | null): { have: number; need: number; ready: boolean } | null {
  if (!profile.shop.wish || price === null || profile.shop.owned.includes(profile.shop.wish)) return null;
  return { have: Math.min(profile.coins, price), need: price, ready: profile.coins >= price };
}
