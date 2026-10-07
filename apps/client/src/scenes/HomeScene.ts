import Phaser from 'phaser';
import {
  BLESSING,
  GEAR_SLOTS,
  TICKS_PER_SECOND,
  compareGear,
  describeItem,
  describeVirtue,
  effectiveLevel,
  equip,
  gearScore,
  letGo,
  rewardMoments,
  snapshot,
  decorationDef,
  virtueSetupFor,
  virtueTitle,
  wornItem,
  xpToNext,
  type BestKey,
  type GearItem,
  type GearSlot,
  type Profile,
  type RequirementStatus,
  type TrainingState,
} from '@dojo/sim';
import { sfx } from '../audio/Sfx';
import { CONTENT } from '../game/content';
import { loadSave, writeSave } from '../game/save';
import { currentTraining, selectProfile, shortDate } from '../game/student';
import { startTowerRun } from '../game/tower';
import { makeCharacter } from '../ui/belt';
import { Celebrations } from '../ui/Celebrations';
import { TestingPanel } from '../ui/TestingPanel';
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

type Tab = 'run' | 'gear' | 'abilities' | 'gate';
const KIND_LABEL = { form: 'Form', strike: 'Strike', seal: 'Technique Seal' } as const;

/**
 * The training board (opened from the notice board in the Home Dojo): the character with
 * their real belt, level and Blessing, the Path card, starting a run, the last run's
 * summary, gear, abilities, and the Gate.
 */
export class HomeScene extends Phaser.Scene {
  private profile!: Profile;
  private training!: TrainingState;
  private tab: Tab = 'run';
  private page = 0;
  /** The bag item being looked at, if any. */
  private selected: string | null = null;
  private confirmLetGo = false;
  private ui!: Phaser.GameObjects.Container;
  private testing: TestingPanel | null = null;
  private celebrating = false;
  /** Times the title was tapped recently (5 quick taps open the hidden testing screen). */
  private titleTaps: number[] = [];

  constructor() {
    super('Home');
  }

  create(): void {
    this.profile = loadSave();
    this.tab = this.profile.lastRun ? 'run' : 'gate';
    this.page = 0;
    this.selected = null;
    this.testing = null;
    this.celebrating = false;
    this.titleTaps = [];
    this.ui = this.add.container(0, 0);
    this.refresh();
    this.cameras.main.fadeIn(400, 10, 8, 16);
    this.scale.on(Phaser.Scale.Events.RESIZE, this.render, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.scale.off(Phaser.Scale.Events.RESIZE, this.render, this));
  }

  /** Reads the student's real progress and celebrates anything new since last time. */
  private refresh(): void {
    this.training = currentTraining();
    const moments = rewardMoments(this.profile.seen, this.training);
    this.render();
    const remember = () => {
      this.profile.seen = snapshot(this.training);
      writeSave(this.profile);
    };
    if (moments.length === 0) {
      remember();
      return;
    }
    this.celebrating = true;
    new Celebrations(this, moments, this.training, () => {
      this.celebrating = false;
      remember();
      this.render();
    });
  }

  private render(): void {
    this.ui.removeAll(true);
    const { width, height } = this.scale.gameSize;
    const pad = 16;
    const leftW = Math.min(300, width * 0.38);
    const t = this.training;

    // Floor of the dojo (placeholder).
    this.ui.add(this.add.rectangle(0, 0, width, height, 0x1e1a14).setOrigin(0));
    for (let x = 0; x < width; x += 48) this.ui.add(this.add.rectangle(x, 0, 2, height, 0x2a241c).setOrigin(0));

    // ---- left: title, character, level, Blessing, Enter the Tower, the Path card
    const title = this.text(pad, pad - 4, 'Training Board', 22, '#f2e9d8', true, 'Georgia, serif');
    title.setInteractive().on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, () => this.tapTitle());
    this.button(pad + leftW - 84, pad - 4, 84, 30, '◀ Dojo', 0x8a5a35, 14, () => this.backToDojo());

    const cy = pad + 58;
    if (t.blessed) {
      const glow = this.add.circle(pad + 24, cy, 32, 0x6fb7ff, 0.25);
      this.ui.add(glow);
      this.tweens.add({ targets: glow, scale: 1.15, alpha: 0.1, duration: 1100, yoyo: true, repeat: -1 });
    }
    this.ui.add(makeCharacter(this, pad + 24, cy, 22, t.belt, t.stripesThisBelt).container);
    this.text(pad + 58, cy - 22, t.displayName, 17, '#f2e9d8', true);
    const stripeText = t.stripesThisBelt ? `  ·  ${t.stripesThisBelt} stripe${t.stripesThisBelt > 1 ? 's' : ''}` : '';
    this.text(pad + 58, cy, `${t.belt.name}${stripeText}`, 14, beltTextColor(t.belt.color), true);

    // Level and experience (capped by the real belt).
    const level = effectiveLevel(this.profile, t);
    const atCap = level >= t.levelCap;
    let y = cy + 32;
    this.text(pad, y, `Level ${level}`, 15, '#f2e9d8', true);
    this.text(pad + leftW, y + 1, atCap ? 'Level cap! The Gate shows how to go higher.' : `cap ${t.levelCap}`, atCap ? 11 : 12, atCap ? '#ffd166' : '#b9ad99').setOrigin(1, 0);
    y += 20;
    const share = atCap ? 1 : Math.min(1, this.profile.xp / xpToNext(level, t.belts));
    const bar = this.add.graphics();
    bar.fillStyle(0x000000, 0.5).fillRoundedRect(pad, y, leftW, 8, 3);
    if (share > 0) bar.fillStyle(atCap ? 0xffd166 : 0x9ad1ff).fillRoundedRect(pad, y, Math.max(6, leftW * share), 8, 3);
    this.ui.add(bar);
    y += 14;
    if (t.blessed) {
      const hours = Math.max(1, Math.round(((t.blessingEndsMs ?? 0) - Date.now()) / 3600000));
      this.text(pad, y, `✦ Dojo Blessing: +${Math.round(BLESSING.xpBonus * 100)}% experience (${hours}h left)`, 12, '#9ad1ff', true);
    }
    y += 20;

    this.button(pad, y, leftW, 46, 'ENTER THE TOWER', 0xd5713a, 19, () => this.enterTower());
    y += 52;
    this.button(pad, y, leftW, 30, 'Practice room', 0x3a3a4a, 14, () => this.goTo('Game', {}));
    y += 38;
    this.renderPath(pad, y, leftW, height - y - pad);

    // ---- right: tabs
    const rx = pad * 2 + leftW;
    const rw = width - rx - pad;
    const tabs: Array<[Tab, string]> = [
      ['run', 'Last run'],
      ['gear', `Gear (${this.profile.inventory.length})`],
      ['abilities', 'Abilities'],
      ['gate', t.gate.ready ? 'Gate ✦' : 'Gate'],
    ];
    const tabW = (rw - 6 * (tabs.length - 1)) / tabs.length;
    tabs.forEach(([tab, label], i) => {
      this.button(rx + i * (tabW + 6), pad, tabW, 34, label, this.tab === tab ? 0x4a3f63 : 0x2a2536, 14, () => this.setTab(tab));
    });
    const top = pad + 46;
    const panelH = height - top - pad;
    this.ui.add(this.add.rectangle(rx, top, rw, panelH, 0x14121c, 0.65).setOrigin(0).setStrokeStyle(2, 0x3a3150));
    if (this.tab === 'run') this.renderRun(rx + 12, top + 10, rw - 24, panelH - 20);
    else if (this.tab === 'gear') this.renderGear(rx + 10, top + 10, rw - 20, panelH - 20);
    else if (this.tab === 'abilities') this.renderAbilities(rx + 10, top + 10, rw - 20, panelH - 20);
    else this.renderGate(rx + 12, top + 10, rw - 24, panelH - 20);
  }

  /** The Path card: the next real step, always visible (core-design section 9). */
  private renderPath(x: number, y: number, w: number, h: number): void {
    const p = this.training.path;
    this.ui.add(this.add.rectangle(x, y, w, h, 0x221d2e).setOrigin(0).setStrokeStyle(2, 0xffd166, 0.5));
    let ty = y + 7;
    this.text(x + 10, ty, 'YOUR NEXT STEP', 11, '#ffd166', true);
    ty += 16;
    if (p.next) {
      this.text(x + 10, ty, p.next.name, 16, '#ffffff', true);
      // The video library arrives with the real DojoForge connection.
      this.text(x + w - 10, ty + 2, '▶ Video soon', 11, '#6b6478').setOrigin(1, 0);
      ty += 22;
      if (p.next.catchUp) {
        this.text(x + 10, ty, `Catch-up from ${p.next.beltName}`, 11, '#ffd166');
        ty += 16;
      }
    } else {
      this.text(x + 10, ty, 'Everything is signed off. Keep training!', 14, '#5cd65c', true, FONT, w - 20);
      ty += 20;
    }
    const bits: string[] = [];
    if (p.nextClassDay) bits.push(`Next class: ${p.nextClassDay}`);
    if (p.testDate) bits.push(`Test day: ${shortDate(p.testDate)}`);
    if (bits.length && ty < y + h - 14) this.text(x + 10, ty, bits.join('   ·   '), 12, '#f2e9d8', false, FONT, w - 20);
  }

  private renderRun(x: number, y: number, w: number, h: number): void {
    const last = this.profile.lastRun;
    if (!last) {
      this.text(x, y, 'No runs yet. Tap Enter the Tower to climb!', 16, '#f2e9d8', false, FONT, w);
      this.renderBests(x, y + h - 44, w);
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
    y += 22;
    if (last.xp) {
      const xp = last.xp;
      const extras = [xp.blessed ? 'Dojo Blessing' : '', xp.catchUp ? 'catch-up x2' : ''].filter(Boolean).join(', ');
      const lvl = xp.levelsGained > 0 ? `   Level up! (+${xp.levelsGained})` : xp.atCap ? '   (level cap)' : '';
      this.text(x, y, `+${xp.gained} experience${extras ? ` (${extras})` : ''}${lvl}`, 14, '#9ad1ff', true, FONT, w);
      y += 22;
    }

    const decos = s.decorations ?? [];
    if (decos.length > 0) {
      this.text(x, y, `For your dojo: ${decos.map((id) => decorationDef(CONTENT.dojo, id).name).join(', ')}`, 14, '#ffd166', true, FONT, w);
      y += 22;
    }
    this.text(x, y, `Items found (${s.items.length})`, 15, '#ffd166', true);
    y += 22;
    const lineH = 19;
    const fit = Math.max(1, Math.floor((this.panelBottom(h) - 50 - y) / lineH));
    const items = s.items.slice().sort((a, b) => RARITY_ORDER(b) - RARITY_ORDER(a));
    items.slice(0, fit).forEach((it) => {
      this.text(x, y, `${RARITY_NAME[it.rarity]}: ${it.name}  (${describeItem(it)})`, 14, css(RARITY_COLOR[it.rarity]), false, FONT, w);
      y += lineH;
    });
    if (items.length > fit) this.text(x, y, `+${items.length - fit} more in your Gear`, 13, '#b9ad99');
    if (items.length === 0) this.text(x, y, 'None this time. Beat enemies and open chests!', 14, '#b9ad99');
    this.renderBests(x, this.panelBottom(h) - 44, w);
  }

  /** The y where the right panel's content ends. */
  private panelBottom(h: number): number {
    return 16 + 46 + 10 + h;
  }

  private renderBests(x: number, y: number, w: number): void {
    const b = this.profile.bests;
    const newBests = new Set(this.profile.lastRun?.newBests ?? []);
    this.text(x, y, 'Personal bests', 13, '#ffd166', true);
    const rows: Array<[BestKey, string]> = [
      ['fastestClearTicks', b.fastestClearTicks === null ? '—' : clock(b.fastestClearTicks, TICKS_PER_SECOND)],
      ['mostPerfects', `${b.mostPerfects}`],
      ['longestCombo', `${b.longestCombo}`],
      ['mostSGrades', `${b.mostSGrades}`],
    ];
    rows.forEach(([key, value], i) => {
      const isNew = newBests.has(key);
      this.text(x + (i % 2) * (w / 2), y + 17 + Math.floor(i / 2) * 15, `${BEST_NAME[key]}: ${value}${isNew ? ' NEW!' : ''}`, 12, isNew ? '#ffd166' : '#f2e9d8');
    });
  }

  /** Every earned and not-yet-earned ability, named after the real technique. */
  private renderAbilities(x: number, y: number, w: number, h: number): void {
    const t = this.training;
    interface Row {
      tag: string;
      title: string;
      text: string;
      status: string;
      unlocked: boolean;
      color: number;
    }
    const rows: Row[] = [];
    for (const v of t.virtues) {
      const inUse = v === t.virtue;
      const belts = v.earned.map((s) => t.belts.find((b) => b.id === s.belt)?.name ?? s.belt).join(', ');
      rows.push({
        tag: 'Virtue',
        title: `${virtueTitle(v)}  ·  ${v.word} stripe`,
        text: describeVirtue(virtueSetupFor(v), v.def.text),
        status: `Earned at ${belts}${inUse ? '  ·  in use' : ''}`,
        unlocked: true,
        color: 0xffd166,
      });
    }
    const order = { form: 0, strike: 1, seal: 2 };
    const list = t.abilities.slice().sort((a, b) => order[a.kind] - order[b.kind] || Number(b.unlocked) - Number(a.unlocked));
    for (const a of list) {
      const r = a.requirement;
      const name = a.form?.name ?? a.perk?.name ?? 'Coming in a later update';
      rows.push({
        tag: KIND_LABEL[a.kind],
        title: `${name}  ·  ${r.name}`,
        text: a.form?.text ?? a.perk?.text ?? 'Its power arrives in a later update.',
        status: a.unlocked ? signedLine(r) : `Sign off ${r.name} to unlock${r.catchUp ? ' (catch-up)' : ''}`,
        unlocked: a.unlocked,
        color: a.kind === 'form' ? 0x6fb7ff : a.kind === 'strike' ? 0xff7a45 : 0x5cd6b0,
      });
    }

    const rowH = 54;
    const perPage = Math.max(1, Math.floor((h - 34) / rowH));
    const pages = Math.max(1, Math.ceil(rows.length / perPage));
    this.page = Math.min(this.page, pages - 1);
    rows.slice(this.page * perPage, (this.page + 1) * perPage).forEach((row, i) => {
      const by = y + i * rowH;
      this.ui.add(this.add.rectangle(x, by, w, rowH - 6, row.unlocked ? 0x221d2e : 0x18151f).setOrigin(0).setStrokeStyle(2, row.color, row.unlocked ? 0.8 : 0.25));
      const c = row.unlocked ? '#ffffff' : '#6b6478';
      this.text(x + 8, by + 4, `${row.unlocked ? '' : '🔒 '}${row.tag}: ${row.title}`, 13, row.unlocked ? css(row.color) : '#8a8296', true, FONT, w - 16);
      this.text(x + 8, by + 20, row.text, 11, c, false, FONT, w - 16);
      this.text(x + 8, by + 33, row.status, 11, row.unlocked ? '#b9ad99' : '#ffd166', false, FONT, w - 16);
    });
    if (rows.length === 0) this.text(x, y, 'No abilities yet.', 14, '#b9ad99');
    if (pages > 1) {
      const py = y + h - 28;
      this.button(x, py, 70, 28, '◀', 0x2a2536, 15, () => this.turn(-1));
      this.text(x + w / 2, py + 14, `${this.page + 1} / ${pages}`, 13, '#b9ad99').setOrigin(0.5);
      this.button(x + w - 70, py, 70, 28, '▶', 0x2a2536, 15, () => this.turn(1));
    }
  }

  /** The Gate: one lock per requirement, the time-in-rank sundial, and Sensei's Seal. */
  private renderGate(x: number, y: number, w: number, h: number): void {
    const g = this.training.gate;
    if (!g.toBelt) {
      this.text(x, y, 'You have reached the top of the Tower.', 18, '#ffd166', true, FONT, w);
      return;
    }
    this.text(x, y, `The Gate to ${g.toBelt.name}`, 19, '#f2e9d8', true, 'Georgia, serif');
    if (g.ready) {
      const chip = this.text(x + w, y + 2, ' READY ', 15, '#14121c', true).setOrigin(1, 0).setBackgroundColor('#ffd166');
      this.tweens.add({ targets: chip, alpha: 0.6, duration: 800, yoyo: true, repeat: -1 });
    }
    this.text(x, y + 26, `${g.lit} of ${g.locks.length} locks lit. A real promotion opens the Gate.`, 12, '#b9ad99', false, FONT, w);

    // The locks.
    const n = g.locks.length;
    const slot = w / n;
    const r = Math.min(20, slot * 0.36);
    const ly = y + 50 + r;
    g.locks.forEach((lock, i) => {
      const lx = x + slot * (i + 0.5);
      if (lock.signedOff) {
        const halo = this.add.circle(lx, ly, r + 6, 0xffd166, 0.25);
        this.ui.add(halo);
        this.ui.add(this.add.circle(lx, ly, r, 0xffd166).setStrokeStyle(3, 0xffffff, 0.8));
        this.text(lx, ly, '✓', r, '#14121c', true).setOrigin(0.5);
      } else {
        this.ui.add(this.add.circle(lx, ly, r, 0x221d2e).setStrokeStyle(3, 0x6b6478));
        this.text(lx, ly, '🔒', r * 0.8, '#8a8296').setOrigin(0.5);
      }
      this.text(lx, ly + r + 4, shortName(lock), 10, lock.signedOff ? '#ffd166' : '#b9ad99', false, FONT, slot - 4).setOrigin(0.5, 0).setAlign('center');
    });

    // The sundial and Sensei's Seal.
    const by = ly + r + 40;
    const sr = Math.max(16, Math.min(24, (y + h - by) / 2 - 6));
    const half = w / 2;
    const sx = x + sr + 2;
    const sy = by + sr;
    const dial = this.add.graphics();
    dial.fillStyle(0x221d2e).fillCircle(sx, sy, sr);
    if (g.sundial > 0) {
      dial.fillStyle(0xffd166, 0.9).slice(sx, sy, sr, -Math.PI / 2, -Math.PI / 2 + g.sundial * Math.PI * 2).fillPath();
    }
    dial.lineStyle(3, 0x6b6478).strokeCircle(sx, sy, sr);
    this.ui.add(dial);
    this.text(sx + sr + 10, sy - 16, 'Time in rank', 13, '#f2e9d8', true);
    this.text(sx + sr + 10, sy + 1, `${Math.min(g.classesInRank, g.classesBeforeTest)} of ${g.classesBeforeTest} classes`, 12, '#b9ad99', false, FONT, half - sr * 2 - 16);

    const kx = x + half + sr + 2;
    this.ui.add(this.add.circle(kx, sy, sr, g.sealLit ? 0xe0533d : 0x221d2e).setStrokeStyle(3, g.sealLit ? 0xffd166 : 0x6b6478));
    this.text(kx, sy, '師', sr, g.sealLit ? '#ffffff' : '#6b6478', true).setOrigin(0.5);
    this.text(kx + sr + 10, sy - 16, "Sensei's Seal", 13, '#f2e9d8', true);
    // Never shows or guesses a reason when the Seal isn't lit.
    const sealText = g.sealLit ? (g.testDate ? `Test day: ${shortDate(g.testDate)}` : 'Approved to test!') : 'Lights when Sensei approves you to test.';
    this.text(kx + sr + 10, sy + 1, sealText, 12, g.sealLit ? '#ffd166' : '#b9ad99', g.sealLit, FONT, half - sr * 2 - 16);
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
    this.goTo('Game', { run: startTowerRun(this.profile, this.training) });
  }

  private backToDojo(): void {
    if (this.celebrating) return;
    sfx.unlock();
    this.input.enabled = false;
    this.cameras.main.fadeOut(300, 10, 8, 16);
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => this.scene.start('Dojo'));
  }

  // ---------------------------------------------------------------- hidden testing screen

  private tapTitle(): void {
    if (this.celebrating) return;
    const now = this.time.now;
    this.titleTaps = [...this.titleTaps.filter((t) => now - t < 2500), now];
    if (this.titleTaps.length >= 5) {
      this.titleTaps = [];
      this.openTesting();
    }
  }

  private openTesting(): void {
    this.testing?.destroy();
    this.testing = new TestingPanel(this, this.profile, this.training, {
      pickProfile: (key) => {
        selectProfile(key);
        this.closeTesting();
        this.page = 0;
        this.refresh();
      },
      forgetSeen: () => {
        this.profile.seen = null;
        writeSave(this.profile);
        this.closeTesting();
        this.refresh();
      },
      addLevel: () => {
        this.profile.level = Math.min(this.profile.level + 1, this.training.levelCap);
        this.profile.xp = 0;
        writeSave(this.profile);
        this.render();
        this.openTesting();
      },
      resetLevel: () => {
        this.profile.level = 1;
        this.profile.xp = 0;
        writeSave(this.profile);
        this.render();
        this.openTesting();
      },
      close: () => this.closeTesting(),
    });
  }

  private closeTesting(): void {
    this.testing?.destroy();
    this.testing = null;
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

/** "Signed off by Sensei Jay · Sat, Nov 2", or "Passed at White Belt" for the legacy grant. */
function signedLine(r: RequirementStatus): string {
  if (r.legacy) return `Passed at ${r.beltName}`;
  const who = r.signedOffBy ? `Signed off by ${r.signedOffBy}` : 'Signed off';
  return r.signedOffOn ? `${who}  ·  ${shortDate(r.signedOffOn)}` : who;
}

/** A short label for a Gate lock: "Basic Form 1", "SD #6", "Kick 2". */
function shortName(r: RequirementStatus): string {
  return r.name.replace('Self-Defense ', 'SD ').replace('Kick Combo ', 'Kick ');
}

/** Belt name color that stays readable on the dark floor (black belt text is lightened). */
function beltTextColor(color: string): string {
  const c = Phaser.Display.Color.HexStringToColor(color);
  return c.red + c.green + c.blue < 120 ? '#b9ad99' : color;
}
