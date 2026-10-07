// The hidden testing screen (tap "Home Dojo" 5 times). For Jay and staff only:
// switch fake student profiles, replay celebrations, and check the Power Rating.
// Power Rating must never appear anywhere a player would normally look.

import Phaser from 'phaser';
import { powerRating, xpToNext, type PowerSource, type Profile, type TrainingState } from '@dojo/sim';
import { FAKE_PROFILES, selectedProfileKey } from '../game/student';
import { FONT, crisp } from './theme';

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

export class TestingPanel {
  readonly container: Phaser.GameObjects.Container;

  constructor(
    private readonly scene: Phaser.Scene,
    profile: Profile,
    training: TrainingState,
    actions: TestingActions,
  ) {
    const { width, height } = scene.scale.gameSize;
    this.container = scene.add.container(0, 0).setDepth(90);
    this.container.add(scene.add.rectangle(0, 0, width, height, 0x0d0b14, 0.97).setOrigin(0).setInteractive());
    const pad = 14;
    const leftW = Math.min(300, width * 0.42);

    this.text(pad, pad, 'Testing screen', 20, '#ff9f6b', true);
    this.text(pad, pad + 26, 'Hidden from players. Fake students until DojoForge is connected.', 11, '#b9ad99', false, leftW);

    let y = pad + 58;
    this.text(pad, y, 'Student profile (same student, three points in time):', 12, '#f2e9d8', false, leftW);
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
    this.button(pad, y, half, 32, '+1 level', 0x3aa57a, 13, actions.addLevel);
    this.button(pad + half + 8, y, half, 32, 'Back to level 1', 0x6b3a3a, 12, actions.resetLevel);
    y += 38;
    this.button(pad, y, leftW, 34, 'Close', 0x5b4a3c, 15, actions.close);

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
    this.container.destroy();
  }

  private text(x: number, y: number, str: string, size: number, color: string, bold = false, wrap?: number): Phaser.GameObjects.Text {
    const t = this.scene.add
      .text(x, y, str, { fontFamily: FONT, fontSize: `${size}px`, color, fontStyle: bold ? 'bold' : 'normal', wordWrap: wrap ? { width: wrap } : undefined })
      .setResolution(crisp());
    this.container.add(t);
    return t;
  }

  private button(x: number, y: number, w: number, h: number, label: string, color: number, size: number, onTap: () => void): void {
    const bg = this.scene.add.rectangle(x, y, w, h, color).setOrigin(0).setStrokeStyle(2, 0xffffff, 0.3);
    this.container.add(bg);
    this.text(x + 10, y + h / 2, label, size, '#ffffff', true, w - 16).setOrigin(0, 0.5);
    bg.setInteractive().on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, onTap);
  }
}
