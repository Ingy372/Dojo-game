import Phaser from 'phaser';
import { button } from '../ui/button';
import { GATE, GEAR, MOTION, RADIUS, S1, S2, S3, TYPE, XP_FILL, pageDots, panelSwap, xpFillFrom, gateLockR, BOARD, abilitiesSwitch, type AbilitiesPart, type PanelChange } from '../ui/tokens';
import { reducedMotion } from '../game/motion';
import playTimeText from '../../../../content/settings/play-time.json';
import {
  BLESSING,
  GEAR_SLOTS,
  RARITIES,
  describeItem,
  describeVirtue,
  effectiveLevel,
  equip,
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
  sealBell,
  newTrophies,
  xpToNext,
  type GearItem,
  type GearSlot,
  type Profile,
  type RequirementStatus,
  type TrainingState,
  kataArrows,
} from '@dojo/sim';
import { sfx } from '../audio/Sfx';
import { BOARD_PAPER, KATA_INK, MIN_TAP, TROPHY_UI, cubbyIconSize, cubbyTextW, unlockPopScales, type KataInk } from '../ui/tokens';
import { STYLE_WORDS, buildStyle, trayDots, trayPage, trayPaging, equipPick, styleLayout, type StyleModel, type StylePick, type StyleSlot } from '../ui/fightingStyle';
import { LASTRUN_WORDS, LASTRUN_MOTION, bestsRows as lastRunBests, buildLastRun, countAt, foundPage, lastRunLayout, newForYou, runId, takeCountUp, type FoundTile, type KeyStore } from '../ui/lastRun';
import { TROPHY_WORDS, buildCubbies, shelfRows, trophyLayout, trophyPages, type Cubby } from '../ui/trophyCase';
import { ARROW, COMPARE_COLOR, COMPARE_CSS, GEAR_BOARD, GEAR_WORDS, compareWith, tileWForLabel, filterBag, gearBoardLayout, slotEmptyLine, tileBox, toggleFilter } from '../ui/gearBoard';
import { CONTENT, KATAS } from '../game/content';
import { loadSave, writeSave } from '../game/save';
import { currentTraining, selectProfile, shortDate } from '../game/student';
import { hex } from '../ui/belt';
import { startTowerRun } from '../game/tower';
import { isPlayTimeUp } from '../game/playTime';
import { addIcon, ICON_PACK } from '../art/icons';
import { addGearIcon, loadGearIcons } from '../art/gearIcons';
import { loadArt } from '../art/art';
import { hasMenu2, menu2Fit, menu2Frames, menu2Image, menu2Slice, setMenu2, skinButton, woodSkin, HONEY_INK } from '../art/menu2';
import { MENU2_PACK, artRarity } from '../art/menu2Frames';
import { makeStandingCharacter } from '../art/player';
import { loadLook, playerPacks } from '../game/look';
import { Celebrations } from '../ui/Celebrations';
import { GoalsCard } from '../ui/GoalsCard';
import { localDay, takeLesson } from '../game/lessons';
import { TestingPanel } from '../ui/TestingPanel';
import { BETA } from '../game/beta';
import { FONT, GRADE_COLOR, RARITY_COLOR, rarityName, crisp, css, view, hiDpi, WOOD } from '../ui/theme';
import type { GameSceneData } from './GameScene';

/** How Home was opened: after a run (cleared, lost, or rested at the play limit) the next goals may show. */
export interface HomeSceneData {
  fromRun?: boolean;
}

const SLOT_NAME: Record<GearSlot, string> = { hands: 'Hands', gi: 'Gi', charm: 'Charm' };
const KIND_MARK: Record<string, string> = { rest: '+' };

type Tab = 'run' | 'gear' | 'abilities' | 'gate';
/**
 * The training board (opened from the notice board in the Home Dojo): the character with
 * their real belt, level and Blessing, the Path card, starting a run, the last run's
 * summary, gear, abilities, and the Gate.
 */
/** P-MENU2-i: the A-MENU2 stat icons (Rooms has none, so it shows its number only). */
/** QA: rarity words on the paper tiles, darkened to at least 4.5:1 on the paper (#efe0c4). */
const RARITY_INK: Record<GearItem['rarity'], string> = { common: '#6b5a48', uncommon: '#245a24', rare: '#174a7d', epic: '#5e2696', legendary: '#8a4a12' };
/** QA: the painted wood rim of the stat tile at k 0.5 (12 of its 32 @2x slice px; half at k 0.25), and the space kept inside it. */
const STAT_RIM = 6;
const STAT_PAD = S2;
const STAT_ICON: Record<string, string | undefined> = { perfects: 'stat-perfect', combo: 'stat-combo', time: 'stat-clock', xp: 'stat-xp' };

/** A-MENU2: only the Black belt gets the full knot sheen. */
const isBlack = (c: number): boolean => ((c >> 16) & 255) < 48 && ((c >> 8) & 255) < 48 && (c & 255) < 48;

export class HomeScene extends Phaser.Scene {
  private profile!: Profile;
  private training!: TrainingState;
  private tab: Tab = 'run';
  /** P-MENU2-a: which part of Abilities is showing. */
  private part: AbilitiesPart = 'trophy';
  /** P-MENU2-e: the chosen Fighting Style slot (tap 1 of 2). */
  private styleSlot: StyleSlot = 'stance';
  /** B-POLISH-2: which page of the tray is showing (reset when the slot changes). */
  private trayPageNo = 0;
  /** P-MENU2-b: the open cubby sheet, and how many Trophy Case pages there are. */
  private cubbySheet: Phaser.GameObjects.Container | null = null;
  trophyPages = 1;
  private page = 0;
  /** The bag item being looked at, if any. */
  private selected: string | null = null;
  private confirmLetGo = false;
  /** P-MENU-d: the gear detail sheet and what Wear pops. */
  private sheet: Phaser.GameObjects.Container | null = null;
  private sheetOpening = false;
  /** P-MENU2-f: the bag filter (null = everything), the Details toggle, and where rings/tiles are (for the wear flight). */
  private gearFilter: GearSlot | null = null;
  private gearDetails = false;
  private gearRings: Partial<Record<GearSlot, { visual: Phaser.GameObjects.Container; x: number; y: number; icon: Phaser.GameObjects.Image | null }>> = {};
  private gearTiles: Record<string, { x: number; y: number }> = {};
  private gearDollGlow: Phaser.GameObjects.Ellipse | null = null;
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
  /** P-MENU2-i: the code-drawn panel frame, hidden while the panel-frame art is drawn. */
  private codeFrame: Phaser.GameObjects.Graphics | null = null;
  private tabBox = { rx: 0, y: 0, tabW: 0 };
  private testing: TestingPanel | null = null;
  private celebrating = false;
  /** Times the title was tapped recently (5 quick taps open the hidden testing screen). */
  private titleTaps: number[] = [];
  /** Came here straight from a run, and the next goals haven't been considered yet. */
  private fromRun = false;
  private firstFloorDone = false;
  /** P-MENU2-g: the Found strip's page, and whether this view counted up (test hook). */
  private foundPageNo = 0;
  lastRunCounted = false;

  constructor() {
    super('Home');
  }

  preload(): void {
    loadArt(this, [...playerPacks(), ICON_PACK, MENU2_PACK]);
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
    const moments = rewardMoments(this.profile.seen, this.training, CONTENT.abilities.stances[0].name);
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
    this.codeFrame = woodFrame(this, rx, top, rw, panelH);
    this.ui.add(this.codeFrame);
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
      const b = button(this, { x: rx + i * (tabW + 6), y: pad, w: tabW, h: 34, label, color: this.tab === tab ? 0x4a3f63 : 0x2a2536, size: 14, onTap: () => this.setTab(tab) }, this.ui);
      woodSkin(this, b, tabW, 34, { dim: this.tab !== tab });
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
      this.cubbySheet = null;
    }
    const panel = this.add.container(0, 0);
    this.panel = panel;
    this.ui = panel;
    const { rx, top, rw, panelH } = this.panelBox;
    this.panelFrameArt(rx, top, rw, panelH);
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


  /**
   * P-MENU2-g: the Last run "Scroll of the Climb". A paper scroll (rolled wood ends drawn in
   * code): a banner in kind words with Bests, room chips, stat tiles that count up once per run,
   * an XP fill, the Found strip (every tile opens its sheet), "Always with you", "New for you"
   * (only when there is one) and a big Again! button. Positions come from lastRunLayout().
   */
  private renderRun(x: number, y: number, w: number, h: number): void {
    const g = this.add.graphics();
    g.fillStyle(WOOD.paper).fillRoundedRect(x - 4, y + 2, w + 8, h - 4, RADIUS.panel);
    g.lineStyle(2, WOOD.grain, 0.8).strokeRoundedRect(x - 4, y + 2, w + 8, h - 4, RADIUS.panel);
    // The rolled ends: two wooden rods with knobs.
    for (const ry of [y - 2, y + h - 6]) {
      g.fillStyle(WOOD.frame).fillRoundedRect(x - 8, ry, w + 16, 8, 4);
      g.fillStyle(WOOD.frameDark).fillCircle(x - 8, ry + 4, 5).fillCircle(x + w + 8, ry + 4, 5);
    }
    this.ui.add(g);
    const last = this.profile.lastRun;
    const cx0 = x + S2;
    const cy0 = y + 6 + S1;
    const cw = w - 2 * S2;
    const ch = h - 2 * (6 + S1);
    if (!last) {
      this.text(cx0, cy0 + S2, LASTRUN_WORDS.none, TYPE.body, WOOD.ink, true, FONT, cw - 96 - S2);
      woodSkin(this, button(this, { x: cx0 + cw - 96, y: cy0, w: 96, h: MIN_TAP, label: LASTRUN_WORDS.bests, color: WOOD.switchOn, size: TYPE.body, onTap: () => this.openBests() }, this.ui), 96, MIN_TAP);
      return;
    }
    const m = buildLastRun(last, playTimeText.homeHeadline);
    const L = lastRunLayout(cw, ch, m.chips.length, m.stats.length, m.found.length);
    const X = (v: number) => cx0 + v;
    const Y = (v: number) => cy0 + v;
    const count = takeCountUp(safeStore(), runId(this.profile), reducedMotion());
    this.lastRunCounted = count;

    // Banner: the result in kind words, gold for a clear.
    const head = this.text(X(0), Y(L.banner.h / 2), m.headline, TYPE.heading, m.cleared ? '#a0522d' : WOOD.ink, true).setOrigin(0, 0.5);
    this.oneLine(head, L.banner.w, TYPE.body);
    // P-MENU2-i: the honey title plaque behind the headline (dark ink on it); 12 px caps of padding.
    const ph = Math.min(40, L.banner.h);
    const plaque = menu2Slice(this, 'title-plaque', X(0) - 12, Y(L.banner.h / 2) - ph / 2, head.width + 24, ph, 'height');
    if (plaque) {
      this.ui.addAt(plaque, this.ui.getIndex(head));
      head.setColor(HONEY_INK);
    }
    woodSkin(this, button(this, { ...L.bests, x: X(L.bests.x), y: Y(L.bests.y), label: LASTRUN_WORDS.bests, color: WOOD.switchOn, size: TYPE.body, onTap: () => this.openBests() }, this.ui), L.bests.w, L.bests.h);

    // Room chips: grade, a drawn chest for treasure, or a mark.
    m.chips.forEach((r, i) => {
      const s = L.chip;
      const px = X(i * L.chipStep);
      const py = Y(L.chipsY);
      const color = r.grade ? GRADE_COLOR[r.grade] : '#7a5a3a';
      const chip = this.add.graphics();
      chip.fillStyle(WOOD.frameDark).fillRoundedRect(px, py, s, s, 6);
      chip.lineStyle(2, r.kind === 'treasure' && !r.grade ? 0xffd166 : Phaser.Display.Color.HexStringToColor(color).color).strokeRoundedRect(px, py, s, s, 6);
      this.ui.add(chip);
      if (r.kind === 'treasure' && !r.grade) this.ui.add(chestIcon(this, px + s / 2, py + s / 2, 0xffd166));
      else this.text(px + s / 2, py + s / 2, r.grade ?? KIND_MARK[r.kind] ?? '·', s >= 30 ? TYPE.title : TYPE.body, r.grade ? GRADE_COLOR[r.grade] : '#f2e3c4', true).setOrigin(0.5);
      if (count) {
        chip.setAlpha(0);
        this.tweens.add({ targets: chip, alpha: 1, delay: i * LASTRUN_MOTION.chipStepMs, duration: MOTION.reducedFade.ms });
      }
    });

    // Stat tiles: a big number over a 12 pt label; they count up once per run.
    const countDelay = m.chips.length * LASTRUN_MOTION.chipStepMs;
    L.tiles.forEach((b, i) => {
      const st = m.stats[i];
      // P-MENU2-i: the A-MENU2 stat tile (9-slice 16) with its icon at x 12; code tile if missing.
      // QA: short (44) tiles draw the rim at half size (k 0.25) so the label keeps 8 px inside it.
      const rim = b.h < 56 ? STAT_RIM / 2 : STAT_RIM;
      const tileArt = menu2Slice(this, 'stat-tile', X(b.x), Y(b.y), b.w, b.h, b.h < 56 ? 0.25 : 0.5);
      // On the paper tile the words are dark ink (white on wood stays for the code tile).
      const ink = tileArt ? { num: st.key === 'xp' ? '#245a80' : WOOD.ink, label: '#5a3e28' } : { num: st.key === 'xp' ? '#9ad1ff' : '#fff6e6', label: '#f2e3c4' };
      if (tileArt) {
        this.ui.add(tileArt);
        const iconArt = STAT_ICON[st.key];
        const is = Math.min(20, b.h / 3);
        const ic = iconArt && b.w >= 88 ? menu2Image(this, iconArt, X(b.x + S1 + 4 + is / 2), Y(b.y + S1 + TYPE.heading / 2 + 2), is, is) : null;
        if (ic) this.ui.add(ic);
      } else {
        const tg = this.add.graphics();
        tg.fillStyle(WOOD.frame).fillRoundedRect(X(b.x), Y(b.y), b.w, b.h, RADIUS.button);
        tg.lineStyle(2, WOOD.frameDark).strokeRoundedRect(X(b.x), Y(b.y), b.w, b.h, RADIUS.button);
        this.ui.add(tg);
      }
      // QA: on the short art tile the number steps down to 14 so it clears the padded label.
      const big = b.h >= 56 ? TYPE.heading : tileArt ? TYPE.body : TYPE.title;
      const num = this.text(X(b.x + b.w / 2), Y(b.y + S1), st.format(count ? 0 : st.value), big, ink.num, true).setOrigin(0.5, 0);
      num.setData('stat', st.key);
      // QA: on the art the label keeps 8 px inside the painted rim (bottom and sides).
      const inset = tileArt ? rim + STAT_PAD : S1 + 2;
      const lab = this.text(X(b.x + b.w / 2), Y(b.y + b.h - inset), st.label, TYPE.label, ink.label, true).setOrigin(0.5, 1);
      this.oneLine(lab, b.w - 2 * (tileArt ? rim + STAT_PAD : S2), TYPE.label);
      if (tileArt) {
        lab.setData('statLabel', st.key);
        tileArt.setData('statTile', st.key).setData('rim', rim);
      }
      if (count) {
        const v = { t: 0 };
        this.tweens.add({ targets: v, t: 1, delay: countDelay, duration: LASTRUN_MOTION.countMs, onUpdate: () => num.setText(st.format(countAt(st.value, v.t))), onComplete: () => num.setText(st.format(st.value)) });
      }
    });

    // XP fill toward the next level.
    const t = this.training;
    const level = effectiveLevel(this.profile, t);
    const atCap = level >= t.levelCap;
    const next = xpToNext(level, t.belts);
    const share = atCap ? 1 : Math.min(1, this.profile.xp / next);
    const from = m.levelsGained > 0 ? 0 : Math.max(0, share - (last.xp?.gained ?? 0) / next);
    const bar = this.add.graphics();
    this.ui.add(bar);
    // P-MENU2-i: the A-MENU2 bar (3-slice frame, fill tinted #f2c14e, gloss on top); code bar if missing.
    // QA: the rail is only 1 px taller than the bar each way, so it stays clear of the tiles above and Found / dots / New for you below.
    const railH = L.bar.h + 2;
    const railY = Y(L.bar.y) - 1;
    const frameArt = menu2Slice(this, 'xp-bar-frame', X(0), railY, cw, railH);
    frameArt?.setData('xpRail', true);
    const inset = (railH * 4) / 20;
    const fillH = (railH * 11) / 20;
    const fillArt = frameArt ? menu2Slice(this, 'xp-bar-fill', X(inset), railY + inset, cw - 2 * inset, fillH) : null;
    const glossArt = fillArt ? menu2Slice(this, 'xp-bar-gloss', X(inset), railY + inset, cw - 2 * inset, fillH) : null;
    if (frameArt && fillArt) {
      fillArt.setTint(atCap ? 0xffd166 : 0xf2c14e);
      this.ui.add([frameArt, fillArt, ...(glossArt ? [glossArt] : [])]);
    } else frameArt?.destroy();
    const drawBar = (s: number) => {
      if (frameArt?.active && fillArt) {
        const fw = Math.max(12, (cw - 2 * inset) * s);
        fillArt.setVisible(s > 0).setSize(fw * 2, fillArt.height);
        glossArt?.setVisible(s > 0).setSize(fw * 2, glossArt.height);
        return;
      }
      bar.clear();
      bar.fillStyle(WOOD.frameDark, 0.5).fillRoundedRect(X(0), Y(L.bar.y), cw, L.bar.h, L.bar.h / 2);
      if (s > 0) bar.fillStyle(atCap ? 0xffd166 : 0x4a90c2).fillRoundedRect(X(0), Y(L.bar.y), Math.max(L.bar.h, cw * s), L.bar.h, L.bar.h / 2);
    };
    if (count) {
      drawBar(from);
      const v = { s: from };
      this.tweens.add({ targets: v, s: share, delay: countDelay + LASTRUN_MOTION.countMs, duration: LASTRUN_MOTION.fillMs, ease: XP_FILL.ease, onUpdate: () => drawBar(v.s) });
    } else drawBar(share);

    // Found: every item and dojo piece from this run, each a 44+ tile that opens its sheet.
    this.text(X(0), Y(L.foundLabelY), LASTRUN_WORDS.found, TYPE.label, WOOD.ink, true);
    if (!m.found.length) this.text(X(0), Y(L.found.y + S1), LASTRUN_WORDS.foundNone, TYPE.label, '#7a5a3a', false, FONT, L.found.w);
    const fp = foundPage(m.found, L.foundPerPage, this.foundPageNo);
    this.foundPageNo = fp.page;
    if (L.arrows) {
      woodSkin(this, button(this, { x: X(L.found.x + L.found.w + S1), y: Y(L.found.y), w: MIN_TAP, h: MIN_TAP, label: '▶', color: WOOD.switchOff, size: TYPE.body, onTap: () => this.turnFound(1) }, this.ui), MIN_TAP, MIN_TAP);
      const d = pageDots(fp.pages, L.found.w + MIN_TAP - 64);
      if (d) for (let i = 0; i < fp.pages; i++) this.ui.add(this.add.circle(X(L.found.x + 64 + d.x0 + i * d.step), Y(L.foundLabelY + TYPE.label / 2 + 1), GEAR.dot / 2, i === fp.page ? 0xa8703f : WOOD.grain, i === fp.page ? 1 : 0.5).setData('foundDot', i));
    }
    fp.tiles.forEach((f, i) => {
      const s = L.foundTile;
      const fx = X(L.found.x + i * (s + S1));
      const fy = Y(L.found.y);
      const stroke = f.kind === 'item' ? RARITY_COLOR[f.item.rarity] : 0xffd166;
      const b = button(this, { x: fx, y: fy, w: s, h: s, label: '', color: WOOD.frameDark, size: TYPE.label, stroke, onTap: () => this.openFound(f) }, this.ui);
      b.visual.setData('found', f.kind === 'item' ? f.item.uid : f.id);
      // P-MENU2-i: the rarity found tile (52 tile in a 60 file); dojo pieces use the Rare (gold) frame.
      const foundArt = `found-tile-${f.kind === 'item' ? artRarity(f.item.rarity) : 'rare'}`;
      const fSkin = menu2Image(this, foundArt, 0, 0, (s * 60) / 52, (s * 60) / 52);
      if (fSkin) skinButton(this, b, fSkin, foundArt);
      if (f.kind === 'item') {
        const icon = addGearIcon(this, f.item, 0, 0, s - 12);
        if (icon) b.visual.add(icon);
        else b.visual.add(this.add.circle(0, 0, (s - 12) / 2, stroke, 0.8));
      } else b.visual.add(houseIcon(this, 0, 0, s - 16));
    });

    // Always with you: what's always on (shown, not picked).
    if (L.perAlways > 0) {
      this.text(X(0), Y(L.alwaysLabelY), LASTRUN_WORDS.always, TYPE.label, WOOD.ink, true);
      this.styleModel().always.slice(0, L.perAlways).forEach((a, i) => {
        const s = L.alwaysIcon;
        const ax = X(i * (s + S1));
        const ay = Y(L.alwaysY);
        const ag = this.add.graphics();
        ag.fillStyle(0xffd166, 0.35).fillRoundedRect(ax, ay, s, s, RADIUS.button);
        ag.lineStyle(2, 0xa8703f, 0.9).strokeRoundedRect(ax, ay, s, s, RADIUS.button);
        this.ui.add(ag);
        const icon = addIcon(this, a.id, ax + s / 2, ay + s / 2, s - 8);
        if (icon) this.ui.add(icon);
        else this.ui.add(this.add.star(ax + s / 2, ay + s / 2, 5, (s - 8) / 5, (s - 8) / 2.4, 0xffd166).setStrokeStyle(2, 0xa8703f));
      });
    }

    // New for you: the newest trophy not yet looked at, with a sparkle. Only when there is one.
    const fresh = newForYou(this.trophyCubbies(), this.profile.trophiesSeen);
    if (fresh) {
      const nc = L.newCard;
      this.text(X(nc.x), Y(L.newLabelY), LASTRUN_WORDS.newForYou, TYPE.label, '#8a4a12', true).setData('newLabel', true);
      const b = button(this, { x: X(nc.x), y: Y(nc.y), w: nc.w, h: nc.h, label: '', color: 0xa8703f, size: TYPE.label, stroke: 0xffd166, onTap: () => this.openNewForYou() }, this.ui);
      b.visual.setData('newForYou', fresh.id);
      const tall = nc.h >= 80;
      const is = tall ? Math.min(40, nc.h - 2 * S2 - TYPE.label - S1) : Math.min(32, nc.h - 2 * S1);
      const ix = tall ? 0 : -nc.w / 2 + S2 + is / 2;
      const iy = tall ? -nc.h / 2 + S2 + is / 2 : 0;
      const icon = fresh.icon ? addIcon(this, fresh.icon, ix, iy, is) : null;
      b.visual.add(icon ?? this.add.circle(ix, iy, is / 2, 0xffd166, 0.9));
      const tw = tall ? nc.w - 2 * S2 : nc.w - 3 * S2 - is;
      const label = this.add.text(tall ? 0 : ix + is / 2 + S2, tall ? iy + is / 2 + S1 : 0, fresh.short ?? fresh.name, { fontFamily: FONT, fontSize: `${TYPE.label}px`, color: '#fff6e6', fontStyle: 'bold', align: tall ? 'center' : 'left', wordWrap: { width: tw } }).setResolution(crisp()).setOrigin(tall ? 0.5 : 0, tall ? 0 : 0.5);
      b.visual.add(wrapLikeCubby(label, fresh.short ?? fresh.name, tw));
      // The sparkle: three small code-drawn stars that twinkle (still with Reduced motion).
      [[nc.w / 2 - 10, -nc.h / 2 + 10, 5], [nc.w / 2 - 22, -nc.h / 2 + 6, 3], [-nc.w / 2 + 8, nc.h / 2 - 9, 3]].forEach(([sx, sy, r], i) => {
        const star = this.add.star(sx, sy, 4, r / 2.5, r, 0xfff3b0);
        b.visual.add(star);
        if (!reducedMotion()) this.tweens.add({ targets: star, alpha: 0.25, scale: 0.7, yoyo: true, repeat: -1, duration: 700, delay: i * 230, ease: 'Sine.InOut' });
      });
    }

    // Again!: start another climb.
    woodSkin(this, button(this, { ...L.again, x: X(L.again.x), y: Y(L.again.y), label: LASTRUN_WORDS.again, color: 0xd5713a, size: TYPE.title, onTap: () => this.enterTower() }, this.ui), L.again.w, L.again.h);
  }

  private turnFound(by: number): void {
    this.foundPageNo += by;
    this.renderPanel('none');
  }

  /** A found tile: an item still in the bag opens its Gear sheet; anything else opens a small sheet here. */
  openFound(f: FoundTile): void {
    if (f.kind === 'item' && this.profile.inventory.some((it) => it.uid === f.item.uid)) {
      this.tab = 'gear';
      this.selected = f.item.uid;
      this.sheetOpening = true;
      this.confirmLetGo = false;
      this.renderTabs(true);
      this.renderPanel('tab');
      return;
    }
    if (f.kind === 'item') this.openRunSheet(f.item.name, [[`${rarityName(f.item.rarity)} ${SLOT_NAME[f.item.slot]}`, css(RARITY_COLOR[f.item.rarity]), true], [describeItem(f.item), '#5a3e28', false], [LASTRUN_WORDS.notInBag, '#7a5a3a', false]]);
    else this.openRunSheet(decorationDef(CONTENT.dojo, f.id).name, [[LASTRUN_WORDS.forDojo, '#a0522d', true]]);
  }

  /** "New for you": opens the Trophy Case, where the unlock moment plays and it is marked seen. */
  private openNewForYou(): void {
    this.part = 'trophy';
    this.page = 0;
    this.setTab('abilities');
  }

  /** The Bests sheet: the student's own bests only (no comparing, no streaks). */
  private openBests(): void {
    const rows = lastRunBests(this.profile.bests, this.profile.lastRun?.newBests ?? []);
    this.openRunSheet(LASTRUN_WORDS.bestsTitle, [[LASTRUN_WORDS.bestsLine, '#7a5a3a', false], ...rows.map((r): [string, string, boolean] => [`${r.name}: ${r.value}${r.isNew ? `   ${LASTRUN_WORDS.bestNew}` : ''}`, r.isNew ? '#a0522d' : WOOD.ink, r.isNew])]);
  }

  /** A paper sheet over the panel (like the cubby sheet): a title, lines, and Close. */
  private openRunSheet(title: string, lines: Array<[string, string, boolean]>): void {
    this.closeCubby(true);
    const { rx, top, rw, panelH } = this.panelBox;
    const f = BOARD.frame;
    const sheet = this.add.container(0, 0);
    this.cubbySheet = sheet;
    const prevUi = this.ui;
    const dim = this.add.rectangle(rx + f, top + f, rw - 2 * f, panelH - 2 * f, 0x000000, 0.45).setOrigin(0).setInteractive();
    dim.on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, () => this.closeCubby());
    sheet.add(dim);
    const pad = S3;
    const sw = rw - 2 * f;
    const sx = rx + f;
    const sh = Math.min(panelH - 2 * f, pad + TYPE.title + S2 + lines.length * (TYPE.body + 6) + S2 + MIN_TAP + pad);
    const sy = top + panelH - f - sh;
    const body = this.add.container(0, 0);
    sheet.add(body);
    this.ui = body;
    const bg = this.add.graphics();
    bg.fillStyle(WOOD.paper).fillRoundedRect(sx, sy, sw, sh, RADIUS.panel);
    bg.lineStyle(3, 0xffd166).strokeRoundedRect(sx, sy, sw, sh, RADIUS.panel);
    bg.setInteractive(new Phaser.Geom.Rectangle(sx, sy, sw, sh), Phaser.Geom.Rectangle.Contains);
    body.add(bg);
    let ty = sy + pad;
    this.oneLine(this.text(sx + pad, ty, title, TYPE.title, WOOD.ink, true), sw - 2 * pad, TYPE.body);
    ty += TYPE.title + S2;
    for (const [str, color, bold] of lines) {
      this.oneLine(this.text(sx + pad, ty, str, TYPE.body, color, bold), sw - 2 * pad, TYPE.label);
      ty += TYPE.body + 6;
    }
    woodSkin(this, button(this, { x: sx + sw - pad - 96, y: sy + sh - pad - MIN_TAP, w: 96, h: MIN_TAP, label: LASTRUN_WORDS.close, color: WOOD.switchOn, size: TYPE.body, onTap: () => this.closeCubby() }, body), 96, MIN_TAP);
    this.ui = prevUi;
    this.panel?.add(sheet);
    if (reducedMotion()) {
      sheet.setAlpha(0);
      this.tweens.add({ targets: sheet, alpha: 1, duration: MOTION.reducedFade.ms });
    } else {
      body.setY(sh);
      dim.setAlpha(0);
      this.tweens.add({ targets: body, y: 0, duration: MOTION.sheet.ms, ease: MOTION.sheet.ease });
      this.tweens.add({ targets: dim, alpha: 1, duration: MOTION.sheet.ms });
    }
  }

  /** Every earned and not-yet-earned ability, named after the real technique. */
  private renderAbilities(x: number, y: number, w: number, h: number): void {
    // P-MENU2-a: the segmented switch at the top: Trophy Case | Fighting Style, both 44 tall.
    const sw = abilitiesSwitch(w);
    const parts: Array<[AbilitiesPart, string]> = [
      ['trophy', TROPHY_WORDS.parts.trophy],
      ['style', TROPHY_WORDS.parts.style],
    ];
    parts.forEach(([part, label], i) => {
      const on = this.part === part;
      button(this, { x: x + sw.x0 + i * (sw.segW + sw.gap), y, w: sw.segW, h: sw.h, label, color: on ? WOOD.switchOn : WOOD.switchOff, size: TYPE.body, selected: on, onTap: () => this.setPart(part) }, this.ui);
    });
    const top = y + sw.h + S2;
    if (this.part === 'style') this.renderFightingStyle(x, top, w, h - (top - y));
    else this.renderTrophyCase(x, top, w, h - (top - y));
  }

  /**
   * P-MENU2-e: Fighting Style. Two slot cards (Stance, Virtue), the tray of picks for the chosen
   * slot, a plain-words preview, and the "Always with you" row. Tap a slot, then a pick (D4); the
   * pick is saved at once. Not-yet picks say "Learn this at the dojo" and open their sheet.
   * Placeholder art drawn in code until Jay OKs the #265 art.
   */
  private renderFightingStyle(x: number, y: number, w: number, h: number): void {
    const m = this.styleModel();
    // B-POLISH-2: tray tiles must hold their widest word (hyphens break) at 12 px with cubby padding.
    const widest = Math.max(...[...m.trays.stance, ...m.trays.virtue].flatMap((p) => p.name.split(/\s+|(?<=-)/)).map((word) => {
      const probe = this.add.text(0, 0, word, { fontFamily: FONT, fontSize: `${TYPE.label}px`, fontStyle: 'bold' });
      const wd = probe.width; probe.destroy(); return wd;
    }));
    const L = styleLayout(w, h, Math.ceil(widest) + 2 * TROPHY_UI.cubbyPadX + TROPHY_UI.stroke);
    const ink = WOOD.ink;
    (['stance', 'virtue'] as const).forEach((slot, i) => {
      const pick = m.current[slot];
      const on = this.styleSlot === slot;
      const b = button(this, { x: x + i * (L.slotW + S2), y, w: L.slotW, h: L.slotH, label: '', color: on ? WOOD.switchOn : WOOD.frameDark, size: TYPE.body, selected: on, stroke: WOOD.grain, onTap: () => this.pickSlot(slot) }, this.ui);
      const v = b.visual.setData('styleSlot', slot);
      const top = -L.slotH / 2;
      const glyphR = Math.min(18, Math.max(12, (L.slotH - 52) / 2));
      v.add(this.add.circle(0, top + 6 + glyphR, glyphR, BOARD_PAPER, 0.95).setStrokeStyle(2, 0xffd166, on ? 1 : 0.5));
      v.add(this.add.text(0, top + 6 + glyphR, STYLE_WORDS.glyphs[slot], { fontFamily: FONT, fontSize: `${Math.round(glyphR * 1.1)}px`, color: ink }).setOrigin(0.5).setResolution(crisp()));
      const ny = top + 6 + 2 * glyphR + 2;
      v.add(this.add.text(0, ny, STYLE_WORDS.slots[slot].toUpperCase(), { fontFamily: FONT, fontSize: `${TYPE.label}px`, color: '#f2e3c4', fontStyle: 'bold' }).setOrigin(0.5, 0).setResolution(crisp()));
      const name = this.add.text(0, ny + TYPE.label + 2, pick ? pick.name : STYLE_WORDS.noVirtue, { fontFamily: FONT, fontSize: `${TYPE.body}px`, color: '#fff6e6', fontStyle: 'bold', align: 'center', wordWrap: { width: L.slotW - 2 * S2 } }).setOrigin(0.5, 0).setResolution(crisp());
      // Names wrap to two lines instead of being cut; shrink only if two lines still don't fit.
      const room = L.slotH / 2 - (ny + TYPE.label + 2) - 4;
      if (name.height > room) name.setFontSize(TYPE.label);
      v.add(name);
    });

    // The tray: picks for the chosen slot, earned first. Equipped one is gold-outlined.
    const ty = y + L.slotH + S2;
    const picks = m.trays[this.styleSlot];
    const minTileW = Math.ceil(widest) + 2 * TROPHY_UI.cubbyPadX + TROPHY_UI.stroke;
    const tp = trayPaging(L.leftW, minTileW, picks.length);
    this.trayPageNo = Math.max(0, Math.min(tp.pages - 1, this.trayPageNo));
    const tray = trayPage(picks, tp, this.trayPageNo);
    const cur = m.current[this.styleSlot];
    if (tp.arrows) {
      // The Trophy Case's arrows: ◀ ▶ in switch-off wood, 15 pt, a full 44 wide; greyed at the ends.
      button(this, { x, y: ty, w: MIN_TAP, h: L.tileH, label: '◀', color: WOOD.switchOff, size: 15, disabled: this.trayPageNo === 0, onTap: () => this.turnTray(-1) }, this.ui);
      button(this, { x: x + L.leftW - MIN_TAP, y: ty, w: MIN_TAP, h: L.tileH, label: '▶', color: WOOD.switchOff, size: 15, disabled: this.trayPageNo >= tp.pages - 1, onTap: () => this.turnTray(1) }, this.ui);
    }
    // P-MENU2-f: page dots under the tray (in the gap before "Always with you"), no numbers.
    for (const d of trayDots(tp.pages, this.trayPageNo, L.leftW)) this.ui.add(this.add.circle(x + d.x, ty + L.tileH + S2 / 2, 3, d.on ? 0xffd166 : WOOD.paper, d.on ? 1 : 0.35).setData('trayDot', d.on));
    // Tiles are centred in the room between the arrows (or the whole row).
    const room = L.leftW - 2 * tp.tilesX;
    const tx0 = x + tp.tilesX + (room - (tray.length * tp.tileW + (tray.length - 1) * S2)) / 2;
    tray.forEach((p, i) => {
      const equipped = p.earned && cur?.id === p.id;
      const tile = button(this, {
        x: tx0 + i * (tp.tileW + S2), y: ty, w: tp.tileW, h: L.tileH,
        label: p.name, labelWrap: cubbyTextW(tp.tileW), size: TYPE.label,
        color: p.earned ? WOOD.frame : BOARD_PAPER, labelColor: p.earned ? '#fff6e6' : ink, stroke: WOOD.grain, selected: equipped,
        onTap: () => (p.earned ? this.equipStyle(p) : this.openStylePick(p)),
      }, this.ui).visual.list[2] as Phaser.GameObjects.Text;
      wrapLikeCubby(tile, p.name, cubbyTextW(tp.tileW));
      if (!p.earned) {
        // The lantern: something to look forward to (no lock, no count).
        const lg = this.add.graphics();
        lg.fillStyle(0xffb347, 0.35).fillCircle(tx0 + i * (tp.tileW + S2) + tp.tileW - 10, ty + 11, 7);
        lg.fillStyle(0xe8743b).fillRoundedRect(tx0 + i * (tp.tileW + S2) + tp.tileW - 14, ty + 5, 8, 11, 3);
        this.ui.add(lg);
      }
    });

    // The preview card: the chosen slot's pick in plain words (D6), plus the switch line for Stance.
    const px = x + L.previewX;
    const pg = this.add.graphics();
    pg.fillStyle(BOARD_PAPER).fillRoundedRect(px, y, L.previewW, L.previewH, RADIUS.panel);
    pg.lineStyle(2, WOOD.grain).strokeRoundedRect(px, y, L.previewW, L.previewH, RADIUS.panel);
    this.ui.add(pg);
    const pw = L.previewW - 2 * S2;
    // B-POLISH-2: the hint always shows (bottom of the card); the title wraps to 2 lines (no "…"),
    // and the title/body step down a size if the words would otherwise reach the hint.
    const hintText = this.text(px + L.previewW / 2, 0, STYLE_WORDS.hint, TYPE.label, '#7a5a3a', false, FONT, L.previewW - S2).setOrigin(0.5, 0).setAlign('center');
    const hy = y + L.previewH - S2 - hintText.height;
    hintText.setY(hy);
    const foot = this.styleSlot === 'stance' ? STYLE_WORDS.switchLine : STYLE_WORDS.virtueLine;
    const title = this.text(px + L.previewW / 2, 0, cur ? cur.name : STYLE_WORDS.noVirtue, TYPE.title, ink, true, FONT, pw).setOrigin(0.5, 0).setAlign('center').setMaxLines(2);
    const body = this.text(px + L.previewW / 2, 0, cur ? cur.line : STYLE_WORDS.noVirtueLine, TYPE.body, '#5a3e28', false, FONT, pw).setOrigin(0.5, 0).setAlign('center');
    const f = this.text(px + L.previewW / 2, 0, foot, TYPE.label, '#7a4a22', true, FONT, pw).setOrigin(0.5, 0).setAlign('center');
    const place = (gap: number): number => {
      let py = y + gap;
      title.setY(py);
      py += title.height + S1;
      body.setY(py);
      py += body.height + gap;
      f.setY(py);
      return py + f.height + S1;
    };
    if (place(S2) > hy) { title.setFontSize(TYPE.body); body.setFontSize(TYPE.label); if (place(S2) > hy) place(S1); }

    // "Always with you": Strikes and Seals are always on, so they are shown, not picked.
    const ay = y + L.alwaysY;
    this.text(x, ay, STYLE_WORDS.always, TYPE.label, '#f2e3c4', true);
    const iy = ay + TYPE.label + S1;
    if (!m.always.length) this.text(x, iy + (L.icon - TYPE.body) / 2, STYLE_WORDS.alwaysEmpty, TYPE.body, '#d9c6a3');
    m.always.slice(0, L.perAlways).forEach((a, i) => {
      const cx = x + i * (L.icon + S1) + L.icon / 2;
      const cy = iy + L.icon / 2;
      const g = this.add.graphics();
      g.fillStyle(0xffd166, 0.25).fillRoundedRect(cx - L.icon / 2, iy, L.icon, L.icon, RADIUS.button);
      g.lineStyle(2, 0xffd166, 0.8).strokeRoundedRect(cx - L.icon / 2, iy, L.icon, L.icon, RADIUS.button);
      this.ui.add(g);
      const icon = addIcon(this, a.id, cx, cy, L.icon - 8);
      if (icon) this.ui.add(icon);
      // B-POLISH-2: no art yet: a code-drawn placeholder (a small gold star), never a letter.
      else this.ui.add(this.add.star(cx, cy, 5, (L.icon - 8) / 5, (L.icon - 8) / 2.4, 0xffd166).setStrokeStyle(2, 0xa8703f));
    });
  }

  private styleModel(): StyleModel {
    return buildStyle(this.training, CONTENT.abilities, this.profile.loadout);
  }

  /** Tap 1: choose the slot. */
  pickSlot(slot: StyleSlot): void {
    if (slot === this.styleSlot) return;
    this.styleSlot = slot;
    this.trayPageNo = 0;
    this.renderPanel('none');
  }

  /** Tap 2: put an earned pick in the chosen slot. Saved at once, so it survives a restart. */
  equipStyle(p: StylePick): void {
    const next = equipPick(this.profile.loadout, this.styleSlot, p);
    if (next === this.profile.loadout) return;
    this.profile.loadout = next;
    writeSave(this.profile);
    this.renderPanel('none');
    // The slot card pops 1 -> 1.06 -> 1 (Reduced motion: no scale).
    if (reducedMotion()) return;
    const card = this.panel?.list.find((c) => c instanceof Phaser.GameObjects.Container && (c as Phaser.GameObjects.Container).getData?.('styleSlot') === this.styleSlot);
    if (card) this.tweens.add({ targets: card, scale: 1.06, duration: MOTION.pop.ms / 2, yoyo: true, ease: 'Sine.Out' });
  }

  /** A not-yet pick: its sheet says "Ask Sensei about this one" (D3). */
  private openStylePick(p: StylePick): void {
    const fromCase = p.requirementId ? this.trophyCubbies().find((c) => c.id === p.requirementId) : undefined;
    this.openCubby(fromCase ?? { id: p.id, shelf: 'stripes', name: p.name, earned: false, effect: p.line, status: STYLE_WORDS.askSensei });
  }

  /** Screenshot/test hook: tap tray item i in the chosen slot. */
  /** B-POLISH-2: page the tray. */
  turnTray(by: number): void {
    this.trayPageNo += by;
    this.renderPanel('none');
  }

  tapStyleTile(i: number): void {
    const p = this.styleModel().trays[this.styleSlot][i];
    if (p) (p.earned ? this.equipStyle(p) : this.openStylePick(p));
  }

  /**
   * P-MENU2-b: the Trophy Case. A belt ribbon, then shelves of cubbies (earned: wood card and
   * Sensei's seal; not yet: paper card, lantern and "Learn this at the dojo"), pages as dots.
   * No locks, no counts. Tapping a cubby opens its detail sheet.
   */
  private renderTrophyCase(x: number, y: number, w: number, h: number): void {
    const L = trophyLayout(w, h);
    this.beltRibbon(x, y, w, L.ribbonH);
    const cubbies = this.trophyCubbies();
    const pages = trophyPages(shelfRows(cubbies, L.perRow), L.rowsPerPage);
    this.trophyPages = pages.length;
    this.page = Math.min(this.page, pages.length - 1);
    const top = y + L.ribbonH + (L.sideArrows ? S1 : S2);
    // Centre the grid (full rows) so the shelves sit square in the frame.
    const sx = x + L.shelfX + Math.max(0, Math.floor((L.shelfW - (L.perRow * (L.cubby + BOARD.cubby.gap) - BOARD.cubby.gap)) / 2));
    // P-MENU2-c: cubbies on this page earned since the last look play their unlock moment once.
    const shown = pages[this.page].flatMap((r) => r.segments.flatMap((sg) => sg.cubbies)).filter((c) => c.earned).map((c) => c.id);
    const migrating = this.profile.trophiesSeen === null;
    const fresh = newTrophies(this.profile, cubbies.filter((c) => c.earned).map((c) => c.id), shown);
    if (fresh.length || migrating) writeSave(this.profile);
    if (fresh.length) sfx.seal();
    const nextId = cubbies.find((c) => !c.earned)?.id;
    let ry = top;
    if (cubbies.length === 0) this.text(x + w / 2, ry + S3, TROPHY_WORDS.empty, TYPE.body, '#f2e3c4', false, FONT, w).setOrigin(0.5, 0).setAlign('center');
    for (const row of pages[this.page]) {
      const cy = ry + TYPE.label + 4;
      const step = L.cubby + BOARD.cubby.gap;
      let slot = 0;
      for (const seg of row.segments) {
        this.oneLine(this.text(sx + slot * step, ry, seg.title, TYPE.label, '#e8c48a', true), seg.cubbies.length * step - BOARD.cubby.gap, 10);
        slot += seg.cubbies.length;
      }
      const rowCubbies = row.segments.flatMap((seg) => seg.cubbies);
      // P-MENU2-i: the shelf plank the cubbies stand on (their bottoms sit 4 px down into it). Art only.
      const plank = menu2Slice(this, 'shelf-plank', sx - S1, cy + L.cubby - 4, rowCubbies.length * step - BOARD.cubby.gap + 2 * S1, 20);
      if (plank) this.ui.add(plank);
      rowCubbies.forEach((c, i) => this.cubby(sx + i * step, cy, L.cubby, c, fresh.includes(c.id), c.id === nextId));
      ry += L.rowH;
    }
    if (pages.length <= 1) return;
    if (!L.sideArrows) {
      this.trophyPager(x, y + h - L.pagerH, w, pages.length);
      return;
    }
    // 2-row pages: ◀ ▶ centred on the shelves, dots in the slim strip below.
    const midY = top + (L.rowsPerPage * L.rowH) / 2 - MIN_TAP / 2;
    woodSkin(this, this.button(x, midY, MIN_TAP, MIN_TAP, '◀', WOOD.switchOff, 15, () => this.turn(-1)), MIN_TAP, MIN_TAP);
    woodSkin(this, this.button(x + w - MIN_TAP, midY, MIN_TAP, MIN_TAP, '▶', WOOD.switchOff, 15, () => this.turn(1)), MIN_TAP, MIN_TAP);
    this.pageDotsRow(x + L.shelfX, y + h - L.pagerH / 2, L.shelfW, pages.length);
  }

  /** P-MENU2-b: the Trophy Case cubbies for this student. */
  private trophyCubbies(): Cubby[] {
    const t = this.training;
    return buildCubbies({
      abilities: t.abilities,
      virtues: t.virtues,
      beltName: (id) => t.belts.find((b) => b.id === id)?.name ?? id,
      virtueName: (v) => virtueTitle(v),
      virtueEffect: (v) => describeVirtue(virtueSetupFor(v), v.def.text),
      kataLine: (id) => {
        const k = KATAS.get(id);
        return k ? kataArrows(k) : undefined;
      },
    });
  }

  /** P-MENU2-b: one knot per belt. Earned in full colour, the current one glows with its stripes, future ones are a paper outline. */
  private beltRibbon(x: number, y: number, w: number, rh: number): void {
    const t = this.training;
    const n = t.belts.length;
    const cur = t.belts.findIndex((b) => b.id === t.belt.id);
    const g = this.add.graphics();
    g.fillStyle(WOOD.frameDark, 0.6).fillRoundedRect(x, y, w, rh, RADIUS.button);
    const slot = (w - S2) / Math.max(1, n);
    const kw = Math.min(40, slot - 4);
    const kh = 16;
    const ky = y + (rh - kh) / 2;
    this.ui.add(g);
    // P-MENU2-i: the belt cord and layered knots (README order); code-drawn knots if the art is missing.
    const ks = Math.min(40, slot, rh + 8);
    if (hasMenu2(this, 'belt-knot-band') && hasMenu2(this, 'belt-knot-rim')) {
      const cord = menu2Slice(this, 'belt-cord', x + S1, y + rh / 2 - 10, w - S2, 20);
      if (cord) this.ui.add(cord);
      t.belts.forEach((b, i) => {
        const kx = x + S1 + i * slot + slot / 2;
        const ky2 = y + rh / 2;
        const future = i > cur;
        const knot = this.add.container(kx, ky2).setAlpha(future ? 0.4 : 1);
        if (i === cur) knot.add(this.add.circle(0, 0, ks / 2, 0xffd166, 0.3));
        const layer = (name: string, tint?: number, alpha = 1) => {
          const im = menu2Image(this, name, 0, 0, ks, ks);
          if (!im) return;
          if (tint !== undefined) im.setTint(tint);
          knot.add(im.setAlpha(alpha));
        };
        layer('belt-knot-shadow');
        layer('belt-knot-band', future ? WOOD.paper : hex(b.color));
        if (!future && b.color2) layer('belt-knot-center', hex(b.color2));
        layer('belt-knot-sheen', undefined, !future && !b.color2 && isBlack(hex(b.color)) ? 1 : 0.25);
        layer('belt-knot-rim');
        if (i === cur) for (let s = 0; s < t.stripesThisBelt; s++) knot.add(this.add.rectangle(ks / 2 - 6 - s * 5, 0, 3, kh - 4, 0x222222));
        this.ui.add(knot);
      });
      return;
    }
    t.belts.forEach((b, i) => {
      const kx = x + S1 + i * slot + (slot - kw) / 2;
      if (i > cur) {
        g.lineStyle(1.5, WOOD.paper, 0.45).strokeRoundedRect(kx, ky, kw, kh, 4);
        return;
      }
      if (i === cur) g.fillStyle(0xffd166, 0.3).fillRoundedRect(kx - 3, ky - 3, kw + 6, kh + 6, 6);
      g.fillStyle(hex(b.color)).fillRoundedRect(kx, ky, kw, kh, 4);
      if (b.color2) g.fillStyle(hex(b.color2)).fillRect(kx, ky + kh / 2 - 2, kw, 4);
      g.lineStyle(1, 0x000000, 0.35).strokeRoundedRect(kx, ky, kw, kh, 4);
      if (i === cur) for (let s = 0; s < t.stripesThisBelt; s++) g.fillStyle(0x222222).fillRect(kx + kw - 6 - s * 5, ky + 2, 3, kh - 4);
    });
  }

  /** B-POLISH-2: a cubby's label, wrapped to the padded inner width (after its 2 px stroke). */
  private cubbyLabel(c: Cubby, size: number): Phaser.GameObjects.Text {
    const tw = cubbyTextW(size);
    const label = c.earned ? (c.short ?? c.name) : TROPHY_WORDS.notYet;
    const txt = this.add
      .text(0, 0, label, { fontFamily: FONT, fontSize: `${c.earned ? (size >= 112 ? TYPE.body : TYPE.label) : TYPE.label}px`, color: c.earned ? '#fff6e6' : WOOD.ink, fontStyle: c.earned ? 'bold' : 'normal', align: 'center', wordWrap: { width: tw } })
      .setResolution(crisp())
      .setOrigin(0.5, 0)
    return wrapLikeCubby(txt, label, tw);
  }

  /** P-MENU2-b: one cubby, drawn in code on a button() so it presses like every other button. */
  private cubby(x: number, y: number, size: number, c: Cubby, unlock = false, next = false): void {
    let shine: (() => void) | null = null;
    const btn = button(this, { x, y, w: size, h: size, label: '', color: c.earned ? 0xa8703f : WOOD.paper, size: TYPE.label, selected: false, stroke: c.earned ? 0xffd166 : WOOD.grain, onTap: () => { shine?.(); this.openCubby(c); } }, this.ui);
    const v = btn.visual;
    const half = size / 2;
    // P-MENU2-i: the A-MENU2 cubby (9-slice; the -96 cut for small cubbies), its pressed twin on press.
    const cut = size < 104 ? '-96' : '';
    const base = c.earned ? 'cubby-earned' : 'cubby-notyet';
    const skin = menu2Slice(this, base + cut, -half, -half, size, size);
    if (skin) skinButton(this, btn, skin, base + cut, `${base}-pressed${cut}`);
    if (skin && next) {
      const glow = menu2Image(this, 'cubby-next-glow' + cut, 0, 0, size, size);
      if (glow) v.addAt(glow, 2);
    }
    // B-POLISH-2: every icon is full size; 3-line labels fit by tight top/gap/bottom space.
    const iconS = cubbyIconSize(size);
    const txt = this.cubbyLabel(c, size);
    const iy = -half + TROPHY_UI.stroke / 2 + TROPHY_UI.cubbyTop + iconS / 2;
    txt.setY(iy + iconS / 2 + TROPHY_UI.cubbyGap);
    // QA: the cream names sit over the yellow icon disc and the honey wood; a dark ink outline keeps them 4.5:1+.
    if (skin && c.earned) txt.setStroke(WOOD.ink, 4).setData('cubbyName', true);
    const icon = c.icon ? addIcon(this, c.icon, 0, iy, iconS) : null;
    if (icon) v.add(icon.setAlpha(c.earned ? 1 : 0.3));
    else v.add(this.add.circle(0, iy, iconS / 2, c.earned ? 0xffd166 : WOOD.grain, c.earned ? 0.9 : 0.3));
    v.add(txt);
    const seal = c.earned && skin ? menu2Image(this, 'cubby-seal', half - 12, -half + 12, 24, 24) : null;
    const lantern = !c.earned && skin ? (next ? menu2Image(this, 'cubby-lantern-0', half - 14, -half + 16, 18, 24) : undefined) : null;
    if (seal) v.add(seal);
    else if (lantern !== null) {
      // A-MENU2: the lantern hangs on the next cubby only, flickering (still with Reduced motion).
      if (lantern) {
        v.add(lantern);
        const fr = menu2Frames(this, ['cubby-lantern-0', 'cubby-lantern-1']);
        if (fr && fr.length === 2 && !reducedMotion()) this.time.addEvent({ delay: 333, loop: true, callback: () => lantern.active && lantern.setTexture(...fr[lantern.frame.name === fr[0][1] ? 1 : 0]).setDisplaySize(18, 24) });
      }
    } else if (c.earned) {
      // Sensei's seal: a small red stamp in the corner (placeholder, no text).
      v.add(this.add.circle(half - 12, -half + 12, 8, 0xc0392b).setStrokeStyle(2, 0xffe2b0, 0.9));
    } else {
      // A little paper lantern: something to look forward to.
      const lg = this.add.graphics();
      lg.fillStyle(0xffb347, 0.35).fillCircle(half - 13, -half + 15, 9);
      lg.fillStyle(0xe8743b).fillRoundedRect(half - 18, -half + 8, 10, 14, 4);
      lg.lineStyle(1, WOOD.ink === '#3a2618' ? 0x3a2618 : 0x000000, 0.8).lineBetween(half - 13, -half + 4, half - 13, -half + 8);
      v.add(lg);
    }
    if (c.earned && skin) shine = () => this.playOver(v, 'cubby-earned-shine', 6, size);
    if (unlock) this.unlockMoment(v, size, !!skin);
  }

  /** P-MENU2-i: plays an A-MENU2 overlay once (16 fps) over a cubby, centred. Skipped under Reduced motion. */
  private playOver(v: Phaser.GameObjects.Container, stem: string, n: number, size: number, canvas = 112): void {
    if (reducedMotion() || !v.active) return;
    const fr = menu2Frames(this, Array.from({ length: n }, (_, i) => `${stem}-${i}`));
    if (!fr) return;
    const d = (size * canvas) / 112;
    const im = this.add.image(0, 0, ...fr[0]).setDisplaySize(d, d);
    v.add(im);
    let i = 0;
    this.time.addEvent({
      delay: 1000 / 16,
      repeat: fr.length - 1,
      callback: () => {
        if (!im.active) return;
        if (++i >= fr.length) im.destroy();
        else im.setTexture(...fr[i]).setDisplaySize(d, d);
      },
    });
  }

  /**
   * P-MENU2-c: a just-earned cubby's unlock moment: a paper cover sweeps off the wood left to
   * right, then a small pop. Reduced motion: a plain fade in. (The bell rings once per view.)
   */
  private unlockMoment(v: Phaser.GameObjects.Container, size: number, art = false): void {
    if (reducedMotion()) {
      v.setAlpha(0);
      this.tweens.add({ targets: v, alpha: 1, duration: MOTION.reducedFade.ms * 3 });
      return;
    }
    const half = size / 2;
    const cover = this.add.rectangle(half, 0, size, size, WOOD.paper).setOrigin(1, 0.5);
    v.add(cover);
    this.tweens.add({
      targets: cover,
      scaleX: 0,
      duration: MOTION.unlockSweep.ms,
      ease: MOTION.unlockSweep.ease,
      onComplete: () => {
        cover.destroy();
        if (art) this.playOver(v, 'unlock-sweep', 8, size, 128);
        const [, peak, rest] = unlockPopScales();
        this.tweens.add({
          targets: v,
          scale: peak,
          duration: MOTION.pop.ms / 2,
          ease: 'Sine.Out',
          onComplete: () => this.tweens.add({ targets: v, scale: rest, duration: MOTION.pop.ms / 2, ease: 'Sine.InOut' }),
        });
      },
    });
  }

  /** P-MENU2-b: ◀ dots ▶ (44 tall). Dots only, never "n / m". */
  private trophyPager(x: number, y: number, w: number, pages: number): void {
    woodSkin(this, this.button(x, y, GEAR.arrowW, 44, '◀', WOOD.switchOff, 15, () => this.turn(-1)), GEAR.arrowW, 44);
    woodSkin(this, this.button(x + w - GEAR.arrowW, y, GEAR.arrowW, 44, '▶', WOOD.switchOff, 15, () => this.turn(1)), GEAR.arrowW, 44);
    this.pageDotsRow(x + GEAR.arrowW, y + 22, w - 2 * GEAR.arrowW, pages);
  }

  /** Page dots centred in a strip (never "n / m"). */
  private pageDotsRow(x: number, cy: number, w: number, pages: number): void {
    const d = pageDots(pages, w);
    if (!d) return;
    for (let i = 0; i < pages; i++) this.ui.add(this.add.circle(x + d.x0 + i * d.step, cy, GEAR.dot / 2, i === this.page ? 0xffd166 : WOOD.paper, i === this.page ? 1 : 0.35));
  }

  /** P-MENU2-b: the detail sheet: icon, real name, one line of what it does, the status line and kata arrows. */
  private openCubby(c: Cubby): void {
    this.closeCubby(true);
    const { rx, top, rw, panelH } = this.panelBox;
    const f = BOARD.frame;
    const sheet = this.add.container(0, 0);
    this.cubbySheet = sheet;
    const prevUi = this.ui;
    this.ui = sheet;
    const dim = this.add.rectangle(rx + f, top + f, rw - 2 * f, panelH - 2 * f, 0x000000, 0.45).setOrigin(0).setInteractive();
    dim.on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, () => this.closeCubby());
    sheet.add(dim);
    const pad = S3;
    const sw = rw - 2 * f;
    const sx = rx + f;
    const tw = sw - 2 * pad - 56 - S2;
    const kataH = c.kata ? TYPE.label + 4 + kataLines(c.kata, sw - 2 * pad) * KATA_LINE : 0;
    const sh = Math.min(panelH - 2 * f, Math.max((panelH - 2 * f) / 2, pad + TYPE.title + 4 + TYPE.body * TROPHY_UI.effectLines + 8 + TYPE.body + 8 + kataH + 44 + pad));
    const sy = top + panelH - f - sh;
    const body = this.add.container(0, 0);
    sheet.add(body);
    this.ui = body;
    const bg = this.add.graphics();
    bg.fillStyle(WOOD.paper).fillRoundedRect(sx, sy, sw, sh, RADIUS.panel);
    bg.lineStyle(3, c.earned ? 0xffd166 : WOOD.grain).strokeRoundedRect(sx, sy, sw, sh, RADIUS.panel);
    bg.setInteractive(new Phaser.Geom.Rectangle(sx, sy, sw, sh), Phaser.Geom.Rectangle.Contains);
    body.add(bg);
    const icon = c.icon ? addIcon(this, c.icon, sx + pad + 28, sy + pad + 28, 56) : null;
    if (icon) body.add(icon.setAlpha(c.earned ? 1 : 0.4));
    else body.add(this.add.circle(sx + pad + 28, sy + pad + 28, 26, c.earned ? 0xffd166 : WOOD.grain, c.earned ? 0.9 : 0.35));
    const tx = sx + pad + 56 + S2;
    let ty = sy + pad;
    this.oneLine(this.text(tx, ty, c.name, TYPE.title, WOOD.ink, true), tw, TYPE.body);
    ty += TYPE.title + 4;
    const eff = this.text(tx, ty, c.effect, TYPE.body, '#5a3e28', false, FONT, tw).setMaxLines(TROPHY_UI.effectLines);
    ty += eff.height + 6;
    this.text(tx, ty, c.status, TYPE.body, c.earned ? '#a0522d' : '#7a5a3a', true, FONT, tw);
    ty = Math.max(ty + TYPE.body + 8, sy + pad + 56 + S2);
    if (c.kata) {
      this.text(sx + pad, ty, TROPHY_WORDS.kataSteps, TYPE.label, '#7a5a3a', true);
      ty += TYPE.label + 4;
      this.kataSteps(sx + pad, ty, c.kata, sw - 2 * pad, { num: WOOD.ink, arrow: KATA_INK.onPaper.arrow });
    }
    button(this, { x: sx + sw - pad - 96, y: sy + sh - pad - 44 + 8, w: 96, h: 44, label: TROPHY_WORDS.close, color: WOOD.switchOn, size: TYPE.body, onTap: () => this.closeCubby() }, body);
    this.ui = prevUi;
    this.panel?.add(sheet);
    if (reducedMotion()) {
      sheet.setAlpha(0);
      this.tweens.add({ targets: sheet, alpha: 1, duration: MOTION.reducedFade.ms });
    } else {
      body.setY(sh);
      dim.setAlpha(0);
      this.tweens.add({ targets: body, y: 0, duration: MOTION.sheet.ms, ease: MOTION.sheet.ease });
      this.tweens.add({ targets: dim, alpha: 1, duration: MOTION.sheet.ms });
    }
  }

  /** Screenshot/test hooks: open cubby i (in shelf order), and the index of the first not-yet cubby. */
  openCubbyAt(i: number): void {
    const c = this.trophyCubbies()[i];
    if (c) this.openCubby(c);
  }

  firstNotYet(): number {
    return this.trophyCubbies().findIndex((c) => !c.earned);
  }

  private closeCubby(instant = false): void {
    const s = this.cubbySheet;
    if (!s) return;
    this.cubbySheet = null;
    this.tweens.killTweensOf(s);
    if (instant || reducedMotion() || !s.active) s.destroy(true);
    else this.tweens.add({ targets: s, alpha: 0, duration: MOTION.sheet.outMs, onComplete: () => s.destroy(true) });
  }

  /** The Gate: one lock per requirement, the time-in-rank sundial, and Sensei's Seal. */
  private renderGate(x: number, y: number, w: number, h: number): void {
    const g = this.training.gate;
    if (!g.toBelt) {
      this.text(x, y, 'You have reached the top of the Tower.', 18, '#ffd166', true, FONT, w);
      return;
    }
    this.text(x, y, `The Gate to ${g.toBelt.name}`, TYPE.heading, '#f2e9d8', true, 'Georgia, serif');
    if (g.ready) {
      const chip = this.text(x + w, y + 2, ' READY ', 15, '#14121c', true).setOrigin(1, 0).setBackgroundColor('#ffd166');
      // P-MENU-e: one pop when the tab opens, then still (no endless blinking).
      if (!reducedMotion()) {
        chip.setScale(0.9);
        this.tweens.add({ targets: chip, scale: 1, duration: MOTION.pop.ms, ease: MOTION.pop.ease });
      }
    }
    this.text(x, y + 28, `${g.lit} of ${g.locks.length} locks lit. A real promotion opens the Gate.`, TYPE.label, '#b9ad99', false, FONT, w);

    // The locks. P-MENU-f: radius 22 (at least 18), labels 12, at most 2 lines, centred.
    const n = g.locks.length;
    const slot = w / n;
    const r = gateLockR(slot);
    const ly = y + 52 + r;
    g.locks.forEach((lock, i) => {
      const lx = x + slot * (i + 0.5);
      if (lock.signedOff) {
        this.ui.add(this.add.circle(lx, ly, r + 6, 0xffd166, 0.25));
        this.ui.add(this.add.circle(lx, ly, r, 0xffd166).setStrokeStyle(3, 0xffffff, 0.8));
        this.text(lx, ly, '✓', r, '#14121c', true).setOrigin(0.5);
      } else {
        this.ui.add(this.add.circle(lx, ly, r, 0x221d2e).setStrokeStyle(3, 0x6b6478));
        this.text(lx, ly, '🔒', r * 0.8, '#8a8296').setOrigin(0.5);
      }
      const label = this.text(lx, ly + r + 4, shortName(lock), GATE.label, lock.signedOff ? '#ffd166' : '#b9ad99', false, FONT, slot - 4).setOrigin(0.5, 0).setAlign('center');
      label.setMaxLines(GATE.labelLines);
    });

    // P-MENU-f: the sundial and Sensei's Seal on two equal 96-tall cards pinned to the panel's bottom.
    const cardW = w / 2 - GATE.cardGap / 2;
    const cardY = y + h - GATE.cardH;
    const sr = GATE.sealR;
    const cards = this.add.graphics();
    for (const cx of [x, x + cardW + GATE.cardGap]) {
      cards.fillStyle(0x221d2e, 0.6).fillRoundedRect(cx, cardY, cardW, GATE.cardH, RADIUS.panel);
      cards.lineStyle(2, 0x3a3150).strokeRoundedRect(cx, cardY, cardW, GATE.cardH, RADIUS.panel);
    }
    this.ui.add(cards);
    const sy = cardY + GATE.cardH / 2;
    const titleY = cardY + 12;
    const lineY = titleY + TYPE.title + 4;
    const textW = cardW - sr * 2 - 3 * S2 - 4;
    const sx = x + S2 + 4 + sr;
    const dial = this.add.graphics();
    dial.fillStyle(0x221d2e).fillCircle(sx, sy, sr);
    if (g.sundial > 0) {
      dial.fillStyle(0xffd166, 0.9).slice(sx, sy, sr, -Math.PI / 2, -Math.PI / 2 + g.sundial * Math.PI * 2).fillPath();
    }
    dial.lineStyle(3, 0x6b6478).strokeCircle(sx, sy, sr);
    this.ui.add(dial);
    const tx = sx + sr + S2 + 2;
    this.oneLine(this.text(tx, titleY, 'Time in rank', TYPE.title, '#f2e9d8', true), textW, TYPE.label);
    this.text(tx, lineY, `${Math.min(g.classesInRank, g.classesBeforeTest)} of ${g.classesBeforeTest} classes`, TYPE.body, '#b9ad99', false, FONT, textW).setMaxLines(2);

    const kx = x + cardW + GATE.cardGap + S2 + 4 + sr;
    const seal = this.add.container(kx, sy);
    if (g.sealLit) seal.add(this.add.circle(0, 0, sr + GATE.ring.w, 0xffd166, GATE.ring.alpha));
    seal.add(this.add.circle(0, 0, sr, g.sealLit ? 0xe0533d : 0x221d2e).setStrokeStyle(3, g.sealLit ? 0xffd166 : 0x6b6478));
    seal.add(this.add.text(0, 0, '師', { fontFamily: FONT, fontSize: `${sr}px`, color: g.sealLit ? '#ffffff' : '#6b6478', fontStyle: 'bold' }).setResolution(crisp()).setOrigin(0.5));
    this.ui.add(seal);
    // First time this Seal is seen lit: one pop (skipped in reduced motion) and one soft bell.
    const migrating = this.profile.sealsSeen === null;
    const ring = sealBell(this.profile, g.toBelt.id, g.sealLit);
    if (ring || migrating) writeSave(this.profile);
    if (ring) {
      sfx.seal();
      if (!reducedMotion()) {
        seal.setScale(0.9);
        this.tweens.add({ targets: seal, scale: 1, duration: MOTION.pop.ms, ease: MOTION.pop.ease });
      }
    }
    const kt = kx + sr + S2 + 2;
    this.oneLine(this.text(kt, titleY, "Sensei's Seal", TYPE.title, '#f2e9d8', true), textW, TYPE.label);
    // Never shows or guesses a reason when the Seal isn't lit.
    const sealText = g.sealLit ? (g.testDate ? `Test day: ${shortDate(g.testDate)}` : 'Approved to test!') : 'Lights when Sensei approves you to test.';
    // The full words always show: shrink toward 12 until they fit the card (no cut-off reason).
    const st = this.text(kt, lineY, sealText, TYPE.body, g.sealLit ? '#ffd166' : '#b9ad99', g.sealLit, FONT, textW);
    for (let size = TYPE.body; st.height > cardY + GATE.cardH - 6 - lineY && size > TYPE.label; ) st.setFontSize(--size);
  }

  /**
   * P-MENU2-f: Gear. A paper doll on the left with one ring per slot (what's worn); tapping a ring
   * filters the bag to that slot, tapping it again shows everything. The bag is a tile grid that
   * uses as many columns as fit (at least 3) and pages with ◀ ▶ like the Trophy Case. The grid
   * never moves when you pick, wear or filter. Placeholder art drawn in code (no #265 art).
   */
  private renderGear(x: number, y: number, w: number, h: number): void {
    // The widest rarity word (Legendary) sets the tiles' minimum width, so every word fits at 12 px
    // with 8 px padding inside the border. It depends on content only, never the bag.
    const probe = this.add.text(0, 0, '', { fontFamily: FONT, fontSize: `${GEAR_BOARD.labelSize}px`, fontStyle: 'bold' });
    const widest = Math.max(...RARITIES.map((r) => probe.setText(rarityName(r)).width));
    probe.destroy();
    const L = gearBoardLayout(w, h, tileWForLabel(widest));
    const W = GEAR_WORDS;
    const R = GEAR_BOARD.ring;
    this.gearRings = {};
    this.gearTiles = {};
    // The paper doll: the student, with a ring per slot.
    const t = this.training;
    // P-MENU2-i: the doll's paper backing (A-MENU2), behind the student. Art only.
    const backW = Math.min(L.figureR * 4, 2 * (L.figureX - GEAR_BOARD.ring - S1));
    const backing = menu2Image(this, 'doll-backing', x + L.figureX, y + L.figureY + L.figureR * 0.75, backW, (backW * 128) / 96);
    if (backing) this.ui.add(backing);
    const glow = this.add.ellipse(x + L.figureX, y + L.figureY + L.figureR * 0.9, L.figureR * 2.6, L.figureR * 3.4, 0xffd166, 0);
    this.ui.add(glow);
    this.gearDollGlow = glow;
    this.ui.add(makeStandingCharacter(this, x + L.figureX, y + L.figureY, L.figureR, t.belt, t.stripesThisBelt, loadLook()).container);
    GEAR_SLOTS.forEach((slot, i) => {
      const item = wornItem(this.profile, slot);
      const on = this.gearFilter === slot;
      const cx = x + L.ringX;
      const cy = y + L.ringYs[i];
      const b = button(this, { x: cx - R / 2, y: cy - R / 2, w: R, h: R, label: '', color: on ? WOOD.switchOn : WOOD.frameDark, size: TYPE.label, selected: on, stroke: WOOD.grain, onTap: () => this.filterGear(slot) }, this.ui);
      const v = b.visual.setData('gearRing', slot);
      // P-MENU2-i: the rarity ring (glow while it filters), 56 art for a 48 ring; code ring if missing.
      const ringArt = `gear-ring-${artRarity(item?.rarity ?? 'common')}`;
      const ring = menu2Image(this, ringArt + (on ? '-glow' : ''), 0, 0, (R * 56) / 48, (R * 56) / 48);
      if (ring) skinButton(this, b, ring, ringArt + (on ? '-glow' : ''), `${ringArt}-pressed`);
      else v.add(this.add.circle(0, 0, R / 2 - 5, BOARD_PAPER, item ? 0.95 : 0.4).setStrokeStyle(3, item ? RARITY_COLOR[item.rarity] : WOOD.grain, 1));
      if (ring && !item) ring.setAlpha(0.6);
      const icon = item ? addGearIcon(this, item, 0, 0, R - 18) : null;
      if (icon) v.add(icon);
      else v.add(slotGlyph(this, slot, 0, 0, R - 22, item ? 0x3a2618 : 0x6b5440));
      this.gearRings[slot] = { visual: v, x: cx, y: cy, icon };
    });
    // "Always with you": Strikes and Seals are always on, so they are shown here too.
    const ay = y + L.alwaysY;
    if (L.alwaysRows > 0) {
      const always = this.styleModel().always;
      this.oneLine(this.text(x, ay, W.always, TYPE.label, '#f2e3c4', true), L.dollW, TYPE.label);
      const iy = ay + TYPE.label + S1;
      const n = L.alwaysIcon;
      if (!always.length) this.twoLines(this.text(x, iy, W.alwaysEmpty, TYPE.label, '#d9c6a3', false, FONT, L.dollW), L.dollW, TYPE.label);
      always.slice(0, L.perAlwaysRow * L.alwaysRows).forEach((a, i) => {
        const ix = x + (i % L.perAlwaysRow) * (n + S1);
        const iyy = iy + Math.floor(i / L.perAlwaysRow) * (n + S1);
        const g = this.add.graphics();
        g.fillStyle(0xffd166, 0.25).fillRoundedRect(ix, iyy, n, n, RADIUS.button);
        g.lineStyle(2, 0xffd166, 0.8).strokeRoundedRect(ix, iyy, n, n, RADIUS.button);
        this.ui.add(g);
        const ic = addIcon(this, a.id, ix + n / 2, iyy + n / 2, n - 8);
        if (ic) this.ui.add(ic);
        else this.text(ix + n / 2, iyy + n / 2, a.name.charAt(0), TYPE.title, '#fff6e6', true).setOrigin(0.5);
      });
    }

    // The filter row: one 44 button per slot (same as the rings), plus the filter's name.
    const gx = x + L.gridX;
    GEAR_SLOTS.forEach((slot, i) => {
      const on = this.gearFilter === slot;
      const b = button(this, { x: gx + i * (MIN_TAP + S1), y: y + L.filterY, w: MIN_TAP, h: GEAR_BOARD.filterH, label: '', color: on ? WOOD.switchOn : WOOD.frameDark, size: TYPE.label, selected: on, stroke: WOOD.grain, onTap: () => this.filterGear(slot) }, this.ui);
      b.visual.setData('gearFilter', slot).add(slotGlyph(this, slot, 0, 0, 22, on ? 0xfff6e6 : 0xd9c6a3));
    });
    const fx = gx + 3 * (MIN_TAP + S1) + S1;
    this.oneLine(this.text(fx, y + L.filterY + GEAR_BOARD.filterH / 2, this.gearFilter ? W.slots[this.gearFilter] : '', TYPE.body, '#f2e3c4', true).setOrigin(0, 0.5), x + w - fx, TYPE.label);

    // The bag grid. Order ignores what's worn, so wearing never moves a tile; worn ones get a gold ✓.
    const bag = filterBag(this.profile.inventory, this.gearFilter);
    const pages = Math.max(1, Math.ceil(bag.length / L.perPage));
    this.page = Math.min(this.page, pages - 1);
    const grid = this.add.container(0, 0);
    this.ui.add(grid);
    if (!bag.length) {
      const msg = this.gearFilter ? slotEmptyLine(this.gearFilter) : W.bagEmpty;
      const midY = y + L.gridY + (L.pagerY - L.gridY) / 2;
      if (!this.gearFilter) this.ui.add(bagIcon(this, gx + L.gridW / 2, midY - 26));
      this.twoLines(this.text(gx + L.gridW / 2, midY + 8, msg, TYPE.body, '#d9c6a3', false, FONT, L.gridW - 2 * GEAR_BOARD.labelPad).setOrigin(0.5, 0).setAlign('center'), L.gridW - 2 * GEAR_BOARD.labelPad, TYPE.label);
    }
    let pickedBottom = 0;
    bag.slice(this.page * L.perPage, (this.page + 1) * L.perPage).forEach((it, i) => {
      const box = tileBox(L, i);
      const tx = x + box.x;
      const ty = y + box.y;
      const worn = wornItem(this.profile, it.slot);
      const cmp = compareWith(it, worn);
      const sel = this.selected === it.uid;
      if (sel) pickedBottom = ty + box.h;
      const b = button(this, { x: tx, y: ty, w: box.w, h: box.h, label: '', color: sel ? WOOD.switchOn : WOOD.frameDark, size: TYPE.label, selected: sel, stroke: RARITY_COLOR[it.rarity], onTap: () => this.pick(it.uid) }, grid);
      const v = b.visual.setData('gearTile', it.uid);
      // P-MENU2-i: the rarity frame (72 x 88 tile in an 84 x 100 file); Selected art while picked.
      const tileArt = sel ? 'bag-tile-selected' : `bag-tile-${artRarity(it.rarity)}`;
      // QA: one uniform scale (fit to the width, the plain middle cropped out), never stretched.
      const halves = menu2Fit(this, tileArt, box.w, box.h, 6);
      const tileSkin = halves?.[0] ?? null;
      if (halves) {
        skinButton(this, b, halves[0], tileArt, 'bag-tile-pressed');
        halves.slice(1).forEach((hb) => {
          v.addAt(hb, 2);
          b.hit.on(Phaser.Input.Events.GAMEOBJECT_POINTER_DOWN, () => setMenu2(this, hb, 'bag-tile-pressed'));
          const up = () => hb.active && setMenu2(this, hb, tileArt);
          b.hit.on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, up);
          b.hit.on(Phaser.Input.Events.GAMEOBJECT_POINTER_OUT, up);
        });
        v.setData('tileFit', halves.map((im) => [im.scaleX, im.scaleY]));
      }
      // Icon above, the small rarity word under it (12 px, ≥8 px side padding, B-POLISH-2 wrap rules).
      const lh = GEAR_BOARD.labelH;
      const iconS = Math.min(GEAR_BOARD.iconMax, box.h - lh - 3 * S1 - 4);
      const iy = -box.h / 2 + S1 + 2 + iconS / 2;
      const icon = addGearIcon(this, it, 0, iy, iconS);
      if (icon) v.add(icon);
      else v.add(slotGlyph(this, it.slot, 0, iy, iconS - 8, RARITY_COLOR[it.rarity]));
      const tw = cubbyTextW(box.w);
      const word = rarityName(it.rarity);
      const lab = this.add.text(0, box.h / 2 - S1 - 1, word, { fontFamily: FONT, fontSize: `${GEAR_BOARD.labelSize}px`, fontStyle: 'bold', color: tileSkin ? RARITY_INK[it.rarity] : css(RARITY_COLOR[it.rarity]), align: 'center', wordWrap: { width: tw } }).setOrigin(0.5, 1).setResolution(crisp()).setData('rarityWord', true);
      v.add(wrapLikeCubby(lab, word, tw).setMaxLines(1));
      if (cmp.overall === 'worn') {
        v.add(this.add.circle(-box.w / 2 + 9, -box.h / 2 + 9, 7, 0xffd166));
        v.add(this.add.text(-box.w / 2 + 9, -box.h / 2 + 9, '✓', { fontFamily: FONT, fontSize: `${TYPE.label}px`, color: '#3a2618', fontStyle: 'bold' }).setOrigin(0.5).setResolution(crisp()));
      } else if (cmp.overall === 'up' || cmp.overall === 'down') {
        v.add(this.add.circle(box.w / 2 - 9, -box.h / 2 + 9, 7, COMPARE_COLOR[cmp.overall]));
        v.add(this.add.text(box.w / 2 - 9, -box.h / 2 + 9, ARROW[cmp.overall], { fontFamily: FONT, fontSize: `${TYPE.label}px`, color: '#1e1a2b', fontStyle: 'bold' }).setOrigin(0.5).setResolution(crisp()));
      }
      this.gearTiles[it.uid] = { x: tx + box.w / 2, y: ty + box.h / 2 };
    });
    // ◀ dots ▶ always has its row reserved, so the grid never shifts when pages appear.
    if (pages > 1) this.trophyPager(gx, y + L.pagerY, L.gridW, pages);

    const picked = this.pickedItem();
    if (picked) this.renderSheet(picked, x, y, w, y + h, pickedBottom);
  }

  /** P-MENU2-f: the sheet: the item and what's worn, ↑ / ↓ in calm colours with plain words, numbers behind Details. */
  private renderSheet(item: GearItem, x: number, top: number, w: number, bottom: number, pickedBottom: number): void {
    const W = GEAR_WORDS;
    const sh = GEAR_BOARD.sheetH;
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
    const block = this.add.zone(x, sy, w, sh).setOrigin(0).setInteractive();
    sheet.add([bg, block]);
    const pad = 12;
    const half = (w - 3 * pad) / 2;
    const now = wornItem(this.profile, item.slot);
    // Row 1: the item and "Now wearing", side by side; a long name wraps to a second line.
    const mini = (mx: number, it: GearItem | null, head: string): number => {
      const ic = it ? addGearIcon(this, it, mx + 16, sy + pad + 16, 32) : null;
      if (ic) sheet.add(ic);
      const tx = ic ? mx + 38 : mx;
      const tw = half - (tx - mx);
      const t1 = this.oneLine(this.add.text(tx, sy + pad, head, { fontFamily: FONT, fontSize: `${TYPE.label}px`, color: '#b9ad99' }).setResolution(crisp()), tw, TYPE.label);
      const t2 = this.twoLines(this.add.text(tx, sy + pad + 15, it ? it.name : W.nothing, { fontFamily: FONT, fontSize: `${TYPE.body}px`, fontStyle: 'bold', color: it ? css(RARITY_COLOR[it.rarity]) : '#8a8296', wordWrap: { width: tw } }).setLineSpacing(-3).setResolution(crisp()), tw, TYPE.label);
      sheet.add([t1, t2]);
      return Math.max(t2.y + t2.height, sy + pad + 32);
    };
    const row1 = Math.max(mini(x + pad, item, `${rarityName(item.rarity)} ${W.slots[item.slot]}`), mini(x + 2 * pad + half, now, W.nowWearing));

    // Row 2: ↑ / ↓ per stat (no numbers) and the plain-words line; Details shows the numbers (D6).
    const cmp = compareWith(item, now);
    const ry = row1 + 6;
    const textW = w - 2 * pad;
    if (this.gearDetails) {
      const nums = `${describeItem(item)}`;
      const was = now && now.uid !== item.uid ? `${W.nowWearing}: ${describeItem(now)}` : '';
      sheet.add(this.twoLines(this.add.text(x + pad, ry, was ? `${nums}\n${was}` : nums, { fontFamily: FONT, fontSize: `${TYPE.label}px`, color: '#f2e9d8', wordWrap: { width: textW } }).setResolution(crisp()), textW, TYPE.label));
    } else {
      let ax = x + pad;
      for (const s of cmp.stats) {
        const a = this.add.text(ax, ry, `${ARROW[s.dir]} ${W.stats[s.stat]}`, { fontFamily: FONT, fontSize: `${TYPE.body}px`, fontStyle: 'bold', color: COMPARE_CSS[s.dir] }).setResolution(crisp());
        if (ax + a.width > x + pad + textW) { a.destroy(); break; }
        sheet.add(a);
        ax += a.width + S3;
      }
      const ly = cmp.stats.length ? ry + 19 : ry + 6;
      sheet.add(this.twoLines(this.add.text(x + pad, ly, cmp.line, { fontFamily: FONT, fontSize: `${TYPE.label}px`, color: '#f2e9d8', wordWrap: { width: textW } }).setLineSpacing(-3).setResolution(crisp()), textW, TYPE.label));
    }

    // Row 3: Wear (green, widest, 52 tall), Let go (quieter; it asks again here) and Details, 8 px apart.
    const bh = GEAR_BOARD.wearH;
    const by = sy + sh - pad - bh;
    if (!this.confirmLetGo) {
      const detailsW = 76;
      const wearW = Math.round((textW - detailsW - 2 * S2) * 0.6);
      const letGoW = textW - detailsW - 2 * S2 - wearW;
      if (now?.uid === item.uid) button(this, { x: x + pad, y: by, w: wearW, h: bh, label: W.takeOff, color: 0x3a5f8a, size: 16, onTap: () => this.takeOff(item) }, sheet);
      else button(this, { x: x + pad, y: by, w: wearW, h: bh, label: W.wear, color: 0x3aa57a, size: 16, onTap: () => this.wear(item) }, sheet);
      button(this, { x: x + pad + wearW + S2, y: by, w: letGoW, h: bh, label: W.letGo, color: 0x3a3448, size: TYPE.body, labelColor: '#e8d4b4', onTap: () => this.letGo(item) }, sheet);
      button(this, { x: x + w - pad - detailsW, y: by, w: detailsW, h: bh, label: this.gearDetails ? W.hideDetails : W.details, color: 0x3a3448, size: TYPE.label, labelColor: '#d9c6a3', onTap: () => { this.gearDetails = !this.gearDetails; this.renderPanel('none'); } }, sheet);
    } else {
      const bw = Math.min(100, (w - 4 * pad) / 3);
      sheet.add(this.add.text(x + pad, by + bh / 2, W.letGoAsk, { fontFamily: FONT, fontSize: `${TYPE.body}px`, fontStyle: 'bold', color: '#ffd166' }).setOrigin(0, 0.5).setResolution(crisp()));
      button(this, { x: x + w - pad - 2 * bw - 8, y: by, w: bw, h: bh, label: W.yes, color: 0x5e4a6e, size: 15, onTap: () => this.letGo(item) }, sheet);
      button(this, { x: x + w - pad - bw, y: by, w: bw, h: bh, label: W.keep, color: 0x3aa57a, size: 15, onTap: () => { this.confirmLetGo = false; this.renderPanel('none'); } }, sheet);
    }
    if (this.sheetOpening) {
      this.sheetOpening = false;
      const rm = reducedMotion();
      sheet.setAlpha(rm ? 0 : 1).setY(rm ? 0 : atTop ? -12 : sh);
      this.tweens.add({ targets: sheet, y: 0, alpha: 1, duration: rm ? MOTION.reducedFade.ms : MOTION.sheet.ms, ease: rm ? 'Linear' : MOTION.sheet.ease });
    }
  }

  /** P-MENU2-f: tap a ring or filter button: show that slot; tap it again: show everything. */
  private filterGear(slot: GearSlot): void {
    this.gearFilter = toggleFilter(this.gearFilter, slot);
    this.page = 0;
    this.selected = null;
    this.confirmLetGo = false;
    this.renderPanel('none');
  }

  private pickedItem(): GearItem | null {
    return this.profile.inventory.find((it) => it.uid === this.selected) ?? null;
  }

  private pick(uid: string): void {
    if (this.selected === uid) return this.closeSheet();
    this.sheetOpening = this.selected === null;
    this.selected = uid;
    this.gearDetails = false;
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

  private setPart(part: AbilitiesPart): void {
    if (part === this.part) return;
    this.part = part;
    this.page = 0;
    this.renderPanel('tab');
  }

  private turn(by: number): void {
    this.page = Math.max(0, this.page + by);
    this.selected = null;
    this.renderPanel(by > 0 ? 'pageNext' : 'pagePrev');
  }

  private wear(item: GearItem): void {
    const from = this.gearTiles[item.uid];
    equip(this.profile, item.uid);
    writeSave(this.profile);
    sfx.insight();
    this.selected = null;
    this.confirmLetGo = false;
    this.renderPanel('none');
    // P-MENU2-f: the tile's icon flies to its ring, then the ring pops and the doll glows.
    // Reduced motion: a plain swap (the ring just shows the new item). The grid never moves.
    const ring = this.gearRings[item.slot];
    if (!ring || !from || reducedMotion()) return;
    const fly = addGearIcon(this, item, from.x, from.y, 36);
    if (ring.icon) ring.icon.setAlpha(0);
    const land = () => {
      if (ring.icon?.active) ring.icon.setAlpha(1);
      this.tweens.add({ targets: ring.visual, scale: 1.06, duration: MOTION.pop.ms / 2, yoyo: true, ease: 'Sine.Out' });
      const glow = this.gearDollGlow;
      if (glow?.active) {
        glow.setFillStyle(0xffd166, 0.35);
        this.tweens.add({ targets: glow, fillAlpha: 0, duration: 360 });
      }
    };
    if (!fly) return land();
    this.ui.add(fly);
    this.tweens.add({ targets: fly, x: ring.x, y: ring.y, scale: fly.scale * 0.8, duration: GEAR_BOARD.flyMs, ease: 'Cubic.In', onComplete: () => { fly.destroy(); land(); } });
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
  private kataSteps(x: number, y: number, line: string, width: number, ink: KataInk = KATA_INK.onDark): void {
    const g = this.add.graphics();
    this.ui.add(g);
    for (const c of kataLayout(line, width)) {
      this.text(x + c.x, y + c.y + 2, c.n, 13, ink.num, true);
      c.arrows.forEach((d, k) => drawArrow(g, x + c.x + numW(c.n) + k * KATA_ARROW_W + KATA_ARROW_W / 2, y + c.y + 11, d, ink.arrow));
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

  private button(x: number, y: number, w: number, h: number, label: string, color: number, size: number, onTap: () => void): ReturnType<typeof button> {
    return button(this, { x, y, w, h, label, color, size, onTap }, this.ui);
  }

  /**
   * P-MENU2-i: the panel-frame art on Last run, Gear and the Trophy Case (not My Style, not Gate).
   * Drawn at 0.25 so its rail (16 px at 1x -> 8 px) sits inside the code frame's margin; the
   * Gear and Trophy panels keep their dark well on top of the paper centre so their light words
   * still read. Missing art: the code frame stays.
   */
  private panelFrameArt(rx: number, top: number, rw: number, panelH: number): void {
    const on = this.tab === 'run' || this.tab === 'gear' || (this.tab === 'abilities' && this.part === 'trophy');
    const sh = 6 * 2 * 0.25;
    const art = on ? menu2Slice(this, 'panel-frame', rx - sh, top - sh, rw + 2 * sh, panelH + 2 * sh, 0.25) : null;
    this.codeFrame?.setVisible(!art);
    if (!art) return;
    this.ui.add(art);
    if (this.tab !== 'run') {
      const f = 8;
      this.ui.add(this.add.graphics().fillStyle(WOOD.inner, 0.92).fillRoundedRect(rx + f, top + f, rw - 2 * f, panelH - 2 * f, RADIUS.panel - 4));
    }
  }
}

/**
 * P-MENU2-a: the mood-A panel frame drawn in code (no art file): a warm wood border with a
 * little grain, a dark inner board and a thin paper line inside.
 */
function woodFrame(scene: Phaser.Scene, x: number, y: number, w: number, h: number): Phaser.GameObjects.Graphics {
  const f = BOARD.frame;
  const g = scene.add.graphics();
  g.fillStyle(WOOD.frameDark).fillRoundedRect(x - 1, y - 1, w + 2, h + 2, RADIUS.panel + 1);
  g.fillStyle(WOOD.frame).fillRoundedRect(x, y, w, h, RADIUS.panel);
  g.lineStyle(1, WOOD.grain, 0.5);
  for (let gy = y + 2; gy < y + h - 2; gy += 9) {
    g.lineBetween(x + 2, gy, x + f - 1, gy + 3);
    g.lineBetween(x + w - f + 1, gy + 4, x + w - 2, gy + 1);
  }
  for (let gx = x + 12; gx < x + w - 12; gx += 23) {
    g.lineBetween(gx, y + 2, gx + 14, y + f - 2);
    g.lineBetween(gx + 6, y + h - f + 2, gx + 20, y + h - 2);
  }
  g.fillStyle(WOOD.inner, 0.92).fillRoundedRect(x + f, y + f, w - 2 * f, h - 2 * f, RADIUS.panel - 4);
  g.lineStyle(1, WOOD.paper, 0.3).strokeRoundedRect(x + f + 2, y + f + 2, w - 2 * f - 4, h - 2 * f - 4, RADIUS.panel - 5);
  return g;
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
/** P-MENU2-g: localStorage, or null in private mode. */
function safeStore(): KeyStore | null {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

/** P-MENU2-g: a small house drawn in code (a dojo piece in the Found strip). */
function houseIcon(scene: Phaser.Scene, x: number, y: number, size: number): Phaser.GameObjects.Graphics {
  const g = scene.add.graphics({ x, y });
  const h = size / 2;
  g.fillStyle(0xc0392b).fillTriangle(-h, -h * 0.1, h, -h * 0.1, 0, -h);
  g.fillStyle(0xffd166).fillRect(-h * 0.7, -h * 0.1, h * 1.4, h * 1.1);
  g.fillStyle(0x3a2618).fillRect(-h * 0.2, h * 0.35, h * 0.4, h * 0.65);
  return g;
}

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
function drawArrow(g: Phaser.GameObjects.Graphics, cx: number, cy: number, d: 'up' | 'down' | 'left' | 'right', color: number = KATA_INK.onDark.arrow): void {
  const r = 7;
  const [dx, dy] = d === 'up' ? [0, -1] : d === 'down' ? [0, 1] : d === 'left' ? [-1, 0] : [1, 0];
  const [px, py] = [-dy, dx];
  g.lineStyle(3, color, 1).lineBetween(cx - dx * r, cy - dy * r, cx + dx * (r - 4), cy + dy * (r - 4));
  g.fillStyle(color, 1).fillTriangle(cx + dx * r, cy + dy * r, cx + dx * (r - 6) + px * 5, cy + dy * (r - 6) + py * 5, cx + dx * (r - 6) - px * 5, cy + dy * (r - 6) - py * 5);
}

/** P-MENU2-f: a placeholder slot shape drawn in code: a fist (hands), a gi collar (gi) or a charm. */
function slotGlyph(scene: Phaser.Scene, slot: GearSlot, x: number, y: number, size: number, color: number): Phaser.GameObjects.Graphics {
  const g = scene.add.graphics({ x, y });
  const s = size / 2;
  g.fillStyle(color, 1);
  if (slot === 'hands') {
    g.fillRoundedRect(-s * 0.8, -s * 0.5, s * 1.6, s * 1.2, s * 0.35);
    g.fillRoundedRect(-s * 0.8, -s * 0.9, s * 1.6, s * 0.5, s * 0.2);
  } else if (slot === 'gi') {
    g.fillTriangle(-s, -s * 0.7, -s * 0.15, -s * 0.7, -s * 0.15, s);
    g.fillTriangle(s, -s * 0.7, s * 0.15, -s * 0.7, s * 0.15, s);
    g.fillRect(-s, -s * 0.7, s * 0.35, s * 1.7);
    g.fillRect(s * 0.65, -s * 0.7, s * 0.35, s * 1.7);
  } else {
    g.fillTriangle(0, -s, s * 0.7, 0, -s * 0.7, 0);
    g.fillTriangle(0, s, s * 0.7, 0, -s * 0.7, 0);
    g.lineStyle(2, color, 1).lineBetween(0, -s, 0, -s * 1.15);
  }
  return g;
}

/** B-POLISH-2: the cubby wrap rules: 3 lines max, tight line gap, and a hyphenated word too wide
 * for the padded width breaks after its hyphen ("Self-" / "Defense #1"). */
function wrapLikeCubby(txt: Phaser.GameObjects.Text, label: string, tw: number): Phaser.GameObjects.Text {
  txt.setLineSpacing(TROPHY_UI.cubbyLineGap).setMaxLines(TROPHY_UI.cubbyLines);
  if (txt.width > tw) txt.setText(label.replace(/-(?=\S)/g, '-\n'));
  return txt;
}
