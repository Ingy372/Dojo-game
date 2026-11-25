// R-PROGRESSION-BETA (PB-04): the Kata slot. A kata power is a KataPowerDef from
// content/abilities/kata-powers.json, earned with its kata's teacher sign-off. One is equipped
// per run; its effects (passive only, checked when the data loads) join the character's effects.

import type { KataPowerDef, KataSignatureDef } from './abilities';
import type { Effect } from './effects';
import type { TrainingState } from './training';

/** The kata power ids a student can equip, in curriculum order: each power whose kata is signed off. */
export function earnedKataPowers(training: TrainingState, defs: readonly KataPowerDef[]): string[] {
  const katas = training.abilities.filter((a) => a.kind === 'stance' && a.unlocked).map((a) => a.requirement.id);
  return defs.filter((p) => katas.includes(p.requirement)).sort((a, b) => katas.indexOf(a.requirement) - katas.indexOf(b.requirement)).map((p) => p.id);
}

/** A kata id (saved by the Fighting Style screen before PB-04) as the id of that kata's power. Anything else is unchanged. */
export function resolveKataPowerId(defs: readonly KataPowerDef[], id: string | null): string | null {
  if (id === null) return null;
  return defs.find((p) => p.kata === id)?.id ?? id;
}

/** The equipped kata power's effects (the id is already normalised, so earned). A placeholder has none. */
export function kataPowerEffects(defs: readonly KataPowerDef[], equipped: string | null): Effect[] {
  return defs.find((p) => p.id === equipped)?.effects.map((e) => ({ ...e })) ?? [];
}

// Tool Belt: each kata's signature move for the KATA button (content/abilities/kata-signatures.json).
// The Kata slot (`loadout.kata`) now holds a signature move id.

/** The signature move ids a student has earned, in curriculum order: each move whose kata is signed off. */
export function earnedKataSignatures(training: TrainingState, defs: readonly KataSignatureDef[]): string[] {
  const katas = training.abilities.filter((a) => a.requirement.type === 'kata' && a.unlocked).map((a) => a.requirement.id);
  return defs.filter((m) => katas.includes(m.requirement)).sort((a, b) => katas.indexOf(a.requirement) - katas.indexOf(b.requirement)).map((m) => m.id);
}

/** An old Kata slot id (a kata id, or a kata power id "<kata>-power") as that kata's move id. Anything else is unchanged. */
export function resolveKataSignatureId(defs: readonly KataSignatureDef[], id: string | null): string | null {
  if (id === null) return null;
  const kata = id.endsWith('-power') ? id.slice(0, -'-power'.length) : id;
  return defs.find((m) => m.kata === kata)?.id ?? id;
}
