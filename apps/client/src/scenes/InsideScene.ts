import type { Room, Vec2 } from '@dojo/sim';
import { INSIDE, INSIDE_PACK } from '../game/actionZone';
import { addStatic, staticArt, staticSprites } from '../art/art';
import { addExitCue } from '../ui/exitCue';
import { TILE, WalkScene, type Facing } from './WalkScene';

/**
 * The Action Zone dojo, inside (A4-DOJO-i). One room, drawn from the artist's pieces:
 * floor, walls and props at the back; then everything that stands (props, the wings, the hero)
 * sorted by the row it stands on; then the seat backs and bag tops, which show only while the
 * hero is north of them; then the front wall, which is always on top. The walk-up spots do
 * nothing yet. The door at the bottom leads back outside (A4-DOJO-ii), where you stand at the
 * double doors; a glowing mat with an arrow marks it.
 */
export class InsideScene extends WalkScene {
  /** Seat backs and bag tops, each hidden unless the hero's feet are north of its sort row. */
  private tops: Array<{ images: Phaser.GameObjects.Image[]; sortRow: number }> = [];

  constructor() {
    super('ActionZoneInside');
  }

  protected room(): Room {
    return INSIDE.room;
  }

  protected roomPacks(): string[] {
    return [INSIDE_PACK];
  }

  protected spawn(): { pos: Vec2; facing: Facing } {
    return { pos: INSIDE.spawn, facing: 'north' };
  }

  protected drawRoom(): void {
    this.tops = [];
    const floor = addStatic(this, INSIDE_PACK, 'inside-main-floor', 0, 0);
    const [floorImg, wallsImg, propsImg, frontWall] = floor;
    const frame = staticArt(this, INSIDE_PACK, 'inside-main-floor');
    if (frame) {
      const [ax, ay] = frame.anchor;
      this.bounds = [-ax / TILE, (frame.frameWidth - ax) / TILE, -ay / TILE, (frame.frameHeight - ay) / TILE];
    }

    const topRow = new Map(INSIDE.foregroundSprites.map((f) => [f.id, f.sortRow]));
    const tops: Phaser.GameObjects.Image[][] = [];
    for (const [id, s] of Object.entries(staticSprites(this, INSIDE_PACK))) {
      if (!s.anchorTile || s.sortRow === undefined) continue;
      const images = addStatic(this, INSIDE_PACK, id, s.anchorTile[0] * TILE, s.anchorTile[1] * TILE);
      const row = topRow.get(id);
      if (row !== undefined) {
        this.tops.push({ images, sortRow: row });
        tops.push(images);
      } else {
        for (const img of images) img.setDepth(s.sortRow * TILE);
        this.standLayer.add(images);
      }
    }
    // The way out: a glow on the floor in front of the door with an arrow pointing at it, drawn
    // under the hero and the props.
    const [x0, x1] = INSIDE.exit;
    const cue = addExitCue(this, ((x0 + x1) / 2) * TILE, 17.5 * TILE, (x1 - x0) * TILE, 0.8 * TILE, 'down');
    // Bottom to top: floor, walls, props; the exit cue; what stands and the hero; seat backs and
    // bag tops; the front wall.
    const topLayer = this.add.container(0, 0, tops.flat());
    this.worldLayer.add([floorImg, wallsImg, propsImg, cue, this.standLayer, topLayer, frontWall].filter(Boolean));
  }

  protected onDraw(heroRow: number): void {
    // A seat back or bag top covers the hero only while the hero stands north of it.
    for (const t of this.tops) {
      const show = heroRow < t.sortRow;
      for (const img of t.images) if (img.visible !== show) img.setVisible(show);
    }
  }

  /** Walking into the door rectangle at the bottom leaves for the outside, standing at the doors. */
  protected afterTick(p: Vec2): void {
    const [x0, x1, y0, y1] = INSIDE.exit;
    if (p.x >= x0 && p.x <= x1 && p.y >= y0 && p.y <= y1) this.leave('ActionZoneOutside', { from: 'inside' });
  }
}
