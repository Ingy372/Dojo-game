import { describe, expect, it } from 'vitest';
import { applyBeltEntry, buildTraining, feedEntry, fixBeltEntry, loadFeed, recordBeltEntry, rewardMoments, snapshot } from '../src';
import BELT_TEXT from '../../../content/settings/belt-entry.json';
import { testContent } from './load-content';

const files = import.meta.glob('../../../fixtures/*.json', { eager: true, import: 'default' });
const fixture = (name: string) => loadFeed(files[`../../../fixtures/${name}.json`]);
const abilities = testContent().abilities;
const now = { ms: Date.parse('2027-06-01T12:00:00Z'), weekday: 2 };
const white = fixture('1-white-belt-new');
const yellow = fixture('3-yellow-belt');
const dojo = Object.values(import.meta.glob('../../../apps/client/src/scenes/DojoScene.ts', { query: '?raw', import: 'default', eager: true }))[0] as string;

describe('OV-B7: a grown-up can fix a wrong belt entry', () => {
  it('a fix lowers a wrong entry, which a normal save never does', () => {
    const wrong = { belt: 'green', stripes: 1 };
    const right = { belt: 'yellow', stripes: 2 };
    expect(recordBeltEntry(white.school.belts, wrong, right)).toEqual(wrong);
    expect(fixBeltEntry(white, right)).toEqual(right);
    const t = buildTraining(applyBeltEntry(white, fixBeltEntry(white, right)), abilities, now);
    expect(t.belt.id).toBe('yellow');
    expect(t.stripesByBelt.yellow).toBe(2);
  });

  it('a fix can go down to what the feed shows, never below it', () => {
    expect(fixBeltEntry(yellow, feedEntry(yellow))).toBeNull();
    expect(fixBeltEntry(yellow, { belt: 'white', stripes: 2 })).toBeNull();
    expect(feedEntry(applyBeltEntry(yellow, fixBeltEntry(yellow, { belt: 'white', stripes: 0 })))).toEqual(feedEntry(yellow));
  });

  it('a lower belt after a fix is never a promotion, and has no loss words', () => {
    const high = buildTraining(applyBeltEntry(white, { belt: 'green', stripes: 1 }), abilities, now);
    const low = buildTraining(applyBeltEntry(white, fixBeltEntry(white, { belt: 'yellow', stripes: 0 })), abilities, now);
    expect(rewardMoments(snapshot(high), low)).toEqual([]);
    expect(BELT_TEXT.fixed).toBe('Your belt was updated.');
    const words = Object.entries(BELT_TEXT).filter(([k]) => !k.startsWith('_')).map(([, v]) => String(v)).join(' ');
    expect(words).not.toMatch(/only go up|can't be lowered|lost|lose|wrong of you|sorry/i);
  });

  it('the fix sits behind the grown-up gate, with "Keep {belt}" and "Yes, fix it"', () => {
    expect(dojo).toMatch(/openBeltEntry\(back, true\)/);
    expect(dojo).toMatch(/fixKeep\.replace\('\{belt\}'/);
    expect(dojo).toMatch(/fix \? fixBeltEntry\(feed, pick\)/);
    // The only way into the belt screen is the grown-up settings, which open after the gate.
    expect(dojo.match(/this\.openBeltEntry\(/g)?.length).toBe(3);
    expect(BELT_TEXT.fixKeep).toBe('Keep {belt}');
    expect(BELT_TEXT.fixYes).toBe('Yes, fix it');
  });
});
