// Reward moments (framework section 3, core-design section 9): when DojoForge records
// new progress, the next time the game opens it celebrates it. The game remembers what
// it has already celebrated as a small snapshot. Moments come biggest first:
// promotion, then stripes, then sign-offs, then Sensei's Seal, then the Blessing.

import type { BeltInfo, RequirementStatus, TrainingState, VirtueInfo } from './training';
import { virtueTitle } from './training';

export interface ProgressSnapshot {
  studentId: string;
  belt: string;
  tier: number;
  /** Requirement ids counted as signed off. */
  signed: string[];
  /** Stripes, as "word|belt|date". */
  stripes: string[];
  approved: boolean;
  lastClass: string | null;
}

export type RewardMoment =
  /** First time this student opens the game: everything their training has unlocked, in one cascade. */
  | { kind: 'welcome'; name: string; belt: BeltInfo; unlocked: RequirementStatus[]; virtues: string[] }
  /** The biggest moment: a real promotion. */
  | { kind: 'promotion'; from: BeltInfo; to: BeltInfo; levelCap: number; preview: RequirementStatus[] }
  | { kind: 'stripe'; word: string; virtue: string; rank: number; belt: string }
  | { kind: 'signOff'; requirement: RequirementStatus; ability: string }
  /** Several sign-offs at once (more than 3) are shown together. */
  | { kind: 'signOffs'; list: Array<{ requirement: RequirementStatus; ability: string }> }
  | { kind: 'testApproved'; testDate: string | null }
  | { kind: 'blessing' };

export const MAX_SINGLE_SIGNOFFS = 3;

export function snapshot(t: TrainingState): ProgressSnapshot {
  return {
    studentId: t.studentId,
    belt: t.belt.id,
    tier: t.tier,
    signed: t.requirements.filter((r) => r.signedOff).map((r) => r.id),
    stripes: stripeKeys(t),
    approved: t.gate.sealLit,
    lastClass: t.lastClass,
  };
}

function stripeKeys(t: TrainingState): string[] {
  return t.virtues.flatMap((v) => v.earned.map((s) => `${s.word}|${s.belt}|${s.earnedOn}`));
}

/** The ability a sign-off unlocks, in words: "Technique Seal: Sweep". */
export function abilityLabel(t: TrainingState, id: string): string {
  const a = t.abilities.find((x) => x.requirement.id === id);
  if (!a) return '';
  const kind = a.kind === 'form' ? 'Form' : a.kind === 'strike' ? 'Strike upgrade' : 'Technique Seal';
  const name = a.form?.name ?? a.perk?.name;
  return name ? `${kind}: ${name}` : `${kind} (power arrives in a later update)`;
}

/** What's new since the last snapshot, biggest celebration first. `prev` null = first time. */
export function rewardMoments(prev: ProgressSnapshot | null, t: TrainingState): RewardMoment[] {
  if (!prev || prev.studentId !== t.studentId) {
    return [
      {
        kind: 'welcome',
        name: t.firstName,
        belt: t.belt,
        unlocked: t.requirements.filter((r) => r.signedOff),
        virtues: t.virtues.map(virtueTitle),
      },
    ];
  }
  // Going down in rank can only happen while testing with fake profiles: nothing to celebrate.
  if (t.tier < prev.tier) return [];

  const out: RewardMoment[] = [];
  if (t.tier > prev.tier) {
    const from = t.belts.findIndex((b) => b.id === prev.belt);
    out.push({
      kind: 'promotion',
      from: { id: prev.belt, name: t.belts[from]?.name ?? prev.belt, color: t.belts[from]?.color ?? '#ffffff', color2: t.belts[from]?.color2 ?? null, tier: prev.tier, degree: t.belts[from]?.degree ?? 0 },
      to: t.belt,
      levelCap: t.levelCap,
      preview: t.gate.locks,
    });
  }

  const oldStripes = new Set(prev.stripes);
  for (const v of t.virtues) {
    v.earned.forEach((s, i) => {
      if (oldStripes.has(`${s.word}|${s.belt}|${s.earnedOn}`)) return;
      out.push({ kind: 'stripe', word: s.word, virtue: titleAtRank(v, i + 1), rank: i + 1, belt: t.belts.find((b) => b.id === s.belt)?.name ?? s.belt });
    });
  }

  const oldSigned = new Set(prev.signed);
  const fresh = t.requirements.filter((r) => r.signedOff && !oldSigned.has(r.id)).map((r) => ({ requirement: r, ability: abilityLabel(t, r.id) }));
  if (fresh.length > MAX_SINGLE_SIGNOFFS) out.push({ kind: 'signOffs', list: fresh });
  else for (const f of fresh) out.push({ kind: 'signOff', ...f });

  if (t.gate.sealLit && !prev.approved) out.push({ kind: 'testApproved', testDate: t.gate.testDate });
  if (t.blessed && t.lastClass !== prev.lastClass) out.push({ kind: 'blessing' });
  return out;
}

function titleAtRank(v: VirtueInfo, rank: number): string {
  return virtueTitle({ ...v, rank });
}
