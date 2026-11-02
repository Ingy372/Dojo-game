// A4-DOJO-hotfix: three regressions Jay reported after #394/#395, each pinned.
//  1. Choppy dojo: the Action Zone scenes do no wasted per-frame work (no Graphics redrawn every frame, no sort at rest).
//  2. A stuck banner: Sensei's "steps back" line (B-MASHER-2) takes itself down after its 2.2 s hold.
//  3. A fresh load must reach the tutorial, never the practice room (only the ?room=training test link goes there).
// The client has no unit tests, so these read the client source (as b-masher-2.test.ts does) and run the pure pieces.
import { describe, expect, it } from 'vitest';
import { getsTutorialFloor, newProfile, testSearch } from '../src';
import { MASH_GUARD_HOLD_MS } from '../../../apps/client/src/game/mashGuardMoment';

const SRC = import.meta.glob(['../../../apps/client/src/**/*.ts'], { query: '?raw', import: 'default', eager: true }) as Record<string, string>;
const file = (name: string): string => {
  const hit = Object.entries(SRC).find(([k]) => k.endsWith(`/src/${name}`));
  if (!hit) throw new Error(`no source: ${name}`);
  return hit[1];
};
const between = (s: string, from: string, to: string): string => s.slice(s.indexOf(from), s.indexOf(to, s.indexOf(from)));

describe('A4-DOJO-hotfix bug 2: the stepped-back banner goes away', () => {
  const game = file('scenes/GameScene.ts');
  const body = between(game, 'private senseiStepsBack(', 'private shieldGlow(');

  it('holds for 2.2 s, the Manager\'s B-MASHER-2 number', () => {
    expect(MASH_GUARD_HOLD_MS).toBe(2200);
  });

  it('takes the banner down after that hold, and only that banner', () => {
    expect(body).toContain('this.senseiSay([MASH_GUARD_LINE], MASH_GUARD_HOLD_MS)');
    const timer = between(body, 'this.time.delayedCall(MASH_GUARD_HOLD_MS', 'this.placeSteppedBack()');
    expect(timer).toContain('banner.destroy()');
    expect(timer).toContain('this.senseiText === banner');
  });

  it('is shown on every difficulty: it is the Mash guard moment, not the Counter hint', () => {
    expect(body).not.toMatch(/difficulty|challenge/i);
  });
});

describe('A4-DOJO-hotfix bug 1: the Action Zone does not redraw vector shapes every frame', () => {
  const cue = file('ui/exitCue.ts');
  const walk = file('scenes/WalkScene.ts');

  it('the exit cue is two baked images, not Graphics that are re-triangulated each frame', () => {
    const add = between(cue, 'export function addExitCue(', 'export const BAKE');
    expect(add).not.toContain('scene.add.graphics');
    expect(add).toContain('scene.add.image(');
    expect(cue).toContain('generateTexture(');
    expect(cue).toMatch(/scene\.textures\.exists\(key\)/); // built once per size, not per scene entry
  });

  it('keeps the breathing and bobbing, and the reduced-motion stillness', () => {
    expect(cue).toContain('if (!reducedMotion())');
    expect(cue).toContain("ease: 'Sine.easeInOut'");
  });

  it('the stand order is sorted only when the hero\'s row changes', () => {
    const draw = between(walk, 'protected draw(', 'protected onDraw(');
    expect(draw).toMatch(/if \(this\.player\.depth !== y \* TILE\) \{[^}]*standLayer\.sort\('depth'\)/);
  });
});

describe('A4-DOJO-hotfix bug 3: a fresh load reaches the tutorial', () => {
  it('a brand-new profile gets the tutorial floor', () => {
    expect(getsTutorialFloor(newProfile())).toBe(true);
  });

  it('the Title screen sends a player with no character to Create (first), then the tutorial', () => {
    const title = file('scenes/TitleScene.ts');
    const tap = between(title, "const params = testFlags();", 'this.layout();');
    expect(tap).toContain("else if (!hasLook()) this.scene.start('Create', { first: true })");
    expect(tap).toContain("else this.scene.start('Dojo')");
    const create = file('scenes/CreateScene.ts');
    expect(create).toContain("if (this.first && save && getsTutorialFloor(profile)) this.scene.start('Game', { run: startTowerRun(profile, this.training) })");
  });

  it('the practice room (Game with no run) is only the ?room=training test link', () => {
    const starts = Object.entries(SRC).flatMap(([k, v]) => (v.match(/scene\.start\('Game'[^)]*\)/g) ?? []).map((m) => `${k.split('/src/')[1]}: ${m}`));
    const bare = starts.filter((s) => s.endsWith("start('Game')"));
    expect(bare).toEqual(["scenes/TitleScene.ts: scene.start('Game')"]);
    const title = file('scenes/TitleScene.ts');
    expect(title).toContain("if (params.get('room') === 'training') this.scene.start('Game');");
    // The flag only reads the test link, which is empty in a beta build, and nothing remembers it.
    expect(title).toContain('testFlags()');
    expect(testSearch('?room=training', true)).toBe('');
  });

  it('Title is the first scene registered, so it is what a fresh load starts on (#394/#395 only appended)', () => {
    const main = file('main.ts');
    const list = main.slice(main.indexOf('scene: ['), main.indexOf(']', main.indexOf('scene: [')));
    expect(list.replace('scene: [', '').split(',')[0].trim()).toBe('TitleScene');
  });
  it('button() draws no per-frame Graphics: the fill, stroke and shine are baked into textures once', () => {
    const b = file('ui/button.ts');
    const fn = between(b, 'export function button(', 'const BAKE');
    expect(fn).not.toContain('add.graphics');
    expect(fn).toContain('bakeButton(');
    expect(fn).toContain('bakeShine(');
    expect(b).toContain('generateTexture(');
    expect(b).toContain('textures.exists(');
  });
});
