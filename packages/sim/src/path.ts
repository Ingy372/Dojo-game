// Finds a walking route around walls to a tapped spot.

import { circleHitsWall, clearPath, pushOutOfWalls } from './collision';
import type { Vec2 } from './math';
import { isWallTile, type Room } from './room';

const STRAIGHT = 10;
const DIAGONAL = 14;
const NEIGHBORS: ReadonlyArray<[number, number, number]> = [
  [1, 0, STRAIGHT],
  [-1, 0, STRAIGHT],
  [0, 1, STRAIGHT],
  [0, -1, STRAIGHT],
  [1, 1, DIAGONAL],
  [1, -1, DIAGONAL],
  [-1, 1, DIAGONAL],
  [-1, -1, DIAGONAL],
];

/**
 * Picks where the player should actually stop for a tap: the tapped spot if it's
 * open floor, otherwise the nearest place they can stand.
 */
export function standableSpot(room: Room, tap: Vec2, radius: number): Vec2 {
  let col = Math.floor(tap.x);
  let row = Math.floor(tap.y);
  if (isWallTile(room, col, row)) {
    let best = Infinity;
    for (let r = 0; r < room.height; r++) {
      for (let c = 0; c < room.width; c++) {
        if (room.walls[r][c]) continue;
        const dx = c + 0.5 - tap.x;
        const dy = r + 0.5 - tap.y;
        const d = dx * dx + dy * dy;
        if (d < best) {
          best = d;
          col = c;
          row = r;
        }
      }
    }
    return { x: col + 0.5, y: row + 0.5 };
  }
  const spot = { x: tap.x, y: tap.y };
  pushOutOfWalls(room, spot, radius);
  if (Math.floor(spot.x) !== col || Math.floor(spot.y) !== row || circleHitsWall(room, spot, radius)) {
    return { x: col + 0.5, y: row + 0.5 };
  }
  return spot;
}

/**
 * Returns the corners to walk through to get from `from` to `to` (ending at `to`),
 * or null if there's no way there. Straight lines are used wherever possible.
 */
export function findPath(room: Room, from: Vec2, to: Vec2, radius: number): Vec2[] | null {
  if (clearPath(room, from, to, radius)) return [{ x: to.x, y: to.y }];

  const tiles = tileRoute(room, Math.floor(from.x), Math.floor(from.y), Math.floor(to.x), Math.floor(to.y));
  if (!tiles) return null;

  // Tile centers, then the exact end spot; then skip every corner we can see past.
  const points: Vec2[] = tiles.slice(1, -1).map(([c, r]) => ({ x: c + 0.5, y: r + 0.5 }));
  points.push({ x: to.x, y: to.y });
  const path: Vec2[] = [];
  let at = from;
  let i = 0;
  while (i < points.length) {
    let far = i;
    for (let j = points.length - 1; j > i; j--) {
      if (clearPath(room, at, points[j], radius)) {
        far = j;
        break;
      }
    }
    path.push(points[far]);
    at = points[far];
    i = far + 1;
  }
  return path;
}

/** A* search over floor tiles. Diagonal steps never cut a wall's corner. */
function tileRoute(room: Room, sc: number, sr: number, gc: number, gr: number): Array<[number, number]> | null {
  if (isWallTile(room, sc, sr) || isWallTile(room, gc, gr)) return null;
  const w = room.width;
  const key = (c: number, r: number) => r * w + c;
  const guess = (c: number, r: number) => {
    const dx = Math.abs(c - gc);
    const dy = Math.abs(r - gr);
    return STRAIGHT * Math.max(dx, dy) + (DIAGONAL - STRAIGHT) * Math.min(dx, dy);
  };
  const cost = new Map<number, number>([[key(sc, sr), 0]]);
  const cameFrom = new Map<number, number>();
  const open: number[] = [key(sc, sr)];
  const closed = new Set<number>();

  while (open.length > 0) {
    // Pick the most promising tile (first one wins ties, so results never vary).
    let bestIdx = 0;
    let bestScore = Infinity;
    for (let i = 0; i < open.length; i++) {
      const k = open[i];
      const score = cost.get(k)! + guess(k % w, Math.floor(k / w));
      if (score < bestScore) {
        bestScore = score;
        bestIdx = i;
      }
    }
    const current = open.splice(bestIdx, 1)[0];
    const cc = current % w;
    const cr = Math.floor(current / w);
    if (cc === gc && cr === gr) {
      const route: Array<[number, number]> = [[cc, cr]];
      let k = current;
      while (cameFrom.has(k)) {
        k = cameFrom.get(k)!;
        route.unshift([k % w, Math.floor(k / w)]);
      }
      return route;
    }
    closed.add(current);

    for (const [dc, dr, stepCost] of NEIGHBORS) {
      const nc = cc + dc;
      const nr = cr + dr;
      if (isWallTile(room, nc, nr)) continue;
      if (dc !== 0 && dr !== 0 && (isWallTile(room, cc + dc, cr) || isWallTile(room, cc, cr + dr))) continue;
      const nk = key(nc, nr);
      if (closed.has(nk)) continue;
      const newCost = cost.get(current)! + stepCost;
      const old = cost.get(nk);
      if (old === undefined || newCost < old) {
        cost.set(nk, newCost);
        cameFrom.set(nk, current);
        if (old === undefined) open.push(nk);
      }
    }
  }
  return null;
}
