/**
 * Grok playtest Nov 25 (B7): after a room clear, a tap on (or near) an open door picks that door, so the hero
 * walks all the way in on one tap. Before, a tap on the door's art (which rises into the wall) or its label
 * picked the nearest floor spot, which could stop just short or one tile to the side, and the camera moved
 * the door before the next tap.
 *
 * All sizes are room tiles. A door's position is the middle of its wall cell; its art stands on the wall's
 * bottom edge and rises about two tiles, and its label sits just under it on the floor.
 */
export interface DoorTapZone {
  /** How far left or right of the door's middle still counts (the art is ~1.2 tiles wide, plus room for a finger). */
  side: number;
  /** How far above the door's middle still counts (the art and the plaque over it). */
  above: number;
  /** How far below the door's middle still counts (its label and the floor in front of it). */
  below: number;
}

export const DOOR_TAP_ZONE: DoorTapZone = { side: 1.0, above: 2.6, below: 1.6 };

/** How far around a door's label (tiles) a tap still counts as tapping it. */
export const DOOR_LABEL_PAD = 0.6;

/** An open door (room tiles), and where its label is drawn right now. */
export interface TapDoor {
  x: number;
  y: number;
  /**
   * On a small screen the door itself can sit above the view and its label is pushed down onto the floor
   * (clampDoorLabels), so a tap on the label must pick the door too.
   */
  label?: { left: number; top: number; right: number; bottom: number };
}

/** The open door a tap picks (the nearest one whose zone or label holds the tap), or null for a tap anywhere else. */
export function doorForTap<T extends TapDoor>(tap: { x: number; y: number }, doors: readonly T[], zone: DoorTapZone = DOOR_TAP_ZONE): T | null {
  let best: T | null = null;
  let bestD = Infinity;
  for (const d of doors) {
    const dx = tap.x - d.x;
    const dy = tap.y - d.y;
    const nearDoor = Math.abs(dx) <= zone.side && dy >= -zone.above && dy <= zone.below;
    const l = d.label;
    const onLabel = !!l && tap.x >= l.left - DOOR_LABEL_PAD && tap.x <= l.right + DOOR_LABEL_PAD && tap.y >= l.top - DOOR_LABEL_PAD && tap.y <= l.bottom + DOOR_LABEL_PAD;
    if (!nearDoor && !onLabel) continue;
    // A tap on a label is as good as a tap on its door.
    const dist = onLabel ? 0 : Math.hypot(dx, dy);
    if (dist < bestD) {
      bestD = dist;
      best = d;
    }
  }
  return best;
}
