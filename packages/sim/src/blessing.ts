// OV-B5 (review 8.6): the Dojo Blessing is counted in Tower runs, not hours. Each new class
// adds BLESSING.runsPerClass runs, up to BLESSING.maxRuns; each counted run uses one.
// Missing class takes nothing away.

import { BLESSING } from './config';

export interface Blessing {
  /** Blessed runs left (0 to BLESSING.maxRuns). */
  runs: number;
  /** Class dates (YYYY-MM-DD) already counted. null until the first check. */
  counted: string[] | null;
}

export function newBlessing(): Blessing {
  return { runs: 0, counted: null };
}

export function readBlessing(v: unknown): Blessing {
  const b = (v ?? {}) as Partial<Blessing>;
  const runs = typeof b.runs === 'number' && Number.isFinite(b.runs) ? Math.max(0, Math.min(BLESSING.maxRuns, Math.floor(b.runs))) : 0;
  return { runs, counted: Array.isArray(b.counted) ? b.counted.filter((d) => typeof d === 'string') : null };
}

/**
 * Counts new class dates. Returns null when there is no new class, else the runs added
 * (0 when the Blessing was already full). The first check only gives a save that has had a
 * class one class's worth, quietly (returns null), so a long history never shows a moment.
 */
export function creditBlessing(blessing: Blessing, checkIns: readonly string[]): number | null {
  const live = [...new Set(checkIns.map((c) => c.slice(0, 10)))];
  if (blessing.counted === null) {
    blessing.counted = live;
    if (live.length > 0) blessing.runs = BLESSING.runsPerClass;
    return null;
  }
  const counted = new Set(blessing.counted);
  const fresh = live.filter((d) => !counted.has(d)).length;
  blessing.counted = live;
  if (fresh === 0) return null;
  const before = blessing.runs;
  blessing.runs = Math.min(BLESSING.maxRuns, before + fresh * BLESSING.runsPerClass);
  return blessing.runs - before;
}

/** Uses one blessed run if there is one. True when the run is blessed. */
export function useBlessing(blessing: Blessing): boolean {
  if (blessing.runs <= 0) return false;
  blessing.runs--;
  return true;
}
