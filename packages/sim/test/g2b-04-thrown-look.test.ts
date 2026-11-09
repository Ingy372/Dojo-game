// G2B-04 (Manager additions): the thrown enemy's look (existing sprite turned: tumble, lie, get up; Reduced motion
// snaps) and the Throw Seal's Trophy Case card text in kid words.
import { describe, expect, it } from 'vitest';
import { THROWN_LOOK, getUpAngle, shownAngle, thrownPose } from '../../../apps/client/src/ui/thrownPose';
import gameSceneRaw from '../../../apps/client/src/scenes/GameScene.ts?raw';
import abilitiesJson from '../../../content/abilities/abilities.json';

describe('G2B-04: the knock-down look', () => {
  it('motion on: tumbles over the slide and lands lying on its side', () => {
    expect(thrownPose(0, false)).toEqual({ slide: 0, angle: 0 });
    const mid = thrownPose(THROWN_LOOK.tumbleMs / 2, false);
    expect(mid.slide).toBeGreaterThan(0.3);
    expect(mid.slide).toBeLessThan(1);
    expect(mid.angle).toBeGreaterThan(Math.PI); // part-way through a full turn and more
    const end = thrownPose(THROWN_LOOK.tumbleMs, false);
    expect(end.slide).toBe(1);
    expect(shownAngle(end.angle)).toBeCloseTo(THROWN_LOOK.lieAngle, 9);
    // It stays lying for the rest of the 30 thrown ticks (1500 ms).
    expect(shownAngle(thrownPose(1400, false).angle)).toBeCloseTo(THROWN_LOOK.lieAngle, 9);
  });

  it('Reduced motion: no tumble or slide, it is lying down from the first frame and snaps back up', () => {
    expect(thrownPose(0, true)).toEqual({ slide: 1, angle: THROWN_LOOK.lieAngle });
    expect(getUpAngle(0, true)).toBe(0);
  });

  it('gets back up after the thrown ticks: lying to upright', () => {
    expect(getUpAngle(0, false)).toBeCloseTo(THROWN_LOOK.lieAngle, 9);
    expect(getUpAngle(THROWN_LOOK.getUpMs / 2, false)).toBeGreaterThan(0);
    expect(getUpAngle(THROWN_LOOK.getUpMs, false)).toBe(0);
  });

  it('GameScene uses it on the existing sprite (turns the art, not the health bar) and reads Reduced motion', () => {
    expect(gameSceneRaw).toMatch(/const pose = thrownPose\(now - v\.thrownAt, rm\);/);
    expect(gameSceneRaw).toMatch(/s\.container\.setRotation\(/);
    expect(gameSceneRaw).toMatch(/const rm = reducedMotion\(\);/);
  });
});

describe('G2B-04: Throw card text', () => {
  it('describes the knock-down in kid words, with no numbers', () => {
    const t = abilitiesJson.seals.find((s: { id: string }) => s.id === 'throw')!.text;
    expect(t).toMatch(/down/i);
    expect(t).not.toMatch(/\d|%/);
    expect(t.length).toBeLessThanOrEqual(80);
    expect(t).not.toMatch(/break|hurt|injur/i);
  });
});
