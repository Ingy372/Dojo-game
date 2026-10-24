// One run up the floor (core-design section 3): pick a door, clear the room, earn a
// grade, choose an Insight, collect loot, repeat, then the boss. Everything here is
// plain data and uses the seeded random number generator, so a run can be saved
// and replayed exactly.

import { BLESSING, COMBAT, DOJO, FLOOR, GRADES, LOOT, TICKS_PER_SECOND, type Difficulty, type Rarity } from './config';
import type { Content } from './content';
import { modsFrom, type Effect } from './effects';
import { chance, makeItem, rarityRank, rollRarity, type GearItem } from './loot';
import type { Vec2 } from './math';
import { createRng, nextFloat, nextInt, pick, pickWeighted, shuffled, type Rng } from './rng';
import type { Room, RoomKind } from './room';
import { createWorld, type PlayerSetup, type WorldState } from './world';
import type { TwistDef } from './twist';
import { namedForTier, type NamedSpawn } from './named';
import { elitesAllowed, type EliteKind, type EliteSpawn } from './elite';

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
  /** Calm Mind (a clean Home Dojo) was active when the run started: Focus builds faster. */
  calmMind: boolean;
  /** The player has bowed in at the start of this floor. */
  bowed: boolean;
  /** Decorations found this run (decoration ids). */
  decorations: string[];
  /** How many of each decoration the player already had (so new kinds are found first). */
  ownedDecorations: Record<string, number>;
  /** The current room's twist id, or null. */
  twist: string | null;
  /** For testing (?twist=): this twist comes in the next room it's allowed in, then it's cleared. */
  forcedTwist?: string;
  /** The student's belt tier (1 = White belt). Elites start at the tier set in content/elites. */
  tier: number;
  /** The difficulty the floor is played on (Guided floors never get Guarding elites). */
  difficulty: Difficulty;
  /** The first floor the student plays at this belt tier (no Guarding elites). */
  firstFloorOfTier: boolean;
  /** Elites in the current room. */
  elites: EliteSpawn[];
  /** Elites so far on this floor, and how many of them were Guarding. */
  eliteCount: number;
  guardingCount: number;
  /** For testing (?elite=): every battle and challenge room gets one elite of this kind. */
  forcedElite?: EliteKind;
  /** Named monster (M7-N1) rolled at floor start and not placed yet (monster id), or null. */
  namedPending: string | null;
  /** The named monster in the current room, or null. At most one per floor. */
  named: NamedSpawn | null;
  /** Separate random stream for named monsters, so they never shift the floor's other rolls. */
  namedRng: Rng;
}

/** Things that happened, for the game to show. */
export type RunEvent =
  | { kind: 'loot'; item: GearItem; at: Vec2; source: 'enemy' | 'chest' | 'grade' | 'bell' }
  | { kind: 'decoration'; id: string; at: Vec2 }
  | { kind: 'namedDefeated'; id: string; at: Vec2 }
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
  /** Calm Mind from a clean Home Dojo. */
  calmMind?: boolean;
  /** How many of each decoration the player already has. */
  ownedDecorations?: Record<string, number>;
  /** For testing: force this twist id in the next room that can have it. */
  forcedTwist?: string;
  /** The student's belt tier (default 1). */
  tier?: number;
  /** Difficulty for this floor (default Standard). */
  difficulty?: Difficulty;
  /** True on the first floor played at this belt tier (default false). */
  firstFloorOfTier?: boolean;
  /** For testing: one elite of this kind in every battle and challenge room. */
  forcedElite?: EliteKind;
  /** Runs this profile has started before this one (named monsters skip the first few). */
  runsStarted?: number;
  /** For testing (?named=): this named monster comes in the first battle room it can be in. */
  forcedNamed?: string;
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
    calmMind: !!options.calmMind,
    bowed: false,
    decorations: [],
    ownedDecorations: { ...(options.ownedDecorations ?? {}) },
    twist: null,
    tier: options.tier ?? 1,
    difficulty: options.difficulty ?? COMBAT.defaultDifficulty,
    firstFloorOfTier: !!options.firstFloorOfTier,
    elites: [],
    eliteCount: 0,
    guardingCount: 0,
    namedPending: null,
    named: null,
    namedRng: createRng((options.seed ^ 0x9e3779b9) >>> 0),
  };
  run.namedPending = rollNamed(content, run, options);
  if (options.forcedNamed) run.test = true;
  if (options.forcedElite) {
    run.forcedElite = options.forcedElite;
    run.test = true;
  }
  if (options.forcedTwist) {
    if (!content.twists.twists.some((t) => t.id === options.forcedTwist)) throw new Error(`Unknown twist: ${options.forcedTwist}`);
    run.forcedTwist = options.forcedTwist;
    run.test = true;
  }
  const first = options.firstRoomId ? content.rooms.find((r) => r.id === options.firstRoomId) : undefined;
  // ?named= with ?room=: the test room itself gets the named monster (so it can be looked at quickly).
  enterRoom(content, run, first ?? pickRoom(content, run, 'battle'), !!(first && options.forcedNamed));
  return run;
}

export function currentRoom(content: Content, run: RunState): Room {
  const room = content.rooms.find((r) => r.id === run.roomId);
  if (!room) throw new Error(`Room "${run.roomId}" is missing`);
  return room;
}

/** The player's effects for this run: Insights picked so far, any worn charm effects, and Calm Mind. */
export function runEffects(content: Content, run: RunState, gearEffects: readonly Effect[] = []): Effect[] {
  const fromInsights = run.insights
    .map((id) => content.insights.find((i) => i.id === id)?.effect)
    .filter((e): e is Effect => !!e);
  const calm: Effect[] = run.calmMind ? [{ type: 'focusGain', amount: DOJO.calmMind.focusGain }] : [];
  return [...fromInsights, ...gearEffects, ...calm];
}

/** Builds the world for the run's current room. `player` comes from the profile's gear. */
export function createRunWorld(
  content: Content,
  run: RunState,
  player: Omit<PlayerSetup, 'health' | 'mods'>,
  gearEffects: readonly Effect[] = [],
  difficulty?: Difficulty,
  /** Sensei's guided Counter step from the profile (see GUIDE_DONE); off by default. */
  guideStep?: number,
): WorldState {
  const room = currentRoom(content, run);
  return createWorld(room, ['p1'], {
    enemyTypes: content.enemies,
    difficulty: difficulty ?? run.difficulty,
    elites: run.elites,
    eliteRules: content.elites,
    named: run.named,
    namedRules: content.named.rules,
    respawnEnemies: false,
    doorCount: run.doors.length,
    twist: currentTwist(content, run),
    guideStep,
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
          // Elite reward: a chance of one extra Home Dojo decoration (never gear; Focus is given in the world).
          if (e?.named) out.push({ kind: 'namedDefeated', id: e.named, at: { ...e.pos } });
          if (e?.elite) {
            const deco = dropDecoration(content, run, content.elites.reward.decorationChance, e.pos);
            if (deco) out.push(deco);
          }
        }
        break;
      case 'bell':
        // Bell Room twist: the last bell gives a bonus prize.
        if (ev.count === ev.of) out.push(drop(content, run, 'uncommon', world.players.p1.pos, 'bell'));
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
        const at = room.chest ?? world.players.p1.pos;
        for (let i = 0; i < count; i++) out.push(drop(content, run, min, at, 'chest'));
        const deco = dropDecoration(content, run, content.dojo.dropChance[room.kind] ?? 0, at);
        if (deco) out.push(deco);
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
  /** Decorations found (decoration ids). */
  decorations: string[];
  /** A test-link run (doesn't count for personal bests). */
  test: boolean;
  /** The belt tier the floor was played at. */
  tier: number;
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
    decorations: run.decorations.slice(),
    test: run.test,
    tier: run.tier,
  };
}

// ---------------------------------------------------------------- inside

function enterRoom(content: Content, run: RunState, room: Room, anyRoom = false): void {
  run.roomId = room.id;
  run.usedRooms.push(room.id);
  const count = (kind: string) => run.usedRooms.filter((id) => content.rooms.find((r) => r.id === id)?.kind === kind).length;
  run.doors = offerDoors(run, room, count('treasure'), count('rest'));
  run.twist = pickTwist(content, run, room);
  run.named = placeNamed(content, run, room, anyRoom);
  // Elites are still rolled (so later rooms roll the same), but the named monster's room never has one.
  const elites = pickElites(content, run, room);
  run.elites = run.named ? [] : elites;
  run.eliteCount += run.elites.length;
  run.guardingCount += run.elites.filter((x) => x.kind === 'guarding').length;
}

/**
 * Named monsters (M7-N1): one roll per floor, at the start, on its own random stream.
 * Never below the belt tier in content/named, never in a profile's first few runs and
 * never in test runs. ?named= skips the roll.
 */
function rollNamed(content: Content, run: RunState, options: RunOptions): string | null {
  const named = content.named;
  if (options.forcedNamed) {
    if (!named.monsters.some((m) => m.id === options.forcedNamed)) throw new Error(`Unknown named monster: ${options.forcedNamed}`);
    return options.forcedNamed;
  }
  if (run.test || run.tier < named.rules.minBeltTier || (options.runsStarted ?? 0) < named.rules.skipFirstRuns) return null;
  const list = namedForTier(named, run.tier);
  if (!list.length || nextFloat(run.namedRng) >= named.rules.chancePerRun) return null;
  return list[nextInt(run.namedRng, list.length)].id;
}

/**
 * Puts the rolled named monster in the first battle room at or after the earliest room.
 * It takes the place of an enemy of its type; if the room has none, another named monster
 * of this tier whose type is in the room comes instead (in that type's earliest wave).
 * If no battle room comes, nothing does and nothing carries over to the next floor.
 */
function placeNamed(content: Content, run: RunState, room: Room, anyRoom: boolean): NamedSpawn | null {
  const id = run.namedPending;
  if (!id || room.kind !== 'battle' || (!anyRoom && run.depth + 1 < content.named.rules.earliestRoom)) return null;
  const spotsOf = (enemy: string) =>
    room.enemySpawns.map((s, i) => ({ s, i })).filter(({ s }) => s.enemy === enemy && !content.enemies[s.enemy]?.boss).map(({ i }) => i);
  const wanted = content.named.monsters.find((m) => m.id === id);
  let chosen = wanted && spotsOf(wanted.baseEnemy).length ? wanted : undefined;
  if (!chosen) {
    const others = namedForTier(content.named, Math.max(run.tier, content.named.rules.minBeltTier)).filter((m) => spotsOf(m.baseEnemy).length);
    if (!others.length) return null;
    chosen = others[nextInt(run.namedRng, others.length)];
  }
  // Its earliest wave, so it is met soon after the room starts.
  const all = spotsOf(chosen.baseEnemy);
  const wave = Math.min(...all.map((i) => room.enemySpawns[i].wave));
  const spots = all.filter((i) => room.enemySpawns[i].wave === wave);
  run.namedPending = null;
  return { spawn: spots[nextInt(run.namedRng, spots.length)], id: chosen.id };
}

/**
 * Elites (S1 #3): from a set belt tier, some battle and challenge rooms after the first
 * few get one elite, within the per-room and per-floor caps. A rolled Guarding becomes
 * Swift where Guarding isn't allowed (Guided, a tier's first floor, or the floor's Guarding cap).
 */
function pickElites(content: Content, run: RunState, room: Room): EliteSpawn[] {
  const rules = content.elites;
  if (room.kind !== 'battle' && room.kind !== 'challenge') return [];
  const spawnsFor = (kind: EliteKind) =>
    room.enemySpawns.map((s, i) => ({ s, i })).filter(({ s }) => rules.kinds[kind].enemies.includes(s.enemy) && !content.enemies[s.enemy]?.boss).map(({ i }) => i);
  if (run.forcedElite) {
    // The test link skips the belt and first-floor rules, but not Guided: Guarding becomes Swift (K10).
    const kind = run.forcedElite === 'guarding' && rules.noGuardingOnGuided && run.difficulty === 'guided' ? 'swift' : run.forcedElite;
    const spots = spawnsFor(kind);
    return spots.length ? [{ spawn: pick(run.rng, spots), kind }] : [];
  }
  const allowed = elitesAllowed(rules, run.tier, run.difficulty, run.firstFloorOfTier);
  if (!allowed.any || run.depth + 1 < rules.earliestRoom || rules.maxPerRoom < 1 || run.eliteCount >= rules.maxPerFloor) return [];
  if (nextFloat(run.rng) >= rules.chance[room.kind]) return [];
  let kind = pickWeighted(run.rng, Object.entries(rules.kindWeights) as Array<[EliteKind, number]>);
  if (kind === 'guarding' && (!allowed.guarding || run.guardingCount >= rules.maxGuardingPerFloor || spawnsFor('guarding').length === 0)) kind = 'swift';
  const spots = spawnsFor(kind);
  return spots.length ? [{ spawn: pick(run.rng, spots), kind }] : [];
}

/** Room twists: some battle and challenge rooms after the first get one friendly rule (never more). */
function pickTwist(content: Content, run: RunState, room: Room): string | null {
  if (run.depth === 0 || (room.kind !== 'battle' && room.kind !== 'challenge')) return null;
  const forced = content.twists.twists.find((t) => t.id === run.forcedTwist);
  if (forced && forced.earliestRoom <= run.depth + 1) {
    delete run.forcedTwist;
    return forced.id;
  }
  if (nextFloat(run.rng) >= content.twists.chance) return null;
  const allowed = content.twists.twists.filter((t) => t.earliestRoom <= run.depth + 1);
  return allowed.length ? pick(run.rng, allowed).id : null;
}

/** The current room's twist, or null. */
export function currentTwist(content: Content, run: RunState): TwistDef | null {
  return content.twists.twists.find((t) => t.id === run.twist) ?? null;
}

function pickRoom(content: Content, run: RunState, kind: DoorKind): Room {
  // Harder rooms wait until later in the floor (depth 0 is room 1).
  const all = content.rooms.filter((r) => r.kind === kind && r.earliestRoom <= run.depth + 1);
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
function drop(content: Content, run: RunState, min: Rarity, at: Vec2, source: 'enemy' | 'chest' | 'grade' | 'bell'): RunEvent {
  let floor = min;
  if (source === 'chest' && !run.rareFound && run.dryRuns >= LOOT.guaranteedRareOnRun - 1) floor = 'rare';
  const rarity = rollRarity(run.rng, run.dryRuns, floor, run.blessed ? BLESSING.rareWeight : 0);
  if (rarityRank(rarity) >= rarityRank('rare')) run.rareFound = true;
  const item = makeItem(run.rng, content.loot, rarity, `r${run.nextUid++}`);
  run.loot.push(item);
  return { kind: 'loot', item, at: { x: at.x, y: at.y }, source };
}

/**
 * A chest may hold a decoration for the Home Dojo (the boss chest always does).
 * Kinds the player has fewest of come first, so a new player fills their dojo with variety.
 */
function dropDecoration(content: Content, run: RunState, share: number, at: Vec2): RunEvent | null {
  if (share <= 0 || !chance(run.rng, share)) return null;
  const pool = content.dojo.decorations.filter((d) => d.source === 'tower');
  if (pool.length === 0) return null;
  const have = (id: string) => (run.ownedDecorations[id] ?? 0) + run.decorations.filter((x) => x === id).length;
  const fewest = Math.min(...pool.map((d) => have(d.id)));
  const id = pick(run.rng, pool.filter((d) => have(d.id) === fewest)).id;
  run.decorations.push(id);
  return { kind: 'decoration', id, at: { x: at.x, y: at.y } };
}
