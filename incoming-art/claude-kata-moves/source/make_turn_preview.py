"""Game-look preview of the special turn as kata practice plays it: the kiai punch (right foot forward, the mirrored
punch), the special turn into the Low Block, then the next punch, with the hero's spot moved the way the game moves
it. Two panels: steps 3 -> 4 (seen from behind) and steps 6 -> 7 (facing the camera). Writes a GIF and an MP4.

    python incoming-art/claude-kata-moves/source/make_turn_preview.py --sheets incoming-art/claude-kata-moves/sprites/body-a --out <dir>
"""
import argparse, math, os, subprocess, sys
from PIL import Image, ImageDraw

ap = argparse.ArgumentParser(); ap.add_argument("--sheets", required=True); ap.add_argument("--out", required=True)
A = ap.parse_args()
os.makedirs(A.out, exist_ok=True)
lib_path = os.path.join(os.path.dirname(__file__), "..", "..", "player-custom", "source", "make_custom_preview.py")
g = {"__name__": "lib"}
sys.argv = ["x", "--sheets", A.sheets, "--out", A.out]
exec(open(lib_path, encoding="utf-8").read().split("# ------------------------------------------------------------------ the full-set review pictures")[0], g)
J, compose, PAL = g["J"], g["compose"], g["PAL"]
CH = dict(skin=PAL["skin"][3], hair=PAL["hair"][1], gi=PAL["gi"][0], face="face-01", hairStyle="hair-02", belt="Yellow")
ANIMS = J["animations"]
PPT = J["pixelsPerTile"]                     # 80 px per tile across
SIN = math.sin(math.radians(J["camera"]["elevationDeg"]))
AX, AY = J["anchor"]["x"], J["anchor"]["y"]
VEC = {"F": (0, -1), "B": (0, 1), "L": (-1, 0), "R": (1, 0)}
ROW = {"F": "N", "B": "S", "L": "W", "R": "E"}
MIRROR_ROW = {"N": "N", "S": "S", "E": "W", "W": "E"}
FPS = 20

def rot(v, deg):
    a = math.atan2(v[1], v[0]) + math.radians(deg)
    return (round(math.cos(a), 6), round(math.sin(a), 6))

def sprite(anim, row, f, mirrored):
    if mirrored:
        return compose(CH, anim, MIRROR_ROW[row], f).transpose(Image.FLIP_LEFT_RIGHT)
    return compose(CH, anim, row, f)

def panel(title, kiai_dir, turn_dir):
    """Frames of one panel: [(image of the hero, hero spot)], at 20 fps."""
    out = []
    pos = [0.0, 0.0]
    def play(anim, row, mirrored, hold):
        n = ANIMS[anim]["frames"]
        for f in list(range(n)) + [n - 1] * hold:
            out.append((sprite(anim, row, f, mirrored), tuple(pos)))
    play("kata_punch", ROW[kiai_dir], True, 10)                       # the kiai: right foot forward (mirrored punch)
    t = ANIMS["kata_special_turn"]["turn"]
    start = rot(VEC[turn_dir], -t["degrees"])
    right = rot(start, 90)
    at = lambda o: (right[0] * o["right"] + start[0] * o["forward"], right[1] * o["right"] + start[1] * o["forward"])
    s = at(t["startOffset"]); pos[0] -= s[0]; pos[1] -= s[1]
    row = {(0, -1): "N", (0, 1): "S", (-1, 0): "W", (1, 0): "E"}[(round(start[0]), round(start[1]))]
    play("kata_special_turn", row, False, 12)
    e = at(t["endOffset"]); pos[0] += e[0]; pos[1] += e[1]
    play("kata_punch", ROW[turn_dir], True, 16)                       # step 4/7 second beat: punch, right foot forward
    return title, out

panels = [panel("Steps 3 to 4: kiai, special turn, low block, punch", "F", "R"),
          panel("Steps 6 to 7: kiai, special turn, low block, punch", "B", "L")]
CW, CHH = 300, 240
n = max(len(p[1]) for p in panels)
BG = (0x2f, 0x2a, 0x3d, 255)
MAT = (0xc8, 0x5a, 0x3c, 255)
frames = []
for k in range(n):
    canvas = Image.new("RGBA", (CW * len(panels), CHH + 24), BG)
    dr = ImageDraw.Draw(canvas)
    for i, (title, seq) in enumerate(panels):
        im, (px, py) = seq[min(k, len(seq) - 1)]
        ox = i * CW
        dr.ellipse((ox + CW / 2 - 110, 24 + CHH * 0.72 - 40, ox + CW / 2 + 110, 24 + CHH * 0.72 + 40), fill=MAT)
        cx = ox + CW / 2 + px * PPT
        cy = 24 + CHH * 0.72 + py * PPT * SIN
        canvas.alpha_composite(im, (int(round(cx - AX)), int(round(cy - AY))))
        dr.text((ox + 8, 6), title, fill=(255, 220, 120, 255))
    frames.append(canvas.convert("RGB").resize((canvas.width * 2, canvas.height * 2), Image.NEAREST))
gif = os.path.join(A.out, "special_turn_preview.gif")
frames[0].save(gif, save_all=True, append_images=frames[1:], duration=1000 // FPS, loop=0)
tmp = os.path.join(A.out, "_frames"); os.makedirs(tmp, exist_ok=True)
for k, f in enumerate(frames):
    f.save(os.path.join(tmp, f"{k:04d}.png"))
mp4 = os.path.join(A.out, "special_turn_preview.mp4")
subprocess.run(["ffmpeg", "-v", "error", "-y", "-framerate", str(FPS), "-i", os.path.join(tmp, "%04d.png"),
                "-vf", "loop=2:size=%d" % len(frames), "-c:v", "libx264", "-pix_fmt", "yuv420p", "-preset", "veryfast", mp4], check=True)
print("saved", gif, mp4, len(frames), "frames")
