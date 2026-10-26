import Phaser from 'phaser';
import { sfx } from '../audio/Sfx';
import { FONT, crisp, view } from './theme';
import { KO, keptText } from '../game/knockout';
import { reducedMotion } from '../game/motion';
import { GREEN } from './tokens';

/** Taps are ignored for a moment after the card appears, so a tap meant for the fight doesn't press a button. */
const ARM_MS = 600;

/**
 * B-MASHER-d1 Screen 2, after a knock-out or when play time ends (M7-P9): what they kept,
 * each find with a small sparkle, Sensei's line (or the resting line), and one Head home
 * button with a door. A tap anywhere also goes home. No timer. Returns the container
 * (screen space) so the zoomed room camera can ignore it.
 */
export function keptCard(
  scene: Phaser.Scene,
  finds: readonly string[],
  resting: boolean,
  onHome: () => void,
): Phaser.GameObjects.Container {
  const words = keptText(finds, resting);
  const shown = words.finds.slice(0, 3);
  const { width, height } = view(scene);
  const small = height < 420;
  const cardW = Math.min(440, width - 40);
  const btnH = Math.max(48, Math.min(52, height * 0.13)); // Q-PREM-F11: Head home is never under 48 px
  const rowH = small ? 22 : 26;
  const text = (x: number, y: number, s: string, size: number, color: string, bold = false) =>
    scene.add
      .text(x, y, s, { fontFamily: FONT, fontStyle: bold ? 'bold' : 'normal', fontSize: `${size}px`, color, align: 'center', wordWrap: { width: cardW - 32 } })
      .setOrigin(0.5, 0)
      .setResolution(crisp());
  // The title is measured first, so a title that wraps pushes the rows down instead of under them.
  const title = text(width / 2, 0, words.title, small ? 22 : 26, '#ffd166', true);
  const below = 16 + title.height + 8; // card top to the first row
  const cardH = Math.min(below + shown.length * rowH + 40 + btnH + 22, height - 20);
  const left = (width - cardW) / 2;
  const top = (height - cardH) / 2;
  title.setY(top + 16);
  const shade = scene.add.rectangle(0, 0, width, height, 0x0a0810, 0.8).setOrigin(0).setInteractive();
  const container = scene.add
    .container(0, 0, [
      shade,
      scene.add.rectangle(left, top, cardW, cardH, 0x221d2e).setOrigin(0).setStrokeStyle(3, 0xffd166, 0.9),
      title,
    ])
    .setDepth(110);
  const still = reducedMotion();
  shown.forEach((name, i) => {
    const t = text(width / 2, top + below + i * rowH, name, small ? 16 : 18, '#f2e9d8');
    const star = text(width / 2 - t.width / 2 - 14, t.y, '\u2726', small ? 14 : 16, '#ffd166');
    container.add([t, star]);
    if (!still) scene.tweens.add({ targets: star, alpha: 0.35, scale: 0.8, duration: 520, yoyo: true, repeat: -1, delay: i * 160 });
  });
  const lineY = top + below + 2 + shown.length * rowH + 6;
  container.add(text(width / 2, lineY, words.sensei, small ? 15 : 17, '#f2e9d8'));

  const opened = scene.time.now;
  let gone = false;
  const go = () => {
    if (gone || scene.time.now - opened < ARM_MS) return;
    gone = true;
    sfx.unlock();
    container.each((o: Phaser.GameObjects.GameObject) => o.disableInteractive());
    onHome();
  };
  const btnW = Math.min(240, cardW - 48);
  const btnX = width / 2 - btnW / 2;
  const btnY = top + cardH - btnH - 16;
  const bg = scene.add.rectangle(btnX, btnY, btnW, btnH, GREEN).setOrigin(0).setStrokeStyle(2, 0xfff6e0, 0.5).setInteractive();
  const label = scene.add
    .text(width / 2 + 14, btnY + btnH / 2, KO.headHome, { fontFamily: FONT, fontStyle: 'bold', fontSize: '19px', color: '#fff6e0' })
    .setOrigin(0.5)
    .setResolution(crisp());
  // The door icon, drawn left of the label.
  const dx = label.x - label.width / 2 - 26;
  const dy = btnY + btnH / 2 - 11;
  const door = scene.add.graphics();
  door.fillStyle(0x8a5a32).fillRect(dx, dy, 16, 22).lineStyle(2, 0xfff6e0).strokeRect(dx, dy, 16, 22);
  door.fillStyle(0xfff6e0).fillCircle(dx + 12, dy + 12, 1.8);
  container.add([bg, label, door]);
  bg.on(Phaser.Input.Events.GAMEOBJECT_POINTER_DOWN, go);
  shade.on(Phaser.Input.Events.GAMEOBJECT_POINTER_DOWN, go);
  container.setAlpha(0);
  scene.tweens.add({ targets: container, alpha: 1, duration: still ? 0 : 260 });
  return container;
}

/**
 * A small kind question with two buttons (left = no, right = yes). Used for the Guided offer
 * after losses on one floor (M7-P1). `onAnswer` gets true for yes.
 */
export function choiceCard(
  scene: Phaser.Scene,
  title: string,
  line: string,
  noLabel: string,
  yesLabel: string,
  onAnswer: (yes: boolean) => void,
): Phaser.GameObjects.Container {
  const { width, height } = view(scene);
  const cardW = Math.min(460, width - 40);
  const btnH = Math.min(50, height * 0.13);
  const cardH = Math.min(150 + btnH, height - 20);
  const left = (width - cardW) / 2;
  const top = (height - cardH) / 2;
  const text = (y: number, s: string, size: number, color: string, bold = false) =>
    scene.add
      .text(width / 2, y, s, { fontFamily: FONT, fontStyle: bold ? 'bold' : 'normal', fontSize: `${size}px`, color, align: 'center', wordWrap: { width: cardW - 32 } })
      .setOrigin(0.5, 0)
      .setResolution(crisp());
  const container = scene.add
    .container(0, 0, [
      scene.add.rectangle(0, 0, width, height, 0x0a0810, 0.8).setOrigin(0).setInteractive(),
      scene.add.rectangle(left, top, cardW, cardH, 0x221d2e).setOrigin(0).setStrokeStyle(3, 0xffd166, 0.9),
      text(top + 16, title, 22, '#ffd166', true),
      text(top + 52, line, 15, '#f2e9d8'),
    ])
    .setDepth(110);
  const opened = scene.time.now;
  const btnW = (cardW - 48) / 2;
  const btnY = top + cardH - btnH - 16;
  const button = (x: number, label: string, color: number, yes: boolean) => {
    const bg = scene.add.rectangle(x, btnY, btnW, btnH, color).setOrigin(0).setStrokeStyle(2, 0xfff6e0, 0.5).setInteractive();
    const t = scene.add.text(x + btnW / 2, btnY + btnH / 2, label, { fontFamily: FONT, fontStyle: 'bold', fontSize: '17px', color: '#fff6e0' }).setOrigin(0.5).setResolution(crisp());
    container.add([bg, t]);
    bg.on(Phaser.Input.Events.GAMEOBJECT_POINTER_DOWN, () => {
      if (scene.time.now - opened < ARM_MS) return;
      sfx.unlock();
      container.destroy();
      onAnswer(yes);
    });
  };
  button(left + 16, noLabel, 0x4a4a55, false);
  button(left + 32 + btnW, yesLabel, GREEN, true);
  container.setAlpha(0);
  scene.tweens.add({ targets: container, alpha: 1, duration: 260 });
  return container;
}
