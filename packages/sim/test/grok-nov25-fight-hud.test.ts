import { describe, expect, it } from 'vitest';
import floorSets from '../../../content/settings/floor-sets.json';
import { COMBAT } from '@dojo/sim';
import { floorLine } from '../../../apps/client/src/game/floorName';
import { doorForTap } from '../../../apps/client/src/game/doorTap';
import { MOVEMENT, standableSpot } from '../src';
import { testContent } from './load-content';
import { VIRTUE_NOT_READY, virtueFill, virtueLook, virtueRefusedLine } from '../../../apps/client/src/input/virtueState';

// Grok playtest Nov 25: fixes on the Tower fight screen.

describe('idea 2: the floor on the Tower HUD', () => {
  it('shows the floor number and the floor-set name from the data', () => {
    expect(floorLine(2, 'sunrise-garden')).toBe('Floor 2  ·  Sunrise Garden');
    expect(floorLine(3, 'ember-kitchens')).toBe('Floor 3  ·  Ember Kitchens');
    expect(floorLine(1, 'white-dojo')).toBe('Floor 1  ·  White Dojo');
  });

  it('shows the number only for a room with no floor set or a set with no name', () => {
    expect(floorLine(1, null)).toBe('Floor 1');
    expect(floorLine(10, 'summit', {})).toBe('Floor 10');
    expect(floorLine(4, 'giants-steps', { 'giants-steps': '  ' })).toBe('Floor 4');
  });

  it('names every floor set that is switched on', () => {
    const { sets, names } = floorSets as { sets: Record<string, boolean>; names: Record<string, string> };
    for (const [id, on] of Object.entries(sets)) if (on) expect(names[id], id).toBeTruthy();
  });
});

describe('B6: VIRTUE always shows, and a press before it is ready says why', () => {
  const max = COMBAT.focus.max;
  it('is filling, ready or active from Focus and the Virtue timer', () => {
    expect(virtueLook({ focus: 0, virtueTicks: 0 })).toBe('filling');
    expect(virtueLook({ focus: max - 1, virtueTicks: 0 })).toBe('filling');
    expect(virtueLook({ focus: max, virtueTicks: 0 })).toBe('ready');
    expect(virtueLook({ focus: max, virtueTicks: 5 })).toBe('active');
    expect(virtueFill({ focus: max / 2 })).toBe(0.5);
    expect(virtueFill({ focus: max * 2 })).toBe(1);
  });

  it('gives a short readable line when it cannot be used yet, and none when it can', () => {
    expect(virtueRefusedLine({ focus: 10, virtueTicks: 0 })).toBe(VIRTUE_NOT_READY);
    expect(virtueRefusedLine({ focus: 0, virtueTicks: 40 })).toBe('Already active');
    expect(virtueRefusedLine({ focus: max, virtueTicks: 0 })).toBeNull();
    expect(VIRTUE_NOT_READY.split(/\s+/).length).toBeLessThanOrEqual(8);
  });
  // abilities.test.ts already checks the rules refuse a Virtue before Focus is full (the event this line answers).
});

describe('B7: one tap on or near an open door walks all the way in', () => {
  // Three door slots in the top wall, like a floor room ("####D#####D#####D###").
  const doors = [{ x: 4.5, y: 0.5 }, { x: 10.5, y: 0.5 }, { x: 16.5, y: 0.5 }];

  it('picks the door for a tap on its art, its plaque, its label or the floor just in front', () => {
    expect(doorForTap({ x: 10.5, y: 0.5 }, doors)).toBe(doors[1]); // the doorway
    expect(doorForTap({ x: 11.3, y: -1.8 }, doors)).toBe(doors[1]); // top corner of the art
    expect(doorForTap({ x: 9.7, y: 1.3 }, doors)).toBe(doors[1]); // the label
    expect(doorForTap({ x: 4.5, y: 2 }, doors)).toBe(doors[0]); // the floor in front
  });

  it('picks the door for a tap on its label even when the label is pushed down onto the floor', () => {
    // A small phone: the door sits above the view and its label is drawn 3 tiles lower (clampDoorLabels).
    const pushed = [{ x: 4.5, y: 0.5, label: { left: 3.9, top: 3.3, right: 5.1, bottom: 3.7 } }, { x: 16.5, y: 0.5 }];
    expect(doorForTap({ x: 4.6, y: 3.5 }, pushed)).toBe(pushed[0]);
    expect(doorForTap({ x: 5.5, y: 4.1 }, pushed)).toBe(pushed[0]); // a finger just off the label
    expect(doorForTap({ x: 4.5, y: 5.5 }, pushed)).toBeNull();
  });

  it('leaves taps elsewhere alone', () => {
    expect(doorForTap({ x: 7.5, y: 1.5 }, doors)).toBeNull(); // between two doors
    expect(doorForTap({ x: 10.5, y: 4 }, doors)).toBeNull(); // out on the floor
    expect(doorForTap({ x: 10.5, y: 1.5 }, [])).toBeNull(); // no open doors
  });

  it('a door it picks is close enough that walking there goes through it', () => {
    // The rules let the hero through within 1.05 tiles of the door (world.ts TOUCH); a walk to the door
    // ends on the floor spot nearest it.
    for (const room of testContent().rooms) {
      const f = room.id;
      for (const d of room.doors) {
        const end = standableSpot(room, d, MOVEMENT.playerRadius);
        expect(Math.hypot(end.x - d.x, end.y - d.y), `${f} door at ${d.x},${d.y}`).toBeLessThanOrEqual(1.05);
      }
    }
  });
});
