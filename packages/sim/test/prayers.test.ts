import { describe, expect, it } from 'vitest';
import { loadInsideRoom, loadPrayerBook } from '../src';
import bookJson from '../../../content/faith/action-zone-prayers.json';
import insideJson from '../../../content/dojo/action-zone/inside-room.json';

describe('the prayer menu (Jay, Nov 25)', () => {
  const book = loadPrayerBook(bookJson);

  it('has 5 to 7 short prayers, each ending with Amen', () => {
    expect(book.prayers.length).toBeGreaterThanOrEqual(5);
    expect(book.prayers.length).toBeLessThanOrEqual(7);
    for (const p of book.prayers) {
      expect(p.text.endsWith('Amen.'), p.id).toBe(true);
      expect(p.text.length, p.id).toBeLessThanOrEqual(130);
    }
  });

  it('says what prayer is and what it is not, above the prayers', () => {
    expect(book.about.map((n) => n.heading)).toEqual(['What is prayer?', 'Prayer is not']);
  });

  it('refuses a broken file', () => {
    expect(() => loadPrayerBook({ ...bookJson, prayers: [] })).toThrow(/prayers/);
    expect(() => loadPrayerBook({ ...bookJson, prayers: [bookJson.prayers[0], bookJson.prayers[0]] })).toThrow(/share the id/);
    expect(() => loadPrayerBook({ ...bookJson, title: '' })).toThrow(/title/);
  });

  it('the Bible lies in the very middle of the red box, reached from the mat', () => {
    const spot = loadInsideRoom(insideJson).prayerSpot!;
    const box = insideJson.interactables.find((i) => i.id === 'gear-box')!.footprintRect;
    expect(spot.center.x).toBeCloseTo((box[0] + box[1]) / 2, 5);
    expect(spot.center.y).toBeCloseTo((box[2] + box[3]) / 2, 5);
    // The hero stands on the mat just north of the box.
    expect(spot.approach.y).toBeLessThan(box[2]);
    expect('mr').toContain(insideJson.tiles[Math.floor(spot.approach.y)][Math.floor(spot.approach.x)]);
  });

  it('a room without a Bible loads with none', () => {
    const { prayerSpot: _gone, ...rest } = insideJson;
    expect(loadInsideRoom(rest).prayerSpot).toBeNull();
  });
});
