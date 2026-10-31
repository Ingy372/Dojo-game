// Q-DOOR-LABELS: door labels stay on screen; an unknown ?room= id warns in the console.
import { describe, expect, it } from 'vitest';
import { DOOR_LABEL_SIDE_PX, clampDoorLabels, clampLabelX } from '../../../apps/client/src/ui/doorLabel';
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
  it('the clamp runs on the camera FOLLOW_UPDATE (after the camera moves), not in update', () => {
    const loop = scene.slice(scene.indexOf('for (const d of this.doorViews)'));
    expect(loop.slice(0, loop.indexOf('\n    }\n')).includes('clampLabelX(')).toBe(false);
    expect(scene).toMatch(/cam\.on\(Phaser\.Cameras\.Scene2D\.Events\.FOLLOW_UPDATE, this\.clampDoorLabels, this\)/);
    expect(scene).toMatch(/cam\.off\(Phaser\.Cameras\.Scene2D\.Events\.FOLLOW_UPDATE, this\.clampDoorLabels, this\)/);
    expect(scene).toMatch(/clampDoorLabels\(this\.doorViews\.map\(\(d\) => d\.label\), cam, DPR\)/);
  });
  it('Q-DOOR-LABELS-2: the clamp uses the camera view after it moves (first frame of a scroll)', () => {
    // A label at the right side of the old view; the camera then scrolls 40 world px right.
    const label = { x: 0, displayWidth: 100, setX(v: number) { this.x = v; } };
    const cam = { zoom: 1, worldView: { x: 0, right: 600 } };
    label.x = 540; // fits the old view: 540 + 50 = 590, 10 from the old right edge
    cam.worldView = { x: 40, right: 640 }; // the camera has moved this frame
    clampDoorLabels([label], cam, 1);
    expect(label.x).toBe(540); // still fits the new view
    // A label at the left of the old view is pushed in to 8 px inside the new view, not the old one.
    const left = { x: 60, displayWidth: 100, setX(v: number) { this.x = v; } };
    clampDoorLabels([left], cam, 1);
    expect(left.x - left.displayWidth / 2 - cam.worldView.x).toBe(DOOR_LABEL_SIDE_PX);
    // With zoom 2 on a DPR 2 screen the margin is still 8 world px.
    const z = { x: 60, displayWidth: 100, setX(v: number) { this.x = v; } };
    clampDoorLabels([z], { zoom: 2, worldView: { x: 40, right: 640 } }, 2);
    expect(z.x).toBe(40 + 8 + 50);
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
