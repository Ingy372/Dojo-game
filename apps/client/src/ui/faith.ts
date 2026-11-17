// LP-B2 (L5): the faith layer on screen: the FAITH DOES banner, the Faith page (banner, Creed
// Scroll, the verse scrolls found so far) and the verse screen of the promotion ceremony.
// Every word comes from the school's pack (content/faith/), as written.
import Phaser from 'phaser';
import PACK from '../../../../content/faith/action-zone.json';
import { bannerLetters, loadFaith, scrollsFound, verseText, type TrainingState, type VerseScroll } from '@dojo/sim';
import { button } from './button';
import { FONT, crisp } from './theme';
import { BOARD_PAPER, MIN_TAP, RADIUS, S2, TYPE } from './tokens';
import type { Box } from './pathScreen';

export const FAITH = loadFaith(PACK);

const GOLD = '#ffd166';
const DIM = '#5e5446';
const INK = '#3a2618';
const INK_SOFT = '#6b5440';

type Add = (o: Phaser.GameObjects.GameObject) => void;

function text(scene: Phaser.Scene, add: Add, x: number, y: number, s: string, size: number, color: string, bold = false, wrap?: number, serif = false): Phaser.GameObjects.Text {
  const t = scene.add
    .text(x, y, s, { fontFamily: serif ? 'Georgia, serif' : FONT, fontStyle: bold ? 'bold' : 'normal', fontSize: `${size}px`, color, align: 'center', wordWrap: wrap ? { width: wrap, useAdvancedWrap: true } : undefined, lineSpacing: 2 })
    .setResolution(crisp())
    .setOrigin(0.5, 0);
  add(t);
  return t;
}

/** Shrinks a text until it fits `h` (never below 11 pt). */
function fitH(t: Phaser.GameObjects.Text, h: number, size: number): number {
  let s = size;
  while (t.height > h && s > 11) t.setFontSize(--s);
  return t.height;
}

/** The FAITH DOES banner in the Path's top bar: lit letters in gold, the rest dim. One tap target. */
export function drawBanner(scene: Phaser.Scene, add: Add, b: Box, t: TrainingState, onTap: () => void): void {
  const g = scene.add.graphics();
  g.fillStyle(0x5a1e1e).fillRoundedRect(b.x, b.y, b.w, b.h, RADIUS.button).lineStyle(2, 0xc9973a).strokeRoundedRect(b.x + 1, b.y + 1, b.w - 2, b.h - 2, RADIUS.button);
  add(g);
  const lit = bannerLetters(FAITH, t);
  const glyphs = FAITH.faithDoesBanner.acrostic.split('');
  const cell = Math.min(24, (b.w - 12) / glyphs.length);
  const x0 = b.x + (b.w - cell * glyphs.length) / 2 + cell / 2;
  let li = 0;
  glyphs.forEach((ch, i) => {
    if (ch === ' ') return;
    const on = lit[li++]?.lit;
    text(scene, add, x0 + i * cell, b.y + b.h / 2 - 12, ch, 20, on ? GOLD : DIM, true, undefined, true).setName(`faith-letter-${ch}-${on ? 'lit' : 'dim'}`);
  });
  const hit = scene.add.zone(b.x, b.y, b.w, Math.max(b.h, MIN_TAP)).setOrigin(0).setInteractive({ useHandCursor: true });
  hit.on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, onTap);
  add(hit);
}

/** Paper with a column of lines, centred top to bottom; a line that would not fit is shrunk (never below 11 pt). */
function paper(scene: Phaser.Scene, add: Add, b: Box, lines: { s: string; size: number; color: string; bold?: boolean; serif?: boolean; gap?: number }[]): void {
  const g = scene.add.graphics();
  g.fillStyle(BOARD_PAPER).fillRoundedRect(b.x, b.y, b.w, b.h, RADIUS.panel).lineStyle(3, 0x8a6a3a).strokeRoundedRect(b.x, b.y, b.w, b.h, RADIUS.panel);
  add(g);
  const wrap = b.w - 32;
  const made = lines.map((l) => text(scene, add, b.x + b.w / 2, 0, l.s, l.size, l.color, l.bold, wrap, l.serif));
  const total = () => made.reduce((n, t, i) => n + t.height + (lines[i].gap ?? 6), 0);
  // Too tall: shrink the tallest line (the verse or the creed) a point at a time.
  while (total() > b.h - 20) {
    const big = made.reduce((m, t) => (t.height > m.height ? t : m));
    const size = parseInt(String(big.style.fontSize), 10);
    if (size <= 11) break;
    big.setFontSize(size - 1);
  }
  let y = b.y + Math.max(10, (b.h - total()) / 2);
  made.forEach((t, i) => {
    t.setY(y);
    y += t.height + (lines[i].gap ?? 6);
  });
}

/** A verse scroll: (found line), the verse and its reference, the covenant name large over its promise, (Sensei's question). */
export function drawScroll(scene: Phaser.Scene, add: Add, b: Box, v: VerseScroll, o: { found?: boolean; sensei?: boolean } = {}): void {
  paper(scene, add, b, [
    o.found ? { s: v.lines.found, size: TYPE.title, color: '#8a3a1a', bold: true, gap: 10 } : { s: v.name, size: TYPE.title, color: '#8a3a1a', bold: true, serif: true, gap: 10 },
    { s: verseText(v), size: 18, color: INK, serif: true, gap: 4 },
    { s: v.reference, size: TYPE.label, color: INK_SOFT, bold: true, gap: 12 },
    ...(v.covenant
      ? [
          { s: v.covenant.name, size: 26, color: '#1d4690', bold: true, serif: true, gap: 4 },
          { s: v.covenant.text, size: 15, color: INK, gap: 12 },
        ]
      : []),
    ...(o.sensei ? [{ s: v.lines.sensei, size: TYPE.body, color: '#277a56', bold: true }] : []),
  ]);
}

/** The Creed Scroll: the words the class says together, signed by Shihan. */
export function drawCreed(scene: Phaser.Scene, add: Add, b: Box, found = false): void {
  const c = FAITH.creedScroll;
  paper(scene, add, b, [
    found ? { s: c.lines.found, size: TYPE.title, color: '#8a3a1a', bold: true, gap: 8 } : { s: c.name, size: TYPE.title, color: '#8a3a1a', bold: true, serif: true, gap: 8 },
    { s: c.text, size: 15, color: INK, serif: true, gap: 6 },
    { s: c.signedBy, size: TYPE.label, color: INK_SOFT, bold: true, gap: 8 },
    ...(found ? [{ s: c.lines.sensei, size: TYPE.body, color: '#277a56', bold: true }] : []),
  ]);
}

/** The banner page: what FAITH DOES means, one cell per letter; lit letters show their word and meaning. */
function drawBannerPage(scene: Phaser.Scene, add: Add, b: Box, t: TrainingState): void {
  const lit = bannerLetters(FAITH, t);
  const all = lit.every((l) => l.lit);
  const head = text(scene, add, b.x + b.w / 2, b.y, all ? FAITH.faithDoesBanner.lines.complete : FAITH.faithDoesBanner.lines.description, TYPE.body, '#f2e9d8', true, b.w);
  const top = b.y + head.height + S2;
  const cols = 3;
  const rows = Math.ceil(lit.length / cols);
  const cw = (b.w - (cols - 1) * S2) / cols;
  const ch = (b.y + b.h - top - (rows - 1) * S2) / rows;
  lit.forEach(({ letter, lit: on }, i) => {
    const x = b.x + (i % cols) * (cw + S2);
    const y = top + Math.floor(i / cols) * (ch + S2);
    const g = scene.add.graphics();
    g.fillStyle(on ? 0x3a2a1e : 0x26221c).fillRoundedRect(x, y, cw, ch, RADIUS.button).lineStyle(2, on ? 0xc9973a : 0x3a342a).strokeRoundedRect(x, y, cw, ch, RADIUS.button);
    add(g);
    const big = ch >= 70;
    text(scene, add, x + 22, y + (big ? 8 : 4), letter.letter, big ? 26 : 20, on ? GOLD : DIM, true, undefined, true);
    if (!on) return;
    text(scene, add, x + 40 + (cw - 48) / 2, y + 6, letter.word, TYPE.body, GOLD, true, cw - 48);
    const m = text(scene, add, x + 40 + (cw - 48) / 2, y + 6 + TYPE.body + 6, letter.meaning, TYPE.label, '#f2e9d8', false, cw - 48);
    fitH(m, ch - TYPE.body - 16, TYPE.label);
  });
}

/** The pages of the Faith page: the banner, the Creed Scroll, then each verse scroll found so far. */
export function faithPages(t: TrainingState): ({ kind: 'banner' } | { kind: 'creed' } | { kind: 'scroll'; scroll: VerseScroll })[] {
  return [{ kind: 'banner' }, { kind: 'creed' }, ...scrollsFound(FAITH, t).map((scroll) => ({ kind: 'scroll' as const, scroll }))];
}

/** L10-B: the Faith tab of the Book: ◀ ▶ and page dots on top, the page below, inside area. */
export function drawFaithPage(scene: Phaser.Scene, add: Add, area: Box, t: TrainingState, page: number, onPage: (p: number) => void): void {
  const pages = faithPages(t);
  const p = Math.max(0, Math.min(page, pages.length - 1));
  const box = scene.add.container(0, 0);
  add(box);
  const arrows = (dx: number, label: string, to: number, on: boolean) =>
    button(scene, { x: area.x + area.w - (dx + 1) * MIN_TAP - dx * S2, y: area.y, w: MIN_TAP, h: MIN_TAP, label, color: 0x3a3a4a, size: TYPE.title, disabled: !on, onTap: () => onPage(to) }, box);
  arrows(1, '◀', p - 1, p > 0);
  arrows(0, '▶', p + 1, p < pages.length - 1);
  const dotsL = area.x;
  const dotsR = area.x + area.w - 2 * MIN_TAP - 2 * S2;
  const step = Math.min(18, (dotsR - dotsL) / pages.length);
  const d0 = (dotsL + dotsR) / 2 - (step * (pages.length - 1)) / 2;
  const dots = scene.add.graphics();
  pages.forEach((_, i) => dots.fillStyle(i === p ? 0xffd166 : 0x5e5446).fillCircle(d0 + i * step, area.y + MIN_TAP / 2, i === p ? 5 : 4));
  box.add(dots);
  const body: Box = { x: area.x + 12, y: area.y + MIN_TAP + S2, w: area.w - 24, h: area.h - MIN_TAP - S2 };
  const pg = pages[p];
  const put: Add = (o) => box.add(o);
  if (pg.kind === 'banner') drawBannerPage(scene, put, body, t);
  else if (pg.kind === 'creed') drawCreed(scene, put, body);
  else drawScroll(scene, put, body, pg.scroll);
}
