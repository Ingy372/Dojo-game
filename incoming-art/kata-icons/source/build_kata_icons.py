"""
Dojo Ascent - kata move icons + direction picture (S3-A1, Artist bot).

Same pipeline and look as the menu icons: this script loads the shared helpers (Icon, Draw, seal-style medallion
parts, toon kit, thick ICON_OUTLINE) straight from incoming-art/icons/source/build_icons.py, so nothing is copied or
changed there. Each move icon is a round medallion (like the Seals) with a warm wood rim, so the kata family reads
as its own set. Icons are 128 x 128; the direction pictures are 192 x 192 (2.4 x 2.4 tiles).

    blender -b -P incoming-art/kata-icons/source/build_kata_icons.py -- --out incoming-art/kata-icons/source/kata_icons.blend
    blender -b incoming-art/kata-icons/source/kata_icons.blend -P incoming-art/tools/render_static.py -- --out incoming-art/kata-icons/sprites
    python3 incoming-art/kata-icons/source/finalize_kata_icons.py
"""
import os, sys, math, json
_HERE = os.path.dirname(os.path.abspath(__file__))
_SRC = open(os.path.join(_HERE, "..", "..", "icons", "source", "build_icons.py")).read()
__file__ = os.path.join(_HERE, "..", "..", "icons", "source", "build_icons.py")   # so the helper's tools/ path resolves
exec(_SRC[:_SRC.index("ALL = []")])                                               # helpers only: no icons are built
import bpy
from mathutils import Vector

SKIN, SKIN_D, SKIN_L, OUT = "#e7b48c", "#a8704a", "#f6d0ae", "#3a2a22"
INKM = "#2e6f9e"            # motion arrows (same blue ink as the Seals)
HIT = "#f2a23a"             # impact lines / bursts (orange, not red)
GI, GI_D = "#ffffff", "#cfc6b0"
RIM = "#b07a3a"             # kata family rim (DECIDE)

def medal(ic, symbol):
    ic.put("medal", disc(0.54, 0.08, 48), "#e8dcbc")
    ic.put("rim", tube((0, -0.041, 0), (0, -0.047, 0), 0.5, 0.5, segs=48), M(RIM, True), outline=False)
    ic.put("face", tube((0, -0.048, 0), (0, -0.052, 0), 0.43, 0.43, segs=48), M("#f6efdc", True), outline=False)
    symbol(Draw(ic, -0.053, 1.22))   # pass 2: symbols 22% bigger for phone size

# ---------------------------------------------------------------- drawing parts
def fist(D, x, z, ang, s=1.0):
    """Fist seen from the side, knuckles pointing along ang; with gi sleeve behind."""
    F0 = D.frame(x, z, ang); F = lambda u, v: F0(u * s, v * s); L = lambda p: [F(u, v) for u, v in p]
    D.opoly(L([(-0.3, -0.075), (-0.06, -0.07), (-0.06, 0.07), (-0.3, 0.075)]), SKIN, OUT, 0.045)          # forearm
    D.opoly(L([(-0.08, -0.1), (0.1, -0.105), (0.14, -0.065), (0.14, 0.065), (0.1, 0.105), (-0.08, 0.1)]), SKIN, OUT, 0.045)
    for v in (-0.03, 0.03): D.stroke(L([(0.02, v), (0.13, v)]), 0.02 * s, OUT, closed=False)   # v2: 2 bold finger lines
    D.poly(L([(0.09, -0.09), (0.13, -0.06), (0.13, 0.06), (0.09, 0.09)]), SKIN_L)
    D.opoly(L([(-0.05, 0.1), (0.0, 0.1), (0.01, -0.02), (-0.02, -0.04), (-0.05, -0.02)]), SKIN_D, OUT, 0.018)  # thumb
    D.opoly(L([(-0.42, -0.12), (-0.28, -0.105), (-0.28, 0.105), (-0.42, 0.12)]), GI, OUT, 0.045)          # sleeve
    D.poly(L([(-0.33, -0.095), (-0.29, -0.095), (-0.29, 0.095), (-0.33, 0.095)]), GI_D)
def knife(D, x, z, ang, s=1.0, flip=False):
    """Open knife-hand: fingers together, thumb tucked, edge of the hand along ang."""
    g = -1 if flip else 1
    F0 = D.frame(x, z, ang); F = lambda u, v: F0(u * s, g * v * s); L = lambda p: [F(u, v) for u, v in p]
    D.opoly(L([(-0.28, -0.06), (-0.05, -0.06), (-0.05, 0.06), (-0.28, 0.06)]), SKIN, OUT, 0.042)
    D.opoly(L([(-0.07, -0.07), (0.17, -0.055), (0.21, -0.02), (0.2, 0.04), (0.14, 0.06), (-0.07, 0.07)]), SKIN, OUT, 0.042)
    for v in (0.0,): D.stroke(L([(0.06, v), (0.18, v)]), 0.016 * s, OUT, closed=False)
    D.opoly(L([(-0.04, 0.06), (0.06, 0.08), (0.07, 0.04), (-0.03, 0.03)]), SKIN_D, OUT, 0.016)      # thumb tucked
    D.opoly(L([(-0.4, -0.1), (-0.26, -0.09), (-0.26, 0.09), (-0.4, 0.1)]), GI, OUT, 0.042)
def leg(D, x, z, ang, s=1.0, ball=True):
    """Kicking leg from the side: gi trouser + bare foot; ball=True pulls the toes back (front/straight kick)."""
    F0 = D.frame(x, z, ang); F = lambda u, v: F0(u * s, v * s); L = lambda p: [F(u, v) for u, v in p]
    D.opoly(L([(-0.36, -0.11), (-0.12, -0.085), (-0.12, 0.085), (-0.36, 0.11)]), GI, OUT, 0.045)           # trouser
    D.poly(L([(-0.16, -0.08), (-0.12, -0.08), (-0.12, 0.08), (-0.16, 0.08)]), GI_D)
    D.opoly(L([(-0.13, -0.06), (0.02, -0.065), (0.02, 0.06), (-0.13, 0.06)]), SKIN, OUT, 0.042)          # ankle
    toe = [(0.2, 0.2), (0.24, 0.17), (0.2, 0.1)] if ball else [(0.24, 0.07), (0.26, 0.03)]
    D.opoly(L([(0.0, -0.08), (0.12, -0.075), (0.18, -0.04), (0.2, 0.05)] + toe + [(0.1, 0.07), (0.0, 0.07)]), SKIN, OUT, 0.042)
    D.poly(L([(0.12, -0.06), (0.17, -0.035), (0.185, 0.04), (0.15, 0.03)]), SKIN_L)                      # ball of the foot (striking part)
def print_(D, x, z, ang, s=0.16, toes_only=False, heel_only=False):
    """Footprint seen from above, toes pointing along ang (degrees, 90 = up = front)."""
    F0 = D.frame(x, z, ang - 90); F = lambda u, v: F0(u * s, v * s)
    if not toes_only:
        for k, (u, v, r, sx) in enumerate(((0, -0.55, 0.42, 0.85), (0.05, 0.05, 0.55, 0.75))):
            p = F(u, v); D.disc(p[0], p[1], r * s, SKIN_D, sx=sx)
    else:
        p = F(0.05, 0.05); D.disc(p[0], p[1], 0.5 * s, SKIN_D, sx=0.8)
    for (u, v, r) in ((-0.3, 0.72, 0.17), (-0.05, 0.82, 0.14), (0.16, 0.78, 0.12), (0.32, 0.68, 0.1), (0.42, 0.54, 0.085)):
        p = F(u, v); D.disc(p[0], p[1], r * s, SKIN_D)
def turn_arrow(D, r, a0, a1, w=0.06, col=INKM, cx=0.0, cz=0.0):
    D.arc(cx, cz, r, w, a0, a1, col, n=40)
    a = math.radians(a1); s = 1 if a1 > a0 else -1
    D.head(cx + math.cos(a) * r, cz + math.sin(a) * r, a1 + 90 * s, w * 1.8, col)
def lines(D, pts, col=HIT, w=0.032):
    for (x0, z0, x1, z1) in pts: D.bar(x0, z0, x1, z1, w, col)
def hip(D, z=-0.2):
    D.poly([(-0.34, z - 0.035), (0.34, z - 0.035), (0.34, z + 0.035), (-0.34, z + 0.035)], "#3a2a22")   # belt line (black belt colour = neutral)

# ---------------------------------------------------------------- the moves (ids from drafts/content/katas/moves.json + kiai)
MOVES = []
def mv(id_, note):
    def deco(fn): MOVES.append((id_, note, fn)); return fn
    return deco
@mv("pivot", "Pivot: one foot turning in place on the ball of the foot")
def _(D): print_(D, 0.0, -0.02, 90, 0.2); turn_arrow(D, 0.25, 200, 340, 0.05)
@mv("turn-180", "Half turn: a half-circle arrow")
def _(D): turn_arrow(D, 0.24, 0, 180, 0.07); D.disc(0, 0, 0.06, SKIN_D)
@mv("turn", "Turn: a quarter-turn arrow")
def _(D): turn_arrow(D, 0.26, -10, 95, 0.07, cx=-0.08, cz=-0.08); D.disc(-0.08, -0.08, 0.06, SKIN_D)
@mv("turn-big-special", "Big special turn: an almost full circle arrow with a gold sparkle")
def _(D): turn_arrow(D, 0.25, 110, 410, 0.07); D.star(0, 0, 0.12, "#e0b04a")
@mv("stance-cat", "Cat stance: back foot flat (turned out), front foot just touching with the toes")
def _(D): print_(D, 0.08, -0.17, 125, 0.17); print_(D, -0.02, 0.17, 90, 0.17, toes_only=True)
@mv("stance-front", "Front stance: long stance, front foot points forward, back foot turned out a little")
def _(D): print_(D, -0.12, 0.2, 90, 0.15); print_(D, 0.12, -0.2, 120, 0.15)
@mv("stance-attention", "Attention: heels together, toes turned out in a small V")
def _(D): print_(D, -0.08, 0.0, 105, 0.17); print_(D, 0.08, 0.0, 75, 0.17)
@mv("block-downward", "Low block: bold forearm sweeping down and out, one arrow down")
def _(D): fist(D, 0.1, -0.06, -40, 0.92); D.arrow(0.22, 0.08, 0.3, -0.22, 0.06, INKM)
@mv("block-reverse-inside", "Inside block: bold forearm up, one arrow sweeping in")
def _(D): fist(D, -0.02, 0.06, 80, 0.9); D.arrow(0.3, 0.12, 0.12, 0.12, 0.06, INKM)
@mv("block-overhead", "High block: bold forearm across the top, one arrow up")
def _(D): fist(D, -0.02, 0.06, 165, 0.95); D.arrow(0.0, -0.3, 0.0, -0.08, 0.06, INKM)
@mv("block-double-knife-hand", "Double knife-hand block: two bold open knife hands, one forward and one guarding")
def _(D): knife(D, 0.08, 0.1, 60, 0.9); knife(D, -0.12, -0.14, 20, 0.72, flip=True)
@mv("punch-straight", "Straight punch: bold fist going straight forward, one arrow")
def _(D): fist(D, 0.1, 0.04, 0, 0.95); D.arrow(-0.22, -0.2, 0.2, -0.2, 0.06, INKM)
@mv("punch-reverse", "Reverse punch: bold fist forward, curved hip arrow (back hand)")
def _(D): fist(D, 0.12, 0.1, 0, 0.88); turn_arrow(D, 0.15, 250, 100, 0.06, cx=-0.16, cz=-0.14)
@mv("strike-backfist", "Backfist: bold fist snapping out in one arc")
def _(D): fist(D, 0.08, -0.0, 50, 0.9); turn_arrow(D, 0.3, 140, 60, 0.06, cx=0.0, cz=-0.1)
@mv("kick-reverse", "Reverse kick: straight kick with the back leg, hip turning (curved arrow)")
def _(D): leg(D, 0.08, 0.08, 0, 0.8, ball=True); turn_arrow(D, 0.15, 250, 100, 0.045, cx=-0.2, cz=-0.16)
@mv("kick-straight", "Straight kick: leg straight out, speed lines")
def _(D): leg(D, 0.06, 0.0, 0, 0.85, ball=True); lines(D, [(-0.36, 0.17, -0.22, 0.17), (-0.36, -0.17, -0.22, -0.17)], INKM, 0.035)
@mv("kick-front", "Front kick: knee up then the foot snaps up and forward (rising arrow)")
def _(D): leg(D, 0.06, 0.06, 25, 0.8, ball=True); turn_arrow(D, 0.42, 225, 300, 0.05, cx=-0.05, cz=0.32)
@mv("chamber", "Chamber: fist pulled back to the hip, palm up")
def _(D): hip(D, -0.22); fist(D, 0.02, -0.06, 180, 0.88); D.arrow(0.1, 0.18, -0.22, 0.18, 0.06, INKM)
@mv("catch", "Catch: both hands caught together on the hip")
def _(D): hip(D, -0.22); fist(D, 0.0, -0.06, 180, 0.82); knife(D, -0.04, 0.08, 200, 0.7)
@mv("break-double-choke", "Choke break (v3): two open hands push OUT through a soft orange ring (the grip) that is broken at the sides, with outward arrows; no neck, no grabbing")
def _(D):
    for a0, a1 in ((35, 145), (215, 325)): D.arc(0.0, 0.0, 0.27, 0.055, a0, a1, HIT, n=20)    # the grip ring, broken left and right
    knife(D, -0.1, -0.02, 98, 0.66, flip=True); knife(D, 0.1, -0.02, 82, 0.66)               # two open hands, fingers up, back to back
    D.arrow(-0.15, 0.04, -0.3, 0.04, 0.07, INKM); D.arrow(0.15, 0.04, 0.3, 0.04, 0.07, INKM)   # pushing out through the breaks
@mv("kiai", "Kiai: a big shout burst with sound waves (no letters)")
def _(D):
    D.star(-0.06, 0.0, 0.27, HIT, pts=10, inner=0.7, rot=0); D.star(-0.06, 0.0, 0.2, "#ffe48a", pts=10, inner=0.72, rot=0)
    for k, r in enumerate((0.28, 0.33)): D.arc(-0.06, 0.0, r, 0.035, -35, 35, INKM)

for i, (id_, note, fn) in enumerate(MOVES):
    ic = Icon("kata-" + id_, i); medal(ic, fn); ic.finish("kata move icon: " + note)

# ---------------------------------------------------------------- direction picture (school map: Front at the top)
class Big(Icon):
    H = 1.2
    def finish(self, note, tilt=-35):
        super().finish(note, tilt); t = TARGETS[-1]
        t["rect"] = [self.c.x - self.H, -self.c.y / K - self.H, self.c.x + self.H, -self.c.y / K + self.H]
        t["note"] = note + ". 192 x 192, anchor = centre"
def board(ic, arrow):
    ic.put("mat", box(Vector((0, 0, 0)), (1.9, 0.06, 1.9), bevel=0.08), "#b07a3a", smooth=False)
    ic.put("floor", box(Vector((0, -0.032, 0)), (1.7, 0.01, 1.7)), M("#f6efdc", True), outline=False, smooth=False)
    D = Draw(ic, -0.04, 1.0)
    for x in (-0.43, 0.43): D.bar(x, -0.82, x, 0.82, 0.012, "#e4d8bb")       # tatami seams
    for z in (-0.43, 0.43): D.bar(-0.82, z, 0.82, z, 0.012, "#e4d8bb")
    for (x, z) in ((0, 0.72), (0, -0.72), (-0.72, 0), (0.72, 0)):           # 4 side markers: the game can put F/B/L/R on them
        D.disc(x, z, 0.13, "#a46e40"); D.disc(x, z, 0.1, "#f7eed6")
    if arrow:
        dx, dz = arrow; D.arrow(dx * 0.14, dz * 0.14, dx * 0.5, dz * 0.5, 0.12, HIT)
    D.disc(0, 0, 0.17, OUT); D.disc(0, 0, 0.145, "#3f9ad0")                  # the student (top view), front notch shows facing Front
    D.head(0, 0.09, 90, 0.085, "#f6efdc")
DIRS = [("map", None, "direction picture: school-map base, Front at the top"), ("front", (0, 1), "facing Front (up)"),
        ("back", (0, -1), "facing Back (down)"), ("left", (-1, 0), "facing Left"), ("right", (1, 0), "facing Right")]
for j, (n, a, note) in enumerate(DIRS):
    ic = Big("kata-dir-" + n, 30 + j); ic.c = Vector((0.8 + j * 3.0, -0.8 * K - 4 * 3.0, 0.0)); ic.piv.location = ic.c
    board(ic, a); ic.finish(note)

scene["static_targets"] = json.dumps(TARGETS)
bpy.ops.wm.save_as_mainfile(filepath=os.path.abspath(A.out))
print("saved", A.out, len(TARGETS), "targets")
