// The Monster Journal (M7-N1): one page per belt tier, one card per named monster.
// Met: its name and fact (and the stamp after a win). Not met: "?" and "Keep exploring!".
// Later pages: one card per monster kind, from its Journal trophy (S7): met once the trophy is
// given, else its silhouette (or "?") and "Keep exploring!", like the named cards.
// No counts, percents or buy buttons: it's a keepsake, not a checklist to grind.

import Phaser from 'phaser';
import { journalKinds, namedForTier, type JournalEntry } from '@dojo/sim';
import { addStatic, staticArt } from '../art/art';
import { CONTENT } from '../game/content';
import { NAMED_PACK } from '../game/named';
import { FONT, crisp } from './theme';

/** Card spots on the page, in the art's source pixels (journal-page-frame note). */
const CARD_X = 36;
const CARD_YS = [92, 252, 412];
const TITLE_Y = 30;
const SOURCE_PAGE_WIDTH = 390;
/** Fact text on screen: the game's body size (Street Smarts body text), never smaller (K10). */
const BODY_PX = 15;
/** Room the fact notes need beside the page to sit in one wide column. */
const NOTE_MIN_W = 220;

type Box = [number, number, number, number];

/** Opens the journal over the scene. Returns its container (destroyed when closed). */
export function openMonsterJournal(scene: Phaser.Scene, journal: Record<string, JournalEntry>, trophies: readonly string[], onClose: () => void): Phaser.GameObjects.Container {
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
  // Landscape phones: the page goes left and each card's fact sits in a note beside it, at
  // body size, so it is never shrunk with the page or drawn under the stamp (K10).
  const noteW = Math.min(360, width - pw * scale - 48);
  const side = noteW >= NOTE_MIN_W;
  const groupW = side ? pw * scale + 16 + noteW : pw * scale;
  const pageX = width / 2 - groupW / 2 + (pw * scale) / 2;
  const page = scene.add.container(pageX, height / 2).setScale(scale);
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
  const subtitle = text(0, top + 58 * k, '', 11, '#6b5440', true).setOrigin(0.5);
  page.add(subtitle);
  // Cards (and their side notes) for the shown page; cleared on each page turn.
  const cards = scene.add.container(0, 0);
  const notes = scene.add.container(0, 0);
  page.add(cards);
  box.add(notes);

  const card = staticArt(scene, NAMED_PACK, 'journal-card-met');
  const cw = card?.frameWidth ?? 191;
  const ch = card?.frameHeight ?? 84;
  const ck = cw / 318; // card source pixels -> packed pixels
  const inCard = (cx: number, cy: number, b: Box): [number, number, number, number] => [cx + b[0] * ck, cy + b[1] * ck, (b[2] - b[0]) * ck, (b[3] - b[1]) * ck];
  const noteX = pageX + (pw * scale) / 2 + 16;
  /** A card's fact: in a note beside the card, or (narrow screens) in the card's fact area, left of the stamp. */
  const fact = (cx: number, cy: number, str: string, color: string, bold: boolean) => {
    if (side) {
      const y = height / 2 + cy * scale;
      const h = ch * scale;
      const note = scene.add.rectangle(noteX, y + 4, noteW, h - 8, 0xf6ecd6).setOrigin(0).setStrokeStyle(2, 0x8a6a48);
      const tail = scene.add.triangle(noteX, y + h / 2, 0, 0, -10, 8, 0, 16, 0xf6ecd6).setOrigin(1, 0.5);
      const t = scene.add
        .text(noteX + 12, y + h / 2, str, { fontFamily: FONT, fontSize: `${BODY_PX}px`, color, fontStyle: bold ? 'bold' : 'normal', wordWrap: { width: noteW - 24 } })
        .setOrigin(0, 0.5)
        .setResolution(crisp());
      notes.add([note, tail, t]);
    } else {
      // Fact area minus the stamp spot's columns, at body size on screen.
      const [fx, fy, fw] = inCard(cx, cy, [140, 46, 246, 128]);
      cards.add(text(fx, fy, str, BODY_PX / scale, color, bold, fw));
    }
  };
  const named = namedForTier(CONTENT.named, tier);
  const drawNamed = () => named.forEach((m, i) => {
    const e = journal[m.id];
    const met = !!e?.met;
    const cx = left + CARD_X * k; // card top-left
    const cy = top + (CARD_YS[i] ?? CARD_YS[0]) * k;
    const id = met ? 'journal-card-met' : 'journal-card-unmet';
    cards.add(addStatic(scene, NAMED_PACK, id, cx + cw / 2, cy + ch / 2));
    const well = inCard(cx, cy, [10, 10, 126, 126]);
    const wellX = well[0] + well[2] / 2;
    const wellY = well[1] + well[3] / 2;
    if (met) {
      // Its sticker picture in the well (bottom-centre anchored art, so drop it to the well's foot).
      const st = staticArt(scene, NAMED_PACK, m.sticker);
      const pics = addStatic(scene, NAMED_PACK, m.sticker, wellX, wellY + (st ? st.anchor[1] - st.frameHeight / 2 : 0));
      pics.forEach((p) => p.setScale(Math.min(1, well[2] / (st?.frameWidth ?? well[2]))));
      cards.add(pics);
      const [nx, ny, nw] = inCard(cx, cy, [138, 14, 304, 40]);
      cards.add(text(nx, ny, m.journal.name, 11, '#3a2a22', true, nw));
      fact(cx, cy, m.journal.fact, '#3a2a22', false);
      if (e.beaten) {
        const [sx, sy, sw, sh] = inCard(cx, cy, [250, 74, 304, 128]);
        cards.add(addStatic(scene, NAMED_PACK, 'journal-stamp', sx + sw / 2, sy + sh / 2));
      }
    } else {
      cards.add(addStatic(scene, NAMED_PACK, `journal-silhouette-${m.baseEnemy}`, wellX, wellY));
      fact(cx, cy, CONTENT.named.journalUnknown.fact, '#6b5440', true);
    }
  });

  // Monster kinds, three to a page.
  const kinds = journalKinds(CONTENT, trophies);
  const drawKinds = (from: number) =>
    kinds.slice(from, from + CARD_YS.length).forEach((kd, i) => {
      const cx = left + CARD_X * k;
      const cy = top + CARD_YS[i] * k;
      cards.add(addStatic(scene, NAMED_PACK, kd.met ? 'journal-card-met' : 'journal-card-unmet', cx + cw / 2, cy + ch / 2));
      const well = inCard(cx, cy, [10, 10, 126, 126]);
      const wellX = well[0] + well[2] / 2;
      const wellY = well[1] + well[3] / 2;
      const def = kd.trophy;
      if (kd.met && def.art) {
        // Its trophy picture in the well.
        const st = staticArt(scene, def.art, def.id);
        const pics = addStatic(scene, def.art, def.id, wellX, wellY + (st ? st.anchor[1] - st.frameHeight / 2 : 0));
        pics.forEach((p) => p.setScale(Math.min(1, well[2] / (st?.frameWidth ?? well[2]), well[3] / (st?.frameHeight ?? well[3]))));
        cards.add(pics);
      } else if (!kd.met && def.silhouette && staticArt(scene, NAMED_PACK, def.silhouette)) {
        cards.add(addStatic(scene, NAMED_PACK, def.silhouette, wellX, wellY));
      } else if (!kd.met) {
        cards.add(text(wellX, wellY, CONTENT.named.journalUnknown.name, 28, '#6b5440', true).setOrigin(0.5));
      }
      if (kd.met) {
        const [nx, ny, nw] = inCard(cx, cy, [138, 14, 304, 40]);
        cards.add(text(nx, ny, CONTENT.enemies[kd.monster]?.shortName ?? def.name, 11, '#3a2a22', true, nw));
        fact(cx, cy, def.description ?? '', '#3a2a22', false);
        const [sx, sy, sw, sh] = inCard(cx, cy, [250, 74, 304, 128]);
        cards.add(addStatic(scene, NAMED_PACK, 'journal-stamp', sx + sw / 2, sy + sh / 2));
      } else {
        fact(cx, cy, CONTENT.named.journalUnknown.fact, '#6b5440', true);
      }
    });

  const pages: Array<() => void> = [drawNamed];
  for (let from = 0; from < kinds.length; from += CARD_YS.length) pages.push(() => drawKinds(from));
  let shown = 0;
  const turn = (to: number) => {
    shown = (to + pages.length) % pages.length;
    cards.removeAll(true);
    notes.removeAll(true);
    subtitle.setText(shown === 0 ? (CONTENT.named.tierNames[String(tier)] ?? '') : '');
    pages[shown]();
  };
  turn(0);

  // Big page-turn arrows at the page's bottom corners.
  const ay = height / 2 + (ph / 2) * scale - 22;
  const arrow = (x: number, label: string, step: number) => {
    const c = scene.add.circle(x, ay, 20, 0x3a3a4a).setStrokeStyle(2, 0xffffff, 0.5).setInteractive();
    c.on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, () => turn(shown + step));
    box.add([c, scene.add.text(x, ay, label, { fontFamily: FONT, fontStyle: 'bold', fontSize: '20px', color: '#ffffff' }).setOrigin(0.5).setResolution(crisp())]);
  };
  arrow(pageX - (pw / 2) * scale - (side ? 0 : -22), '‹', -1);
  arrow(pageX + (pw / 2) * scale + (side ? 0 : -22), '›', 1);

  // A big, easy close button.
  const bx = side ? Math.min(width - 22, noteX + noteW) : pageX + (pw / 2) * scale - 4;
  const by = height / 2 - (ph / 2) * scale + 4;
  const btn = scene.add.circle(bx, by, 18, 0x3a3a4a).setStrokeStyle(2, 0xffffff, 0.5).setInteractive();
  btn.on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, close);
  box.add([btn, scene.add.text(bx, by, '✕', { fontFamily: FONT, fontStyle: 'bold', fontSize: '18px', color: '#ffffff' }).setOrigin(0.5).setResolution(crisp())]);
  return box;
}
