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
  guided: { counterWindowTicks: 10, fillScale: 1 },
  standard: { counterWindowTicks: 6, fillScale: 1 },
  challenge: { counterWindowTicks: 4, fillScale: 0.8 },
} as const;

/** How full the danger circle is (0 to 1) when the Perfect Counter window opens. */
export const TELEGRAPH_NEARLY_FULL = 0.85;

export type Difficulty = keyof typeof DIFFICULTY;

/** Combat numbers. Starting values from core-design section 4; tune from playtesting. */
export const COMBAT = {
  defaultDifficulty: 'standard' as Difficulty,
  /** The Rooted Form adds this many ticks to the Perfect Counter window. */
  rootedFormBonusTicks: 2,

  /** Starting player stats (later these come from the student's profile). */
  player: { maxHealth: 100, power: 10, guard: 0 },

  focus: {
    max: 100,
    /** Gained for every hit the player lands. */
    perHit: 5,
    /** Gained for every Perfect Counter. */
    perPerfectCounter: 25,
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

  /** Ticks before the Form can be switched again (half a second). */
  formSwitchTicks: 10,
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
export const GEAR_CAPS = {
  white: { power: 4, maxHealth: 30, guard: 8 },
} as const;

// ---------------------------------------------------------------- the training link (milestone 4)

/** Levels and experience (core-design sections 10 and 13). */
export const PROGRESSION = {
  /** Each belt tier adds this many levels to the cap (white belt: cap 10). */
  levelsPerTier: 10,
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
