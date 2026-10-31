import Phaser from 'phaser';
import { sfx } from '../audio/Sfx';
import { TOWN, TOWN_PACK } from '../game/actionZone';
import { reducedMotion } from '../game/motion';
import { touchPlayClock } from '../game/playTime';
import { addStatic, loadArt } from '../art/art';
import { button } from '../ui/button';
import { addExitCue } from '../ui/exitCue';
import { MIN_TAP } from '../ui/tokens';
import { hiDpi, view } from '../ui/theme';

const FADE = [10, 8, 16] as const;

/**
 * The town (A4-DOJO-ii), as one still picture: the one Jay confirmed, with the Action Zone building
 * in its slot. There is no layered town art or walk grid yet, so the hero does not walk here:
 * tap the Action Zone building to walk up to it, or Home to go back to the Home Dojo. A bobbing
 * arrow over the roof shows what to tap (still when reduced motion is on).
 */
export class TownScene extends Phaser.Scene {
  private ui!: Phaser.GameObjects.Container;
  private leaving = false;

  constructor() {
    super('ActionZoneTown');
  }

  preload(): void {
    loadArt(this, [TOWN_PACK]);
  }

  create(): void {
    hiDpi(this.cameras.main);
    this.leaving = false;
    this.ui = this.add.container(0, 0);
    this.render();
    this.scale.on(Phaser.Scale.Events.RESIZE, this.render, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.scale.off(Phaser.Scale.Events.RESIZE, this.render, this));
    this.cameras.main.fadeIn(reducedMotion() ? 0 : 400, ...FADE);
    touchPlayClock();
    this.time.addEvent({ delay: 5000, loop: true, callback: () => touchPlayClock() });
  }

  private render(): void {
    this.ui.removeAll(true);
    const { width, height } = view(this);
    this.add.existing(this.ui);
    const [pw, ph] = TOWN.pictureSize;
    // The whole picture shows, centred; bars of the backdrop colour fill what is left over.
    const s = Math.min(width / pw, height / ph);
    const ox = (width - pw * s) / 2;
    const oy = (height - ph * s) / 2;
    this.cameras.main.setBackgroundColor(0x14121c);

    const [picture] = addStatic(this, TOWN_PACK, 'town-day', 0, 0);
    if (picture) {
      // The art is the picture at 2x, packed at 0.6: scale it to the picture's size, then fit.
      picture.setOrigin(0, 0).setPosition(ox, oy).setDisplaySize(pw * s, ph * s);
      this.ui.add(picture);
    }

    const [x0, y0, x1, y1] = TOWN.dojo.tapRect;
    const zone = this.add.zone(ox + x0 * s, oy + y0 * s, (x1 - x0) * s, (y1 - y0) * s).setOrigin(0, 0).setInteractive({ useHandCursor: true });
    zone.on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, () => this.goToDojo());
    this.ui.add(zone);

    const cx = ox + ((x0 + x1) / 2) * s;
    this.ui.add(addExitCue(this, cx, oy + (y0 - 24) * s, 64 * s, 36 * s, 'down'));

    button(this, { x: 12, y: 12, w: 96, h: MIN_TAP, label: 'Home', color: 0x3d6a99, size: 18, onTap: () => this.leave('Dojo', false) }, this.ui);
  }

  private goToDojo(): void {
    this.leave('ActionZoneOutside', true);
  }

  private leave(to: string, door: boolean): void {
    if (this.leaving) return;
    this.leaving = true;
    if (door) sfx.doors();
    this.cameras.main.fadeOut(reducedMotion() ? 0 : 300, ...FADE);
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => this.scene.start(to, to === 'ActionZoneOutside' ? { from: 'town' } : undefined));
  }
}
