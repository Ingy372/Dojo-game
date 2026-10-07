// Abilities that real training unlocks (framework section 5): Forms (kata), Strike
// upgrades (kick combos), Technique Seals (self-defense) and Virtues (stripes).
// Defined in content/abilities/abilities.json and checked here.

import { loadEffect, type Effect } from './effects';

/** A stance the player switches between in a fight. Its numbers apply while it's active. */
export interface FormDef {
  id: string;
  name: string;
  text: string;
  /** Extra Perfect Counter window ticks. */
  counterWindow: number;
  /** Basic attacks this share faster. */
  attackSpeed: number;
  /** Walking this share faster (negative = slower). */
  moveSpeed: number;
  /** Guard raised by this share. */
  guardScale: number;
  /** Power raised by this share. */
  powerScale: number;
}

/** A Strike upgrade or a Technique Seal: one always-on effect. */
export interface PerkDef {
  id: string;
  name: string;
  text: string;
  effect: Effect;
}

export type VirtueKind = 'shield' | 'heal' | 'discipline';

export interface VirtueDef {
  id: string;
  name: string;
  /** Stripe words that grant this Virtue (each school can add its own). */
  words: string[];
  kind: VirtueKind;
  /** shield: damage soaked up; heal: share of max Health restored. */
  amount: number;
  /** How long it lasts (shield, discipline). */
  seconds: number;
  /** What it does, with {n}, {pct} and {s} filled in. */
  text: string;
}

export interface AbilityContent {
  /** forms[0] is the Beginner's Stance everyone starts with. */
  forms: FormDef[];
  strikes: PerkDef[];
  seals: PerkDef[];
  virtues: VirtueDef[];
}

export class AbilityError extends Error {
  constructor(problem: string) {
    super(`Ability data has a problem: ${problem}`);
    this.name = 'AbilityError';
  }
}

const fail = (problem: string): never => {
  throw new AbilityError(problem);
};

function str(v: unknown, where: string): string {
  if (typeof v !== 'string' || v === '') fail(`${where} must be a non-empty text`);
  return v as string;
}
function num(v: unknown, where: string): number {
  if (typeof v !== 'number' || !Number.isFinite(v)) fail(`${where} must be a number`);
  return v as number;
}

export function loadAbilities(data: unknown): AbilityContent {
  const d = data as Record<string, unknown>;
  if (!d || typeof d !== 'object') fail('the file is not an object');
  const listOf = (key: string): Record<string, unknown>[] => {
    if (!Array.isArray(d[key])) fail(`"${key}" must be a list`);
    return d[key] as Record<string, unknown>[];
  };
  const ids = new Set<string>();
  const id = (v: unknown, where: string): string => {
    const s = str(v, where);
    if (ids.has(s)) fail(`two abilities use the id "${s}"`);
    ids.add(s);
    return s;
  };

  const forms = listOf('forms').map((f, i) => {
    const w = `forms[${i + 1}]`;
    const form: FormDef = {
      id: id(f.id, `${w}.id`),
      name: str(f.name, `${w}.name`),
      text: str(f.text, `${w}.text`),
      counterWindow: num(f.counterWindow, `${w}.counterWindow`),
      attackSpeed: num(f.attackSpeed, `${w}.attackSpeed`),
      moveSpeed: num(f.moveSpeed, `${w}.moveSpeed`),
      guardScale: num(f.guardScale, `${w}.guardScale`),
      powerScale: num(f.powerScale, `${w}.powerScale`),
    };
    if (form.moveSpeed <= -0.5 || form.attackSpeed < 0 || form.counterWindow < 0) fail(`${w} has numbers out of range`);
    return form;
  });
  if (forms.length === 0) fail('"forms" needs at least the Beginner\'s Stance');

  const perks = (key: 'strikes' | 'seals'): PerkDef[] =>
    listOf(key).map((p, i) => {
      const w = `${key}[${i + 1}]`;
      return {
        id: id(p.id, `${w}.id`),
        name: str(p.name, `${w}.name`),
        text: str(p.text, `${w}.text`),
        effect: loadEffect(p.effect, (problem) => fail(`${w}: ${problem}`)),
      };
    });

  const words = new Set<string>();
  const virtues = listOf('virtues').map((v, i) => {
    const w = `virtues[${i + 1}]`;
    if (!['shield', 'heal', 'discipline'].includes(v.kind as string)) fail(`${w}.kind must be shield, heal or discipline`);
    if (!Array.isArray(v.words) || v.words.length === 0) fail(`${w}.words must list at least one stripe word`);
    for (const word of v.words as unknown[]) {
      const s = str(word, `${w}.words`);
      if (words.has(s)) fail(`the stripe word "${s}" is used by two Virtues`);
      words.add(s);
    }
    return {
      id: id(v.id, `${w}.id`),
      name: str(v.name, `${w}.name`),
      words: (v.words as string[]).slice(),
      kind: v.kind as VirtueKind,
      amount: num(v.amount, `${w}.amount`),
      seconds: num(v.seconds, `${w}.seconds`),
      text: str(v.text, `${w}.text`),
    };
  });

  return { forms, strikes: perks('strikes'), seals: perks('seals'), virtues };
}
