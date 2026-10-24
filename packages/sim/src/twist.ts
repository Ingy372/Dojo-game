// Room twists (S1 #4): one simple, friendly rule for some Tower rooms, from content/twists/twists.json.

export type TwistIcon = 'lantern' | 'ice' | 'bell';

export interface TwistDef {
  id: string;
  name: string;
  icon: TwistIcon;
  /** Shown on the banner when the room starts. */
  banner: string;
  /** Sensei says this out loud (one line). */
  sensei: string;
  /** The room is dim (the warning circles are drawn extra bright on top). */
  dim: boolean;
  /** Dash distance is multiplied by this (1 = normal). */
  dashScale: number;
  /** Perfect Counters ring a bell; this many bells give a bonus prize (0 = no bells). */
  bells: number;
  /** The first room of a floor this twist can show up in (1 = any room; room 1 never has a twist anyway). */
  earliestRoom: number;
}

export interface TwistContent {
  /** Chance that an eligible room gets a twist. */
  chance: number;
  twists: TwistDef[];
}

const ICONS: TwistIcon[] = ['lantern', 'ice', 'bell'];

export function loadTwists(data: unknown): TwistContent {
  const d = data as { chance?: unknown; twists?: unknown };
  if (typeof d?.chance !== 'number' || d.chance < 0 || d.chance > 1) throw new Error('Twists: "chance" must be a number from 0 to 1');
  if (!Array.isArray(d.twists) || d.twists.length === 0) throw new Error('Twists: "twists" must be a list');
  const twists = (d.twists as Record<string, unknown>[]).map((t): TwistDef => {
    const id = String(t?.id ?? '');
    for (const k of ['id', 'name', 'banner', 'sensei']) {
      if (typeof t?.[k] !== 'string' || !(t[k] as string)) throw new Error(`Twist "${id}": "${k}" must be text`);
    }
    if (!ICONS.includes(t.icon as TwistIcon)) throw new Error(`Twist "${id}": "icon" must be one of ${ICONS.join(', ')}`);
    const earliestRoom = t.earliestRoom ?? 1;
    if (typeof earliestRoom !== 'number' || !Number.isInteger(earliestRoom) || earliestRoom < 1) {
      throw new Error(`Twist "${id}": "earliestRoom" must be a whole number, 1 or more`);
    }
    return {
      id,
      earliestRoom,
      name: t.name as string,
      icon: t.icon as TwistIcon,
      banner: t.banner as string,
      sensei: t.sensei as string,
      dim: t.dim === true,
      dashScale: typeof t.dashScale === 'number' ? t.dashScale : 1,
      bells: typeof t.bells === 'number' ? t.bells : 0,
    };
  });
  return { chance: d.chance, twists };
}
