"""
Dojo Ascent — J16 Ember Knight shifted form, three DRAFT alternatives.

Reuses the Ember Knight from incoming-art/guardian-concepts/source/build_guardian_concepts.py
(height 1.4, helm, round shoulders, round shield, blunt bar, oval eyes) and the house toon kit
and camera (incoming-art/tools/toon_kit.py; 35° orthographic, ortho 2.6).

The phase-3 mesh is rebuilt first. Three alternatives then change the cooled shield.
They are three shield designs, not three angles of one design.
No new name, no new attack, no new timing.

    blender -b -P incoming-art/ember-knight-shift-drafts/source/build_ember_shift.py -- --out DIR
"""
import argparse, math, os, sys
import bpy, bmesh
from mathutils import Vector, Euler

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "..", "tools"))
from toon_kit import toon_material, outline_material, hull_material, add_hull, ellipsoid, tube, OUTLINE_W

argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
ap = argparse.ArgumentParser()
ap.add_argument("--out", required=True)
ap.add_argument("--kinds", default="before,a,b,c")
ap.add_argument("--samples", type=int, default=24)
ap.add_argument("--size", type=int, default=512)
ap.add_argument("--ortho", type=float, default=2.6)
A = ap.parse_args(argv)

# Cooled palette — hexes copied from the J16 brief (PR #449).
COPPER = "#c9824a"
HONEY = "#f2c46a"
FACE = "#ffd08a"
RIM = "#ffa560"
CENTER = "#fff1b8"
EYE = "#ffe2c0"
WHITE = "#ffffff"
HALO = "#ffecaa"
# Phase-3 colours from build_guardian_concepts.py. Not used on the new forms.
P3_BODY, P3_HELM, P3_ACCENT = "#80564a", "#a26d58", "#e8772e"
P3_VISOR, P3_WISP = "#120e2a", "#4a4478"

H, W = 1.4, 0.85
R = W / 2
HELM_TOP = H * 0.83 + H * 0.18
SHOULDER_Z = H * 0.66

def clear():
    bpy.ops.wm.read_factory_settings(use_empty=True)

def ring_xz(center, rx, rz, minor, segs=36, sides=8):
    """Solid oval ring in the XZ plane, facing the student (-Y)."""
    bm = bmesh.new()
    rings = []
    for i in range(segs):
        a = 2 * math.pi * i / segs
        cx = math.cos(a) * rx
        cz = math.sin(a) * rz
        # radial direction in XZ, used so the tube stays even on an oval
        rxd, rzd = math.cos(a), math.sin(a)
        row = []
        for j in range(sides):
            b = 2 * math.pi * j / sides
            x = center[0] + cx + rxd * math.cos(b) * minor
            z = center[2] + cz + rzd * math.cos(b) * minor
            y = center[1] + math.sin(b) * minor
            row.append(bm.verts.new((x, y, z)))
        rings.append(row)
    for i in range(segs):
        cur, nxt = rings[i], rings[(i + 1) % segs]
        for j in range(sides):
            bm.faces.new((cur[j], cur[(j + 1) % sides], nxt[(j + 1) % sides], nxt[j]))
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces[:])
    return bm

def build(kind):
    clear()
    sc = bpy.context.scene
    root = bpy.data.objects.new("ROOT", None)
    sc.collection.objects.link(root)
    sc["dojo_label"] = "Ember Knight — shifted form" if kind != "before" else "Ember Knight phase 3 (rebuilt)"
    sc["dojo_placeholder_name"] = "Warm Shield" if kind != "before" else ""
    sc["dojo_kind"] = kind
    OUT = outline_material()
    HALO_MAT = hull_material("SHIELDHALO", HALO)
    mats = {}

    def mat(key, hex_color, shadow=0.66, highlight=1.10):
        if key not in mats:
            mats[key] = toon_material(key, hex_color, shadow, highlight)
        return mats[key]

    def put(name, bm, material, outline=True, halo=False):
        me = bpy.data.meshes.new(name)
        for f in bm.faces:
            f.smooth = True
        bm.to_mesh(me)
        bm.free()
        me.materials.append(material)
        ob = bpy.data.objects.new(name, me)
        sc.collection.objects.link(ob)
        ob.parent = root
        if outline:
            add_hull(ob, sc.collection, OUT, OUTLINE_W * 2).parent = root
        if halo:
            add_hull(ob, sc.collection, HALO_MAT, 0.045).parent = root
        return ob

    E = ellipsoid

    def eyes(z, dx, y, s=0.75):
        for x in (1, -1):
            put(f"eye{x}", E((x * R * dx * 2, y, z), (R * 0.17 * s, R * 0.07, R * 0.24 * s)),
                mat("eye", EYE, 1, 1), outline=False)
            put(f"hi{x}", E((x * R * dx * 2 - R * 0.05, y - R * 0.06, z + R * 0.06 * s),
                            (R * 0.05 * s, R * 0.03, R * 0.06 * s)),
                mat("hi", WHITE, 1, 1), outline=False)

    def disc(name, center, radius, thick, material, outline=True, halo=False):
        x, y, z = center
        return put(name, tube((x, y + thick * 0.5, z), (x, y - thick * 0.5, z), radius, radius, segs=32),
                   material, outline=outline, halo=halo)

    if kind == "before":
        # Same mesh as build_guardian_concepts.py, ember-knight phase 3.
        put("bodyk", E((0, 0, H * 0.45), (R * 0.95, R * 0.8, H * 0.42), segs=24, rings=14),
            mat("body", P3_BODY), outline=True)
        put("helm", E((0, 0, H * 0.83), (R * 0.6, R * 0.58, H * 0.18)), mat("belly", P3_HELM), outline=True)
        put("visor", E((0, -R * 0.52, H * 0.82), (R * 0.45, R * 0.08, H * 0.08)),
            mat("dark", P3_VISOR, 1, 1), outline=False)
        eyes(H * 0.82, 0.14, -R * 0.6, s=0.75)
        for s in (1, -1):
            put(f"pauld{s}", E((s * R * 0.85, 0, H * 0.66), (R * 0.32, R * 0.32, R * 0.22)),
                mat("accent", P3_ACCENT, 0.8, 1.12), outline=True)
        put("shield", tube((-R * 1.15, -R * 0.5, H * 0.45), (-R * 1.15, -R * 0.62, H * 0.45), R * 0.5, R * 0.5, segs=24),
            mat("accent", P3_ACCENT, 0.8, 1.12), outline=True)
        put("boss", E((-R * 1.15, -R * 0.66, H * 0.45), (R * 0.15, R * 0.06, R * 0.15)),
            mat("warm", CENTER, 1, 1), outline=False)
        put("bar", tube((R * 1.15, -R * 0.4, H * 0.3), (R * 1.15, -R * 0.4, H * 0.75), 0.04, 0.04, segs=10),
            mat("accent2", P3_ACCENT, 0.8, 1.12), outline=True)
        put("barend", E((R * 1.15, -R * 0.4, H * 0.76), (0.06, 0.06, 0.06)),
            mat("warm2", CENTER, 1, 1), outline=False)
        for s in (1, -1):
            put(f"arm{s}", E((s * R * 1.1, -R * 0.1, H * 0.5), (0.09 * 1.2, 0.09 * 1.2, 0.17 * 1.2), rot=(0, s * 20, 0)),
                mat("body2", P3_BODY), outline=True)
        for k in range(2):
            a = 2 * math.pi * (k + 0.5) / 2 + 0.3
            put(f"wisp{k}", E((math.cos(a) * R * 1.05, math.sin(a) * R * 1.05 * 0.8,
                               0.05 + (H * 0.35 - 0.05) * ((k * 37) % 10) / 10),
                              (R * 0.32, R * 0.28, R * 0.24), rot=(0, 0, math.degrees(a))),
                mat("wisp", P3_WISP, 0.85, 1.0), outline=True)
        body = bpy.data.objects["bodyk"]
        add_hull(body, sc.collection, hull_material("RIM", RIM), OUTLINE_W * 2 + 0.036).parent = root
    else:
        plate = mat("copper", COPPER)
        honey = mat("honey", HONEY, 0.9, 1.06)
        face = mat("face", FACE, 1, 1)
        rim_flat = mat("rimflat", RIM, 1, 1)
        rim_metal = mat("rimmetal", RIM, 0.82, 1.08)
        center = mat("center", CENTER, 1, 1)
        put("bodyk", E((0, 0, H * 0.45), (R * 0.95, R * 0.8, H * 0.42), segs=24, rings=14), plate, outline=True)
        put("helm", E((0, 0, H * 0.83), (R * 0.6, R * 0.58, H * 0.18)), plate, outline=True)
        for s in (1, -1):
            put(f"pauld{s}", E((s * R * 0.85, 0, H * 0.66), (R * 0.32, R * 0.32, R * 0.22)), plate, outline=True)
            put(f"pring{s}", ring_xz((s * R * 0.85, -R * 0.26, H * 0.66), R * 0.30, R * 0.20, 0.016),
                honey, outline=False)
        eyes(H * 0.82, 0.14, -R * 0.6, s=0.75)
        # Black visor is gone. One thin honey ring frames both eyes and stays on the helm.
        put("eyeframe", ring_xz((0, -R * 0.72, H * 0.82), 0.24, 0.105, 0.013), honey, outline=False)

        def hold_shield(center):
            x, y, z = center
            put("armshield", tube((-R * 0.72, -R * 0.12, H * 0.58), (x + 0.02, y + 0.1, z - 0.02), 0.055, 0.042, segs=10),
                plate, outline=True)

        def hold_bar(top, bot, ball_r):
            put("bar", tube(top, bot, 0.036, 0.032, segs=10), plate, outline=True)
            put("barend", E(bot, (ball_r, ball_r, ball_r)), honey, outline=False)
            put("armbar", tube((R * 0.72, -R * 0.08, H * 0.52), top, 0.048, 0.038, segs=10), plate, outline=True)

        # Same pose family: shield at the chest, face toward the student, bar down.
        # The bright shape on the shield is what changes.
        if kind == "a":
            # The whole shield face is the glow. Big, so it reads on a phone.
            c = (-R * 0.35, -R * 1.08, H * 0.50)
            disc("srim", (c[0], c[1] + 0.02, c[2]), 0.40, 0.05, rim_flat, outline=True, halo=True)
            disc("shield", (c[0], c[1] - 0.025, c[2]), 0.33, 0.05, face, outline=False, halo=True)
            put("boss", E((c[0], c[1] - 0.065, c[2]), (0.07, 0.03, 0.07)), center, outline=False)
            put("seam", tube((R * 0.15, -R * 0.84, H * 0.28), (R * 0.15, -R * 0.84, H * 0.62), 0.022, 0.022, segs=8),
                honey, outline=False)
            hold_shield(c)
            hold_bar((R * 1.02, -R * 0.40, H * 0.50), (R * 1.02, -R * 0.48, H * 0.12), 0.05)
        elif kind == "b":
            # Copper shield. Only a bigger center boss glows: a coal you could hold.
            c = (-R * 0.55, -R * 0.98, H * 0.46)
            disc("srim", (c[0], c[1] + 0.02, c[2]), 0.28, 0.045, rim_metal, outline=True, halo=False)
            disc("shield", (c[0], c[1] - 0.015, c[2]), 0.22, 0.05, plate, outline=True, halo=False)
            put("coal", E((c[0], c[1] - 0.055, c[2]), (0.13, 0.045, 0.13)), face, outline=False, halo=True)
            put("boss", E((c[0], c[1] - 0.08, c[2]), (0.07, 0.03, 0.07)), center, outline=False, halo=True)
            for i, z0 in enumerate((0.30, 0.42, 0.54)):
                put(f"stitch{i}", tube((R * 0.22, -R * 0.86, H * z0), (R * 0.22, -R * 0.86, H * z0 + 0.07), 0.018, 0.018, segs=8),
                    honey, outline=False)
            hold_shield(c)
            hold_bar((R * 0.90, -R * 0.16, H * 0.38), (R * 0.94, -R * 0.26, H * 0.14), 0.04)
        else:
            # Round hearth door: copper face, two glowing straps, warm center.
            c = (-R * 0.42, -R * 1.02, H * 0.48)
            disc("srim", (c[0], c[1] + 0.02, c[2]), 0.34, 0.045, rim_metal, outline=True, halo=False)
            disc("shield", (c[0], c[1] - 0.015, c[2]), 0.27, 0.05, plate, outline=True, halo=False)
            for i, dz in enumerate((0.08, -0.08)):
                put(f"strap{i}", tube((c[0] - 0.18, c[1] - 0.05, c[2] + dz), (c[0] + 0.18, c[1] - 0.05, c[2] + dz),
                                      0.028, 0.028, segs=8), face, outline=False, halo=True)
            put("boss", E((c[0], c[1] - 0.075, c[2]), (0.08, 0.035, 0.08)), center, outline=False, halo=True)
            put("waist", tube((-R * 0.15, -R * 0.70, H * 0.30), (R * 0.78, -R * 0.55, H * 0.30), 0.026, 0.026, segs=8),
                honey, outline=False)
            hold_shield(c)
            hold_bar((R * 0.98, -R * 0.28, H * 0.46), (R * 1.00, -R * 0.36, H * 0.12), 0.045)

    top = -1.0
    for ob in sc.objects:
        if ob.type != "MESH" or "outline" in ob.name:
            continue
        for v in ob.bound_box:
            top = max(top, (ob.matrix_world @ Vector(v)).z)
    print(f"KIND {kind} mesh-top {top:.3f} helm-top {HELM_TOP:.3f}", flush=True)
    if kind != "before" and top > HELM_TOP + 0.04:
        raise SystemExit(f"{kind} sticks above the helm ({top:.3f} > {HELM_TOP:.3f})")
    return sc, root

def render(sc, root, path, yaw):
    r = sc.render
    r.engine = "CYCLES"
    sc.cycles.device = "CPU"
    sc.cycles.samples = A.samples
    sc.cycles.use_denoising = False
    sc.cycles.max_bounces = 0
    sc.cycles.transparent_max_bounces = 16
    r.film_transparent = True
    r.resolution_x = r.resolution_y = A.size
    sc.view_settings.view_transform = "Standard"
    sc.world = bpy.data.worlds.new("W")
    sc.world.use_nodes = False
    sc.world.color = (0, 0, 0)
    if not sc.camera:
        cd = bpy.data.cameras.new("C")
        cd.type = "ORTHO"
        cd.ortho_scale = A.ortho
        cd.sensor_fit = "HORIZONTAL"
        cam = bpy.data.objects.new("C", cd)
        sc.collection.objects.link(cam)
        rx = math.radians(55)  # 35° down from horizontal
        cam.rotation_euler = Euler((rx, 0, 0))
        fwd = Euler((rx, 0, 0)).to_matrix() @ Vector((0, 0, -1))
        up = Euler((rx, 0, 0)).to_matrix() @ Vector((0, 1, 0))
        zt = (0.85 - 0.5) * A.ortho / up.z
        cam.location = Vector((0, 0, zt)) - fwd * 20
        sc.camera = cam
    root.rotation_euler = Euler((0, 0, math.radians(yaw)))
    r.filepath = path
    bpy.ops.render.render(write_still=True)

def main():
    os.makedirs(A.out, exist_ok=True)
    names = {
        "before": "ember-knight-phase3",
        "a": "ember-knight-shift-a",
        "b": "ember-knight-shift-b",
        "c": "ember-knight-shift-c",
    }
    for kind in [k.strip() for k in A.kinds.split(",") if k.strip()]:
        sc, root = build(kind)
        tag = "rebuilt-p3" if kind == "before" else f"shift-{kind}"
        for d, yaw in (("S", 0), ("SE", 45)):
            render(sc, root, os.path.join(A.out, f"ember-knight-{tag}_{d}.png"), yaw)
        root.rotation_euler = Euler((0, 0, 0))
        bpy.ops.wm.save_as_mainfile(filepath=os.path.abspath(os.path.join(HERE, names[kind] + ".blend")))
        print("RENDERED", kind, flush=True)

if __name__ == "__main__":
    main()
