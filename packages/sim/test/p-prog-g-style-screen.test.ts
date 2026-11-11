// PB-05: Fighting Style slot cards. Tap a card, then a pick. A full Seal row asks which one to swap.
import { describe, expect, it } from 'vitest';
import { buildTraining, characterSetup, loadFeed, newProfile, type Loadout, type TrainingState } from '../src';
import { testContent } from './load-content';
import white from '../../../fixtures/2-white-belt-3-signoffs.json';
import yellow from '../../../fixtures/3-yellow-belt.json';
import orange from '../../../fixtures/6-orange-typical.json';
import green from '../../../fixtures/4-green-belt.json';
import { applyStyleTap, buildStyle, nextSealBelt, styleHelp, styleScreenLayout, type StyleSession, type StyleSlot, type StyleTap } from '../../../apps/client/src/ui/fightingStyle';
import { MIN_TAP } from '../../../apps/client/src/ui/tokens';

const content = testContent();
function training(data: unknown): TrainingState {
  const feed = loadFeed(data);
  return buildTraining(feed, content.abilities, { ms: Date.parse(feed.asOf), weekday: 3 });
}

const fresh = (): StyleSession => ({ loadout: null, open: null, swap: null, focus: null });

/** The same style-area size HomeScene gives the screen (left column, tabs, the part switch). */
function styleArea(width: number, height: number): { w: number; h: number } {
  const pad = height < 369 ? 8 : 16;
  const leftW = Math.min(300, width * 0.38);
  const rw = width - (pad * 2 + leftW) - pad;
  const panelH = height - (pad + 46) - pad;
  const contentH = Math.max(panelH - 20, 277);
  return { w: rw - 20, h: contentH - (44 + 8) };
}

function equip(t: TrainingState, start: Loadout | null, slot: StyleSlot, index: number, id: string): { session: StyleSession; taps: number } {
  let session: StyleSession = { ...fresh(), loadout: start };
  let taps = 0;
  const go = (tap: StyleTap) => {
    const r = applyStyleTap(session, tap, t, content.abilities);
    session = r.session;
    taps++;
    return r;
  };
  go({ kind: 'card', slot, index });
  go({ kind: 'pick', id });
  if (session.swap) {
    const card = buildStyle(t, content.abilities, session.loadout).cards.find((c) => c.slot === 'seal' && c.pick && c.pick.id !== id);
    if (card) go({ kind: 'card', slot: 'seal', index: card.index });
  }
  return { session, taps };
}

describe('PB-05 Fighting Style screen', () => {
  const belts = { white: training(white), yellow: training(yellow), orange: training(orange) } as const;

  it('shows the five slot kinds, the Seal cards for the belt, and a quiet lock under Orange', () => {
    for (const [name, t] of Object.entries(belts)) {
      const m = buildStyle(t, content.abilities, null);
      expect(m.cards.map((c) => c.slot).filter((s, i, all) => all.indexOf(s) === i)).toEqual(['stance', 'virtue', 'strike', 'kata', 'seal']);
      const seals = m.cards.filter((c) => c.slot === 'seal');
      const open = seals.filter((c) => c.locked === null);
      expect(open.length).toBe(name === 'orange' ? 3 : 2);
      if (name === 'orange') expect(seals.every((c) => c.locked === null)).toBe(true);
      else expect(seals.filter((c) => c.locked !== null).map((c) => c.locked)).toEqual([nextSealBelt(t.tier, t.belts)]);
      expect(m.trays.seal.find((p) => p.id === 'lock')?.line).toBe('Coming later');
      expect(m.trays.seal.find((p) => p.id === 'lock')?.comingLater).toBe(true);
      expect(m.cards.some((c) => c.slot === 'kata')).toBe(true);
    }
  });

  it('equips every earned pick in each slot in at most 3 taps', () => {
    for (const t of Object.values(belts)) {
      const m0 = buildStyle(t, content.abilities, null);
      for (const card of m0.cards) {
        if (card.locked) continue;
        const picks = m0.trays[card.slot].filter((p) => p.earned && !p.comingLater);
        let loadout: Loadout | null = null;
        for (const pick of picks) {
          const { session, taps } = equip(t, loadout, card.slot, card.index, pick.id);
          expect(taps).toBeLessThanOrEqual(3);
          loadout = session.loadout;
          const shown = buildStyle(t, content.abilities, loadout);
          if (card.slot === 'strike') {
            if (pick.id === 'spin-kick') expect(shown.cards.find((c) => c.slot === 'strike')?.pick?.id).toBe('spin-kick');
            else expect(loadout?.strike).toBe(pick.id);
          } else if (card.slot === 'seal') {
            expect(shown.cards.filter((c) => c.slot === 'seal' && c.pick).map((c) => c.pick!.id)).toContain(pick.id);
          } else if (card.slot === 'kata') {
            expect(loadout?.kata).toBe(pick.id);
            expect(shown.cards.find((c) => c.slot === 'kata')?.pick?.line).toBe('Power coming soon');
          } else {
            expect(shown.current[card.slot as 'stance' | 'virtue']?.id).toBe(pick.id);
          }
        }
      }
    }
  });

  it('asks which Seal to swap when the row is full, and Cancel leaves it alone', () => {
    const t = belts.yellow;
    const families = buildStyle(t, content.abilities, null).trays.seal.filter((p) => p.earned).map((p) => p.id);
    expect(families.length).toBeGreaterThan(2);
    let loadout: Loadout | null = null;
    loadout = equip(t, loadout, 'seal', 0, families[0]).session.loadout;
    loadout = equip(t, loadout, 'seal', 1, families[1]).session.loadout;
    let session: StyleSession = { ...fresh(), loadout };
    const open = applyStyleTap(session, { kind: 'card', slot: 'seal', index: 0 }, t, content.abilities);
    session = open.session;
    const full = applyStyleTap(session, { kind: 'pick', id: families[2] }, t, content.abilities);
    expect(full.session.swap).toBe(families[2]);
    expect(full.session.loadout).toBe(session.loadout);
    const cancelled = applyStyleTap(full.session, { kind: 'cancel' }, t, content.abilities);
    expect(cancelled.session.swap).toBeNull();
    expect(cancelled.session.loadout?.seals).toEqual([families[0], families[1]]);
    const swapped = applyStyleTap(full.session, { kind: 'card', slot: 'seal', index: 0 }, t, content.abilities);
    expect(swapped.session.loadout?.seals).toContain(families[2]);
    expect(swapped.session.loadout?.seals).not.toContain(families[0]);
  });

  it('does not give the push until Advancing is in a slot', () => {
    // Yellow's #4 is still catch-up, so Advancing is not earned there. Orange has it signed off.
    const t = belts.orange;
    expect(buildStyle(t, content.abilities, null).trays.seal.find((p) => p.id === 'advancing')?.earned).toBe(true);
    const before = characterSetup(newProfile(), t, content.abilities);
    expect(before.effects.some((e) => e.type === 'counterPush')).toBe(false);
    const got = equip(t, null, 'seal', 0, 'advancing');
    expect(got.taps).toBeLessThanOrEqual(3);
    const after = characterSetup({ ...newProfile(), loadout: got.session.loadout }, t, content.abilities);
    expect(after.effects.some((e) => e.type === 'counterPush' && e.amount === 1.5)).toBe(true);
  });

  it('a chosen kata is only a placeholder: the fight does not change', () => {
    const t = belts.white;
    const kata = buildStyle(t, content.abilities, null).trays.kata.find((p) => p.earned);
    expect(kata?.id).toBe('basic-form-1');
    const p = newProfile();
    const before = characterSetup(p, t, content.abilities);
    p.loadout = equip(t, null, 'kata', 0, kata!.id).session.loadout;
    const after = characterSetup(p, t, content.abilities);
    expect(after.effects).toEqual(before.effects);
    expect(after.strike).toEqual(before.strike);
    expect(buildStyle(t, content.abilities, p.loadout).cards.find((c) => c.slot === 'kata')?.pick?.name).toBe('Basic Form 1');
  });

  it('puts a New dot on an unseen earned pick and clears it once that card is opened', () => {
    const t = belts.yellow;
    const unseen = buildStyle(t, content.abilities, null, [], { seen: [] });
    expect(unseen.cards.find((c) => c.slot === 'strike')?.newDot).toBe(true);
    const ids = unseen.trays.strike.filter((p) => p.earned).map((p) => p.id);
    const seen = buildStyle(t, content.abilities, null, [], { seen: ids });
    expect(seen.cards.find((c) => c.slot === 'strike')?.newDot).toBe(false);
    expect(buildStyle(t, content.abilities, null).cards.every((c) => !c.newDot)).toBe(true);
  });

  it('shows one help line, then never that line again, and waits when its tip already showed', () => {
    const first = styleHelp([], [], ['open']);
    expect(first).toEqual({ id: 'help-slots', line: 'Tap a slot, then pick a Seal.', yielded: false });
    expect(styleHelp(['help-slots'], [], ['open'])).toBeNull();
    const waited = styleHelp([], ['seal-unlock-equip-tip'], ['open']);
    expect(waited?.yielded).toBe(true);
    expect(waited?.id).toBe('help-slots');
    const seal = styleHelp(['help-slots'], [], ['seal']);
    expect(seal?.id).toBe('help-seals');
    const swap = styleHelp(['help-slots', 'help-seals'], [], ['swap']);
    expect(swap?.line).toBe('Slots full? Pick a Seal to swap.');
  });

  it('keeps every card and the tray at least 44 pt on the two phone sizes', () => {
    for (const [width, height] of [[667, 375], [844, 390]] as const) {
      const area = styleArea(width, height);
      for (const t of Object.values(belts)) {
        const m = buildStyle(t, content.abilities, null);
        for (const note of [false, true]) {
          const L = styleScreenLayout(area.w, area.h, m.cards.map((c) => ({ slot: c.slot, index: c.index, locked: c.locked !== null })), note);
          for (const box of [...L.cards, L.tray, L.preview]) {
            expect(box.w).toBeGreaterThanOrEqual(MIN_TAP);
            expect(box.h).toBeGreaterThanOrEqual(MIN_TAP);
          }
          expect(L.icon).toBeGreaterThanOrEqual(28);
        }
      }
    }
  });

  it('shows no digits on the screen except the live Self-Defense #4 label', () => {
    for (const t of [...Object.values(belts), training(green)]) {
      const m = buildStyle(t, content.abilities, null, [], { showNote: true, triggers: ['open', 'seal', 'swap', 'kata', 'kata-soon', 'kata-pick'] });
      const names = [
        ...content.abilities.families.flatMap((f) => [f.name, ...f.ranks.map((r) => r.name)]),
        ...content.abilities.strikeDefs.map((s) => s.name),
        ...content.abilities.stances.map((s) => s.name),
        ...Object.values(m.trays).flat().map((p) => p.name),
      ];
      const bits = [
        m.note, m.help?.line,
        ...m.cards.flatMap((c) => [c.label, c.locked, c.pick?.name, c.pick?.line]),
        ...Object.values(m.trays).flat().flatMap((p) => [p.name, p.line]),
      ];
      for (const bit of bits) {
        if (!bit) continue;
        // Curriculum names are shown as written (Basic Form 1, Self-Defense #4). The words around them have no digits.
        let left = bit;
        for (const name of names) if (name) left = left.split(name).join('');
        expect(left).not.toMatch(/\d/);
      }
    }
  });

  it('keeps a seeded green belt in Beginner until a Stance is equipped', () => {
    const t = training(green);
    const m = buildStyle(t, content.abilities, null);
    expect(m.current.stance?.id).toBe('beginners-stance');
    const earned = m.trays.stance.filter((p) => p.earned).map((p) => p.id);
    expect(earned).toContain('ready-stance');
    expect(earned).toContain('horse-stance');
    const setup = characterSetup(newProfile(), t, content.abilities);
    expect(setup.stances![0].id).toBe('beginners-stance');
    const picked = equip(t, null, 'stance', 0, 'ready-stance');
    expect(characterSetup({ ...newProfile(), loadout: picked.session.loadout }, t, content.abilities).stances![0].id).toBe('ready-stance');
  });
});
