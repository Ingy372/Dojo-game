import { describe, expect, it } from 'vitest';
import { MAX_CHOICES, STAGE_ACTIONS, stageMarks, streetSmartsOpen, advance, choose, currentLine, fillLine, loadScenario, loadProfile, newProfile, recordScenario, scenarioStars, startScenario, type Scenario, type ScenarioState } from '../src';
import store from '../../../content/street-smarts/store-separated.json';
import storeRoom from '../../../content/street-smarts/store-room.json';

const sc = loadScenario(store);
const clone = () => JSON.parse(JSON.stringify(store));

/** Plays through, picking with `pick(choiceId, tryNumber)`. Returns the end state and every line seen. */
function play(pick: (id: string, n: number) => number): { st: ScenarioState; seen: string[] } {
  let st = startScenario();
  const seen: string[] = [];
  const tries: Record<string, number> = {};
  for (let guard = 0; guard < 500 && !st.done; guard++) {
    const line = currentLine(sc, st)!;
    seen.push(line.text);
    if (line.choices) {
      tries[line.id!] = (tries[line.id!] ?? 0) + 1;
      st = choose(sc, st, pick(line.id!, tries[line.id!]));
    } else st = advance(sc, st);
  }
  return { st, seen };
}
const best = (id: string) => sc.scenes.flatMap((s) => s.lines).find((l) => l.id === id)!.choices!.findIndex((c) => c.stars > 0);
const worst = (id: string) => sc.scenes.flatMap((s) => s.lines).find((l) => l.id === id)!.choices!.findIndex((c) => c.stars === 0);

describe('Street Smarts: store scenario', () => {
  it('loads the approved script with three star choices', () => {
    expect(sc.scenes.map((s) => s.id)).toEqual(['intro', 'first', 'helper', 'voice', 'offer', 'reunion', 'sensei-reflect']);
    expect(sc.starChoices).toEqual(['choice-first', 'choice-helper', 'choice-offer']);
    expect(sc.room).toBe('store');
    expect(sc.maxStars).toBe(3);
  });

  it('best answers first time earn all 3 stars and reach the reunion and reflection', () => {
    const { st, seen } = play((id) => best(id));
    expect(st.done).toBe(true);
    expect(scenarioStars(sc, st)).toBe(3);
    expect(seen).toContain("There you are! I'm so glad you followed what we practiced.");
    expect(seen[seen.length - 1]).toBe("That's what got you home safe and sound!");
  });

  it('a not-best answer pauses, Sensei reflects, and the same choice comes back', () => {
    let st = startScenario();
    while (!currentLine(sc, st)!.choices) st = advance(sc, st);
    st = choose(sc, st, worst('choice-first'));
    expect(currentLine(sc, st)!.speaker).toBe('sensei');
    while (!currentLine(sc, st)!.choices) st = advance(sc, st);
    expect(currentLine(sc, st)!.id).toBe('choice-first');
  });

  it('every wrong-first run still finishes, with no star for the retried choices', () => {
    const { st, seen } = play((id, n) => (n === 1 ? worst(id) : best(id)));
    expect(st.done).toBe(true);
    expect(scenarioStars(sc, st)).toBe(0);
    expect(seen[seen.length - 1]).toBe("That's what got you home safe and sound!");
  });

  it('voice is required to continue but earns no star', () => {
    const { st } = play((id, n) => (id === 'choice-voice' && n === 1 ? worst(id) : best(id)));
    expect(scenarioStars(sc, st)).toBe(3);
  });

  it('every 0-star branch is a gentle retry back to its choice (never a dead end)', () => {
    for (const scene of sc.scenes)
      for (const line of scene.lines)
        for (const c of line.choices ?? []) {
          const branch = scene.branches[c.next];
          if (c.stars === 0) expect(branch[branch.length - 1].retry).toBe(line.id);
          else expect(branch.some((l) => l.retry)).toBe(false);
        }
  });

  it('only people who work at the store are good helpers, picked by tapping them', () => {
    const helper = sc.scenes.find((s) => s.id === 'helper')!.lines.find((l) => l.choices)!;
    expect(helper.tap).toBe(true);
    expect(helper.choices!.filter((c) => c.stars > 0).map((c) => c.target)).toEqual(['worker', 'cashier']);
    expect(helper.choices!.filter((c) => c.stars === 0).map((c) => c.target)).toEqual(['stranger', 'hide-spot']);
  });

  it('the first answer is to go to the front for help (Jay, Nov 24)', () => {
    const first = sc.scenes.find((s) => s.id === 'first')!.lines[0];
    expect(first.choices![best('choice-first')].text).toBe('Go to the front and find someone who can help me.');
  });

  it('a retry never moves anyone, so a not-best answer is never acted out', () => {
    for (const scene of sc.scenes)
      for (const lines of Object.values(scene.branches))
        if (lines[lines.length - 1].retry) for (const l of lines) expect(l.stage ?? []).toEqual([]);
    const a = clone();
    a.scenes[1].branches['run-retry'][0].stage = [{ do: 'face', who: 'player', dir: 'N' }];
    expect(() => loadScenario(a)).toThrow(/retry branch/);
  });

  it('every stage cue is a known move by someone in the cast, at a place in the store room', () => {
    const marks = new Set(Object.keys(storeRoom.marks));
    for (const m of stageMarks(sc)) expect(marks.has(m), m).toBe(true);
    const a = clone();
    a.scenes[0].lines[0].stage[0].do = 'teleport';
    expect(() => loadScenario(a)).toThrow(/stage/);
    const b = clone();
    b.scenes[0].lines[0].stage[0].who = 'ghost';
    expect(() => loadScenario(b)).toThrow(/ghost/);
    const c = clone();
    c.scenes[0].lines[0].stage.push({ do: 'walk', who: 'player' });
    expect(() => loadScenario(c)).toThrow(/needs "to"/);
    expect(STAGE_ACTIONS).toContain('walk');
  });

  it('a tap choice needs a target on every answer', () => {
    const a = clone();
    delete a.scenes[2].lines[0].choices[1].target;
    expect(() => loadScenario(a)).toThrow(/target/);
  });

  it('allows 2-4 buttons: the store script loads, 5 or 1 fail', () => {
    expect(MAX_CHOICES).toBe(4);
    expect(() => loadScenario(clone())).not.toThrow();
    const a = clone();
    const helper = a.scenes.find((s: { id: string }) => s.id === 'helper').lines.find((l: { choices?: unknown[] }) => l.choices);
    helper.choices.push({ ...helper.choices[0], id: 'extra' });
    expect(() => loadScenario(a)).toThrow(/2-4 choices/);
    const b = clone();
    b.scenes[1].lines[0].choices = [b.scenes[1].lines[0].choices[0]];
    expect(() => loadScenario(b)).toThrow(/2-4 choices/);
  });

  it('opens at the 2nd belt, or at any belt from the test link', () => {
    expect(streetSmartsOpen(1, 2)).toBe(false);
    expect(streetSmartsOpen(2, 2)).toBe(true);
    expect(streetSmartsOpen(1, 2, true)).toBe(true);
  });

  it('keeps text short for early readers and never names a real grown-up', () => {
    for (const scene of sc.scenes)
      for (const line of [...scene.lines, ...Object.values(scene.branches).flat()]) {
        expect(line.text.split(/\s+/).length).toBeLessThanOrEqual(12);
        expect(line.text).not.toMatch(/\d{3}/); // no phone numbers
      }
  });

  it('fills in the player and grown-up', () => {
    expect(fillLine('{player} is at the store with {grownup}.', { player: 'Ava', grownup: 'Mom' })).toBe('Ava is at the store with Mom.');
  });

  it('rejects broken links in a script', () => {
    const a = clone();
    a.scenes[1].lines[0].choices[0].next = 'nope';
    expect(() => loadScenario(a)).toThrow(/missing branch/);
    const b = clone();
    b.scenes[1].branches['run-retry'].at(-1).retry = 'choice-helper';
    expect(() => loadScenario(b)).toThrow(/retries/);
    const c = clone();
    c.starChoices = ['choice-nope'];
    expect(() => loadScenario(c)).toThrow(/star choice/);
  });

  it('ignores taps that are not on a choice', () => {
    const st = startScenario();
    expect(choose(sc as Scenario, st, 0)).toBe(st);
  });
});

describe('Street Smarts save', () => {
  it('keeps the best stars and the picked grown-up, and old saves get a default', () => {
    const p = newProfile();
    expect(recordScenario(p, 'store-separated', 1)).toBe(true);
    expect(recordScenario(p, 'store-separated', 0)).toBe(false);
    expect(recordScenario(p, 'store-separated', 3)).toBe(true);
    p.streetSmarts.grownup = 'Dad';
    const back = loadProfile(JSON.parse(JSON.stringify(p)));
    expect(back.streetSmarts).toEqual({ best: { 'store-separated': 3 }, grownup: 'Dad' });
    const old = JSON.parse(JSON.stringify(newProfile()));
    delete old.streetSmarts;
    expect(loadProfile(old).streetSmarts).toEqual({ best: {}, grownup: null });
  });
});

// Nov 24: lessons 2-5 (Jay approved the scripts), each in its own Blender place.
import park from '../../../content/street-smarts/park-candy.json';
import parkRoom from '../../../content/street-smarts/park-room.json';
import busstop from '../../../content/street-smarts/busstop-ride.json';
import busstopRoom from '../../../content/street-smarts/busstop-room.json';
import playground from '../../../content/street-smarts/playground-teasing.json';
import playgroundRoom from '../../../content/street-smarts/playground-room.json';
import home from '../../../content/street-smarts/home-online.json';
import homeRoom from '../../../content/street-smarts/home-room.json';

const LESSONS: [unknown, { id: string; marks: Record<string, number[]>; cast: Record<string, unknown> }][] = [
  [store, storeRoom],
  [park, parkRoom],
  [busstop, busstopRoom],
  [playground, playgroundRoom],
  [home, homeRoom],
];

function playAny(s: Scenario, pick: (line: { id?: string; choices?: { stars: number }[] }, n: number) => number) {
  let st = startScenario();
  const tries: Record<string, number> = {};
  for (let guard = 0; guard < 500 && !st.done; guard++) {
    const line = currentLine(s, st)!;
    if (line.choices) {
      tries[line.id!] = (tries[line.id!] ?? 0) + 1;
      st = choose(s, st, pick(line, tries[line.id!]));
    } else st = advance(s, st);
  }
  return st;
}

describe('Street Smarts: all five lessons', () => {
  for (const [data, room] of LESSONS) {
    const s = loadScenario(data);
    describe(s.id, () => {
      it('plays in its own room, and every place it uses is marked there', () => {
        expect(s.room).toBe(room.id);
        const marks = new Set(Object.keys(room.marks));
        for (const m of stageMarks(s)) expect(marks.has(m), m).toBe(true);
      });

      it('everyone who moves has art in the room cast', () => {
        const movers = new Set(s.scenes.flatMap((sc) => [...sc.lines, ...Object.values(sc.branches).flat()]).flatMap((l) => (l.stage ?? []).map((c) => c.who)).filter((w): w is string => !!w && w !== 'player'));
        for (const w of movers) expect(room.cast[w], w).toBeTruthy();
      });

      it('best answers earn every star; wrong-first answers still finish with none', () => {
        const top = playAny(s, (l) => l.choices!.findIndex((c) => c.stars > 0));
        expect(top.done).toBe(true);
        expect(scenarioStars(s, top)).toBe(s.maxStars);
        const low = playAny(s, (l, n) => (n === 1 ? l.choices!.findIndex((c) => c.stars === 0) : l.choices!.findIndex((c) => c.stars > 0)));
        expect(low.done).toBe(true);
        expect(scenarioStars(s, low)).toBe(0);
      });

      it('every not-best answer is a gentle retry that moves no one', () => {
        for (const scene of s.scenes)
          for (const line of scene.lines)
            for (const c of line.choices ?? []) {
              const branch = scene.branches[c.next];
              if (c.stars === 0) {
                expect(branch[branch.length - 1].retry).toBe(line.id);
                for (const l of branch) expect(l.stage ?? []).toEqual([]);
              }
            }
      });

      it('keeps lines short (12 words for ages 6-9, 14 for 10-13) and has no phone numbers', () => {
        const max = s.ageBand === '6-9' ? 12 : 14;
        for (const scene of s.scenes)
          for (const line of [...scene.lines, ...Object.values(scene.branches).flat()]) {
            expect(line.text.split(/\s+/).length, line.text).toBeLessThanOrEqual(max);
            expect(line.text).not.toMatch(/\d{3}/);
          }
      });
    });
  }

  it('a shout bubble needs its words', () => {
    const a = JSON.parse(JSON.stringify(park));
    delete a.scenes[1].branches['say-good'][0].stage[0].text;
    expect(() => loadScenario(a)).toThrow(/shout/);
  });
});
