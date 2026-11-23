// Town social rules (Jay, Nov 23): preset phrases and parties. Pure and serializable, so the game server can run the
// same rules once the shared town is live (core-design section 11). No free text, ever: players only pick phrases
// from the content file. Times are ticks (20 per second), never the clock.

import { SOCIAL } from './config';

export const PHRASE_ICONS = ['wave', 'star', 'heart', 'team', 'arrow', 'wait', 'fist', 'bow', 'check', 'clock', 'sun'] as const;
export type PhraseIcon = (typeof PHRASE_ICONS)[number];

export interface Phrase {
  id: string;
  text: string;
  icon: PhraseIcon;
}

/** Reads and checks the phrase list (content/social/phrases.json). */
export function loadPhrases(raw: unknown): Phrase[] {
  const fail = (m: string): never => {
    throw new Error(`phrases.json: ${m}`);
  };
  const list = (raw as { phrases?: unknown })?.phrases;
  if (!Array.isArray(list)) fail('"phrases" must be a list');
  const arr = list as Record<string, unknown>[];
  if (arr.length < SOCIAL.phrasesMin || arr.length > SOCIAL.phrasesMax) fail(`keep between ${SOCIAL.phrasesMin} and ${SOCIAL.phrasesMax} phrases`);
  const seen = new Set<string>();
  return arr.map((p) => {
    const id = String(p.id ?? '');
    const text = String(p.text ?? '').trim();
    if (!id || seen.has(id)) fail(`phrase ids must be set and different ("${id}")`);
    seen.add(id);
    if (!text || text.length > SOCIAL.phraseMaxChars) fail(`"${id}" needs a text of at most ${SOCIAL.phraseMaxChars} letters`);
    if (!(PHRASE_ICONS as readonly string[]).includes(String(p.icon))) fail(`"${id}" icon must be one of ${PHRASE_ICONS.join(', ')}`);
    return { id, text, icon: p.icon as PhraseIcon };
  });
}

export interface Party {
  id: string;
  leader: string;
  /** Leader first, then in the order they joined. */
  members: string[];
}

export interface Invite {
  id: string;
  from: string;
  to: string;
  /** Tick it was sent; it expires SOCIAL.inviteTicks later. */
  at: number;
}

/** Everything the social rules remember about a town. Serializable (plain objects only). */
export interface SocialState {
  parties: Record<string, Party>;
  invites: Invite[];
  /** Tick each player last said a phrase. */
  lastSaid: Record<string, number>;
  /** Tick of the last invite from one player to another ("from>to"), against invite spam. */
  lastInvite: Record<string, number>;
  /** Players who turned invites off (a parent setting or the player's own choice). */
  invitesOff: string[];
  nextId: number;
}

export function newSocialState(): SocialState {
  return { parties: {}, invites: [], lastSaid: {}, lastInvite: {}, invitesOff: [], nextId: 1 };
}

export function partyOf(state: SocialState, player: string): Party | null {
  return Object.values(state.parties).find((p) => p.members.includes(player)) ?? null;
}

// ---------------------------------------------------------------- phrases

export type SayResult = { ok: true; phrase: Phrase } | { ok: false; why: 'unknown' | 'too-soon' };

/** A player says a preset phrase; refused if it isn't in the list or they spoke less than the cooldown ago. */
export function say(state: SocialState, phrases: readonly Phrase[], player: string, phraseId: string, tick: number): SayResult {
  const phrase = phrases.find((p) => p.id === phraseId);
  if (!phrase) return { ok: false, why: 'unknown' };
  const last = state.lastSaid[player];
  if (last !== undefined && tick - last < SOCIAL.phraseCooldownTicks) return { ok: false, why: 'too-soon' };
  state.lastSaid[player] = tick;
  return { ok: true, phrase };
}

/** Ticks left before a player may speak again (0 = now). */
export function sayWait(state: SocialState, player: string, tick: number): number {
  const last = state.lastSaid[player];
  return last === undefined ? 0 : Math.max(0, SOCIAL.phraseCooldownTicks - (tick - last));
}

// ---------------------------------------------------------------- parties

export type InviteRefusal = 'self' | 'invites-off' | 'together' | 'busy' | 'full' | 'pending' | 'too-soon';
export type InviteResult = { ok: true; invite: Invite } | { ok: false; why: InviteRefusal };

/** Drops invites older than SOCIAL.inviteTicks. */
export function expireInvites(state: SocialState, tick: number): Invite[] {
  const gone = state.invites.filter((i) => tick - i.at >= SOCIAL.inviteTicks);
  if (gone.length) state.invites = state.invites.filter((i) => tick - i.at < SOCIAL.inviteTicks);
  return gone;
}

/**
 * One player invites another to their party (making one if they have none). Refused when: it's themselves, the other
 * has invites off, they're already together, the other is in another party, the party is full, an invite between
 * them is already waiting, or they invited the same player too recently.
 */
export function invite(state: SocialState, from: string, to: string, tick: number): InviteResult {
  expireInvites(state, tick);
  if (from === to) return { ok: false, why: 'self' };
  if (state.invitesOff.includes(to)) return { ok: false, why: 'invites-off' };
  const mine = partyOf(state, from);
  const theirs = partyOf(state, to);
  if (mine && theirs && mine.id === theirs.id) return { ok: false, why: 'together' };
  if (theirs) return { ok: false, why: 'busy' };
  if (mine && mine.members.length + state.invites.filter((i) => i.from === from).length >= SOCIAL.partyMax) return { ok: false, why: 'full' };
  if (state.invites.some((i) => (i.from === from && i.to === to) || (i.from === to && i.to === from))) return { ok: false, why: 'pending' };
  const key = `${from}>${to}`;
  const last = state.lastInvite[key];
  if (last !== undefined && tick - last < SOCIAL.reinviteTicks) return { ok: false, why: 'too-soon' };
  state.lastInvite[key] = tick;
  const inv: Invite = { id: `v${state.nextId++}`, from, to, at: tick };
  state.invites.push(inv);
  return { ok: true, invite: inv };
}

export type AnswerResult = { ok: true; party: Party | null } | { ok: false; why: 'gone' | 'full' | 'busy' };

/** The invited player says yes: they join the inviter's party (made now if the inviter has none). */
export function acceptInvite(state: SocialState, inviteId: string, tick: number): AnswerResult {
  expireInvites(state, tick);
  const inv = state.invites.find((i) => i.id === inviteId);
  if (!inv) return { ok: false, why: 'gone' };
  state.invites = state.invites.filter((i) => i.id !== inviteId);
  if (partyOf(state, inv.to)) return { ok: false, why: 'busy' };
  let party = partyOf(state, inv.from);
  if (party && party.members.length >= SOCIAL.partyMax) return { ok: false, why: 'full' };
  if (!party) {
    party = { id: `p${state.nextId++}`, leader: inv.from, members: [inv.from] };
    state.parties[party.id] = party;
  }
  party.members.push(inv.to);
  // Joining a party clears every other invite to this player.
  state.invites = state.invites.filter((i) => i.to !== inv.to);
  return { ok: true, party };
}

/** The invited player says no thanks (nothing else happens; the inviter just sees "not now"). */
export function declineInvite(state: SocialState, inviteId: string): AnswerResult {
  const had = state.invites.some((i) => i.id === inviteId);
  state.invites = state.invites.filter((i) => i.id !== inviteId);
  return had ? { ok: true, party: null } : { ok: false, why: 'gone' };
}

/** A player leaves their party. A party of one is closed; if the leader leaves, the next member leads. */
export function leaveParty(state: SocialState, player: string): Party | null {
  const party = partyOf(state, player);
  if (!party) return null;
  party.members = party.members.filter((m) => m !== player);
  state.invites = state.invites.filter((i) => i.from !== player);
  if (party.members.length <= 1) {
    delete state.parties[party.id];
    return null;
  }
  if (party.leader === player) party.leader = party.members[0];
  return party;
}

/** Players switch invites off or on (they can't be invited while off; pending invites to them are dropped). */
export function setInvitesOff(state: SocialState, player: string, off: boolean): void {
  state.invitesOff = state.invitesOff.filter((p) => p !== player);
  if (off) {
    state.invitesOff.push(player);
    state.invites = state.invites.filter((i) => i.to !== player);
  }
}
