// Reward moments (framework section 3, core-design section 9): when DojoForge records
// new progress, the next time the game opens it celebrates it. The game remembers what
// it has already celebrated as a small snapshot. Moments come biggest first:
// promotion, then stripes, then sign-offs, then Sensei's Seal, then the Blessing.

import type { BeltInfo, RequirementStatus, TrainingState, VirtueInfo } from './training';
import { byTier, TRAINING_STATS } from './config';
import { virtueTitle } from './training';

/** R-BAL-12d: what a piece of real training gave (whole numbers, gains only). */
export interface TrainingGain {
  power: number;
  health: number;
  guard: number;
}

const tierOfBelt = (t: Pick<TrainingState, 'belts' | 'tier'>, belt: string) => {
  const i = t.belts.findIndex((b) => b.id === belt || b.name === belt);
  return i < 0 ? t.tier : i + 1;
};

/** What these sign-offs added (each at the belt it belongs to). */
export function signOffGain(t: Pick<TrainingState, 'belts' | 'tier'>, reqs: ReadonlyArray<{ belt: string }>): TrainingGain {
  const g = { power: 0, health: 0, guard: 0 };
  for (const r of reqs) {
    const v = byTier(TRAINING_STATS, tierOfBelt(t, r.belt)).signOff;
    g.power += v.power;
    g.health += v.maxHealth;
  }
  return g;
}

/** What one stripe earned at `belt` (id or name) added. */
export function stripeGain(t: Pick<TrainingState, 'belts' | 'tier'>, belt: string): TrainingGain {
  return { power: 0, health: 0, guard: byTier(TRAINING_STATS, tierOfBelt(t, belt)).stripe.guard };
}

/** Fills a gain line from content/settings/training-gains.json. */
export function gainText(template: string, g: TrainingGain): string {
  return template.replace('{power}', `${g.power}`).replace('{health}', `${g.health}`).replace('{guard}', `${g.guard}`);
}

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
  /**
   * First return home (M7-P4): the opening card of the unlock cascade. The sign-offs and
   * stripes already earned follow as their own moments. A player with no sign-offs yet gets
   * the preview instead: the Beginner's Stance and what the first sign-off unlocks.
   */
  | { kind: 'welcome'; name: string; belt: BeltInfo; count: number; preview: WelcomePreview | null }
  /** The biggest moment: a real promotion. */
  | { kind: 'promotion'; from: BeltInfo; to: BeltInfo; levelCap: number; preview: RequirementStatus[] }
  | { kind: 'stripe'; word: string; virtue: string; rank: number; belt: string }
  | { kind: 'signOff'; requirement: RequirementStatus; ability: string }
  /** Several sign-offs at once (more than 3) are shown together. */
  | { kind: 'signOffs'; list: Array<{ requirement: RequirementStatus; ability: string }> }
  | { kind: 'testApproved'; testDate: string | null }
  | { kind: 'blessing' };

export interface WelcomePreview {
  /** The Form everyone starts with (forms[0]). */
  stance: string;
  /** The next technique to get signed off, and what it unlocks. */
  next: RequirementStatus | null;
  ability: string;
}

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
export function rewardMoments(prev: ProgressSnapshot | null, t: TrainingState, stance = "Beginner's Stance"): RewardMoment[] {
  if (!prev || prev.studentId !== t.studentId) {
    return unlockCascade(t, stance);
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

/**
 * The unlock cascade on the first return home (M7-P4, core-design 0:10): "You've already
 * earned these in the dojo." The opening card, then each sign-off in the order it was earned
 * (more than 3 are shown together), then each stripe. Nothing earned yet: the preview.
 */
export function unlockCascade(t: TrainingState, stance: string): RewardMoment[] {
  const signed = t.requirements
    .filter((r) => r.signedOff)
    .map((r, i) => ({ r, i }))
    .sort((a, b) => (a.r.signedOffOn ?? '9999').localeCompare(b.r.signedOffOn ?? '9999') || a.i - b.i)
    .map(({ r }) => ({ requirement: r, ability: abilityLabel(t, r.id) }));
  const stripes: RewardMoment[] = t.virtues.flatMap((v) =>
    v.earned.map((s, i) => ({ kind: 'stripe' as const, word: s.word, virtue: titleAtRank(v, i + 1), rank: i + 1, belt: t.belts.find((b) => b.id === s.belt)?.name ?? s.belt })),
  );
  const count = signed.length + stripes.length;
  const next = t.path.next;
  const preview: WelcomePreview | null = count === 0 ? { stance, next, ability: next ? abilityLabel(t, next.id) : '' } : null;
  const out: RewardMoment[] = [{ kind: 'welcome', name: t.firstName, belt: t.belt, count, preview }];
  if (signed.length > MAX_SINGLE_SIGNOFFS) out.push({ kind: 'signOffs', list: signed });
  else for (const f of signed) out.push({ kind: 'signOff', ...f });
  out.push(...stripes);
  return out;
}

/**
 * Congratulations-card lines for sign-offs. Real sign-offs say "signed off"; techniques only
 * counted because the student already passed that rank (legacy) say "practiced".
 */
export function signOffLines(list: readonly Pick<RequirementStatus, 'name' | 'legacy'>[]): string[] {
  const real = list.filter((r) => !r.legacy);
  const counted = list.filter((r) => r.legacy);
  const line = (group: typeof list, word: string) =>
    group.length === 0 ? [] : group.length === 1 ? [`✓ ${group[0].name} ${word}`] : [`✓ ${group.length} techniques ${word}`];
  return [...line(real, 'signed off'), ...line(counted, 'practiced')];
}

/**
 * Full-screen card words for one technique. A real sign-off says who signed it off; a
 * technique counted from an earlier rank (legacy) says "practiced".
 */
export function signOffCardText(r: Pick<RequirementStatus, 'name' | 'legacy' | 'signedOffBy'>): { badge: string; line: string } {
  if (r.legacy) return { badge: 'PRACTICED!', line: `You practiced ${r.name}!` };
  return { badge: 'SIGNED OFF!', line: `${r.signedOffBy ?? 'Sensei'} signed off ${r.name}!` };
}

/** Title for the many-techniques card: "signed off" for real sign-offs, "practiced" for counted ones. */
export function signOffsTitle(list: readonly Pick<RequirementStatus, 'legacy'>[]): string {
  const counted = list.filter((r) => r.legacy).length;
  const real = list.length - counted;
  if (counted === 0) return `${real} techniques signed off!`;
  if (real === 0) return `${counted} techniques practiced!`;
  return `${real} signed off, ${counted} practiced!`;
}

/**
 * True when this sign-off lit a Gate lock: the technique is one of the current rank's locks
 * and was really signed off. Counted (legacy) and catch-up items never light a lock.
 */
export function litGateLock(t: Pick<TrainingState, 'gate'>, r: Pick<RequirementStatus, 'id' | 'legacy'>): boolean {
  return !r.legacy && t.gate.locks.some((l) => l.id === r.id);
}

/**
 * P-MENU-d (Manager call): one row on the many-techniques card. When the card mixes real
 * sign-offs and counted ones, a real sign-off keeps the green ✓ and a counted one gets a
 * plain ○ and "(practiced)", so you can tell which rows Sensei really signed off.
 */
export function signOffsRow(r: Pick<RequirementStatus, 'name' | 'legacy'>, ability: string, mixed: boolean): { text: string; real: boolean } {
  const real = !r.legacy;
  if (!mixed || real) return { text: `✓ ${r.name}: ${ability}`, real };
  return { text: `○ ${r.name}: ${ability} (practiced)`, real };
}

/** True when a many-techniques card has both real sign-offs and counted ones. */
export function signOffsMixed(list: readonly Pick<RequirementStatus, 'legacy'>[]): boolean {
  return list.some((r) => r.legacy) && list.some((r) => !r.legacy);
}
