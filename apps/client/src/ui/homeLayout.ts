// Pure layout rules for the Home Dojo screens (no Phaser), so tests can check what they do: gear rarity order,
// short Gate lock labels and the kata step layout. Moved out of HomeScene.ts (Nov 24 night) unchanged.
import type { GearItem, RequirementStatus } from '@dojo/sim';

/** Where a rarity sorts: common first, legendary last. */
export function RARITY_ORDER(item: GearItem): number {
  return ['common', 'uncommon', 'rare', 'epic', 'legendary'].indexOf(item.rarity);
}

/** A short label for a Gate lock: "Basic Form 1", "Defense 6", "Kick 2". */
export function shortName(r: RequirementStatus): string {
  return r.name.replace('Self-Defense ', 'Defense ').replace('Kick Combo ', 'Kick ');
}

/** S3-P1b kata step layout, in screen points. */
/** Room for the step number: about 8 points a digit plus a gap. */
export const numW = (n: string): number => 10 + 8 * n.length;
export const KATA_ARROW_W = 16;
const KATA_GAP = 10;
export const KATA_LINE = 22;
const GLYPH_DIR: Record<string, 'up' | 'down' | 'left' | 'right'> = { '↑': 'up', '↓': 'down', '←': 'left', '→': 'right' };
export interface KataCell {
  n: string;
  arrows: Array<'up' | 'down' | 'left' | 'right'>;
  x: number;
  y: number;
}
/** Lays out kataArrows' text ("1 ←   2 →") step by step, wrapping at width. */
export function kataLayout(line: string, width: number): KataCell[] {
  let x = 0;
  let y = 0;
  return line.split(/\s{3}/).filter(Boolean).map((c) => {
    const [n, a = ''] = c.trim().split(/\s+/);
    const arrows = [...a].map((ch) => GLYPH_DIR[ch]).filter(Boolean);
    const w = numW(n) + arrows.length * KATA_ARROW_W;
    if (x > 0 && x + w > width) {
      x = 0;
      y += KATA_LINE;
    }
    const cell = { n, arrows, x, y };
    x += w + KATA_GAP;
    return cell;
  });
}
export function kataLines(line: string, width: number): number {
  const cells = kataLayout(line, width);
  return cells.length ? cells[cells.length - 1].y / KATA_LINE + 1 : 1;
}
