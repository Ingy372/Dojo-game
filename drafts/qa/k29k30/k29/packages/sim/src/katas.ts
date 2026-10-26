// Kata cards (S3-P1): one file per kata in content/katas/. The game shows only the kata's
// name, its number of steps and the direction of each step (decision D1); the school's step
// text stays with the school.

export type Facing = 'F' | 'B' | 'L' | 'R';

export interface KataStep {
  n: number;
  /** Directions from the school map. Empty while a step's direction is still an open question. */
  facing: Facing[];
}

export interface KataDef {
  id: string;
  name: string;
  /** The curriculum requirement this kata is (e.g. "white-kata"). */
  requirement: string;
  /** The Form it unlocks, if one is designed yet. */
  form: string | null;
  steps: KataStep[];
}

const FACINGS: readonly Facing[] = ['F', 'B', 'L', 'R'];

/** Checks one content/katas file. Throws with the file's id on anything malformed. */
export function parseKata(raw: unknown): KataDef {
  const d = raw as Partial<KataDef>;
  const where = `kata ${String(d?.id)}`;
  if (typeof d?.id !== 'string' || typeof d.name !== 'string' || typeof d.requirement !== 'string') throw new Error(`${where}: needs id, name and requirement`);
  if (d.form !== null && typeof d.form !== 'string') throw new Error(`${where}: form must be an id or null`);
  if (!Array.isArray(d.steps) || d.steps.length === 0) throw new Error(`${where}: needs steps`);
  const steps = d.steps.map((s, i) => {
    if (s.n !== i + 1) throw new Error(`${where}: step ${i + 1} is numbered ${s.n}`);
    if (!Array.isArray(s.facing) || s.facing.some((f) => !FACINGS.includes(f))) throw new Error(`${where}: step ${s.n} has a bad facing`);
    return { n: s.n, facing: [...s.facing] };
  });
  return { id: d.id, name: d.name, requirement: d.requirement, form: d.form ?? null, steps };
}

const ARROW: Record<Facing, string> = { F: '↑', B: '↓', L: '←', R: '→' };

/** "1 ←  2  3  4 ←  …": each step's number, with an arrow only where the direction is known. */
export function kataArrows(k: KataDef): string {
  return k.steps.map((s) => `${s.n}${s.facing.length ? ' ' + s.facing.map((f) => ARROW[f]).join('') : ''}`).join('   ');
}
