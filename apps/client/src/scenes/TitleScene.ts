import SCREENS from '../../../../content/settings/screens.json';
import Phaser from 'phaser';
import { hiDpi, view } from '../ui/theme';

declare const __BUILD_TIME__: string;
import { loadArt } from '../art/art';
import { hasLook, playerPacks } from '../game/look';
import { sfx } from '../audio/Sfx';
import { reducedMotion } from '../game/motion';
import { markSavedNoteSeen, needsSavedNote, testFlags } from '../game/beta';
import SAFE_TEXT from '../../../../content/settings/safety.json';
import { GREEN } from '../ui/tokens';

export class TitleScene extends Phaser.Scene {
  private title!: Phaser.GameObjects.Text;
  private subtitle!: Phaser.GameObjects.Text;
  private belt!: Phaser.GameObjects.Rectangle;
  private prompt!: Phaser.GameObjects.Text;

  constructor() {
    super('Title');
  }

  preload(): void {
    // The character's art is used everywhere, so it loads first (with a small note while it does).
    hiDpi(this.cameras.main);
    const { width, height } = view(this);
    const note = this.add
      .text(width / 2, height / 2, 'Loading…', { fontFamily: 'system-ui, sans-serif', fontSize: '18px', color: '#b9ad99' })
      .setOrigin(0.5)
      .setResolution(window.devicePixelRatio || 1);
    this.load.once(Phaser.Loader.Events.COMPLETE, () => note.destroy());
    loadArt(this, playerPacks());
  }

  create(): void {
    hiDpi(this.cameras.main);
    const crisp = window.devicePixelRatio || 1;

    this.title = this.add
      .text(0, 0, 'Dojo Ascent', {
        fontFamily: 'Georgia, serif',
        color: '#f2e9d8',
        fontStyle: 'bold',
      })
      .setOrigin(0.5)
      .setResolution(crisp);

    // Placeholder white belt under the title.
    this.belt = this.add.rectangle(0, 0, 10, 10, 0xffffff);

    this.subtitle = this.add
      .text(0, 0, SCREENS.titleLine, {
        fontFamily: 'system-ui, sans-serif',
        color: '#b9ad99',
      })
      .setOrigin(0.5)
      .setResolution(crisp);

    this.prompt = this.add
      .text(0, 0, 'Tap to start', {
        fontFamily: 'system-ui, sans-serif',
        color: '#f2e9d8',
      })
      .setOrigin(0.5)
      .setResolution(crisp);
    // The pulse stops with reduced motion.
    const pulse = this.tweens.add({ targets: this.prompt, alpha: 0.35, duration: 900, yoyo: true, repeat: -1 });

    // Reduced motion (K12; the switch is in Settings) stops it.
    if (reducedMotion()) {
      pulse.pause();
      this.prompt.setAlpha(1);
    }

    // Which version this is (when it was built), to check a phone has the newest one.
    const built = new Date(__BUILD_TIME__);
    const stamp = built.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
    this.add
      .text(8, 6, `Version: ${stamp}`, { fontFamily: 'system-ui, sans-serif', fontSize: '11px', color: '#6f6658' })
      .setResolution(crisp);

    let started = false;
    // B-SAFE: on first launch, a note that progress is saved only on this phone. A tap closes it.
    let note = needsSavedNote() ? this.savedNote() : null;
    this.input.on(Phaser.Input.Events.POINTER_UP, () => {
      if (note) {
        note.destroy();
        note = null;
        markSavedNoteSeen();
        return;
      }
      if (started) return;
      started = true;
      // Phones only allow sound after a touch, so switch it on here.
      sfx.unlock();
      const params = testFlags();
      if (params.get('room') === 'training') this.scene.start('Game');
      // Test link: ?street=store-separated opens a Street Smarts scenario straight away.
      else if (params.get('street')) this.scene.start('StreetSmarts', { id: params.get('street') });
      // A new student makes their character first.
      else if (!hasLook()) this.scene.start('Create', { first: true });
      else this.scene.start('Dojo');
    });

    this.layout();
    this.scale.on(Phaser.Scale.Events.RESIZE, this.layout, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.scale.off(Phaser.Scale.Events.RESIZE, this.layout, this);
    });
  }

  private savedNote(): Phaser.GameObjects.Container {
    const t = SAFE_TEXT;
    const { width, height } = view(this);
    const box = this.add.container(0, 0).setDepth(100);
    const w = Math.min(460, width - 40);
    box.add(this.add.rectangle(0, 0, width, height, 0x0a0810, 0.97).setOrigin(0));
    const title = this.add.text(width / 2, height * 0.18, t.savedNoteTitle, { fontFamily: 'Georgia, serif', fontStyle: 'bold', fontSize: '22px', color: '#ffd166' }).setOrigin(0.5, 0).setResolution(window.devicePixelRatio || 1);
    const body = this.add.text(width / 2, title.y + title.height + 14, t.savedNoteLines.join('\n\n'), { fontFamily: 'system-ui, sans-serif', fontSize: '16px', color: '#e8d9b5', align: 'center', wordWrap: { width: w } }).setOrigin(0.5, 0).setResolution(window.devicePixelRatio || 1);
    const by = Math.min(height - 12 - 44, body.y + body.height + 20);
    const ok = this.add.rectangle(width / 2 - 70, by, 140, 44, GREEN).setOrigin(0).setStrokeStyle(2, 0xffffff, 0.4);
    const okText = this.add.text(width / 2, by + 22, t.savedNoteButton, { fontFamily: 'system-ui, sans-serif', fontStyle: 'bold', fontSize: '16px', color: '#ffffff' }).setOrigin(0.5).setResolution(window.devicePixelRatio || 1);
    box.add([title, body, ok, okText]);
    return box;
  }

  private layout(): void {
    const size = view(this);
    const { width, height } = size;
    const cx = width / 2;
    const cy = height / 2;
    const titleSize = Math.round(Math.min(width * 0.09, height * 0.18));

    this.title.setFontSize(titleSize).setPosition(cx, cy - titleSize * 0.4);
    this.belt
      .setSize(Math.min(width * 0.4, titleSize * 6), Math.max(6, titleSize * 0.14))
      .setPosition(cx, cy + titleSize * 0.35);
    this.belt.setOrigin(0.5);
    this.subtitle
      .setFontSize(Math.max(14, Math.round(titleSize * 0.3)))
      .setPosition(cx, cy + titleSize * 0.85);
    this.prompt
      .setFontSize(Math.max(16, Math.round(titleSize * 0.32)))
      .setPosition(cx, cy + titleSize * 1.6);
  }
}
