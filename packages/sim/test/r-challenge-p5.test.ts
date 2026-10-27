// R-CHALLENGE P5: the balance bot's answers to Challenge patterns (landing circles, double hits),
// checked on TEST-ONLY sample blocks, and the plan's section 4 table (BALANCE=1 to print it).
import { writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import type { Difficulty } from '../src';
import { PATTERN_ANSWERS, playRun, SKILLS, type RunStats } from './balance/bot';
import { withSamplePatterns } from './balance/sample-patterns';
import { testContent } from './load-content';
import { ARTISTS } from './r-bal-12-artists';
import { captureGolden } from './golden-capture';
import goldenRaw from '../../../fixtures/golden/p-menu2-d-default-run.json?raw';

const balance = !!(import.meta.env as Record<string, string | undefined>).BALANCE;
const content = testContent();
const sampled = withSamplePatterns(content);
const student = (tier: number) => {
  const a = ARTISTS.typical[tier - 1];
  return { maxHealth: a.health, power: a.power, guard: a.guard };
};
const BOTS = [['kid', 'kid', SKILLS.novice], ['newer', 'smart', SKILLS.typical], ['careful', 'smart', SKILLS.sharp]] as const;
const run = (c: typeof content, seed: number, bot: (typeof BOTS)[number], d: Difficulty, tier: number): RunStats =>
  playRun(c, seed, bot[1], bot[2], d, student(tier), undefined, { tier });

describe('R-CHALLENGE P5: samples are test-only and change nothing off Challenge', () => {
  it('the sample blocks load and add Challenge attacks', () => {
    expect(sampled.enemies.brute.challenge!.attacks[0].followUp).toEqual({ strength: 0.6, gapTicks: 20 });
    expect(sampled.enemies.swarmer.challenge!.attacks[0].landing).toBe(true);
    expect(content.enemies.brute.challenge).toBeUndefined();
  });

  it('Guided and Standard bot runs are byte-equal with the samples on and off (every bot, belts 4-10)', () => {
    for (const d of ['guided', 'standard'] as Difficulty[]) {
      for (const bot of BOTS) for (let tier = 4; tier <= 10; tier++) for (const seed of [1, 2]) {
        expect(JSON.stringify(run(sampled, seed, bot, d, tier))).toBe(JSON.stringify(run(content, seed, bot, d, tier)));
      }
    }
  });

  it('the samples do change Challenge runs', () => {
    let differs = 0;
    for (let tier = 5; tier <= 10; tier++) if (JSON.stringify(run(sampled, tier, BOTS[1], 'challenge', tier)) !== JSON.stringify(run(content, tier, BOTS[1], 'challenge', tier))) differs++;
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
      for (const tier of [4, 6, 8, 10]) for (let seed = 501; seed <= 560; seed++) for (const r of run(sampled, seed, BOTS[1], 'challenge', tier).rooms) damage += r.damage;
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

describe.skipIf(!balance)('R-CHALLENGE P5: section 4 table with sample patterns (BALANCE=1)', () => {
  it('prints win % / Health lost per fight, belts 4-10', { timeout: 3_600_000 }, () => {
    const lines = ['| Setting | Bot | b4 | b5 | b6 | b7 | b8 | b9 | b10 |', '|---|---|---|---|---|---|---|---|---|'];
    for (const d of ['guided', 'standard', 'challenge'] as Difficulty[]) for (const bot of BOTS) {
      const cells: string[] = [];
      for (let tier = 4; tier <= 10; tier++) {
        let won = 0;
        let lost = 0;
        let fights = 0;
        for (let i = 0; i < 40; i++) {
          const s = run(sampled, 1000 + i, bot, d, tier);
          if (s.won) won++;
          for (const r of s.rooms) if (r.kind !== 'rest' && r.kind !== 'shop') { lost += r.damage / student(tier).maxHealth; fights++; }
        }
        cells.push(`${Math.round((won / 40) * 100)}/${((lost / Math.max(1, fights)) * 100).toFixed(1)}`);
      }
      lines.push(`| ${d[0].toUpperCase() + d.slice(1)} | ${bot[0]} | ${cells.join(' | ')} |`);
    }
    // The test runner hides console output, so the table goes to a file too.
    writeFileSync(join(tmpdir(), 'r-challenge-p5-table.md'), lines.join('\n') + '\n');
    (globalThis as unknown as { console: { log(s: string): void } }).console.log(lines.join('\n'));
    expect(lines.length).toBe(11);
  });
});
