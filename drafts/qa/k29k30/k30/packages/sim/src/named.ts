// Named monsters (M7-N1, drafts/planning/named-monster-proposal.md): once in a while a normal
// enemy shows up as a one-of-a-kind creature with a name, drifting gold sparkles, x1.5 Health
// and one extra tell. Every number and line comes from content/named/named.json.
// It's a happy surprise, never a prize to chase: no counters, no timers, no power.

import type { EnemyDef } from './enemy';

export interface NamedMonsterDef {
  id: string;
  /** The normal enemy it is a named version of. */
  baseEnemy: string;
  name: string;
  tier: number;
  lines: { meet: string; senseiTip: string; freed: string };
  journal: { name: string; fact: string; lore: string; stampText: string };
  /** Home Dojo decoration id given once, on the first win. */
  sticker: string;
}

export interface NamedRules {
  chancePerRun: number;
  minBeltTier: number;
  /** First room of a floor (1 = the first room) a named monster can be in. */
  earliestRoom: number;
  /** A profile's first runs never have one. */
  skipFirstRuns: number;
  /** Health scale (the only stat that changes). */
  health: number;
  /** How long the name plate under its feet shows. */
  plateSeconds: number;
}

export interface NamedContent {
  rules: NamedRules;
  monsters: NamedMonsterDef[];
  journalTitle: string;
  /** The Home Dojo button that opens the journal. */
  journalButton: string;
  journalUnknown: { name: string; fact: string };
  tierNames: Record<string, string>;
  senseiIntro: string;
}

/** Which named monster is in a room, and which of the room's enemy spawns it replaces. */
export interface NamedSpawn {
  spawn: number;
  id: string;
}

/** One saved Journal entry: no counts or dates, on purpose. */
export interface JournalEntry {
  met: boolean;
  beaten: boolean;
}

function fail(msg: string): never {
  throw new Error(`Named monsters: ${msg}`);
}

function num(v: unknown, where: string, min: number, max = Infinity): number {
  if (typeof v !== 'number' || !Number.isFinite(v) || v < min || v > max) fail(`"${where}" must be a number from ${min} to ${max}`);
  return v;
}

function text(v: unknown, where: string): string {
  if (typeof v !== 'string' || !v.trim()) fail(`"${where}" must be some text`);
  return v;
}

/** Checks content/named/named.json against the loaded enemies, or throws a clear error. */
export function loadNamed(data: unknown, enemies: Record<string, EnemyDef>): NamedContent {
  const d = (data ?? {}) as Record<string, any>;
  const r = d.rules ?? {};
  const rules: NamedRules = {
    chancePerRun: num(r.chancePerRun, 'rules.chancePerRun', 0, 1),
    minBeltTier: num(r.minBeltTier, 'rules.minBeltTier', 1),
    earliestRoom: num(r.earliestRoom, 'rules.earliestRoom', 1),
    skipFirstRuns: num(r.skipFirstRuns, 'rules.skipFirstRuns', 0),
    health: num(r.health, 'rules.health', 1),
    plateSeconds: num(r.plateSeconds, 'rules.plateSeconds', 0),
  };
  if (!Array.isArray(d.monsters)) fail('"monsters" must be a list');
  const ids = new Set<string>();
  const monsters = (d.monsters as Record<string, any>[]).map((m, i): NamedMonsterDef => {
    const where = `monster ${i + 1}`;
    const id = text(m.id, `${where}.id`);
    if (ids.has(id)) fail(`two monsters use the id "${id}"`);
    ids.add(id);
    const baseEnemy = text(m.baseEnemy, `${id}.baseEnemy`);
    const base = enemies[baseEnemy];
    if (!base) fail(`"${id}" is a named "${baseEnemy}", which doesn't exist`);
    if (base.boss) fail(`"${id}": bosses are never named`);
    return {
      id,
      baseEnemy,
      name: text(m.name, `${id}.name`),
      tier: num(m.tier, `${id}.tier`, 1),
      lines: { meet: text(m.lines?.meet, `${id}.lines.meet`), senseiTip: text(m.lines?.senseiTip, `${id}.lines.senseiTip`), freed: text(m.lines?.freed, `${id}.lines.freed`) },
      journal: {
        name: text(m.journal?.name, `${id}.journal.name`),
        fact: text(m.journal?.fact, `${id}.journal.fact`),
        lore: text(m.journal?.lore, `${id}.journal.lore`),
        stampText: text(m.journal?.stampText, `${id}.journal.stampText`),
      },
      sticker: text(m.sticker, `${id}.sticker`),
    };
  });
  return {
    rules,
    monsters,
    journalTitle: text(d.journalTitle, 'journalTitle'),
    journalButton: text(d.journalButton, 'journalButton'),
    journalUnknown: { name: text(d.journalUnknown?.name, 'journalUnknown.name'), fact: text(d.journalUnknown?.fact, 'journalUnknown.fact') },
    tierNames: d.tierNames && typeof d.tierNames === 'object' ? { ...d.tierNames } : {},
    senseiIntro: text(d.senseiIntro, 'senseiIntro'),
  };
}

/** A named monster's stats: only Health changes (same Power, Guard, speed, wind-up and Counter window). */
export function namedDef(def: EnemyDef, rules: NamedRules): EnemyDef {
  return { ...def, maxHealth: Math.round(def.maxHealth * rules.health) };
}

/** The named monsters a floor at this belt tier can have: the highest tier at or below it that has any. */
export function namedForTier(content: NamedContent, tier: number): NamedMonsterDef[] {
  if (tier < content.rules.minBeltTier) return [];
  const tiers = content.monsters.map((m) => m.tier).filter((t) => t <= tier);
  if (tiers.length === 0) return [];
  const top = Math.max(...tiers);
  return content.monsters.filter((m) => m.tier === top);
}

/** Reads a saved Monster Journal; anything damaged or missing becomes empty (every card "?"). */
export function readJournal(v: unknown): Record<string, JournalEntry> {
  const out: Record<string, JournalEntry> = {};
  if (!v || typeof v !== 'object') return out;
  for (const [k, e] of Object.entries(v as Record<string, any>)) {
    if (e && typeof e === 'object') out[k] = { met: e.met === true || e.beaten === true, beaten: e.beaten === true };
  }
  return out;
}
