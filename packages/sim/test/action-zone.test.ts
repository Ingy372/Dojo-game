// A4-DOJO-i: the Action Zone inside room's data, walk grid, door and walk-up spots.
import { describe, expect, it } from 'vitest';
import { MOVEMENT, ActionZoneError, circleHitsWall, createWorld, loadInsideRoom, stepWorld, type PlayerInput, type Vec2 } from '../src';
import insideJson from '../../../content/dojo/action-zone/inside-room.json';
import pack from '../../../assets/art/dojo-az-inside.json';

const inside = loadInsideRoom(insideJson);
const { room } = inside;
const R = MOVEMENT.playerRadius;

/** Walks a new hero for `ticks`, asking for `input(pos)` each tick. Calls `each` after every tick. */
function walk(from: Vec2, ticks: number, input: (pos: Vec2) => PlayerInput, each?: (pos: Vec2) => void): Vec2 {
  const world = createWorld(room, ['p1']);
  world.players.p1.pos = { ...from };
  for (let t = 0; t < ticks; t++) {
    stepWorld(world, room, { p1: input(world.players.p1.pos) });
    each?.(world.players.p1.pos);
  }
  return world.players.p1.pos;
}

describe('Action Zone inside room', () => {
  it('builds a 27 x 19 sim room whose grid matches the file', () => {
    expect(room.width).toBe(27);
    expect(room.height).toBe(19);
    expect(room.walls.flat().filter((w) => !w)).toHaveLength(insideJson.walkableCells);
    expect(room.playerStart).toEqual({ x: 13.5, y: 17.5 });
    expect(room.walls[0].every(Boolean)).toBe(true);
  });

  it('the spawn is on open floor, inside the room and short of the exit door', () => {
    expect(circleHitsWall(room, inside.spawn, R)).toBe(false);
    const [x0, x1, y0] = inside.exit;
    const inExit = inside.spawn.x >= x0 && inside.spawn.x <= x1 && inside.spawn.y >= y0;
    expect(inExit).toBe(false);
  });

  it('the spawn reaches every walk-up spot by tapping it, and each spot is on open floor', () => {
    expect(inside.spots.map((s) => s.id)).toHaveLength(11);
    for (const s of inside.spots) {
      const goal = { x: s.approachTile.x + 0.5, y: s.approachTile.y + 0.5 };
      expect(circleHitsWall(room, goal, R), s.id).toBe(false);
      const end = walk(inside.spawn, 20 * 25, () => ({ kind: 'moveTo', ...goal }));
      expect(Math.hypot(end.x - goal.x, end.y - goal.y), s.id).toBeLessThan(0.3);
    }
  });

  it('the spawn reaches the exit door, and tapping it from the lobby ends inside the exit rectangle', () => {
    const [x0, x1, y0, y1] = inside.exit;
    const end = walk(inside.spawn, 20 * 5, () => ({ kind: 'moveTo', x: (x0 + x1) / 2, y: y1 - 0.5 }));
    expect(end.x >= x0 && end.x <= x1 && end.y >= y0 && end.y <= y1).toBe(true);
  });

  it('a hero can never get into a blocker, from the stick or from a tap, from any side', () => {
    const blockers = insideJson.blockers;
    expect(blockers.length).toBeGreaterThan(3);
    for (const b of blockers) {
      for (const [col, row] of b.cells) expect(room.walls[row][col], `${b.id} ${col},${row}`).toBe(true);
      const [x0, x1, y0, y1] = b.rect;
      const centre = { x: (x0 + x1) / 2, y: (y0 + y1) / 2 };
      const inRect = (p: Vec2) => p.x > x0 && p.x < x1 && p.y > y0 && p.y < y1;
      const check = (p: Vec2) => {
        expect(inRect(p), b.id).toBe(false);
        expect(circleHitsWall(room, p, R - 0.01), b.id).toBe(false);
      };
      // A tap in the middle of it, from the spawn.
      walk(inside.spawn, 20 * 12, () => ({ kind: 'moveTo', ...centre }), check);
      // A stick pushed at it from the open floor on each side of its cells (stick pushed for 4 s).
      for (const [col, row] of b.cells) {
        for (const [dx, dy] of [[0, 1], [0, -1], [1, 0], [-1, 0]] as const) {
          const from = { x: col + 0.5 + dx, y: row + 0.5 + dy };
          if (room.walls[row + dy]?.[col + dx] !== false || circleHitsWall(room, from, R)) continue;
          walk(from, 80, () => ({ kind: 'stick', x: -dx, y: -dy }), check);
        }
      }
    }
  });

  it('every foreground sprite and walk-up spot has art in the dojo-az-inside pack', () => {
    const all = (pack.entries as Record<string, { sprites: Record<string, { sortRow?: number }> }>)['dojo-az-inside'].sprites;
    const sprites = Object.keys(all);
    expect(sprites).toContain('inside-main-floor');
    for (const f of inside.foregroundSprites) {
      expect(sprites, f.id).toContain(f.id);
      expect(all[f.id].sortRow, `${f.id} sortRow in the pack and in the room file`).toBe(f.sortRow);
    }
    for (const it of insideJson.interactables) expect(sprites, it.id).toContain(it.sprite);
    expect(inside.foregroundSprites.map((f) => f.id).sort()).toEqual(['bag-black-top', 'bag-blue-top', 'bag-red-top', 'seats-back']);
  });

  it('refuses a broken file with a clear message', () => {
    expect(() => loadInsideRoom({})).toThrow(ActionZoneError);
    expect(() => loadInsideRoom({ ...insideJson, spawn: { enter: [0, 0] } })).toThrow(/spawn/);
    expect(() => loadInsideRoom({ ...insideJson, interactables: [] })).toThrow(/interactables/);
  });
});
