"""
Dojo Ascent - Guardian CONCEPT renders (A-BEST 3, Art Director bot). Concept stills, not final sprites.
Builds each Guardian from drafts/content/bosses/<id>.json in the shadow-creature style (deep indigo body, glowing
oval eyes with a shine, a soft rim in the Guardian's colour, toon shading from tools/toon_kit.py) in each of its
three phases, and renders S and SE stills from the house camera (35 deg, orthographic).

    blender -b -P incoming-art/guardian-concepts/source/build_guardian_concepts.py -- --ids lamp-keeper,... --out DIR
Phase arc (every Guardian): phase 1 heavily wrapped in shadow wisps; phase 2 its own colour wakes up and the phase
prop appears; phase 3 the shadow thins and the colour shows most (the hopeful step before it is freed).
Nothing floats above a head: every prop sits at hand, chest or floor height.
"""
import bpy, bmesh, math, sys, os, argparse, json
from mathutils import Vector, Euler
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "..", "tools"))
from toon_kit import srgb, toon_material, outline_material, hull_material, add_hull, ellipsoid, tube, box, OUTLINE_W

argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
ap = argparse.ArgumentParser(); ap.add_argument("--ids", required=True); ap.add_argument("--out", required=True)
ap.add_argument("--size", type=int, default=512); ap.add_argument("--ortho", type=float, default=2.6)
A = ap.parse_args(argv)
BOSSES = os.path.join(HERE, "..", "..", "..", "drafts", "content", "bosses")

# accent / glow / eye per Guardian. accent = the draft "color", except where noted in the Delivery Note DECIDE list.
LOOK = {
    "lamp-keeper":      dict(accent="#f4c95d", glow="#ffe08a", eye="#fff3c4", H=1.35),
    "sun-gardener":     dict(accent="#7fbf4d", glow="#a8e07a", eye="#e9ffd0", H=1.55),
    "hearth-cook":      dict(accent="#e98a3c", glow="#ffb36b", eye="#ffe6c4", H=1.25),
    "stone-giant":      dict(accent="#8a8178", glow="#b9d88a", eye="#eaf6c8", H=1.6),
    "river-watcher":    dict(accent="#5aa0d6", glow="#8cc8ff", eye="#dff2ff", H=1.6),
    "ember-knight":     dict(accent="#e8772e", glow="#ffa560", eye="#ffe2c0", H=1.4),   # draft #d9532b reads red: DECIDE 1
    "echo-mask":        dict(accent="#b05a8a", glow="#e08cbc", eye="#ffe0f0", H=1.35),
    "root-keeper":      dict(accent="#7a5a3a", glow="#c9a06a", eye="#fff0cc", H=1.55),
    "storm-herald":     dict(accent="#6c7fb8", glow="#9fb2f0", eye="#e6ecff", H=1.6),
    "lost-lightbearer": dict(accent="#f2e6b8", glow="#fff4cf", eye="#fff8e0", H=1.15),
}

def clear():
    bpy.ops.wm.read_factory_settings(use_empty=True)

def lerp_hex(a, b, t):
    a = [int(a[i:i + 2], 16) for i in (1, 3, 5)]; b = [int(b[i:i + 2], 16) for i in (1, 3, 5)]
    return "#" + "".join(f"{round(x + (y - x) * t):02x}" for x, y in zip(a, b))

def build(gid, phase):
    clear(); sc = bpy.context.scene; L = LOOK[gid]; H = L["H"]; W = 0.85; R = W / 2
    root = bpy.data.objects.new("ROOT", None); sc.collection.objects.link(root)
    t = (phase - 1) / 2.0                                      # 0, 0.5, 1
    body_c = lerp_hex("#241e52", lerp_hex("#241e52", L["accent"], 0.35), t * 0.6)
    M = {"body": toon_material("BODY", body_c), "belly": toon_material("BELLY", lerp_hex("#3a3278", L["accent"], 0.15 + 0.2 * t)),
         "accent": toon_material("ACC", L["accent"], shadow=0.8, highlight=1.12),
         "glowc": toon_material("GLOWC", L["glow"], shadow=1.0, highlight=1.0),
         "eye": toon_material("EYE", L["eye"], 1.0, 1.0), "hi": toon_material("HI", "#ffffff", 1.0, 1.0),
         "dark": toon_material("DARK", "#120e2a", 1.0, 1.0), "wisp": toon_material("WISP", "#161236", 0.85, 1.0),
         "pale": toon_material("PALE", "#ece6f6"), "stone": toon_material("STONE", "#8f8a96"), "cloud": toon_material("CLOUD", "#6f7196"),
         "wood": toon_material("WOOD", "#6b4a30"), "leaf": toon_material("LEAF", "#5f9a46"),
         "warm": toon_material("WARM", "#fff1b8", 1.0, 1.0), "water": toon_material("WATER", "#6fb6e8", 0.8, 1.1),
         "cheek": toon_material("CHEEK", "#7a5fc4")}
    OUT = outline_material(); GLOW = hull_material("RIM", L["glow"])
    def M_(name, bm, mat, outline=True, rim=False):
        me = bpy.data.meshes.new(name)
        for f in bm.faces: f.smooth = True
        bm.to_mesh(me); bm.free(); me.materials.append(M[mat] if isinstance(mat, str) else mat)
        ob = bpy.data.objects.new(name, me); sc.collection.objects.link(ob); ob.parent = root
        if outline: add_hull(ob, sc.collection, OUT, OUTLINE_W * 2).parent = root
        if rim: add_hull(ob, sc.collection, GLOW, OUTLINE_W * 2 + 0.03 * (0.6 + 0.6 * t)).parent = root
        return ob
    E = lambda *a, **k: ellipsoid(*a, **k)
    def eyes(z, dx=0.2, y=None, s=1.0, lid=0.0, mat="eye"):
        """oval glowing eyes with a white shine. lid 0..1 = upper lid down (tired / sleepy), never a frown."""
        y = -R * 0.8 if y is None else y
        for x in (1, -1):
            M_(f"eye{x}", E((x * R * dx * 2, y, z - R * 0.12 * lid), (R * 0.17 * s, R * 0.07, R * 0.24 * s * (1 - 0.55 * lid))), mat)
            M_(f"hi{x}", E((x * R * dx * 2 - R * 0.05, y - R * 0.06, z + R * 0.06 * s - R * 0.1 * lid), (R * 0.05 * s, R * 0.03, R * 0.06 * s)), "hi", outline=False)
            if lid > 0:
                M_(f"lid{x}", E((x * R * dx * 2, y + R * 0.01, z + R * 0.12 * s), (R * 0.2 * s, R * 0.08, R * 0.1 * s)), "body", outline=False)
    def wisps(n, rad, z0, z1):   # dark shadow wisps hugging the lower body; fewer each phase
        for k in range(n):
            a = 2 * math.pi * (k + 0.5) / n + 0.3
            M_(f"wisp{k}", E((math.cos(a) * rad, math.sin(a) * rad * 0.8, z0 + (z1 - z0) * ((k * 37) % 10) / 10),
                             (R * 0.32, R * 0.28, R * 0.24), rot=(0, 0, math.degrees(a))), "wisp", rim=False)
    nw = [9, 6, 3][phase - 1]
    def arms(z, x=1.0, size=1.0, mat="body", raise_=0):
        for s in (1, -1):
            M_(f"arm{s}", E((s * R * x, -R * 0.1, z + raise_ * s * 0), (0.09 * size, 0.09 * size, 0.17 * size), rot=(0, s * 20, 0)), mat, rim=True)

    if gid == "lamp-keeper":      # a hooded lamp-lighter; the lamp swings at its side, lamps on the floor wake up
        M_("robe", tube((0, 0, 0.02), (0, 0, H * 0.72), R * 1.05, R * 0.62, segs=24), "body", rim=True)
        M_("head", E((0, 0, H * 0.78), (R * 0.62, R * 0.58, H * 0.2)), "body", rim=True)
        M_("hood", E((0, R * 0.12, H * 0.84), (R * 0.7, R * 0.62, H * 0.2)), "belly", rim=True)
        M_("sash", E((0, -R * 0.62, H * 0.42), (R * 0.6, R * 0.14, H * 0.04)), "accent", outline=False)
        eyes(H * 0.78, 0.17, -R * 0.55)
        arms(H * 0.5, 1.05, 1.3)
        M_("lamp", tube((R * 1.25, -R * 0.4, H * 0.22), (R * 1.25, -R * 0.4, H * 0.42), 0.09, 0.07, segs=12), "accent")
        M_("lampflame", E((R * 1.25, -R * 0.52, H * 0.32), (0.05, 0.03, 0.07)), "warm", outline=False)
        M_("lamphandle", tube((R * 1.2, -R * 0.4, H * 0.42), (R * 1.1, -R * 0.2, H * 0.5), 0.02, 0.02, segs=8), "accent")
        if phase >= 2:
            for k, (x, y) in enumerate(((-1.6, -0.6), (1.7, 0.4), (-1.3, 1.0))[:phase]):
                M_(f"floorlamp{k}", tube((x * R * 1.5, y * R, 0), (x * R * 1.5, y * R, 0.16), 0.06, 0.05), "accent")
                M_(f"floorflame{k}", E((x * R * 1.5, y * R - 0.06, 0.1), (0.035, 0.02, 0.05)), "warm", outline=False)
    elif gid == "sun-gardener":   # a tall gentle vine gardener; soft thorn nubs fall away, a flower opens in phase 3
        M_("trunk", tube((0, 0, 0.02), (0, 0, H * 0.7), R * 0.8, R * 0.55, segs=20), "body", rim=True)
        M_("head", E((0, 0, H * 0.78), (R * 0.55, R * 0.5, H * 0.17)), "body", rim=True)
        for k in range(7):
            a = k * 0.9
            M_(f"leaf{k}", E((math.cos(a) * R * 0.6, math.sin(a) * R * 0.5, H * (0.2 + 0.09 * k)), (R * 0.3, R * 0.1, R * 0.16), rot=(0, 30, math.degrees(a))), "leaf")
        for k in range(3):  # leafy hair at head height (part of the head)
            M_(f"crownleaf{k}", E(((k - 1) * R * 0.35, R * 0.1, H * 0.9), (R * 0.22, R * 0.12, R * 0.12), rot=(0, (k - 1) * 30, 0)), "leaf")
        eyes(H * 0.78, 0.16, -R * 0.45)
        for s in (1, -1):
            M_(f"vinearm{s}", tube((s * R * 0.6, 0, H * 0.58), (s * R * 1.4, -R * 0.3, H * 0.36), 0.06, 0.04), "body", rim=True)
        for k in range(6 - 2 * (phase - 1)):   # rounded thorn nubs (never pointed), fewer each phase
            a = k * 1.1
            M_(f"nub{k}", E((math.cos(a) * R * 0.82, math.sin(a) * R * 0.6 - 0.05, H * (0.15 + 0.08 * k)), (0.035, 0.035, 0.035)), "dark")
        if phase >= 2:
            for s in (1, -1): M_(f"seedpod{s}", E((s * R * 1.45, -R * 0.35, H * 0.34), (0.06, 0.06, 0.07)), "accent")
        if phase == 3:
            for k in range(5):
                a = 2 * math.pi * k / 5
                M_(f"petal{k}", E((math.cos(a) * 0.07, -R * 0.78, H * 0.45 + math.sin(a) * 0.07), (0.05, 0.02, 0.05)), "warm")
            M_("flowerc", E((0, -R * 0.82, H * 0.45), (0.035, 0.02, 0.035)), "accent", outline=False)
    elif gid == "hearth-cook":    # a big round cook with a ladle; Spark Sprites join (phase 2), a rolling pin (phase 3)
        M_("belly", E((0, 0, H * 0.42), (R * 1.15, R * 1.0, H * 0.42), segs=24, rings=14), "body", rim=True)
        M_("apron", E((0, -R * 0.55, H * 0.36), (R * 0.72, R * 0.5, H * 0.3)), "pale", outline=False)
        M_("head", E((0, 0, H * 0.84), (R * 0.6, R * 0.55, H * 0.16)), "body", rim=True)
        M_("cap", tube((0, 0, H * 0.92), (0, 0, H * 1.0), R * 0.5, R * 0.55, segs=20), "pale")   # sits on the head
        eyes(H * 0.84, 0.17, -R * 0.5)
        for x in (1, -1): M_(f"cheek{x}", E((x * R * 0.45, -R * 0.45, H * 0.77), (R * 0.1, R * 0.04, R * 0.06)), "cheek", outline=False)
        arms(H * 0.52, 1.15, 1.4)
        if phase < 3:
            M_("ladle", tube((R * 1.3, -R * 0.3, H * 0.45), (R * 1.4, -R * 0.4, H * 0.05), 0.025, 0.025, segs=8), "accent")
            M_("ladlecup", E((R * 1.42, -R * 0.42, H * 0.04), (0.09, 0.09, 0.05)), "accent")
        else:
            M_("pin", tube((-R * 1.4, -R * 0.6, H * 0.45), (R * 1.4, -R * 0.6, H * 0.45), 0.08, 0.08, segs=16), "wood")
        if phase >= 2:
            for k, x in enumerate((-1.8, 1.9)):
                M_(f"spark{k}", E((x * R, -R * 0.2, 0.12), (0.08, 0.08, 0.1)), "glowc")
    elif gid == "stone-giant":    # stones the shadow stacked up; it holds one stone in phase 2, moss and light in phase 3
        stones = [(0, 0, 0.18, 1.0, 0.85, 0.2), (0.05, 0, 0.48, 0.92, 0.8, 0.2), (-0.03, 0, 0.78, 0.8, 0.72, 0.18)]
        for k, (dx, dy, z, sw, sd, sh) in enumerate(stones):
            M_(f"stone{k}", E((dx * R, dy, z * H), (R * sw, R * sd * 0.9, sh * H)), "body", rim=True)
        M_("headstone", E((0, 0, H * 0.94), (R * 0.5, R * 0.46, H * 0.12)), "body", rim=True)
        eyes(H * 0.94, 0.15, -R * 0.42, s=0.85)
        for s in (1, -1): M_(f"fist{s}", E((s * R * 1.15, -R * 0.1, H * 0.5), (0.16, 0.15, 0.18)), "body", rim=True)
        if phase == 2: M_("tossstone", E((R * 1.2, -R * 0.45, H * 0.62), (0.13, 0.12, 0.11)), "stone")
        if phase == 3:
            for k in range(5): M_(f"moss{k}", E(((k - 2) * R * 0.3, -R * 0.75, H * (0.3 + 0.12 * (k % 3))), (0.07, 0.03, 0.04)), "leaf", outline=False)
    elif gid == "river-watcher":  # a water heron; muddy eyes clear up phase by phase
        M_("bodyh", E((0, 0.05, H * 0.5), (R * 0.85, R * 1.0, H * 0.22), rot=(15, 0, 0)), "body", rim=True)
        M_("neck", tube((0, -R * 0.3, H * 0.6), (0, -R * 0.45, H * 0.85), 0.07, 0.06), "body", rim=True)
        M_("head", E((0, -R * 0.45, H * 0.88), (R * 0.34, R * 0.38, R * 0.3)), "body", rim=True)
        M_("beak", tube((0, -R * 0.75, H * 0.86), (0, -R * 1.3, H * 0.83), 0.05, 0.025, segs=10), "accent")   # blunt, rounded tip
        M_("beaktip", E((0, -R * 1.3, H * 0.83), (0.026, 0.026, 0.026)), "accent")
        for s in (1, -1):
            M_(f"leg{s}", tube((s * R * 0.3, 0, 0), (s * R * 0.3, 0, H * 0.4), 0.025, 0.025, segs=8), "body")
            M_(f"wing{s}", E((s * R * 0.8, 0.05, H * 0.52), (R * 0.2, R * 0.8, H * 0.15), rot=(15, s * 10, 0)), "belly", rim=True)
        eye_mat = toon_material("EYEM", lerp_hex("#8a7a5a", L["eye"], t))   # muddy -> clear
        M["eyem"] = eye_mat
        eyes(H * 0.9, 0.14, -R * 0.72, s=0.7, mat="eyem")
        for k in range(phase):   # puddles / water at its feet
            M_(f"puddle{k}", E(((k - 1) * R * 0.9, -R * 0.2 * k, 0.005), (R * 0.5, R * 0.35, 0.01)), "water", outline=False)
    elif gid == "ember-knight":   # a knight of glowing metal, a round shield; the shield sparks in phase 2
        M_("bodyk", E((0, 0, H * 0.45), (R * 0.95, R * 0.8, H * 0.42), segs=24, rings=14), "body", rim=True)
        M_("helm", E((0, 0, H * 0.83), (R * 0.6, R * 0.58, H * 0.18)), "belly", rim=True)
        M_("visor", E((0, -R * 0.52, H * 0.82), (R * 0.45, R * 0.08, H * 0.08)), "dark", outline=False)
        eyes(H * 0.82, 0.14, -R * 0.6, s=0.75)
        for s in (1, -1): M_(f"pauld{s}", E((s * R * 0.85, 0, H * 0.66), (R * 0.32, R * 0.32, R * 0.22)), "accent")
        M_("shield", tube((-R * 1.15, -R * 0.5, H * 0.45), (-R * 1.15, -R * 0.62, H * 0.45), R * 0.5, R * 0.5, segs=24), "accent" if phase != 2 else "glowc")
        M_("boss", E((-R * 1.15, -R * 0.66, H * 0.45), (R * 0.15, R * 0.06, R * 0.15)), "warm")
        M_("bar", tube((R * 1.15, -R * 0.4, H * 0.3), (R * 1.15, -R * 0.4, H * 0.75), 0.04, 0.04, segs=10), "accent")   # a blunt glowing bar, rounded ends
        M_("barend", E((R * 1.15, -R * 0.4, H * 0.76), (0.06, 0.06, 0.06)), "warm")
        arms(H * 0.5, 1.1, 1.2)
    elif gid == "echo-mask":      # a lonely floating mask over a soft shadow cloak; Masklets join in phase 2
        M_("cloak", tube((0, 0, 0.05), (0, 0, H * 0.75), R * 0.95, R * 0.5, segs=24), "body", rim=True)
        M_("mask", E((0, -R * 0.45, H * 0.72), (R * 0.62, R * 0.18, H * 0.22), rot=(0, 0, 0)), "pale")
        M_("maskmark", E((0, -R * 0.62, H * 0.6), (R * 0.25, R * 0.04, R * 0.04)), "accent", outline=False)
        for x in (1, -1): M_(f"hole{x}", E((x * R * 0.26, -R * 0.6, H * 0.76), (R * 0.15, R * 0.05, R * 0.2)), "dark", outline=False)
        eyes(H * 0.76, 0.13, -R * 0.66, s=0.75)
        if phase >= 2:
            for k, x in enumerate((-1.7, 1.7)):
                M_(f"masklet{k}", E((x * R, -R * 0.3, H * 0.5), (R * 0.28, R * 0.1, R * 0.34)), "pale")
                for e in (1, -1): M_(f"mlh{k}{e}", E((x * R + e * 0.05, -R * 0.36, H * 0.53), (0.025, 0.02, 0.035)), "eye", outline=False)
        if phase == 3:   # the mask slips a little: a kind face peeks out
            for x in (1, -1): M_(f"cheek{x}", E((x * R * 0.45, -R * 0.62, H * 0.62), (R * 0.1, R * 0.04, R * 0.06)), "cheek", outline=False)
    elif gid == "root-keeper":    # a wise old tree with a book; pages fly (phase 2), roots on the floor (phase 3)
        M_("trunk", tube((0, 0, 0.02), (0, 0, H * 0.72), R * 0.9, R * 0.65, segs=20), "body", rim=True)
        M_("canopy", E((0, 0.05, H * 0.86), (R * 0.95, R * 0.85, H * 0.17)), "body", rim=True)   # leafy head, not above it
        for k in range(5): M_(f"leafc{k}", E(((k - 2) * R * 0.4, -R * 0.4, H * (0.92 + 0.02 * (k % 2))), (R * 0.2, R * 0.1, R * 0.1)), "leaf", outline=False)
        M_("beard", E((0, -R * 0.62, H * 0.6), (R * 0.35, R * 0.12, H * 0.1)), "pale", outline=False)
        eyes(H * 0.74, 0.16, -R * 0.66, s=0.8, lid=0.3)
        for s in (1, -1): M_(f"branch{s}", tube((s * R * 0.7, 0, H * 0.6), (s * R * 1.35, -R * 0.4, H * 0.42), 0.07, 0.05), "body", rim=True)
        M_("book", box((-R * 1.35, -R * 0.5, H * 0.4), (0.22, 0.06, 0.17), bevel=0.01), "accent")
        if phase >= 2:
            for k, (x, z) in enumerate(((1.7, 0.5), (-1.9, 0.6), (1.5, 0.2))):
                M_(f"page{k}", box((x * R, -R * 0.3, H * z), (0.12, 0.01, 0.09), rot=(20, 15 * k, 10), bevel=0.003), "pale")
        if phase == 3:
            for s in (1, -1): M_(f"root{s}", tube((s * R * 0.6, -R * 0.4, 0.02), (s * R * 2.2, -R * 1.6, 0.02), 0.06, 0.03), "body")
    elif gid == "storm-herald":   # a tall figure of wind; cloud shoulders, a soft bolt badge
        M_("cloakh", tube((0, 0, 0.02), (0, 0, H * 0.72), R * (1.0 + 0.2 * (phase >= 2)), R * 0.55, segs=24), "body", rim=True)
        M_("head", E((0, 0, H * 0.8), (R * 0.5, R * 0.48, H * 0.14)), "body", rim=True)
        for s in (1, -1):
            for k in range(3): M_(f"cloud{s}{k}", E((s * R * (0.6 + 0.2 * k), 0, H * (0.7 - 0.03 * k)), (R * 0.22, R * 0.22, R * 0.18)), "belly", rim=True)
        eyes(H * 0.8, 0.15, -R * 0.45, s=0.85)
        pts = [(-0.08, 0.5), (0.04, 0.44), (-0.03, 0.4), (0.07, 0.32)]
        for k in range(3):
            (x0, z0), (x1, z1) = pts[k], pts[k + 1]
            M_(f"bolt{k}", tube((x0, -R * 0.58, H * z0), (x1, -R * 0.58, H * z1), 0.025, 0.025, segs=8), "warm", outline=False)
        z_arm = [0.5, 0.62, 0.78][phase - 1]   # hands rise (never above the head)
        arms(H * z_arm, 1.2, 1.2)
    elif gid == "lost-lightbearer":   # the tired traveller wrapped in storm clouds, hugging the last light
        M_("cloakl", tube((0, 0, 0.02), (0, 0, H * 0.62), R * 0.85, R * 0.5, segs=24), "body", rim=True)
        M_("head", E((0, -0.02, H * 0.72), (R * 0.5, R * 0.46, H * 0.2)), "body", rim=True)
        M_("hood", E((0, R * 0.08, H * 0.76), (R * 0.56, R * 0.5, H * 0.2)), "belly", rim=True)
        M_("light", E((0, -R * 0.62, H * 0.42), (R * 0.26, R * 0.2, R * 0.26)), "warm", outline=False)
        lg = hull_material("LIGHTRIM", L["glow"]); add_hull(bpy.data.objects["light"], sc.collection, lg, 0.03 + 0.03 * phase).parent = root
        for s in (1, -1): M_(f"hug{s}", E((s * R * 0.32, -R * 0.62, H * 0.42), (0.07, 0.07, 0.1), rot=(0, s * 40, 0)), "body", rim=True)
        eyes(H * 0.72, 0.15, -R * 0.42, s=0.85, lid=[0.6, 0.5, 0.35][phase - 1])   # tired, not angry: lids down, no brows
        nclouds = [10, 7, 4][phase - 1]
        for k in range(nclouds):   # storm clouds wrapped round them (never above the head)
            a = -math.pi * 0.25 + 1.5 * math.pi * k / max(1, nclouds - 1)   # sides and back, the light stays visible
            M_(f"storm{k}", E((math.cos(a) * R * 1.0, math.sin(a) * R * 0.8, H * (0.2 + 0.3 * ((k * 3) % 5) / 5)), (R * 0.34, R * 0.3, R * 0.26)), "cloud", rim=False)
    wisps(nw, R * 1.05, 0.05, H * 0.35)
    return sc, root

def render(sc, root, path, yaw):
    r = sc.render; r.engine = "CYCLES"; sc.cycles.device = "CPU"; sc.cycles.samples = 12; sc.cycles.use_denoising = False
    sc.cycles.max_bounces = 0; sc.cycles.transparent_max_bounces = 16; r.film_transparent = True
    r.resolution_x = r.resolution_y = A.size; sc.view_settings.view_transform = "Standard"
    sc.world = bpy.data.worlds.new("W"); sc.world.use_nodes = False; sc.world.color = (0, 0, 0)
    if not sc.camera:
        cd = bpy.data.cameras.new("C"); cd.type = "ORTHO"; cd.ortho_scale = A.ortho; cd.sensor_fit = "HORIZONTAL"
        cam = bpy.data.objects.new("C", cd); sc.collection.objects.link(cam); rx = math.radians(55)
        cam.rotation_euler = Euler((rx, 0, 0)); fwd = Euler((rx, 0, 0)).to_matrix() @ Vector((0, 0, -1))
        up = Euler((rx, 0, 0)).to_matrix() @ Vector((0, 1, 0)); zt = (0.85 - 0.5) * A.ortho / up.z
        cam.location = Vector((0, 0, zt)) - fwd * 20; sc.camera = cam
    root.rotation_euler = Euler((0, 0, math.radians(yaw))); r.filepath = path
    bpy.ops.render.render(write_still=True)

os.makedirs(A.out, exist_ok=True)
for gid in A.ids.split(","):
    for ph in (1, 2, 3):
        sc, root = build(gid, ph)
        for d, yaw in (("S", 0), ("SE", 45)):
            render(sc, root, os.path.join(A.out, f"{gid}_p{ph}_{d}.png"), yaw)
        print("RENDERED", gid, ph, flush=True)
