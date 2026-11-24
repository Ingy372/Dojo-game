import { describe, expect, it } from 'vitest';
import { parseKata, type KataDef } from '../src/katas';
import {
  askKataHint,
  formatKataTime,
  kataBeats,
  kataDone,
  kataHint,
  kataMoveIds,
  newKataRun,
  parseKataMoves,
  practiceKatas,
  readKataBests,
  recordKataRun,
  tapKataDir,
  tapKataMove,
} from '../src/kataPractice';
import { loadInsideRoom } from '../src/actionZone';
import movesJson from '../../../content/dojo/kata-moves.json';
import insideJson from '../../../content/dojo/action-zone/inside-room.json';
import fixture from '../../../fixtures/1-white-belt-new.json';

const files = import.meta.glob('../../../content/katas/*.json', { eager: true, import: 'default' });
const katas = new Map(Object.values(files).map((raw) => parseKata(raw)).map((k) => [k.requirement, k] as const));
const moves = parseKataMoves(movesJson);
const beltIds = fixture.school.belts.map((b) => b.id);
const bf1 = katas.get('white-kata')!;

describe('kata practice (Jay, Nov 20)', () => {
  it('every kata in content has beats, and every move is a known button', () => {
    const ids = new Set(moves.map((m) => m.id));
    for (const k of katas.values()) {
      expect(kataBeats(k).length).toBeGreaterThan(0);
      for (const b of kataBeats(k)) expect(ids.has(b.move), `${k.id}: ${b.move}`).toBe(true);
    }
  });

  it('every stepping beat says which foot is forward; the catch kicks use the stacked-hands art', () => {
    for (const k of katas.values()) {
      for (const b of kataBeats(k)) {
        if (b.move !== 'break-hold') expect(b.lead, `${k.id} step ${b.step} ${b.move}`).toMatch(/^[LR]$/);
        // A right-foot-forward kick needs the left-leg art (the kick isn't mirrored).
        if (b.move === 'rear-leg-front-kick' && b.lead === 'R') expect(b.anim, `${k.id} step ${b.step}`).toMatch(/_left$/);
      }
    }
    const keon = katas.get('orange-kata')!;
    expect(kataBeats(keon).filter((b) => b.anim?.startsWith('kata_front_kick_stacked')).length).toBe(2);
  });

  it('Basic Forms 1 and 2: the special turn after each kiai, into the low block facing right, then left', () => {
    for (const id of ['white-kata', 'yellow-kata']) {
      const beats = kataBeats(katas.get(id)!);
      const turns = beats.flatMap((b, i) => (b.anim === 'kata_special_turn' ? [i] : []));
      expect(turns.map((i) => beats[i].step), id).toEqual([4, 7]);
      for (const i of turns) {
        // the beat before is the kiai punch, right foot forward; the turn lands in a left-foot-forward low block
        expect(beats[i - 1]).toMatchObject({ kiai: true, lead: 'R' });
        expect(beats[i]).toMatchObject({ move: 'low-block', lead: 'L' });
      }
      expect(beats[turns[0]].dir).toBe('R');
      expect(beats[turns[1]].dir).toBe('L');
    }
  });

  it('Basic Form 1 is low blocks and punches only, with two kiai', () => {
    expect(kataMoveIds(bf1)).toEqual(['low-block', 'punch']);
    expect(kataBeats(bf1).filter((b) => b.kiai)).toHaveLength(2);
    expect(kataBeats(bf1).slice(0, 2).map((b) => `${b.dir} ${b.move}`)).toEqual(['L low-block', 'L punch']);
  });

  it('a white belt practises Basic Form 1; a yellow belt Basic Forms 1 and 2', () => {
    expect(practiceKatas(katas, beltIds, 'white', moves).map((k) => k.name)).toEqual(['Basic Form 1']);
    expect(practiceKatas(katas, beltIds, 'yellow', moves).map((k) => k.name)).toEqual(['Basic Form 1', 'Basic Form 2']);
    expect(practiceKatas(katas, beltIds, 'nope', moves)).toEqual([]);
  });

  it('leaves out a kata with no beats yet', () => {
    const empty: KataDef = parseKata({ id: 'x', name: 'X', requirement: 'white-kata', stance: null, steps: [{ n: 1, facing: ['L'] }] });
    expect(practiceKatas(new Map([['white-kata', empty]]), beltIds, 'white', moves)).toEqual([]);
  });

  it('direction then technique; wrong taps count; the hint glows after two misses', () => {
    const r = newKataRun(bf1);
    expect(tapKataMove(r, 'low-block')).toBe('need-dir');
    expect(r.wrong).toBe(0);
    expect(tapKataDir(r, 'R')).toBe('wrong');
    expect(kataHint(r)).toBeNull();
    expect(tapKataDir(r, 'F')).toBe('wrong');
    expect(kataHint(r)).toEqual({ dir: 'L' });
    expect(tapKataDir(r, 'L')).toBe('ok');
    expect(kataHint(r)).toEqual({ move: 'low-block' });
    expect(tapKataMove(r, 'punch')).toBe('wrong');
    expect(r.dir).toBe('L');
    expect(tapKataMove(r, 'low-block')).toBe('ok');
    expect(r.index).toBe(1);
    expect(r.wrong).toBe(3);
    expect(kataHint(r)).toBeNull();
  });

  it('plays a whole kata to the end', () => {
    const r = newKataRun(bf1);
    for (const b of kataBeats(bf1)) {
      expect(tapKataDir(r, b.dir)).toBe('ok');
      expect(tapKataMove(r, b.move)).toBe('ok');
    }
    expect(kataDone(r)).toBe(true);
    expect(r.wrong).toBe(0);
    expect(tapKataDir(r, 'L')).toBe('done');
  });

  it('keeps the fastest time and fewest wrong moves', () => {
    const a = recordKataRun(undefined, 3, null);
    expect(a.best).toEqual({ bestMs: null, fewestWrong: 3, runs: 1 });
    expect(a.newFewest).toBe(false);
    const b = recordKataRun(a.best, 1, 40000);
    expect(b.best).toEqual({ bestMs: 40000, fewestWrong: 1, runs: 2 });
    expect(b.newFewest).toBe(true);
    expect(b.newBestTime).toBe(false);
    const c = recordKataRun(b.best, 2, 35000);
    expect(c.best).toEqual({ bestMs: 35000, fewestWrong: 1, runs: 3 });
    expect(c.newBestTime).toBe(true);
    expect(readKataBests({ x: c.best, y: 'junk', z: { bestMs: -1 } })).toEqual({ x: c.best, z: { bestMs: null, fewestWrong: null, runs: 0 } });
    expect(formatKataTime(42345)).toBe('0:42.3');
    expect(formatKataTime(65000)).toBe('1:05.0');
  });

  it('the Action Zone offers kata practice in the middle of the floor logo', () => {
    const room = loadInsideRoom(insideJson);
    expect(room.kataSpot).toEqual({ center: { x: 13.5, y: 5.2 }, radius: 0.9 });
  });
});

describe('kata Hint button (Jay, Nov 24)', () => {
  it('lights the next arrow, then the move, for this beat only, and marks the run hinted', () => {
    const r = newKataRun(bf1);
    expect(kataHint(r)).toBeNull();
    const first = r.beats[0];
    expect(askKataHint(r)).toEqual({ dir: first.dir });
    expect(r.hinted).toBe(true);
    expect(tapKataDir(r, first.dir)).toBe('ok');
    expect(kataHint(r)).toEqual({ move: first.move });
    expect(tapKataMove(r, first.move)).toBe('ok');
    // The next beat starts with no glow, but the run stays hinted.
    expect(kataHint(r)).toBeNull();
    expect(r.hinted).toBe(true);
    expect(r.wrong).toBe(0);
  });

  it('a hinted run counts as played but sets no bests', () => {
    const prev = { bestMs: 40000, fewestWrong: 2, runs: 3 };
    const res = recordKataRun(prev, 0, 30000, true);
    expect(res.best).toEqual({ bestMs: 40000, fewestWrong: 2, runs: 4 });
    expect(res.newBestTime).toBe(false);
    expect(res.newFewest).toBe(false);
  });

  it('does nothing once the kata is done', () => {
    const r = newKataRun(bf1);
    r.index = r.beats.length;
    expect(askKataHint(r)).toBeNull();
  });
});

