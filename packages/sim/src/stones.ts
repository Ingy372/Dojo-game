// TUT-B1: the tutorial's falling stones. A red circle always fills first, then a melon-sized stone lands.
// A hero still inside stumbles for a moment (no damage) and that wave drops again, with help after
// a couple of misses; after a few misses the wave counts as done anyway, so a kid is never stuck.

import { MOVEMENT, STONES, secondsToTicks } from './config';
import { distance, type Vec2 } from './math';
import type { Room } from './room';
import type { PlayerId, WorldState } from './world';

export interface StoneState {
  /** Index into the room's stone waves. */
  wave: number;
  /** Misses on this wave so far. */
  misses: number;
  /** Ticks before the next drop starts (between drops). */
  gapTicks: number;
  /** Ticks until the stones land (0 = no circle showing). */
  fillLeft: number;
  /** Where to stand, shown once help is on (null otherwise). */
  safeSpot: Vec2 | null;
  /** Ticks of stumble left per player. */
  stumble: Record<PlayerId, number>;
  done: boolean;
}

export function newStones(room: Room): StoneState | null {
  if (room.stoneWaves.length === 0) return null;
  return { wave: 0, misses: 0, gapTicks: secondsToTicks(STONES.gapSeconds), fillLeft: 0, safeSpot: null, stumble: {}, done: false };
}

/** True while this player is stumbling and can't move or act. */
export function isStumbling(world: WorldState, id: PlayerId): boolean {
  return (world.stones?.stumble[id] ?? 0) > 0;
}

/** One tick of the stones. Call after the players move. */
export function stepStones(world: WorldState, room: Room, ids: PlayerId[]): void {
  const st = world.stones;
  if (!st) return;
  for (const id of ids) if (st.stumble[id] > 0) st.stumble[id]--;
  // TUT-B3: in a room with a glowing spot, the stones wait until the hero reaches it.
  if (st.done || (world.goal && !world.goal.reached)) return;
  const wave = room.stoneWaves[st.wave];
  if (st.gapTicks > 0) {
    if (--st.gapTicks > 0) return;
    const help = st.misses >= STONES.helpAfterMisses;
    st.fillLeft = help ? Math.round(wave.fillTicks * STONES.helpFillScale) : wave.fillTicks;
    st.safeSpot = help ? (wave.safeSpot ? { ...wave.safeSpot } : safeSpot(world, room, wave.spots, ids)) : null;
    world.events.push({ kind: 'stoneWarn', wave: st.wave + 1, spots: wave.spots.map((s) => ({ ...s })), ticks: st.fillLeft, safeSpot: st.safeSpot });
    return;
  }
  if (--st.fillLeft > 0) return;
  world.events.push({ kind: 'stoneLand', wave: st.wave + 1, spots: wave.spots.map((s) => ({ ...s })) });
  const hit = ids.filter((id) => wave.spots.some((s) => distance(world.players[id].pos, s) <= STONES.radius));
  for (const id of hit) {
    st.stumble[id] = secondsToTicks(STONES.stumbleSeconds);
    world.events.push({ kind: 'stumble', playerId: id });
  }
  st.misses = hit.length > 0 ? st.misses + 1 : 0;
  if (hit.length === 0 || st.misses >= STONES.passAfterMisses) {
    world.events.push({ kind: 'stoneWaveDone', wave: st.wave + 1, dodged: hit.length === 0 });
    st.wave++;
    st.misses = 0;
  }
  st.safeSpot = null;
  if (st.wave >= room.stoneWaves.length) {
    st.done = true;
    world.events.push({ kind: 'stonesDone' });
  } else {
    st.gapTicks = secondsToTicks(STONES.gapSeconds);
  }
}

/** The floor tile centre nearest the first player that is clear of every circle (with room for the body). */
function safeSpot(world: WorldState, room: Room, spots: Vec2[], ids: PlayerId[]): Vec2 | null {
  const from = world.players[ids[0]]?.pos ?? room.playerStart;
  const clearance = STONES.radius + MOVEMENT.playerRadius;
  let best: Vec2 | null = null;
  for (let y = 0; y < room.height; y++) {
    for (let x = 0; x < room.width; x++) {
      if (room.walls[y][x]) continue;
      const c = { x: x + 0.5, y: y + 0.5 };
      if (spots.some((s) => distance(c, s) <= clearance)) continue;
      if (!best || distance(c, from) < distance(best, from)) best = c;
    }
  }
  return best;
}
