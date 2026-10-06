// A seeded random number generator (mulberry32). The rules never use Math.random():
// the same seed always gives the same floor, doors, Insights and loot. The state is
// one plain number, so it is saved along with the run.

export interface Rng {
  state: number;
}

export function createRng(seed: number): Rng {
  return { state: seed >>> 0 };
}

/** A number from 0 (included) to 1 (not included). */
export function nextFloat(rng: Rng): number {
  rng.state = (rng.state + 0x6d2b79f5) >>> 0;
  let t = rng.state;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

/** A whole number from 0 to n - 1. */
export function nextInt(rng: Rng, n: number): number {
  return Math.floor(nextFloat(rng) * n);
}

export function pick<T>(rng: Rng, list: readonly T[]): T {
  return list[nextInt(rng, list.length)];
}

/** Picks a key with chances in proportion to its weight. Keys are tried in the order given. */
export function pickWeighted<K extends string>(rng: Rng, weights: ReadonlyArray<readonly [K, number]>): K {
  let total = 0;
  for (const [, w] of weights) total += Math.max(0, w);
  let roll = nextFloat(rng) * total;
  for (const [k, w] of weights) {
    roll -= Math.max(0, w);
    if (roll < 0) return k;
  }
  return weights[weights.length - 1][0];
}

/** A shuffled copy of a list. */
export function shuffled<T>(rng: Rng, list: readonly T[]): T[] {
  const out = list.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = nextInt(rng, i + 1);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}
