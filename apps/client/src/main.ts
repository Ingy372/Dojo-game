import Phaser from 'phaser';
import { CreateScene } from './scenes/CreateScene';
import { DojoScene } from './scenes/DojoScene';
import { GameScene } from './scenes/GameScene';
import { HomeScene } from './scenes/HomeScene';
import { StreetSmartsScene } from './scenes/StreetSmartsScene';
import { TitleScene } from './scenes/TitleScene';
import { music } from './audio/Music';
import { DPR } from './ui/theme';

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
  scene: [TitleScene, CreateScene, DojoScene, HomeScene, GameScene, StreetSmartsScene],
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
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    game.loop.sleep();
  } else {
    game.loop.wake();
  }
});

// Developer builds only (never in the published game): lets automated checks reach the game.
if (import.meta.env.DEV) (window as unknown as { game: Phaser.Game }).game = game;
