// R-CHALLENGE P5/P7: the balance bot's answers to Challenge patterns (landing circles, double hits),
// checked on the real C1 content, and the plan's section 4 table (BALANCE=1 to print it) with a
// warning for each Challenge cell more than 5 points off the §4b L+B row.
import { describe, expect, it } from 'vitest';
import { loadEnemy, type Content, type Difficulty } from '../src';
import { PATTERN_ANSWERS, playRun, SKILLS, type RunStats } from './balance/bot';
import { targetWarnings, TARGET_TOLERANCE } from './balance/challenge-targets';
import { testContent } from './load-content';
import { ARTISTS } from './r-bal-12-artists';
import { captureGolden } from './golden-capture';
import goldenRaw from '../../../fixtures/golden/p-menu2-d-default-run.json?raw';

const balance = !!(import.meta.env as Record<string, string | undefined>).BALANCE;
const content = testContent();
const PATTERN_ENEMIES = ['swarmer', 'shield', 'brute', 'floor-keeper', 'bopper'];
const rawEnemies = import.meta.glob('../../../content/enemies/*.json', { eager: true, import: 'default' }) as Record<string, Record<string, unknown>>;
/** A copy of the content with every `challenge` block removed (the real content is not changed). */
const withoutPatterns = (c: Content): Content => {
  const enemies = { ...c.enemies };
  for (const raw of Object.values(rawEnemies)) if (raw.challenge) {
    const { challenge: _drop, ...rest } = raw;
    enemies[raw.id as string] = loadEnemy(rest);
  }
  return { ...c, enemies };
};
const plain = withoutPatterns(content);
const student = (tier: number) => {
  const a = ARTISTS.typical[tier - 1];
  return { maxHealth: a.health, power: a.power, guard: a.guard };
};
const BOTS = [['kid', 'kid', SKILLS.novice], ['newer', 'smart', SKILLS.typical], ['careful', 'smart', SKILLS.sharp]] as const;
const run = (c: typeof content, seed: number, bot: (typeof BOTS)[number], d: Difficulty, tier: number): RunStats =>
  playRun(c, seed, bot[1], bot[2], d, student(tier), undefined, { tier });

describe('R-CHALLENGE P7: the real C1 patterns change nothing off Challenge', () => {
  it('the real C1 blocks load with the §4b L+B setup', () => {
    for (const id of PATTERN_ENEMIES) expect(content.enemies[id].challenge, id).toBeTruthy();
    expect(content.enemies.brute.challenge!.attacks[0].followUp).toEqual({ strength: 0.6, gapTicks: 20 });
    expect(content.enemies.swarmer.challenge!.attacks[0].landing).toBe(true);
    expect(content.enemies.shield.challenge!.attacks[0].counterable).toBe(false); // dash-only lane
    for (const id of PATTERN_ENEMIES) expect(plain.enemies[id].challenge, id).toBeFalsy();
  });

  it('Guided and Standard bot runs are byte-equal with the real patterns on and off (every bot, belts 4-10)', () => {
    for (const d of ['guided', 'standard'] as Difficulty[]) {
      for (const bot of BOTS) for (let tier = 4; tier <= 10; tier++) for (const seed of [1, 2]) {
        expect(JSON.stringify(run(content, seed, bot, d, tier))).toBe(JSON.stringify(run(plain, seed, bot, d, tier)));
      }
    }
  });

  it('the real patterns do change Challenge runs', () => {
    let differs = 0;
    for (let tier = 5; tier <= 10; tier++) if (JSON.stringify(run(content, tier, BOTS[1], 'challenge', tier)) !== JSON.stringify(run(plain, tier, BOTS[1], 'challenge', tier))) differs++;
    expect(differs).toBeGreaterThan(0);
  });

  it('the golden run is unchanged byte for byte', () => {
    expect(JSON.stringify(captureGolden(), null, 2) + '\n').toBe(goldenRaw);
  });
});

describe('R-CHALLENGE P5: the bot answers patterns', () => {
  // Whole runs drift apart once one choice differs, so compare totals over many runs (belts 4, 6, 8, 10 x 60 seeds).
  const total = (key: 'stepOutOfLanding' | 'holdStrikeForSecondHit', on: boolean) => {
    PATTERN_ANSWERS[key] = on;
    try {
      let damage = 0;
      for (const tier of [4, 6, 8, 10]) for (let seed = 501; seed <= 560; seed++) for (const r of run(content, seed, BOTS[1], 'challenge', tier).rooms) damage += r.damage;
      return damage;
    } finally {
      PATTERN_ANSWERS[key] = true;
    }
  };

  it('stepping out of landing circles costs a typical bot less Health than always Countering them', { timeout: 120_000 }, () => {
    expect(total('stepOutOfLanding', true)).toBeLessThan(total('stepOutOfLanding', false));
  });

  it('holding Strike for the second hit of a double slam costs a typical bot less Health', { timeout: 120_000 }, () => {
    expect(total('holdStrikeForSecondHit', true)).toBeLessThan(total('holdStrikeForSecondHit', false));
  });
});

const BALANCE_SEEDS = 100;

describe.skipIf(!balance)('R-CHALLENGE P7: section 4 table with the real C1 patterns (BALANCE=1)', () => {
  it('prints win % / Health lost per fight, belts 4-10', { timeout: 3_600_000 }, () => {
    const warnings: string[] = [];
    const lines = ['| Setting | Bot | b4 | b5 | b6 | b7 | b8 | b9 | b10 |', '|---|---|---|---|---|---|---|---|---|'];
    for (const d of ['guided', 'standard', 'challenge'] as Difficulty[]) for (const bot of BOTS) {
      const cells: string[] = [];
      const wins: number[] = [];
      for (let tier = 4; tier <= 10; tier++) {
        let won = 0;
        let lost = 0;
        let fights = 0;
        for (let i = 0; i < BALANCE_SEEDS; i++) {
          const s = run(content, 1000 + i, bot, d, tier);
          if (s.won) won++;
          for (const r of s.rooms) if (r.kind !== 'rest' && r.kind !== 'shop') { lost += r.damage / student(tier).maxHealth; fights++; }
        }
        wins.push(Math.round((won / BALANCE_SEEDS) * 100));
        cells.push(`${Math.round((won / BALANCE_SEEDS) * 100)}/${((lost / Math.max(1, fights)) * 100).toFixed(1)}`);
      }
      if (d === 'challenge') warnings.push(...targetWarnings(bot[0], wins));
      lines.push(`| ${d[0].toUpperCase() + d.slice(1)} | ${bot[0]} | ${cells.join(' | ')} |`);
    }
    // Run with --silent=false to see it.
    const log = (globalThis as unknown as { console: { log(s: string): void; warn(s: string): void } }).console;
    log.log([`Real C1 content (content/enemies), ${BALANCE_SEEDS} seeds`, ...lines].join('\n'));
    for (const w of warnings) log.warn(w);
    log.log(`${warnings.length} Challenge cell(s) off the §4b L+B row by more than ${TARGET_TOLERANCE} points`);
    expect(lines.length).toBe(11);
  });
});

describe('R-CHALLENGE P7: target warnings', () => {
  it('warns only for cells more than 5 points off the L+B row', () => {
    expect(targetWarnings('kid', [28, 48, 33, 25, 33, 30, 30])).toEqual([]);
    expect(targetWarnings('kid', [22, 43, 38, 25, 33, 30, 30])).toEqual(['WARN Challenge kid b4: 22% vs L+B target 28% (off by -6)']);
    expect(targetWarnings('careful', [100, 94, 100, 100, 100, 100, 100])).toHaveLength(1);
  });
});
