// Insights: temporary upgrades for one run (core-design section 6), defined in
// content/insights. After each battle room the player picks one of three.

import { loadEffect, type Effect } from './effects';

export type InsightFamily = 'rooted' | 'flowing' | 'power' | 'virtue';
const FAMILIES: readonly InsightFamily[] = ['rooted', 'flowing', 'power', 'virtue'];

export interface InsightDef {
  id: string;
  name: string;
  family: InsightFamily;
  /** One short sentence the player reads on the card. */
  text: string;
  effect: Effect;
}

export class InsightError extends Error {
  constructor(id: string, problem: string) {
    super(`Insight "${id}" has a problem: ${problem}`);
    this.name = 'InsightError';
  }
}

/** Checks the Insights data file (a list) and returns the Insights, or throws a clear InsightError. */
export function loadInsights(data: unknown): InsightDef[] {
  const list = (data as { insights?: unknown })?.insights;
  if (!Array.isArray(list) || list.length === 0) throw new InsightError('?', 'the file needs an "insights" list');
  const seen = new Set<string>();
  return list.map((item) => {
    const raw = item as Record<string, unknown>;
    const id = typeof raw?.id === 'string' && raw.id ? raw.id : '?';
    const fail = (problem: string): never => {
      throw new InsightError(id, problem);
    };
    if (id === '?') fail('"id" must be a non-empty text');
    if (seen.has(id)) fail('this id is used twice');
    seen.add(id);
    if (typeof raw.name !== 'string' || !raw.name) fail('"name" must be a non-empty text');
    if (!FAMILIES.includes(raw.family as InsightFamily)) fail(`"family" must be one of: ${FAMILIES.join(', ')}`);
    if (typeof raw.text !== 'string' || !raw.text) fail('"text" must be a non-empty text');
    return {
      id,
      name: raw.name as string,
      family: raw.family as InsightFamily,
      text: raw.text as string,
      effect: loadEffect(raw.effect, fail),
    };
  });
}
