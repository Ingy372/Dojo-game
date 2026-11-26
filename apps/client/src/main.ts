import Phaser from 'phaser';
import { CreateScene } from './scenes/CreateScene';
import { DojoScene } from './scenes/DojoScene';
import { GameScene } from './scenes/GameScene';
import { HomeScene } from './scenes/HomeScene';
import { InsideScene } from './scenes/InsideScene';
import { OutsideScene } from './scenes/OutsideScene';
import { StreetSmartsScene } from './scenes/StreetSmartsScene';
import { TitleScene } from './scenes/TitleScene';
import { TownScene } from './scenes/TownScene';
import { StreetHouseScene } from './scenes/StreetHouseScene';
import { App } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import { ScreenOrientation } from '@capacitor/screen-orientation';
import { music } from './audio/Music';
import { sfx } from './audio/Sfx';
import { DEVICE_DPR, DPR, hiDpi, setScreenSize } from './ui/theme';
import { finishPendingWipe } from './game/beta';
import { seedLoadout } from './game/student';

// B-SAFE: a grown-up's wipe finishes here, before anything reads the save.
finishPendingWipe();
seedLoadout();

/** The game area's size in screen points (the #game box fills the safe area). */
function screenSize(): { width: number; height: number } {
  const el = document.getElementById('game');
  return { width: el?.clientWidth || window.innerWidth, height: el?.clientHeight || window.innerHeight };
}

setScreenSize(screenSize().width, screenSize().height);

const game = new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'game',
  backgroundColor: '#14121c',
  scale: {
    // Fill the safe area of the screen, whatever the phone's size, at full ("retina")
    // sharpness: the canvas has DPR real pixels per screen point and is shown at
    // 1/DPR size. Layout code works in screen points via view() (K24c).
    // Nov 17: on a computer or tablet the layout points are larger than CSS pixels (UI_SCALE), but the
    // canvas always has one real pixel per device pixel, so it stays sharp.
    mode: Phaser.Scale.NONE,
    width: screenSize().width * DEVICE_DPR,
    height: screenSize().height * DEVICE_DPR,
    zoom: 1 / DEVICE_DPR,
  },
  // Touch first. The mouse also works so previews can be clicked on a computer;
  // Phaser blocks the browser's copy-of-a-tap mouse events, so a phone tap counts once.
  input: {
    mouse: true,
    touch: true,
  },
  scene: [TitleScene, CreateScene, DojoScene, HomeScene, GameScene, StreetSmartsScene, InsideScene, OutsideScene, TownScene, StreetHouseScene],
});

// Nov 17 (desktop): a right click never opens the browser's menu over the game.
game.events.once(Phaser.Core.Events.READY, () => game.input.mouse?.disableContextMenu());

// Music (M7-P8): each screen that opens picks its track from content/settings/audio.json.
game.events.once(Phaser.Core.Events.READY, () => {
  for (const s of game.scene.scenes) s.events.on(Phaser.Scenes.Events.CREATE, () => music.setScene(s.scene.key));
});

// Keep the canvas matched to the screen when the phone turns or the window changes.
const fit = () => {
  const { width, height } = screenSize();
  // A new layout scale re-zooms every screen-space camera (the ones hiDpi set to the old scale) before the
  // scenes lay themselves out again. World cameras (the fight's) set their own zoom in their layout.
  const oldDpr = DPR;
  if (setScreenSize(width, height)) {
    for (const s of game.scene.getScenes(true)) for (const cam of s.cameras.cameras) if (Math.abs(cam.zoom - oldDpr) < 1e-6) hiDpi(cam);
  }
  game.scale.resize(Math.round(width * DEVICE_DPR), Math.round(height * DEVICE_DPR));
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
// Nov 26 (phone check): after a phone call an iPhone leaves the sound "interrupted", and a page may only
// restart it from a touch. So the first touch after coming back wakes the music and effects again.
const wakeSound = (): void => {
  const ctx = sfx.context();
  if (ctx && !away && ctx.state !== 'running') void ctx.resume().catch(() => {});
};
window.addEventListener('pointerdown', wakeSound, { capture: true });
window.addEventListener('keydown', wakeSound, { capture: true });

// B-WRAP: inside the phone app, also follow the app's own background/foreground events,
// and lock the screen sideways.
if (Capacitor.isNativePlatform()) {
  void App.addListener('appStateChange', ({ isActive }) => setAway(!isActive));
  void ScreenOrientation.lock({ orientation: 'landscape' }).catch(() => {});
}

// B-WEB: in the browser game (not the phone apps, not while developing), keep a copy of the files already
// loaded so the game still opens and plays on a weak or dropped connection (assets/sw.js).
if (!import.meta.env.DEV && !Capacitor.isNativePlatform() && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => void navigator.serviceWorker.register('sw.js').catch(() => {}));
}

// Developer builds only (never in the published game): lets automated checks reach the game.
if (import.meta.env.DEV) (window as unknown as { game: Phaser.Game }).game = game;
