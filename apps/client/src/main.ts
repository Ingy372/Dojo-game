import Phaser from 'phaser';
import { CreateScene } from './scenes/CreateScene';
import { DojoScene } from './scenes/DojoScene';
import { GameScene } from './scenes/GameScene';
import { HomeScene } from './scenes/HomeScene';
import { InsideScene } from './scenes/InsideScene';
import { StreetSmartsScene } from './scenes/StreetSmartsScene';
import { TitleScene } from './scenes/TitleScene';
import { App } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import { ScreenOrientation } from '@capacitor/screen-orientation';
import { music } from './audio/Music';
import { sfx } from './audio/Sfx';
import { DPR } from './ui/theme';
import { finishPendingWipe } from './game/beta';

// B-SAFE: a grown-up's wipe finishes here, before anything reads the save.
finishPendingWipe();

/** The game area's size in screen points (the #game box fills the safe area). */
function screenSize(): { width: number; height: number } {
  const el = document.getElementById('game');
  return { width: el?.clientWidth || window.innerWidth, height: el?.clientHeight || window.innerHeight };
}

const game = new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'game',
  backgroundColor: '#14121c',
  scale: {
    // Fill the safe area of the screen, whatever the phone's size, at full ("retina")
    // sharpness: the canvas has DPR real pixels per screen point and is shown at
    // 1/DPR size. Layout code works in screen points via view() (K24c).
    mode: Phaser.Scale.NONE,
    width: screenSize().width * DPR,
    height: screenSize().height * DPR,
    zoom: 1 / DPR,
  },
  // Touch first. The mouse also works so previews can be clicked on a computer;
  // Phaser blocks the browser's copy-of-a-tap mouse events, so a phone tap counts once.
  input: {
    mouse: true,
    touch: true,
  },
  scene: [TitleScene, CreateScene, DojoScene, HomeScene, GameScene, StreetSmartsScene, InsideScene],
});

// Music (M7-P8): each screen that opens picks its track from content/settings/audio.json.
game.events.once(Phaser.Core.Events.READY, () => {
  for (const s of game.scene.scenes) s.events.on(Phaser.Scenes.Events.CREATE, () => music.setScene(s.scene.key));
});

// Keep the canvas matched to the screen when the phone turns or the window changes.
const fit = () => {
  const { width, height } = screenSize();
  game.scale.resize(Math.round(width * DPR), Math.round(height * DPR));
};
window.addEventListener('resize', fit);
window.addEventListener('orientationchange', fit);

// Pause when the app goes to the background (or a call comes in), and resume cleanly.
// The game loop, music and sound effects all stop (music and effects share one audio context).
let away = false;
const setAway = (now: boolean): void => {
  if (now === away) return;
  away = now;
  if (away) game.loop.sleep();
  else game.loop.wake();
  const ctx = sfx.context();
  if (ctx) void (away ? ctx.suspend() : ctx.resume());
};
document.addEventListener('visibilitychange', () => setAway(document.hidden));

// B-WRAP: inside the phone app, also follow the app's own background/foreground events,
// and lock the screen sideways.
if (Capacitor.isNativePlatform()) {
  void App.addListener('appStateChange', ({ isActive }) => setAway(!isActive));
  void ScreenOrientation.lock({ orientation: 'landscape' }).catch(() => {});
}

// Developer builds only (never in the published game): lets automated checks reach the game.
if (import.meta.env.DEV) (window as unknown as { game: Phaser.Game }).game = game;
