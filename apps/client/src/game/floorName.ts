import floorSets from '../../../../content/settings/floor-sets.json';

/** The floor-set names from content/settings/floor-sets.json ("names"), by set id. */
const NAMES: Record<string, string> = ((floorSets as { names?: Record<string, unknown> }).names ?? {}) as Record<string, string>;

/**
 * Grok playtest Nov 25 (idea 2): the Tower HUD's floor line, "Floor 2 · Sunrise Garden".
 * The floor number is the belt tier; the name comes from the room's floor set in the data.
 * A room with no floor set, or a set with no name, shows the number only.
 */
export function floorLine(tier: number, floorSet: string | null, names: Record<string, unknown> = NAMES): string {
  const name = floorSet ? names[floorSet] : undefined;
  return typeof name === 'string' && name.trim() ? `Floor ${tier}  ·  ${name.trim()}` : `Floor ${tier}`;
}

/**
 * The floor set a belt tier plays (its own live room set, as run.ts picks rooms), or the room's own set,
 * so a shared room (a Challenge room, a ?room= test link) still shows its floor's name.
 */
export function floorSetFor(
  tier: number,
  roomSet: string | null,
  content: { rooms: readonly { floorSet: string | null; minBeltTier: number }[]; floorSets: Record<string, boolean> },
): string | null {
  const own = content.rooms.find((r) => r.floorSet !== null && content.floorSets[r.floorSet] && r.minBeltTier === tier);
  return own?.floorSet ?? roomSet;
}
