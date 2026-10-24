// Character creation (core-design section 13, "Character customization", and the first
// 30 minutes: "Choose a look in under a minute"). Shown the first time a student plays,
// and from the Home Dojo's "Look" button any time after. Every basic option is open to
// everyone. The belt always shows the real rank and can't be changed here.

import Phaser from 'phaser';
import { getsTutorialFloor, type TrainingState } from '@dojo/sim';
import { characterArt, loadArt } from '../art/art';
import { type StandingCharacter, makeStandingCharacter } from '../art/player';
import { sfx } from '../audio/Sfx';
import { FACES, HAIRS, SWATCHES, type PlayerLook, loadLook, saveLook } from '../game/look';
import { loadSave } from '../game/save';
import { currentTraining } from '../game/student';
import { startTowerRun } from '../game/tower';
import { FONT, crisp } from '../ui/theme';

export interface CreateSceneData {
  /** True the first time: a welcome, and no way back until the character is made. */
  first?: boolean;
}

const PANEL = 0x221d2e;
const GOLD = 0xffd166;

export class CreateScene extends Phaser.Scene {
  private first = false;
  private look!: PlayerLook;
  private training!: TrainingState;
  private ui!: Phaser.GameObjects.Container;
  private character: StandingCharacter | null = null;
  private leaving = false;

  constructor() {
    super('Create');
  }

  init(data: CreateSceneData): void {
    this.first = !!data.first;
  }

  preload(): void {
    // The full-detail pictures of both bodies hold every face and hairstyle (small), so
    // every choice shows at once without waiting.
    loadArt(this, ['player-a-big', 'player-b-big']);
  }

  create(): void {
    this.look = loadLook();
    this.training = currentTraining();
    this.leaving = false;
    this.ui = this.add.container(0, 0);
    this.render();
    this.cameras.main.fadeIn(300, 10, 8, 16);
    this.scale.on(Phaser.Scale.Events.RESIZE, this.render, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.scale.off(Phaser.Scale.Events.RESIZE, this.render, this));
  }

  /** Draws the whole screen again (after any change, or when the screen turns or resizes). */
  private render(): void {
    this.ui.removeAll(true);
    const { width, height } = this.scale.gameSize;
    const pad = 14;
    const leftW = Math.round(width * 0.4);

    // ---- left: the welcome and the character
    const firstName = this.training.firstName;
    const title = this.first ? `Welcome, ${firstName}!` : 'Your look';
    this.text(leftW / 2, pad, title, 22, '#ffd166', true, 'Georgia, serif').setOrigin(0.5, 0);
    const sub = this.first ? `Sensei says you're a ${this.training.belt.name}.\nMake your character!` : 'Change your look any time.';
    this.text(leftW / 2, pad + 30, sub, 13, '#f2e9d8').setOrigin(0.5, 0).setAlign('center');

    const r = Math.min(height * 0.16, leftW * 0.2);
    const cy = height * 0.56;
    this.ui.add(this.add.ellipse(leftW / 2, cy + r * 1.25, r * 3, r * 0.9, GOLD, 0.12));
    this.character = makeStandingCharacter(this, leftW / 2, cy, r, this.training.belt, this.training.stripesThisBelt, this.look);
    this.ui.add(this.character.container);
    this.text(leftW / 2, height - pad - 18, `${this.training.displayName}  ·  ${this.training.belt.name}`, 13, '#b9ad99').setOrigin(0.5);

    // ---- right: the choices
    const x0 = leftW + 8;
    const w = width - x0 - pad;
    const labelW = Math.min(96, w * 0.24);
    const top = pad;
    const bottomH = 50;
    const rowH = Math.min(52, (height - top - bottomH - pad) / 6);
    this.ui.add(this.add.rectangle(x0 - 6, top - 6, w + 12, rowH * 6 + 12, PANEL, 0.9).setOrigin(0).setStrokeStyle(2, GOLD, 0.25));
    let y = top;
    const row = (label: string) => {
      this.text(x0 + 6, y + rowH / 2, label, 14, '#f2e9d8', true).setOrigin(0, 0.5);
      const at = { x: x0 + labelW, y, w: w - labelW, h: rowH };
      y += rowH;
      return at;
    };

    // Boy / Girl.
    const body = row('Body');
    const half = (body.w - 8) / 2;
    (['a', 'b'] as const).forEach((b, i) => {
      const on = this.look.body === b;
      this.button(body.x + i * (half + 8), body.y + 6, half, rowH - 12, b === 'a' ? 'Boy' : 'Girl', on ? 0x3a7bd5 : 0x3a3448, 15, () => this.change({ body: b }), on);
    });

    // Eyes and hairstyle: arrows either side of the option's number.
    this.stepper(row('Eyes'), rowH, 'Eyes', FACES, this.look.face, (face) => this.change({ face }));
    this.stepper(row('Hairstyle'), rowH, 'Hairstyle', HAIRS, this.look.hair, (hair) => this.change({ hair }));

    // Colours: tap a swatch.
    const pal = characterArt(this, `player-${this.look.body}-big`, 'player')?.palettes ?? {};
    this.swatches(row('Skin'), rowH, pal.skin ?? [], this.look.skin, (skin) => this.change({ skin }));
    this.swatches(row('Hair colour'), rowH, pal.hair ?? [], this.look.hairColor, (hairColor) => this.change({ hairColor }));
    this.swatches(row('Gi'), rowH, pal.gi ?? [], this.look.gi, (gi) => this.change({ gi }));

    // ---- bottom: done (and, after the first time, back without changing anything)
    const by = height - pad - 42;
    const doneW = Math.min(200, w * 0.5);
    this.button(width - pad - doneW, by, doneW, 42, this.first ? "Let's go!" : 'Done', 0x3aa57a, 18, () => this.finish(true));
    if (!this.first) this.button(x0, by, Math.min(120, w * 0.3), 42, '◀ Back', 0x5b4a3c, 15, () => this.finish(false));
  }

  private change(part: Partial<PlayerLook>): void {
    if (this.leaving) return;
    sfx.place(true);
    this.look = { ...this.look, ...part };
    this.render();
    // A small hop so the change is noticed.
    const c = this.character?.container;
    if (c) {
      const s = c.scale;
      this.tweens.add({ targets: c, scale: s * 1.06, duration: 90, yoyo: true, ease: 'Sine.Out' });
    }
  }

  /** ◀ "Eyes 3" ▶ */
  private stepper(at: { x: number; y: number; w: number }, rowH: number, name: string, list: string[], cur: string, pick: (v: string) => void): void {
    const i = list.indexOf(cur);
    const bw = Math.min(56, at.w * 0.25);
    const h = rowH - 10;
    const go = (d: number) => () => pick(list[(i + d + list.length) % list.length]);
    this.button(at.x, at.y + 5, bw, h, '◀', 0x4a3f63, 20, go(-1));
    this.button(at.x + at.w - bw, at.y + 5, bw, h, '▶', 0x4a3f63, 20, go(1));
    // No words or numbers to read: one dot per option, the chosen one big and gold.
    const n = list.length;
    const gap = Math.min(14, (at.w - 2 * bw - 16) / n);
    const g = this.add.graphics();
    for (let k = 0; k < n; k++) {
      const dx = at.x + at.w / 2 + (k - (n - 1) / 2) * gap;
      if (k === i) g.fillStyle(GOLD, 1).fillCircle(dx, at.y + rowH / 2, 5.5);
      else g.fillStyle(0xf2e9d8, 0.45).fillCircle(dx, at.y + rowH / 2, 3);
    }
    this.ui.add(g);
    void name;
  }

  /** A row of colour circles; the chosen one has a gold ring. */
  private swatches(at: { x: number; y: number; w: number }, rowH: number, colors: string[], cur: number, pick: (i: number) => void): void {
    const n = Math.min(SWATCHES, colors.length);
    const cell = at.w / n;
    const rad = Math.min(15, cell * 0.4, rowH * 0.32);
    colors.slice(0, n).forEach((hex, i) => {
      const cx = at.x + cell * (i + 0.5);
      const cy = at.y + rowH / 2;
      const on = i === cur;
      // A light rim so dark swatches show on the dark panel (A7): thicker and solid on the dark ones.
      const c = Phaser.Display.Color.HexStringToColor(hex);
      const dark = (0.2126 * c.red + 0.7152 * c.green + 0.0722 * c.blue) / 255 < 0.35;
      const dot = this.add.circle(cx, cy, rad, c.color).setStrokeStyle(on ? 4 : dark ? 3 : 2, on ? GOLD : 0xf2e9d8, on || dark ? 1 : 0.6);
      if (on) this.ui.add(this.add.circle(cx, cy, rad + 5).setStrokeStyle(2, GOLD, 0.5));
      // The whole cell is the tap target, so small fingers don't miss.
      dot.setInteractive(new Phaser.Geom.Rectangle(rad - cell / 2, rad - rowH / 2, cell, rowH), Phaser.Geom.Rectangle.Contains);
      dot.on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, () => {
        sfx.unlock();
        pick(i);
      });
      this.ui.add(dot);
    });
  }

  /** Saves the look (or leaves it as it was) and goes to the Home Dojo, with a bow when saving. */
  private finish(save: boolean): void {
    if (this.leaving) return;
    this.leaving = true;
    if (save) {
      saveLook(this.look);
      sfx.bow();
      this.character?.sprite?.play('bow', { restart: true });
    }
    this.time.delayedCall(save ? 1100 : 0, () => {
      this.cameras.main.fadeOut(300, 10, 8, 16);
      this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
        // A brand-new player goes straight onto the tutorial floor (M7-P2); everyone else goes home.
        const profile = loadSave();
        if (this.first && save && getsTutorialFloor(profile)) this.scene.start('Game', { run: startTowerRun(profile, this.training) });
        else this.scene.start('Dojo');
      });
    });
  }

  private button(x: number, y: number, w: number, h: number, label: string, color: number, size: number, onTap: () => void, on = false): void {
    const bg = this.add
      .rectangle(x, y, w, h, color)
      .setOrigin(0)
      .setStrokeStyle(on ? 3 : 2, on ? GOLD : 0xffffff, on ? 1 : 0.3);
    this.ui.add(bg);
    this.text(x + w / 2, y + h / 2, label, size, '#ffffff', true).setOrigin(0.5);
    bg.setInteractive().on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, () => {
      sfx.unlock();
      onTap();
    });
  }

  private text(x: number, y: number, s: string, size: number, color: string, bold = false, family = FONT): Phaser.GameObjects.Text {
    const t = this.add
      .text(x, y, s, { fontFamily: family, fontSize: `${size}px`, color, fontStyle: bold ? 'bold' : 'normal' })
      .setResolution(crisp());
    this.ui.add(t);
    return t;
  }
}
