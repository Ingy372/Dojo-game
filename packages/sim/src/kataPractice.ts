// Kata practice (Jay, Nov 20): on the school logo in the Action Zone, the student picks a kata they have reached
// and plays it beat by beat: tap the direction the hero faces, then the technique. Wrong taps are counted and
// answered with a gentle buzz; after two misses on the same beat the right button glows. Just practice: no power,
// no Experience, no items. Times for the optional time trial are measured by the client (real time stays out of here).

import type { Facing, KataBeat, KataDef } from './katas';

/** A technique button (content/dojo/kata-moves.json). */
export interface KataMoveDef {
  id: string;
  name: string;
  /** Which code-drawn picture the button shows. */
  icon: string;
  /** The hero animation played for it. */
  anim: string;
  /** True while `anim` is a stand-in for a move not modelled yet. */
  standIn: boolean;
}

/** Misses on one beat before the right button glows. */
export const KATA_HINT_AFTER = 2;

/** Checks content/dojo/kata-moves.json. */
export function parseKataMoves(raw: unknown): KataMoveDef[] {
  const list = (raw as { moves?: unknown })?.moves;
  if (!Array.isArray(list) || list.length === 0) throw new Error('kata moves: needs a moves list');
  const seen = new Set<string>();
  return list.map((m: Partial<KataMoveDef>, i) => {
    if (typeof m?.id !== 'string' || typeof m.name !== 'string' || typeof m.icon !== 'string' || typeof m.anim !== 'string') throw new Error(`kata moves: move ${i + 1} needs id, name, icon and anim`);
    if (seen.has(m.id)) throw new Error(`kata moves: ${m.id} is listed twice`);
    seen.add(m.id);
    return { id: m.id, name: m.name, icon: m.icon, anim: m.anim, standIn: m.standIn === true };
  });
}

/** Every beat of a kata in order, each with its step number. */
export interface PracticeBeat extends KataBeat {
  step: number;
}

export function kataBeats(k: KataDef): PracticeBeat[] {
  return k.steps.flatMap((s) => s.beats.map((b) => ({ ...b, step: s.n })));
}

/** The kata's technique buttons, in the order they first appear. */
export function kataMoveIds(k: KataDef): string[] {
  return [...new Set(kataBeats(k).map((b) => b.move))];
}

/** Can this kata be practised (it has at least one beat, and every move is a known button)? */
export function kataPlayable(k: KataDef, moves: readonly KataMoveDef[]): boolean {
  const ids = new Set(moves.map((m) => m.id));
  const beats = kataBeats(k);
  return beats.length > 0 && beats.every((b) => ids.has(b.move));
}

/**
 * The katas this student may practise: the kata of every belt up to and including the current one (a white belt
 * has Basic Form 1, a yellow belt Basic Forms 1 and 2...), in belt order. A belt's kata is the requirement
 * "<belt>-kata". Katas without beats yet are left out.
 */
export function practiceKatas(katas: ReadonlyMap<string, KataDef>, beltIds: readonly string[], currentBelt: string, moves: readonly KataMoveDef[]): KataDef[] {
  const upTo = beltIds.indexOf(currentBelt);
  if (upTo < 0) return [];
  return beltIds
    .slice(0, upTo + 1)
    .map((b) => katas.get(`${b}-kata`))
    .filter((k): k is KataDef => !!k && kataPlayable(k, moves));
}

export interface KataRun {
  beats: PracticeBeat[];
  /** The beat being played. Equals beats.length once the kata is done. */
  index: number;
  /** The direction already tapped for this beat, or null. */
  dir: Facing | null;
  /** Wrong taps in the whole kata. */
  wrong: number;
  /** Wrong taps on this beat (the hint shows from KATA_HINT_AFTER). */
  missesHere: number;
  /** Jay, Nov 24: the Hint button was used on this beat (the next arrow or move glows). */
  hintHere: boolean;
  /** The Hint button was used anywhere in this run: it pays like a run with mistakes and sets no bests. */
  hinted: boolean;
}

export function newKataRun(k: KataDef): KataRun {
  return { beats: kataBeats(k), index: 0, dir: null, wrong: 0, missesHere: 0, hintHere: false, hinted: false };
}

export const kataDone = (r: KataRun): boolean => r.index >= r.beats.length;

export type DirResult = 'ok' | 'wrong' | 'done';
export type MoveResult = 'ok' | 'wrong' | 'need-dir' | 'done';

/** The student taps an arrow. The right one is remembered for the beat; a wrong one counts and clears it. */
export function tapKataDir(r: KataRun, d: Facing): DirResult {
  if (kataDone(r)) return 'done';
  if (r.beats[r.index].dir === d) {
    r.dir = d;
    return 'ok';
  }
  r.dir = null;
  r.wrong++;
  r.missesHere++;
  return 'wrong';
}

/**
 * The student taps a technique. Before an arrow it only asks for one (not counted). The right move after the right
 * arrow plays the beat and moves on; a wrong move counts (the arrow stays chosen).
 */
export function tapKataMove(r: KataRun, move: string): MoveResult {
  if (kataDone(r)) return 'done';
  if (r.dir === null) return 'need-dir';
  if (r.beats[r.index].move !== move) {
    r.wrong++;
    r.missesHere++;
    return 'wrong';
  }
  r.index++;
  r.dir = null;
  r.missesHere = 0;
  r.hintHere = false;
  return 'ok';
}

/** What should glow as a hint after a couple of misses: the arrow, or (once it is chosen) the move. */
export function kataHint(r: KataRun): { dir: Facing } | { move: string } | null {
  if (kataDone(r) || (r.missesHere < KATA_HINT_AFTER && !r.hintHere)) return null;
  const b = r.beats[r.index];
  return r.dir === null ? { dir: b.dir } : { move: b.move };
}

/**
 * Jay, Nov 24: "show me the next move". Lights the next arrow (or, once it is tapped, the move) for this beat. The run
 * is marked hinted: it pays like a run with mistakes and sets no bests. Null once the kata is done.
 */
export function askKataHint(r: KataRun): { dir: Facing } | { move: string } | null {
  if (kataDone(r)) return null;
  r.hintHere = true;
  r.hinted = true;
  return kataHint(r);
}

/** A kata's best results, kept in the save. */
export interface KataBest {
  /** Fastest time-trial finish in milliseconds, or null if never timed. */
  bestMs: number | null;
  /** Fewest wrong moves in any finished run, or null if never finished. */
  fewestWrong: number | null;
  /** Finished runs. */
  runs: number;
}

/**
 * Folds one finished run into the best results. `ms` is null when the time trial was off.
 * `newFewest` is only true when an earlier finish is beaten (the first finish is not a "new best").
 */
export function recordKataRun(prev: KataBest | undefined, wrong: number, ms: number | null, hinted = false): { best: KataBest; newBestTime: boolean; newFewest: boolean } {
  const p = prev ?? { bestMs: null, fewestWrong: null, runs: 0 };
  // A run that used the Hint button counts as played, but sets no bests (Jay, Nov 24).
  if (hinted) return { best: { ...p, runs: p.runs + 1 }, newBestTime: false, newFewest: false };
  const fasterTime = ms !== null && (p.bestMs === null || ms < p.bestMs);
  const fewer = p.fewestWrong === null || wrong < p.fewestWrong;
  return {
    best: { bestMs: fasterTime ? ms : p.bestMs, fewestWrong: fewer ? wrong : p.fewestWrong, runs: p.runs + 1 },
    newBestTime: fasterTime && p.bestMs !== null,
    newFewest: fewer && p.fewestWrong !== null,
  };
}

/** Reads the saved bests, dropping anything malformed. */
export function readKataBests(raw: unknown): Record<string, KataBest> {
  const out: Record<string, KataBest> = {};
  if (!raw || typeof raw !== 'object') return out;
  const n = (x: unknown): number | null => (typeof x === 'number' && x >= 0 && Number.isFinite(x) ? Math.floor(x) : null);
  for (const [id, v] of Object.entries(raw as Record<string, unknown>)) {
    if (!v || typeof v !== 'object') continue;
    const b = v as Partial<KataBest>;
    out[id] = { bestMs: n(b.bestMs), fewestWrong: n(b.fewestWrong), runs: n(b.runs) ?? 0 };
  }
  return out;
}

/** "0:42.3" */
export function formatKataTime(ms: number): string {
  const tenths = Math.floor(ms / 100);
  const s = Math.floor(tenths / 10);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}.${tenths % 10}`;
}
