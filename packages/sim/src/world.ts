// The game world and how it changes each tick. Everything in WorldState is
// plain data (no classes or functions), so it can be saved, copied, or sent
// over the network later for visits and co-op.

import { pushOutOfWalls } from './collision';
import { comboBonus, damage } from './combat';
import { COMBAT, DIFFICULTY, MOVEMENT, TICKS_PER_SECOND, type Difficulty } from './config';
import type { EnemyDef } from './enemy';
import { clamp, distance, length, quantize, type Vec2 } from './math';
import { findPath, standableSpot } from './path';
import type { Room } from './room';

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
  /** Ticks left before returning to the room start after defeat; 0 while fighting. */
  downTicks: number;
}

/**
 * What an enemy is doing:
 * waiting (just appeared), chase, windup (telegraphing an attack), recover (after a swing),
 * stagger (after a Perfect Counter), defeated (gone until it comes back).
 */
export type EnemyMode = 'waiting' | 'chase' | 'windup' | 'recover' | 'stagger' | 'defeated';

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
}

/** Things that happened during the last tick, so the game can play effects and sounds. */
export type CombatEvent =
  | { kind: 'playerAttack'; playerId: PlayerId; enemyId: EnemyId; move: 'basic' | 'strike' | 'counter'; damage: number; defeated: boolean }
  | { kind: 'telegraph'; enemyId: EnemyId; ticks: number }
  | { kind: 'enemySwing'; enemyId: EnemyId }
  | { kind: 'perfectCounter'; playerId: PlayerId; enemyId: EnemyId }
  | { kind: 'block'; playerId: PlayerId; enemyId: EnemyId; damage: number }
  | { kind: 'hit'; playerId: PlayerId; enemyId: EnemyId; damage: number }
  | { kind: 'counterPressed'; playerId: PlayerId }
  | { kind: 'strikeRefused'; playerId: PlayerId; reason: 'focus' | 'noTarget' }
  | { kind: 'playerDown'; playerId: PlayerId }
  | { kind: 'playerReturn'; playerId: PlayerId }
  | { kind: 'enemySpawn'; enemyId: EnemyId };

export interface WorldState {
  tick: number;
  roomId: string;
  difficulty: Difficulty;
  players: Record<PlayerId, PlayerState>;
  /** Enemies in a fixed order (updated in this order every tick). */
  enemies: EnemyState[];
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
export type PlayerInput = MoveInput & { action?: 'strike' | 'counter' };

export interface WorldOptions {
  /** Enemy types by id. Without these, the room's enemies are left out (an empty practice room). */
  enemyTypes?: Record<string, EnemyDef>;
  difficulty?: Difficulty;
}

const NO_INPUT: PlayerInput = { kind: 'none' };
const STEP = MOVEMENT.speedTilesPerSecond / TICKS_PER_SECOND;
const R = MOVEMENT.playerRadius;

export function createWorld(room: Room, playerIds: PlayerId[], options: WorldOptions = {}): WorldState {
  const players: Record<PlayerId, PlayerState> = {};
  for (const id of playerIds) {
    players[id] = {
      id,
      pos: { x: room.playerStart.x, y: room.playerStart.y },
      facing: { x: 0, y: 1 },
      path: null,
      stuckTicks: 0,
      moving: false,
      health: COMBAT.player.maxHealth,
      maxHealth: COMBAT.player.maxHealth,
      power: COMBAT.player.power,
      guard: COMBAT.player.guard,
      focus: 0,
      combo: 0,
      attackCooldown: 0,
      strikeRecovery: 0,
      counterPressedTick: -1,
      guardTicks: 0,
      counterLockout: 0,
      counterBonusTicks: 0,
      downTicks: 0,
    };
  }

  const enemies: EnemyState[] = [];
  if (options.enemyTypes) {
    room.enemySpawns.forEach((spawn, i) => {
      const def = options.enemyTypes![spawn.enemy];
      if (!def) throw new Error(`Room "${room.id}" uses enemy "${spawn.enemy}", but no such enemy type was loaded`);
      const e: EnemyState = {
        id: `e${i + 1}`,
        def,
        spawn: { ...spawn.pos },
        pos: { ...spawn.pos },
        facing: { x: 0, y: 1 },
        health: def.maxHealth,
        mode: 'waiting',
        modeTicks: COMBAT.enemySpawnWaitTicks,
        windupTotal: 0,
        attackCenter: null,
        path: null,
        repathIn: 0,
      };
      enemies.push(e);
    });
  }

  return {
    tick: 0,
    roomId: room.id,
    difficulty: options.difficulty ?? COMBAT.defaultDifficulty,
    players,
    enemies,
    events: [],
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
  for (const id of ids) separateFromEnemies(world, world.players[id], room);
  world.tick++;
}

/** True while a player is fighting (not defeated). */
export function isActive(p: PlayerState): boolean {
  return p.downTicks === 0;
}

/** True if an enemy is in the room and can be hit. */
export function isEnemyPresent(e: EnemyState): boolean {
  return e.mode !== 'defeated';
}

/**
 * Total wind-up for an enemy's attack on a difficulty. The enemy file's telegraphTicks is the
 * Standard total; its fill part (before the Standard window) is scaled, then this
 * difficulty's window is added.
 */
export function telegraphTicks(def: EnemyDef, difficulty: Difficulty): number {
  const fill = def.attack.telegraphTicks - DIFFICULTY.standard.counterWindowTicks;
  const d = DIFFICULTY[difficulty];
  return Math.round(fill * d.fillScale) + d.counterWindowTicks;
}

/** The Perfect Counter window for a player, in ticks. */
export function counterWindowTicks(world: WorldState, p: PlayerState): number {
  return DIFFICULTY[world.difficulty].counterWindowTicks + p.counterBonusTicks;
}

// ---------------------------------------------------------------- players

function stepPlayer(world: WorldState, p: PlayerState, room: Room, input: PlayerInput): void {
  if (p.downTicks > 0) {
    p.moving = false;
    p.downTicks--;
    if (p.downTicks === 0) returnToStart(world, p, room);
    return;
  }

  if (p.attackCooldown > 0) p.attackCooldown--;
  if (p.strikeRecovery > 0) p.strikeRecovery--;
  if (p.counterLockout > 0) p.counterLockout--;
  if (p.guardTicks > 0) {
    p.guardTicks--;
    // The guard ran out without countering anything: Counter rests briefly, so it can't be spammed.
    if (p.guardTicks === 0) p.counterLockout = COMBAT.counter.missLockoutTicks;
  }

  if (input.action === 'counter' && p.guardTicks === 0 && p.counterLockout === 0) {
    p.counterPressedTick = world.tick;
    p.guardTicks = Math.max(COMBAT.counter.guardTicks, counterWindowTicks(world, p) + COMBAT.counter.blockTicksAfterWindow);
    p.path = null;
    world.events.push({ kind: 'counterPressed', playerId: p.id });
  } else if (input.action === 'strike' && p.guardTicks === 0 && p.strikeRecovery === 0) {
    tryStrike(world, p, room);
  }

  if (p.guardTicks > 0) {
    // Holding the guard pose: no walking.
    p.moving = false;
  } else {
    movePlayer(p, room, input);
  }

  if (p.guardTicks === 0 && p.strikeRecovery === 0 && p.attackCooldown === 0) {
    const target = nearestEnemy(world, p, COMBAT.basicAttack.reach);
    if (target) {
      p.attackCooldown = COMBAT.basicAttack.cooldownTicks;
      landHit(world, p, target, 'basic', COMBAT.basicAttack.strength, COMBAT.focus.perHit);
    }
  }
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
}

/** A player's hit on an enemy: damage with the combo bonus, Focus, and the combo counter. */
function landHit(
  world: WorldState,
  p: PlayerState,
  e: EnemyState,
  move: 'basic' | 'strike' | 'counter',
  strength: number,
  focusGain: number,
): void {
  const dmg = damage(p.power, strength, e.def.guard, comboBonus(p.combo));
  e.health = Math.max(0, e.health - dmg);
  p.combo++;
  p.focus = Math.min(COMBAT.focus.max, p.focus + focusGain);
  p.facing = directionTo(p.pos, e.pos);
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
  world.events.push({ kind: 'playerReturn', playerId: p.id });
  // If nobody else is still fighting, the whole room starts over.
  const othersFighting = Object.values(world.players).some((o) => o !== p && isActive(o));
  if (!othersFighting) {
    for (const e of world.enemies) resetEnemy(world, e);
  }
}

function movePlayer(p: PlayerState, room: Room, input: MoveInput): void {
  const before = { x: p.pos.x, y: p.pos.y };

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
  switch (e.mode) {
    case 'defeated':
      if (--e.modeTicks <= 0) {
        resetEnemy(world, e);
      }
      return;
    case 'waiting':
    case 'recover':
    case 'stagger':
      if (--e.modeTicks <= 0) e.mode = 'chase';
      return;
    case 'windup':
      if (--e.modeTicks <= 0) {
        e.mode = 'recover';
        e.modeTicks = e.def.attack.recoverTicks;
        resolveAttack(world, e);
        e.attackCenter = null;
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
  const a = e.def.attack;
  if (distance(e.pos, target.pos) <= a.startRange && attackersNow(world) < COMBAT.maxAttackersAtOnce) {
    // Start the telegraph. The danger area is fixed now, so the player can step out of it.
    const ticks = telegraphTicks(e.def, world.difficulty);
    e.mode = 'windup';
    e.modeTicks = ticks;
    e.windupTotal = ticks;
    e.attackCenter = { x: e.pos.x + e.facing.x * a.reach, y: e.pos.y + e.facing.y * a.reach };
    e.path = null;
    world.events.push({ kind: 'telegraph', enemyId: e.id, ticks });
    return;
  }
  if (e.repathIn <= 0 || !e.path) {
    e.path = findPath(room, e.pos, target.pos, e.def.radius);
    e.repathIn = COMBAT.enemyRepathTicks;
  }
  e.repathIn--;
  // Don't walk right on top of the player; stop once in attack range.
  if (e.path && distance(e.pos, target.pos) > a.startRange * 0.8) {
    walkPath(e.pos, e.path, e.def.moveSpeedTilesPerSecond / TICKS_PER_SECOND);
    pushOutOfWalls(room, e.pos, e.def.radius);
  }
}

/** The swing lands: each player in the danger area gets a Perfect Counter, a Block, or a Hit. */
function resolveAttack(world: WorldState, e: EnemyState): void {
  world.events.push({ kind: 'enemySwing', enemyId: e.id });
  const center = e.attackCenter;
  if (!center) return;
  const a = e.def.attack;
  for (const id of Object.keys(world.players).sort()) {
    const p = world.players[id];
    if (!isActive(p)) continue;
    // Caught if the player's center is inside the area, or within half a body of its edge.
    if (distance(p.pos, center) > a.areaRadius + R * 0.5) continue;

    const guarding = p.guardTicks > 0;
    if (guarding && world.tick - p.counterPressedTick < counterWindowTicks(world, p)) {
      // Perfect Counter: no damage, enemy staggered, counter hit for 2x Power, +25 Focus.
      p.guardTicks = 0;
      world.events.push({ kind: 'perfectCounter', playerId: p.id, enemyId: e.id });
      landHit(world, p, e, 'counter', COMBAT.counter.perfectStrength, COMBAT.focus.perPerfectCounter);
      if (e.mode !== 'defeated') {
        e.mode = 'stagger';
        e.modeTicks = COMBAT.counter.perfectStaggerTicks;
      }
    } else if (guarding) {
      // Block: half damage, no stagger. The combo is kept.
      p.guardTicks = 0;
      const dmg = damage(e.def.power, a.strength * COMBAT.counter.blockDamageMultiplier, p.guard);
      world.events.push({ kind: 'block', playerId: p.id, enemyId: e.id, damage: dmg });
      hurt(world, p, dmg);
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
  p.health = Math.max(0, p.health - dmg);
  if (p.health === 0) {
    p.downTicks = COMBAT.defeatTicks;
    p.path = null;
    p.guardTicks = 0;
    p.moving = false;
    world.events.push({ kind: 'playerDown', playerId: p.id });
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
