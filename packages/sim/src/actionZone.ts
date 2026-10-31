// The Action Zone dojo (A4-DOJO): the inside room's walk grid, door, spawn and walk-up spots.
// The data file is content/dojo/action-zone/inside-room.json (made by the Artist, copied unchanged).

import type { Vec2 } from './math';
import type { Room } from './room';

export type Rect = readonly [x0: number, x1: number, y0: number, y1: number];

/** A spot to walk up to (the pro counter, a heavy bag, the parent seats...). No behaviour yet. */
export interface WalkUpSpot {
  id: string;
  kind: string;
  /** The tile to stand on, and the way to face when there. */
  approachTile: Vec2;
  approachFacing: 'north' | 'south' | 'east' | 'west';
  /** The object's footprint on the floor, in tiles: [x0, x1, y0, y1]. */
  footprint: Rect;
}

/** A sprite drawn above the characters that stand north of its sortRow (seat backs, bag tops). */
export interface ForegroundSprite {
  id: string;
  sortRow: number;
}

export interface InsideRoom {
  /** The sim room: walls from the grid, the hero starts at the spawn. */
  room: Room;
  spawn: Vec2;
  /** Walking into this rectangle (tiles: [x0, x1, y0, y1]) leaves the room. */
  exit: Rect;
  spots: WalkUpSpot[];
  foregroundSprites: ForegroundSprite[];
}

export class ActionZoneError extends Error {
  constructor(problem: string) {
    super(`Action Zone inside room has a problem: ${problem}`);
    this.name = 'ActionZoneError';
  }
}

const FACINGS = ['north', 'south', 'east', 'west'];

function fail(problem: string): never {
  throw new ActionZoneError(problem);
}

function num(v: unknown, what: string): number {
  if (typeof v !== 'number' || !Number.isFinite(v)) fail(`${what} must be a number`);
  return v;
}

function rect(v: unknown, what: string): Rect {
  if (!Array.isArray(v) || v.length !== 4) fail(`${what} must be 4 numbers`);
  return [num(v[0], what), num(v[1], what), num(v[2], what), num(v[3], what)];
}

function cell(v: unknown, what: string): Vec2 {
  if (!Array.isArray(v) || v.length !== 2) fail(`${what} must be a tile [col, row]`);
  return { x: num(v[0], what), y: num(v[1], what) };
}

/** Checks the inside-room file and turns it into a sim Room plus the door, spawn and spots. */
export function loadInsideRoom(data: unknown): InsideRoom {
  const raw = (data ?? {}) as Record<string, unknown>;
  const tiles = raw.tiles;
  if (!Array.isArray(tiles) || !tiles.every((r) => typeof r === 'string') || tiles.length === 0) fail('"tiles" must be rows of text');
  const rows = tiles as string[];
  const [width, height] = (raw.gridSize ?? []) as number[];
  if (rows.length !== height || rows.some((r) => r.length !== width)) fail(`"tiles" must be ${width} x ${height}`);
  if (typeof raw.walkableChars !== 'string') fail('"walkableChars" must be text');
  const walkable = raw.walkableChars;

  const walls = rows.map((r) => [...r].map((ch) => !walkable.includes(ch)));
  const open = (p: Vec2, what: string) => {
    if (walls[p.y]?.[p.x] !== false) fail(`${what} (${p.x}, ${p.y}) must be a walkable tile`);
  };

  const enter = cell((raw.spawn as { enter?: unknown } | undefined)?.enter, 'spawn.enter');
  open(enter, 'spawn');
  const exitRaw = (raw.exit ?? {}) as { cells?: unknown; rect?: unknown };
  if (!Array.isArray(exitRaw.cells) || exitRaw.cells.length === 0) fail('exit.cells must list the door cells');
  for (const c of exitRaw.cells) open(cell(c, 'exit cell'), 'exit cell');
  const exit = rect(exitRaw.rect, 'exit.rect');

  const spots = ((raw.interactables ?? []) as Record<string, unknown>[]).map((it) => {
    const id = String(it.id);
    const approachTile = cell(it.approachTile, `${id}.approachTile`);
    open(approachTile, `${id} approach tile`);
    if (!FACINGS.includes(String(it.approachFacing))) fail(`${id}.approachFacing must be north, south, east or west`);
    return { id, kind: String(it.kind), approachTile, approachFacing: it.approachFacing as WalkUpSpot['approachFacing'], footprint: rect(it.footprintRect, `${id}.footprintRect`) };
  });
  if (spots.length === 0) fail('no interactables');

  const foregroundSprites = ((raw.foregroundSprites ?? []) as Record<string, unknown>[]).map((s) => ({ id: String(s.id), sortRow: num(s.sortRow, `${String(s.id)}.sortRow`) }));

  const spawn = { x: enter.x + 0.5, y: enter.y + 0.5 };
  const door = { x: (exit[0] + exit[1]) / 2, y: exit[3] - 0.5 };
  const room: Room = {
    id: 'action-zone-inside',
    name: 'Action Zone',
    width,
    height,
    walls,
    playerStart: spawn,
    enemySpawns: [],
    kind: 'rest',
    doors: [door],
    chest: null,
    shrine: null,
    parSeconds: null,
    challenge: null,
    earliestRoom: 1,
    minBeltTier: 1,
    floorSet: null,
    goal: null,
    tutorial: false,
  };
  return { room, spawn, exit, spots, foregroundSprites };
}
