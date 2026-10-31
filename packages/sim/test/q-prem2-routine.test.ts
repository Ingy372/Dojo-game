// Q-PREMIUM-2 routine fixes: small source/pure checks that hold each fix in place.
import { describe, expect, it } from 'vitest';

const src = import.meta.glob('../../../apps/client/src/**/*.ts', { query: '?raw', import: 'default', eager: true }) as Record<string, string>;
const read = (name: string): string => {
  const hit = Object.entries(src).find(([k]) => k.endsWith(name));
  if (!hit) throw new Error(`missing ${name}`);
  return hit[1];
};

describe('Q-PREMIUM-2 M3 character creation swatches', () => {
  const s = read('scenes/CreateScene.ts');
  it('colours are two rows of five, with a swatch at least 30 px and the whole cell tapping', () => {
    expect(s).toMatch(/perRow = Math\.ceil\(n \/ 2\)/);
    expect(s).toMatch(/const rad = Math\.min\(20, cell \* 0\.36, \(cellH - 3\) \/ 2\)/);
    expect(s).toMatch(/new Phaser\.Geom\.Rectangle\(rad - 2 - cell \/ 2, rad - 2 - cellH \/ 2, cell, cellH\)/);
  });
  it('the Done / Back buttons moved under the character so the swatches get the full height', () => {
    expect(s).toMatch(/const by = height - pad - MIN_TAP;/);
    expect(s).toMatch(/Let's go!/);
  });
});

describe('Q-PREMIUM-2 M7 / M12 fight HUD', () => {
  const s = read('scenes/GameScene.ts');
  it('door names show only when no enemy is left and never under a loot toast', () => {
    expect(s).toMatch(/d\.label\.setVisible\(!enemiesAlive && !this\.underToast\(d\.label\)\)/);
    expect(s).toMatch(/private underToast\(label: Phaser\.GameObjects\.Text\): boolean/);
  });
  it('the Wave counter goes with the last enemy', () => {
    expect(s).toMatch(/!prog\.cleared && enemiesAlive \?/);
  });
  it("the hero's own numbers ride above the head, step aside, and at most 3 show", () => {
    expect(s).toMatch(/const HERO_POP_RAISE_PX = 46;/);
    expect(s).toMatch(/const HERO_POP_SIDE_PX = \[0, -38, 38\];/);
    expect(s).toMatch(/const HERO_POP_MAX = 3;/);
    expect(s).toMatch(/this\.heroPops\.length > HERO_POP_MAX/);
  });
});

describe('Q-PREMIUM-2 M9 / M10 / L2 Dojo panels and labels', () => {
  const s = read('scenes/DojoScene.ts');
  it('panel backdrops are nearly solid and the room labels are 14 px', () => {
    expect(s).toMatch(/const LABEL_PX = 14;/);
    expect((s.match(/0\.97/g) ?? []).length).toBeGreaterThanOrEqual(7);
  });
  it('Erase progress sits a full 20 px off the screen edge', () => {
    expect(s).toMatch(/x: 20, y: height - 20 - 44, w, h: 44, label: t\.wipeButton/);
  });
});

describe('Q-PREMIUM-2 L3 Board wording', () => {
  const s = read('scenes/HomeScene.ts');
  it('the level line reads "Level N of CAP" and the rank dial says Classes done', () => {
    expect(s).toMatch(/Level \$\{[^}]+\} of \$\{/);
    expect(s).toMatch(/'Classes done'/);
    expect(s).not.toMatch(/'Time in rank'/);
    expect(s).toMatch(/Lit when Sensei says you're ready\./);
  });
  it('long lesson names shorten Self-Defense to Defense', () => {
    expect(s).toMatch(/'Self-Defense '/);
    expect(s).toMatch(/'Defense '/);
  });
});

describe('Q-PREMIUM-2 L4 / L5 / L7 / L9 / L10 / L11', () => {
  it('L4: the door arrow has a floor size and pulses only when motion is allowed', () => {
    const s = read('ui/exitCue.ts');
    expect(s).toMatch(/arrowMin = 0/);
    expect(s).toMatch(/Math\.max\(arrowMin, /);
    expect(s).toMatch(/if \(!reducedMotion\(\)\)[\s\S]*scale/);
    expect(read('scenes/InsideScene.ts')).toMatch(/addExitCue\([^\n]*'down', 22\)/);
  });
  it('L5: the tutorial dialog docks at the bottom first, with a big Got it and no room counter', () => {
    const s = read('scenes/GameScene.ts');
    expect(s).toMatch(/const spots = \[H - 8 - h, top,/);
    expect(s).toMatch(/this\.run\.tutorial \? '' : `Room /);
    expect(s).toMatch(/width < 720 \? '24px' : '28px'/);
  });
  it('L7: the testing screen has Close at the top, a solid backdrop and a scrolling list', () => {
    const s = read('ui/TestingPanel.ts');
    expect(s).toMatch(/pad \+ leftW - 96, pad, 96, MIN_TAP, 'Close'/);
    expect(s).toMatch(/createGeometryMask/);
    expect(s).toMatch(/dragged/);
  });
  it('L9: Journal title 16, subtitle and card names 14', () => {
    const s = read('ui/MonsterJournal.ts');
    expect(s).toMatch(/CONTENT\.named\.journalTitle, 16,/);
    expect(s).toMatch(/subtitle = text\(0, top \+ 58 \* k, '', 14,/);
    expect(s).toMatch(/m\.journal\.name, 14,/);
  });
  it('L10: the practice room shows a title and a hint', () => {
    const s = read('scenes/GameScene.ts');
    expect(s).toMatch(/'Practice room\\nTry STRIKE, COUNTER and DASH\.'/);
    expect(s).toMatch(/this\.practiceLabel\?\.setX\(width \/ 2\)/);
  });
  it('L11: the Welcome home card sits over the right panel, dims nothing and dismisses on tap', () => {
    const s = read('scenes/HomeScene.ts');
    expect(s).toMatch(/const rightX = pad \+ Math\.min\(300, width \* 0\.38\) \+ pad;/);
    expect(s).not.toMatch(/0x000000, 0\.35\)\.setOrigin\(0\)\.setInteractive/);
    expect(s).toMatch(/shade\.on\(Phaser\.Input\.Events\.GAMEOBJECT_POINTER_DOWN, close\)/);
  });
});
