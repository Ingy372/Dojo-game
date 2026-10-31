// The hidden testing screen (tap "Home Dojo" 5 times). For Jay and staff only:
// switch fake student profiles, replay celebrations, and check the Power Rating.
// Power Rating must never appear anywhere a player would normally look.

import Phaser from 'phaser';
import { powerRating, xpToNext, type PowerSource, type Profile, type TrainingState } from '@dojo/sim';
import { FAKE_PROFILES, selectedProfileKey } from '../game/student';
import { FONT, crisp, view } from './theme';
import { GREEN, MIN_TAP } from './tokens';

const SOURCE_NAME: Record<PowerSource, string> = {
  signOffs: 'Sign-offs',
  trainingPoints: 'Training Points',
  virtues: 'Virtues',
  level: 'Level',
  gear: 'Gear',
  streetSmarts: 'Street Smarts',
  mastery: 'Mastery',
};

export interface TestingActions {
  pickProfile: (key: string) => void;
  forgetSeen: () => void;
  addLevel: () => void;
  resetLevel: () => void;
  close: () => void;
}

const COUNT_WORDS: Record<number, string> = { 2: 'two', 3: 'three', 4: 'four', 5: 'five', 6: 'six' };

export class TestingPanel {
  readonly container: Phaser.GameObjects.Container;
  private scroller: Phaser.GameObjects.Container | null = null;
  private onDown: ((p: Phaser.Input.Pointer) => void) | null = null;
  private onMove: ((p: Phaser.Input.Pointer) => void) | null = null;
  /** Q-PREMIUM-2 L7: where text and buttons go (the scrolling list while it is built, else the panel). */
  private host: Phaser.GameObjects.Container;
  /** True while a finger is dragging the list, so the lift does not tap a button. */
  private dragged = false;
  /** The screen rows the list shows (a button outside them cannot be tapped). */
  private viewTop = 0;
  private viewBottom = 0;

  constructor(
    private readonly scene: Phaser.Scene,
    profile: Profile,
    training: TrainingState,
    actions: TestingActions,
  ) {
    const { width, height } = view(scene);
    this.container = scene.add.container(0, 0).setDepth(90);
    this.host = this.container;
    // Q-PREMIUM-2 L7: fully solid, so the Board never shows through.
    const backdrop = scene.add.rectangle(0, 0, width, height, 0x0d0b14, 1).setOrigin(0).setInteractive();
    this.container.add(backdrop);
    const pad = 14;
    const leftW = Math.min(300, width * 0.42);

    // Close is at the top, always on screen; the list under it scrolls.
    this.text(pad, pad + 8, 'Testing screen', 20, '#ff9f6b', true);
    this.button(pad + leftW - 96, pad, 96, MIN_TAP, 'Close', 0x5b4a3c, 15, actions.close);
    this.text(pad, pad + MIN_TAP + 4, 'Hidden from players. Fake students until DojoForge is connected.', 11, '#b9ad99', false, leftW);
    this.viewTop = pad + MIN_TAP + 4 + 30;
    this.viewBottom = height;

    const list = scene.add.container(0, 0);
    this.container.add(list);
    this.host = list;
    const maskG = scene.make.graphics({}, false);
    maskG.fillStyle(0xffffff).fillRect(0, this.viewTop, leftW + pad * 2, height - this.viewTop);
    list.setMask(maskG.createGeometryMask());

    let y = this.viewTop + 4;
    this.text(pad, y, `Student profile (same student, ${COUNT_WORDS[FAKE_PROFILES.length] ?? FAKE_PROFILES.length} points in time):`, 12, '#f2e9d8', false, leftW);
    y += 20;
    const current = selectedProfileKey();
    for (const p of FAKE_PROFILES) {
      const on = p.key === current;
      this.button(pad, y, leftW, 34, `${on ? '● ' : ''}${p.label}`, on ? 0x3a7bd5 : 0x2a2536, 13, () => actions.pickProfile(p.key));
      y += 40;
    }
    y += 4;
    this.button(pad, y, leftW, 32, 'Forget what I\'ve seen (replay welcome)', 0x4a3f63, 12, actions.forgetSeen);
    y += 38;
    const half = (leftW - 8) / 2;
    this.button(pad, y, half, 32, '+1 level', GREEN, 13, actions.addLevel);
    this.button(pad + half + 8, y, half, 32, 'Back to level 1', 0x6b3a3a, 12, actions.resetLevel);
    y += 38;
    this.host = this.container;

    // Drag the left list up and down; it stops at both ends.
    const maxScroll = Math.max(0, y + pad - height);
    if (maxScroll > 0) {
      let startY = 0;
      let startScroll = 0;
      this.onDown = (p: Phaser.Input.Pointer) => {
        startY = p.y;
        startScroll = -list.y;
        this.dragged = false;
      };
      this.onMove = (p: Phaser.Input.Pointer) => {
        if (!p.isDown || !list.active || p.x > leftW + pad * 2) return;
        if (Math.abs(p.y - startY) > 8) this.dragged = true;
        if (this.dragged) list.y = -Phaser.Math.Clamp(startScroll + (startY - p.y), 0, maxScroll);
      };
      scene.input.on(Phaser.Input.Events.POINTER_DOWN, this.onDown);
      scene.input.on(Phaser.Input.Events.POINTER_MOVE, this.onMove);
    }
    this.scroller = list;

    // ---- Power Rating
    const rx = pad * 2 + leftW;
    const rw = width - rx - pad;
    const pr = powerRating(training, profile);
    let ry = pad;
    this.text(rx, ry, `Power Rating: ${pr.total} / ${pr.tierMax}`, 20, '#ffd166', true);
    ry += 26;
    this.text(rx, ry, `${training.displayName} · ${training.belt.name} (tier ${training.tier})`, 13, '#f2e9d8');
    ry += 24;
    const rowH = Math.min(30, (height - ry - 70) / pr.parts.length);
    for (const part of pr.parts) {
      this.text(rx, ry, SOURCE_NAME[part.source], 13, '#f2e9d8', true);
      this.text(rx + 118, ry, `${part.value} / ${part.max}`, 13, '#ffd166', true);
      this.text(rx + 200, ry, `${Math.round(part.share * 100)}%`, 12, '#b9ad99');
      const g = scene.add.graphics();
      g.fillStyle(0x2a2536).fillRect(rx + 240, ry + 3, rw - 240, 8);
      g.fillStyle(0xffd166).fillRect(rx + 240, ry + 3, (rw - 240) * part.fill, 8);
      this.container.add(g);
      this.text(rx + 118, ry + 15, part.detail, 10, '#b9ad99', false, rw - 118);
      ry += rowH;
    }
    ry += 4;
    const need = profile.level < training.levelCap ? xpToNext(profile.level, training.belts) : 0;
    const lines = [
      `Level ${Math.min(profile.level, training.levelCap)} of ${training.levelCap}${profile.level > training.levelCap ? ` (saved level ${profile.level}, capped by belt)` : ''} · experience ${profile.xp} / ${need || 'cap'}`,
      `Dojo Blessing: ${training.blessed ? `on (${Math.round(((training.blessingEndsMs ?? 0) - Date.now()) / 3600000)}h left)` : 'off'} · expected level ${training.expectedLevel}`,
    ];
    for (const l of lines) {
      this.text(rx, ry, l, 11, '#b9ad99', false, rw);
      ry += 15;
    }
  }

  destroy(): void {
    if (this.onDown) this.scene.input.off(Phaser.Input.Events.POINTER_DOWN, this.onDown);
    if (this.onMove) this.scene.input.off(Phaser.Input.Events.POINTER_MOVE, this.onMove);
    this.scroller?.clearMask(true);
    this.container.destroy();
  }

  private text(x: number, y: number, str: string, size: number, color: string, bold = false, wrap?: number): Phaser.GameObjects.Text {
    const t = this.scene.add
      .text(x, y, str, { fontFamily: FONT, fontSize: `${size}px`, color, fontStyle: bold ? 'bold' : 'normal', wordWrap: wrap ? { width: wrap } : undefined })
      .setResolution(crisp());
    this.host.add(t);
    return t;
  }

  private button(x: number, y: number, w: number, h: number, label: string, color: number, size: number, onTap: () => void): void {
    const bg = this.scene.add.rectangle(x, y, w, h, color).setOrigin(0).setStrokeStyle(2, 0xffffff, 0.3);
    this.host.add(bg);
    this.text(x + 10, y + h / 2, label, size, '#ffffff', true, w - 16).setOrigin(0, 0.5);
    const inList = this.host !== this.container;
    bg.setInteractive().on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, (p: Phaser.Input.Pointer) => {
      if (inList && (this.dragged || p.y < this.viewTop || p.y > this.viewBottom)) return;
      onTap();
    });
  }
}
