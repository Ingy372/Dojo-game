import { describe, expect, it } from 'vitest';
import { RoomError, isWallTile, loadRoom } from '../src';
import trainingRoom from '../../../content/rooms/training-room.json';

describe('room loading', () => {
  it('loads the training room', () => {
    const room = loadRoom(trainingRoom);
    expect(room.id).toBe('training-room');
    expect(room.width).toBe(26);
    expect(room.height).toBe(15);
    expect(room.playerStart).toEqual({ x: 3.5, y: 2.5 });
    expect(isWallTile(room, 0, 0)).toBe(true);
    expect(isWallTile(room, 1, 1)).toBe(false);
    expect(isWallTile(room, -1, 5)).toBe(true);
  });

  const bad = (tiles: string[]) => () => loadRoom({ id: 'bad', name: 'Bad', tiles });

  it('rejects broken rooms with a clear message', () => {
    expect(bad(['###', '#P#', '##'])).toThrow(/row 3 is 2 tiles wide/);
    expect(bad(['###', '#P.', '###'])).toThrow(/outer edge/);
    expect(bad(['###', '#x#', '###'])).toThrow(/unknown tile "x"/);
    expect(bad(['####', '#..#', '####'])).toThrow(/no player start/);
    expect(bad(['####', '#PP#', '####'])).toThrow(/more than one player start/);
    expect(() => loadRoom({ id: 'bad', tiles: [] })).toThrow(RoomError);
  });
});
