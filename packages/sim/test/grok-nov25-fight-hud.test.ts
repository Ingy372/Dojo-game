import { describe, expect, it } from 'vitest';
import floorSets from '../../../content/settings/floor-sets.json';
import { floorLine } from '../../../apps/client/src/game/floorName';

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
