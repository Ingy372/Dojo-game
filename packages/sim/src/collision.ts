// Keeps round bodies out of wall tiles. Bodies are pushed out of any wall
// they overlap, which also makes them slide smoothly along walls and corners.

import { clamp, length, type Vec2 } from './math';
import { MOVEMENT } from './config';
import { isWallTile, type Room } from './room';

/**
 * The point of wall tile (col, row) nearest to `pos`. In rooms with rounded corners, an outside corner (both tiles
 * beside it open) is a quarter circle, so a lone tile is a circle and a row of tiles is a capsule.
 */
function nearestWallPoint(room: Room, col: number, row: number, pos: Vec2): Vec2 {
  const near = { x: clamp(pos.x, col, col + 1), y: clamp(pos.y, row, row + 1) };
  if (!room.roundCorners) return near;
  const c = MOVEMENT.cornerRound;
  const left = pos.x < col + c;
  const right = !left && pos.x > col + 1 - c;
  const up = pos.y < row + c;
  const down = !up && pos.y > row + 1 - c;
  if (!(left || right) || !(up || down)) return near;
  if (isWallTile(room, col + (left ? -1 : 1), row) || isWallTile(room, col, row + (up ? -1 : 1))) return near;
  const cx = left ? col + c : col + 1 - c;
  const cy = up ? row + c : row + 1 - c;
  const dx = pos.x - cx;
  const dy = pos.y - cy;
  const d = length(dx, dy);
  // inside the rounded corner: the body's centre is in the wall (the caller pushes it out by the nearest side)
  if (d <= c) return { x: pos.x, y: pos.y };
  return { x: cx + (dx / d) * c, y: cy + (dy / d) * c };
}

/** True if a circle at `pos` would overlap any wall. */
export function circleHitsWall(room: Room, pos: Vec2, radius: number): boolean {
  const minCol = Math.floor(pos.x - radius);
  const maxCol = Math.floor(pos.x + radius);
  const minRow = Math.floor(pos.y - radius);
  const maxRow = Math.floor(pos.y + radius);
  for (let row = minRow; row <= maxRow; row++) {
    for (let col = minCol; col <= maxCol; col++) {
      if (!isWallTile(room, col, row)) continue;
      const n = nearestWallPoint(room, col, row, pos);
      const dx = pos.x - n.x;
      const dy = pos.y - n.y;
      if (dx * dx + dy * dy < radius * radius) return true;
    }
  }
  return false;
}

/** Pushes a circle out of the walls it overlaps. Changes `pos` in place. */
export function pushOutOfWalls(room: Room, pos: Vec2, radius: number): void {
  // A few passes settle corners where two walls push at once.
  for (let pass = 0; pass < 4; pass++) {
    let moved = false;
    const minCol = Math.floor(pos.x - radius);
    const maxCol = Math.floor(pos.x + radius);
    const minRow = Math.floor(pos.y - radius);
    const maxRow = Math.floor(pos.y + radius);
    for (let row = minRow; row <= maxRow; row++) {
      for (let col = minCol; col <= maxCol; col++) {
        if (!isWallTile(room, col, row)) continue;
        const n = nearestWallPoint(room, col, row, pos);
        const dx = pos.x - n.x;
        const dy = pos.y - n.y;
        const dist = length(dx, dy);
        if (dist >= radius) continue;
        if (dist > 0) {
          // a hair extra on a curve, so rounding never leaves the body just touching it (and counted as inside)
          const push = radius - dist + (room.roundCorners ? 1e-6 : 0);
          pos.x += (dx / dist) * push;
          pos.y += (dy / dist) * push;
        } else {
          // Center is inside the wall: leave by the nearest side.
          const left = pos.x - col;
          const right = col + 1 - pos.x;
          const up = pos.y - row;
          const down = row + 1 - pos.y;
          const least = Math.min(left, right, up, down);
          if (least === left) pos.x = col - radius;
          else if (least === right) pos.x = col + 1 + radius;
          else if (least === up) pos.y = row - radius;
          else pos.y = row + 1 + radius;
        }
        moved = true;
      }
    }
    if (!moved) return;
  }
}

/** True if a circle can travel in a straight line from `a` to `b` without touching a wall. */
export function clearPath(room: Room, a: Vec2, b: Vec2, radius: number): boolean {
  const dist = length(b.x - a.x, b.y - a.y);
  const steps = Math.max(1, Math.ceil(dist / 0.1));
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    if (circleHitsWall(room, { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t }, radius)) {
      return false;
    }
  }
  return true;
}
