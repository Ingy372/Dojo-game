import Phaser from 'phaser';
import type { TwistDef, TwistIcon } from '@dojo/sim';
import { FONT, crisp } from './theme';

/** A simple drawn icon for a room twist (no emoji, so it looks the same on every phone). */
export function twistIcon(scene: Phaser.Scene, icon: TwistIcon, size: number): Phaser.GameObjects.Graphics {
  const g = scene.add.graphics();
  const s = size / 2;
  g.fillStyle(0x14121c, 0.85).fillCircle(0, 0, s);
  g.lineStyle(3, 0xf2e9d8, 1).strokeCircle(0, 0, s);
  if (icon === 'lantern') {
    g.fillStyle(0xffd166, 0.35).fillCircle(0, 0, s * 0.62);
    g.fillStyle(0xff9f43, 1).fillRoundedRect(-s * 0.28, -s * 0.38, s * 0.56, s * 0.72, 4);
    g.fillStyle(0x7a4a2a, 1).fillRect(-s * 0.36, -s * 0.48, s * 0.72, s * 0.12).fillRect(-s * 0.36, s * 0.34, s * 0.72, s * 0.12);
  } else if (icon === 'ice') {
    g.lineStyle(4, 0x9ad1ff, 1);
    for (let i = 0; i < 3; i++) {
      const a = (i * Math.PI) / 3;
      g.lineBetween(-Math.cos(a) * s * 0.6, -Math.sin(a) * s * 0.6, Math.cos(a) * s * 0.6, Math.sin(a) * s * 0.6);
    }
  } else {
    g.fillStyle(0xffd166, 1).fillTriangle(0, -s * 0.55, -s * 0.48, s * 0.3, s * 0.48, s * 0.3);
    g.fillCircle(0, -s * 0.1, s * 0.3);
    g.fillStyle(0x7a4a2a, 1).fillCircle(0, s * 0.42, s * 0.12);
  }
  return g;
}

/** The banner when a twist room starts: icon, what's different, and Sensei saying the rule. */
export function twistBanner(scene: Phaser.Scene, twist: TwistDef, width: number, y: number): Phaser.GameObjects.Container {
  const text = scene.add
    .text(0, 0, `${twist.banner}\nSensei: "${twist.sensei}"`, {
      fontFamily: FONT,
      fontStyle: 'bold',
      fontSize: '17px',
      color: '#f2e9d8',
      align: 'left',
      lineSpacing: 4,
      wordWrap: { width: Math.min(580, width - 240) },
    })
    .setOrigin(0, 0.5)
    .setResolution(crisp());
  const icon = twistIcon(scene, twist.icon, 48);
  const w = text.width + 48 + 40;
  const h = Math.max(64, text.height + 20);
  const back = scene.add.graphics();
  back.fillStyle(0x14121c, 0.88).fillRoundedRect(-w / 2, -h / 2, w, h, 14);
  back.lineStyle(3, 0xffd166, 1).strokeRoundedRect(-w / 2, -h / 2, w, h, 14);
  icon.setPosition(-w / 2 + 12 + 24, 0);
  text.setPosition(-w / 2 + 12 + 48 + 14, 0);
  return scene.add.container(width / 2, y, [back, icon, text]).setDepth(30);
}
