// The cut scene frame (Story Chapters, Nov 24): letterbox bars, a caption, Skip and the timeline clock, shared by the
// opening cut scene and the chapter cut scenes. Each cut scene is a short timeline of `at(ms, fn)` calls; Skip
// (or the timeline's own end) calls `finish`, which clears every timer and runs `done` once.
import Phaser from 'phaser';
import { sfx } from '../audio/Sfx';
import { reducedMotion } from '../game/motion';
import { FONT, crisp, view } from './theme';

export interface CutsceneFrame {
  /** The screen layer (depth 90); add titles or overlays here. */
  ui: Phaser.GameObjects.Container;
  /** Runs fn ms after the start (a little sooner with Reduced motion). */
  at(ms: number, fn: () => void): void;
  /** Keeps a looping timer so finish() removes it. */
  keep(t: Phaser.Time.TimerEvent): void;
  say(line: string): void;
  hush(): void;
  /** Ends the cut scene: timers stop, the frame goes, then done() (once). */
  finish(): void;
  isOver(): boolean;
  /** Called when the frame is resized. */
  onLayout(fn: (width: number, height: number) => void): void;
}

export function cutsceneFrame(s: Phaser.Scene, done: () => void, opts: { skipLabel?: string; fadeOut?: boolean } = {}): CutsceneFrame {
  const still = reducedMotion();
  const timers: Phaser.Time.TimerEvent[] = [];
  const layouts: Array<(w: number, h: number) => void> = [];
  let over = false;

  const ui = s.add.container(0, 0).setDepth(90);
  const bars = s.add.graphics();
  const caption = s.add
    .text(0, 0, '', { fontFamily: FONT, fontStyle: 'bold', fontSize: '22px', color: '#ffffff', align: 'center', stroke: '#120e22', strokeThickness: 5 })
    .setOrigin(0.5)
    .setResolution(crisp())
    .setAlpha(0);
  const skip = s.add
    .text(0, 0, opts.skipLabel ?? 'Skip ▶', { fontFamily: FONT, fontStyle: 'bold', fontSize: '16px', color: '#ffffff', backgroundColor: 'rgba(20,18,28,0.65)', padding: { x: 12, y: 8 } })
    .setOrigin(1, 0)
    .setResolution(crisp())
    .setInteractive({ useHandCursor: true });
  ui.add([bars, caption, skip]);
  const layout = () => {
    const { width, height } = view(s);
    const bh = Math.round(height * 0.1);
    bars.clear().fillStyle(0x08060f, 1).fillRect(0, 0, width, bh).fillRect(0, height - bh, width, bh);
    caption.setPosition(width / 2, height - bh - 30).setWordWrapWidth(width * 0.85);
    skip.setPosition(width - 10, 8);
    for (const fn of layouts) fn(width, height);
  };
  layout();
  s.scale.on(Phaser.Scale.Events.RESIZE, layout);

  const frame: CutsceneFrame = {
    ui,
    at: (ms, fn) => {
      timers.push(s.time.delayedCall(still ? ms * 0.8 : ms, () => !over && fn()));
    },
    keep: (t) => {
      timers.push(t);
    },
    say: (line) => {
      s.tweens.killTweensOf(caption);
      caption.setText(line).setAlpha(0);
      s.tweens.add({ targets: caption, alpha: 1, duration: 450 });
    },
    hush: () => {
      s.tweens.add({ targets: caption, alpha: 0, duration: 350 });
    },
    finish: () => {
      if (over) return;
      over = true;
      for (const t of timers) t.remove();
      s.scale.off(Phaser.Scale.Events.RESIZE, layout);
      const end = () => {
        ui.destroy();
        done();
      };
      if (opts.fadeOut === false) return end();
      const cam = s.cameras.main;
      cam.fadeOut(still ? 0 : 500, 8, 6, 15);
      cam.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, end);
    },
    isOver: () => over,
    onLayout: (fn) => {
      layouts.push(fn);
      const { width, height } = view(s);
      fn(width, height);
    },
  };
  skip.on('pointerup', () => {
    sfx.tap();
    frame.finish();
  });
  return frame;
}
