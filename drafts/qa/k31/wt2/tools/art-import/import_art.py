#!/usr/bin/env python3
"""Art import step: approved renders in incoming-art/ -> packed art the game loads.

Run from the repository root:

    python3 tools/art-import/import_art.py

What it does (the same way every time):
  1. Reads the list of approved art in tools/art-import/approved.json.
  2. Cuts every sprite sheet into frames, shrinks them to the game's tile size
     (80 px per tile in the renders -> 48 px per tile in the game), trims the empty
     border, and drops empty and repeated frames.
  3. Packs the frames into a few 2048 x 2048 lossless WebP pages per pack and writes
     assets/art/<pack>.json describing where every frame is, plus the animation
     data the game needs (frame rates, loops, feet points, key frames, tints).

It never changes anything in incoming-art/. Needs Python 3 and Pillow.
"""
from __future__ import annotations

import hashlib
import json
import os
import sys

from PIL import Image

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
CONFIG = os.path.join(os.path.dirname(__file__), 'approved.json')
PAGE = 2048  # largest page size every phone can load safely
PAD = 2  # transparent gap between frames so neighbours never bleed in


def rel(*p: str) -> str:
    return os.path.join(ROOT, *p)


def shrink(im: Image.Image, scale: float) -> Image.Image:
    if scale == 1:
        return im
    w, h = max(1, round(im.width * scale)), max(1, round(im.height * scale))
    # Resize with premultiplied alpha so soft edges don't get dark fringes.
    return im.convert('RGBa').resize((w, h), Image.LANCZOS).convert('RGBA')


class Packer:
    """Collects unique trimmed frames and packs them into pages (simple shelf packing)."""

    def __init__(self) -> None:
        self.images: list[Image.Image] = []
        self.frames: list[list[int]] = []  # [page, x, y, w, h, offX, offY, srcW, srcH]
        self.by_hash: dict[str, int] = {}

    def add(self, im: Image.Image) -> int:
        """Returns the frame id, or -1 for an empty frame."""
        bbox = im.getchannel('A').point(lambda a: 255 if a > 2 else 0).getbbox()
        if not bbox:
            return -1
        crop = im.crop(bbox)
        key = hashlib.md5(crop.tobytes() + bytes(f'{bbox}{im.size}', 'ascii')).hexdigest()
        if key in self.by_hash:
            return self.by_hash[key]
        fid = len(self.frames)
        self.by_hash[key] = fid
        self.images.append(crop)
        self.frames.append([0, 0, 0, crop.width, crop.height, bbox[0], bbox[1], im.width, im.height])
        return fid

    def pack(self) -> list[Image.Image]:
        order = sorted(range(len(self.frames)), key=lambda i: (-self.frames[i][4], -self.frames[i][3]))
        pages: list[list[int]] = []  # per page: [shelfY, shelfH, cursorX]
        page_used: list[int] = []
        for i in order:
            w, h = self.frames[i][3] + PAD, self.frames[i][4] + PAD
            placed = False
            for p, (sy, sh, cx) in enumerate(pages):
                if cx + w <= PAGE and h <= sh:
                    self.frames[i][0:3] = [p, cx, sy]
                    pages[p][2] = cx + w
                    placed = True
                    break
                if sy + sh + h <= PAGE:  # start a new shelf on this page
                    if cx + w > PAGE or h > sh:
                        pages[p] = [sy + sh, h, w]
                        self.frames[i][0:3] = [p, 0, sy + sh]
                        page_used[p] = sy + sh + h
                        placed = True
                        break
            if not placed:
                pages.append([0, h, w])
                page_used.append(h)
                self.frames[i][0:3] = [len(pages) - 1, 0, 0]
        out = []
        for p in range(len(pages)):
            height = page_used[p]
            # Round the page height up to a multiple of 64 to keep it tidy.
            out.append(Image.new('RGBA', (PAGE, min(PAGE, -(-height // 64) * 64)), (0, 0, 0, 0)))
        for i, f in enumerate(self.frames):
            out[f[0]].paste(self.images[i], (f[1], f[2]))
        return out


def load_character(packer: Packer, json_path: str, scale: float, skip_layers: list[str],
                   only_anims: list[str] | None = None, only_dirs: list[str] | None = None,
                   only_layers: list[str] | None = None, merge: list[str] | None = None) -> dict:
    d = json.load(open(json_path))
    base = os.path.dirname(json_path)
    # Extra animations delivered later for the same rig (e.g. A2 Form stances): same frame and anchor.
    for extra_path in merge or []:
        e = json.load(open(extra_path))
        if (e['frameWidth'], e['frameHeight'], e['anchor']) != (d['frameWidth'], d['frameHeight'], d['anchor']):
            raise SystemExit(f'{extra_path}: frame size or anchor differs from {json_path}')
        ebase = os.path.dirname(extra_path)
        for name, a in e['animations'].items():
            if name in d['animations']:
                raise SystemExit(f'{extra_path}: animation "{name}" is already in {json_path}')
            d['animations'][name] = {**a, 'sheets': {k: os.path.join(ebase, v) for k, v in a['sheets'].items()}}
    fw, fh = d['frameWidth'], d['frameHeight']
    ndir = len(d['directions'])
    sw, sh = round(fw * scale), round(fh * scale)
    sx, sy = sw / fw, sh / fh
    layers = [l for l in sorted(d['layers'], key=lambda l: l['order'])
              if l['name'] not in skip_layers and (not only_layers or l['name'] in only_layers)]
    anims = {}
    for name, a in d['animations'].items():
        if only_anims and name not in only_anims:
            continue
        info = {k: v for k, v in a.items() if k not in ('sheets',)}
        info['layers'] = {}
        for layer in layers:
            sheet = a['sheets'].get(layer['name'])
            if not sheet:
                continue
            if layer['name'] == 'telegraph' and 'telegraphIntensity' not in a:
                continue  # the warning glow only shows during wind-ups and attacks
            im = Image.open(os.path.join(base, sheet)).convert('RGBA')
            ids = []
            for r in range(ndir):
                row = []
                if only_dirs and d['directions'][r] not in only_dirs:
                    ids.append([-1] * a['frames'])  # direction not included in this pack
                    continue
                for c in range(a['frames']):
                    fr = im.crop((c * fw, r * fh, (c + 1) * fw, (r + 1) * fh))
                    row.append(packer.add(shrink(fr, scale)))
                ids.append(row)
            if all(i < 0 for row in ids for i in row):
                continue  # this layer is empty in this animation (e.g. the broom outside sweep)
            info['layers'][layer['name']] = ids
        anims[name] = info
    out = {
        'kind': 'character',
        'layerOrder': [l['name'] for l in sorted(d['layers'], key=lambda l: l['order'])],
        'frameWidth': sw,
        'frameHeight': sh,
        'anchor': {'x': round(d['anchor']['x'] * sx, 2), 'y': round(d['anchor']['y'] * sy, 2)},
        'directions': d['directions'],
        'layers': [{k: l[k] for k in ('name', 'tint', 'optional', 'group') if k in l} for l in layers],
        'animations': anims,
    }
    for extra in ('beltStyles', 'enemy', 'name', 'sizeTiles', 'palettes', 'groups'):
        if extra in d:
            out[extra] = d[extra]
    return out


def load_static(packer: Packer, json_path: str, scale: float, only: list[str] | None) -> dict:
    d = json.load(open(json_path))
    base = os.path.dirname(json_path)
    sprites = {}
    for name, s in d['sprites'].items():
        if only and name not in only:
            continue
        frames = s.get('frames', 1)
        # Some packs (M7-N1 named-monster) give "frameSize" instead of "size", and no "layers" list
        # (then every file is a layer, in order). A layer whose sheet has a different frame size
        # (e.g. a trail tile) is cut by its own width / frames and its size kept in "layerSizes".
        size = s.get('size') or s.get('frameSize')
        fw = s.get('frameWidth', size[0])
        fh = size[1]
        layers = {}
        layer_sizes = {}
        for layer in s.get('layers', list(s['files'])):
            im = Image.open(os.path.join(base, s['files'][layer])).convert('RGBA')
            lw, lh = (fw, fh) if im.size[0] == fw * frames and im.size[1] == fh else (im.size[0] // frames, im.size[1])
            if (lw, lh) != (fw, fh):
                layer_sizes[layer] = [round(lw * scale), round(lh * scale)]
            layers[layer] = [packer.add(shrink(im.crop((c * lw, 0, (c + 1) * lw, lh)), scale)) for c in range(frames)]
        sw, sh = round(fw * scale), round(fh * scale)
        info = {k: v for k, v in s.items() if k not in ('files', 'layers', 'size', 'frameSize', 'frameWidth', 'anchorNote', 'groundRect')}
        anchor = s.get('anchorPx', [fw / 2, fh / 2])
        info.update({
            'frameWidth': sw,
            'frameHeight': sh,
            'anchor': [round(anchor[0] * sw / fw, 2), round(anchor[1] * sh / fh, 2)],
            'frames': frames,
            'layers': layers,
        })
        if layer_sizes:
            info['layerSizes'] = layer_sizes
        info.pop('anchorPx', None)
        sprites[name] = info
    return {'kind': 'static', 'sprites': sprites}


def main() -> None:
    cfg = json.load(open(CONFIG))
    out_dir = rel(cfg['outDir'])
    os.makedirs(out_dir, exist_ok=True)
    only = sys.argv[1:]
    for pack_name, pack in cfg['packs'].items():
        if only and pack_name not in only:
            continue
        scale = pack.get('scale', cfg['scale'])
        packer = Packer()
        entries = {}
        for src in pack['sources']:
            path = rel(src['json'])
            if src['type'] == 'character':
                entries[src['id']] = load_character(packer, path, scale, src.get('skipLayers', []),
                                                    src.get('animations'), src.get('directions'),
                                                    src.get('layers'),
                                                    [rel(p) for p in src.get('mergeAnimations', [])])
            else:
                entries[src['id']] = load_static(packer, path, scale, src.get('only'))
        pages = packer.pack()
        names = []
        for old in os.listdir(out_dir):
            if old.startswith(pack_name + '-') and old.endswith(('.png', '.webp')):
                os.remove(os.path.join(out_dir, old))
        for i, page in enumerate(pages):
            # Lossless WebP: exact pixels, about 40% smaller than PNG.
            fname = f'{pack_name}-{i}.webp'
            page.save(os.path.join(out_dir, fname), lossless=True, method=6)
            names.append(fname)
        meta = {
            'about': 'Made by tools/art-import/import_art.py. Do not edit by hand; re-run the script.',
            'scale': scale,
            'pages': names,
            'frameFormat': '[page, x, y, w, h, trimX, trimY, fullW, fullH]',
            'frames': packer.frames,
            'entries': entries,
        }
        with open(os.path.join(out_dir, pack_name + '.json'), 'w') as f:
            json.dump(meta, f, separators=(',', ':'))
        size = sum(os.path.getsize(os.path.join(out_dir, n)) for n in names)
        print(f'{pack_name}: {len(packer.frames)} frames on {len(pages)} page(s), {size / 1e6:.1f} MB')


if __name__ == '__main__':
    main()
