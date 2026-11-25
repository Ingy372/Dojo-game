// The prayer menu (Jay, Nov 25): opened at the Bible on the red box in the Action Zone.
// On top: a short, gentle note about what prayer is and what it is not. Under it: a handful of short prayers;
// tap one to see it large. "Read to me" says the words aloud with the phone's own voice.
// The words are data (content/faith/action-zone-prayers.json), approved by Jay. Reading a prayer gives nothing
// in the game and nothing is saved or counted.

import Phaser from 'phaser';
import type { Prayer, PrayerBook } from '@dojo/sim';
import { hush, speak } from '../audio/voice';
import { reducedMotion } from '../game/motion';
import { closeX } from './boardReader';
import { button } from './button';
import { FONT, crisp, view } from './theme';

const MARGIN = 14;
const GAP = 8;
const GOLD = 0xffd166;
const INK = '#fff6e0';
const SOFT = '#e6dcf5';
const BTN = 0x8a5a35;
const VOICE_BTN = 0x3f6fb0;

export class PrayerMenu {
  private readonly layer: Phaser.GameObjects.Container;
  private readonly close: Phaser.GameObjects.Container;
  private showing: Prayer | null = null;
  private done = false;
  private readonly onKey = (e: KeyboardEvent): void => {
    if (e.key !== 'Escape') return;
    if (this.showing) this.open(null);
    else this.finish();
  };
  private readonly redraw = (): void => this.draw();

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly book: PrayerBook,
    private readonly onClose: () => void,
  ) {
    this.layer = scene.add.container(0, 0).setDepth(110);
    this.close = closeX(scene, () => this.finish());
    this.draw();
    if (!reducedMotion()) scene.tweens.add({ targets: this.layer, alpha: { from: 0, to: 1 }, duration: 180 });
    scene.input.keyboard?.on('keydown', this.onKey);
    scene.scale.on(Phaser.Scale.Events.RESIZE, this.redraw);
  }

  private label(x: number, y: number, s: string, size: number, color = INK, wrap?: number, bold = false): Phaser.GameObjects.Text {
    const t = this.scene.add
      .text(x, y, s, { fontFamily: FONT, fontStyle: bold ? 'bold' : 'normal', fontSize: `${size}px`, color, wordWrap: wrap ? { width: wrap } : undefined, lineSpacing: Math.round(size * 0.18) })
      .setResolution(crisp());
    this.layer.add(t);
    return t;
  }

  private open(p: Prayer | null): void {
    hush();
    this.showing = p;
    this.draw();
  }

  private draw(): void {
    if (this.done) return;
    const s = this.scene;
    this.layer.removeAll(true);
    const { width, height } = view(s);
    this.close.setPosition(width - 16 - 30, 16 + 30);
    this.layer.add(s.add.rectangle(0, 0, width, height, 0x0a0810, 0.86).setOrigin(0).setInteractive());
    const cw = Math.min(width - 2 * MARGIN, 760);
    const ch = height - 2 * MARGIN;
    const x0 = (width - cw) / 2;
    const y0 = MARGIN;
    const HEAD = 48;

    // The card: the same dark card with a gold frame as the kata menu.
    const g = s.add.graphics();
    g.fillStyle(0x000000, 0.45).fillRoundedRect(x0 + 3, y0 + 7, cw, ch, 18);
    g.fillStyle(0x1b1429, 0.98).fillRoundedRect(x0, y0, cw, ch, 18);
    g.fillStyle(0x2d2245, 1).fillRoundedRect(x0, y0, cw, HEAD, { tl: 18, tr: 18, bl: 0, br: 0 });
    g.lineStyle(3, GOLD, 0.9).strokeRoundedRect(x0, y0, cw, ch, 18);
    g.lineStyle(1.5, GOLD, 0.45).lineBetween(x0 + 16, y0 + HEAD, x0 + cw - 16, y0 + HEAD);
    this.layer.add(g);

    const title = this.label(width / 2, y0 + HEAD / 2, this.showing ? this.showing.title : this.book.title, 24, '#ffd166', undefined, true).setOrigin(0.5);
    // A small gold cross on each side of the title.
    const fl = s.add.graphics();
    for (const side of [-1, 1]) {
      const cx = width / 2 + side * (title.width / 2 + 22);
      const cy = y0 + HEAD / 2;
      fl.fillStyle(GOLD, 0.9).fillRect(cx - 1.5, cy - 9, 3, 18).fillRect(cx - 6, cy - 5, 12, 3);
    }
    this.layer.add(fl);

    if (this.showing) this.drawPrayer(this.showing, y0 + HEAD, cw, ch - HEAD);
    else this.drawHome(x0, y0 + HEAD, cw, ch - HEAD);
  }

  /** The note about prayer on top, the prayers to pick from under it. */
  private drawHome(x0: number, top: number, cw: number, h: number): void {
    const s = this.scene;
    const { width } = view(s);
    const pad = 18;
    const n = this.book.prayers.length;
    const cols = cw > 560 ? 4 : 3;
    const rows = Math.ceil(n / cols);
    const bh = 44;
    const gridH = rows * (bh + GAP) - GAP;
    const PICK_H = 32;
    const gridTop = top + h - 12 - gridH;
    const pickTop = gridTop - 6 - PICK_H;
    const between = 20;
    const colW = (cw - 2 * pad - between * (this.book.about.length - 1)) / this.book.about.length;

    // The note is written as large as fits above the prayers (smaller on a small phone).
    let made: Phaser.GameObjects.Text[] = [];
    for (const size of [15, 14, 13, 12, 11]) {
      for (const t of made) t.destroy();
      made = [];
      let bottom = top;
      this.book.about.forEach((note, i) => {
        const x = x0 + pad + i * (colW + between);
        let y = top + 8;
        const head = this.label(x, y, note.heading, size + 2, '#ffd166', colW, true);
        made.push(head);
        y += head.height + 3;
        for (const point of note.points) {
          const dot = this.label(x, y, '•', size, SOFT);
          const line = this.label(x + 12, y, point, size, SOFT, colW - 12);
          made.push(dot, line);
          y += line.height + 2;
        }
        bottom = Math.max(bottom, y);
      });
      const closing = this.label(width / 2, bottom + 3, this.book.closing, size, INK, cw - 2 * pad).setOrigin(0.5, 0);
      closing.setFontStyle('italic');
      made.push(closing);
      if (closing.y + closing.height + 4 <= pickTop) break;
    }

    // The line over the prayers, with Read to me beside it (it says the note aloud, for anyone who would rather listen).
    const rule = s.add.graphics().lineStyle(1.5, GOLD, 0.35).lineBetween(x0 + 16, pickTop - 2, x0 + cw - 16, pickTop - 2);
    this.layer.add(rule);
    this.label(x0 + pad, pickTop + PICK_H / 2 + 1, this.book.pick, 15, '#ffd166', undefined, true).setOrigin(0, 0.5);
    const readW = 132;
    button(
      s,
      {
        x: x0 + cw - pad - readW,
        y: pickTop + 3,
        w: readW,
        h: PICK_H - 6,
        label: `\u{1F50A} ${this.book.readAloud}`,
        color: VOICE_BTN,
        size: 13,
        onTap: () => speak([...this.book.about.flatMap((a) => [a.heading, ...a.points]), this.book.closing].join(' '), 0.9),
      },
      this.layer,
    );

    const bw = (cw - 2 * pad - (cols - 1) * GAP) / cols;
    this.book.prayers.forEach((p, i) => {
      const row = Math.floor(i / cols);
      const inRow = row === rows - 1 ? n - row * cols : cols;
      const rowW = inRow * (bw + GAP) - GAP;
      const x = (width - rowW) / 2 + (i % cols) * (bw + GAP);
      button(s, { x, y: gridTop + row * (bh + GAP), w: bw, h: bh, label: p.title, color: BTN, size: 15, labelWrap: bw - 12, onTap: () => this.open(p) }, this.layer);
    });
  }

  /** One prayer, large, with Back and Read to me. */
  private drawPrayer(p: Prayer, top: number, cw: number, h: number): void {
    const s = this.scene;
    const { width } = view(s);
    const bh = 46;
    const room = h - bh - 36;
    let words: Phaser.GameObjects.Text | null = null;
    for (const size of [26, 24, 22, 20, 18, 16]) {
      words?.destroy();
      words = this.label(width / 2, top + 12 + room / 2, p.text, size, INK, Math.min(cw - 72, 600)).setOrigin(0.5).setAlign('center');
      if (words.height <= room) break;
    }
    const bw = Math.min(190, (cw - 36 - GAP) / 2);
    const by = top + h - bh - 14;
    button(s, { x: width / 2 - bw - GAP / 2, y: by, w: bw, h: bh, label: `← ${this.book.back}`, color: BTN, size: 17, onTap: () => this.open(null) }, this.layer);
    button(s, { x: width / 2 + GAP / 2, y: by, w: bw, h: bh, label: `\u{1F50A} ${this.book.readAloud}`, color: VOICE_BTN, size: 17, onTap: () => speak(p.text, 0.85) }, this.layer);
  }

  private finish(): void {
    if (this.done) return;
    this.done = true;
    hush();
    this.scene.input.keyboard?.off('keydown', this.onKey);
    this.scene.scale.off(Phaser.Scale.Events.RESIZE, this.redraw);
    this.layer.destroy();
    this.close.destroy();
    this.onClose();
  }
}
