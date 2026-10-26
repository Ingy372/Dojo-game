import { describe, expect, it } from 'vitest';
import { loadProfile, newProfile, readLook } from '../src';

describe('character look', () => {
  const look = { body: 'b', face: 'face-03', hair: 'hair-09', skin: 7, hairColor: 0, gi: 2 };

  it('starts empty, so a new student makes their character first', () => {
    expect(newProfile().look).toBeNull();
  });

  it('is saved and loaded with the profile', () => {
    const p = newProfile();
    p.look = { ...look };
    expect(loadProfile(JSON.parse(JSON.stringify(p))).look).toEqual(look);
  });

  it('keeps old saves working (no look yet)', () => {
    const old = newProfile() as unknown as Record<string, unknown>;
    delete old.look;
    expect(loadProfile(old).look).toBeNull();
  });

  it('throws away a damaged look instead of breaking the game', () => {
    expect(readLook({ ...look, skin: -1 })).toBeNull();
    expect(readLook({ ...look, face: '' })).toBeNull();
    expect(readLook('hair-02')).toBeNull();
    expect(readLook({ ...look, extra: 1 })).toEqual(look);
  });
});
