// Character creation (core-design section 13, "Character customization", and the first
// 30 minutes: "Choose a look in under a minute"). Shown the first time a student plays,
// and from the Home Dojo's "Look" button any time after. Every basic option is open to
// everyone. The belt always shows the real rank and can't be changed here.

import SCREENS from '../../../../content/settings/screens.json';
import Phaser from 'phaser';
import { getsTutorialFloor, type TrainingState } from '@dojo/sim';
import { characterArt, loadArt } from '../art/art';
import { type StandingCharacter, makeStandingCharacter } from '../art/player';
import { sfx } from '../audio/Sfx';
import { FACES, HAIRS, SWATCHES, type PlayerLook, loadLook, saveLook } from '../game/look';
import { loadSave } from '../game/save';
import { currentTraining } from '../game/student';
import { startTowerRun } from '../game/tower';
import { FONT, crisp, view, hiDpi } from '../ui/theme';
import { button } from '../ui/button';
import { GREEN, MIN_TAP, RADIUS, S1, S2 } from '../ui/tokens';

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
    hiDpi(this.cameras.main);
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
    const { width, height } = view(this);
    const pad = 14;
    const leftW = Math.round(width * 0.4);

    // ---- left: the welcome and the character
    const firstName = this.training.firstName;
    const title = this.first ? `Welcome, ${firstName}!` : 'Your look';
    this.text(leftW / 2, pad, title, 22, '#ffd166', true, 'Georgia, serif').setOrigin(0.5, 0);
    const sub = this.first ? SCREENS.createLine.replace('{belt}', this.training.belt.name) : 'Change your look any time.';
    this.text(leftW / 2, pad + 30, sub, 13, '#f2e9d8').setOrigin(0.5, 0).setAlign('center').setWordWrapWidth(leftW - 24, true);

    const r = Math.min(height * 0.16, leftW * 0.2);
    const cy = height * 0.5;
    this.ui.add(this.add.ellipse(leftW / 2, cy + r * 1.25, r * 3, r * 0.9, GOLD, 0.12));
    this.character = makeStandingCharacter(this, leftW / 2, cy, r, this.training.belt, this.training.stripesThisBelt, this.look);
    this.ui.add(this.character.container);
    // Q-PREMIUM-2 M3: the big buttons now sit under the character, so the right panel
    // keeps the whole height for finger-sized colour swatches.
    const by = height - pad - MIN_TAP;
    this.text(leftW / 2, by - 14, `${this.training.displayName}  ·  ${this.training.belt.name}`, 13, '#b9ad99').setOrigin(0.5);
    const doneW = this.first ? leftW - 2 * pad : (leftW - 2 * pad - S2) / 2;
    this.button(pad + (this.first ? 0 : doneW + S2), by, doneW, MIN_TAP, this.first ? "Let's go!" : 'Done', GREEN, 18, () => this.finish(true));
    if (!this.first) this.button(pad, by, doneW, MIN_TAP, '◀ Back', 0x5b4a3c, 15, () => this.finish(false));

    // ---- right: the choices
    const x0 = leftW + 8;
    const w = width - x0 - pad;
    const labelW = Math.min(96, w * 0.24);
    const top = height < 350 ? 6 : Math.min(pad, 10);
    // P-MENU-e: Body, Eyes and Hairstyle rows hold 44 pt buttons. Q-PREMIUM-2 M3: the three colour
    // rows share the rest of the panel, each as two rows of five swatches (30 to 40 px, whole cell taps).
    const btnRowH = MIN_TAP + 2;
    const panelH = height - 2 * top;
    const dotRowH = Math.min(100, (panelH - 12 - 3 * btnRowH) / 3);
    const panel = this.add.graphics();
    panel.fillStyle(PANEL, 0.9).fillRoundedRect(x0 - 6, top - 6, w + 12, panelH, RADIUS.panel);
    panel.lineStyle(2, GOLD, 0.25).strokeRoundedRect(x0 - 6, top - 6, w + 12, panelH, RADIUS.panel);
    this.ui.add(panel);
    let y = top;
    let rowH = btnRowH;
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
      this.button(body.x + i * (half + 8), body.y + S1 / 2, half, MIN_TAP, b === 'a' ? 'Boy' : 'Girl', on ? 0x3a7bd5 : 0x3a3448, 15, () => this.change({ body: b }), on);
    });

    // Eyes and hairstyle: arrows either side of the option's number.
    this.stepper(row('Eyes'), rowH, 'Eyes', FACES, this.look.face, (face) => this.change({ face }));
    this.stepper(row('Hairstyle'), rowH, 'Hairstyle', HAIRS, this.look.hair, (hair) => this.change({ hair }));

    // Colours: tap a swatch.
    rowH = dotRowH;
    const pal = characterArt(this, `player-${this.look.body}-big`, 'player')?.palettes ?? {};
    this.swatches(row('Skin'), rowH, pal.skin ?? [], this.look.skin, (skin) => this.change({ skin }));
    this.swatches(row('Hair colour'), rowH, pal.hair ?? [], this.look.hairColor, (hairColor) => this.change({ hairColor }));
    this.swatches(row('Gi'), rowH, pal.gi ?? [], this.look.gi, (gi) => this.change({ gi }));
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
    const bw = Math.max(MIN_TAP, Math.min(56, at.w * 0.25));
    const h = MIN_TAP;
    const go = (d: number) => () => pick(list[(i + d + list.length) % list.length]);
    this.button(at.x, at.y + (rowH - h) / 2, bw, h, '◀', 0x4a3f63, 20, go(-1));
    this.button(at.x + at.w - bw, at.y + (rowH - h) / 2, bw, h, '▶', 0x4a3f63, 20, go(1));
    // No words or numbers to read: one dot per option, the chosen one big and gold.
    const n = list.length;
    const gap = Math.min(18, (at.w - 2 * bw - 16) / n);
    const g = this.add.graphics();
    for (let k = 0; k < n; k++) {
      const dx = at.x + at.w / 2 + (k - (n - 1) / 2) * gap;
      if (k === i) g.fillStyle(GOLD, 1).fillCircle(dx, at.y + rowH / 2, 7);
      else g.fillStyle(0xf2e9d8, 0.45).fillCircle(dx, at.y + rowH / 2, 4);
    }
    this.ui.add(g);
    void name;
  }

  /** Ten colour circles in two rows of five; the chosen one has a gold ring. */
  private swatches(at: { x: number; y: number; w: number }, rowH: number, colors: string[], cur: number, pick: (i: number) => void): void {
    const n = Math.min(SWATCHES, colors.length);
    const perRow = Math.ceil(n / 2);
    const cell = at.w / perRow;
    const cellH = rowH / 2;
    const rad = Math.min(20, cell * 0.36, (cellH - 3) / 2);
    colors.slice(0, n).forEach((hex, i) => {
      const cx = at.x + cell * ((i % perRow) + 0.5);
      const cy = at.y + cellH * (Math.floor(i / perRow) + 0.5);
      const on = i === cur;
      // A light rim so dark swatches show on the dark panel (A7): thicker and solid on the dark ones.
      const c = Phaser.Display.Color.HexStringToColor(hex);
      const dark = (0.2126 * c.red + 0.7152 * c.green + 0.0722 * c.blue) / 255 < 0.35;
      const dot = this.add.circle(cx, cy, rad - 2, c.color).setStrokeStyle(on ? 4 : dark ? 3 : 2, on ? GOLD : 0xf2e9d8, on || dark ? 1 : 0.6);
      // The whole cell is the tap target, so small fingers don't miss.
      dot.setInteractive(new Phaser.Geom.Rectangle(rad - 2 - cell / 2, rad - 2 - cellH / 2, cell, cellH), Phaser.Geom.Rectangle.Contains);
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
    // P-MENU-c: the shared rounded button (press feedback, 44 pt tap area); `on` is the picked choice.
    button(this, { x, y, w, h, label, color, size, onTap, selected: on }, this.ui);
  }

  private text(x: number, y: number, s: string, size: number, color: string, bold = false, family = FONT): Phaser.GameObjects.Text {
    const t = this.add
      .text(x, y, s, { fontFamily: family, fontSize: `${size}px`, color, fontStyle: bold ? 'bold' : 'normal' })
      .setResolution(crisp());
    this.ui.add(t);
    return t;
  }
}
