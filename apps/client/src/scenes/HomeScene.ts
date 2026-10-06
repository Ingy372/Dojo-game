import Phaser from 'phaser';
import {
  GEAR_SLOTS,
  TICKS_PER_SECOND,
  compareGear,
  describeItem,
  equip,
  gearScore,
  letGo,
  playerStats,
  startRun,
  wornItem,
  type BestKey,
  type GearItem,
  type GearSlot,
  type Profile,
} from '@dojo/sim';
import { sfx } from '../audio/Sfx';
import { CONTENT } from '../game/content';
import { loadSave, writeSave } from '../game/save';
import { FONT, GRADE_COLOR, RARITY_COLOR, RARITY_NAME, clock, crisp, css } from '../ui/theme';
import type { GameSceneData } from './GameScene';

const SLOT_NAME: Record<GearSlot, string> = { hands: 'Hands', gi: 'Gi', charm: 'Charm' };
const BEST_NAME: Record<BestKey, string> = {
  fastestClearTicks: 'Fastest floor',
  mostPerfects: 'Most Perfect Counters',
  longestCombo: 'Longest combo',
  mostSGrades: 'Most S grades',
};
const KIND_MARK: Record<string, string> = { treasure: '$', rest: '+' };

type Tab = 'run' | 'gear';

/**
 * The Home Dojo (simple version for milestone 3): start a run, see the last run's
 * summary and personal bests, and wear gear. Decorating comes in milestone 5.
 */
export class HomeScene extends Phaser.Scene {
  private profile!: Profile;
  private tab: Tab = 'run';
  private page = 0;
  /** The bag item being looked at, if any. */
  private selected: string | null = null;
  private confirmLetGo = false;
  private ui!: Phaser.GameObjects.Container;

  constructor() {
    super('Home');
  }

  create(): void {
    this.profile = loadSave();
    this.tab = this.profile.lastRun ? 'run' : 'gear';
    this.page = 0;
    this.selected = null;
    this.ui = this.add.container(0, 0);
    this.render();
    this.cameras.main.fadeIn(400, 10, 8, 16);
    this.scale.on(Phaser.Scale.Events.RESIZE, this.render, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.scale.off(Phaser.Scale.Events.RESIZE, this.render, this));
  }

  private render(): void {
    this.ui.removeAll(true);
    const { width, height } = this.scale.gameSize;
    const pad = 16;
    const leftW = Math.min(300, width * 0.36);

    // Floor of the dojo (placeholder).
    this.ui.add(this.add.rectangle(0, 0, width, height, 0x1e1a14).setOrigin(0));
    for (let x = 0; x < width; x += 48) this.ui.add(this.add.rectangle(x, 0, 2, height, 0x2a241c).setOrigin(0));

    // ---- left: title, character, stats, Enter the Tower, personal bests
    this.text(pad, pad, 'Home Dojo', 26, '#f2e9d8', true, 'Georgia, serif');
    const stats = playerStats(this.profile);
    this.text(pad, pad + 36, `Health ${stats.maxHealth}   Power ${stats.power}   Guard ${stats.guard}`, 14, '#b9ad99');

    const cx = pad + leftW / 2;
    const cy = pad + 96;
    this.ui.add(this.add.circle(cx, cy, 26, 0xf2e9d8).setStrokeStyle(3, 0x14121c));
    this.ui.add(this.add.rectangle(cx, cy + 4, 50, 8, 0xffffff).setStrokeStyle(2, 0x14121c));

    const btnY = cy + 56;
    this.button(pad, btnY, leftW, 54, 'ENTER THE TOWER', 0xd5713a, 20, () => this.enterTower());
    this.button(pad, btnY + 62, leftW, 34, 'Practice room', 0x3a3a4a, 14, () => this.goTo('Game', {}));

    const b = this.profile.bests;
    const newBests = new Set(this.profile.lastRun?.newBests ?? []);
    let y = btnY + 108;
    this.text(pad, y, 'Personal bests', 15, '#ffd166', true);
    y += 22;
    const rows: Array<[BestKey, string]> = [
      ['fastestClearTicks', b.fastestClearTicks === null ? '—' : clock(b.fastestClearTicks, TICKS_PER_SECOND)],
      ['mostPerfects', `${b.mostPerfects}`],
      ['longestCombo', `${b.longestCombo}`],
      ['mostSGrades', `${b.mostSGrades}`],
    ];
    for (const [key, value] of rows) {
      const isNew = newBests.has(key);
      this.text(pad, y, `${BEST_NAME[key]}: ${value}${isNew ? '  NEW!' : ''}`, 14, isNew ? '#ffd166' : '#f2e9d8');
      y += 19;
    }

    // ---- right: tabs
    const rx = pad * 2 + leftW;
    const rw = width - rx - pad;
    const tabW = Math.min(150, rw / 2 - 4);
    this.button(rx, pad, tabW, 34, 'Last run', this.tab === 'run' ? 0x4a3f63 : 0x2a2536, 15, () => this.setTab('run'));
    this.button(rx + tabW + 8, pad, tabW, 34, `Gear (${this.profile.inventory.length})`, this.tab === 'gear' ? 0x4a3f63 : 0x2a2536, 15, () => this.setTab('gear'));
    const top = pad + 46;
    const panelH = height - top - pad;
    this.ui.add(this.add.rectangle(rx, top, rw, panelH, 0x14121c, 0.65).setOrigin(0).setStrokeStyle(2, 0x3a3150));
    if (this.tab === 'run') this.renderRun(rx + 12, top + 10, rw - 24, panelH - 20);
    else this.renderGear(rx + 10, top + 10, rw - 20, panelH - 20);
  }

  private renderRun(x: number, y: number, w: number, h: number): void {
    const last = this.profile.lastRun;
    if (!last) {
      this.text(x, y, 'No runs yet. Tap Enter the Tower to climb!', 16, '#f2e9d8', false, FONT, w);
      return;
    }
    const s = last.summary;
    const headline = s.result === 'cleared' ? 'Floor cleared!' : `You reached room ${Math.min(s.totalRooms, s.roomsCleared + 1)} of ${s.totalRooms}`;
    this.text(x, y, headline, 20, s.result === 'cleared' ? '#ffd166' : '#f2e9d8', true);
    y += 30;

    // One chip per room: its grade, or a mark for treasure and rest rooms.
    let cx = x;
    for (const r of s.results) {
      const label = r.grade ?? KIND_MARK[r.kind] ?? '·';
      const color = r.grade ? GRADE_COLOR[r.grade] : '#b9ad99';
      this.ui.add(this.add.rectangle(cx, y, 30, 30, 0x221d2e).setOrigin(0).setStrokeStyle(2, Phaser.Display.Color.HexStringToColor(color).color));
      this.text(cx + 15, y + 15, label, 17, color, true).setOrigin(0.5);
      cx += 36;
    }
    y += 40;
    this.text(x, y, `Perfect Counters ${s.perfects}   Best combo ${s.bestCombo}   Time ${clock(s.ticks, TICKS_PER_SECOND)}`, 14, '#f2e9d8', false, FONT, w);
    y += 26;

    this.text(x, y, `Items found (${s.items.length})`, 15, '#ffd166', true);
    y += 22;
    const lineH = 19;
    const fit = Math.max(1, Math.floor((h - (y - (this.scale.gameSize.height - h - 26))) / lineH) - 1);
    const items = s.items.slice().sort((a, b) => RARITY_ORDER(b) - RARITY_ORDER(a));
    items.slice(0, fit).forEach((it) => {
      this.text(x, y, `${RARITY_NAME[it.rarity]}: ${it.name}  (${describeItem(it)})`, 14, css(RARITY_COLOR[it.rarity]), false, FONT, w);
      y += lineH;
    });
    if (items.length > fit) this.text(x, y, `+${items.length - fit} more in your Gear`, 13, '#b9ad99');
    if (items.length === 0) this.text(x, y, 'None this time. Beat enemies and open chests!', 14, '#b9ad99');
  }

  private renderGear(x: number, y: number, w: number, h: number): void {
    // Worn gear: one box per slot.
    const slotW = (w - 16) / 3;
    GEAR_SLOTS.forEach((slot, i) => {
      const item = wornItem(this.profile, slot);
      const bx = x + i * (slotW + 8);
      this.ui.add(this.add.rectangle(bx, y, slotW, 54, 0x221d2e).setOrigin(0).setStrokeStyle(2, item ? RARITY_COLOR[item.rarity] : 0x3a3150));
      this.text(bx + 6, y + 4, SLOT_NAME[slot], 11, '#b9ad99');
      this.text(bx + 6, y + 18, item ? item.name : 'Nothing', 13, item ? css(RARITY_COLOR[item.rarity]) : '#6b6478', true, FONT, slotW - 10);
      if (item) this.text(bx + 6, y + 36, describeItem(item), 11, '#f2e9d8', false, FONT, slotW - 10);
    });
    y += 64;

    const bag = this.profile.inventory
      .filter((it) => this.profile.equipped[it.slot] !== it.uid)
      .sort((a, b) => GEAR_SLOTS.indexOf(a.slot) - GEAR_SLOTS.indexOf(b.slot) || gearScore(b) - gearScore(a));
    if (bag.length === 0) {
      this.text(x, y + 6, 'Your bag is empty. Items you find in the Tower appear here.', 14, '#b9ad99', false, FONT, w);
      return;
    }

    const selected = bag.find((it) => it.uid === this.selected) ?? null;
    const detailH = selected ? 64 : 0;
    const cols = 2;
    const cardH = 42;
    const rows = Math.max(1, Math.floor((h - 64 - detailH - 34) / (cardH + 6)));
    const perPage = rows * cols;
    const pages = Math.max(1, Math.ceil(bag.length / perPage));
    this.page = Math.min(this.page, pages - 1);
    const cardW = (w - 8) / cols;

    bag.slice(this.page * perPage, (this.page + 1) * perPage).forEach((it, i) => {
      const bx = x + (i % cols) * (cardW + 8);
      const by = y + Math.floor(i / cols) * (cardH + 6);
      const isSel = it.uid === this.selected;
      const bg = this.add.rectangle(bx, by, cardW, cardH, isSel ? 0x3a3150 : 0x221d2e).setOrigin(0).setStrokeStyle(2, RARITY_COLOR[it.rarity], isSel ? 1 : 0.6);
      this.ui.add(bg);
      const cmp = compareGear(it, wornItem(this.profile, it.slot));
      const arrow = cmp === 'up' ? '▲' : cmp === 'down' ? '▼' : '=';
      const arrowColor = cmp === 'up' ? '#5cd65c' : cmp === 'down' ? '#e0533d' : '#b9ad99';
      this.text(bx + 8, by + cardH / 2, arrow, 18, arrowColor, true).setOrigin(0, 0.5);
      this.text(bx + 30, by + 4, it.name, 13, css(RARITY_COLOR[it.rarity]), true, FONT, cardW - 36);
      this.text(bx + 30, by + 22, `${SLOT_NAME[it.slot]} · ${describeItem(it)}`, 11, '#f2e9d8', false, FONT, cardW - 36);
      bg.setInteractive().on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, () => {
        this.selected = isSel ? null : it.uid;
        this.confirmLetGo = false;
        this.render();
      });
    });

    const pagerY = y + rows * (cardH + 6);
    if (pages > 1) {
      this.button(x, pagerY, 70, 28, '◀', 0x2a2536, 15, () => this.turn(-1));
      this.text(x + w / 2, pagerY + 14, `${this.page + 1} / ${pages}`, 13, '#b9ad99').setOrigin(0.5);
      this.button(x + w - 70, pagerY, 70, 28, '▶', 0x2a2536, 15, () => this.turn(1));
    }

    if (selected) {
      const dy = pagerY + 34;
      const worn = wornItem(this.profile, selected.slot);
      this.text(x, dy, `${RARITY_NAME[selected.rarity]} ${SLOT_NAME[selected.slot]}: ${describeItem(selected)}`, 13, css(RARITY_COLOR[selected.rarity]), true, FONT, w);
      this.text(x, dy + 17, worn ? `Now wearing: ${worn.name} (${describeItem(worn)})` : 'Nothing worn in this slot', 12, '#b9ad99', false, FONT, w);
      this.button(x, dy + 36, 110, 30, 'Wear', 0x3aa57a, 15, () => this.wear(selected));
      this.button(x + 118, dy + 36, 120, 30, this.confirmLetGo ? 'Sure? Tap again' : 'Let go', 0x6b3a3a, 13, () => this.letGo(selected));
    }
  }

  // ---------------------------------------------------------------- actions

  private enterTower(): void {
    const params = new URLSearchParams(window.location.search);
    const seedParam = Number(params.get('seed'));
    const seed = Number.isFinite(seedParam) && seedParam > 0 ? seedParam : Math.floor(Math.random() * 2147483647) + 1;
    const firstRoomId = params.get('room') ?? undefined;
    const run = startRun(CONTENT, { seed, dryRuns: this.profile.dryRuns, firstRoomId });
    this.goTo('Game', { run });
  }

  private goTo(scene: string, data: GameSceneData): void {
    sfx.unlock();
    this.input.enabled = false;
    this.cameras.main.fadeOut(300, 10, 8, 16);
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => this.scene.start(scene, data));
  }

  private setTab(tab: Tab): void {
    this.tab = tab;
    this.selected = null;
    this.render();
  }

  private turn(by: number): void {
    this.page = Math.max(0, this.page + by);
    this.selected = null;
    this.render();
  }

  private wear(item: GearItem): void {
    equip(this.profile, item.uid);
    writeSave(this.profile);
    sfx.insight();
    this.selected = null;
    this.render();
  }

  private letGo(item: GearItem): void {
    if (!this.confirmLetGo) {
      this.confirmLetGo = true;
      this.render();
      return;
    }
    letGo(this.profile, item.uid);
    writeSave(this.profile);
    this.selected = null;
    this.confirmLetGo = false;
    this.render();
  }

  // ---------------------------------------------------------------- helpers

  private text(x: number, y: number, str: string, size: number, color: string, bold = false, family = FONT, wrap?: number): Phaser.GameObjects.Text {
    const t = this.add
      .text(x, y, str, { fontFamily: family, fontSize: `${size}px`, color, fontStyle: bold ? 'bold' : 'normal', wordWrap: wrap ? { width: wrap } : undefined })
      .setResolution(crisp());
    this.ui.add(t);
    return t;
  }

  private button(x: number, y: number, w: number, h: number, label: string, color: number, size: number, onTap: () => void): void {
    const bg = this.add.rectangle(x, y, w, h, color).setOrigin(0).setStrokeStyle(2, 0xffffff, 0.35);
    this.ui.add(bg);
    this.text(x + w / 2, y + h / 2, label, size, '#ffffff', true).setOrigin(0.5);
    bg.setInteractive().on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, () => {
      sfx.unlock();
      onTap();
    });
  }
}

function RARITY_ORDER(item: GearItem): number {
  return ['common', 'uncommon', 'rare', 'epic', 'legendary'].indexOf(item.rarity);
}
