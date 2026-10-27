// All tunable game numbers live here. Rules are pure and deterministic:
// no Math.random(), no Date.now(), no real time — only tick counts.

/** The rules run on a fixed tick of 20 per second. */
export const TICKS_PER_SECOND = 20;

/** Converts seconds to whole ticks. */
export function secondsToTicks(seconds: number): number {
  return Math.round(seconds * TICKS_PER_SECOND);
}

/** Movement numbers. Distances are in tiles. */
export const MOVEMENT = {
  /** Walking speed at full stick or when walking to a tapped spot, in tiles per second. */
  speedTilesPerSecond: 4.5,
  /** The character's body is a circle this big (a tile is 1). Keep under 0.5 so it fits through one-tile gaps. */
  playerRadius: 0.42,
  /** Stick pushes smaller than this (0 to 1) are ignored, so a resting thumb doesn't drift. */
  stickDeadZone: 0.15,
  /** Stops walking to a tapped spot if blocked for this many ticks. */
  stuckTicks: 10,
} as const;

/**
 * Difficulty settings (core-design section 4, adjusted from Jay's playtest).
 * An enemy wind-up has two parts: the "fill" (the danger circle filling up) and then the
 * Perfect Counter window (the circle holding nearly full). fillScale changes the fill;
 * the window is added on top, so easier difficulties hold "nearly full" longer
 * instead of slowing the whole wind-up down.
 */
export const DIFFICULTY = {
  // Guided: same fill speed as Standard, then a 0.5 s window (Jay, 2026-10-06).
  // B-TUNE-GUIDED: enemyPowerScale multiplies every enemy's Power (Health never changes).
  guided: { counterWindowTicks: 10, fillScale: 1, enemyPowerScale: 0.75 },
  standard: { counterWindowTicks: 6, fillScale: 1, enemyPowerScale: 1 },
  challenge: { counterWindowTicks: 4, fillScale: 0.8, enemyPowerScale: 1 },
} as const;

/** R-CHALLENGE P1: no enemy wind-up is ever shorter than this, on any difficulty (half a second). */
export const MIN_WINDUP_TICKS = 10;

/** How full the danger circle is (0 to 1) when the Perfect Counter window opens. */
export const TELEGRAPH_NEARLY_FULL = 0.85;

export type Difficulty = keyof typeof DIFFICULTY;

/** Combat numbers. Starting values from core-design section 4; tune from playtesting. */
/** R-CHALLENGE P6 (core-design §13): Challenge difficulty can be picked from this belt tier (4th belt) up. */
export const CHALLENGE_FROM_TIER = 4;

/**
 * R-CHALLENGE P3: the screen area (in tiles) a Challenge pattern attack must start inside.
 * It is the smallest view of every supported screen size, taken from the client's camera math
 * (apps/client/src/game/cameraView.ts): width from 1024x768 (6.75 * 1024 / 768 = 9 tiles),
 * height 6.75 tiles at every size. The camera follows the player and stops at the room edges,
 * with a strip of 1.1 tiles above the top wall. A test ties these numbers to the client's.
 */
export const SIM_VIEW = { width: 9, height: 6.75, topStrip: 1.1 } as const;

export const COMBAT = {
  defaultDifficulty: 'standard' as Difficulty,

  /** Starting player stats (later these come from the student's profile). */
  player: { maxHealth: 100, power: 10, guard: 0 },

  focus: {
    max: 100,
    /** Gained for every hit the player lands. */
    perHit: 5,
    /** B-MASHER-a: gained when a basic (or ripple) hit bounces off a shield, so mashing still fills a Strike. */
    perShieldBounce: 6,
    /**
     * Gained for each Perfect Counter in a chain (no Hit taken in between): 1st, 2nd, 3rd,
     * then the last number from then on. A Hit ends the chain; a Block keeps it (S1 change 2).
     */
    perPerfectCounterChain: [25, 30, 35, 40],
  },

  /** Combo damage bonus: at 10 / 20 / 30 hits without being hit. Taking a Hit resets it. */
  comboTiers: [
    { hits: 30, bonus: 0.15 },
    { hits: 20, bonus: 0.1 },
    { hits: 10, bonus: 0.05 },
  ],

  /** Automatic basic attack against the nearest enemy in reach. */
  basicAttack: {
    strength: 1,
    /** Gap between the two bodies (in tiles) that still counts as in reach. */
    reach: 0.55,
    /** Ticks between basic attacks (12 ticks = 0.6 seconds). */
    cooldownTicks: 12,
  },

  /** The Strike button: one heavy hit with a short lunge. */
  strike: {
    focusCost: 30,
    strength: 2.5,
    /** Gap between bodies (tiles) the Strike can reach, lunge included. */
    reach: 1.4,
    /** How far the player lunges toward the target, at most (tiles). */
    lungeTiles: 0.7,
    /** Ticks after a Strike before the next attack. */
    recoveryTicks: 8,
  },

  counter: {
    /** B-MASHER-2 (E3): Mash guard stops for the rest of a room once this many Perfect Counters land in it. */
    mashGuardPerfects: 3,
    /** After pressing Counter, the player holds a guard pose this many ticks (no walking). */
    guardTicks: 10,
    /** The guard pose always lasts at least this long past the Perfect window, so a slightly early press is still a Block. */
    blockTicksAfterWindow: 4,
    /** If nothing was countered, Counter can't be pressed again for this many ticks. */
    missLockoutTicks: 10,
    /** Perfect Counter: enemy staggered this long (1 second). */
    perfectStaggerTicks: 20,
    /** Perfect Counter: the counter hit uses this move strength (2x Power). */
    perfectStrength: 2,
    /** Block: damage taken is multiplied by this. */
    blockDamageMultiplier: 0.5,
  },

  /**
   * The Dash button: a quick burst in the stick's direction (or the way the player faces).
   * No protection while dashing (Jay, 2026-10-06): the player must react in time.
   */
  dash: {
    distanceTiles: 2.5,
    /** The dash covers its distance over this many ticks (0.25 seconds). */
    ticks: 5,
    /** Ticks before Dash can be used again (1.5 seconds), counted from the press. */
    cooldownTicks: 30,
  },

  /** Ticks before the Stance can be switched again (half a second). */
  stanceSwitchTicks: 10,
  /** Second Wind (the Great Effort Virtue) gives back this share of the Focus it used. */
  secondWindFocusBack: 0.5,

  /** Only this many enemies may be attacking at once ("kung fu circle"). */
  maxAttackersAtOnce: 2,
  /** In floor rooms, the next wave of enemies arrives when this many (or fewer) are left. */
  nextWaveWhenLeft: 1,
  /** Enemies waiting their turn circle the player this far outside their attack range (tiles). */
  circleExtraRange: 1.8,
  /** ...moving sideways at this share of their walking speed. */
  circleSpeedShare: 0.5,

  /** Clearing a room with enemies restores this share of max health ("catch your breath"). */
  roomClearHeal: 0.15,
  /** A rest shrine restores this share of max health. */
  restShrineHeal: 0.6,

  /** After defeat, the player is down this long before the room restarts (1.5 seconds). */
  defeatTicks: 30,
  /** A defeated enemy comes back after this long (4 seconds), so practice can continue. */
  enemyRespawnTicks: 80,
  /** A new or returning enemy waits this long before moving (1 second). */
  enemySpawnWaitTicks: 20,
  /** Enemies re-plan their route to the player this often. */
  enemyRepathTicks: 10,
} as const;

/** The floor (core-design section 3): rooms, then the boss. */
export const FLOOR = {
  /** Rooms before the boss room (so a floor is this + 1 rooms). */
  roomsBeforeBoss: 7,
  /** How often each kind of door is offered (higher = more often). */
  doorWeights: { battle: 4, challenge: 1.5, treasure: 0.7, rest: 1.2 },
  /** Treasure rooms: never two in a row (Jay, after playtest), and at most this many per floor. */
  maxTreasureRooms: 2,
  /** Rest shrines: at most this many per floor. */
  maxRestRooms: 2,
  /** Chance of 3 doors instead of 2. */
  threeDoorChance: 0.5,
  /** Insights offered after each battle or challenge room. */
  insightChoices: 3,
} as const;

/**
 * Room grades (S, A, B). One point each for: enough Perfect Counters, little damage
 * taken, and a clear within the room's par time (the enemies' par times added up,
 * unless the room file sets "parSeconds"). 3 points = S, 2 = A, otherwise B.
 */
export const GRADES = {
  /** Perfect Counters needed for a point, per enemy in the room (0.5 = one for every two enemies). */
  perfectsPerEnemy: 0.5,
  /** Damage taken at most this share of max health. */
  damageShareForPoint: 0.15,
  /** An S grade adds this many items to the room's loot. */
  sGradeBonusItems: 1,
} as const;

export type Rarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
export const RARITIES: readonly Rarity[] = ['common', 'uncommon', 'rare', 'epic', 'legendary'];

/** Loot rarity (CLAUDE.md starting numbers). Legendaries come from Guardians only (later). */
export const LOOT = {
  rarityWeights: { common: 70, uncommon: 22, rare: 7, epic: 1 },
  /** Bad-luck protection: each run in a row without a Rare adds this much weight to Rare (taken from Common)... */
  rareWeightPerDryRun: 3,
  /** ...and the 5th run in a row without a Rare is guaranteed one (in its first chest). */
  guaranteedRareOnRun: 5,
} as const;

/**
 * Placeholder gear limits for the white belt tier, until real profiles arrive (milestone 4).
 * Gear stats are capped at these, so gear never outweighs real training.
 */
// R-BAL-9b (#188, Manager's call): per-tier caps from the cost curve, in belt order.
export const GEAR_CAPS = {
  white: { power: 1, maxHealth: 10, guard: 3, powerScale: 0.04 },
  yellow: { power: 3, maxHealth: 25, guard: 5, powerScale: 0.08 },
  orange: { power: 6, maxHealth: 41, guard: 8, powerScale: 0.11 },
  green: { power: 9, maxHealth: 60, guard: 9, powerScale: 0.14 },
  blue: { power: 12, maxHealth: 81, guard: 11, powerScale: 0.16 },
  red: { power: 16, maxHealth: 104, guard: 12, powerScale: 0.19 },
  'red-black': { power: 20, maxHealth: 128, guard: 14, powerScale: 0.21 },
  brown: { power: 24, maxHealth: 154, guard: 15, powerScale: 0.22 },
  'brown-black': { power: 29, maxHealth: 182, guard: 16, powerScale: 0.24 },
  black: { power: 34, maxHealth: 211, guard: 17, powerScale: 0.26 },
} as const;

/** The gear caps for a belt tier (1 = white); tiers past black use black's. */
export function gearCapsForTier(tier: number): (typeof GEAR_CAPS)[keyof typeof GEAR_CAPS] {
  const rows = Object.values(GEAR_CAPS);
  return rows[Math.max(0, Math.min(rows.length, Math.floor(tier)) - 1)];
}

// ---------------------------------------------------------------- the training link (milestone 4)

/** Levels and experience (core-design sections 10 and 13). */
export const PROGRESSION = {
  /** Each belt tier adds this many levels to the cap (white belt: cap 10). */
  levelsPerTier: 10,
  /** R-BAL-5 (D3): each level step's weight is step + this, so later steps grow gently (last step ≤ 10 runs). Tier total unchanged. */
  xpStepSoften: 11,
  /** Each level above 1 adds this much Health and Power. */
  healthPerLevel: 3,
  powerPerLevel: 0.4,
  /**
   * Experience pacing: a typical player reaches the tier's level cap at this share of the
   * school's typical time in rank for that belt.
   */
  capAtShareOfRank: 0.75,
  /** Assumed for pacing: runs a typical player finishes per week... */
  typicalRunsPerWeek: 8,
  /** ...and experience from a typical run (about what xpPerRoom gives for a mixed run). */
  typicalRunXp: 110,
  weeksPerMonth: 4.35,
  /** Experience for each room cleared, by kind, plus a bonus for clearing the whole floor. */
  xpPerRoom: { battle: 12, challenge: 16, treasure: 4, rest: 4, boss: 40, practice: 0 },
  xpFloorClear: 20,
  /** Below the rank's expected level (the level cap of the belt before), experience is doubled. */
  catchUpMultiplier: 2,
} as const;

/** Dojo Blessing (core-design section 10): after attending class. */
export const BLESSING = {
  hours: 48,
  /** Extra share of experience while blessed (0.5 = +50%). */
  xpBonus: 0.5,
  /** Better loot: this much weight moves from Common to Rare on every roll while blessed. */
  rareWeight: 3,
} as const;

/** Home practice (framework section 5): approved minutes per Training Point. */
export const TRAINING_POINTS = {
  minutesPerPoint: 15,
  /** Each ability upgrades from level 1 to 5, so it can take this many points. */
  upgradesPerAbility: 4,
} as const;

/**
 * R-BAL-12 (#193/#195, drafts/planning/R-BAL-12-training-powers-combat.md): real training adds
 * whole-number combat stats, for good. Index = belt tier - 1 (white … black); belts past the
 * list use the last row. A piece keeps the value of the belt it was earned at.
 */
export const TRAINING_STATS: ReadonlyArray<{
  signOff: { power: number; maxHealth: number };
  trainingPoint: { maxHealth: number };
  stripe: { guard: number };
}> = [
  { signOff: { power: 1, maxHealth: 4 }, trainingPoint: { maxHealth: 1 }, stripe: { guard: 7 } }, // white
  { signOff: { power: 1, maxHealth: 5 }, trainingPoint: { maxHealth: 1 }, stripe: { guard: 5 } }, // yellow
  { signOff: { power: 1, maxHealth: 5 }, trainingPoint: { maxHealth: 1 }, stripe: { guard: 3 } }, // orange
  { signOff: { power: 2, maxHealth: 6 }, trainingPoint: { maxHealth: 2 }, stripe: { guard: 3 } }, // green
  { signOff: { power: 2, maxHealth: 6 }, trainingPoint: { maxHealth: 2 }, stripe: { guard: 2 } }, // blue
  { signOff: { power: 2, maxHealth: 6 }, trainingPoint: { maxHealth: 2 }, stripe: { guard: 2 } }, // red
  { signOff: { power: 2, maxHealth: 7 }, trainingPoint: { maxHealth: 2 }, stripe: { guard: 2 } }, // red-black
  { signOff: { power: 3, maxHealth: 7 }, trainingPoint: { maxHealth: 2 }, stripe: { guard: 1 } }, // brown
  { signOff: { power: 3, maxHealth: 7 }, trainingPoint: { maxHealth: 2 }, stripe: { guard: 1 } }, // brown-black
  { signOff: { power: 3, maxHealth: 7 }, trainingPoint: { maxHealth: 2 }, stripe: { guard: 1 } }, // black
];

/** Training Points that count toward stats per belt tier (power.ts uses the same 28). */
export const TRAINING_POINTS_PER_BELT = 28;

/**
 * R-BAL-12 (Decision B): enemy files hold BASE numbers; a run at belt tier n multiplies
 * Health and Power by row n-1, then rounds. Guard and timings never scale. Internal only.
 * Retuned (Manager, option B) so the LIVE enemies (white-belt base numbers from #203) stay in the
 * #188 bands at every belt for all three model students; pinned by test/r-bal-12-bands.test.ts.
 * Fit: drafts/planning/r-bal-12f-live-check.py.
 */
export const ENEMY_TRAINING_SCALE: ReadonlyArray<{ maxHealth: number; power: number }> = [
  { maxHealth: 1.27, power: 1.19 },
  { maxHealth: 2.14, power: 2.06 },
  { maxHealth: 3.19, power: 3.14 },
  { maxHealth: 4.65, power: 4.32 },
  { maxHealth: 6.56, power: 5.6 },
  { maxHealth: 8.46, power: 7.06 },
  { maxHealth: 10.77, power: 8.7 },
  { maxHealth: 13.1, power: 10.36 },
  { maxHealth: 15.91, power: 11.94 },
  { maxHealth: 18.72, power: 13.8 },
];

/** The row for a belt tier (1 = white); tiers past the list use the last row. */
export function byTier<T>(rows: readonly T[], tier: number): T {
  return rows[Math.max(0, Math.min(rows.length, Math.floor(tier)) - 1)];
}

/**
 * Power Rating (core-design section 12). Never shown to players: staff and the system only.
 * Each belt tier adds 1,000 to the max; each black belt degree adds 500.
 * Each source's share of the tier max is its own ceiling.
 */
export const POWER = {
  perTier: 1000,
  perDegree: 500,
  shares: {
    signOffs: 0.4,
    trainingPoints: 0.17,
    virtues: 0.1,
    level: 0.18,
    gear: 0.08,
    streetSmarts: 0.05,
    mastery: 0.02,
  },
  /** Character stripes possible per belt (real limit). */
  stripesPerBelt: 2,
} as const;

/** Virtues get this much stronger for each rank above I (earning the same word again). */
export const VIRTUE_RANK_BONUS = 0.25;

/**
 * Home Dojo (framework section 7). Mess is cosmetic, capped, and never removes or blocks anything.
 * How messy the dojo is follows a curve over time away: nothing for the first hours, then
 * fast at first and slower later, reaching the limit after about a week. Short, frequent
 * visits always find a small, quick tidy; a long absence is never worse than "needs a good cleaning."
 */
export const DOJO = {
  /** No mess at all for this many hours after a clean (a quick break doesn't leave dust). */
  messStartsAfterHours: 4,
  /** Mess reaches its limit after this many hours away (7 days). */
  messFullAfterHours: 168,
  /** Dust and litter on the floor at the limit (swept by walking over them). */
  maxFloorSpots: 16,
  /** Share of floor spots that are litter ("leaf" spots: footprints, towel, water bottle) instead of dust (looks only). */
  leafShare: 0.3,
  /** How close (tiles) the character must pass to sweep a spot. */
  sweepRadius: 0.75,
  /** Mats start getting scuffed at this much mess (0 to 1); later mats need more. */
  matScuffFrom: 0.2,
  matScuffSpread: 0.4,
  /** Taps of "Wipe" to clean one scuffed mat. */
  wipeTaps: 4,
  /** Weapons knocked crooked on each rack at these mess levels (one more per level passed). */
  rackCrookedAt: [0.35, 0.6, 0.85],
  /** How close (tiles) the character must stand to wipe a mat or straighten a rack. */
  reach: 1.4,
  /** After this many hours away, the welcome-back card appears. */
  welcomeBackHours: 48,
  /**
   * Calm Mind: earned by cleaning a messy dojo. Focus builds this much faster, for this
   * many Tower runs. Counted in runs (not hours) so it never pressures anyone to play now,
   * and it doesn't stack. Kept smaller than the Dojo Blessing (real class).
   */
  calmMind: { focusGain: 0.2, runs: 3 },
} as const;

/**
 * The bow (framework section 9): at the start of each Tower floor. A small, instant,
 * guaranteed reward turns the ritual into a habit: about 3 hits' head start on Focus.
 */
export const BOW = {
  focus: 15,
  /** How long the bow animation takes (ms, looks only): the full 22-frame bow from the art. */
  ms: 1375,
} as const;

/**
 * K25 (Jay's phone playtest): the whole game runs a bit slower. The rules still count the same
 * ticks; the client just plays each tick this much slower in real time, so movement, enemies,
 * attacks and animations all slow together and every wind-up and counter window gets longer
 * in seconds (never shorter). 0.88 = about 12% slower.
 */
export const TEMPO = { speed: 0.88 } as const;

/** Real milliseconds one rules tick lasts on screen at the game tempo. */
export function realMsPerTick(): number {
  return 1000 / TICKS_PER_SECOND / TEMPO.speed;
}

/** K28: real milliseconds that a number of rules ticks lasts on screen. */
export function ticksToRealMs(ticks: number): number {
  return ticks * realMsPerTick();
}

/** K28: rules ticks per real second (about 17.6), so "60 seconds" on screen is 60 real seconds. */
export function realTicksPerSecond(): number {
  return 1000 / realMsPerTick();
}

/** K28: how many rules ticks fit in a number of real seconds (e.g. a Challenge's 60 s). */
export function realSecondsToTicks(seconds: number): number {
  return Math.round(seconds * realTicksPerSecond());
}

/**
 * K25 screen shake. No shake when the player attacks. The shake when the player is hit (and,
 * since K28, a named monster's wind-up shake) is only from belt rank hurtFromTier up (Brown in
 * the standard 10-belt order), or on Challenge, at hurtScale of its old strength, and never
 * with Reduced motion.
 */
export const SCREEN_SHAKE = { playerAttackScale: 0, hurtScale: 0.65, hurtFromTier: 8 } as const;

/**
 * K28: the one shake rule. How strong a shake is (0 = none) for what happened (being hit, a named
 * monster's wind-up, or a Block), the belt rank (1 = first belt), difficulty and motion setting.
 * K25b (Manager): a Block is a success moment, so it never shakes.
 */
export function hurtShakeScale(o: { kind: 'hurt' | 'windup' | 'block'; beltTier: number; difficulty: Difficulty; reducedMotion: boolean }): number {
  if (o.kind === 'block' || o.reducedMotion) return 0;
  return o.beltTier >= SCREEN_SHAKE.hurtFromTier || o.difficulty === 'challenge' ? SCREEN_SHAKE.hurtScale : 0;
}

/**
 * K29: "1:05" for a number of rules ticks, in real seconds on screen (same conversion as the
 * K28 Challenge timer). For clocks the player reads; par times and grades stay in game time.
 */
export function realClock(ticks: number): string {
  const s = Math.floor(ticksToRealMs(ticks) / 1000 + 1e-9);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}
