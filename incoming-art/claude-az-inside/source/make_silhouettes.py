"""Mural silhouettes in the school logo's own style (Jay, Nov 19): the Kung Fu kicker is the logo's kicker itself, cut out of
textures/logo-mark.png; the stance and split figures are drawn to the same proportions (solid black, loose gi). Writes
textures/sil-kick.png, sil-stance.png, sil-split.png (black on transparent) and ../previews/silhouettes-check.png."""
import os, math
import numpy as np
from PIL import Image, ImageDraw
HERE = os.path.dirname(os.path.abspath(__file__)); TX = os.path.join(HERE, "textures")

# ---- 1. the logo kicker
lg = np.array(Image.open(os.path.join(TX, "logo-mark.png")).convert("RGBA")).astype(int)
r, g, b, a = lg[..., 0], lg[..., 1], lg[..., 2], lg[..., 3]
dark = (a > 128) & (r < 120) & (g < 120) & (b < 120)
H_, W_ = dark.shape
box = (240, 290, 700, 700)          # x0, y0, x1, y1 around the figure (inside the ring)
m = np.zeros_like(dark); m[box[1]:box[3], box[0]:box[2]] = dark[box[1]:box[3], box[0]:box[2]]
# keep the biggest connected piece (the figure), drop bits of the ring
lab = np.zeros(m.shape, int); cur = 0; sizes = {}
for y0 in range(box[1], box[3]):
    for x0 in range(box[0], box[2]):
        if m[y0, x0] and not lab[y0, x0]:
            cur += 1; st = [(y0, x0)]; lab[y0, x0] = cur; n = 0
            while st:
                y, x = st.pop(); n += 1
                for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1), (1, 1), (-1, -1), (1, -1), (-1, 1)):
                    yy, xx = y + dy, x + dx
                    if 0 <= yy < H_ and 0 <= xx < W_ and m[yy, xx] and not lab[yy, xx]: lab[yy, xx] = cur; st.append((yy, xx))
            sizes[cur] = n
big = max(sizes, key=sizes.get); fig = lab == big
ys, xs = np.nonzero(fig); y0, y1, x0, x1 = ys.min(), ys.max() + 1, xs.min(), xs.max() + 1
out = np.zeros((y1 - y0, x1 - x0, 4), np.uint8); out[..., 3] = (fig[y0:y1, x0:x1] * 255).astype(np.uint8); out[..., :3] = 20
kick = Image.fromarray(out); kick.save(os.path.join(TX, "sil-kick.png"))
KH = kick.height                       # the logo figure's height in px: the others are drawn at the same scale

# ---- 2. smooth gi limbs (Catmull-Rom centre line, width along it), drawn 4x then scaled down
SS = 4
def cr(pts, n=14):
    p = [pts[0]] + list(pts) + [pts[-1]]; out = []
    for i in range(1, len(p) - 2):
        for k in range(n):
            t = k / n; t2, t3 = t * t, t * t * t
            out.append(tuple(0.5 * ((2 * p[i][j]) + (-p[i - 1][j] + p[i + 1][j]) * t + (2 * p[i - 1][j] - 5 * p[i][j] + 4 * p[i + 1][j] - p[i + 2][j]) * t2
                                    + (-p[i - 1][j] + 3 * p[i][j] - 3 * p[i + 1][j] + p[i + 2][j]) * t3) for j in range(2)))
    out.append(pts[-1]); return out
def limb(d, pts, widths, T):
    c = cr(pts); n = len(c); L, R = [], []
    for i, (x, y) in enumerate(c):
        x2, y2 = c[min(i + 1, n - 1)]; x1_, y1_ = c[max(i - 1, 0)]; dx, dy = x2 - x1_, y2 - y1_; l = math.hypot(dx, dy) or 1
        f = i / (n - 1) * (len(widths) - 1); k = min(int(f), len(widths) - 2); w = widths[k] + (widths[k + 1] - widths[k]) * (f - k)
        L.append(T((x - dy / l * w / 2, y + dx / l * w / 2))); R.append(T((x + dy / l * w / 2, y - dx / l * w / 2)))
    d.polygon(L + R[::-1], fill=255)
def disc(d, c, rad, T):
    (x, y) = T(c); s_ = T((rad, 0))[0] - T((0, 0))[0]; d.ellipse((x - s_, y - s_, x + s_, y + s_), fill=255)
def figure(build, name, w_units, h_units):
    """units: figure height 1.0 = the logo kicker's standing height; y up, ground at 0"""
    U = KH * 1.0 * SS; Wp, Hp = int(w_units * U), int(h_units * U)
    im = Image.new("L", (Wp, Hp), 0); d = ImageDraw.Draw(im)
    T = lambda p: (Wp / 2 + p[0] * U, Hp - 0.02 * U - p[1] * U)
    build(d, T)
    if name == "sil-stance.png":           # rear arm over the jacket with a thin clear edge, like the white lines in the logo figure
        cut = Image.new("L", im.size, 0); dc = ImageDraw.Draw(cut)
        limb(dc, [(-0.07, 0.74), (-0.17, 0.63), (-0.08, 0.53), (0.0, 0.52)], [0.118, 0.113, 0.113, 0.1], T)   # a thin clear line around the arm
        im.paste(0, mask=cut); stance_arm(ImageDraw.Draw(im), T)
    im = im.resize((Wp // SS, Hp // SS), Image.LANCZOS)
    rgba = Image.new("RGBA", im.size, (20, 20, 20, 0)); rgba.putalpha(im); bb = rgba.getbbox(); rgba = rgba.crop(bb)
    rgba.save(os.path.join(TX, name)); return rgba

def crc(pts, n=10):
    """closed Catmull-Rom spline through contour points"""
    m_ = len(pts); out = []
    for i in range(m_):
        p0, p1, p2, p3 = pts[i - 1], pts[i], pts[(i + 1) % m_], pts[(i + 2) % m_]
        for k in range(n):
            t = k / n; t2, t3 = t * t, t * t * t
            out.append(tuple(0.5 * (2 * p1[j] + (-p0[j] + p2[j]) * t + (2 * p0[j] - 5 * p1[j] + 4 * p2[j] - p3[j]) * t2 + (-p0[j] + 3 * p1[j] - 3 * p2[j] + p3[j]) * t3) for j in range(2)))
    return out
def shape(d, T, pts, fill=255): d.polygon([T(p) for p in crc(pts)], fill=fill)
STANCE_BODY = [(0.13, 0.74), (0.155, 0.62), (0.15, 0.49), (0.18, 0.43), (0.27, 0.31), (0.305, 0.18), (0.325, 0.06), (0.4, 0.035), (0.41, 0.0),
               (0.21, 0.0), (0.205, 0.07), (0.185, 0.2), (0.15, 0.3), (0.07, 0.38), (0.0, 0.37), (-0.12, 0.29), (-0.25, 0.16), (-0.335, 0.065),
               (-0.29, 0.02), (-0.3, 0.0), (-0.47, 0.0), (-0.46, 0.055), (-0.38, 0.13), (-0.24, 0.31), (-0.12, 0.45), (-0.115, 0.52),
               (-0.125, 0.63), (-0.12, 0.72), (-0.06, 0.785), (0.02, 0.805), (0.09, 0.795)]
def stance(d, T):        # front stance, straight punch to the right, rear fist chambered at the hip (baggy karate gi)
    shape(d, T, STANCE_BODY)
    limb(d, [(0.04, 0.765), (0.27, 0.765), (0.455, 0.77)], [0.1, 0.095, 0.105], T); disc(d, (0.49, 0.772), 0.043, T)        # punch
    disc(d, (0.06, 0.85), 0.052, T); limb(d, [(0.04, 0.78), (0.055, 0.84)], [0.075, 0.07], T)                                  # head, neck
def stance_arm(d, T, grow=0.0):
    limb(d, [(-0.07, 0.74), (-0.17, 0.63), (-0.08, 0.53), (0.0, 0.52)], [0.1 + grow, 0.095 + grow, 0.095 + grow, 0.09 + grow], T)
    disc(d, (0.02, 0.523), 0.042 + grow / 2, T)
SPLIT_HALF = [(0.0, 0.805), (0.08, 0.795), (0.13, 0.765), (0.14, 0.68), (0.16, 0.62), (0.3, 0.615), (0.5, 0.625), (0.6, 0.63), (0.62, 0.67), (0.655, 0.7),
              (0.685, 0.685), (0.67, 0.62), (0.655, 0.5), (0.5, 0.49), (0.3, 0.465), (0.14, 0.43), (0.0, 0.415)]
def split(d, T):         # jump split, arms out (front view)
    pts = SPLIT_HALF[:-1] + [(-x, y) for x, y in reversed(SPLIT_HALF[1:])]
    shape(d, T, pts)
    for sg in (-1, 1):
        limb(d, [(sg * 0.08, 0.765), (sg * 0.26, 0.795), (sg * 0.42, 0.83)], [0.1, 0.095, 0.1], T); disc(d, (sg * 0.455, 0.837), 0.042, T)
    disc(d, (0.0, 0.85), 0.052, T); limb(d, [(0.0, 0.78), (0.0, 0.84)], [0.075, 0.07], T)
st = figure(stance, "sil-stance.png", 1.2, 0.98)
st = st.transpose(Image.FLIP_LEFT_RIGHT); st.save(os.path.join(TX, "sil-stance.png"))   # faces the logo, like the kicker
sp = figure(split, "sil-split.png", 1.3, 0.98)
# check sheet: logo kicker, stance, split side by side on white
sheet = Image.new("RGB", (kick.width + st.width + sp.width + 120, max(kick.height, st.height, sp.height) + 40), "white")
x = 20
for im in (kick, st, sp): sheet.paste(im, (x, sheet.height - 20 - im.height), im); x += im.width + 40
sheet.save(os.path.join(HERE, "..", "previews", "silhouettes-check.png"))
print("kick", kick.size, "stance", st.size, "split", sp.size)
