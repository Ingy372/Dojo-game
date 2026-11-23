// Speech bubbles over characters in the world (staff lines, and the players' preset phrases in town).
// Jay, Nov 23: "bright and easily read, but not so much that it overwhelms the town". A small white card with dark
// bold text and a little tail, drawn in the world so it stays over the speaker's head; it pops in, waits, and fades.
import Phaser from 'phaser';
import { reducedMotion } from '../game/motion';
import { FONT, crisp } from './theme';

export interface BubbleOptions {
  /** How long it stays before fading (ms). */
  holdMs?: number;
  /** A small name over the text (staff), or none. */
  name?: string;
  /** Widest the text may get before wrapping (world px). */
  wrap?: number;
  /** Bubble colour and text colour. */
  fill?: number;
  ink?: string;
  /** Text size in world px (the camera zooms the world, so this is small). */
  size?: number;
}

export interface Bubble {
  container: Phaser.GameObjects.Container;
  /** Moves it (the speaker walked); x, y = the point the tail touches. */
  follow(x: number, y: number): void;
  /** Fades it out now. */
  dismiss(): void;
  readonly alive: boolean;
}

const PAD_X = 6;
const PAD_Y = 4;
const TAIL = 5;

/**
 * Shows a bubble whose tail points at (x, y), added to `parent` (a world layer). Destroys itself after holdMs.
 */
export function speechBubble(scene: Phaser.Scene, parent: Phaser.GameObjects.Container, x: number, y: number, line: string, opts: BubbleOptions = {}): Bubble {
  const size = opts.size ?? 11;
  const fill = opts.fill ?? 0xfffdf5;
  const ink = opts.ink ?? '#1c1830';
  const c = scene.add.container(x, y).setDepth(1e6);
  const text = scene.add
    .text(0, 0, line, { fontFamily: FONT, fontStyle: 'bold', fontSize: `${size}px`, color: ink, align: 'center', wordWrap: { width: opts.wrap ?? 150, useAdvancedWrap: true } })
    .setResolution(crisp() * 3)
    .setOrigin(0.5, 1);
  const nameText = opts.name
    ? scene.add
        .text(0, 0, opts.name, { fontFamily: FONT, fontStyle: 'bold', fontSize: `${Math.round(size * 0.72)}px`, color: '#7a4fc2' })
        .setResolution(crisp() * 3)
        .setOrigin(0.5, 1)
    : null;
  const w = Math.max(text.width, nameText?.width ?? 0) + PAD_X * 2;
  const nameH = nameText ? nameText.height - 1 : 0;
  const h = text.height + nameH + PAD_Y * 2;
  const g = scene.add.graphics();
  const top = -TAIL - h;
  // a soft shadow, the card, a thin dark rim and the tail
  g.fillStyle(0x000000, 0.22).fillRoundedRect(-w / 2 + 1, top + 2, w, h, 6);
  g.fillStyle(fill, 1).fillRoundedRect(-w / 2, top, w, h, 6);
  g.fillTriangle(-4, -TAIL - 0.5, 4, -TAIL - 0.5, 0, 0);
  g.lineStyle(1.2, 0x2a2440, 0.85).strokeRoundedRect(-w / 2, top, w, h, 6);
  g.lineBetween(-4, -TAIL, 0, 0).lineBetween(4, -TAIL, 0, 0);
  g.fillStyle(fill, 1).fillRect(-3.4, -TAIL - 1.6, 6.8, 2.2);
  text.setPosition(0, -TAIL - PAD_Y);
  nameText?.setPosition(0, top + PAD_Y + nameH);
  c.add([g, text, ...(nameText ? [nameText] : [])]);
  parent.add(c);

  let alive = true;
  const done = () => {
    if (!alive) return;
    alive = false;
    c.destroy();
  };
  const dismiss = () => {
    if (!alive) return;
    scene.tweens.add({ targets: c, alpha: 0, y: c.y - 4, duration: 220, onComplete: done });
  };
  if (reducedMotion()) {
    c.setAlpha(1);
  } else {
    c.setScale(0.6).setAlpha(0);
    scene.tweens.add({ targets: c, scale: 1, alpha: 1, duration: 160, ease: 'Back.Out' });
  }
  scene.time.delayedCall(opts.holdMs ?? 2600, dismiss);
  c.once(Phaser.GameObjects.Events.DESTROY, () => (alive = false));
  return {
    container: c,
    follow: (nx, ny) => alive && c.setPosition(nx, ny),
    dismiss,
    get alive() {
      return alive;
    },
  };
}
