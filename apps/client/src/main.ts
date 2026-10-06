import Phaser from 'phaser';
import { GameScene } from './scenes/GameScene';
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
  input: {
    mouse: false,
  },
  scene: [TitleScene, GameScene],
});

// Pause when the app goes to the background (or a call comes in), and resume cleanly.
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    game.loop.sleep();
  } else {
    game.loop.wake();
  }
});
