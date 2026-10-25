import Phaser from 'phaser';
import { button } from '../ui/button';
import { GEAR, MOTION, RADIUS, S1, S2, S3, TYPE, XP_FILL, gearGrid, lastRunItemsFit, lastRunMoreLabel, showEmptyBagHint, pageDots, panelSwap, xpFillFrom, type PanelChange } from '../ui/tokens';
import { reducedMotion } from '../game/motion';
import playTimeText from '../../../../content/settings/play-time.json';
import {
  BLESSING,
  GEAR_SLOTS,
  realClock,
  compareGear,
  describeItem,
  describeVirtue,
  effectiveLevel,
  equip,
  gearScore,
  letGo,
  unequip,
  goalsDue,
  markGoalsShown,
  nextGoals,
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
  showSensei,
  kataArrows,
} from '@dojo/sim';
import { sfx } from '../audio/Sfx';
import { CONTENT, KATAS } from '../game/content';
import { loadSave, writeSave } from '../game/save';
import { currentTraining, selectProfile, shortDate } from '../game/student';
import { startTowerRun } from '../game/tower';
import { isPlayTimeUp } from '../game/playTime';
import { addIcon, ICON_PACK } from '../art/icons';
import { addGearIcon, loadGearIcons } from '../art/gearIcons';
import { loadArt } from '../art/art';
import { makeStandingCharacter } from '../art/player';
import { loadLook, playerPacks } from '../game/look';
import { Celebrations } from '../ui/Celebrations';
import { GoalsCard } from '../ui/GoalsCard';
import { localDay, takeLesson } from '../game/lessons';
import { TestingPanel } from '../ui/TestingPanel';
import { BETA } from '../game/beta';
import { FONT, GRADE_COLOR, RARITY_COLOR, rarityName, crisp, css, view, hiDpi } from '../ui/theme';
import type { GameSceneData } from './GameScene';

/** How Home was opened: after a run (cleared, lost, or rested at the play limit) the next goals may show. */
export interface HomeSceneData {
  fromRun?: boolean;
}

const SLOT_NAME: Record<GearSlot, string> = { hands: 'Hands', gi: 'Gi', charm: 'Charm' };
const BEST_NAME: Record<BestKey, string> = {
  fastestClearTicks: 'Fastest floor',
  mostPerfects: 'Most Perfect Counters',
  longestCombo: 'Longest combo',
  mostSGrades: 'Most S grades',
};
const KIND_MARK: Record<string, string> = { rest: '+' };

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
  /** P-MENU-d: the gear detail sheet and what Wear pops. */
  private sheet: Phaser.GameObjects.Container | null = null;
  private sheetOpening = false;
  private gearGridBox: Phaser.GameObjects.Container | null = null;
  private wornCards: Partial<Record<GearSlot, { c: Phaser.GameObjects.Container; w: number; h: number }>> = {};
  /** Where the draw helpers add things: the shell, the tab bar or the panel (P-MENU-b). */
  private ui!: Phaser.GameObjects.Container;
  /** P-MENU-b: background, left column and panel frame. Redrawn on create, refresh and resize. */
  private shell!: Phaser.GameObjects.Container;
  /** P-MENU-b: the tab buttons; redrawn on a tab change (colours, Gear count). */
  private tabBar!: Phaser.GameObjects.Container;
  /** P-MENU-b: the sliding underline under the picked tab. */
  private underline!: Phaser.GameObjects.Rectangle;
  /** P-MENU-b: the panel contents only. Tab, page and gear taps redraw just this. */
  private panel: Phaser.GameObjects.Container | null = null;
  private panelBox = { rx: 0, top: 0, rw: 0, panelH: 0 };
  private tabBox = { rx: 0, y: 0, tabW: 0 };
  private testing: TestingPanel | null = null;
  private celebrating = false;
  /** Times the title was tapped recently (5 quick taps open the hidden testing screen). */
  private titleTaps: number[] = [];
  /** Came here straight from a run, and the next goals haven't been considered yet. */
  private fromRun = false;
  private firstFloorDone = false;

  constructor() {
    super('Home');
  }

  preload(): void {
    loadArt(this, [...playerPacks(), ICON_PACK]);
    loadGearIcons(this);
  }

  init(data: HomeSceneData): void {
    this.fromRun = data?.fromRun === true;
    this.firstFloorDone = false;
  }

  create(): void {
    hiDpi(this.cameras.main);
    this.profile = loadSave();
    this.tab = this.profile.lastRun ? 'run' : 'gate';
    this.page = 0;
    this.selected = null;
    this.testing = null;
    this.celebrating = false;
    this.titleTaps = [];
    this.shell = this.add.container(0, 0);
    this.tabBar = this.add.container(0, 0);
    this.underline = this.add.rectangle(0, 0, 0, 3, 0xffd166).setOrigin(0).setVisible(false);
    this.panel = null;
    this.ui = this.shell;
    this.refresh();
    this.cameras.main.fadeIn(400, 10, 8, 16);
    this.scale.on(Phaser.Scale.Events.RESIZE, this.render, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.scale.off(Phaser.Scale.Events.RESIZE, this.render, this));
  }

  /** Reads the student's real progress and celebrates anything new since last time. */
  private refresh(): void {
    // K23: straight back from the tutorial floor, a simple card comes first (grade, one
    // reward, Continue); Sensei's line, the cascade and the full summary wait until Continue.
    if (this.fromRun && this.profile.lastRun?.summary.tutorial && !this.firstFloorDone) {
      this.firstFloorDone = true;
      this.training = currentTraining();
      this.render();
      this.celebrating = true;
      this.firstFloorCard(() => {
        this.celebrating = false;
        this.refresh();
      });
      return;
    }
    this.training = currentTraining();
    const moments = rewardMoments(this.profile.seen, this.training, CONTENT.abilities.forms[0].name);
    // First return home after the tutorial floor: Sensei's welcome line, once, then the
    // unlock cascade (M7-P4, Manager call: both play here, the line first).
    const sensei: string[] = [];
    if (this.profile.lastRun?.summary.tutorial) {
      const welcome = takeLesson('firstHomeReturn', null);
      if (welcome) {
        this.profile.lessons = loadSave().lessons;
        const name = this.training.firstName;
        sensei.push(...welcome.screens.map((l) => l.replace('{player}', name)));
      }
    }
    this.render();
    const remember = () => {
      this.profile.seen = snapshot(this.training);
      writeSave(this.profile);
    };
    if (moments.length === 0 && sensei.length === 0) {
      remember();
      this.maybeGoals();
      return;
    }
    this.celebrating = true;
    new Celebrations(
      this,
      moments,
      this.training,
      () => {
        this.celebrating = false;
        remember();
        this.render();
        this.maybeGoals();
      },
      sensei,
    );
  }

  /** K23: the first floor's results for a 6-year-old: the grade, one reward and Continue. */
  private firstFloorCard(onDone: () => void): void {
    const s = this.profile.lastRun!.summary;
    const { width, height } = view(this);
    const card = this.add.container(0, 0).setDepth(50);
    const add = <T extends Phaser.GameObjects.GameObject>(o: T): T => (card.add(o), o);
    const label = (x: number, y: number, str: string, size: number, color: string, family = FONT) =>
      add(this.add.text(x, y, str, { fontFamily: family, fontSize: `${size}px`, color, fontStyle: 'bold', align: 'center', wordWrap: { width: 300, useAdvancedWrap: true } }).setOrigin(0.5).setResolution(crisp()));
    add(this.add.rectangle(0, 0, width, height, 0x000000, 0.7).setOrigin(0).setInteractive());
    const w = Math.min(340, width - 40);
    const h = Math.min(280, height - 30);
    const cx = width / 2;
    const top = (height - h) / 2;
    add(this.add.rectangle(cx, height / 2, w, h, 0x221d2e).setStrokeStyle(3, 0xffd166));
    label(cx, top + 26, 'Floor cleared!', 24, '#ffd166', 'Georgia, serif');
    const order = ['S', 'A', 'B'] as const;
    const grade = order.find((g) => s.results.some((r) => r.grade === g));
    if (grade) label(cx, top + h * 0.36, grade, 64, GRADE_COLOR[grade], 'Georgia, serif');
    const best = s.items.slice().sort((a, b) => RARITY_ORDER(b) - RARITY_ORDER(a))[0];
    const deco = [...(s.decorations ?? []), ...(this.profile.lastRun!.earned ?? [])][0];
    const reward = best ? `You found: ${best.name}` : deco ? `For your dojo: ${decorationDef(CONTENT.dojo, deco).name}` : '';
    if (reward) {
      const t = label(cx, top + h * 0.6, reward, 17, best ? css(RARITY_COLOR[best.rarity]) : '#ffd166');
      const icon = best ? addGearIcon(this, best, 0, t.y, 32) : null;
      if (icon) {
        // K32: the item's slot + rarity icon sits left of the line; the pair stays centred.
        add(icon.setX(cx - (t.width + 38) / 2 + 16));
        t.setX(cx + 19);
      }
    }
    const bw = 160;
    const by = top + h - 58;
    // P-MENU-a: the shared button (press feedback, slide-off cancel), 44 tall.
    button(this, { x: cx - bw / 2, y: by, w: bw, h: 44, label: 'Continue', color: 0xd5713a, size: 19, onTap: () => {
      card.destroy();
      onDone();
    } }, card);
  }

  /** The three next goals (M7-P10), after the run summary and any celebrations, at most once a day. */
  private maybeGoals(): void {
    if (!this.fromRun) return;
    this.fromRun = false;
    const today = localDay();
    if (!goalsDue(this.profile, today)) return;
    markGoalsShown(this.profile, today);
    writeSave(this.profile);
    this.celebrating = true;
    new GoalsCard(this, nextGoals(this.profile, this.training, CONTENT), () => {
      this.celebrating = false;
    });
  }

  /** Everything: the shell, the tab bar and the panel. */
  private render(): void {
    this.renderShell();
    this.renderTabs(false);
    this.renderPanel('none');
  }

  /** P-MENU-b: the frame (background, left column, panel box). Not the tabs or the panel contents. */
  private renderShell(): void {
    this.shell.removeAll(true);
    this.ui = this.shell;
    const { width, height } = view(this);
    const pad = 16;
    const leftW = Math.min(300, width * 0.38);
    const t = this.training;

    // Floor of the dojo (placeholder).
    this.ui.add(this.add.rectangle(0, 0, width, height, 0x1e1a14).setOrigin(0));
    for (let x = 0; x < width; x += 48) this.ui.add(this.add.rectangle(x, 0, 2, height, 0x2a241c).setOrigin(0));

    // ---- left (P-MENU-c §3a): header row, character block, level + bar, buttons, the Path card
    // Header: the title and ◀ Dojo on one 44 pt row.
    const title = this.text(pad, pad + 22, 'Training Board', TYPE.heading, '#f2e9d8', true, 'Georgia, serif').setOrigin(0, 0.5);
    title.setInteractive().on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, () => this.tapTitle());
    this.button(pad + leftW - 96, pad, 96, 44, '◀ Dojo', 0x8a5a35, TYPE.body, () => this.backToDojo());

    // Character block: a 64 pt row; name and belt stacked 4 pt apart, centred on the avatar.
    const rowTop = pad + 44 + S2;
    const cy = rowTop + 32;
    if (t.blessed) {
      // Full fill, so the object's alpha is the alpha you see (0.25 to 0.15).
      const glow = this.add.circle(pad + 24, cy, 32, 0x6fb7ff, 1).setAlpha(MOTION.breath.from);
      this.ui.add(glow);
      // P-MENU-a: a slow breath (alpha only, no scale); still with Reduced motion on.
      if (!reducedMotion()) this.tweens.add({ targets: glow, alpha: MOTION.breath.to, duration: MOTION.breath.ms, ease: 'Sine.InOut', yoyo: true, repeat: -1 });
    }
    this.ui.add(makeStandingCharacter(this, pad + 24, cy, 22, t.belt, t.stripesThisBelt, loadLook()).container);
    const textX = pad + 64;
    const textW = leftW - 64;
    // With a Blessing, a third 12 pt line joins the stack (keeps the column short enough for 375 pt).
    const stackH = TYPE.title + S1 + TYPE.body + (t.blessed ? S1 + TYPE.label : 0);
    let sy = cy - stackH / 2 - 2;
    this.oneLine(this.text(textX, sy, t.displayName, TYPE.title, '#f2e9d8', true), textW, TYPE.label);
    sy += TYPE.title + S1;
    const stripeText = t.stripesThisBelt ? `  ·  ${t.stripesThisBelt} stripe${t.stripesThisBelt > 1 ? 's' : ''}` : '';
    this.oneLine(this.text(textX, sy, `${t.belt.name}${stripeText}`, TYPE.body, beltTextColor(t.belt.color), true), textW, TYPE.label);
    if (t.blessed) {
      const hours = Math.max(1, Math.round(((t.blessingEndsMs ?? 0) - Date.now()) / 3600000));
      this.oneLine(this.text(textX, sy + TYPE.body + S1 + 2, `✦ Blessing +${Math.round(BLESSING.xpBonus * 100)}% XP · ${hours}h left`, TYPE.label, '#9ad1ff', true), textW, 10);
    }

    // Level and experience (capped by the real belt): label and cap on one line, a 10 pt bar 8 below.
    const level = effectiveLevel(this.profile, t);
    const atCap = level >= t.levelCap;
    let y = rowTop + 64 + S2;
    this.text(pad, y, `Level ${level}`, TYPE.body, '#f2e9d8', true);
    this.oneLine(this.text(pad + leftW, y + 1, atCap ? 'Level cap! The Gate shows how to go higher.' : `cap ${t.levelCap}`, TYPE.label, atCap ? '#ffd166' : '#b9ad99').setOrigin(1, 0), leftW - 70, 10);
    y += TYPE.body + 4 + S2;
    const share = atCap ? 1 : Math.min(1, this.profile.xp / xpToNext(level, t.belts));
    this.xpBar(pad, y, leftW, share, level, atCap);
    y += 10 + S2;

    // Buttons: ENTER 52 tall, Practice room 44, 8 apart.
    this.button(pad, y, leftW, 52, 'ENTER THE TOWER', 0xd5713a, 19, () => this.enterTower());
    y += 52 + S2;
    this.button(pad, y, leftW, 44, 'Practice room', 0x3a3a4a, TYPE.body, () => this.goTo('Game', {}));
    y += 44 + S2;
    this.renderPath(pad, y, leftW, height - y - pad);

    // ---- right: tabs
    const rx = pad * 2 + leftW;
    const rw = width - rx - pad;
    const top = pad + 46;
    const panelH = height - top - pad;
    this.ui.add(this.add.rectangle(rx, top, rw, panelH, 0x14121c, 0.65).setOrigin(0).setStrokeStyle(2, 0x3a3150));
    this.panelBox = { rx, top, rw, panelH };
    this.tabBox = { rx, y: pad, tabW: (rw - 6 * 3) / 4 };
  }

  /** P-MENU-b: the tab buttons, and the underline slides to the picked tab (jumps with Reduced motion). */
  private renderTabs(slide: boolean): void {
    this.tabBar.removeAll(true);
    this.ui = this.tabBar;
    const t = this.training;
    const { rx, y: pad } = this.tabBox;
    const tabs: Array<[Tab, string]> = [
      ['run', 'Last run'],
      ['gear', `Gear (${this.profile.inventory.length})`],
      ['abilities', 'Abilities'],
      ['gate', t.gate.ready ? 'Gate ✦' : 'Gate'],
    ];
    const tabW = this.tabBox.tabW;
    tabs.forEach(([tab, label], i) => {
      this.button(rx + i * (tabW + 6), pad, tabW, 34, label, this.tab === tab ? 0x4a3f63 : 0x2a2536, 14, () => this.setTab(tab));
    });
    const i = tabs.findIndex(([tab]) => tab === this.tab);
    const ux = rx + i * (tabW + 6) + 8;
    const uy = pad + 34 + 3;
    this.children.bringToTop(this.underline);
    this.tweens.killTweensOf(this.underline);
    this.underline.setVisible(true).setSize(tabW - 16, 3);
    if (slide && !reducedMotion()) this.tweens.add({ targets: this.underline, x: ux, y: uy, duration: MOTION.swap.ms, ease: MOTION.swap.ease });
    else this.underline.setPosition(ux, uy);
  }

  /**
   * P-MENU-b: only the panel contents, in their own container. The old panel goes first (its
   * tweens killed), so a quick double tap can never leave two panels.
   */
  private renderPanel(change: PanelChange): void {
    if (this.panel) {
      this.tweens.killTweensOf(this.panel);
      this.panel.destroy(true);
    }
    const panel = this.add.container(0, 0);
    this.panel = panel;
    this.ui = panel;
    const { rx, top, rw, panelH } = this.panelBox;
    if (this.tab === 'run') this.renderRun(rx + 12, top + 10, rw - 24, panelH - 20);
    else if (this.tab === 'gear') this.renderGear(rx + 10, top + 10, rw - 20, panelH - 20);
    else if (this.tab === 'abilities') this.renderAbilities(rx + 10, top + 10, rw - 20, panelH - 20);
    else this.renderGate(rx + 12, top + 10, rw - 24, panelH - 20);
    const swap = panelSwap(change, reducedMotion());
    if (swap) {
      panel.setPosition(swap.dx, 0).setAlpha(swap.fromAlpha);
      this.tweens.add({ targets: panel, x: 0, alpha: 1, duration: swap.ms, ease: swap.ease });
    }
  }

  /** The Path card: the next real step, always visible (core-design section 9). */
  private renderPath(x: number, y: number, w: number, h: number): void {
    // P-MENU-c: padding 16, radius 10; label 12 bold gold, step 17 bold, details 14.
    const p = this.training.path;
    const card = this.add.graphics();
    card.fillStyle(0x221d2e).fillRoundedRect(x, y, w, h, RADIUS.panel);
    card.lineStyle(2, 0xffd166, 0.5).strokeRoundedRect(x, y, w, h, RADIUS.panel);
    this.ui.add(card);
    // A short phone (375 pt tall) gets 12 pt padding so the step still fits.
    const padP = h >= 16 + TYPE.label + S2 + TYPE.title + 16 ? S3 : 12;
    const px = x + padP;
    const pw = w - 2 * padP;
    let ty = y + padP;
    this.text(px, ty, 'YOUR NEXT STEP', TYPE.label, '#ffd166', true);
    ty += TYPE.label + (padP === S3 ? S2 : 4);
    if (p.next) {
      // The video library arrives with the real DojoForge connection.
      const video = this.text(x + w - padP, ty + 3, '▶ Video soon', TYPE.label, '#6b6478').setOrigin(1, 0);
      this.oneLine(this.text(px, ty, p.next.name, TYPE.title, '#ffffff', true), pw - video.width - S2, TYPE.body);
      ty += TYPE.title + S2;
      if (p.next.catchUp) {
        this.text(px, ty, `Catch-up from ${p.next.beltName}`, TYPE.label, '#ffd166');
        ty += TYPE.label + S2;
      }
    } else {
      const done = this.text(px, ty, 'Everything is signed off. Keep training!', TYPE.body, '#5cd65c', true, FONT, pw);
      ty += done.height + S2;
    }
    const bits: string[] = [];
    if (p.nextClassDay) bits.push(`Next class: ${p.nextClassDay}`);
    if (p.testDate) bits.push(`Test day: ${shortDate(p.testDate)}`);
    if (bits.length && ty + TYPE.body <= y + h - S2) this.text(px, ty, bits.join('   ·   '), TYPE.body, '#f2e9d8', false, FONT, pw);
  }

  /**
   * P-MENU-c: the XP bar, 10 tall, radius 5. After a run it fills from what it last showed to
   * the new value over 400 ms (Cubic.Out); with Reduced motion on it is drawn full-size at once.
   */
  private xpBar(x: number, y: number, w: number, share: number, level: number, atCap: boolean): void {
    const bg = this.add.graphics();
    bg.fillStyle(0x000000, 0.5).fillRoundedRect(x, y, w, 10, 5);
    const fill = this.add.graphics();
    this.ui.add([bg, fill]);
    const draw = (s: number) => {
      fill.clear();
      if (s > 0) fill.fillStyle(atCap ? 0xffd166 : 0x9ad1ff).fillRoundedRect(x, y, Math.max(10, w * s), 10, 5);
    };
    const key = 'dojo.xpBarShown';
    let prev: { level: number; share: number } | null = null;
    try {
      prev = JSON.parse(localStorage.getItem(key) ?? 'null');
    } catch {
      prev = null;
    }
    const from = this.fromRun ? xpFillFrom(prev, { level, share }) : null;
    try {
      localStorage.setItem(key, JSON.stringify({ level, share }));
    } catch {
      /* private mode: the bar just doesn't animate */
    }
    if (from === null || reducedMotion()) {
      draw(share);
      return;
    }
    draw(from);
    const v = { s: from };
    this.tweens.add({ targets: v, s: share, duration: XP_FILL.ms, ease: XP_FILL.ease, onUpdate: () => draw(v.s) });
  }


  private renderRun(x: number, y: number, w: number, h: number): void {
    // B-LASTRUN: every block stacks below the measured bottom of the one before; Personal bests
    // sit on the panel's real bottom edge and the item list only takes the room left between.
    const bottom = y + h;
    const last = this.profile.lastRun;
    if (!last) {
      const t = this.text(x, y, 'No runs yet. Tap Enter the Tower to climb!', 16, '#f2e9d8', false, FONT, w);
      this.renderBests(x, Math.max(y + t.height + S2, bottom - this.bestsHeight(w)), w);
      return;
    }
    const s = last.summary;
    const headline = s.result === 'cleared' ? 'Floor cleared!' : s.result === 'rested' ? playTimeText.homeHeadline : `You reached room ${Math.min(s.totalRooms, s.roomsCleared + 1)} of ${s.totalRooms}`;
    const head = this.text(x, y, headline, 20, s.result !== 'lost' ? '#ffd166' : '#f2e9d8', true, FONT, w);
    y += head.height + S1;

    // One chip per room: its grade, or a mark for treasure and rest rooms. Wraps onto a new row.
    let cx = x;
    for (const r of s.results) {
      if (cx + 30 > x + w) {
        cx = x;
        y += 36;
      }
      if (r.kind === 'treasure' && !r.grade) {
        // K23: a small drawn chest (no "$", which read like money).
        this.ui.add(this.add.rectangle(cx, y, 30, 30, 0x221d2e).setOrigin(0).setStrokeStyle(2, 0xffd166));
        this.ui.add(chestIcon(this, cx + 15, y + 15, 0xffd166));
        cx += 36;
        continue;
      }
      const label = r.grade ?? KIND_MARK[r.kind] ?? '·';
      const color = r.grade ? GRADE_COLOR[r.grade] : '#b9ad99';
      this.ui.add(this.add.rectangle(cx, y, 30, 30, 0x221d2e).setOrigin(0).setStrokeStyle(2, Phaser.Display.Color.HexStringToColor(color).color));
      this.text(cx + 15, y + 15, label, 17, color, true).setOrigin(0.5);
      cx += 36;
    }
    y += 30 + S2;
    const stats = this.text(x, y, `Perfect Counters ${s.perfects}   Best combo ${s.bestCombo}   Time ${realClock(s.ticks)}`, 14, '#f2e9d8', false, FONT, w);
    y += stats.height + S1;
    if (last.xp) {
      const xp = last.xp;
      const extras = [xp.blessed ? 'Dojo Blessing' : '', xp.catchUp ? 'catch-up x2' : ''].filter(Boolean).join(', ');
      const lvl = xp.levelsGained > 0 ? `   Level up! (+${xp.levelsGained})` : xp.atCap ? '   (level cap)' : '';
      const xt = this.text(x, y, `+${xp.gained} experience${extras ? ` (${extras})` : ''}${lvl}`, 14, '#9ad1ff', true, FONT, w);
      y += xt.height + S1;
    }

    const lineH = 19;
    const bestsTop = Math.max(y, bottom - this.bestsHeight(w));
    const decos = [...(s.decorations ?? []), ...(last.earned ?? [])];
    if (decos.length > 0) {
      const line = this.text(x, y, `For your dojo: ${decos.map((id) => decorationDef(CONTENT.dojo, id).name).join(', ')}`, 14, '#ffd166', true, FONT, w);
      // Long trophy lists are capped above the item heading so they never reach Personal bests.
      const maxH = Math.max(18, bestsTop - S2 - y - 22 - S1 - lineH);
      if (line.height > maxH) {
        const perLine = line.height / Math.max(1, line.getWrappedText().length);
        const keep = line.getWrappedText().slice(0, Math.max(1, Math.floor(maxH / perLine)));
        keep[keep.length - 1] = keep[keep.length - 1].replace(/[\s,]*\S{0,3}$/, '') + '…';
        line.setWordWrapWidth(null).setText(keep.join('\n'));
      }
      y += line.height + S1;
    }
    if (y + 20 <= bestsTop - S2) {
      const heading = this.text(x, y, `Items found (${s.items.length})`, 15, '#ffd166', true);
      y += heading.height + S1;
      const items = s.items.slice().sort((a, b) => RARITY_ORDER(b) - RARITY_ORDER(a));
      const fit = lastRunItemsFit(y, bestsTop, lineH, items.length);
      items.slice(0, fit).forEach((it) => {
        const icon = addGearIcon(this, it, x + 8, y + 9, 18);
        if (icon) this.ui.add(icon);
        const tx = icon ? x + 22 : x;
        this.oneLine(this.text(tx, y, `${rarityName(it.rarity)}: ${it.name}  (${describeItem(it)})`, 14, css(RARITY_COLOR[it.rarity]), false), w - (tx - x), 10);
        y += lineH;
      });
      const more = lastRunMoreLabel(items.length, fit);
      if (more && y + lineH <= bestsTop - S2) this.oneLine(this.text(x, y, more, 13, '#b9ad99'), w, 10);
      if (items.length === 0) this.oneLine(this.text(x, y, 'None this time. Beat enemies and open chests!', 14, '#b9ad99'), w, 10);
    }
    this.renderBests(x, bestsTop, w);
  }

  private bestsRows(): Array<{ key: BestKey; str: string; isNew: boolean }> {
    const b = this.profile.bests;
    const newBests = new Set(this.profile.lastRun?.newBests ?? []);
    const rows: Array<[BestKey, string]> = [
      ['fastestClearTicks', b.fastestClearTicks === null ? '—' : realClock(b.fastestClearTicks)],
      ['mostPerfects', `${b.mostPerfects}`],
      ['longestCombo', `${b.longestCombo}`],
      ['mostSGrades', `${b.mostSGrades}`],
    ];
    return rows.map(([key, value]) => ({ key, isNew: newBests.has(key), str: `${BEST_NAME[key]}: ${value}${newBests.has(key) ? ' NEW!' : ''}` }));
  }

  /** Two columns only when every row fits in half the width; otherwise one row per line. */
  private bestsCols(w: number): number {
    const probe = this.add.text(0, 0, '', { fontFamily: FONT, fontSize: `${TYPE.label}px` });
    const widest = Math.max(...this.bestsRows().map((r) => probe.setText(r.str).width));
    probe.destroy();
    return widest <= w / 2 - S2 ? 2 : 1;
  }

  private bestsHeight(w: number): number {
    return 17 + Math.ceil(4 / this.bestsCols(w)) * 16;
  }

  private renderBests(x: number, y: number, w: number): void {
    const cols = this.bestsCols(w);
    this.text(x, y, 'Personal bests', 13, '#ffd166', true);
    this.bestsRows().forEach((r, i) => {
      this.oneLine(this.text(x + (i % cols) * (w / cols), y + 17 + Math.floor(i / cols) * 16, r.str, TYPE.label, r.isNew ? '#ffd166' : '#f2e9d8'), w / cols - S1, TYPE.label);
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
      /** Icon id (Batch 8), if it has one. */
      icon?: string;
      /** S3-P1b: kata arrows are drawn at the step-number size (13px bold), not 11px. */
      big?: boolean;
    }
    const rows: Row[] = [];
    const kataRows: Row[] = [];
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
        status: a.unlocked ? signedLine(r) : `${showSensei(r.name)} to unlock`,
        unlocked: a.unlocked,
        color: a.kind === 'form' ? 0x6fb7ff : a.kind === 'strike' ? 0xff7a45 : 0x5cd6b0,
        icon: a.form?.id ?? a.perk?.id,
      });
      // S3-P1: an earned kata gets its own card: name, step count and the direction of each
      // step (a step whose direction is still an open question gets no arrow).
      const kata = a.kind === 'form' && a.unlocked ? KATAS.get(r.id) : undefined;
      if (kata)
        kataRows.push({ tag: 'Kata', title: kata.name, text: `${kata.steps.length} steps`, status: kataArrows(kata), unlocked: true, color: 0x9fd3ff, big: true });
    }
    // S3-P1b: earned katas are grouped together at the top of Abilities.
    rows.unshift(...kataRows);

    // Descriptions and status lines wrap (K22b), so each card is as tall as its text and a
    // page holds as many cards as fit.
    const iconSize = w < 560 ? 32 : 40;
    const gap = 6;
    const textW = (row: Row): number => w - (row.icon ? iconSize + 12 : 8) - 8;
    const measure = (str: string, width: number): number => {
      const t = this.add.text(0, 0, str, { fontFamily: FONT, fontSize: '11px', wordWrap: { width } });
      const hh = t.height;
      t.destroy();
      return hh;
    };
    const heights = rows.map((row) => Math.max(48, 20 + measure(row.text, textW(row)) + (row.big ? kataLines(row.status, textW(row)) * KATA_LINE : measure(row.status, textW(row))) + 6));
    const avail = h - 34;
    const pageStarts: number[] = [0];
    let used = 0;
    heights.forEach((hh, i) => {
      if (used > 0 && used + hh > avail) {
        pageStarts.push(i);
        used = 0;
      }
      used += hh + gap;
    });
    const pages = pageStarts.length;
    this.page = Math.min(this.page, pages - 1);
    const from = pageStarts[this.page];
    const to = pageStarts[this.page + 1] ?? rows.length;
    let by = y;
    rows.slice(from, to).forEach((row, k) => {
      const boxH = heights[from + k];
      this.ui.add(this.add.rectangle(x, by, w, boxH, row.unlocked ? 0x221d2e : 0x18151f).setOrigin(0).setStrokeStyle(2, row.color, row.unlocked ? 0.8 : 0.25));
      const c = row.unlocked ? '#ffffff' : '#6b6478';
      const icon = row.icon ? addIcon(this, row.icon, x + 6 + iconSize / 2, by + boxH / 2, iconSize) : null;
      if (icon) this.ui.add(icon.setAlpha(row.unlocked ? 1 : 0.35));
      const tx = icon ? x + iconSize + 12 : x + 8;
      const tw = textW(row);
      this.oneLine(this.text(tx, by + 4, `${row.unlocked ? '' : '🔒 '}${row.tag}: ${row.title}`, 13, row.unlocked ? css(row.color) : '#8a8296', true), tw, 10);
      const desc = this.text(tx, by + 20, row.text, 11, c, false, FONT, tw);
      if (row.big) this.kataSteps(tx, desc.y + desc.height + 2, row.status, tw);
      else this.text(tx, desc.y + desc.height, row.status, 11, row.unlocked ? '#b9ad99' : '#ffd166', false, FONT, tw);
      by += boxH + gap;
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
      // P-MENU-e: one pop when the tab opens, then still (no endless blinking).
      if (!reducedMotion()) {
        chip.setScale(0.9);
        this.tweens.add({ targets: chip, scale: 1, duration: MOTION.pop.ms, ease: MOTION.pop.ease });
      }
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
    // P-MENU-e: the sundial and the Seal sit on two equal rounded cards.
    const cards = this.add.graphics();
    for (const cx of [x, x + half + S1]) {
      cards.fillStyle(0x221d2e, 0.6).fillRoundedRect(cx - 6, sy - sr - 8, half - S1 - 2, sr * 2 + 16, RADIUS.panel);
      cards.lineStyle(2, 0x3a3150).strokeRoundedRect(cx - 6, sy - sr - 8, half - S1 - 2, sr * 2 + 16, RADIUS.panel);
    }
    this.ui.add(cards);
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
    const panelBottom = y + h;
    // Worn gear: one rounded card per slot. K32: 40 px icon top-left with the slot and stats
    // beside it; long names wrap to two lines (no ellipsis) under it. The row is a fixed
    // GEAR.wornH tall so the bag grid's y never moves when worn names change (e.g. after Wear).
    const slotW = (w - 16) / 3;
    const boxH = GEAR.wornH;
    const worn = GEAR_SLOTS.map((slot, i) => {
      const item = wornItem(this.profile, slot);
      const bx = x + i * (slotW + 8);
      const c = this.add.container(bx + slotW / 2, y);
      this.ui.add(c);
      const g = this.add.graphics();
      c.add(g);
      const add = <T extends Phaser.GameObjects.GameObject>(o: T): T => {
        (o as unknown as { x: number }).x -= bx + slotW / 2;
        (o as unknown as { y: number }).y -= y;
        this.ui.remove(o);
        c.add(o);
        return o;
      };
      const icon = item ? addGearIcon(this, item, bx + 6 + GEAR.wornIcon / 2, y + 6 + GEAR.wornIcon / 2, GEAR.wornIcon) : null;
      if (icon) add(icon);
      const tx = icon ? bx + 12 + GEAR.wornIcon : bx + 8;
      const tw = slotW - (tx - bx) - 6;
      add(this.text(tx, y + 6, SLOT_NAME[slot], TYPE.label, '#b9ad99'));
      if (item) add(this.oneLine(this.text(tx, y + 24, describeItem(item), 11, '#f2e9d8'), tw, 9));
      add(this.twoLines(this.text(bx + 8, y + 50, item ? item.name : 'Nothing', 12, item ? css(RARITY_COLOR[item.rarity]) : '#6b6478', true, FONT, slotW - 16), slotW - 16, 11));
      // B-GEAR-BUG: a worn card is a button too, so worn gear can be taken off (it isn't in the bag).
      if (item) {
        const b = button(this, { x: bx, y, w: slotW, h: boxH, label: '', color: 0x221d2e, size: 12, stroke: RARITY_COLOR[item.rarity], onTap: () => this.pick(item.uid) }, this.ui);
        this.ui.remove(c);
        b.visual.add(c.setPosition(0, -boxH / 2));
      }
      return { slot, c, g, stroke: item ? RARITY_COLOR[item.rarity] : 0x3a3150, item };
    });
    for (const s of worn) {
      this.wornCards[s.slot] = { c: s.c, w: slotW, h: boxH };
      if (s.item) continue; // drawn by its button
      s.g.fillStyle(0x221d2e).fillRoundedRect(-slotW / 2, 0, slotW, boxH, RADIUS.panel);
      s.g.lineStyle(2, s.stroke).strokeRoundedRect(-slotW / 2, 0, slotW, boxH, RADIUS.panel);
    }
    y += boxH + S2;
    // B-GEAR-BUG: the picked item may be worn (from the worn row), so look in the whole bag.
    const selected = this.pickedItem();

    const bag = this.profile.inventory
      .filter((it) => this.profile.equipped[it.slot] !== it.uid)
      .sort((a, b) => GEAR_SLOTS.indexOf(a.slot) - GEAR_SLOTS.indexOf(b.slot) || gearScore(b) - gearScore(a));
    if (bag.length === 0) {
      // P-MENU-d: a faint bag drawn in code above the same words, centred in the space left.
      // B-POLISH-1: hidden while a worn-item sheet is open, so it doesn't show faintly behind it.
      if (showEmptyBagHint(bag.length, !!selected)) {
        const midY = (y + panelBottom) / 2;
        this.ui.add(bagIcon(this, x + w / 2, midY - 26));
        this.text(x + w / 2, midY + 6, 'Your bag is empty. Items you find in the Tower appear here.', TYPE.body, '#b9ad99', false, FONT, w - 32).setOrigin(0.5, 0).setAlign('center');
      }
      if (selected) this.renderSheet(selected, x, y - boxH - S2, w, panelBottom, -1);
      return;
    }

    // P-MENU-d: the grid never depends on the picked card; the sheet lays over it.
    const cols = 2;
    const { perPage } = gearGrid(panelBottom - y, cols);
    const pages = Math.max(1, Math.ceil(bag.length / perPage));
    this.page = Math.min(this.page, pages - 1);
    const cardW = (w - GEAR.gap) / cols;
    const grid = this.add.container(0, 0);
    this.ui.add(grid);
    this.gearGridBox = grid;
    let pickedBottom = -1;

    bag.slice(this.page * perPage, (this.page + 1) * perPage).forEach((it, i) => {
      const bx = x + (i % cols) * (cardW + GEAR.gap);
      const by = y + Math.floor(i / cols) * (GEAR.cardH + GEAR.gap);
      const isSel = it.uid === this.selected;
      if (isSel) pickedBottom = by + GEAR.cardH;
      // #228 press style: the shared rounded button (0.96 press, soft tap, no pick on slide-on).
      const b = button(this, { x: bx, y: by, w: cardW, h: GEAR.cardH, label: '', color: isSel ? 0x3a3150 : 0x221d2e, size: 12, stroke: RARITY_COLOR[it.rarity], selected: isSel, onTap: () => this.pick(it.uid) }, grid);
      b.visual.setData('uid', it.uid);
      const lx = -cardW / 2;
      const icon = addGearIcon(this, it, 0, 0, 36);
      if (icon) b.visual.addAt(icon.setPosition(lx + 8 + 18, 0), 2);
      const cmp = compareGear(it, wornItem(this.profile, it.slot));
      const markColor = cmp === 'up' ? 0x3aa57a : cmp === 'down' ? 0xc0453a : 0x5a5468;
      const mx = cardW / 2 - 8 - 14;
      b.visual.add(this.add.circle(mx, 0, 14, markColor));
      b.visual.add(this.add.text(mx, 0, cmp === 'up' ? '▲' : cmp === 'down' ? '▼' : '=', { fontFamily: FONT, fontSize: '13px', color: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5).setResolution(crisp()));
      const tx = lx + 8 + 36 + 8;
      const tw = mx - 14 - 6 - tx;
      const nm = this.oneLine(this.add.text(tx, -2, it.name, { fontFamily: FONT, fontSize: `${TYPE.body}px`, color: css(RARITY_COLOR[it.rarity]), fontStyle: 'bold' }).setOrigin(0, 1).setResolution(crisp()), tw, 10);
      const st = this.oneLine(this.add.text(tx, 2, `${SLOT_NAME[it.slot]} · ${describeItem(it)}`, { fontFamily: FONT, fontSize: `${TYPE.label}px`, color: '#f2e9d8' }).setResolution(crisp()), tw, 9);
      b.visual.add([nm, st]);
    });

    // Paging: 44 x 56 arrows with one 8 pt dot per page between them (the current one gold).
    const pagerY = panelBottom - GEAR.pagerH;
    if (pages > 1) {
      const prev = button(this, { x, y: pagerY, w: GEAR.arrowW, h: GEAR.pagerH, label: '◀', color: 0x2a2536, size: 17, disabled: this.page === 0, onTap: () => this.turn(-1) }, this.ui);
      const next = button(this, { x: x + w - GEAR.arrowW, y: pagerY, w: GEAR.arrowW, h: GEAR.pagerH, label: '▶', color: 0x2a2536, size: 17, disabled: this.page >= pages - 1, onTap: () => this.turn(1) }, this.ui);
      void prev;
      void next;
      const room = w - 2 * GEAR.arrowW - 2 * S2;
      const dots = pageDots(pages, room);
      const left = x + GEAR.arrowW + S2;
      if (dots) {
        const g = this.add.graphics();
        for (let p = 0; p < pages; p++) g.fillStyle(p === this.page ? 0xffd166 : 0x5a5468).fillCircle(left + dots.x0 + p * dots.step, pagerY + GEAR.pagerH / 2, GEAR.dot / 2);
        this.ui.add(g);
      } else this.text(x + w / 2, pagerY + GEAR.pagerH / 2, `${this.page + 1} / ${pages}`, TYPE.label, '#b9ad99').setOrigin(0.5);
    }

    if (selected) this.renderSheet(selected, x, y - boxH - S2, w, panelBottom, pickedBottom);
  }

  /**
   * P-MENU-d: the detail sheet. It slides up over the bottom of the panel (over the top when
   * the picked card is in the bottom rows, so the card stays in view). Tapping outside closes it.
   */
  private renderSheet(item: GearItem, x: number, top: number, w: number, bottom: number, pickedBottom: number): void {
    const sh = GEAR.sheetH;
    const atTop = pickedBottom > bottom - sh;
    const sy = atTop ? top : bottom - sh;
    const closer = this.add.zone(x - 8, top - 8, w + 16, bottom - top + 16).setOrigin(0).setInteractive();
    closer.on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, () => this.closeSheet());
    this.ui.add(closer);
    const sheet = this.add.container(0, 0);
    this.ui.add(sheet);
    this.sheet = sheet;
    const bg = this.add.graphics();
    bg.fillStyle(0x2a2340, 0.98).fillRoundedRect(x, sy, w, sh, RADIUS.panel);
    bg.lineStyle(2, RARITY_COLOR[item.rarity], 0.9).strokeRoundedRect(x, sy, w, sh, RADIUS.panel);
    // Swallow taps on the sheet itself so they don't close it.
    const block = this.add.zone(x, sy, w, sh).setOrigin(0).setInteractive();
    sheet.add([bg, block]);
    const pad = 12;
    const half = (w - 3 * pad) / 2;
    // Row 1: the item and "Now wearing", side by side; each stays on one line (… when long).
    const mini = (mx: number, it: GearItem | null, head: string) => {
      const ic = it ? addGearIcon(this, it, mx + 16, sy + pad + 18, 32) : null;
      if (ic) sheet.add(ic);
      const tx = ic ? mx + 38 : mx;
      const tw = half - (tx - mx);
      const t1 = this.oneLine(this.add.text(tx, sy + pad, head, { fontFamily: FONT, fontSize: `${TYPE.label}px`, color: '#b9ad99' }).setResolution(crisp()), tw, 10);
      const t2 = this.oneLine(this.add.text(tx, sy + pad + 15, it ? it.name : 'Nothing', { fontFamily: FONT, fontSize: `${TYPE.body}px`, fontStyle: 'bold', color: it ? css(RARITY_COLOR[it.rarity]) : '#6b6478' }).setResolution(crisp()), tw, TYPE.label);
      sheet.add([t1, t2]);
      if (it) sheet.add(this.oneLine(this.add.text(tx, sy + pad + 33, describeItem(it), { fontFamily: FONT, fontSize: '11px', color: '#f2e9d8' }).setResolution(crisp()), tw, 9));
    };
    const now = wornItem(this.profile, item.slot);
    mini(x + pad, item, `${rarityName(item.rarity)} ${SLOT_NAME[item.slot]}`);
    mini(x + 2 * pad + half, now, 'Now wearing');
    // Row 2: Wear (green, wide) and Let go (quieter). Let go asks again here.
    const by = sy + sh - pad - 44;
    if (!this.confirmLetGo) {
      if (now?.uid === item.uid) button(this, { x: x + pad, y: by, w: half + 40, h: 44, label: 'Take off', color: 0x3a5f8a, size: 16, onTap: () => this.takeOff(item) }, sheet);
      else button(this, { x: x + pad, y: by, w: half + 40, h: 44, label: 'Wear', color: 0x3aa57a, size: 16, onTap: () => this.wear(item) }, sheet);
      button(this, { x: x + 2 * pad + half + 40, y: by, w: half - 40, h: 44, label: 'Let go', color: 0x3a3448, size: TYPE.body, labelColor: '#e8b4b4', onTap: () => this.letGo(item) }, sheet);
    } else {
      const bw = Math.min(100, (w - 4 * pad) / 3);
      const q = this.add.text(x + pad, by + 22, 'Let it go?', { fontFamily: FONT, fontSize: `${TYPE.body}px`, fontStyle: 'bold', color: '#ffd166' }).setOrigin(0, 0.5).setResolution(crisp());
      sheet.add(q);
      button(this, { x: x + w - pad - 2 * bw - 8, y: by, w: bw, h: 44, label: 'Yes', color: 0x8a2a35, size: 15, onTap: () => this.letGo(item) }, sheet);
      button(this, { x: x + w - pad - bw, y: by, w: bw, h: 44, label: 'Keep', color: 0x3aa57a, size: 15, onTap: () => { this.confirmLetGo = false; this.renderPanel('none'); } }, sheet);
    }
    if (this.sheetOpening) {
      this.sheetOpening = false;
      const rm = reducedMotion();
      sheet.setAlpha(rm ? 0 : 1).setY(rm ? 0 : atTop ? -12 : sh);
      this.tweens.add({ targets: sheet, y: 0, alpha: 1, duration: rm ? MOTION.reducedFade.ms : MOTION.sheet.ms, ease: rm ? 'Linear' : MOTION.sheet.ease });
    }
  }

  private pickedItem(): GearItem | null {
    return this.profile.inventory.find((it) => it.uid === this.selected) ?? null;
  }

  private pick(uid: string): void {
    if (this.selected === uid) return this.closeSheet();
    this.sheetOpening = this.selected === null;
    this.selected = uid;
    this.confirmLetGo = false;
    this.renderPanel('none'); // the grid itself never moves
  }

  private closeSheet(): void {
    const sheet = this.sheet;
    this.selected = null;
    this.confirmLetGo = false;
    if (!sheet || !sheet.active || reducedMotion()) return this.renderPanel('none');
    this.input.enabled = false;
    this.tweens.add({ targets: sheet, alpha: 0, y: 24, duration: MOTION.sheet.outMs, ease: MOTION.sheet.outEase, onComplete: () => {
      this.input.enabled = true;
      this.renderPanel('none');
    } });
  }

  // ---------------------------------------------------------------- actions

  private enterTower(): void {
    // Today's play time is used up: back to the dojo, whose door says it's resting (M7-P9).
    if (isPlayTimeUp(this.profile)) return this.goTo('Dojo', {});
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
    if (BETA) return; // B-SAFE: no hidden testing screen in beta builds.
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
    this.renderTabs(true);
    this.renderPanel('tab');
  }

  private turn(by: number): void {
    this.page = Math.max(0, this.page + by);
    this.selected = null;
    this.renderPanel(by > 0 ? 'pageNext' : 'pagePrev');
  }

  private wear(item: GearItem): void {
    equip(this.profile, item.uid);
    writeSave(this.profile);
    sfx.insight();
    this.selected = null;
    this.confirmLetGo = false;
    this.renderPanel('none');
    // P-MENU-d: the slot card pops with a short gold flash; the re-sorted bag fades in (180 ms).
    const slot = this.wornCards[item.slot];
    if (this.gearGridBox) {
      this.gearGridBox.setAlpha(0);
      this.tweens.add({ targets: this.gearGridBox, alpha: 1, duration: reducedMotion() ? MOTION.reducedFade.ms : MOTION.swap.ms });
    }
    if (!slot || reducedMotion()) return;
    const flash = this.add.graphics();
    flash.fillStyle(0xffd166, 0.55).fillRoundedRect(-slot.w / 2, 0, slot.w, slot.h, RADIUS.panel);
    slot.c.add(flash);
    slot.c.setScale(0.9);
    this.tweens.add({ targets: slot.c, scale: 1, duration: MOTION.pop.ms, ease: MOTION.pop.ease });
    this.tweens.add({ targets: flash, alpha: 0, duration: 360, onComplete: () => flash.destroy() });
  }

  /** B-GEAR-BUG: take worn gear off; it goes back into the bag. */
  private takeOff(item: GearItem): void {
    unequip(this.profile, item.slot);
    writeSave(this.profile);
    this.selected = null;
    this.confirmLetGo = false;
    this.renderPanel('none');
  }

  private letGo(item: GearItem): void {
    if (!this.confirmLetGo) {
      this.confirmLetGo = true;
      this.renderPanel('none');
      return;
    }
    letGo(this.profile, item.uid);
    writeSave(this.profile);
    this.selected = null;
    this.confirmLetGo = false;
    this.renderTabs(false); // the Gear (n) count changed
    this.renderPanel('none');
  }

  // ---------------------------------------------------------------- helpers

  /**
   * S3-P1b: a kata's steps, each the step number (bold 13px) followed by its arrow(s) drawn as
   * thick shapes as tall as the number, so they never shrink to dots. Wraps by step.
   */
  private kataSteps(x: number, y: number, line: string, width: number): void {
    const g = this.add.graphics();
    this.ui.add(g);
    for (const c of kataLayout(line, width)) {
      this.text(x + c.x, y + c.y + 2, c.n, 13, '#ffffff', true);
      c.arrows.forEach((d, k) => drawArrow(g, x + c.x + numW(c.n) + k * KATA_ARROW_W + KATA_ARROW_W / 2, y + c.y + 11, d));
    }
  }

  private text(x: number, y: number, str: string, size: number, color: string, bold = false, family = FONT, wrap?: number): Phaser.GameObjects.Text {
    const t = this.add
      .text(x, y, str, { fontFamily: family, fontSize: `${size}px`, color, fontStyle: bold ? 'bold' : 'normal', wordWrap: wrap ? { width: wrap } : undefined })
      .setResolution(crisp());
    this.ui.add(t);
    return t;
  }

  /**
   * Keeps a text on one line inside maxW: shrinks the font (not below minSize), then
   * cuts the end with "…". Narrow phones (667 wide) would otherwise wrap names onto the line below.
   */
  /** K32: a wrapped text shrinks (down to minSize) until it fits in two lines and no word runs past maxW. */
  private twoLines(t: Phaser.GameObjects.Text, maxW: number, minSize: number): Phaser.GameObjects.Text {
    let size = parseInt(String(t.style.fontSize), 10);
    const fits = () => t.width <= maxW + 0.5 && t.getWrappedText().length <= 2;
    while (!fits() && size > minSize) t.setFontSize(--size);
    // Still more than two lines at the smallest size: keep two lines and end with "…".
    if (t.getWrappedText().length > 2) {
      const words = t.text.split(' ');
      while (words.length > 1 && t.getWrappedText().length > 2) { words.pop(); t.setText(words.join(' ') + '…'); }
    }
    return t;
  }

  private oneLine(t: Phaser.GameObjects.Text, maxW: number, minSize: number): Phaser.GameObjects.Text {
    let size = parseInt(String(t.style.fontSize), 10);
    while (t.width > maxW && size > minSize) t.setFontSize(--size);
    if (t.width > maxW) {
      const full = t.text;
      let n = full.length;
      while (n > 1 && t.width > maxW) t.setText(full.slice(0, --n).trimEnd() + '…');
    }
    return t;
  }

  private button(x: number, y: number, w: number, h: number, label: string, color: number, size: number, onTap: () => void): void {
    button(this, { x, y, w, h, label, color, size, onTap }, this.ui);
  }
}

/** P-MENU-d: a faint bag drawn in code (no art file): body, flap and drawstring. */
function bagIcon(scene: Phaser.Scene, x: number, y: number): Phaser.GameObjects.Graphics {
  const g = scene.add.graphics({ x, y }).setAlpha(0.35);
  g.fillStyle(0x8a7a5c).fillRoundedRect(-18, -10, 36, 30, 10);
  g.fillStyle(0x6b5d45).fillRoundedRect(-12, -18, 24, 12, 5);
  g.lineStyle(2, 0xd8c8a0).lineBetween(-12, -8, 12, -8);
  g.lineStyle(2, 0xd8c8a0).strokeCircle(0, -22, 4);
  return g;
}

/** A tiny treasure chest drawn in code (no art file): lid, box, band and lock. */
function chestIcon(scene: Phaser.Scene, x: number, y: number, color: number): Phaser.GameObjects.Graphics {
  const g = scene.add.graphics({ x, y });
  g.fillStyle(0x8a5a35).fillRoundedRect(-10, -8, 20, 7, { tl: 4, tr: 4, bl: 0, br: 0 });
  g.fillStyle(0x6b4428).fillRect(-10, -1, 20, 10);
  g.lineStyle(2, color).strokeRoundedRect(-10, -8, 20, 17, 3).lineBetween(-10, -1, 10, -1);
  g.fillStyle(color).fillRect(-2, -3, 4, 5);
  return g;
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

/** S3-P1b kata step layout, in screen points. */
/** Room for the step number: about 8 points a digit plus a gap. */
const numW = (n: string): number => 10 + 8 * n.length;
const KATA_ARROW_W = 16;
const KATA_GAP = 10;
const KATA_LINE = 22;
const GLYPH_DIR: Record<string, 'up' | 'down' | 'left' | 'right'> = { '↑': 'up', '↓': 'down', '←': 'left', '→': 'right' };
interface KataCell {
  n: string;
  arrows: Array<'up' | 'down' | 'left' | 'right'>;
  x: number;
  y: number;
}
/** Lays out kataArrows' text ("1 ←   2 →") step by step, wrapping at width. */
function kataLayout(line: string, width: number): KataCell[] {
  let x = 0;
  let y = 0;
  return line.split(/\s{3}/).filter(Boolean).map((c) => {
    const [n, a = ''] = c.trim().split(/\s+/);
    const arrows = [...a].map((ch) => GLYPH_DIR[ch]).filter(Boolean);
    const w = numW(n) + arrows.length * KATA_ARROW_W;
    if (x > 0 && x + w > width) {
      x = 0;
      y += KATA_LINE;
    }
    const cell = { n, arrows, x, y };
    x += w + KATA_GAP;
    return cell;
  });
}
function kataLines(line: string, width: number): number {
  const cells = kataLayout(line, width);
  return cells.length ? cells[cells.length - 1].y / KATA_LINE + 1 : 1;
}
/** A thick arrow about 14 points long centred on (cx, cy). */
function drawArrow(g: Phaser.GameObjects.Graphics, cx: number, cy: number, d: 'up' | 'down' | 'left' | 'right'): void {
  const r = 7;
  const [dx, dy] = d === 'up' ? [0, -1] : d === 'down' ? [0, 1] : d === 'left' ? [-1, 0] : [1, 0];
  const [px, py] = [-dy, dx];
  g.lineStyle(3, 0x9fd3ff, 1).lineBetween(cx - dx * r, cy - dy * r, cx + dx * (r - 4), cy + dy * (r - 4));
  g.fillStyle(0x9fd3ff, 1).fillTriangle(cx + dx * r, cy + dy * r, cx + dx * (r - 6) + px * 5, cy + dy * (r - 6) + py * 5, cx + dx * (r - 6) - px * 5, cy + dy * (r - 6) - py * 5);
}
