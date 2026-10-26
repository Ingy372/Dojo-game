// B-MASHER-d1: the words of the knock-out flow, picked from content/settings/knockout.json.
// Pure (no Phaser), so the tests can check every path.
import KO from '../../../../content/settings/knockout.json';

export { KO };

/** Screen 2's words: the title, the finds to sparkle, and Sensei's line (or the resting line). */
export function keptText(finds: readonly string[], resting: boolean): { title: string; finds: string[]; sensei: string } {
  return {
    title: finds.length ? KO.keptTitle : KO.keptNone,
    finds: [...finds],
    sensei: resting ? KO.restingLine : `Sensei: ${KO.keptSensei}`,
  };
}

/** Screen 3's one pointer: a real class first, then the next run. No next-run pointer once play time is up. */
export function homePointer(nextClassDay: string | null, playTimeUp: boolean): string | null {
  if (nextClassDay) return KO.pointerClass;
  return playTimeUp ? null : KO.pointerNext;
}
