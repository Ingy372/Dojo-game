// Street Smarts: an illustrated story scene from a script in content/street-smarts/.
// The rules package walks the script; this scene only draws it and reads it aloud.
// A not-best choice never shows danger: Sensei talks it over and the player tries again.

import Phaser from 'phaser';
import { advance, choose, currentLine, fillLine, loadScenario, recordScenario, scenarioStars, startScenario, type Profile, type Scenario, type ScenarioLine, type ScenarioState } from '@dojo/sim';
import storeData from '../../../../content/street-smarts/store-separated.json';
import uiData from '../../../../content/street-smarts/ui.json';
import { loadSave, writeSave } from '../game/save';
import { currentTraining } from '../game/student';
import { sfx } from '../audio/Sfx';
import { FONT, crisp, view, hiDpi } from '../ui/theme';
import { GREEN } from '../ui/tokens';

const SCENARIOS: Record<string, Scenario> = { [storeData.id]: loadScenario(storeData) };
const UI = uiData as typeof uiData & { speakers: Record<string, string> };
const SPEAK_KEY = 'dojo-ascent-street-speak';

/** Placeholder picture colours per speaker (until Street Smarts art arrives). */
const SPEAKER_COLOR: Record<string, number> = { sensei: 0xd9a066, worker: GREEN, grownup: 0xff8fa3, shopper: 0x8a8fa8, player: 0x4ea3ff, narrator: 0x6f6658 };

export class StreetSmartsScene extends Phaser.Scene {
  private sc!: Scenario;
  private st!: ScenarioState;
  private profile!: Profile;
  private player = '';
  private ui!: Phaser.GameObjects.Container;
  private speak = true;
  private picking = false;

  constructor() {
    super('StreetSmarts');
  }

  init(data: { id?: string }): void {
    this.sc = SCENARIOS[data?.id ?? ''] ?? SCENARIOS[storeData.id];
  }

  create(): void {
    hiDpi(this.cameras.main);
    this.profile = loadSave();
    this.player = currentTraining().firstName;
    this.speak = loadSpeak(this.sc.ageBand);
    this.st = startScenario();
    this.picking = this.profile.streetSmarts.grownup === null;
    this.ui = this.add.container(0, 0);
    this.render();
    this.scale.on(Phaser.Scale.Events.RESIZE, this.render, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.scale.off(Phaser.Scale.Events.RESIZE, this.render, this);
      window.speechSynthesis?.cancel();
    });
  }

  private vars() {
    return { player: this.player, grownup: this.profile.streetSmarts.grownup ?? UI.grownups[0] };
  }

  private render(): void {
    this.ui.removeAll(true);
    const { width, height } = view(this);
    const pad = 12;
    this.add.rectangle(0, 0, width, height, 0x1c1826).setOrigin(0).setDepth(-1);
    this.text(pad, 12, UI.title, 18, '#ffd166', true);
    this.button(width - pad - 44, 8, 44, 32, '✕', 0x3a3a4a, 16, () => this.leave());
    this.button(width - pad - 44 - 8 - 110, 8, 110, 32, this.speak ? UI.speakOn : UI.speakOff, this.speak ? 0x3a6ea5 : 0x3a3a4a, 13, () => this.toggleSpeak());

    if (this.picking) return this.renderPick(width, height);
    if (this.st.done) return this.renderEnd(width, height);
    const line = currentLine(this.sc, this.st)!;
    const choices = line.choices ?? [];
    // Buttons: one column for up to 3, two columns for 4-5 (each at least 44 px tall).
    const cols = choices.length > 3 && width < 900 ? 2 : 1;
    const rows = choices.length ? Math.ceil(choices.length / cols) : 1;
    const btnH = Math.max(44, Math.min(56, (height * 0.42) / rows - 8));
    const btnArea = rows * (btnH + 8);
    const textH = 64;
    const picTop = 48;
    const picH = Math.max(70, height - picTop - textH - btnArea - pad);
    this.renderPicture(pad, picTop, width - pad * 2, picH, line.speaker);
    const who = fillLine(UI.speakers[line.speaker] ?? '', this.vars());
    const body = fillLine(line.text, this.vars());
    const ty = picTop + picH + 8;
    if (who) this.text(pad, ty, who, 14, '#ffd166', true);
    const big = width < 700 ? 20 : 22;
    this.text(width / 2, ty + (who ? 18 : 6), body, big, '#ffffff', true, width - pad * 2).setOrigin(0.5, 0).setAlign('center');

    const by = height - btnArea - pad + 4;
    if (!choices.length) {
      const w = Math.min(260, width - pad * 2);
      this.button((width - w) / 2, by, w, btnH, `${UI.next} ▶`, GREEN, 18, () => this.next());
    } else {
      const colW = (width - pad * 2 - (cols - 1) * 8) / cols;
      choices.forEach((c, i) => {
        const col = i % cols;
        const row = Math.floor(i / cols);
        this.button(pad + col * (colW + 8), by + row * (btnH + 8), colW, btnH, fillLine(c.text, this.vars()), 0x4a3f63, width < 700 ? 15 : 17, () => this.pick(i));
      });
    }
    this.say(line, body);
  }

  /** A simple drawn store aisle with the speaker in front (placeholder art). */
  private renderPicture(x: number, y: number, w: number, h: number, speaker: string): void {
    const g = this.add.graphics();
    this.ui.add(g);
    g.fillStyle(0xf2e9d8, 1).fillRoundedRect(x, y, w, h, 10);
    g.fillStyle(0xd8cdb8, 1).fillRect(x, y + h * 0.72, w, h * 0.28);
    const shelfW = Math.min(150, w / 5);
    for (let sx = x + 16; sx + shelfW < x + w - 8; sx += shelfW + 24) {
      g.fillStyle(0x8a5a35, 1).fillRect(sx, y + h * 0.12, shelfW, h * 0.6);
      for (let r = 0; r < 3; r++) {
        const ry = y + h * (0.16 + r * 0.19);
        for (let i = 0; i < 4; i++) g.fillStyle([0xff7a45, 0x5cd6b0, 0x6fb7ff, 0xffd166][(i + r) % 4], 1).fillRect(sx + 6 + i * (shelfW - 12) / 4, ry, (shelfW - 12) / 4 - 4, h * 0.13);
      }
    }
    const r = Math.min(h * 0.28, 46);
    const cx = x + w / 2;
    const cy = y + h * 0.72 - r * 0.2;
    g.fillStyle(SPEAKER_COLOR[speaker] ?? 0x6f6658, 1).fillCircle(cx, cy, r);
    g.lineStyle(3, 0xffffff, 0.9).strokeCircle(cx, cy, r);
    const label = speaker === 'narrator' ? '…' : speaker === 'sensei' ? '師' : (fillLine(UI.speakers[speaker] ?? '?', this.vars())[0] ?? '?');
    this.text(cx, cy, label, Math.round(r * 0.9), '#ffffff', true).setOrigin(0.5);
  }

  private renderPick(width: number, height: number): void {
    this.text(width / 2, height * 0.3, UI.pickGrownup, 22, '#ffffff', true, width - 24).setOrigin(0.5).setAlign('center');
    const w = Math.min(180, (width - 48) / 2);
    UI.grownups.forEach((g, i) => {
      this.button(width / 2 + (i === 0 ? -w - 8 : 8), height * 0.45, w, 64, g, GREEN, 22, () => {
        this.profile.streetSmarts.grownup = g as 'Mom' | 'Dad';
        writeSave(this.profile);
        this.picking = false;
        this.render();
      });
    });
    this.sayText(UI.pickGrownup);
  }

  private renderEnd(width: number, height: number): void {
    const stars = scenarioStars(this.sc, this.st);
    const max = this.sc.maxStars;
    const fill = (s: string) => s.replace('{stars}', String(stars)).replace(/\{max\}/g, String(max));
    this.text(width / 2, height * 0.24, '★'.repeat(stars) + '☆'.repeat(max - stars), 48, '#ffd166', true).setOrigin(0.5);
    const msg = stars >= max ? fill(UI.starsAll) : `${fill(UI.starsEarned)} ${fill(UI.starsMore)}`;
    this.text(width / 2, height * 0.42, msg, 20, '#ffffff', true, width - 40).setOrigin(0.5).setAlign('center');
    const w = Math.min(220, (width - 48) / 2);
    this.button(width / 2 - w - 8, height * 0.62, w, 56, UI.playAgain, 0x4a3f63, 17, () => {
      this.st = startScenario();
      this.render();
    });
    this.button(width / 2 + 8, height * 0.62, w, 56, UI.back, GREEN, 17, () => this.leave());
    this.sayText(msg);
  }

  private next(): void {
    sfx.unlock();
    this.st = advance(this.sc, this.st);
    if (this.st.done) {
      recordScenario(this.profile, this.sc.id, scenarioStars(this.sc, this.st));
      writeSave(this.profile);
    }
    this.render();
  }

  private pick(i: number): void {
    this.st = choose(this.sc, this.st, i);
    this.render();
  }

  private leave(): void {
    window.speechSynthesis?.cancel();
    this.cameras.main.fadeOut(250, 10, 8, 16);
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => this.scene.start('Dojo'));
  }

  private toggleSpeak(): void {
    this.speak = !this.speak;
    try {
      localStorage.setItem(SPEAK_KEY, this.speak ? 'on' : 'off');
    } catch {
      // Lasts until reload.
    }
    if (!this.speak) window.speechSynthesis?.cancel();
    this.render();
  }

  /** Reads the line aloud, then the choice buttons, with the browser's built-in voice. */
  private say(line: ScenarioLine, body: string): void {
    const extra = (line.choices ?? []).map((c) => fillLine(c.text, this.vars()));
    this.sayText([body, ...extra].join(' '));
  }

  private sayText(text: string): void {
    const synth = window.speechSynthesis;
    if (!this.speak || !synth) return;
    synth.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.9;
    synth.speak(u);
  }

  private text(x: number, y: number, str: string, size: number, color: string, bold = false, wrap?: number): Phaser.GameObjects.Text {
    const t = this.add
      .text(x, y, str, { fontFamily: FONT, fontSize: `${size}px`, color, fontStyle: bold ? 'bold' : 'normal', wordWrap: wrap ? { width: wrap } : undefined })
      .setResolution(crisp());
    this.ui.add(t);
    return t;
  }

  private button(x: number, y: number, w: number, h: number, label: string, color: number, size: number, onTap: () => void): void {
    const bg = this.add.rectangle(x, y, w, h, color).setOrigin(0).setStrokeStyle(2, 0xffffff, 0.35);
    this.ui.add(bg);
    this.text(x + w / 2, y + h / 2, label, size, '#ffffff', true, w - 12).setOrigin(0.5).setAlign('center');
    bg.setInteractive({ useHandCursor: true }).on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, () => {
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
