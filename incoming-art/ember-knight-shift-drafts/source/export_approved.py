"""
Pack the approved 8acf72fd frames. Does not change the picture.

The frames are the same ones make_b_vfx_review.py puts on the review strip.
"""
import json, os
import numpy as np
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.join(HERE, "..")
SPRITES = os.path.join(ROOT, "sprites")
os.makedirs(SPRITES, exist_ok=True)

src = open(os.path.join(HERE, "make_b_vfx_review.py"), encoding="utf-8").read()
src = src.replace('if __name__ == "__main__":', "if False:")
ns = {"__file__": os.path.join(HERE, "make_b_vfx_review.py"), "__name__": "vfx"}
exec(compile(src, "make_b_vfx_review.py", "exec"), ns)

SHIFT_TIMES = ns["SHIFT_TIMES"]
normal = [ns["frame_at"](t, False) for t in SHIFT_TIMES] + [
    ns["living"](0.9, 3), ns["living"](0.15, 0), ns["living"](1.0, 2)
]
reduced = [ns["frame_at"](t, True) for t in SHIFT_TIMES] + [
    ns["idle_reduced"](), ns["idle_reduced"](), ns["idle_reduced"]()
]
labels_n = [
    "0.00 before", "0.50 glow", "1.00 burst", "1.25 steam",
    "1.50 idle", "idle embers", "core low", "core high",
]
labels_r = [
    "0.00 before", "0.50 glow", "1.00 fade", "1.25 still",
    "1.50 still", "still", "still", "still",
]
times = [0.00, 0.50, 1.00, 1.25, 1.50, None, None, None]

def sheet(frames, path):
    """Copy pixels exactly, including colour hidden under a clear pixel."""
    w, h = frames[0].size
    canvas = np.zeros((h, w * len(frames), 4), np.uint8)
    for i, fr in enumerate(frames):
        canvas[:, i * w:(i + 1) * w] = np.asarray(fr)
    im = Image.fromarray(canvas, "RGBA")
    im.save(path)
    return im

def check_frame(name, im):
    a = np.asarray(im)
    rgb = a[..., :3].astype(np.float32)
    al = a[..., 3]
    r, g, b = rgb[..., 0], rgb[..., 1], rgb[..., 2]
    mx = np.maximum(np.maximum(r, g), b)
    mn = np.minimum(np.minimum(r, g), b)
    dlt = mx - mn
    sat = np.divide(dlt, np.maximum(mx, 1.0))
    h = np.zeros(r.shape, np.float32)
    m = dlt > 1
    rr, gg, bb, dd, mm = r[m], g[m], b[m], dlt[m], mx[m]
    hh = np.empty(int(m.sum()), np.float32)
    m1 = mm == rr
    hh[m1] = ((gg[m1] - bb[m1]) / dd[m1]) % 6
    m2 = (mm == gg) & ~m1
    hh[m2] = (bb[m2] - rr[m2]) / dd[m2] + 2
    m3 = ~m1 & ~m2
    hh[m3] = (rr[m3] - gg[m3]) / dd[m3] + 4
    h[m] = hh / 6.0
    danger = int(((al > 200) & (h < 0.03) & (sat > 0.45) & (mx > 100)).sum())
    ys, xs = np.where(al > 20)
    margin = (int(xs.min()), int(im.width - 1 - xs.max()), int(ys.min()), int(im.height - 1 - ys.max()))
    return danger, min(margin), margin

sn = sheet(normal, os.path.join(SPRITES, "ember-knight-shift_normal.png"))
sr = sheet(reduced, os.path.join(SPRITES, "ember-knight-shift_reduced.png"))

# Prove the sheet splits back to the same pixels.
def split_ok(sheet_im, frames):
    w, h = frames[0].size
    worst = 0
    for i, fr in enumerate(frames):
        part = sheet_im.crop((i * w, 0, (i + 1) * w, h))
        worst = max(worst, int(np.abs(np.asarray(part).astype(np.int16) - np.asarray(fr).astype(np.int16)).max()))
    return worst

sheet_delta = max(split_ok(sn, normal), split_ok(sr, reduced))

# Compare the 140 px thumbs inside the approved preview strip.
preview = Image.open(os.path.join(ROOT, "preview", "review-b-vfx-strip.png")).convert("RGB")
cell, left = 168, 168
thumb_worst = 0
for row, frames in enumerate((normal, reduced)):
    y = 108 + row * 200
    for i, fr in enumerate(frames):
        x = left + i * cell
        got = preview.crop((x + 10, y + 8, x + 150, y + 148))
        thumb = fr.resize((140, 140), Image.Resampling.LANCZOS)
        # The preview pastes the thumb on a dark card. Compare only where the thumb is opaque.
        ta = np.asarray(thumb)
        ga = np.asarray(got)
        mask = ta[..., 3] == 255
        if mask.any():
            thumb_worst = max(thumb_worst, int(np.abs(ta[..., :3][mask].astype(np.int16) - ga[mask].astype(np.int16)).max()))

lines = []
lines.append("Export check against the approved preview (commit 8acf72fd).")
lines.append(f"Sheet splits back to the source frames. Max channel difference: {sheet_delta}.")
lines.append(f"Approved strip thumbs vs these frames (opaque pixels). Max channel difference: {thumb_worst}.")
worst_margin = 999
any_red = 0
for i, (lab, fr) in enumerate(zip(labels_n, normal)):
    danger, edge, margin = check_frame(f"normal-{i}", fr)
    any_red += danger
    worst_margin = min(worst_margin, edge)
    lines.append(f"normal {i} {lab}: danger-red {danger}, margin L{margin[0]} R{margin[1]} T{margin[2]} B{margin[3]}")
for i, (lab, fr) in enumerate(zip(labels_r, reduced)):
    danger, edge, margin = check_frame(f"reduced-{i}", fr)
    any_red += danger
    worst_margin = min(worst_margin, edge)
    lines.append(f"reduced {i} {lab}: danger-red {danger}, margin L{margin[0]} R{margin[1]} T{margin[2]} B{margin[3]}")
identical_tail = all(np.array_equal(np.asarray(reduced[i]), np.asarray(reduced[-1])) for i in range(4, 8))
lines.append(f"Reduced Motion frames 4 through 7 are the same picture: {identical_tail}.")
lines.append(f"Danger-red total: {any_red}. Closest opaque pixel to a frame edge: {worst_margin} px.")
lines.append("PASS" if sheet_delta == 0 and thumb_worst <= 2 and any_red == 0 and worst_margin >= 8 and identical_tail else "LOOK AGAIN")
text = "\n".join(lines) + "\n"
open(os.path.join(SPRITES, "EXPORT_CHECK.txt"), "w", encoding="utf-8").write(text)
print(text)

manifest = {
    "id": "ember-knight-shift",
    "label": "Ember Knight — shifted form",
    "placeholderName": "Warm Shield",
    "placeholderNameStatus": "PLACEHOLDER. Not approved as a name. Do not use it as an id.",
    "approvedCommit": "8acf72fdd8f76ed3fc7c956dd89041118e4e8fa0",
    "status": "Approved by Jay as the effects look. Not imported. Manager merges. Do not copy into the game from this file alone.",
    "direction": "S only. The approved pictures face the camera. No other direction was drawn.",
    "frameWidth": 512,
    "frameHeight": 512,
    "anchorPx": [256.0, 435.2],
    "anchorNote": "Feet. The camera puts the ground line at 85% of the frame height. 0.85 * 512 = 435.2. X is the centre.",
    "orthoScaleTiles": 2.6,
    "elevationDeg": 35,
    "sourcePixelsPerTile": round(512 / 2.6, 4),
    "gamePixelsPerTile": 48,
    "gameDisplayPx": 125,
    "gameScale": round(48 / (512 / 2.6), 6),
    "gameScaleNote": "Draw the 512 frame at 125 px so it matches 48 px per tile. 512 * 48 / (512/2.6) = 124.8, rounded to 125.",
    "sheetLayout": "One row. Columns are frames, left to right, no padding. Straight alpha.",
    "sheets": {
        "normal": {
            "file": "ember-knight-shift_normal.png",
            "frames": 8,
            "columns": labels_n,
            "timeSec": times,
        },
        "reducedMotion": {
            "file": "ember-knight-shift_reduced.png",
            "frames": 8,
            "columns": labels_r,
            "timeSec": times,
            "note": "Frames 4, 5, 6 and 7 are the same still.",
        },
    },
    "timing": {
        "shiftGlowSec": 1.0,
        "shiftGlowColor": "#fff4cf",
        "shiftGlowHalo": "#ffecaa",
        "settleAccentSec": 0.5,
        "settleStartsAtSec": 1.0,
        "noStrobe": True,
        "noFlashAfterGlow": True,
        "keyframesOnly": True,
        "keyframesNote": "These are the approved sample frames, not a 20-frame-per-second film. Playing the eight frames back to back will jump. Do not invent the frames in between.",
    },
    "reducedMotion": {
        "particles": False,
        "pulse": False,
        "drift": False,
        "keeps": ["seams on the body", "core", "rim", "ground pool"],
    },
    "layers": {
        "body": "renders/ember-knight-shift-b_S.png",
        "before": "incoming-art/guardian-concepts/renders/ember-knight_p3_S.png",
        "core": "layers/fx-core.png",
        "rim": "layers/fx-rim.png",
        "ground": "layers/fx-ground.png",
        "steam": ["layers/fx-steam-00.png", "layers/fx-steam-01.png", "layers/fx-steam-02.png", "layers/fx-steam-03.png"],
        "burst": ["layers/fx-burst-00.png", "layers/fx-burst-01.png", "layers/fx-burst-02.png", "layers/fx-burst-03.png"],
        "embers": ["layers/fx-ember-00.png", "layers/fx-ember-01.png", "layers/fx-ember-02.png", "layers/fx-ember-03.png", "layers/fx-ember-04.png"],
    },
    "drawOrder": ["ground", "body", "rim", "core", "burst", "steam", "embers"],
    "drawOrderNote": "Ground sits under the body. Burst, steam and embers are Normal only, and only on the frames listed above. The sheets already have this order baked in.",
    "colors": {
        "armour": "#4a5a72",
        "copper": "#c9824a",
        "seams": "#ffc14d",
        "core": ["#fff1b8", "#ffd08a"],
        "rim": "#ffe08a",
        "ground": "#ffb25a",
        "steam": "#fff6e0",
        "embers": "#ffe7a8",
        "shiftGlow": "#fff4cf",
    },
}
with open(os.path.join(SPRITES, "ember-knight-shift.json"), "w", encoding="utf-8") as f:
    json.dump(manifest, f, indent=2)
    f.write("\n")
print("wrote", os.path.join(SPRITES, "ember-knight-shift.json"))
