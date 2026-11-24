import Phaser from 'phaser';
import { findPath, loadTownWalk, pieceShown, townRoom, townStage, MOVEMENT, type MoveInput, type Room, type TownDoor, type Vec2 } from '@dojo/sim';
import { addStatic, staticSprites, type StaticSprite } from '../art/art';
import { makePlayerSprite, playLocomotion } from '../art/player';
import type { LayeredSprite } from '../art/LayeredSprite';
import { testFlags } from '../game/beta';
import { reducedMotion } from '../game/motion';
import { TownLife } from '../fx/townLife';
import { loadLook, SWATCHES } from '../game/look';
import { currentTraining } from '../game/student';
import { addExitCue } from '../ui/exitCue';
import { DPR, FONT, MIN_TAP, S2, TYPE, crisp, view } from '../ui/theme';
import { TownSocial, type SocialPlayer } from '../ui/townSocial';
import { TownMiniMap, placeSign, type MapPlace, type PlaceKind } from '../ui/townMap';
import { playIntro } from '../ui/introCutscene';
import type { RunState } from '@dojo/sim';
import { button as roundButton } from '../ui/button';
import { openShop, type ShopScreen } from '../ui/shop';
import { SHOP_WORDS } from '../game/shop';
import { TOUR, senseiBubble, tourGlow, tourLine } from '../ui/homeTour';
import { loadSave, writeSave } from '../game/save';
import { TILE, WalkScene, inRect, type Facing } from './WalkScene';
import townWalk from '../../../../content/dojo/action-zone/town-walk.json';

export const TOWN_PACK = 'town';
const WALK = loadTownWalk(townWalk);
/** Town pieces that lean in the breeze. */
const SWAYS = /tree|sakura|maple|shrub|bamboo|palm|flowers/;
/** Every door in town: home, the Action Zone, and (Nov 23) the Street Smarts House. */
const DOORS = [WALK.homeDoor, WALK.dojoDoor, ...(WALK.streetDoor ? [WALK.streetDoor] : [])];
/** Jay, Nov 24: each door's picture on its sign and on the mini map. */
const doorKind = (door: TownDoor): PlaceKind => (door === WALK.homeDoor ? 'home' : door === WALK.dojoDoor ? 'dojo' : 'street');
/** The mini map's first row (the rows above are the hills) and where the Tower path ends, in room tiles. */
const MAP_TOP_ROW = 4;
const MAP_TOWER: Vec2 = { x: 30.3, y: 5.2 };

/** The town's stage: the student's real belt tier. Test link `?townstage=N` shows another stage (never in beta builds). */
export function currentTownStage(): number {
  const asked = Number(testFlags().get('townstage'));
  return townStage(WALK, asked > 0 ? asked : currentTraining().belt.tier);
}

/**
 * Night in town (Jay, Nov 19: "a night time mode that is supposed to feel very warm and welcoming"): from 7 pm to
 * 6 am on the phone's clock. Test link `?night=1` or `?night=0` (never in beta builds).
 */
export function isTownNight(now = new Date()): boolean {
  const asked = testFlags().get('night');
  if (asked === '1' || asked === '0') return asked === '1';
  const h = now.getHours();
  return h >= 19 || h < 6;
}

/** Night: the town takes this blue-violet, the hero a lighter one; the lit windows and lanterns stay warm and bright. */
const NIGHT_TINT = 0x8578ae;
const NIGHT_HERO_TINT = 0xbab2dc;
const GLOW_COLOUR = 0xffc46e;

/** The Tower path: walking up it, the camera pulls back and up so the Tower shows above the gate. */
const TOWER_PATH: [number, number, number] = [28.6, 32.0, 9.3];
const TOWER_LOOK = { x: 30.3, rows: 15 };

type TownSprite = StaticSprite & { stage?: number; until?: number; drawScale?: number; glows?: [number, number, number][] };

/**
 * Night light on a character (the hero and the classmates). The layers keep their own colours (skin, hair, gi,
 * belt) and are darkened with the night colour; a plain tint would replace them and turn the hero one flat colour.
 */
function nightLight(sprite: LayeredSprite, colour: number): void {
  sprite.setShade(colour);
}

/** Where the hero came from: out of their own dojo (home), or out of the Action Zone (outside). */
export interface TownSceneData {
  from?: 'home' | 'outside' | 'street';
  /** Nov 23: play the opening cutscene here, then start this tutorial run. */
  intro?: { run: RunState };
  /** Back from the shop: stand here again (tiles), so the new look shows where the hero was. */
  at?: Vec2;
}

const SHOP_GOLD = 0xc8962e;
const SHOP_W = 96;

/** A pretend classmate for the crowd test (`?crowd=N`): walks between open spots, never blocks anyone. */
interface Walker {
  id: string;
  name: string;
  belt: number;
  sprite: LayeredSprite;
  box: Phaser.GameObjects.Container;
  label: Phaser.GameObjects.Text;
  pos: Vec2;
  path: Vec2[];
  rest: number;
  /** Pretend classmates are bots (they answer on their own). */
  bot: true;
  /** Nov 23: a party member following its leader (the social layer sets it); null = wander. */
  follow: Vec2 | null;
}

const CROWD_NAMES = ['Ava M.', 'Leo R.', 'Mia T.', 'Kai B.', 'Zoe L.', 'Eli P.', 'Ivy C.', 'Max D.', 'Ana S.', 'Ben W.', 'Lily G.', 'Noah F.', 'Ruby H.', 'Sam K.', 'Nia J.', 'Owen V.', 'Maya N.', 'Theo A.', 'Isla Q.', 'Jude Y.'];

/**
 * The town (Nov 18 redesign, Jay: "bigger, very martial artsy, sakura trees, and it gets nicer and nicer as you
 * play"). A wide main street in front of the Action Zone, the market and the Hall of Masters lot; a big open plaza
 * with the statue; the practice yard; the torii gate into the garden; My Dojo and the koi pond. Walking out of the
 * Home Dojo's south door brings you out of My Dojo's door; the Action Zone's door goes to the real dojo.
 * The pieces shown follow the student's real belt (WALK.pieces' stages): every promotion makes the town nicer.
 */
export class TownScene extends WalkScene {
  private stage = 1;
  private roomAt: Room = townRoom(WALK, 1);
  private walkers: Walker[] = [];
  private night = false;
  /** How many rows tall the view is now (eases between 7 on the streets and 12 on the Tower path). */
  private rowsNow = 7;
  /** Jay, Nov 22: the looks shop opens from town too (the button at the top right). */
  private shopButton: Phaser.GameObjects.Container | null = null;
  private shopRect: Phaser.Geom.Rectangle | null = null;
  private shop: ShopScreen | null = null;
  /** Nov 23 (Jay): phrases and parties in town. */
  private social: TownSocial | null = null;
  /** Jay, Nov 24: the mini map, top left. It shows the way; it never moves the player. */
  private miniMap: TownMiniMap | null = null;
  /** Nov 23: the opening cutscene is playing (the camera and the hero belong to it). */
  private intro: { run: RunState } | null = null;
  private introRows = 7;

  constructor() {
    super('ActionZoneTown');
  }

  protected room(): Room {
    return this.roomAt;
  }

  /** Home Tour "go home" stop: a push toward the home door goes in, even from where the hero came out. */
  private tourHomeWait = false;

  protected onInput(input: MoveInput, pos: Vec2): void {
    const d = WALK.homeDoor.enterRect;
    if (!this.tourHomeWait || !inRect(pos, [d[0] - 0.6, d[1] + 0.6, d[2], d[3] + 1.2])) return;
    if ((input.kind === 'stick' && input.y < -0.3) || (input.kind === 'moveTo' && input.y < pos.y - 0.2)) this.arm('home-door');
  }

  /** Read before preload, so the cutscene's art (the Shades) loads with the town. */
  init(data?: unknown): void {
    this.intro = (data as TownSceneData | undefined)?.intro ?? null;
  }

  create(data?: unknown): void {
    this.tourHomeWait = false;
    this.lifted = false;
    // The cutscene shows the town at its first stage, in daylight.
    this.stage = this.intro ? 1 : currentTownStage();
    this.night = this.intro ? false : isTownNight();
    this.rowsNow = 7;
    this.roomAt = townRoom(WALK, this.stage);
    super.create(data);
    if (this.night) nightLight(this.hero, NIGHT_HERO_TINT);
    this.shop = null;
    this.miniMap = null;
    this.drawShopButton();
    this.scale.on(Phaser.Scale.Events.RESIZE, this.drawShopButton, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.scale.off(Phaser.Scale.Events.RESIZE, this.drawShopButton, this));
    if (this.intro) {
      this.startIntro(this.intro.run);
      return;
    }
    this.makeCrowd(Math.min(30, Math.max(0, Number(testFlags().get('crowd')) || 0)));
    this.makeSocial();
    this.makeMiniMap();
    this.tourStop((data as TownSceneData | undefined)?.from);
  }

  /**
   * Home Tour, town stop (Jay, Nov 18): "This is our town", the real dojo's door glows, then the way home.
   * Back out of the real dojo mid-tour, Sensei only points home.
   */
  private tourStop(from: TownSceneData['from']): void {
    if (loadSave().homeTour !== 'town') return;
    const glowAt = (door: TownDoor) => {
      const g = tourGlow(this, door.cue[0] * TILE, (door.cue[1] + 0.2) * TILE, TILE * 0.7, { shortArrow: true });
      this.worldLayer.add(g);
      return g;
    };
    const goHome = () => {
      this.paused = false;
      this.tourHomeWait = true;
      this.lookAt = null;
      glowAt(WALK.homeDoor);
      senseiBubble(this, TOUR.goHome, undefined, TOUR.next, 'bottom');
    };
    if (from === 'outside') return goHome();
    this.paused = true;
    // The plaza first (the camera drifts to the statue), then the real dojo's door.
    this.lookAt = { x: 23, y: 18 };
    this.time.delayedCall(this.fade(450), () =>
      senseiBubble(this, TOUR.town, () => {
        const glow = glowAt(WALK.dojoDoor);
        this.lookAt = { x: WALK.dojoDoor.cue[0], y: WALK.dojoDoor.cue[1] };
        senseiBubble(this, tourLine(TOUR.realDojo, { dojo: WALK.dojoDoor.label }), () => {
          glow.destroy();
          goHome();
        }, TOUR.next, 'bottom');
      }, TOUR.next, 'bottom'),
    );
  }

  protected roomPacks(): string[] {
    // the cutscene's Shades come from the white belt monsters
    return this.intro ? [TOWN_PACK, 'enemies-t1'] : [TOWN_PACK];
  }

  /** The opening cutscene (Jay, Nov 23), then the tutorial run. */
  private startIntro(run: RunState): void {
    this.paused = true;
    this.shopButton?.destroy();
    this.shopButton = null;
    this.shopRect = null;
    // four kids training in the practice yard
    this.makeCrowd(4);
    const yard = [{ x: 35.6, y: 6.2 }, { x: 37.4, y: 6.2 }, { x: 39.2, y: 6.2 }, { x: 36.5, y: 7.6 }];
    this.walkers.forEach((w, i) => {
      w.pos = { ...yard[i % yard.length] };
      w.path = [];
      w.rest = 1e9;
      w.label.setVisible(false);
      w.box.setPosition(w.pos.x * TILE, w.pos.y * TILE).setDepth(w.pos.y * TILE);
    });
    const me = this.world.players.p1;
    playIntro({
      scene: this,
      world: this.worldLayer,
      tile: TILE,
      look: (p, rows) => {
        this.lookAt = p;
        this.introRows = rows;
      },
      heroVisible: (on) => this.player.setVisible(on),
      placeHero: (p, face) => {
        me.pos = { ...p };
        me.path = null;
        me.facing = { ...face };
      },
      walkHero: (path) => (me.path = path.map((p) => ({ ...p }))),
      heroPos: () => me.pos,
      kids: this.walkers.map((w) => w.sprite),
      done: () => this.scene.start('Game', { run, skipStory: true }),
    });
  }

  protected viewRows(): number {
    // Jay, Nov 18: zoomed in close so details read; the town scrolls both ways. Wider on the Tower path.
    return this.rowsNow;
  }

  /** The mini map in the top-left corner, sized to the screen (Jay, Nov 24). */
  private makeMiniMap(): void {
    const places: MapPlace[] = [...DOORS.map((d) => ({ kind: doorKind(d), at: { x: d.cue[0], y: d.cue[1] } })), { kind: 'tower', at: MAP_TOWER }];
    this.miniMap = new TownMiniMap(this, this.roomAt, places, MAP_TOP_ROW);
    const place = () => {
      const { width } = view(this);
      this.miniMap?.layout(S2 + 4, S2 + 4, Math.max(110, Math.min(170, width * 0.17)));
    };
    place();
    this.scale.on(Phaser.Scale.Events.RESIZE, place);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.scale.off(Phaser.Scale.Events.RESIZE, place);
      this.miniMap = null;
    });
  }

  /** The Shop button, top right (redrawn when the screen changes size). */
  private drawShopButton(): void {
    this.shopButton?.destroy();
    this.shopButton = null;
    this.shopRect = null;
    // Not during Sensei's town tour: one thing at a time (the button shows on the next visit).
    if (loadSave().homeTour === 'town') return;
    const { width } = view(this);
    const box = this.add.container(0, 0).setDepth(50);
    const b = roundButton(this, { x: width - S2 - SHOP_W, y: S2, w: SHOP_W, h: MIN_TAP, label: SHOP_WORDS.button, color: SHOP_GOLD, size: TYPE.body, onTap: () => this.openTownShop() }, box);
    this.shopButton = box;
    this.shopRect = b.hit.getBounds();
  }

  private openTownShop(): void {
    if (this.shop || this.paused || this.leaving) return;
    const { width, height } = view(this);
    this.paused = true;
    this.shopButton?.setVisible(false);
    this.social?.setHidden(true);
    const before = JSON.stringify(loadSave().shop.wearing);
    this.shop = openShop(this, width, height, loadSave(), currentTraining(), () => {
      this.shop?.layer.destroy();
      this.shop = null;
      // A new look needs its art loaded: come back to the same spot with it on.
      if (JSON.stringify(loadSave().shop.wearing) !== before) {
        const p = this.world.players.p1.pos;
        this.scene.restart({ at: { x: p.x, y: p.y } } satisfies TownSceneData);
        return;
      }
      this.paused = false;
      this.shopButton?.setVisible(true);
      this.social?.setHidden(false);
    });
  }

  protected overUi(x: number, y: number): boolean {
    if (this.shop || (this.shopRect && this.shopRect.contains(x, y))) return true;
    if (this.miniMap?.contains(x, y)) return true;
    // Nov 23: the Say / Party buttons and their cards, and a tap on a classmate (opens their card, doesn't walk)
    return !!this.social && (this.social.hits(x, y) || this.social.playerAt(x, y) !== null);
  }

  /**
   * Phrases and parties (Jay, Nov 23). A tap on a classmate opens their card; tap-to-move keeps working everywhere
   * else, and the stick's corner always steers. Hidden during Sensei's town tour.
   */
  private makeSocial(): void {
    const social = new TownSocial({
      scene: this,
      world: this.worldLayer,
      tile: TILE,
      myPos: () => this.world.players.p1.pos,
      myName: () => currentTraining().firstName,
      others: (): SocialPlayer[] => this.walkers,
      toScreen: (p) => ({ x: this.worldLayer.x + p.x * TILE * this.zoom, y: this.worldLayer.y + p.y * TILE * this.zoom }),
      setPaused: (on) => {
        this.paused = on;
        if (on) {
          this.world.players.p1.path = null;
          this.controls.reset();
        }
      },
      botGoTo: (id, to) => {
        const w = this.walkers.find((x) => x.id === id);
        if (!w) return;
        w.follow = to;
        if (to) {
          w.path = findPath(this.roomAt, w.pos, to, MOVEMENT.playerRadius) ?? [];
          w.rest = 0.4;
        }
      },
      setNameColour: (id, colour) => this.walkers.find((x) => x.id === id)?.label.setColor(colour),
    });
    this.social = social;
    if (loadSave().homeTour === 'town') social.setHidden(true);
    let downAt: { x: number; y: number } | null = null;
    // A tap that starts on a button or card belongs to it, even if the card closes before the finger lifts.
    const down = (p: Phaser.Input.Pointer) => {
      const x = p.x / DPR;
      const y = p.y / DPR;
      downAt = social.hits(x, y) || (this.shopRect?.contains(x, y) ?? false) ? null : { x, y };
    };
    const up = (p: Phaser.Input.Pointer) => {
      const x = p.x / DPR;
      const y = p.y / DPR;
      const from = downAt;
      downAt = null;
      if (!from || Math.hypot(x - from.x, y - from.y) > 12 || this.paused || this.shop || this.leaving) return;
      const who = social.playerAt(x, y);
      if (who) social.tapPlayer(who);
    };
    this.input.on('pointerdown', down);
    this.input.on('pointerup', up);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.input.off('pointerdown', down);
      this.input.off('pointerup', up);
      this.social = null;
    });
  }

  protected spawn(data: unknown): { pos: Vec2; facing: Facing } {
    const at = (data as TownSceneData | undefined)?.at;
    if (at) return { pos: { ...at }, facing: 'south' };
    const from = (data as TownSceneData | undefined)?.from;
    const door = from === 'outside' ? WALK.dojoDoor : from === 'street' && WALK.streetDoor ? WALK.streetDoor : WALK.homeDoor;
    return { pos: { x: door.spawn[0], y: door.spawn[1] }, facing: 'south' };
  }

  /** The moving things that make the town feel alive (Jay, Nov 24). */
  private life: TownLife | null = null;

  protected drawRoom(): void {
    const w = WALK.tiles[0].length;
    const swayers: [Phaser.GameObjects.Image[], boolean][] = [];
    const all = Object.entries(staticSprites(this, TOWN_PACK)) as [string, TownSprite][];
    // The picture starts above row 0: the hills, the sky and the Tower.
    const top = Math.min(0, ...all.filter(([, s]) => s.place === 'ground').map(([, s]) => s.anchorTile?.[1] ?? 0));
    this.bounds = [0, w, top, WALK.tiles.length];
    const back: Phaser.GameObjects.GameObject[] = [this.sky(w, top)];
    if (this.night) back.push(...this.stars(w, top));
    const ground: Phaser.GameObjects.GameObject[] = [];
    const flat: [number, Phaser.GameObjects.GameObject[]][] = [];
    const pools: Phaser.GameObjects.GameObject[] = [];
    for (const [id, s] of all) {
      if (!s.anchorTile || s.place === 'outside' || !pieceShown({ stage: s.stage ?? 1, until: s.until }, this.stage)) continue;
      const lit = s.place === 'lit' || s.place === 'lit-ground';
      if (lit && !this.night) continue;
      const images = addStatic(this, TOWN_PACK, id, s.anchorTile[0] * TILE, s.anchorTile[1] * TILE);
      // The Action Zone is packed at twice the detail and drawn at half size, so it stays sharp up close.
      if (s.drawScale) for (const img of images) img.setScale(s.drawScale);
      if (this.night && !lit) for (const img of images) img.setTint(NIGHT_TINT);
      const glows = lit ? this.glows(s, pools) : [];
      if (SWAYS.test(id) && s.place !== 'ground') swayers.push([images, !/shrub|bamboo|flowers/.test(id)]);
      if (s.place === 'ground') ground.push(...images);
      else if (s.place === 'lit-ground' || s.place === 'flat') flat.push([s.sortRow ?? -1, [...images, ...glows]]);
      else {
        for (const img of [...images, ...glows]) img.setDepth((s.sortRow ?? s.anchorTile[1]) * TILE + (lit ? 0.5 : 0));
        this.standLayer.add([...images, ...glows]);
      }
    }
    flat.sort((a, b) => a[0] - b[0]);

    const marks: Phaser.GameObjects.GameObject[] = [];
    for (const door of DOORS) {
      const [cx, cy] = door.cue;
      // The Action Zone's tag sits between its doors and its own CMA MARTIAL ARTS sign.
      marks.push(addExitCue(this, cx * TILE, cy * TILE, TILE * 1.3, TILE * 0.8, 'up'));
      // Jay, Nov 24: each sign has the place's picture beside its name, so a non-reader knows the door too.
      marks.push(placeSign(this, doorKind(door), door.label, cx * TILE, (cy - (door === WALK.dojoDoor ? 1.95 : door === WALK.homeDoor ? 1.25 : 1.6)) * TILE).setDepth(door.cue[1] * TILE + 1));
    }
    // Door labels sort with the pieces so a roof never covers them.
    this.standLayer.add(marks.filter((_m, i) => i % 2 === 1));
    if (this.night) this.fireflies();
    this.worldLayer.add([...back, ...ground, ...pools, ...flat.flatMap(([, imgs]) => imgs), ...marks.filter((_m, i) => i % 2 === 0), this.standLayer]);
    const lifeGround = this.add.container(0, 0);
    this.worldLayer.addAt(lifeGround, this.worldLayer.getIndex(this.standLayer));
    this.life?.destroy();
    this.life = new TownLife({ scene: this, stand: this.standLayer, ground: lifeGround, tile: TILE, width: w, top, night: this.night, stage: this.stage, still: reducedMotion(), nightTint: NIGHT_TINT });
    for (const [imgs, big] of swayers) this.life.sway(imgs, big);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.life?.destroy();
      this.life = null;
    });
    this.standLayer.sort('depth');
  }

  /** A soft round light texture, made once: white in the middle, fading to nothing. */
  private glowTexture(): string {
    const key = 'town-glow';
    if (!this.textures.exists(key)) {
      const c = this.textures.createCanvas(key, 128, 128)!;
      const ctx = c.getContext();
      const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
      g.addColorStop(0, 'rgba(255,255,255,1)');
      g.addColorStop(0.35, 'rgba(255,255,255,0.45)');
      g.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, 128, 128);
      c.refresh();
    }
    return key;
  }

  /** The warm glow around each night light, and a pool of light on the ground below the ones that stand on it. */
  private glows(s: TownSprite, pools: Phaser.GameObjects.GameObject[]): Phaser.GameObjects.Image[] {
    const tex = this.glowTexture();
    const out: Phaser.GameObjects.Image[] = [];
    const ground = s.place === 'lit' ? (s.sortRow ?? s.anchorTile![1]) : null;
    for (const [gx, gy, gr] of s.glows ?? []) {
      const size = Math.min(gr, 1.2) * 3 * TILE;
      out.push(this.add.image(gx * TILE, gy * TILE, tex).setDisplaySize(size, size).setTint(GLOW_COLOUR).setBlendMode(Phaser.BlendModes.ADD).setAlpha(0.42));
      if (ground !== null && ground - gy < 3.2) {
        pools.push(this.add.image(gx * TILE, (ground + 0.35) * TILE, tex).setDisplaySize(size * 1.2, size * 0.42).setTint(GLOW_COLOUR).setBlendMode(Phaser.BlendModes.ADD).setAlpha(0.32));
      }
    }
    return out;
  }

  /** The sky behind the hills and the Tower: soft blue by day, a deep warm violet at night. */
  private sky(w: number, top: number): Phaser.GameObjects.Image {
    const key = this.night ? 'town-sky-night' : 'town-sky-day';
    if (!this.textures.exists(key)) {
      const c = this.textures.createCanvas(key, 4, 256)!;
      const ctx = c.getContext();
      const g = ctx.createLinearGradient(0, 0, 0, 256);
      g.addColorStop(0, this.night ? '#121640' : '#8fcbef');
      g.addColorStop(0.7, this.night ? '#3a2f66' : '#cfe9f6');
      g.addColorStop(1, this.night ? '#6a4a78' : '#e8f5fa');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, 4, 256);
      c.refresh();
    }
    return this.add.image(0, top * TILE, key).setOrigin(0, 0).setDisplaySize(w * TILE, (-top + 4) * TILE);
  }

  /** A few twinkling stars in the night sky (they sit behind the hills). */
  private stars(w: number, top: number): Phaser.GameObjects.Image[] {
    const tex = this.glowTexture();
    const out: Phaser.GameObjects.Image[] = [];
    for (let i = 0; i < 70; i++) {
      const star = this.add.image(Math.random() * w * TILE, (top + Math.random() * 4) * TILE, tex).setDisplaySize(5, 5).setAlpha(0.5 + Math.random() * 0.5);
      if (!reducedMotion()) this.tweens.add({ targets: star, alpha: 0.2, duration: 900 + Math.random() * 1800, yoyo: true, repeat: -1, delay: Math.random() * 1500 });
      out.push(star);
    }
    return out;
  }

  /** Warm fireflies drifting over the plaza, the garden, the practice yard, the pond and the street. */
  private fireflies(): void {
    const tex = this.glowTexture();
    const areas: [number, number, number, number][] = [[15, 31, 14, 25], [16, 30, 25, 29], [2, 13, 15, 28], [33, 45, 21, 29], [1, 45, 9, 14]];
    for (let i = 0; i < 46; i++) {
      const [x0, x1, y0, y1] = areas[i % areas.length];
      const x = (x0 + Math.random() * (x1 - x0)) * TILE;
      const y = (y0 + Math.random() * (y1 - y0)) * TILE;
      const f = this.add.image(x, y, tex).setDisplaySize(9, 9).setTint(0xffe08a).setBlendMode(Phaser.BlendModes.ADD).setAlpha(0.8).setDepth(1e6);
      this.standLayer.add(f);
      if (reducedMotion()) continue;
      this.tweens.add({ targets: f, x: x + (Math.random() - 0.5) * TILE * 2.4, y: y - TILE * (0.4 + Math.random()), duration: 2600 + Math.random() * 2600, yoyo: true, repeat: -1, ease: 'Sine.easeInOut', delay: Math.random() * 2000 });
      this.tweens.add({ targets: f, alpha: 0.15, duration: 700 + Math.random() * 900, yoyo: true, repeat: -1, delay: Math.random() * 1500 });
    }
  }

  /** A tap on a door (or the building front around it) walks to the spot in front of it, inside its doorway. */
  protected tapTile(tile: Vec2): Vec2 {
    for (const door of DOORS) {
      const [x0, x1, y0, y1] = door.enterRect;
      if (tile.x >= x0 - 0.8 && tile.x <= x1 + 0.8 && tile.y >= y0 - 3 && tile.y <= y1) return { x: (x0 + x1) / 2, y: y1 - 0.3 };
    }
    return tile;
  }

  protected afterTick(p: Vec2): void {
    if (this.entered('home-door', WALK.homeDoor.enterRect, p)) {
      // Home Tour: back home, Sensei's last stop is the training station.
      const save = loadSave();
      if (save.homeTour === 'town') {
        save.homeTour = 'board';
        writeSave(save);
      }
      this.leave('Dojo', { from: 'town' });
      return;
    }
    if (this.entered('dojo-door', WALK.dojoDoor.enterRect, p)) {
      this.leave('ActionZoneOutside', { from: 'town' });
      return;
    }
    if (WALK.streetDoor && this.entered('street-door', WALK.streetDoor.enterRect, p)) this.leave('StreetHouse');
  }

  // ------------------------------------------------------------------ crowd test (?crowd=N): how roomy is the town?
  private openCells: Vec2[] = [];

  private makeCrowd(n: number): void {
    this.walkers = [];
    if (n <= 0) return;
    const room = this.roomAt;
    this.openCells = [];
    for (let y = 9; y < room.height - 1; y++) for (let x = 1; x < room.width - 1; x++) if (!room.walls[y][x]) this.openCells.push({ x: x + 0.5, y: y + 0.5 });
    const look = loadLook();
    const belts = currentTraining().belts;
    for (let i = 0; i < n; i++) {
      const pick = this.openCells[Math.floor(Math.random() * this.openCells.length)];
      const belt = belts[Math.floor(Math.random() * Math.min(belts.length, 10))];
      const sprite = makePlayerSprite(this, { id: belt.id, name: belt.name, color: belt.color, color2: belt.color2, tier: 1, degree: belt.degree }, Math.floor(Math.random() * 3), {
        ...look,
        skin: Math.floor(Math.random() * SWATCHES),
        hairColor: Math.floor(Math.random() * SWATCHES),
        gi: Math.floor(Math.random() * SWATCHES),
      });
      if (!sprite) return;
      const name = this.add
        .text(0, -TILE * 1.55, CROWD_NAMES[i % CROWD_NAMES.length], { fontFamily: FONT, fontStyle: 'bold', fontSize: '11px', color: '#ffffff', stroke: '#14121c', strokeThickness: 3 })
        .setOrigin(0.5, 1)
        .setResolution(crisp() * 2);
      if (this.night) nightLight(sprite, NIGHT_HERO_TINT);
      const box = this.add.container(pick.x * TILE, pick.y * TILE, [sprite.container, name]);
      this.standLayer.add(box);
      const beltColour = Phaser.Display.Color.HexStringToColor(belt.color).color;
      this.walkers.push({ id: `c${i}`, name: CROWD_NAMES[i % CROWD_NAMES.length], belt: beltColour, sprite, box, label: name, pos: { ...pick }, path: [], rest: Math.random() * 2, bot: true, follow: null });
    }
  }

  /** True while the camera is lifted by the code below (not by a Home Tour stop). */
  private lifted = false;

  update(time: number, delta: number): void {
    // Near the buildings along the main street the camera looks a little higher, so the Action Zone's sign shows.
    // On the Tower path it pulls back and up, so the Tower rises above the gate.
    const p = this.world?.players.p1.pos;
    let rows = this.intro ? this.introRows : 7;
    if (p && !this.intro && (this.lookAt === null || this.lifted)) {
      const onPath = p.x >= TOWER_PATH[0] && p.x <= TOWER_PATH[1] && p.y < TOWER_PATH[2];
      this.lifted = p.y < 12.5 && !this.paused;
      if (this.lifted && onPath) rows = TOWER_LOOK.rows;
      this.lookAt = !this.lifted ? null : onPath ? { x: TOWER_LOOK.x, y: p.y - 6.6 } : { x: p.x, y: p.y - 1.4 };
    }
    if (Math.abs(rows - this.rowsNow) > 0.01) {
      this.rowsNow = reducedMotion() ? rows : this.rowsNow + (rows - this.rowsNow) * Math.min(1, delta / 300);
      this.refreshZoom();
    }
    super.update(time, delta);
    this.life?.update(time);
    this.social?.update();
    if (this.miniMap && this.world) this.miniMap.update(this.world.players.p1.pos, this.walkers.map((w) => w.pos), time);
    if (!this.walkers.length) return;
    const dt = Math.min(delta, 100) / 1000;
    const speed = MOVEMENT.speedTilesPerSecond * 0.7;
    for (const w of this.walkers) {
      let moving = false;
      if (w.path.length) {
        const t = w.path[0];
        const dx = t.x - w.pos.x;
        const dy = t.y - w.pos.y;
        const d = Math.hypot(dx, dy);
        const step = speed * dt;
        if (d <= step) {
          w.pos = { ...t };
          w.path.shift();
          if (!w.path.length) w.rest = w.follow ? 0.3 : 1 + Math.random() * 4;
        } else {
          w.pos = { x: w.pos.x + (dx / d) * step, y: w.pos.y + (dy / d) * step };
          w.sprite.face(dx, dy);
        }
        moving = true;
      } else if ((w.rest -= dt) <= 0) {
        if (w.follow) {
          // a party member waits by its leader until the leader walks off again
          w.rest = 0.5;
          w.box.setPosition(w.pos.x * TILE, w.pos.y * TILE).setDepth(w.pos.y * TILE);
          playLocomotion(w.sprite, 0);
          w.sprite.update();
          continue;
        }
        const to = this.openCells[Math.floor(Math.random() * this.openCells.length)];
        w.path = findPath(this.roomAt, w.pos, to, MOVEMENT.playerRadius) ?? [];
        if (!w.path.length) w.rest = 0.5;
      }
      w.box.setPosition(w.pos.x * TILE, w.pos.y * TILE).setDepth(w.pos.y * TILE);
      playLocomotion(w.sprite, moving ? speed : 0);
      w.sprite.update();
    }
    this.standLayer.sort('depth');
  }
}

/** For tests: true when `p` (tiles) is inside the home door. */
export const inHomeDoor = (p: Vec2): boolean => inRect(p, WALK.homeDoor.enterRect);
