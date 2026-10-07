// Loot (core-design section 5): gear with a rarity, rolled with a seeded random
// number generator. Item types and drop tables are content (content/loot);
// rarity shares and bad-luck protection are in config.ts.

import { GEAR_CAPS, LOOT, RARITIES, type Rarity } from './config';
import { loadEffect, type Effect, type EffectType } from './effects';
import { nextFloat, pick, pickWeighted, type Rng } from './rng';

export type GearSlot = 'hands' | 'gi' | 'charm';
export const GEAR_SLOTS: readonly GearSlot[] = ['hands', 'gi', 'charm'];

export interface GearStats {
  power: number;
  maxHealth: number;
  guard: number;
}

/** One piece of gear the player found. Plain data, saved in the profile. */
export interface GearItem {
  /** Unique within a profile (or within a run, before it's brought home). */
  uid: string;
  /** The item type's id from content/loot/gear.json. */
  base: string;
  name: string;
  slot: GearSlot;
  rarity: Rarity;
  stats: GearStats;
  /** Charms only. */
  effect: Effect | null;
  /** Charms only: what the effect does, for the player to read. */
  effectText: string;
}

interface GearBase {
  id: string;
  name: string;
  slot: GearSlot;
  effectType: EffectType | null;
  amounts: number[];
  text: string;
}

export interface ChestTable {
  items: number;
  minRarity: Rarity;
  inTimeItems?: number;
  inTimeMinRarity?: Rarity;
}

export interface LootTables {
  tier: keyof typeof GEAR_CAPS;
  slotStats: Record<'hands' | 'gi', Partial<Record<keyof GearStats, number[]>>>;
  bases: GearBase[];
  enemyDropChance: Record<string, number>;
  chests: { treasure: ChestTable; challenge: ChestTable; boss: ChestTable };
}

export class LootError extends Error {
  constructor(problem: string) {
    super(`Loot data has a problem: ${problem}`);
    this.name = 'LootError';
  }
}

const fail = (problem: string): never => {
  throw new LootError(problem);
};

function rarityOf(v: unknown, where: string): Rarity {
  if (!RARITIES.includes(v as Rarity)) fail(`${where} must be one of: ${RARITIES.join(', ')}`);
  return v as Rarity;
}

/** Checks content/loot/gear.json and content/loot/drops.json. */
export function loadLootTables(gear: unknown, drops: unknown): LootTables {
  const g = gear as Record<string, unknown>;
  const d = drops as Record<string, unknown>;
  if (!g || typeof g !== 'object') fail('gear file is not an object');
  if (!d || typeof d !== 'object') fail('drops file is not an object');
  const tier = g.tier as keyof typeof GEAR_CAPS;
  if (!(tier in GEAR_CAPS)) fail(`"tier" must be one of: ${Object.keys(GEAR_CAPS).join(', ')}`);

  const slotStats = g.slotStats as LootTables['slotStats'];
  for (const slot of ['hands', 'gi'] as const) {
    const st = slotStats?.[slot];
    if (!st || typeof st !== 'object') fail(`"slotStats.${slot}" is missing`);
    for (const [k, list] of Object.entries(st)) {
      if (!['power', 'maxHealth', 'guard'].includes(k)) fail(`"slotStats.${slot}.${k}" is not a stat`);
      if (!Array.isArray(list) || list.length < 4 || !list.every((n) => typeof n === 'number' && n >= 0)) {
        fail(`"slotStats.${slot}.${k}" needs 4 numbers (common, uncommon, rare, epic)`);
      }
    }
  }

  if (!Array.isArray(g.items) || g.items.length === 0) fail('"items" must be a list');
  const bases: GearBase[] = (g.items as Record<string, unknown>[]).map((it, i) => {
    const where = `items[${i + 1}]`;
    if (typeof it.id !== 'string' || !it.id) fail(`${where}.id must be a non-empty text`);
    if (typeof it.name !== 'string' || !it.name) fail(`${where}.name must be a non-empty text`);
    if (!['hands', 'gi', 'charm'].includes(it.slot as string)) fail(`${where}.slot must be hands, gi or charm`);
    const slot = it.slot as GearSlot;
    let effectType: EffectType | null = null;
    let amounts: number[] = [];
    let text = '';
    if (slot === 'charm') {
      effectType = loadEffect({ amount: 0, ...(it.effect as object) }, (p) => fail(`${where}: ${p}`)).type;
      if (!Array.isArray(it.amounts) || it.amounts.length < 4) fail(`${where}.amounts needs 4 numbers`);
      amounts = it.amounts as number[];
      if (typeof it.text !== 'string') fail(`${where}.text is missing`);
      text = it.text as string;
    }
    return { id: it.id as string, name: it.name as string, slot, effectType, amounts, text };
  });
  for (const slot of GEAR_SLOTS) if (!bases.some((b) => b.slot === slot)) fail(`there are no ${slot} items`);

  const chance = d.enemyDropChance as Record<string, number>;
  if (!chance || typeof chance !== 'object') fail('"enemyDropChance" is missing');
  for (const [k, v] of Object.entries(chance)) {
    if (typeof v !== 'number' || v < 0 || v > 1) fail(`"enemyDropChance.${k}" must be from 0 to 1`);
  }
  const c = d.chests as Record<string, Record<string, unknown>>;
  const chest = (key: 'treasure' | 'challenge' | 'boss'): ChestTable => {
    const t = c?.[key];
    if (!t || typeof t.items !== 'number' || t.items < 1) fail(`"chests.${key}.items" must be 1 or more`);
    const out: ChestTable = { items: t.items as number, minRarity: rarityOf(t.minRarity, `"chests.${key}.minRarity"`) };
    if (t.inTimeItems !== undefined) out.inTimeItems = t.inTimeItems as number;
    if (t.inTimeMinRarity !== undefined) out.inTimeMinRarity = rarityOf(t.inTimeMinRarity, `"chests.${key}.inTimeMinRarity"`);
    return out;
  };
  return {
    tier,
    slotStats,
    bases,
    enemyDropChance: chance,
    chests: { treasure: chest('treasure'), challenge: chest('challenge'), boss: chest('boss') },
  };
}

export function rarityRank(r: Rarity): number {
  return RARITIES.indexOf(r);
}

/**
 * Rolls a rarity with the shares from config. `dryRuns` (runs in a row without a Rare)
 * shifts weight from Common to Rare (bad-luck protection), and so does `extraRareWeight`
 * (the Dojo Blessing). Never below `min`.
 */
export function rollRarity(rng: Rng, dryRuns: number, min: Rarity = 'common', extraRareWeight = 0): Rarity {
  const w = LOOT.rarityWeights;
  const boost = Math.min(w.common, dryRuns * LOOT.rareWeightPerDryRun + extraRareWeight);
  const weights: Array<[Rarity, number]> = [
    ['common', w.common - boost],
    ['uncommon', w.uncommon],
    ['rare', w.rare + boost],
    ['epic', w.epic],
  ];
  const minRank = rarityRank(min);
  return pickWeighted(
    rng,
    weights.filter(([r]) => rarityRank(r) >= minRank),
  );
}

/** Makes a random piece of gear of a rarity. */
export function makeItem(rng: Rng, tables: LootTables, rarity: Rarity, uid: string): GearItem {
  const base = pick(rng, tables.bases);
  const i = Math.min(3, rarityRank(rarity));
  const cap = GEAR_CAPS[tables.tier];
  const stats: GearStats = { power: 0, maxHealth: 0, guard: 0 };
  let effect: Effect | null = null;
  let effectText = '';
  if (base.slot === 'charm') {
    const amount = base.amounts[i];
    effect = { type: base.effectType!, amount };
    effectText = base.text.replace('{pct}', `${Math.round(amount * 100)}%`).replace('{n}', `${amount}`);
  } else {
    const table = tables.slotStats[base.slot];
    for (const k of ['power', 'maxHealth', 'guard'] as const) {
      const list = table[k];
      if (list) stats[k] = Math.min(cap[k], list[i]);
    }
  }
  return { uid, base: base.id, name: base.name, slot: base.slot, rarity, stats, effect, effectText };
}

/** True for this share of rolls (a seeded coin flip). */
export function chance(rng: Rng, share: number): boolean {
  return nextFloat(rng) < share;
}

/**
 * A hidden "how good is this" number, used only for the better/worse arrows.
 * Never shown to players (CLAUDE.md: Power Rating stays hidden).
 */
export function gearScore(item: GearItem | null): number {
  if (!item) return 0;
  const s = item.stats;
  const charm = item.effect ? 2 + rarityRank(item.rarity) * 3 : 0;
  return s.power * 3 + s.maxHealth * 0.5 + s.guard * 1.5 + charm;
}

/** "up" if `item` is better than what's worn in that slot, "down" if worse, "same" otherwise. */
export function compareGear(item: GearItem, worn: GearItem | null): 'up' | 'down' | 'same' {
  const a = gearScore(item);
  const b = gearScore(worn);
  return a > b ? 'up' : a < b ? 'down' : 'same';
}

/** What a piece of gear does, in short words, e.g. "+2 Power". */
export function describeItem(item: GearItem): string {
  if (item.effect) return item.effectText;
  const parts: string[] = [];
  if (item.stats.power) parts.push(`+${item.stats.power} Power`);
  if (item.stats.maxHealth) parts.push(`+${item.stats.maxHealth} Health`);
  if (item.stats.guard) parts.push(`+${item.stats.guard} Guard`);
  return parts.join('  ');
}
