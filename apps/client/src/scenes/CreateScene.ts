// Character creation (core-design section 13, "Character customization", and the first
// 30 minutes: "Choose a look in under a minute"). Shown the first time a student plays,
// and from the Home Dojo's "Look" button any time after. Every basic option is open to
// everyone. The belt always shows the real rank and can't be changed here.
//
// Nov 18 redesign (Jay: "make it beautiful and fun to create your character"): the hero stands
// on a glowing pedestal under a spotlight, with sparkles drifting up a bright night sky. The
// choices sit in one glass panel with a tab per part (Body, Eyes, Hair, Skin, Hair colour, Gi),
// so each part gets big, finger-sized options. Every change pops sparkles around the hero, and
// "Surprise me!" shuffles a whole new look.

import SCREENS from '../../../../content/settings/screens.json';
import Phaser from 'phaser';
import { getsTutorialFloor, type TrainingState } from '@dojo/sim';
import { characterArt, loadArt } from '../art/art';
import { type StandingCharacter, makeStandingCharacter } from '../art/player';
import { sfx } from '../audio/Sfx';
import { FACES, HAIRS, SWATCHES, type PlayerLook, loadLook, saveLook } from '../game/look';
import { reducedMotion } from '../game/motion';
import { loadSave } from '../game/save';
import { currentTraining } from '../game/student';
import { startTowerRun } from '../game/tower';
import { FONT, crisp, view, hiDpi } from '../ui/theme';
import { button } from '../ui/button';
import { GREEN, MIN_TAP, S2 } from '../ui/tokens';
import { KIT, KIT_TONE, drawPanel, fade } from '../ui/kit';

export interface CreateSceneData {
  /** True the first time: a welcome, and no way back until the character is made. */
  first?: boolean;
}

// U-KIT: the kit sky.
const SKY_TOP = 0x2b4ac4;
const SKY_BOTTOM = 0x0c1240;
const GOLD = 0xffd166;
const INK = '#f6efe2';
const SOFT = '#c9d6ff';
/** The drifting sparkles' colours: gold, pink, sky blue and mint. */
const BOKEH = [0xffd166, 0xff8ad8, 0x7fd4ff, 0x8af0c0];

type Tab = 'body' | 'face' | 'hair' | 'skin' | 'hairColor' | 'gi';
const TABS: { id: Tab; icon: string; label: string }[] = [
  { id: 'body', icon: '🧒', label: 'Body' },
  { id: 'face', icon: '👀', label: 'Eyes' },
  { id: 'hair', icon: '💇', label: 'Hairstyle' },
  { id: 'skin', icon: '✋', label: 'Skin' },
  { id: 'hairColor', icon: '🎨', label: 'Hair color' },
  { id: 'gi', icon: '🥋', label: 'Gi' },
];

export class CreateScene extends Phaser.Scene {
  private first = false;
  private look!: PlayerLook;
  private training!: TrainingState;
  private bg!: Phaser.GameObjects.Container;
  private ui!: Phaser.GameObjects.Container;
  private character: StandingCharacter | null = null;
  private heroAt = { x: 0, y: 0, r: 0 };
  private tab: Tab = 'body';
  private leaving = false;
  private shuffling = false;

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
    // LP-B4: shop dyes are left off here, so the colour choices show as they are.
    this.look = { ...loadLook(), dye: undefined };
    this.training = currentTraining();
    this.leaving = false;
    this.shuffling = false;
    this.tab = 'body';
    this.bg = this.add.container(0, 0);
    this.ui = this.add.container(0, 0);
    this.layout();
    this.cameras.main.fadeIn(300, 10, 8, 16);
    this.scale.on(Phaser.Scale.Events.RESIZE, this.layout, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.scale.off(Phaser.Scale.Events.RESIZE, this.layout, this));
  }

  /** The sky and stage (drawn once per screen size), then the rest. */
  private layout(): void {
    this.drawSky();
    this.render();
  }

  /** A bright night sky with sparkles drifting up, a spotlight and the glowing pedestal. */
  private drawSky(): void {
    this.tweens.killTweensOf(this.bg.list);
    this.bg.removeAll(true);
    const { width, height } = view(this);
    const leftW = this.leftWidth(width);
    const sky = this.add.graphics();
    sky.fillGradientStyle(SKY_TOP, SKY_TOP, SKY_BOTTOM, SKY_BOTTOM, 1).fillRect(0, 0, width, height);
    this.bg.add(sky);
    const still = reducedMotion();
    // Drifting sparkles of light (big soft ones and small bright ones).
    for (let i = 0; i < 22; i++) {
      const big = i % 3 === 0;
      const x = ((i * 97) % 100) / 100 * width;
      const y = ((i * 61) % 100) / 100 * height;
      const dot = this.add.circle(x, y, big ? 10 + (i % 4) * 4 : 2 + (i % 2), BOKEH[i % BOKEH.length], big ? 0.12 : 0.7);
      this.bg.add(dot);
      if (still) continue;
      this.tweens.add({ targets: dot, y: y - height * 0.5, duration: 9000 + (i % 5) * 2200, repeat: -1 });
      if (!big) this.tweens.add({ targets: dot, alpha: 0.15, duration: 700 + (i % 4) * 300, yoyo: true, repeat: -1 });
    }
    // The stage: a soft spotlight from above onto a glowing pedestal.
    const r = Math.min(height * 0.19, leftW * 0.22);
    const cx = leftW / 2;
    const cy = height * 0.52;
    this.heroAt = { x: cx, y: cy, r };
    const light = this.add.graphics();
    light.fillStyle(0xfff3c4, 0.07).fillTriangle(cx - r * 0.5, 0, cx + r * 0.5, 0, cx + r * 2.2, cy + r * 1.2);
    light.fillStyle(0xfff3c4, 0.07).fillTriangle(cx - r * 0.5, 0, cx - r * 2.2, cy + r * 1.2, cx + r * 2.2, cy + r * 1.2);
    this.bg.add(light);
    for (let i = 4; i >= 1; i--) this.bg.add(this.add.circle(cx, cy - r * 0.4, r * (0.9 + i * 0.4), 0xb9a6ff, 0.04));
    const footY = cy + r * 1.22;
    this.bg.add(this.add.ellipse(cx, footY + r * 0.16, r * 3.3, r * 0.95, 0x0c0818, 0.55));
    this.bg.add(this.add.ellipse(cx, footY + r * 0.08, r * 3.1, r * 0.86, 0x8a6418, 1));
    this.bg.add(this.add.ellipse(cx, footY, r * 3.1, r * 0.86, 0x2c2350, 1).setStrokeStyle(3, GOLD, 0.9));
    const ring = this.add.ellipse(cx, footY, r * 2.4, r * 0.62, GOLD, 0.0).setStrokeStyle(3, GOLD, 0.6);
    this.bg.add(ring);
    if (!still) this.tweens.add({ targets: ring, scaleX: 1.22, scaleY: 1.22, alpha: 0, duration: 1600, repeat: -1 });
  }

  private leftWidth(width: number): number {
    return Math.round(width * 0.42);
  }

  /** Draws the hero, the words and the choices again (after any change). */
  private render(): void {
    this.ui.removeAll(true);
    const { width, height } = view(this);
    const pad = 14;
    const leftW = this.leftWidth(width);

    // ---- left: the welcome, the hero and the big buttons
    const firstName = this.training.firstName;
    const title = this.first ? `Welcome, ${firstName}!` : 'Your look';
    this.text(leftW / 2, pad - 2, title, 24, '#ffd166', true, 'Georgia, serif').setOrigin(0.5, 0).setStroke('#140d2b', 5);
    // Playtest Nov 22: "you're a Orange Belt": a or an by the belt's first letter.
    const belt = this.training.belt.name;
    const sub = this.first ? SCREENS.createLine.replace('{aBelt}', `${/^[aeiou]/i.test(belt) ? 'an' : 'a'} ${belt}`).replace('{belt}', belt) : 'Change your look any time.';
    this.text(leftW / 2, pad + 30, sub, 13, INK).setOrigin(0.5, 0).setAlign('center').setWordWrapWidth(leftW - 24, true);

    const { x: cx, y: cy, r } = this.heroAt;
    this.character = makeStandingCharacter(this, cx, cy, r, this.training.belt, this.training.stripesThisBelt, this.look);
    this.ui.add(this.character.container);
    // Name plate: a little banner on the pedestal's front.
    const plate = `${this.training.displayName}  ·  ${this.training.belt.name}`;
    const by = height - pad - MIN_TAP;
    const plateT = this.text(cx, by - 16, plate, 13, INK, true).setOrigin(0.5);
    const plateBg = this.add.graphics();
    plateBg.fillStyle(0x140d2b, 0.75).fillRoundedRect(cx - plateT.width / 2 - 12, plateT.y - 11, plateT.width + 24, 22, 11);
    plateBg.lineStyle(1.5, GOLD, 0.6).strokeRoundedRect(cx - plateT.width / 2 - 12, plateT.y - 11, plateT.width + 24, 22, 11);
    this.ui.addAt(plateBg, this.ui.getIndex(plateT));

    // Surprise me, plus Let's go (first time) or Back and Done (later).
    const row = leftW - 2 * pad;
    if (this.first) {
      // Playtest Nov 22: on a 667 px phone 40% was ~100 px and "🎲 Surprise me!" ran past its button. It gets at
      // least 130 px, leaving Let's go! at least 110.
      const sw = Math.round(Math.max(Math.min(130, row - 110 - S2), row * 0.4));
      this.button(pad, by, sw, MIN_TAP, '🎲 Surprise me!', 0x7a4fd1, 15, () => this.surprise());
      this.button(pad + sw + S2, by, row - sw - S2, MIN_TAP, "Let's go!", GREEN, 19, () => this.finish(true));
    } else {
      const bw = (row - 2 * S2) / 3;
      this.button(pad, by, bw, MIN_TAP, '◀ Back', 0x3a4790, 15, () => this.finish(false));
      this.button(pad + bw + S2, by, bw, MIN_TAP, '🎲 Surprise', 0x7a4fd1, 14, () => this.surprise());
      this.button(pad + 2 * (bw + S2), by, bw, MIN_TAP, 'Done', GREEN, 18, () => this.finish(true));
    }

    // ---- right: a glass panel with a tab per part and big options for the open tab
    const x0 = leftW + 6;
    const top = height < 350 ? 8 : 12;
    const w = width - x0 - pad;
    const panelH = height - 2 * top;
    const panel = this.add.graphics();
    drawPanel(panel, x0, top, w, panelH, { radius: 16 });
    panel.lineStyle(1, 0xffffff, 0.08).strokeRoundedRect(x0 + 3, top + 3, w - 6, panelH - 6, 13);
    this.ui.add(panel);
    const tabH = Math.max(MIN_TAP + 8, Math.min(60, panelH * 0.2));
    this.drawTabs(x0 + 8, top + 8, w - 16, tabH);
    const area = { x: x0 + 14, y: top + 8 + tabH + 10, w: w - 28, h: panelH - tabH - 26 };
    const t = TABS.find((x) => x.id === this.tab)!;
    this.text(area.x, area.y, t.label, 16, INK, true, 'Georgia, serif');
    const opt = { x: area.x, y: area.y + 26, w: area.w, h: area.h - 26 };
    const pal = characterArt(this, `player-${this.look.body}-big`, 'player')?.palettes ?? {};
    if (this.tab === 'body') this.bodyChoice(opt);
    else if (this.tab === 'face') this.stepper(opt, FACES, this.look.face, (face) => this.change({ face }));
    else if (this.tab === 'hair') this.stepper(opt, HAIRS, this.look.hair, (hair) => this.change({ hair }));
    else if (this.tab === 'skin') this.swatches(opt, pal.skin ?? [], this.look.skin, (skin) => this.change({ skin }));
    else if (this.tab === 'hairColor') this.swatches(opt, pal.hair ?? [], this.look.hairColor, (hairColor) => this.change({ hairColor }));
    else this.swatches(opt, pal.gi ?? [], this.look.gi, (gi) => this.change({ gi }));
  }

  /** Six tab chips: an icon and a short word each; the open one glows gold. */
  private drawTabs(x: number, y: number, w: number, h: number): void {
    const gap = 6;
    const cw = (w - gap * (TABS.length - 1)) / TABS.length;
    TABS.forEach((t, i) => {
      const on = t.id === this.tab;
      const tx = x + i * (cw + gap);
      const g = this.add.graphics();
      // U-KIT: tab tiles: gold when picked, dark blue otherwise, with the kit outline.
      g.fillStyle(KIT.ink, 1).fillRoundedRect(tx, y, cw, h, 12);
      if (on) fade(g, tx + 2.5, y + 2.5, cw - 5, h - 5, 10, 0xfff3a8, KIT_TONE.gold.base);
      else fade(g, tx + 2.5, y + 2.5, cw - 5, h - 5, 10, KIT.tabOff.top, KIT.tabOff.bottom);
      g.fillStyle(0xffffff, on ? 0.3 : 0.08).fillRoundedRect(tx + 5, y + 4, cw - 10, h * 0.32, 7);
      this.ui.add(g);
      this.text(tx + cw / 2, y + h * 0.38, t.icon, Math.round(h * 0.36), '#ffffff').setOrigin(0.5);
      this.text(tx + cw / 2, y + h * 0.78, t.label, cw < 64 ? 9 : 11, on ? KIT.brown : SOFT, true).setOrigin(0.5).setWordWrapWidth(cw - 4, true).setAlign('center');
      const hit = this.add.zone(tx + cw / 2, y + h / 2, cw, Math.max(h, MIN_TAP)).setInteractive({ useHandCursor: true });
      hit.on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, () => {
        if (this.tab === t.id || this.shuffling) return;
        sfx.unlock();
        sfx.tap();
        this.tab = t.id;
        this.render();
      });
      this.ui.add(hit);
    });
  }

  /** Two big cards: Boy and Girl. */
  private bodyChoice(at: { x: number; y: number; w: number; h: number }): void {
    const half = (at.w - 12) / 2;
    const h = Math.max(MIN_TAP, Math.min(at.h * 0.55, 96));
    (['a', 'b'] as const).forEach((b, i) => {
      const on = this.look.body === b;
      this.button(at.x + i * (half + 12), at.y + (at.h - h) / 2, half, h, b === 'a' ? 'Boy' : 'Girl', on ? 0x3a7bd5 : 0x2c3f9e, 20, () => this.change({ body: b }), on);
    });
  }

  private change(part: Partial<PlayerLook>, quiet = false): void {
    if (this.leaving) return;
    if (!quiet) sfx.place(true);
    this.look = { ...this.look, ...part };
    this.render();
    if (!quiet) this.celebrate();
  }

  /** A hop and a ring of sparkles around the hero, so every change feels good. */
  private celebrate(): void {
    const c = this.character?.container;
    if (!c || reducedMotion()) return;
    const s = c.scale;
    this.tweens.add({ targets: c, scale: s * 1.08, y: c.y - 6, duration: 110, yoyo: true, ease: 'Sine.Out' });
    const { x, y, r } = this.heroAt;
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2;
      const star = this.add.star(x, y - r * 0.4, 5, 3, 7, BOKEH[i % BOKEH.length]).setAlpha(0.95);
      this.ui.add(star);
      this.tweens.add({
        targets: star,
        x: x + Math.cos(a) * r * 1.7,
        y: y - r * 0.4 + Math.sin(a) * r * 1.5,
        angle: 180,
        alpha: 0,
        scale: 0.4,
        duration: 520,
        ease: 'Cubic.Out',
        onComplete: () => star.destroy(),
      });
    }
  }

  /** "Surprise me!": a quick shuffle through looks that lands on a new one. */
  private surprise(): void {
    if (this.leaving || this.shuffling) return;
    this.shuffling = true;
    const pal = characterArt(this, `player-${this.look.body}-big`, 'player')?.palettes ?? {};
    const pick = <T>(list: readonly T[]): T => list[Math.floor(Math.random() * list.length)];
    const count = (list: unknown[] | undefined) => Array.from({ length: Math.min(SWATCHES, list?.length ?? SWATCHES) }, (_, i) => i);
    const roll = (): Partial<PlayerLook> => ({ face: pick(FACES), hair: pick(HAIRS), skin: pick(count(pal.skin)), hairColor: pick(count(pal.hair)), gi: pick(count(pal.gi)) });
    const steps = reducedMotion() ? 1 : 6;
    for (let i = 0; i < steps; i++) {
      this.time.delayedCall(i * 85, () => {
        const last = i === steps - 1;
        if (!last) sfx.tap();
        this.change(roll(), !last);
        if (last) this.shuffling = false;
      });
    }
  }

  /** ◀ dots ▶ with big arrows: one dot per option, the chosen one big and gold. */
  private stepper(at: { x: number; y: number; w: number; h: number }, list: string[], cur: string, pick: (v: string) => void): void {
    const i = list.indexOf(cur);
    const bw = Math.max(MIN_TAP, Math.min(64, at.w * 0.2));
    const h = Math.max(MIN_TAP, Math.min(64, at.h * 0.5));
    const y = at.y + (at.h - h) / 2;
    const go = (d: number) => () => pick(list[(i + d + list.length) % list.length]);
    this.button(at.x, y, bw, h, '◀', 0x2e6ae0, 24, go(-1));
    this.button(at.x + at.w - bw, y, bw, h, '▶', 0x2e6ae0, 24, go(1));
    const n = list.length;
    const gap = Math.min(24, (at.w - 2 * bw - 24) / n);
    const g = this.add.graphics();
    for (let k = 0; k < n; k++) {
      const dx = at.x + at.w / 2 + (k - (n - 1) / 2) * gap;
      if (k === i) {
        g.fillStyle(GOLD, 0.3).fillCircle(dx, y + h / 2, 12);
        g.fillStyle(GOLD, 1).fillCircle(dx, y + h / 2, 8);
      } else g.fillStyle(0xf2e9d8, 0.45).fillCircle(dx, y + h / 2, 4.5);
    }
    this.ui.add(g);
    this.text(at.x + at.w / 2, y + h + 10, `${i + 1} of ${n}`, 13, SOFT, true).setOrigin(0.5, 0);
  }

  /** Ten big glossy colour drops in two rows of five; the chosen one has a gold ring and a tick. */
  private swatches(at: { x: number; y: number; w: number; h: number }, colors: string[], cur: number, pick: (i: number) => void): void {
    const n = Math.min(SWATCHES, colors.length);
    const perRow = Math.ceil(n / 2);
    const cell = at.w / perRow;
    const cellH = Math.min(at.h / 2, 84);
    const y0 = at.y + (at.h - cellH * 2) / 2;
    const rad = Math.min(28, cell * 0.36, (cellH - 6) / 2);
    colors.slice(0, n).forEach((hex, i) => {
      const cx = at.x + cell * ((i % perRow) + 0.5);
      const cy = y0 + cellH * (Math.floor(i / perRow) + 0.5);
      const on = i === cur;
      const c = Phaser.Display.Color.HexStringToColor(hex);
      if (on) this.ui.add(this.add.circle(cx, cy, rad + 7, GOLD, 0.25));
      this.ui.add(this.add.circle(cx, cy + 3, rad, 0x08060e, 0.45));
      // A light rim so dark swatches show on the dark panel (A7).
      const dot = this.add.circle(cx, cy, rad, c.color).setStrokeStyle(on ? 4 : 2, on ? GOLD : 0xf2e9d8, on ? 1 : 0.7);
      this.ui.add(dot);
      this.ui.add(this.add.ellipse(cx - rad * 0.3, cy - rad * 0.38, rad * 0.7, rad * 0.4, 0xffffff, 0.35).setAngle(-20));
      if (on) this.text(cx, cy, '✓', Math.round(rad * 0.9), '#ffffff', true).setOrigin(0.5).setStroke('#0d1233', 4);
      // The whole cell is the tap target, so small fingers don't miss.
      dot.setInteractive(new Phaser.Geom.Rectangle(rad - cell / 2, rad - cellH / 2, cell, cellH), Phaser.Geom.Rectangle.Contains);
      dot.on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, () => {
        if (this.shuffling) return;
        sfx.unlock();
        pick(i);
      });
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
