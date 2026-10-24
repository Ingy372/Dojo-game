// The Monster Journal (M7-N1): one page per belt tier, one card per named monster.
// Met: its name and fact (and the stamp after a win). Not met: "?" and "Keep exploring!".
// No counts, percents or buy buttons: it's a keepsake, not a checklist to grind.

import Phaser from 'phaser';
import { namedForTier, type JournalEntry } from '@dojo/sim';
import { addStatic, staticArt } from '../art/art';
import { CONTENT } from '../game/content';
import { NAMED_PACK } from '../game/named';
import { FONT, crisp } from './theme';

/** Card spots on the page, in the art's source pixels (journal-page-frame note). */
const CARD_X = 36;
const CARD_YS = [92, 252, 412];
const TITLE_Y = 30;
const SOURCE_PAGE_WIDTH = 390;

type Box = [number, number, number, number];

/** Opens the journal over the scene. Returns its container (destroyed when closed). */
export function openMonsterJournal(scene: Phaser.Scene, journal: Record<string, JournalEntry>, onClose: () => void): Phaser.GameObjects.Container {
  const { width, height } = scene.scale.gameSize;
  const box = scene.add.container(0, 0).setDepth(80).setScrollFactor(0);
  const close = () => {
    box.destroy();
    onClose();
  };
  const dim = scene.add.rectangle(0, 0, width, height, 0x0a0810, 0.8).setOrigin(0).setInteractive();
  dim.on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, close);
  box.add(dim);

  const frame = staticArt(scene, NAMED_PACK, 'journal-page-frame');
  const pw = frame?.frameWidth ?? 234;
  const ph = frame?.frameHeight ?? 360;
  const k = pw / SOURCE_PAGE_WIDTH; // source pixels -> packed pixels
  const scale = Math.min((height - 12) / ph, (width - 12) / pw, 1.6);
  const page = scene.add.container(width / 2, height / 2).setScale(scale);
  box.add(page);
  // The page itself swallows taps (only the dark area around it closes).
  page.add(scene.add.rectangle(0, 0, pw, ph, 0x000000, 0.001).setInteractive());
  page.add(addStatic(scene, NAMED_PACK, 'journal-page-frame', 0, 0));
  const left = -pw / 2;
  const top = -ph / 2;
  const text = (x: number, y: number, s: string, size: number, color: string, bold: boolean, wrap?: number) =>
    scene.add
      .text(x, y, s, { fontFamily: FONT, fontSize: `${size}px`, color, fontStyle: bold ? 'bold' : 'normal', wordWrap: wrap ? { width: wrap } : undefined })
      .setResolution(crisp() * scale);

  // Title banner and the page's place name.
  page.add(addStatic(scene, NAMED_PACK, 'journal-title-banner', 0, top + TITLE_Y * k));
  page.add(text(0, top + TITLE_Y * k, CONTENT.named.journalTitle, 12, '#3a2a22', true).setOrigin(0.5));
  const tier = CONTENT.named.rules.minBeltTier;
  page.add(text(0, top + 58 * k, CONTENT.named.tierNames[String(tier)] ?? '', 11, '#6b5440', true).setOrigin(0.5));

  const card = staticArt(scene, NAMED_PACK, 'journal-card-met');
  const cw = card?.frameWidth ?? 191;
  const ch = card?.frameHeight ?? 84;
  const ck = cw / 318; // card source pixels -> packed pixels
  const inCard = (cx: number, cy: number, b: Box): [number, number, number, number] => [cx + b[0] * ck, cy + b[1] * ck, (b[2] - b[0]) * ck, (b[3] - b[1]) * ck];
  namedForTier(CONTENT.named, tier).forEach((m, i) => {
    const e = journal[m.id];
    const met = !!e?.met;
    const cx = left + CARD_X * k; // card top-left
    const cy = top + (CARD_YS[i] ?? CARD_YS[0]) * k;
    const id = met ? 'journal-card-met' : 'journal-card-unmet';
    page.add(addStatic(scene, NAMED_PACK, id, cx + cw / 2, cy + ch / 2));
    const well = inCard(cx, cy, [10, 10, 126, 126]);
    const wellX = well[0] + well[2] / 2;
    const wellY = well[1] + well[3] / 2;
    if (met) {
      // Its sticker picture in the well (bottom-centre anchored art, so drop it to the well's foot).
      const st = staticArt(scene, NAMED_PACK, m.sticker);
      const pics = addStatic(scene, NAMED_PACK, m.sticker, wellX, wellY + (st ? st.anchor[1] - st.frameHeight / 2 : 0));
      pics.forEach((p) => p.setScale(Math.min(1, well[2] / (st?.frameWidth ?? well[2]))));
      page.add(pics);
      const [nx, ny, nw] = inCard(cx, cy, [138, 14, 304, 40]);
      page.add(text(nx, ny, m.journal.name, 11, '#3a2a22', true, nw));
      const [fx, fy, fw] = inCard(cx, cy, [140, 50, 304, 100]);
      page.add(text(fx, fy, m.journal.fact, 8, '#3a2a22', false, fw).setLineSpacing(-1));
      if (e.beaten) {
        const [sx, sy, sw, sh] = inCard(cx, cy, [250, 74, 304, 128]);
        page.add(addStatic(scene, NAMED_PACK, 'journal-stamp', sx + sw / 2, sy + sh / 2));
      }
    } else {
      page.add(addStatic(scene, NAMED_PACK, `journal-silhouette-${m.baseEnemy}`, wellX, wellY));
      const [fx, fy, fw] = inCard(cx, cy, [140, 50, 304, 100]);
      page.add(text(fx, fy, CONTENT.named.journalUnknown.fact, 9, '#6b5440', true, fw));
    }
  });

  // A big, easy close button.
  const bx = width / 2 + (pw / 2) * scale - 4;
  const by = height / 2 - (ph / 2) * scale + 4;
  const btn = scene.add.circle(bx, by, 18, 0x3a3a4a).setStrokeStyle(2, 0xffffff, 0.5).setInteractive();
  btn.on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, close);
  box.add([btn, scene.add.text(bx, by, '✕', { fontFamily: FONT, fontStyle: 'bold', fontSize: '18px', color: '#ffffff' }).setOrigin(0.5).setResolution(crisp())]);
  return box;
}
