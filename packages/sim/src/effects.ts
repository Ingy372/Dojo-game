// Effects that change how the player fights. Insights (for one run) and charms
// (gear) both use these, and they stack by adding up. All plain data.

export type EffectType =
  | 'powerScale'
  | 'attackSpeed'
  | 'strikeExtraHit'
  | 'staggerBonus'
  | 'shieldBreaker'
  | 'rippleCounter'
  | 'blockReflect'
  | 'comboSpeed'
  | 'lowHealthFocus'
  | 'startFocus'
  | 'healOnPerfect';

export interface Effect {
  type: EffectType;
  /** The main number (its meaning depends on the type; see PlayerMods). */
  amount: number;
  /** rippleCounter: how far the extra hit reaches (tiles). */
  radius?: number;
  /** comboSpeed: every this many combo hits. */
  everyHits?: number;
  /** comboSpeed: how long the speed burst lasts. */
  seconds?: number;
  /** lowHealthFocus: works below this share of max health (0 to 1). */
  below?: number;
}

/** The sum of all the player's effects. Zero means "no change". */
export interface PlayerMods {
  /** +share of Power (0.2 = +20%). */
  powerScale: number;
  /** Basic attacks come this share faster (0.2 = 20% shorter gap). */
  attackSpeed: number;
  /** Strikes add a second hit at this share of the Strike's strength (0 = none). */
  strikeExtraHit: number;
  /** Extra damage share against staggered enemies. */
  staggerBonus: number;
  /** Any hit breaks shields. */
  shieldBreaker: boolean;
  /** Perfect Counters also hit enemies within this many tiles (0 = off)... */
  rippleRadius: number;
  /** ...with this move strength. */
  rippleStrength: number;
  /** Blocks send this share of the full hit back to the attacker. */
  blockReflect: number;
  /** Every this many combo hits gives a speed burst (0 = off)... */
  comboSpeedEvery: number;
  /** ...of this extra share of walking speed... */
  comboSpeedBonus: number;
  /** ...for this many ticks. */
  comboSpeedTicks: number;
  /** Below this share of max health (0 = off)... */
  lowHealthBelow: number;
  /** ...Focus gains are multiplied by this. */
  lowHealthFocusScale: number;
  /** Focus at the start of each room. */
  startFocus: number;
  /** Health restored by each Perfect Counter. */
  healOnPerfect: number;
}

export function noMods(): PlayerMods {
  return {
    powerScale: 0,
    attackSpeed: 0,
    strikeExtraHit: 0,
    staggerBonus: 0,
    shieldBreaker: false,
    rippleRadius: 0,
    rippleStrength: 0,
    blockReflect: 0,
    comboSpeedEvery: 0,
    comboSpeedBonus: 0,
    comboSpeedTicks: 0,
    lowHealthBelow: 0,
    lowHealthFocusScale: 1,
    startFocus: 0,
    healOnPerfect: 0,
  };
}

/** Adds up a list of effects into one set of mods. */
export function modsFrom(effects: readonly Effect[], ticksPerSecond: number): PlayerMods {
  const m = noMods();
  for (const e of effects) {
    switch (e.type) {
      case 'powerScale':
        m.powerScale += e.amount;
        break;
      case 'attackSpeed':
        m.attackSpeed = Math.min(0.6, m.attackSpeed + e.amount);
        break;
      case 'strikeExtraHit':
        m.strikeExtraHit += e.amount;
        break;
      case 'staggerBonus':
        m.staggerBonus += e.amount;
        break;
      case 'shieldBreaker':
        m.shieldBreaker = true;
        break;
      case 'rippleCounter':
        m.rippleRadius = Math.max(m.rippleRadius, e.radius ?? 0);
        m.rippleStrength += e.amount;
        break;
      case 'blockReflect':
        m.blockReflect += e.amount;
        break;
      case 'comboSpeed':
        m.comboSpeedEvery = e.everyHits ?? 10;
        m.comboSpeedBonus += e.amount;
        m.comboSpeedTicks = Math.max(m.comboSpeedTicks, Math.round((e.seconds ?? 3) * ticksPerSecond));
        break;
      case 'lowHealthFocus':
        m.lowHealthBelow = Math.max(m.lowHealthBelow, e.below ?? 0.5);
        m.lowHealthFocusScale *= e.amount;
        break;
      case 'startFocus':
        m.startFocus += e.amount;
        break;
      case 'healOnPerfect':
        m.healOnPerfect += e.amount;
        break;
    }
  }
  return m;
}

const TYPES: readonly EffectType[] = [
  'powerScale',
  'attackSpeed',
  'strikeExtraHit',
  'staggerBonus',
  'shieldBreaker',
  'rippleCounter',
  'blockReflect',
  'comboSpeed',
  'lowHealthFocus',
  'startFocus',
  'healOnPerfect',
];

/** Checks an effect from a data file. `fail` throws the caller's own error type. */
export function loadEffect(data: unknown, fail: (problem: string) => never): Effect {
  if (typeof data !== 'object' || data === null) fail('"effect" must be an object');
  const e = data as Record<string, unknown>;
  if (!TYPES.includes(e.type as EffectType)) fail(`"effect.type" must be one of: ${TYPES.join(', ')}`);
  const num = (key: string, required: boolean): number | undefined => {
    const v = e[key];
    if (v === undefined && !required) return undefined;
    if (typeof v !== 'number' || !Number.isFinite(v) || v < 0) fail(`"effect.${key}" must be a number of 0 or more`);
    return v as number;
  };
  const type = e.type as EffectType;
  const out: Effect = { type, amount: num('amount', type !== 'shieldBreaker') ?? 0 };
  const radius = num('radius', type === 'rippleCounter');
  const everyHits = num('everyHits', type === 'comboSpeed');
  const seconds = num('seconds', type === 'comboSpeed');
  const below = num('below', type === 'lowHealthFocus');
  if (radius !== undefined) out.radius = radius;
  if (everyHits !== undefined) out.everyHits = everyHits;
  if (seconds !== undefined) out.seconds = seconds;
  if (below !== undefined) out.below = below;
  return out;
}
