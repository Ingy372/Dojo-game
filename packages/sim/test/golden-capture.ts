// P-MENU2-d golden capture: today's default play, written only with APIs that already
// existed on main, so the same code can be run on main to capture the expected output.
import { buildTraining, characterSetup, counterWindowTicks, createRunWorld, currentRoom, loadFeed, loadProfile, newProfile, startRun, stepWorld, type Difficulty } from '../src';
import { testContent } from './load-content';
import abilities from '../../../content/abilities/abilities.json';

/** Cat Stance's (Rooted until R-STANCE-d1) Perfect Counter bonus, read from content (its counterWindow). */
const ROOTED_BONUS = abilities.stances.find((f) => f.id === 'cat-stance')!.counterWindow;
import { SKILLS, playRun } from './balance/bot';
import white from '../../../fixtures/1-white-belt-new.json';
import white3 from '../../../fixtures/2-white-belt-3-signoffs.json';
import yellow from '../../../fixtures/3-yellow-belt.json';
import green from '../../../fixtures/4-green-belt.json';

const content = testContent();
const FEEDS: Record<string, unknown> = { white, white3, yellow, green };
const SEEDS = [1001, 1002, 1003];

function training(data: unknown) {
  const feed = loadFeed(data);
  return buildTraining(feed, content.abilities, { ms: Date.parse(feed.asOf), weekday: 3 });
}

/**
 * Rooted Stance: the Perfect Counter window on each difficulty, and a seeded room where the
 * player stands in Rooted Stance (with the Rooted bonus, ROOTED_BONUS) pressing
 * Counter. Any change to the Rooted numbers changes this output.
 */
function rootedCase(): unknown {
  const setup = characterSetup(newProfile(), training(yellow), content.abilities);
  const rootedAt = setup.stances!.findIndex((f) => f.id === 'cat-stance');
  const out: Record<string, unknown> = { rootedAt };
  for (const d of ['guided', 'standard', 'challenge'] as Difficulty[]) {
    const run = startRun(content, { seed: 2001, dryRuns: 0, difficulty: d });
    const world = createRunWorld(content, run, setup, setup.effects);
    const p = world.players.p1;
    p.stance = rootedAt;
    p.counterBonusTicks = ROOTED_BONUS;
    const room = currentRoom(content, run);
    let perfects = 0;
    let blocks = 0;
    for (let i = 0; i < 400; i++) {
      stepWorld(world, room, { p1: { kind: 'none', action: 'counter' } });
      perfects += world.events.filter((e) => e.kind === 'perfectCounter').length;
      blocks += world.events.filter((e) => e.kind === 'block').length;
    }
    out[d] = { window: counterWindowTicks(world, p), perfects, blocks, health: p.health };
  }
  return out;
}

export function captureGolden(): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [name, data] of Object.entries(FEEDS)) {
    const t = training(data);
    // A brand-new profile and an old save (no loadout field) must both give today's setup.
    for (const [kind, profile] of [['new', newProfile()], ['oldSave', loadProfile(JSON.parse(JSON.stringify({ ...newProfile(), loadout: undefined })))]] as const) {
      const setup = characterSetup(profile, t, content.abilities);
      const runs = SEEDS.map((seed) => playRun(content, seed, 'smart', SKILLS.typical, 'standard', setup, undefined, { tier: t.tier }));
      out[`${name}/${kind}`] = { setup, runs };
    }
  }
  out.rooted = rootedCase();
  return JSON.parse(JSON.stringify(out));
}
