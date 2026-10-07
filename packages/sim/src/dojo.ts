// The Home Dojo (framework section 7): decorating, mess that builds while away, and
// cleaning. Plain data and pure rules: "now" is passed in, never read from a clock, and
// mess is placed with the seeded random number generator so a save replays exactly.
//
// Guardrails: mess is cosmetic and capped (about a week away), it never removes or
// damages anything, and it never blocks the Tower.

import { DOJO } from './config';
import type { Vec2 } from './math';
import { createRng, nextFloat, nextInt, type Rng } from './rng';
import { loadRoom, type Room, type RoomKind } from './room';

export type DecorationPlace = 'floor' | 'wall';
export type DecorationClean = 'mat' | 'rack';
export type DecorationSource = 'starter' | 'tower';

export interface DecorationDef {
  id: string;
  name: string;
  source: DecorationSource;
  place: DecorationPlace;
  width: number;
  height: number;
  /** The character can't walk through it. */
  solid: boolean;
  clean: DecorationClean | null;
  /** Placeholder look until the art pack. */
  shape: string;
  color: string;
}

export interface DojoContent {
  room: Room;
  /** The notice board's tile on the top wall (0-based). */
  board: { col: number; row: number };
  starter: Array<{ decoration: string; col: number; row: number }>;
  decorations: DecorationDef[];
  /** Chance that a chest also holds a decoration, by room kind. */
  dropChance: Partial<Record<RoomKind, number>>;
}

/** One decoration the player owns. Placed when col/row are set, otherwise in storage. */
export interface DojoItem {
  uid: string;
  id: string;
  col: number | null;
  row: number | null;
  /** Mats: scuffed, and how many wipe taps so far. */
  scuffed: boolean;
  wipes: number;
  /** Racks: weapons knocked crooked. */
  crooked: number;
}

/** A bit of dust or a fallen leaf on one floor tile. */
export interface MessSpot {
  id: number;
  col: number;
  row: number;
  kind: 'dust' | 'leaf';
  /** Small offset inside the tile so spots don't look like a grid (looks only). */
  dx: number;
  dy: number;
}

export interface DojoState {
  version: 1;
  items: DojoItem[];
  nextUid: number;
  spots: MessSpot[];
  nextSpotId: number;
  rng: Rng;
  /** Hours of mess built up (capped at a week). Back to 0 after a full clean. */
  messHours: number;
  /** Mess appeared since the last full clean, so cleaning it earns Calm Mind. */
  hadMess: boolean;
  /** Tower runs left with Calm Mind. */
  calmMindRuns: number;
  /** When the player was last in the dojo (ms timestamp, passed in by the game), or null. */
  lastSeenMs: number | null;
  /** The first-visit card has been shown. */
  welcomed: boolean;
}

/** What a cleaning action did. */
export interface CleanResult {
  done: boolean;
  /** This action finished the clean and earned Calm Mind. */
  calmMind: boolean;
}

// ---------------------------------------------------------------- content

class DojoError extends Error {
  constructor(problem: string) {
    super(`Home Dojo content has a problem: ${problem}`);
    this.name = 'DojoError';
  }
}

export function loadDojoContent(roomData: unknown, decorationsData: unknown): DojoContent {
  const raw = roomData as Record<string, unknown>;
  if (!raw || typeof raw !== 'object') throw new DojoError('the room file is not an object');
  const room = loadRoom({ id: raw.id, name: raw.name, tiles: raw.tiles });
  if (room.doors.length !== 1) throw new DojoError('the dojo room needs exactly one door "D" (the way to the Tower)');

  const d = decorationsData as Record<string, unknown>;
  if (!d || typeof d !== 'object' || !Array.isArray(d.decorations)) throw new DojoError('"decorations" must be a list');
  const decorations: DecorationDef[] = (d.decorations as Record<string, unknown>[]).map((it, i) => {
    const where = `decoration ${i + 1}`;
    const text = (k: string) => {
      if (typeof it[k] !== 'string' || !(it[k] as string)) throw new DojoError(`${where} needs a "${k}"`);
      return it[k] as string;
    };
    const size = (k: string) => {
      const n = it[k];
      if (typeof n !== 'number' || !Number.isInteger(n) || n < 1 || n > 3) throw new DojoError(`${where}'s "${k}" must be 1, 2 or 3`);
      return n;
    };
    const source = text('source') as DecorationSource;
    if (source !== 'starter' && source !== 'tower') throw new DojoError(`${where}'s "source" must be starter or tower`);
    const place = text('place') as DecorationPlace;
    if (place !== 'floor' && place !== 'wall') throw new DojoError(`${where}'s "place" must be floor or wall`);
    const clean = (it.clean ?? null) as DecorationClean | null;
    if (clean !== null && clean !== 'mat' && clean !== 'rack') throw new DojoError(`${where}'s "clean" must be mat or rack`);
    const def: DecorationDef = {
      id: text('id'),
      name: text('name'),
      source,
      place,
      width: size('width'),
      height: size('height'),
      solid: it.solid === true,
      clean,
      shape: text('shape'),
      color: text('color'),
    };
    if (place === 'wall' && (def.height !== 1 || def.solid || clean)) throw new DojoError(`${where} hangs on the wall, so it must be 1 tall, not solid, and need no cleaning`);
    if (clean === 'mat' && def.solid) throw new DojoError(`${where} is a mat, so it can't be solid`);
    return def;
  });
  const ids = new Set<string>();
  for (const def of decorations) {
    if (ids.has(def.id)) throw new DojoError(`two decorations use the id "${def.id}"`);
    ids.add(def.id);
  }

  const b = raw.board as Record<string, unknown> | undefined;
  if (!b || typeof b.column !== 'number' || typeof b.row !== 'number' || b.row !== 1) throw new DojoError('"board" needs a "column" and "row": 1 (the top wall)');
  const board = { col: b.column - 1, row: 0 };

  const dropChance = (d.dropChance ?? {}) as Partial<Record<RoomKind, number>>;
  for (const [k, v] of Object.entries(dropChance)) {
    if (typeof v !== 'number' || v < 0 || v > 1) throw new DojoError(`dropChance.${k} must be a number from 0 to 1`);
  }

  if (!Array.isArray(raw.starter)) throw new DojoError('"starter" must be a list');
  const starter = (raw.starter as Record<string, unknown>[]).map((s, i) => {
    if (typeof s.decoration !== 'string' || !ids.has(s.decoration)) throw new DojoError(`starter ${i + 1} uses an unknown decoration`);
    if (typeof s.column !== 'number' || typeof s.row !== 'number') throw new DojoError(`starter ${i + 1} needs a "column" and "row"`);
    return { decoration: s.decoration, col: s.column - 1, row: s.row - 1 };
  });

  const content: DojoContent = { room, board, starter, decorations, dropChance };
  // The starter layout must itself be valid.
  const test = newDojo(content, 1);
  if (test.items.some((it) => it.col === null)) throw new DojoError('a starter decoration is in a spot where it can\'t be placed');
  return content;
}

export function decorationDef(content: DojoContent, id: string): DecorationDef {
  const def = content.decorations.find((d) => d.id === id);
  if (!def) throw new Error(`Decoration "${id}" doesn't exist`);
  return def;
}

// ---------------------------------------------------------------- the dojo's state

/** A brand-new dojo with Sensei's welcome gifts in place. */
export function newDojo(content: DojoContent, seed: number): DojoState {
  const dojo: DojoState = {
    version: 1,
    items: [],
    nextUid: 1,
    spots: [],
    nextSpotId: 1,
    rng: createRng(seed),
    messHours: 0,
    hadMess: false,
    calmMindRuns: 0,
    lastSeenMs: null,
    welcomed: false,
  };
  for (const s of content.starter) {
    const item = addItem(dojo, s.decoration);
    placeItem(dojo, content, item.uid, s.col, s.row);
  }
  return dojo;
}

/** Reads a saved dojo, dropping anything that no longer exists. Returns null if it's missing or damaged. */
export function loadDojo(data: unknown, content: DojoContent): DojoState | null {
  const d = data as DojoState;
  if (!d || typeof d !== 'object' || d.version !== 1 || !Array.isArray(d.items) || !Array.isArray(d.spots) || !d.rng) return null;
  const known = new Set(content.decorations.map((x) => x.id));
  const dojo: DojoState = { ...d, items: d.items.filter((it) => known.has(it.id)).map((it) => ({ ...it })), spots: d.spots.map((s) => ({ ...s })), rng: { ...d.rng } };
  // Anything that no longer fits (for example after a room change) goes to storage.
  for (const it of dojo.items) {
    if (it.col === null || it.row === null) continue;
    const { col, row } = it;
    it.col = it.row = null;
    if (canPlace(dojo, content, it.uid, col, row)) {
      it.col = col;
      it.row = row;
    }
  }
  return dojo;
}

/** Adds newly earned decorations to storage. */
export function addDecorations(dojo: DojoState, ids: readonly string[]): DojoItem[] {
  return ids.map((id) => addItem(dojo, id));
}

/** How many of each decoration the player owns. */
export function ownedDecorations(dojo: DojoState): Record<string, number> {
  const out: Record<string, number> = {};
  for (const it of dojo.items) out[it.id] = (out[it.id] ?? 0) + 1;
  return out;
}

// ---------------------------------------------------------------- mess over time

/** How messy the dojo is (0 to 1) after this many hours of mess. */
export function messLevel(hours: number): number {
  const x = clamp01((hours - DOJO.messStartsAfterHours) / (DOJO.messFullAfterHours - DOJO.messStartsAfterHours));
  return 1 - (1 - x) * (1 - x);
}

/** The hours of mess that give this mess level (the reverse of messLevel). */
export function hoursForMess(level: number): number {
  const x = 1 - Math.sqrt(1 - clamp01(level));
  return DOJO.messStartsAfterHours + x * (DOJO.messFullAfterHours - DOJO.messStartsAfterHours);
}

/**
 * The player walks into the dojo. Mess builds for the time since their last visit, minus
 * any planned absence (vacations, illness; from the student app later). Returns the hours away.
 */
export function returnToDojo(dojo: DojoState, content: DojoContent, nowMs: number, pausedHours = 0): number {
  const hours = dojo.lastSeenMs === null ? 0 : Math.max(0, (nowMs - dojo.lastSeenMs) / 3_600_000);
  dojo.lastSeenMs = nowMs;
  ageDojo(dojo, content, Math.max(0, hours - pausedHours));
  return hours;
}

/** Lets this many hours of mess build up (capped). Also used by the testing screen's fast-forward. */
export function ageDojo(dojo: DojoState, content: DojoContent, hours: number): void {
  dojo.messHours = Math.min(DOJO.messFullAfterHours, dojo.messHours + Math.max(0, hours));
  const level = messLevel(dojo.messHours);
  let added = false;

  const target = Math.round(DOJO.maxFloorSpots * level);
  while (dojo.spots.length < target) {
    const free = freeFloorTiles(dojo, content);
    if (free.length === 0) break;
    const t = free[nextInt(dojo.rng, free.length)];
    dojo.spots.push({
      id: dojo.nextSpotId++,
      col: t.col,
      row: t.row,
      kind: nextFloat(dojo.rng) < DOJO.leafShare ? 'leaf' : 'dust',
      dx: (nextFloat(dojo.rng) - 0.5) * 0.4,
      dy: (nextFloat(dojo.rng) - 0.5) * 0.4,
    });
    added = true;
  }

  const mats = placed(dojo).filter((it) => decorationDef(content, it.id).clean === 'mat');
  mats.forEach((mat, i) => {
    const from = DOJO.matScuffFrom + (mats.length > 1 ? (DOJO.matScuffSpread * i) / (mats.length - 1) : 0);
    if (!mat.scuffed && level >= from) {
      mat.scuffed = true;
      mat.wipes = 0;
      added = true;
    }
  });
  const crooked = DOJO.rackCrookedAt.filter((at) => level >= at).length;
  for (const rack of placed(dojo).filter((it) => decorationDef(content, it.id).clean === 'rack')) {
    if (crooked > rack.crooked) {
      rack.crooked = crooked;
      added = true;
    }
  }
  if (added) dojo.hadMess = true;
}

// ---------------------------------------------------------------- cleaning

/** Sweeps up any dust or leaves near the character. Returns the spots swept. */
export function sweepAt(dojo: DojoState, pos: Vec2): { swept: MessSpot[]; calmMind: boolean } {
  const r2 = DOJO.sweepRadius * DOJO.sweepRadius;
  const swept = dojo.spots.filter((s) => {
    const dx = s.col + 0.5 + s.dx - pos.x;
    const dy = s.row + 0.5 + s.dy - pos.y;
    return dx * dx + dy * dy <= r2;
  });
  if (swept.length === 0) return { swept, calmMind: false };
  dojo.spots = dojo.spots.filter((s) => !swept.includes(s));
  return { swept, calmMind: afterCleaning(dojo) };
}

/** One tap of "Wipe" on a scuffed mat. */
export function wipeMat(dojo: DojoState, uid: string): CleanResult {
  const mat = dojo.items.find((it) => it.uid === uid);
  if (!mat || !mat.scuffed) return { done: false, calmMind: false };
  mat.wipes++;
  if (mat.wipes < DOJO.wipeTaps) return { done: false, calmMind: false };
  mat.scuffed = false;
  mat.wipes = 0;
  return { done: true, calmMind: afterCleaning(dojo) };
}

/** One tap of "Straighten" on a rack: one weapon put back neatly. */
export function straightenRack(dojo: DojoState, uid: string): CleanResult {
  const rack = dojo.items.find((it) => it.uid === uid);
  if (!rack || rack.crooked <= 0) return { done: false, calmMind: false };
  rack.crooked--;
  return { done: rack.crooked === 0, calmMind: rack.crooked === 0 && afterCleaning(dojo) };
}

/** Cleans everything at once (testing screen only). */
export function cleanAll(dojo: DojoState): boolean {
  dojo.spots = [];
  for (const it of dojo.items) {
    it.scuffed = false;
    it.wipes = 0;
    it.crooked = 0;
  }
  return afterCleaning(dojo);
}

/** Chores left: dust and leaves, scuffed mats, and crooked weapons. */
export function choresLeft(dojo: DojoState): number {
  return dojo.spots.length + placed(dojo).reduce((n, it) => n + (it.scuffed ? 1 : 0) + it.crooked, 0);
}

export function isDojoClean(dojo: DojoState): boolean {
  return choresLeft(dojo) === 0;
}

/** A mat to wipe or a rack to straighten within reach of the character, or null. */
export function choreInReach(dojo: DojoState, content: DojoContent, pos: Vec2): { kind: 'wipe' | 'straighten'; item: DojoItem } | null {
  let best: { kind: 'wipe' | 'straighten'; item: DojoItem; dist: number } | null = null;
  for (const it of placed(dojo)) {
    const def = decorationDef(content, it.id);
    const kind = def.clean === 'mat' && it.scuffed ? 'wipe' : def.clean === 'rack' && it.crooked > 0 ? 'straighten' : null;
    if (!kind) continue;
    const dist = distanceToRect(pos, it.col!, it.row!, def.width, def.height);
    if (dist <= DOJO.reach - 0.5 && (!best || dist < best.dist)) best = { kind, item: it, dist };
  }
  return best ? { kind: best.kind, item: best.item } : null;
}

/** A Tower run starts: uses one run of Calm Mind if there is any. */
export function useCalmMind(dojo: DojoState): boolean {
  if (dojo.calmMindRuns <= 0) return false;
  dojo.calmMindRuns--;
  return true;
}

// ---------------------------------------------------------------- decorating

/** Can this decoration go with its top-left corner at (col, row)? */
export function canPlace(dojo: DojoState, content: DojoContent, uid: string, col: number, row: number): boolean {
  const item = dojo.items.find((it) => it.uid === uid);
  if (!item) return false;
  const def = decorationDef(content, item.id);
  const room = content.room;
  const tiles = footprint(col, row, def);
  if (def.place === 'wall') {
    // Along the top wall, clear of the corners, the board, and other wall decorations.
    if (row !== 0 || col < 1 || col + def.width > room.width - 1) return false;
    if (tiles.some((t) => t.col === content.board.col)) return false;
    return !placed(dojo).some((o) => o.uid !== uid && decorationDef(content, o.id).place === 'wall' && overlaps(tiles, footprint(o.col!, o.row!, decorationDef(content, o.id))));
  }
  if (tiles.some((t) => room.walls[t.row]?.[t.col] !== false)) return false;
  for (const o of placed(dojo)) {
    if (o.uid === uid) continue;
    const od = decorationDef(content, o.id);
    if (od.place === 'floor' && overlaps(tiles, footprint(o.col!, o.row!, od))) return false;
  }
  if (!def.solid) return true;
  // Solid things must not block the doorway or cut off part of the room.
  const blocked = solidTiles(dojo, content, uid);
  for (const t of tiles) blocked.add(key(t.col, t.row));
  const start = { col: Math.floor(room.playerStart.x), row: Math.floor(room.playerStart.y) };
  if (blocked.has(key(start.col, start.row))) return false;
  return allFloorConnected(room, blocked, start);
}

/** Puts a decoration down (if it fits). Dust under it moves to a free spot. */
export function placeItem(dojo: DojoState, content: DojoContent, uid: string, col: number, row: number): boolean {
  if (!canPlace(dojo, content, uid, col, row)) return false;
  const item = dojo.items.find((it) => it.uid === uid)!;
  const def = decorationDef(content, item.id);
  item.col = col;
  item.row = row;
  if (def.place === 'floor') {
    const tiles = footprint(col, row, def);
    for (const s of dojo.spots.filter((sp) => tiles.some((t) => t.col === sp.col && t.row === sp.row))) {
      const free = freeFloorTiles(dojo, content);
      if (free.length === 0) {
        dojo.spots = dojo.spots.filter((x) => x !== s);
        continue;
      }
      const t = free[nextInt(dojo.rng, free.length)];
      s.col = t.col;
      s.row = t.row;
    }
  }
  return true;
}

/** Puts a decoration away in storage. */
export function storeItem(dojo: DojoState, uid: string): void {
  const item = dojo.items.find((it) => it.uid === uid);
  if (item) item.col = item.row = null;
}

/** A good free spot for a decoration taken out of storage: the closest to the room's middle. */
export function findSpot(dojo: DojoState, content: DojoContent, uid: string): { col: number; row: number } | null {
  const item = dojo.items.find((it) => it.uid === uid);
  if (!item) return null;
  const def = decorationDef(content, item.id);
  const room = content.room;
  const cx = (room.width - def.width) / 2;
  const cy = def.place === 'wall' ? 0 : (room.height - def.height) / 2;
  let best: { col: number; row: number; d: number } | null = null;
  const rows = def.place === 'wall' ? [0] : Array.from({ length: room.height }, (_, i) => i);
  for (const row of rows) {
    for (let col = 0; col < room.width; col++) {
      if (!canPlace(dojo, content, uid, col, row)) continue;
      const d = (col - cx) ** 2 + (row - cy) ** 2;
      if (!best || d < best.d) best = { col, row, d };
    }
  }
  return best ? { col: best.col, row: best.row } : null;
}

/** The dojo room with solid decorations counted as walls, for walking around in. */
export function dojoRoom(dojo: DojoState, content: DojoContent): Room {
  const blocked = solidTiles(dojo, content);
  const walls = content.room.walls.map((r, row) => r.map((w, col) => w || blocked.has(key(col, row))));
  return { ...content.room, walls };
}

// ---------------------------------------------------------------- inside

function addItem(dojo: DojoState, id: string): DojoItem {
  const item: DojoItem = { uid: `d${dojo.nextUid++}`, id, col: null, row: null, scuffed: false, wipes: 0, crooked: 0 };
  dojo.items.push(item);
  return item;
}

function placed(dojo: DojoState): DojoItem[] {
  return dojo.items.filter((it) => it.col !== null && it.row !== null);
}

/**
 * After any cleaning: a fully clean dojo starts its mess clock again, and earns Calm Mind
 * if there was mess to clean. A partly clean one turns its mess clock back to match.
 */
function afterCleaning(dojo: DojoState): boolean {
  if (isDojoClean(dojo)) {
    dojo.messHours = 0;
    if (!dojo.hadMess) return false;
    dojo.hadMess = false;
    dojo.calmMindRuns = DOJO.calmMind.runs;
    return true;
  }
  dojo.messHours = Math.min(dojo.messHours, hoursForMess(dojo.spots.length / DOJO.maxFloorSpots));
  return false;
}

function footprint(col: number, row: number, def: DecorationDef): Array<{ col: number; row: number }> {
  const out = [];
  for (let r = 0; r < def.height; r++) for (let c = 0; c < def.width; c++) out.push({ col: col + c, row: row + r });
  return out;
}

function overlaps(a: Array<{ col: number; row: number }>, b: Array<{ col: number; row: number }>): boolean {
  return a.some((t) => b.some((u) => u.col === t.col && u.row === t.row));
}

const key = (col: number, row: number) => `${col},${row}`;

function solidTiles(dojo: DojoState, content: DojoContent, exceptUid?: string): Set<string> {
  const out = new Set<string>();
  for (const it of placed(dojo)) {
    if (it.uid === exceptUid) continue;
    const def = decorationDef(content, it.id);
    if (def.place === 'floor' && def.solid) for (const t of footprint(it.col!, it.row!, def)) out.add(key(t.col, t.row));
  }
  return out;
}

/** Floor tiles with no decoration on them and no mess yet (where new mess can appear). */
function freeFloorTiles(dojo: DojoState, content: DojoContent): Array<{ col: number; row: number }> {
  const taken = new Set<string>();
  for (const it of placed(dojo)) {
    const def = decorationDef(content, it.id);
    if (def.place === 'floor') for (const t of footprint(it.col!, it.row!, def)) taken.add(key(t.col, t.row));
  }
  for (const s of dojo.spots) taken.add(key(s.col, s.row));
  const room = content.room;
  const out = [];
  for (let row = 0; row < room.height; row++) {
    for (let col = 0; col < room.width; col++) {
      if (!room.walls[row][col] && !taken.has(key(col, row))) out.push({ col, row });
    }
  }
  return out;
}

/** True if every open floor tile can be walked to from `start`. */
function allFloorConnected(room: Room, blocked: Set<string>, start: { col: number; row: number }): boolean {
  const open = (c: number, r: number) => r >= 0 && c >= 0 && r < room.height && c < room.width && !room.walls[r][c] && !blocked.has(key(c, r));
  let total = 0;
  for (let r = 0; r < room.height; r++) for (let c = 0; c < room.width; c++) if (open(c, r)) total++;
  const seen = new Set([key(start.col, start.row)]);
  const queue = [start];
  while (queue.length > 0) {
    const t = queue.pop()!;
    for (const [dc, dr] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const c = t.col + dc;
      const r = t.row + dr;
      if (open(c, r) && !seen.has(key(c, r))) {
        seen.add(key(c, r));
        queue.push({ col: c, row: r });
      }
    }
  }
  return seen.size === total;
}

function distanceToRect(p: Vec2, col: number, row: number, w: number, h: number): number {
  const dx = Math.max(col - p.x, 0, p.x - (col + w));
  const dy = Math.max(row - p.y, 0, p.y - (row + h));
  return Math.sqrt(dx * dx + dy * dy);
}

function clamp01(x: number): number {
  return Math.max(0, Math.min(1, x));
}
