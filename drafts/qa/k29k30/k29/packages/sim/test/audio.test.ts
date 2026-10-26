import { describe, expect, it } from 'vitest';
import raw from '../../../content/settings/audio.json';
import { nudgeVolume, parseAudioMap, stepGain, trackFor, volumeStep } from '../src/audio';

describe('M7-P8 audio', () => {
  const map = parseAudioMap(raw);

  it('gives every main screen music: Mountain Temple at home, Long Road in the Tower', () => {
    for (const s of ['Title', 'Create', 'Dojo', 'Home', 'StreetSmarts']) expect(trackFor(map, s)?.name).toMatch(/Mountain Temple/);
    expect(trackFor(map, 'Game')?.name).toMatch(/Long Road/);
    expect(trackFor(map, 'Nowhere')).toBeNull();
    for (const t of Object.values(map.tracks)) expect(t.file).toMatch(/^audio\/music\/.+\.ogg$/);
  });

  it('rejects a screen that names a missing track', () => {
    expect(() => parseAudioMap({ tracks: {}, scenes: { Dojo: 'temple' } })).toThrow(/unknown track/);
  });

  it('reads saved volumes as whole steps 0..5, falling back on anything odd', () => {
    expect(volumeStep('3', 5)).toBe(3);
    expect(volumeStep('0', 5)).toBe(0);
    expect(volumeStep('9', 5)).toBe(5);
    expect(volumeStep('-2', 5)).toBe(0);
    for (const bad of [null, '', 'loud', '2.5', undefined]) expect(volumeStep(bad, 4)).toBe(4);
  });

  it('steps by one and stops at 0 and 5; step 5 is full gain and 0 is silent', () => {
    expect(nudgeVolume(5, 1)).toBe(5);
    expect(nudgeVolume(0, -1)).toBe(0);
    expect(nudgeVolume(2, 1)).toBe(3);
    expect(stepGain(5, 0.5)).toBe(0.5);
    expect(stepGain(0, 0.5)).toBe(0);
    // Sound at its default step plays exactly as loud as before M7-P8 (the old fixed 0.5).
    expect(stepGain(raw.sound.default, raw.sound.full)).toBe(0.5);
  });
});
