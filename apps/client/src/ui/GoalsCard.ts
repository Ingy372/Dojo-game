// The three next goals (M7-P10): one in the game, one to collect, one in the real dojo.
// Shown after a run, at most once a day, with no button: a tap anywhere closes it.
// Kind wording only: no timers, counts of what's missing, or "don't lose" lines.

import Phaser from 'phaser';
import type { NextGoal } from '@dojo/sim';
import { sfx } from '../audio/Sfx';
import { FONT, crisp, view } from './theme';

const LABEL: Record<NextGoal['kind'], { title: string; color: string }> = {
  game: { title: 'In the Tower', color: '#9ad1ff' },
  collection: { title: 'To collect', color: '#ffd166' },
  realWorld: { title: 'In the dojo', color: '#8fe3a1' },
};

export class GoalsCard {
  private readonly root: Phaser.GameObjects.Container;

  constructor(scene: Phaser.Scene, goals: NextGoal[], onDone: () => void) {
    const { width, height } = view(scene);
    const shade = scene.add.rectangle(0, 0, width, height, 0x0a0810, 0.85).setOrigin(0).setInteractive();
    const cw = Math.min(460, width - 32);
    const rowH = Math.min(78, (height - 150) / 3);
    const ch = 70 + rowH * goals.length + 30;
    const cx = width / 2;
    const top = Math.max(12, (height - ch) / 2);
    const card = scene.add.rectangle(cx, top + ch / 2, cw, ch, 0x1d1828).setStrokeStyle(2, 0xffd166, 0.8);
    const text = (x: number, y: number, s: string, size: number, color: string, bold = false, wrap = 0) =>
      scene.add.text(x, y, s, { fontFamily: FONT, fontSize: `${size}px`, color, fontStyle: bold ? 'bold' : 'normal', wordWrap: wrap ? { width: wrap } : undefined }).setResolution(crisp());
    const items: Phaser.GameObjects.GameObject[] = [shade, card, text(cx, top + 30, 'Your next goals', 22, '#ffffff', true).setOrigin(0.5)];
    goals.forEach((g, i) => {
      const y = top + 62 + i * rowH;
      const l = LABEL[g.kind];
      items.push(text(cx - cw / 2 + 20, y, l.title.toUpperCase(), 12, l.color, true));
      items.push(text(cx - cw / 2 + 20, y + 18, g.text, 17, '#f4ecdc', false, cw - 40));
    });
    items.push(text(cx, top + ch - 20, 'Tap to continue', 14, '#b9ad99').setOrigin(0.5));
    this.root = scene.add.container(0, 0, items).setDepth(100).setAlpha(0);
    scene.tweens.add({ targets: this.root, alpha: 1, duration: 250 });
    const readyAt = scene.time.now + 600;
    shade.on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, () => {
      if (scene.time.now < readyAt) return;
      sfx.unlock();
      this.root.destroy();
      onDone();
    });
  }
}
