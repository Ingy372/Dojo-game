// Starting a Tower run (from the dojo's door or the training board).

import { ownedDecorations, startRun, useCalmMind, type Profile, type RunState, type TrainingState } from '@dojo/sim';
import { CONTENT } from './content';
import { homeDojo, setBowDue } from './dojo';
import { writeSave } from './save';

export function startTowerRun(profile: Profile, training: TrainingState): RunState {
  const params = new URLSearchParams(window.location.search);
  const seedParam = Number(params.get('seed'));
  const seed = Number.isFinite(seedParam) && seedParam > 0 ? seedParam : Math.floor(Math.random() * 2147483647) + 1;
  const firstRoomId = params.get('room') ?? undefined;
  const dojo = homeDojo(profile);
  const calmMind = useCalmMind(dojo);
  writeSave(profile);
  // Coming home from the Tower means bowing into the dojo again.
  setBowDue(true);
  return startRun(CONTENT, {
    seed,
    dryRuns: profile.dryRuns,
    firstRoomId,
    blessed: training.blessed,
    calmMind,
    ownedDecorations: ownedDecorations(dojo),
  });
}
