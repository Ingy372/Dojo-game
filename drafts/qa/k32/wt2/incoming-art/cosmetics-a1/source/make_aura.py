"""A1 sample: the soft player aura (2D, made from the approved player silhouette, so it fits every frame).

  aura-back  : a soft glow hugging the body (drawn FIRST, under every player layer) + a soft ground ring at the feet
  aura-front : three tiny motes drifting up beside the legs (drawn LAST); they fade out by chest height
Both are neutral (white with alpha): the game tints them (multiply), like the gi. Nothing ever goes above the head:
the glow fades out before the top of the head and is cut to zero at the head's top row.
Same frame size, anchor, directions and frame count as the player sheet; loops in step with the animation.

    python3 incoming-art/cosmetics-a1/source/make_aura.py --anims idle
Reduced motion: the game can show frame 0 only (the glow still reads; nothing pulses or drifts)."""
import argparse, json, math, os
import numpy as np
from PIL import Image, ImageFilter
from cosm_lib import BASE, FW, FH, ART
ap = argparse.ArgumentParser(); ap.add_argument("--anims", default="idle")
ap.add_argument("--out", default=os.path.join(ART, "cosmetics-a1", "sprites", "body-a")); A = ap.parse_args()
os.makedirs(A.out, exist_ok=True)
SIL = ["body", "skin", "gi", "belt"]          # the always-drawn base; hair sits inside the glow anyway
AX, AY = BASE.J["anchor"]["x"], BASE.J["anchor"]["y"]
SS = 2
def blur(a, r):
    im = Image.fromarray((np.clip(a, 0, 1) * 255).astype(np.uint8), "L").resize((FW * SS, FH * SS), Image.BILINEAR)
    return np.asarray(im.filter(ImageFilter.GaussianBlur(r * SS)).resize((FW, FH), Image.LANCZOS), dtype=np.float32) / 255
def grow(a, px):
    im = Image.fromarray((a > 0.3).astype(np.uint8) * 255, "L")
    return np.asarray(im.filter(ImageFilter.MaxFilter(px * 2 + 1)), dtype=np.float32) / 255
def smooth(e0, e1, x): t = np.clip((x - e0) / (e1 - e0), 0, 1); return t * t * (3 - 2 * t)
yy, xx = np.mgrid[0:FH, 0:FW].astype(np.float32)
meta = dict(note="A1 sample aura. Draw aura-back before every player layer and aura-front after them; tint both (multiply). "
                 "Frame-for-frame with the player animation of the same name. Reduced motion: show frame 0 only.",
            frameWidth=FW, frameHeight=FH, anchor=BASE.J["anchor"], directions=BASE.J["directions"],
            layers=[dict(name="aura-back", tint=True, drawn="first"), dict(name="aura-front", tint=True, drawn="last")], animations={})
for anim in A.anims.split(","):
    info = BASE.J["animations"][anim]; n = info["frames"]
    back = np.zeros((FH * 8, FW * n, 4), np.float32); front = np.zeros_like(back)
    for r, d in enumerate(BASE.J["directions"]):
        for f in range(n):
            ph = 2 * math.pi * f / n                                  # one gentle breath per loop
            m = np.zeros((FH, FW), np.float32)
            for L in SIL:
                px = BASE.frame(L, anim, d, f)
                if px is not None: m = np.maximum(m, px[..., 3])
            rows = np.where(m.max(1) > 0.3)[0]; top = rows.min()
            k = 0.5 + 0.5 * math.cos(ph)                            # 1 -> 0 -> 1
            g = blur(grow(m, 5 + round(k)), 5.5 + 1.0 * k)
            glow = np.clip(g * 1.5, 0, 1) * (0.62 + 0.16 * k)
            ring = np.exp(-(((xx - AX) / (30 + 2 * k)) ** 2 + ((yy - AY) / (9 + 0.6 * k)) ** 2) * 1.6)
            ring = ring * (1 - 0.55 * np.exp(-(((xx - AX) / 18) ** 2 + ((yy - AY) / 5.5) ** 2) * 1.6)) * (0.55 + 0.15 * k)
            a = np.maximum(glow, ring)
            a *= smooth(top + 2, top + 16, yy)                        # fade out before the top of the head
            a[:top] = 0
            cell = back[r * FH:(r + 1) * FH, f * FW:(f + 1) * FW]; cell[..., :3] = 1; cell[..., 3] = a
            # motes: three tiny soft dots rising beside the legs, looping exactly once per animation loop
            fa = np.zeros((FH, FW), np.float32)
            for j, (dx, off) in enumerate(((-24, 0.0), (22, 0.37), (-15, 0.71))):
                t = (f / n + off) % 1.0
                my = AY - 4 - 46 * t; mx = AX + dx + 2.0 * math.sin(2 * math.pi * (t + j * 0.3))
                life = math.sin(math.pi * t) ** 1.5
                fa = np.maximum(fa, np.exp(-(((xx - mx) ** 2 + (yy - my) ** 2) / 3.2)) * 1.0 * life)
            fa[:top] = 0
            cell = front[r * FH:(r + 1) * FH, f * FW:(f + 1) * FW]; cell[..., :3] = 1; cell[..., 3] = fa
    sheets = {}
    for nm, arr in (("aura-back", back), ("aura-front", front)):
        fn = f"player-a_{nm}_{anim}.png"; Image.fromarray((arr * 255).round().astype(np.uint8), "RGBA").save(os.path.join(A.out, fn)); sheets[nm] = fn
    meta["animations"][anim] = dict(frames=n, fps=info["fps"], loop=info.get("loop", True), sheets=sheets)
json.dump(meta, open(os.path.join(A.out, "aura.json"), "w"), indent=1)
print("aura done", A.anims)
