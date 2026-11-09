"""
Dojo Ascent — Ember Knight animation renders.

Opens the approved shifted-form scene (or the phase-3 "before" scene) and
renders with the same camera as build_ember_shift.py: orthographic, 35° down,
2.6 tiles across, 512 px, feet at 85% of the frame.

    blender -b incoming-art/ember-knight-shift-drafts/source/ember-knight-shift-b.blend \
        -P incoming-art/ember-knight-anim/source/render_ember_anim.py -- \
        --out incoming-art/ember-knight-anim

    blender -b incoming-art/ember-knight-shift-drafts/source/ember-knight-phase3.blend \
        -P incoming-art/ember-knight-anim/source/render_ember_anim.py -- \
        --out incoming-art/ember-knight-anim --only before

The knight Jay approved has a round body, a shield arm and a bar arm. It has
no separate legs, so the walk is a bounce and an opposite arm swing, not a
foot cycle. Warm Shield is only a placeholder name.
"""
import argparse, math, os, sys
import bpy
from mathutils import Vector, Euler

argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
ap = argparse.ArgumentParser()
ap.add_argument("--out", required=True)
ap.add_argument("--only", default="all", help="all, before, idle, walk, attack, shift, or test")
ap.add_argument("--samples", type=int, default=12)
ap.add_argument("--size", type=int, default=512)
ap.add_argument("--ortho", type=float, default=2.6)
A = ap.parse_args(argv)

# Same body size as build_ember_shift.py.
H, W = 1.4, 0.85
R = W / 2
# The vertex where each arm actually meets its pauldron on the approved mesh.
# Rotating anywhere else swings that point off the shoulder and opens a gap.
SHIELD_PIVOT = (-0.2692, -0.0832, 0.8682)
BAR_PIVOT = (0.3690, -0.0047, 0.8381)
# House direction order. Yaw 0 faces the camera (S), matching build_ember_shift.py.
DIRS = (("N", 180), ("NE", 135), ("E", 90), ("SE", 45), ("S", 0), ("SW", -45), ("W", -90), ("NW", -135))

BODY = (
    "bodyk", "helm", "neck", "seamchest",
    "pauld1", "pauld-1", "pring1", "pring-1",
    "socket1", "socket-1", "eye1", "eye-1", "hi1", "hi-1", "eyeframe",
)
SHIELD = ("armshield", "srim", "shield", "coal", "boss")
BAR = ("armbar", "bar", "barend")


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
    if sc.world is None:
        sc.world = bpy.data.worlds.new("W")
    sc.world.use_nodes = False
    sc.world.color = (0, 0, 0)
    cam = sc.camera
    if cam is None:
        cd = bpy.data.cameras.new("C")
        cam = bpy.data.objects.new("C", cd)
        sc.collection.objects.link(cam)
        sc.camera = cam
    cd = cam.data
    cd.type = "ORTHO"
    cd.ortho_scale = A.ortho
    cd.sensor_fit = "HORIZONTAL"
    rx = math.radians(55)  # 35° down from horizontal
    cam.rotation_euler = Euler((rx, 0, 0))
    fwd = Euler((rx, 0, 0)).to_matrix() @ Vector((0, 0, -1))
    up = Euler((rx, 0, 0)).to_matrix() @ Vector((0, 1, 0))
    zt = (0.85 - 0.5) * A.ortho / up.z
    cam.location = Vector((0, 0, zt)) - fwd * 20


def keep_world(ob, parent):
    mw = ob.matrix_world.copy()
    ob.parent = parent
    ob.matrix_parent_inverse = parent.matrix_world.inverted()
    ob.matrix_world = mw


def mesh(name):
    ob = bpy.data.objects.get(name)
    if ob is None:
        raise SystemExit("missing " + name)
    return ob


def adopt_outlines():
    for ob in list(bpy.data.objects):
        if ob.type != "MESH" or "_outline" not in ob.name:
            continue
        base = ob.name.split("_outline")[0]
        src = bpy.data.objects.get(base)
        if src is not None and ob.parent != src:
            keep_world(ob, src)


def make_pivot(sc, root, name, loc):
    e = bpy.data.objects.new(name, None)
    sc.collection.objects.link(e)
    e.parent = root
    e.location = Vector(loc)
    bpy.context.view_layer.update()
    return e


def adopt(pivot, names):
    for name in names:
        ob = bpy.data.objects.get(name)
        if ob is None:
            continue
        keep_world(ob, pivot)


def emission(name, hex_color):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    nt = m.node_tree
    nt.nodes.clear()
    emit = nt.nodes.new("ShaderNodeEmission")
    h = hex_color.lstrip("#")
    rgb = tuple(int(h[i:i + 2], 16) / 255 for i in (0, 2, 4))
    # Rough sRGB to linear, same idea as the toon kit's colour path.
    lin = tuple(c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4 for c in rgb)
    emit.inputs["Color"].default_value = (*lin, 1)
    emit.inputs["Strength"].default_value = 2.0
    out = nt.nodes.new("ShaderNodeOutputMaterial")
    nt.links.new(emit.outputs[0], out.inputs["Surface"])
    return m


def add_effects(sc, shield_pivot):
    """Gold ring and pale steam, parented to the shield so they turn with it.
    Hidden except on the shift frames that need them. Not red."""
    bpy.ops.mesh.primitive_torus_add(
        major_radius=0.34, minor_radius=0.025, major_segments=32, minor_segments=8,
        location=(0, 0, 0),
    )
    ring = bpy.context.active_object
    ring.name = "shift-ring"
    ring.data.materials.append(emission("RING", "#ffc14d"))
    keep_world(ring, shield_pivot)
    # Sit just in front of the shield face. Shield centre is left and forward of the shoulder.
    ring.location = Vector((-R * 0.55 - SHIELD_PIVOT[0], -R * 0.98 - SHIELD_PIVOT[1], H * 0.46 - SHIELD_PIVOT[2]))
    ring.rotation_euler = Euler((math.radians(90), 0, 0))
    ring.hide_render = True

    steam = []
    for i, dz in enumerate((0.18, 0.32, 0.46)):
        bpy.ops.mesh.primitive_uv_sphere_add(radius=0.07 + i * 0.02, segments=12, ring_count=8)
        ob = bpy.context.active_object
        ob.name = f"shift-steam-{i}"
        ob.data.materials.append(emission("STEAM", "#fff6e0"))
        keep_world(ob, shield_pivot)
        ob.location = Vector((
            -R * 0.55 - SHIELD_PIVOT[0],
            -R * 1.05 - SHIELD_PIVOT[1],
            H * 0.46 - SHIELD_PIVOT[2] + dz,
        ))
        ob.scale = (1.1, 0.7, 0.85)
        ob.hide_render = True
        steam.append(ob)
    embers = []
    for i in range(3):
        bpy.ops.mesh.primitive_uv_sphere_add(radius=0.028, segments=10, ring_count=6)
        ob = bpy.context.active_object
        ob.name = f"idle-ember-{i}"
        ob.data.materials.append(emission("EMBER", "#ffe7a8"))
        keep_world(ob, shield_pivot)
        ob.hide_render = True
        embers.append(ob)
    return ring, steam, embers


def zero(body, shield, bar):
    body.location = (0, 0, 0)
    body.rotation_euler = (0, 0, 0)
    shield.rotation_euler = (0, 0, 0)
    bar.rotation_euler = (0, 0, 0)
    for name in ("coal", "boss"):
        ob = bpy.data.objects.get(name)
        if ob:
            ob.scale = (1, 1, 1)


def pose_idle(i, body, shield, bar):
    """8 frames, 8 fps. A small breathe and a core pulse. No flash."""
    phase = 2 * math.pi * i / 8
    body.location = (0, 0, 0.012 * math.sin(phase))
    body.rotation_euler = (0.03, 0, 0.02 * math.sin(phase))
    shield.rotation_euler = (0, 0.06 * math.sin(phase), 0)
    bar.rotation_euler = (0, -0.04 * math.sin(phase), 0)
    pulse = 1.0 + 0.18 * (0.5 + 0.5 * math.sin(phase))
    for name in ("coal", "boss"):
        ob = bpy.data.objects.get(name)
        if ob:
            ob.scale = (pulse, pulse, pulse)
    return phase


def pose_walk(i, body, shield, bar):
    """10 frames, 30 fps, same loop length as the style-guide walk."""
    phase = 2 * math.pi * i / 10
    body.location = (0, 0, 0.02 * math.sin(phase * 2))
    body.rotation_euler = (0.07, 0, 0.05 * math.sin(phase))
    # Opposite arms. Y rotation swings the weapon up to the side a little.
    shield.rotation_euler = (0.12 * math.sin(phase), 0.28 * math.sin(phase), 0)
    bar.rotation_euler = (-0.12 * math.sin(phase), -0.28 * math.sin(phase), 0)


def pose_attack(i, body, shield, bar):
    """20 frames at 10 fps = 2.0 s. Hit starts at frame 9 (0.9 s), which is
    ember slash's 18 telegraph ticks at 20 ticks a second. Recover is the
    remaining 1.1 s (22 ticks). The bar stays attached at the shoulder."""
    if i < 9:
        u = i / 9
        lift = u * u
        bar.rotation_euler = (0.10 * lift, 0.62 * lift, 0)
        shield.rotation_euler = (0, -0.12 * lift, 0)
        body.rotation_euler = (-0.04 * lift, 0, 0)
        body.location = (0, 0, 0.01 * lift)
    elif i < 12:
        u = (i - 9) / 3
        bar.rotation_euler = (0.10 + 0.28 * u, 0.62 - 1.05 * u, 0)
        shield.rotation_euler = (0, -0.12 + 0.05 * u, 0)
        body.rotation_euler = (-0.04 + 0.10 * u, 0, 0)
        body.location = (0, 0, 0.01)
    else:
        u = (i - 11) / 8
        ease = 1 - u
        bar.rotation_euler = (0.38 * ease, -0.43 * ease, 0)
        shield.rotation_euler = (0, -0.07 * ease, 0)
        body.rotation_euler = (0.06 * ease, 0, 0)
        body.location = (0, 0, 0.01 * ease)


def place_embers(embers, phase, show):
    for i, ob in enumerate(embers):
        ob.hide_render = not show
        if not show:
            continue
        # Fixed path, rising from the shield. Same loop every time.
        u = (phase / (2 * math.pi) + i / 3) % 1.0
        ob.location = Vector((
            -R * 0.50 - SHIELD_PIVOT[0] + 0.04 * math.sin(u * 6.28 + i),
            -R * 1.02 - SHIELD_PIVOT[1],
            H * 0.50 - SHIELD_PIVOT[2] + 0.08 + 0.42 * u,
        ))
        ob.scale = (1 - 0.4 * u, 1 - 0.4 * u, 1 - 0.4 * u)


def render_file(sc, root, path, yaw):
    root.rotation_euler = Euler((0, 0, math.radians(yaw)))
    sc.render.filepath = path
    bpy.ops.render.render(write_still=True)


def want(name):
    return A.only in ("all", name)


def main():
    sc = bpy.context.scene
    kind = sc.get("dojo_kind", "")
    setup_camera(sc)
    frames = os.path.join(os.path.abspath(A.out), "frames")
    os.makedirs(frames, exist_ok=True)
    root = mesh("ROOT")

    if kind == "before" or A.only == "before":
        for d, yaw in DIRS:
            path = os.path.join(frames, f"before_{d}.png")
            render_file(sc, root, path, yaw)
            print("BEFORE", d, flush=True)
        return

    adopt_outlines()
    body = make_pivot(sc, root, "PIVOT_BODY", (0, 0, 0))
    shield = make_pivot(sc, root, "PIVOT_SHIELD", SHIELD_PIVOT)
    bar = make_pivot(sc, root, "PIVOT_BAR", BAR_PIVOT)
    adopt(body, BODY)
    adopt(shield, SHIELD)
    adopt(bar, BAR)
    ring, steam, embers = add_effects(sc, shield)

    def hide_fx():
        ring.hide_render = True
        for ob in steam:
            ob.hide_render = True
        place_embers(embers, 0, False)

    jobs = []
    if A.only == "test":
        jobs.append(("attack", 20, (0, 8, 9, 11), ("S",)))
    else:
        if want("idle"):
            jobs.append(("idle", 8, range(8), [d for d, _ in DIRS]))
        if want("walk"):
            jobs.append(("walk", 10, range(10), [d for d, _ in DIRS]))
        if want("attack"):
            jobs.append(("attack", 20, range(20), [d for d, _ in DIRS]))
        if want("shift"):
            jobs.append(("shift", 4, range(4), [d for d, _ in DIRS]))

    yaw_of = dict(DIRS)
    n = 0
    for anim, count, frame_ids, dir_names in jobs:
        for d in dir_names:
            for i in frame_ids:
                hide_fx()
                zero(body, shield, bar)
                if anim == "idle":
                    phase = pose_idle(i, body, shield, bar)
                    place_embers(embers, phase, True)
                elif anim == "walk":
                    pose_walk(i, body, shield, bar)
                elif anim == "attack":
                    pose_attack(i, body, shield, bar)
                elif anim == "shift":
                    # 0 rest, 1 ring at 1.00 s, 2 steam at 1.25 s, 3 core high at 1.50 s
                    pose_idle(0, body, shield, bar)
                    if i == 1:
                        ring.hide_render = False
                    elif i == 2:
                        for ob in steam:
                            ob.hide_render = False
                    elif i == 3:
                        for name in ("coal", "boss"):
                            bpy.data.objects[name].scale = (1.18, 1.18, 1.18)
                        place_embers(embers, math.pi * 0.5, True)
                path = os.path.join(frames, f"{anim}_{d}_{i:02d}.png")
                render_file(sc, root, path, yaw_of[d])
                n += 1
                print(f"FRAME {anim} {d} {i} ({n})", flush=True)

    blend = os.path.join(os.path.abspath(A.out), "source", "ember-knight-anim.blend")
    os.makedirs(os.path.dirname(blend), exist_ok=True)
    if A.only != "test":
        bpy.ops.wm.save_as_mainfile(filepath=blend)
        print("SAVED", blend, flush=True)
    print("DONE", n, flush=True)


if __name__ == "__main__":
    main()
