// P-MENU2-b: the Trophy Case model (no Phaser, so Vitest can check it). Shelves of cubbies
// built from training; wording comes from content/abilities/trophy-case.json.

import type { AbilityInfo, VirtueInfo } from '@dojo/sim';
import words from '../../../../content/abilities/trophy-case.json';
import { BOARD, MIN_TAP, S1, S2, TYPE } from './tokens';

export const TROPHY_WORDS = words;

export type ShelfId = 'katas' | 'kicks' | 'selfDefense' | 'stripes';
const SHELF_ORDER: readonly ShelfId[] = ['katas', 'kicks', 'selfDefense', 'stripes'];
const KIND_SHELF = { form: 'katas', strike: 'kicks', seal: 'selfDefense' } as const;

export interface Cubby {
  id: string;
  shelf: ShelfId;
  /** The real technique name (or the Virtue and its stripe word). */
  name: string;
  earned: boolean;
  /** Icon id, if the icon set has one. */
  icon?: string;
  /** What it does in the game, one line. */
  effect: string;
  /** "Signed at White Belt" when earned; "Ask Sensei about this one" when not yet. */
  status: string;
  /** Earned katas: the kataArrows line for the sheet. */
  kata?: string;
}

export interface ShelfRow {
  shelf: ShelfId;
  title: string;
  cubbies: Cubby[];
}

const fill = (s: string, k: string, v: string): string => s.replace(`{${k}}`, v);

export interface TrophyInput {
  abilities: readonly AbilityInfo[];
  virtues: readonly VirtueInfo[];
  beltName: (beltId: string) => string;
  virtueName: (v: VirtueInfo) => string;
  virtueEffect: (v: VirtueInfo) => string;
  kataLine: (requirementId: string) => string | undefined;
}

/** Every cubby, by shelf, earned first (curriculum order kept inside each half). */
export function buildCubbies(t: TrophyInput): Cubby[] {
  const out: Cubby[] = [];
  for (const a of t.abilities) {
    const r = a.requirement;
    out.push({
      id: r.id,
      shelf: KIND_SHELF[a.kind],
      name: r.name,
      earned: a.unlocked,
      icon: a.form?.id ?? a.perk?.id,
      effect: a.form?.text ?? a.perk?.text ?? words.comingLater,
      status: a.unlocked ? fill(words.signedAt, 'belt', r.beltName) : words.askSensei,
      kata: a.kind === 'form' && a.unlocked ? t.kataLine(r.id) : undefined,
    });
  }
  for (const v of t.virtues) {
    out.push({
      id: `virtue-${v.def.id}-${v.rank}`,
      shelf: 'stripes',
      name: `${t.virtueName(v)} · ${fill(words.stripe, 'word', v.word)}`,
      earned: true,
      effect: t.virtueEffect(v),
      status: fill(words.signedAt, 'belt', t.beltName(v.earned[0]?.belt ?? '')),
    });
  }
  return SHELF_ORDER.flatMap((s) => {
    const on = out.filter((c) => c.shelf === s);
    return [...on.filter((c) => c.earned), ...on.filter((c) => !c.earned)];
  });
}

/** Shelf rows of at most perRow cubbies (a long shelf wraps to more rows with the same title). */
export function shelfRows(cubbies: readonly Cubby[], perRow: number): ShelfRow[] {
  const rows: ShelfRow[] = [];
  for (const s of SHELF_ORDER) {
    const on = cubbies.filter((c) => c.shelf === s);
    for (let i = 0; i < on.length; i += perRow) rows.push({ shelf: s, title: words.shelves[s], cubbies: on.slice(i, i + perRow) });
  }
  return rows;
}

export interface TrophyLayout {
  rowsPerPage: number;
  cubby: number;
  perRow: number;
  rowH: number;
  ribbonH: number;
  /** 2-row pages: ◀ ▶ sit at the sides of the shelves and the dots get a slim strip below. */
  sideArrows: boolean;
  /** Height of the bottom strip: the 44-tall pager (1 row) or the dots (2 rows). */
  pagerH: number;
  /** Where the shelves start inside the area, and how wide they are. */
  shelfX: number;
  shelfW: number;
}

const LABEL_H = TYPE.label + 4;

/** Trophy Case layout for a w x h area under the switch: 2 shelf rows per page when they fit, else 1. */
export function trophyLayout(w: number, h: number): TrophyLayout {
  const gap = BOARD.cubby.gap;
  const sized = (shelfW: number) => (4 * BOARD.cubby.large + 3 * gap <= shelfW ? BOARD.cubby.large : BOARD.cubby.small);
  const perRowFor = (shelfW: number, c: number) => Math.max(1, Math.min(4, Math.floor((shelfW + gap) / (c + gap))));
  // Two rows: slim ribbon, arrows at the sides, dots below.
  const side = MIN_TAP + S2;
  const w2 = w - 2 * side;
  const room2 = h - BOARD.ribbonCompact - S1 - BOARD.dotsH;
  const c2 = Math.min(sized(w2), Math.floor(room2 / 2 - LABEL_H - gap));
  if (c2 >= BOARD.cubbyMin) {
    return { rowsPerPage: 2, cubby: c2, perRow: perRowFor(w2, c2), rowH: LABEL_H + c2 + gap, ribbonH: BOARD.ribbonCompact, sideArrows: true, pagerH: BOARD.dotsH, shelfX: side, shelfW: w2 };
  }
  // One row: full ribbon, the 44-tall ◀ dots ▶ pager below.
  const room = h - BOARD.ribbonH - S2 - MIN_TAP - S2;
  const c = Math.max(MIN_TAP, Math.min(sized(w), room - LABEL_H));
  return { rowsPerPage: 1, cubby: c, perRow: perRowFor(w, c), rowH: LABEL_H + c + gap, ribbonH: BOARD.ribbonH, sideArrows: false, pagerH: MIN_TAP, shelfX: 0, shelfW: w };
}

/** Rows split into pages (shown as dots, never "n / m"). */
export function trophyPages(rows: readonly ShelfRow[], rowsPerPage: number): ShelfRow[][] {
  const pages: ShelfRow[][] = [];
  for (let i = 0; i < rows.length; i += rowsPerPage) pages.push(rows.slice(i, i + rowsPerPage));
  return pages.length ? pages : [[]];
}
