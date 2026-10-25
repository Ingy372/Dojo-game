// P-MENU2-e: the Fighting Style model (no Phaser, so Vitest can check it). Two slots (Stance and
// Virtue, D2), a tray of picks for the chosen slot, and the "Always with you" row. Tap a slot,
// then tap a pick (D4). Wording comes from content/abilities/fighting-style.json.

import { unlockedForms, virtueTitle, type AbilityContent, type Loadout, type TrainingState } from '@dojo/sim';
import words from '../../../../content/abilities/fighting-style.json';
import { MIN_TAP, S1, S2, TYPE } from './tokens';

export const STYLE_WORDS = words;

export type StyleSlot = 'stance' | 'virtue';

export interface StylePick {
  id: string;
  slot: StyleSlot;
  name: string;
  /** One plain line, no numbers (D6). */
  line: string;
  earned: boolean;
  /** Not-yet Forms: the Trophy Case requirement, so its sheet can open. */
  requirementId?: string;
}

export interface AlwaysItem {
  id: string;
  name: string;
}

export interface StyleModel {
  /** What is in each slot now (the default when the student never picked). Virtue is null before any stripe. */
  current: Record<StyleSlot, StylePick | null>;
  /** Earned picks first, then not-yet ones. */
  trays: Record<StyleSlot, StylePick[]>;
  always: AlwaysItem[];
}

const line = (id: string): string => (words.lines as Record<string, string>)[id] ?? words.lineFallback;

export function buildStyle(training: TrainingState, abilities: AbilityContent, loadout: Loadout | null): StyleModel {
  const forms = unlockedForms(training, abilities);
  const earnedForms: StylePick[] = forms.map((f) => ({ id: f.id, slot: 'stance', name: f.name, line: line(f.id), earned: true }));
  const have = new Set(forms.map((f) => f.id));
  const lockedForms: StylePick[] = [];
  for (const a of training.abilities) {
    if (a.kind !== 'form' || a.unlocked || !a.form || have.has(a.form.id)) continue;
    have.add(a.form.id);
    lockedForms.push({ id: a.form.id, slot: 'stance', name: a.form.name, line: line(a.form.id), earned: false, requirementId: a.requirement.id });
  }

  // The first entry per Virtue is the one a fight uses (loadoutAbilities uses find()).
  const earnedVirtues: StylePick[] = [];
  const vHave = new Set<string>();
  for (const v of training.virtues) {
    if (vHave.has(v.def.id)) continue;
    vHave.add(v.def.id);
    earnedVirtues.push({ id: v.def.id, slot: 'virtue', name: virtueTitle(v), line: line(v.def.id), earned: true });
  }
  const lockedVirtues: StylePick[] = abilities.virtues.filter((d) => !vHave.has(d.id)).map((d) => ({ id: d.id, slot: 'virtue', name: d.name, line: line(d.id), earned: false }));

  // The same defaults a fight uses: the chosen Form if earned, else the first; the chosen Virtue if earned, else today's pick.
  const stance = earnedForms.find((p) => p.id === loadout?.form) ?? earnedForms[0] ?? null;
  const defaultVirtue = training.virtue ? earnedVirtues.find((p) => p.id === training.virtue!.def.id) : undefined;
  const virtue = earnedVirtues.find((p) => p.id === loadout?.virtue) ?? defaultVirtue ?? earnedVirtues[0] ?? null;

  const always = training.abilities
    .filter((a) => (a.kind === 'strike' || a.kind === 'seal') && a.unlocked && a.perk)
    .map((a) => ({ id: a.perk!.id, name: a.perk!.name }));

  return { current: { stance, virtue }, trays: { stance: [...earnedForms, ...lockedForms], virtue: [...earnedVirtues, ...lockedVirtues] }, always };
}

/** The loadout after tapping `pick` with `slot` chosen. Not-yet picks and the wrong slot change nothing. */
export function equipPick(loadout: Loadout | null, slot: StyleSlot, pick: StylePick): Loadout | null {
  if (!pick.earned || pick.slot !== slot) return loadout;
  // B-POLISH-2: re-tapping the equipped pick changes nothing (same object: no re-save, no pop).
  if ((slot === 'stance' ? loadout?.form : loadout?.virtue) === pick.id) return loadout;
  const base: Loadout = { form: loadout?.form ?? null, virtue: loadout?.virtue ?? null };
  return slot === 'stance' ? { ...base, form: pick.id } : { ...base, virtue: pick.id };
}

export interface StyleLayout {
  leftW: number;
  slotW: number;
  slotH: number;
  tileW: number;
  tileH: number;
  perTray: number;
  previewX: number;
  previewW: number;
  previewH: number;
  alwaysY: number;
  icon: number;
  perAlways: number;
}

/** Sizes for a Fighting Style panel w x h (below the switch). Every tap target is at least 44. */
export function styleLayout(w: number, h: number): StyleLayout {
  const leftW = Math.round(w * 0.58);
  const slotW = Math.floor((leftW - S2) / 2);
  const alwaysH = TYPE.label + S1 + MIN_TAP;
  const room = h - alwaysH - 2 * S2;
  const tileH = Math.max(MIN_TAP + 8, Math.min(72, Math.round(room * 0.4)));
  const slotH = Math.max(MIN_TAP, room - tileH);
  const perTray = 3;
  const tileW = Math.floor((leftW - (perTray - 1) * S2) / perTray);
  const previewX = leftW + S2;
  const icon = MIN_TAP;
  return {
    leftW, slotW, slotH, tileW, tileH, perTray,
    previewX, previewW: w - previewX, previewH: slotH + S2 + tileH,
    alwaysY: slotH + S2 + tileH + S2,
    icon, perAlways: Math.max(1, Math.floor((w + S1) / (icon + S1))),
  };
}
