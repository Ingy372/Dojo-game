// The game world and how it changes each tick. Everything in WorldState is
// plain data (no classes or functions), so it can be saved, copied, or sent
// over the network later for visits and co-op.

import type { TwistDef } from './twist';
import type { StanceDef, VirtueKind } from './abilities';
import { pushOutOfWalls } from './collision';
import { comboBonus, damage } from './combat';
import { BOW, COMBAT, DIFFICULTY, MOVEMENT, TICKS_PER_SECOND, realSecondsToTicks, type Difficulty } from './config';
import { noMods, type PlayerMods } from './effects';
import { namedDef, type NamedRules, type NamedSpawn } from './named';
import { eliteDef, eliteWindup, type EliteKind, type EliteRules, type EliteSpawn } from './elite';
import type { EnemyAttackDef, EnemyDef } from './enemy';
import { clamp, distance, length, quantize, type Vec2 } from './math';
import { findPath, standableSpot } from './path';
import { activeDoorSlots, waveCount, type EnemySpawn, type Room } from './room';

export type PlayerId = string;
export type EnemyId = string;

export interface PlayerState {
  id: PlayerId;
  /** B-MASHER-2: this player's Perfect Counters in this room (co-op: per player, Manager's call). */
  perfects: number;
  pos: Vec2;
  /** Which way the character faces, as a direction of length 1. */
  facing: Vec2;
  /** Corners still to walk through for a tap, or null when not walking to a spot. */
  path: Vec2[] | null;
  /** Ticks in a row the player has been blocked while walking to a spot. */
  stuckTicks: number;
  /** True if the player moved this tick (for walk animations). */
  moving: boolean;

  health: number;
  maxHealth: number;
  power: number;
  guard: number;
  /** 0 to 100. Filled by hits and Perfect Counters, spent on Strikes. */
  focus: number;
  /** Hits landed in a row without taking a Hit. */
  combo: number;
  /** Perfect Counters in a row without taking a Hit (a Block keeps it). */
  counterChain: number;
  /** Ticks until the next automatic basic attack is allowed. */
  attackCooldown: number;
  /** Ticks of Strike recovery left (no attacking while above 0). */
  strikeRecovery: number;
  /** The tick Counter was last pressed, or -1. */
  counterPressedTick: number;
  /** Ticks of guard pose left after pressing Counter (0 = not guarding). */
  guardTicks: number;
  /** Ticks before Counter can be pressed again after a guard that countered nothing. */
  counterLockout: number;
  /** Extra Perfect Counter window ticks (the Rooted Stance adds some later). */
  counterBonusTicks: number;
  /** Ticks of dash movement left (0 = not dashing). */
  dashTicks: number;
  /** Direction of the current dash, length 1. */
  dashDir: Vec2;
  /** Ticks before Dash can be pressed again. */
  dashCooldown: number;
  /** Ticks left before returning to the room start after defeat; 0 while fighting. */
  downTicks: number;
  /** True once defeated in a floor room (the run is over). */
  out: boolean;
  /** Effects from Insights and charms. */
  mods: PlayerMods;
  /** Ticks of speed burst left (Wind Step). */
  speedBoostTicks: number;
  /** Stances to switch between (from kata sign-offs); stances[0] is the Beginner's Stance. */
  stances: StanceDef[];
  /** Which Stance is active. */
  stance: number;
  /** Ticks before the Stance can be switched again. */
  stanceCooldown: number;
  /** Ticks in a row the player has stood still (no walking, no dash); for Horse Stance. */
  stillTicks: number;
  /** The Virtue taken into the fight (from a character stripe), or null. */
  virtue: VirtueSetup | null;
  /** Ticks left of a lasting Virtue (shield, discipline). */
  virtueTicks: number;
  /** Damage the Shield of Respect can still soak up. */
  virtueShield: number;
}

/** A Virtue ready for the fight, with its rank already applied. */
export interface VirtueSetup {
  id: string;
  name: string;
  kind: VirtueKind;
  rank: number;
  /** shield: damage soaked up; heal: share of max Health restored. */
  amount: number;
  /** How long it lasts (shield, discipline). */
  ticks: number;
}

/** How the current room is going: for doors, the chest, the shrine and the room grade. */
export interface RoomProgress {
  /** Every enemy is beaten (rooms without enemies count as cleared from the start). */
  cleared: boolean;
  chestOpened: boolean;
  shrineUsed: boolean;
  doorsOpen: boolean;
  /** How many doors this room offers (0 = none). */
  doorCount: number;
  /** Ticks spent before the room was cleared. */
  ticks: number;
  perfects: number;
  damageTaken: number;
  bestCombo: number;
}

/**
 * What an enemy is doing:
 * waiting (just appeared), chase, windup (telegraphing an attack), recover (after a swing),
 * stagger (after a Perfect Counter), winded (out of breath after a long chase),
 * defeated (gone until it comes back).
 */
export type EnemyMode = 'waiting' | 'chase' | 'windup' | 'recover' | 'stagger' | 'winded' | 'defeated';

export interface EnemyState {
  id: EnemyId;
  /** A copy of the enemy's stats, so the world is self-contained when saved or sent. */
  def: EnemyDef;
  spawn: Vec2;
  pos: Vec2;
  facing: Vec2;
  health: number;
  mode: EnemyMode;
  /** Ticks left in the current mode (0 for chase). */
  modeTicks: number;
  /** Total ticks of the current wind-up, for drawing how close the attack is. */
  windupTotal: number;
  /** Center of the danger area while winding up; null otherwise. */
  attackCenter: Vec2 | null;
  path: Vec2[] | null;
  /** Ticks until the route to the player is planned again. */
  repathIn: number;
  /** Which of its attacks it uses next (bosses take turns between attacks). */
  attackIndex: number;
  /** Shield enemies: true while the shield is up. */
  shieldUp: boolean;
  /** Ticks until a broken shield grows back. */
  shieldRegrow: number;
  /** True for enemies called in by a boss (they never come back once beaten). */
  summoned: boolean;
  /** True once a boss has called in its helpers. */
  summonDone: boolean;
  /** B-T3-TUNE-2: phased bosses: the phase it is in and its place in that phase's attack pattern. */
  phase?: number;
  phaseStep?: number;
  /** B-T3: already split into its smaller enemies (Dough Blob). */
  splitDone?: boolean;
  /** Which way it circles while waiting its turn to attack: 1 or -1. */
  orbit: number;
  /** Ticks spent chasing since its last swing (for getting winded). */
  chaseTicks: number;
  /** Disarmed by a Perfect Counter: its next attack does this much less damage (0 = not disarmed). */
  disarmed: number;
  /** Elite trait (S1 #3), or null for a normal enemy. Its stats in `def` are already scaled. */
  elite: EliteKind | null;
  /** The Guarding elite protecting this enemy right now (updated every tick), or null. */
  guardedBy: EnemyId | null;
  /** Named monster id (M7-N1), or null. Its Health in `def` is already scaled; it is never an elite. */
  named: string | null;
}

/** Things that happened during the last tick, so the game can play effects and sounds. */
export type AttackMove = 'basic' | 'strike' | 'counter' | 'chain' | 'ripple' | 'reflect';

export type CombatEvent =
  | { kind: 'playerAttack'; playerId: PlayerId; enemyId: EnemyId; move: AttackMove; damage: number; defeated: boolean }
  /** An elite was defeated: its Focus reward (S1 #3), already added. */
  | { kind: 'eliteFocus'; playerId: PlayerId; enemyId: EnemyId; focus: number }
  | { kind: 'telegraph'; enemyId: EnemyId; ticks: number }
  /** Bell Room twist: a Perfect Counter rang a bell (`count` so far, `of` needed). */
  | { kind: 'bell'; count: number; of: number }
  /** Sensei's guided Counter: a warning is being taught (step 0 guided, 1 and 2 fading hints). */
  | { kind: 'guideStart'; step: number; enemyId: EnemyId }
  /** Step 0 only: the game holds still with the circle nearly full until Counter is tapped. */
  | { kind: 'guideWait' }
  /** The hold has waited a while with no tap: Sensei gives a kind hint (repeats calmly, never ends the hold). */
  | { kind: 'guideNudge' }
  /** The taught attack landed or was countered. */
  | { kind: 'guideDone'; step: number; success: boolean }
  | { kind: 'enemySwing'; enemyId: EnemyId }
  | { kind: 'perfectCounter'; playerId: PlayerId; enemyId: EnemyId; chain: number }
  /** B-MASHER-2: this room's Perfect Counters reached COMBAT.counter.mashGuardPerfects, so Mash guard is off until the next room. */
  | { kind: 'mashGuardOff'; playerId: PlayerId }
  | { kind: 'block'; playerId: PlayerId; enemyId: EnemyId; damage: number }
  | { kind: 'hit'; playerId: PlayerId; enemyId: EnemyId; damage: number }
  | { kind: 'counterPressed'; playerId: PlayerId }
  | { kind: 'dash'; playerId: PlayerId }
  | { kind: 'strikeRefused'; playerId: PlayerId; reason: 'focus' | 'noTarget' }
  | { kind: 'playerDown'; playerId: PlayerId }
  | { kind: 'playerReturn'; playerId: PlayerId }
  | { kind: 'enemySpawn'; enemyId: EnemyId }
  | { kind: 'shieldBlock'; playerId: PlayerId; enemyId: EnemyId }
  | { kind: 'shieldBreak'; playerId: PlayerId; enemyId: EnemyId }
  | { kind: 'shieldRegrow'; enemyId: EnemyId }
  | { kind: 'summon'; enemyId: EnemyId; summoned: EnemyId[] }
  /** B-T3-TUNE-2a: a hit bounced off the boss's pot lid (its helpers are still up); no damage. */
  | { kind: 'clang'; playerId: PlayerId; enemyId: EnemyId }
  /** B-T3-TUNE-2c: a boss reached a new phase; the game holds still for `ticks` (roar, glow, Sensei's line). */
  | { kind: 'phaseHold'; enemyId: EnemyId; phase: number; ticks: number; senseiLine: string | null }
  | { kind: 'speedBurst'; playerId: PlayerId }
  | { kind: 'stanceChange'; playerId: PlayerId; stance: number }
  | { kind: 'virtue'; playerId: PlayerId; virtue: VirtueKind; healed: number }
  | { kind: 'virtueEnd'; playerId: PlayerId }
  | { kind: 'virtueRefused'; playerId: PlayerId }
  | { kind: 'shieldSoak'; playerId: PlayerId; soaked: number }
  | { kind: 'winded'; enemyId: EnemyId }
  | { kind: 'wave'; wave: number; of: number }
  | { kind: 'playerOut'; playerId: PlayerId }
  | { kind: 'goalReached' }
  | { kind: 'roomCleared' }
  | { kind: 'breath'; playerId: PlayerId; healed: number }
  | { kind: 'chestOpened'; playerId: PlayerId }
  | { kind: 'shrineUsed'; playerId: PlayerId; healed: number }
  | { kind: 'doorsOpen' }
  /** `door` is the position in the offered doors (0 = leftmost offered door). */
  | { kind: 'doorEntered'; playerId: PlayerId; door: number };

/** An enemy waiting for a later wave (it may be an elite). */
type PendingSpawn = EnemySpawn & { elite?: EliteKind | null; named?: string | null };

export interface WorldState {
  tick: number;
  roomId: string;
  difficulty: Difficulty;
  players: Record<PlayerId, PlayerState>;
  /** Enemies in a fixed order (updated in this order every tick). */
  enemies: EnemyState[];
  /** Enemy types that can be called in during the fight (by a boss). */
  enemyTypes: Record<string, EnemyDef>;
  /** Practice rooms bring beaten enemies back; floor rooms don't. */
  respawnEnemies: boolean;
  /** Counts up for naming enemies that are called in. */
  nextEnemyNumber: number;
  /** The wave in progress (floor rooms send enemies in waves). */
  wave: number;
  waveCount: number;
  /** Enemies still to arrive in later waves. */
  pendingSpawns: PendingSpawn[];
  progress: RoomProgress;
  /** Events from the most recent tick only. */
  events: CombatEvent[];
  /** This room's twist, or null. */
  twist: TwistDef | null;
  /** Bell Room: bells rung so far. */
  bells: number;
  /** Sensei's guided first Counter, or null when it's finished or off. */
  guide: GuideState | null;
  /** Health never drops below this (1 on the tutorial floor, else 0). */
  minHealth: number;
  /** The tutorial floor's glowing spot, or null. */
  goal: GoalState | null;
  /** Tutorial floor (K24a): the enemies stand still until Sensei's step lets them go. */
  enemyHold: boolean;
  /** B-T3-TUNE-2c: ticks left in a boss phase pause (0 = none). Like the guide hold, nothing moves. */
  phaseHoldTicks: number;
  /** Tutorial floor (K24a): later waves come only through releaseWave, never on their own. */
  waveHold: boolean;
  /** Tutorial floor: enemies always see the player, so none waits out of sight (K24a). */
  seeAll: boolean;
  /** Elite rules (from content/elites), or null when the room has no elites. */
  elites: EliteRules | null;
  /** Named monster rules (M7-N1) when this room has one, else null. */
  namedRules: NamedRules | null;
}

/** Steps of the guided Counter: 0 guided (holds still), 1 hint, 2 pulse only, 3 done. */
export const GUIDE_DONE = 3;
/** How long the hold waits before each gentle nudge (5 seconds). */
export const GUIDE_NUDGE_TICKS = 100;

/** The tutorial floor's glowing spot: the room's enemies wait until the player walks onto it. */
export interface GoalState {
  pos: Vec2;
  reached: boolean;
}
/** How close (in tiles) counts as standing on the glowing spot. */
export const GOAL_RADIUS = 0.8;

export interface GuideState {
  step: number;
  /** The enemy whose attack is being taught right now. */
  enemyId: EnemyId | null;
  /** True while the game holds still, waiting for the Counter tap. */
  waiting: boolean;
  /** Ticks spent holding still so far (for the gentle nudge). */
  waitTicks: number;
}

/** Movement part of a player's request for one tick. */
export type MoveInput =
  | { kind: 'none' }
  /** On-screen stick: x and y from -1 to 1. Cancels any tapped destination. */
  | { kind: 'stick'; x: number; y: number }
  /** Tap: walk to this spot in the room (in tiles). */
  | { kind: 'moveTo'; x: number; y: number };

/** What a player asks for on one tick: movement, plus a button press if any. */
export type PlayerAction = 'strike' | 'counter' | 'dash' | 'stance' | 'virtue';
export type PlayerInput = MoveInput & { action?: PlayerAction };

export interface WorldOptions {
  /** Enemy types by id. Without these, the room's enemies are left out (an empty practice room). */
  enemyTypes?: Record<string, EnemyDef>;
  difficulty?: Difficulty;
  /** Bring beaten enemies back after a few seconds (default true, for practice rooms). */
  respawnEnemies?: boolean;
  /** How many doors to offer once the room is done (default 0). */
  doorCount?: number;
  /** The player's stats (from gear and Insights); defaults to the starting stats. */
  player?: PlayerSetup;
  /** This room's twist (Tower rooms only). */
  twist?: TwistDef | null;
  /** Guided Counter step to start at (see GUIDE_DONE). Default: done (off). */
  guideStep?: number;
  /** Elites in this room: which enemy spawns (index in the room file) and their kind. */
  elites?: EliteSpawn[];
  /** Elite rules (from content/elites); needed when `elites` is given. */
  eliteRules?: EliteRules;
  /** A named monster in this room (M7-N1), with its rules. That spawn is never an elite. */
  named?: NamedSpawn | null;
  namedRules?: NamedRules;
  /** Health never drops below this (the tutorial floor uses 1, so doing nothing can't lose). Default 0. */
  minHealth?: number;
  /** The tutorial floor's easy boss (M7-P2): bosses have this share of their health and call in no helpers. */
  easyBossHealth?: number;
  /** R-BAL-12: multiply enemy Health and Power (then round) for the run's belt. Default: none. */
  enemyScale?: { maxHealth: number; power: number };
}

export interface PlayerSetup {
  maxHealth: number;
  power: number;
  guard: number;
  /** Health carried over from the last room (defaults to full). */
  health?: number;
  mods?: PlayerMods;
  /** Stances to switch between; the first is active at the start. Defaults to none (Beginner's Stance). */
  stances?: StanceDef[];
  virtue?: VirtueSetup | null;
}

/** The Beginner's Stance: no changes. Used when the player has no Stances. */
export const NO_STANCE: StanceDef = { id: 'none', name: "Beginner's Stance", text: '', counterWindow: 0, attackSpeed: 0, moveSpeed: 0, guardScale: 0, powerScale: 0, dashCooldownScale: 0, dashScale: 1, blockCut: 0, focusGain: 0, stillPower: 0, rootTicks: 0 };

const NO_INPUT: PlayerInput = { kind: 'none' };
const BASE_STEP = MOVEMENT.speedTilesPerSecond / TICKS_PER_SECOND;
const R = MOVEMENT.playerRadius;

export function createWorld(room: Room, playerIds: PlayerId[], options: WorldOptions = {}): WorldState {
  const players: Record<PlayerId, PlayerState> = {};
  const setup = options.player ?? COMBAT.player;
  const mods = options.player?.mods ?? noMods();
  for (const id of playerIds) {
    players[id] = {
      id,
      pos: { x: room.playerStart.x, y: room.playerStart.y },
      facing: { x: 0, y: 1 },
      path: null,
      stuckTicks: 0,
      moving: false,
      health: clamp(options.player?.health ?? setup.maxHealth, 1, setup.maxHealth),
      maxHealth: setup.maxHealth,
      power: setup.power,
      guard: setup.guard,
      focus: Math.min(COMBAT.focus.max, mods.startFocus),
      combo: 0,
      counterChain: 0,
      perfects: 0,
      attackCooldown: 0,
      strikeRecovery: 0,
      counterPressedTick: -1,
      guardTicks: 0,
      counterLockout: 0,
      counterBonusTicks: 0,
      dashTicks: 0,
      dashDir: { x: 0, y: 1 },
      dashCooldown: 0,
      downTicks: 0,
      out: false,
      mods: { ...mods },
      speedBoostTicks: 0,
      stances: (options.player?.stances ?? []).map((f) => ({ ...f })),
      stance: 0,
      stanceCooldown: 0,
      stillTicks: 0,
      virtue: options.player?.virtue ? { ...options.player.virtue } : null,
      virtueTicks: 0,
      virtueShield: 0,
    };
  }

  const respawnEnemies = options.respawnEnemies ?? true;
  const enemies: EnemyState[] = [];
  const pendingSpawns: PendingSpawn[] = [];
  const rules = options.eliteRules ?? null;
  const namedOf = (i: number): string | null => (options.named && options.namedRules && options.named.spawn === i ? options.named.id : null);
  const eliteOf = (i: number): EliteKind | null => (rules && !namedOf(i) ? options.elites?.find((x) => x.spawn === i)?.kind ?? null : null);
  const namedRules = options.namedRules ?? null;
  // Keep every type that can appear later (later waves, a boss's helpers), so the
  // world has everything it needs when saved or sent.
  const enemyTypes: Record<string, EnemyDef> = {};
  if (options.enemyTypes) {
    const typeOf = (id: string): EnemyDef => {
      const base = options.enemyTypes![id];
      if (!base) throw new Error(`Room "${room.id}" uses enemy "${id}", but no such enemy type was loaded`);
      // R-BAL-12: content holds BASE numbers; the run's belt scales Health and Power (whole numbers).
      // Guard and timings never scale.
      const sc = options.enemyScale;
      const def = sc ? { ...base, maxHealth: Math.max(1, Math.round(base.maxHealth * sc.maxHealth)), power: Math.round(base.power * sc.power), weapon: base.weapon ? { ...base.weapon, disarmedPower: Math.round(base.weapon.disarmedPower * sc.power) } : base.weapon } : base;
      if (def.boss && options.easyBossHealth !== undefined) return { ...def, maxHealth: Math.max(1, Math.round(def.maxHealth * options.easyBossHealth)), summon: null };
      return def;
    };
    room.enemySpawns.forEach((spawn, i) => {
      const def = typeOf(spawn.enemy);
      // Practice rooms put everyone in at once; floor rooms hold later waves back.
      const elite = eliteOf(i);
      const named = namedOf(i);
      if (spawn.wave === 1 || respawnEnemies) enemies.push(newEnemy(`e${i + 1}`, def, spawn.pos, i, elite, rules, named, namedRules));
      else {
        pendingSpawns.push({ enemy: spawn.enemy, pos: { ...spawn.pos }, wave: spawn.wave, elite, named });
        enemyTypes[spawn.enemy] = def;
      }
      if (def.summon) enemyTypes[def.summon.enemy] = typeOf(def.summon.enemy);
      if (def.split) enemyTypes[def.split.into] = typeOf(def.split.into);
    });
  }

  return {
    tick: 0,
    roomId: room.id,
    difficulty: options.difficulty ?? COMBAT.defaultDifficulty,
    players,
    enemies,
    enemyTypes,
    respawnEnemies,
    nextEnemyNumber: room.enemySpawns.length + 1,
    wave: 1,
    waveCount: respawnEnemies ? 1 : Math.max(1, waveCount(room)),
    pendingSpawns,
    progress: {
      cleared: false,
      chestOpened: false,
      shrineUsed: false,
      doorsOpen: false,
      doorCount: options.doorCount ?? 0,
      ticks: 0,
      perfects: 0,
      damageTaken: 0,
      bestCombo: 0,
    },
    events: [],
    twist: options.twist ?? null,
    bells: 0,
    elites: rules,
    namedRules,
    minHealth: Math.max(0, options.minHealth ?? 0),
    goal: room.goal ? { pos: { ...room.goal }, reached: false } : null,
    enemyHold: false,
    phaseHoldTicks: 0,
    waveHold: false,
    seeAll: false,
    guide: (options.guideStep ?? GUIDE_DONE) < GUIDE_DONE ? { step: options.guideStep!, enemyId: null, waiting: false, waitTicks: 0 } : null,
  };
}

/** The bow at the start of a Tower floor: a small Focus head start (BOW in the settings). */
export function bowIn(world: WorldState, playerId: PlayerId): void {
  const p = world.players[playerId];
  if (p) p.focus = Math.min(COMBAT.focus.max, p.focus + BOW.focus);
}

/** Changes a player's Insight and charm effects (for example after picking an Insight). */
export function setPlayerMods(p: PlayerState, mods: PlayerMods): void {
  p.mods = { ...mods };
}

function newEnemy(
  id: EnemyId,
  base: EnemyDef,
  pos: Vec2,
  n: number,
  elite: EliteKind | null = null,
  rules: EliteRules | null = null,
  named: string | null = null,
  namedRules: NamedRules | null = null,
): EnemyState {
  const isNamed = !!(named && namedRules);
  const def = isNamed ? namedDef(base, namedRules!) : elite && rules ? eliteDef(base, elite, rules) : base;
  return {
    id,
    def,
    spawn: { ...pos },
    pos: { ...pos },
    facing: { x: 0, y: 1 },
    health: def.maxHealth,
    mode: 'waiting',
    modeTicks: COMBAT.enemySpawnWaitTicks,
    windupTotal: 0,
    attackCenter: null,
    path: null,
    repathIn: 0,
    attackIndex: 0,
    shieldUp: def.shield !== null,
    shieldRegrow: 0,
    summoned: false,
    summonDone: false,
    orbit: n % 2 === 0 ? 1 : -1,
    chaseTicks: 0,
    disarmed: 0,
    elite: !isNamed && elite && rules ? elite : null,
    guardedBy: null,
    named: isNamed ? named : null,
  };
}

/** Advances the world by one tick (1/20 of a second). Changes `world` in place. */
export function stepWorld(world: WorldState, room: Room, inputs: Record<PlayerId, PlayerInput>): void {
  world.events = [];
  // Sorted order, so results are the same no matter how inputs arrived.
  const ids = Object.keys(world.players).sort();
  const guide = world.guide;
  if (guide?.waiting) {
    // Holding still for the guided Counter: nothing moves until Counter is tapped.
    if (!ids.some((id) => inputs[id]?.action === 'counter')) {
      // Still waiting: every few seconds Sensei gives a kind hint. No countdown, no failing.
      if (++guide.waitTicks % GUIDE_NUDGE_TICKS === 0) world.events.push({ kind: 'guideNudge' });
      return;
    }
    guide.waiting = false;
    guide.waitTicks = 0;
  }
  // B-T3-TUNE-2c: a boss phase pause holds the same way (nothing moves, nothing is hurt), then ends by itself.
  if (world.phaseHoldTicks > 0) {
    world.phaseHoldTicks--;
    return;
  }
  for (const id of ids) {
    stepPlayer(world, world.players[id], room, inputs[id] ?? NO_INPUT);
  }
  // Tutorial floor: the enemies wait until the player has walked to the glowing spot.
  const goal = world.goal;
  if (goal && !goal.reached) {
    const p = world.players[ids[0]];
    if (p && distance(p.pos, goal.pos) <= GOAL_RADIUS) {
      goal.reached = true;
      world.events.push({ kind: 'goalReached' });
    }
  }
  if ((!goal || goal.reached) && !world.enemyHold) for (const e of world.enemies) stepEnemy(world, e, room);
  separateEnemies(world, room);
  updateGuards(world);
  for (const id of ids) separateFromEnemies(world, world.players[id], room);
  updateProgress(world, room, ids);
  if (guide) stepGuide(world, guide, ids);
  world.tick++;
}

/** Sensei's guided first Counter: picks the warning to teach, holds still on step 0, and moves on. */
function stepGuide(world: WorldState, guide: GuideState, ids: string[]): void {
  if (guide.enemyId === null) {
    const t = world.events.find((ev) => ev.kind === 'telegraph');
    if (t?.kind === 'telegraph') {
      guide.enemyId = t.enemyId;
      world.events.push({ kind: 'guideStart', step: guide.step, enemyId: t.enemyId });
    }
    return;
  }
  const e = world.enemies.find((x) => x.id === guide.enemyId);
  if (world.events.some((ev) => ev.kind === 'enemySwing' && ev.enemyId === guide.enemyId)) {
    const success = world.events.some((ev) => ev.kind === 'perfectCounter' && ev.enemyId === guide.enemyId);
    world.events.push({ kind: 'guideDone', step: guide.step, success });
    // The guided step waits for a real success; the fading hints move on either way.
    if (success || guide.step > 0) guide.step++;
    guide.enemyId = null;
    if (guide.step >= GUIDE_DONE) world.guide = null;
    return;
  }
  if (!e || e.mode !== 'windup' || !e.attackCenter) {
    guide.enemyId = null; // Beaten or knocked out of its wind-up: wait for the next warning.
    return;
  }
  // Step 0: with the circle nearly full (inside the Perfect window), hold still for the tap.
  const p = world.players[ids[0]];
  if (guide.step === 0 && e.modeTicks === 2 && p && isActive(p) && distance(p.pos, e.attackCenter) <= currentAttack(e).areaRadius + R * 0.5) {
    p.guardTicks = 0;
    p.counterLockout = 0;
    p.dashTicks = 0;
    guide.waiting = true;
    world.events.push({ kind: 'guideWait' });
  }
}

/** True while a player is fighting (not defeated). */
export function isActive(p: PlayerState): boolean {
  return p.downTicks === 0 && !p.out;
}

/** True if an enemy is in the room and can be hit. */
export function isEnemyPresent(e: EnemyState): boolean {
  return e.mode !== 'defeated';
}

/** The attack an enemy is winding up (or will use next). */
export function currentAttack(e: EnemyState): EnemyAttackDef {
  return e.def.attacks[e.attackIndex % e.def.attacks.length];
}

/** B-T3: the attacks a phased boss may use at its current health (indexes into its attacks). */
export function phaseAttacks(e: EnemyState): number[] | null {
  const phases = e.def.phases;
  if (!phases) return null;
  let list = phases[0].attacks;
  for (const ph of phases) if (e.health <= e.def.maxHealth * ph.atHealthFraction) list = ph.attacks;
  return list;
}

/** The attack after this one: in turn, within the current phase for phased bosses. */
function nextAttackIndex(e: EnemyState): number {
  const list = phaseAttacks(e);
  if (!list) return (e.attackIndex + 1) % e.def.attacks.length;
  // A pattern may name an attack twice (bonk, pin, pin), so keep the place in the pattern.
  e.phaseStep = ((e.phaseStep ?? 0) + 1) % list.length;
  return list[e.phaseStep];
}

/** B-T3-TUNE-2: which phase a phased boss is in at its current health (0 = first). */
export function phaseIndex(e: EnemyState): number {
  let k = 0;
  (e.def.phases ?? []).forEach((ph, i) => {
    if (e.health <= e.def.maxHealth * ph.atHealthFraction) k = i;
  });
  return k;
}

/** B-T3-TUNE-2c: the phase pause, in rules ticks (about 1 real second). */
export const PHASE_HOLD_TICKS = realSecondsToTicks(1);

/** True when every enemy in the room is beaten (and none will come back). */
export function allEnemiesBeaten(world: WorldState): boolean {
  return !world.respawnEnemies && world.pendingSpawns.length === 0 && world.enemies.every((e) => e.mode === 'defeated');
}

/**
 * Total wind-up for an enemy's attack on a difficulty. The enemy file's telegraphTicks is the
 * Standard total; its fill part (before the Standard window) is scaled, then this
 * difficulty's window is added.
 */
export function telegraphTicks(attack: EnemyAttackDef, difficulty: Difficulty): number {
  const fill = attack.telegraphTicks - DIFFICULTY.standard.counterWindowTicks;
  const d = DIFFICULTY[difficulty];
  return Math.round(fill * d.fillScale) + d.counterWindowTicks;
}

/** The Perfect Counter window for a player, in ticks (Stances and Technique Seals can widen it). */
export function counterWindowTicks(world: WorldState, p: PlayerState): number {
  return DIFFICULTY[world.difficulty].counterWindowTicks + p.counterBonusTicks + p.mods.counterWindow + activeStance(p).counterWindow;
}

/** The Stance in use. */
export function activeStance(p: PlayerState): StanceDef {
  return p.stances[p.stance] ?? NO_STANCE;
}

/** Focus a Strike costs this player (Strike upgrades can lower it). */
export function strikeCost(p: PlayerState): number {
  return Math.max(10, COMBAT.strike.focusCost - p.mods.strikeCostCut);
}

/** The player's Guard with the active Stance. */
function guardOf(p: PlayerState): number {
  return p.guard * (1 + activeStance(p).guardScale);
}

// ---------------------------------------------------------------- players

function stepPlayer(world: WorldState, p: PlayerState, room: Room, input: PlayerInput): void {
  if (p.out) return;
  if (p.downTicks > 0) {
    p.moving = false;
    p.downTicks--;
    if (p.downTicks === 0) {
      if (world.respawnEnemies) {
        returnToStart(world, p, room);
      } else {
        // In a floor room, defeat ends the run (the player keeps everything found so far).
        p.out = true;
        world.events.push({ kind: 'playerOut', playerId: p.id });
      }
    }
    return;
  }
  if (p.speedBoostTicks > 0) p.speedBoostTicks--;

  if (p.attackCooldown > 0) p.attackCooldown--;
  if (p.strikeRecovery > 0) p.strikeRecovery--;
  if (p.counterLockout > 0) p.counterLockout--;
  if (p.dashCooldown > 0) p.dashCooldown--;
  if (p.stanceCooldown > 0) p.stanceCooldown--;
  if (p.virtueTicks > 0 && --p.virtueTicks === 0) {
    p.virtueShield = 0;
    world.events.push({ kind: 'virtueEnd', playerId: p.id });
  }
  if (p.guardTicks > 0) {
    p.guardTicks--;
    // The guard ran out without countering anything: Counter rests briefly, so it can't be spammed.
    if (p.guardTicks === 0) p.counterLockout = COMBAT.counter.missLockoutTicks;
  }

  if (input.action === 'dash' && p.guardTicks === 0 && p.dashTicks === 0 && p.dashCooldown === 0) {
    startDash(world, p, input);
  } else if (input.action === 'counter' && p.guardTicks === 0 && p.dashTicks === 0 && p.counterLockout === 0) {
    p.counterPressedTick = world.tick;
    p.guardTicks = Math.max(COMBAT.counter.guardTicks, counterWindowTicks(world, p) + COMBAT.counter.blockTicksAfterWindow);
    p.path = null;
    world.events.push({ kind: 'counterPressed', playerId: p.id });
  } else if (input.action === 'strike' && p.guardTicks === 0 && p.dashTicks === 0 && p.strikeRecovery === 0) {
    tryStrike(world, p, room);
  } else if (input.action === 'stance' && p.stances.length > 1 && p.stanceCooldown === 0) {
    p.stance = (p.stance + 1) % p.stances.length;
    p.stanceCooldown = COMBAT.stanceSwitchTicks;
    world.events.push({ kind: 'stanceChange', playerId: p.id, stance: p.stance });
  } else if (input.action === 'virtue' && p.virtue) {
    useVirtue(world, p);
  }

  if (p.dashTicks > 0) {
    dashStep(world, p, room);
  } else if (p.guardTicks > 0) {
    // Holding the guard pose: no walking.
    p.moving = false;
  } else {
    movePlayer(p, room, input);
  }
  // Horse Stance: count ticks standing still; any walk or dash starts over.
  p.stillTicks = p.moving || p.dashTicks > 0 ? 0 : p.stillTicks + 1;

  if (p.dashTicks === 0 && p.guardTicks === 0 && p.strikeRecovery === 0 && p.attackCooldown === 0) {
    const target = nearestEnemy(world, p, COMBAT.basicAttack.reach);
    if (target) {
      const speed = Math.min(0.6, p.mods.attackSpeed + activeStance(p).attackSpeed);
      p.attackCooldown = Math.max(1, Math.round(COMBAT.basicAttack.cooldownTicks * (1 - speed)));
      landHit(world, p, target, 'basic', COMBAT.basicAttack.strength, COMBAT.focus.perHit);
    }
  }
}

/** Dash recharge ticks with the active Stance (Cat: 30 -> 22, rounded down). */
export function dashCooldownTicks(p: PlayerState): number {
  return Math.floor(COMBAT.dash.cooldownTicks * (1 + activeStance(p).dashCooldownScale));
}

/** The share of a hit a Block lets through: 0.5 less gear and Stance block cuts, never under 0.1. */
export function blockShare(p: PlayerState): number {
  return Math.max(0.1, COMBAT.counter.blockDamageMultiplier - p.mods.blockCut - activeStance(p).blockCut);
}

/** Power bonus share from the active Stance, including Horse's stand-still bonus once rooted. */
export function stancePowerScale(p: PlayerState): number {
  const s = activeStance(p);
  return s.powerScale + (s.stillPower > 0 && p.stillTicks >= s.rootTicks ? s.stillPower : 0);
}

/** Dash: toward the stick if it's pushed, otherwise the way the player faces. */
function startDash(world: WorldState, p: PlayerState, input: PlayerInput): void {
  let dir = p.facing;
  if (input.kind === 'stick') {
    const sx = quantize(clamp(input.x, -1, 1));
    const sy = quantize(clamp(input.y, -1, 1));
    const push = length(sx, sy);
    if (push > MOVEMENT.stickDeadZone) dir = { x: sx / push, y: sy / push };
  }
  p.dashDir = { x: dir.x, y: dir.y };
  p.facing = { x: dir.x, y: dir.y };
  p.dashTicks = COMBAT.dash.ticks;
  p.dashCooldown = dashCooldownTicks(p);
  p.path = null;
  world.events.push({ kind: 'dash', playerId: p.id });
}

function dashStep(world: WorldState, p: PlayerState, room: Room): void {
  // Slippery Floor twist: the dash slides farther.
  const step = (COMBAT.dash.distanceTiles * (world.twist?.dashScale ?? 1) * activeStance(p).dashScale) / COMBAT.dash.ticks;
  p.pos.x += p.dashDir.x * step;
  p.pos.y += p.dashDir.y * step;
  pushOutOfWalls(room, p.pos, R);
  p.dashTicks--;
  p.moving = true;
}

/** A Virtue: needs a full Focus meter, and spends all of it. */
function useVirtue(world: WorldState, p: PlayerState): void {
  const v = p.virtue!;
  if (p.focus < COMBAT.focus.max || p.virtueTicks > 0) {
    world.events.push({ kind: 'virtueRefused', playerId: p.id });
    return;
  }
  p.focus = 0;
  let healed = 0;
  if (v.kind === 'shield') {
    p.virtueShield = v.amount;
    p.virtueTicks = v.ticks;
  } else if (v.kind === 'discipline') {
    p.virtueTicks = v.ticks;
  } else {
    // Second Wind: Health back, and half the Focus returned.
    const before = p.health;
    p.health = Math.min(p.maxHealth, p.health + Math.round(p.maxHealth * v.amount));
    healed = p.health - before;
    p.focus = COMBAT.focus.max * COMBAT.secondWindFocusBack;
  }
  world.events.push({ kind: 'virtue', playerId: p.id, virtue: v.kind, healed });
}

function tryStrike(world: WorldState, p: PlayerState, room: Room): void {
  const s = COMBAT.strike;
  const cost = strikeCost(p);
  if (p.focus < cost) {
    world.events.push({ kind: 'strikeRefused', playerId: p.id, reason: 'focus' });
    return;
  }
  const target = nearestEnemy(world, p, s.reach);
  if (!target) {
    world.events.push({ kind: 'strikeRefused', playerId: p.id, reason: 'noTarget' });
    return;
  }
  // Lunge toward the target, stopping just short of touching it.
  const gap = bodyGap(p.pos, R, target.pos, target.def.radius);
  const lunge = Math.min(s.lungeTiles, Math.max(0, gap - 0.05));
  const dir = directionTo(p.pos, target.pos);
  p.pos.x += dir.x * lunge;
  p.pos.y += dir.y * lunge;
  pushOutOfWalls(room, p.pos, R);
  p.path = null;
  p.focus -= cost;
  p.strikeRecovery = s.recoveryTicks;
  p.attackCooldown = Math.max(p.attackCooldown, s.recoveryTicks);
  landHit(world, p, target, 'strike', s.strength, COMBAT.focus.perHit);
  // Double Strike: a second, lighter hit right after.
  if (p.mods.strikeExtraHit > 0 && isEnemyPresent(target)) {
    landHit(world, p, target, 'chain', s.strength * p.mods.strikeExtraHit, COMBAT.focus.perHit);
  }
}

/** A player's hit on an enemy: damage with the combo bonus, Focus, and the combo counter. */
function landHit(
  world: WorldState,
  p: PlayerState,
  e: EnemyState,
  move: AttackMove,
  strength: number,
  focusGain: number,
): void {
  if (e.shieldUp) {
    if ((move === 'basic' || move === 'ripple') && !p.mods.shieldBreaker) {
      // Basic attacks bounce off the shield: no damage, but shield sparks give a little Focus (B-MASHER-a).
      p.facing = directionTo(p.pos, e.pos);
      p.focus = Math.min(COMBAT.focus.max, p.focus + COMBAT.focus.perShieldBounce);
      world.events.push({ kind: 'shieldBlock', playerId: p.id, enemyId: e.id });
      return;
    }
    // A Strike or Perfect Counter breaks the shield, and the hit still lands.
    e.shieldUp = false;
    e.shieldRegrow = e.def.shield!.regrowTicks;
    world.events.push({ kind: 'shieldBreak', playerId: p.id, enemyId: e.id });
  }
  const bonus =
    comboBonus(p.combo) +
    (e.mode === 'stagger' ? p.mods.staggerBonus : 0) +
    (e.mode === 'winded' && e.def.winded ? e.def.winded.damageBonus : 0);
  const dmg = damage(p.power * (1 + p.mods.powerScale + stancePowerScale(p)), strength, e.def.guard, bonus);
  p.combo++;
  if (p.combo > world.progress.bestCombo) world.progress.bestCombo = p.combo;
  if (p.mods.comboSpeedEvery > 0 && p.combo % p.mods.comboSpeedEvery === 0) {
    p.speedBoostTicks = p.mods.comboSpeedTicks;
    world.events.push({ kind: 'speedBurst', playerId: p.id });
  }
  const lowHealth = p.health < p.maxHealth * p.mods.lowHealthBelow;
  p.focus = Math.min(COMBAT.focus.max, p.focus + focusGain * (1 + p.mods.focusGain + activeStance(p).focusGain) * (lowHealth ? p.mods.lowHealthFocusScale : 1));
  p.facing = directionTo(p.pos, e.pos);
  hurtEnemy(world, p, e, move, dmg);
}

/** Damage lands on an enemy. */
function hurtEnemy(world: WorldState, p: PlayerState, e: EnemyState, move: AttackMove, dmg: number): void {
  // Guarding aura: a protected enemy takes less from every kind of player damage. Applied last,
  // after all bonuses, rounded, at least 1.
  if (e.guardedBy && world.elites) dmg = Math.max(1, Math.round(dmg * world.elites.guarding.damageScale));
  // B-T3-TUNE-2a: the pot lid is up while any called helper is still up: the hit clangs off.
  if (e.def.lidWhileHelpers && lidUp(world)) {
    world.events.push({ kind: 'clang', playerId: p.id, enemyId: e.id });
    return;
  }
  e.health = Math.max(0, e.health - dmg);
  const defeated = e.health === 0;
  if (defeated) {
    e.mode = 'defeated';
    e.modeTicks = COMBAT.enemyRespawnTicks;
    e.attackCenter = null;
    e.path = null;
  }
  world.events.push({ kind: 'playerAttack', playerId: p.id, enemyId: e.id, move, damage: dmg, defeated });
  // Elite reward: a burst of Focus for whoever defeated it.
  if (defeated && e.elite && world.elites) {
    const before = p.focus;
    p.focus = Math.min(COMBAT.focus.max, p.focus + world.elites.reward.focus);
    world.events.push({ kind: 'eliteFocus', playerId: p.id, enemyId: e.id, focus: p.focus - before });
  }
}

/** B-T3-TUNE-2a: true while any called helper (e.g. a Spark Sprite) is still in the fight. */
export function lidUp(world: WorldState): boolean {
  return world.enemies.some((o) => o.summoned && o.mode !== 'defeated');
}

function nearestEnemy(world: WorldState, p: PlayerState, maxGap: number): EnemyState | null {
  let best: EnemyState | null = null;
  let bestGap = maxGap;
  for (const e of world.enemies) {
    if (!isEnemyPresent(e)) continue;
    const gap = bodyGap(p.pos, R, e.pos, e.def.radius);
    if (gap <= bestGap) {
      best = e;
      bestGap = gap;
    }
  }
  return best;
}

function returnToStart(world: WorldState, p: PlayerState, room: Room): void {
  p.pos = { x: room.playerStart.x, y: room.playerStart.y };
  p.facing = { x: 0, y: 1 };
  p.path = null;
  p.health = p.maxHealth;
  p.focus = 0;
  p.combo = 0;
  p.attackCooldown = 0;
  p.strikeRecovery = 0;
  p.counterPressedTick = -1;
  p.guardTicks = 0;
  p.counterLockout = 0;
  p.dashTicks = 0;
  p.dashCooldown = 0;
  p.speedBoostTicks = 0;
  p.virtueTicks = 0;
  p.virtueShield = 0;
  world.events.push({ kind: 'playerReturn', playerId: p.id });
  // If nobody else is still fighting, the whole room starts over.
  const othersFighting = Object.values(world.players).some((o) => o !== p && isActive(o));
  if (!othersFighting) {
    world.enemies = world.enemies.filter((e) => !e.summoned);
    for (const e of world.enemies) resetEnemy(world, e);
  }
}

function movePlayer(p: PlayerState, room: Room, input: MoveInput): void {
  const before = { x: p.pos.x, y: p.pos.y };
  const STEP = BASE_STEP * (p.speedBoostTicks > 0 ? 1 + p.mods.comboSpeedBonus : 1) * (1 + activeStance(p).moveSpeed);

  if (input.kind === 'stick') {
    p.path = null;
    const sx = quantize(clamp(input.x, -1, 1));
    const sy = quantize(clamp(input.y, -1, 1));
    const push = length(sx, sy);
    if (push > MOVEMENT.stickDeadZone) {
      // Rescale so speed rises smoothly from 0 just past the dead zone to full at the edge.
      const strength = Math.min(1, (push - MOVEMENT.stickDeadZone) / (1 - MOVEMENT.stickDeadZone));
      p.pos.x += (sx / push) * STEP * strength;
      p.pos.y += (sy / push) * STEP * strength;
      p.facing = { x: sx / push, y: sy / push };
    }
  } else if (input.kind === 'moveTo') {
    const target = standableSpot(room, { x: quantize(input.x), y: quantize(input.y) }, R);
    p.path = findPath(room, p.pos, target, R);
    p.stuckTicks = 0;
  }

  if (input.kind !== 'stick' && p.path) {
    const dir = walkPath(p.pos, p.path, STEP);
    if (dir) p.facing = dir;
    if (p.path.length === 0) p.path = null;
  }

  pushOutOfWalls(room, p.pos, R);

  const moved = length(p.pos.x - before.x, p.pos.y - before.y);
  p.moving = moved > 0.0001;
  if (p.path) {
    // Blocked while walking to a spot (shouldn't happen, but never walk into a wall forever).
    p.stuckTicks = moved < STEP * 0.25 ? p.stuckTicks + 1 : 0;
    if (p.stuckTicks >= MOVEMENT.stuckTicks) p.path = null;
  }
}

/**
 * Walks `pos` along `path` by up to `budget` tiles, carrying leftover distance around
 * corners and removing reached corners. Returns the last direction walked, if any.
 */
function walkPath(pos: Vec2, path: Vec2[], budget: number): Vec2 | null {
  let dir: Vec2 | null = null;
  while (path.length > 0 && budget > 0) {
    const next = path[0];
    const dx = next.x - pos.x;
    const dy = next.y - pos.y;
    const dist = length(dx, dy);
    if (dist > 0) dir = { x: dx / dist, y: dy / dist };
    if (dist <= budget) {
      pos.x = next.x;
      pos.y = next.y;
      budget -= dist;
      path.shift();
    } else {
      pos.x += (dx / dist) * budget;
      pos.y += (dy / dist) * budget;
      budget = 0;
    }
  }
  return dir;
}

/** Keeps players from standing inside enemies: the player is nudged out. */
function separateFromEnemies(world: WorldState, p: PlayerState, room: Room): void {
  if (!isActive(p)) return;
  for (const e of world.enemies) {
    if (!isEnemyPresent(e)) continue;
    const min = R + e.def.radius;
    const dx = p.pos.x - e.pos.x;
    const dy = p.pos.y - e.pos.y;
    const d = length(dx, dy);
    if (d >= min) continue;
    if (d > 0) {
      p.pos.x += (dx / d) * (min - d);
      p.pos.y += (dy / d) * (min - d);
    } else {
      p.pos.x += min;
    }
    pushOutOfWalls(room, p.pos, R);
  }
}

// ---------------------------------------------------------------- enemies

function stepEnemy(world: WorldState, e: EnemyState, room: Room): void {
  if (e.mode !== 'defeated') {
    if (!e.shieldUp && e.def.shield && --e.shieldRegrow <= 0) {
      e.shieldUp = true;
      world.events.push({ kind: 'shieldRegrow', enemyId: e.id });
    }
    const s = e.def.summon;
    if (s && !e.summonDone && e.health <= e.def.maxHealth * s.atHealthFraction) summonHelpers(world, e, room);
    // B-T3-TUNE-2: a phased boss entering a new phase starts its pattern over, and the game pauses once.
    if (e.def.phases) {
      const k = phaseIndex(e);
      if (k > (e.phase ?? 0)) {
        e.phase = k;
        // Mid wind-up: finish that attack, then start the new pattern from its first attack.
        if (e.mode === 'windup') e.phaseStep = -1;
        else {
          e.phaseStep = 0;
          e.attackIndex = e.def.phases[k].attacks[0];
        }
        world.phaseHoldTicks = PHASE_HOLD_TICKS;
        world.events.push({ kind: 'phaseHold', enemyId: e.id, phase: k, ticks: PHASE_HOLD_TICKS, senseiLine: e.def.phases[k].senseiLine });
      }
    }
  }
  if (e.mode === 'defeated' && e.def.split && !e.splitDone) splitEnemy(world, e, room);
  switch (e.mode) {
    case 'defeated':
      if (world.respawnEnemies && !e.summoned && --e.modeTicks <= 0) {
        resetEnemy(world, e);
      }
      return;
    case 'waiting':
    case 'recover':
    case 'stagger':
    case 'winded':
      if (--e.modeTicks <= 0) e.mode = 'chase';
      return;
    case 'windup':
      if (--e.modeTicks <= 0) {
        e.mode = 'recover';
        e.modeTicks = currentAttack(e).recoverTicks;
        resolveAttack(world, e);
        e.attackCenter = null;
        e.attackIndex = nextAttackIndex(e);
      }
      return;
    case 'chase': {
      chase(world, e, room);
      return;
    }
  }
}

function chase(world: WorldState, e: EnemyState, room: Room): void {
  const target = nearestPlayer(world, e);
  if (!target) {
    e.path = null;
    return;
  }
  e.facing = directionTo(e.pos, target.pos);
  const a = currentAttack(e);
  const dist = distance(e.pos, target.pos);
  const canAttack = attackersNow(world) < COMBAT.maxAttackersAtOnce;
  if (dist <= a.startRange && canAttack) {
    // Start the telegraph. The danger area is fixed now, so the player can step out of it.
    let ticks = telegraphTicks(a, world.difficulty);
    if (e.elite && world.elites) ticks = eliteWindup(ticks, e.elite, world.difficulty, world.elites, DIFFICULTY[world.difficulty].counterWindowTicks);
    e.mode = 'windup';
    e.modeTicks = ticks;
    e.windupTotal = ticks;
    e.attackCenter = { x: e.pos.x + e.facing.x * a.reach, y: e.pos.y + e.facing.y * a.reach };
    e.path = null;
    e.chaseTicks = 0;
    world.events.push({ kind: 'telegraph', enemyId: e.id, ticks });
    return;
  }
  const speed = e.def.moveSpeedTilesPerSecond / TICKS_PER_SECOND;
  if (!canAttack && dist <= a.startRange + COMBAT.circleExtraRange) {
    // Waiting its turn ("kung fu circle"): circle around the player at a little distance.
    const out = { x: (e.pos.x - target.pos.x) / (dist || 1), y: (e.pos.y - target.pos.y) / (dist || 1) };
    const want = a.startRange + COMBAT.circleExtraRange * 0.5;
    const pull = clamp(want - dist, -1, 1) * 0.5;
    const side = COMBAT.circleSpeedShare;
    e.pos.x += (-out.y * e.orbit * side + out.x * pull) * speed;
    e.pos.y += (out.x * e.orbit * side + out.y * pull) * speed;
    pushOutOfWalls(room, e.pos, e.def.radius);
    e.path = null;
    return;
  }
  if (e.repathIn <= 0 || !e.path) {
    e.path = findPath(room, e.pos, target.pos, e.def.radius);
    e.repathIn = COMBAT.enemyRepathTicks;
  }
  e.repathIn--;
  // Don't walk right on top of the player; stop once in attack range.
  if (e.path && distance(e.pos, target.pos) > a.startRange * 0.8) {
    walkPath(e.pos, e.path, speed);
    pushOutOfWalls(room, e.pos, e.def.radius);
    // A long chase without a swing leaves slow enemies out of breath.
    const w = e.def.winded;
    if (w && ++e.chaseTicks >= w.afterTicks) {
      e.chaseTicks = 0;
      e.mode = 'winded';
      e.modeTicks = w.ticks;
      e.path = null;
      world.events.push({ kind: 'winded', enemyId: e.id });
    }
  }
}

/** The swing lands: each player in the danger area gets a Perfect Counter, a Block, or a Hit. */
function resolveAttack(world: WorldState, e: EnemyState): void {
  world.events.push({ kind: 'enemySwing', enemyId: e.id });
  const center = e.attackCenter;
  if (!center) return;
  const a = currentAttack(e);
  // A disarmed enemy's swing is weaker (this swing only). An enemy with a weapon (Bouncy Bopper)
  // drops it and pushes instead, at the push's own power (A5, #118).
  const pushing = e.disarmed > 0 && e.def.weapon !== null;
  const power = pushing ? e.def.weapon!.disarmedPower : e.def.power;
  const weak = pushing ? 1 : 1 - e.disarmed;
  e.disarmed = 0;
  for (const id of Object.keys(world.players).sort()) {
    const p = world.players[id];
    if (!isActive(p)) continue;
    // Caught if the player's center is inside the area, or within half a body of its edge.
    if (distance(p.pos, center) > a.areaRadius + R * 0.5) continue;

    const guarding = p.guardTicks > 0;
    // Perfect Discipline: while it lasts, every Counter is a Perfect Counter.
    const disciplined = p.virtue?.kind === 'discipline' && p.virtueTicks > 0;
    if (guarding && a.counterable !== false && (disciplined || world.tick - p.counterPressedTick < counterWindowTicks(world, p))) {
      // Perfect Counter: no damage, enemy staggered, counter hit for 2x Power, Focus by chain (+25, +30, +35, +40).
      p.guardTicks = 0;
      p.counterChain++;
      world.progress.perfects++;
      p.perfects++;
      world.events.push({ kind: 'perfectCounter', playerId: p.id, enemyId: e.id, chain: p.counterChain });
      if (p.perfects === COMBAT.counter.mashGuardPerfects) world.events.push({ kind: 'mashGuardOff', playerId: p.id });
      // Bell Room twist: each Perfect Counter rings a bell, up to the number needed.
      const bellsNeeded = world.twist?.bells ?? 0;
      if (world.bells < bellsNeeded) world.events.push({ kind: 'bell', count: ++world.bells, of: bellsNeeded });
      if (p.mods.healOnPerfect > 0) p.health = Math.min(p.maxHealth, p.health + p.mods.healOnPerfect);
      landHit(world, p, e, 'counter', COMBAT.counter.perfectStrength + p.mods.counterStrength, chainFocus(p.counterChain));
      if (e.mode !== 'defeated') {
        e.mode = 'stagger';
        e.modeTicks = COMBAT.counter.perfectStaggerTicks + p.mods.staggerTicks;
        // Disarm: this attacker's next attack is weaker.
        if (p.mods.disarm > 0) e.disarmed = Math.max(e.disarmed, p.mods.disarm);
      }
      // Ripple Counter: the counter also hits every other enemy nearby.
      if (p.mods.rippleRadius > 0) {
        for (const o of world.enemies) {
          if (o === e || !isEnemyPresent(o)) continue;
          if (bodyGap(p.pos, R, o.pos, o.def.radius) <= p.mods.rippleRadius) {
            landHit(world, p, o, 'ripple', p.mods.rippleStrength, 0);
          }
        }
      }
    } else if (a.counterable !== false && (guarding || (p.attackCooldown > 0 && mashGuardOn(p)))) {
      // Block: half damage (never against a dash-only attack: dash out instead), no stagger. The combo is kept.
      // B-MASHER-b Mash guard: a hit that lands during the player's own basic-attack swing (attackCooldown)
      // counts as the same Block, for everyone. B-MASHER-2 (E3): only until the room's 3rd Perfect Counter.
      p.guardTicks = 0;
      const share = blockShare(p);
      const dmg = damage(power, a.strength * share * weak, guardOf(p));
      world.events.push({ kind: 'block', playerId: p.id, enemyId: e.id, damage: dmg });
      if (p.mods.dashOnBlock) p.dashCooldown = 0;
      hurt(world, p, dmg);
      // Iron Skin: part of the full hit bounces back (shields stop it, unless Shield Breaker).
      if (p.mods.blockReflect > 0 && isEnemyPresent(e) && (!e.shieldUp || p.mods.shieldBreaker)) {
        const back = Math.max(1, Math.round(damage(e.def.power, a.strength, guardOf(p)) * p.mods.blockReflect));
        hurtEnemy(world, p, e, 'reflect', back);
      }
    } else {
      // Hit: full damage, combo resets.
      const dmg = damage(power, a.strength * weak, guardOf(p));
      p.combo = 0;
      p.counterChain = 0;
      world.events.push({ kind: 'hit', playerId: p.id, enemyId: e.id, damage: dmg });
      hurt(world, p, dmg);
    }
  }
}

/** Focus for the nth Perfect Counter in a chain (1 = first). */
export function chainFocus(chain: number): number {
  const steps = COMBAT.focus.perPerfectCounterChain;
  return steps[Math.min(chain, steps.length) - 1];
}

function hurt(world: WorldState, p: PlayerState, dmg: number): void {
  // Shield of Respect soaks up damage first.
  if (p.virtueShield > 0) {
    const soaked = Math.min(p.virtueShield, dmg);
    p.virtueShield -= soaked;
    dmg -= soaked;
    world.events.push({ kind: 'shieldSoak', playerId: p.id, soaked });
    if (p.virtueShield === 0) {
      p.virtueTicks = 0;
      world.events.push({ kind: 'virtueEnd', playerId: p.id });
    }
    if (dmg === 0) return;
  }
  world.progress.damageTaken += Math.min(dmg, p.health);
  p.health = Math.max(Math.min(world.minHealth, p.health), p.health - dmg);
  if (p.health === 0) {
    p.downTicks = COMBAT.defeatTicks;
    p.path = null;
    p.guardTicks = 0;
    p.dashTicks = 0;
    p.moving = false;
    world.events.push({ kind: 'playerDown', playerId: p.id });
  }
}

/** A boss calls in helpers around itself (once). */
function summonHelpers(world: WorldState, boss: EnemyState, room: Room): void {
  const s = boss.def.summon!;
  const def = world.enemyTypes[s.enemy];
  boss.summonDone = true;
  if (!def) return;
  const ids: EnemyId[] = [];
  for (let i = 0; i < s.count; i++) {
    // Spread around the boss, then nudged onto open floor.
    const angle = (i / s.count) * Math.PI * 2 + 0.6;
    const away = boss.def.radius + def.radius + 0.6;
    const pos = { x: boss.pos.x + Math.cos(angle) * away, y: boss.pos.y + Math.sin(angle) * away };
    pushOutOfWalls(room, pos, def.radius);
    const id = `e${world.nextEnemyNumber++}`;
    const e = newEnemy(id, def, pos, world.enemies.length);
    e.summoned = true;
    world.enemies.push(e);
    ids.push(id);
  }
  world.events.push({ kind: 'summon', enemyId: boss.id, summoned: ids });
}

/** B-T3: a beaten enemy splits into smaller ones where it stood (Dough Blob into 2 Doughlings). */
function splitEnemy(world: WorldState, parent: EnemyState, room: Room): void {
  const sp = parent.def.split!;
  const def = world.enemyTypes[sp.into];
  parent.splitDone = true;
  if (!def) return;
  const ids: EnemyId[] = [];
  for (let i = 0; i < sp.count; i++) {
    const angle = (i / sp.count) * Math.PI * 2;
    const away = def.radius + 0.2;
    const pos = { x: parent.pos.x + Math.cos(angle) * away, y: parent.pos.y + Math.sin(angle) * away };
    pushOutOfWalls(room, pos, def.radius);
    const id = `e${world.nextEnemyNumber++}`;
    const e = newEnemy(id, def, pos, world.enemies.length);
    e.summoned = true;
    world.enemies.push(e);
    ids.push(id);
  }
  world.events.push({ kind: 'summon', enemyId: parent.id, summoned: ids });
}

/** Tutorial floor (K24a): bring in the next held wave now. False when none is left. */
export function releaseWave(world: WorldState): boolean {
  if (world.pendingSpawns.length === 0) return false;
  spawnNextWave(world);
  return true;
}

function spawnNextWave(world: WorldState): void {
  world.wave++;
  const now = world.pendingSpawns.filter((s) => s.wave <= world.wave);
  world.pendingSpawns = world.pendingSpawns.filter((s) => s.wave > world.wave);
  for (const s of now) {
    const e = newEnemy(`e${world.nextEnemyNumber++}`, world.enemyTypes[s.enemy], s.pos, world.enemies.length, s.elite ?? null, world.elites, s.named ?? null, world.namedRules);
    world.enemies.push(e);
    world.events.push({ kind: 'enemySpawn', enemyId: e.id });
  }
  world.events.push({ kind: 'wave', wave: world.wave, of: world.waveCount });
}

/**
 * Guarding aura, every tick: each Guarding elite protects the closest enemies within range
 * (center to center), up to `protects` of them. Ties go to the enemy that came into the room
 * first. Guarders never protect themselves, each other, or a boss.
 */
export function updateGuards(world: WorldState): void {
  for (const e of world.enemies) e.guardedBy = null;
  const g = world.elites?.guarding;
  if (!g) return;
  for (const guard of world.enemies) {
    if (guard.elite !== 'guarding' || !isEnemyPresent(guard)) continue;
    const near = world.enemies
      .map((o, order) => ({ o, order, d: distance(guard.pos, o.pos) }))
      .filter(({ o, d }) => o !== guard && isEnemyPresent(o) && o.elite !== 'guarding' && !o.def.boss && !o.named && !o.guardedBy && d <= g.rangeTiles)
      .sort((a, b) => a.d - b.d || a.order - b.order)
      .slice(0, g.protects);
    for (const { o } of near) o.guardedBy = guard.id;
  }
}

/** Keeps enemies from standing inside each other (pairs in a fixed order). */
function separateEnemies(world: WorldState, room: Room): void {
  const list = world.enemies;
  for (let i = 0; i < list.length; i++) {
    const a = list[i];
    if (!isEnemyPresent(a)) continue;
    for (let j = i + 1; j < list.length; j++) {
      const b = list[j];
      if (!isEnemyPresent(b)) continue;
      const min = a.def.radius + b.def.radius;
      const dx = b.pos.x - a.pos.x;
      const dy = b.pos.y - a.pos.y;
      const d = length(dx, dy);
      if (d >= min) continue;
      const nx = d > 0 ? dx / d : 1;
      const ny = d > 0 ? dy / d : 0;
      const push = (min - d) / 2;
      // An enemy winding up holds its ground; the other moves out of the way.
      const aFixed = a.mode === 'windup';
      const bFixed = b.mode === 'windup';
      if (!aFixed) {
        a.pos.x -= nx * push * (bFixed ? 2 : 1);
        a.pos.y -= ny * push * (bFixed ? 2 : 1);
        pushOutOfWalls(room, a.pos, a.def.radius);
      }
      if (!bFixed) {
        b.pos.x += nx * push * (aFixed ? 2 : 1);
        b.pos.y += ny * push * (aFixed ? 2 : 1);
        pushOutOfWalls(room, b.pos, b.def.radius);
      }
    }
  }
}

function resetEnemy(world: WorldState, e: EnemyState): void {
  e.pos = { ...e.spawn };
  e.facing = { x: 0, y: 1 };
  e.health = e.def.maxHealth;
  e.mode = 'waiting';
  e.modeTicks = COMBAT.enemySpawnWaitTicks;
  e.windupTotal = 0;
  e.attackCenter = null;
  e.path = null;
  e.repathIn = 0;
  e.attackIndex = 0;
  e.shieldUp = e.def.shield !== null;
  e.shieldRegrow = 0;
  e.summonDone = false;
  e.phase = 0;
  e.phaseStep = 0;
  e.splitDone = false;
  e.chaseTicks = 0;
  e.disarmed = 0;
  world.events.push({ kind: 'enemySpawn', enemyId: e.id });
}

function nearestPlayer(world: WorldState, e: EnemyState): PlayerState | null {
  let best: PlayerState | null = null;
  let bestDist = world.seeAll ? Infinity : e.def.sightRange;
  for (const id of Object.keys(world.players).sort()) {
    const p = world.players[id];
    if (!isActive(p)) continue;
    const d = distance(e.pos, p.pos);
    if (d <= bestDist) {
      best = p;
      bestDist = d;
    }
  }
  return best;
}

/** How many enemies are winding up an attack right now (the "kung fu circle" limit). */
function attackersNow(world: WorldState): number {
  let n = 0;
  for (const e of world.enemies) if (e.mode === 'windup') n++;
  return n;
}

// ---------------------------------------------------------------- room progress

/** How close (tiles, center to center) a player must get to use the chest, the shrine or a door. */
const TOUCH = 1.05;

function updateProgress(world: WorldState, room: Room, ids: PlayerId[]): void {
  if (world.respawnEnemies) return; // practice rooms have no progress
  const prog = world.progress;
  const players = ids.map((id) => world.players[id]).filter(isActive);

  // The next wave arrives when the room is nearly clear.
  if (world.pendingSpawns.length > 0 && !world.waveHold) {
    const left = world.enemies.filter((e) => e.mode !== 'defeated').length;
    if (left <= COMBAT.nextWaveWhenLeft) spawnNextWave(world);
  }

  if (!prog.cleared) {
    if (allEnemiesBeaten(world)) {
      prog.cleared = true;
      world.events.push({ kind: 'roomCleared' });
      // Catch your breath: a small heal after a fight.
      if (room.enemySpawns.length > 0) {
        for (const p of players) {
          const before = p.health;
          p.health = Math.min(p.maxHealth, p.health + Math.round(p.maxHealth * COMBAT.roomClearHeal));
          if (p.health > before) world.events.push({ kind: 'breath', playerId: p.id, healed: p.health - before });
        }
      }
    } else {
      prog.ticks++;
    }
  }

  for (const p of players) {
    if (room.chest && prog.cleared && !prog.chestOpened && distance(p.pos, room.chest) <= TOUCH) {
      prog.chestOpened = true;
      world.events.push({ kind: 'chestOpened', playerId: p.id });
    }
    if (room.shrine && !prog.shrineUsed && distance(p.pos, room.shrine) <= TOUCH) {
      prog.shrineUsed = true;
      const healed = Math.round(p.maxHealth * COMBAT.restShrineHeal);
      const before = p.health;
      p.health = Math.min(p.maxHealth, p.health + healed);
      world.events.push({ kind: 'shrineUsed', playerId: p.id, healed: p.health - before });
    }
  }

  if (!prog.doorsOpen && prog.cleared && prog.doorCount > 0 && (!room.chest || prog.chestOpened)) {
    prog.doorsOpen = true;
    world.events.push({ kind: 'doorsOpen' });
  }
  if (prog.doorsOpen) {
    const slots = activeDoorSlots(room, prog.doorCount);
    for (const p of players) {
      const door = slots.findIndex((slot) => distance(p.pos, room.doors[slot]) <= TOUCH);
      if (door >= 0) {
        world.events.push({ kind: 'doorEntered', playerId: p.id, door });
        prog.doorsOpen = false;
        prog.doorCount = 0;
        return;
      }
    }
  }
}

// ---------------------------------------------------------------- helpers

/** Space between two round bodies (negative if they overlap). */
function bodyGap(a: Vec2, ra: number, b: Vec2, rb: number): number {
  return distance(a, b) - ra - rb;
}

function directionTo(from: Vec2, to: Vec2): Vec2 {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const d = length(dx, dy);
  return d > 0 ? { x: dx / d, y: dy / d } : { x: 0, y: 1 };
}

/** B-MASHER-2 (E3): Mash guard helps a player until they make COMBAT.counter.mashGuardPerfects Perfect Counters in this room; each new room starts it again. In co-op each player has their own. */
export function mashGuardOn(p: PlayerState): boolean {
  return p.perfects < COMBAT.counter.mashGuardPerfects;
}
