// Nov 20 (Jay): a wall board (the Class Creed, the belt verse board) shown large so it is easy to read.
// The picture opens big; drag (or scroll the mouse wheel) to read more, + and - (or pinch) to zoom.
// The big round X in the top-right corner, or Escape, closes it. The pictures are the approved wall art, unchanged.

import Phaser from 'phaser';
import { sfx } from '../audio/Sfx';
import { reducedMotion } from '../game/motion';
import { DPR, FONT, crisp, view } from './theme';
import { kitClose } from './kit';

const MARGIN = 16;
const CLOSE_R = 26;

/** The big round X used by the Action Zone's full-screen views, top right. `onTap` runs on a press. */
export function closeX(scene: Phaser.Scene, onTap: () => void): Phaser.GameObjects.Container {
  // U-KIT: the kit's round red close button, in the same top-right spot.
  const { width } = view(scene);
  return kitClose(scene, width - MARGIN - CLOSE_R - 4, MARGIN + CLOSE_R + 4, onTap, CLOSE_R + 2).setDepth(120);
}

/**
 * Opens the picture `textureKey` large over the scene. Returns a function that closes it (it also closes
 * itself from its X or Escape and then calls `onClose`).
 */
export function openBoardReader(scene: Phaser.Scene, textureKey: string, onClose: () => void): () => void {
  const { width, height } = view(scene);
  const layer = scene.add.container(0, 0).setDepth(110);
  const dim = scene.add.rectangle(0, 0, width, height, 0x060a24, 0.86).setOrigin(0).setInteractive();
  layer.add(dim);

  const img = scene.add.image(0, 0, textureKey).setOrigin(0);
  const iw = img.width;
  const ih = img.height;
  // Start big: as wide as the screen allows (clear of the X); drag down to read the rest.
  const fit = (width - 2 * MARGIN - 2 * (CLOSE_R + 8)) / iw;
  const minScale = Math.min(fit, (height - 2 * MARGIN) / ih);
  const maxScale = fit * 2.6;
  let scale = fit;
  const frame = scene.add.rectangle(0, 0, 10, 10, 0x000000, 0).setOrigin(0).setStrokeStyle(4, 0xffd166, 0.9);
  layer.add([img, frame]);

  let x = (width - iw * scale) / 2;
  let y = MARGIN;
  const place = (): void => {
    const w = iw * scale;
    const h = ih * scale;
    x = w <= width - 2 * MARGIN ? (width - w) / 2 : Phaser.Math.Clamp(x, width - MARGIN - w, MARGIN);
    y = h <= height - 2 * MARGIN ? (height - h) / 2 : Phaser.Math.Clamp(y, height - MARGIN - h, MARGIN);
    img.setPosition(x, y).setScale(scale);
    frame.setPosition(x, y).setSize(w, h);
    frame.geom.setSize(w, h);
    frame.updateDisplayOrigin();
  };
  place();

  const zoomTo = (next: number, cx = width / 2, cy = height / 2): void => {
    next = Phaser.Math.Clamp(next, minScale, maxScale);
    // Keep the point under (cx, cy) in place.
    const u = (cx - x) / scale;
    const v = (cy - y) / scale;
    scale = next;
    x = cx - u * scale;
    y = cy - v * scale;
    place();
  };

  // Drag to pan; two fingers pinch to zoom.
  const pointers = new Map<number, { x: number; y: number }>();
  let pinch: { d: number; scale: number } | null = null;
  const toCss = (p: Phaser.Input.Pointer) => ({ x: p.x / DPR, y: p.y / DPR });
  const down = (p: Phaser.Input.Pointer): void => {
    pointers.set(p.id, toCss(p));
    if (pointers.size === 2) {
      const [a, b] = [...pointers.values()];
      pinch = { d: Math.hypot(a.x - b.x, a.y - b.y), scale };
    }
  };
  const move = (p: Phaser.Input.Pointer): void => {
    const last = pointers.get(p.id);
    if (!last || !p.isDown) return;
    const now = toCss(p);
    pointers.set(p.id, now);
    if (pinch && pointers.size === 2) {
      const [a, b] = [...pointers.values()];
      const d = Math.hypot(a.x - b.x, a.y - b.y);
      zoomTo(pinch.scale * (d / Math.max(1, pinch.d)), (a.x + b.x) / 2, (a.y + b.y) / 2);
      return;
    }
    x += now.x - last.x;
    y += now.y - last.y;
    place();
  };
  const up = (p: Phaser.Input.Pointer): void => {
    pointers.delete(p.id);
    if (pointers.size < 2) pinch = null;
  };
  const wheel = (_p: Phaser.Input.Pointer, _o: unknown, dx: number, dy: number): void => {
    x -= dx;
    y -= dy;
    place();
  };
  scene.input.on(Phaser.Input.Events.POINTER_DOWN, down);
  scene.input.on(Phaser.Input.Events.POINTER_MOVE, move);
  scene.input.on(Phaser.Input.Events.POINTER_UP, up);
  scene.input.on(Phaser.Input.Events.POINTER_WHEEL, wheel);

  // Zoom buttons, bottom right.
  const zoomButton = (label: string, cx: number, step: number): Phaser.GameObjects.Container => {
    const face = scene.add.circle(0, 0, 24, 0x2c2440, 0.95).setStrokeStyle(3, 0xffd166, 0.9);
    const t = scene.add.text(0, -1, label, { fontFamily: FONT, fontStyle: 'bold', fontSize: '28px', color: '#fff6e0' }).setOrigin(0.5).setResolution(crisp());
    face.setInteractive(new Phaser.Geom.Circle(24, 24, 30), Phaser.Geom.Circle.Contains);
    face.on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, () => {
      sfx.tap();
      zoomTo(scale * step);
    });
    return scene.add.container(cx, height - MARGIN - 28, [face, t]);
  };
  const zoomIn = zoomButton('+', width - MARGIN - 28, 1.4);
  const zoomOut = zoomButton('−', width - MARGIN - 28 - 62, 1 / 1.4);
  layer.add([zoomOut, zoomIn]);

  // A soft hint while there is more to see below: a dark pill at the bottom left, clear of the words' middle.
  const hintText = scene.add
    .text(0, 0, 'Drag to read more', { fontFamily: FONT, fontStyle: 'bold', fontSize: '15px', color: '#fff6e0' })
    .setOrigin(0.5)
    .setResolution(crisp());
  const pill = scene.add.rectangle(0, 0, hintText.width + 28, 34, 0x0d1233, 0.88).setStrokeStyle(2, 0xffd166, 0.8);
  const hint = scene.add.container(MARGIN + pill.width / 2, height - MARGIN - 17, [pill, hintText]).setVisible(ih * scale > height - 2 * MARGIN);
  layer.add(hint);
  scene.time.delayedCall(3000, () => hint.active && scene.tweens.add({ targets: hint, alpha: 0, duration: 400 }));

  let closed = false;
  const close = (): void => {
    if (closed) return;
    closed = true;
    scene.input.off(Phaser.Input.Events.POINTER_DOWN, down);
    scene.input.off(Phaser.Input.Events.POINTER_MOVE, move);
    scene.input.off(Phaser.Input.Events.POINTER_UP, up);
    scene.input.off(Phaser.Input.Events.POINTER_WHEEL, wheel);
    esc?.off('down', close);
    x_.destroy();
    scene.tweens.add({ targets: layer, alpha: 0, duration: reducedMotion() ? 0 : 150, onComplete: () => layer.destroy() });
    onClose();
  };
  const x_ = closeX(scene, close);
  const esc = scene.input.keyboard?.addKey('ESC');
  esc?.on('down', close);
  scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
    if (!closed) {
      closed = true;
      scene.input.off(Phaser.Input.Events.POINTER_DOWN, down);
      scene.input.off(Phaser.Input.Events.POINTER_MOVE, move);
      scene.input.off(Phaser.Input.Events.POINTER_UP, up);
      scene.input.off(Phaser.Input.Events.POINTER_WHEEL, wheel);
      esc?.off('down', close);
    }
  });

  layer.setAlpha(0);
  scene.tweens.add({ targets: layer, alpha: 1, duration: reducedMotion() ? 0 : 160 });
  return close;
}
