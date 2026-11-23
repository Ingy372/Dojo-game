// Town social (Jay, Nov 23): preset phrases in bright bubbles over heads, and parties. The rules are in
// packages/sim/src/social.ts (the server will run the same ones); this file draws them: the Say and Party buttons
// (bottom right, where no fight buttons sit in town), the phrase list, a player's card (tap a classmate), the
// "wants to team up" card, the party menu and the small party list at the top left.
// Until the shared town is live, the only other players are the pretend classmates of the crowd test (?crowd=N);
// they answer like simple bots so the whole flow can be tried on a phone.
import Phaser from 'phaser';
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
  type Invite,
  type InviteRefusal,
  type Phrase,
  type SocialState,
  type Vec2,
} from '@dojo/sim';
import { sfx } from '../audio/Sfx';
import { button } from './button';
import { fill } from './pathScreen';
import { speechBubble, type Bubble } from './speechBubble';
import { DPR, FONT, crisp, view } from './theme';
import { MIN_TAP, S1, S2, S3, TYPE } from './tokens';
import RAW from '../../../../content/social/phrases.json';

export const PHRASES: Phrase[] = loadPhrases(RAW);
const W = RAW.words;
export const ME = 'me';

/** Another player in town (now: a pretend classmate; later: a real classmate from the server). */
export interface SocialPlayer {
  id: string;
  name: string;
  pos: Vec2;
  /** Belt colour, for the dot on their card. */
  belt: number;
  /** A pretend classmate (answers on its own). */
  bot: boolean;
}

/** What the town gives the social layer. */
export interface SocialHost {
  scene: Phaser.Scene;
  /** The world layer (bubbles are drawn in the world, over heads). */
  world: Phaser.GameObjects.Container;
  tile: number;
  myPos(): Vec2;
  myName(): string;
  others(): SocialPlayer[];
  /** World tiles to a screen point. */
  toScreen(p: Vec2): { x: number; y: number };
  /** Stops the hero walking while a card or menu is up. */
  setPaused(on: boolean): void;
  /** Sends a pretend classmate somewhere (party members follow the leader), or stops it (null). */
  botGoTo(id: string, to: Vec2 | null): void;
  /** Party members' name tags turn green. */
  setNameColour(id: string, colour: string): void;
}

const PANEL = 0x1b1838;
const RIM = 0xffd166;
const SAY_COLOURS = [0x2f7fd0, 0x7a4fc2, 0x2a9a6a, 0xd0782f, 0xc04a7a];
const NEARBY_TILES = 9;
/** How close (tiles) bots must be to hear you. */
const HEAR_TILES = 5;
/** Bot replies to a phrase. */
const REPLY: Record<string, string[]> = {
  hello: ['hello'],
  goodbye: ['goodbye', 'see-you'],
  'good-job': ['thank-you'],
  'thank-you': ['welcome'],
  'great-kata': ['thank-you'],
  'nice-look': ['thank-you'],
  'good-game': ['good-game'],
  train: ['ready'],
  'follow-me': ['ready'],
  'see-you': ['see-you', 'goodbye'],
};

type Layer = Phaser.GameObjects.Container;

export class TownSocial {
  readonly state: SocialState = newSocialState();
  private readonly scene: Phaser.Scene;
  private hud!: Layer;
  private sayBtn: Phaser.Geom.Rectangle | null = null;
  private partyBtn: Phaser.Geom.Rectangle | null = null;
  private panel: { layer: Layer; rect: Phaser.Geom.Rectangle; kind: 'say' | 'card' | 'party'; who?: string } | null = null;
  private inviteCard: { layer: Layer; rect: Phaser.Geom.Rectangle; invite: Invite } | null = null;
  private partyList: Layer | null = null;
  private toastLayer: Layer | null = null;
  private bubbles = new Map<string, Bubble>();
  private botNext = new Map<string, number>();
  private timers: Phaser.Time.TimerEvent[] = [];
  private lastPartyKey = '';
  private hidden = false;

  constructor(private readonly host: SocialHost) {
    this.scene = host.scene;
    this.hud = this.scene.add.container(0, 0).setDepth(55);
    this.layout();
    this.scene.scale.on(Phaser.Scale.Events.RESIZE, this.layout, this);
    this.scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.destroy());
  }

  private get tick(): number {
    return Math.floor(this.scene.time.now / 50);
  }

  destroy(): void {
    this.scene.scale.off(Phaser.Scale.Events.RESIZE, this.layout, this);
    for (const t of this.timers) t.remove();
    for (const b of this.bubbles.values()) b.dismiss();
  }

  /** Hides the buttons (a Sensei tour, the shop) or shows them again. */
  setHidden(on: boolean): void {
    this.hidden = on;
    if (on) this.closePanel();
    this.layout();
  }

  // ---------------------------------------------------------------- screen hits

  /** True when a screen point is on the social buttons, a card or a menu (so a tap there doesn't walk). */
  hits(x: number, y: number): boolean {
    if (this.hidden) return false;
    if (this.sayBtn?.contains(x, y) || this.partyBtn?.contains(x, y)) return true;
    if (this.panel) return true; // a card or menu is up: taps go to it, or close it
    if (this.inviteCard?.rect.contains(x, y)) return true;
    return false;
  }

  /** The other player drawn under a screen point, if any (feet to the top of the head). */
  playerAt(x: number, y: number): SocialPlayer | null {
    if (this.hidden) return null;
    const { width, height } = view(this.scene);
    // the stick's corner stays the stick's: a thumb there always steers
    if (x < width * 0.4 && y > height * 0.4) return null;
    let best: SocialPlayer | null = null;
    let bestD = Infinity;
    for (const p of this.host.others()) {
      const feet = this.host.toScreen(p.pos);
      const head = this.host.toScreen({ x: p.pos.x, y: p.pos.y - 1.25 });
      const half = Math.abs(this.host.toScreen({ x: p.pos.x + 0.42, y: p.pos.y }).x - feet.x);
      if (x < feet.x - half || x > feet.x + half || y < head.y || y > feet.y + 6) continue;
      const d = Math.abs(y - feet.y);
      if (d < bestD) {
        best = p;
        bestD = d;
      }
    }
    return best;
  }

  /** A tap on a classmate opens their card. */
  tapPlayer(p: SocialPlayer): void {
    sfx.tap();
    this.openCard(p.id);
  }

  // ---------------------------------------------------------------- every frame

  update(): void {
    const t = this.tick;
    for (const gone of expireInvites(this.state, t)) {
      if (this.inviteCard?.invite.id === gone.id) this.closeInviteCard();
    }
    // bubbles follow their speakers
    for (const [id, b] of this.bubbles) {
      if (!b.alive) {
        this.bubbles.delete(id);
        continue;
      }
      const p = id === ME ? this.host.myPos() : this.host.others().find((o) => o.id === id)?.pos;
      if (p) b.follow(p.x * this.host.tile, (p.y - 1.72) * this.host.tile);
    }
    this.botsThink(t);
    // the party list and name colours follow the party
    const party = partyOf(this.state, ME);
    const key = party ? party.members.join(',') + '|' + party.leader : '';
    if (key !== this.lastPartyKey) {
      this.lastPartyKey = key;
      for (const o of this.host.others()) {
        const inParty = !!party?.members.includes(o.id);
        this.host.setNameColour(o.id, inParty ? '#8dffb0' : '#ffffff');
        if (!inParty && o.bot) this.host.botGoTo(o.id, null);
      }
      this.drawPartyList();
      if (this.panel?.kind === 'party') this.openParty();
      if (this.panel?.kind === 'card' && this.panel.who) this.openCard(this.panel.who);
    }
    // party members (pretend classmates) walk after their leader
    if (party) {
      const lead = party.leader === ME ? this.host.myPos() : this.host.others().find((o) => o.id === party.leader)?.pos;
      if (lead) {
        party.members.forEach((m, i) => {
          if (m === party.leader || m === ME) return;
          const o = this.host.others().find((x) => x.id === m);
          if (!o?.bot) return;
          const d = Math.hypot(o.pos.x - lead.x, o.pos.y - lead.y);
          if (d > 2.2) this.host.botGoTo(m, { x: lead.x + (i % 2 ? 0.9 : -0.9), y: lead.y + 0.7 });
        });
      }
    }
  }

  // ---------------------------------------------------------------- the buttons

  layout(): void {
    this.hud.removeAll(true);
    this.sayBtn = null;
    this.partyBtn = null;
    if (this.hidden) {
      this.partyList?.setVisible(false);
      return;
    }
    const { width, height } = view(this.scene);
    const bw = 78;
    const bh = MIN_TAP + 4;
    const y = height - bh - S2 - 4;
    const sayX = width - bw - S2 - 4;
    const partyX = sayX - bw - S2;
    const s = button(this.scene, { x: sayX, y, w: bw, h: bh, label: W.say, color: 0x2f7fd0, size: TYPE.title, stroke: 0xffffff, onTap: () => this.toggleSay() }, this.hud);
    const p = button(this.scene, { x: partyX, y, w: bw, h: bh, label: W.party, color: 0x2a8a5a, size: TYPE.title, stroke: 0xffffff, onTap: () => this.toggleParty() }, this.hud);
    this.sayBtn = s.hit.getBounds();
    this.partyBtn = p.hit.getBounds();
    // a small badge on Party while an invite waits
    if (this.state.invites.some((i) => i.to === ME)) {
      const g = this.scene.add.graphics();
      g.fillStyle(0xff4d6d).fillCircle(partyX + bw - 6, y + 6, 8).lineStyle(2, 0xffffff).strokeCircle(partyX + bw - 6, y + 6, 8);
      this.hud.add(g);
    }
    this.partyList?.setVisible(true);
    if (this.panel) this.reopen();
    this.drawPartyList();
  }

  private reopen(): void {
    const p = this.panel;
    if (!p) return;
    if (p.kind === 'say') this.openSay();
    else if (p.kind === 'party') this.openParty();
    else if (p.who) this.openCard(p.who);
  }

  private toggleSay(): void {
    sfx.tap();
    if (this.panel?.kind === 'say') this.closePanel();
    else this.openSay();
  }

  private toggleParty(): void {
    sfx.tap();
    if (this.panel?.kind === 'party') this.closePanel();
    else this.openParty();
  }

  closePanel(): void {
    this.panel?.layer.destroy();
    this.panel = null;
    this.host.setPaused(false);
  }

  /** A dark rounded panel with a gold rim, its title and an X, added to a new layer. */
  private frame(x: number, y: number, w: number, h: number, title: string): Layer {
    this.panel?.layer.destroy();
    const layer = this.scene.add.container(0, 0).setDepth(58);
    const { width, height } = view(this.scene);
    // the rest of the screen: a tap outside closes the panel
    const shade = this.scene.add.zone(0, 0, width, height).setOrigin(0).setInteractive();
    shade.on('pointerup', (ptr: Phaser.Input.Pointer) => {
      if (!new Phaser.Geom.Rectangle(x, y, w, h).contains(ptr.x / DPR, ptr.y / DPR)) this.closePanel();
    });
    layer.add(shade);
    const g = this.scene.add.graphics();
    g.fillStyle(0x000000, 0.35).fillRoundedRect(x + 2, y + 4, w, h, 14);
    g.fillStyle(PANEL, 0.96).fillRoundedRect(x, y, w, h, 14);
    g.lineStyle(3, RIM, 0.9).strokeRoundedRect(x + 1.5, y + 1.5, w - 3, h - 3, 13);
    layer.add(g);
    layer.add(this.text(x + w / 2, y + 10, title, TYPE.title + 1, '#ffd166', true));
    button(this.scene, { x: x + w - 44 - 4, y: y + 4, w: 44, h: 36, label: '✕', color: 0x4a3a6a, size: TYPE.title, onTap: () => this.closePanel() }, layer);
    return layer;
  }

  private text(x: number, y: number, s: string, size: number, color: string, bold = false, wrap?: number, originX = 0.5): Phaser.GameObjects.Text {
    return this.scene.add
      .text(x, y, s, { fontFamily: FONT, fontStyle: bold ? 'bold' : 'normal', fontSize: `${size}px`, color, align: originX === 0.5 ? 'center' : 'left', wordWrap: wrap ? { width: wrap, useAdvancedWrap: true } : undefined })
      .setOrigin(originX, 0)
      .setResolution(crisp())
      .setStroke('#120e22', bold ? 3 : 0);
  }

  // ---------------------------------------------------------------- phrases

  private openSay(): void {
    const { width, height } = view(this.scene);
    const cols = 3;
    const rows = Math.ceil(PHRASES.length / cols);
    const w = Math.min(width - 2 * S2, 470);
    const bh = Math.max(34, Math.min(42, Math.floor((height - 2 * S2 - 56 - MIN_TAP - S2 - (rows - 1) * S1) / rows)));
    const h = 48 + rows * (bh + S1) + S2;
    const x = width - w - S2;
    const y = Math.max(S2, height - h - MIN_TAP - 4 - S2 * 2);
    const layer = this.frame(x, y, w, h, W.sayTitle);
    const wait = sayWait(this.state, ME, this.tick);
    const cw = (w - 2 * S2 - (cols - 1) * S1) / cols;
    PHRASES.forEach((ph, i) => {
      const cx = x + S2 + (i % cols) * (cw + S1);
      const cy = y + 46 + Math.floor(i / cols) * (bh + S1);
      button(this.scene, { x: cx, y: cy, w: cw, h: bh, label: ph.text, color: SAY_COLOURS[i % SAY_COLOURS.length], size: TYPE.body, disabled: wait > 0, labelWrap: cw - 8, onTap: () => this.sayPhrase(ph.id) }, layer);
    });
    if (wait > 0) {
      layer.add(this.text(x + w / 2, y + 30, W.wait, TYPE.label, '#cfd8ff'));
      this.timers.push(this.scene.time.delayedCall(wait * 50 + 30, () => this.panel?.kind === 'say' && this.openSay()));
    }
    this.panel = { layer, rect: new Phaser.Geom.Rectangle(x, y, w, h), kind: 'say' };
  }

  private sayPhrase(id: string): void {
    const r = say(this.state, PHRASES, ME, id, this.tick);
    if (!r.ok) return;
    sfx.tap();
    this.closePanel();
    this.showBubble(ME, r.phrase.text);
    // pretend classmates nearby answer some phrases, or ask you to team up back
    const me = this.host.myPos();
    const near = this.host.others().filter((o) => o.bot && Math.hypot(o.pos.x - me.x, o.pos.y - me.y) < HEAR_TILES);
    if (!near.length) return;
    const who = near[Math.floor(Math.random() * near.length)];
    if (id === 'team-up' && !partyOf(this.state, who.id) && !partyOf(this.state, ME)) {
      this.later(1200, () => {
        const inv = invite(this.state, who.id, ME, this.tick);
        if (inv.ok) this.incomingInvite(inv.invite);
      });
      return;
    }
    const replies = REPLY[id];
    if (replies) this.later(900 + Math.random() * 600, () => this.botSay(who.id, replies[Math.floor(Math.random() * replies.length)]));
  }

  private showBubble(id: string, line: string): void {
    this.bubbles.get(id)?.dismiss();
    const p = id === ME ? this.host.myPos() : this.host.others().find((o) => o.id === id)?.pos;
    if (!p) return;
    const b = speechBubble(this.scene, this.host.world, p.x * this.host.tile, (p.y - 1.72) * this.host.tile, line, {
      holdMs: SOCIAL.bubbleMs,
      size: 12,
      fill: id === ME ? 0xfff3c4 : 0xffffff,
    });
    this.bubbles.set(id, b);
  }

  private botSay(id: string, phraseId: string): void {
    const r = say(this.state, PHRASES, id, phraseId, this.tick);
    if (r.ok) this.showBubble(id, r.phrase.text);
  }

  private later(ms: number, fn: () => void): void {
    this.timers.push(this.scene.time.delayedCall(ms, fn));
  }

  /** Pretend classmates now and then say something friendly on their own. */
  private botsThink(t: number): void {
    for (const o of this.host.others()) {
      if (!o.bot) continue;
      const next = this.botNext.get(o.id);
      if (next === undefined) {
        this.botNext.set(o.id, t + 200 + Math.floor(Math.random() * 600));
        continue;
      }
      if (t < next) continue;
      this.botNext.set(o.id, t + 500 + Math.floor(Math.random() * 700));
      const me = this.host.myPos();
      if (Math.hypot(o.pos.x - me.x, o.pos.y - me.y) > NEARBY_TILES) continue;
      const pick = ['hello', 'train', 'good-job', 'nice-look', 'ready'][Math.floor(Math.random() * 5)];
      this.botSay(o.id, pick);
    }
  }

  // ---------------------------------------------------------------- a classmate's card

  private openCard(id: string): void {
    const o = this.host.others().find((x) => x.id === id);
    if (!o) return this.closePanel();
    const { width } = view(this.scene);
    const w = Math.min(300, width - 2 * S2);
    const h = 150;
    const x = (width - w) / 2;
    const y = S2 + 4;
    const layer = this.frame(x, y, w, h, o.name);
    const dot = this.scene.add.graphics();
    dot.fillStyle(o.belt).fillRoundedRect(x + w / 2 - 34, y + 38, 68, 10, 4).lineStyle(1.5, 0xffffff, 0.7).strokeRoundedRect(x + w / 2 - 34, y + 38, 68, 10, 4);
    layer.add(dot);
    const status = this.cardStatus(id);
    if (status) layer.add(this.text(x + w / 2, y + 60, status, TYPE.body, '#bfe9ff', true, w - 2 * S3));
    button(this.scene, {
      x: x + S3,
      y: y + h - MIN_TAP - S2,
      w: w - 2 * S3,
      h: MIN_TAP,
      label: W.invite,
      color: 0x2a8a5a,
      size: TYPE.title,
      disabled: !!status,
      onTap: () => this.sendInvite(id),
    }, layer);
    this.panel = { layer, rect: new Phaser.Geom.Rectangle(x, y, w, h), kind: 'card', who: id };
    this.host.setPaused(true);
  }

  /** Why an invite to this player can't be sent now (or '' when it can). */
  private cardStatus(id: string): string {
    const mine = partyOf(this.state, ME);
    if (mine?.members.includes(id)) return W.together;
    if (partyOf(this.state, id)) return W.busy;
    if (this.state.invites.some((i) => (i.from === ME && i.to === id) || (i.from === id && i.to === ME))) return W.pending;
    if (this.state.invitesOff.includes(id)) return W.invitesOffThem;
    if (mine && mine.members.length >= SOCIAL.partyMax) return W.full;
    return '';
  }

  private refusal(why: InviteRefusal): string {
    return why === 'together' ? W.together : why === 'busy' ? W.busy : why === 'full' ? W.full : why === 'pending' ? W.pending : why === 'invites-off' ? W.invitesOffThem : W.tooSoon;
  }

  private sendInvite(id: string): void {
    const r = invite(this.state, ME, id, this.tick);
    if (!r.ok) {
      this.toast(this.refusal(r.why));
      return;
    }
    sfx.tap();
    this.toast(W.inviteSent);
    if (this.panel?.kind === 'card') this.openCard(id);
    else if (this.panel?.kind === 'party') this.openParty();
    // a pretend classmate answers after a moment (most say yes)
    const o = this.host.others().find((x) => x.id === id);
    if (o?.bot) {
      this.later(1300 + Math.random() * 1200, () => {
        const still = this.state.invites.find((i) => i.id === r.invite.id);
        if (!still) return;
        if (Math.random() < 0.8) {
          const a = acceptInvite(this.state, r.invite.id, this.tick);
          if (a.ok) {
            sfx.chest();
            this.toast(fill(W.joined, { name: o.name }));
            this.botSay(id, 'ready');
          }
        } else {
          declineInvite(this.state, r.invite.id);
          this.toast(fill(W.said_no, { name: o.name }));
        }
        this.refreshPanels();
      });
    }
  }

  // ---------------------------------------------------------------- someone invites you

  private incomingInvite(inv: Invite): void {
    this.closeInviteCard();
    const from = this.host.others().find((o) => o.id === inv.from);
    if (!from) return;
    sfx.appear();
    const { width } = view(this.scene);
    const w = Math.min(320, width - 2 * S2);
    const h = 96;
    const x = (width - w) / 2;
    const y = S2 + 4;
    const layer = this.scene.add.container(0, 0).setDepth(59);
    const g = this.scene.add.graphics();
    g.fillStyle(0x000000, 0.35).fillRoundedRect(x + 2, y + 4, w, h, 14);
    g.fillStyle(0x1f3a5a, 0.97).fillRoundedRect(x, y, w, h, 14);
    g.lineStyle(3, 0x8dffb0).strokeRoundedRect(x + 1.5, y + 1.5, w - 3, h - 3, 13);
    layer.add(g);
    layer.add(this.text(x + w / 2, y + 10, fill(W.invitedYou, { name: from.name }), TYPE.title, '#ffffff', true, w - 2 * S2));
    const bw = (w - 3 * S2) / 2;
    button(this.scene, { x: x + S2, y: y + h - MIN_TAP - S2, w: bw, h: MIN_TAP, label: W.join, color: 0x2a8a5a, size: TYPE.title, onTap: () => this.answer(true) }, layer);
    button(this.scene, { x: x + 2 * S2 + bw, y: y + h - MIN_TAP - S2, w: bw, h: MIN_TAP, label: W.notNow, color: 0x4a3a6a, size: TYPE.title, onTap: () => this.answer(false) }, layer);
    this.inviteCard = { layer, rect: new Phaser.Geom.Rectangle(x, y, w, h), invite: inv };
    this.layout();
  }

  private answer(yes: boolean): void {
    const card = this.inviteCard;
    if (!card) return;
    this.closeInviteCard();
    sfx.tap();
    if (!yes) {
      declineInvite(this.state, card.invite.id);
    } else {
      const r = acceptInvite(this.state, card.invite.id, this.tick);
      const from = this.host.others().find((o) => o.id === card.invite.from);
      if (r.ok && from) {
        sfx.chest();
        this.toast(fill(W.youJoined, { name: from.name }));
      } else if (!r.ok) this.toast(W.tooSoon);
    }
    this.refreshPanels();
  }

  private closeInviteCard(): void {
    this.inviteCard?.layer.destroy();
    this.inviteCard = null;
    this.layout();
  }

  // ---------------------------------------------------------------- the party menu

  private openParty(): void {
    const { width, height } = view(this.scene);
    const w = Math.min(380, width - 2 * S2);
    const h = Math.min(height - 2 * S2 - MIN_TAP - S2, 300);
    const x = (width - w) / 2;
    const y = Math.max(S2, (height - MIN_TAP - S2 - h) / 2);
    const party = partyOf(this.state, ME);
    const layer = this.frame(x, y, w, h, party ? W.partyTitle : W.noParty);
    let cy = y + 42;
    const row = 30;
    if (party) {
      for (const m of party.members) {
        const name = m === ME ? `${this.host.myName()} (${W.you})` : this.host.others().find((o) => o.id === m)?.name ?? m;
        layer.add(this.text(x + S3, cy + 5, name, TYPE.body + 1, '#ffffff', true, undefined, 0));
        if (m === party.leader) layer.add(this.text(x + w - S3, cy + 6, W.leader, TYPE.label, '#ffd166', true).setOrigin(1, 0));
        cy += row;
      }
    } else {
      layer.add(this.text(x + w / 2, cy, W.noPartyLine, TYPE.body, '#cfd8ff'));
      cy += row;
    }
    cy += S1;
    layer.add(this.text(x + S3, cy, W.nearby, TYPE.body, '#ffe8a8', true, undefined, 0));
    cy += 24;
    const me = this.host.myPos();
    const near = this.host
      .others()
      .filter((o) => !party?.members.includes(o.id))
      .map((o) => ({ o, d: Math.hypot(o.pos.x - me.x, o.pos.y - me.y) }))
      .filter((n) => n.d < NEARBY_TILES)
      .sort((a, b) => a.d - b.d);
    const bottom = y + h - MIN_TAP - S2 * 2;
    const fit = Math.max(0, Math.floor((bottom - cy) / (row + 4)));
    if (!near.length) {
      layer.add(this.text(x + w / 2, cy + 2, W.nobody, TYPE.body, '#cfd8ff'));
    }
    for (const { o } of near.slice(0, fit)) {
      layer.add(this.text(x + S3, cy + 7, o.name, TYPE.body, '#ffffff', false, undefined, 0));
      const status = this.cardStatus(o.id);
      if (status) layer.add(this.text(x + w - S3, cy + 8, status, TYPE.label, '#bfe9ff').setOrigin(1, 0));
      else button(this.scene, { x: x + w - S3 - 96, y: cy, w: 96, h: row, label: W.invite.split(' ')[0], color: 0x2a8a5a, size: TYPE.label + 1, onTap: () => this.sendInvite(o.id) }, layer);
      cy += row + 4;
    }
    // bottom row: leave, and invites on/off
    const off = this.state.invitesOff.includes(ME);
    const by = y + h - MIN_TAP - S2;
    const bw = party ? (w - 3 * S2) / 2 : w - 2 * S2;
    button(this.scene, { x: x + S2, y: by, w: bw, h: MIN_TAP, label: off ? W.invitesOff : W.invitesOn, color: off ? 0x5a4a6a : 0x2f6a8a, size: TYPE.body, onTap: () => {
      setInvitesOff(this.state, ME, !off);
      if (!off) this.closeInviteCard();
      sfx.tap();
      this.openParty();
    } }, layer);
    if (party) {
      button(this.scene, { x: x + 2 * S2 + bw, y: by, w: bw, h: MIN_TAP, label: W.leave, color: 0x8a3a3a, size: TYPE.body, onTap: () => {
        leaveParty(this.state, ME);
        sfx.tap();
        this.refreshPanels();
      } }, layer);
    }
    this.panel = { layer, rect: new Phaser.Geom.Rectangle(x, y, w, h), kind: 'party' };
    this.host.setPaused(true);
  }

  private refreshPanels(): void {
    this.lastPartyKey = '#';
    this.update();
    this.layout();
  }

  /** The small party list at the top left (names, the leader first), shown while in a party. */
  private drawPartyList(): void {
    this.partyList?.destroy();
    this.partyList = null;
    const party = partyOf(this.state, ME);
    if (!party || this.hidden) return;
    const c = this.scene.add.container(S2, S2).setDepth(54);
    const names = party.members.map((m) => (m === ME ? this.host.myName() : this.host.others().find((o) => o.id === m)?.name ?? m));
    const w = 132;
    const h = 22 + names.length * 18 + 6;
    const g = this.scene.add.graphics();
    g.fillStyle(0x0e1a2a, 0.72).fillRoundedRect(0, 0, w, h, 8).lineStyle(2, 0x8dffb0, 0.7).strokeRoundedRect(0, 0, w, h, 8);
    c.add(g);
    c.add(this.text(8, 4, W.party, TYPE.label, '#8dffb0', true, undefined, 0));
    names.forEach((n, i) => c.add(this.text(10, 22 + i * 18, (party.members[i] === party.leader ? '★ ' : '• ') + n, TYPE.label + 1, '#ffffff', false, undefined, 0)));
    this.partyList = c;
  }

  private toast(line: string): void {
    this.toastLayer?.destroy();
    const { width, height } = view(this.scene);
    const t = this.text(width / 2, height * 0.3, line, TYPE.title, '#ffffff', true);
    const pad = 10;
    const g = this.scene.add.graphics();
    g.fillStyle(0x120e22, 0.85).fillRoundedRect(width / 2 - t.width / 2 - pad, height * 0.3 - 6, t.width + pad * 2, t.height + 12, 10);
    const c = this.scene.add.container(0, 0, [g, t]).setDepth(60);
    this.toastLayer = c;
    this.scene.tweens.add({ targets: c, alpha: 0, delay: 1600, duration: 400, onComplete: () => c.destroy() });
  }
}
