import { describe, expect, it } from 'vitest';
import floorSets from '../../../content/settings/floor-sets.json';
import { COMBAT } from '@dojo/sim';
import { floorLine } from '../../../apps/client/src/game/floorName';
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
