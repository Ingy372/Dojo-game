import Phaser from 'phaser';
import { CreateScene } from './scenes/CreateScene';
import { DojoScene } from './scenes/DojoScene';
import { GameScene } from './scenes/GameScene';
import { HomeScene } from './scenes/HomeScene';
import { StreetSmartsScene } from './scenes/StreetSmartsScene';
import { TitleScene } from './scenes/TitleScene';

const game = new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'game',
  backgroundColor: '#14121c',
  scale: {
    // Fill the safe area of the screen, whatever the phone's size.
    mode: Phaser.Scale.RESIZE,
    width: '100%',
    height: '100%',
  },
  // Touch first. The mouse also works so previews can be clicked on a computer;
  // Phaser blocks the browser's copy-of-a-tap mouse events, so a phone tap counts once.
  input: {
    mouse: true,
    touch: true,
  },
  scene: [TitleScene, CreateScene, DojoScene, HomeScene, GameScene, StreetSmartsScene],
});

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
