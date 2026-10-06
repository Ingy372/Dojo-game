// The game world and how it changes each tick. Everything in WorldState is
// plain data (no classes or functions), so it can be saved, copied, or sent
// over the network later for visits and co-op.

import { pushOutOfWalls } from './collision';
import { comboBonus, damage } from './combat';
import { COMBAT, DIFFICULTY, MOVEMENT, TICKS_PER_SECOND, type Difficulty } from './config';
import { noMods, type PlayerMods } from './effects';
import type { EnemyAttackDef, EnemyDef } from './enemy';
import { clamp, distance, length, quantize, type Vec2 } from './math';
import { findPath, standableSpot } from './path';
import { activeDoorSlots, waveCount, type EnemySpawn, type Room } from './room';

export type PlayerId = string;
export type EnemyId = string;

export interface PlayerState {
  id: PlayerId;
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
  /** Extra Perfect Counter window ticks (the Rooted Form adds some later). */
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
  /** Which way it circles while waiting its turn to attack: 1 or -1. */
  orbit: number;
  /** Ticks spent chasing since its last swing (for getting winded). */
  chaseTicks: number;
}

/** Things that happened during the last tick, so the game can play effects and sounds. */
export type AttackMove = 'basic' | 'strike' | 'counter' | 'chain' | 'ripple' | 'reflect';

export type CombatEvent =
  | { kind: 'playerAttack'; playerId: PlayerId; enemyId: EnemyId; move: AttackMove; damage: number; defeated: boolean }
  | { kind: 'telegraph'; enemyId: EnemyId; ticks: number }
  | { kind: 'enemySwing'; enemyId: EnemyId }
  | { kind: 'perfectCounter'; playerId: PlayerId; enemyId: EnemyId }
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
  | { kind: 'speedBurst'; playerId: PlayerId }
  | { kind: 'winded'; enemyId: EnemyId }
  | { kind: 'wave'; wave: number; of: number }
  | { kind: 'playerOut'; playerId: PlayerId }
  | { kind: 'roomCleared' }
  | { kind: 'breath'; playerId: PlayerId; healed: number }
  | { kind: 'chestOpened'; playerId: PlayerId }
  | { kind: 'shrineUsed'; playerId: PlayerId; healed: number }
  | { kind: 'doorsOpen' }
  /** `door` is the position in the offered doors (0 = leftmost offered door). */
  | { kind: 'doorEntered'; playerId: PlayerId; door: number };

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
  pendingSpawns: EnemySpawn[];
  progress: RoomProgress;
  /** Events from the most recent tick only. */
  events: CombatEvent[];
}

/** Movement part of a player's request for one tick. */
export type MoveInput =
  | { kind: 'none' }
  /** On-screen stick: x and y from -1 to 1. Cancels any tapped destination. */
  | { kind: 'stick'; x: number; y: number }
  /** Tap: walk to this spot in the room (in tiles). */
  | { kind: 'moveTo'; x: number; y: number };

/** What a player asks for on one tick: movement, plus a button press if any. */
export type PlayerAction = 'strike' | 'counter' | 'dash';
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
}

export interface PlayerSetup {
  maxHealth: number;
  power: number;
  guard: number;
  /** Health carried over from the last room (defaults to full). */
  health?: number;
  mods?: PlayerMods;
}

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
    };
  }

  const respawnEnemies = options.respawnEnemies ?? true;
  const enemies: EnemyState[] = [];
  const pendingSpawns: EnemySpawn[] = [];
  // Keep every type that can appear later (later waves, a boss's helpers), so the
  // world has everything it needs when saved or sent.
  const enemyTypes: Record<string, EnemyDef> = {};
  if (options.enemyTypes) {
    const typeOf = (id: string): EnemyDef => {
      const def = options.enemyTypes![id];
      if (!def) throw new Error(`Room "${room.id}" uses enemy "${id}", but no such enemy type was loaded`);
      return def;
    };
    room.enemySpawns.forEach((spawn, i) => {
      const def = typeOf(spawn.enemy);
      // Practice rooms put everyone in at once; floor rooms hold later waves back.
      if (spawn.wave === 1 || respawnEnemies) enemies.push(newEnemy(`e${i + 1}`, def, spawn.pos, i));
      else {
        pendingSpawns.push({ enemy: spawn.enemy, pos: { ...spawn.pos }, wave: spawn.wave });
        enemyTypes[spawn.enemy] = def;
      }
      if (def.summon) enemyTypes[def.summon.enemy] = typeOf(def.summon.enemy);
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
  };
}

/** Changes a player's Insight and charm effects (for example after picking an Insight). */
export function setPlayerMods(p: PlayerState, mods: PlayerMods): void {
  p.mods = { ...mods };
}

function newEnemy(id: EnemyId, def: EnemyDef, pos: Vec2, n: number): EnemyState {
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
  };
}

/** Advances the world by one tick (1/20 of a second). Changes `world` in place. */
export function stepWorld(world: WorldState, room: Room, inputs: Record<PlayerId, PlayerInput>): void {
  world.events = [];
  // Sorted order, so results are the same no matter how inputs arrived.
  const ids = Object.keys(world.players).sort();
  for (const id of ids) {
    stepPlayer(world, world.players[id], room, inputs[id] ?? NO_INPUT);
  }
  for (const e of world.enemies) stepEnemy(world, e, room);
  separateEnemies(world, room);
  for (const id of ids) separateFromEnemies(world, world.players[id], room);
  updateProgress(world, room, ids);
  world.tick++;
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

/** The Perfect Counter window for a player, in ticks. */
export function counterWindowTicks(world: WorldState, p: PlayerState): number {
  return DIFFICULTY[world.difficulty].counterWindowTicks + p.counterBonusTicks;
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
  }

  if (p.dashTicks > 0) {
    dashStep(p, room);
  } else if (p.guardTicks > 0) {
    // Holding the guard pose: no walking.
    p.moving = false;
  } else {
    movePlayer(p, room, input);
  }

  if (p.dashTicks === 0 && p.guardTicks === 0 && p.strikeRecovery === 0 && p.attackCooldown === 0) {
    const target = nearestEnemy(world, p, COMBAT.basicAttack.reach);
    if (target) {
      p.attackCooldown = Math.max(1, Math.round(COMBAT.basicAttack.cooldownTicks * (1 - p.mods.attackSpeed)));
      landHit(world, p, target, 'basic', COMBAT.basicAttack.strength, COMBAT.focus.perHit);
    }
  }
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
  p.dashCooldown = COMBAT.dash.cooldownTicks;
  p.path = null;
  world.events.push({ kind: 'dash', playerId: p.id });
}

function dashStep(p: PlayerState, room: Room): void {
  const step = COMBAT.dash.distanceTiles / COMBAT.dash.ticks;
  p.pos.x += p.dashDir.x * step;
  p.pos.y += p.dashDir.y * step;
  pushOutOfWalls(room, p.pos, R);
  p.dashTicks--;
  p.moving = true;
}

function tryStrike(world: WorldState, p: PlayerState, room: Room): void {
  const s = COMBAT.strike;
  if (p.focus < s.focusCost) {
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
  p.focus -= s.focusCost;
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
      // Basic attacks bounce off the shield: no damage, no Focus.
      p.facing = directionTo(p.pos, e.pos);
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
  const dmg = damage(p.power * (1 + p.mods.powerScale), strength, e.def.guard, bonus);
  p.combo++;
  if (p.combo > world.progress.bestCombo) world.progress.bestCombo = p.combo;
  if (p.mods.comboSpeedEvery > 0 && p.combo % p.mods.comboSpeedEvery === 0) {
    p.speedBoostTicks = p.mods.comboSpeedTicks;
    world.events.push({ kind: 'speedBurst', playerId: p.id });
  }
  const lowHealth = p.health < p.maxHealth * p.mods.lowHealthBelow;
  p.focus = Math.min(COMBAT.focus.max, p.focus + focusGain * (lowHealth ? p.mods.lowHealthFocusScale : 1));
  p.facing = directionTo(p.pos, e.pos);
  hurtEnemy(world, p, e, move, dmg);
}

/** Damage lands on an enemy. */
function hurtEnemy(world: WorldState, p: PlayerState, e: EnemyState, move: AttackMove, dmg: number): void {
  e.health = Math.max(0, e.health - dmg);
  const defeated = e.health === 0;
  if (defeated) {
    e.mode = 'defeated';
    e.modeTicks = COMBAT.enemyRespawnTicks;
    e.attackCenter = null;
    e.path = null;
  }
  world.events.push({ kind: 'playerAttack', playerId: p.id, enemyId: e.id, move, damage: dmg, defeated });
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
  const STEP = BASE_STEP * (p.speedBoostTicks > 0 ? 1 + p.mods.comboSpeedBonus : 1);

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
  }
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
        e.attackIndex = (e.attackIndex + 1) % e.def.attacks.length;
      }
      return;
    case 'chase':
      chase(world, e, room);
      return;
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
    const ticks = telegraphTicks(a, world.difficulty);
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
  for (const id of Object.keys(world.players).sort()) {
    const p = world.players[id];
    if (!isActive(p)) continue;
    // Caught if the player's center is inside the area, or within half a body of its edge.
    if (distance(p.pos, center) > a.areaRadius + R * 0.5) continue;

    const guarding = p.guardTicks > 0;
    if (guarding && world.tick - p.counterPressedTick < counterWindowTicks(world, p)) {
      // Perfect Counter: no damage, enemy staggered, counter hit for 2x Power, +25 Focus.
      p.guardTicks = 0;
      world.progress.perfects++;
      world.events.push({ kind: 'perfectCounter', playerId: p.id, enemyId: e.id });
      if (p.mods.healOnPerfect > 0) p.health = Math.min(p.maxHealth, p.health + p.mods.healOnPerfect);
      landHit(world, p, e, 'counter', COMBAT.counter.perfectStrength, COMBAT.focus.perPerfectCounter);
      if (e.mode !== 'defeated') {
        e.mode = 'stagger';
        e.modeTicks = COMBAT.counter.perfectStaggerTicks;
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
    } else if (guarding) {
      // Block: half damage, no stagger. The combo is kept.
      p.guardTicks = 0;
      const dmg = damage(e.def.power, a.strength * COMBAT.counter.blockDamageMultiplier, p.guard);
      world.events.push({ kind: 'block', playerId: p.id, enemyId: e.id, damage: dmg });
      hurt(world, p, dmg);
      // Iron Skin: part of the full hit bounces back (shields stop it, unless Shield Breaker).
      if (p.mods.blockReflect > 0 && isEnemyPresent(e) && (!e.shieldUp || p.mods.shieldBreaker)) {
        const back = Math.max(1, Math.round(damage(e.def.power, a.strength, p.guard) * p.mods.blockReflect));
        hurtEnemy(world, p, e, 'reflect', back);
      }
    } else {
      // Hit: full damage, combo resets.
      const dmg = damage(e.def.power, a.strength, p.guard);
      p.combo = 0;
      world.events.push({ kind: 'hit', playerId: p.id, enemyId: e.id, damage: dmg });
      hurt(world, p, dmg);
    }
  }
}

function hurt(world: WorldState, p: PlayerState, dmg: number): void {
  world.progress.damageTaken += Math.min(dmg, p.health);
  p.health = Math.max(0, p.health - dmg);
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

function spawnNextWave(world: WorldState): void {
  world.wave++;
  const now = world.pendingSpawns.filter((s) => s.wave <= world.wave);
  world.pendingSpawns = world.pendingSpawns.filter((s) => s.wave > world.wave);
  for (const s of now) {
    const e = newEnemy(`e${world.nextEnemyNumber++}`, world.enemyTypes[s.enemy], s.pos, world.enemies.length);
    world.enemies.push(e);
    world.events.push({ kind: 'enemySpawn', enemyId: e.id });
  }
  world.events.push({ kind: 'wave', wave: world.wave, of: world.waveCount });
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
  e.chaseTicks = 0;
  world.events.push({ kind: 'enemySpawn', enemyId: e.id });
}

function nearestPlayer(world: WorldState, e: EnemyState): PlayerState | null {
  let best: PlayerState | null = null;
  let bestDist = e.def.sightRange;
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
  if (world.pendingSpawns.length > 0) {
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
