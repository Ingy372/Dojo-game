import Phaser from 'phaser';
import { button } from '../ui/button';
import { MOTION, S2, panelSwap, type PanelChange } from '../ui/tokens';
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

    // ---- left: title, character, level, Blessing, Enter the Tower, the Path card
    const title = this.text(pad, pad - 4, 'Training Board', 22, '#f2e9d8', true, 'Georgia, serif');
    title.setInteractive().on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, () => this.tapTitle());
    this.button(pad + leftW - 84, pad - 4, 84, 30, '◀ Dojo', 0x8a5a35, 14, () => this.backToDojo());

    const cy = pad + 58;
    if (t.blessed) {
      // Full fill, so the object's alpha is the alpha you see (0.25 to 0.15).
      const glow = this.add.circle(pad + 24, cy, 32, 0x6fb7ff, 1).setAlpha(MOTION.breath.from);
      this.ui.add(glow);
      // P-MENU-a: a slow breath (alpha only, no scale); still with Reduced motion on.
      if (!reducedMotion()) this.tweens.add({ targets: glow, alpha: MOTION.breath.to, duration: MOTION.breath.ms, ease: 'Sine.InOut', yoyo: true, repeat: -1 });
    }
    this.ui.add(makeStandingCharacter(this, pad + 24, cy, 22, t.belt, t.stripesThisBelt, loadLook()).container);
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
    y += 46 + S2; // P-MENU-a: an 8 pt gap, so the two 44 pt tap areas don't touch.
    this.button(pad, y, leftW, 30, 'Practice room', 0x3a3a4a, 14, () => this.goTo('Game', {}));
    y += 36;
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
    const headline = s.result === 'cleared' ? 'Floor cleared!' : s.result === 'rested' ? playTimeText.homeHeadline : `You reached room ${Math.min(s.totalRooms, s.roomsCleared + 1)} of ${s.totalRooms}`;
    this.text(x, y, headline, 20, s.result !== 'lost' ? '#ffd166' : '#f2e9d8', true);
    y += 30;

    // One chip per room: its grade, or a mark for treasure and rest rooms.
    let cx = x;
    for (const r of s.results) {
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
    y += 40;
    this.text(x, y, `Perfect Counters ${s.perfects}   Best combo ${s.bestCombo}   Time ${realClock(s.ticks)}`, 14, '#f2e9d8', false, FONT, w);
    y += 22;
    if (last.xp) {
      const xp = last.xp;
      const extras = [xp.blessed ? 'Dojo Blessing' : '', xp.catchUp ? 'catch-up x2' : ''].filter(Boolean).join(', ');
      const lvl = xp.levelsGained > 0 ? `   Level up! (+${xp.levelsGained})` : xp.atCap ? '   (level cap)' : '';
      this.text(x, y, `+${xp.gained} experience${extras ? ` (${extras})` : ''}${lvl}`, 14, '#9ad1ff', true, FONT, w);
      y += 22;
    }

    const decos = [...(s.decorations ?? []), ...(last.earned ?? [])];
    if (decos.length > 0) {
      const line = this.text(x, y, `For your dojo: ${decos.map((id) => decorationDef(CONTENT.dojo, id).name).join(', ')}`, 14, '#ffd166', true, FONT, w);
      y += line.height + 5;
    }
    this.text(x, y, `Items found (${s.items.length})`, 15, '#ffd166', true);
    y += 22;
    const lineH = 19;
    const fit = Math.max(1, Math.floor((this.panelBottom(h) - 50 - y) / lineH));
    const items = s.items.slice().sort((a, b) => RARITY_ORDER(b) - RARITY_ORDER(a));
    items.slice(0, fit).forEach((it) => {
      const icon = addGearIcon(this, it, x + 8, y + 9, 18);
      if (icon) this.ui.add(icon);
      const tx = icon ? x + 22 : x;
      this.oneLine(this.text(tx, y, `${rarityName(it.rarity)}: ${it.name}  (${describeItem(it)})`, 14, css(RARITY_COLOR[it.rarity]), false), w - (tx - x), 10);
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
      ['fastestClearTicks', b.fastestClearTicks === null ? '—' : realClock(b.fastestClearTicks)],
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
    // Worn gear: one box per slot. K32: long names wrap to two lines (no ellipsis); every box grows to the tallest.
    const slotW = (w - 16) / 3;
    let boxH = 54;
    const boxes = GEAR_SLOTS.map((slot, i) => {
      const item = wornItem(this.profile, slot);
      const bx = x + i * (slotW + 8);
      const box = this.add.rectangle(bx, y, slotW, boxH, 0x221d2e).setOrigin(0).setStrokeStyle(2, item ? RARITY_COLOR[item.rarity] : 0x3a3150);
      this.ui.add(box);
      // K32: 40 px icon top-left with the slot and stats beside it; the name gets the box's full width below.
      const icon = item ? addGearIcon(this, item, bx + 25, y + 25, 40) : null;
      if (icon) this.ui.add(icon);
      const tx = icon ? bx + 50 : bx + 6;
      const tw = slotW - (tx - bx) - 4;
      this.text(tx, y + 6, SLOT_NAME[slot], 11, '#b9ad99');
      if (item) this.oneLine(this.text(tx, y + 24, describeItem(item), 11, '#f2e9d8'), tw, 9);
      const name = this.twoLines(this.text(bx + 6, y + 48, item ? item.name : 'Nothing', 13, item ? css(RARITY_COLOR[item.rarity]) : '#6b6478', true, FONT, slotW - 12), slotW - 12, 10);
      boxH = Math.max(boxH, name.y + name.height - y + 5);
      return box;
    });
    boxes.forEach((box) => box.setSize(slotW, boxH));
    const wornH = boxH + 10;
    y += wornH;

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
    const rows = Math.max(1, Math.floor((h - wornH - detailH - 34) / (cardH + 6)));
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
      // Narrow cards (667-wide phones) get a smaller icon so the name and stats fit on their lines.
      const iconSize = cardW < 300 ? 28 : 34;
      const icon = addGearIcon(this, it, bx + 26 + iconSize / 2, by + cardH / 2, iconSize);
      if (icon) this.ui.add(icon);
      const tx = icon ? bx + 32 + iconSize : bx + 30;
      const tw = cardW - (tx - bx) - 6;
      this.oneLine(this.text(tx, by + 4, it.name, 13, css(RARITY_COLOR[it.rarity]), true), tw, 10);
      this.oneLine(this.text(tx, by + 22, `${SLOT_NAME[it.slot]} · ${describeItem(it)}`, 11, '#f2e9d8'), tw, 9);
      bg.setInteractive().on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, () => {
        this.selected = isSel ? null : it.uid;
        this.confirmLetGo = false;
        this.renderPanel('none'); // P-MENU-b: a gear pick stays instant (the grid still moves until P-MENU-d).
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
      this.text(x, dy, `${rarityName(selected.rarity)} ${SLOT_NAME[selected.slot]}: ${describeItem(selected)}`, 13, css(RARITY_COLOR[selected.rarity]), true, FONT, w);
      this.text(x, dy + 17, worn ? `Now wearing: ${worn.name} (${describeItem(worn)})` : 'Nothing worn in this slot', 12, '#b9ad99', false, FONT, w);
      this.button(x, dy + 36, 110, 30, 'Wear', 0x3aa57a, 15, () => this.wear(selected));
      this.button(x + 118, dy + 36, 120, 30, this.confirmLetGo ? 'Sure? Tap again' : 'Let go', 0x6b3a3a, 13, () => this.letGo(selected));
    }
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
