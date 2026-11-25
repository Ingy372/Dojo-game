// The chapter card (Story Chapters, Nov 24): when a chapter is ready, Sensei waits with "Chapter n: Title" and
// Start / Later. Later keeps the chapter waiting for the next visit; nothing is lost.
import Phaser from 'phaser';
import { sfx } from '../audio/Sfx';
import { reducedMotion } from '../game/motion';
import { button } from './button';
import { FONT, MIN_TAP, crisp, view } from './theme';
import STORY from '../../../../content/tutorial/chapters.json';

export function chapterTitle(n: number): string {
  return STORY.chapters.find((c) => c.n === n)?.title ?? '';
}

export function showChapterCard(s: Phaser.Scene, n: number, onStart: () => void, onLater: () => void): Phaser.GameObjects.Container {
  const { width, height } = view(s);
  const c = s.add.container(0, 0).setDepth(80);
  const dim = s.add.rectangle(0, 0, width, height, 0x08060f, 0.55).setOrigin(0).setInteractive();
  const w = Math.min(440, width - 32);
  const h = 230;
  const x = width / 2 - w / 2;
  const y = height / 2 - h / 2;
  const g = s.add.graphics();
  g.fillStyle(0x000000, 0.35).fillRoundedRect(x + 3, y + 6, w, h, 18);
  g.fillStyle(0x221d2e, 0.98).fillRoundedRect(x, y, w, h, 18);
  g.lineStyle(3, 0xffd166, 1).strokeRoundedRect(x, y, w, h, 18);
  const t = (ty: number, str: string, size: number, color: string, serif = false) =>
    s.add
      .text(width / 2, ty, str, { fontFamily: serif ? 'Georgia, serif' : FONT, fontStyle: 'bold', fontSize: `${size}px`, color, align: 'center', wordWrap: { width: w - 32 } })
      .setOrigin(0.5, 0)
      .setResolution(crisp());
  const badge = s.add.circle(x + 34, y + 34, 18, 0xffd166).setStrokeStyle(3, 0x2a1d10);
  const bang = t(y + 20, '!', 24, '#2a1d10').setX(x + 34);
  const label = t(y + 22, STORY.card.chapter.replace('{n}', String(n)), 16, '#ffd166');
  const title = t(y + 46, chapterTitle(n), 30, '#fff6e0', true);
  const line = t(y + 98, STORY.card.senseiWaits, 17, '#e8dcc4');
  c.add([dim, g, badge, bang, label, title, line]);
  const bw = 140;
  const close = (then: () => void) => {
    sfx.tap();
    c.destroy();
    then();
  };
  button(s, { x: width / 2 + 8, y: y + h - MIN_TAP - 22, w: bw, h: MIN_TAP, label: STORY.card.start, color: 0xd5713a, size: 18, onTap: () => close(onStart) }, c);
  button(s, { x: width / 2 - 8 - bw, y: y + h - MIN_TAP - 22, w: bw, h: MIN_TAP, label: STORY.card.later, color: 0x3a3a4a, size: 16, onTap: () => close(onLater) }, c);
  c.setAlpha(0);
  s.tweens.add({ targets: c, alpha: 1, duration: 220 });
  if (!reducedMotion()) s.tweens.add({ targets: badge, scale: 1.15, duration: 500, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
  return c;
}
