// Rooms are content (data files in content/rooms), checked here when loaded.
// Positions are measured in tiles: the top-left corner of the room is (0, 0)
// and the center of tile (column 3, row 2) is (3.5, 2.5).

import type { Vec2 } from './math';

const WALL = '#';
const FLOOR = '.';
const PLAYER_START = 'P';
const ALLOWED = new Set([WALL, FLOOR, PLAYER_START]);

export interface Room {
  id: string;
  name: string;
  width: number;
  height: number;
  /** walls[row][column] is true where a wall is. */
  walls: boolean[][];
  playerStart: Vec2;
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
      if (onEdge && ch !== WALL) {
        throw new RoomError(id, `the outer edge must be all walls (row ${y + 1}, column ${x + 1})`);
      }
      if (ch === PLAYER_START) {
        if (playerStart) throw new RoomError(id, 'there is more than one player start "P"');
        playerStart = { x: x + 0.5, y: y + 0.5 };
      }
      wallRow.push(ch === WALL);
    }
    walls.push(wallRow);
  });
  if (!playerStart) throw new RoomError(id, 'there is no player start "P"');

  return { id, name: raw.name, width, height, walls, playerStart };
}

/** True if the tile at (column, row) is a wall. Anything outside the room counts as wall. */
export function isWallTile(room: Room, col: number, row: number): boolean {
  if (col < 0 || row < 0 || col >= room.width || row >= room.height) return true;
  return room.walls[row][col];
}
