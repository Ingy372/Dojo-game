// Street Smarts: a short cut scene from a script in content/street-smarts/ (Jay, Nov 24: shorter, and show what's
// happening like a cut scene; stop only when the player has to decide or do something).
// The rules package walks the script; this scene acts it out in the store (content/street-smarts/store-room.json),
// shows each line as a caption and reads it aloud. A not-best choice never shows danger: Sensei talks it over and the
// player tries again (retry branches never move anyone, so nothing is acted out).

import Phaser from 'phaser';
import { advance, choose, currentLine, fillLine, loadScenario, recordScenario, scenarioCoins, scenarioStars, startScenario, type Profile, type Scenario, type ScenarioLine, type ScenarioState, type StageCue } from '@dojo/sim';
import storeData from '../../../../content/street-smarts/store-separated.json';
import storeRoom from '../../../../content/street-smarts/store-room.json';
import uiData from '../../../../content/street-smarts/ui.json';
import { addStatic, characterArt, characterTop, loadArt, staticSprites } from '../art/art';
import { LayeredSprite } from '../art/LayeredSprite';
import { addShadow, makePlayerSprite, playLocomotion } from '../art/player';
import { hush, speak } from '../audio/voice';
import { loadSave, writeSave } from '../game/save';
import { currentTraining } from '../game/student';
import { localDay } from '../game/lessons';
import { loadLook, playerPacks } from '../game/look';
import { reducedMotion } from '../game/motion';
import { sfx } from '../audio/Sfx';
import { FONT, crisp, view, hiDpi } from '../ui/theme';
import { GREEN } from '../ui/tokens';
import { TILE } from './WalkScene';

/** Every Street Smarts scenario (the Street Smarts House lists them). */
export const SCENARIOS: Record<string, Scenario> = { [storeData.id]: loadScenario(storeData) };
const ROOMS: Record<string, RoomFile> = { [storeRoom.id]: storeRoom as RoomFile };
const UI = uiData as typeof uiData & { speakers: Record<string, string> };
const SPEAK_KEY = 'dojo-ascent-street-speak';
/** A new button (or a new line, for the tap-to-skip) ignores a press this soon after it appears (B6). */
const TAP_GUARD_MS = 350;
const DIRS = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
/** Walking speeds in tiles per second. */
const SPEED = { walk: 2.6, hurry: 4.2 };
/** The words stay this long after they're said (or read), before the story moves on. */
const HOLD_MS = 650;
const COS35 = Math.cos((35 * Math.PI) / 180);
/** Sensei's portrait: the head instructor's staff character (swap here if Sensei gets his own art). */
const SENSEI_PACK = 'staff-jay';
/** One phone voice, pitched to sound like different people. */
const PITCH: Record<string, number> = { sensei: 0.75, narrator: 1.0, player: 1.35, grownup: 1.1, worker: 1.15, cashier: 1.2, shopper: 0.95, stranger: 1.0 };
const TOP_H = 44;
const PANEL = 0x221d2e;

interface RoomFile {
  id: string;
  pack: string;
  roomSprite: string;
  marks: Record<string, number[]>;
  cast: Record<string, string | Record<string, string>>;
}

interface Actor {
  id: string;
  box: Phaser.GameObjects.Container;
  sprite: LayeredSprite | null;
  hero: boolean;
  /** Feet position in tiles. */
  x: number;
  y: number;
  top: number;
}

export class StreetSmartsScene extends Phaser.Scene {
  private sc!: Scenario;
  private room!: RoomFile;
  private st!: ScenarioState;
  private profile!: Profile;
  private player = '';
  private speakOn = true;
  private picking = false;
  /** Coins the last finish earned (Nov 23). */
  private coinsEarned = 0;
  /** Where Back goes: the Home Dojo, or (Nov 23) the Street Smarts House. */
  private back = 'Dojo';

  private stage!: Phaser.GameObjects.Container;
  private standLayer!: Phaser.GameObjects.Container;
  private ui!: Phaser.GameObjects.Container;
  private panelLayer!: Phaser.GameObjects.Container;
  private actors = new Map<string, Actor>();
  private fit: string[] = [];
  private camTween: Phaser.Tweens.Tween | null = null;
  private panelH = 0;
  private senseiBox: Phaser.GameObjects.Container | null = null;
  private lastSpeaker = '';

  /** Bumped whenever a line's flow should stop (next line, leaving, restarting). */
  private token = 0;
  /** True while the current line's moves are being hurried to their end. */
  private hurry = false;
  private running = new Set<Phaser.Tweens.Tween | Phaser.Time.TimerEvent>();
  private kicks = new Set<() => void>();
  private lineAt = 0;
  private awaiting: 'none' | 'moves' | 'words' | 'choice' | 'tap' | 'end' = 'none';
  private tapTargets: Phaser.GameObjects.GameObject[] = [];
  /** A replay (the lesson has been finished before) can skip ahead to the next question. */
  private canSkip = false;
  /** Skip was pressed: lines play at once, silently, until the next question. */
  private skipping = false;

  constructor() {
    super('StreetSmarts');
  }

  init(data: { id?: string; back?: string }): void {
    this.sc = SCENARIOS[data?.id ?? ''] ?? SCENARIOS[storeData.id];
    this.room = ROOMS[this.sc.room] ?? ROOMS.store;
    this.back = data?.back ?? 'Dojo';
  }

  preload(): void {
    const cast = Object.values(this.room.cast).flatMap((v) => (typeof v === 'string' ? [v] : Object.values(v)));
    loadArt(this, [...playerPacks(), this.room.pack, ...cast, SENSEI_PACK]);
  }

  create(): void {
    hiDpi(this.cameras.main);
    this.profile = loadSave();
    this.player = currentTraining().firstName;
    this.speakOn = loadSpeak(this.sc.ageBand);
    this.st = startScenario();
    this.coinsEarned = 0;
    this.canSkip = this.profile.streetSmarts.best[this.sc.id] !== undefined;
    this.picking = this.profile.streetSmarts.grownup === null;
    this.actors.clear();
    this.fit = [];
    this.senseiBox = null;
    this.lastSpeaker = '';
    this.add.rectangle(0, 0, 4000, 4000, 0x2a2533).setOrigin(0).setDepth(-10);
    this.stage = this.add.container(0, 0);
    this.standLayer = this.add.container(0, 0);
    this.panelLayer = this.add.container(0, 0).setDepth(20);
    this.ui = this.add.container(0, 0).setDepth(30);
    this.buildRoom();
    this.input.on(Phaser.Input.Events.POINTER_UP, this.onStageTap, this);
    this.scale.on(Phaser.Scale.Events.RESIZE, this.onResize, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.token++;
      this.scale.off(Phaser.Scale.Events.RESIZE, this.onResize, this);
      this.input.off(Phaser.Input.Events.POINTER_UP, this.onStageTap, this);
      hush();
    });
    this.drawTop();
    if (this.picking) {
      void this.moveCamera(['enter-player', 'toy-player', 'hide-spot'], 0);
      this.renderPick();
    }
    else this.startStory();
  }

  update(): void {
    this.standLayer.sort('depth');
  }

  private vars() {
    return { player: this.player, grownup: this.profile.streetSmarts.grownup ?? UI.grownups[0] };
  }

  // ------------------------------------------------------------------ the room and the people

  private buildRoom(): void {
    const pack = this.room.pack;
    const [floor, walls, props, front] = addStatic(this, pack, this.room.roomSprite, 0, 0);
    this.stage.add([floor, walls, props].filter(Boolean));
    for (const [id, s] of Object.entries(staticSprites(this, pack))) {
      if (id === this.room.roomSprite || !s.anchorTile || s.sortRow === undefined) continue;
      const images = addStatic(this, pack, id, s.anchorTile[0] * TILE, s.anchorTile[1] * TILE);
      for (const img of images) img.setDepth(s.sortRow * TILE);
      this.standLayer.add(images);
    }
    this.stage.add(this.standLayer);
    if (front) this.stage.add(front);
    const ids = new Set(['player', ...this.sc.scenes.flatMap((s) => [...s.lines, ...Object.values(s.branches).flat()]).flatMap((l) => (l.stage ?? []).map((c) => c.who ?? '')).filter(Boolean)]);
    for (const id of ids) this.makeActor(id);
  }

  private makeActor(id: string): void {
    let sprite: LayeredSprite | null = null;
    if (id === 'player') {
      const t = currentTraining();
      sprite = makePlayerSprite(this, t.belt, t.stripesThisBelt, loadLook());
    } else {
      const c = this.room.cast[id];
      const pack = typeof c === 'string' ? c : c?.[this.vars().grownup];
      const art = pack ? characterArt(this, pack, 'people') : null;
      if (art) {
        sprite = new LayeredSprite(this, art);
        sprite.container.addAt(addShadow(this, art.frameWidth * 0.42), 0);
        sprite.play('npc_idle');
      }
    }
    sprite?.autoUpdate();
    const box = this.add.container(0, 0, sprite ? [sprite.container] : []).setVisible(false);
    const top = sprite ? characterTop(this, sprite.art) : TILE * 1.8;
    this.standLayer.add(box);
    this.actors.set(id, { id, box, sprite, hero: id === 'player', x: 0, y: 0, top });
  }

  /** A room mark in stage pixels (marks up on a wall have a height). */
  private markPx(name: string): { x: number; y: number } {
    const m = this.room.marks[name];
    if (m) return { x: m[0] * TILE, y: (m[1] - (m[2] ?? 0) * COS35) * TILE };
    const a = this.actors.get(name);
    return a ? { x: a.x * TILE, y: a.y * TILE } : { x: 0, y: 0 };
  }

  private setActor(a: Actor, x: number, y: number): void {
    a.x = x;
    a.y = y;
    a.box.setPosition(x * TILE, y * TILE).setDepth(y * TILE);
  }

  private idle(a: Actor): void {
    if (!a.sprite) return;
    if (a.hero) playLocomotion(a.sprite, 0);
    else a.sprite.play('npc_idle');
  }

  // ------------------------------------------------------------------ the camera (the stage container moves)

  /** The part of the screen the store shows in: under the top bar, above the caption panel. */
  private viewport(): { x: number; y: number; w: number; h: number } {
    const { width, height } = view(this);
    return { x: 0, y: TOP_H, w: width, h: Math.max(80, height - TOP_H - this.panelH) };
  }

  private cameraFor(marks: string[]): { s: number; x: number; y: number } {
    const pts = marks.map((m) => this.markPx(m));
    if (pts.length === 0) pts.push({ x: 8 * TILE, y: 5 * TILE });
    const pad = TILE * 1.2;
    const x0 = Math.min(...pts.map((p) => p.x)) - pad;
    const x1 = Math.max(...pts.map((p) => p.x)) + pad;
    const y0 = Math.min(...pts.map((p) => p.y)) - TILE * 2.6; // room for heads above the feet
    const y1 = Math.max(...pts.map((p) => p.y)) + TILE * 0.6;
    const vp = this.viewport();
    const s = Phaser.Math.Clamp(Math.min(vp.w / (x1 - x0), vp.h / (y1 - y0)), 0.45, 1.35);
    return { s, x: vp.x + vp.w / 2 - ((x0 + x1) / 2) * s, y: vp.y + vp.h / 2 - ((y0 + y1) / 2) * s };
  }

  private moveCamera(marks: string[], ms: number): Promise<void> {
    this.fit = marks;
    const c = this.cameraFor(marks);
    this.camTween?.stop();
    if (ms <= 0 || this.hurry || reducedMotion()) {
      this.stage.setScale(c.s).setPosition(c.x, c.y);
      return Promise.resolve();
    }
    this.camTween = this.tweens.add({ targets: this.stage, scale: c.s, x: c.x, y: c.y, duration: ms, ease: 'Sine.easeInOut' });
    return this.track(this.camTween);
  }

  private onResize(): void {
    this.drawTop();
    if (this.awaiting !== 'end' && !this.picking) this.drawPanel(currentLine(this.sc, this.st));
    void this.moveCamera(this.fit, 0);
  }

  // ------------------------------------------------------------------ running a line

  private startStory(): void {
    void this.moveCamera(['enter-player', 'toy-player'], 0);
    void this.playLine();
  }

  /** Wraps a tween or timer so a skip can finish it at once. */
  private track(t: Phaser.Tweens.Tween | Phaser.Time.TimerEvent): Promise<void> {
    return new Promise((resolve) => {
      this.running.add(t);
      const done = () => {
        this.running.delete(t);
        resolve();
      };
      if (t instanceof Phaser.Tweens.Tween) t.once(Phaser.Tweens.Events.TWEEN_COMPLETE, done).once(Phaser.Tweens.Events.TWEEN_STOP, done);
      else {
        const cb = t.callback;
        t.callback = (...args: unknown[]) => {
          cb?.(...args);
          done();
        };
      }
    });
  }

  private wait(ms: number): Promise<void> {
    if (this.hurry) return Promise.resolve();
    return this.track(this.time.delayedCall(ms, () => undefined));
  }

  /** Finishes every running move at once (and everything still to come on this line). */
  private hurryUp(): void {
    this.hurry = true;
    for (const t of [...this.running]) {
      if (t instanceof Phaser.Tweens.Tween) t.complete();
      else {
        t.remove(true);
      }
    }
    this.running.clear();
    for (const k of [...this.kicks]) k();
  }

  /** Waits for the words, or a tap. */
  private waitKick(ms: number): Promise<void> {
    if (this.hurry) return Promise.resolve();
    return new Promise((resolve) => {
      const done = () => {
        this.kicks.delete(done);
        timer.remove(false);
        resolve();
      };
      const timer = this.time.delayedCall(ms, done);
      this.kicks.add(done);
    });
  }

  private async playLine(): Promise<void> {
    const my = ++this.token;
    this.clearTargets();
    if (this.st.done) return this.finish();
    const line = currentLine(this.sc, this.st)!;
    if (line.choices) this.skipping = false;
    this.hurry = this.skipping;
    this.lineAt = this.time.now;
    const after = line.say === 'after' && (line.stage?.length ?? 0) > 0;
    this.awaiting = 'moves';
    if (after) this.drawPanel(null);
    else this.showLine(line);
    await this.runStage(line.stage ?? []);
    if (my !== this.token) return;
    this.hurry = this.skipping;
    if (after) this.showLine(line);
    if (line.choices) {
      this.awaiting = line.tap ? 'tap' : 'choice';
      if (line.tap) this.showTargets(line);
      return;
    }
    this.awaiting = 'words';
    await this.wordsDone;
    if (my !== this.token) return;
    await this.waitKick(HOLD_MS);
    if (my !== this.token) return;
    this.next();
  }

  /** Resolves once the current line's words are said (or would have been read). */
  private wordsDone: Promise<void> = Promise.resolve();

  /** Draws the caption (or the question and its buttons) and reads it aloud. */
  private showLine(line: ScenarioLine): void {
    this.drawPanel(line);
    const body = fillLine(line.text, this.vars());
    const extra = line.choices && !line.tap ? line.choices.map((c) => fillLine(c.text, this.vars())) : [];
    const words = [body, ...extra].join(' ');
    const readMs = Math.max(1600, words.split(/\s+/).length * 330);
    if (line.speaker === 'sensei' && this.lastSpeaker !== 'sensei') this.chime();
    this.lastSpeaker = line.speaker;
    if (this.skipping) {
      this.wordsDone = Promise.resolve();
      return;
    }
    this.wordsDone = new Promise((resolve) => {
      let settled = false;
      const done = () => {
        if (settled) return;
        settled = true;
        this.kicks.delete(done);
        resolve();
      };
      this.kicks.add(done);
      if (this.speakOn) {
        speak(words, { rate: 0.92, pitch: PITCH[line.speaker] ?? 1, onEnd: done });
        // Some phones never say "done": move on after a generous reading time anyway.
        this.time.delayedCall(readMs * 1.8 + 1500, done);
      } else this.time.delayedCall(readMs, done);
    });
  }

  private async runStage(cues: StageCue[]): Promise<void> {
    // Cues play in order; a cue with "with" joins the group before it.
    const groups: StageCue[][] = [];
    for (const c of cues) {
      if (c.with && groups.length) groups[groups.length - 1].push(c);
      else groups.push([c]);
    }
    for (const g of groups) await Promise.all(g.map((c) => this.cue(c)));
  }

  private cue(c: StageCue): Promise<void> {
    const a = c.who ? this.actors.get(c.who) : undefined;
    switch (c.do) {
      case 'place': {
        if (!a) return Promise.resolve();
        const m = this.room.marks[c.to!];
        this.setActor(a, m[0], m[1]);
        a.box.setVisible(true).setAlpha(1);
        if (c.dir) a.sprite?.setDirection(DIRS.indexOf(c.dir));
        this.idle(a);
        return Promise.resolve();
      }
      case 'show':
        a?.box.setVisible(true).setAlpha(1);
        return Promise.resolve();
      case 'hide': {
        if (!a) return Promise.resolve();
        if (this.hurry) {
          a.box.setVisible(false);
          return Promise.resolve();
        }
        return this.track(this.tweens.add({ targets: a.box, alpha: 0, duration: 400, onComplete: () => a.box.setVisible(false) })).then(() => {
          a.box.setVisible(false);
        });
      }
      case 'face':
        if (a && c.dir) a.sprite?.setDirection(DIRS.indexOf(c.dir));
        return Promise.resolve();
      case 'walk':
        return a ? this.walk(a, [...(c.via ?? []), c.to!], c.speed === 'hurry' ? SPEED.hurry : SPEED.walk) : Promise.resolve();
      case 'anim': {
        if (!a?.sprite) return Promise.resolve();
        const name = a.hero ? c.anim! : `npc_${c.anim}`;
        a.sprite.play(name, { restart: true });
        return this.wait(1400).then(() => this.idle(a));
      }
      case 'emote':
        return this.emote(c, a);
      case 'camera':
        return this.moveCamera(c.fit ?? [], 700);
      case 'pause':
        return this.wait((c.secs ?? 0) * 1000);
    }
    return Promise.resolve();
  }

  private async walk(a: Actor, path: string[], speed: number): Promise<void> {
    const pts = [{ x: a.x, y: a.y }, ...path.map((m) => ({ x: this.room.marks[m][0], y: this.room.marks[m][1] }))];
    a.box.setVisible(true).setAlpha(1);
    for (let i = 1; i < pts.length; i++) {
      const from = pts[i - 1];
      const to = pts[i];
      const dist = Math.hypot(to.x - from.x, to.y - from.y);
      if (dist < 0.01) continue;
      if (a.sprite) {
        a.sprite.face(to.x - from.x, to.y - from.y);
        if (a.hero) playLocomotion(a.sprite, speed);
        else a.sprite.play('npc_walk', { speed: speed / SPEED.walk });
      }
      if (this.hurry) {
        this.setActor(a, to.x, to.y);
        continue;
      }
      const p = { t: 0 };
      await this.track(
        this.tweens.add({
          targets: p,
          t: 1,
          duration: (dist / speed) * 1000,
          onUpdate: () => this.setActor(a, from.x + (to.x - from.x) * p.t, from.y + (to.y - from.y) * p.t),
          onComplete: () => this.setActor(a, to.x, to.y),
        }),
      );
      this.setActor(a, to.x, to.y);
    }
    this.idle(a);
  }

  /** A little picture over someone's head (or at a spot on the wall) that pops in and floats away. */
  private emote(c: StageCue, a: Actor | undefined): Promise<void> {
    const at = a ? { x: a.x * TILE, y: a.y * TILE - a.top - 14 } : this.markPx(c.to!);
    const g = this.add.container(at.x, at.y).setDepth(1e6);
    this.stage.add(g);
    const kind = c.emote;
    if (kind === 'question' || kind === 'toy') {
      const bubble = this.add.graphics();
      bubble.fillStyle(0xffffff, 1).fillRoundedRect(-22, -44, 44, 40, 14).fillTriangle(-6, -6, 6, -6, 0, 4);
      bubble.lineStyle(2.5, 0x2a2533, 1).strokeRoundedRect(-22, -44, 44, 40, 14);
      g.add(bubble);
      if (kind === 'question') g.add(this.add.text(0, -24, '?', { fontFamily: FONT, fontStyle: 'bold', fontSize: '30px', color: '#e8574a' }).setOrigin(0.5).setResolution(crisp()));
      else g.add(this.toyIcon(0, -24));
      sfx.tap();
    } else if (kind === 'hearts') {
      for (let i = 0; i < 3; i++) {
        const h = this.add.text((i - 1) * 18, -8 - i * 6, '♥', { fontFamily: FONT, fontSize: '26px', color: '#ef5f8f' }).setOrigin(0.5).setResolution(crisp());
        g.add(h);
        if (!reducedMotion()) this.tweens.add({ targets: h, y: h.y - 30, duration: 1400, delay: i * 160, ease: 'Sine.easeOut' });
      }
      sfx.shrine();
    } else if (kind === 'sound') {
      for (let i = 0; i < 3; i++) {
        const arc = this.add.graphics();
        arc.lineStyle(4, 0xffd166, 1);
        arc.beginPath().arc(0, 0, 22 + i * 14, Phaser.Math.DegToRad(40), Phaser.Math.DegToRad(140)).strokePath();
        g.add(arc);
        if (!reducedMotion()) this.tweens.add({ targets: arc, alpha: { from: 0, to: 1 }, duration: 300, delay: i * 200, yoyo: true, repeat: 2 });
      }
      g.add(this.add.text(30, -10, '♪', { fontFamily: FONT, fontSize: '28px', color: '#ffd166' }).setOrigin(0.5).setResolution(crisp()));
      this.dingDong();
    }
    g.setScale(0.2);
    this.tweens.add({ targets: g, scale: 1, duration: 220, ease: 'Back.easeOut' });
    this.time.delayedCall(kind === 'question' ? 3600 : 3000, () => this.tweens.add({ targets: g, alpha: 0, duration: 300, onComplete: () => g.destroy() }));
    return this.wait(kind === 'toy' ? 1600 : 1000);
  }

  /** A little toy robot (drawn in code). */
  private toyIcon(x: number, y: number): Phaser.GameObjects.Graphics {
    const t = this.add.graphics({ x, y });
    t.fillStyle(0x8a96a3, 1).fillRoundedRect(-9, -14, 18, 13, 3);
    t.fillStyle(0x7fd0f0, 1).fillCircle(-4, -8, 2.5).fillCircle(4, -8, 2.5);
    t.fillStyle(0xe8574a, 1).fillRoundedRect(-11, 0, 22, 13, 3);
    t.fillStyle(0xf6d55c, 1).fillCircle(0, -17, 2.5);
    t.lineStyle(1.5, 0x2a2533, 1).strokeRoundedRect(-9, -14, 18, 13, 3).strokeRoundedRect(-11, 0, 22, 13, 3);
    return t;
  }

  private chime(): void {
    sfx.insight();
  }

  private dingDong(): void {
    sfx.shrine();
  }

  // ------------------------------------------------------------------ taps

  private onStageTap(pointer: Phaser.Input.Pointer, over: Phaser.GameObjects.GameObject[]): void {
    if (over.length) return; // a button or a tap target handles it
    if (this.time.now - this.lineAt < TAP_GUARD_MS) return;
    if (pointer.worldY < TOP_H) return; // world units = screen points here (hiDpi camera, no scroll)
    if (this.awaiting === 'moves' || this.awaiting === 'words') {
      sfx.unlock();
      hush();
      this.hurryUp();
      // The words, if still on their way, are finished too: the next tap-free moment moves the story on.
      if (this.awaiting === 'words') this.next();
    }
  }

  private next(): void {
    hush();
    this.token++;
    this.st = advance(this.sc, this.st);
    if (this.st.done) return this.finish();
    void this.playLine();
  }

  private pick(i: number): void {
    hush();
    this.token++;
    this.clearTargets();
    this.st = choose(this.sc, this.st, i);
    void this.playLine();
  }

  /** On a replay: plays every line up to the next question at once (the moves still happen, so everyone ends up in place). */
  private skipAhead(): void {
    if (this.awaiting !== 'moves' && this.awaiting !== 'words') return;
    this.skipping = true;
    hush();
    this.hurryUp();
  }

  private finish(): void {
    if (this.awaiting === 'end') return;
    this.awaiting = 'end';
    const stars = scenarioStars(this.sc, this.st);
    // Nov 23: lessons earn coins (the first finish and every new star most)
    this.coinsEarned = scenarioCoins(this.profile, this.sc.id, stars, this.profile.streetSmarts.best[this.sc.id], localDay());
    recordScenario(this.profile, this.sc.id, stars);
    writeSave(this.profile);
    this.renderEnd();
  }

  // ------------------------------------------------------------------ the tap moment

  private showTargets(line: ScenarioLine): void {
    this.clearTargets();
    (line.choices ?? []).forEach((ch, i) => {
      const a = this.actors.get(ch.target!);
      const feet = a ? { x: a.x * TILE, y: a.y * TILE } : this.markPx(ch.target!);
      const h = a ? a.top : TILE * 1.2;
      const ring = this.add.graphics({ x: feet.x, y: feet.y }).setDepth(feet.y - 1);
      ring.lineStyle(4, 0xffd166, 1).strokeEllipse(0, 0, TILE * 1.3, TILE * 0.62);
      this.standLayer.add(ring);
      const label = this.add
        .text(feet.x, feet.y - h - 8, fillLine(ch.text, this.vars()), { fontFamily: FONT, fontStyle: 'bold', fontSize: '15px', color: '#2a1d10', backgroundColor: '#ffd166', padding: { x: 8, y: 4 } })
        .setOrigin(0.5, 1)
        .setResolution(crisp())
        .setDepth(1e6 - 1);
      // Labels stay a readable size however far the camera is zoomed out.
      label.setScale(1 / Math.max(0.6, this.stage.scale));
      this.stage.add(label);
      const zone = this.add.zone(feet.x, feet.y - h / 2, Math.max(TILE * 1.4, 60), h + 24).setDepth(1e6);
      this.stage.add(zone);
      const shownAt = this.time.now;
      let pressed = false;
      for (const t of [zone, label]) {
        t.setInteractive({ useHandCursor: true })
          .on(Phaser.Input.Events.GAMEOBJECT_POINTER_DOWN, () => {
            pressed = this.time.now - shownAt >= TAP_GUARD_MS;
          })
          .on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, () => {
            if (!pressed || this.awaiting !== 'tap') return;
            pressed = false;
            sfx.unlock();
            sfx.tap();
            this.pick(i);
          });
      }
      if (!reducedMotion()) this.tweens.add({ targets: ring, scale: 1.15, alpha: 0.6, duration: 650, yoyo: true, repeat: -1 });
      this.tapTargets.push(ring, label, zone);
    });
  }

  private clearTargets(): void {
    for (const t of this.tapTargets) t.destroy();
    this.tapTargets = [];
  }

  // ------------------------------------------------------------------ the screen around the store

  private drawTop(): void {
    this.ui.removeAll(true);
    const { width } = view(this);
    const pad = 12;
    const bar = this.add.rectangle(0, 0, width, TOP_H, 0x1c1826, 0.92).setOrigin(0);
    this.ui.add(bar);
    this.text(this.ui, pad, 12, UI.title, 18, '#ffd166', true);
    let x = width - pad - 44;
    this.button(this.ui, x, 6, 44, 32, '✕', 0x3a3a4a, 16, () => this.leave());
    x -= 8 + 110;
    this.button(this.ui, x, 6, 110, 32, this.speakOn ? UI.speakOn : UI.speakOff, this.speakOn ? 0x3a6ea5 : 0x3a3a4a, 13, () => this.toggleSpeak());
    if (this.canSkip && !this.picking && this.awaiting !== 'end') {
      x -= 8 + 90;
      this.button(this.ui, x, 6, 90, 32, UI.skip, 0x4a3f63, 13, () => this.skipAhead());
    }
  }

  /** The caption panel at the bottom: who speaks and the words, or the question with its answer buttons. */
  private drawPanel(line: ScenarioLine | null): void {
    this.panelLayer.removeAll(true);
    this.senseiBox?.destroy();
    this.senseiBox = null;
    const { width, height } = view(this);
    const pad = 12;
    if (!line) {
      this.setPanelH(0);
      return;
    }
    const big = width < 700 ? 19 : 21;
    const body = fillLine(line.text, this.vars());
    const choices = line.choices && !line.tap ? line.choices : [];
    const cols = choices.length >= 2 && width >= 520 ? 2 : 1;
    const rows = choices.length ? Math.ceil(choices.length / cols) : 0;
    const btnH = choices.length ? Math.max(48, Math.min(60, (height * 0.4) / rows - 8)) : 0;
    const sensei = line.speaker === 'sensei';
    const left = sensei ? 92 : pad;
    const wrapW = width - left - pad * 2;
    const probe = this.add.text(0, 0, body, { fontFamily: FONT, fontStyle: 'bold', fontSize: `${big}px`, wordWrap: { width: wrapW } });
    const textH = probe.height;
    probe.destroy();
    const who = fillLine(UI.speakers[line.speaker] ?? '', this.vars());
    const h = 14 + (who ? 18 : 0) + textH + 12 + (rows ? rows * (btnH + 8) + 2 : 0);
    const y = height - h;
    const g = this.add.graphics();
    g.fillStyle(PANEL, 1).fillRect(0, y, width, h);
    g.lineStyle(3, sensei ? 0xffd166 : 0x4a4360, 1).lineBetween(0, y, width, y);
    this.panelLayer.add(g);
    let ty = y + 10;
    if (who) {
      const tag = this.add
        .text(left + (sensei ? 0 : 0), ty, who, { fontFamily: sensei ? 'Georgia, serif' : FONT, fontStyle: 'bold', fontSize: '14px', color: sensei ? '#2a1d10' : '#ffd166', backgroundColor: sensei ? '#ffd166' : undefined, padding: sensei ? { x: 8, y: 2 } : undefined })
        .setResolution(crisp());
      this.panelLayer.add(tag);
      ty += 20;
    }
    this.text(this.panelLayer, sensei ? left + wrapW / 2 : width / 2, ty, body, big, '#ffffff', true, wrapW).setOrigin(0.5, 0).setAlign('center');
    if (rows) {
      const by = ty + textH + 10;
      const colW = (width - pad * 2 - (cols - 1) * 8) / cols;
      choices.forEach((c, i) => {
        const col = i % cols;
        const row = Math.floor(i / cols);
        this.button(this.panelLayer, pad + col * (colW + 8), by + row * (btnH + 8), colW, btnH, fillLine(c.text, this.vars()), 0x4a3f63, width < 700 ? 15 : 17, () => this.pick(i));
      });
    }
    if (sensei) this.showSensei(y);
    this.setPanelH(h);
  }

  private setPanelH(h: number): void {
    if (h === this.panelH) return;
    this.panelH = h;
    void this.moveCamera(this.fit, this.awaiting === 'moves' ? 0 : 300);
  }

  /** Sensei rises from behind the caption panel at the bottom left: he isn't in the store, he's in your head. */
  private showSensei(panelY: number): void {
    const box = this.add.container(0, 0).setDepth(19);
    const art = characterArt(this, SENSEI_PACK, 'staff');
    const x = 46;
    if (art) {
      const s = new LayeredSprite(this, art);
      s.setDirection(4).play('npc_idle');
      s.autoUpdate();
      // Head and shoulders above the panel, in a soft gold glow.
      const scale = 1.45;
      const top = characterTop(this, art) * scale;
      const glow = this.add.circle(x, panelY - top * 0.3, top * 0.42, 0xffd166, 0.35);
      s.container.setScale(scale).setPosition(x, panelY + top * 0.42);
      box.add([glow, s.container]);
    } else {
      const disc = this.add.circle(x, panelY - 10, 30, 0xffd166).setStrokeStyle(3, 0x2a1d10);
      box.add([disc, this.add.text(x, panelY - 10, '師', { fontFamily: FONT, fontStyle: 'bold', fontSize: '28px', color: '#2a1d10' }).setOrigin(0.5).setResolution(crisp())]);
    }
    if (!reducedMotion() && this.lastSpeaker !== 'sensei') {
      box.y = 60;
      this.tweens.add({ targets: box, y: 0, duration: 320, ease: 'Back.easeOut' });
    }
    this.senseiBox = box;
  }

  private renderPick(): void {
    const { width, height } = view(this);
    const layer = this.panelLayer;
    layer.removeAll(true);
    layer.add(this.add.rectangle(0, 0, width, height, 0x1c1826, 0.9).setOrigin(0));
    this.text(layer, width / 2, height * 0.3, UI.pickGrownup, 22, '#ffffff', true, width - 24).setOrigin(0.5).setAlign('center');
    const w = Math.min(180, (width - 48) / 2);
    UI.grownups.forEach((gname, i) => {
      this.button(layer, width / 2 + (i === 0 ? -w - 8 : 8), height * 0.45, w, 64, gname, GREEN, 22, () => {
        this.profile.streetSmarts.grownup = gname as 'Mom' | 'Dad';
        writeSave(this.profile);
        // The grown-up's art follows the pick.
        this.scene.restart({ id: this.sc.id, back: this.back });
      });
    });
    this.sayText(UI.pickGrownup);
  }

  private renderEnd(): void {
    hush();
    this.clearTargets();
    this.senseiBox?.destroy();
    this.senseiBox = null;
    this.drawTop();
    const { width, height } = view(this);
    const layer = this.panelLayer;
    layer.removeAll(true);
    layer.add(this.add.rectangle(0, TOP_H, width, height - TOP_H, 0x1c1826, 0.82).setOrigin(0));
    const stars = scenarioStars(this.sc, this.st);
    const max = this.sc.maxStars;
    const fill = (s: string) => s.replace('{stars}', String(stars)).replace(/\{max\}/g, String(max));
    this.text(layer, width / 2, height * 0.24, '★'.repeat(stars) + '☆'.repeat(max - stars), 48, '#ffd166', true).setOrigin(0.5);
    const msg = stars >= max ? fill(UI.starsAll) : `${fill(UI.starsEarned)} ${fill(UI.starsMore)}`;
    this.text(layer, width / 2, height * 0.42, msg, 20, '#ffffff', true, width - 40).setOrigin(0.5).setAlign('center');
    if (this.coinsEarned > 0) this.text(layer, width / 2, height * 0.52, `+${this.coinsEarned} coins`, 20, '#ffd166', true).setOrigin(0.5);
    const w = Math.min(220, (width - 48) / 2);
    this.button(layer, width / 2 - w - 8, height * 0.62, w, 56, UI.playAgain, 0x4a3f63, 17, () => this.scene.restart({ id: this.sc.id, back: this.back }));
    this.button(layer, width / 2 + 8, height * 0.62, w, 56, this.back === 'StreetHouse' ? UI.backHouse : UI.back, GREEN, 17, () => this.leave());
    this.sayText(msg);
  }

  private leave(): void {
    hush();
    this.token++;
    this.cameras.main.fadeOut(250, 10, 8, 16);
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => this.scene.start(this.back, { from: 'lesson' }));
  }

  private toggleSpeak(): void {
    this.speakOn = !this.speakOn;
    try {
      localStorage.setItem(SPEAK_KEY, this.speakOn ? 'on' : 'off');
    } catch {
      // Lasts until reload.
    }
    if (!this.speakOn) hush();
    this.drawTop();
  }

  private sayText(text: string): void {
    if (this.speakOn) speak(text, { rate: 0.92 });
  }

  private text(parent: Phaser.GameObjects.Container, x: number, y: number, str: string, size: number, color: string, bold = false, wrap?: number): Phaser.GameObjects.Text {
    const t = this.add
      .text(x, y, str, { fontFamily: FONT, fontSize: `${size}px`, color, fontStyle: bold ? 'bold' : 'normal', wordWrap: wrap ? { width: wrap } : undefined })
      .setResolution(crisp());
    parent.add(t);
    return t;
  }

  private button(parent: Phaser.GameObjects.Container, x: number, y: number, w: number, h: number, label: string, color: number, size: number, onTap: () => void): void {
    const bg = this.add.rectangle(x, y, w, h, color).setOrigin(0).setStrokeStyle(2, 0xffffff, 0.35);
    parent.add(bg);
    this.text(parent, x + w / 2, y + h / 2, label, size, '#ffffff', true, w - 12).setOrigin(0.5).setAlign('center');
    // Grok playtest Nov 23 (B6): a fast tap picked the answer drawn in the same spot. A button only
    // answers a press that started on it, and not in its first moment on screen.
    const shownAt = this.time.now;
    let pressed = false;
    bg.setInteractive({ useHandCursor: true })
      .on(Phaser.Input.Events.GAMEOBJECT_POINTER_DOWN, () => {
        pressed = this.time.now - shownAt >= TAP_GUARD_MS;
      })
      .on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, () => {
        if (!pressed) return;
        pressed = false;
        sfx.unlock();
        onTap();
      });
  }
}

/** Read-aloud is on by default for ages 6-9 (core rule 15); the player's own choice sticks. */
function loadSpeak(ageBand: string): boolean {
  try {
    const v = localStorage.getItem(SPEAK_KEY);
    if (v === 'on' || v === 'off') return v === 'on';
  } catch {
    // Use the default.
  }
  return ageBand === '6-9';
}
