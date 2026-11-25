// Chapter 1's ending (Story Chapters, Nov 24): after the tutorial Keeper falls, a piece of the light pops out,
// the Masked Shade drops in, takes it ("You're not ready.") and vanishes in smoke. About 11 seconds, Skip any time.
// Played in the Keep with the room still on screen. Words in content/tutorial/chapters.json (ch1End).
import Phaser from 'phaser';
import { sfx } from '../audio/Sfx';
import { reducedMotion } from '../game/motion';
import { cutsceneFrame } from './cutscene';
import { lightShard } from './introCutscene';
import { addMaskedShade, smokePuff } from './maskedShade';
import STORY from '../../../../content/tutorial/chapters.json';

export interface ChapterOneEndHost {
  scene: Phaser.Scene;
  /** Tile size in pixels. */
  tile: number;
  /** The hero's feet in world pixels. */
  hero: { x: number; y: number };
  /** Adds a world object (so the HUD camera ignores it). */
  addWorld(o: Phaser.GameObjects.GameObject): void;
  /** Adds a screen object (so the world camera ignores it). */
  addScreen(o: Phaser.GameObjects.GameObject): void;
  done(): void;
}

export function playChapterOneEnd(h: ChapterOneEndHost): void {
  const s = h.scene;
  const T = h.tile;
  const still = reducedMotion();
  const L = STORY.ch1End;
  const bits: Phaser.GameObjects.GameObject[] = [];
  const world = <O extends Phaser.GameObjects.GameObject>(o: O): O => {
    h.addWorld(o);
    bits.push(o);
    return o;
  };
  const f = cutsceneFrame(
    s,
    () => {
      for (const b of bits) b.destroy();
      h.done();
    },
    { fadeOut: false },
  );
  h.addScreen(f.ui);

  // The middle of what the player sees (the hero may stand near a wall), a little above centre.
  const view = s.cameras.main.worldView;
  const spot = { x: view.centerX, y: view.centerY - T * 0.6 };
  const shard = world(lightShard(s, T));
  shard.setPosition(spot.x, spot.y).setAlpha(0).setScale(0.2);

  f.at(300, () => {
    sfx.tap();
    s.tweens.add({ targets: shard, alpha: 1, scale: 1.4, duration: still ? 10 : 600, ease: 'Back.Out' });
    f.say(L.shard);
  });
  const shade = world(addMaskedShade(s, T));
  shade.setPosition(spot.x + T * 2.2, spot.y - T * 7).setDepth(1e6).setAlpha(0);
  f.at(2300, () => {
    f.say(L.who);
    shade.setAlpha(1);
    s.tweens.add({
      targets: shade,
      y: spot.y - T * 0.2,
      duration: still ? 10 : 650,
      ease: 'Quad.In',
      onComplete: () => {
        smokePuff(s, null, shade.x, shade.y, T, (o) => world(o));
        if (!still) s.cameras.main.shake(180, 0.004);
      },
    });
  });
  f.at(4300, () => f.say(`“${L.taunt}”`));
  f.at(5600, () => {
    f.hush();
    s.tweens.add({ targets: shade, x: spot.x + T * 0.5, duration: still ? 10 : 450, ease: 'Sine.InOut' });
    s.tweens.add({ targets: shard, x: spot.x + T * 0.5, y: spot.y - T * 0.9, scale: 0.9, duration: still ? 10 : 600, delay: still ? 0 : 400 });
  });
  f.at(6900, () => {
    sfx.doors();
    smokePuff(s, null, shade.x, shade.y, T, (o) => world(o));
    s.tweens.add({ targets: [shade, shard], alpha: 0, duration: still ? 10 : 250 });
  });
  f.at(7700, () => f.say(L.gone));
  f.at(9700, () => f.say(L.senseiAfter));
  f.at(11700, () => f.finish());
}
