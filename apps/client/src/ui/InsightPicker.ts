import Phaser from 'phaser';
import type { InsightDef } from '@dojo/sim';
import { addIcon, INSIGHT_ACCENT } from '../art/icons';
import { CARD_PAD, PICKER_BODY_SIZES, fitCards } from './insightLayout';
import { FAMILY_COLOR, FONT, crisp, css, view } from './theme';
import { TITLE_FONT, fade, kitCard, kitRibbon } from './kit';

/** Taps are ignored for this long after the cards appear, so a tap meant for the fight doesn't pick a card. */
const ARM_MS = 450;

/**
 * "Choose an Insight": three large cards over the room. The fight is paused
 * while it's open. Calls `onPick` with the chosen Insight's id.
 */
export class InsightPicker {
  readonly container: Phaser.GameObjects.Container;

  constructor(scene: Phaser.Scene, insights: InsightDef[], onPick: (id: string) => void) {
    const { width, height } = view(scene);
    const shade = scene.add.rectangle(0, 0, width, height, 0x060a24, 0.78).setOrigin(0).setInteractive();
    // U-KIT: the gold ribbon title (Archero's "Level Up" banner) and a line under it.
    const rib = kitRibbon(scene, width / 2, height * 0.1 - 20, 'Choose an Insight', 22, 220);
    const sub = scene.add
      .text(width / 2, height * 0.1 + 32, 'It lasts for this run.', { fontFamily: FONT, fontStyle: 'bold', fontSize: '15px', color: '#ffe36a' })
      .setOrigin(0.5)
      .setResolution(crisp());
    this.container = scene.add.container(0, 0, [shade, ...rib.parts, sub]).setDepth(100);

    const gap = 14;
    const cardW = Math.min(210, (width - 48 - gap * (insights.length - 1)) / insights.length);
    const left = width / 2 - (cardW * insights.length + gap * (insights.length - 1)) / 2;
    const top = height * 0.1 + 52;
    const opened = scene.time.now;

    // Text first, so the cards can be sized to it.
    const parts = insights.map((ins, i) => {
      const x = left + i * (cardW + gap);
      const color = FAMILY_COLOR[ins.family];
      const family = scene.add
        .text(x + cardW / 2, top + 16, ins.family.toUpperCase(), { fontFamily: TITLE_FONT, fontSize: '15px', color: '#ffffff', stroke: '#0d1233', strokeThickness: 3 })
        .setOrigin(0.5)
        .setResolution(crisp());
      // Its icon (Batch 8) under the stripe, when it has one.
      const icon = addIcon(scene, ins.id, x + cardW / 2, top + 58, 44);
      const nameY = icon ? top + 84 : top + 50;
      const name = scene.add
        .text(x + cardW / 2, nameY, ins.name, { fontFamily: TITLE_FONT, fontSize: '20px', color: css(color), align: 'center', stroke: '#0d1233', strokeThickness: 4, wordWrap: { width: cardW - 16 } })
        .setOrigin(0.5, 0)
        .setResolution(crisp());
      const text = scene.add
        .text(x + cardW / 2, nameY + name.height + (icon ? 6 : 12), ins.text, { fontFamily: FONT, fontSize: `${PICKER_BODY_SIZES[0]}px`, color: '#f2e9d8', align: 'center', wordWrap: { width: cardW - 20 } })
        .setOrigin(0.5, 0)
        .setResolution(crisp());
      return { ins, x, color, family, icon, name, text };
    });
    // One height for the row: the tallest text plus the padding. If it will not fit the screen, the body text steps down.
    const { bodySize, cardH } = fitCards((size) => {
      let low = 0;
      for (const p of parts) {
        p.text.setFontSize(size);
        low = Math.max(low, p.text.y + p.text.height - top);
      }
      return low;
    }, height - CARD_PAD - top);
    parts.forEach((p) => p.text.setFontSize(bodySize));

    parts.forEach(({ ins, x, color, family, icon, name, text }, i) => {
      // U-KIT: a kit card (Archero's skill cards) with the family's colour as a band across the top.
      const bg = scene.add.rectangle(x, top, cardW, cardH, 0xffffff, 0).setOrigin(0);
      const face = kitCard(scene, x, top, cardW, cardH, { topLeft: true, radius: 16, face: { top: 0x2c3f9e, bottom: 0x152163, rim: INSIGHT_ACCENT[ins.id] ?? color } });
      const stripe = scene.add.graphics();
      fade(stripe, x + 3, top + 3, cardW - 6, 29, { tl: 13, tr: 13, bl: 0, br: 0 }, Phaser.Display.Color.ValueToColor(color).lighten(18).color, color);
      stripe.fillStyle(0x0d1233, 1).fillRect(x + 3, top + 32, cardW - 6, 3);
      const card = scene.add.container(0, 0, [face, stripe, family, ...(icon ? [icon] : []), name, text, bg]);
      this.container.add(card);
      card.setAlpha(0);
      scene.tweens.add({ targets: card, alpha: 1, y: { from: 20, to: 0 }, delay: i * 90, duration: 220, ease: 'Back.Out' });

      bg.setInteractive();
      bg.on(Phaser.Input.Events.GAMEOBJECT_POINTER_DOWN, () => {
        if (scene.time.now - opened < ARM_MS) return;
        bg.setFillStyle(0xffffff, 0.22);
        bg.disableInteractive();
        scene.time.delayedCall(140, () => onPick(ins.id));
      });
    });
  }

  destroy(): void {
    this.container.destroy();
  }
}
