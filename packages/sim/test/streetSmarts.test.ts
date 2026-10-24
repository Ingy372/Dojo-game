import { describe, expect, it } from 'vitest';
import { MAX_CHOICES, streetSmartsOpen, advance, choose, currentLine, fillLine, loadScenario, loadProfile, newProfile, recordScenario, scenarioStars, startScenario, type Scenario, type ScenarioState } from '../src';
import store from '../../../content/street-smarts/store-separated.json';

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
    expect(sc.scenes.map((s) => s.id)).toEqual(['intro', 'stay', 'helper', 'voice', 'offer', 'reunion', 'sensei-reflect']);
    expect(sc.starChoices).toEqual(['choice-stay', 'choice-helper', 'choice-offer']);
    expect(sc.maxStars).toBe(3);
  });

  it('best answers first time earn all 3 stars and reach the reunion and reflection', () => {
    const { st, seen } = play((id) => best(id));
    expect(st.done).toBe(true);
    expect(scenarioStars(sc, st)).toBe(3);
    expect(seen).toContain('{player} gives {grownup} a big hug.');
    expect(seen[seen.length - 1]).toBe('That is how you get home safe.');
  });

  it('a not-best answer pauses, Sensei reflects, and the same choice comes back', () => {
    let st = startScenario();
    while (!currentLine(sc, st)!.choices) st = advance(sc, st);
    st = choose(sc, st, worst('choice-stay'));
    expect(currentLine(sc, st)!.text).toBe("Let's see what could have gone differently.");
    while (!currentLine(sc, st)!.choices) st = advance(sc, st);
    expect(currentLine(sc, st)!.id).toBe('choice-stay');
  });

  it('every wrong-first run still finishes, with no star for the retried choices', () => {
    const { st, seen } = play((id, n) => (n === 1 ? worst(id) : best(id)));
    expect(st.done).toBe(true);
    expect(scenarioStars(sc, st)).toBe(0);
    expect(seen[seen.length - 1]).toBe('That is how you get home safe.');
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

  it('every helper choice except hiding is a good answer', () => {
    const helper = sc.scenes.find((s) => s.id === 'helper')!.lines.find((l) => l.choices)!;
    expect(helper.choices!.filter((c) => c.stars === 0).map((c) => c.text)).toEqual(['Hide and wait alone.']);
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
    b.scenes[1].branches['stay-retry'].at(-1).retry = 'choice-helper';
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
