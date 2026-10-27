// R-CHALLENGE P7: the §4b "L+B (recommended)" Challenge row (drafts/planning/R-CHALLENGE-PATTERNS.md),
// win % per belt 4-10 at 40 seeds. The BALANCE=1 table warns when a real-content cell misses it by more than 5.
export const LB_TARGET: Record<'kid' | 'newer' | 'careful', number[]> = {
  kid: [28, 43, 38, 25, 33, 30, 30],
  newer: [100, 100, 100, 100, 100, 100, 100],
  careful: [100, 100, 100, 100, 100, 100, 100],
};
export const TARGET_TOLERANCE = 5;

/** Warnings for cells (belts 4-10) whose win % is more than TARGET_TOLERANCE points off the L+B row. */
export function targetWarnings(bot: keyof typeof LB_TARGET, wins: number[]): string[] {
  const out: string[] = [];
  wins.forEach((w, i) => {
    const t = LB_TARGET[bot][i];
    if (Math.abs(w - t) > TARGET_TOLERANCE) out.push(`WARN Challenge ${bot} b${i + 4}: ${w}% vs L+B target ${t}% (off by ${w - t > 0 ? '+' : ''}${w - t})`);
  });
  return out;
}
