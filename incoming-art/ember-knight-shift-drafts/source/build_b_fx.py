"""
Dojo Ascent — draft B effect layers only (review, not a game export).

The knight mesh is not rebuilt here. These layers sit on the shield core of
ember-knight-shift-b, using the same camera as build_ember_shift.py
(35° orthographic, 2.6 tiles, 512 px), so they composite onto that still.

    blender -b -P incoming-art/ember-knight-shift-drafts/source/build_b_fx.py -- \
        --out incoming-art/ember-knight-shift-drafts/layers

Writes transparent PNGs:
    fx-core.png   shield-centre glow (#fff1b8 / #ffd08a)
    fx-rim.png    soft rim light from that same core (#ffecaa)
    fx-steam-00.png … fx-steam-05.png   gentle cooling steam rising from the core

No sparks, no flame shape, no circle on the floor. Steam positions are fixed
for each frame (no random embers). The idle pulse and the Reduced Motion
still are made in make_b_vfx_review.py from these layers.
"""
import argparse, math, os, sys
import bpy
from mathutils import Vector, Euler

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "..", "tools"))
from toon_kit import toon_material, ellipsoid, tube

argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
ap = argparse.ArgumentParser()
ap.add_argument("--out", required=True)
ap.add_argument("--samples", type=int, default=12)
ap.add_argument("--size", type=int, default=512)
ap.add_argument("--ortho", type=float, default=2.6)
A = ap.parse_args(argv)

H, W = 1.4, 0.85
R = W / 2
# Shield core on draft B (build_ember_shift.py). Light starts here, not on the floor.
C = (-R * 0.55, -R * 0.98, H * 0.46)
CORE = (C[0], C[1] - 0.07, C[2])
FACE, CENTER, HALO = "#ffd08a", "#fff1b8", "#ffecaa"
# Pale steam. Honey and the shield centre, not the hot orange of the old form.
STEAM = ("#fff1b8", "#f2c46a", "#fff4cf")

def clear():
    bpy.ops.wm.read_factory_settings(use_empty=True)

def setup_camera(sc):
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
    cd = bpy.data.cameras.new("C")
    cd.type = "ORTHO"
    cd.ortho_scale = A.ortho
    cd.sensor_fit = "HORIZONTAL"
    cam = bpy.data.objects.new("C", cd)
    sc.collection.objects.link(cam)
    rx = math.radians(55)
    cam.rotation_euler = Euler((rx, 0, 0))
    fwd = Euler((rx, 0, 0)).to_matrix() @ Vector((0, 0, -1))
    up = Euler((rx, 0, 0)).to_matrix() @ Vector((0, 1, 0))
    zt = (0.85 - 0.5) * A.ortho / up.z
    cam.location = Vector((0, 0, zt)) - fwd * 20
    sc.camera = cam

def put(sc, root, name, bm, hex_color):
    me = bpy.data.meshes.new(name)
    for f in bm.faces:
        f.smooth = True
    bm.to_mesh(me)
    bm.free()
    me.materials.append(toon_material(name, hex_color, 1.0, 1.0))
    ob = bpy.data.objects.new(name, me)
    sc.collection.objects.link(ob)
    ob.parent = root
    return ob

def new_scene():
    clear()
    sc = bpy.context.scene
    root = bpy.data.objects.new("ROOT", None)
    sc.collection.objects.link(root)
    setup_camera(sc)
    return sc, root

def render_to(sc, path):
    sc.render.filepath = path
    bpy.ops.render.render(write_still=True)

def build_core(sc, root):
    # The bright centre, and the warm disc it lights on the shield. No outline.
    put(sc, root, "core", ellipsoid(CORE, (0.07, 0.03, 0.07)), CENTER)
    put(sc, root, "corewarm", ellipsoid((CORE[0], CORE[1] + 0.012, CORE[2]), (0.11, 0.035, 0.11)), FACE)

def build_rim(sc, root):
    # A soft ring in the shield's plane, smaller than the shield, fed by the core.
    x, y, z = CORE
    put(sc, root, "rim", tube((x, y + 0.02, z), (x, y - 0.01, z), 0.16, 0.16, segs=32), HALO)

def build_steam(sc, root, frame, nframes):
    """Three soft puffs. They leave the core and rise over the shield. They stay below the eyes and off the floor."""
    u = 0 if nframes <= 1 else frame / (nframes - 1)
    # Staggered so they read as a little cloud, not one hard ball.
    lifts = (0.02, 0.10, 0.16)
    spreads = (-0.04, 0.03, 0.07)
    for i, (lift, spread) in enumerate(zip(lifts, spreads)):
        z = CORE[2] + 0.05 + (lift + 0.16) * u
        x = CORE[0] + spread * (0.35 + u)
        y = CORE[1] - 0.04 - 0.05 * u
        s = 0.055 + 0.03 * u
        put(sc, root, f"puff{i}", ellipsoid((x, y, z), (s * 1.15, s * 0.5, s)), STEAM[i])

def main():
    os.makedirs(A.out, exist_ok=True)
    sc, root = new_scene()
    build_core(sc, root)
    render_to(sc, os.path.join(A.out, "fx-core.png"))
    sc, root = new_scene()
    build_rim(sc, root)
    render_to(sc, os.path.join(A.out, "fx-rim.png"))
    n = 6
    for frame in range(n):
        sc, root = new_scene()
        build_steam(sc, root, frame, n)
        render_to(sc, os.path.join(A.out, f"fx-steam-{frame:02d}.png"))
        print("STEAM", frame, flush=True)
    # One blend with the core, the rim, and the first steam, for reuse.
    sc, root = new_scene()
    build_core(sc, root)
    build_rim(sc, root)
    build_steam(sc, root, 2, n)
    sc["dojo_label"] = "Ember Knight — shifted form"
    sc["dojo_placeholder_name"] = "Warm Shield"
    sc["dojo_fx"] = "shield-core steam, rim, and centre. No floor glow."
    bpy.ops.wm.save_as_mainfile(filepath=os.path.abspath(os.path.join(HERE, "ember-knight-shift-b-fx.blend")))
    print("FX RENDERED", flush=True)

if __name__ == "__main__":
    main()
