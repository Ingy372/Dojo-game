// Q-PREMIUM-2 routine fixes: small source/pure checks that hold each fix in place.
import { describe, expect, it } from 'vitest';
import { MOVEMENT, circleHitsWall, createWorld, loadInsideRoom, stepWorld, type Vec2 } from '../src';
import insideJson from '../../../content/dojo/action-zone/inside-room.json';

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

describe('Q-PREMIUM-2 QA: inside exit glow and testing screen', () => {
  const inside = loadInsideRoom(insideJson);
  const cueSrc = read('scenes/InsideScene.ts');
  const cueY = Number(/EXIT_CUE_Y = ([\d.]+);/.exec(cueSrc)![1]);
  const cueH = Number(/EXIT_CUE_H = ([\d.]+);/.exec(cueSrc)![1]);
  const walk = (from: Vec2, to: Vec2): Vec2 => {
    const world = createWorld(inside.room, ['p1']);
    world.players.p1.pos = { ...from };
    for (let t = 0; t < 20 * 6; t++) stepWorld(world, inside.room, { p1: { kind: 'moveTo', x: to.x, y: to.y } });
    return world.players.p1.pos;
  };
  it('the glow is whole in the room and its middle is inside the exit rectangle, which starts 0.1 tile inside its top edge', () => {
    const [x0, x1, y0, y1] = inside.exit;
    expect(cueY + cueH / 2).toBeLessThanOrEqual(y1);
    expect(cueY).toBeGreaterThan(y0);
    expect(cueY).toBeLessThan(y1);
    expect(y0 - (cueY - cueH / 2)).toBeCloseTo(0.1, 5);
    expect(x1 - x0).toBeGreaterThan(2);
  });
  it('the hero walks onto the glow middle (open floor) and ends inside the exit', () => {
    const [x0, x1, y0, y1] = inside.exit;
    const mid = { x: (x0 + x1) / 2, y: cueY };
    expect(circleHitsWall(inside.room, mid, MOVEMENT.playerRadius)).toBe(false);
    // Every tap on the glow (middle and the top edge a little in) ends inside the exit rectangle.
    for (const p of [mid, { x: x0 + 0.2, y: cueY - cueH / 2 + 0.15 }, { x: x1 - 0.2, y: cueY }]) {
      const end = walk(inside.spawn, p);
      expect(end.x >= x0 && end.x <= x1 && end.y >= y0 && end.y <= y1, JSON.stringify(p)).toBe(true);
    }
  });
  it('the testing screen: Close is added after the list and centred; rows out of view stop taking taps', () => {
    const s = read('ui/TestingPanel.ts');
    expect(s.indexOf("'Close'")).toBeGreaterThan(s.indexOf('this.host = list;'));
    expect(s).toMatch(/'Close', 0x5b4a3c, 15, actions\.close, true\)/);
    expect(s).toMatch(/t\.setOrigin\(centre \? 0\.5 : 0, 0\.5\)/);
    expect(s).toMatch(/r\.bg\.input\.enabled = inView/);
    expect(s).toMatch(/this\.updateRowHits\(list\.y\)/);
    expect(s).toMatch(/this\.text\(rx, ry \+ 15, part\.detail, 10, '#b9ad99', false, rw\)/);
  });
});
