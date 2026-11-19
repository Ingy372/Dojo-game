// The town (Nov 18, Jay: "bigger, very martial artsy, sakura trees, and it gets nicer and nicer as you play").
// One walk grid plus the standing pieces (buildings, trees, lanterns, gates). Each piece shows from a stage and
// may be replaced at a later one; the stage is the student's real belt tier (core-design 12: "new districts open
// as the Tower's light returns with each real promotion"). Nothing is ever taken away for missing class.
import { loadRoom, type Room } from './room';

export type TileRect = [x0: number, x1: number, y0: number, y1: number];

export interface TownDoor {
  label: string;
  enterRect: TileRect;
  spawn: [number, number];
  cue: [number, number];
}

export interface TownPiece {
  id: string;
  stage: number;
  until?: number;
  /** Walk cells [col, row] the piece fills while it shows. */
  block?: [number, number][];
}

export interface TownWalk {
  id: string;
  name: string;
  tiles: string[];
  pieces: TownPiece[];
  homeDoor: TownDoor;
  dojoDoor: TownDoor;
  /** The highest stage the town has art for. */
  maxStage: number;
}

export class TownError extends Error {
  constructor(message: string) {
    super(`town: ${message}`);
  }
}

const isRect = (v: unknown): v is TileRect => Array.isArray(v) && v.length === 4 && v.every((n) => typeof n === 'number');
const isPair = (v: unknown): v is [number, number] => Array.isArray(v) && v.length === 2 && v.every((n) => typeof n === 'number');

function door(raw: unknown, name: string): TownDoor {
  const d = raw as Record<string, unknown> | undefined;
  if (!d || typeof d.label !== 'string' || !isRect(d.enterRect) || !isPair(d.spawn) || !isPair(d.cue)) {
    throw new TownError(`"${name}" needs a label, an enterRect [x0, x1, y0, y1], a spawn and a cue`);
  }
  return { label: d.label, enterRect: d.enterRect, spawn: d.spawn, cue: d.cue };
}

/** Reads and checks content/dojo/action-zone/town-walk.json. */
export function loadTownWalk(data: unknown): TownWalk {
  const raw = data as Record<string, unknown>;
  if (!raw || !Array.isArray(raw.tiles) || !Array.isArray(raw.pieces)) throw new TownError('"tiles" and "pieces" must be lists');
  const tiles = raw.tiles as string[];
  const width = tiles[0]?.length ?? 0;
  const pieces = (raw.pieces as Record<string, unknown>[]).map((p): TownPiece => {
    if (typeof p.id !== 'string' || typeof p.stage !== 'number' || p.stage < 1) throw new TownError(`a piece needs an id and a stage of 1 or more (${JSON.stringify(p)})`);
    if (p.until !== undefined && (typeof p.until !== 'number' || p.until <= p.stage)) throw new TownError(`${p.id}: "until" must come after its stage`);
    const block = (p.block as unknown[] | undefined) ?? [];
    for (const c of block) {
      if (!isPair(c) || c[0] < 0 || c[0] >= width || c[1] < 0 || c[1] >= tiles.length) throw new TownError(`${p.id}: blocked cell ${JSON.stringify(c)} is outside the town`);
    }
    return { id: p.id, stage: p.stage, until: p.until as number | undefined, block: block as [number, number][] };
  });
  const walk: TownWalk = {
    id: typeof raw.id === 'string' ? raw.id : 'town-walk',
    name: typeof raw.name === 'string' ? raw.name : 'Town',
    tiles: raw.tiles as string[],
    pieces,
    homeDoor: door(raw.homeDoor, 'homeDoor'),
    dojoDoor: door(raw.dojoDoor, 'dojoDoor'),
    maxStage: Math.max(1, ...pieces.map((p) => p.stage)),
  };
  townRoom(walk, 1); // throws if the grid is broken
  return walk;
}

/** The town's stage for a real belt tier (1 = first belt). Black belt degrees keep the last stage. */
export function townStage(walk: TownWalk, beltTier: number): number {
  return Math.max(1, Math.min(walk.maxStage, Math.floor(beltTier) || 1));
}

/** True when a piece shows at this stage. */
export function pieceShown(piece: { stage: number; until?: number }, stage: number): boolean {
  return piece.stage <= stage && (piece.until === undefined || stage < piece.until);
}

/** The walk grid at a stage: the open ground minus the cells of every piece that shows. */
export function townTiles(walk: TownWalk, stage: number): string[] {
  const grid = walk.tiles.map((row) => row.split(''));
  for (const p of walk.pieces) {
    if (!pieceShown(p, stage)) continue;
    for (const [c, r] of p.block ?? []) grid[r][c] = '#';
  }
  return grid.map((row) => row.join(''));
}

/** The sim room for the town at a stage. */
export function townRoom(walk: TownWalk, stage: number): Room {
  // The room needs a player start: where you come out of your own dojo (the scenes place the hero themselves).
  const tiles = townTiles(walk, stage).map((row) => row.split(''));
  tiles[Math.floor(walk.homeDoor.spawn[1])][Math.floor(walk.homeDoor.spawn[0])] = 'P';
  return loadRoom({ id: walk.id, name: walk.name, tiles: tiles.map((row) => row.join('')) });
}
