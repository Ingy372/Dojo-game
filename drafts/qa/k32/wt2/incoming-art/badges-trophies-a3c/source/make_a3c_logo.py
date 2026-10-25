"""
A3c: the school's own logo as the seal's school mark (Artist bot). Run from incoming-art/:
    python3 badges-trophies-a3c/source/make_a3c_logo.py
Source: source/jay-logo/logo-white.jpg (Jay's own school logo). Keeps only the red cross and the
kicking figure (no ring text, no name plate), trims it, and fits it into the SEAL_SPEC safe circle
(128x128 RGBA, everything within the centred 112 px circle). Then re-exports the baked trophies.
Needs Pillow, numpy, scipy.
"""
import os, json, numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage
H = os.path.dirname(os.path.abspath(__file__)); IA = os.path.abspath(os.path.join(H, "..", ".."))
A3L = os.path.join(IA, "badges-trophies-a3", "sprites", "trophies", "certified-layers")
a = np.asarray(Image.open(os.path.join(H, "jay-logo", "logo-white.jpg")).convert("RGB")).astype(int)
r, g, b = a[..., 0], a[..., 1], a[..., 2]
red = (r > 150) & (g < 110) & (b < 110)
dark = (r < 110) & (g < 110) & (b < 110)
lab, n = ndimage.label(dark)
# the kicking figure = the big dark blob whose box sits inside the red cross's box (the ring+text blob is bigger and wider)
ry, rx = np.nonzero(red); RB = (rx.min(), rx.max(), ry.min(), ry.max())
best = None
for i, sl in enumerate(ndimage.find_objects(lab), 1):
    if sl[0].start >= RB[2] and sl[0].stop <= RB[3] and sl[1].start >= RB[0] - 50 and sl[1].stop <= RB[1] + 50:
        s = (lab[sl] == i).sum()
        if best is None or s > best[0]: best = (s, i)
fig = ndimage.binary_fill_holes(lab == best[1])
cross = ndimage.binary_closing(red | (fig & False), iterations=3)
cross = ndimage.binary_fill_holes(cross | fig) & ~fig     # cross behind the figure, no JPEG gaps
RED = tuple(int(np.median(a[..., k][red])) for k in range(3))
INK = (20, 20, 24)
m = (cross | fig); ys, xs = np.nonzero(m); cy, cx = (ys.min() + ys.max()) / 2, (xs.min() + xs.max()) / 2
rad = np.sqrt((ys - cy) ** 2 + (xs - cx) ** 2).max()
# readability at 16 px: a light keyline around the figure so the black reads against the red
key = ndimage.binary_dilation(fig, iterations=int(rad * 0.035)) & ~fig
rgba = np.zeros(a.shape[:2] + (4,), np.uint8)
rgba[cross] = (*RED, 255); rgba[key & (cross | ndimage.binary_dilation(m, iterations=1))] = (255, 250, 240, 255); rgba[fig] = (*INK, 255)
outer = ndimage.binary_dilation(m | key, iterations=int(rad * 0.03)) & ~(m | key)   # thin dark outline round the whole mark
rgba[outer] = (*INK, 255)
pad = int(rad * 1.24); y0, x0 = int(cy) - pad, int(cx) - pad
big = Image.fromarray(rgba).crop((x0, y0, x0 + 2 * pad, y0 + 2 * pad))
mark = big.resize((128, 128), Image.LANCZOS)
mk = np.asarray(mark)[..., 3]; yy, xx = np.nonzero(mk > 8)
print("mark max radius px:", round(float(np.sqrt((yy - 63.5) ** 2 + (xx - 63.5) ** 2).max()), 1), "(safe circle = 56)")
mark.save(os.path.join(A3L, "seal-mark-school.png"))
mark.resize((512, 512), Image.LANCZOS).save(os.path.join(IA, "badges-trophies-a3c", "preview", "mark-512.png"))

# ---- re-export: every trophy that uses the seal
TW, TH, SX, SY, MARK_SAFE_R = 104, 166, 76, 130, 8          # as in make_a3_seal.py / SEAL_SPEC.md
def mark_from_file(path):                                     # = mark_from_file() in make_a3_seal.py
    m = Image.open(path).convert("RGBA"); d = MARK_SAFE_R * 2; s = Image.new("RGBA", (TW, TH))
    s.alpha_composite(m.resize((d, d), Image.LANCZOS), (SX - MARK_SAFE_R, SY - MARK_SAFE_R)); return s
MS = mark_from_file(os.path.join(A3L, "seal-mark-school.png")); MS.save(os.path.join(A3L, "seal-mark-school-placed.png"))
AZ = Image.open(os.path.join(A3L, "seal-backing-actionzone.png")).convert("RGBA")
def school(img): im = img.copy(); im.alpha_composite(AZ); im.alpha_composite(MS); return im
B3 = os.path.join(IA, "badges-trophies-a3b", "sprites"); st = json.load(open(os.path.join(B3, "static.json")))
os.makedirs(os.path.join(B3, "trophies", "school"), exist_ok=True); done = []
for sid, e in st["sprites"].items():
    if "schoolMark" not in e.get("files", {}): continue
    src = os.path.join(B3, e["files"]["img"]); im = Image.open(src).convert("RGBA")
    out = school(im)
    if sid == "ct-accolade-student-of-the-month":     # was baked with AZ backing + star stand-in: replace in place
        out.save(src); e["note"] = e["note"].replace("the default star mark (until the AZ logo arrives)", "the school logo mark (A3c)")
    e["files"]["imgSchool"] = f"trophies/school/{sid}.png"; out.save(os.path.join(B3, "trophies", "school", f"{sid}.png")); done.append(sid)
json.dump(st, open(os.path.join(B3, "static.json"), "w"), indent=1)
A3S = os.path.join(IA, "badges-trophies-a3", "sprites"); s3 = json.load(open(os.path.join(A3S, "static.json")))
lay = s3["sprites"]["certified-trophy-layered"]["layers"]
for l in lay:
    if l["id"] == "schoolMark":
        l["files"]["school"] = "trophies/certified-layers/seal-mark-school.png"
        l["note"] = "school = the school's own logo (A3c: red cross + kicking figure). PLACEHOLDER is a stand-in only; never ship it."
smp = Image.open(os.path.join(A3S, "trophies", "certified-trophy-sample.png")).convert("RGBA")
school(smp).save(os.path.join(A3S, "trophies", "certified-trophy-school.png"))
json.dump(s3, open(os.path.join(A3S, "static.json"), "w"), indent=1)
print("re-exported", len(done) + 1, "trophies")
