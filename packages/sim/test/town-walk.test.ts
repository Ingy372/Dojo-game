import { describe, expect, it } from 'vitest';
import { MOVEMENT, findPath, loadTownWalk, pieceShown, townRoom, townStage, townTiles, TownError } from '../src';
import town from '../../../content/dojo/action-zone/town-walk.json';
import pack from '../../../assets/art/town.json';

// Nov 18 (Jay): the town redesign. Bigger and roomier for 5-20 classmates, and it gets nicer with every real belt.
describe('the town', () => {
  const walk = loadTownWalk(town);
  const at = (p: number[]) => ({ x: p[0], y: p[1] });
  const r = MOVEMENT.playerRadius;
  const stages = Array.from({ length: walk.maxStage }, (_, i) => i + 1);

  it('is 46 x 30 tiles and has ten stages, one per belt', () => {
    expect(walk.tiles[0].length).toBe(46);
    expect(walk.tiles.length).toBe(30);
    expect(walk.maxStage).toBe(10);
  });

  it('at every stage you can walk from your dojo door to the Action Zone door and back, and each door is reachable', () => {
    for (const s of stages) {
      const room = townRoom(walk, s);
      expect(findPath(room, at(walk.homeDoor.spawn), at(walk.dojoDoor.spawn), r), `stage ${s}`).not.toBeNull();
      expect(findPath(room, at(walk.dojoDoor.spawn), at(walk.homeDoor.spawn), r), `stage ${s}`).not.toBeNull();
      for (const door of [walk.homeDoor, walk.dojoDoor]) {
        const [x0, x1, y0, y1] = door.enterRect;
        const [sx, sy] = door.spawn;
        expect(sx >= x0 && sx <= x1 && sy >= y0 && sy <= y1).toBe(false);
        expect(findPath(room, at(door.spawn), { x: (x0 + x1) / 2, y: y1 - 0.3 }, r), `stage ${s}`).not.toBeNull();
      }
    }
  });

  it('every open spot can be reached at every stage (nothing new ever walls a place off)', () => {
    for (const s of stages) {
      const room = townRoom(walk, s);
      const seen = new Set<string>();
      const q = [[Math.floor(walk.homeDoor.spawn[0]), Math.floor(walk.homeDoor.spawn[1])]];
      while (q.length) {
        const [x, y] = q.pop()!;
        const k = `${x},${y}`;
        if (seen.has(k) || room.walls[y][x]) continue;
        seen.add(k);
        q.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
      }
      const open = townTiles(walk, s).join('').split('').filter((c) => c === '.').length;
      expect(seen.size, `stage ${s}`).toBe(open);
    }
  });

  it('is roomy: about 3 times the old town\'s open ground, and the main street and plaza stay open at every stage', () => {
    const open = townTiles(walk, 10).join('').split('').filter((c) => c === '.').length;
    expect(open).toBeGreaterThan(3 * 70);
    for (const s of stages) {
      const t = townTiles(walk, s);
      for (let y = 10; y <= 13; y++) expect(t[y].slice(1, 45), `street row ${y}, stage ${s}`).toBe('.'.repeat(44));
      // the plaza around the statue: a full ring of open ground
      for (let y = 15; y <= 23; y++) for (const x of [19, 20, 26]) expect(t[y][x], `plaza ${x},${y}, stage ${s}`).toBe('.');
    }
  });

  it('a piece shows from its stage until it is replaced, and the stage follows the real belt (capped)', () => {
    expect(pieceShown({ stage: 1, until: 4 }, 3)).toBe(true);
    expect(pieceShown({ stage: 1, until: 4 }, 4)).toBe(false);
    expect(pieceShown({ stage: 5 }, 4)).toBe(false);
    expect(townStage(walk, 1)).toBe(1);
    expect(townStage(walk, 7)).toBe(7);
    expect(townStage(walk, 13)).toBe(10);
    // each later stage adds something new to see
    for (const s of stages.slice(1)) expect(walk.pieces.some((p) => p.stage === s), `stage ${s}`).toBe(true);
  });

  it('every piece in the walk file has art in the town pack, with its stage, and the four ground pieces', () => {
    const sprites = (pack.entries as Record<string, { sprites: Record<string, { stage?: number; until?: number; anchorTile?: number[] }> }>).town.sprites;
    for (const p of walk.pieces) {
      expect(sprites[p.id], p.id).toBeDefined();
      expect(sprites[p.id].stage, p.id).toBe(p.stage);
      expect(sprites[p.id].until, p.id).toBe(p.until);
    }
    expect(Object.keys(sprites).filter((k) => k.startsWith('town-ground-'))).toHaveLength(4);
  });

  it('refuses a broken file with a clear message', () => {
    expect(() => loadTownWalk({})).toThrow(TownError);
    expect(() => loadTownWalk({ ...town, pieces: [{ id: 'x', stage: 3, until: 2 }] })).toThrow(/until/);
    expect(() => loadTownWalk({ ...town, pieces: [{ id: 'x', stage: 1, block: [[99, 1]] }] })).toThrow(/outside/);
  });
});
