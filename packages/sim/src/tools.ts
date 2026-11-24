// Tool Belt (docs/superpowers/specs/2026-11-24-tool-belt-design.md): every self-defense sign-off
// earns a tool. A tool fires from something the player does (its trigger), then waits its cooldown.
// Pure functions over content and training; the firing itself is in world.ts.

import type { ToolDef, ToolTrigger } from './abilities';
import { TICKS_PER_SECOND } from './config';
import { modsFrom, type PlayerMods } from './effects';

/** A tool as a fight uses it: its trigger, its wait, and its effects already added up. */
export interface ToolSetup {
  technique: number;
  trigger: ToolTrigger;
  cooldownTicks: number;
  mods: PlayerMods;
}

/** The fight setups of the equipped tools, in the equipped order. Numbers with no tool are skipped. */
export function toolSetups(defs: readonly ToolDef[], equipped: readonly number[]): ToolSetup[] {
  return equipped.flatMap((n) => {
    const t = defs.find((d) => d.technique === n);
    return t ? [{ technique: t.technique, trigger: t.trigger, cooldownTicks: t.cooldownTicks, mods: modsFrom(t.effects, TICKS_PER_SECOND) }] : [];
  });
}
