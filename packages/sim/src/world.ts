// The game world and how it changes each tick. Everything in WorldState is
// plain data (no classes or functions), so it can be saved, copied, or sent
// over the network later for visits and co-op.

import { pushOutOfWalls } from './collision';
import { MOVEMENT, TICKS_PER_SECOND } from './config';
import { clamp, length, quantize, type Vec2 } from './math';
import { findPath, standableSpot } from './path';
import type { Room } from './room';

export type PlayerId = string;

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
}

export interface WorldState {
  tick: number;
  roomId: string;
  players: Record<PlayerId, PlayerState>;
}

/** What a player asks for on one tick. */
export type PlayerInput =
  | { kind: 'none' }
  /** On-screen stick: x and y from -1 to 1. Cancels any tapped destination. */
  | { kind: 'stick'; x: number; y: number }
  /** Tap: walk to this spot in the room (in tiles). */
  | { kind: 'moveTo'; x: number; y: number };

const NO_INPUT: PlayerInput = { kind: 'none' };
const STEP = MOVEMENT.speedTilesPerSecond / TICKS_PER_SECOND;

export function createWorld(room: Room, playerIds: PlayerId[]): WorldState {
  const players: Record<PlayerId, PlayerState> = {};
  for (const id of playerIds) {
    players[id] = {
      id,
      pos: { x: room.playerStart.x, y: room.playerStart.y },
      facing: { x: 0, y: 1 },
      path: null,
      stuckTicks: 0,
      moving: false,
    };
  }
  return { tick: 0, roomId: room.id, players };
}

/** Advances the world by one tick (1/20 of a second). Changes `world` in place. */
export function stepWorld(world: WorldState, room: Room, inputs: Record<PlayerId, PlayerInput>): void {
  // Sorted order, so results are the same no matter how inputs arrived.
  for (const id of Object.keys(world.players).sort()) {
    stepPlayer(world.players[id], room, inputs[id] ?? NO_INPUT);
  }
  world.tick++;
}

function stepPlayer(p: PlayerState, room: Room, input: PlayerInput): void {
  const r = MOVEMENT.playerRadius;
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
    const target = standableSpot(room, { x: quantize(input.x), y: quantize(input.y) }, r);
    p.path = findPath(room, p.pos, target, r);
    p.stuckTicks = 0;
  }

  if (input.kind !== 'stick' && p.path) walkPath(p);

  pushOutOfWalls(room, p.pos, r);

  const moved = length(p.pos.x - before.x, p.pos.y - before.y);
  p.moving = moved > 0.0001;
  if (p.path) {
    // Blocked while walking to a spot (shouldn't happen, but never walk into a wall forever).
    p.stuckTicks = moved < STEP * 0.25 ? p.stuckTicks + 1 : 0;
    if (p.stuckTicks >= MOVEMENT.stuckTicks) p.path = null;
  }
}

/** Walks along the path at full speed, carrying leftover distance around corners. */
function walkPath(p: PlayerState): void {
  let budget = STEP;
  while (p.path && p.path.length > 0 && budget > 0) {
    const next = p.path[0];
    const dx = next.x - p.pos.x;
    const dy = next.y - p.pos.y;
    const dist = length(dx, dy);
    if (dist > 0) p.facing = { x: dx / dist, y: dy / dist };
    if (dist <= budget) {
      p.pos.x = next.x;
      p.pos.y = next.y;
      budget -= dist;
      p.path.shift();
    } else {
      p.pos.x += (dx / dist) * budget;
      p.pos.y += (dy / dist) * budget;
      budget = 0;
    }
  }
  if (p.path && p.path.length === 0) p.path = null;
}
