// P-MENU2-d golden test: a profile with no loadout must fight exactly as before the
// loadout existed. The expected output was captured from origin/main (7e99af0) before
// any P-MENU2-d change, and is stored in fixtures/golden/p-menu2-d-default-run.json.
// If play is ever meant to change, re-capture it on purpose and say so in the PR.
import { describe, expect, it } from 'vitest';
import { buildTraining, characterSetup, loadFeed, loadProfile, newProfile } from '../src';
import { testContent } from './load-content';
import { SKILLS, playRun } from './balance/bot';
import golden from '../../../fixtures/golden/p-menu2-d-default-run.json';
import white from '../../../fixtures/1-white-belt-new.json';
import white3 from '../../../fixtures/2-white-belt-3-signoffs.json';
import yellow from '../../../fixtures/3-yellow-belt.json';
import green from '../../../fixtures/4-green-belt.json';

const content = testContent();
const FEEDS: Record<string, unknown> = { white, white3, yellow, green };
const SEEDS = [1001, 1002, 1003];

function capture(): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [name, data] of Object.entries(FEEDS)) {
    const feed = loadFeed(data);
    const t = buildTraining(feed, content.abilities, { ms: Date.parse(feed.asOf), weekday: 3 });
    // A brand-new profile and an old save (no loadout field) must both give today's setup.
    for (const [kind, profile] of [['new', newProfile()], ['oldSave', loadProfile(JSON.parse(JSON.stringify({ ...newProfile(), loadout: undefined })))]] as const) {
      const setup = characterSetup(profile, t, content.abilities);
      const runs = SEEDS.map((seed) => playRun(content, seed, 'smart', SKILLS.typical, 'standard', setup, undefined, { tier: t.tier }));
      out[`${name}/${kind}`] = { setup, runs };
    }
  }
  return JSON.parse(JSON.stringify(out));
}

describe('P-MENU2-d golden: no loadout plays exactly as today', () => {
  it('matches the output captured from main before the loadout existed', () => {
    const now = capture();
    expect(now).toEqual(golden);
  });
});
