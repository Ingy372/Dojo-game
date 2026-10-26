import { describe, expect, it } from 'vitest';
import { KO, homePointer, keptText } from '../../../apps/client/src/game/knockout';

// Vite's glob reads the client source and the content at test time (the sim package has no Node types).
const SRC = import.meta.glob(['../../../apps/client/src/**/*.ts'], { query: '?raw', import: 'default', eager: true }) as Record<string, string>;
const CONTENT_RAW = import.meta.glob(['../../../content/**/*.json'], { query: '?raw', import: 'default', eager: true }) as Record<string, string>;
const src = (f: string) => SRC[`../../../apps/client/src/${f}`];
const game = src('scenes/GameScene.ts');
const endRun = game.slice(game.indexOf('private endRun('), game.indexOf('private askForBow('));

const LINES = Object.entries(KO).filter(([k, v]) => k !== '_note' && typeof v === 'string') as Array<[string, string]>;
const BANNED = ['died', 'dead', 'game over', 'failed', 'fail', 'lost', 'lose', 'defeat', 'try harder', "don't give up", 'only', 'almost', 'so close', 'hurry', 'should have'];

describe('B-MASHER-d1 words (Jay-signed spec #292)', () => {
  it('uses the signed main lines word for word', () => {
    expect(KO.helpUp).toBe('Sensei helps you up.');
    expect(KO.helpUpSensei).toBe('Every fall is part of training.');
    expect(KO.keptTitle).toBe('You kept everything you found!');
    expect(KO.keptNone).toBe('You learned this room!');
    expect(KO.keptSensei).toBe("Let's rest at the dojo.");
    expect(KO.headHome).toBe('Head home');
    expect(KO.welcome).toBe('Welcome home!');
    expect(KO.restingLine).toBe('Great training today! Your dojo is resting.');
    expect(KO.pointerClass).toBe('Train in class to grow stronger!');
    expect(KO.pointerNext).toBe('The Tower is ready when you are.');
    expect(KO.helpUpMs).toBe(2500);
    expect(KO.pointerMs).toBe(4000);
  });
  it('every line is 7 words or fewer and has no banned word', () => {
    for (const [k, line] of LINES) {
      expect(line.split(/\s+/).length, k).toBeLessThanOrEqual(7);
      for (const bad of BANNED) expect(line.toLowerCase(), `${k}: ${bad}`).not.toMatch(new RegExp(`\\b${bad}\\b`));
    }
  });
  it('"Ouch! The run is over" is gone from the code and content (0 times)', () => {
    const all = { ...SRC, ...CONTENT_RAW };
    expect(Object.keys(all).length).toBeGreaterThan(40);
    expect(Object.keys(all).filter((f) => /Ouch! The run is over/i.test(all[f]))).toEqual([]);
    expect(Object.keys(all).filter((f) => /Back to the start/.test(all[f]))).toEqual([]);
  });
  it('the old lost-run card ("Good effort!", "You reached room N of M.") is gone', () => {
    expect(src('ui/RunOverCard.ts')).not.toMatch(/Good effort|You reached room|runOverCard|restCard/);
  });
});

describe('B-MASHER-d1 Screen 2 paths', () => {
  it('finds: the kept title, the finds, and Sensei', () => {
    expect(keptText(['Iron Wraps', '+12 experience'], false)).toEqual({ title: KO.keptTitle, finds: ['Iron Wraps', '+12 experience'], sensei: `Sensei: ${KO.keptSensei}` });
  });
  it('no finds: "You learned this room!"', () => {
    expect(keptText([], false).title).toBe(KO.keptNone);
  });
  it('play time up (or a rested ending): the resting line instead of Sensei', () => {
    expect(keptText(['Iron Wraps'], true).sensei).toBe(KO.restingLine);
    expect(keptText([], true)).toEqual({ title: KO.keptNone, finds: [], sensei: KO.restingLine });
  });
  it('one Head home button with a door, a tap anywhere also continues, never under 44 px, no timer', () => {
    const card = src('ui/RunOverCard.ts');
    const kept = card.slice(card.indexOf('export function keptCard('), card.indexOf('export function choiceCard('));
    expect(kept).toMatch(/const btnH = Math\.max\(48,/);
    expect(kept).toMatch(/KO\.headHome/);
    expect(kept).toMatch(/const door = scene\.add\.graphics\(\)/);
    expect(kept).toMatch(/bg\.on\(Phaser\.Input\.Events\.GAMEOBJECT_POINTER_DOWN, go\)/);
    expect(kept).toMatch(/shade\.on\(Phaser\.Input\.Events\.GAMEOBJECT_POINTER_DOWN, go\)/);
    expect(kept).not.toMatch(/delayedCall/);
    expect(kept).toMatch(/if \(!still\) scene\.tweens\.add\(\{ targets: star/);
  });
});

describe('B-MASHER-d1 Screen 3 pointer order', () => {
  it('a real class comes first', () => expect(homePointer('Tuesday', false)).toBe(KO.pointerClass));
  it('then the next run', () => expect(homePointer(null, false)).toBe(KO.pointerNext));
  it('no next-run pointer once play time is up', () => expect(homePointer(null, true)).toBeNull());
  it('the class pointer still shows when play time is up', () => expect(homePointer('Tuesday', true)).toBe(KO.pointerClass));
  it('Home shows it on a knock-out or rested return, then the usual homecoming', () => {
    const home = src('scenes/HomeScene.ts');
    expect(home).toMatch(/this\.welcomeHome\(homePointer\(this\.training\.path\.nextClassDay, resting \|\| isPlayTimeUp\(this\.profile\)\), \(\) => this\.refresh\(\)\)/);
    expect(home).toMatch(/this\.time\.delayedCall\(KO\.pointerMs, close\)/);
    expect(home).toMatch(/shade\.on\(Phaser\.Input\.Events\.GAMEOBJECT_POINTER_DOWN, close\)/);
  });
});

describe('B-MASHER-d1 GameScene flow', () => {
  it('a knock-out shows Screen 1 (help-up line and Sensei, even though the hero is down)', () => {
    const down = game.slice(game.indexOf("case 'playerDown':"), game.indexOf("case 'wave':"));
    expect(down).toMatch(/this\.message\.setText\(KO\.helpUp\)/);
    expect(down).toMatch(/this\.senseiSay\(\[KO\.helpUpSensei\], 1400, true\)/);
    expect(game).toMatch(/if \(this\.downed && !helpUp\) return;/);
  });
  it('Screen 1 lasts about 2.5 s and a tap skips it', () => {
    expect(endRun).toMatch(/KO\.helpUpMs - \(this\.time\.now - this\.downAt\)/);
    expect(game).toMatch(/this\.helpUpSkipped = true;[\s\S]*?skipDown\(this\.world, this\.me\);\s*this\.afterHelpUp\?\.\(\);/);
  });
  it('lost and rested both bank once through bankRun (the finishRun path), then the kept card', () => {
    expect((endRun.match(/bankRun\(/g) ?? []).length).toBe(1);
    expect(endRun).toMatch(/const \{ summary, xp, profile \} = bankRun\(this\.run, this\.training, status\);/);
    expect(endRun).toMatch(/if \(status === 'lost' \|\| status === 'rested'\)/);
    expect(endRun).toMatch(/const resting = status === 'rested' \|\| isPlayTimeUp\(profile\);/);
  });
  it('the Guided offer shows after Screen 2, on a lost run only', () => {
    expect(endRun).toMatch(/const offer = status === 'lost' && shouldOfferGuided/);
    expect(endRun.indexOf('keptCard(')).toBeLessThan(endRun.indexOf('choiceCard('));
  });
  it('Home is told which welcome to show', () => {
    expect(endRun).toMatch(/knockout: resting \? 'rested' : 'run'/);
  });
  it('the practice room: kind words, and nothing ends (controls come back)', () => {
    const back = game.slice(game.indexOf("case 'playerReturn':"), game.indexOf("case 'enemySpawn':"));
    expect(back).toMatch(/if \(!this\.run\) \{[\s\S]*this\.downed = false;[\s\S]*this\.buttons\.enable\(\);[\s\S]*this\.controls\.enable\(\);/);
  });
});
