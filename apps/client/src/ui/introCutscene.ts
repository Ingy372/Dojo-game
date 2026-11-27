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
  /** The hero as drawn (moves smoothly every frame). */
  heroBody(): Phaser.GameObjects.Container;
  /** Plays one of the hero's own animations once (walking can't replace it), then calls done. */
  heroAct(name: string, done: () => void): void;
  /** The pretend kids training in the yard at the start. */
  kids: LayeredSprite[];
  /** The cutscene is over (or skipped): go on to the tutorial. */
  done(): void;
}

/** The Tower's light, at the top of the Tower in the town picture (tiles). */
const LIGHT: Vec2 = { x: 30.3, y: -7.6 };
/** The bottom of the Tower's door in the town picture (Nov 27: was -1.6, which sat up on the wall). */
const TOWER_DOOR: Vec2 = { x: 30.3, y: 0.15 };
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
    // Jay, Nov 27 (the slide looked awkward): each Shade hops down off the wall, then scurries along the ground at a
    // steady pace, facing where it goes, joins a loose line at the door and squeezes in with a puff of shadow.
    const SPEED = 4.5; // tiles per second
    const HOP_MS = 420;
    const SPREAD = [-0.45, 0.45, -0.15, 0.3, 0];
    const queue = (i: number): Vec2 => ({ x: TOWER_DOOR.x + SPREAD[i % SPREAD.length], y: TOWER_DOOR.y + 1.2 + i * 0.12 });
    starts.forEach((p0, i) => {
      const delay = i * 330;
      const sh = new LayeredSprite(s, art);
      const c = sh.container;
      const land: Vec2 = { x: p0.x, y: p0.y + 0.9 };
      c.setPosition(p0.x * T, (p0.y - 0.3) * T).setScale(1).setAlpha(0).setDepth(1e5);
      sh.face(land.x < TOWER_DOOR.x ? 1 : -1, 1).play('idle');
      sh.autoUpdate();
      h.world.add(c);
      // pop up over the wall, then a small arc down onto the ground
      s.tweens.add({ targets: c, alpha: 0.95, duration: 200, delay });
      s.tweens.add({ targets: c, x: land.x * T, duration: HOP_MS, delay, ease: 'Linear' });
      s.tweens.add({ targets: c, y: (p0.y - 0.9) * T, duration: HOP_MS * 0.4, delay, ease: 'Quad.Out' });
      s.tweens.add({
        targets: c,
        y: land.y * T,
        duration: HOP_MS * 0.6,
        delay: delay + HOP_MS * 0.4,
        ease: 'Quad.In',
        onComplete: () => {
          // a little squash on landing
          s.tweens.add({ targets: c, scaleY: 0.85, scaleX: 1.1, duration: 90, yoyo: true });
          walk([queue(i), { x: TOWER_DOOR.x, y: TOWER_DOOR.y - 0.25 }], () => {
            puff(c.x, c.y);
            s.tweens.add({ targets: c, alpha: 0, scaleX: 0.55, scaleY: 0.75, duration: 220, ease: 'Quad.In', onComplete: () => sh.destroy() });
          });
        },
      });
      // walks a path at an even speed, turning to face each leg
      const walk = (path: Vec2[], done: () => void) => {
        const next = path.shift();
        if (!next) return done();
        const dx = next.x - c.x / T;
        const dy = next.y - c.y / T;
        const dist = Math.hypot(dx, dy);
        sh.face(dx, dy).play('move');
        s.tweens.add({ targets: c, x: next.x * T, y: next.y * T, duration: (dist / SPEED) * 1000, ease: 'Linear', onComplete: () => walk(path, done) });
      };
    });
    // a soft dark puff where a Shade slips through the door
    const puff = (x: number, y: number) => {
      if (still) return;
      for (let k = 0; k < 5; k++) {
        const d = s.add.circle(x + Phaser.Math.Between(-8, 8), y - T * 0.3, Phaser.Math.Between(5, 9), 0x2a2340, 0.7).setDepth(1e5 + 1);
        h.world.add(d);
        s.tweens.add({ targets: d, y: d.y - T * Phaser.Math.FloatBetween(0.3, 0.7), scale: 1.8, alpha: 0, duration: 500, ease: 'Sine.Out', onComplete: () => d.destroy() });
      }
    };
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
  // The piece floats down into the hero's hands, and the hero tucks it into the gi (Jay, Nov 27: option A, drawn in
  // Blender as the hero's own 'tuck' animation, with the shard as a prop layer), then sets off for the Tower.
  // The camera follows the hero as drawn, every frame, so the walk to the Tower glides.
  let following = false;
  const follow = () => {
    if (!following || over) return;
    const b = h.heroBody();
    look({ x: b.x / T, y: b.y / T - 2.2 }, 10);
  };
  s.events.once(Phaser.Scenes.Events.SHUTDOWN, () => s.events.off(Phaser.Scenes.Events.POST_UPDATE, follow));
  at(16200, () => {
    say(STORY.intro.chosen);
    h.heroAct('tuck', () => {
      if (over) return;
      hush();
      h.walkHero([{ x: 26, y: 10.7 }, { x: 30.2, y: 10.5 }, { x: 30.3, y: 7.6 }]);
      following = true;
      s.events.on(Phaser.Scenes.Events.POST_UPDATE, follow);
    });
  });
  // The catch (the animation's frame 11 of 36, at 12 a second): the light blooms around the hero and the colour
  // comes back to the town (Jay, Nov 27: "light up everything around the hero and restore color"). The bloom stays
  // bright while the hero looks at it, then draws in to the chest as it's tucked away (frame 26) and leaves a warm
  // glow on the hero.
  const CATCH = 16200 + 920;
  const frameMs = (n: number) => 16200 + (n * 1000) / 12;
  let bloom: Phaser.GameObjects.Image | null = null;
  let warm: Phaser.GameObjects.Image | null = null;
  const chest = () => {
    const b = h.heroBody();
    return { x: b.x, y: b.y - 0.5 * T };
  };
  at(CATCH, () => {
    sfx.tap();
    const c = chest();
    bloom = s.add.image(c.x, c.y, glowKey).setScale(0.2).setAlpha(0.95).setDepth(1e6).setBlendMode(Phaser.BlendModes.ADD);
    const ring = s.add.circle(c.x, c.y, T * 0.4).setStrokeStyle(5, 0xfff1b8, 0.9).setDepth(1e6).setBlendMode(Phaser.BlendModes.ADD);
    h.world.add([bloom, ring]);
    s.tweens.add({ targets: bloom, scale: (9 * T) / 64, alpha: 0.6, duration: still ? 10 : 900, ease: 'Cubic.Out' });
    s.tweens.add({ targets: ring, scale: 22, alpha: 0, duration: still ? 10 : 1300, ease: 'Sine.Out', onComplete: () => ring.destroy() });
    // the colour washes back as the light spreads, and the petals fall again
    const o = { k: 1 };
    s.tweens.add({ targets: o, k: 0, duration: still ? 10 : 1500, ease: 'Sine.InOut', onUpdate: () => bleak(o.k) });
    petalsOn = true;
  });
  // tucked away: the bloom draws in to the chest
  at(frameMs(24), () => {
    if (!bloom) return;
    const c = chest();
    s.tweens.add({ targets: bloom, x: c.x, y: c.y + 0.12 * T, scale: (0.8 * T) / 64, alpha: 0, duration: still ? 10 : 330, ease: 'Quad.In' });
  });
  // a little flash as it goes in, and a soft warm glow stays on the hero (it moves with the hero)
  at(frameMs(27), () => {
    bloom?.destroy();
    warm = s.add.image(0, -0.42 * T, glowKey).setScale((1.4 * T) / 64).setAlpha(0).setBlendMode(Phaser.BlendModes.ADD);
    h.heroBody().add(warm);
    s.tweens.add({ targets: warm, alpha: 0.9, duration: 90, yoyo: true, hold: 60, onComplete: () => warm && s.tweens.add({ targets: warm, alpha: 0.35, duration: 300 }) });
    if (!still) s.tweens.add({ targets: warm, scale: (1.7 * T) / 64, duration: 1100, yoyo: true, repeat: -1, ease: 'Sine.InOut', delay: 500 });
  });
  s.events.once(Phaser.Scenes.Events.SHUTDOWN, () => warm?.destroy());
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
export function lightShard(s: Phaser.Scene, T: number, bob = true): Phaser.GameObjects.Container {
  const c = s.add.container(0, 0).setDepth(1e6);
  const halo = s.add.circle(0, 0, T * 0.32, 0xfff1b8, 0.35).setBlendMode(Phaser.BlendModes.ADD);
  const g = s.add.graphics();
  const r = T * 0.16;
  g.fillStyle(0xffd166, 1).fillTriangle(0, -r * 1.6, r, 0, -r, 0).fillTriangle(0, r * 1.2, r, 0, -r, 0);
  g.fillStyle(0xfff6d0, 1).fillTriangle(0, -r * 1.2, r * 0.4, -r * 0.1, -r * 0.3, -r * 0.1);
  c.add([halo, g]);
  if (!reducedMotion()) {
    s.tweens.add({ targets: halo, scale: 1.3, alpha: 0.18, duration: 700, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
    s.tweens.add({ targets: g, y: bob ? -4 : -1.5, duration: 650, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
  }
  return c;
}
