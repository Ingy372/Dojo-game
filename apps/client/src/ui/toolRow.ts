// Tool Belt: a small row of the equipped tools' icons, each with a ring that refills while the tool
// waits its cooldown, plus the callout ("#7 Palm Heel!") when a tool fires. One callout at a time;
// the next waits its turn. Sits top right under the HUD, away from the thumb buttons. Touch is never
// needed here: it only shows what happened.

import Phaser from 'phaser';
import type { PlayerState, ToolDef } from '@dojo/sim';
import { reducedMotion } from '../game/motion';
import { crisp, view } from './theme';

const ICON_R = 13;
const GAP = 6;
const CALLOUT_MS = 1000;
const TOOL_COLOR = 0x7b4fc9;
const RING_COLOR = 0xc9a8ff;

interface Icon {
  technique: number;
  container: Phaser.GameObjects.Container;
  ring: Phaser.GameObjects.Graphics;
  face: Phaser.GameObjects.Arc;
}

export class ToolRow {
  private readonly icons: Icon[];
  private readonly calloutText: Phaser.GameObjects.Text;
  private readonly queue: string[] = [];
  private showingUntil = 0;

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly defs: readonly ToolDef[],
    equipped: readonly number[],
    private readonly topPx: number,
  ) {
    this.icons = equipped.map((technique) => {
      const face = scene.add.circle(0, 0, ICON_R, TOOL_COLOR, 1).setStrokeStyle(2, 0xffffff, 0.8);
      const label = scene.add
        .text(0, 0, String(technique), { fontFamily: 'system-ui, sans-serif', fontStyle: 'bold', fontSize: '11px', color: '#ffffff', stroke: '#14121c', strokeThickness: 2 })
        .setOrigin(0.5)
        .setResolution(crisp());
      const ring = scene.add.graphics();
      const container = scene.add.container(0, 0, [face, label, ring]);
      return { technique, container, ring, face };
    });
    this.calloutText = scene.add
      .text(0, 0, '', { fontFamily: 'system-ui, sans-serif', fontStyle: 'bold', fontSize: '18px', color: '#e8d8ff', stroke: '#14121c', strokeThickness: 5 })
      .setOrigin(1, 0)
      .setResolution(crisp())
      .setVisible(false);
    this.layout();
  }

  get objects(): Phaser.GameObjects.GameObject[] {
    return [...this.icons.map((i) => i.container), this.calloutText];
  }

  layout(): void {
    const { width } = view(this.scene);
    const right = width - 16 - ICON_R;
    this.icons.forEach((icon, i) => icon.container.setPosition(right - i * (ICON_R * 2 + GAP), this.topPx + ICON_R + 6));
    this.calloutText.setPosition(width - 16, this.topPx + ICON_R * 2 + 14);
  }

  /** Redraws each icon's refill ring from the player's tools. */
  update(p: PlayerState): void {
    for (const icon of this.icons) {
      const t = p.tools.find((x) => x.setup.technique === icon.technique);
      icon.ring.clear();
      const waiting = !!t && t.cooldown > 0;
      icon.face.setFillStyle(waiting ? 0x41385a : TOOL_COLOR, 1);
      if (t && waiting) {
        const done = 1 - t.cooldown / t.setup.cooldownTicks;
        icon.ring.lineStyle(3, RING_COLOR, 0.9);
        icon.ring.beginPath();
        icon.ring.arc(0, 0, ICON_R + 3, -Math.PI / 2, -Math.PI / 2 + done * Math.PI * 2);
        icon.ring.strokePath();
      }
    }
    if (this.queue.length > 0 && this.scene.time.now >= this.showingUntil) this.showNext();
    else if (this.queue.length === 0 && this.scene.time.now >= this.showingUntil) this.calloutText.setVisible(false);
  }

  /** A tool fired: its icon pops, and its callout joins the queue. */
  fired(technique: number): void {
    const def = this.defs.find((d) => d.technique === technique);
    if (!def) return;
    this.queue.push(`#${def.technique} ${def.name}!`);
    const icon = this.icons.find((i) => i.technique === technique);
    if (icon && !reducedMotion()) {
      this.scene.tweens.killTweensOf(icon.container);
      icon.container.setScale(1);
      this.scene.tweens.add({ targets: icon.container, scale: 1.35, duration: 90, yoyo: true, ease: 'Quad.Out' });
    }
  }

  setVisible(on: boolean): void {
    for (const o of this.icons) o.container.setVisible(on);
    if (!on) this.calloutText.setVisible(false);
  }

  private showNext(): void {
    const text = this.queue.shift()!;
    this.calloutText.setText(text).setVisible(true).setAlpha(1);
    this.showingUntil = this.scene.time.now + CALLOUT_MS;
    if (!reducedMotion()) {
      this.scene.tweens.killTweensOf(this.calloutText);
      this.calloutText.setScale(0.85);
      this.scene.tweens.add({ targets: this.calloutText, scale: 1, duration: 120, ease: 'Back.Out' });
    }
  }
}
