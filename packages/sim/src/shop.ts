// LP-B4 (L13 Stage 1): coins and the looks shop. Coins come from finished runs and Class
// Chests (COINS); the shop sells looks only, for coins only. Nothing here is read by a run, so
// a look can never change a fight. No real money, no selling, no timers, no random amounts.
// LP-B4b: effects (walk trails, dash puffs, hit pops, win bursts) and Home Dojo wall paint,
// all drawn in code from the recipes here (R-SHOP 3.5).

import { COINS } from './config';
import { addDecorations, type DojoState } from './dojo';
import type { Profile } from './profile';
import type { RunSummary } from './run';

/** What a shop item changes (the belt is never a slot). One item is worn in each slot. */
export type ShopSlot = 'gi' | 'hair' | 'trail' | 'puff' | 'hit' | 'win' | 'wall' | SkinSlot | 'aura' | 'pet' | 'decor';
/** Visual overhaul (Nov 22): skins are art layers on the hero (a costume, a hat, something on the back). */
export type SkinSlot = 'outfit' | 'hat' | 'back';
export const SKIN_SLOTS: readonly SkinSlot[] = ['outfit', 'hat', 'back'];
/** How rare a look feels on its shop card (frame colour only; every price is fixed and nothing is random). */
export type LookRarity = 'common' | 'rare' | 'epic' | 'legendary';
const LOOK_RARITIES: readonly LookRarity[] = ['common', 'rare', 'epic', 'legendary'];
/** Auras: a glow under the hero's feet with motes, drawn in code (never in a fight's danger marks). */
export const AURA_STYLES = ['flame', 'frost', 'leaf', 'spark', 'smoke', 'gold', 'petal', 'rainbow', 'water', 'star'] as const;
export type AuraStyle = (typeof AURA_STYLES)[number];
export interface AuraRecipe {
  style: AuraStyle;
  colors: string[];
  /** Motes alive at once (0 to 16). */
  motes: number;
  /** The ground ring's size, in tiles across (0.5 to 1.4). */
  size: number;
}
export type FxSlot = 'trail' | 'puff' | 'hit' | 'win';

export interface ShopGroup {
  id: string;
  name: string;
  slot: ShopSlot;
  /** The Shop tab the group shows under. */
  tab: string;
}

/** The small shapes every effect is drawn from, in code (R-SHOP 3.5). */
export const FX_SHAPES = ['petal', 'leaf', 'ink', 'star', 'bubble', 'confetti', 'dot', 'sparkle', 'ribbon', 'heart', 'puff', 'blob', 'ring', 'spark', 'lantern', 'firework'] as const;
export type FxShape = (typeof FX_SHAPES)[number];
/** drift: floats off where it starts (trails); burst: flies out from a point; fall and rise: across an area. */
export type FxMotion = 'drift' | 'burst' | 'fall' | 'rise';
const FX_MOTIONS: readonly FxMotion[] = ['drift', 'burst', 'fall', 'rise'];

/** An effect, as data. size and spread are in tiles (the hero is 0.42 tiles across its middle). */
export interface FxRecipe {
  shape: FxShape;
  colors: string[];
  /** Particles per play; for a trail, the most alive at once. */
  count: number;
  lifeMs: number;
  size: number;
  spread: number;
  motion: FxMotion;
}

/** R-SHOP 3.5 safety caps: particles alive per effect, and how long each kind may last. */
export const FX_CAPS = { particles: 24, lifeMs: { trail: 800, puff: 400, hit: 400, win: 3000 } } as const satisfies { particles: number; lifeMs: Record<FxSlot, number> };
const FX_SLOTS: readonly ShopSlot[] = ['trail', 'puff', 'hit', 'win'];
const isFx = (slot: ShopSlot): slot is FxSlot => FX_SLOTS.includes(slot);

export interface ShopItem {
  id: string;
  group: string;
  name: string;
  price: number;
  /** The belt tier (1 = first belt) where it goes on the shelf; it stays after that. */
  belt: number;
  /** The tint, "#rrggbb" (for an effect, the colour on its shop tile). */
  color: string;
  /** Effects only: how it is drawn. */
  fx?: FxRecipe;
  rarity?: LookRarity;
  /** Skins: the hero art layer it shows ("outfit-crimson-dragon"). */
  layer?: string;
  /** Hats: hides the hair under it (hoods and helmets). */
  hidesHair?: boolean;
  /** Auras: how the glow is drawn. */
  aura?: AuraRecipe;
  /** Pets: the pet's art id ("pet-red-panda"). */
  pet?: string;
  /** Dojo decorations sold in the shop: the decoration id (content/dojo/decorations.json). Bought once, kept forever. */
  decor?: string;
}

export interface ShopCatalog {
  groups: ShopGroup[];
  items: ShopItem[];
}

/** Bought looks and the one worn in each slot (null = the student's own colour). */
export interface ShopSave {
  owned: string[];
  wearing: Record<ShopSlot, string | null>;
  /** Nov 23: the look the student is saving up for (the Wish), or null. */
  wish: string | null;
}

const SLOTS: readonly ShopSlot[] = ['gi', 'hair', 'trail', 'puff', 'hit', 'win', 'wall', 'outfit', 'hat', 'back', 'aura', 'pet', 'decor'];

export function newShopSave(): ShopSave {
  return { owned: [], wearing: { gi: null, hair: null, trail: null, puff: null, hit: null, win: null, wall: null, outfit: null, hat: null, back: null, aura: null, pet: null, decor: null }, wish: null };
}

export function readShopSave(v: unknown): ShopSave {
  const s = v as Partial<ShopSave> | null;
  const strings = (x: unknown) => (Array.isArray(x) ? x.filter((i): i is string => typeof i === 'string') : []);
  const id = (x: unknown) => (typeof x === 'string' ? x : null);
  const wearing = newShopSave().wearing;
  for (const slot of SLOTS) wearing[slot] = id(s?.wearing?.[slot]);
  return { owned: strings(s?.owned), wearing, wish: id(s?.wish) };
}

/** Reads a saved coin total: a whole number, never below 0 (old saves start at 0). */
export function readCoins(v: unknown): number {
  return typeof v === 'number' && Number.isFinite(v) && v > 0 ? Math.floor(v) : 0;
}

const HEX = /^#[0-9a-f]{6}$/i;
const ID = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** Checks content/shop/catalog.json and throws on the first broken entry. */
export function loadShopCatalog(raw: unknown): ShopCatalog {
  const r = raw as { groups?: unknown; items?: unknown };
  if (!Array.isArray(r?.groups) || !Array.isArray(r?.items)) throw new Error('shop catalog: needs groups and items');
  const groups = r.groups.map((g: Partial<ShopGroup>) => {
    if (typeof g.id !== 'string' || !ID.test(g.id) || typeof g.name !== 'string' || !SLOTS.includes(g.slot as ShopSlot) || typeof g.tab !== 'string' || !g.tab) throw new Error(`shop group ${JSON.stringify(g)}`);
    return { id: g.id, name: g.name, slot: g.slot as ShopSlot, tab: g.tab };
  });
  const seen = new Set<string>();
  const items = r.items.map((i: Partial<ShopItem>) => {
    const bad = (why: string) => new Error(`shop item ${i.id ?? '?'}: ${why}`);
    if (typeof i.id !== 'string' || !ID.test(i.id)) throw bad('id');
    if (seen.has(i.id)) throw bad('repeated id');
    seen.add(i.id);
    if (!groups.some((g) => g.id === i.group)) throw bad('unknown group');
    if (typeof i.name !== 'string' || i.name.length === 0) throw bad('name');
    if (!Number.isInteger(i.price) || (i.price as number) <= 0) throw bad('price');
    if (!Number.isInteger(i.belt) || (i.belt as number) < 1) throw bad('belt');
    if (typeof i.color !== 'string' || !HEX.test(i.color)) throw bad('color');
    const slot = groups.find((g) => g.id === i.group)!.slot;
    const item: ShopItem = { id: i.id, group: i.group as string, name: i.name, price: i.price as number, belt: i.belt as number, color: i.color.toLowerCase() };
    if (isFx(slot)) item.fx = readFx(i.fx, slot, bad);
    else if (i.fx !== undefined) throw bad('fx on a look');
    if (i.rarity !== undefined) {
      if (!LOOK_RARITIES.includes(i.rarity as LookRarity)) throw bad('rarity');
      item.rarity = i.rarity as LookRarity;
    }
    if ((SKIN_SLOTS as readonly string[]).includes(slot)) {
      if (typeof i.layer !== 'string' || !i.layer.startsWith(`${slot}-`) || !ID.test(i.layer)) throw bad(`layer (must start with "${slot}-")`);
      item.layer = i.layer;
      if (i.hidesHair !== undefined) {
        if (slot !== 'hat' || typeof i.hidesHair !== 'boolean') throw bad('hidesHair (hats only)');
        item.hidesHair = i.hidesHair;
      }
    } else if (i.layer !== undefined || i.hidesHair !== undefined) throw bad('layer on a non-skin');
    if (slot === 'aura') item.aura = readAura(i.aura, bad);
    else if (i.aura !== undefined) throw bad('aura on a non-aura');
    if (slot === 'pet') {
      if (typeof i.pet !== 'string' || !i.pet.startsWith('pet-') || !ID.test(i.pet)) throw bad('pet (must start with "pet-")');
      item.pet = i.pet;
    } else if (i.pet !== undefined) throw bad('pet on a non-pet');
    if (slot === 'decor') {
      if (typeof i.decor !== 'string' || !i.decor) throw bad('decor');
      item.decor = i.decor;
    } else if (i.decor !== undefined) throw bad('decor on a non-decoration');
    return item;
  });
  return { groups, items };
}

function readAura(v: unknown, bad: (why: string) => Error): AuraRecipe {
  const f = v as Partial<AuraRecipe> | undefined;
  if (!f || !AURA_STYLES.includes(f.style as AuraStyle)) throw bad('aura style');
  if (!Array.isArray(f.colors) || f.colors.length === 0 || !f.colors.every((c) => typeof c === 'string' && HEX.test(c))) throw bad('aura colors');
  if (!Number.isInteger(f.motes) || (f.motes as number) < 0 || (f.motes as number) > 16) throw bad('aura motes (0 to 16)');
  if (typeof f.size !== 'number' || f.size < 0.5 || f.size > 1.4) throw bad('aura size (0.5 to 1.4)');
  return { style: f.style as AuraStyle, colors: f.colors.map((c) => c.toLowerCase()), motes: f.motes as number, size: f.size };
}

function readFx(v: unknown, slot: FxSlot, bad: (why: string) => Error): FxRecipe {
  const f = v as Partial<FxRecipe> | undefined;
  if (!f || !FX_SHAPES.includes(f.shape as FxShape)) throw bad('fx shape');
  if (!FX_MOTIONS.includes(f.motion as FxMotion)) throw bad('fx motion');
  if (!Array.isArray(f.colors) || f.colors.length === 0 || !f.colors.every((c) => typeof c === 'string' && HEX.test(c))) throw bad('fx colors');
  if (!Number.isInteger(f.count) || (f.count as number) < 1 || (f.count as number) > FX_CAPS.particles) throw bad(`fx count (1 to ${FX_CAPS.particles})`);
  if (!Number.isInteger(f.lifeMs) || (f.lifeMs as number) < 100 || (f.lifeMs as number) > FX_CAPS.lifeMs[slot]) throw bad(`fx lifeMs (100 to ${FX_CAPS.lifeMs[slot]})`);
  const tiles = (x: unknown, max: number) => typeof x === 'number' && x > 0 && x <= max;
  if (!tiles(f.size, 0.5) || !tiles(f.spread, 4)) throw bad('fx size or spread');
  return { shape: f.shape as FxShape, colors: f.colors.map((c) => c.toLowerCase()), count: f.count as number, lifeMs: f.lifeMs as number, size: f.size as number, spread: f.spread as number, motion: f.motion as FxMotion };
}

/** The coins a finished run pays (LP-P1): a test-link run, or a rest before any room, pays 0. */
export function runCoins(summary: Pick<RunSummary, 'test' | 'result' | 'results'>): number {
  if (summary.test || (summary.result === 'rested' && summary.results.length === 0)) return 0;
  let coins = COINS.run;
  for (const r of summary.results) coins += r.kind === 'boss' ? COINS.bossRoom : r.kind === 'battle' || r.kind === 'challenge' ? COINS.fightRoom : 0;
  return coins + (summary.result === 'cleared' ? COINS.win : 0);
}

/** The items on the shelf at this belt tier, in catalog order. */
export function shelf(catalog: ShopCatalog, tier: number): ShopItem[] {
  return catalog.items.filter((i) => i.belt <= tier);
}

export function slotOf(catalog: ShopCatalog, item: ShopItem): ShopSlot {
  return catalog.groups.find((g) => g.id === item.group)!.slot;
}

/**
 * Buys an item after the confirm tap: it must be on the shelf, not owned yet, and affordable.
 * The only way coins ever go down. The bought look is worn straight away. Returns true if bought.
 */
export function buyLook(profile: Profile, catalog: ShopCatalog, id: string, tier: number): boolean {
  const item = shelf(catalog, tier).find((i) => i.id === id);
  if (!item || profile.shop.owned.includes(id) || profile.coins < item.price) return false;
  profile.coins -= item.price;
  profile.shop.owned.push(id);
  // A decoration goes to the Home Dojo's storage (the client adds it); it is never "worn".
  if (slotOf(catalog, item) !== 'decor') profile.shop.wearing[slotOf(catalog, item)] = id;
  return true;
}

/** Wears an owned look, or takes the slot back to the student's own colour or no effect (id null). */
export function wearLook(profile: Profile, catalog: ShopCatalog, slot: ShopSlot, id: string | null): boolean {
  if (id === null) {
    profile.shop.wearing[slot] = null;
    return true;
  }
  const item = catalog.items.find((i) => i.id === id);
  if (slot === 'decor' || !item || !profile.shop.owned.includes(id) || slotOf(catalog, item) !== slot) return false;
  profile.shop.wearing[slot] = id;
  return true;
}

/** The tint worn in each slot, or null for the student's own colour. */
export function wornColors(profile: Pick<Profile, 'shop'>, catalog: ShopCatalog): Record<'gi' | 'hair' | 'wall', string | null> {
  const color = (slot: ShopSlot) => wornShopItem(profile, catalog, slot)?.color ?? null;
  return { gi: color('gi'), hair: color('hair'), wall: color('wall') };
}

/** The item worn in a slot, if it is owned and still in the catalog. */
export function wornShopItem(profile: Pick<Profile, 'shop'>, catalog: ShopCatalog, slot: ShopSlot): ShopItem | null {
  const id = profile.shop.wearing[slot];
  return (id && profile.shop.owned.includes(id) && catalog.items.find((i) => i.id === id)) || null;
}

/** The effect worn in each effect slot, or null for none. */
export function wornFx(profile: Pick<Profile, 'shop'>, catalog: ShopCatalog): Record<FxSlot, FxRecipe | null> {
  const fx = (slot: FxSlot) => wornShopItem(profile, catalog, slot)?.fx ?? null;
  return { trail: fx('trail'), puff: fx('puff'), hit: fx('hit'), win: fx('win') };
}

/** The skin layers worn now (null = none), and whether the hat hides the hair. */
export function wornSkins(profile: Pick<Profile, 'shop'>, catalog: ShopCatalog): { outfit: string | null; hat: string | null; back: string | null; hidesHair: boolean } {
  const layer = (slot: SkinSlot) => wornShopItem(profile, catalog, slot)?.layer ?? null;
  return { outfit: layer('outfit'), hat: layer('hat'), back: layer('back'), hidesHair: !!wornShopItem(profile, catalog, 'hat')?.hidesHair };
}

/** The aura and pet worn now, or null. */
export function wornExtras(profile: Pick<Profile, 'shop'>, catalog: ShopCatalog): { aura: AuraRecipe | null; pet: string | null } {
  return { aura: wornShopItem(profile, catalog, 'aura')?.aura ?? null, pet: wornShopItem(profile, catalog, 'pet')?.pet ?? null };
}

/**
 * Decorations bought in the Shop arrive in the Home Dojo's storage (each once, tracked with the other one-time
 * pieces in decorEarning.given). Called when the dojo is opened, so a piece bought before the dojo existed still arrives.
 */
export function giveShopDecor(profile: Profile, dojo: DojoState, catalog: ShopCatalog): string[] {
  const out: string[] = [];
  for (const id of profile.shop.owned) {
    const decor = catalog.items.find((i) => i.id === id)?.decor;
    if (!decor || profile.decorEarning.given.includes(`shop:${decor}`)) continue;
    profile.decorEarning.given.push(`shop:${decor}`);
    out.push(decor);
  }
  if (out.length) addDecorations(dojo, out);
  return out;
}
