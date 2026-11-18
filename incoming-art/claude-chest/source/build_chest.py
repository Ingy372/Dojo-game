"""
Dojo Ascent - Treasure chest v2 (Claude Code, Nov 18, 2026; Jay: "the chest needs to feel special").

Same helpers, camera and outlines as the Art Director bot's Tower kit (tower-rooms/source/build_tower.py), so it
matches the rest of the art. Same three targets, frames, layers and key frames as the old chest, so the game's
code keeps working: chest-closed (1-12 loop), chest-open (13-42 once), chest-opened (43-54 loop).

New look: a chunkier cartoon chest with a domed lid, red-brown planks, thick gold trim and corner caps, rivets,
a big blue jewel lock and a gold star on the lid. Opening: it bounces and shakes harder and harder while light
leaks out, the lid bursts wide, a beam of light shoots up and gold coins and stars fly out.

    blender -b -P incoming-art/claude-chest/source/build_chest.py -- --out incoming-art/claude-chest/source/chest.blend
    blender -b incoming-art/claude-chest/source/chest.blend -P incoming-art/tools/render_static.py -- --out incoming-art/claude-chest/sprites
"""
import bpy, bmesh, math, sys, os, argparse, json, random
from mathutils import Vector, Matrix, Euler
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "tools"))
from toon_kit import srgb, toon_material, outline_material, add_hull, ellipsoid, tube, box, OUTLINE_W

argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
ap = argparse.ArgumentParser(); ap.add_argument("--out", required=True); A = ap.parse_args(argv)
bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene; scene.name = "Tower"
K = 1 / math.sin(math.radians(35)); COS = math.cos(math.radians(35))
def grid(c, r, z=0.0): return Vector((c, -r * K, z))
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
def put(name, bm, color, lay, outline=True, flat=False, smooth=False, parent=None):
    me = bpy.data.meshes.new(name)
    for f in bm.faces: f.smooth = smooth
    bm.to_mesh(me); bm.free(); me.materials.append(M(color, flat) if isinstance(color, str) else color)
    ob = bpy.data.objects.new(name, me); layer(lay).objects.link(ob)
    obs = [ob]
    if outline: obs.append(add_hull(ob, layer(lay), OUTLINE, OUTLINE_W))
    if parent is not None:
        bpy.context.view_layer.update()
        for o in obs: o.parent = parent; o.matrix_parent_inverse = parent.matrix_world.inverted()
    return ob
def gbox(lay, name, c0, r0, c1, r1, z0, z1, color, outline=True, bevel=0.0, flat=False, parent=None):
    a, b = grid(c0, r1, z0), grid(c1, r0, z1)
    return put(name, box((a + b) / 2, Vector((abs(b.x - a.x), abs(b.y - a.y), abs(b.z - a.z))), bevel=bevel), color, lay, outline, flat, parent=parent)
def obox(lay, name, c, size, color, rot=(0, 0, 0), outline=True, bevel=0.0, parent=None, flat=False):
    return put(name, box(c, size, rot=rot, bevel=bevel), color, lay, outline, flat=flat, parent=parent)
def otube(lay, name, p0, p1, r0, r1, color, segs=12, outline=True, sx=1, sy=1, parent=None, flat=False):
    return put(name, tube(p0, p1, r0, r1, segs=segs, sx=sx, sy=sy), color, lay, outline, flat=flat, smooth=True, parent=parent)
def oell(lay, name, c, s, color, rot=(0, 0, 0), outline=True, flat=False, segs=14, rings=8, parent=None):
    return put(name, ellipsoid(c, s, rot=rot, segs=segs, rings=rings), color, lay, outline, flat, smooth=True, parent=parent)
def empty(name, loc):
    e = bpy.data.objects.new(name, None); scene.collection.objects.link(e); e.location = loc; return e
TARGETS = []
def target(name, layers, rect, top, anchor="bottom-center", **kw):
    TARGETS.append(dict(name=name, layers=layers, rect=rect, top=top, anchor=anchor, **{k: v for k, v in kw.items() if v is not None}))
random.seed(3)

random.seed(3)

def glow_mat(name, hex_color, alpha):
    """See-through light (for the beam): emission mixed with transparency."""
    m = bpy.data.materials.new(name); m.use_nodes = True; nt = m.node_tree; nt.nodes.clear()
    em = nt.nodes.new("ShaderNodeEmission"); em.inputs["Color"].default_value = srgb(hex_color)
    tr = nt.nodes.new("ShaderNodeBsdfTransparent"); mx = nt.nodes.new("ShaderNodeMixShader"); mx.inputs["Fac"].default_value = alpha
    out = nt.nodes.new("ShaderNodeOutputMaterial")
    nt.links.new(tr.outputs[0], mx.inputs[1]); nt.links.new(em.outputs[0], mx.inputs[2]); nt.links.new(mx.outputs[0], out.inputs["Surface"])
    m.blend_method = "BLEND"; return m

def star_bm(r, inner=0.42):
    bm = bmesh.new()
    pts = [Vector((math.cos(a) * (r if i % 2 == 0 else r * inner), 0, math.sin(a) * (r if i % 2 == 0 else r * inner)))
           for i, a in enumerate([math.pi / 2 + i * math.pi / 5 for i in range(10)])]
    vs = [bm.verts.new(p) for p in pts]; bm.faces.new(vs)
    bmesh.ops.solidify(bm, geom=bm.faces[:], thickness=0.01)
    return bm

def kf(o, f, loc=None, rot=None, sc=None):
    if loc is not None: o.location = loc; o.keyframe_insert("location", frame=f)
    if rot is not None: o.rotation_euler = [math.radians(v) for v in rot]; o.keyframe_insert("rotation_euler", frame=f)
    if sc is not None:
        o.scale = sc if isinstance(sc, (tuple, list)) else (max(sc, 1e-4),) * 3; o.keyframe_insert("scale", frame=f)


WOOD = "#a3502f"; WOOD_D = "#7e3a22"; WOOD_L = "#b9613a"; GOLD = "#f2b632"; GOLD_L = "#ffd862"; GEM = "#3fa4ff"; GEM_L = "#bfe6ff"

def coin_bm(r):
    bm = bmesh.new()
    bmesh.ops.create_cone(bm, cap_ends=True, segments=14, radius1=r, radius2=r, depth=r * 0.32)
    bmesh.ops.rotate(bm, verts=bm.verts, cent=(0, 0, 0), matrix=Matrix.Rotation(math.radians(90), 3, "X"))
    return bm

def chest():
    L, G, X = "chest", "chest-glow", "chest-fx"; c = grid(0.5, 0.6)
    root = empty("chest_root", c)
    def par(o, p):
        bpy.context.view_layer.update(); o.parent = p; o.matrix_parent_inverse = p.matrix_world.inverted()
    W, D, H = 0.74, 0.48, 0.34          # body width, depth, height
    z0 = 0.02
    # body: planks with a darker base
    obox(L, "chest_base", c + Vector((0, 0, z0 + 0.03)), (W + 0.04, D + 0.04, 0.06), WOOD_D, bevel=0.015, parent=root)
    obox(L, "chest_body", c + Vector((0, 0, z0 + H / 2 + 0.02)), (W, D, H), WOOD, bevel=0.03, parent=root)
    for k, x in enumerate((-0.15, 0.15)):
        obox(L, f"chest_plank{k}", c + Vector((x, -D / 2 - 0.004, z0 + H / 2 + 0.02)), (0.012, 0.01, H - 0.06), WOOD_D, outline=False, parent=root)
    # thick gold trim: top rim, low rim, bands with rivets, and corner caps
    obox(L, "chest_rimtop", c + Vector((0, 0, z0 + H + 0.01)), (W + 0.03, D + 0.03, 0.05), GOLD, bevel=0.01, parent=root)
    obox(L, "chest_rimlow", c + Vector((0, 0, z0 + 0.08)), (W + 0.025, D + 0.025, 0.035), GOLD, bevel=0.01, outline=False, parent=root)
    for x in (-0.27, 0.27):
        obox(L, f"chest_band{x}", c + Vector((x, 0, z0 + H / 2 + 0.03)), (0.07, D + 0.03, H + 0.01), GOLD, bevel=0.01, outline=False, parent=root)
        for z in (z0 + 0.12, z0 + H - 0.06):
            oell(L, f"chest_rivet{x}{z}", c + Vector((x, -D / 2 - 0.02, z)), (0.018, 0.012, 0.018), GOLD_L, outline=False, parent=root)
    for sx in (-1, 1):
        for sy in (-1, 1):
            obox(L, f"chest_corner{sx}{sy}", c + Vector((sx * (W / 2 + 0.005), sy * (D / 2 + 0.005), z0 + H / 2 + 0.03)), (0.06, 0.06, H + 0.03), GOLD_L, bevel=0.012, parent=root)
    # the lock: a gold plate with a big blue jewel
    obox(L, "chest_lockplate", c + Vector((0, -D / 2 - 0.02, z0 + H - 0.04)), (0.17, 0.03, 0.19), GOLD, bevel=0.02, parent=root)
    oell(L, "chest_gem", c + Vector((0, -D / 2 - 0.045, z0 + H - 0.03)), (0.055, 0.03, 0.065), GEM, parent=root)
    oell(L, "chest_gemshine", c + Vector((-0.016, -D / 2 - 0.072, z0 + H - 0.005)), (0.015, 0.008, 0.02), GEM_L, outline=False, flat=True, parent=root)
    # the domed lid on its hinge, with gold bands, gold end caps and a gold star on top
    zl = z0 + H + 0.03
    hinge = empty("chest_hinge", c + Vector((0, D / 2, zl))); par(hinge, root)
    put("chest_lid", tube(c + Vector((-W / 2, 0, zl)), c + Vector((W / 2, 0, zl)), D / 2, D / 2, segs=20, sy=0.62), WOOD_L, L, smooth=True, parent=hinge)
    for x in (-0.27, 0.27):
        put(f"chest_lidband{x}", tube(c + Vector((x - 0.035, 0, zl)), c + Vector((x + 0.035, 0, zl)), D / 2 + 0.012, D / 2 + 0.012, segs=20, sy=0.62),
            GOLD, L, outline=False, smooth=True, parent=hinge)
    for x in (-W / 2 - 0.01, W / 2 + 0.01):
        put(f"chest_lidcap{x}", tube(c + Vector((x - 0.02, 0, zl)), c + Vector((x + 0.02, 0, zl)), D / 2 + 0.015, D / 2 + 0.015, segs=20, sy=0.62),
            GOLD_L, L, smooth=True, parent=hinge)
    starpiv = empty("chest_lidstarpiv", c + Vector((0, -0.05, zl + D * 0.3))); par(starpiv, hinge)
    put("chest_lidstar", star_bm(0.09, 0.45), GOLD_L, L, parent=starpiv)
    # glow layer: light in the seam, the light inside, glints on the band and the jewel
    seam = empty("chest_seam", c + Vector((0, -0.12, zl))); par(seam, root)
    obox(G, "chest_seamlight", c + Vector((0, -D / 2 - 0.01, zl + 0.003)), (W, 0.014, 0.03), M("#fff3c4", True), outline=False, parent=seam)
    inside = empty("chest_inside", c + Vector((0, 0, zl + 0.01))); par(inside, root)
    oell(G, "chest_light", c + Vector((0, 0, zl + 0.01)), (0.33, 0.2, 0.12), M("#fff6c8", True), outline=False, parent=inside)
    oell(G, "chest_aura", c + Vector((0, 0, zl + 0.03)), (0.4, 0.27, 0.05), M("#ffe48a", True), outline=False, parent=inside)
    glint = empty("chest_glint", c + Vector((-0.27, -0.27, 0.2))); par(glint, root)
    put("chest_glintstar", star_bm(0.075, 0.3), M("#fffbe8", True), G, outline=False, parent=glint)
    gemglint = empty("chest_gemglint", c + Vector((0, -D / 2 - 0.08, z0 + H))); par(gemglint, root)
    put("chest_gemglintstar", star_bm(0.05, 0.28), M("#ffffff", True), G, outline=False, parent=gemglint)
    # fx layer: the beam, 5 stars, 6 sparkles and 6 gold coins
    beam = empty("chest_beam", c + Vector((0, 0, zl)))
    otube(X, "chest_beamcore", c + Vector((0, 0, zl)), c + Vector((0, 0, 2.0)), 0.13, 0.04, glow_mat("BEAMCORE", "#fffdf0", 0.85), segs=16, outline=False, parent=beam)
    otube(X, "chest_beamedge", c + Vector((0, 0.02, zl)), c + Vector((0, 0.02, 2.0)), 0.3, 0.09, glow_mat("BEAMEDGE", "#ffeaa0", 0.5), segs=16, outline=False, parent=beam)
    stars, sparks, coins = [], [], []
    for k in range(5):
        e = empty(f"chest_starpiv{k}", c + Vector((0, -0.05, 0.45)))
        put(f"chest_star{k}", star_bm(0.13 if k % 2 else 0.1), GOLD_L, X, parent=e); stars.append(e)
    for k in range(6):
        e = empty(f"chest_sparkpiv{k}", c + Vector((0, -0.05, 0.45)))
        put(f"chest_spark{k}", star_bm(0.06, 0.28), M("#fffbe8", True), X, outline=False, parent=e); sparks.append(e)
    for k in range(6):
        e = empty(f"chest_coinpiv{k}", c + Vector((0, -0.05, 0.45)))
        put(f"chest_coin{k}", coin_bm(0.065), GOLD, X, parent=e); coins.append(e)
    for e in stars + sparks + coins + [glint, gemglint, starpiv]:
        for ch in e.children: ch.matrix_parent_inverse = Matrix.Identity(4)
    starpiv.rotation_euler = (math.radians(-50), 0, 0)
    CL = (-35, 0, 0)
    def lid(f, ang): kf(hinge, f, rot=(-ang, 0, 0))
    def hide_fx(f):
        for e in stars + sparks + coins: kf(e, f, sc=0, rot=CL)
    # --- closed idle 1-12: a gentle breathing bob, a glint down the band, the jewel twinkles
    for f in range(1, 13):
        b = math.sin(2 * math.pi * (f - 1) / 12)
        kf(root, f, loc=c + Vector((0, 0, 0.012 * (b + 1))), rot=(0, 0, 0), sc=(1 + 0.012 * b, 1 + 0.012 * b, 1 - 0.012 * b)); lid(f, 0)
        kf(seam, f, sc=0); kf(inside, f, sc=0); kf(beam, f, sc=0)
        t = (f - 3) / 5; on = 0 <= t <= 1
        kf(glint, f, loc=c + Vector((-0.27, -0.29, 0.36 - 0.28 * (t if on else 0))), rot=CL, sc=(math.sin(math.pi * t) * 1.4 if on else 0))
        g2 = (f - 8) / 4; on2 = 0 <= g2 <= 1
        kf(gemglint, f, loc=c + Vector((0.02, -D / 2 - 0.09, z0 + H + 0.01)), rot=CL, sc=(math.sin(math.pi * g2) * 1.3 if on2 else 0))
        hide_fx(f)
    # --- opening 13-42
    F0 = 13
    for i in range(30):
        f = F0 + i
        wig = 0.0; hop = 0.0; ang = 0.0; sq = (1, 1, 1)
        if i < 12:          # anticipation: bigger and bigger shakes and hops, the lid rattling, light leaking out
            g = (i + 1) / 12
            wig = 9 * g * math.sin(i * 2.3); hop = 0.07 * g * g * abs(math.sin(i * 1.9)); ang = 7 * g * abs(math.sin(i * 2.9))
            s = 0.06 * g * math.sin(i * 1.9)
            sq = (1 + s, 1 + s, 1 - s)
            kf(seam, f, sc=(1, 1, 0.4 + 2.2 * g)); kf(inside, f, sc=0); kf(beam, f, sc=0)
        else:
            j = i - 12
            ang = [75, 128, 122, 112, 108, 110][j] if j < 6 else 110
            sq = [(1.14, 1.14, 0.8), (0.9, 0.9, 1.14), (1.04, 1.04, 0.96), (0.99, 0.99, 1.01)][j] if j < 4 else (1, 1, 1)
            hop = [0.0, 0.09, 0.05, 0.0][j] if j < 4 else 0
            kf(seam, f, sc=0)
            pulse = 1 + 0.45 * math.exp(-((j - 4) / 3.0) ** 2)
            kf(inside, f, sc=min(1, (j + 1) / 2) * pulse)
            bw = [0.6, 1.15, 1.3, 1.2, 1.05, 0.95, 0.82, 0.7, 0.58, 0.46, 0.35, 0.25, 0.16, 0.08, 0.0, 0, 0, 0][j]
            bh = [0.5, 0.95, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 0.98, 0.95, 0.9, 0.85, 0.8, 0.8, 0.8, 0.8][j]
            kf(beam, f, sc=(max(bw, 1e-4), max(bw, 1e-4), max(bh, 1e-4)))
        kf(root, f, loc=c + Vector((0, 0, hop)), rot=(0, wig, 0), sc=sq); lid(f, ang)
        kf(glint, f, sc=0, rot=CL); kf(gemglint, f, sc=0, rot=CL)
        for k, e in enumerate(stars):
            j = i - 13 - k * 0.6
            if j < 0 or j > 14: kf(e, f, sc=0, rot=CL); continue
            u = j / 14; a = (k - 2) * 0.2
            kf(e, f, loc=c + Vector((a * (0.5 + 1.3 * u), -0.15, 0.6 + 1.6 * u - 0.45 * u * u)), rot=(-35, 0, 160 * u * (1 if k % 2 else -1)),
               sc=(1.0 - u ** 3) * min(1, j / 1.5))
        for k, e in enumerate(sparks):
            j = i - 14 - k
            if j < 0 or j > 10: kf(e, f, sc=0, rot=CL); continue
            u = j / 10; a = ((k * 37) % 11 - 5) / 5
            kf(e, f, loc=c + Vector((a * 0.4, -0.2, 0.55 + 1.1 * u)), rot=CL, sc=math.sin(math.pi * u) * (1.3 if k % 2 else 1.0))
        for k, e in enumerate(coins):     # coins pop out in an arc, flip, bounce on the floor and fade
            j = i - 12 - k * 0.8
            if j < 0 or j > 16: kf(e, f, sc=0, rot=CL); continue
            u = j / 11; side = (-1 if k % 2 else 1) * (0.25 + 0.12 * (k // 2))
            if u <= 1:
                x = side * u * 2.3; z = 0.55 + 1.9 * u - 2.2 * u * u
            else:
                v = (j - 11) / 5; x = side * (2.3 + 0.2 * v); z = max(0.03, 0.25 * math.sin(math.pi * v) * (1 - v))
            kf(e, f, loc=c + Vector((x, -0.28 - 0.1 * (k % 3), max(0.03, z))), rot=(-35, 0, 360 * u * (1 if k % 2 else -1)), sc=(1.0 if j < 14 else max(1e-4, (16 - j) / 2)))
    # --- open idle 43-54: breathing glow and twinkles
    for i in range(12):
        f = 43 + i; ph = 2 * math.pi * i / 12
        kf(root, f, loc=c, rot=(0, 0, 0), sc=(1, 1, 1)); lid(f, 110); kf(seam, f, sc=0); kf(beam, f, sc=0)
        kf(inside, f, sc=1.0 + 0.1 * math.sin(ph)); kf(glint, f, sc=0, rot=CL); kf(gemglint, f, sc=0, rot=CL)
        for e in stars + coins: kf(e, f, sc=0, rot=CL)
        for k, e in enumerate(sparks):
            if k < 4:
                u = ((i + 3 * k) % 12) / 12
                kf(e, f, loc=c + Vector(((k - 1.5) * 0.16, -0.15, 0.55 + 0.4 * u)), rot=CL, sc=max(1e-4, math.sin(math.pi * u)))
            else: kf(e, f, sc=0, rot=CL)
    for o in bpy.data.objects:
        if o.animation_data and o.animation_data.action and o.name.startswith("chest_"):
            act = o.animation_data.action
            curves = getattr(act, "fcurves", None)
            if curves is None:   # Blender 5: f-curves live in action layers / strips / channel bags
                curves = [fc for lay in act.layers for st in lay.strips for cb in st.channelbags for fc in cb.fcurves]
            for fc in curves:
                for kp in fc.keyframe_points: kp.interpolation = "LINEAR"
    common = dict(group="chest", anchor=[0.5, 1])
    lays = [L, G, X]
    target("chest-closed", lays, [-0.45, 0, 1.45, 1.35], 0.9, frames=[1, 12], fps=12, loop=True,
           note="v2 closed chest idle loop (1 s at 12 fps): a gentle bob, a glint down a gold band, the jewel twinkles. Layers: chest, chest-glow, chest-fx", **common)
    target("chest-open", lays, [-0.9, 0, 1.9, 1.35], 2.4, frames=[13, 42], fps=12,
           keyFrames={"anticipation": "0-11", "lidBurst": 12, "beamPeak": 14, "starsRise": "13-29", "coinsFly": "12-28", "glowPulse": 16, "settled": 29},
           note="v2 opening, once (2.5 s at 12 fps), then chest-opened. 0-11 bigger and bigger shakes and hops with light leaking out, 12 the lid bursts open: beam, stars, sparkles and gold coins fly out", **common)
    target("chest-opened", lays, [-0.9, 0, 1.9, 1.35], 2.4, frames=[43, 54], fps=12, loop=True,
           note="v2 open chest idle loop (1 s at 12 fps): breathing glow and twinkles. Same size and anchor as chest-open", **common)
chest()

scene.frame_set(1)
scene["static_targets"] = json.dumps(TARGETS)
bpy.ops.wm.save_as_mainfile(filepath=os.path.abspath(A.out))
print("saved", A.out, len(TARGETS), "targets")
