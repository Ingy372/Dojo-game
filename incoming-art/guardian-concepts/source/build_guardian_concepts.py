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
ap.add_argument("--form2", action="store_true", help="render the second forms (form-shift Guardians only)")
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
    # v2 (Jay): phase 3 is clearly brighter - the body takes much more of its own colour and the wisps go pale
    tint = lerp_hex(L["accent"], "#f4c95d", 0.4) if gid in ("ember-knight", "hearth-cook") else L["accent"]   # orange bodies lean amber, never red
    body_c = lerp_hex("#241e52", tint, [0.0, 0.18, 0.46][phase - 1])
    M = {"body": toon_material("BODY", body_c), "belly": toon_material("BELLY", lerp_hex("#3a3278", tint, [0.15, 0.3, 0.58][phase - 1])),
         "accent": toon_material("ACC", L["accent"], shadow=0.8, highlight=1.12),
         "glowc": toon_material("GLOWC", L["glow"], shadow=1.0, highlight=1.0),
         "eye": toon_material("EYE", L["eye"], 1.0, 1.0), "hi": toon_material("HI", "#ffffff", 1.0, 1.0),
         "dark": toon_material("DARK", "#120e2a", 1.0, 1.0), "wisp": toon_material("WISP", ["#161236", "#1e1946", "#4a4478"][phase - 1], 0.85, 1.0),
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
    nw = [9, 6, 2][phase - 1]
    def arms(z, x=1.0, size=1.0, mat="body", raise_=0):
        for s in (1, -1):
            M_(f"arm{s}", E((s * R * x, -R * 0.1, z + raise_ * s * 0), (0.09 * size, 0.09 * size, 0.17 * size), rot=(0, s * 20, 0)), mat, rim=True)

    if gid == "lamp-keeper":      # a hooded lamp-lighter; the lamp swings at its side, lamps on the floor wake up
        M_("robe", tube((0, 0, 0.02), (0, 0, H * 0.66), R * 1.45, R * 0.5, segs=28), "body", rim=True)   # v2: wide bell robe
        M_("hem", tube((0, 0, 0.0), (0, 0, 0.07), R * 1.5, R * 1.5, segs=28), "belly", rim=True)
        M_("head", E((0, 0, H * 0.78), (R * 0.62, R * 0.58, H * 0.2)), "body", rim=True)
        M_("hood", E((0, R * 0.12, H * 0.84), (R * 0.7, R * 0.62, H * 0.2)), "belly", rim=True)
        M_("sash", E((0, -R * 0.62, H * 0.42), (R * 0.6, R * 0.14, H * 0.04)), "accent", outline=False)
        eyes(H * 0.78, 0.17, -R * 0.55)
        arms(H * 0.5, 1.05, 1.3)
        # v2: a lamp-lighter's staff at its side (top stays below the head), the lamp hangs from a little hook
        M_("staff", tube((R * 1.75, -R * 0.3, 0.0), (R * 1.75, -R * 0.3, H * 0.68), 0.025, 0.022, segs=8), "wood")
        M_("hook", tube((R * 1.75, -R * 0.3, H * 0.68), (R * 2.05, -R * 0.3, H * 0.66), 0.02, 0.02, segs=8), "wood")
        M_("lamp", tube((R * 2.05, -R * 0.3, H * 0.44), (R * 2.05, -R * 0.3, H * 0.6), 0.08, 0.06, segs=12), "accent")
        M_("lampflame", E((R * 2.05, -R * 0.42, H * 0.52), (0.05, 0.03, 0.065)), "warm", outline=False)
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
        # v2: blocky, squared-off stones and a wide stance (two leg blocks) so it never reads as a round blob
        for s in (1, -1): M_(f"leg{s}", box((s * R * 0.75, 0, H * 0.13), (R * 0.75, R * 0.8, H * 0.26), rot=(0, 0, s * 4), bevel=0.04), "body", rim=True)
        M_("hip", box((0, 0, H * 0.33), (R * 2.1, R * 1.2, H * 0.18), rot=(0, 0, 3), bevel=0.05), "body", rim=True)
        M_("chest", box((0.02, 0, H * 0.58), (R * 2.5, R * 1.3, H * 0.3), rot=(0, 0, -3), bevel=0.06), "body", rim=True)
        M_("headstone", box((0, -R * 0.05, H * 0.86), (R * 1.0, R * 0.85, H * 0.2), rot=(0, 0, 2), bevel=0.05), "body", rim=True)
        eyes(H * 0.86, 0.17, -R * 0.5, s=0.85)
        for s in (1, -1): M_(f"fist{s}", box((s * R * 1.55, -R * 0.1, H * 0.42), (0.26, 0.24, 0.3), rot=(0, s * 6, 0), bevel=0.04), "body", rim=True)
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
        # v2: tall and thin - a narrow column with a wide flared hem, small cloud puffs on the shoulders only
        M_("cloakh", tube((0, 0, 0.12), (0, 0, H * 0.74), R * 0.5, R * 0.36, segs=24), "body", rim=True)
        M_("flare", tube((0, 0, 0.0), (0, 0, 0.16), R * 1.4, R * 0.5, segs=28), "body", rim=True)
        M_("head", E((0, 0, H * 0.83), (R * 0.36, R * 0.34, H * 0.12)), "body", rim=True)
        for s in (1, -1):
            for k in range(2): M_(f"cloud{s}{k}", E((s * R * (0.42 + 0.2 * k), 0, H * (0.73 - 0.03 * k)), (R * 0.18, R * 0.18, R * 0.14)), "belly", rim=True)
        eyes(H * 0.83, 0.12, -R * 0.32, s=0.75)
        pts = [(-0.08, 0.5), (0.04, 0.44), (-0.03, 0.4), (0.07, 0.32)]
        for k in range(3):
            (x0, z0), (x1, z1) = pts[k], pts[k + 1]
            M_(f"bolt{k}", tube((x0, -R * 0.4, H * z0), (x1, -R * 0.4, H * z1), 0.025, 0.025, segs=8), "warm", outline=False)
        z_arm = [0.5, 0.62, 0.78][phase - 1]   # hands rise (never above the head)
        arms(H * z_arm, 0.75, 0.9)
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
    wisps(nw, R * (1.45 if gid == "lamp-keeper" else 1.05), 0.05, H * 0.35)
    return sc, root

# ---------------------------------------------------------------- second forms (C14 brief, drafts/content/enemies/guardian-form-shifts.*)
# Working names from the brief (DECIDE): Pebble Heart, Bloom Gardener, Quiet Thunderhead, Cloud Lantern. Each is drawn in
# its phase-3 (brightest) colours, since the shift happens at the 33% phase change. Nothing human-like, nothing above the head.
FORM2 = {"stone-giant": "pebble-heart", "sun-gardener": "bloom-gardener", "storm-herald": "quiet-thunderhead", "lost-lightbearer": "cloud-lantern"}

def build_form2(gid):
    clear(); sc = bpy.context.scene; L = LOOK[gid]; W = 0.85; R = W / 2
    root = bpy.data.objects.new("ROOT", None); sc.collection.objects.link(root)
    OUT = outline_material(); GLOW = hull_material("RIM", L["glow"])
    tm = lambda n, h, a=0.85, b=1.1: toon_material(n, h, a, b)
    M = {"eye": tm("EYE", L["eye"], 1, 1), "hi": tm("HI", "#ffffff", 1, 1), "warm": tm("WARM", "#ffe9a0", 1, 1),
         "gold": tm("GOLD", "#ffc83d", 0.9, 1.1), "moss": tm("MOSS", "#79b85a"), "leaf": tm("LEAF", "#78c45a"),
         "stoneA": tm("STA", "#8e9c88"), "stoneB": tm("STB", "#a3ad95"), "stoneC": tm("STC", "#7c8a7a"),
         "vine": tm("VINE", "#6fae55"), "petal": tm("PETAL", "#ffd84a"), "petal2": tm("PETAL2", "#ffe680"), "fc": tm("FC", "#e8a23a"),
         "cloud": tm("CLOUD", "#7a7c98"), "cloud2": tm("CLOUD2", "#8d8faa"), "sky": tm("SKY", "#8cc8ff", 1, 1),
         "spark": tm("SPARK", "#fff1a8", 1, 1), "lcloud": tm("LCLOUD", "#5d5f86"), "lcloud2": tm("LCLOUD2", "#6f7196")}
    def M_(name, bm, mat, outline=True, rim=False):
        me = bpy.data.meshes.new(name)
        for f in bm.faces: f.smooth = True
        bm.to_mesh(me); bm.free(); me.materials.append(M[mat])
        ob = bpy.data.objects.new(name, me); sc.collection.objects.link(ob); ob.parent = root
        if outline: add_hull(ob, sc.collection, OUT, OUTLINE_W * 2).parent = root
        if rim: add_hull(ob, sc.collection, GLOW, OUTLINE_W * 2 + 0.05).parent = root
        return ob
    E = ellipsoid
    def eyes(z, dx, y, s=1.0):
        for x in (1, -1):
            M_(f"eye{x}", E((x * dx, y, z), (R * 0.17 * s, R * 0.07, R * 0.24 * s)), "eye")
            M_(f"hi{x}", E((x * dx - R * 0.05, y - R * 0.06, z + R * 0.06 * s), (R * 0.05 * s, R * 0.03, R * 0.06 * s)), "hi", outline=False)
    def star(c, r, mat="warm"):   # a soft 5-point star of rounded lobes
        M_("starc", E(c, (r * 0.5, r * 0.25, r * 0.5)), mat, outline=False)
        for k in range(5):
            a = math.pi / 2 + 2 * math.pi * k / 5
            M_(f"star{k}", E((c[0] + math.cos(a) * r * 0.55, c[1], c[2] + math.sin(a) * r * 0.55), (r * 0.28, r * 0.2, r * 0.28), rot=(0, -math.degrees(a), 0)), mat, outline=False)
    if gid == "stone-giant":      # Pebble Heart: shorter, rounder pile of smooth grey-green stones, a warm heart crack
        H = 1.2
        for s in (1, -1): M_(f"foot{s}", E((s * R * 0.55, 0, H * 0.08), (R * 0.42, R * 0.45, H * 0.09)), "stoneC", rim=True)
        M_("belly", E((0, 0, H * 0.36), (R * 1.15, R * 0.95, H * 0.3)), "stoneA", rim=True)
        M_("head", E((0, 0, H * 0.78), (R * 0.85, R * 0.75, H * 0.22)), "stoneB", rim=True)
        for s in (1, -1): M_(f"arm{s}", E((s * R * 1.25, -R * 0.05, H * 0.42), (R * 0.32, R * 0.3, R * 0.36)), "stoneC", rim=True)
        pts = [(0.0, 0.52), (-0.06, 0.44), (0.05, 0.36), (-0.02, 0.27)]   # the warm glowing crack, like a heart
        for k in range(3):
            (x0, z0), (x1, z1) = pts[k], pts[k + 1]
            M_(f"crack{k}", tube((x0, -R * 0.93, H * z0), (x1, -R * 0.93, H * z1), 0.03, 0.03, segs=8), "warm", outline=False)
        M_("heartglow", E((0, -R * 0.9, H * 0.4), (0.09, 0.02, 0.09)), "gold", outline=False)
        for k, (x, z) in enumerate(((-0.6, 0.6), (0.55, 0.62), (-0.2, 0.95), (0.35, 0.92), (0.0, 0.2))):
            M_(f"moss{k}", E((x * R, -R * 0.72, H * z), (0.07, 0.035, 0.04)), "moss", outline=False)
        eyes(H * 0.8, R * 0.34, -R * 0.68, s=1.15)
        for k, (x, y) in enumerate(((-1.7, -0.7), (1.6, -0.9), (-1.2, 0.9), (1.4, 0.6), (0.4, -1.4))):   # loose pebbles bounce
            M_(f"pebble{k}", E((x * R, y * R, 0.05 + 0.06 * (k % 2)), (0.06, 0.055, 0.045)), "stoneB")
    elif gid == "sun-gardener":   # Bloom Gardener: the same vine shape, thorns gone, big yellow sun-flowers, flower eyes
        H = 1.55
        M_("trunk", tube((0, 0, 0.02), (0, 0, H * 0.7), R * 0.8, R * 0.55, segs=20), "vine", rim=True)
        M_("head", E((0, 0, H * 0.78), (R * 0.55, R * 0.5, H * 0.17)), "vine", rim=True)
        for k in range(7):
            a = k * 0.9
            M_(f"leaf{k}", E((math.cos(a) * R * 0.6, math.sin(a) * R * 0.5, H * (0.2 + 0.09 * k)), (R * 0.3, R * 0.1, R * 0.16), rot=(0, 30, math.degrees(a))), "leaf")
        for s in (1, -1):
            M_(f"vinearm{s}", tube((s * R * 0.6, 0, H * 0.58), (s * R * 1.4, -R * 0.3, H * 0.36), 0.06, 0.04), "vine", rim=True)
        def flower(c, r, tag):
            for k in range(8):
                a = 2 * math.pi * k / 8
                M_(f"p{tag}{k}", E((c[0] + math.cos(a) * r, c[1], c[2] + math.sin(a) * r), (r * 0.55, r * 0.2, r * 0.32), rot=(0, -math.degrees(a), 0)), "petal" if k % 2 else "petal2", outline=False)
            M_(f"fc{tag}", E(c, (r * 0.6, r * 0.3, r * 0.6)), "fc")
        for k, (x, z, r) in enumerate(((1.45, 0.36, 0.08), (-1.45, 0.36, 0.08), (0.75, 0.22, 0.07), (-0.7, 0.5, 0.065), (0.0, 0.92, 0.07))):
            flower((x * R, -R * 0.55 if abs(x) < 1 else -R * 0.3, H * z), r, k)
        M_("sunglow", E((0, -R * 0.78, H * 0.45), (0.11, 0.03, 0.11)), "warm", outline=False)   # a sunny glow at the centre
        for x in (1, -1):   # two flower eyes: a ring of tiny petals round each glowing eye
            ex, ez = x * R * 0.32, H * 0.78
            for k in range(6):
                a = 2 * math.pi * k / 6
                M_(f"ep{x}{k}", E((ex + math.cos(a) * 0.065, -R * 0.5, ez + math.sin(a) * 0.075), (0.03, 0.015, 0.03)), "petal", outline=False)
        eyes(H * 0.78, R * 0.32, -R * 0.52, s=0.8)
    elif gid == "storm-herald":   # Quiet Thunderhead: one round puffy cloud, a patch of blue sky and a star, soft sparks
        H = 1.1; zc = H * 0.5
        for k, (x, z, r) in enumerate(((0, 0, 1.0), (-0.85, -0.15, 0.62), (0.85, -0.12, 0.65), (-0.45, 0.45, 0.6), (0.45, 0.48, 0.58), (0, -0.45, 0.7))):
            M_(f"puff{k}", E((x * R, R * 0.1, zc + z * R), (R * 0.75 * r, R * 0.7 * r, R * 0.68 * r)), "cloud" if k % 2 == 0 else "cloud2", rim=True)
        M_("sky", E((R * 0.62, -R * 0.55, zc + R * 0.02), (R * 0.3, R * 0.06, R * 0.34), rot=(0, -20, 15)), "sky", outline=False)   # off to one side, so it never reads as a mouth
        star((R * 0.64, -R * 0.62, zc + R * 0.04), 0.06)
        eyes(zc + R * 0.18, R * 0.24, -R * 0.68, s=0.8)
        for k, (x, z) in enumerate(((-1.45, 0.1), (1.45, 0.2), (-1.05, -0.6), (1.1, -0.55))):   # small crackles on the edges
            M_(f"spark{k}", tube((x * R, -R * 0.2, zc + z * R), (x * R * 1.12, -R * 0.2, zc + z * R - 0.06), 0.018, 0.012, segs=6), "spark", outline=False)
        M_("shadow", E((0, 0, 0.01), (R * 0.7, R * 0.5, 0.01)), "lcloud", outline=False)   # it floats: a soft ground shadow
    else:                         # Cloud Lantern: a tall swirling storm cloud shaped like a lantern, gold light through cracks
        H = 1.3
        M_("base", tube((0, 0, 0.0), (0, 0, 0.12), R * 0.95, R * 0.85, segs=24), "lcloud", rim=True)
        M_("body", E((0, 0, H * 0.48), (R * 0.95, R * 0.9, H * 0.36)), "lcloud", rim=True)
        M_("cap", tube((0, 0, H * 0.8), (0, 0, H * 0.9), R * 0.75, R * 0.45, segs=24), "lcloud", rim=True)
        M_("knob", E((0, 0, H * 0.93), (R * 0.22, R * 0.22, R * 0.14)), "lcloud2", rim=True)
        for k in range(9):   # swirl puffs spiralling round the lantern (sides and back; the front cracks stay clear)
            a = -math.pi * 0.15 + 1.3 * math.pi * k / 8
            M_(f"swirl{k}", E((math.cos(a) * R * 0.98, math.sin(a) * R * 0.85, H * (0.2 + 0.065 * k)), (R * 0.3, R * 0.26, R * 0.22)), "lcloud2")
        M_("core", E((0, -R * 0.8, H * 0.44), (R * 0.42, R * 0.14, H * 0.2)), "warm", outline=False)   # the light inside
        for k, ((x0, z0), (x1, z1)) in enumerate((((-0.25, 0.3), (-0.12, 0.62)), ((0.22, 0.28), (0.1, 0.66)), ((-0.05, 0.2), (0.05, 0.36)))):
            M_(f"crack{k}", tube((x0 * R * 2, -R * 0.9, H * z0), (x1 * R * 2, -R * 0.9, H * z1), 0.03, 0.025, segs=8), "warm", outline=False)
        hl = hull_material("LIGHTRIM", L["glow"]); add_hull(bpy.data.objects["core"], sc.collection, hl, 0.06).parent = root
        for x in (1, -1):   # two small light-eyes, no face
            M_(f"le{x}", E((x * R * 0.25, -R * 0.86, H * 0.76), (R * 0.1, R * 0.05, R * 0.13)), "gold")
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
if A.form2:   # second-form stills: <id>_f2_S.png / _SE.png
    for gid in A.ids.split(","):
        sc, root = build_form2(gid)
        for d, yaw in (("S", 0), ("SE", 45)):
            render(sc, root, os.path.join(A.out, f"{gid}_f2_{d}.png"), yaw)
        print("RENDERED", gid, "form2", flush=True)
    sys.exit(0)
for gid in A.ids.split(","):
    for ph in (1, 2, 3):
        sc, root = build(gid, ph)
        for d, yaw in (("S", 0), ("SE", 45)):
            render(sc, root, os.path.join(A.out, f"{gid}_p{ph}_{d}.png"), yaw)
        print("RENDERED", gid, ph, flush=True)
