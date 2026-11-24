// R-PROGRESSION-BETA (PB-01): the Loadout's five slots, the Seal slot count by belt, the pure
// equip rules for Seals, and the one-time seed for saves from before slots. Nothing here changes
// a fight by itself: `characterSetup` reads the Stance, Virtue, Seals (PB-02), Strike (PB-03) and
// kata power (PB-04).

import type { AbilityContent } from './abilities';
import { SEAL_SLOTS_BY_TIER, TOOL_BELT } from './config';
import type { SealFamilyDef } from './abilities';
import { earnedTools } from './tools';
import { emptyLoadout, type Loadout, type Profile } from './profile';
import { unlockedFamilies } from './sealFamilies';
import { earnedKataSignatures } from './kataPowers';
import { earnedStrikes, resolveStrikeId } from './strikes';
import type { TrainingState } from './training';

/** How many Seal slots a belt tier has (tier 1 = white). A tier past the table uses its last row. */
export function sealSlots(tier: number): number {
  const rows = SEAL_SLOTS_BY_TIER;
  const i = Number.isFinite(tier) ? Math.max(1, Math.floor(tier)) : 1;
  return rows[Math.min(rows.length, i) - 1];
}

/**
 * What a student has earned for each slot that holds a choice, oldest first. `strikes` are Strike
 * ids, `families` Seal family ids, `kataPowers` kata power ids.
 * `families` come from the signed-off self-defense techniques (PB-02), `kataPowers` from the
 * signed-off katas (PB-04). The caller can pass its own lists (the tests do).
 */
export interface LoadoutEarned {
  strikes: readonly string[];
  families: readonly string[];
  kataPowers: readonly string[];
  /** Tool Belt: technique numbers with an earned tool, oldest first. */
  tools: readonly number[];
}

/**
 * The Strike, Seal family and kata power ids a student has earned, oldest first. Strikes (PB-03)
 * are the ones in content/abilities/strikes.json whose kick combo is signed off; Spin Kick is the
 * empty slot, so it is not listed.
 */
export function earnedPicks(training: TrainingState, abilities: AbilityContent): LoadoutEarned {
  const strikes = earnedStrikes(training, abilities.strikeDefs);
  return { strikes, families: unlockedFamilies(training, abilities.families), kataPowers: earnedKataSignatures(training, abilities.kataSignatures), tools: earnedTools(training, abilities.tools) };
}

/**
 * A loadout with every pick the student has not earned put back to its slot's default: a Strike
 * or kata power not earned is null, a Seal not earned is dropped, repeats are dropped, and Seals
 * past `slots` are dropped from the end. Never an error. Stance and Virtue are left to
 * `normalizeLoadout`.
 */
export function normalizeSlots(loadout: Loadout, earned: LoadoutEarned, slots: number, pockets: number = TOOL_BELT.maxPockets): Pick<Loadout, 'strike' | 'kata' | 'seals' | 'tools'> {
  const seals = loadout.seals.filter((f, i, all) => earned.families.includes(f) && all.indexOf(f) === i).slice(0, slots);
  // Tool Belt: tools not earned or repeated are dropped, then any past the pockets from the end.
  const tools = (loadout.tools ?? []).filter((n, i, all) => earned.tools.includes(n) && all.indexOf(n) === i).slice(0, pockets);
  return {
    tools,
    strike: loadout.strike !== null && earned.strikes.includes(loadout.strike) ? loadout.strike : null,
    kata: loadout.kata !== null && earned.kataPowers.includes(loadout.kata) ? loadout.kata : null,
    seals,
  };
}

export type EquipSealResult = 'equipped' | 'already' | 'locked' | 'full';

/**
 * Puts a Seal family in a free slot. 'locked' = not earned, 'already' = it is in a slot (a family
 * is never in two), 'full' = every slot is used: the screen asks which one to swap, nothing
 * changes silently. The loadout is returned unchanged unless the result is 'equipped'.
 */
export function equipSeal(loadout: Loadout, family: string, unlocked: readonly string[], slots: number): { loadout: Loadout; result: EquipSealResult } {
  if (!unlocked.includes(family)) return { loadout, result: 'locked' };
  if (loadout.seals.includes(family)) return { loadout, result: 'already' };
  if (loadout.seals.length >= slots) return { loadout, result: 'full' };
  return { loadout: { ...loadout, seals: [...loadout.seals, family] }, result: 'equipped' };
}

/** Swaps the Seal in `out` for `family` (the answer to a 'full' equip). Unchanged if either is not valid. */
export function swapSeal(loadout: Loadout, out: string, family: string, unlocked: readonly string[]): Loadout {
  if (!unlocked.includes(family) || loadout.seals.includes(family) || !loadout.seals.includes(out)) return loadout;
  return { ...loadout, seals: loadout.seals.map((f) => (f === out ? family : f)) };
}

/** Takes a Seal family out of its slot. Always allowed. */
export function removeSeal(loadout: Loadout, family: string): Loadout {
  return { ...loadout, seals: loadout.seals.filter((f) => f !== family) };
}

/** What `migrateLoadoutV2` needs to know about the student. Oldest first. */
export interface LoadoutSeedInput {
  tier: number;
  earned: LoadoutEarned;
}

/**
 * The one-time seed for a save from before slots (R-PROGRESSION-BETA section 7). Strike: the
 * newest one earned (so nobody is set back), null if none. Seals: filled up to `sealSlots(tier)`
 * with the families earned first. Kata: null. Existing picks are kept. `note` is true only when
 * the student had Seals (so something moved into a slot). Running it on its own output changes
 * nothing.
 */
export function migrateLoadoutV2(loadout: Loadout | null, input: LoadoutSeedInput): { loadout: Loadout | null; note: boolean } {
  const base = loadout ?? emptyLoadout();
  const slots = sealSlots(input.tier);
  const kept = normalizeSlots(base, input.earned, slots).seals;
  const seals = [...kept, ...input.earned.families.filter((f) => !kept.includes(f))].slice(0, slots);
  const newest = input.earned.strikes[input.earned.strikes.length - 1] ?? null;
  const strike = base.strike ?? newest;
  const out: Loadout = { ...base, strike, seals };
  const changed = loadout !== null || strike !== null || seals.length > 0;
  return { loadout: changed ? out : null, note: input.earned.families.length > 0 };
}

/**
 * Runs `migrateLoadoutV2` on a profile once, guarded by `profile.loadoutV2`. Returns true if it ran.
 * It also fills the Strike slot, so it marks `strikeSeeded` too.
 * The client calls it once at start (`seedLoadout` in game/student.ts), where the student's
 * earned families and Strikes are known.
 */
export function seedLoadoutV2(profile: Profile, input: LoadoutSeedInput): boolean {
  if (profile.loadoutV2) return false;
  const seeded = migrateLoadoutV2(profile.loadout, input);
  profile.loadout = seeded.loadout;
  profile.showSlotNote = seeded.note;
  profile.loadoutV2 = true;
  profile.strikeSeeded = true;
  return true;
}

/**
 * PB-03: fills the Strike slot, once, for a save that `seedLoadoutV2` already ran on (PB-02 saved
 * it when no Strike could be earned yet), guarded by `profile.strikeSeeded`. The Strike is the
 * newest one earned, so nobody is set back; a Strike already in the slot is kept; none earned
 * leaves the slot empty (Spin Kick). Old Strike ids in the slot become their new ids. Returns true if
 * it ran. The loadout stays null when there is nothing to put in it.
 */
export function seedStrikeSlot(profile: Profile, abilities: AbilityContent, earned: readonly string[]): boolean {
  if (profile.strikeSeeded) return false;
  const kept = profile.loadout ? resolveStrikeId(abilities.strikeDefs, profile.loadout.strike) : null;
  const strike = kept !== null && earned.includes(kept) ? kept : earned[earned.length - 1] ?? null;
  if (strike !== null) profile.loadout = { ...(profile.loadout ?? emptyLoadout()), strike };
  profile.strikeSeeded = true;
  return true;
}

/**
 * OV-B1: one Sensei's Pick line. 'added' went into an empty slot, 'swapped' sent `out` to rest,
 * 'ready' is earned but not moved (Sensei's Pick off, or more new Seals than slots).
 */
export interface PickLine {
  kind: 'added' | 'swapped' | 'ready';
  slot: 'strike' | 'seal' | 'tool';
  move: string;
  out?: string;
}

/**
 * OV-B1 (review 6.3): after a sign-off, the newest Kick goes in the Strike slot and (Tool Belt) the
 * newest tools go in pockets; when the pockets are full the oldest tool rests. Seal families are no
 * longer picked (the Tool Belt replaced them). With Sensei's Pick off nothing moves. Each move is
 * handled once (`picksKnown`; tools as "tool-<n>"); the first check only records what is already
 * earned. Returns one line per new move, in the order earned (a tool's move is its number as text).
 */
export function senseiPick(profile: Profile, earned: LoadoutEarned, tier: number, pockets: number = TOOL_BELT.startPockets): PickLine[] {
  const toolKey = (n: number) => `tool-${n}`;
  if (profile.picksKnown === null) {
    profile.picksKnown = [...earned.strikes, ...earned.tools.map(toolKey)];
    return [];
  }
  const known = new Set(profile.picksKnown);
  const strikes = earned.strikes.filter((id) => !known.has(id));
  const tools = earned.tools.filter((n) => !known.has(toolKey(n)));
  if (strikes.length === 0 && tools.length === 0) return [];
  profile.picksKnown = [...profile.picksKnown, ...strikes, ...tools.map(toolKey)];
  const ready = (slot: PickLine['slot']) => (move: string): PickLine => ({ kind: 'ready', slot, move });
  if (!profile.senseiPick) return [...strikes.map(ready('strike')), ...tools.map(String).map(ready('tool'))];

  const lines: PickLine[] = strikes.slice(0, -1).map(ready('strike'));
  const base = profile.loadout ?? emptyLoadout();
  const kept = normalizeSlots(base, earned, sealSlots(tier), pockets);
  let strike = kept.strike;
  const newest = strikes[strikes.length - 1];
  if (newest !== undefined) {
    lines.push(strike === null ? { kind: 'added', slot: 'strike', move: newest } : { kind: 'swapped', slot: 'strike', move: newest, out: strike });
    strike = newest;
  }
  const fit = tools.length > pockets ? tools.length - pockets : 0;
  lines.push(...tools.slice(0, fit).map(String).map(ready('tool')));
  let pocketed = kept.tools;
  for (const n of tools.slice(fit)) {
    if (pocketed.length < pockets) {
      lines.push({ kind: 'added', slot: 'tool', move: String(n) });
      pocketed = [...pocketed, n];
    } else {
      lines.push({ kind: 'swapped', slot: 'tool', move: String(n), out: String(pocketed[0]) });
      pocketed = [...pocketed.slice(1), n];
    }
  }
  profile.loadout = { ...base, strike, tools: pocketed };
  return lines;
}

/** The student tapped the one-time note away. */
export function dismissSlotNote(profile: Profile): void {
  profile.showSlotNote = false;
}

/** The earned picks and the belt tier for a student, ready for `seedLoadoutV2`. */
export function seedInputFor(training: TrainingState, abilities: AbilityContent): LoadoutSeedInput {
  return { tier: training.tier, earned: earnedPicks(training, abilities) };
}

export type EquipToolResult = 'ok' | 'already' | 'notEarned' | 'full';

/**
 * Tool Belt: puts a tool in a free pocket. 'notEarned' = its technique isn't signed off, 'already' =
 * it is in a pocket, 'full' = every pocket is used (the screen asks which one to swap). The loadout
 * is returned unchanged unless the result is 'ok'.
 */
export function equipTool(loadout: Loadout, technique: number, earned: readonly number[], pockets: number): { loadout: Loadout; result: EquipToolResult } {
  if (!earned.includes(technique)) return { loadout, result: 'notEarned' };
  if (loadout.tools.includes(technique)) return { loadout, result: 'already' };
  if (loadout.tools.length >= pockets) return { loadout, result: 'full' };
  return { loadout: { ...loadout, tools: [...loadout.tools, technique] }, result: 'ok' };
}

/** Tool Belt: swaps the tool in pocket `out` for `technique`. Unchanged if either is not valid. */
export function swapTool(loadout: Loadout, out: number, technique: number, earned: readonly number[]): Loadout {
  if (!earned.includes(technique) || loadout.tools.includes(technique) || !loadout.tools.includes(out)) return loadout;
  return { ...loadout, tools: loadout.tools.map((n) => (n === out ? technique : n)) };
}

/** Tool Belt: takes a tool out of its pocket. Always allowed. */
export function removeTool(loadout: Loadout, technique: number): Loadout {
  return { ...loadout, tools: loadout.tools.filter((n) => n !== technique) };
}

/**
 * Tool Belt: the one-time conversion of a save from before tools (guarded by `toolBeltSeeded`).
 * Pockets fill with the earned tools of the Seal families that were equipped (in slot order, each
 * family's techniques in number order), then the newest earned tools, up to `pockets`. Every earned
 * tool is marked known to Sensei's Pick so none of them shows again as new. Returns true if it ran.
 */
export function seedToolBelt(profile: Profile, earned: readonly number[], pockets: number, families: readonly SealFamilyDef[]): boolean {
  if (profile.toolBeltSeeded) return false;
  const base = profile.loadout ?? emptyLoadout();
  const fromSeals = base.seals.flatMap((id) => (families.find((f) => f.id === id)?.ranks.map((r) => r.technique) ?? []).filter((n) => earned.includes(n)).sort((x, y) => x - y));
  const order = [...fromSeals, ...[...earned].reverse()];
  const tools = order.filter((n, i) => order.indexOf(n) === i).slice(0, pockets);
  const head = tools.filter((n) => fromSeals.includes(n));
  const newest = tools.filter((n) => !fromSeals.includes(n)).sort((x, y) => x - y);
  if (tools.length > 0 || profile.loadout) profile.loadout = { ...base, tools: [...head, ...newest] };
  if (profile.picksKnown !== null) profile.picksKnown = [...profile.picksKnown, ...earned.map((n) => `tool-${n}`).filter((k) => !profile.picksKnown!.includes(k))];
  profile.toolBeltSeeded = true;
  return true;
}
