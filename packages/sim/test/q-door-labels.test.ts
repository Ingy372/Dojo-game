// Q-DOOR-LABELS: door labels stay on screen; an unknown ?room= id warns in the console.
import { describe, expect, it } from 'vitest';
import { DOOR_LABEL_SIDE_PX, clampLabelX } from '../../../apps/client/src/ui/doorLabel';
import { testRoom } from '../../../apps/client/src/game/roomParam';
import { testContent } from './load-content';

const scene = Object.values(import.meta.glob(['../../../apps/client/src/scenes/GameScene.ts'], { query: '?raw', import: 'default', eager: true }))[0] as string;
const content = testContent();

describe('Q-DOOR-LABELS label clamp', () => {
  const [L, R, m, w] = [100, 500, DOOR_LABEL_SIDE_PX, 80];
  it('pulls a label at the left wall fully on screen', () => {
    const x = clampLabelX(90, w, L, R, m);
    expect(x - w / 2).toBe(L + m);
  });
  it('pulls a label at the right wall fully on screen', () => {
    const x = clampLabelX(510, w, L, R, m);
    expect(x + w / 2).toBe(R - m);
  });
  it('leaves a label in the middle where it is', () => {
    expect(clampLabelX(300, w, L, R, m)).toBe(300);
  });
  it('the clamp runs after the boss slide in the door loop', () => {
    const loop = scene.slice(scene.indexOf('for (const d of this.doorViews)'));
    expect(loop.indexOf('clampLabelX(')).toBeGreaterThan(loop.indexOf('this.keepLabelOffBoss(d);'));
  });
});

describe('Q-DOOR-LABELS ?room=', () => {
  it('a known room starts with no warning', () => {
    expect(testRoom(content, 'brute-and-swarm', 2)).toEqual({ id: 'brute-and-swarm', warning: null });
  });
  it('a white belt gets the w- copy with no warning', () => {
    expect(testRoom(content, 'brute-and-swarm', 1)).toEqual({ id: 'w-brute-and-swarm', warning: null });
    expect(testRoom(content, 'w-stone-garden', 1).warning).toBeNull();
  });
  it('an unknown id warns (once, naming the id) on white belt and others', () => {
    for (const tier of [1, 2]) {
      const r = testRoom(content, 'no-such-room', tier);
      expect(r.warning).toContain('no-such-room');
    }
  });
  it('no ?room= means no room and no warning', () => {
    expect(testRoom(content, null, 1)).toEqual({ id: undefined, warning: null });
  });
});
