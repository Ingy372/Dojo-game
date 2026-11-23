// Nov 17 (Jay): the equipment screen, redesigned for a premium feel (in the spirit of the gear screens
// in phone action games like Archero 2 and Survivor.io). It replaces the old Gear tab, its paper doll and
// the separate Bag screen with one full-screen view:
//  - left: the hero on a glowing pedestal, with the three slots (Hands, Gi, Charm) as big framed tiles;
//  - right: the whole bag as a scrolling grid of rarity-framed tiles (best first), with filter chips;
//  - tap any tile: an item card pops up with the compare (arrows and words; numbers behind Details, D6)
//    and one big Wear / Take off button. "Best" wears the strongest piece in every slot.
// Equipping flies the icon to its slot, pops the slot and flashes the hero. Reduced motion: plain swaps.

import Phaser from 'phaser';
import { GEAR_SLOTS, compareGear, describeItem, equip, gearScore, letGo, rarityRank, unequip, type GearItem, type GearSlot, type Profile, type TrainingState } from '@dojo/sim';
import { addGearIcon } from '../art/gearIcons';
import { makeStandingCharacter } from '../art/player';
import { sfx } from '../audio/Sfx';
import { loadLook } from '../game/look';
import { reducedMotion } from '../game/motion';
import { writeSave } from '../game/save';
import { button } from './button';
import { KIT, KIT_COLOR, drawPanel, fade, kitBackdrop, kitClose, kitPedestal, kitRibbon } from './kit';
import { GEAR_WORDS } from './gearBoard';
import { FONT, RARITY_COLOR, crisp, rarityName } from './theme';
import { MIN_TAP } from './tokens';

const W = GEAR_WORDS;
const INK = '#ffffff';
const SOFT = '#c9d6ff';
const UP = 0x6fdc8c;
const GOLD = 0xffc94d;

export const EQUIP_WORDS = {
  title: 'Equipment',
  best: 'Wear best',
  all: 'All',
  filters: { hands: 'Hands', gi: 'Gi', charm: 'Charms' } as Record<GearSlot, string>,
  wearing: 'Wearing',
  better: 'Better!',
  close: '✕',
  allBest: 'You are wearing your best gear!',
  bestDone: 'Wearing your best gear!',
};

/** The bag, best first: rarity (highest first), then strength, then slot order, then newest. */
export function sortBag(items: readonly GearItem[]): GearItem[] {
  const slotIndex = (s: GearSlot) => GEAR_SLOTS.indexOf(s);
  return [...items].sort(
    (a, b) => rarityRank(b.rarity) - rarityRank(a.rarity) || gearScore(b) - gearScore(a) || slotIndex(a.slot) - slotIndex(b.slot) || b.uid.localeCompare(a.uid, undefined, { numeric: true }),
  );
}

/** For each slot, the strongest item in the bag (by the hidden gear score), or null when the slot has none. */
export function bestLoadout(items: readonly GearItem[]): Record<GearSlot, GearItem | null> {
  const out = { hands: null, gi: null, charm: null } as Record<GearSlot, GearItem | null>;
  for (const it of items) if (!out[it.slot] || gearScore(it) > gearScore(out[it.slot])) out[it.slot] = it;
  return out;
}

/** True when "Wear best" would change something. */
export function canWearBest(profile: Profile): boolean {
  const best = bestLoadout(profile.inventory);
  return GEAR_SLOTS.some((s) => best[s] && gearScore(best[s]) > gearScore(worn(profile, s)));
}

function worn(profile: Profile, slot: GearSlot): GearItem | null {
  const uid = profile.equipped[slot];
  return uid ? profile.inventory.find((i) => i.uid === uid) ?? null : null;
}

interface SlotView {
  x: number;
  y: number;
  size: number;
  box: Phaser.GameObjects.Container;
}

export interface EquipmentOptions {
  profile: Profile;
  training: TrainingState;
  /** Called after the screen closes (the gear count may have changed). */
  onClose: () => void;
}

/**
 * The full-screen equipment view. Create it with `new EquipmentScreen(scene, opts)`; it draws itself
 * above everything and removes itself when Back is tapped.
 */
export class EquipmentScreen {
  readonly layer: Phaser.GameObjects.Container;
  private scene: Phaser.Scene;
  private opts: EquipmentOptions;
  private filter: GearSlot | null = null;
  private scrollY = 0;
  private maxScroll = 0;
  private gridBox = { x: 0, y: 0, w: 0, h: 0 };
  private grid: Phaser.GameObjects.Container | null = null;
  private slots: Partial<Record<GearSlot, SlotView>> = {};
  private heroGlow: Phaser.GameObjects.Arc | null = null;
  private card: Phaser.GameObjects.Container | null = null;
  private drag: { id: number; startY: number; startScroll: number; moved: boolean } | null = null;
  private tileHits: { item: GearItem; x: number; y: number; w: number; h: number }[] = [];
  private onResize = () => this.render();
  private onWheel = (_p: unknown, _o: unknown, _dx: number, dy: number) => this.scrollBy(dy * 0.6);

  constructor(scene: Phaser.Scene, opts: EquipmentOptions) {
    this.scene = scene;
    this.opts = opts;
    this.layer = scene.add.container(0, 0).setDepth(60);
    this.render();
    scene.scale.on(Phaser.Scale.Events.RESIZE, this.onResize);
    scene.input.on(Phaser.Input.Events.POINTER_WHEEL, this.onWheel);
    scene.input.on(Phaser.Input.Events.POINTER_DOWN, this.onDown, this);
    scene.input.on(Phaser.Input.Events.POINTER_MOVE, this.onMove, this);
    scene.input.on(Phaser.Input.Events.POINTER_UP, this.onUp, this);
    scene.input.keyboard?.on('keydown-ESC', this.escape, this);
    if (!reducedMotion()) {
      this.layer.setAlpha(0);
      scene.tweens.add({ targets: this.layer, alpha: 1, duration: 160 });
    }
  }

  /** Closes the item card if open, else the screen (Escape on a computer, Back on screen). */
  private escape(): void {
    if (this.card) this.closeCard();
    else this.close();
  }

  close(): void {
    const s = this.scene;
    s.scale.off(Phaser.Scale.Events.RESIZE, this.onResize);
    s.input.off(Phaser.Input.Events.POINTER_WHEEL, this.onWheel);
    s.input.off(Phaser.Input.Events.POINTER_DOWN, this.onDown, this);
    s.input.off(Phaser.Input.Events.POINTER_MOVE, this.onMove, this);
    s.input.off(Phaser.Input.Events.POINTER_UP, this.onUp, this);
    s.input.keyboard?.off('keydown-ESC', this.escape, this);
    this.closeCard();
    this.layer.destroy(true);
    this.opts.onClose();
  }

  private get profile(): Profile {
    return this.opts.profile;
  }

  private view(): { width: number; height: number } {
    const cam = this.scene.cameras.main;
    return { width: cam.width / cam.zoom, height: cam.height / cam.zoom };
  }

  private text(x: number, y: number, str: string, size: number, color = INK, bold = true): Phaser.GameObjects.Text {
    return this.scene.add
      .text(x, y, str, { fontFamily: FONT, fontSize: `${size}px`, color, fontStyle: bold ? 'bold' : 'normal' })
      .setResolution(crisp());
  }

  // ------------------------------------------------------------------ drawing

  render(): void {
    this.layer.removeAll(true);
    this.closeCard();
    this.slots = {};
    const { width, height } = this.view();
    const s = this.scene;

    // Background: a deep gradient with a soft spotlight behind the hero.
    // U-KIT: the kit sky behind everything.
    this.layer.add(kitBackdrop(s, width, height));
    // Blocks taps to whatever is underneath.
    this.layer.add(s.add.zone(0, 0, width, height).setOrigin(0).setInteractive());

    const pad = Math.max(10, Math.min(16, width * 0.015));
    const headH = MIN_TAP;
    // Header: Back, the title, and Wear best.
    button(s, { x: pad, y: pad, w: 96, h: headH, label: W.back, color: KIT_COLOR.blue, size: 15, onTap: () => this.close() }, this.layer);
    this.layer.add(kitRibbon(s, width / 2, pad + 2, EQUIP_WORDS.title, 20, 170).parts);
    const bestOn = canWearBest(this.profile);
    const bestW = 132;
    const b = button(s, { x: width - pad - bestW, y: pad, w: bestW, h: headH, label: `★ ${EQUIP_WORDS.best}`, color: bestOn ? KIT_COLOR.gold : KIT_COLOR.dim, size: 15, disabled: !bestOn, onTap: () => this.wearBest() }, this.layer);
    if (bestOn && !reducedMotion()) s.tweens.add({ targets: b.visual, scale: 1.05, duration: 700, yoyo: true, repeat: -1, ease: 'Sine.InOut' });

    const top = pad + headH + 10;
    const leftW = Math.round(Math.min(Math.max(width * 0.4, 260), 440));
    this.drawShowcase(pad, top, leftW, height - top - pad);
    const rx = pad + leftW + pad;
    this.drawBag(rx, top, width - rx - pad, height - top - pad);
  }

  /** The hero on a pedestal, with the three slots in a row under it. */
  private drawShowcase(x: number, y: number, w: number, h: number): void {
    const s = this.scene;
    const panel = s.add.graphics();
    drawPanel(panel, x, y, w, h, { radius: 16 });
    this.layer.add(panel);

    const slotSize = Math.round(Math.min(84, Math.max(56, Math.min(w / 3.8, h * 0.27))));
    const slotsY = y + h - slotSize / 2 - 22;
    const heroBottom = slotsY - slotSize / 2 - 12;
    const heroAreaH = heroBottom - y;
    const cx = x + w / 2;
    const r = Math.max(14, Math.min(42, heroAreaH / 3.7));
    const footY = y + heroAreaH * 0.62;

    // Spotlight and pedestal.
    // A soft spotlight: rings of fading light instead of one flat disc.
    for (let i = 5; i >= 1; i--) this.layer.add(s.add.circle(cx, footY - r * 0.9, r * (0.9 + i * 0.42), 0x78b4ff, 0.035));
    const glow = s.add.circle(cx, footY - r * 0.9, r * 1.5, 0x9ad1ff, 0.12);
    this.heroGlow = glow;
    // U-KIT: the kit's green pedestal.
    this.layer.add([glow, kitPedestal(s, cx, footY + r * 1.15, r * 3.3)]);
    if (!reducedMotion()) s.tweens.add({ targets: glow, alpha: 0.2, duration: 1600, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
    const t = this.opts.training;
    const hero = makeStandingCharacter(s, cx, footY, r, t.belt, t.stripesThisBelt, loadLook()).container;
    this.layer.add(hero);
    const name = this.text(cx, y + 10, t.displayName, 15).setOrigin(0.5, 0);
    const belt = this.text(cx, y + 28, t.belt.name, 12, SOFT, false).setOrigin(0.5, 0);
    this.layer.add([name, belt]);

    // The three slots.
    const gap = Math.min(18, (w - slotSize * 3) / 4);
    const rowW = slotSize * 3 + gap * 2;
    GEAR_SLOTS.forEach((slot, i) => {
      const sx = cx - rowW / 2 + slotSize / 2 + i * (slotSize + gap);
      this.drawSlot(slot, sx, slotsY, slotSize);
    });
  }

  private drawSlot(slot: GearSlot, cx: number, cy: number, size: number): void {
    const s = this.scene;
    const item = worn(this.profile, slot);
    const box = s.add.container(cx, cy);
    if (item) {
      box.add(this.tileBack(item, size, true));
    } else {
      const g = s.add.graphics();
      g.fillStyle(KIT.ink, 1).fillRoundedRect(-size / 2, -size / 2, size, size, 12);
      g.fillStyle(KIT.well, 0.9).fillRoundedRect(-size / 2 + 3, -size / 2 + 3, size - 6, size - 6, 9);
      g.lineStyle(1.5, KIT.wellRim, 0.9).strokeRoundedRect(-size / 2 + 3.5, -size / 2 + 3.5, size - 7, size - 7, 8.5);
      box.add(g);
      const ghost = addGearIcon(s, { slot, rarity: 'common' }, 0, -4, size * 0.62);
      if (ghost) box.add(ghost.setAlpha(0.22).setTint(0x9aa6d6));
      box.add(this.text(0, size * 0.3, '+', 18, KIT.soft).setOrigin(0.5));
    }
    const label = this.text(0, size / 2 + 4, W.slots[slot], 12, item ? INK : SOFT).setOrigin(0.5, 0);
    box.add(label);
    const hit = s.add.zone(0, 0, Math.max(size, MIN_TAP), Math.max(size, MIN_TAP)).setInteractive({ useHandCursor: true });
    hit.on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, () => {
      if (item) this.openCard(item);
      else this.setFilter(slot);
    });
    box.add(hit);
    this.layer.add(box);
    this.slots[slot] = { x: cx, y: cy, size, box };
  }

  /**
   * A rarity tile: a dark rarity-tinted face, a lighter top sheen, a bright rarity border, the icon, and
   * (for the worn slot view) a soft outer glow on Rare and better.
   */
  private tileBack(item: GearItem, size: number, inSlot: boolean): Phaser.GameObjects.GameObject[] {
    const s = this.scene;
    const col = RARITY_COLOR[item.rarity];
    const rr = Math.max(8, size * 0.16);
    const g = s.add.graphics();
    const rank = rarityRank(item.rarity);
    if (rank >= 2) {
      g.fillStyle(col, inSlot ? 0.28 : 0.18).fillRoundedRect(-size / 2 - 4, -size / 2 - 4, size + 8, size + 8, rr + 4);
    }
    // U-KIT: the kit's rarity tile (dark outline, bright rarity face, light inner rim).
    const face = KIT.rarity[item.rarity];
    g.fillStyle(KIT.ink, 1).fillRoundedRect(-size / 2, -size / 2, size, size, rr);
    fade(g, -size / 2 + 3, -size / 2 + 3, size - 6, size - 6, rr - 3, face.top, face.bottom);
    g.fillStyle(0xffffff, 0.16).fillRoundedRect(-size / 2 + 6, -size / 2 + 5, size - 12, size * 0.32, { tl: rr - 5, tr: rr - 5, bl: 4, br: 4 });
    g.lineStyle(2.5, face.rim, 1).strokeRoundedRect(-size / 2 + 4.5, -size / 2 + 4.5, size - 9, size - 9, rr - 4);
    const icon = addGearIcon(s, item, 0, -size * 0.02, size * 0.9);
    return icon ? [g, icon] : [g];
  }

  /** The filter chips and the scrolling grid. */
  private drawBag(x: number, y: number, w: number, h: number): void {
    const s = this.scene;
    const panel = s.add.graphics();
    drawPanel(panel, x, y, w, h, { radius: 16 });
    this.layer.add(panel);

    // Chips: All, Hands, Gi, Charms, each with its count.
    const chips: Array<[GearSlot | null, string]> = [[null, EQUIP_WORDS.all], ...GEAR_SLOTS.map((g): [GearSlot, string] => [g, EQUIP_WORDS.filters[g]])];
    const chipH = 36;
    const chipGap = 6;
    const chipW = Math.min(110, (w - 20 - chipGap * (chips.length - 1)) / chips.length);
    chips.forEach(([slot, label], i) => {
      const n = slot ? this.profile.inventory.filter((it) => it.slot === slot).length : this.profile.inventory.length;
      const on = this.filter === slot;
      button(s, { x: x + 10 + i * (chipW + chipGap), y: y + 10, w: chipW, h: chipH, label: `${label} ${n}`, color: on ? 0x6a54b8 : 0x2b2440, size: 13, selected: on, onTap: () => this.setFilter(slot) }, this.layer);
    });

    const gy = y + 10 + chipH + 10;
    this.gridBox = { x: x + 8, y: gy, w: w - 16, h: y + h - gy - 8 };
    this.drawGrid();
  }

  private items(): GearItem[] {
    const all = sortBag(this.profile.inventory);
    return this.filter ? all.filter((it) => it.slot === this.filter) : all;
  }

  private drawGrid(): void {
    const s = this.scene;
    this.grid?.destroy(true);
    const { x, y, w, h } = this.gridBox;
    const grid = s.add.container(0, 0);
    this.grid = grid;
    this.layer.add(grid);
    this.tileHits = [];

    const items = this.items();
    if (items.length === 0) {
      const line = this.filter ? W.slotEmpty.replace('{slot}', W.slots[this.filter].toLowerCase()) : W.bagEmpty;
      grid.add(this.text(x + w / 2, y + h / 2, line, 15, SOFT, false).setOrigin(0.5).setWordWrapWidth(w - 40).setAlign('center'));
      this.maxScroll = 0;
      return;
    }

    const minTile = 66;
    const gap = 10;
    const cols = Math.max(3, Math.floor((w + gap) / (minTile + gap)));
    const tile = Math.min(96, Math.floor((w - gap * (cols - 1)) / cols));
    const rows = Math.ceil(items.length / cols);
    const contentH = rows * (tile + gap) - gap + 8;
    this.maxScroll = Math.max(0, contentH - h);
    this.scrollY = Math.min(this.scrollY, this.maxScroll);
    const left = x + (w - (cols * tile + (cols - 1) * gap)) / 2;

    const inner = s.add.container(0, -this.scrollY);
    grid.add(inner);
    items.forEach((item, i) => {
      const cx = left + (i % cols) * (tile + gap) + tile / 2;
      const cy = y + 4 + Math.floor(i / cols) * (tile + gap) + tile / 2;
      const c = s.add.container(cx, cy, this.tileBack(item, tile, false));
      const isWorn = this.profile.equipped[item.slot] === item.uid;
      if (isWorn) {
        // A green "Wearing" ribbon along the bottom.
        const rib = s.add.graphics();
        rib.fillStyle(0x2f9e5a, 1).fillRoundedRect(-tile / 2 + 4, tile / 2 - 18, tile - 8, 15, 6);
        c.add([rib, this.text(0, tile / 2 - 10.5, EQUIP_WORDS.wearing, 10).setOrigin(0.5)]);
      } else if (compareGear(item, worn(this.profile, item.slot)) === 'up') {
        // A green arrow badge: better than what's worn.
        const badge = s.add.graphics();
        badge.fillStyle(0x0d1233, 0.9).fillCircle(tile / 2 - 11, -tile / 2 + 11, 10);
        badge.fillStyle(UP, 1).fillTriangle(tile / 2 - 17, -tile / 2 + 15, tile / 2 - 5, -tile / 2 + 15, tile / 2 - 11, -tile / 2 + 5);
        c.add(badge);
        if (!reducedMotion()) s.tweens.add({ targets: badge, alpha: 0.55, duration: 800, yoyo: true, repeat: -1 });
      }
      inner.add(c);
      this.tileHits.push({ item, x: cx - tile / 2, y: cy - tile / 2, w: tile, h: tile });
    });

    // Clip the grid to its box.
    const maskShape = s.make.graphics({}, false);
    maskShape.fillStyle(0xffffff).fillRect(x, y, w, h);
    grid.setMask(maskShape.createGeometryMask());

    // A thin scroll bar when there is more below.
    if (this.maxScroll > 0) {
      const barH = Math.max(30, (h * h) / contentH);
      const barY = y + (h - barH) * (this.scrollY / this.maxScroll);
      grid.add(s.add.rectangle(x + w - 2, barY, 4, barH, 0xffffff, 0.25).setOrigin(1, 0));
    }
  }

  private setFilter(slot: GearSlot | null): void {
    this.filter = this.filter === slot ? null : slot;
    this.scrollY = 0;
    sfx.unlock();
    this.render();
  }

  private scrollBy(dy: number): void {
    if (this.card || this.maxScroll <= 0) return;
    const next = Phaser.Math.Clamp(this.scrollY + dy, 0, this.maxScroll);
    if (next === this.scrollY) return;
    this.scrollY = next;
    this.drawGrid();
  }

  // ------------------------------------------------------------------ input: drag to scroll, tap to open

  private inGrid(px: number, py: number): boolean {
    const { x, y, w, h } = this.gridBox;
    return px >= x && px <= x + w && py >= y && py <= y + h;
  }

  private pt(p: Phaser.Input.Pointer): { x: number; y: number } {
    const cam = this.scene.cameras.main;
    return { x: p.x / cam.zoom, y: p.y / cam.zoom };
  }

  private onDown(p: Phaser.Input.Pointer): void {
    if (this.card) return;
    const { x, y } = this.pt(p);
    if (!this.inGrid(x, y)) return;
    this.drag = { id: p.id, startY: y, startScroll: this.scrollY, moved: false };
  }

  private onMove(p: Phaser.Input.Pointer): void {
    if (!this.drag || p.id !== this.drag.id || !p.isDown) return;
    const { y } = this.pt(p);
    const dy = this.drag.startY - y;
    if (Math.abs(dy) > 8) this.drag.moved = true;
    if (this.drag.moved && this.maxScroll > 0) {
      this.scrollY = Phaser.Math.Clamp(this.drag.startScroll + dy, 0, this.maxScroll);
      this.drawGrid();
    }
  }

  private onUp(p: Phaser.Input.Pointer): void {
    const d = this.drag;
    this.drag = null;
    if (!d || p.id !== d.id || d.moved || this.card) return;
    const { x, y } = this.pt(p);
    if (!this.inGrid(x, y)) return;
    const hit = this.tileHits.find((t) => x >= t.x && x <= t.x + t.w && y + this.scrollY >= t.y && y + this.scrollY <= t.y + t.h);
    if (hit) this.openCard(hit.item);
  }

  // ------------------------------------------------------------------ the item card

  private openCard(item: GearItem, askLetGo = false): void {
    const s = this.scene;
    this.closeCard();
    sfx.unlock();
    const { width, height } = this.view();
    // Its own top-level container above the screen: the bag grid is masked, and a masked container can
    // draw over later siblings in the same parent.
    const card = s.add.container(0, 0).setDepth(this.layer.depth + 1);
    this.card = card;
    const dim = s.add.rectangle(0, 0, width, height, 0x060a24, 0.72).setOrigin(0).setInteractive();
    dim.on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, () => this.closeCard());
    card.add(dim);

    const cw = Math.min(460, width - 32);
    const ch = Math.min(280, height - 24);
    const cx = width / 2;
    const cy = height / 2;
    const body = s.add.container(cx, cy);
    card.add(body);
    const col = RARITY_COLOR[item.rarity];
    const g = s.add.graphics();
    // U-KIT: a kit panel with the item's rarity colour across the top.
    drawPanel(g, -cw / 2, -ch / 2, cw, ch, { radius: 18 });
    const rf = KIT.rarity[item.rarity];
    fade(g, -cw / 2 + 3, -ch / 2 + 3, cw - 6, 55, { tl: 15, tr: 15, bl: 0, br: 0 }, rf.top, rf.bottom);
    g.fillStyle(KIT.ink, 1).fillRect(-cw / 2 + 3, -ch / 2 + 57, cw - 6, 3);
    void col;
    body.add(g);
    // Swallow taps on the card itself so they don't close it.
    body.add(s.add.zone(0, 0, cw, ch).setInteractive());

    body.add(this.text(-cw / 2 + 18, -ch / 2 + 10, item.name, 20).setStroke('#0d1233', 3));
    body.add(this.text(-cw / 2 + 18, -ch / 2 + 36, `${rarityName(item.rarity)} · ${W.slots[item.slot]}`, 13, '#fff6e0', false));
    body.add(kitClose(s, cw / 2 - 8, -ch / 2 + 8, () => this.closeCard()));

    // The big icon on the left.
    const iconSize = Math.min(118, ch - 120);
    const ix = -cw / 2 + 24 + iconSize / 2;
    const iy = -ch / 2 + 70 + iconSize / 2;
    const halo = s.add.circle(ix, iy, iconSize * 0.62, col, 0.18);
    body.add(halo);
    if (!reducedMotion()) s.tweens.add({ targets: halo, scale: 1.08, alpha: 0.3, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
    body.add(s.add.container(ix, iy, this.tileBack(item, iconSize, true)));

    // The compare, in arrows and words; the numbers sit behind Details (D6).
    const tx = ix + iconSize / 2 + 18;
    const tw = cw / 2 - tx - 16;
    const wornItem = worn(this.profile, item.slot);
    const isWorn = wornItem?.uid === item.uid;
    const cmp = isWorn ? 'worn' : !wornItem ? 'empty' : compareGear(item, wornItem);
    const line = cmp === 'worn' ? W.worn : cmp === 'empty' ? W.empty : W[cmp];
    const lineColor = cmp === 'up' || cmp === 'empty' ? '#7fe39a' : cmp === 'worn' ? '#ffd166' : SOFT;
    const arrow = cmp === 'up' ? '▲ ' : cmp === 'down' ? '▼ ' : '';
    body.add(this.text(tx, -ch / 2 + 74, `${arrow}${line}`, 15, lineColor).setWordWrapWidth(tw));
    if (!isWorn && wornItem) body.add(this.text(tx, -ch / 2 + 124, `${W.nowWearing}: ${wornItem.name}`, 12, SOFT, false).setWordWrapWidth(tw));
    let detailsOpen = false;
    const details = this.text(tx, -ch / 2 + 150, '', 13, '#e8dcff', false).setWordWrapWidth(tw);
    body.add(details);
    const detailsBtn = this.text(tx, -ch / 2 + 150, `${W.details} ▸`, 13, '#a99be0').setInteractive({ useHandCursor: true });
    detailsBtn.on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, () => {
      detailsOpen = !detailsOpen;
      details.setText(detailsOpen ? describeItem(item).replace(/ {2}/g, '\n') : '');
      details.setY(-ch / 2 + 172);
      detailsBtn.setText(detailsOpen ? `${W.hideDetails} ▾` : `${W.details} ▸`);
    });
    body.add(detailsBtn);

    // Buttons: one big main action, Let go (asks once) small on the left.
    const by = ch / 2 - 16 - 50;
    const mainW = Math.min(200, cw * 0.45);
    const main = isWorn
      ? button(s, { x: cw / 2 - 16 - mainW, y: by, w: mainW, h: 50, label: W.takeOff, color: 0x4a4266, size: 17, onTap: () => this.takeOff(item) })
      : button(s, { x: cw / 2 - 16 - mainW, y: by, w: mainW, h: 50, label: W.wear, color: 0x2f9e5a, size: 18, onTap: () => this.wear(item) });
    body.add([main.visual, main.hit]);
    // Let go asks once: the first tap turns the button into "Let it go?", the second lets it go.
    const letGoBtn = button(s, {
      x: -cw / 2 + 16,
      y: by + 4,
      w: 120,
      h: 44,
      label: askLetGo ? W.letGoAsk : W.letGo,
      color: askLetGo ? 0x8a3a3a : 0x3a2a33,
      size: 14,
      onTap: () => (askLetGo ? this.letGo(item) : this.openCard(item, true)),
    });
    body.add([letGoBtn.visual, letGoBtn.hit]);

    if (!reducedMotion() && !askLetGo) {
      body.setScale(0.86).setAlpha(0);
      s.tweens.add({ targets: body, scale: 1, alpha: 1, duration: 170, ease: 'Back.Out' });
    }
  }

  /** Opens an item's card (from outside, e.g. a found item on the last climb). */
  showItem(item: GearItem): void {
    this.openCard(item);
  }

  private closeCard(): void {
    this.card?.destroy(true);
    this.card = null;
  }

  // ------------------------------------------------------------------ actions

  private wear(item: GearItem): void {
    const from = this.tileHits.find((t) => t.item.uid === item.uid);
    equip(this.profile, item.uid);
    writeSave(this.profile);
    sfx.insight();
    this.render();
    this.celebrateSlot(item, from ? { x: from.x + from.w / 2, y: from.y + from.h / 2 - this.scrollY } : null);
  }

  private takeOff(item: GearItem): void {
    unequip(this.profile, item.slot);
    writeSave(this.profile);
    this.render();
  }

  private letGo(item: GearItem): void {
    letGo(this.profile, item.uid);
    writeSave(this.profile);
    this.render();
  }

  private wearBest(): void {
    const best = bestLoadout(this.profile.inventory);
    const changed: GearItem[] = [];
    for (const slot of GEAR_SLOTS) {
      const b = best[slot];
      if (b && gearScore(b) > gearScore(worn(this.profile, slot))) {
        equip(this.profile, b.uid);
        changed.push(b);
      }
    }
    if (changed.length === 0) return;
    writeSave(this.profile);
    sfx.insight();
    this.render();
    changed.forEach((it, i) => this.scene.time.delayedCall(i * 120, () => this.celebrateSlot(it, null)));
    this.toast(EQUIP_WORDS.bestDone);
  }

  /** The icon flies from its tile into the slot, the slot pops and shines, and the hero glows. */
  private celebrateSlot(item: GearItem, from: { x: number; y: number } | null): void {
    const slot = this.slots[item.slot];
    if (!slot || reducedMotion()) return;
    const s = this.scene;
    const land = () => {
      if (!slot.box.active) return;
      s.tweens.add({ targets: slot.box, scale: 1.12, duration: 110, yoyo: true, ease: 'Sine.Out' });
      const shine = s.add.circle(slot.x, slot.y, slot.size * 0.7, RARITY_COLOR[item.rarity], 0.45);
      this.layer.add(shine);
      s.tweens.add({ targets: shine, scale: 1.5, alpha: 0, duration: 380, onComplete: () => shine.destroy() });
      if (this.heroGlow?.active) {
        this.heroGlow.setFillStyle(0xffd166, 0.4);
        s.tweens.add({ targets: this.heroGlow, fillAlpha: 0.1, duration: 500 });
      }
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2;
        const spark = s.add.circle(slot.x, slot.y, 3, GOLD, 1);
        this.layer.add(spark);
        s.tweens.add({ targets: spark, x: slot.x + Math.cos(a) * slot.size * 0.75, y: slot.y + Math.sin(a) * slot.size * 0.75, alpha: 0, duration: 420, ease: 'Cubic.Out', onComplete: () => spark.destroy() });
      }
    };
    if (!from) return land();
    const fly = addGearIcon(s, item, from.x, from.y, slot.size * 0.8);
    if (!fly) return land();
    this.layer.add(fly);
    s.tweens.add({ targets: fly, x: slot.x, y: slot.y, duration: 240, ease: 'Cubic.In', onComplete: () => { fly.destroy(); land(); } });
  }

  private toast(message: string): void {
    const s = this.scene;
    const { width, height } = this.view();
    const t = this.text(width / 2, height - 40, message, 16, '#fff6e0').setOrigin(0.5).setStroke('#0d1233', 4);
    this.layer.add(t);
    s.tweens.add({ targets: t, alpha: 0, delay: 1400, duration: 400, onComplete: () => t.destroy() });
  }
}
