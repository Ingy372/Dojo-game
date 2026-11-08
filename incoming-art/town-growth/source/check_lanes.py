"""Lanes check (v5): NO part of any Blue sakura (crown, trunk, tree ring) may touch the walking-lane band (y 444-540 at @2x). Run after the passes are rendered:
    python3 incoming-art/town-growth/source/check_lanes.py [passes-dir]"""
import sys, os, numpy as np
from PIL import Image
SHIFT, W, H, Y0, Y1 = 76, 1864, 860, 444, 540
d = sys.argv[1] if len(sys.argv) > 1 else "/tmp/town-growth-passes"
a = np.zeros((H, W), bool); t = np.asarray(Image.open(os.path.join(d, "blue-trees.png")).convert("RGBA"))[..., 3] > 128
a[SHIFT:] = t[:H - SHIFT]
ys = np.where(a.any(1))[0]; n = int(a[Y0:Y1 + 1].sum())
print(f"sakura lowest-top y={ys.min()} (lane band {Y0}-{Y1}); tree pixels inside the band: {n}")
sys.exit(1 if n else 0)
