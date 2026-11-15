// LP-B4 (L13 Stage 1): the looks shop, over the Path screen. Pick a colour to see it on your
// hero, see the price and your coins before and after, then one tap gets it (and wears it).
// Looks only, coins only: no real money, no timers, nothing that changes a fight.
import Phaser from 'phaser';
import { buyLook, shelf, slotOf, wearLook, type Profile, type ShopItem, type ShopSlot, type TrainingState } from '@dojo/sim';
import { sfx } from '../audio/Sfx';
import { makeStandingCharacter, ownColor } from '../art/player';
import { loadLook } from '../game/look';
import { writeSave } from '../game/save';
import { SHOP, SHOP_WORDS as W } from '../game/shop';
import { button } from './button';
import { fill } from './pathScreen';
import { FONT, crisp } from './theme';
import { MIN_TAP, RADIUS, S1, S2, S3, TYPE } from './tokens';

const TILE = 46;
const GAP = 6;
/** A group's own-colour tile id ("own-gi", "own-hair"). */
const OWN = (slot: ShopSlot) => `own-${slot}`;

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
  let picked = profile.shop.wearing.gi ?? SHOP.items[0].id;
  let toast = '';
  let action: (() => void) | null = null;

  const text = (x: number, y: number, s: string, size: number, color: string, bold = false, wrap?: number) => {
    const o = scene.add
      .text(x, y, s, { fontFamily: FONT, fontStyle: bold ? 'bold' : 'normal', fontSize: `${size}px`, color, align: 'center', wordWrap: wrap ? { width: wrap, useAdvancedWrap: true } : undefined })
      .setResolution(crisp())
      .setOrigin(0.5, 0);
    layer.add(o);
    return o;
  };

  const draw = () => {
    layer.removeAll(true);
    action = null;
    const look = loadLook();
    layer.add(scene.add.rectangle(0, 0, width, height, 0x1e1a14, 1).setOrigin(0).setInteractive());
    const pad = height < 400 ? S2 : 12;
    button(scene, { x: pad, y: pad, w: 96, h: MIN_TAP, label: W.back, color: 0x8a5a35, size: TYPE.body, onTap: onClose }, layer);
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
    // The hero panel: the picked colour on the hero, its name, and what tapping does.
    const panel = scene.add.graphics();
    panel.fillStyle(0x2a2236).fillRoundedRect(pad, top, leftW, bodyH, RADIUS.panel);
    layer.add(panel);
    const item = SHOP.items.find((i) => i.id === picked) ?? null;
    const slot: ShopSlot = item ? slotOf(SHOP, item) : picked === OWN('hair') ? 'hair' : 'gi';
    const preview = { ...look, dye: { ...(look.dye ?? { gi: null, hair: null }), [slot]: item?.color ?? null } };
    const r = Math.min(30, bodyH * 0.13);
    layer.add(makeStandingCharacter(scene, pad + leftW / 2, top + S2 + r * 1.3, r, t.belt, t.stripesThisBelt, preview).container);
    const cx = pad + leftW / 2;
    let y = top + S2 + r * 2.9 + S2;
    text(cx, y, item?.name ?? W.own, TYPE.title, '#f2e9d8', true);
    y += TYPE.title + S1 + 2;
    const line = (s: string, color = '#c8bfae') => {
      const o = text(cx, y, s, TYPE.body, color, false, leftW - 2 * S3);
      y += o.height + S1;
    };
    const btnY = top + bodyH - MIN_TAP - S2;
    const act = (label: string, onTap: (() => void) | null) => {
      button(scene, { x: pad + S3, y: btnY, w: leftW - 2 * S3, h: MIN_TAP, label, color: 0x3aa655, size: TYPE.title, disabled: !onTap, onTap: onTap ?? (() => {}) }, layer);
      action = onTap;
    };
    const wear = () => {
      wearLook(profile, SHOP, slot, item?.id ?? null);
      writeSave(profile);
      sfx.tap();
      draw();
    };
    const wearing = profile.shop.wearing[slot] === (item?.id ?? null);
    if (toast) line(toast, '#ffd166');
    if (!item) {
      line(W.ownLine);
      act(wearing ? W.wearing : W.wear, wearing ? null : wear);
    } else if (profile.shop.owned.includes(item.id)) {
      act(wearing ? W.wearing : W.wear, wearing ? null : wear);
    } else if (!onShelf.has(item.id)) {
      line(W.locked);
    } else {
      line(fill(W.price, { n: item.price }), '#ffd166');
      const short = item.price - profile.coins;
      line(short > 0 ? fill(W.short, { n: short }) : fill(W.afterLine, { before: profile.coins, after: profile.coins - item.price }));
      act(W.get, short > 0 ? null : () => {
        if (!buyLook(profile, SHOP, item.id, tier)) return;
        writeSave(profile);
        sfx.chest();
        toast = W.got;
        draw();
        toast = '';
      });
    }

    // The shelf: one row of tiles per group, the own colour first.
    const sx = pad + leftW + S3;
    const sw = width - sx - pad;
    const perRow = Math.max(1, Math.floor((sw + GAP) / (TILE + GAP)));
    let gy = top;
    text(sx + sw / 2, gy, W.line, TYPE.label, '#9d9384');
    gy += TYPE.label + S2;
    for (const g of SHOP.groups) {
      const head = scene.add.text(sx, gy, g.name, { fontFamily: FONT, fontStyle: 'bold', fontSize: `${TYPE.body}px`, color: '#f2e9d8' }).setResolution(crisp());
      layer.add(head);
      gy += TYPE.body + S1 + 2;
      const tiles: (ShopItem | null)[] = [null, ...SHOP.items.filter((i) => i.group === g.id)];
      tiles.forEach((it, i) => {
        const x = sx + (i % perRow) * (TILE + GAP);
        const ty = gy + Math.floor(i / perRow) * (TILE + GAP);
        const id = it?.id ?? OWN(g.slot);
        tile(x, ty, it ? Phaser.Display.Color.HexStringToColor(it.color).color : ownColor(scene, look, g.slot), id, it);
      });
      gy += Math.ceil(tiles.length / perRow) * (TILE + GAP) + S1;
    }
  };

  const tile = (x: number, y: number, color: number, id: string, it: ShopItem | null) => {
    const locked = !!it && !onShelf.has(it.id);
    const owned = !it || profile.shop.owned.includes(it.id);
    const slot = it ? slotOf(SHOP, it) : (id.slice(4) as ShopSlot);
    const worn = profile.shop.wearing[slot] === (it?.id ?? null);
    const g = scene.add.graphics({ x, y });
    g.fillStyle(0x2a2236).fillRoundedRect(0, 0, TILE, TILE, RADIUS.button);
    g.fillStyle(color).fillCircle(TILE / 2, TILE / 2, 15);
    g.lineStyle(1, 0x000000, 0.35).strokeCircle(TILE / 2, TILE / 2, 15);
    if (!it) g.lineStyle(2, 0xf2e9d8, 0.8).lineBetween(TILE / 2 - 6, TILE / 2 + 1, TILE / 2 + 6, TILE / 2 + 1).strokeCircle(TILE / 2, TILE / 2 - 5, 3);
    if (owned && it) g.fillStyle(0x3aa655).fillCircle(TILE - 9, TILE - 9, 7).lineStyle(2, 0xffffff).lineBetween(TILE - 12, TILE - 9, TILE - 10, TILE - 6).lineBetween(TILE - 10, TILE - 6, TILE - 6, TILE - 12);
    if (worn) g.lineStyle(2, 0xf2e9d8).strokeRoundedRect(3, 3, TILE - 6, TILE - 6, RADIUS.button - 2);
    if (locked) {
      g.fillStyle(0x1e1a14, 0.55).fillRoundedRect(0, 0, TILE, TILE, RADIUS.button);
      g.fillStyle(0xc8bfae).fillRoundedRect(TILE / 2 - 6, TILE / 2 - 1, 12, 9, 2).lineStyle(2, 0xc8bfae).strokeCircle(TILE / 2, TILE / 2 - 3, 4);
    }
    if (id === picked) g.lineStyle(3, 0xffd166).strokeRoundedRect(0, 0, TILE, TILE, RADIUS.button);
    layer.add(g);
    const hit = scene.add.zone(x + TILE / 2, y + TILE / 2, TILE, TILE).setInteractive({ useHandCursor: true });
    hit.on('pointerup', () => {
      if (picked === id) return;
      picked = id;
      sfx.tap();
      draw();
    });
    layer.add(hit);
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
