// Loads the packed art made by tools/art-import/ (assets/art/<pack>.json + its WebP pages)
// and turns it into Phaser textures. Each area loads only the packs it needs.

import Phaser from 'phaser';

export type PackName = 'player' | 'player-big' | 'enemies-t1' | 'tower-t1' | 'dojo';

/** One animation of a layered character: frame ids per layer, per direction, per frame (-1 = nothing). */
export interface ArtAnimation {
  frames: number;
  fps: number;
  loop: boolean;
  holdLastFrame?: boolean;
  keyFrames?: Record<string, number | string>;
  telegraphIntensity?: number[];
  layers: Record<string, number[][]>;
}

export interface CharacterArt {
  kind: 'character';
  pack: PackName;
  frameWidth: number;
  frameHeight: number;
  anchor: { x: number; y: number };
  directions: string[];
  layers: { name: string; tint: boolean; optional: boolean }[];
  animations: Record<string, ArtAnimation>;
}

/** A room piece, prop or decoration: frame ids per layer, per frame. */
export interface StaticSprite {
  frameWidth: number;
  frameHeight: number;
  anchor: [number, number];
  frames: number;
  fps?: number;
  loop?: boolean;
  footprint?: [number, number];
  place?: string;
  keyFrames?: Record<string, number | string>;
  layers: Record<string, number[]>;
}

interface PackFile {
  pages: string[];
  frames: number[][];
  entries: Record<string, { kind: 'character' | 'static'; sprites?: Record<string, StaticSprite> } & Partial<CharacterArt>>;
}

const jsonKey = (pack: PackName) => `art:${pack}`;
const pageKey = (pack: PackName, page: number) => `art:${pack}:${page}`;
const registered = new Set<PackName>();

/** Call from a scene's preload(): queues the packs that aren't loaded yet. */
export function loadArt(scene: Phaser.Scene, packs: PackName[]): void {
  for (const pack of packs) {
    if (scene.cache.json.exists(jsonKey(pack))) continue;
    scene.load.json(jsonKey(pack), `art/${pack}.json`);
    scene.load.once(`filecomplete-json-${jsonKey(pack)}`, (_key: string, _type: string, data: PackFile) => {
      data.pages.forEach((file, i) => scene.load.image(pageKey(pack, i), `art/${file}`));
    });
  }
}

/** Adds every frame of a loaded pack to its page textures (once per game). */
function register(scene: Phaser.Scene, pack: PackName): PackFile | null {
  const data = scene.cache.json.get(jsonKey(pack)) as PackFile | undefined;
  if (!data) return null;
  if (registered.has(pack)) return data;
  if (!data.pages.every((_, i) => scene.textures.exists(pageKey(pack, i)))) return null;
  data.frames.forEach(([page, x, y, w, h, trimX, trimY, fullW, fullH], id) => {
    const frame = scene.textures.get(pageKey(pack, page)).add(String(id), 0, x, y, w, h);
    frame?.setTrim(fullW, fullH, trimX, trimY, w, h);
  });
  registered.add(pack);
  return data;
}

/** The texture and frame name for a frame id, or null for "nothing to draw". */
export function frameOf(scene: Phaser.Scene, pack: PackName, id: number): [string, string] | null {
  if (id < 0) return null;
  const data = register(scene, pack);
  if (!data) return null;
  return [pageKey(pack, data.frames[id][0]), String(id)];
}

/**
 * How far above the feet a character's picture reaches (pixels), measured on its
 * idle frame facing the camera. Used to put health bars just over the head.
 */
export function characterTop(scene: Phaser.Scene, art: CharacterArt): number {
  const data = register(scene, art.pack);
  const anim = art.animations.idle ?? Object.values(art.animations)[0];
  let top = art.anchor.y;
  for (const ids of Object.values(anim.layers)) {
    const id = ids[4]?.[0] ?? -1;
    if (id >= 0 && data) top = Math.min(top, data.frames[id][6]);
  }
  return art.anchor.y - top;
}

/** A layered character (player or enemy), or null if its pack isn't loaded. */
export function characterArt(scene: Phaser.Scene, pack: PackName, id: string): CharacterArt | null {
  const entry = register(scene, pack)?.entries[id];
  if (!entry || entry.kind !== 'character') return null;
  return { ...(entry as unknown as CharacterArt), pack };
}

/** A room piece or decoration, or null if its pack isn't loaded. */
export function staticArt(scene: Phaser.Scene, pack: PackName, id: string): StaticSprite | null {
  const data = register(scene, pack);
  if (!data) return null;
  for (const entry of Object.values(data.entries)) {
    const s = entry.sprites?.[id];
    if (s) return s;
  }
  return null;
}

/** Index of the 8 directions (N, NE, E, SE, S, SW, W, NW) closest to a facing vector. */
export function directionIndex(dx: number, dy: number): number {
  if (dx === 0 && dy === 0) return 4; // facing the camera
  const a = Math.atan2(dx, -dy); // 0 = north, clockwise
  return ((Math.round(a / (Math.PI / 4)) % 8) + 8) % 8;
}

/**
 * Draws one static sprite (all its layers) at a spot. Frame 0 by default.
 * Returns the images (bottom layer first), or [] if the art isn't loaded.
 */
export function addStatic(
  scene: Phaser.Scene,
  pack: PackName,
  id: string,
  x: number,
  y: number,
  frame = 0,
): Phaser.GameObjects.Image[] {
  const s = staticArt(scene, pack, id);
  if (!s) return [];
  const out: Phaser.GameObjects.Image[] = [];
  for (const ids of Object.values(s.layers)) {
    const f = frameOf(scene, pack, ids[Math.min(frame, ids.length - 1)]);
    const img = scene.add.image(x, y, f?.[0] ?? '__DEFAULT', f?.[1]);
    img.setOrigin(s.anchor[0] / s.frameWidth, s.anchor[1] / s.frameHeight).setVisible(!!f);
    out.push(img);
  }
  return out;
}

/** Shows a given frame of a static sprite on images made by addStatic. */
export function setStaticFrame(scene: Phaser.Scene, pack: PackName, id: string, images: Phaser.GameObjects.Image[], frame: number): void {
  const s = staticArt(scene, pack, id);
  if (!s) return;
  Object.values(s.layers).forEach((ids, i) => {
    const img = images[i];
    if (!img) return;
    const f = frameOf(scene, pack, ids[Math.min(frame, ids.length - 1)]);
    if (f) img.setTexture(f[0], f[1]);
    img.setVisible(!!f);
  });
}
