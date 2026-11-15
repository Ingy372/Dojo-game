// LP-B4 (L13 Stage 1): coins and the looks shop. Coins come from finished runs and Class
// Chests (COINS); the shop sells looks only, for coins only. Nothing here is read by a run, so
// a look can never change a fight. No real money, no selling, no timers, no random amounts.

import { COINS } from './config';
import type { Profile } from './profile';
import type { RunSummary } from './run';

/** What a shop item changes: the gi colour or the hair colour (the belt is never a slot). */
export type ShopSlot = 'gi' | 'hair';

export interface ShopGroup {
  id: string;
  name: string;
  slot: ShopSlot;
}

export interface ShopItem {
  id: string;
  group: string;
  name: string;
  price: number;
  /** The belt tier (1 = first belt) where it goes on the shelf; it stays after that. */
  belt: number;
  /** The tint, "#rrggbb". */
  color: string;
}

export interface ShopCatalog {
  groups: ShopGroup[];
  items: ShopItem[];
}

/** Bought looks and the one worn in each slot (null = the student's own colour). */
export interface ShopSave {
  owned: string[];
  wearing: Record<ShopSlot, string | null>;
}

export function newShopSave(): ShopSave {
  return { owned: [], wearing: { gi: null, hair: null } };
}

export function readShopSave(v: unknown): ShopSave {
  const s = v as Partial<ShopSave> | null;
  const strings = (x: unknown) => (Array.isArray(x) ? x.filter((i): i is string => typeof i === 'string') : []);
  const id = (x: unknown) => (typeof x === 'string' ? x : null);
  return { owned: strings(s?.owned), wearing: { gi: id(s?.wearing?.gi), hair: id(s?.wearing?.hair) } };
}

/** Reads a saved coin total: a whole number, never below 0 (old saves start at 0). */
export function readCoins(v: unknown): number {
  return typeof v === 'number' && Number.isFinite(v) && v > 0 ? Math.floor(v) : 0;
}

const SLOTS: readonly ShopSlot[] = ['gi', 'hair'];
const HEX = /^#[0-9a-f]{6}$/i;
const ID = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** Checks content/shop/catalog.json and throws on the first broken entry. */
export function loadShopCatalog(raw: unknown): ShopCatalog {
  const r = raw as { groups?: unknown; items?: unknown };
  if (!Array.isArray(r?.groups) || !Array.isArray(r?.items)) throw new Error('shop catalog: needs groups and items');
  const groups = r.groups.map((g: Partial<ShopGroup>) => {
    if (typeof g.id !== 'string' || !ID.test(g.id) || typeof g.name !== 'string' || !SLOTS.includes(g.slot as ShopSlot)) throw new Error(`shop group ${JSON.stringify(g)}`);
    return { id: g.id, name: g.name, slot: g.slot as ShopSlot };
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
    return { id: i.id, group: i.group as string, name: i.name, price: i.price as number, belt: i.belt as number, color: i.color.toLowerCase() };
  });
  return { groups, items };
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
  profile.shop.wearing[slotOf(catalog, item)] = id;
  return true;
}

/** Wears an owned look, or takes the slot back to the student's own colour (id null). */
export function wearLook(profile: Profile, catalog: ShopCatalog, slot: ShopSlot, id: string | null): boolean {
  if (id === null) {
    profile.shop.wearing[slot] = null;
    return true;
  }
  const item = catalog.items.find((i) => i.id === id);
  if (!item || !profile.shop.owned.includes(id) || slotOf(catalog, item) !== slot) return false;
  profile.shop.wearing[slot] = id;
  return true;
}

/** The tint worn in each slot, or null for the student's own colour. */
export function wornColors(profile: Pick<Profile, 'shop'>, catalog: ShopCatalog): Record<ShopSlot, string | null> {
  const color = (slot: ShopSlot) => {
    const id = profile.shop.wearing[slot];
    return (id && profile.shop.owned.includes(id) && catalog.items.find((i) => i.id === id)?.color) || null;
  };
  return { gi: color('gi'), hair: color('hair') };
}
