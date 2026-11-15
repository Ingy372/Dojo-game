"""
Dojo Ascent — run-concept preview and sheet check.

Stacks the rendered layers the way the game does (straight alpha, multiply tints),
checks every cell of all 8 sheets, and writes the review pictures.

    python3 incoming-art/player-run-concept/source/make_preview.py
"""
import json, os
import numpy as np
from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
RUN = os.path.join(ROOT, "sprites")
WALK = os.path.abspath(os.path.join(ROOT, "..", "player-custom", "sprites", "body-a"))
PREVIEW = os.path.join(ROOT, "preview")
os.makedirs(PREVIEW, exist_ok=True)

# Same tints as the walk comparison, except hair-01 (the layer this concept rendered).
LAYERS = [
    ("body", None),
    ("skin", "#e0a984"),
    ("gi", "#f2e9d8"),
    ("belt", "#f5d22e"),
    ("belt-rim", "#2e2a3a"),
    ("face-01", None),
    ("hair-01", "#3a2519"),
]
# Drawn in the game only on a black belt. Checked, not shown on the yellow preview.
SHEEN = ("belt-sheen", "#a2a6b6")
FLOOR, GRID = (52, 48, 66, 255), (82, 76, 104, 255)
DIRS_SHOW = ["S", "E", "N"]


def rgb(h):
    return np.array([int(h[i:i + 2], 16) / 255 for i in (1, 3, 5)], np.float32)


def load_meta(folder, anim):
    meta = json.load(open(os.path.join(folder, "player-a.json")))
    return meta, meta["animations"][anim]


def composite(folder, meta, info, layers):
    base = None
    sheets = {}
    for name, tint in layers:
        path = os.path.join(folder, info["sheets"][name])
        img = np.asarray(Image.open(path).convert("RGBA"), np.float32) / 255
        sheets[name] = img
        if tint:
            img = img.copy()
            img[..., :3] *= rgb(tint)
        if base is None:
            base = img
        else:
            a = img[..., 3:]
            out = base.copy()
            out[..., 3:] = a + base[..., 3:] * (1 - a)
            out[..., :3] = (img[..., :3] * a + base[..., :3] * base[..., 3:] * (1 - a)) / np.maximum(out[..., 3:], 1e-6)
            base = out
    return base, sheets


def cell_np(comp, meta, dn, f):
    W, H = meta["frameWidth"], meta["frameHeight"]
    i = meta["directions"].index(dn)
    return comp[i * H:(i + 1) * H, f * W:(f + 1) * W]


def floor_cell(meta, info, comp, dn, f, sec):
    W, H = meta["frameWidth"], meta["frameHeight"]
    ppt = meta["pixelsPerTile"]
    tall = ppt * np.sin(np.radians(meta["camera"]["elevationDeg"]))
    ax, ay = meta["anchor"]["x"], meta["anchor"]["y"]
    fx, fy = meta["directionVectors"][dn]
    dist = info["groundMotion"]["designSpeedTilesPerSec"] * sec
    c = Image.new("RGBA", (W, H), FLOOR)
    d = ImageDraw.Draw(c)
    ox, oy = (-fx * dist * ppt) % ppt, (-fy * dist * tall) % tall
    for k in range(-3, 4):
        d.line([(ax + ox + (k - 1) * ppt, 0), (ax + ox + (k - 1) * ppt, H)], fill=GRID)
        d.line([(0, ay + oy + (k - 1) * tall), (W, ay + oy + (k - 1) * tall)], fill=GRID)
    spr = cell_np(comp, meta, dn, f)
    c.alpha_composite(Image.fromarray((np.clip(spr, 0, 1) * 255).astype(np.uint8), "RGBA"))
    return c


def bbox(a, thresh=0.04):
    ys, xs = np.where(a > thresh)
    if len(xs) == 0:
        return None
    return int(xs.min()), int(ys.min()), int(xs.max()), int(ys.max()), int(len(xs))


def main():
    meta, info = load_meta(RUN, "run")
    wmeta, winfo = load_meta(WALK, "walk")
    comp, sheets = composite(RUN, meta, info, LAYERS)
    wcomp, _ = composite(WALK, wmeta, winfo, LAYERS)
    sheen = np.asarray(Image.open(os.path.join(RUN, info["sheets"][SHEEN[0]])).convert("RGBA"), np.float32) / 255
    W, H = meta["frameWidth"], meta["frameHeight"]
    nF = info["frames"]
    lines = []
    lines.append(f"frame {W}x{H}  frames {nF}  fps {info['fps']}  duration {info['durationSec']}s")
    lines.append(f"anchor {meta['anchor']}  ppt {meta['pixelsPerTile']}  camera {meta['camera']}")
    lines.append(f"dirs {meta['directions']}")
    lines.append(f"sheets {list(info['sheets'])}")

    # Per-layer, per-cell coverage and edge margin. Danger-red on the composited character.
    red_total = 0
    margins = []
    empty = []
    layer_names = [n for n, _ in LAYERS] + [SHEEN[0]]
    layer_imgs = dict(sheets)
    layer_imgs[SHEEN[0]] = sheen
    for name in layer_names:
        im = layer_imgs[name]
        if im.shape[1] != nF * W or im.shape[0] != len(meta["directions"]) * H:
            lines.append(f"SIZE FAIL {name} {im.shape}")
        for di, dn in enumerate(meta["directions"]):
            for f in range(nF):
                cell = im[di * H:(di + 1) * H, f * W:(f + 1) * W]
                bb = bbox(cell[..., 3])
                if bb is None:
                    empty.append(f"{name} {dn} f{f}")
                    continue
                x0, y0, x1, y1, count = bb
                margins.append((name, dn, f, x0, W - 1 - x1, y0, H - 1 - y1, count))
    lines.append(f"empty cells: {len(empty)}")
    for e in empty:
        lines.append("  EMPTY " + e)
    if empty and all(e.startswith("face-01 N") for e in empty):
        lines.append("  (expected: facing away, the face sits on the front of the head. The kept walk's north face row is also only a few pixels.)")
    # closest opaque pixel to a frame edge, per shown layer (ignore a 1px fringe)
    closest = min(margins, key=lambda m: min(m[3], m[4], m[5], m[6]))
    lines.append(
        f"closest opaque to frame edge: {closest[0]} {closest[1]} f{closest[2]} "
        f"L{closest[3]} R{closest[4]} T{closest[5]} B{closest[6]} px"
    )

    # Registration: belt and face centroids should sit inside the body box.
    reg_bad = []
    for di, dn in enumerate(meta["directions"]):
        for f in range(nF):
            body = bbox(sheets["body"][di * H:(di + 1) * H, f * W:(f + 1) * W, 3])
            belt = bbox(sheets["belt"][di * H:(di + 1) * H, f * W:(f + 1) * W, 3])
            face = bbox(sheets["face-01"][di * H:(di + 1) * H, f * W:(f + 1) * W, 3])
            gi = bbox(sheets["gi"][di * H:(di + 1) * H, f * W:(f + 1) * W, 3])
            if not body or not belt or not gi:
                reg_bad.append(f"missing {dn} f{f}")
                continue
            # belt centre inside body (allow 4px for the outline sitting on the edge)
            cx, cy = (belt[0] + belt[2]) / 2, (belt[1] + belt[3]) / 2
            if not (body[0] - 4 <= cx <= body[2] + 4 and body[1] - 4 <= cy <= body[3] + 4):
                reg_bad.append(f"belt outside body {dn} f{f}")
            # The gi ends above the bare feet. A large gap here is the foot, not a slipped layer.
            # Flag only a gi that hangs far below the body (that would be a bad stack).
            if gi[3] > body[3] + 6:
                reg_bad.append(f"gi hangs below body {dn} f{f} gi {gi[3]} body {body[3]}")
            if face and dn in ("S", "SE", "SW"):
                if face[3] > belt[1] + 4:
                    reg_bad.append(f"face below belt {dn} f{f}")
    lines.append(f"registration flags: {len(reg_bad)}")
    for r in reg_bad[:30]:
        lines.append("  REG " + r)

    # Loop seam and motion vs the walk, on the composited character.
    def mad(a, b):
        m = (a[..., 3] > 0.04) | (b[..., 3] > 0.04)
        if not m.any():
            return 0.0
        return float(np.mean(np.abs(a[m, :3] - b[m, :3])))

    for dn in meta["directions"]:
        diffs = []
        for f in range(nF):
            a = cell_np(comp, meta, dn, f)
            b = cell_np(comp, meta, dn, (f + 1) % nF)
            diffs.append(mad(a, b))
        walk_diff = []
        for f in range(nF):
            walk_diff.append(mad(cell_np(comp, meta, dn, f), cell_np(wcomp, wmeta, dn, f)))
        lines.append(
            f"{dn} step-delta mean {np.mean(diffs):.4f}  wrap(f{nF-1}->f0) {diffs[-1]:.4f}  "
            f"vs-walk mean {np.mean(walk_diff):.4f} min {np.min(walk_diff):.4f}"
        )

    # Head top and feet bottom, to measure bounce and lean. Facing E: forward is +x.
    def head_feet(im):
        a = im[..., 3] > 0.15
        ys, xs = np.where(a)
        if len(xs) == 0:
            return None
        top = int(ys.min())
        # feet: opaque pixels in the lowest 10 rows of the silhouette
        y1 = int(ys.max())
        foot = a.copy()
        foot[: y1 - 9, :] = False
        fys, fxs = np.where(foot)
        return top, y1, float(xs[ys == top].mean()), float(fxs.mean()), float(fys.mean())

    lines.append("HEAD/FEET  (top y, bottom y, head-x, foot-x) run then walk")
    for dn in ("S", "E", "N"):
        for label, src, sm in (("run", comp, meta), ("walk", wcomp, wmeta)):
            tops, bots, hx, fx = [], [], [], []
            for f in range(nF):
                t = head_feet(cell_np(src, sm, dn, f))
                tops.append(t[0]); bots.append(t[1]); hx.append(t[2]); fx.append(t[3])
            lines.append(
                f"  {dn} {label} top {min(tops)}-{max(tops)} (span {max(tops)-min(tops)}) "
                f"bottom {min(bots)}-{max(bots)} (span {max(bots)-min(bots)}) "
                f"headx-footx mean {np.mean(np.array(hx)-np.array(fx)):.1f}"
            )

    # Danger red on the composited preview (the character, not the floor).
    rgb8 = np.clip(comp[..., :3] * 255, 0, 255)
    a = comp[..., 3] > 0.2
    red = a & (rgb8[..., 0] > 180) & (rgb8[..., 1] < 70) & (rgb8[..., 2] < 70)
    lines.append(f"danger-red pixels on composited run: {int(red.sum())}")

    def centre_span(folder, anim, layer, dn):
        sm, si = load_meta(folder, anim)
        im = np.asarray(Image.open(os.path.join(folder, si["sheets"][layer])))
        di = sm["directions"].index(dn)
        vals = []
        for f in range(nF):
            a = im[di * H:(di + 1) * H, f * W:(f + 1) * W, 3] > 20
            ys, xs = np.where(a)
            if len(xs) == 0:
                continue
            vals.append((float(xs.mean()), int(xs.max() - xs.min())))
        cspan = round(max(v[0] for v in vals) - min(v[0] for v in vals), 1)
        wspan = max(v[1] for v in vals) - min(v[1] for v in vals)
        return cspan, wspan

    for dn in ("S", "E"):
        rc, rw = centre_span(RUN, "run", "belt", dn)
        wc, ww = centre_span(WALK, "walk", "belt", dn)
        rg = centre_span(RUN, "run", "gi", dn)[1]
        wg = centre_span(WALK, "walk", "gi", dn)[1]
        lines.append(
            f"{dn} belt centre travel run {rc}px walk {wc}px; gi width change run {rg}px walk {wg}px"
        )

    # Interior holes: transparent pixels enclosed by the silhouette, per S/E/N frame.
    # A few gaps between arm and body are normal. A hole inside the torso is not.
    hole_notes = []
    for dn in meta["directions"]:
        for f in range(nF):
            a = cell_np(comp, meta, dn, f)[..., 3] > 0.08
            # flood from the border
            seen = np.zeros_like(a, bool)
            stack = []
            h, w = a.shape
            for x in range(w):
                if not a[0, x]:
                    stack.append((0, x))
                if not a[h - 1, x]:
                    stack.append((h - 1, x))
            for y in range(h):
                if not a[y, 0]:
                    stack.append((y, 0))
                if not a[y, w - 1]:
                    stack.append((y, w - 1))
            while stack:
                y, x = stack.pop()
                if y < 0 or x < 0 or y >= h or x >= w or seen[y, x] or a[y, x]:
                    continue
                seen[y, x] = True
                stack.extend(((y - 1, x), (y + 1, x), (y, x - 1), (y, x + 1)))
            holes = (~a) & (~seen)
            n = int(holes.sum())
            if n > 40:
                hole_notes.append(f"{dn} f{f} enclosed-transparent {n}")
    lines.append(f"frames with >40 enclosed transparent px: {len(hole_notes)}")
    for hnote in hole_notes:
        lines.append("  HOLE " + hnote)

    text = "\n".join(lines) + "\n"
    open(os.path.join(PREVIEW, "CHECK.txt"), "w").write(text)
    print(text)

    # Full sheet with direction labels.
    label_w = 36
    sheet = Image.new("RGB", (label_w + nF * W, len(meta["directions"]) * H), (24, 22, 32))
    dr = ImageDraw.Draw(sheet)
    comp_u8 = Image.fromarray((np.clip(comp, 0, 1) * 255).astype(np.uint8), "RGBA")
    for di, dn in enumerate(meta["directions"]):
        dr.text((4, di * H + 4), dn, fill=(255, 255, 255))
        row = comp_u8.crop((0, di * H, nF * W, (di + 1) * H))
        # paint on dark grey so transparency reads
        bg = Image.new("RGBA", row.size, (36, 34, 48, 255))
        bg.alpha_composite(row)
        sheet.paste(bg.convert("RGB"), (label_w, di * H))
    sheet.save(os.path.join(PREVIEW, "sheet-all-8.png"))

    # Before / after strip on a scrolling floor: walk on top, run below. S, E, N.
    # One row pair per direction, every frame, at 1x (the real sprite size).
    gap = 14
    strip = Image.new("RGB", (label_w + nF * W, len(DIRS_SHOW) * 2 * (H + gap)), (24, 22, 32))
    dr = ImageDraw.Draw(strip)
    for k, dn in enumerate(DIRS_SHOW):
        for r, (src_meta, src_info, src_comp, lab) in enumerate((
            (wmeta, winfo, wcomp, "walk"),
            (meta, info, comp, "run"),
        )):
            y = (k * 2 + r) * (H + gap)
            dr.text((4, y + 2), f"{dn} {lab}", fill=(255, 220, 120))
            for f in range(nF):
                cell = floor_cell(src_meta, src_info, src_comp, dn, f, f / src_info["fps"])
                strip.paste(cell.convert("RGB"), (label_w + f * W, y + gap))
    strip.save(os.path.join(PREVIEW, "strip-walk-vs-run.png"))

    # Close-ups: frames 1 and 4 (contact and the lifted knee) at 3x, S and E.
    picks = [0, 3, 5]
    cw, ch = W * 3, H * 3
    close = Image.new("RGB", (label_w + len(picks) * cw, 2 * 2 * (ch + gap)), (24, 22, 32))
    dr = ImageDraw.Draw(close)
    for k, dn in enumerate(("S", "E")):
        for r, (src_meta, src_info, src_comp, lab) in enumerate((
            (wmeta, winfo, wcomp, "walk"),
            (meta, info, comp, "run"),
        )):
            y = (k * 2 + r) * (ch + gap)
            dr.text((4, y + 2), f"{dn} {lab}", fill=(255, 220, 120))
            for j, f in enumerate(picks):
                cell = floor_cell(src_meta, src_info, src_comp, dn, f, f / src_info["fps"])
                close.paste(cell.resize((cw, ch), Image.NEAREST).convert("RGB"), (label_w + j * cw, y + gap))
                dr.text((label_w + j * cw + 6, y + gap + 4), f"f{f+1}", fill=(255, 255, 255))
    close.save(os.path.join(PREVIEW, "before-after-closeup.png"))

    # Phone size: the game draws at 48 px per tile, source is 80, so 0.6.
    # 128*0.6 = 76.8, 160*0.6 = 96. Round to 77 x 96.
    pw, ph = 77, 96
    phone = Image.new("RGB", (label_w + nF * pw, len(DIRS_SHOW) * (ph + gap)), (24, 22, 32))
    dr = ImageDraw.Draw(phone)
    for k, dn in enumerate(DIRS_SHOW):
        y = k * (ph + gap)
        dr.text((4, y + 2), dn, fill=(255, 220, 120))
        for f in range(nF):
            cell = floor_cell(meta, info, comp, dn, f, f / info["fps"])
            phone.paste(cell.resize((pw, ph), Image.LANCZOS).convert("RGB"), (label_w + f * pw, y + gap))
    phone.save(os.path.join(PREVIEW, "phone-s-e-n.png"))

    # GIF at the walk's 30 fps (33 ms, the same delay the walk comparisons use).
    # Front, side, back. Walk on the top row, run on the bottom, floor scrolling
    # at 4.5 tiles/s so a planted foot can be judged against the grid.
    scale = 2
    seconds = 2.0
    frames = []
    lab_w, top = 46, 18
    for t in range(int(seconds * 30)):
        sec = t / 30.0
        canvas = Image.new("RGB", (lab_w + len(DIRS_SHOW) * W * scale, top + 2 * (H * scale + 16)), (24, 22, 32))
        dr = ImageDraw.Draw(canvas)
        for r, (src_meta, src_info, src_comp, lab) in enumerate((
            (wmeta, winfo, wcomp, "walk"),
            (meta, info, comp, "run"),
        )):
            f = int(sec * src_info["fps"]) % src_info["frames"]
            y = top + r * (H * scale + 16)
            dr.text((4, y - 14), lab, fill=(255, 220, 120))
            for c, dn in enumerate(DIRS_SHOW):
                cell = floor_cell(src_meta, src_info, src_comp, dn, f, sec)
                canvas.paste(cell.resize((W * scale, H * scale), Image.NEAREST).convert("RGB"), (lab_w + c * W * scale, y))
                if r == 0:
                    dr.text((lab_w + c * W * scale + 4, 2), dn, fill=(255, 255, 255))
        frames.append(canvas)
    gif_path = os.path.join(PREVIEW, "run-front-side-back.gif")
    frames[0].save(gif_path, save_all=True, append_images=frames[1:], duration=33, loop=0, optimize=False)
    seq = "/tmp/player-run-preview-frames"
    os.makedirs(seq, exist_ok=True)
    for i, fr in enumerate(frames):
        fr.save(os.path.join(seq, f"{i:03d}.png"))
    # Phone-size moving preview. The game draws this art at 48 px per tile; the
    # sheets are 80 px per tile, so each frame is 0.6 of the source (77 x 96).
    pw, ph = 78, 96
    phone_frames = []
    for fr in frames:
        # crop off the label column and scale the three characters
        phone_frames.append(fr.resize((fr.width * pw // (W * scale), fr.height * ph // (H * scale)), Image.LANCZOS))
    phone_frames[0].save(
        os.path.join(PREVIEW, "phone-front-side-back.gif"),
        save_all=True, append_images=phone_frames[1:], duration=33, loop=0, optimize=False,
    )
    print("wrote previews", PREVIEW)


if __name__ == "__main__":
    main()
