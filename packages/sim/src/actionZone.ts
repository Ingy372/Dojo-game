// The Action Zone dojo (A4-DOJO): the inside room's walk grid, door, spawn and walk-up spots,
// the outside entrance (A4-DOJO-ii) and the town picture.
// The inside file is content/dojo/action-zone/inside-room.json (made by the Artist, copied unchanged).
// The outside file is content/dojo/action-zone/outside-room.json (made from the Artist's outside-entrance.json)
// and the town file is content/dojo/action-zone/town.json.

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
    super(`Action Zone data has a problem: ${problem}`);
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

export type ZoneFacing = 'north' | 'south' | 'east' | 'west';

/** Where a place in the Action Zone leads to when you leave it. */
export type OutsideTarget = 'town';

export interface OutsideExit {
  id: string;
  /** Walking into this rectangle (tiles: [x0, x1, y0, y1]) leaves. */
  rect: Rect;
  to: OutsideTarget;
}

export interface OutsideRoom {
  /** The sim room: the walk grid made from the artist's blockers, with the walkway to the door opened. */
  room: Room;
  /** Where the hero stands when arriving from the town, and when coming out of the dojo. */
  spawnFromTown: { pos: Vec2; facing: ZoneFacing };
  spawnFromInside: { pos: Vec2; facing: ZoneFacing };
  frontDoor: {
    /** The tap area of the double doors, in tiles: [x0, x1, y0, y1] (the art file gives it in pixels). */
    tapRect: Rect;
    approachTile: Vec2;
    approachFacing: ZoneFacing;
    /** Standing here (the doorstep) goes inside. */
    enterRect: Rect;
  };
  exits: OutsideExit[];
}

const FACING_LIST: readonly string[] = FACINGS;

function facing(v: unknown, what: string): ZoneFacing {
  if (!FACING_LIST.includes(String(v))) fail(`${what} must be north, south, east or west`);
  return v as ZoneFacing;
}

/** Checks the outside-entrance file and turns it into a sim Room plus the front door, spawns and exits. */
export function loadOutsideRoom(data: unknown): OutsideRoom {
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
    const spot = walls[Math.floor(p.y)]?.[Math.floor(p.x)];
    if (spot !== false) fail(`${what} (${p.x}, ${p.y}) must be on a walkable tile`);
  };

  const spawnRaw = (raw.spawn ?? {}) as Record<string, { pos?: unknown; facing?: unknown } | undefined>;
  const spawnOf = (key: string) => {
    const pos = cell(spawnRaw[key]?.pos, `spawn.${key}.pos`);
    open(pos, `spawn.${key}`);
    return { pos, facing: facing(spawnRaw[key]?.facing, `spawn.${key}.facing`) };
  };
  const spawnFromTown = spawnOf('fromTown');
  const spawnFromInside = spawnOf('fromInside');

  const doorRaw = (raw.frontDoor ?? {}) as Record<string, unknown>;
  const approachTile = cell(doorRaw.approachTile, 'frontDoor.approachTile');
  open(approachTile, 'frontDoor approach tile');
  const [px0, py0, px1, py1] = rect(doorRaw.tapRectPx, 'frontDoor.tapRectPx');
  const ppt = num(raw.pixelsPerTile, 'pixelsPerTile');
  const [ox, oy] = (raw.tile00Px ?? []) as number[];
  const tapRect: Rect = [(px0 - num(ox, 'tile00Px')) / ppt, (px1 - ox) / ppt, (py0 - num(oy, 'tile00Px')) / ppt, (py1 - oy) / ppt];
  const enterRect = rect(doorRaw.enterRect, 'frontDoor.enterRect');
  open({ x: (enterRect[0] + enterRect[1]) / 2, y: (enterRect[2] + enterRect[3]) / 2 }, 'frontDoor enterRect centre');

  const exitList = raw.exits;
  if (!Array.isArray(exitList) || exitList.length === 0) fail('"exits" must list the way back to the town');
  const exits = exitList.map((e: Record<string, unknown>) => {
    const to = String(e.to);
    if (to !== 'town') fail(`exit ${String(e.id)} leads to "${to}", which is not the town`);
    return { id: String(e.id), rect: rect(e.rect, `exit ${String(e.id)} rect`), to } as OutsideExit;
  });

  const room: Room = {
    id: 'action-zone-outside',
    name: 'Action Zone',
    width,
    height,
    walls,
    playerStart: spawnFromTown.pos,
    enemySpawns: [],
    kind: 'rest',
    doors: [],
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
  return { room, spawnFromTown, spawnFromInside, frontDoor: { tapRect, approachTile, approachFacing: facing(doorRaw.approachFacing, 'frontDoor.approachFacing'), enterRect }, exits };
}

export interface TownPicture {
  /** The picture's size in its own pixels (the 1x picture, 40 px per town tile). */
  pictureSize: readonly [number, number];
  /** The Action Zone building: tap it to walk up to it. In picture pixels: [x0, y0, x1, y1]. */
  dojo: { id: string; tapRect: readonly [number, number, number, number]; to: 'outside' };
}

/** Checks the town file: one picture and the one building you can tap. */
export function loadTown(data: unknown): TownPicture {
  const raw = (data ?? {}) as Record<string, unknown>;
  const size = (raw.pictureSize ?? []) as unknown[];
  if (size.length !== 2) fail('"pictureSize" must be [width, height]');
  const pictureSize = [num(size[0], 'pictureSize'), num(size[1], 'pictureSize')] as const;
  const d = (raw.dojo ?? {}) as Record<string, unknown>;
  const [x0, y0, x1, y1] = rect(d.tapRect, 'dojo.tapRect');
  if (!(x0 >= 0 && y0 >= 0 && x1 <= pictureSize[0] && y1 <= pictureSize[1] && x0 < x1 && y0 < y1)) fail('dojo.tapRect must lie inside the picture');
  if (d.to !== 'outside') fail('dojo.to must be "outside"');
  return { pictureSize, dojo: { id: String(d.id), tapRect: [x0, y0, x1, y1], to: 'outside' } };
}
