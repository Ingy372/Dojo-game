import { describe, expect, it } from 'vitest';
import { MOVEMENT, findPath, loadRoom } from '../src';
import town from '../../../content/dojo/action-zone/town-walk.json';

// Nov 17 (Jay): the town is walkable. Out of your own dojo's door, across the bridge, to the Action Zone, and back.
describe('the walkable town', () => {
  const room = loadRoom(town);
  const at = (p: number[]) => ({ x: p[0], y: p[1] });
  const r = MOVEMENT.playerRadius;

  it('loads, and is the size of the town picture (40 px tiles)', () => {
    expect(room.width).toBe(24);
    expect(Math.ceil(932 / town.pictureTile)).toBe(room.width);
  });

  it('you can walk from your dojo door to the Action Zone door and back', () => {
    const home = at(town.homeDoor.spawn);
    const dojo = at(town.dojoDoor.spawn);
    expect(findPath(room, home, dojo, r)).not.toBeNull();
    expect(findPath(room, dojo, home, r)).not.toBeNull();
  });

  it('each door can be reached from where you come out of it, and you come out outside it', () => {
    for (const door of [town.homeDoor, town.dojoDoor]) {
      const [x0, x1, y0, y1] = door.enterRect;
      const [sx, sy] = door.spawn;
      expect(sx >= x0 && sx <= x1 && sy >= y0 && sy <= y1).toBe(false);
      expect(findPath(room, at(door.spawn), { x: (x0 + x1) / 2, y: y1 - 0.3 }, r)).not.toBeNull();
    }
  });
});
