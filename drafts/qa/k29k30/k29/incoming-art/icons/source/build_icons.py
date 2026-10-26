"""
Dojo Ascent - menu icons (Art Director bot), Batch 8: all gear, Insight and Seal icons (Jay approved the 3 sample styles).

Built from simple 3D models with the house toon kit (incoming-art/tools/toon_kit.py: the same fixed light,
toon ramp and dark outline as every character and room), then rendered by incoming-art/tools/render_static.py
with the same 35-degree orthographic camera at 80 px per tile. Each icon is a 1.6 x 1.6 tile target, so it is
128 x 128 px; the model is turned to face the camera and kept inside a 112 px circle (8 px margin).
Icons use a thicker outline than world sprites (ICON_OUTLINE, about 2 px at 128 px) so they still read when the
menu shows them at 48-64 points on a phone.

Family looks (from the brief): Gear = the object itself; Insights = a glowing scroll; Seals = a round seal
medallion with one simple symbol (Forms = the character in the stance, Virtues = gold: not in the samples).

    blender -b -P incoming-art/icons/source/build_icons.py -- --out incoming-art/icons/source/icons.blend
    blender -b incoming-art/icons/source/icons.blend -P incoming-art/tools/render_static.py -- --out incoming-art/icons/sprites
"""
import bpy, bmesh, math, sys, os, argparse, json
from mathutils import Vector, Matrix, Euler
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "tools"))
from toon_kit import srgb, toon_material, outline_material, add_hull, ellipsoid, tube, box

argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
ap = argparse.ArgumentParser(); ap.add_argument("--out", required=True); A = ap.parse_args(argv)
bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene; scene.name = "Icons"
K = 1 / math.sin(math.radians(35))
ICON_OUTLINE = 0.024
_m = {}
def M(h, flat=False):
    if (h, flat) not in _m: _m[(h, flat)] = toon_material(("F" if flat else "M") + h, h, *((1.0, 1.0) if flat else ()))
    return _m[(h, flat)]
OUTLINE = outline_material()
COLL = {}
def layer(n):
    if n not in COLL:
        c = bpy.data.collections.new("L_" + n); scene.collection.children.link(c); COLL[n] = c
    return COLL[n]
def empty(name, loc):
    e = bpy.data.objects.new(name, None); scene.collection.objects.link(e); e.location = loc; return e

class Icon:
    """Model in a local frame: x right, z up, -y toward the viewer; the pivot then turns it to face the camera."""
    def __init__(self, name, idx):
        self.name = name; self.lay = name
        self.c = Vector((0.8 + (idx % 10) * 3.0, -0.8 * K - (idx // 10) * 3.0, 0.0))
        self.piv = empty(name + "_pivot", self.c)
        self.objs = []
    def put(self, part, bm, color, outline=True, smooth=True, flat=False):
        me = bpy.data.meshes.new(f"{self.name}_{part}")
        for f in bm.faces: f.smooth = smooth
        bm.to_mesh(me); bm.free()
        me.materials.append(color if not isinstance(color, str) else M(color, flat))
        ob = bpy.data.objects.new(me.name, me); layer(self.lay).objects.link(ob)
        ob.location = self.c
        obs = [ob] + ([add_hull(ob, layer(self.lay), OUTLINE, ICON_OUTLINE)] if outline else [])
        for o in obs[1:]: o.matrix_world = Matrix.Identity(4); o.location = self.c
        self.objs += obs
        return ob
    def finish(self, note, tilt=-35):
        bpy.context.view_layer.update()
        for o in self.objs: o.parent = self.piv; o.matrix_parent_inverse = self.piv.matrix_world.inverted()
        self.piv.rotation_euler = (math.radians(tilt), 0, 0)
        TARGETS.append(dict(name=self.name, layers=[self.lay], rect=[self.c.x - 0.8, -self.c.y / K - 0.8, self.c.x + 0.8, -self.c.y / K + 0.8], top=0,
                            anchor=[self.c.x, -self.c.y / K], group="icons", note=note + ". 128 x 128, anchor = centre"))
TARGETS = []
from toon_kit import strip

def disc(r, depth, segs=40):     # a disc in the xz plane, facing -y
    return tube((0, depth / 2, 0), (0, -depth / 2, 0), r, r, segs=segs)
def solid(pts3, th):
    bm = bmesh.new(); bm.faces.new([bm.verts.new(p) for p in pts3]); bmesh.ops.solidify(bm, geom=bm.faces[:], thickness=th); return bm
def ribbon(pts, width, th, hint=(0, -1, 0.3)):
    """A smooth flat ribbon through pts (for the wraps' loose end): one mesh, no gaps."""
    hint = Vector(hint).normalized(); bm = bmesh.new(); L, R = [], []
    for i, p in enumerate(pts):
        t = (pts[min(i + 1, len(pts) - 1)] - pts[max(i - 1, 0)]).normalized()
        side = t.cross(hint).normalized() * width / 2
        L.append(bm.verts.new(p + side)); R.append(bm.verts.new(p - side))
    for i in range(len(pts) - 1): bm.faces.new([L[i], L[i + 1], R[i + 1], R[i]])
    bmesh.ops.solidify(bm, geom=bm.faces[:], thickness=th); return bm
def bez(p0, p1, p2, p3, n=12):
    return [p0 * (1 - t) ** 3 + p1 * 3 * t * (1 - t) ** 2 + p2 * 3 * t * t * (1 - t) + p3 * t ** 3 for t in [i / (n - 1) for i in range(n)]]
def cut_ring(ic, name, ob, p0, p1, r):
    hole = tube(p0, p1, r, r, segs=40); hm = bpy.data.meshes.new(name + "h"); hole.to_mesh(hm); hole.free()
    ho = bpy.data.objects.new(name + "h", hm); scene.collection.objects.link(ho); ho.location = ic.c
    bo = ob.modifiers.new("cut", "BOOLEAN"); bo.object = ho; bo.operation = "DIFFERENCE"
    bpy.context.view_layer.objects.active = ob; bpy.ops.object.modifier_apply(modifier="cut"); bpy.data.objects.remove(ho)

class Draw:
    """Flat 'ink' shapes on a face that looks at the viewer (-y). Each new shape sits a hair in front of the last."""
    def __init__(self, ic, y, s=1.0, cx=0.0, cz=0.0):
        self.ic, self.y, self.s, self.cx, self.cz, self.n = ic, y, s, cx, cz, 0
    def _y(self): self.n += 1; return self.y - 0.0025 * self.n
    def P(self, x, z, y): return Vector((self.cx + x * self.s, y, self.cz + z * self.s))
    def poly(self, pts, col):
        y = self._y(); self.ic.put(f"ink{self.n}", solid([self.P(x, z, y) for x, z in pts], 0.002), M(col, True), outline=False, smooth=False)
    def disc(self, x, z, r, col, sx=1.0):
        self.poly([(x + math.cos(a) * r * sx, z + math.sin(a) * r) for a in [i * math.pi / 16 for i in range(32)]], col)
    def arc(self, x, z, r, w, a0, a1, col, n=24):
        y = self._y(); bm = bmesh.new(); vi, vo = [], []
        for i in range(n + 1):
            a = math.radians(a0 + (a1 - a0) * i / n)
            vi.append(bm.verts.new(self.P(x + math.cos(a) * (r - w / 2), z + math.sin(a) * (r - w / 2), y)))
            vo.append(bm.verts.new(self.P(x + math.cos(a) * (r + w / 2), z + math.sin(a) * (r + w / 2), y)))
        for i in range(n): bm.faces.new([vi[i], vi[i + 1], vo[i + 1], vo[i]])
        self.ic.put(f"ink{self.n}", bm, M(col, True), outline=False, smooth=False)
    def bar(self, x0, z0, x1, z1, w, col):
        d = Vector((x1 - x0, z1 - z0)); n = Vector((-d.y, d.x)).normalized() * w / 2
        self.poly([(x0 + n.x, z0 + n.y), (x1 + n.x, z1 + n.y), (x1 - n.x, z1 - n.y), (x0 - n.x, z0 - n.y)], col)
        self.disc(x0, z0, w / 2, col); self.disc(x1, z1, w / 2, col)
    def head(self, x, z, ang, size, col):     # arrowhead pointing along ang (degrees)
        a = math.radians(ang); f = (math.cos(a), math.sin(a)); l = (-f[1], f[0])
        self.poly([(x + f[0] * size, z + f[1] * size), (x + l[0] * size * 0.8, z + l[1] * size * 0.8), (x - l[0] * size * 0.8, z - l[1] * size * 0.8)], col)
    def arrow(self, x0, z0, x1, z1, w, col):
        a = math.degrees(math.atan2(z1 - z0, x1 - x0)); self.bar(x0, z0, x1, z1, w, col); self.head(x1, z1, a, w * 1.7, col)
    def star(self, x, z, r, col, pts=5, inner=0.45, rot=90):
        self.poly([(x + math.cos(math.radians(rot) + i * math.pi / pts) * (r if i % 2 == 0 else r * inner),
                    z + math.sin(math.radians(rot) + i * math.pi / pts) * (r if i % 2 == 0 else r * inner)) for i in range(pts * 2)], col)
    def heart(self, x, z, r, col):
        self.poly([(x + r * 16 * math.sin(t) ** 3 / 17, z + r * (13 * math.cos(t) - 5 * math.cos(2 * t) - 2 * math.cos(3 * t) - math.cos(4 * t)) / 17)
                   for t in [math.pi * 2 * i / 40 for i in range(40)]], col)
    def shield(self, x, z, r, col, rim=None):
        pts = [(x - r * 0.8, z + r * 0.75), (x, z + r * 0.9), (x + r * 0.8, z + r * 0.75)] + \
              [(x + r * 0.8 * math.cos(a), z + r * 0.1 - r * 0.95 * math.sin(a)) for a in [i * math.pi / 12 for i in range(1, 12)]]
        if rim: self.poly([(x + (px - x) * 1.14, z + (pz - z) * 1.14) for px, pz in pts], rim)
        self.poly(pts, col)
    def fist(self, x, z, r, col, dark):
        self.poly([(x + r * (0.9 * math.cos(a)) ** 1, z + r * 0.75 * math.sin(a)) for a in [i * math.pi / 16 for i in range(32)]], col)
        for k in range(3): self.bar(x - r * 0.5 + k * r * 0.5, z + r * 0.42, x - r * 0.5 + k * r * 0.5, z + r * 0.12, r * 0.07, dark)
        self.bar(x - r * 0.7, z - r * 0.2, x + r * 0.3, z - r * 0.2, r * 0.22, col)
        self.bar(x - r * 0.62, z - r * 0.32, x + r * 0.3, z - r * 0.32, r * 0.05, dark)
    def foot(self, x, z, r, col):
        self.disc(x, z - r * 0.15, r * 0.55, col, sx=0.62)
        for k, (dx, dz, rr) in enumerate(((-0.3, 0.62, 0.17), (-0.05, 0.72, 0.14), (0.16, 0.68, 0.12), (0.32, 0.58, 0.1), (0.42, 0.44, 0.085))):
            self.disc(x + dx * r, z + dz * r, rr * r, col)
    def dizzy(self, x, z, r, ring, starc):
        self.arc(x, z, r, r * 0.12, 0, 360, ring, n=40)
        for a in (90, 210, 330): self.star(x + math.cos(math.radians(a)) * r, z + math.sin(math.radians(a)) * r * 1.0, r * 0.38, starc)
    def eye(self, x, z, r, white, iris, pupil):
        top = [(x + r * math.cos(a), z + r * 0.55 * math.sin(a)) for a in [i * math.pi / 16 for i in range(17)]]
        bot = [(x + r * math.cos(a), z + r * 0.55 * math.sin(a)) for a in [math.pi + i * math.pi / 16 for i in range(1, 16)]]
        self.poly(top + bot, pupil); self.poly([(x + (px - x) * 0.9, z + (pz - z) * 0.84) for px, pz in top + bot], white)
        self.disc(x, z, r * 0.38, iris); self.disc(x, z, r * 0.18, pupil); self.disc(x + r * 0.12, z + r * 0.12, r * 0.07, "#ffffff")
    def burst(self, x, z, r, col): self.star(x, z, r, col, pts=8, inner=0.55, rot=0)
    def stroke(self, pts, w, col, closed=True):
        for i in range(len(pts) - (0 if closed else 1)):
            (x0, z0), (x1, z1) = pts[i], pts[(i + 1) % len(pts)]; self.bar(x0, z0, x1, z1, w, col)
    def opoly(self, pts, col, ink, w=0.035):   # filled shape with a dark outline (outline drawn first, behind)
        self.stroke(pts, w, ink); self.poly(pts, col)
    def frame(self, ox, oz, ang):                 # local (u, v) -> (x, z), u along ang
        a = math.radians(ang); c, sn = math.cos(a), math.sin(a)
        return lambda u, v: (ox + u * c - v * sn, oz + u * sn + v * c)
    def spiral(self, x, z, r, w, col, turns=1.6):
        pts = [(x + math.cos(t) * r * t / (turns * 2 * math.pi), z + math.sin(t) * r * t / (turns * 2 * math.pi)) for t in [0.6 + i * turns * 2 * math.pi / 30 for i in range(31)]]
        self.stroke(pts, w, col, closed=False)

# ------------------------------------------------------------------ family builders
INK, INK2 = "#2f5f9e", "#5aa0e6"
def scroll(ic, symbol):
    """Insight family: an open scroll with two wooden rollers, a soft gold glow behind and 3 sparkles."""
    ic.put("halo", ellipsoid(Vector((0, 0.12, 0)), (0.6, 0.01, 0.52), segs=40, rings=8), M("#ffe9a0", True), outline=False)
    ic.put("halo2", ellipsoid(Vector((0, 0.1, 0)), (0.5, 0.01, 0.44), segs=40, rings=8), M("#fff6cf", True), outline=False)
    ic.put("paper", box(Vector((0, 0, 0)), (0.72, 0.03, 0.62)), "#f7eed6", smooth=False)
    for z in (0.33, -0.33):
        ic.put(f"rod{z}", tube((-0.44, 0, z), (0.44, 0, z), 0.055, 0.055, segs=16), "#a46e40")
        for x in (-0.47, 0.47): ic.put(f"rodend{z}{x}", ellipsoid(Vector((x, 0, z)), (0.05, 0.065, 0.065), segs=14, rings=8), "#e0b04a")
    for k, a in enumerate((35, 155, 270)):
        p = Vector((math.cos(math.radians(a)) * 0.5, -0.05, math.sin(math.radians(a)) * 0.5 * 0.85))
        pts = [p + Vector((math.cos(t) * (0.06 if i % 2 == 0 else 0.02), 0, math.sin(t) * (0.06 if i % 2 == 0 else 0.02))) for i, t in enumerate([i * math.pi / 4 + math.pi / 2 for i in range(8)])]
        ic.put(f"spark{k}", solid(pts, 0.01), M("#fffbe8", True), outline=False, smooth=False)
    symbol(Draw(ic, -0.017, 1.0))
def seal(ic, symbol, rim="#3f9ad0"):
    """Seal family: a round cream medallion with a blue rim and one simple symbol."""
    ic.put("medal", disc(0.54, 0.08, 48), "#e8dcbc")
    ic.put("rim", tube((0, -0.041, 0), (0, -0.047, 0), 0.5, 0.5, segs=48), M(rim, True), outline=False)
    ic.put("face", tube((0, -0.048, 0), (0, -0.052, 0), 0.43, 0.43, segs=48), M("#f6efdc", True), outline=False)
    if symbol: symbol(Draw(ic, -0.053, 1.0))
def wraps(ic, cloth, ring, hem, stripes=None, stitch=None):
    """Gear (hands): a rolled hand wrap, end toward the viewer, with a smooth loose end curling out."""
    endc = Vector((-0.12, -0.12, 0.1)); back = Vector((0.06, 0.2, 0.1)); axis = (back - endc).normalized()
    ic.put("roll", tube(back, endc, 0.36, 0.36, segs=40), cloth)
    for k, r in enumerate((0.28, 0.19, 0.1)):
        ob = ic.put(f"ring{k}", tube(endc - axis * 0.004, endc - axis * 0.008, r, r, segs=40), M(ring, True), outline=False)
        cut_ring(ic, f"r{k}", ob, endc, endc - axis * 0.02, r - 0.025)
    ic.put("core", tube(endc - axis * 0.004, endc - axis * 0.009, 0.035, 0.035, segs=20), M(ring, True), outline=False)
    pts = bez(Vector((0.1, 0.0, -0.24)), Vector((0.3, -0.12, -0.36)), Vector((0.42, -0.16, -0.48)), Vector((0.58, -0.18, -0.36)), 14)
    ic.put("tail", ribbon(pts, 0.2, 0.03), cloth, smooth=True)
    hp = pts[-3:]
    ic.put("hem", ribbon([p + Vector((0, -0.022, 0)) for p in hp], 0.2, 0.004), M(hem, True), outline=False)
    if stripes:      # tiger stripes: dark wedges on the roll's side and the loose end
        for k, a in enumerate((20, 75, 130, 200, 260, 320)):
            aa = math.radians(a); side = Vector((math.cos(aa), 0, math.sin(aa)))
            # a point on the side of the roll, slightly outside the surface
            for j, t in enumerate((0.25, 0.6)):
                p = endc + (back - endc) * t + side.cross(axis).normalized() * 0.0 + Vector((math.cos(aa) * 0.365, 0, math.sin(aa) * 0.365))
            ic.put(f"str{k}", box(endc + (back - endc) * 0.4 + Vector((math.cos(aa) * 0.362, 0.0, math.sin(aa) * 0.362)), (0.05, 0.3, 0.05), rot=(0, -a, 0)), M(stripes, True), outline=False, smooth=False)
        for k in (3, 7, 11):
            ic.put(f"tstr{k}", ribbon([pts[k] + Vector((0, -0.02, 0)), pts[k + 1] + Vector((0, -0.02, 0))], 0.205, 0.004), M(stripes, True), outline=False)
    if stitch:       # leather: a row of light stitches along the loose end
        for k in range(2, 13, 2):
            ic.put(f"st{k}", ribbon([pts[k] + Vector((0, -0.022, 0)), pts[k] * 0.6 + pts[k + 1] * 0.4 + Vector((0, -0.022, 0))], 0.025, 0.003), M(stitch, True), outline=False)
def gi(ic, col, trim, belt, quilt=None, mountain=None):
    """Gear (gi): a neatly folded gi jacket with lapels and its tie, the way it sits on a dojo shelf."""
    ic.put("fold2", box(Vector((0.04, 0.06, -0.1)), (0.86, 0.12, 0.62), bevel=0.04), col, smooth=False)
    ic.put("fold1", box(Vector((0, -0.02, 0.0)), (0.8, 0.1, 0.62), bevel=0.04), col, smooth=False)
    D = Draw(ic, -0.075, 1.0)
    if quilt:
        for x in (-0.24, 0.0, 0.24): D.bar(x, -0.26, x, 0.26, 0.012, quilt)
        for z in (-0.15, 0.08): D.bar(-0.34, z, 0.34, z, 0.012, quilt)
    D.poly([(-0.36, 0.3), (-0.2, 0.3), (0.06, -0.05), (-0.08, -0.05)], trim)       # left lapel
    D.poly([(0.36, 0.3), (0.2, 0.3), (-0.06, -0.05), (0.08, -0.05)], trim)         # right lapel
    D.poly([(-0.2, 0.3), (0.2, 0.3), (0.0, 0.03)], "#f6efdc" if col != "#f4efe4" else "#e3dccb")   # the V of the collar
    if mountain:   # a round cream chest crest with a big two-peak snowy mountain
        cx, cz = 0.2, 0.1; D.disc(cx, cz, 0.15, "#2b3f5c"); D.disc(cx, cz, 0.128, "#f6efdc")
        D.poly([(cx - 0.11, cz - 0.07), (cx - 0.02, cz + 0.08), (cx + 0.03, cz + 0.01), (cx + 0.06, cz + 0.05), (cx + 0.11, cz - 0.07)], mountain)
        D.poly([(cx - 0.055, cz + 0.025), (cx - 0.02, cz + 0.08), (cx + 0.01, cz + 0.035), (cx - 0.02, cz + 0.045)], "#ffffff")
        D.poly([(cx + 0.04, cz + 0.025), (cx + 0.06, cz + 0.05), (cx + 0.08, cz + 0.02)], "#ffffff")
    D.bar(-0.38, -0.14, 0.38, -0.14, 0.08, belt)                                   # the tie
    D.poly([(-0.06, -0.12), (-0.14, -0.3), (-0.06, -0.3)], belt); D.poly([(0.0, -0.12), (0.08, -0.32), (0.14, -0.28)], belt)
def cord(ic, top, col="#d8352a"):
    ic.put("cord", tube(top, top + Vector((0, 0, 0.14)), 0.02, 0.02, segs=8), col)
    ic.put("loop", ellipsoid(top + Vector((0, 0, 0.2)), (0.07, 0.02, 0.07), segs=16, rings=8), col)
    ic.put("loophole", ellipsoid(top + Vector((0, -0.02, 0.2)), (0.035, 0.005, 0.035), segs=12, rings=6), M("#00000000"[:7], True), outline=False) if False else None
def tassel(ic, p, col="#d8352a"):
    ic.put("knot", ellipsoid(p, (0.05, 0.05, 0.05), segs=12, rings=8), col)
    ic.put("tassel", tube(p + Vector((0, 0, -0.03)), p + Vector((0, 0, -0.24)), 0.035, 0.07, segs=12), col)
    ic.put("tband", tube(p + Vector((0, -0.0, -0.07)), p + Vector((0, 0, -0.1)), 0.05, 0.052, segs=12), M("#ffd36b", True), outline=False)

ALL = []
def icon(id_, note):
    def deco(fn): ALL.append((id_, note, fn)); return fn
    return deco

# ------------------------------------------------------------------ gear
@icon("cloth-wraps", "gear (hands): Cloth Hand Wraps, a rolled cream cloth wrap")
def _(ic): wraps(ic, "#f1e7cf", "#d9ccae", "#c9a06a")
@icon("leather-wraps", "gear (hands): Leather Hand Wraps, a rolled brown leather wrap with light stitching")
def _(ic): wraps(ic, "#a8744a", "#8a5a36", "#6e4428", stitch="#f1d9a8")
@icon("tiger-wraps", "gear (hands): Tiger Stripe Wraps, a rolled orange wrap with dark tiger stripes")
def _(ic): wraps(ic, "#f2a03c", "#d4842a", "#3a2a22", stripes="#3a2a22")
@icon("training-gi", "gear (gi): Training Gi, a folded plain white gi")
def _(ic): gi(ic, "#f4efe4", "#e3dccb", "#c9a06a")
@icon("padded-gi", "gear (gi): Padded Gi, a folded white gi with quilted padding and light blue trim")
def _(ic): gi(ic, "#f4efe4", "#8cc4ec", "#5aa0e6", quilt="#d6cfbf")
@icon("mountain-gi", "gear (gi): Mountain Gi, a folded slate-blue gi with a small snowy mountain")
def _(ic): gi(ic, "#6d8fb8", "#3f5f86", "#c9a06a", mountain="#3f5f86")
@icon("jade-charm", "gear (charm): Jade Charm, a round green jade disc on a red cord with a tassel")
def _(ic):
    ob = ic.put("jade", tube((0, 0.04, 0.05), (0, -0.04, 0.05), 0.3, 0.3, segs=40), "#5cc08a"); cut_ring(ic, "jh", ob, Vector((0, 0.1, 0.05)), Vector((0, -0.1, 0.05)), 0.1)
    D = Draw(ic, -0.042, 1.0); D.arc(0, 0.05, 0.22, 0.025, 0, 360, "#8fe0b2", n=40); D.arc(-0.05, 0.1, 0.25, 0.03, 110, 160, "#d8f7e4")
    cord(ic, Vector((0, 0, 0.33))); tassel(ic, Vector((0, -0.02, -0.3)))
@icon("lotus-charm", "gear (charm): Lotus Charm, a small pink lotus flower charm on a red cord")
def _(ic):
    ic.put("pad", ellipsoid(Vector((0, 0.06, -0.2)), (0.4, 0.2, 0.06), segs=24, rings=8), "#6cc46f")
    for k, (a, sz, col) in enumerate(((-60, 0.2, "#f7a8c4"), (60, 0.2, "#f7a8c4"), (-30, 0.24, "#ffbfd6"), (30, 0.24, "#ffbfd6"), (0, 0.27, "#ffd3e2"))):
        aa = math.radians(a); p = Vector((math.sin(aa) * 0.15, -0.02 * k, -0.05 + math.cos(aa) * 0.12))
        ic.put(f"petal{k}", ellipsoid(p, (0.1, 0.05, sz), rot=(0, a, 0), segs=16, rings=10), col)
    ic.put("heart", ellipsoid(Vector((0, -0.14, -0.12)), (0.07, 0.03, 0.05), segs=12, rings=8), "#ffd36b")
    cord(ic, Vector((0, 0.0, 0.3)))
@icon("crane-charm", "gear (charm): Crane Charm, a folded red-pink paper crane (wings up, long neck) on a gold cord")
def _(ic):
    W, W2, C = "#f27a7a", "#d85a5a", "#b8474a"     # red-pink folded paper, darker back wing / fold lines
    S = lambda pts, d: solid([Vector((x, d, z)) for x, z in pts], 0.03)
    ic.put("wingB", S([(-0.06, -0.04), (-0.26, 0.4), (0.06, 0.08)], 0.03), W2, smooth=False)               # back wing
    ic.put("tail", S([(-0.14, -0.12), (-0.5, 0.2), (-0.4, 0.24), (-0.04, -0.0)], 0.0), W, smooth=False)    # tail point
    ic.put("neck", S([(0.06, -0.12), (0.4, 0.3), (0.47, 0.26), (0.14, -0.0)], 0.0), W, smooth=False)       # neck
    ic.put("head", S([(0.38, 0.28), (0.56, 0.18), (0.47, 0.3)], -0.02), W2, smooth=False)                 # head, beak down
    ic.put("body", S([(-0.26, -0.06), (0.0, -0.22), (0.26, -0.06), (0.0, 0.05)], -0.03), W, smooth=False) # body diamond
    ic.put("wingF", S([(-0.1, -0.06), (0.1, 0.48), (0.2, -0.04)], -0.06), "#f79a9a", smooth=False)         # front wing up
    D = Draw(ic, -0.1, 1.0); D.bar(0.1, 0.42, 0.04, -0.03, 0.014, C); D.bar(-0.22, -0.07, 0.22, -0.07, 0.014, C)  # paper folds
    ic.put("cord", tube((0.1, -0.06, 0.46), (0.1, -0.06, 0.56), 0.018, 0.018, segs=8), "#e0b04a")
    ic.put("loop", ellipsoid(Vector((0.1, -0.06, 0.6)), (0.05, 0.02, 0.05), segs=16, rings=8), "#e0b04a")
    tassel(ic, Vector((0.0, -0.04, -0.26)), col="#e0b04a")

# ------------------------------------------------------------------ Insights (glowing scroll + one picture)
def _rip(D):
    D.disc(0, 0, 0.045, INK)
    for k, r in enumerate((0.1, 0.17, 0.24)): D.arc(0, 0, r, 0.032, 0, 360, INK if k == 0 else INK2, n=40)
@icon("ripple-counter", "Insight: Ripple Counter, ripples spreading from one point")
def _(ic): scroll(ic, _rip)
@icon("iron-skin", "Insight: Iron Skin, a steel shield with an arrow bouncing back off it")
def _(ic): scroll(ic, lambda D: (D.shield(-0.06, 0.0, 0.22, "#a9bccf", rim="#5d7088"), D.arc(0.1, 0.02, 0.17, 0.045, -60, 70, "#f08a3c"), D.head(0.18, -0.13, -150, 0.07, "#f08a3c")))
@icon("wind-step", "Insight: Wind Step, a footprint with wind streaks (a burst of speed)")
def _(ic): scroll(ic, lambda D: ([D.bar(-0.3, z, -0.12 - abs(z) * 0.4, z, 0.035, "#7fcfc2") for z in (-0.1, 0.0, 0.1)], D.foot(0.08, -0.02, 0.24, "#2f9a8c")))
@icon("double-strike", "Insight: Double Strike, two hit bursts, one after the other")
def _(ic): scroll(ic, lambda D: (D.burst(-0.1, 0.06, 0.18, "#f2a23a"), D.burst(0.1, -0.06, 0.18, "#e5503f"), D.burst(0.1, -0.06, 0.08, "#ffe48a")))
@icon("quick-hands", "Insight: Quick Hands, a fist with speed lines")
def _(ic): scroll(ic, lambda D: ([D.bar(-0.32, z, -0.16, z, 0.032, INK2) for z in (-0.08, 0.02, 0.12)], D.fist(0.06, 0.02, 0.2, "#e7b48c", "#b07a52")))
@icon("press-the-advantage", "Insight: Press the Advantage, two red chevrons charging at a dizzy target (hit harder while they are staggered)")
def _(ic): scroll(ic, lambda D: (D.disc(0.14, 0.0, 0.13, "#3b2f63"), D.disc(0.14, 0.0, 0.105, "#b3a6dc"), D.spiral(0.14, 0.0, 0.08, 0.022, "#8a7ab8"),
                                 [D.stroke([(x, 0.14), (x + 0.1, 0.0), (x, -0.14)], 0.055, "#e5503f", closed=False) for x in (-0.28, -0.14)]))
@icon("shield-breaker", "Insight: Shield Breaker, a cracked shield")
def _(ic): scroll(ic, lambda D: (D.shield(0.0, 0.0, 0.24, "#a9bccf", rim="#5d7088"),
                                  D.poly([(0.02, 0.22), (-0.06, 0.08), (0.04, 0.02), (-0.05, -0.12), (0.0, -0.2), (0.09, -0.11), (0.01, 0.0), (0.1, 0.08), (0.06, 0.22)], "#f7eed6")))
@icon("heavy-hands", "Insight: Heavy Hands, a big fist in front of a hit burst (more power)")
def _(ic): scroll(ic, lambda D: (D.burst(0, 0.02, 0.27, "#f2a23a"), D.fist(0, 0.0, 0.2, "#e7b48c", "#b07a52")))
@icon("rally", "Insight: Rally, a heart with a golden up arrow (Focus fills faster when health is low)")
def _(ic): scroll(ic, lambda D: (D.heart(-0.07, 0.0, 0.2, "#e5503f"), D.poly([(-0.27, -0.02), (0.13, -0.02), (0.13, -0.2), (-0.27, -0.2)], "#f7eed6") if False else None,
                                  D.arrow(0.2, -0.17, 0.2, 0.12, 0.05, "#f2b230")))

# ------------------------------------------------------------------ Seals (round medallion + one symbol)
S_INK = "#2e6f9e"
@icon("off-balance", "Seal: Off-balance, a little round fighter tipping over, wobble lines and a dizzy swirl (the attacker stays off-balance longer)")
def _(ic): seal(ic, _offbal)
def _offbal(D):
    F = D.frame(-0.02, -0.21, 62); L = lambda pts: [F(u, v) for u, v in pts]
    D.poly([(-0.3, -0.25), (0.3, -0.25), (0.3, -0.21), (-0.3, -0.21)], "#c9bfa4")                     # floor
    for v in (0.1, -0.1):                                                                              # arms flailing
        p0, p1 = F(0.2, v), F(0.3, v * 2.6); D.bar(p0[0], p0[1], p1[0], p1[1], 0.06, "#3b2f63"); D.bar(p0[0], p0[1], p1[0], p1[1], 0.035, "#8a7ab8")
    body = L([(0.15 + math.cos(t) * 0.15, math.sin(t) * 0.12) for t in [i * math.pi / 16 for i in range(32)]])
    D.opoly(body, "#8a7ab8", "#3b2f63")                                                                 # round body, leaning
    hx, hz = F(0.38, 0.0); D.disc(hx, hz, 0.105, "#3b2f63"); D.disc(hx, hz, 0.08, "#b3a6dc")
    D.disc(hx - 0.03, hz + 0.01, 0.018, "#3b2f63"); D.disc(hx + 0.03, hz + 0.01, 0.018, "#3b2f63")    # wide eyes
    D.spiral(hx + 0.02, hz + 0.18, 0.09, 0.025, "#f2b230")
    D.arc(-0.05, -0.02, 0.3, 0.03, 100, 150, S_INK); D.arc(-0.05, -0.02, 0.22, 0.03, 105, 145, S_INK)  # wobble lines
@icon("escape-step", "Seal: Escape Step, a footprint hopping back along a curved arrow (a Block recharges Dash)")
def _(ic): seal(ic, lambda D: (D.foot(0.12, -0.04, 0.22, S_INK), D.arc(-0.06, 0.0, 0.2, 0.045, 60, 200, "#7fb8e0"), D.head(-0.25, -0.06, -95, 0.08, "#7fb8e0")))
@icon("sweep", "Seal: Sweep, a foot sweeping low along the floor, with a curved arrow")
def _(ic): seal(ic, lambda D: (D.bar(-0.32, -0.2, 0.32, -0.2, 0.03, "#c9bfa4"), D.arc(0.0, 0.1, 0.24, 0.055, 200, 330, S_INK), D.head(0.21, -0.03, 70, 0.09, S_INK),
                               D.foot(-0.22, -0.02, 0.16, S_INK)))
@icon("steady-breath", "Seal: Steady Breath, a heart with soft breath wisps (Perfect Counters restore Health)")
def _(ic): seal(ic, lambda D: (D.heart(0, -0.04, 0.22, "#e5503f"), D.arc(-0.12, 0.2, 0.08, 0.025, 20, 160, "#7fb8e0"), D.arc(0.12, 0.2, 0.08, 0.025, 20, 160, "#7fb8e0")))
@icon("strong-block", "Seal: Strong Block, a gi-sleeved forearm raised in a rising block, fist closed, a hit bouncing off the top")
def _(ic): seal(ic, _block)
SKIN, SKIN_D, SKIN_L, OUT = "#e7b48c", "#a8704a", "#f6d0ae", "#3a2a22"
def _block(D):
    F0 = D.frame(-0.02, -0.03, 138)               # forearm axis: elbow (low right) -> fist (high left), the rising-block angle
    F = lambda u, v: F0(1.18 * (u - 0.2), -1.18 * v)   # centred + enlarged; +v = the top (striking) side of the arm
    L = lambda pts: [F(u, v) for u, v in pts]
    for u, l in ((0.16, 0.07), (0.26, 0.09), (0.36, 0.07)):                                            # impact lines on the top side
        p0, p1 = F(u, 0.14), F(u + 0.02, 0.14 + l); D.bar(p0[0], p0[1], p1[0], p1[1], 0.034, "#f2a23a")
    D.opoly(L([(0.06, -0.08), (0.34, -0.07), (0.34, 0.07), (0.06, 0.08)]), SKIN, OUT)                 # forearm
    D.poly(L([(0.08, 0.035), (0.32, 0.03), (0.32, 0.055), (0.08, 0.06)]), SKIN_L)                      # light along the top
    # fist: a straight-wrist continuation of the forearm axis (age-uke: palm turned out toward the viewer),
    # knuckle end pointing ALONG the arm, never sideways
    D.opoly(L([(0.31, -0.095), (0.5, -0.1), (0.54, -0.06), (0.54, 0.06), (0.5, 0.1), (0.31, 0.095)]), SKIN, OUT)
    for k in range(3):                                                                                 # 4 curled fingers side by side, running along the arm
        v = -0.05 + k * 0.05; D.stroke(L([(0.4, v), (0.535, v)]), 0.014, OUT, closed=False)
    D.poly(L([(0.48, -0.09), (0.53, -0.055), (0.53, 0.055), (0.48, 0.09)]), SKIN_L)                    # light on the knuckle end
    D.opoly(L([(0.355, -0.1), (0.405, -0.1), (0.415, 0.03), (0.39, 0.05), (0.36, 0.03)]), SKIN_D, OUT, 0.02)  # thumb folded across the fingers
    D.opoly(L([(-0.14, -0.13), (0.1, -0.115), (0.1, 0.115), (-0.14, 0.13)]), "#ffffff", OUT)           # gi sleeve
    D.poly(L([(0.04, -0.1), (0.09, -0.1), (0.09, 0.1), (0.04, 0.1)]), "#cfc6b0")                        # cuff band
@icon("sharp-eyes", "Seal: Sharp Eyes, a wide-open eye (the Perfect Counter window is longer)")
def _(ic): seal(ic, lambda D: D.eye(0, 0, 0.3, "#ffffff", "#3f9ad0", "#1f2a44"))
@icon("create-distance", "Seal: Create Distance, two arrows pushing apart")
def _(ic): seal(ic, lambda D: (D.bar(0, -0.18, 0, 0.18, 0.04, "#7fb8e0"), D.arrow(-0.07, 0, -0.24, 0, 0.06, S_INK), D.arrow(0.07, 0, 0.24, 0, 0.06, S_INK)))
@icon("disarm", "Seal: Disarm, a fist with a down arrow (the attacker's next hit is weaker)")
def _(ic): seal(ic, lambda D: (D.fist(-0.08, 0.04, 0.18, "#e7b48c", "#b07a52"), D.arrow(0.2, 0.14, 0.2, -0.16, 0.05, S_INK)))
@icon("throw", "Seal: Throw, a big arrow arcing over the top (Perfect Counter hits are stronger)")
def _(ic): seal(ic, lambda D: (D.arc(0, -0.04, 0.25, 0.06, 10, 170, S_INK), D.head(0.25, -0.06, -90, 0.09, S_INK), D.disc(-0.25, -0.06, 0.045, S_INK), D.burst(0, -0.14, 0.1, "#f2a23a")))
@icon("follow-through", "Seal: Follow-through, a fist that keeps going after the hit: a long swoosh trail through a burst (off-balance enemies take more damage)")
def _(ic): seal(ic, lambda D: ([D.arc(0.1, -0.55, r, 0.035, 150, 82, S_INK if k == 1 else "#7fb8e0") for k, r in enumerate((0.55, 0.64, 0.73))],
                                D.burst(-0.06, 0.04, 0.14, "#f2a23a"), D.fist(0.2, 0.08, 0.17, "#e7b48c", "#b07a52")))

for i, (id_, note, fn) in enumerate(ALL):
    ic = Icon("icon-" + id_, i); fn(ic); ic.finish(note)

scene["static_targets"] = json.dumps(TARGETS)
bpy.ops.wm.save_as_mainfile(filepath=os.path.abspath(A.out))
print("saved", A.out, len(TARGETS), "targets")
