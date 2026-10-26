// P-MENU2-d golden test: a profile with no loadout must fight exactly as before the
// loadout existed. The expected output (fixtures/golden/p-menu2-d-default-run.json) was
// captured by running test/golden-capture.ts on origin/main code, before any P-MENU2-d change
// (7e99af0; the Rooted Stance case on 5d56802). R-STANCE-d1 re-captured it on purpose: the
// stance lists in each setup and the stance case (now Cat, +1 window) changed; every run is the same. R-STANCE-d2 re-captured it again: the only change is the new
// signOffId field on each stance; stances come from fixture stance sign-offs set to match, and every run is the same. R-STANCE-g re-captured it on purpose: Open Leg (ready-stance, all 0) joins the yellow and green
// stance lists (fixtures 3 and 4 sign it off), the Beginner's Stance text is #312's line, and the Cat case index moves 1 -> 2; every run is the same. R-STANCE-READY-NUM re-captured it on purpose: Open Leg's 4 bonuses (#314) show in the yellow and green stance lists, and each room now also records
// dealt and kos (the bot's new damage-dealt and enemies-defeated counts); players start in Beginner's Stance, so every run is the same. B-TUNE-GUIDED re-captured only rooted/guided on purpose: Guided enemy Power x0.75 leaves the player at 154 Health instead of 141; every Standard and Challenge value is byte-identical. C-B1-ROOMS re-captured it on purpose: white-belt floors now use the w- rooms (swarmers and shields only), so only the white, white3 and rooted (white) runs change; every setup and the yellow and green runs are the same, and capturing without the w- rooms gives the old file exactly. If play is ever meant to change, re-capture it
// on purpose and say so in the PR.
import { describe, expect, it } from 'vitest';
import { captureGolden } from './golden-capture';
import golden from '../../../fixtures/golden/p-menu2-d-default-run.json';

describe('P-MENU2-d golden: no loadout plays exactly as today', () => {
  it('matches the output captured from main before the loadout existed', () => {
    expect(captureGolden()).toEqual(golden);
  });
});
