// Loads the packed art made by tools/art-import/ (assets/art/<pack>.json + its WebP pages)
// and turns it into Phaser textures. Each area loads only the packs it needs.

import Phaser from 'phaser';

/** A pack made by tools/art-import/ (see tools/art-import/approved.json), e.g. "tower-t1" or "player-a-hair-02". */
export type PackName = string;

/** One animation of a layered character: frame ids per layer, per direction, per frame (-1 = nothing). */
export interface ArtAnimation {
  frames: number;
  fps: number;
  loop: boolean;
  holdLastFrame?: boolean;
  /** A Stance idle: the Stance id (content/abilities) this animation replaces `idle` for. */
  stance?: string;
  keyFrames?: Record<string, number | string>;
  telegraphIntensity?: number[];
  layers: Record<string, number[][]>;
  /** Which pack each layer's frames are in for this animation, when it came from a different pack than the rest. */
  layerPack?: Record<string, PackName>;
  /**
   * A move that steps the character forward (the kata front kicks): `tiles` travelled; the picture starts
   * `startOffset` tiles from the feet point and ends `endOffset` from it (drawn centred so it fits the frame).
   */
  travel?: { tiles: number; startOffset: number; endOffset: number };
  /**
   * A move that turns the whole character (the kata special turn): `degrees` clockwise on screen (negative = to
   * the left), so each direction row starts facing its direction and ends turned. Offsets are tiles to the right
   * of and ahead of the row's starting direction: where the picture starts and ends from the feet point.
   */
  turn?: {
    degrees: number;
    startOffset: { right: number; forward: number };
    endOffset: { right: number; forward: number };
  };
}

export interface CharacterArt {
  kind: 'character';
  pack: PackName;
  frameWidth: number;
  frameHeight: number;
  anchor: { x: number; y: number };
  directions: string[];
  layers: { name: string; tint: boolean; optional?: boolean; group?: string }[];
  animations: Record<string, ArtAnimation>;
  /** Every layer of the full character in drawing order (a pack may hold only some of them). */
  layerOrder?: string[];
  /** Which pack each layer's frames are in, when the character is put together from several packs. */
  layerPack?: Record<string, PackName>;
  /** Recommended colours (hex) for tinted layers, e.g. skin, hair and gi swatches. */
  palettes?: Record<string, string[]>;
}

/**
 * Puts one character together from several packs (e.g. a body, its faces and one hair style),
 * keeping the layers in the art's drawing order.
 */
/**
 * Where a layer is drawn. Skin layers (Nov 22) come from their own packs, so the base pack's order doesn't list them:
 * outfits and back pieces go just before the faces (under the face and hair), hats on top of everything.
 */
export function layerRank(order: readonly string[], name: string): number {
  const i = order.indexOf(name);
  if (i >= 0) return i;
  const face = order.findIndex((n) => n.startsWith('face-'));
  if (name.startsWith('outfit-')) return (face >= 0 ? face : order.length) - 0.6;
  if (name.startsWith('back-')) return (face >= 0 ? face : order.length) - 0.3;
  return order.length + (name.startsWith('hat-') ? 1 : 0);
}

export function combineArt(parts: CharacterArt[]): CharacterArt {
  const [first] = parts;
  const order = first.layerOrder ?? first.layers.map((l) => l.name);
  const layerPack: Record<string, PackName> = {};
  const layers: CharacterArt['layers'] = [];
  const animations: Record<string, ArtAnimation> = {};
  for (const part of parts) {
    for (const l of part.layers) {
      layerPack[l.name] = part.pack;
      layers.push(l);
    }
    for (const [name, anim] of Object.entries(part.animations)) {
      animations[name] = { ...anim, ...(animations[name] ?? {}), layers: { ...(animations[name]?.layers ?? {}), ...anim.layers } };
    }
  }
  layers.sort((a, b) => layerRank(order, a.name) - layerRank(order, b.name));
  return { ...first, layers, animations, layerPack };
}

/**
 * Adds the animations of extra packs (e.g. the kata moves, loaded only when kata practice starts) to a character
 * that's already built. The layers must already exist; each added animation remembers its own packs.
 */
export function addAnimations(art: CharacterArt, parts: CharacterArt[]): void {
  for (const part of parts) {
    for (const [name, anim] of Object.entries(part.animations)) {
      const prev = art.animations[name];
      const packs = Object.fromEntries(Object.keys(anim.layers).map((l) => [l, part.pack]));
      art.animations[name] = prev?.layerPack
        ? { ...prev, layers: { ...prev.layers, ...anim.layers }, layerPack: { ...prev.layerPack, ...packs } }
        : { ...anim, layerPack: packs };
    }
  }
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
  /** Where the sprite stands in the room, in tiles (Action Zone art: the anchor lands on this tile position). */
  anchorTile?: [number, number];
  /** The row the sprite sorts by against characters (Action Zone art). */
  sortRow?: number;
  keyFrames?: Record<string, number | string>;
  layers: Record<string, number[]>;
  /** Extra notes from the artist, e.g. a tinted piece's colour1. */
  info?: Record<string, unknown>;
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
    if (scene.cache.json.exists(jsonKey(pack))) {
      // Nov 26 (weak connection): a page that failed to load before is asked for again, so the art comes
      // back on the next screen once the signal does, without reopening the game.
      const data = scene.cache.json.get(jsonKey(pack)) as PackFile;
      data.pages.forEach((file, i) => {
        if (!scene.textures.exists(pageKey(pack, i))) scene.load.image(pageKey(pack, i), `art/${file}`);
      });
      continue;
    }
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
export function characterTop(scene: Phaser.Scene, art: CharacterArt, layers?: string[]): number {
  const anim = art.animations.idle ?? Object.values(art.animations)[0];
  let top = art.anchor.y;
  for (const [name, ids] of Object.entries(anim.layers)) {
    if (layers && !layers.includes(name)) continue;
    const data = register(scene, art.layerPack?.[name] ?? art.pack);
    const id = ids[ids.length === 1 ? 0 : 4]?.[0] ?? -1;
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

/** The painted part of a static sprite's frame 0 (all layers, transparent edges trimmed), in frame pixels. */
export function staticBounds(scene: Phaser.Scene, pack: PackName, id: string): { x: number; y: number; w: number; h: number } | null {
  const data = register(scene, pack);
  const s = staticArt(scene, pack, id);
  if (!data || !s) return null;
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const ids of Object.values(s.layers)) {
    const f = data.frames[ids[0]];
    if (!f) continue;
    const [, , , w, h, tx, ty] = f;
    x0 = Math.min(x0, tx); y0 = Math.min(y0, ty); x1 = Math.max(x1, tx + w); y1 = Math.max(y1, ty + h);
  }
  return x1 > x0 ? { x: x0, y: y0, w: x1 - x0, h: y1 - y0 } : null;
}

/** Every static sprite of a loaded pack, by id (empty until the pack is loaded). */
export function staticSprites(scene: Phaser.Scene, pack: PackName): Record<string, StaticSprite> {
  const data = register(scene, pack);
  if (!data) return {};
  return Object.assign({}, ...Object.values(data.entries).map((e) => e.sprites ?? {}));
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

/**
 * Draws a two-colour piece: <id>, then its <id>-tint layer multiplied by a colour
 * (setTint keeps the grey shading). With no colour given it uses the art's own info.colour1.
 */
export function addTinted(scene: Phaser.Scene, pack: PackName, id: string, x: number, y: number, colour?: string): Phaser.GameObjects.Image[] {
  const images = addStatic(scene, pack, id, x, y);
  const s = staticArt(scene, pack, id);
  const hex = colour ?? (typeof s?.info?.colour1 === 'string' ? s.info.colour1 : null);
  const i = s ? Object.keys(s.layers).indexOf(`${id}-tint`) : -1;
  if (hex && i >= 0 && images[i]) images[i].setTint(Phaser.Display.Color.HexStringToColor(hex).color);
  return images;
}

/**
 * TUT-B3: a creature drawn from still sprites (the practice dummies) as a layered character, so it
 * plays through the normal enemy view. `anims` maps an animation name (idle, hit, defeat...) to a
 * static sprite id; every one faces all 8 ways the same. Sizes and anchor come from the first one.
 */
export function staticCharacter(scene: Phaser.Scene, pack: PackName, anims: Record<string, string>): CharacterArt | null {
  const sprites = Object.entries(anims).map(([name, id]) => [name, staticArt(scene, pack, id)] as const);
  if (sprites.some(([, s]) => !s)) return null;
  const [, first] = sprites[0];
  const layers: CharacterArt['layers'] = [];
  const animations: Record<string, ArtAnimation> = {};
  for (const [name, s] of sprites) {
    const anim: ArtAnimation = { frames: s!.frames, fps: s!.fps ?? 1, loop: s!.loop ?? s!.frames === 1, layers: {} };
    for (const [layer, ids] of Object.entries(s!.layers)) {
      if (!layers.some((l) => l.name === layer)) layers.push({ name: layer, tint: false });
      anim.layers[layer] = Array.from({ length: 8 }, () => ids);
    }
    animations[name] = anim;
  }
  return {
    kind: 'character',
    pack,
    frameWidth: first!.frameWidth,
    frameHeight: first!.frameHeight,
    anchor: { x: first!.anchor[0], y: first!.anchor[1] },
    directions: ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'],
    layers,
    animations,
  };
}
