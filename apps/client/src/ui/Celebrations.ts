// Reward moments for new real progress, played one after another over the Home Dojo.
// Sizes follow core-design section 9: the promotion ceremony is the biggest moment in
// the game, then a stripe, then a sign-off; Sensei's Seal and the Blessing are small.

import Phaser from 'phaser';
import type { BeltInfo, RequirementStatus, RewardMoment, TrainingState } from '@dojo/sim';
import { gainText, litGateLock, signOffCardText, signOffGain, signOffLines, signOffsMixed, signOffsRow, signOffsTitle, stripeGain } from '@dojo/sim';
import GAINS from '../../../../content/settings/training-gains.json';
import STYLE from '../../../../content/abilities/fighting-style.json';
import { sfx } from '../audio/Sfx';
import { shortDate } from '../game/student';
import { makeStandingCharacter } from '../art/player';
import { loadLook } from '../game/look';
import { reducedMotion } from '../game/motion';
import { hex } from './belt';
import { FONT, crisp, view } from './theme';

type Step =
  /** Sensei's welcome-home line, before the cascade (M7-P4, Manager call). */
  | { kind: 'sensei'; lines: string[] }
  /** Q-PREM-BOSSWIN: the first real Floor Keeper clear (once per save). A game-only moment, so it stays smaller than a promotion: one screen. */
  | { kind: 'keeper'; title: string }
  | { kind: 'moment'; moment: Exclude<RewardMoment, { kind: 'promotion' }> }
  | { kind: 'bow'; from: BeltInfo; to: BeltInfo }
  | { kind: 'gate'; to: BeltInfo }
  | { kind: 'summary'; to: BeltInfo; levelCap: number; preview: RequirementStatus[]; extras: Extra[] };

/** Other real moments that arrive together with a promotion: shown on its last screen instead of one screen each. */
type Extra = Exclude<RewardMoment, { kind: 'promotion' } | { kind: 'welcome' }>;

const GOLD = 0xffd166;

export class Celebrations {
  private readonly steps: Step[] = [];
  private index = -1;
  readonly root: Phaser.GameObjects.Container;
  private layer!: Phaser.GameObjects.Container;
  /** Taps are ignored for a moment after each step appears, so nothing is skipped by accident. */
  private readyAt = 0;

  constructor(
    private readonly scene: Phaser.Scene,
    moments: RewardMoment[],
    private readonly training: TrainingState,
    private readonly onDone: () => void,
    sensei: string[] = [],
    keeperTitle?: string,
  ) {
    if (keeperTitle) this.steps.push({ kind: 'keeper', title: keeperTitle });
    if (sensei.length) this.steps.push({ kind: 'sensei', lines: sensei });
    // The promotion ceremony is 3 screens (QA, 2026-10-18: 8 in a row was too many):
    // the bow and new belt, the Gate opens, then one screen with everything new.
    // Stripes, sign-offs and Sensei's Seal that arrive with it join that last screen;
    // the details stay on the Board's Abilities and Gate tabs.
    const promotion = moments.find((m) => m.kind === 'promotion');
    const extras: Extra[] = promotion ? moments.filter((m): m is Extra => m.kind !== 'promotion' && m.kind !== 'welcome') : [];
    for (const m of moments) {
      if (m.kind === 'promotion') {
        this.steps.push({ kind: 'bow', from: m.from, to: m.to });
        this.steps.push({ kind: 'gate', to: m.to });
        this.steps.push({ kind: 'summary', to: m.to, levelCap: m.levelCap, preview: m.preview, extras });
      } else if (m.kind === 'welcome' || !promotion) this.steps.push({ kind: 'moment', moment: m });
    }
    const { width, height } = view(scene);
    const shade = scene.add.rectangle(0, 0, width, height, 0x0a0810, 0.9).setOrigin(0).setInteractive();
    shade.on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, () => this.next());
    this.root = scene.add.container(0, 0, [shade]).setDepth(100);
    this.next(true);
  }

  private next(force = false): void {
    if (!force && this.scene.time.now < this.readyAt) return;
    sfx.unlock();
    this.layer?.destroy();
    this.index++;
    if (this.index >= this.steps.length) {
      this.root.destroy();
      this.onDone();
      return;
    }
    this.layer = this.scene.add.container(0, 0);
    this.root.add(this.layer);
    const step = this.steps[this.index];
    let wait = 700;
    switch (step.kind) {
      case 'bow':
        wait = this.bow(step.from, step.to);
        break;
      case 'gate':
        wait = this.gate(step.to);
        break;
      case 'summary':
        wait = this.summary(step.to, step.levelCap, step.preview, step.extras);
        break;
      case 'moment':
        this.moment(step.moment);
        break;
      case 'sensei':
        this.sensei(step.lines);
        break;
      case 'keeper':
        wait = this.keeper(step.title);
        break;
    }
    this.readyAt = this.scene.time.now + wait;
    const { width, height } = this.size();
    const hint = this.text(width / 2, height - 22, 'Tap to continue', 14, '#b9ad99').setOrigin(0.5).setAlpha(0);
    this.scene.tweens.add({ targets: hint, alpha: 1, delay: wait, duration: 300 });
  }

  // ---------------------------------------------------------------- the promotion ceremony

  /** 1. The character bows, and the belt is tied in the new color. */
  private bow(from: BeltInfo, to: BeltInfo): number {
    const { width, height } = this.size();
    sfx.gong();
    this.text(width / 2, height * 0.13, 'PROMOTION', 18, '#ffd166', true).setOrigin(0.5);
    const title = this.text(width / 2, height * 0.24, `${this.training.firstName} earned the ${to.name}!`, 30, '#ffffff', true, 'Georgia, serif').setOrigin(0.5).setAlpha(0);
    const r = Math.min(56, height * 0.14);
    const ch = makeStandingCharacter(this.scene, width / 2, height * 0.58, r, from, 0, loadLook());
    this.layer.add(ch.container);
    // Bow: the real bow with the art, or lean forward and back.
    if (ch.sprite) ch.sprite.play('bow', { restart: true });
    else this.scene.tweens.add({ targets: ch.container, scaleY: 0.82, y: ch.container.y + r * 0.2, duration: 420, yoyo: true, hold: 300, ease: 'Sine.InOut' });
    this.scene.time.delayedCall(1300, () => {
      if (!ch.container.active) return;
      // The new belt is tied, and the character celebrates (arms up, then a proud stance).
      ch.retie(to, 0);
      if (ch.sprite) ch.sprite.play('celebrate', { restart: true });
      const s = ch.container.scale;
      this.scene.tweens.add({ targets: ch.container, scale: s * 1.12, duration: 220, yoyo: true, ease: 'Back.Out' });
      this.burst(width / 2, height * 0.58, [hex(to.color), GOLD, 0xffffff], 60);
      this.rays(width / 2, height * 0.58, hex(to.color));
      sfx.promotion();
      this.scene.tweens.add({ targets: title, alpha: 1, duration: 400 });
    });
    return 2200;
  }

  /** 2. The Gate opens and the new tier is revealed. */
  private gate(to: BeltInfo): number {
    const { width, height } = this.size();
    sfx.gong();
    const gw = Math.min(260, width * 0.4);
    const gh = height * 0.55;
    const cx = width / 2;
    const top = height * 0.2;
    this.layer.add(this.scene.add.rectangle(cx, top + gh / 2, gw, gh, hex(to.color), 0.35));
    const label = this.text(cx, top + gh / 2, `${to.name}\nTier`, 26, '#ffffff', true, 'Georgia, serif').setOrigin(0.5).setAlign('center').setAlpha(0);
    const left = this.scene.add.rectangle(cx - gw / 4, top + gh / 2, gw / 2, gh, 0x5b4a3c).setStrokeStyle(3, OUTLINE_GOLD);
    const right = this.scene.add.rectangle(cx + gw / 4, top + gh / 2, gw / 2, gh, 0x5b4a3c).setStrokeStyle(3, OUTLINE_GOLD);
    this.layer.add([left, right]);
    this.scene.tweens.add({ targets: left, x: cx - gw * 0.75, duration: 1100, delay: 400, ease: 'Cubic.InOut' });
    this.scene.tweens.add({ targets: right, x: cx + gw * 0.75, duration: 1100, delay: 400, ease: 'Cubic.InOut' });
    this.scene.tweens.add({ targets: label, alpha: 1, duration: 600, delay: 1000 });
    this.scene.time.delayedCall(1200, () => this.burst(cx, top + gh / 2, [hex(to.color), GOLD], 30));
    this.text(cx, height * 0.1, 'The Gate opens!', 26, '#ffd166', true).setOrigin(0.5);
    return 1600;
  }

  /** 3. Everything new, on one screen: what was earned, and what to learn next in class. */
  private summary(to: BeltInfo, levelCap: number, preview: RequirementStatus[], extras: Extra[]): number {
    const { width, height } = this.size();
    const cx = width / 2;
    this.text(cx, height * 0.08, `Congratulations, ${this.training.firstName}!`, 26, '#ffd166', true, 'Georgia, serif').setOrigin(0.5);

    // Left: what was earned.
    const earned: { line: string; color: string }[] = [{ line: `Your character can now reach level ${levelCap}`, color: '#ffffff' }];
    // One line per stripe word, at its highest rank ("earned again" when the same word comes back).
    const stripes = new Map<string, number>();
    for (const e of extras) if (e.kind === 'stripe') stripes.set(e.word, Math.max(stripes.get(e.word) ?? 0, e.rank));
    for (const [word, rank] of stripes) earned.push({ line: `★ ${word} stripe${rank > 1 ? ', earned again' : ''}`, color: '#ffd166' });
    const signed = extras.flatMap((e) => (e.kind === 'signOff' ? [e.requirement] : e.kind === 'signOffs' ? e.list.map((x) => x.requirement) : []));
    for (const line of signOffLines(signed)) earned.push({ line, color: '#5cd65c' });
    for (const e of extras) {
      if (e.kind === 'stripe' || e.kind === 'signOff' || e.kind === 'signOffs') continue;
      else if (e.kind === 'testApproved') earned.push({ line: `Sensei's Seal is lit${e.testDate ? `: test day ${shortDate(e.testDate)}` : ''}`, color: '#ffd166' });
      else if (e.kind === 'blessing') earned.push({ line: 'Dojo Blessing for 48 hours', color: '#9ad1ff' });
    }
    // Right: the new belt's techniques, in the school's own words.
    const colW = Math.min(360, width / 2 - 28);
    const leftX = cx - colW - 14;
    const rightX = cx + 14;
    const top = height * 0.08 + 34;
    this.text(leftX, top, 'You earned', 17, '#ffd166', true);
    this.text(rightX, top, `${to.name} techniques`, 17, '#ffd166', true);
    const lineH = Math.min(26, (height - top - 70) / Math.max(earned.length, preview.length, 1));
    earned.forEach((e, i) => {
      const t = this.text(leftX, top + 30 + i * lineH, e.line, 15, e.color, false, FONT, colW).setAlpha(0);
      this.scene.tweens.add({ targets: t, alpha: 1, delay: 200 + i * 120, duration: 250 });
    });
    preview.forEach((r, i) => {
      const t = this.text(rightX, top + 30 + i * lineH, `${r.signedOff ? '✓' : '○'}  ${r.name}`, 15, r.signedOff ? '#5cd65c' : '#f2e9d8', false, FONT, colW).setAlpha(0);
      this.scene.tweens.add({ targets: t, alpha: 1, delay: 200 + i * 90, duration: 250 });
    });
    this.text(cx, height - 50, `Each one Sensei signs off unlocks a new power. See them anytime on the Board.`, 13, '#b9ad99', false, FONT, width - 40).setOrigin(0.5).setAlign('center');
    this.burst(cx, height * 0.08, [hex(to.color), GOLD], 40);
    sfx.stripe();
    return 900;
  }

  // ---------------------------------------------------------------- other moments

  private moment(m: Exclude<RewardMoment, { kind: 'promotion' }>): void {
    const { width, height } = this.size();
    const cx = width / 2;
    switch (m.kind) {
      case 'welcome': {
        // The unlock cascade's opening card (M7-P4). Each unlock follows on its own screen.
        sfx.signOff();
        this.text(cx, height * 0.12, `Welcome home, ${m.name}!`, 30, '#ffd166', true, 'Georgia, serif').setOrigin(0.5);
        const ch = makeStandingCharacter(this.scene, cx, height * 0.12 + 66, 28, m.belt, this.training.stripesThisBelt, loadLook());
        this.layer.add(ch.container);
        const y = height * 0.12 + 112;
        const wrap = Math.min(520, width - 40);
        if (!m.preview) {
          this.text(cx, y, "You've already earned these in the dojo.", 19, '#f2e9d8', true, FONT, wrap).setOrigin(0.5, 0).setAlign('center');
          this.text(cx, y + 34, `${m.count} ${m.count === 1 ? 'thing' : 'things'} to unlock!`, 17, '#5cd65c', true).setOrigin(0.5, 0);
          this.burst(cx, height * 0.12, [0x5cd65c, GOLD], 24);
          break;
        }
        // A brand-new white belt: the Beginner's Stance, and a preview of the first sign-off.
        // R-STANCE-g: the welcome line (#312) can wrap to two lines, so the preview stacks below it.
        const intro = this.text(cx, y, STYLE.welcomeStance, 17, '#f2e9d8', true, FONT, wrap).setOrigin(0.5, 0).setAlign('center');
        if (m.preview.next) {
          const y2 = y + intro.height + 10;
          this.text(cx, y2, `When Sensei signs off ${m.preview.next.name}, you unlock:`, 15, '#b9ad99', false, FONT, wrap).setOrigin(0.5, 0).setAlign('center');
          this.text(cx, y2 + 26, m.preview.ability, 17, '#ffd166', true, FONT, wrap).setOrigin(0.5, 0).setAlign('center');
        }
        break;
      }
      case 'stripe': {
        // Second only to a promotion.
        sfx.stripe();
        const band = this.scene.add.rectangle(cx, height * 0.38, width, 110, GOLD, 0.18);
        this.layer.add(band);
        this.text(cx, height * 0.16, 'CHARACTER STRIPE', 18, '#ffd166', true).setOrigin(0.5);
        const word = this.text(cx, height * 0.38, m.word, 46, '#ffffff', true, 'Georgia, serif').setOrigin(0.5).setScale(0.4);
        this.scene.tweens.add({ targets: word, scale: 1, duration: 450, ease: 'Back.Out' });
        this.text(cx, height * 0.58, `New Virtue: ${m.virtue}`, 22, '#ffd166', true).setOrigin(0.5);
        const def = this.training.virtues.find((v) => v.word === m.word)?.def;
        if (def) this.text(cx, height * 0.67, m.rank > 1 ? 'Earned again: your Virtue grew stronger!' : 'Use it in a fight when your Focus is full.', 15, '#f2e9d8').setOrigin(0.5);
        this.text(cx, height * 0.75, `Earned at ${m.belt}`, 13, '#b9ad99').setOrigin(0.5);
        this.text(cx, height * 0.83, gainText(GAINS.stripe, stripeGain(this.training, m.belt)), 18, '#5cd65c', true, FONT, width - 40).setOrigin(0.5).setAlign('center');
        this.burst(cx, height * 0.38, [GOLD, 0xffffff], 45);
        break;
      }
      case 'signOff': {
        sfx.signOff();
        const r = m.requirement;
        const words = signOffCardText(r);
        this.card(cx, height * 0.45, Math.min(520, width - 40), 220);
        this.text(cx, height * 0.45 - 62, words.badge, 16, '#5cd65c', true).setOrigin(0.5);
        this.text(cx, height * 0.45 - 28, words.line, 22, '#ffffff', true, FONT, Math.min(480, width - 60)).setOrigin(0.5).setAlign('center');
        this.text(cx, height * 0.45 + 18, `New ${m.ability}`, 18, '#ffd166', true).setOrigin(0.5);
        const gain = signOffGain(this.training, [r]);
        // R-STANCE-d2: a stance sign-off adds no stats, so it shows no gain line.
        if (gain.power || gain.health) this.text(cx, height * 0.45 + 52, gainText(GAINS.signOff, gain), 17, '#5cd65c', true, FONT, Math.min(480, width - 60)).setOrigin(0.5).setAlign('center');
        if (litGateLock(this.training, r)) this.text(cx, height * 0.45 + 84, 'Gate lock lit.', 14, '#b9ad99').setOrigin(0.5);
        this.burst(cx, height * 0.45 - 28, [0x5cd65c, GOLD], 20);
        break;
      }
      case 'signOffs': {
        sfx.signOff();
        this.text(cx, height * 0.1, signOffsTitle(m.list.map((x) => x.requirement)), 26, '#5cd65c', true).setOrigin(0.5);
        const gains = signOffGain(this.training, m.list.map((s) => s.requirement));
        if (gains.power || gains.health) this.text(cx, height - 64, gainText(GAINS.signOffs, gains), 17, '#ffd166', true, FONT, width - 40).setOrigin(0.5).setAlign('center');
        // K26: each column has a fixed width and long names wrap inside it, so they never run into the other column.
        // If the list is too tall, try 13 then 12 px (still readable); if it still doesn't fit, show what fits plus an "and N more" line.
        const top = height * 0.1 + 36;
        const bottom = height - 84;
        const gap = 16;
        const cols = m.list.length > 6 ? 2 : 1;
        const colW = cols === 1 ? Math.min(400, width - 40) : Math.min(390, (width - 32 - gap) / 2);
        const left = cx - (cols * colW + (cols - 1) * gap) / 2;
        // P-MENU-d: on a mixed card, real sign-offs are green ✓ rows and counted ones say "(practiced)".
        const mixed = signOffsMixed(m.list.map((x) => x.requirement));
        const row = (s: (typeof m.list)[number]) => signOffsRow(s.requirement, s.ability.split(' (')[0], mixed);
        const layout = (size: number, shown: number) => {
          const rows = Math.ceil(shown / cols);
          const ys = Array.from({ length: cols }, () => top);
          const made: Phaser.GameObjects.Text[] = [];
          for (let i = 0; i < shown; i++) {
            const col = Math.floor(i / rows);
            const r = row(m.list[i]);
            const t = this.text(left + col * (colW + gap), ys[col], r.text, size, mixed && r.real ? '#5cd65c' : '#f2e9d8', mixed && r.real, FONT, colW);
            ys[col] += t.height + 3;
            made.push(t);
          }
          return { made, fits: Math.max(...ys) <= bottom };
        };
        let shown = m.list.length;
        let size = 14;
        let res = layout(size, shown);
        while (!res.fits) {
          res.made.forEach((t) => t.destroy());
          if (size > 12) size--;
          else shown -= cols;
          res = layout(size, Math.max(cols, shown - (shown < m.list.length ? 1 : 0)));
          if (shown <= cols) break;
        }
        const extra = m.list.length - res.made.length;
        if (extra > 0) this.text(cx, bottom + 2, `…and ${extra} more! See them all on the Board.`, size, '#b9ad99').setOrigin(0.5, 0);
        res.made.forEach((t, i) => {
          t.setAlpha(0);
          this.scene.tweens.add({ targets: t, alpha: 1, delay: i * 70, duration: 200 });
        });
        this.burst(cx, height * 0.1, [0x5cd65c, GOLD], 24);
        break;
      }
      case 'testApproved': {
        sfx.blessing();
        this.card(cx, height * 0.45, Math.min(480, width - 40), 150);
        this.text(cx, height * 0.45 - 40, "Sensei's Seal is lit!", 24, '#ffd166', true).setOrigin(0.5);
        this.text(cx, height * 0.45 + 2, "You're ready for your next belt test!", 17, '#f2e9d8').setOrigin(0.5);
        if (m.testDate) this.text(cx, height * 0.45 + 34, `Test day: ${shortDate(m.testDate)}`, 17, '#ffffff', true).setOrigin(0.5);
        break;
      }
      case 'blessing': {
        sfx.blessing();
        this.card(cx, height * 0.45, Math.min(460, width - 40), 130);
        this.text(cx, height * 0.45 - 30, 'Dojo Blessing!', 22, '#9ad1ff', true).setOrigin(0.5);
        this.text(cx, height * 0.45 + 10, 'You trained today: extra experience and\nbetter loot for 48 hours.', 15, '#f2e9d8').setOrigin(0.5).setAlign('center');
        break;
      }
    }
  }

  /**
   * Q-PREM-BOSSWIN: 'Floor Keeper defeated!' with the player's character, rays and confetti.
   * Smaller than the promotion (one screen, fewer pieces, no gong). Reduced motion: no confetti,
   * and the rays stay still (burst and rays handle it).
   */
  private keeper(title: string): number {
    const { width, height } = this.size();
    const cx = width / 2;
    sfx.floorClear();
    const r = Math.min(48, height * 0.12);
    const cy = height * 0.6;
    this.rays(cx, cy, 0x9ad1ff);
    const ch = makeStandingCharacter(this.scene, cx, cy, r, this.training.belt, this.training.stripesThisBelt, loadLook());
    this.layer.add(ch.container);
    if (ch.sprite) ch.sprite.play('celebrate', { restart: true });
    const t = this.text(cx, height * 0.2, title, 28, '#ffd166', true, 'Georgia, serif', width - 40).setOrigin(0.5).setAlign('center');
    if (!reducedMotion()) {
      t.setScale(0.5);
      this.scene.tweens.add({ targets: t, scale: 1, duration: 420, ease: 'Back.Out' });
    }
    this.burst(cx, height * 0.2, [GOLD, 0x9ad1ff, 0xffffff], 40);
    return 1200;
  }

  /** Sensei's welcome-home line (M7-P5), the first screen of the first return home. */
  private sensei(lines: string[]): void {
    const { width, height } = this.size();
    const cx = width / 2;
    const w = Math.min(520, width - 40);
    this.card(cx, height * 0.45, w, 70 + lines.length * 34);
    this.text(cx, height * 0.45 - 12 - lines.length * 17, 'Sensei', 22, '#ffd166', true, 'Georgia, serif').setOrigin(0.5);
    lines.forEach((l, i) => this.text(cx, height * 0.45 + 18 - (lines.length - 1) * 17 + i * 34, l, 17, '#f2e9d8', false, FONT, w - 40).setOrigin(0.5).setAlign('center'));
  }

  // ---------------------------------------------------------------- helpers

  private size(): { width: number; height: number } {
    return view(this.scene);
  }

  private text(x: number, y: number, str: string, size: number, color: string, bold = false, family = FONT, wrap?: number): Phaser.GameObjects.Text {
    const t = this.scene.add
      .text(x, y, str, { fontFamily: family, fontSize: `${size}px`, color, fontStyle: bold ? 'bold' : 'normal', wordWrap: wrap ? { width: wrap } : undefined })
      .setResolution(crisp());
    this.layer.add(t);
    return t;
  }

  private card(cx: number, cy: number, w: number, h: number): void {
    this.layer.add(this.scene.add.rectangle(cx, cy, w, h, 0x221d2e).setStrokeStyle(3, 0x5cd65c, 0.7));
  }

  /** Confetti bursting out from a point. */
  private burst(x: number, y: number, colors: number[], count: number): void {
    if (reducedMotion()) return; // Reduced motion: no confetti.
    for (let i = 0; i < count; i++) {
      const c = this.scene.add.rectangle(x, y, 6, 10, colors[i % colors.length]).setAngle(Math.random() * 360);
      this.layer.add(c);
      const a = Math.random() * Math.PI * 2;
      const d = 80 + Math.random() * 220;
      this.scene.tweens.add({
        targets: c,
        x: x + Math.cos(a) * d,
        y: y + Math.sin(a) * d + 60,
        angle: c.angle + 360,
        alpha: 0,
        duration: 900 + Math.random() * 700,
        ease: 'Cubic.Out',
      });
    }
  }

  /** Light rays turning behind the character (promotion only). */
  private rays(x: number, y: number, color: number): void {
    const g = this.scene.add.graphics();
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      g.fillStyle(i % 2 ? color : GOLD, 0.22);
      g.slice(0, 0, 400, a, a + 0.18).fillPath();
    }
    g.setPosition(x, y).setAlpha(0);
    this.layer.addAt(g, 0);
    this.scene.tweens.add({ targets: g, alpha: 1, duration: 500 });
    if (!reducedMotion()) this.scene.tweens.add({ targets: g, angle: 360, duration: 20000, repeat: -1 }); // Reduced motion: the rays stay still.
  }
}

const OUTLINE_GOLD = 0xb08a3c;
