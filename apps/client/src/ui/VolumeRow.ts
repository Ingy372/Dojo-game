// M7-P8: one Settings row, "Music  −  ■■■□□  +". Steps 0..5; each press saves at once.
import Phaser from 'phaser';
import { nudgeVolume, VOLUME_STEPS } from '@dojo/sim';
import { sfx } from '../audio/Sfx';
import { AUDIO_TEXT, loadVolume, saveVolume, type Channel } from '../audio/volume';
import { FONT, MIN_TAP, crisp } from './theme';
import { buttonFace } from './button';

export function addVolumeRow(scene: Phaser.Scene, box: Phaser.GameObjects.Container, ch: Channel, x: number, y: number, w: number, h: number, onChange: (step: number) => void): void {
  let step = loadVolume(ch);
  const labelW = Math.min(64, w * 0.3);
  const bw = Math.max(MIN_TAP, Math.min(48, (w - labelW) * 0.28));
  box.add(scene.add.text(x, y + h / 2, AUDIO_TEXT[ch].label, { fontFamily: FONT, fontStyle: 'bold', fontSize: '14px', color: '#ffffff' }).setOrigin(0, 0.5).setResolution(crisp()));
  const minusX = x + labelW;
  const plusX = x + w - bw;
  const pipsX = minusX + bw + 6;
  const pipsW = plusX - 6 - pipsX;
  const pipGap = 3;
  const pipW = Math.max(4, (pipsW - pipGap * (VOLUME_STEPS - 1)) / VOLUME_STEPS);
  const pips = Array.from({ length: VOLUME_STEPS }, (_, i) => {
    const pip = scene.add.rectangle(pipsX + i * (pipW + pipGap), y + h / 2, pipW, h * 0.5, 0xffd166).setOrigin(0, 0.5);
    box.add(pip);
    return pip;
  });
  const show = () => pips.forEach((p, i) => p.setFillStyle(i < step ? 0xffd166 : 0x4a4458));
  show();
  const button = (bx: number, text: string, delta: -1 | 1) => {
    const face = buttonFace(scene, bx, y, bw, h, 0x2e6ae0);
    const bg = scene.add.rectangle(bx, y, bw, h, 0xffffff, 0).setOrigin(0).setInteractive();
    const t = scene.add.text(bx + bw / 2, y + h / 2 - 1, text, { fontFamily: FONT, fontStyle: 'bold', fontSize: '22px', color: '#ffffff' }).setOrigin(0.5).setResolution(crisp());
    box.add([face, bg, t]);
    bg.on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, () => {
      sfx.unlock();
      step = nudgeVolume(step, delta);
      saveVolume(ch, step);
      show();
      onChange(step);
    });
  };
  button(minusX, AUDIO_TEXT.down, -1);
  button(plusX, AUDIO_TEXT.up, 1);
}
