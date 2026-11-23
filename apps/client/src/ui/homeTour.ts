import Phaser from 'phaser';
import { reducedMotion } from '../game/motion';
import { button } from './button';
import { FONT, MIN_TAP, crisp, view } from './theme';
import TOUR_JSON from '../../../../content/dojo/action-zone/home-tour.json';

/**
 * The Home Tour (Jay, Nov 18): after the tutorial's Floor Keeper, Sensei walks the student round their
 * Home Dojo, out into the town and back to the training station. The words live in
 * content/dojo/action-zone/home-tour.json (drafts until Jay approves them). This file holds the two
 * pieces every stop uses: Sensei's speech bubble and the glowing spot that says "walk here".
 */
export const TOUR = TOUR_JSON as {
  floorCleared: string;
  dojo: string[];
  station: string;
  toTown: string;
  town: string;
  realDojo: string;
  goHome: string;
  toStation: string;
  boardOpen: string;
  next: string;
  ok: string;
};

/** Fills {player} and {dojo} in a tour line. */
export function tourLine(line: string, vars: { player?: string; dojo?: string } = {}): string {
  return line.replace('{player}', vars.player ?? '').replace('{dojo}', vars.dojo ?? '');
}

/** Top of the bubble: under the scene's top bar. */
const BUBBLE_TOP = 56;

/**
 * Sensei's bubble: a dark rounded box near the top of the screen with a gold "Sensei" tab and one line.
 * With `onNext`, a button closes it; without, it stays until the scene destroys it (a "walk there" stop).
 */
export function senseiBubble(scene: Phaser.Scene, line: string, onNext?: () => void, buttonLabel = TOUR.next, at: 'top' | 'bottom' = 'top'): Phaser.GameObjects.Container {
  const { width, height } = view(scene);
  const w = Math.min(520, width - 32);
  const box = scene.add.container(0, 0).setDepth(65);
  const text = scene.add
    .text(width / 2, 0, line, { fontFamily: FONT, fontStyle: 'bold', fontSize: width < 720 ? '17px' : '19px', color: '#fff6e0', align: 'center', wordWrap: { width: w - 36, useAdvancedWrap: true }, lineSpacing: 3 })
    .setOrigin(0.5, 0)
    .setResolution(crisp());
  const pad = 14;
  const btnH = onNext ? MIN_TAP + 8 : 0;
  const h = text.height + pad * 2 + 8 + btnH;
  const x = width / 2 - w / 2;
  const y = at === 'top' ? BUBBLE_TOP : height - h - 14;
  const g = scene.add.graphics();
  g.fillStyle(0x000000, 0.35).fillRoundedRect(x + 2, y + 5, w, h, 16);
  g.fillStyle(0x1b2a7a, 0.96).fillRoundedRect(x, y, w, h, 16);
  g.lineStyle(3, 0xffd166, 1).strokeRoundedRect(x, y, w, h, 16);
  // The name tab.
  const tab = scene.add.text(x + 18, y, 'Sensei', { fontFamily: 'Georgia, serif', fontStyle: 'bold', fontSize: '15px', color: '#16206b', backgroundColor: '#ffd166', padding: { x: 10, y: 3 } }).setOrigin(0, 0.5).setResolution(crisp());
  text.setY(y + pad + 6);
  box.add([g, tab, text]);
  if (onNext) {
    const bw = 130;
    button(scene, { x: width / 2 - bw / 2, y: y + h - btnH - 4, w: bw, h: MIN_TAP, label: buttonLabel, color: 0xffb01f, size: 17, onTap: () => {
      box.destroy();
      onNext();
    } }, box);
  }
  box.setAlpha(0);
  scene.tweens.add({ targets: box, alpha: 1, duration: 180 });
  return box;
}

/**
 * The glowing "walk here" spot: a gold ring on the floor that breathes and a bouncing arrow above it.
 * Drawn at (x, y) in the parent's space; `r` is the ring's radius. Reduced motion keeps it still.
 */
export function tourGlow(scene: Phaser.Scene, x: number, y: number, r: number, opts: { shortArrow?: boolean } = {}): Phaser.GameObjects.Container {
  const c = scene.add.container(x, y);
  const ring = scene.add.graphics();
  ring.fillStyle(0xffd166, 0.18).fillEllipse(0, 0, r * 2.2, r * 1.2);
  ring.lineStyle(4, 0xffd166, 0.95).strokeEllipse(0, 0, r * 2.2, r * 1.2);
  ring.lineStyle(2, 0xffffff, 0.7).strokeEllipse(0, 0, r * 1.5, r * 0.8);
  const arrow = scene.add.graphics();
  // Playtest Nov 22: in the town the full arrow covered the door's "My Dojo" sign; `shortArrow` keeps it below the sign.
  const k = opts.shortArrow ? 0.62 : 1;
  const top = (v: number) => -r * (1.25 + (v - 1.25) * k);
  arrow.fillStyle(0x0d1233, 0.6).fillTriangle(-17, top(2.05), 17, top(2.05), 0, -r * 1.25);
  arrow.fillStyle(0xffd166, 1).fillTriangle(-14, top(2.1), 14, top(2.1), 0, -r * 1.35);
  arrow.fillRoundedRect(-6, top(2.75), 12, top(2.1) - top(2.75), 4);
  c.add([ring, arrow]);
  if (!reducedMotion()) {
    scene.tweens.add({ targets: ring, scaleX: 1.12, scaleY: 1.12, alpha: 0.7, duration: 650, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    scene.tweens.add({ targets: arrow, y: opts.shortArrow ? -5 : -10, duration: 420, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
  }
  return c;
}
