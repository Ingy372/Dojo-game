// LP-B1b: the 9 strings LP-B1 left pointing to the Gate or the Board now come from path.json (LP-C4, #505).
import { describe, expect, it } from 'vitest';
import PATH from '../../../content/settings/path.json';

const SRC = import.meta.glob(['../../../apps/client/src/**/*.ts'], { query: '?raw', import: 'default', eager: true }) as Record<string, string>;
const raw = (p: string): string => SRC[`../../../apps/client/src${p}`] ?? '';
const FILE: Record<string, string> = { 'DojoScene.ts': '/scenes/DojoScene.ts', 'HomeScene.ts': '/scenes/HomeScene.ts', 'Celebrations.ts': '/ui/Celebrations.ts' };

describe('LP-B1b: My Path words in place of the old Gate and Board pointers', () => {
  it('every key Content named is read at the file it named', () => {
    for (const [key, spot] of Object.entries(PATH.pointerSpots)) {
      const file = FILE[spot.split(':')[0]];
      expect(file, key).toBeDefined();
      expect(raw(file), key).toContain(`PW.${key}`);
    }
  });
  it('the old hard-coded lines are gone', () => {
    const all = Object.values(SRC).join('\n');
    for (const old of [
      'The board on the wall has the Tower, your gear and the Gate.',
      'Top level! The Gate shows how to go higher.',
      'See them anytime on the Board.',
      'more! See them all on the Board.',
      'open the Board and tap its title 5 times',
      "'BOARD', LABEL_PX",
    ])
      expect(all, old).not.toContain(old);
  });
  it('kid lines are 8 words or fewer (the grown-ups hint is exempt)', () => {
    for (const key of Object.keys(PATH.pointerSpots)) {
      if (key === 'adultProfilesHint') continue;
      const line = (PATH as unknown as Record<string, string>)[key];
      expect(line.split(/\s+/).length, key).toBeLessThanOrEqual(8);
    }
  });
});
