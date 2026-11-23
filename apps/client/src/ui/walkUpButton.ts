// Nov 20 (Jay): the big round button that appears when the hero walks up to something in the Action Zone
// (Read at a wall board, Throw at the star wall, Train at a bag, Bow at the mat's edge). It sits where Counter
// sits in a fight, bottom right, so a thumb finds it. E, Space or Enter press it on a computer.

import Phaser from 'phaser';
import { sfx } from '../audio/Sfx';
import { hasTouch } from '../input/TouchControls';
import { reducedMotion } from '../game/motion';
import { FONT, crisp, view } from './theme';

const RADIUS = 46;
const MARGIN = 26;

export class WalkUpButton {
  readonly container: Phaser.GameObjects.Container;
  private readonly glow: Phaser.GameObjects.Arc;
  private readonly face: Phaser.GameObjects.Arc;
  private readonly label: Phaser.GameObjects.Text;
  private onTap: (() => void) | null = null;
  private current = '';

  constructor(private readonly scene: Phaser.Scene) {
    this.glow = scene.add.circle(0, 0, RADIUS * 1.25, 0xffd166, 0.2);
    this.face = scene.add.circle(0, 0, RADIUS, 0x2e6ae0).setStrokeStyle(4, 0xffd166);
    const shine = scene.add.ellipse(0, -RADIUS * 0.45, RADIUS * 1.2, RADIUS * 0.55, 0xffffff, 0.16);
    this.label = scene.add
      .text(0, 0, '', { fontFamily: FONT, fontStyle: 'bold', fontSize: '20px', color: '#fff6e0', stroke: '#3a2412', strokeThickness: 3 })
      .setOrigin(0.5)
      .setResolution(crisp());
    const parts: Phaser.GameObjects.GameObject[] = [this.glow, this.face, shine, this.label];
    if (!hasTouch()) {
      parts.push(
        scene.add
          .text(0, RADIUS + 6, 'E', { fontFamily: FONT, fontStyle: 'bold', fontSize: '11px', color: '#fff6e0', backgroundColor: 'rgba(20,18,28,0.7)', padding: { x: 4, y: 1 } })
          .setOrigin(0.5, 0)
          .setResolution(crisp()),
      );
    }
    this.container = scene.add.container(0, 0, parts).setDepth(70).setVisible(false);
    if (!reducedMotion()) scene.tweens.add({ targets: this.glow, scale: 1.15, alpha: 0.06, duration: 900, yoyo: true, repeat: -1 });

    this.face.setInteractive(new Phaser.Geom.Circle(RADIUS, RADIUS, RADIUS * 1.2), Phaser.Geom.Circle.Contains);
    this.face.on(Phaser.Input.Events.GAMEOBJECT_POINTER_DOWN, () => this.press());
    const kb = scene.input.keyboard;
    if (kb) {
      const press = () => this.press();
      const keys = ['E', 'SPACE', 'ENTER'].map((k) => kb.addKey(k, k !== 'E').on('down', press));
      scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => keys.forEach((k) => k.off('down', press)));
    }
    this.layout();
  }

  /** Shows the button with this word; `onTap` runs when it is pressed. Showing the same word again changes nothing. */
  show(label: string, onTap: () => void): void {
    this.onTap = onTap;
    if (this.current === label && this.container.visible) return;
    this.current = label;
    this.label.setText(label).setFontSize(label.length > 5 ? 17 : 20);
    this.container.setVisible(true).setScale(0.6).setAlpha(0);
    this.scene.tweens.add({ targets: this.container, scale: 1, alpha: 1, duration: reducedMotion() ? 0 : 160, ease: 'Back.Out' });
  }

  hide(): void {
    this.onTap = null;
    this.current = '';
    this.container.setVisible(false);
  }

  get shown(): boolean {
    return this.container.visible && this.onTap !== null;
  }

  /** True for a screen point on the button (so a press there doesn't walk the hero). */
  contains(x: number, y: number): boolean {
    if (!this.container.visible) return false;
    return Math.hypot(x - this.container.x, y - this.container.y) <= RADIUS * 1.25;
  }

  layout(): void {
    const { width, height } = view(this.scene);
    this.container.setPosition(width - RADIUS - MARGIN, height - RADIUS - MARGIN);
  }

  private press(): void {
    if (!this.shown) return;
    const tap = this.onTap!;
    sfx.unlock();
    sfx.tap();
    if (!reducedMotion()) this.scene.tweens.add({ targets: this.face, scale: 0.9, duration: 70, yoyo: true });
    this.hide();
    tap();
  }
}
