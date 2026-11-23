import { describe, expect, it } from 'vitest';
import {
  SOCIAL,
  acceptInvite,
  declineInvite,
  expireInvites,
  invite,
  leaveParty,
  loadPhrases,
  newSocialState,
  partyOf,
  say,
  sayWait,
  setInvitesOff,
} from '../src';
import raw from '../../../content/social/phrases.json';

const PHRASES = loadPhrases(raw);

describe('preset phrases (Nov 23)', () => {
  it('the list loads: 10 to 15 short phrases with different ids', () => {
    expect(PHRASES.length).toBeGreaterThanOrEqual(10);
    expect(PHRASES.length).toBeLessThanOrEqual(15);
    expect(new Set(PHRASES.map((p) => p.id)).size).toBe(PHRASES.length);
    for (const p of PHRASES) expect(p.text.length).toBeLessThanOrEqual(SOCIAL.phraseMaxChars);
  });

  it('refuses a broken list', () => {
    expect(() => loadPhrases({ phrases: [] })).toThrow();
    expect(() => loadPhrases({ phrases: Array.from({ length: 10 }, () => ({ id: 'a', text: 'Hi', icon: 'wave' })) })).toThrow();
  });

  it('only phrases from the list can be said, once every 3 seconds', () => {
    const s = newSocialState();
    expect(say(s, PHRASES, 'me', 'free text!', 0)).toEqual({ ok: false, why: 'unknown' });
    expect(say(s, PHRASES, 'me', 'hello', 0).ok).toBe(true);
    expect(say(s, PHRASES, 'me', 'hello', 10)).toEqual({ ok: false, why: 'too-soon' });
    expect(sayWait(s, 'me', 10)).toBe(SOCIAL.phraseCooldownTicks - 10);
    expect(say(s, PHRASES, 'you', 'hello', 10).ok).toBe(true);
    expect(say(s, PHRASES, 'me', 'thank-you', SOCIAL.phraseCooldownTicks).ok).toBe(true);
  });
});

describe('parties (Nov 23)', () => {
  it('an accepted invite makes a party, led by the inviter', () => {
    const s = newSocialState();
    const r = invite(s, 'me', 'ava', 0);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    const a = acceptInvite(s, r.invite.id, 5);
    expect(a.ok && a.party?.members).toEqual(['me', 'ava']);
    expect(partyOf(s, 'ava')?.leader).toBe('me');
  });

  it('refuses self, doubles, players in other parties, and a full party', () => {
    const s = newSocialState();
    expect(invite(s, 'me', 'me', 0)).toEqual({ ok: false, why: 'self' });
    const r = invite(s, 'me', 'ava', 0);
    expect(invite(s, 'me', 'ava', 1)).toEqual({ ok: false, why: 'pending' });
    expect(invite(s, 'ava', 'me', 1)).toEqual({ ok: false, why: 'pending' });
    if (r.ok) acceptInvite(s, r.invite.id, 2);
    expect(invite(s, 'me', 'ava', 3)).toEqual({ ok: false, why: 'together' });
    const other = invite(s, 'leo', 'mia', 3);
    if (other.ok) acceptInvite(s, other.invite.id, 4);
    expect(invite(s, 'me', 'mia', 5)).toEqual({ ok: false, why: 'busy' });
    for (const who of ['kai', 'zoe']) {
      const v = invite(s, 'me', who, 6);
      if (v.ok) acceptInvite(s, v.invite.id, 7);
    }
    expect(partyOf(s, 'me')?.members.length).toBe(SOCIAL.partyMax);
    expect(invite(s, 'me', 'eli', 8)).toEqual({ ok: false, why: 'full' });
  });

  it('pending invites count toward the party size', () => {
    const s = newSocialState();
    expect(invite(s, 'me', 'a', 0).ok).toBe(true);
    expect(invite(s, 'me', 'b', 0).ok).toBe(true);
    expect(invite(s, 'me', 'c', 0).ok).toBe(true);
    const first = s.invites[0];
    acceptInvite(s, first.id, 1);
    expect(invite(s, 'me', 'd', 2)).toEqual({ ok: false, why: 'full' });
  });

  it('no thanks is quiet, and the same invite waits 10 seconds before it can be sent again', () => {
    const s = newSocialState();
    const r = invite(s, 'me', 'ava', 0);
    if (r.ok) expect(declineInvite(s, r.invite.id).ok).toBe(true);
    expect(partyOf(s, 'me')).toBeNull();
    expect(invite(s, 'me', 'ava', 10)).toEqual({ ok: false, why: 'too-soon' });
    expect(invite(s, 'me', 'ava', SOCIAL.reinviteTicks).ok).toBe(true);
  });

  it('invites expire after 30 seconds', () => {
    const s = newSocialState();
    const r = invite(s, 'me', 'ava', 0);
    expect(expireInvites(s, SOCIAL.inviteTicks).length).toBe(1);
    if (r.ok) expect(acceptInvite(s, r.invite.id, SOCIAL.inviteTicks + 1)).toEqual({ ok: false, why: 'gone' });
  });

  it('players with invites off cannot be invited', () => {
    const s = newSocialState();
    setInvitesOff(s, 'ava', true);
    expect(invite(s, 'me', 'ava', 0)).toEqual({ ok: false, why: 'invites-off' });
    setInvitesOff(s, 'ava', false);
    expect(invite(s, 'me', 'ava', 0).ok).toBe(true);
  });

  it('leaving: the next member leads; a party of one closes', () => {
    const s = newSocialState();
    for (const who of ['ava', 'leo']) {
      const v = invite(s, 'me', who, 0);
      if (v.ok) acceptInvite(s, v.invite.id, 1);
    }
    expect(leaveParty(s, 'me')?.leader).toBe('ava');
    expect(leaveParty(s, 'leo')).toBeNull();
    expect(partyOf(s, 'ava')).toBeNull();
    expect(Object.keys(s.parties)).toHaveLength(0);
  });

  it('the whole state survives a trip through JSON (the server can keep it)', () => {
    const s = newSocialState();
    const v = invite(s, 'me', 'ava', 0);
    if (v.ok) acceptInvite(s, v.invite.id, 1);
    say(s, PHRASES, 'me', 'hello', 2);
    expect(JSON.parse(JSON.stringify(s))).toEqual(s);
  });
});
