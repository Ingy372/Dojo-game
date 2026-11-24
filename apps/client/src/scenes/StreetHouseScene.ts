import Phaser from 'phaser';
import { loadInsideRoom, type Room, type Vec2, type WalkUpSpot } from '@dojo/sim';
import roomJson from '../../../../content/dojo/street-house/room.json';
import WORDS from '../../../../content/street-smarts/house.json';
import { addStatic, staticArt, staticSprites } from '../art/art';
import type { LayeredSprite } from '../art/LayeredSprite';
import { sfx } from '../audio/Sfx';
import { loadSave } from '../game/save';
import { makeStaffSprite, staffIn, staffLine, type StaffMember } from '../game/staff';
import { button } from '../ui/button';
import { addExitCue } from '../ui/exitCue';
import { fill } from '../ui/pathScreen';
import { speechBubble, type Bubble } from '../ui/speechBubble';
import { FONT, MIN_TAP, S2, S3, TYPE, crisp, view } from '../ui/theme';
import { WalkUpButton } from '../ui/walkUpButton';
import { SCENARIOS } from './StreetSmartsScene';
import { TILE, WalkScene, type Facing } from './WalkScene';

/**
 * The Street Smarts House (Jay, Nov 23: the town's market becomes the place for Street Smarts, run by Michael).
 * One cozy room: Grandmaster Michael behind his desk at the big story board (walk up: Lessons, the list of Street
 * Smarts scenes), the Safety Tips poster (Read) and the badge wall (Badges: one badge per lesson, gold with every
 * star). The front door goes back out to the town. Art: incoming-art/claude-street-house (pack street-house).
 */
const ROOM = loadInsideRoom(roomJson);
const PACK = 'street-house';
const ROOM_SPRITE = 'street-house-room';
/** How close (tiles, feet to the thing's footprint) the hero must be for its button. */
const NEAR = 1.3;
const EXIT_CUE_Y = 9.55;
const PANEL = 0x1b1838;

type Panel = Phaser.GameObjects.Container;

const distToRect = (p: Vec2, r: readonly [number, number, number, number]): number =>
  Math.hypot(Math.max(r[0] - p.x, 0, p.x - r[1]), Math.max(r[2] - p.y, 0, p.y - r[3]));

export class StreetHouseScene extends WalkScene {
  private walkUp!: WalkUpButton;
  private host: { who: StaffMember; sprite: LayeredSprite } | null = null;
  private bubble: Bubble | null = null;
  private greeted = false;
  private lines = 0;
  private panel: Panel | null = null;

  constructor() {
    super('StreetHouse');
  }

  protected room(): Room {
    return ROOM.room;
  }

  protected roomPacks(): string[] {
    return [PACK, ...staffIn('street-house').map((s) => s.pack)];
  }

  protected spawn(data?: unknown): { pos: Vec2; facing: Facing } {
    // Back from a lesson: stand at the story board again.
    if ((data as { from?: string } | undefined)?.from === 'lesson') {
      const board = ROOM.spots.find((s) => s.kind === 'lessons');
      if (board) return { pos: { x: board.approachTile.x + 0.5, y: board.approachTile.y + 0.5 }, facing: 'north' };
    }
    return { pos: ROOM.spawn, facing: 'north' };
  }

  create(data?: unknown): void {
    this.host = null;
    this.bubble = null;
    this.panel = null;
    this.greeted = (data as { from?: string } | undefined)?.from === 'lesson';
    super.create(data);
    this.walkUp = new WalkUpButton(this);
    this.placeHost();
    const relayout = () => this.walkUp.layout();
    relayout();
    this.scale.on(Phaser.Scale.Events.RESIZE, relayout);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.scale.off(Phaser.Scale.Events.RESIZE, relayout));
  }

  protected drawRoom(): void {
    const room = addStatic(this, PACK, ROOM_SPRITE, 0, 0);
    const [floor, walls, props, front] = room;
    const frame = staticArt(this, PACK, ROOM_SPRITE);
    if (frame) {
      const [ax, ay] = frame.anchor;
      this.bounds = [-ax / TILE, (frame.frameWidth - ax) / TILE, -ay / TILE, (frame.frameHeight - ay) / TILE];
    }
    for (const [id, s] of Object.entries(staticSprites(this, PACK))) {
      if (id === ROOM_SPRITE || !s.anchorTile || s.sortRow === undefined) continue;
      const images = addStatic(this, PACK, id, s.anchorTile[0] * TILE, s.anchorTile[1] * TILE);
      for (const img of images) img.setDepth(s.sortRow * TILE);
      this.standLayer.add(images);
    }
    const [x0, x1] = ROOM.exit;
    const cue = addExitCue(this, ((x0 + x1) / 2) * TILE, EXIT_CUE_Y * TILE, (x1 - x0) * TILE, TILE * 0.8, 'down', 22);
    this.worldLayer.add([floor, walls, props, cue, this.standLayer, front].filter(Boolean));
  }

  protected overUi(x: number, y: number): boolean {
    return !!this.panel || !!this.walkUp?.contains(x, y);
  }

  /** Michael at his desk by the story board. */
  private placeHost(): void {
    const who = staffIn('street-house').find((s) => s.role === 'lessons');
    if (!who) return;
    const sprite = makeStaffSprite(this, who);
    if (!sprite) return;
    sprite.container.setPosition(who.spot[0] * TILE, who.spot[1] * TILE).setDepth(who.spot[1] * TILE);
    this.standLayer.add(sprite.container);
    this.host = { who, sprite };
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => sprite.destroy());
  }

  private hostSays(kind: 'hello' | 'bye', anim: 'npc_wave' | 'bow'): void {
    const h = this.host;
    if (!h) return;
    this.bubble?.dismiss();
    const line = staffLine(h.who, kind, this.lines++ + Math.floor(this.time.now / 997));
    // beside him, over the desk: above his head would be past the top of the room
    this.bubble = speechBubble(this, this.worldLayer, (h.who.spot[0] + 2.3) * TILE, (h.who.spot[1] - 0.2) * TILE, line, { name: h.who.name, holdMs: 2800 });
    if (h.sprite.has(anim)) {
      h.sprite.play(anim, { restart: true });
      this.time.delayedCall(anim === 'bow' ? 1900 : 1600, () => h.sprite.play('npc_idle'));
    }
  }

  protected afterTick(p: Vec2): void {
    const [x0, x1, y0, y1] = ROOM.exit;
    if (p.x >= x0 && p.x <= x1 && p.y >= y0 && p.y <= y1) {
      this.walkUp.hide();
      this.leave('ActionZoneTown', { from: 'street' });
      return;
    }
    if (this.panel || this.leaving) {
      this.walkUp.hide();
      return;
    }
    let best: WalkUpSpot | null = null;
    let bestD = NEAR;
    for (const s of ROOM.spots) {
      const d = distToRect(p, s.footprint);
      if (d < bestD) {
        best = s;
        bestD = d;
      }
    }
    // The camera looks up a little near the back wall, so Michael and the boards are on screen.
    this.lookAt = p.y < 4 ? { x: p.x, y: p.y - 1.2 } : null;
    if (!best) {
      this.walkUp.hide();
      if (p.y > 5) this.greeted = false;
      return;
    }
    const spot = best;
    const B = WORDS.button;
    if (spot.kind === 'lessons') {
      if (!this.greeted) {
        this.greeted = true;
        this.hostSays('hello', 'npc_wave');
      }
      this.walkUp.show(B.lessons, () => this.openLessons());
    } else if (spot.kind === 'tips') this.walkUp.show(B.tips, () => this.openTips());
    else this.walkUp.show(B.badges, () => this.openBadges());
  }

  // ---------------------------------------------------------------- cards

  /** A dark card with a gold rim, a title and a close X; walking pauses while it's open. */
  private card(title: string, w: number, h: number): { layer: Panel; x: number; y: number; w: number; h: number } {
    this.closeCard();
    const { width, height } = view(this);
    w = Math.min(w, width - 2 * S2);
    h = Math.min(h, height - 2 * S2);
    const x = (width - w) / 2;
    const y = (height - h) / 2;
    const layer = this.add.container(0, 0).setDepth(80);
    layer.add(this.add.zone(0, 0, width, height).setOrigin(0).setInteractive());
    const g = this.add.graphics();
    g.fillStyle(0x000000, 0.4).fillRect(0, 0, width, height);
    g.fillStyle(PANEL, 0.97).fillRoundedRect(x, y, w, h, 14);
    g.lineStyle(3, 0xffd166, 0.9).strokeRoundedRect(x + 1.5, y + 1.5, w - 3, h - 3, 13);
    layer.add(g);
    layer.add(this.label(x + w / 2, y + 12, title, TYPE.title + 2, '#ffd166', true));
    button(this, { x: x + w - 48, y: y + 6, w: 44, h: 40, label: '✕', color: 0x4a3a6a, size: TYPE.title, onTap: () => this.closeCard(true) }, layer);
    this.panel = layer;
    this.paused = true;
    this.world.players.p1.path = null;
    this.controls.reset();
    this.walkUp.hide();
    return { layer, x, y, w, h };
  }

  private closeCard(sayBye = false): void {
    if (!this.panel) return;
    this.panel.destroy();
    this.panel = null;
    this.paused = false;
    if (sayBye) sfx.tap();
  }

  private label(x: number, y: number, s: string, size: number, color: string, bold = false, wrap?: number, originX = 0.5): Phaser.GameObjects.Text {
    return this.add
      .text(x, y, s, { fontFamily: FONT, fontStyle: bold ? 'bold' : 'normal', fontSize: `${size}px`, color, align: originX === 0.5 ? 'center' : 'left', wordWrap: wrap ? { width: wrap, useAdvancedWrap: true } : undefined })
      .setOrigin(originX, 0)
      .setResolution(crisp())
      .setStroke('#120e22', bold ? 3 : 0);
  }

  private starsLine(id: string, max: number): string {
    const best = loadSave().streetSmarts.best[id];
    return best === undefined ? WORDS.notPlayed : `${'★'.repeat(best)}${'☆'.repeat(Math.max(0, max - best))}  ${fill(WORDS.stars, { stars: best, max })}`;
  }

  /** The story board: every Street Smarts lesson, with its stars and a Play button. */
  private openLessons(): void {
    sfx.tap();
    const list = Object.values(SCENARIOS);
    const row = 70;
    const c = this.card(WORDS.lessonsTitle, 440, 96 + list.length * (row + 6));
    c.layer.add(this.label(c.x + c.w / 2, c.y + 44, WORDS.lessonsLine, TYPE.body, '#cfd8ff'));
    list.forEach((sc, i) => {
      const y = c.y + 72 + i * (row + 6);
      const g = this.add.graphics();
      g.fillStyle(0x2a2650, 1).fillRoundedRect(c.x + S3, y, c.w - 2 * S3, row, 10);
      c.layer.add(g);
      const title = sc.topic.charAt(0).toUpperCase() + sc.topic.slice(1);
      c.layer.add(this.label(c.x + S3 + 12, y + 5, title, TYPE.body, '#ffffff', true, c.w - 2 * S3 - 130, 0));
      c.layer.add(this.label(c.x + S3 + 12, y + row - 22, this.starsLine(sc.id, sc.maxStars), TYPE.label, '#ffd166', false, undefined, 0));
      button(this, { x: c.x + c.w - S3 - 100, y: y + (row - MIN_TAP) / 2, w: 92, h: MIN_TAP, label: WORDS.play, color: 0x2a8a5a, size: TYPE.title, onTap: () => {
        sfx.tap();
        this.leave('StreetSmarts', { id: sc.id, back: 'StreetHouse' });
      } }, c.layer);
    });
  }

  /** The Safety Tips poster, large. */
  private openTips(): void {
    sfx.tap();
    const c = this.card(WORDS.tipsTitle, 480, 300);
    let y = c.y + 52;
    WORDS.tips.forEach((tip, i) => {
      const t = this.label(c.x + S3 + 26, y, tip, TYPE.body + 1, '#ffffff', false, c.w - 2 * S3 - 30, 0);
      c.layer.add(this.label(c.x + S3, y, `${i + 1}.`, TYPE.body + 1, '#ffd166', true, undefined, 0));
      c.layer.add(t);
      y += t.height + 10;
    });
  }

  /** The badge wall: one badge per lesson; earned with any stars, gold with every star. */
  private openBadges(): void {
    sfx.tap();
    const list = Object.values(SCENARIOS);
    const c = this.card(WORDS.badgesTitle, 460, 240);
    c.layer.add(this.label(c.x + c.w / 2, c.y + 44, WORDS.badgesLine, TYPE.body, '#cfd8ff', false, c.w - 2 * S3));
    const best = loadSave().streetSmarts.best;
    const size = 64;
    const gap = 22;
    const total = list.length * size + (list.length - 1) * gap;
    list.forEach((sc, i) => {
      const cx = c.x + (c.w - total) / 2 + i * (size + gap) + size / 2;
      const cy = c.y + 128;
      const stars = best[sc.id];
      const earned = stars !== undefined && stars > 0;
      const gold = earned && stars >= sc.maxStars;
      const g = this.add.graphics();
      g.fillStyle(gold ? 0xffd166 : earned ? 0xc8a16a : 0x3a3560, 1).fillCircle(cx, cy, size / 2);
      g.lineStyle(4, gold ? 0xfff1b8 : earned ? 0x8a6a3a : 0x5a5480).strokeCircle(cx, cy, size / 2);
      c.layer.add(g);
      c.layer.add(this.label(cx, cy - 14, earned ? '★' : '?', 24, earned ? '#ffffff' : '#8f88a8', true));
      c.layer.add(this.label(cx, cy + size / 2 + 6, gold ? WORDS.badgeGold : earned ? WORDS.badgeEarned : WORDS.badgeNone, TYPE.label, gold ? '#ffd166' : '#cfd8ff', true, size + gap));
    });
  }
}
