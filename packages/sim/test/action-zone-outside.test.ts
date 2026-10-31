// A4-DOJO-ii: the Action Zone outside entrance and the town picture: walk grid, front door,
// spawns, exits and the art packs they use.
import { describe, expect, it } from 'vitest';
import { MOVEMENT, ActionZoneError, circleHitsWall, createWorld, loadInsideRoom, loadOutsideRoom, loadTown, stepWorld, type PlayerInput, type Vec2 } from '../src';
import outsideJson from '../../../content/dojo/action-zone/outside-room.json';
import insideJson from '../../../content/dojo/action-zone/inside-room.json';
import townJson from '../../../content/dojo/action-zone/town.json';
import artistJson from '../../../incoming-art/action-zone-dojo/sprites/outside-entrance.json';
import outsidePack from '../../../assets/art/dojo-az-outside.json';
import townPack from '../../../assets/art/dojo-az-town.json';

const outside = loadOutsideRoom(outsideJson);
const { room } = outside;
const R = MOVEMENT.playerRadius;
type Rect = readonly [number, number, number, number];
const inRect = (p: Vec2, r: Rect) => p.x >= r[0] && p.x <= r[1] && p.y >= r[2] && p.y <= r[3];

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

describe('Action Zone outside', () => {
  it('builds a 14 x 9 sim room whose grid matches the file, with everything above the front yard closed', () => {
    expect(room.width).toBe(14);
    expect(room.height).toBe(9);
    expect(room.walls.flat().filter((w) => !w)).toHaveLength(outsideJson.walkableCells);
    for (let row = 0; row < 6; row++) expect(room.walls[row].every(Boolean), `row ${row}`).toBe(true);
    expect(room.playerStart).toEqual(outside.spawnFromTown.pos);
  });

  it('keeps the artist\'s blockers, and the walkway is the only place they are opened', () => {
    const artist = artistJson.blockers.map((b) => ({ id: b.id, rect: b.rect }));
    for (const b of artist) {
      const mine = outsideJson.blockers.find((x) => x.id === b.id);
      expect(mine?.rect, b.id).toEqual(b.rect);
    }
    // The one blocker that is new: the front-left tree, which the artist gave no footprint.
    expect(outsideJson.blockers.filter((b) => !artist.some((a) => a.id === b.id)).map((b) => b.id)).toEqual(['tree-3']);
    const carved = new Set(outsideJson.carved.map(([c, r]) => `${c},${r}`));
    expect([...carved].sort()).toEqual(['6,6', '6,7', '7,6', '7,7']);
    for (const b of outsideJson.blockers) {
      for (const [col, row] of b.cells) expect(room.walls[row][col] || carved.has(`${col},${row}`), `${b.id} ${col},${row}`).toBe(true);
    }
  });

  it('the spawns are on open ground; the town spawn is short of every door and exit', () => {
    for (const s of [outside.spawnFromTown, outside.spawnFromInside]) expect(circleHitsWall(room, s.pos, R)).toBe(false);
    expect(inRect(outside.spawnFromTown.pos, outside.frontDoor.enterRect)).toBe(false);
    for (const e of outside.exits) expect(inRect(outside.spawnFromTown.pos, e.rect), e.id).toBe(false);
    // Coming out of the dojo you stand at the doors, facing the street.
    expect(outside.spawnFromInside.pos).toEqual({ x: outside.frontDoor.approachTile.x, y: outside.frontDoor.approachTile.y });
    expect(outside.spawnFromInside.facing).toBe('south');
  });

  it('every walkable tile can be walked to from the town spawn by tapping it', () => {
    let count = 0;
    for (let row = 0; row < room.height; row++) {
      for (let col = 0; col < room.width; col++) {
        if (room.walls[row][col]) continue;
        const goal = { x: col + 0.5, y: row + 0.5 };
        const end = walk(outside.spawnFromTown.pos, 20 * 30, () => ({ kind: 'moveTo', ...goal }));
        // The hero stops as near the tile centre as the walls allow (rows 6 to 8 are one tile tall).
        expect(Math.hypot(end.x - goal.x, end.y - goal.y), `tile ${col},${row}`).toBeLessThan(0.7);
        expect(circleHitsWall(room, end, R - 0.01), `tile ${col},${row}`).toBe(false);
        count++;
      }
    }
    expect(count).toBe(outsideJson.walkableCells);
  });

  it('the front door: tapping its approach tile from the town spawn ends on the doorstep, inside the enter rectangle', () => {
    const a = outside.frontDoor.approachTile;
    let first = -1;
    let t = 0;
    const end = walk(outside.spawnFromTown.pos, 20 * 8, () => ({ kind: 'moveTo', x: a.x, y: a.y }), (p) => {
      t++;
      if (first < 0 && inRect(p, outside.frontDoor.enterRect)) first = t;
    });
    expect(first).toBeGreaterThan(0);
    expect(inRect(end, outside.frontDoor.enterRect)).toBe(true);
    expect(Math.hypot(end.x - a.x, end.y - a.y)).toBeLessThan(0.1);
    expect(outside.frontDoor.approachFacing).toBe('north');
  });

  it('the front door can also be reached with the stick, straight up the path', () => {
    const end = walk(outside.spawnFromTown.pos, 20 * 6, () => ({ kind: 'stick', x: 0, y: -1 }));
    expect(inRect(end, outside.frontDoor.enterRect)).toBe(true);
  });

  it('the door tap area is the artist\'s double doors, in tiles, and the approach tile is just below it', () => {
    const [x0, x1, y0, y1] = outside.frontDoor.tapRect;
    expect([x0, x1]).toEqual([6.25, 7.75]);
    expect(y0).toBeCloseTo(4.6875, 4);
    expect(y1).toBe(6);
    expect(outside.frontDoor.approachTile.x).toBeGreaterThan(x0);
    expect(outside.frontDoor.approachTile.x).toBeLessThan(x1);
    expect(outside.frontDoor.approachTile.y).toBeGreaterThan(y1);
  });

  it('both ends of the walk along the bottom are exits to the town, and the hero can reach them', () => {
    expect(outside.exits.map((e) => e.to)).toEqual(['town', 'town']);
    for (const e of outside.exits) {
      const [x0, x1, y0, y1] = e.rect;
      const end = walk(outside.spawnFromTown.pos, 20 * 8, () => ({ kind: 'moveTo', x: (x0 + x1) / 2, y: (y0 + y1) / 2 }));
      expect(inRect(end, e.rect), e.id).toBe(true);
    }
    // The doorstep is not an exit, and the exits are not the doorstep.
    for (const e of outside.exits) expect(e.rect[2]).toBeGreaterThan(outside.frontDoor.enterRect[3]);
  });

  it('a hero can never get into the building, benches, chairs, bin, palm or tree, from the stick or from a tap', () => {
    // The beds and the shrub are the pieces the walkway runs between; the hero is kept out of all the rest.
    const solid = outsideJson.blockers.filter((b) => !['bed-a', 'bed-b', 'shrub'].includes(b.id));
    expect(solid.map((b) => b.id).sort()).toEqual(['bench-a', 'bench-b', 'bin', 'building', 'chair-a', 'chair-b', 'palm', 'tree-3']);
    for (const b of solid) {
      const [x0, x1, y0, y1] = b.rect;
      const centre = { x: (x0 + x1) / 2, y: (y0 + y1) / 2 };
      const check = (p: Vec2) => {
        expect(inRect(p, [x0 + 0.001, x1 - 0.001, y0 + 0.001, y1 - 0.001]), b.id).toBe(false);
        expect(circleHitsWall(room, p, R - 0.01), b.id).toBe(false);
      };
      walk(outside.spawnFromTown.pos, 20 * 12, () => ({ kind: 'moveTo', ...centre }), check);
      for (const [col, row] of b.cells) {
        for (const [dx, dy] of [[0, 1], [0, -1], [1, 0], [-1, 0]] as const) {
          const from = { x: col + 0.5 + dx, y: row + 0.5 + dy };
          if (room.walls[row + dy]?.[col + dx] !== false || circleHitsWall(room, from, R)) continue;
          walk(from, 80, () => ({ kind: 'stick', x: -dx, y: -dy }), check);
        }
      }
    }
  });

  it('the flower beds still keep the hero off their middle, and the shrub is walked past, never stood in', () => {
    for (const id of ['bed-a', 'bed-b']) {
      const b = outsideJson.blockers.find((x) => x.id === id)!;
      const [x0, x1, y0, y1] = b.rect;
      const centre = { x: (x0 + x1) / 2, y: (y0 + y1) / 2 };
      walk(outside.spawnFromTown.pos, 20 * 12, () => ({ kind: 'moveTo', ...centre }), (p) => {
        // At most a hero's radius into the bed from the walkway side (x 6 to 8), never into its middle.
        expect(inRect(p, [x0 + 0.5, x1 - 0.5, y0, y1]), id).toBe(false);
      });
    }
  });

  it('has day art in the dojo-az-outside pack for the picture and every scenery piece, and no dusk layers', () => {
    const entry = (outsidePack.entries as Record<string, { sprites: Record<string, { layers: Record<string, number[]>; sortRow?: number; anchorTile?: number[] }> }>)['dojo-az-outside'];
    const sprites = entry.sprites;
    expect(Object.keys(sprites['outside-entrance-day'].layers)).toEqual(['ground', 'building', 'phone', 'address']);
    const scenery = Object.keys(sprites).filter((k) => k !== 'outside-entrance-day');
    expect(scenery.sort()).toEqual(['outside-bed-a', 'outside-bed-b', 'outside-bench-a', 'outside-bench-b', 'outside-bin', 'outside-chair-a', 'outside-chair-b', 'outside-palm', 'outside-shrub', 'outside-tree-1', 'outside-tree-2', 'outside-tree-3']);
    for (const id of scenery) {
      expect(Object.keys(sprites[id].layers), id).toEqual(['day']);
      expect(sprites[id].sortRow, id).toBeTypeOf('number');
      expect(sprites[id].anchorTile, id).toHaveLength(2);
    }
    expect(JSON.stringify(outsidePack)).not.toMatch(/dusk/);
  });

  it('the town is one picture in the dojo-az-town pack, with the Action Zone building tappable inside it', () => {
    const town = loadTown(townJson);
    expect(town.dojo.to).toBe('outside');
    expect(Object.keys((townPack.entries as Record<string, { sprites: Record<string, unknown> }>)['dojo-az-town'].sprites)).toEqual(['town-day']);
    const [x0, y0, x1, y1] = town.dojo.tapRect;
    expect((x1 - x0) * (y1 - y0)).toBeGreaterThan(100 * 100);
    expect(JSON.stringify(townPack)).not.toMatch(/dusk/);
  });

  it('the inside room\'s exit door is the only way into the town square from the dojo: the file still says so', () => {
    expect(loadInsideRoom(insideJson).exit[3]).toBe(19);
  });

  it('refuses a broken file with a clear message', () => {
    expect(() => loadOutsideRoom({})).toThrow(ActionZoneError);
    expect(() => loadOutsideRoom({ ...outsideJson, exits: [] })).toThrow(/exits/);
    expect(() => loadOutsideRoom({ ...outsideJson, spawn: { ...outsideJson.spawn, fromTown: { pos: [0.5, 0.5], facing: 'north' } } })).toThrow(/spawn/);
    expect(() => loadOutsideRoom({ ...outsideJson, exits: [{ id: 'x', rect: [0, 1, 0, 1], to: 'moon' }] })).toThrow(/town/);
    expect(() => loadTown({})).toThrow(ActionZoneError);
    expect(() => loadTown({ ...townJson, dojo: { ...townJson.dojo, tapRect: [0, 0, 5000, 5000] } })).toThrow(/inside the picture/);
  });
});
