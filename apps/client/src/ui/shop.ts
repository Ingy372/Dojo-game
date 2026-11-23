// The Shop (LP-B4, redesigned Nov 22 for the visual overhaul). Looks only, earned coins only: no real money, no
// timers, no random prizes, nothing that changes a fight. Tabs: Skins (outfits, hats, back pieces), Colors (gi and
// hair dyes), Effects (auras, trails, puffs, pops, win bursts), Pets, Dojo (wall paint, decorations).
// Left: the hero on a lit stage wearing what's picked, its name, rarity and one big button. Right: glossy cards,
// framed by rarity, in a shelf that scrolls by drag or mouse wheel.
import Phaser from 'phaser';
import { buyLook, shelf, slotOf, wearLook, SKIN_SLOTS, type LookRarity, type Profile, type ShopItem, type ShopSlot, type SkinSlot, type TrainingState } from '@dojo/sim';
import { sfx } from '../audio/Sfx';
import { addStatic, loadArt, staticArt } from '../art/art';
import { makeStandingCharacter, ownColor } from '../art/player';
import { AuraFx } from '../fx/aura';
import { drawShape, playFx } from '../fx/shopFx';
import { makePetSprite, petPack } from '../game/companion';
import { loadLook, skinPack, type PlayerLook } from '../game/look';
import { reducedMotion } from '../game/motion';
import { writeSave } from '../game/save';
import { SHOP, SHOP_WORDS as W } from '../game/shop';
import { button } from './button';
import { fill } from './pathScreen';
import { FONT, crisp } from './theme';
import { GREEN, MIN_TAP, S1, S2, S3, TYPE } from './tokens';

const GAP = 8;
const OWN = (slot: ShopSlot) => `own-${slot}`;
const TABS = [...new Set(SHOP.groups.map((g) => g.tab))];
const WOOD = 0x8a5a35;
const PAPER = 0xede3c0;
/** Decorations sold here are drawn from this art pack (content/dojo/decorations.json). */
const DECOR_PACK = 'decor-v2';
/** Skin card icons (rendered from the skins); a card falls back to a colour swatch until the pack is in. */
const ICON_PACK = 'shop-icons';
const TRIED = new Set<string>();

/** Rarity frames: top and bottom of the card's gradient, the rim, and the ribbon text colour. */
const RARITY: Record<LookRarity, { top: number; bottom: number; rim: number; text: string }> = {
  common: { top: 0x6f8aa8, bottom: 0x3d5370, rim: 0xb9cde3, text: '#d9e6f5' },
  rare: { top: 0x3f8fe8, bottom: 0x1f4fae, rim: 0x9fd0ff, text: '#bfe0ff' },
  epic: { top: 0xb05cf0, bottom: 0x5e2aa8, rim: 0xe2b8ff, text: '#ecd2ff' },
  legendary: { top: 0xffc23d, bottom: 0xd2701a, rim: 0xfff0a8, text: '#ffe6a0' },
};
const OWN_RARITY = { top: 0x5a5470, bottom: 0x332f44, rim: 0x8f88a8, text: '#d8d2e8' };

const hex = (s: string) => Phaser.Display.Color.HexStringToColor(s).color;
const multiply = (a: number, b: number) =>
  (((((a >> 16) & 255) * ((b >> 16) & 255)) / 255) << 16) | (((((a >> 8) & 255) * ((b >> 8) & 255)) / 255) << 8) | (((a & 255) * (b & 255)) / 255);

export interface ShopScreen {
  layer: Phaser.GameObjects.Container;
  /** Shows a tile as picked (the shot scripts use this). */
  pick(id: string): void;
  /** Taps the action button of the picked tile, if it has one (the shot scripts use this). */
  act(): void;
}

/** A glossy card face baked once into a texture per size and rarity (Graphics redraw on the CPU every frame). */
function cardTexture(scene: Phaser.Scene, w: number, h: number, key: string, c: { top: number; bottom: number; rim: number }): string {
  const tex = `shopcard:${key}:${w}x${h}`;
  if (scene.textures.exists(tex)) return tex;
  const g = scene.make.graphics({ x: 0, y: 0 }, false);
  const r = 10;
  g.fillStyle(0x000000, 0.35).fillRoundedRect(2, 4, w - 2, h - 2, r);
  // A gradient made of thin bands (generateTexture draws on a canvas, which has no gradient fill).
  const bands = 24;
  const top = Phaser.Display.Color.IntegerToColor(c.top);
  const bot = Phaser.Display.Color.IntegerToColor(c.bottom);
  g.fillStyle(c.bottom).fillRoundedRect(0, 0, w - 2, h - 4, r);
  for (let i = 0; i < bands; i++) {
    const k = i / (bands - 1);
    const col = Phaser.Display.Color.Interpolate.ColorWithColor(top, bot, 100, k * 100);
    const y0 = r + ((h - 4 - 2 * r) * i) / bands;
    g.fillStyle(Phaser.Display.Color.GetColor(col.r, col.g, col.b)).fillRect(0, y0, w - 2, (h - 4 - 2 * r) / bands + 1);
  }
  g.fillStyle(c.top).fillRoundedRect(0, 0, w - 2, r * 2, { tl: r, tr: r, bl: 0, br: 0 });
  g.fillStyle(c.bottom).fillRoundedRect(0, h - 4 - r * 2, w - 2, r * 2, { tl: 0, tr: 0, bl: r, br: r });
  g.lineStyle(3, c.rim, 1).strokeRoundedRect(1.5, 1.5, w - 5, h - 7, r - 1);
  g.fillStyle(0xffffff, 0.18).fillRoundedRect(5, 4, w - 12, (h - 4) * 0.38, { tl: r - 3, tr: r - 3, bl: 4, br: 4 });
  // a darker well in the middle for the icon
  g.fillStyle(0x000000, 0.18).fillRoundedRect(6, 7, w - 14, h - 34, 7);
  g.generateTexture(tex, w, h);
  g.destroy();
  return tex;
}

export function openShop(scene: Phaser.Scene, width: number, height: number, profile: Profile, t: TrainingState, onClose: () => void): ShopScreen {
  const layer = scene.add.container(0, 0).setDepth(60);
  const tier = t.belt.tier;
  const onShelf = new Set(shelf(SHOP, tier).map((i) => i.id));
  let picked = SHOP.items.find((i) => i.group === SHOP.groups[0].id)?.id ?? OWN('gi');
  let toast = '';
  let action: (() => void) | null = null;
  const loops: Array<{ remove(): void }> = [];
  const scrollOf = new Map<string, number>();
  let auraFx: AuraFx | null = null;
  const body = profileBody();
  /** Art packs already asked for (shared by every shop opened in this game). */
  const tried = TRIED;

  function profileBody(): 'a' | 'b' {
    return loadLook().body;
  }

  // Everything the cards and the stage can show: pets, skin icons, decorations. Fetched once, in the background.
  const wanted = [ICON_PACK, DECOR_PACK, ...SHOP.items.flatMap((i) => (i.pet ? [petPack(i.pet)] : []))];
  const missing = wanted.filter((p) => !scene.cache.json.exists(`art:${p}`) && !TRIED.has(p));
  for (const p of missing) TRIED.add(p);
  if (missing.length) {
    loadArt(scene, missing);
    scene.load.once(Phaser.Loader.Events.COMPLETE, () => layer.active && draw());
    scene.load.start();
  }

  const itemOf = (id: string) => SHOP.items.find((i) => i.id === id) ?? null;
  const slotOfId = (id: string): ShopSlot => {
    const it = itemOf(id);
    return it ? slotOf(SHOP, it) : (id.slice(4) as ShopSlot);
  };
  const tabOf = (id: string) => SHOP.groups.find((g) => g.slot === slotOfId(id))!.tab;
  const isSkin = (slot: ShopSlot): slot is SkinSlot => (SKIN_SLOTS as readonly string[]).includes(slot);
  /** "No outfit" and friends exist for slots you can take off; colours have "my colour"; decorations have none. */
  const hasOwnTile = (slot: ShopSlot) => slot !== 'decor';

  const text = (x: number, y: number, s: string, size: number, color: string, bold = false, wrap?: number, parent: Phaser.GameObjects.Container = layer) => {
    const o = scene.add
      .text(x, y, s, { fontFamily: FONT, fontStyle: bold ? 'bold' : 'normal', fontSize: `${size}px`, color, align: 'center', wordWrap: wrap ? { width: wrap, useAdvancedWrap: true } : undefined })
      .setResolution(crisp())
      .setOrigin(0.5, 0)
      .setStroke('#140f1c', bold ? 3 : 0);
    parent.add(o);
    return o;
  };

  /** The look with the picked thing on it (for the stage). */
  const previewLook = (look: PlayerLook, slot: ShopSlot, item: ShopItem | null): PlayerLook => {
    if (slot === 'gi' || slot === 'hair') return { ...look, dye: { ...(look.dye ?? { gi: null, hair: null }), [slot]: item?.color ?? null } };
    if (isSkin(slot)) {
      const wear = { ...(look.wear ?? { outfit: null, hat: null, back: null, hidesHair: false }) };
      wear[slot] = item?.layer ?? null;
      if (slot === 'hat') wear.hidesHair = !!item?.hidesHair;
      return { ...look, wear };
    }
    return look;
  };

  /** Loads a skin's art for the stage the first time it's picked, then redraws. */
  const ensureSkin = (item: ShopItem | null): boolean => {
    if (!item?.layer) return true;
    const pack = skinPack(body, item.layer);
    if (scene.cache.json.exists(`art:${pack}`) && scene.textures.exists(`art:${pack}:0`)) return true;
    // Only ask once: a pack that isn't there (or failed) is never fetched again, so the shop can't loop.
    if (tried.has(pack)) return false;
    tried.add(pack);
    loadArt(scene, [pack]);
    scene.load.once(Phaser.Loader.Events.COMPLETE, () => layer.active && draw());
    scene.load.start();
    return false;
  };

  const clearLoops = () => {
    for (const l of loops.splice(0)) l.remove();
    auraFx?.destroy();
    auraFx = null;
  };

  const draw = () => {
    clearLoops();
    layer.removeAll(true);
    action = null;
    const look = loadLook();
    // Backdrop: a deep blue-violet gradient like the reference games' menus.
    const bg = scene.add.graphics();
    bg.fillGradientStyle(0x2a2d6e, 0x2a2d6e, 0x15132e, 0x15132e, 1).fillRect(0, 0, width, height);
    layer.add(bg);
    layer.add(scene.add.zone(0, 0, width, height).setOrigin(0).setInteractive());
    const pad = height < 400 ? S2 : 12;
    button(scene, { x: pad, y: pad, w: 96, h: MIN_TAP, label: W.back, color: 0x5a4a8a, size: TYPE.body, onTap: close }, layer);
    text(width / 2, pad + 6, W.title, TYPE.heading + 4, '#ffd166', true);
    // Coins, top right.
    const coinW = 156;
    const cx0 = width - pad - coinW;
    const chip = scene.add.graphics();
    chip.fillStyle(0x0e0c1c, 0.85).fillRoundedRect(cx0, pad + 4, coinW, MIN_TAP - 8, (MIN_TAP - 8) / 2);
    chip.lineStyle(2, 0xffd166, 0.6).strokeRoundedRect(cx0, pad + 4, coinW, MIN_TAP - 8, (MIN_TAP - 8) / 2);
    drawCoin(chip, cx0 + 18, pad + MIN_TAP / 2, 13);
    layer.add(chip);
    text(cx0 + 18 + (coinW - 18) / 2, pad + (MIN_TAP - TYPE.title) / 2 - 1, `${profile.coins}`, TYPE.title + 2, '#fff6dc', true);

    const top = pad + MIN_TAP + S2;
    const bodyH = height - top - pad;
    const leftW = Math.round(Math.min(310, Math.max(210, width * 0.34)));
    drawStage(look, pad, top, leftW, bodyH);
    drawShelf(look, pad + leftW + S3, top, width - (pad + leftW + S3) - pad, bodyH);
  };

  const drawCoin = (g: Phaser.GameObjects.Graphics, x: number, y: number, r: number) => {
    g.fillStyle(0xc9862b).fillCircle(x, y + 1.5, r);
    g.fillStyle(0xffd166).fillCircle(x, y, r);
    g.fillStyle(0xfff1b8).fillCircle(x - r * 0.3, y - r * 0.3, r * 0.35);
    g.lineStyle(2, 0xc9862b).strokeCircle(x, y, r * 0.6);
  };

  const drawStage = (look: PlayerLook, x0: number, top: number, leftW: number, bodyH: number) => {
    const item = itemOf(picked);
    const slot = slotOfId(picked);
    const rar = item?.rarity ? RARITY[item.rarity] : OWN_RARITY;
    const panel = scene.add.graphics();
    panel.fillStyle(0x000000, 0.3).fillRoundedRect(x0 + 2, top + 4, leftW, bodyH, 14);
    panel.fillGradientStyle(0x6ec6ff, 0x6ec6ff, 0x3a4fb8, 0x3a4fb8, 1).fillRoundedRect(x0, top, leftW, bodyH, 14);
    panel.lineStyle(3, rar.rim, 0.9).strokeRoundedRect(x0 + 1.5, top + 1.5, leftW - 3, bodyH - 3, 13);
    layer.add(panel);
    const cx = x0 + leftW / 2;
    const r = Math.min(34, bodyH * 0.14);
    const feet = top + S2 + r * 3.2;
    // spotlight and podium
    const spot = scene.add.graphics();
    spot.fillStyle(0xffffff, 0.12).fillTriangle(cx - r * 0.4, top, cx + r * 0.4, top, cx + r * 2.2, feet).fillTriangle(cx - r * 0.4, top, cx - r * 2.2, feet, cx + r * 2.2, feet);
    spot.fillStyle(0x2a7a3a).fillEllipse(cx, feet + 6, r * 4.4, r * 1.25);
    spot.fillStyle(0x56c46a).fillEllipse(cx, feet + 2, r * 4.4, r * 1.2);
    spot.fillStyle(0x8ee08a, 0.6).fillEllipse(cx - r * 0.4, feet, r * 2.6, r * 0.6);
    layer.add(spot);
    if (slot === 'wall') {
      const wall = scene.add.graphics();
      const wy = top + S2;
      const paper = item?.color ? multiply(PAPER, hex(item.color)) : PAPER;
      wall.fillStyle(WOOD).fillRect(x0 + S2, wy, leftW - 2 * S2, r * 2.4);
      for (let i = 0; i < 3; i++) {
        const pw = (leftW - 2 * S2 - 4 * 6) / 3;
        wall.fillStyle(paper).fillRect(x0 + S2 + 6 + i * (pw + 6), wy + 6, pw, r * 2.4 - 18);
      }
      layer.add(wall);
    }
    if (slot === 'decor' && item?.decor && staticArt(scene, DECOR_PACK, item.decor)) {
      const st = staticArt(scene, DECOR_PACK, item.decor)!;
      const s = Math.min((r * 3) / st.frameWidth, (r * 3) / st.frameHeight) * 1.4;
      const c = scene.add.container(cx, feet + 4, addStatic(scene, DECOR_PACK, item.decor, 0, 0)).setScale(s);
      layer.add(c);
    } else {
      if (item?.aura) {
        auraFx = new AuraFx(scene, item.aura, { tile: r * 2.4, depth: 0, add: (g) => layer.add(g) });
        const fx = auraFx;
        loops.push(scene.time.addEvent({ delay: 16, loop: true, callback: () => fx.draw(cx, feet) }));
        fx.draw(cx, feet);
      }
      const ready = ensureSkin(item);
      const shown = ready ? previewLook(look, slot, item) : look;
      layer.add(makeStandingCharacter(scene, cx, top + S2 + r * 1.55, r * 1.05, t.belt, t.stripesThisBelt, shown).container);
      if (item?.pet) {
        const pet = makePetSprite(scene, item.pet);
        if (pet) {
          pet.container.setScale((r * 3.2) / 48).setPosition(cx + r * 1.6, feet + 4);
          pet.setDirection(5);
          layer.add(pet.container);
        }
      }
      if (item?.fx) previewFx(item.fx, slot, cx, feet, r, leftW);
    }
    // name, rarity ribbon, lines and the one big button
    let y = feet + r * 0.9;
    text(cx, y, item?.name ?? ownName(slot), TYPE.title + 2, '#ffffff', true);
    y += TYPE.title + 6;
    if (item?.rarity) {
      const label = (W.rarity as Record<string, string>)[item.rarity] ?? item.rarity;
      const rib = scene.add.graphics();
      rib.fillStyle(RARITY[item.rarity].bottom, 1).fillRoundedRect(cx - 46, y, 92, 20, 10);
      rib.lineStyle(2, RARITY[item.rarity].rim).strokeRoundedRect(cx - 46, y, 92, 20, 10);
      layer.add(rib);
      text(cx, y + 2, label, TYPE.label, RARITY[item.rarity].text, true);
      y += 26;
    }
    const line = (s: string, color = '#eaf2ff') => {
      const o = text(cx, y, s, TYPE.body, color, false, leftW - 2 * S3);
      y += o.height + S1;
    };
    const btnY = top + bodyH - MIN_TAP - S2;
    const act = (label: string, onTap: (() => void) | null, color = GREEN) => {
      button(scene, { x: x0 + S3, y: btnY, w: leftW - 2 * S3, h: MIN_TAP, label, color, size: TYPE.title, disabled: !onTap, onTap: onTap ?? (() => {}) }, layer);
      action = onTap;
    };
    const worn = () => text(cx, btnY + (MIN_TAP - TYPE.title) / 2 - 2, W.wearing, TYPE.title, '#b8ffcf', true);
    const wear = () => {
      wearLook(profile, SHOP, slot, item?.id ?? null);
      writeSave(profile);
      sfx.tap();
      draw();
    };
    if (toast) line(toast, '#ffd166');
    if (slot === 'decor' && item) {
      if (profile.shop.owned.includes(item.id)) {
        line(W.decorOwned, '#b8ffcf');
        return;
      }
      if (!onShelf.has(item.id)) return line(W.locked);
      line(W.decorLine);
    }
    const wearing = profile.shop.wearing[slot] === (item?.id ?? null);
    if (!item || profile.shop.owned.includes(item.id)) {
      if (!item) line(ownLine(slot));
      if (wearing) worn();
      else act(item ? W.wear : isSkin(slot) || slot === 'aura' || slot === 'pet' ? W.wearNone : W.wear, wear);
    } else if (!onShelf.has(item.id)) {
      line(W.locked);
    } else {
      const short = item.price - profile.coins;
      line(short > 0 ? fill(W.short, { n: short }) : fill(W.afterLine, { before: profile.coins, after: profile.coins - item.price }));
      act(fill(W.price, { n: item.price }), short > 0 ? null : () => {
        if (!buyLook(profile, SHOP, item.id, tier)) return;
        writeSave(profile);
        sfx.chest();
        toast = W.got;
        celebrate(cx, feet - r * 1.5, item.rarity ?? 'common');
        draw();
        toast = '';
      }, 0xf2a020);
    }
  };

  /** A burst of rays and sparkles behind the hero when something is bought (smaller than any real promotion). */
  const celebrate = (x: number, y: number, rarity: LookRarity) => {
    if (reducedMotion()) return;
    const g = scene.add.graphics().setDepth(61);
    const col = RARITY[rarity].rim;
    let k = 0;
    scene.time.addEvent({
      delay: 16,
      repeat: 40,
      callback: () => {
        k++;
        const p = k / 40;
        g.clear();
        for (let i = 0; i < 12; i++) {
          const a = (i / 12) * Math.PI * 2 + p;
          const d = 20 + p * 90;
          g.fillStyle(col, 1 - p).fillCircle(x + Math.cos(a) * d, y + Math.sin(a) * d * 0.8, 4 * (1 - p) + 1);
        }
        if (k >= 40) g.destroy();
      },
    });
  };

  const ownName = (slot: ShopSlot) => (slot === 'wall' ? W.wood : slot === 'gi' || slot === 'hair' ? W.own : W.none);
  const ownLine = (slot: ShopSlot) => (slot === 'wall' ? W.woodLine : slot === 'gi' || slot === 'hair' ? W.ownLine : W.noneLine);

  const drawShelf = (look: PlayerLook, sx: number, top: number, sw: number, bodyH: number) => {
    const tab = tabOf(picked);
    const tabW = (sw - (TABS.length - 1) * S1) / TABS.length;
    TABS.forEach((name, i) => {
      button(scene, { x: sx + i * (tabW + S1), y: top, w: tabW, h: MIN_TAP, label: name, color: name === tab ? 0xf2a020 : 0x3a3a7a, size: TYPE.body, selected: name === tab, onTap: () => {
        if (name === tab) return;
        const g = SHOP.groups.find((x) => x.tab === name)!;
        picked = profile.shop.wearing[g.slot] ?? SHOP.items.find((it) => it.group === g.id)?.id ?? OWN(g.slot);
        sfx.tap();
        draw();
      } }, layer);
    });
    const areaY = top + MIN_TAP + S2;
    const areaH = bodyH - MIN_TAP - S2;
    const cardW = Math.max(66, Math.min(92, Math.floor((sw - GAP * 3) / 4)));
    const cardH = Math.round(cardW * 1.22);
    const perRow = Math.max(1, Math.floor((sw + GAP) / (cardW + GAP)));
    const shelfC = scene.add.container(0, 0);
    let gy = areaY;
    for (const g of SHOP.groups.filter((x) => x.tab === tab)) {
      shelfC.add(scene.add.text(sx + 2, gy, g.name, { fontFamily: FONT, fontStyle: 'bold', fontSize: `${TYPE.body + 1}px`, color: '#ffe8a8' }).setResolution(crisp()).setStroke('#140f1c', 3));
      gy += TYPE.body + S2;
      const tiles: (ShopItem | null)[] = [...(hasOwnTile(g.slot) ? [null] : []), ...SHOP.items.filter((i) => i.group === g.id)];
      tiles.forEach((it, i) => {
        cardAt(shelfC, sx + (i % perRow) * (cardW + GAP), gy + Math.floor(i / perRow) * (cardH + GAP), cardW, cardH, g.slot, it, look);
      });
      gy += Math.ceil(tiles.length / perRow) * (cardH + GAP) + S2;
    }
    const contentH = gy - areaY;
    const maxScroll = Math.max(0, contentH - areaH);
    let scroll = Math.min(scrollOf.get(tab) ?? 0, maxScroll);
    shelfC.y = -scroll;
    const maskG = scene.make.graphics({ x: 0, y: 0 }, false).fillStyle(0xffffff).fillRect(sx - 4, areaY - 2, sw + 8, areaH + 4);
    shelfC.setMask(maskG.createGeometryMask());
    layer.add(shelfC);
    if (maxScroll > 0) {
      // a slim scroll bar, and drag / wheel to scroll
      const bar = scene.add.graphics();
      const drawBar = () => {
        bar.clear();
        const h = Math.max(30, (areaH * areaH) / contentH);
        const y = areaY + ((areaH - h) * scroll) / maxScroll;
        bar.fillStyle(0xffffff, 0.35).fillRoundedRect(sx + sw + 1, y, 4, h, 2);
      };
      drawBar();
      layer.add(bar);
      const zone = scene.add.zone(sx, areaY, sw, areaH).setOrigin(0).setInteractive();
      layer.addAt(zone, layer.getIndex(shelfC));
      let dragFrom: number | null = null;
      let moved = 0;
      const setScroll = (v: number) => {
        scroll = Phaser.Math.Clamp(v, 0, maxScroll);
        scrollOf.set(tab, scroll);
        shelfC.y = -scroll;
        drawBar();
      };
      const down = (p: Phaser.Input.Pointer) => {
        if (p.x >= sx && p.x <= sx + sw && p.y >= areaY && p.y <= areaY + areaH) {
          dragFrom = p.y + scroll;
          moved = 0;
        }
      };
      const move = (p: Phaser.Input.Pointer) => {
        if (dragFrom === null || !p.isDown) return;
        moved = Math.max(moved, Math.abs(p.y + scroll - dragFrom));
        setScroll(dragFrom - p.y);
      };
      const up = () => {
        dragFrom = null;
      };
      const wheel = (_p: unknown, _o: unknown, _dx: number, dy: number) => setScroll(scroll + dy * 0.6);
      scene.input.on('pointerdown', down);
      scene.input.on('pointermove', move);
      scene.input.on('pointerup', up);
      scene.input.on('wheel', wheel);
      loops.push({ remove: () => {
        scene.input.off('pointerdown', down);
        scene.input.off('pointermove', move);
        scene.input.off('pointerup', up);
        scene.input.off('wheel', wheel);
      } });
      shelfC.setData('dragged', () => moved > 8);
    }
  };

  const cardAt = (parent: Phaser.GameObjects.Container, x: number, y: number, w: number, h: number, slot: ShopSlot, it: ShopItem | null, look: PlayerLook) => {
    const id = it?.id ?? OWN(slot);
    const locked = !!it && !onShelf.has(it.id);
    const owned = !it || profile.shop.owned.includes(it.id);
    const worn = slot !== 'decor' && profile.shop.wearing[slot] === (it?.id ?? null);
    const rar = it?.rarity ? RARITY[it.rarity] : OWN_RARITY;
    const face = scene.add.image(x, y, cardTexture(scene, w, h, it?.rarity ?? 'own', rar)).setOrigin(0);
    parent.add(face);
    const ix = x + (w - 2) / 2;
    const iy = y + 7 + (h - 34) / 2;
    const ir = Math.min(w, h - 34) * 0.36;
    // the icon
    const g = scene.add.graphics();
    parent.add(g);
    if (it?.fx) {
      g.save();
      g.translateCanvas(ix - ir * 0.3, iy - ir * 0.2);
      drawShape(g, it.fx.shape, ir * 0.55, hex(it.fx.colors[0]));
      g.restore();
      g.save();
      g.translateCanvas(ix + ir * 0.4, iy + ir * 0.35);
      drawShape(g, it.fx.shape, ir * 0.38, hex(it.fx.colors[it.fx.colors.length - 1]));
      g.restore();
    } else if (it?.aura) {
      const cols = it.aura.colors.map(hex);
      g.fillStyle(cols[0], 0.35).fillEllipse(ix, iy + ir * 0.45, ir * 2, ir * 0.8);
      g.lineStyle(3, cols[0]).strokeEllipse(ix, iy + ir * 0.45, ir * 2, ir * 0.8);
      for (let k = 0; k < 5; k++) {
        const a = (k / 5) * Math.PI * 2;
        g.fillStyle(cols[k % cols.length]).fillCircle(ix + Math.cos(a) * ir * 0.7, iy - ir * 0.15 + Math.sin(a) * ir * 0.35 - k * 2, 3.5);
      }
    } else if (it?.pet) {
      const pet = makePetSprite(scene, it.pet);
      if (pet) {
        pet.container.setScale((ir * 4) / 48).setPosition(ix, iy + ir * 0.8);
        pet.setDirection(5);
        parent.add(pet.container);
      } else g.fillStyle(hex(it.color)).fillCircle(ix, iy, ir * 0.7);
    } else if (it?.decor && staticArt(scene, DECOR_PACK, it.decor)) {
      const st = staticArt(scene, DECOR_PACK, it.decor)!;
      const s = Math.min((ir * 2.9) / st.frameWidth, (ir * 2.6) / st.frameHeight);
      const c = scene.add.container(ix, iy + ir * 1.0, addStatic(scene, DECOR_PACK, it.decor, 0, 0)).setScale(s);
      parent.add(c);
    } else if (it?.layer && staticArt(scene, ICON_PACK, it.layer)) {
      const st = staticArt(scene, ICON_PACK, it.layer)!;
      const s = Math.min((ir * 2.2) / st.frameWidth, (ir * 2.2) / st.frameHeight);
      parent.add(scene.add.container(ix, iy + ir * 1.05, addStatic(scene, ICON_PACK, it.layer, 0, 0)).setScale(s));
    } else if (it?.color || slot === 'gi' || slot === 'hair' || slot === 'wall') {
      const color = it?.color ? hex(it.color) : slot === 'wall' ? WOOD : ownColor(scene, look, slot as 'gi' | 'hair');
      g.fillStyle(0x000000, 0.25).fillCircle(ix + 1, iy + 2, ir * 0.72);
      g.fillStyle(color).fillCircle(ix, iy, ir * 0.72);
      g.fillStyle(0xffffff, 0.35).fillCircle(ix - ir * 0.25, iy - ir * 0.25, ir * 0.2);
      if (!it && (slot === 'gi' || slot === 'hair')) g.lineStyle(2, 0xffffff, 0.9).lineBetween(ix - 6, iy + 4, ix + 6, iy + 4).strokeCircle(ix, iy - 3, 3);
    } else {
      g.lineStyle(3, 0xd8d2e8).strokeCircle(ix, iy, ir * 0.55).lineBetween(ix - ir * 0.4, iy + ir * 0.4, ix + ir * 0.4, iy - ir * 0.4);
    }
    // bottom strip: price, owned or worn
    const by = y + h - 25;
    if (it && !owned && !locked) {
      const c = scene.add.graphics();
      drawCoin(c, x + 14, by + 9, 7);
      parent.add(c);
      parent.add(scene.add.text(x + 24, by + 1, `${it.price}`, { fontFamily: FONT, fontStyle: 'bold', fontSize: `${TYPE.label}px`, color: '#fff6dc' }).setResolution(crisp()).setStroke('#140f1c', 3));
    } else {
      const label = locked ? '' : worn ? W.wearing : it ? '✓' : (W.none as string);
      parent.add(scene.add.text(x + (w - 2) / 2, by + 1, label, { fontFamily: FONT, fontStyle: 'bold', fontSize: `${TYPE.label}px`, color: worn ? '#b8ffcf' : '#ffffff' }).setResolution(crisp()).setOrigin(0.5, 0).setStroke('#140f1c', 3));
    }
    if (locked) {
      const l = scene.add.graphics();
      l.fillStyle(0x0e0c1c, 0.6).fillRoundedRect(x, y, w - 2, h - 4, 10);
      l.fillStyle(0xe8e0f8).fillRoundedRect(ix - 8, iy, 16, 12, 3).lineStyle(3, 0xe8e0f8).strokeCircle(ix, iy - 3, 6);
      parent.add(l);
    }
    if (worn) {
      const k = scene.add.graphics();
      k.lineStyle(3, 0xb8ffcf).strokeRoundedRect(x + 4, y + 4, w - 10, h - 12, 8);
      parent.add(k);
    }
    if (id === picked) {
      const k = scene.add.graphics();
      k.lineStyle(4, 0xffffff).strokeRoundedRect(x - 2, y - 2, w + 2, h, 12);
      parent.add(k);
    }
    const hit = scene.add.zone(x + w / 2, y + h / 2, w, h).setInteractive({ useHandCursor: true });
    hit.on('pointerup', () => {
      const dragged = parent.getData('dragged') as (() => boolean) | undefined;
      if (dragged?.() || picked === id) return;
      picked = id;
      sfx.tap();
      draw();
    });
    parent.add(hit);
  };

  /** Plays the picked effect around the stage hero, again and again, the way it shows in the game. */
  const previewFx = (fx: NonNullable<ShopItem['fx']>, slot: ShopSlot, cx: number, feet: number, r: number, leftW: number) => {
    const tile = slot === 'win' ? Math.min(leftW / 3.4, r / 0.42) : r / 0.42;
    const at = { tile, depth: 0, add: (g: Phaser.GameObjects.Graphics) => layer.add(g) };
    let step = 0;
    const once = () => {
      if (slot === 'trail') playFx(scene, fx, cx + Math.sin(step++ * 0.9) * r * 0.9, feet, at);
      else if (slot === 'hit') playFx(scene, fx, cx + r * 1.4, feet - r, at);
      else playFx(scene, fx, cx, slot === 'win' ? feet - r * 1.2 : feet, at);
    };
    once();
    loops.push(scene.time.addEvent({ delay: slot === 'trail' ? 220 : slot === 'win' ? fx.lifeMs + 400 : 900, loop: true, callback: once }));
  };

  const close = () => {
    clearLoops();
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
