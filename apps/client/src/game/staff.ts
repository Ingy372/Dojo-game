// The Action Zone staff (Jay, Nov 23): real instructors standing in the game, starting with Hannah behind the pro
// shop counter. Who they are, where they stand and what they say live in content/dojo/action-zone/staff.json.
import Phaser from 'phaser';
import { characterArt } from '../art/art';
import { LayeredSprite } from '../art/LayeredSprite';
import { addShadow } from '../art/player';
import RAW from '../../../../content/dojo/action-zone/staff.json';

export type StaffLine = 'hello' | 'bye' | 'bought' | 'sold';

export interface StaffMember {
  id: string;
  name: string;
  pack: string;
  room: string;
  spot: [number, number];
  facing: string;
  role: string;
  hello: string[];
  bye: string[];
  bought: string[];
  sold: string[];
}

const DIRS = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];

function check(raw: unknown): StaffMember[] {
  const list = (raw as { staff?: unknown }).staff;
  if (!Array.isArray(list)) throw new Error('staff.json: "staff" must be a list');
  return list.map((s: Record<string, unknown>) => {
    const id = String(s.id);
    const lines = (k: StaffLine) => {
      const v = s[k];
      if (!Array.isArray(v) || v.length === 0 || v.some((l) => typeof l !== 'string' || !l.trim())) throw new Error(`staff.json: ${id}.${k} needs at least one line`);
      return v as string[];
    };
    const spot = s.spot as unknown;
    if (!Array.isArray(spot) || spot.length !== 2 || !spot.every((n) => typeof n === 'number')) throw new Error(`staff.json: ${id}.spot must be [x, y]`);
    if (!DIRS.includes(String(s.facing))) throw new Error(`staff.json: ${id}.facing must be one of ${DIRS.join(', ')}`);
    return {
      id,
      name: String(s.name),
      pack: String(s.pack),
      room: String(s.room),
      spot: spot as [number, number],
      facing: String(s.facing),
      role: String(s.role),
      hello: lines('hello'),
      bye: lines('bye'),
      bought: lines('bought'),
      sold: lines('sold'),
    };
  });
}

export const STAFF = check(RAW);

export const staffIn = (room: string) => STAFF.filter((s) => s.room === room);

/** One of a staff member's lines of a kind; `n` picks which (the scene counts visits, so lines take turns). */
export const staffLine = (s: StaffMember, kind: StaffLine, n: number) => s[kind][((n % s[kind].length) + s[kind].length) % s[kind].length];

/** The direction row of a facing letter (the art's rows are N, NE, E, SE, S, SW, W, NW). */
export const staffDirection = (facing: string) => Math.max(0, DIRS.indexOf(facing));

/** A staff member's sprite, playing their relaxed idle, or null if the art isn't loaded yet. */
export function makeStaffSprite(scene: Phaser.Scene, s: StaffMember): LayeredSprite | null {
  const art = characterArt(scene, s.pack, 'staff');
  if (!art) return null;
  const sprite = new LayeredSprite(scene, art);
  sprite.container.addAt(addShadow(scene, art.frameWidth * 0.42), 0);
  sprite.setDirection(staffDirection(s.facing)).play('npc_idle');
  sprite.autoUpdate();
  return sprite;
}
