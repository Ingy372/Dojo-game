// Reward moments for new real progress, played one after another over the Home Dojo.
// Sizes follow core-design section 9: the promotion ceremony is the biggest moment in
// the game, then a stripe, then a sign-off; Sensei's Seal and the Blessing are small.

import Phaser from 'phaser';
import type { BeltInfo, RequirementStatus, RewardMoment, TrainingState } from '@dojo/sim';
import { sfx } from '../audio/Sfx';
import { shortDate } from '../game/student';
import { drawBelt, hex, makeCharacter } from './belt';
import { FONT, crisp } from './theme';

type Step =
  | { kind: 'moment'; moment: Exclude<RewardMoment, { kind: 'promotion' }> }
  | { kind: 'bow'; from: BeltInfo; to: BeltInfo }
  | { kind: 'gate'; to: BeltInfo }
  | { kind: 'preview'; to: BeltInfo; preview: RequirementStatus[] }
  | { kind: 'rewards'; to: BeltInfo; levelCap: number };

const GOLD = 0xffd166;

export class Celebrations {
  private readonly steps: Step[] = [];
  private index = -1;
  private readonly root: Phaser.GameObjects.Container;
  private layer!: Phaser.GameObjects.Container;
  /** Taps are ignored for a moment after each step appears, so nothing is skipped by accident. */
  private readyAt = 0;

  constructor(
    private readonly scene: Phaser.Scene,
    moments: RewardMoment[],
    private readonly training: TrainingState,
    private readonly onDone: () => void,
  ) {
    for (const m of moments) {
      if (m.kind === 'promotion') {
        // The ceremony (framework section 6): bow and new belt, the Gate opens, a preview, the rewards.
        this.steps.push({ kind: 'bow', from: m.from, to: m.to });
        this.steps.push({ kind: 'gate', to: m.to });
        this.steps.push({ kind: 'preview', to: m.to, preview: m.preview });
        this.steps.push({ kind: 'rewards', to: m.to, levelCap: m.levelCap });
      } else this.steps.push({ kind: 'moment', moment: m });
    }
    const { width, height } = scene.scale.gameSize;
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
      case 'preview':
        this.preview(step.to, step.preview);
        break;
      case 'rewards':
        wait = this.rewards(step.to, step.levelCap);
        break;
      case 'moment':
        this.moment(step.moment);
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
    const ch = makeCharacter(this.scene, width / 2, height * 0.58, r, from, 0);
    this.layer.add(ch.container);
    // Bow: lean forward and back.
    this.scene.tweens.add({ targets: ch.container, scaleY: 0.82, y: ch.container.y + r * 0.2, duration: 420, yoyo: true, hold: 300, ease: 'Sine.InOut' });
    this.scene.time.delayedCall(1300, () => {
      if (!ch.container.active) return;
      // The new belt is tied.
      drawBelt(ch.belt, 0, r * 0.15, r * 1.9, r * 0.3, to, 0);
      this.scene.tweens.add({ targets: ch.container, scale: 1.18, duration: 220, yoyo: true, ease: 'Back.Out' });
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

  /** 3. What the new belt will unlock, once each technique is signed off. */
  private preview(to: BeltInfo, preview: RequirementStatus[]): void {
    const { width, height } = this.size();
    this.text(width / 2, height * 0.1, `New at ${to.name}`, 26, '#ffd166', true).setOrigin(0.5);
    this.text(width / 2, height * 0.1 + 32, 'Learn these in class. Each sign-off unlocks a new power.', 15, '#f2e9d8').setOrigin(0.5);
    let y = height * 0.1 + 66;
    const lineH = Math.min(30, (height - y - 50) / Math.max(1, preview.length));
    preview.forEach((r, i) => {
      const mark = r.signedOff ? '✓' : '○';
      const color = r.signedOff ? '#5cd65c' : '#f2e9d8';
      const t = this.text(width / 2 - 150, y, `${mark}  ${r.name}  ·  ${abilityKind(r)}`, 17, color).setAlpha(0);
      this.scene.tweens.add({ targets: t, alpha: 1, delay: i * 90, duration: 250 });
      y += lineH;
    });
  }

  /** 4. Promotion rewards: the higher level cap. */
  private rewards(to: BeltInfo, levelCap: number): number {
    const { width, height } = this.size();
    this.text(width / 2, height * 0.2, 'Promotion rewards', 24, '#ffd166', true).setOrigin(0.5);
    const big = this.text(width / 2, height * 0.42, `Level cap: ${levelCap}`, 40, '#ffffff', true).setOrigin(0.5).setScale(0.3);
    this.scene.tweens.add({ targets: big, scale: 1, duration: 500, ease: 'Back.Out' });
    this.text(width / 2, height * 0.58, `Your ${to.name} lets your character grow 10 more levels.`, 16, '#f2e9d8').setOrigin(0.5);
    this.text(width / 2, height * 0.66, `Congratulations, ${this.training.firstName}!`, 22, '#ffd166', true, 'Georgia, serif').setOrigin(0.5);
    this.burst(width / 2, height * 0.42, [hex(to.color), GOLD], 40);
    sfx.stripe();
    return 900;
  }

  // ---------------------------------------------------------------- other moments

  private moment(m: Exclude<RewardMoment, { kind: 'promotion' }>): void {
    const { width, height } = this.size();
    const cx = width / 2;
    switch (m.kind) {
      case 'welcome': {
        sfx.signOff();
        this.text(cx, height * 0.1, `Welcome, ${m.name}!`, 30, '#ffd166', true, 'Georgia, serif').setOrigin(0.5);
        const ch = makeCharacter(this.scene, cx, height * 0.1 + 62, 26, m.belt, this.training.stripesThisBelt);
        this.layer.add(ch.container);
        let y = height * 0.1 + 100;
        if (m.unlocked.length === 0) {
          this.text(cx, y, `You start as a ${m.belt.name}. Every technique Sensei signs off\nwill unlock a new power here.`, 16, '#f2e9d8').setOrigin(0.5, 0).setAlign('center');
          break;
        }
        this.text(cx, y, 'Your real training has already unlocked:', 16, '#f2e9d8').setOrigin(0.5, 0);
        y += 26;
        const lines = [...m.unlocked.map((r) => `✓ ${r.name}`), ...m.virtues.map((v) => `★ ${v}`)];
        const cols = lines.length > 7 ? 2 : 1;
        const rows = Math.ceil(lines.length / cols);
        const lineH = Math.min(22, (height - y - 50) / rows);
        lines.forEach((line, i) => {
          const col = Math.floor(i / rows);
          const x = cols === 1 ? cx - 100 : cx - 200 + col * 220;
          const t = this.text(x, y + (i % rows) * lineH, line, 15, line.startsWith('★') ? '#ffd166' : '#5cd65c').setAlpha(0);
          this.scene.tweens.add({ targets: t, alpha: 1, delay: i * 60, duration: 200 });
        });
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
        this.burst(cx, height * 0.38, [GOLD, 0xffffff], 45);
        break;
      }
      case 'signOff': {
        sfx.signOff();
        const r = m.requirement;
        const who = r.signedOffBy ?? 'Sensei';
        this.card(cx, height * 0.45, Math.min(520, width - 40), 190);
        this.text(cx, height * 0.45 - 62, 'SIGNED OFF!', 16, '#5cd65c', true).setOrigin(0.5);
        this.text(cx, height * 0.45 - 28, `${who} signed off ${r.name}!`, 22, '#ffffff', true, FONT, Math.min(480, width - 60)).setOrigin(0.5).setAlign('center');
        this.text(cx, height * 0.45 + 18, `New ${m.ability}`, 18, '#ffd166', true).setOrigin(0.5);
        this.text(cx, height * 0.45 + 52, 'Gate lock lit.', 14, '#b9ad99').setOrigin(0.5);
        this.burst(cx, height * 0.45 - 28, [0x5cd65c, GOLD], 20);
        break;
      }
      case 'signOffs': {
        sfx.signOff();
        this.text(cx, height * 0.1, `${m.list.length} techniques signed off!`, 26, '#5cd65c', true).setOrigin(0.5);
        let y = height * 0.1 + 36;
        const cols = m.list.length > 6 ? 2 : 1;
        const rows = Math.ceil(m.list.length / cols);
        const lineH = Math.min(24, (height - y - 50) / rows);
        m.list.forEach((s, i) => {
          const col = Math.floor(i / rows);
          const x = cols === 1 ? cx - 180 : cx - Math.min(380, width / 2 - 16) + col * Math.min(390, width / 2);
          const t = this.text(x, y + (i % rows) * lineH, `✓ ${s.requirement.name}: ${s.ability.split(' (')[0]}`, 14, '#f2e9d8').setAlpha(0);
          this.scene.tweens.add({ targets: t, alpha: 1, delay: i * 70, duration: 200 });
        });
        this.burst(cx, height * 0.1, [0x5cd65c, GOLD], 24);
        break;
      }
      case 'testApproved': {
        sfx.blessing();
        this.card(cx, height * 0.45, Math.min(480, width - 40), 150);
        this.text(cx, height * 0.45 - 40, "Sensei's Seal is lit!", 24, '#ffd166', true).setOrigin(0.5);
        this.text(cx, height * 0.45 + 2, 'You are approved to test.', 17, '#f2e9d8').setOrigin(0.5);
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

  // ---------------------------------------------------------------- helpers

  private size(): { width: number; height: number } {
    return this.scene.scale.gameSize;
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
    this.scene.tweens.add({ targets: g, angle: 360, duration: 20000, repeat: -1 });
  }
}

const OUTLINE_GOLD = 0xb08a3c;

function abilityKind(r: RequirementStatus): string {
  return r.type === 'kata' ? 'new Form' : r.type === 'kickCombo' ? 'Strike upgrade' : 'Technique Seal';
}
