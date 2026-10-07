// One run up the floor (core-design section 3): pick a door, clear the room, earn a
// grade, choose an Insight, collect loot, repeat, then the boss. Everything here is
// plain data and uses the seeded random number generator, so a run can be saved
// and replayed exactly.

import { BLESSING, COMBAT, FLOOR, GRADES, LOOT, TICKS_PER_SECOND, type Difficulty, type Rarity } from './config';
import type { Content } from './content';
import { modsFrom, type Effect } from './effects';
import { chance, makeItem, rarityRank, rollRarity, type GearItem } from './loot';
import type { Vec2 } from './math';
import { createRng, nextFloat, pick, pickWeighted, shuffled, type Rng } from './rng';
import type { Room, RoomKind } from './room';
import { createWorld, type PlayerSetup, type WorldState } from './world';

export type Grade = 'S' | 'A' | 'B';
/** What's behind a door: a kind of room, or the way home after the boss. */
export type DoorKind = Exclude<RoomKind, 'practice'> | 'home';

export interface RoomResult {
  roomId: string;
  name: string;
  kind: RoomKind;
  /** Battle, challenge and boss rooms get a grade; others don't. */
  grade: Grade | null;
  ticks: number;
  perfects: number;
  damageTaken: number;
  /** Challenge rooms: cleared within the time limit. */
  inTime: boolean | null;
}

export interface RunState {
  rng: Rng;
  /** Which room of the floor this is (0 = first). */
  depth: number;
  /** Rooms on the floor, boss included. */
  totalRooms: number;
  roomId: string;
  /** Doors offered when the current room is done, left to right. */
  doors: DoorKind[];
  usedRooms: string[];
  /** Insights picked this run (ids). */
  insights: string[];
  /** Insights to choose from right now (after a battle room), or null. */
  insightChoices: string[] | null;
  /** Health carried into the current room (null = full). */
  health: number | null;
  loot: GearItem[];
  results: RoomResult[];
  perfects: number;
  bestCombo: number;
  ticks: number;
  status: 'playing' | 'cleared' | 'lost';
  /** Runs in a row without a Rare before this one (bad-luck protection). */
  dryRuns: number;
  /** A Rare or better was found this run. */
  rareFound: boolean;
  nextUid: number;
  /** Started from a test link (a chosen first room): doesn't count for personal bests. */
  test: boolean;
  /** The Dojo Blessing was active when the run started: better loot. */
  blessed: boolean;
}

/** Things that happened, for the game to show. */
export type RunEvent =
  | { kind: 'loot'; item: GearItem; at: Vec2; source: 'enemy' | 'chest' | 'grade' }
  | { kind: 'graded'; result: RoomResult }
  | { kind: 'insightChoice'; ids: string[] }
  | { kind: 'nextRoom'; door: DoorKind }
  | { kind: 'runOver'; status: 'cleared' | 'lost' };

export interface RunOptions {
  seed: number;
  /** Runs in a row without a Rare (from the profile). */
  dryRuns: number;
  /** For testing: start in this room instead of a random battle room. */
  firstRoomId?: string;
  /** Dojo Blessing (attended class in the last 48 hours). */
  blessed?: boolean;
}

export function startRun(content: Content, options: RunOptions): RunState {
  const run: RunState = {
    rng: createRng(options.seed),
    depth: 0,
    totalRooms: FLOOR.roomsBeforeBoss + 1,
    roomId: '',
    doors: [],
    usedRooms: [],
    insights: [],
    insightChoices: null,
    health: null,
    loot: [],
    results: [],
    perfects: 0,
    bestCombo: 0,
    ticks: 0,
    status: 'playing',
    dryRuns: options.dryRuns,
    rareFound: false,
    nextUid: 1,
    test: !!options.firstRoomId,
    blessed: !!options.blessed,
  };
  const first = options.firstRoomId ? content.rooms.find((r) => r.id === options.firstRoomId) : undefined;
  enterRoom(content, run, first ?? pickRoom(content, run, 'battle'));
  return run;
}

export function currentRoom(content: Content, run: RunState): Room {
  const room = content.rooms.find((r) => r.id === run.roomId);
  if (!room) throw new Error(`Room "${run.roomId}" is missing`);
  return room;
}

/** The player's effects for this run: Insights picked so far plus any worn charm effects. */
export function runEffects(content: Content, run: RunState, gearEffects: readonly Effect[] = []): Effect[] {
  const fromInsights = run.insights
    .map((id) => content.insights.find((i) => i.id === id)?.effect)
    .filter((e): e is Effect => !!e);
  return [...fromInsights, ...gearEffects];
}

/** Builds the world for the run's current room. `player` comes from the profile's gear. */
export function createRunWorld(
  content: Content,
  run: RunState,
  player: Omit<PlayerSetup, 'health' | 'mods'>,
  gearEffects: readonly Effect[] = [],
  difficulty?: Difficulty,
): WorldState {
  const room = currentRoom(content, run);
  return createWorld(room, ['p1'], {
    enemyTypes: content.enemies,
    difficulty,
    respawnEnemies: false,
    doorCount: run.doors.length,
    player: {
      ...player,
      health: run.health ?? undefined,
      mods: modsFrom(runEffects(content, run, gearEffects), TICKS_PER_SECOND),
    },
  });
}

/**
 * Call after every tick of a run's world. Turns what happened in the room into run
 * progress (loot, grades, Insight choices, the next room) and returns what the game should show.
 */
export function updateRun(content: Content, run: RunState, world: WorldState): RunEvent[] {
  if (run.status !== 'playing') return [];
  const out: RunEvent[] = [];
  const room = currentRoom(content, run);
  run.ticks++;
  for (const ev of world.events) {
    switch (ev.kind) {
      case 'perfectCounter':
        run.perfects++;
        break;
      case 'playerAttack':
        if (ev.defeated) {
          const e = world.enemies.find((x) => x.id === ev.enemyId);
          const share = e ? content.loot.enemyDropChance[e.def.id] ?? 0 : 0;
          if (e && chance(run.rng, share)) out.push(drop(content, run, 'common', e.pos, 'enemy'));
        }
        break;
      case 'roomCleared': {
        const result = roomResult(room, world);
        run.results.push(result);
        if (result.grade) {
          out.push({ kind: 'graded', result });
          if (result.grade === 'S') {
            const p = world.players.p1;
            for (let i = 0; i < GRADES.sGradeBonusItems; i++) out.push(drop(content, run, 'common', p.pos, 'grade'));
          }
        }
        if (room.kind === 'battle' || room.kind === 'challenge') {
          const ids = offerInsights(content, run);
          if (ids.length > 0) {
            run.insightChoices = ids;
            out.push({ kind: 'insightChoice', ids });
          }
        }
        break;
      }
      case 'chestOpened': {
        const table = content.loot.chests[room.kind === 'boss' ? 'boss' : room.kind === 'challenge' ? 'challenge' : 'treasure'];
        const result = run.results[run.results.length - 1];
        const inTime = result?.inTime === true;
        const count = inTime && table.inTimeItems ? table.inTimeItems : table.items;
        const min = inTime && table.inTimeMinRarity ? table.inTimeMinRarity : table.minRarity;
        for (let i = 0; i < count; i++) out.push(drop(content, run, min, room.chest ?? world.players.p1.pos, 'chest'));
        break;
      }
      case 'doorEntered': {
        const door = run.doors[ev.door];
        run.bestCombo = Math.max(run.bestCombo, world.progress.bestCombo);
        if (door === 'home' || !door) {
          run.status = 'cleared';
          out.push({ kind: 'runOver', status: 'cleared' });
          return out;
        }
        run.health = world.players.p1.health;
        run.depth++;
        enterRoom(content, run, pickRoom(content, run, door));
        out.push({ kind: 'nextRoom', door });
        return out;
      }
      case 'playerOut':
        run.bestCombo = Math.max(run.bestCombo, world.progress.bestCombo);
        run.status = 'lost';
        out.push({ kind: 'runOver', status: 'lost' });
        return out;
    }
  }
  run.bestCombo = Math.max(run.bestCombo, world.progress.bestCombo);
  return out;
}

/** The player picks one of the offered Insights. Returns false if it wasn't offered. */
export function chooseInsight(run: RunState, id: string): boolean {
  if (!run.insightChoices?.includes(id)) return false;
  run.insights.push(id);
  run.insightChoices = null;
  return true;
}

/** Grades a cleared room: one point each for Perfect Counters, little damage, and a fast clear. */
export function gradeRoom(perfects: number, damageTaken: number, maxHealth: number, ticks: number, parSeconds: number, enemies: number): Grade {
  let points = 0;
  if (perfects >= Math.max(1, Math.ceil(enemies * GRADES.perfectsPerEnemy))) points++;
  if (damageTaken <= maxHealth * GRADES.damageShareForPoint) points++;
  if (ticks <= parSeconds * TICKS_PER_SECOND) points++;
  return points >= 3 ? 'S' : points === 2 ? 'A' : 'B';
}

export interface RunSummary {
  result: 'cleared' | 'lost';
  /** Rooms fully cleared. */
  roomsCleared: number;
  totalRooms: number;
  results: RoomResult[];
  items: GearItem[];
  perfects: number;
  bestCombo: number;
  ticks: number;
  sGrades: number;
  insights: string[];
  /** A test-link run (doesn't count for personal bests). */
  test: boolean;
}

export function summarizeRun(run: RunState): RunSummary {
  return {
    result: run.status === 'cleared' ? 'cleared' : 'lost',
    roomsCleared: run.results.length,
    totalRooms: run.totalRooms,
    results: run.results.slice(),
    items: run.loot.slice(),
    perfects: run.perfects,
    bestCombo: run.bestCombo,
    ticks: run.ticks,
    sGrades: run.results.filter((r) => r.grade === 'S').length,
    insights: run.insights.slice(),
    test: run.test,
  };
}

// ---------------------------------------------------------------- inside

function enterRoom(content: Content, run: RunState, room: Room): void {
  run.roomId = room.id;
  run.usedRooms.push(room.id);
  const count = (kind: string) => run.usedRooms.filter((id) => content.rooms.find((r) => r.id === id)?.kind === kind).length;
  run.doors = offerDoors(run, room, count('treasure'), count('rest'));
}

function pickRoom(content: Content, run: RunState, kind: DoorKind): Room {
  const all = content.rooms.filter((r) => r.kind === kind);
  const fresh = all.filter((r) => !run.usedRooms.includes(r.id));
  return pick(run.rng, fresh.length > 0 ? fresh : all);
}

/** Which doors appear when a room is done. */
function offerDoors(run: RunState, room: Room, treasureSoFar: number, restSoFar: number): DoorKind[] {
  if (room.kind === 'boss') return ['home'];
  if (run.depth >= run.totalRooms - 2) return ['boss'];
  const count = Math.min(room.doors.length, nextFloat(run.rng) < FLOOR.threeDoorChance ? 3 : 2);
  let pool = Object.entries(FLOOR.doorWeights) as Array<[DoorKind, number]>;
  // No two rest shrines in a row.
  // After a treasure room or a rest shrine, every door leads to a fight (no skipping fights).
  if (room.kind === 'rest' || room.kind === 'treasure') pool = pool.filter(([k]) => k === 'battle' || k === 'challenge');
  // Only a few treasure rooms and rest shrines per floor.
  if (treasureSoFar >= FLOOR.maxTreasureRooms) pool = pool.filter(([k]) => k !== 'treasure');
  if (restSoFar >= FLOOR.maxRestRooms) pool = pool.filter(([k]) => k !== 'rest');
  const doors: DoorKind[] = [];
  while (doors.length < count && pool.length > 0) {
    const k = pickWeighted(run.rng, pool);
    doors.push(k);
    pool = pool.filter(([x]) => x !== k);
  }
  // Always at least one fight on offer, so Insights keep coming.
  if (!doors.includes('battle') && !doors.includes('challenge')) doors[doors.length - 1] = 'battle';
  return shuffled(run.rng, doors);
}

function offerInsights(content: Content, run: RunState): string[] {
  const left = content.insights.filter((i) => !run.insights.includes(i.id)).map((i) => i.id);
  return shuffled(run.rng, left).slice(0, FLOOR.insightChoices);
}

/** The room's par time: set in the room file, or the enemies' par times added up. */
export function parSeconds(room: Room, world: WorldState): number {
  if (room.parSeconds !== null) return room.parSeconds;
  return world.enemies.reduce((sum, e) => sum + e.def.parSeconds, 0);
}

function roomResult(room: Room, world: WorldState): RoomResult {
  const prog = world.progress;
  const p = world.players.p1;
  const fights = room.kind === 'battle' || room.kind === 'challenge' || room.kind === 'boss';
  return {
    roomId: room.id,
    name: room.name,
    kind: room.kind,
    grade: fights ? gradeRoom(prog.perfects, prog.damageTaken, p?.maxHealth ?? COMBAT.player.maxHealth, prog.ticks, parSeconds(room, world), world.enemies.length) : null,
    ticks: prog.ticks,
    perfects: prog.perfects,
    damageTaken: prog.damageTaken,
    inTime: room.challenge ? prog.ticks <= room.challenge.seconds * TICKS_PER_SECOND : null,
  };
}

/** Rolls one item. The 5th run in a row without a Rare guarantees one in its first chest. */
function drop(content: Content, run: RunState, min: Rarity, at: Vec2, source: 'enemy' | 'chest' | 'grade'): RunEvent {
  let floor = min;
  if (source === 'chest' && !run.rareFound && run.dryRuns >= LOOT.guaranteedRareOnRun - 1) floor = 'rare';
  const rarity = rollRarity(run.rng, run.dryRuns, floor, run.blessed ? BLESSING.rareWeight : 0);
  if (rarityRank(rarity) >= rarityRank('rare')) run.rareFound = true;
  const item = makeItem(run.rng, content.loot, rarity, `r${run.nextUid++}`);
  run.loot.push(item);
  return { kind: 'loot', item, at: { x: at.x, y: at.y }, source };
}
