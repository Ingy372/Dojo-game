// LP-B4 (L13 Stage 1): the looks shop, over the Path screen. Pick something to see it on your
// hero, see the price and your coins before and after, then one tap gets it (and wears it).
// LP-B4b: tabs (Looks, Trails, Pops, Dojo); effects play around the hero, wall paint shows behind.
// Looks only, coins only: no real money, no timers, nothing that changes a fight.
import Phaser from 'phaser';
import { buyLook, shelf, slotOf, wearLook, type Profile, type ShopItem, type ShopSlot, type TrainingState } from '@dojo/sim';
import { sfx } from '../audio/Sfx';
import { makeStandingCharacter, ownColor } from '../art/player';
import { drawShape, playFx } from '../fx/shopFx';
import { loadLook } from '../game/look';
import { writeSave } from '../game/save';
import { SHOP, SHOP_WORDS as W } from '../game/shop';
import { button } from './button';
import { fill } from './pathScreen';
import { FONT, crisp } from './theme';
import { GREEN, MIN_TAP, RADIUS, S1, S2, S3, TYPE } from './tokens';

const TILE = 46;
const GAP = 6;
/** A group's first tile: your own colour, no effect, or plain wood ("own-gi", "own-trail", ...). */
const OWN = (slot: ShopSlot) => `own-${slot}`;
const TABS = [...new Set(SHOP.groups.map((g) => g.tab))];
const WOOD = 0x8a5a35;
/** The Home Dojo's paper wall panels, for the wall paint preview. */
const PAPER = 0xede3c0;

const hex = (s: string) => Phaser.Display.Color.HexStringToColor(s).color;
/** A colour laid over another the way the Dojo's multiply tint does it. */
const multiply = (a: number, b: number) =>
  (((((a >> 16) & 255) * ((b >> 16) & 255)) / 255) << 16) | (((((a >> 8) & 255) * ((b >> 8) & 255)) / 255) << 8) | (((a & 255) * (b & 255)) / 255);

export interface ShopScreen {
  layer: Phaser.GameObjects.Container;
  /** Shows a tile as picked (the shot scripts use this). */
  pick(id: string): void;
  /** Taps the action button of the picked tile, if it has one (the shot scripts use this). */
  act(): void;
}

export function openShop(scene: Phaser.Scene, width: number, height: number, profile: Profile, t: TrainingState, onClose: () => void): ShopScreen {
  const layer = scene.add.container(0, 0).setDepth(60);
  const tier = t.belt.tier;
  const onShelf = new Set(shelf(SHOP, tier).map((i) => i.id));
  let picked = profile.shop.wearing.gi ?? OWN('gi');
  let toast = '';
  let action: (() => void) | null = null;
  let loop: Phaser.Time.TimerEvent | null = null;

  const itemOf = (id: string) => SHOP.items.find((i) => i.id === id) ?? null;
  const slotOfId = (id: string): ShopSlot => {
    const it = itemOf(id);
    return it ? slotOf(SHOP, it) : (id.slice(4) as ShopSlot);
  };
  const tabOf = (id: string) => SHOP.groups.find((g) => g.slot === slotOfId(id))!.tab;

  const text = (x: number, y: number, s: string, size: number, color: string, bold = false, wrap?: number) => {
    const o = scene.add
      .text(x, y, s, { fontFamily: FONT, fontStyle: bold ? 'bold' : 'normal', fontSize: `${size}px`, color, align: 'center', wordWrap: wrap ? { width: wrap, useAdvancedWrap: true } : undefined })
      .setResolution(crisp())
      .setOrigin(0.5, 0);
    layer.add(o);
    return o;
  };

  const draw = () => {
    loop?.remove();
    loop = null;
    layer.removeAll(true);
    action = null;
    const look = loadLook();
    layer.add(scene.add.rectangle(0, 0, width, height, 0x1e1a14, 1).setOrigin(0).setInteractive());
    const pad = height < 400 ? S2 : 12;
    button(scene, { x: pad, y: pad, w: 96, h: MIN_TAP, label: W.back, color: 0x8a5a35, size: TYPE.body, onTap: close }, layer);
    text(width / 2, pad + 4, W.title, TYPE.heading, '#ffd166', true);
    // Coins, top right: a coin drawn in code and the number.
    const coinW = 150;
    const cx0 = width - pad - coinW;
    const chip = scene.add.graphics();
    chip.fillStyle(0x221d2e).fillRoundedRect(cx0, pad, coinW, MIN_TAP, RADIUS.panel);
    chip.fillStyle(0xffd166).fillCircle(cx0 + 22, pad + MIN_TAP / 2, 11).lineStyle(2, 0xc9962b).strokeCircle(cx0 + 22, pad + MIN_TAP / 2, 7);
    layer.add(chip);
    text(cx0 + 22 + (coinW - 22) / 2, pad + (MIN_TAP - TYPE.title) / 2 - 2, fill(W.coins, { n: profile.coins }), TYPE.title, '#f2e9d8', true);

    const top = pad + MIN_TAP + S2;
    const bodyH = height - top - pad;
    const leftW = Math.round(Math.min(300, Math.max(200, width * 0.34)));
    // The hero panel: the picked thing on the hero, its name, and what tapping does.
    const panel = scene.add.graphics();
    panel.fillStyle(0x2a2236).fillRoundedRect(pad, top, leftW, bodyH, RADIUS.panel);
    layer.add(panel);
    const item = itemOf(picked);
    const slot = slotOfId(picked);
    const r = Math.min(30, bodyH * 0.13);
    const cx = pad + leftW / 2;
    const feet = top + S2 + r * 2.6;
    if (slot === 'wall') {
      // A strip of the dojo's back wall behind the hero: paper panels between wooden posts.
      const wall = scene.add.graphics();
      const wy = top + S2;
      const paper = item?.color ? multiply(PAPER, hex(item.color)) : PAPER;
      wall.fillStyle(WOOD).fillRect(pad + S2, wy, leftW - 2 * S2, r * 2.2);
      for (let i = 0; i < 3; i++) {
        const pw = (leftW - 2 * S2 - 4 * 6) / 3;
        wall.fillStyle(paper).fillRect(pad + S2 + 6 + i * (pw + 6), wy + 6, pw, r * 2.2 - 18);
      }
      layer.add(wall);
    }
    if (slot === 'gi' || slot === 'hair') {
      const preview = { ...look, dye: { ...(look.dye ?? { gi: null, hair: null }), [slot]: item?.color ?? null } };
      layer.add(makeStandingCharacter(scene, cx, top + S2 + r * 1.3, r, t.belt, t.stripesThisBelt, preview).container);
    } else {
      layer.add(makeStandingCharacter(scene, cx, top + S2 + r * 1.3, r, t.belt, t.stripesThisBelt, look).container);
    }
    if (item?.fx && slot !== 'wall') previewFx(item.fx, slot, cx, feet, r, leftW);
    let y = top + S2 + r * 2.9 + S2;
    const ownName = slot === 'wall' ? W.wood : slot === 'gi' || slot === 'hair' ? W.own : W.plain;
    const ownLine = slot === 'wall' ? W.woodLine : slot === 'gi' || slot === 'hair' ? W.ownLine : W.plainLine;
    text(cx, y, item?.name ?? ownName, TYPE.title, '#f2e9d8', true);
    y += TYPE.title + S1 + 2;
    const line = (s: string, color = '#c8bfae') => {
      const o = text(cx, y, s, TYPE.body, color, false, leftW - 2 * S3);
      y += o.height + S1;
    };
    const btnY = top + bodyH - MIN_TAP - S2;
    const act = (label: string, onTap: (() => void) | null) => {
      button(scene, { x: pad + S3, y: btnY, w: leftW - 2 * S3, h: MIN_TAP, label, color: GREEN, size: TYPE.title, disabled: !onTap, onTap: onTap ?? (() => {}) }, layer);
      action = onTap;
    };
    // Already worn: plain bright words instead of a greyed-out button, so they stay easy to read.
    const worn = () => text(cx, btnY + (MIN_TAP - TYPE.title) / 2 - 2, W.wearing, TYPE.title, '#9fe0b8', true);
    const wear = () => {
      wearLook(profile, SHOP, slot, item?.id ?? null);
      writeSave(profile);
      sfx.tap();
      draw();
    };
    const wearing = profile.shop.wearing[slot] === (item?.id ?? null);
    if (toast) line(toast, '#ffd166');
    if (!item || profile.shop.owned.includes(item.id)) {
      if (!item) line(ownLine);
      if (wearing) worn();
      else act(W.wear, wear);
    } else if (!onShelf.has(item.id)) {
      line(W.locked);
    } else {
      line(fill(W.price, { n: item.price }), '#ffd166');
      const short = item.price - profile.coins;
      line(short > 0 ? fill(W.short, { n: short }) : fill(W.afterLine, { before: profile.coins, after: profile.coins - item.price }));
      if (short > 0) line(W.line, '#9d9384');
      act(W.get, short > 0 ? null : () => {
        if (!buyLook(profile, SHOP, item.id, tier)) return;
        writeSave(profile);
        sfx.chest();
        toast = W.got;
        draw();
        toast = '';
      });
    }

    // The tabs, then the picked tab's groups: one row of tiles per group, its first tile free.
    const sx = pad + leftW + S3;
    const sw = width - sx - pad;
    const tab = tabOf(picked);
    const tabW = (sw - (TABS.length - 1) * S1) / TABS.length;
    TABS.forEach((name, i) => {
      button(scene, { x: sx + i * (tabW + S1), y: top, w: tabW, h: MIN_TAP, label: name, color: 0x3a3048, size: TYPE.body, selected: name === tab, onTap: () => {
        if (name === tab) return;
        const g = SHOP.groups.find((x) => x.tab === name)!;
        picked = profile.shop.wearing[g.slot] ?? OWN(g.slot);
        sfx.tap();
        draw();
      } }, layer);
    });
    const perRow = Math.max(1, Math.floor((sw + GAP) / (TILE + GAP)));
    let gy = top + MIN_TAP + S2;
    for (const g of SHOP.groups.filter((x) => x.tab === tab)) {
      const head = scene.add.text(sx, gy, g.name, { fontFamily: FONT, fontStyle: 'bold', fontSize: `${TYPE.body}px`, color: '#f2e9d8' }).setResolution(crisp());
      layer.add(head);
      gy += TYPE.body + S1 + 2;
      const tiles: (ShopItem | null)[] = [null, ...SHOP.items.filter((i) => i.group === g.id)];
      tiles.forEach((it, i) => {
        tileAt(sx + (i % perRow) * (TILE + GAP), gy + Math.floor(i / perRow) * (TILE + GAP), g.slot, it, look);
      });
      gy += Math.ceil(tiles.length / perRow) * (TILE + GAP) + S1;
    }
  };

  /** Plays the picked effect around the panel hero, again and again, the way it shows in the game. */
  const previewFx = (fx: NonNullable<ShopItem['fx']>, slot: ShopSlot, cx: number, feet: number, r: number, leftW: number) => {
    // The panel hero is drawn at radius r; in the game a hero is about 0.42 tiles across.
    const tile = slot === 'win' ? Math.min(leftW / 3.4, r / 0.42) : r / 0.42;
    const at = { tile, depth: 0, add: (g: Phaser.GameObjects.Graphics) => layer.add(g) };
    let step = 0;
    const once = () => {
      if (slot === 'trail') {
        // Trails drop a bit at a time: walk the drop point back and forth under the hero.
        playFx(scene, fx, cx + Math.sin(step++ * 0.9) * r * 0.9, feet, at);
      } else if (slot === 'hit') {
        playFx(scene, fx, cx + r * 1.4, feet - r, at);
      } else {
        playFx(scene, fx, cx, slot === 'win' ? feet - r * 1.2 : feet, at);
      }
    };
    once();
    loop = scene.time.addEvent({ delay: slot === 'trail' ? 220 : slot === 'win' ? fx.lifeMs + 400 : 900, loop: true, callback: once });
  };

  const tileAt = (x: number, y: number, slot: ShopSlot, it: ShopItem | null, look: ReturnType<typeof loadLook>) => {
    const id = it?.id ?? OWN(slot);
    const locked = !!it && !onShelf.has(it.id);
    const owned = !it || profile.shop.owned.includes(it.id);
    const worn = profile.shop.wearing[slot] === (it?.id ?? null);
    const g = scene.add.graphics({ x, y });
    const c = TILE / 2;
    g.fillStyle(0x2a2236).fillRoundedRect(0, 0, TILE, TILE, RADIUS.button);
    if (it?.fx) {
      // An effect tile shows its shape in its first colours.
      g.fillStyle(0x1e1a14).fillCircle(c, c, 17);
      g.save();
      g.translateCanvas(c - 5, c - 3);
      drawShape(g, it.fx.shape, 7, hex(it.fx.colors[0]));
      g.restore();
      g.save();
      g.translateCanvas(c + 6, c + 5);
      drawShape(g, it.fx.shape, 5, hex(it.fx.colors[it.fx.colors.length - 1]));
      g.restore();
    } else if (it?.color || slot === 'gi' || slot === 'hair' || slot === 'wall') {
      const color = it?.color ? hex(it.color) : slot === 'wall' ? WOOD : ownColor(scene, look, slot as 'gi' | 'hair');
      g.fillStyle(color).fillCircle(c, c, 15);
      g.lineStyle(1, 0x000000, 0.35).strokeCircle(c, c, 15);
    } else {
      // No effect: an empty ring with a slash.
      g.lineStyle(2, 0xc8bfae).strokeCircle(c, c, 12).lineBetween(c - 8, c + 8, c + 8, c - 8);
    }
    if (!it && (slot === 'gi' || slot === 'hair')) g.lineStyle(2, 0xf2e9d8, 0.8).lineBetween(c - 6, c + 1, c + 6, c + 1).strokeCircle(c, c - 5, 3);
    if (owned && it) g.fillStyle(0x3aa655).fillCircle(TILE - 9, TILE - 9, 7).lineStyle(2, 0xffffff).lineBetween(TILE - 12, TILE - 9, TILE - 10, TILE - 6).lineBetween(TILE - 10, TILE - 6, TILE - 6, TILE - 12);
    if (worn) g.lineStyle(2, 0xf2e9d8).strokeRoundedRect(3, 3, TILE - 6, TILE - 6, RADIUS.button - 2);
    if (locked) {
      g.fillStyle(0x1e1a14, 0.55).fillRoundedRect(0, 0, TILE, TILE, RADIUS.button);
      g.fillStyle(0xc8bfae).fillRoundedRect(c - 6, c - 1, 12, 9, 2).lineStyle(2, 0xc8bfae).strokeCircle(c, c - 3, 4);
    }
    if (id === picked) g.lineStyle(3, 0xffd166).strokeRoundedRect(0, 0, TILE, TILE, RADIUS.button);
    layer.add(g);
    const hit = scene.add.zone(x + c, y + c, TILE, TILE).setInteractive({ useHandCursor: true });
    hit.on('pointerup', () => {
      if (picked === id) return;
      picked = id;
      sfx.tap();
      draw();
    });
    layer.add(hit);
  };

  const close = () => {
    loop?.remove();
    loop = null;
    onClose();
  };

  draw();
  return {
    layer,
    pick: (id) => {
      picked = id;
      draw();
    },
    act: () => action?.(),
  };
}
