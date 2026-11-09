"""
Stack the rendered frames into sheets, the shift timing, and the preview pictures.

The white-gold glow uses the same colour and the same strength as
incoming-art/ember-knight-shift-drafts/source/make_b_vfx_review.py (glowify).

    python3 incoming-art/ember-knight-anim/source/make_preview.py
"""
import os
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
FRAMES = os.path.join(ROOT, "frames")
SPRITES = os.path.join(ROOT, "sprites")
PREVIEW = os.path.join(ROOT, "preview")
os.makedirs(SPRITES, exist_ok=True)
os.makedirs(PREVIEW, exist_ok=True)

DIRS = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"]
W = H = 512
GLOW = np.array([255, 244, 207], np.float32)  # #fff4cf
HALO = (255, 236, 170)  # #ffecaa


def load(name):
    return Image.open(os.path.join(FRAMES, name)).convert("RGBA")


def glowify(im, k):
    a = np.array(im).astype(np.float32)
    a[..., :3] = a[..., :3] * (1 - k) + GLOW * k
    out = Image.fromarray(a.clip(0, 255).astype(np.uint8))
    alpha = im.split()[3]
    halo = Image.new("RGBA", im.size, (*HALO, 0))
    halo.putalpha(alpha.filter(ImageFilter.GaussianBlur(8 + 10 * k)).point(lambda v: int(v * 0.45 * k)))
    return Image.alpha_composite(halo, out)


def crossfade(a, b, t):
    return Image.blend(a, b, max(0.0, min(1.0, t)))


def sheet(frames_2d, path):
    rows, cols = len(frames_2d), len(frames_2d[0])
    canvas = Image.new("RGBA", (cols * W, rows * H), (0, 0, 0, 0))
    for r, row in enumerate(frames_2d):
        for c, im in enumerate(row):
            canvas.paste(im, (c * W, r * H))
    canvas.save(path)
    return canvas


def danger(im):
    a = np.array(im)
    rgb = a[..., :3]
    al = a[..., 3] > 20
    red = al & (rgb[..., 0] > 180) & (rgb[..., 1] < 70) & (rgb[..., 2] < 70)
    return int(red.sum())


def main():
    idle = [[load(f"idle_{d}_{i:02d}.png") for i in range(8)] for d in DIRS]
    walk = [[load(f"walk_{d}_{i:02d}.png") for i in range(10)] for d in DIRS]
    attack = [[load(f"attack_{d}_{i:02d}.png") for i in range(20)] for d in DIRS]
    before = {d: load(f"before_{d}.png") for d in DIRS}
    rest = {d: load(f"shift_{d}_00.png") for d in DIRS}
    ring = {d: load(f"shift_{d}_01.png") for d in DIRS}
    steam = {d: load(f"shift_{d}_02.png") for d in DIRS}
    high = {d: load(f"shift_{d}_03.png") for d in DIRS}

    sheet(idle, os.path.join(SPRITES, "ember-knight_idle.png"))
    sheet(walk, os.path.join(SPRITES, "ember-knight_walk.png"))
    sheet(attack, os.path.join(SPRITES, "ember-knight_attack.png"))

    # Shift, Normal. Times 0.00, 0.50, 1.00, 1.25, 1.50. Same clock as the approved strip.
    normal = []
    reduced = []
    for d in DIRS:
        g50 = glowify(before[d], 0.22 + 0.38 * 0.5)
        still = rest[d]
        normal.append([before[d], g50, ring[d], steam[d], high[d]])
        # Reduced: quieter glow, then a crossfade to the still. No ring, no steam.
        u125 = min(1.0, 0.25 / 0.35)
        reduced.append([
            before[d],
            glowify(before[d], 0.14 + 0.20 * 0.5),
            crossfade(glowify(before[d], 0.34), still, 0.0),
            crossfade(glowify(before[d], 0.34), still, u125),
            still,
        ])
    sheet(normal, os.path.join(SPRITES, "ember-knight_shift.png"))
    sheet(reduced, os.path.join(SPRITES, "ember-knight_shift-reduced.png"))

    reds = 0
    for group in (idle, walk, attack, normal, reduced):
        for row in group:
            for im in row:
                reds += danger(im)
    print("danger-red", reds)

    # One preview sheet: every direction, at idle, a walk stride, and the slash.
    cell = 160
    labels = ["idle", "walk", "slash"]
    picks = []
    for d_i, d in enumerate(DIRS):
        picks.append((idle[d_i][2], walk[d_i][2], attack[d_i][9]))
    preview = Image.new("RGB", (90 + 3 * cell, 28 + len(DIRS) * (cell + 8)), (24, 22, 32))
    dr = ImageDraw.Draw(preview)
    for j, lab in enumerate(labels):
        dr.text((90 + j * cell + 8, 6), lab, fill=(255, 220, 140))
    for r, (d, trip) in enumerate(zip(DIRS, picks)):
        y = 28 + r * (cell + 8)
        dr.text((8, y + 60), d, fill=(255, 255, 255))
        for j, im in enumerate(trip):
            preview.paste(im.resize((cell, cell), Image.Resampling.LANCZOS).convert("RGB"), (90 + j * cell, y))
    preview.save(os.path.join(PREVIEW, "sheet.png"))

    # Large attack close-up, facing the camera, all 20 frames. Two rows.
    si = DIRS.index("S")
    close = Image.new("RGBA", (10 * W, 2 * H), (24, 22, 32, 255))
    for i, im in enumerate(attack[si]):
        bg = Image.new("RGBA", (W, H), (24, 22, 32, 255))
        bg.alpha_composite(im)
        close.paste(bg, ((i % 10) * W, (i // 10) * H))
    close.convert("RGB").save(os.path.join(PREVIEW, "attack-closeup.png"))

    def gif_row(images, path, duration):
        side = 125  # in-game size of this 512 frame
        frames = [im.resize((side, side), Image.Resampling.LANCZOS).convert("RGBA") for im in images]
        bg = []
        for fr in frames:
            base = Image.new("RGBA", (side, side), (36, 34, 48, 255))
            base.alpha_composite(fr)
            bg.append(base.convert("RGB"))
        bg[0].save(path, save_all=True, append_images=bg[1:], duration=duration, loop=0)

    gif_row(idle[si], os.path.join(PREVIEW, "idle-S.gif"), 125)       # 8 fps
    gif_row(walk[si], os.path.join(PREVIEW, "walk-S.gif"), 33)        # nearest GIF step to 30 fps
    gif_row(attack[si], os.path.join(PREVIEW, "attack-S.gif"), 100)   # 10 fps
    gif_row(normal[si], os.path.join(PREVIEW, "shift-S.gif"), [500, 500, 250, 250, 750])

    # 40 px tall, the size the Manager checked. Idle, three walk steps, the hit, and the back view.
    def at40(im):
        a = np.array(im)
        ys, xs = np.where(a[..., 3] > 20)
        crop = im.crop((int(xs.min()), int(ys.min()), int(xs.max()) + 1, int(ys.max()) + 1))
        ch = 40
        cw = max(1, round(crop.width * ch / crop.height))
        return crop.resize((cw, ch), Image.Resampling.LANCZOS)
    bits = [
        at40(idle[si][0]), at40(walk[si][0]), at40(walk[si][2]), at40(walk[si][5]),
        at40(attack[si][8]), at40(attack[si][9]), at40(attack[DIRS.index("N")][0]),
    ]
    pad = 6
    row = Image.new("RGBA", (sum(b.width + pad for b in bits) + pad, 40 + pad * 2), (24, 22, 32, 255))
    x = pad
    for b in bits:
        bg = Image.new("RGBA", b.size, (24, 22, 32, 255))
        bg.alpha_composite(b)
        row.alpha_composite(bg, (x, pad))
        x += b.width + pad
    row.convert("RGB").save(os.path.join(PREVIEW, "check-40.png"))
    print("wrote", SPRITES, PREVIEW)


if __name__ == "__main__":
    main()
