import Phaser from 'phaser';

/**
 * MOTION TEST (Jay, Nov 26): a Tower room that never looks frozen. Soft shafts of light from the top wall that
 * slowly breathe, glowing specks of the shattered light drifting up, and low mist creeping across the floor.
 * All drawn in code, kept faint so the red warning circles always read first, and few enough for a phone.
 * With reduced motion the light shafts stay still and nothing drifts.
 */
export function addRoomLife(scene: Phaser.Scene, widthPx: number, heightPx: number, tile: number, still: boolean): Phaser.GameObjects.GameObject[] {
  const out: Phaser.GameObjects.GameObject[] = [];
  const own = <T extends Phaser.GameObjects.GameObject>(o: T): T => {
    o.once(Phaser.GameObjects.Events.DESTROY, () => scene.tweens.killTweensOf(o));
    out.push(o);
    return o;
  };

  if (!scene.textures.exists('mt-dot')) {
    const g = scene.make.graphics({ x: 0, y: 0 }, false);
    for (let r = 16; r > 0; r--) g.fillStyle(0xffffff, (1 - r / 16) * 0.22).fillCircle(16, 16, r);
    g.generateTexture('mt-dot', 32, 32);
    g.destroy();
  }

  // Light shafts: wide slanted bands from the top wall, each breathing on its own slow clock.
  const shafts = Math.max(2, Math.round(widthPx / (tile * 4)));
  for (let i = 0; i < shafts; i++) {
    const x = ((i + 0.5) / shafts) * widthPx + (i % 2 ? tile * 0.4 : -tile * 0.3);
    const w = tile * (0.9 + (i % 3) * 0.3);
    const g = own(scene.add.graphics().setDepth(0.7).setBlendMode(Phaser.BlendModes.ADD));
    const len = heightPx * 0.85;
    const slant = tile * 1.6;
    g.fillStyle(0xfff1c8, 0.07);
    g.fillPoints([new Phaser.Math.Vector2(x, tile * 0.9), new Phaser.Math.Vector2(x + w, tile * 0.9), new Phaser.Math.Vector2(x + w + slant, len), new Phaser.Math.Vector2(x + slant - w * 0.4, len)], true);
    g.fillStyle(0xfff1c8, 0.05);
    g.fillPoints([new Phaser.Math.Vector2(x + w * 0.25, tile * 0.9), new Phaser.Math.Vector2(x + w * 0.75, tile * 0.9), new Phaser.Math.Vector2(x + w * 0.75 + slant, len), new Phaser.Math.Vector2(x + slant + w * 0.05, len)], true);
    if (!still) scene.tweens.add({ targets: g, alpha: { from: 0.55, to: 1 }, duration: 2600 + i * 700, yoyo: true, repeat: -1, ease: 'Sine.InOut', delay: i * 400 });
  }
  if (still) return out;

  // Low mist: a few big faint puffs sliding slowly across the floor and back.
  for (let i = 0; i < 5; i++) {
    const m = own(scene.add.image(Math.random() * widthPx, tile * 1.5 + Math.random() * (heightPx - tile * 2.5), 'mt-dot'));
    m.setDepth(0.8).setScale(6 + Math.random() * 3, 2.2 + Math.random() * 1).setAlpha(0.2).setTint(0xdfe8ff);
    scene.tweens.add({ targets: m, x: m.x + (Math.random() < 0.5 ? -1 : 1) * tile * (2 + Math.random() * 2), alpha: { from: 0.08, to: 0.25 }, duration: 7000 + Math.random() * 5000, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
  }

  // Specks of light drifting up, fading in and out, then starting again somewhere else.
  const count = Math.min(26, Math.round((widthPx * heightPx) / (tile * tile * 4)));
  for (let i = 0; i < count; i++) {
    const s = own(scene.add.image(0, 0, 'mt-dot').setDepth(8.4).setBlendMode(Phaser.BlendModes.ADD).setTint(i % 3 ? 0xffe6a0 : 0xbfe4ff));
    const drift = () => {
      s.setPosition(tile + Math.random() * (widthPx - tile * 2), tile * 1.5 + Math.random() * (heightPx - tile * 2));
      s.setScale(0.35 + Math.random() * 0.5).setAlpha(0);
      const life = 3500 + Math.random() * 3500;
      scene.tweens.add({ targets: s, y: s.y - tile * (0.8 + Math.random() * 1.2), x: s.x + (Math.random() - 0.5) * tile, duration: life, ease: 'Sine.Out', onComplete: () => s.active && drift() });
      scene.tweens.add({ targets: s, alpha: { from: 0, to: 0.95 }, duration: life / 2, yoyo: true, ease: 'Sine.InOut' });
    };
    scene.time.delayedCall(Math.random() * 4000, () => s.active && drift());
  }
  return out;
}
