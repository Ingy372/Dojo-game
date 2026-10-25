// P-MENU2-d golden test: a profile with no loadout must fight exactly as before the
// loadout existed. The expected output (fixtures/golden/p-menu2-d-default-run.json) was
// captured by running test/golden-capture.ts on origin/main code, before any P-MENU2-d change
// (7e99af0; the Rooted Stance case on 5d56802). If play is ever meant to change, re-capture it
// on purpose and say so in the PR.
import { describe, expect, it } from 'vitest';
import { captureGolden } from './golden-capture';
import golden from '../../../fixtures/golden/p-menu2-d-default-run.json';

describe('P-MENU2-d golden: no loadout plays exactly as today', () => {
  it('matches the output captured from main before the loadout existed', () => {
    expect(captureGolden()).toEqual(golden);
  });
});
