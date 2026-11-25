// Kata cards (S3-P1): one file per kata in content/katas/, with each step's direction.
// Nov 20 (Jay): decision D1 (names, step counts and arrows only) is lifted. Kata practice shows the
// moves: each step lists its beats, a direction and a technique (content/dojo/kata-moves.json).

export type Facing = 'F' | 'B' | 'L' | 'R';

export interface KataStep {
  n: number;
  /** Directions from the school map. Empty while a step's direction is still an open question. */
  facing: Facing[];
  /** Nov 20 (Jay): what the student taps, in order: the direction, then the technique. Empty = the hero does it alone. */
  beats: KataBeat[];
  /** A short line for this step (e.g. "Begins at attention"), or absent. */
  note?: string;
}

/** One tap pair in kata practice: the way the hero faces (on screen: F up, B down, L left, R right), then the move. */
export interface KataBeat {
  dir: Facing;
  move: string;
  kiai: boolean;
  /** Which foot is forward after this beat ('L' or 'R'), from the school sheet; the art is drawn left foot forward. */
  lead?: 'L' | 'R';
  /** The hero animation for this beat when it isn't the move's usual one (e.g. the stacked-hands kick). */
  anim?: string;
  /** Nov 25 (Jay): a pose the hero turns into when this beat's arrow is tapped (e.g. a Cat Stance before stepping out). */
  pivot?: string;
}

export interface KataDef {
  id: string;
  name: string;
  /** The curriculum requirement this kata is (e.g. "white-kata"). */
  requirement: string;
  /** The Stance it unlocks, if one is designed yet. */
  stance: string | null;
  steps: KataStep[];
}

const FACINGS: readonly Facing[] = ['F', 'B', 'L', 'R'];

/** Checks one content/katas file. Throws with the file's id on anything malformed. */
export function parseKata(raw: unknown): KataDef {
  const d = raw as Partial<KataDef>;
  const where = `kata ${String(d?.id)}`;
  if (typeof d?.id !== 'string' || typeof d.name !== 'string' || typeof d.requirement !== 'string') throw new Error(`${where}: needs id, name and requirement`);
  if (d.stance !== null && typeof d.stance !== 'string') throw new Error(`${where}: stance must be an id or null`);
  if (!Array.isArray(d.steps) || d.steps.length === 0) throw new Error(`${where}: needs steps`);
  const steps = d.steps.map((s, i) => {
    if (s.n !== i + 1) throw new Error(`${where}: step ${i + 1} is numbered ${s.n}`);
    if (!Array.isArray(s.facing) || s.facing.some((f) => !FACINGS.includes(f))) throw new Error(`${where}: step ${s.n} has a bad facing`);
    const rawBeats = (s as { beats?: unknown }).beats ?? [];
    if (!Array.isArray(rawBeats)) throw new Error(`${where}: step ${s.n} beats must be a list`);
    const beats = rawBeats.map((b: Partial<KataBeat>, j) => {
      if (!FACINGS.includes(b?.dir as Facing) || typeof b.move !== 'string' || b.move === '') throw new Error(`${where}: step ${s.n} beat ${j + 1} needs a dir and a move`);
      if (b.lead !== undefined && b.lead !== 'L' && b.lead !== 'R') throw new Error(`${where}: step ${s.n} beat ${j + 1} lead must be L or R`);
      if (b.anim !== undefined && (typeof b.anim !== 'string' || !b.anim)) throw new Error(`${where}: step ${s.n} beat ${j + 1} anim must be a name`);
      if (b.pivot !== undefined && (typeof b.pivot !== 'string' || !b.pivot)) throw new Error(`${where}: step ${s.n} beat ${j + 1} pivot must be a name`);
      return { dir: b.dir as Facing, move: b.move, kiai: b.kiai === true, ...(b.lead ? { lead: b.lead } : {}), ...(b.anim ? { anim: b.anim } : {}), ...(b.pivot ? { pivot: b.pivot } : {}) };
    });
    const note = (s as { note?: unknown }).note;
    return { n: s.n, facing: [...s.facing], beats, ...(typeof note === 'string' ? { note } : {}) };
  });
  return { id: d.id, name: d.name, requirement: d.requirement, stance: d.stance ?? null, steps };
}

const ARROW: Record<Facing, string> = { F: '↑', B: '↓', L: '←', R: '→' };

/** "1 ←  2  3  4 ←  …": each step's number, with an arrow only where the direction is known. */
export function kataArrows(k: KataDef): string {
  return k.steps.map((s) => `${s.n}${s.facing.length ? ' ' + s.facing.map((f) => ARROW[f]).join('') : ''}`).join('   ');
}
