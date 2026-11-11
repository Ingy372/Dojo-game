// P-MENU2-e / PB-05: the Fighting Style model (no Phaser, so Vitest can check it).
// Five slot kinds: Stance, Virtue, Strike, Kata, and one card per Seal slot.
// Tap a card, then tap a pick. Wording comes from content/abilities/fighting-style.json.
// Rank names come from the live seal families (J27), not the older draft labels.

import { defaultStrikeDef, earnedStrikes, emptyLoadout, equipSeal, equipStrike, normalizeLoadout, removeSeal, sealSlots, signedOffTechniques, swapSeal, unlockedFamilies, unlockedStances, virtueTitle, type AbilityContent, type Loadout, type SealFamilyDef, type TrainingState } from '@dojo/sim';
import words from '../../../../content/abilities/fighting-style.json';
import helpFile from '../../../../content/abilities/fighting-style-help.json';
import { MIN_TAP, S1, S2, TYPE, pageDots } from './tokens';

export const STYLE_WORDS = words;

export type StyleSlot = 'stance' | 'virtue' | 'strike' | 'kata' | 'seal';

export interface StylePick {
  id: string;
  slot: StyleSlot;
  name: string;
  /** One plain line, no numbers (D6). The one exception is the live label "Self-Defense #4". */
  line: string;
  earned: boolean;
  /** Not-yet Stances: the Trophy Case requirement, so its sheet can open. */
  requirementId?: string;
  /** Lock: show "Coming later" and do not equip. */
  comingLater?: boolean;
}

export interface AlwaysItem {
  id: string;
  name: string;
}

export interface StyleCard {
  slot: StyleSlot;
  /** Seal cards: which slot (0-based). 0 for the other kinds. */
  index: number;
  label: string;
  pick: StylePick | null;
  /** A Seal slot this belt does not have yet. The text is the belt name ("Orange Belt"). */
  locked: string | null;
  /** A soft dot until this card's tray is opened. */
  newDot: boolean;
}

export interface StyleHelp {
  id: string;
  line: string;
  /** A same-visit tip already said this, so it waits and is not marked seen. */
  yielded: boolean;
}

export interface StyleModel {
  /** What is in each slot now (the default when the student never picked). Virtue is null before any stripe. */
  current: { stance: StylePick | null; virtue: StylePick | null };
  /** Earned picks first, then not-yet ones. */
  trays: Record<StyleSlot, StylePick[]>;
  /** Gear and Last run still read this. The Fighting Style screen uses `cards` instead. */
  always: AlwaysItem[];
  cards: StyleCard[];
  /** The one-time slot note, or null. */
  note: string | null;
  help: StyleHelp | null;
}

/** What the screen knows besides the training and the loadout. All optional. */
export interface StyleView {
  /** null = the screen has not been opened, so nothing is dotted yet. */
  seen?: readonly string[] | null;
  showNote?: boolean;
  helpSeen?: readonly string[];
  /** Tip ids already shown this visit. A help line that yields to one of these waits. */
  helpBlocked?: readonly string[];
  helpUsed?: boolean;
  /** Which help triggers are true right now ('open', 'seal', 'swap', 'kata', 'kata-soon', 'kata-pick'). */
  triggers?: readonly string[];
}

export interface StyleSession {
  loadout: Loadout | null;
  open: { slot: StyleSlot; index: number } | null;
  /** The family waiting for "Swap with which one?". */
  swap: string | null;
  /** The pick the student last tapped, so the line can show before it equips. */
  focus: string | null;
}

export type StyleTap =
  | { kind: 'card'; slot: StyleSlot; index: number }
  | { kind: 'pick'; id: string }
  | { kind: 'cancel' }
  | { kind: 'take-out' };

export interface StyleTapResult {
  session: StyleSession;
  /** True when `session.loadout` is a new object and should be saved. */
  save: boolean;
  /** A not-yet pick whose sheet should open. Lock does not open one. */
  sheet: StylePick | null;
  triggers: string[];
  /** Earned pick ids in the tray that was just opened (the New dot clears). */
  seenIds: string[];
}

const line = (id: string): string => (words.lines as Record<string, string>)[id] ?? words.lineFallback;
/** R-STANCE-g: a not-yet Stance can have its own locked line (#312); otherwise its normal line. */
const notYetLine = (id: string): string => (words.notYetLines as Record<string, string>)[id] ?? line(id);
const sealLine = (family: string, name: string): string => words.sealRank.replace('{family}', family).replace('{name}', name);

const HELP_TRIGGER: Record<string, string> = {
  'help-slots': 'open',
  'help-seals': 'seal',
  'help-swap': 'swap',
  'help-kata-class': 'kata',
  'help-kata-soon': 'kata-soon',
  'help-kata-pick': 'kata-pick',
};

interface KataCard { id: string; name: string; requirement: string }
const kataFiles = import.meta.glob('../../../../content/katas/*.json', { eager: true, import: 'default' }) as Record<string, KataCard>;
const KATA_CARDS: KataCard[] = Object.keys(kataFiles).sort().map((k) => kataFiles[k]);

/** The belt name of the first tier that has a third Seal slot, when this belt does not have it yet. */
export function nextSealBelt(tier: number, belts: readonly { name: string }[]): string | null {
  if (sealSlots(tier) >= 3) return null;
  const i = belts.findIndex((_, n) => sealSlots(n + 1) >= 3);
  return i >= 0 ? belts[i].name : null;
}

function newestRank(family: SealFamilyDef, signed: ReadonlySet<number>): { name: string } | null {
  let best: { technique: number; name: string } | null = null;
  for (const r of family.ranks) {
    if (!signed.has(r.technique)) continue;
    if (!best || r.technique > best.technique) best = { technique: r.technique, name: r.name };
  }
  return best;
}

function dot(seen: readonly string[] | null | undefined, picks: readonly StylePick[]): boolean {
  if (seen == null) return false;
  return picks.some((p) => p.earned && !seen.includes(p.id));
}

/** The first unseen help line whose trigger is happening now. A yielded line is not shown and not marked seen. */
export function styleHelp(seen: readonly string[], blocked: readonly string[], triggers: readonly string[]): StyleHelp | null {
  const rows = [...helpFile.help].sort((a, b) => a.session - b.session);
  for (const row of rows) {
    const trig = HELP_TRIGGER[row.id];
    if (!trig || !triggers.includes(trig) || seen.includes(row.id)) continue;
    const yieldsTo = 'yieldsTo' in row ? row.yieldsTo : undefined;
    if (yieldsTo && blocked.includes(yieldsTo)) return { id: row.id, line: '', yielded: true };
    return { id: row.id, line: row.line, yielded: false };
  }
  return null;
}

export function buildStyle(training: TrainingState, abilities: AbilityContent, loadout: Loadout | null, grandfathered: readonly string[] = [], view: StyleView = {}): StyleModel {
  const stances = unlockedStances(training, abilities, grandfathered);
  const earnedStances: StylePick[] = stances.map((f) => ({ id: f.id, slot: 'stance', name: f.name, line: line(f.id), earned: true }));
  const have = new Set(stances.map((f) => f.id));
  const lockedStances: StylePick[] = [];
  // R-STANCE-d2: every Stance shows; ones without a teacher's sign-off yet are not-yet cards.
  for (const st of training.stances) {
    if (st.unlocked || have.has(st.def.id)) continue;
    have.add(st.def.id);
    lockedStances.push({ id: st.def.id, slot: 'stance', name: st.def.name, line: notYetLine(st.def.id), earned: false });
  }

  // The first entry per Virtue is the one a fight uses (loadoutAbilities uses find()).
  const earnedVirtues: StylePick[] = [];
  const vHave = new Set<string>();
  for (const v of training.virtues) {
    if (vHave.has(v.def.id)) continue;
    vHave.add(v.def.id);
    earnedVirtues.push({ id: v.def.id, slot: 'virtue', name: virtueTitle(v), line: line(v.def.id), earned: true });
  }
  const lockedVirtues: StylePick[] = abilities.virtues.filter((d) => !vHave.has(d.id)).map((d) => ({ id: d.id, slot: 'virtue', name: d.name, line: line(d.id), earned: false }));

  // The same defaults a fight uses: the chosen Stance if earned, else the first; the chosen Virtue if earned, else today's pick.
  const stance = earnedStances.find((p) => p.id === loadout?.stance) ?? earnedStances[0] ?? null;
  const defaultVirtue = training.virtue ? earnedVirtues.find((p) => p.id === training.virtue!.def.id) : undefined;
  const virtue = earnedVirtues.find((p) => p.id === loadout?.virtue) ?? defaultVirtue ?? earnedVirtues[0] ?? null;

  // PB-03: nothing is always on now. Gear and Last run still show the Strike in the slot (Spin Kick when empty).
  const normalized = normalizeLoadout(loadout, training, abilities, grandfathered);
  const strikeId = normalized?.strike ?? null;
  const strikeDef = abilities.strikeDefs.find((s) => s.id === strikeId) ?? defaultStrikeDef(abilities.strikeDefs);
  const always = strikeDef ? [{ id: strikeDef.id, name: strikeDef.name }] : [];
  const earnedStrikeIds = earnedStrikes(training, abilities.strikeDefs);
  const strikeTray: StylePick[] = abilities.strikeDefs.map((s) => {
    const earned = s.default || earnedStrikeIds.includes(s.id);
    const on = (strikeDef?.id ?? null) === s.id;
    return {
      id: s.id, slot: 'strike', name: s.name, earned,
      line: !earned ? words.notYet : on && s.default ? words.emptyStrike : s.text,
    };
  });
  const strikePick = strikeTray.find((p) => p.id === strikeDef?.id) ?? null;

  // Kata powers are still placeholders (PB-04, PB-11). A signed-off kata can be chosen; it changes no fight.
  const kataOrder = training.abilities.filter((a) => a.kind === 'stance').map((a) => a.requirement.id);
  const earnedKataReqs = new Set(training.abilities.filter((a) => a.kind === 'stance' && a.unlocked).map((a) => a.requirement.id));
  const kataTray: StylePick[] = KATA_CARDS.filter((k) => earnedKataReqs.has(k.requirement))
    .sort((a, b) => kataOrder.indexOf(a.requirement) - kataOrder.indexOf(b.requirement))
    .map((k) => ({ id: k.id, slot: 'kata' as const, name: k.name, line: words.emptyKata, earned: true }));
  const kataPick = kataTray.find((p) => p.id === loadout?.kata) ?? null;

  const signed = signedOffTechniques(training);
  const earnedFamilies = unlockedFamilies(training, abilities.families);
  const sealTray: StylePick[] = [];
  const pushFamily = (f: SealFamilyDef, earned: boolean, comingLater = false) => {
    const rank = newestRank(f, signed);
    sealTray.push({
      id: f.id, slot: 'seal', name: f.name, earned, comingLater,
      line: comingLater ? words.comingLater : earned && rank ? sealLine(f.name, rank.name) : words.notYet,
    });
  };
  for (const id of earnedFamilies) {
    const f = abilities.families.find((x) => x.id === id);
    if (f) pushFamily(f, true);
  }
  for (const f of abilities.families) {
    if (!f.live || earnedFamilies.includes(f.id)) continue;
    pushFamily(f, false);
  }
  const lock = abilities.families.find((f) => f.id === 'lock');
  if (lock) pushFamily(lock, false, true);

  const equippedSeals = (normalized?.seals ?? []).filter((id) => earnedFamilies.includes(id));
  const slots = sealSlots(training.tier);
  const seen = view.seen;
  const sealFresh = dot(seen, sealTray);
  const cards: StyleCard[] = [
    { slot: 'stance', index: 0, label: words.slots.stance, pick: stance, locked: null, newDot: dot(seen, earnedStances) },
    { slot: 'virtue', index: 0, label: words.slots.virtue, pick: virtue, locked: null, newDot: dot(seen, earnedVirtues) },
    { slot: 'strike', index: 0, label: words.slots.strike, pick: strikePick, locked: null, newDot: dot(seen, strikeTray) },
    { slot: 'kata', index: 0, label: words.slots.kata, pick: kataPick, locked: null, newDot: dot(seen, kataTray) },
  ];
  for (let i = 0; i < slots; i++) {
    const id = equippedSeals[i] ?? null;
    cards.push({ slot: 'seal', index: i, label: words.slots.seal, pick: id ? sealTray.find((p) => p.id === id) ?? null : null, locked: null, newDot: i === 0 && sealFresh });
  }
  const lockedBelt = nextSealBelt(training.tier, training.belts);
  if (lockedBelt) cards.push({ slot: 'seal', index: slots, label: words.slots.seal, pick: null, locked: lockedBelt, newDot: false });

  const help = !view.helpUsed && view.triggers?.length
    ? styleHelp(view.helpSeen ?? [], view.helpBlocked ?? [], view.triggers)
    : null;

  return {
    current: { stance, virtue },
    trays: { stance: [...earnedStances, ...lockedStances], virtue: [...earnedVirtues, ...lockedVirtues], strike: strikeTray, kata: kataTray, seal: sealTray },
    always, cards, note: view.showNote ? words.slotNote : null, help,
  };
}

/** The loadout after tapping `pick` with `slot` chosen. Not-yet picks and the wrong slot change nothing. Stance and Virtue only; Strike, Kata and Seal go through `applyStyleTap`. */
export function equipPick(loadout: Loadout | null, slot: StyleSlot, pick: StylePick): Loadout | null {
  if (slot !== 'stance' && slot !== 'virtue') return loadout;
  if (!pick.earned || pick.slot !== slot) return loadout;
  // B-POLISH-2: re-tapping the equipped pick changes nothing (same object: no re-save, no pop).
  if ((slot === 'stance' ? loadout?.stance : loadout?.virtue) === pick.id) return loadout;
  // PB-01: the Strike, kata and Seal slots are carried through untouched.
  const base: Loadout = { ...emptyLoadout(), ...loadout };
  return slot === 'stance' ? { ...base, stance: pick.id } : { ...base, virtue: pick.id };
}

export interface StyleLayout {
  leftW: number;
  slotW: number;
  slotH: number;
  tileW: number;
  tileH: number;
  perTray: number;
  previewX: number;
  previewW: number;
  previewH: number;
  alwaysY: number;
  icon: number;
  perAlways: number;
}

/** The left (slots + tray) share of the Fighting Style panel; the preview card gets the rest. */
export const STYLE_LEFT_SHARE = 0.58;
/** R-STANCE-d1: the narrowest left share tried when the preview card's words need more width (667). */
export const STYLE_LEFT_SHARE_MIN = 0.46;

/** Sizes for a Fighting Style panel w x h (below the switch). Every tap target is at least 44.
 * B-POLISH-2: `minTileW` is the narrowest tray tile that still holds its widest word with 8 px clear
 * each side (stroke counted); when 3 tiles would be narrower, the tray shows 2 wider tiles. */
/**
 * R-STANCE-d1 QA: the panel content box ends 4 px inside the wood frame's inner edge (and the card's
 * 2 px stroke reaches 1 px further), so the card's right edge sits 5 px further in for an 8 px gap.
 */
export const STYLE_RIM_PAD = 5;

export function styleLayout(w: number, h: number, minTileW = 0, leftShare = STYLE_LEFT_SHARE): StyleLayout {
  const leftW = Math.round(w * leftShare);
  const slotW = Math.floor((leftW - S2) / 2);
  const alwaysH = TYPE.label + S1 + MIN_TAP;
  const room = h - alwaysH - 2 * S2;
  const tileH = Math.max(MIN_TAP + 8, Math.min(72, Math.round(room * 0.4)));
  const slotH = Math.max(MIN_TAP, room - tileH);
  const { perPage: perTray, tileW } = trayPaging(leftW, minTileW, 0);
  const previewX = leftW + S2;
  const icon = MIN_TAP;
  return {
    leftW, slotW, slotH, tileW, tileH, perTray,
    previewX, previewW: w - previewX - STYLE_RIM_PAD, previewH: slotH + S2 + tileH,
    alwaysY: slotH + S2 + tileH + S2,
    icon, perAlways: Math.max(1, Math.floor((w + S1) / (icon + S1))),
  };
}

/** B-POLISH-2: how a tray of `count` picks pages in a row `rowW` wide. Tiles are never narrower
 * than `minTileW` (widest word + 8 px each side + stroke). When the picks don't all fit, the row
 * gets the Trophy Case's ◀ ▶ arrows (MIN_TAP wide) and pages, so every pick can be reached. */
export interface TrayPaging { perPage: number; tileW: number; arrows: boolean; pages: number; tilesX: number }
export function trayPaging(rowW: number, minTileW: number, count: number, maxPerPage = 3): TrayPaging {
  const fit = (room: number): { n: number; tw: number } => {
    for (let n = maxPerPage; n > 1; n--) { const tw = Math.floor((room - (n - 1) * S2) / n); if (tw >= minTileW) return { n, tw }; }
    return { n: 1, tw: Math.max(MIN_TAP, room) };
  };
  const plain = fit(rowW);
  if (count <= plain.n) return { perPage: plain.n, tileW: plain.tw, arrows: false, pages: 1, tilesX: 0 };
  const paged = fit(rowW - 2 * (MIN_TAP + S2));
  return { perPage: paged.n, tileW: paged.tw, arrows: true, pages: Math.ceil(count / paged.n), tilesX: MIN_TAP + S2 };
}

/** The picks on tray page `page` (clamped). */
export function trayPage<T>(picks: T[], paging: TrayPaging, page: number): T[] {
  const p = Math.max(0, Math.min(paging.pages - 1, page));
  return picks.slice(p * paging.perPage, (p + 1) * paging.perPage);
}

/**
 * P-MENU2-f: the tray's page dots (like the Trophy Case: dots only, never numbers), so kids can
 * see there are more picks. One dot per page, the current one lit. Empty when there's one page
 * or the dots wouldn't fit in `room`.
 */
export function trayDots(pages: number, page: number, room: number): { x: number; on: boolean }[] {
  const d = pageDots(pages, room);
  if (!d) return [];
  return Array.from({ length: pages }, (_, i) => ({ x: d.x0 + i * d.step, on: i === page }));
}

export interface StyleBox { x: number; y: number; w: number; h: number }
export interface StyleScreenCard extends StyleBox { slot: StyleSlot; index: number; locked: boolean }
export interface StyleScreenLayout {
  cards: StyleScreenCard[];
  tray: StyleBox;
  preview: StyleBox;
  note: StyleBox | null;
  /** The tray row's width. Page dots are spaced across it. */
  leftW: number;
  /** Picture size on a card. Bigger than the old glyph, and never so tall that the label is pushed off. */
  icon: number;
}

/**
 * PB-05: slot cards wrap to two rows. The kid line is its own row, and the tray uses the
 * full width under it so three picks fit on a page. A later page is one arrow, so a pick is
 * at most three taps (card, arrow, pick). 8 px stays clear at the bottom.
 */
export function styleScreenLayout(w: number, h: number, specs: readonly { slot: StyleSlot; index: number; locked: boolean }[], showNote: boolean): StyleScreenLayout {
  const n = Math.max(1, specs.length);
  const wide = (k: number) => k <= 1 || Math.floor((w - (k - 1) * S2) / k) >= MIN_TAP;
  let r1 = Math.min(4, n);
  if (!(n <= 4 || (wide(4) && wide(n - 4)))) {
    r1 = Math.ceil(n / 2);
    while (r1 > 1 && !wide(r1)) r1--;
  }
  const r2 = n - r1;
  const previewH = MIN_TAP;
  // The note shares the preview row. A row of its own is pushed past the wood on a phone.
  const noteH = 0;
  const bottomPad = 12;
  const rows = r2 > 0 ? 2 : 1;
  const rowGaps = (r2 > 0 ? S2 : 0) + S2 + S2;
  let trayH = 64;
  let cardH = Math.floor((h - bottomPad - previewH - trayH - noteH - rowGaps) / rows);
  if (cardH < MIN_TAP) {
    trayH = MIN_TAP;
    cardH = Math.floor((h - bottomPad - previewH - trayH - noteH - rowGaps) / rows);
  }
  cardH = Math.max(MIN_TAP, Math.min(72, cardH));
  const row = (count: number, y: number): StyleBox[] => {
    if (count <= 0) return [];
    const inset = 4;
    const cw = Math.floor((w - 2 * inset - (count - 1) * S2) / count);
    const used = count * cw + (count - 1) * S2;
    const x0 = inset + Math.floor((w - 2 * inset - used) / 2);
    return Array.from({ length: count }, (_, i) => ({ x: x0 + i * (cw + S2), y, w: cw, h: cardH }));
  };
  const boxes = [...row(r1, 0), ...row(r2, cardH + S2)];
  const previewY = (r2 > 0 ? cardH + S2 : 0) + cardH + S2;
  const trayY = previewY + previewH + S2;
  return {
    cards: specs.map((s, i) => ({ ...s, ...(boxes[i] ?? { x: 0, y: 0, w: MIN_TAP, h: MIN_TAP }) })),
    preview: { x: 4, y: previewY, w: w - 8, h: previewH },
    tray: { x: 4, y: trayY, w: w - 8, h: trayH },
    leftW: w - 8,
    note: showNote ? { x: 4, y: previewY, w: w - 8, h: previewH } : null,
    icon: Math.min(40, Math.max(28, cardH - TYPE.label - 14)),
  };
}

const same = (session: StyleSession): StyleTapResult => ({ session, save: false, sheet: null, triggers: [], seenIds: [] });

function kataTriggers(model: StyleModel): string[] {
  const t = ['kata', 'kata-soon'];
  if (model.trays.kata.filter((p) => p.earned).length >= 2) t.push('kata-pick');
  return t;
}

/**
 * One tap on the Fighting Style screen. A card opens its tray. A pick equips into the open slot.
 * A third Seal when the slots are full sets `swap` and changes nothing until a Seal card is tapped.
 */
export function applyStyleTap(session: StyleSession, tap: StyleTap, training: TrainingState, abilities: AbilityContent, grandfathered: readonly string[] = []): StyleTapResult {
  const model = buildStyle(training, abilities, session.loadout, grandfathered);
  if (tap.kind === 'cancel') return { session: { ...session, swap: null, focus: null }, save: false, sheet: null, triggers: [], seenIds: [] };
  if (tap.kind === 'take-out') {
    if (session.open?.slot !== 'seal') return same(session);
    const id = session.loadout?.seals[session.open.index];
    if (!id) return same(session);
    const next = removeSeal({ ...emptyLoadout(), ...session.loadout }, id);
    return { session: { ...session, loadout: next, swap: null, focus: null }, save: true, sheet: null, triggers: [], seenIds: [] };
  }
  if (tap.kind === 'card') {
    const card = model.cards.find((c) => c.slot === tap.slot && c.index === tap.index);
    if (!card) return same(session);
    if (session.swap && tap.slot === 'seal' && card.pick && !card.locked) {
      const base: Loadout = { ...emptyLoadout(), ...session.loadout };
      // swapSeal returns the same object when the swap is not valid.
      const next = swapSeal(base, card.pick.id, session.swap, unlockedFamilies(training, abilities.families));
      const swapped = next !== base;
      return { session: { loadout: swapped ? next : session.loadout, open: { slot: 'seal', index: tap.index }, swap: null, focus: null }, save: swapped, sheet: null, triggers: [], seenIds: [] };
    }
    const triggers = card.locked ? [] : tap.slot === 'seal' ? ['seal'] : tap.slot === 'kata' ? kataTriggers(model) : [];
    const seenIds = card.locked ? [] : model.trays[tap.slot].filter((p) => p.earned).map((p) => p.id);
    return { session: { ...session, swap: null, focus: null, open: { slot: tap.slot, index: tap.index } }, save: false, sheet: null, triggers, seenIds };
  }
  if (!session.open) return same(session);
  const pick = model.trays[session.open.slot].find((p) => p.id === tap.id);
  if (!pick || pick.slot !== session.open.slot) return same(session);
  if (pick.comingLater || !pick.earned) {
    return { session: { ...session, focus: pick.id }, save: false, sheet: pick.comingLater ? null : pick, triggers: [], seenIds: [] };
  }
  const focus = { ...session, focus: pick.id, swap: null };
  if (pick.slot === 'stance' || pick.slot === 'virtue') {
    const next = equipPick(session.loadout, pick.slot, pick);
    return { session: { ...focus, loadout: next }, save: next !== session.loadout, sheet: null, triggers: [], seenIds: [] };
  }
  if (pick.slot === 'strike') {
    const r = equipStrike({ ...emptyLoadout(), ...session.loadout }, pick.id, abilities.strikeDefs, earnedStrikes(training, abilities.strikeDefs));
    if (r.result !== 'equipped') return { session: focus, save: false, sheet: null, triggers: [], seenIds: [] };
    return { session: { ...focus, loadout: r.loadout }, save: true, sheet: null, triggers: [], seenIds: [] };
  }
  if (pick.slot === 'kata') {
    const base: Loadout = { ...emptyLoadout(), ...session.loadout };
    if (base.kata === pick.id) return { session: focus, save: false, sheet: null, triggers: [], seenIds: [] };
    return { session: { ...focus, loadout: { ...base, kata: pick.id } }, save: true, sheet: null, triggers: [], seenIds: [] };
  }
  const base: Loadout = { ...emptyLoadout(), ...session.loadout };
  const r = equipSeal(base, pick.id, unlockedFamilies(training, abilities.families), sealSlots(training.tier));
  if (r.result === 'full') return { session: { ...session, focus: pick.id, swap: pick.id }, save: false, sheet: null, triggers: ['swap'], seenIds: [] };
  if (r.result !== 'equipped') return { session: focus, save: false, sheet: null, triggers: [], seenIds: [] };
  return { session: { ...focus, loadout: r.loadout }, save: true, sheet: null, triggers: [], seenIds: [] };
}
