// The grown-up gate: "type the answer to forty-seven plus twenty-six" on a number pad (Grok playtest Nov 23, P2:
// the old four choices could be guessed). Shared by the play-time setting and every outside link (B-SAFE), so
// nothing leaves the game without a grown-up.

import Phaser from 'phaser';
import { makeGateQuestion } from '@dojo/sim';
import { PLAY_TIME_TEXT } from '../game/playTime';
import { FONT, crisp, view } from './theme';
import { button } from './button';

/** Shows the gate. A right answer runs `pass`; a wrong answer or Back runs `leave`. */
export function showGrownUpGate(scene: Phaser.Scene, pass: () => void, leave: () => void, depth = 70): void {
  const pt = PLAY_TIME_TEXT;
  const q = makeGateQuestion(Math.random);
  const digits = String(q.answer).length;
  const { width, height } = view(scene);
  const box = scene.add.container(0, 0).setDepth(depth);
  box.add(scene.add.rectangle(0, 0, width, height, 0x0a0810, 0.96).setOrigin(0).setInteractive());
  const out = (then: () => void) => {
    box.destroy();
    then();
  };
  const top = Math.max(12, height * 0.08);
  const question = scene.add
    .text(width / 2, top, pt.gateText.replace('{a}', q.aWords).replace('{b}', q.bWords), { fontFamily: FONT, fontStyle: 'bold', fontSize: '19px', color: '#ffd166', align: 'center', wordWrap: { width: width - 40 } })
    .setOrigin(0.5, 0)
    .setResolution(crisp());
  box.add(question);
  // The typed answer, in boxes, one per digit.
  let typed = '';
  const slotW = 46;
  const slotY = question.y + question.height + 12;
  const slots = Array.from({ length: digits }, (_, i) => {
    const x = width / 2 - (digits * slotW + (digits - 1) * 8) / 2 + i * (slotW + 8);
    box.add(scene.add.rectangle(x, slotY, slotW, 48, 0x2a2536).setOrigin(0).setStrokeStyle(2, 0xffd166, 0.7));
    const t = scene.add.text(x + slotW / 2, slotY + 24, '', { fontFamily: FONT, fontStyle: 'bold', fontSize: '24px', color: '#ffffff' }).setOrigin(0.5).setResolution(crisp());
    box.add(t);
    return t;
  });
  const show = () => slots.forEach((t, i) => t.setText(typed[i] ?? ''));
  const press = (d: string) => {
    if (typed.length >= digits) return;
    typed += d;
    show();
    // The whole answer typed: check it straight away.
    if (typed.length === digits) scene.time.delayedCall(150, () => out(Number(typed) === q.answer ? pass : leave));
  };
  // Keypad: 1-5 on the first row, 6-0 on the second, then Clear and Back.
  const gap = 8;
  const bw = Math.min(64, (width - 40 - 4 * gap) / 5);
  const bh = 46;
  const padTop = slotY + 48 + 14;
  const x0 = width / 2 - (5 * bw + 4 * gap) / 2;
  ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'].forEach((d, i) => {
    const x = x0 + (i % 5) * (bw + gap);
    const y = padTop + Math.floor(i / 5) * (bh + gap);
    button(scene, { x, y, w: bw, h: bh, label: d, color: 0x2a2536, size: 20, onTap: () => press(d) }, box);
  });
  const cw = 120;
  const cy = padTop + 2 * (bh + gap) + 4;
  button(scene, { x: width / 2 - cw - 6, y: cy, w: cw, h: 44, label: pt.gateClear, color: 0x3a3a4a, size: 15, onTap: () => { typed = ''; show(); } }, box);
  button(scene, { x: width / 2 + 6, y: cy, w: cw, h: 44, label: pt.gateCancel, color: 0x4a4a55, size: 15, onTap: () => out(leave) }, box);
}

/** The only way to open a page outside the game: the gate question first, then a new tab. */
export function openOutsideLink(scene: Phaser.Scene, url: string, back: () => void = () => {}): void {
  showGrownUpGate(scene, () => {
    window.open(url, '_blank', 'noopener');
    back();
  }, back, 120);
}
