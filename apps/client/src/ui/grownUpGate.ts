// The grown-up gate: "what is a + b?" with 4 choices. Shared by the play-time setting
// and every outside link (B-SAFE), so nothing leaves the game without a grown-up.

import Phaser from 'phaser';
import { makeGateQuestion } from '@dojo/sim';
import { PLAY_TIME_TEXT } from '../game/playTime';
import { FONT, crisp, view } from './theme';

/** Shows the gate. A right answer runs `pass`; a wrong answer or Back runs `leave`. */
export function showGrownUpGate(scene: Phaser.Scene, pass: () => void, leave: () => void, depth = 70): void {
  const pt = PLAY_TIME_TEXT;
  const q = makeGateQuestion(Math.random);
  const { width, height } = view(scene);
  const box = scene.add.container(0, 0).setDepth(depth);
  box.add(scene.add.rectangle(0, 0, width, height, 0x0a0810, 0.96).setOrigin(0).setInteractive());
  const out = (then: () => void) => {
    box.destroy();
    then();
  };
  box.add(scene.add.text(width / 2, height * 0.2, pt.gateText.replace('{a}', String(q.a)).replace('{b}', String(q.b)), { fontFamily: FONT, fontStyle: 'bold', fontSize: '20px', color: '#ffd166' }).setOrigin(0.5, 0).setResolution(crisp()));
  const bw = 84;
  const gap = 12;
  const bh = 48;
  const by = height * 0.2 + 56;
  const x0 = width / 2 - (q.choices.length * bw + (q.choices.length - 1) * gap) / 2;
  q.choices.forEach((n, i) => {
    const x = x0 + i * (bw + gap);
    const bg = scene.add.rectangle(x, by, bw, bh, 0x2a2536).setOrigin(0).setStrokeStyle(2, 0xffffff, 0.35).setInteractive();
    box.add([bg, scene.add.text(x + bw / 2, by + bh / 2, String(n), { fontFamily: FONT, fontStyle: 'bold', fontSize: '20px', color: '#ffffff' }).setOrigin(0.5).setResolution(crisp())]);
    bg.on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, () => out(n === q.answer ? pass : leave));
  });
  const cw = 120;
  const cy = by + bh + 24;
  const cancel = scene.add.rectangle(width / 2 - cw / 2, cy, cw, 38, 0x4a4a55).setOrigin(0).setStrokeStyle(2, 0xffffff, 0.35).setInteractive();
  box.add([cancel, scene.add.text(width / 2, cy + 19, pt.gateCancel, { fontFamily: FONT, fontStyle: 'bold', fontSize: '15px', color: '#ffffff' }).setOrigin(0.5).setResolution(crisp())]);
  cancel.on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, () => out(leave));
}

/** The only way to open a page outside the game: the gate question first, then a new tab. */
export function openOutsideLink(scene: Phaser.Scene, url: string, back: () => void = () => {}): void {
  showGrownUpGate(scene, () => {
    window.open(url, '_blank', 'noopener');
    back();
  }, back, 120);
}
