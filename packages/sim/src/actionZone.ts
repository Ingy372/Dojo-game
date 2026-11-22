// The Action Zone dojo (A4-DOJO): the inside room's walk grid, door, spawn and walk-up spots,
// the outside entrance (A4-DOJO-ii) and the town picture.
// The inside file is content/dojo/action-zone/inside-room.json (made by the Artist, copied unchanged).
// The outside file is content/dojo/action-zone/outside-room.json (made from the Artist's outside-entrance.json)
// and the town file is content/dojo/action-zone/town.json.

import type { Vec2 } from './math';
import type { Room } from './room';

export type Rect = readonly [x0: number, x1: number, y0: number, y1: number];

/**
 * A spot to walk up to (the pro counter, a heavy bag, the parent seats...). Nov 20 (Jay): kinds with behaviour are
 * "read" (a wall board shown large: `image`), "target-wall" (the throwing star game) and "heavy-bag" (bag practice).
 */
export interface WalkUpSpot {
  id: string;
  kind: string;
  /** For "read" spots: the picture to show large (a file under assets/boards/, without the extension). */
  image?: string;
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
  /** Where the hero bows on and off the mat (Jay, Nov 20); null when the room has no mat line. */
  matBow: MatBow | null;
  /** Nov 20 (Jay): the middle of the school logo on the floor, where "Practice Kata" is offered; null if the room has none. */
  kataSpot: KataSpot | null;
}

/** A circle on the floor (tiles): standing inside it offers kata practice. */
export interface KataSpot {
  center: Vec2;
  radius: number;
}

/**
 * The mat's edge (Jay, Nov 20): the hero bows, facing the mat, before stepping on and again before stepping off.
 * `line` is the row edge (tiles) between the mat (north, smaller y) and the lobby; `gaps` are the openings onto
 * the mat, as [x0, x1] in tiles.
 */
export interface MatBow {
  line: number;
  gaps: [number, number][];
}

/** Where the hero stands about the mat: on it or not, and whether it has just bowed to step on or off. */
export interface MatGate {
  onMat: boolean;
  /** Bowed at the edge, facing the mat: may step on. */
  mayEnter: boolean;
  /** Bowed at the edge, turned to face the mat: may step off. */
  mayLeave: boolean;
}

/** How close to the line (tiles) the hero must stand for the Bow button. */
export const MAT_BOW_REACH = 0.9;
/** A bow is forgotten once the hero walks this far back from the line without crossing it. */
export const MAT_BOW_FORGET = 1.6;

export function newMatGate(onMat = false): MatGate {
  return { onMat, mayEnter: false, mayLeave: false };
}

/** True when x is inside one of the mat's openings. */
export function inMatGap(bow: MatBow, x: number): boolean {
  return bow.gaps.some(([x0, x1]) => x >= x0 && x <= x1);
}

/**
 * After each step: a hero that has not bowed is held at the line (the mat's edge); one that has bowed crosses,
 * and the bow is used up. Changes `gate` and `pos` in place. Returns true when the hero was held back this step.
 */
export function holdAtMat(bow: MatBow, gate: MatGate, pos: Vec2): boolean {
  if (!gate.onMat) {
    if (pos.y < bow.line) {
      if (gate.mayEnter) {
        gate.onMat = true;
        gate.mayEnter = false;
        return false;
      }
      pos.y = bow.line;
      return true;
    }
    if (pos.y - bow.line > MAT_BOW_FORGET) gate.mayEnter = false;
    return false;
  }
  if (pos.y > bow.line) {
    if (gate.mayLeave) {
      gate.onMat = false;
      gate.mayLeave = false;
      return false;
    }
    pos.y = bow.line;
    return true;
  }
  if (bow.line - pos.y > MAT_BOW_FORGET) gate.mayLeave = false;
  return false;
}

/** Which bow the hero can make where it stands: "enter" (facing the mat to step on), "leave" (turn and bow to step off), or none. */
export function matBowHere(bow: MatBow, gate: MatGate, pos: Vec2): 'enter' | 'leave' | null {
  if (!inMatGap(bow, pos.x)) return null;
  if (!gate.onMat) return !gate.mayEnter && pos.y >= bow.line && pos.y - bow.line <= MAT_BOW_REACH ? 'enter' : null;
  return !gate.mayLeave && pos.y <= bow.line && bow.line - pos.y <= MAT_BOW_REACH ? 'leave' : null;
}

/** The bow was made: the hero may now cross. */
export function bowAtMat(gate: MatGate, which: 'enter' | 'leave'): void {
  if (which === 'enter') gate.mayEnter = true;
  else gate.mayLeave = true;
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
    const image = it.image === undefined || it.image === null ? undefined : String(it.image);
    if (it.kind === 'read' && !image) fail(`${id} is a "read" spot, so it needs an "image"`);
    return {
      id,
      kind: String(it.kind),
      approachTile,
      approachFacing: it.approachFacing as WalkUpSpot['approachFacing'],
      footprint: rect(it.footprintRect, `${id}.footprintRect`),
      ...(image ? { image } : {}),
    };
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
    stoneWaves: [],
  };
  let matBow: MatBow | null = null;
  if (raw.matBow !== undefined) {
    const m = raw.matBow as { line?: unknown; gaps?: unknown };
    const line = num(m.line, 'matBow.line');
    if (!Array.isArray(m.gaps) || m.gaps.length === 0) fail('matBow.gaps must list the openings onto the mat');
    const gaps = (m.gaps as unknown[]).map((g, i) => {
      if (!Array.isArray(g) || g.length !== 2) fail(`matBow.gaps[${i}] must be [x0, x1]`);
      const x0 = num(g[0], `matBow.gaps[${i}]`);
      const x1 = num(g[1], `matBow.gaps[${i}]`);
      if (x1 <= x0) fail(`matBow.gaps[${i}] must go left to right`);
      return [x0, x1] as [number, number];
    });
    matBow = { line, gaps };
  }
  let kataSpot: KataSpot | null = null;
  if (raw.kataSpot !== undefined) {
    const k = raw.kataSpot as { center?: unknown; radius?: unknown };
    if (!Array.isArray(k.center) || k.center.length !== 2) fail('kataSpot.center must be [x, y]');
    const c = k.center as unknown[];
    const radius = num(k.radius, 'kataSpot.radius');
    if (radius <= 0) fail('kataSpot.radius must be above 0');
    kataSpot = { center: { x: num(c[0], 'kataSpot.center[0]'), y: num(c[1], 'kataSpot.center[1]') }, radius };
  }
  return { room, spawn, exit, spots, foregroundSprites, matBow, kataSpot };
}

export type ZoneFacing = 'north' | 'south' | 'east' | 'west';

/** Where a place in the Action Zone leads to when you leave it. */
export type OutsideTarget = 'town';

export interface OutsideExit {
  id: string;
  /** Walking into this rectangle (tiles: [x0, x1, y0, y1]) leaves. */
  rect: Rect;
  to: OutsideTarget;
  /** The gold glow that marks it, in tiles: its centre and size. Its centre is always inside `rect`. */
  cue: { x: number; y: number; w: number; h: number };
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
    const id = String(e.id);
    const r = rect(e.rect, `exit ${id} rect`);
    const cueRaw = (e.cue ?? {}) as { center?: unknown; size?: unknown };
    const centre = cell(cueRaw.center, `exit ${id} cue.center`);
    const size = cell(cueRaw.size, `exit ${id} cue.size`);
    // The glow and the way out must line up: a tap on the middle of the glow has to leave.
    if (centre.x < r[0] || centre.x > r[1] || centre.y < r[2] || centre.y > r[3]) fail(`exit ${id}: the cue's centre must be inside the exit rectangle`);
    return { id, rect: r, to, cue: { x: centre.x, y: centre.y, w: size.x, h: size.y } } as OutsideExit;
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
    stoneWaves: [],
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

/**
 * True when the hero, standing inside `rect` (a doorstep), is being asked to go on through: a push of the
 * stick upward (north), or a tap that lands inside the same rectangle (a tap on the doors is sent to the
 * spot in front of them). Standing still, or any other tap or push, is not. A doorstep that has just been
 * walked out of uses this to open again only when asked, so coming out never bounces straight back in.
 */
export function wantsThrough(input: { kind: string; x?: number; y?: number }, pos: Vec2, rect: Rect): boolean {
  const inside = (p: { x: number; y: number }) => p.x >= rect[0] && p.x <= rect[1] && p.y >= rect[2] && p.y <= rect[3];
  if (!inside(pos)) return false;
  if (input.kind === 'stick') return (input.y ?? 0) < -0.3;
  if (input.kind === 'moveTo') return inside({ x: input.x ?? Number.NaN, y: input.y ?? Number.NaN });
  return false;
}
