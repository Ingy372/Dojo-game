import { describe, expect, it } from 'vitest';
import { loadInsideRoom, loadTownWalk, townRoom } from '../src';
import roomJson from '../../../content/dojo/street-house/room.json';
import townJson from '../../../content/dojo/action-zone/town-walk.json';

describe('the Street Smarts House (Nov 23)', () => {
  it('its room loads: a door out, and the board, the poster and the badge wall to walk up to', () => {
    const room = loadInsideRoom(roomJson);
    expect(room.spots.map((s) => s.kind).sort()).toEqual(['badges', 'lessons', 'tips']);
    const [x0, x1, y0, y1] = room.exit;
    expect(x1 - x0).toBeGreaterThan(1);
    expect(y1).toBeGreaterThan(y0);
    // Michael's spot behind the desk is blocked, so the hero can't walk into him
    expect(room.room.walls[1][3]).toBe(true);
  });

  it('the town has its door at the market, on open ground', () => {
    const walk = loadTownWalk(townJson);
    expect(walk.streetDoor?.label).toBe('Street Smarts');
    const room = townRoom(walk, 1);
    const [sx, sy] = walk.streetDoor!.spawn;
    expect(room.walls[Math.floor(sy)][Math.floor(sx)]).toBe(false);
  });
});
