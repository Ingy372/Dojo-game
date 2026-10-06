// Rooms are content (data files in content/rooms), checked here when loaded.
// Positions are measured in tiles: the top-left corner of the room is (0, 0)
// and the center of tile (column 3, row 2) is (3.5, 2.5).

import type { Vec2 } from './math';

const WALL = '#';
const FLOOR = '.';
const PLAYER_START = 'P';
/** A door slot in the outer wall. Doors stay shut (like walls) until the room is done. */
const DOOR = 'D';
/** Where the treasure chest appears (floor). */
const CHEST = 'C';
/** Where the rest shrine stands (floor). */
const SHRINE = 'S';
const ALLOWED = new Set([WALL, FLOOR, PLAYER_START, DOOR, CHEST, SHRINE]);

/** What a room is for. Practice rooms (like the training room) bring enemies back and have no doors. */
export type RoomKind = 'practice' | 'battle' | 'challenge' | 'treasure' | 'rest' | 'boss';
export const ROOM_KINDS: readonly RoomKind[] = ['practice', 'battle', 'challenge', 'treasure', 'rest', 'boss'];

export interface RoomChallenge {
  /** Clear the room within this many seconds for the better chest. */
  seconds: number;
  /** What the player is told, e.g. "Clear the room in 60 seconds!" */
  text: string;
}

export interface Room {
  id: string;
  name: string;
  width: number;
  height: number;
  /** walls[row][column] is true where a wall is. */
  walls: boolean[][];
  playerStart: Vec2;
  /** Where enemies start (centers of tiles), in the order listed in the file. */
  enemySpawns: EnemySpawn[];
  kind: RoomKind;
  /** Door slots (tile centers), left to right, then top to bottom. */
  doors: Vec2[];
  chest: Vec2 | null;
  shrine: Vec2 | null;
  /** A good clear time, for the room grade. */
  parSeconds: number;
  challenge: RoomChallenge | null;
}

export interface EnemySpawn {
  /** The enemy type's id, matching a file in content/enemies. */
  enemy: string;
  pos: Vec2;
}

export class RoomError extends Error {
  constructor(roomId: string, problem: string) {
    super(`Room "${roomId}" has a problem: ${problem}`);
    this.name = 'RoomError';
  }
}

/** Checks a room data file and turns it into a Room, or throws a clear RoomError. */
export function loadRoom(data: unknown): Room {
  if (typeof data !== 'object' || data === null) {
    throw new RoomError('?', 'the file is not a room object');
  }
  const raw = data as Record<string, unknown>;
  const id = typeof raw.id === 'string' && raw.id.length > 0 ? raw.id : '';
  if (!id) throw new RoomError('?', '"id" must be a non-empty text');
  if (typeof raw.name !== 'string' || raw.name.length === 0) {
    throw new RoomError(id, '"name" must be a non-empty text');
  }
  const tiles = raw.tiles;
  if (!Array.isArray(tiles) || tiles.length < 3 || !tiles.every((r) => typeof r === 'string')) {
    throw new RoomError(id, '"tiles" must be a list of at least 3 rows of text');
  }
  const rows = tiles as string[];
  const width = rows[0].length;
  const height = rows.length;
  if (width < 3) throw new RoomError(id, 'rows must be at least 3 tiles wide');

  const walls: boolean[][] = [];
  let playerStart: Vec2 | null = null;
  const doors: Vec2[] = [];
  let chest: Vec2 | null = null;
  let shrine: Vec2 | null = null;
  rows.forEach((row, y) => {
    if (row.length !== width) {
      throw new RoomError(id, `row ${y + 1} is ${row.length} tiles wide, but row 1 is ${width}`);
    }
    const wallRow: boolean[] = [];
    for (let x = 0; x < width; x++) {
      const ch = row[x];
      if (!ALLOWED.has(ch)) {
        throw new RoomError(id, `unknown tile "${ch}" at row ${y + 1}, column ${x + 1}`);
      }
      const onEdge = x === 0 || y === 0 || x === width - 1 || y === height - 1;
      const corner = (x === 0 || x === width - 1) && (y === 0 || y === height - 1);
      if (ch === DOOR) {
        if (!onEdge || corner) throw new RoomError(id, `a door "D" must be in the outer wall, not a corner (row ${y + 1}, column ${x + 1})`);
        doors.push({ x: x + 0.5, y: y + 0.5 });
      } else if (onEdge && ch !== WALL) {
        throw new RoomError(id, `the outer edge must be all walls or doors (row ${y + 1}, column ${x + 1})`);
      }
      if (ch === CHEST) {
        if (chest) throw new RoomError(id, 'there is more than one chest "C"');
        chest = { x: x + 0.5, y: y + 0.5 };
      }
      if (ch === SHRINE) {
        if (shrine) throw new RoomError(id, 'there is more than one shrine "S"');
        shrine = { x: x + 0.5, y: y + 0.5 };
      }
      if (ch === PLAYER_START) {
        if (playerStart) throw new RoomError(id, 'there is more than one player start "P"');
        playerStart = { x: x + 0.5, y: y + 0.5 };
      }
      wallRow.push(ch === WALL || ch === DOOR);
    }
    walls.push(wallRow);
  });
  if (!playerStart) throw new RoomError(id, 'there is no player start "P"');

  const enemySpawns = loadEnemySpawns(id, raw.enemies, walls, width, height);

  const kind = (raw.kind ?? 'practice') as RoomKind;
  if (!ROOM_KINDS.includes(kind)) throw new RoomError(id, `"kind" must be one of: ${ROOM_KINDS.join(', ')}`);
  const fights = kind === 'battle' || kind === 'challenge' || kind === 'boss';
  if (kind !== 'practice' && doors.length === 0) throw new RoomError(id, 'floor rooms need at least one door "D"');
  if (kind !== 'practice' && kind !== 'boss' && doors.length < 3) {
    throw new RoomError(id, 'this kind of room needs 3 door slots "D" (for up to 3 door choices)');
  }
  if (fights && enemySpawns.length === 0) throw new RoomError(id, `a ${kind} room needs enemies`);
  if (!fights && kind !== 'practice' && enemySpawns.length > 0) throw new RoomError(id, `a ${kind} room can't have enemies`);
  if ((kind === 'treasure' || kind === 'challenge' || kind === 'boss') && !chest) {
    throw new RoomError(id, `a ${kind} room needs a chest "C"`);
  }
  if (kind === 'rest' && !shrine) throw new RoomError(id, 'a rest room needs a shrine "S"');
  doors.sort((a, b) => a.y - b.y || a.x - b.x);

  let parSeconds = 60;
  if (raw.parSeconds !== undefined) {
    if (typeof raw.parSeconds !== 'number' || !(raw.parSeconds > 0)) throw new RoomError(id, '"parSeconds" must be a number above 0');
    parSeconds = raw.parSeconds;
  }
  let challenge: RoomChallenge | null = null;
  if (kind === 'challenge') {
    const c = raw.challenge as Record<string, unknown> | undefined;
    if (!c || typeof c.seconds !== 'number' || !(c.seconds > 0) || typeof c.text !== 'string') {
      throw new RoomError(id, 'a challenge room needs "challenge": { "seconds": number, "text": "..." }');
    }
    challenge = { seconds: c.seconds, text: c.text };
  }

  return { id, name: raw.name, width, height, walls, playerStart, enemySpawns, kind, doors, chest, shrine, parSeconds, challenge };
}

/**
 * Which door slots to use when offering `count` doors: spread out evenly
 * (one door uses the middle slot; two use the outer slots).
 */
export function activeDoorSlots(room: Room, count: number): number[] {
  const n = room.doors.length;
  const c = Math.min(count, n);
  if (c <= 0) return [];
  if (c === 1) return [Math.floor((n - 1) / 2)];
  const out: number[] = [];
  for (let i = 0; i < c; i++) out.push(Math.round((i * (n - 1)) / (c - 1)));
  return out;
}

/** Reads the optional "enemies" list. Column and row count from 1, like the error messages. */
function loadEnemySpawns(id: string, data: unknown, walls: boolean[][], width: number, height: number): EnemySpawn[] {
  if (data === undefined) return [];
  if (!Array.isArray(data)) throw new RoomError(id, '"enemies" must be a list');
  return data.map((item, i) => {
    const e = item as Record<string, unknown>;
    const n = i + 1;
    if (typeof e !== 'object' || e === null || typeof e.enemy !== 'string' || e.enemy.length === 0) {
      throw new RoomError(id, `enemy ${n} needs an "enemy" type`);
    }
    const col = e.column;
    const row = e.row;
    if (typeof col !== 'number' || typeof row !== 'number' || !Number.isInteger(col) || !Number.isInteger(row)) {
      throw new RoomError(id, `enemy ${n} needs a whole-number "column" and "row"`);
    }
    if (col < 1 || row < 1 || col > width || row > height || walls[row - 1][col - 1]) {
      throw new RoomError(id, `enemy ${n} must stand on a floor tile (row ${row}, column ${col} isn't one)`);
    }
    return { enemy: e.enemy, pos: { x: col - 0.5, y: row - 0.5 } };
  });
}

/** True if the tile at (column, row) is a wall. Anything outside the room counts as wall. */
export function isWallTile(room: Room, col: number, row: number): boolean {
  if (col < 0 || row < 0 || col >= room.width || row >= room.height) return true;
  return room.walls[row][col];
}
