// The opening cutscene (Jay, Nov 23; storyboard approved): the town is bright and happy, the Tower's great light
// flickers and breaks, small Shades slip into the Tower, the colours fade, and the hero steps out of the dojo and
// walks off to find out what happened. Played in the real town with its own art; effects are drawn in code.
// About 25 seconds, Skip any time. Shades stay small and cute: nothing jumps at the player, nothing is frightening.
import Phaser from 'phaser';
import type { Vec2 } from '@dojo/sim';
import { characterArt } from '../art/art';
import { LayeredSprite } from '../art/LayeredSprite';
import { sfx } from '../audio/Sfx';
import { reducedMotion } from '../game/motion';
import { FONT, crisp } from './theme';
import { cutsceneFrame } from './cutscene';
import STORY from '../../../../content/tutorial/chapters.json';
import WORDS from '../../../../content/tutorial/intro-cutscene.json';

/** What the town lends the cutscene. */
export interface IntroHost {
  scene: Phaser.Scene;
  world: Phaser.GameObjects.Container;
  tile: number;
  /** Where the camera looks (tiles), and how many rows tall the view is. */
  look(p: Vec2, rows: number): void;
  heroVisible(on: boolean): void;
  placeHero(p: Vec2, face: Vec2): void;
  walkHero(path: Vec2[]): void;
  heroPos(): Vec2;
  /** The pretend kids training in the yard at the start. */
  kids: LayeredSprite[];
  /** The cutscene is over (or skipped): go on to the tutorial. */
  done(): void;
}

/** The Tower's light, at the top of the Tower in the town picture (tiles). */
const LIGHT: Vec2 = { x: 30.3, y: -7.6 };
const TOWER_DOOR: Vec2 = { x: 30.3, y: -1.6 };
const YARD: Vec2 = { x: 37.5, y: 6.4 };
const DOJO_DOOR: Vec2 = { x: 23, y: 10.35 };

export function playIntro(h: IntroHost): void {
  const s = h.scene;
  const T = h.tile;
  const still = reducedMotion();
  let over = false;
  const f = cutsceneFrame(s, () => {
    if (cm && fx) (fx as unknown as { clear(): void }).clear?.();
    h.done();
  }, { skipLabel: WORDS.skip });
  const at = f.at;
  const timers = { push: (t: Phaser.Time.TimerEvent) => f.keep(t) };
  const say = f.say;
  const hush = f.hush;
  const title = s.add
    .text(0, 0, WORDS.lines.title, { fontFamily: 'Georgia, serif', fontStyle: 'bold', fontSize: '46px', color: '#ffd166', stroke: '#120e22', strokeThickness: 7 })
    .setOrigin(0.5)
    .setResolution(crisp())
    .setAlpha(0);
  const subtitle = s.add
    .text(0, 0, WORDS.lines.subtitle, { fontFamily: FONT, fontStyle: 'bold', fontSize: '20px', color: '#fff6e0', stroke: '#120e22', strokeThickness: 4 })
    .setOrigin(0.5)
    .setResolution(crisp())
    .setAlpha(0);
  const fade = s.add.rectangle(0, 0, 10, 10, 0x2a3350, 0).setOrigin(0);
  f.ui.addAt(fade, 0);
  f.ui.add([title, subtitle]);
  f.onLayout((width, height) => {
    title.setPosition(width / 2, height * 0.38);
    subtitle.setPosition(width / 2, height * 0.38 + 44);
    fade.setSize(width, height);
  });

  // ---- world pieces: the Tower's light, petals, Shades
  const glowKey = 'intro-glow';
  if (!s.textures.exists(glowKey)) {
    const g = s.make.graphics({ x: 0, y: 0 }, false);
    for (let i = 24; i >= 1; i--) g.fillStyle(0xfff1b8, 0.05).fillCircle(64, 64, (i / 24) * 64);
    g.generateTexture(glowKey, 128, 128);
    g.destroy();
  }
  const light = s.add.image(LIGHT.x * T, LIGHT.y * T, glowKey).setScale(2.2).setDepth(-1e5).setBlendMode(Phaser.BlendModes.ADD);
  const core = s.add.circle(LIGHT.x * T, LIGHT.y * T, T * 0.35, 0xfff6d0, 0.9).setDepth(-1e5).setBlendMode(Phaser.BlendModes.ADD);
  h.world.add([light, core]);
  if (!still) s.tweens.add({ targets: light, scale: 2.5, duration: 1400, yoyo: true, repeat: -1, ease: 'Sine.InOut' });

  let petalsOn = true;
  const petals: Phaser.GameObjects.Ellipse[] = [];
  const petal = () => {
    if (!petalsOn || still || over) return;
    const cam = lookNow;
    const p = s.add.ellipse((cam.x + Phaser.Math.Between(-14, 14)) * T, (cam.y - 8) * T, 7, 5, 0xffb7d0, 0.9).setDepth(1e6);
    h.world.add(p);
    petals.push(p);
    s.tweens.add({ targets: p, y: p.y + T * 14, x: p.x + T * Phaser.Math.Between(-3, 3), angle: 360, duration: 6000, onComplete: () => p.destroy() });
  };
  const petalTimer = s.time.addEvent({ delay: 180, loop: true, callback: petal });

  // the kids train in the yard: punches and kicks, a little out of step
  h.kids.forEach((k, i) => {
    k.setDirection(0);
    const moves = ['jab', 'strike', 'counter'];
    timers.push(s.time.addEvent({ delay: 900 + i * 130, loop: true, callback: () => k.play(moves[(i + Math.floor(s.time.now / 900)) % 3], { restart: true }) }));
  });

  // the colour fade (WebGL: a colour matrix on the camera; Canvas: the overlay alone)
  const cam = s.cameras.main;
  const fx = (cam as unknown as { postFX?: { addColorMatrix(): { reset(): unknown; saturate(v: number, multiply?: boolean): unknown; brightness(v: number, multiply?: boolean): unknown } } }).postFX;
  const cm = fx ? fx.addColorMatrix() : null;
  const bleak = (k: number) => {
    if (cm) {
      cm.reset();
      cm.saturate(-0.65 * k);
      cm.brightness(1 - 0.18 * k, true);
    }
    fade.setFillStyle(0x2a3350, 0.18 * k);
  };

  // ---- the timeline
  let lookNow: Vec2 = YARD;
  const look = (p: Vec2, rows: number) => {
    lookNow = p;
    h.look(p, rows);
  };
  h.heroVisible(false);
  look(YARD, 7);
  at(600, () => say(WORDS.lines.safe));
  at(3800, () => {
    hush();
    look({ x: LIGHT.x, y: -2.2 }, 15);
  });
  at(5600, () => say(WORDS.lines.broke));
  // the light flickers... then breaks into sparks
  at(6000, () => {
    if (still) return;
    s.tweens.add({ targets: [light, core], alpha: 0.25, duration: 120, yoyo: true, repeat: 4 });
  });
  at(7300, () => {
    sfx.shieldBreak();
    cam.flash(still ? 0 : 260, 255, 250, 230);
    if (!still) cam.shake(320, 0.006);
    s.tweens.killTweensOf(light);
    s.tweens.add({ targets: light, alpha: 0.12, scale: 1.2, duration: 700 });
    s.tweens.add({ targets: core, alpha: 0.1, scale: 0.4, duration: 500 });
    // the town picture's own light is covered by a dim, cracked orb
    const orb = s.add.graphics().setDepth(-1e5 + 1);
    const ox = LIGHT.x * T;
    const oy = LIGHT.y * T;
    const r = T * 0.62;
    orb.fillStyle(0x7d8299, 1).fillCircle(ox, oy, r);
    orb.fillStyle(0x9aa0b8, 1).fillCircle(ox - r * 0.25, oy - r * 0.25, r * 0.45);
    orb.lineStyle(3, 0x3e4258, 1).beginPath().moveTo(ox - r * 0.1, oy - r).lineTo(ox + r * 0.12, oy - r * 0.3).lineTo(ox - r * 0.15, oy + r * 0.2).lineTo(ox + r * 0.2, oy + r).strokePath();
    orb.lineStyle(2, 0x3e4258, 1).beginPath().moveTo(ox + r * 0.12, oy - r * 0.3).lineTo(ox + r * 0.7, oy - r * 0.1).strokePath();
    orb.setAlpha(0);
    h.world.add(orb);
    s.tweens.add({ targets: orb, alpha: 1, duration: 300 });
    for (let i = 0; i < (still ? 0 : 26); i++) {
      const a = (i / 26) * Math.PI * 2;
      const sp = s.add.circle(LIGHT.x * T, LIGHT.y * T, Phaser.Math.Between(3, 6), i % 2 ? 0xffd166 : 0xfff6d0, 1).setDepth(1e6).setBlendMode(Phaser.BlendModes.ADD);
      h.world.add(sp);
      s.tweens.add({ targets: sp, x: sp.x + Math.cos(a) * T * Phaser.Math.Between(3, 7), y: sp.y + Math.sin(a) * T * Phaser.Math.Between(2, 6) + T * 2, alpha: 0, duration: 1400, ease: 'Cubic.Out', onComplete: () => sp.destroy() });
    }
  });
  // small Shades slip over the back wall and into the Tower
  at(8600, () => {
    say(WORDS.lines.shadows);
    const art = characterArt(s, 'enemies-t1', 'swarmer');
    if (!art) return;
    const starts: Vec2[] = [
      { x: 18, y: 0.2 },
      { x: 22, y: -0.4 },
      { x: 40, y: 0.1 },
      { x: 36, y: -0.6 },
      { x: 27, y: 1.0 },
    ];
    starts.forEach((p0, i) => {
      const sh = new LayeredSprite(s, art);
      sh.container.setPosition(p0.x * T, p0.y * T).setScale(1.1).setAlpha(0).setDepth(1e5);
      sh.face(TOWER_DOOR.x - p0.x, TOWER_DOOR.y - p0.y).play('move');
      sh.autoUpdate();
      h.world.add(sh.container);
      s.tweens.add({ targets: sh.container, alpha: 0.95, duration: 400, delay: i * 260 });
      s.tweens.add({
        targets: sh.container,
        x: TOWER_DOOR.x * T,
        y: TOWER_DOOR.y * T,
        scale: 0.6,
        delay: i * 260,
        duration: 2400,
        ease: 'Sine.In',
        onComplete: () => s.tweens.add({ targets: sh.container, alpha: 0, duration: 250, onComplete: () => sh.destroy() }),
      });
    });
  });
  // the colours fade and the petals stop
  at(11400, () => {
    hush();
    petalsOn = false;
    const o = { k: 0 };
    s.tweens.add({ targets: o, k: 1, duration: still ? 10 : 2200, onUpdate: () => bleak(o.k) });
  });
  // Story Chapters (Nov 24): one piece of the light falls toward the hero's dojo (the hook).
  at(12300, () => {
    say(STORY.intro.piece);
    const sp = s.add.circle(LIGHT.x * T, LIGHT.y * T, T * 0.18, 0xffd166, 1).setDepth(1e6).setBlendMode(Phaser.BlendModes.ADD);
    h.world.add(sp);
    s.tweens.add({ targets: sp, x: DOJO_DOOR.x * T, duration: still ? 10 : 1600, ease: 'Sine.Out' });
    s.tweens.add({ targets: sp, y: DOJO_DOOR.y * T, duration: still ? 10 : 1600, ease: 'Quad.In', onComplete: () => sp.destroy() });
  });
  // the hero steps out of the dojo and looks up at the Tower
  at(14200, () => {
    h.placeHero(DOJO_DOOR, { x: 0, y: 1 });
    h.heroVisible(true);
    look({ x: DOJO_DOOR.x + 1.5, y: DOJO_DOOR.y - 1.2 }, 7);
  });
  at(14800, () => say(WORDS.lines.brave));
  // the piece glows above the hero's hands and stays with them
  let shard: Phaser.GameObjects.Container | null = null;
  at(16400, () => {
    shard = lightShard(s, T);
    const p = h.heroPos();
    shard.setPosition(p.x * T, (p.y - 1.15) * T).setAlpha(0);
    h.world.add(shard);
    s.tweens.add({ targets: shard, alpha: 1, duration: 500 });
    sfx.tap();
    say(STORY.intro.chosen);
  });
  at(18000, () => h.placeHero(h.heroPos(), { x: 1, y: -1 }));
  at(19000, () => {
    hush();
    h.walkHero([{ x: 26, y: 10.7 }, { x: 30.2, y: 10.5 }, { x: 30.3, y: 7.6 }]);
  });
  at(19200, () => {
    timers.push(
      s.time.addEvent({
        delay: 60,
        loop: true,
        callback: () => {
          if (over) return;
          const p = h.heroPos();
          shard?.setPosition(p.x * T, (p.y - 1.15) * T);
          look({ x: p.x, y: p.y - 2.2 }, 10);
        },
      }),
    );
  });
  at(22600, () => {
    s.tweens.add({ targets: title, alpha: 1, duration: 700 });
    s.tweens.add({ targets: subtitle, alpha: 1, duration: 700, delay: 500 });
  });
  at(26000, () => finish());

  function finish(): void {
    if (over) return;
    over = true;
    petalTimer.remove();
    f.finish();
  }
}

/** The light piece (Story Chapters): a small glowing gold shard with a soft halo that bobs. */
export function lightShard(s: Phaser.Scene, T: number): Phaser.GameObjects.Container {
  const c = s.add.container(0, 0).setDepth(1e6);
  const halo = s.add.circle(0, 0, T * 0.32, 0xfff1b8, 0.35).setBlendMode(Phaser.BlendModes.ADD);
  const g = s.add.graphics();
  const r = T * 0.16;
  g.fillStyle(0xffd166, 1).fillTriangle(0, -r * 1.6, r, 0, -r, 0).fillTriangle(0, r * 1.2, r, 0, -r, 0);
  g.fillStyle(0xfff6d0, 1).fillTriangle(0, -r * 1.2, r * 0.4, -r * 0.1, -r * 0.3, -r * 0.1);
  c.add([halo, g]);
  if (!reducedMotion()) {
    s.tweens.add({ targets: halo, scale: 1.3, alpha: 0.18, duration: 700, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
    s.tweens.add({ targets: g, y: -4, duration: 650, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
  }
  return c;
}
