import Phaser from 'phaser';
import type { RunSummary } from '@dojo/sim';
import { sfx } from '../audio/Sfx';
import { FONT, crisp } from './theme';
import playTimeText from '../../../../content/settings/play-time.json';

/** Taps are ignored for a moment after the card appears, so a tap meant for the fight doesn't press a button. */
const ARM_MS = 600;

/**
 * The card after a lost run: warm words, how far the player got, what they keep,
 * and two big buttons. Never a punishment: everything found is kept.
 * Returns the container (screen space) so the zoomed room camera can ignore it.
 */
export function runOverCard(
  scene: Phaser.Scene,
  summary: RunSummary,
  xpGained: number,
  onRetry: () => void,
  onHome: () => void,
): Phaser.GameObjects.Container {
  const { width, height } = scene.scale.gameSize;
  const shade = scene.add.rectangle(0, 0, width, height, 0x0a0810, 0.8).setOrigin(0).setInteractive();
  const cardW = Math.min(440, width - 40);
  const btnH = Math.min(52, height * 0.13);
  const cardH = Math.min((xpGained > 0 ? 146 : 122) + btnH + 22, height - 20);
  const left = (width - cardW) / 2;
  const top = (height - cardH) / 2;
  const card = scene.add.rectangle(left, top, cardW, cardH, 0x221d2e).setOrigin(0).setStrokeStyle(3, 0xffd166, 0.9);
  const text = (y: number, s: string, size: number, color: string, bold = false) =>
    scene.add
      .text(width / 2, y, s, { fontFamily: FONT, fontStyle: bold ? 'bold' : 'normal', fontSize: `${size}px`, color, align: 'center', wordWrap: { width: cardW - 32 } })
      .setOrigin(0.5, 0)
      .setResolution(crisp());

  const room = Math.min(summary.roomsCleared + 1, summary.totalRooms);
  const found = summary.items.length + summary.decorations.length;
  const keep =
    found === 0 ? 'Every climb makes you stronger.' : `You keep everything you found: ${found} ${found === 1 ? 'treasure' : 'treasures'}.`;
  const parts: Phaser.GameObjects.GameObject[] = [
    shade,
    card,
    text(top + 18, 'Good effort!', 28, '#ffd166', true),
    text(top + 62, `You reached room ${room} of ${summary.totalRooms}.`, 18, '#f2e9d8'),
    text(top + 90, keep, 16, '#f2e9d8'),
  ];
  if (xpGained > 0) parts.push(text(top + 116, `+${xpGained} experience`, 15, '#9ad1ff'));

  const container = scene.add.container(0, 0, parts).setDepth(110);
  const opened = scene.time.now;
  const btnW = (cardW - 48) / 2;
  const btnY = top + cardH - btnH - 18;
  const button = (x: number, label: string, color: number, onTap: () => void) => {
    const bg = scene.add.rectangle(x, btnY, btnW, btnH, color).setOrigin(0).setStrokeStyle(2, 0xfff6e0, 0.5);
    const t = scene.add
      .text(x + btnW / 2, btnY + btnH / 2, label, { fontFamily: FONT, fontStyle: 'bold', fontSize: '19px', color: '#fff6e0' })
      .setOrigin(0.5)
      .setResolution(crisp());
    container.add([bg, t]);
    bg.setInteractive();
    bg.on(Phaser.Input.Events.GAMEOBJECT_POINTER_DOWN, () => {
      if (scene.time.now - opened < ARM_MS) return;
      sfx.unlock();
      container.each((o: Phaser.GameObjects.GameObject) => o.disableInteractive());
      onTap();
    });
  };
  button(left + 16, 'Try again', 0xd5713a, onRetry);
  button(left + 32 + btnW, 'Back home', 0x4a4a55, onHome);

  container.setAlpha(0);
  scene.tweens.add({ targets: container, alpha: 1, duration: 260 });
  return container;
}

/**
 * The card when the grown-up's play-time limit ends a run (M7-P9): warm words, everything
 * kept, one button home. No timer, no "time's up", no guilt.
 */
export function restCard(scene: Phaser.Scene, onHome: () => void): Phaser.GameObjects.Container {
  const t = playTimeText;
  const { width, height } = scene.scale.gameSize;
  const shade = scene.add.rectangle(0, 0, width, height, 0x0a0810, 0.8).setOrigin(0).setInteractive();
  const cardW = Math.min(440, width - 40);
  const btnH = Math.min(52, height * 0.13);
  const cardH = Math.min(140 + btnH + 22, height - 20);
  const left = (width - cardW) / 2;
  const top = (height - cardH) / 2;
  const text = (y: number, s: string, size: number, color: string, bold = false) =>
    scene.add
      .text(width / 2, y, s, { fontFamily: FONT, fontStyle: bold ? 'bold' : 'normal', fontSize: `${size}px`, color, align: 'center', wordWrap: { width: cardW - 32 } })
      .setOrigin(0.5, 0)
      .setResolution(crisp());
  const container = scene.add
    .container(0, 0, [
      shade,
      scene.add.rectangle(left, top, cardW, cardH, 0x221d2e).setOrigin(0).setStrokeStyle(3, 0xffd166, 0.9),
      text(top + 18, t.restTitle, 26, '#ffd166', true),
      text(top + 62, t.restLines[0], 18, '#f2e9d8'),
      text(top + 92, t.restLines[1], 16, '#f2e9d8'),
    ])
    .setDepth(110);
  const opened = scene.time.now;
  const btnW = Math.min(260, cardW - 48);
  const btnY = top + cardH - btnH - 18;
  const bg = scene.add.rectangle(width / 2 - btnW / 2, btnY, btnW, btnH, 0x3aa57a).setOrigin(0).setStrokeStyle(2, 0xfff6e0, 0.5).setInteractive();
  const label = scene.add
    .text(width / 2, btnY + btnH / 2, t.restButton, { fontFamily: FONT, fontStyle: 'bold', fontSize: '19px', color: '#fff6e0' })
    .setOrigin(0.5)
    .setResolution(crisp());
  container.add([bg, label]);
  bg.on(Phaser.Input.Events.GAMEOBJECT_POINTER_DOWN, () => {
    if (scene.time.now - opened < ARM_MS) return;
    sfx.unlock();
    bg.disableInteractive();
    onHome();
  });
  container.setAlpha(0);
  scene.tweens.add({ targets: container, alpha: 1, duration: 260 });
  return container;
}
