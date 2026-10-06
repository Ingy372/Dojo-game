import Phaser from 'phaser';

export class TitleScene extends Phaser.Scene {
  private title!: Phaser.GameObjects.Text;
  private subtitle!: Phaser.GameObjects.Text;
  private belt!: Phaser.GameObjects.Rectangle;
  private prompt!: Phaser.GameObjects.Text;

  constructor() {
    super('Title');
  }

  create(): void {
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
      .text(0, 0, 'Climb the Tower. Train in the dojo.', {
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
    this.tweens.add({ targets: this.prompt, alpha: 0.35, duration: 900, yoyo: true, repeat: -1 });

    this.input.once(Phaser.Input.Events.POINTER_UP, () => this.scene.start('Game'));

    this.layout(this.scale.gameSize);
    this.scale.on(Phaser.Scale.Events.RESIZE, this.layout, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.scale.off(Phaser.Scale.Events.RESIZE, this.layout, this);
    });
  }

  private layout(size: Phaser.Structs.Size): void {
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
