// Starting a Tower run (from the dojo's door or the training board).

import { firstFloorOfTier, runDifficulty, ownedDecorations, startRun, type EliteKind, useCalmMind, type Profile, type RunState, type TrainingState } from '@dojo/sim';
import { CONTENT } from './content';
import { homeDojo, setBowDue } from './dojo';
import { writeSave } from './save';

export function startTowerRun(profile: Profile, training: TrainingState): RunState {
  const params = new URLSearchParams(window.location.search);
  const seedParam = Number(params.get('seed'));
  const seed = Number.isFinite(seedParam) && seedParam > 0 ? seedParam : Math.floor(Math.random() * 2147483647) + 1;
  const firstRoomId = params.get('room') ?? undefined;
  // For testing: ?twist=lantern-dark forces that twist in the next room that can have it.
  const twistParam = params.get('twist');
  const forcedTwist = CONTENT.twists.twists.some((t) => t.id === twistParam) ? (twistParam ?? undefined) : undefined;
  // One difficulty for the whole run (elites and combat): ?difficulty= test link, else the player's setting, else Standard.
  const difficulty = runDifficulty(profile, params.get('difficulty'));
  // For testing: ?elite=swift or ?elite=guarding puts that elite in every battle and challenge room
  // (the run then doesn't count toward the profile).
  const eliteParam = params.get('elite');
  const forcedElite: EliteKind | undefined = eliteParam === 'swift' || eliteParam === 'guarding' ? eliteParam : undefined;
  const tier = training.belt.tier;
  const dojo = homeDojo(profile);
  const calmMind = useCalmMind(dojo);
  writeSave(profile);
  // Coming home from the Tower means bowing into the dojo again.
  setBowDue(true);
  return startRun(CONTENT, {
    seed,
    dryRuns: profile.dryRuns,
    firstRoomId,
    forcedTwist,
    blessed: training.blessed,
    calmMind,
    ownedDecorations: ownedDecorations(dojo),
    tier,
    difficulty,
    firstFloorOfTier: firstFloorOfTier(profile, tier),
    forcedElite,
  });
}
