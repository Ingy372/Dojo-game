// Chest v2: the treasure chest's prize reveal (rays, the icon, confetti, the rarity said big). Moved out of
// GameScene.ts (Nov 24 night) with no change to what it shows; the fight passes in its ring and what to do on close.
import Phaser from 'phaser';
import { rarityRank, type GearItem } from '@dojo/sim';
import { addGearIcon } from '../art/gearIcons';
import { sfx } from '../audio/Sfx';
import { reducedMotion } from '../game/motion';
import { FONT, RARITY_COLOR, rarityName, crisp, css, view } from './theme';

/** The gold of the fight's highlights (GameScene's COLORS.gold). */
const GOLD = 0xffd166;

export interface ChestRevealHooks {
  /** A ring in the prize's colour where the chest stood (in the world). */
  ring: (color: number) => void;
  /** The reveal is gone (tapped or timed out): give the controls back. */
  onClose: () => void;
}

/**
 * Chest v2 (Jay, Nov 18: a little dopamine boost): the chest's prize in the middle of the screen. Light rays
 * in its rarity color turn behind it, the icon pops in with a bounce, confetti flies, and the rarity is said
 * big. Rarer prizes get more rays and confetti. Tap (or wait) to keep it. Smaller and shorter than a real
 * promotion's celebration, which always stays the biggest moment.
 */
export function showChestReveal(scene: Phaser.Scene, item: GearItem, opts: ChestRevealHooks): void {
  const { name, rarity } = item;
  const rank = rarityRank(rarity);
  // A plain prize still shines: gold light and "NEW GEAR!" instead of a grey "Everyday".
  const color = rank === 0 ? GOLD : RARITY_COLOR[rarity];
  const still = reducedMotion();
  sfx.loot(rank);
  const { width, height } = view(scene);
  const cx = width / 2;
  const cy = height * 0.4;
  const shade = scene.add.rectangle(0, 0, width, height, 0x0a0810, 0.6).setOrigin(0).setInteractive();
  const rays = scene.add.graphics({ x: cx, y: cy });
  const count = 10 + rank * 2;
  const reach = Math.min(width, height) * 0.62;
  for (let i = 0; i < count; i++) {
    const a = (i / count) * Math.PI * 2;
    const b = a + Math.PI / count;
    rays.fillStyle(i % 2 ? 0xffffff : color, i % 2 ? 0.1 : 0.32);
    rays.fillTriangle(0, 0, Math.cos(a) * reach, Math.sin(a) * reach, Math.cos(b) * reach, Math.sin(b) * reach);
  }
  const glow = scene.add.circle(cx, cy, 64, color, 0.45);
  const disc = scene.add.circle(cx, cy, 52, 0x1b1530, 1).setStrokeStyle(5, color, 1);
  const icon = addGearIcon(scene, item, cx, cy, 96);
  const title = scene.add
    .text(cx, cy + 66, rank === 0 ? 'NEW GEAR!' : `${rarityName(rarity).toUpperCase()}!`, { fontFamily: FONT, fontStyle: 'bold', fontSize: width < 720 ? '30px' : '36px', color: css(color), stroke: '#14121c', strokeThickness: 7 })
    .setOrigin(0.5, 0)
    .setResolution(crisp());
  const label = scene.add
    .text(cx, title.y + title.height, name, { fontFamily: FONT, fontStyle: 'bold', fontSize: '19px', color: '#ffffff', stroke: '#14121c', strokeThickness: 5 })
    .setOrigin(0.5, 0)
    .setResolution(crisp());
  const hint = scene.add.text(cx, label.y + label.height + 6, 'Tap to keep it!', { fontFamily: FONT, fontSize: '15px', color: '#ffd166' }).setOrigin(0.5, 0).setResolution(crisp()).setAlpha(0);
  const parts: Phaser.GameObjects.GameObject[] = [shade, rays, glow, disc, ...(icon ? [icon] : []), title, label, hint];
  const layer = scene.add.container(0, 0, parts).setDepth(60);
  scene.cameras.main.ignore(layer);
  shade.setAlpha(0);
  scene.tweens.add({ targets: shade, alpha: 1, duration: 180 });
  if (!still) {
    rays.setScale(0.2).setAlpha(0);
    scene.tweens.add({ targets: rays, scale: 1, alpha: 1, duration: 380, ease: 'Back.Out' });
    scene.tweens.add({ targets: rays, angle: 360, duration: 9000, repeat: -1 });
    scene.tweens.add({ targets: glow, scale: 1.25, alpha: 0.2, duration: 650, yoyo: true, repeat: -1 });
    for (const o of [disc, ...(icon ? [icon] : [])] as Phaser.GameObjects.Image[]) {
      const sx = o.scaleX;
      o.setScale(0);
      scene.tweens.add({ targets: o, scale: sx, duration: 420, delay: 80, ease: 'Back.Out', easeParams: [2.4] });
    }
  }
  [title, label].forEach((t, i) => {
    t.setAlpha(0);
    scene.tweens.add({ targets: t, alpha: 1, y: { from: t.y + 18, to: t.y }, duration: 260, delay: 260 + i * 120, ease: 'Back.Out' });
  });
  scene.tweens.add({ targets: hint, alpha: 1, delay: 900, duration: 300 });
  // Confetti: rarity color, gold and white bits burst out, then drift down.
  if (!still) {
    const bits = 22 + rank * 8;
    const palette = [color, GOLD, 0xffffff];
    for (let i = 0; i < bits; i++) {
      const piece = scene.add.rectangle(cx, cy, 6 + (i % 3) * 2, 10 + (i % 2) * 4, palette[i % 3]).setAngle(i * 37);
      layer.add(piece);
      const a = (i / bits) * Math.PI * 2 + Math.random() * 0.4;
      const r = reach * (0.45 + Math.random() * 0.55);
      const x = cx + Math.cos(a) * r;
      const y = cy + Math.sin(a) * r * 0.7;
      scene.tweens.add({ targets: piece, x, y, angle: piece.angle + 360, duration: 520, ease: 'Cubic.Out' });
      scene.tweens.add({ targets: piece, y: y + height * 0.35, alpha: 0, angle: piece.angle + 720, delay: 520, duration: 1400, ease: 'Quad.In' });
    }
  }
  opts.ring(color);
  let closed = false;
  const close = () => {
    if (closed) return;
    closed = true;
    sfx.tap();
    scene.tweens.add({ targets: layer, alpha: 0, duration: 220, onComplete: () => layer.destroy() });
    opts.onClose();
  };
  scene.time.delayedCall(350, () => shade.once('pointerup', close));
  scene.time.delayedCall(4200, close);
}
