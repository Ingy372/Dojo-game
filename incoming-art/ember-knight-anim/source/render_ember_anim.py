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
import bmesh
from mathutils import Vector, Euler, Quaternion

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "tools"))
from toon_kit import toon_material, outline_material, add_hull

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


def thicken(name, extra):
    """Push a tube outward so the arm reads at phone size. Outlines face inward."""
    ob = bpy.data.objects.get(name)
    if ob is None or extra <= 0:
        return
    bm = bmesh.new()
    bm.from_mesh(ob.data)
    bm.normal_update()
    sign = -1.0 if "_outline" in name else 1.0
    for v in bm.verts:
        v.co += v.normal * (extra * sign)
    bm.to_mesh(ob.data)
    ob.data.update()
    bm.free()


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
    # Warm orange and gold, big enough to read as embers. Not the pale specks.
    ember_colors = ("#ff7a28", "#ff9a3c", "#ffc14d")
    for i in range(3):
        bpy.ops.mesh.primitive_uv_sphere_add(radius=0.05, segments=12, ring_count=8)
        ob = bpy.context.active_object
        ob.name = f"idle-ember-{i}"
        ob.data.materials.append(emission("EMBER%d" % i, ember_colors[i]))
        keep_world(ob, shield_pivot)
        ob.hide_render = True
        embers.append(ob)
    return ring, steam, embers


def add_slash_arc(sc, root):
    """One crescent, not a row of spheres. Edge is orange-gold, face is warm gold."""
    parts = []
    for name, color in (("swoosh-edge", "#e0923a"), ("swoosh-gold", "#ffd36a")):
        me = bpy.data.meshes.new(name)
        ob = bpy.data.objects.new(name, me)
        ob.data.materials.append(emission(name, color))
        sc.collection.objects.link(ob)
        keep_world(ob, root)
        ob.hide_render = True
        parts.append(ob)
    return parts


def _diamond_prism(p0, p1, w0, t0, w1, t1, side_hint=None):
    d = (p1 - p0)
    if d.length < 1e-6:
        d = Vector((0, 0, -1))
    d = d.normalized()
    if side_hint is not None:
        side = Vector(side_hint) - d * Vector(side_hint).dot(d)
        if side.length < 0.05:
            side = d.cross(Vector((0, 0, 1)))
    else:
        side = d.cross(Vector((0, 0, 1)))
        if side.length < 0.05:
            side = d.cross(Vector((1, 0, 0)))
    side.normalize()
    up = side.cross(d).normalized()
    bm = bmesh.new()

    def ring(c, w, t):
        return [c + side * w, c + up * t, c - side * w, c - up * t]

    v0 = [bm.verts.new(p) for p in ring(p0, w0, t0)]
    v1 = [bm.verts.new(p) for p in ring(p1, w1, t1)]
    for i in range(4):
        bm.faces.new((v0[i], v0[(i + 1) % 4], v1[(i + 1) % 4], v1[i]))
    bm.faces.new(tuple(reversed(v0)))
    bm.faces.new(tuple(v1))
    return bm


def add_sword(sc, bar_pivot):
    """A flat blade and a crossguard, parented to the bar so every direction
    shows a sword rather than a stick. The old round bar is hidden."""
    for name in ("bar", "bar_outline", "barend", "barend_outline"):
        ob = bpy.data.objects.get(name)
        if ob:
            ob.hide_render = True
    hilt = Vector((R * 1.38, -R * 0.42, H * 0.50))
    tip = Vector((R * 1.38, -R * 0.55, H * 0.02))
    copper = toon_material("BLADE", "#c9824a", 0.32, 1.45)
    gold = toon_material("GUARD", "#ffc14d", 0.45, 1.35)
    out = outline_material()
    # Wide left-to-right, so the flat of the blade shows from the front and the back.
    blade_bm = _diamond_prism(hilt, tip, 0.14, 0.07, 0.03, 0.035, side_hint=(1, 0, 0))
    me = bpy.data.meshes.new("blade")
    blade_bm.to_mesh(me)
    blade_bm.free()
    me.materials.append(copper)
    blade = bpy.data.objects.new("blade", me)
    sc.collection.objects.link(blade)
    hull = add_hull(blade, sc.collection, out, 0.012)
    keep_world(blade, bar_pivot)
    keep_world(hull, blade)
    # Crossguard across the hilt, wide enough to read from behind.
    guard_bm = _diamond_prism(
        hilt + Vector((-0.30, 0.0, 0.02)),
        hilt + Vector((0.30, 0.0, 0.02)),
        0.05, 0.045, 0.05, 0.045,
        side_hint=(0, 1, 0),
    )
    gme = bpy.data.meshes.new("crossguard")
    guard_bm.to_mesh(gme)
    guard_bm.free()
    gme.materials.append(gold)
    guard = bpy.data.objects.new("crossguard", gme)
    sc.collection.objects.link(guard)
    gh = add_hull(guard, sc.collection, out, 0.01)
    keep_world(guard, bar_pivot)
    keep_world(gh, guard)
    # A second bar, front to back, so the hilt still reads when the wide bar is edge-on.
    guard2_bm = _diamond_prism(
        hilt + Vector((0.0, 0.16, 0.02)),
        hilt + Vector((0.0, -0.16, 0.02)),
        0.045, 0.04, 0.045, 0.04,
        side_hint=(1, 0, 0),
    )
    g2 = bpy.data.meshes.new("crossguard-2")
    guard2_bm.to_mesh(g2)
    guard2_bm.free()
    g2.materials.append(gold)
    g2ob = bpy.data.objects.new("crossguard-2", g2)
    sc.collection.objects.link(g2ob)
    g2h = add_hull(g2ob, sc.collection, out, 0.01)
    keep_world(g2ob, bar_pivot)
    keep_world(g2h, g2ob)
    return blade


def add_boots(sc, body_pivot):
    """Two stubby boots peeking under the front of the hem."""
    global BOOTS, BOOT_REST
    leather = toon_material("BOOT", "#8a5a34", 0.35, 1.25)
    out = outline_material()
    BOOTS = []
    for i, x in enumerate((-0.13, 0.13)):
        bm = _diamond_prism(
            Vector((x, -0.16, 0.02)),
            Vector((x, -0.30, 0.10)),
            0.07, 0.05, 0.075, 0.045,
        )
        me = bpy.data.meshes.new(f"boot-{i}")
        bm.to_mesh(me)
        bm.free()
        me.materials.append(leather)
        ob = bpy.data.objects.new(f"boot-{i}", me)
        sc.collection.objects.link(ob)
        hull = add_hull(ob, sc.collection, out, 0.01)
        keep_world(ob, body_pivot)
        keep_world(hull, ob)
        BOOTS.append(ob)
    bpy.context.view_layer.update()
    BOOT_REST = [b.location.copy() for b in BOOTS]


def zero(body, shield, bar):
    body.location = (0, 0, 0)
    body.rotation_euler = (0, 0, 0)
    shield.rotation_euler = (0, 0, 0)
    shield.location = Vector(SHIELD_PIVOT)
    bar.rotation_mode = "XYZ"
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
    pose_feet(0.0, False)
    return phase


BOOTS = []
BOOT_REST = []


def pose_feet(phase, stepping):
    """Stubby boots under the hem. Walk steps them; everything else plants them."""
    for i, boot in enumerate(BOOTS):
        s = math.sin(phase + i * math.pi) if stepping else 0.0
        lift = max(0.0, s) if stepping else 0.0
        boot.location = BOOT_REST[i] + Vector((0.0, -s * 0.10, lift * 0.16))


def pose_walk(i, body, shield, bar):
    """10 frames, 30 fps, played at 1.6 tiles/s. A big bob and alternate steps,
    so it does not read as a slide. The round body stays the approved shape."""
    phase = 2 * math.pi * i / 10
    sway = math.sin(phase)
    bob = 0.11 * (0.5 + 0.5 * math.sin(phase * 2))
    body.location = (0.04 * sway, 0, bob)
    body.rotation_euler = (0.06, 0, 0.10 * sway)
    shield.rotation_euler = (0.10 * math.sin(phase), 0.32 * math.sin(phase), 0)
    bar.rotation_mode = "XYZ"
    bar.rotation_euler = (-0.10 * math.sin(phase), -0.32 * math.sin(phase), 0)
    pose_feet(phase, True)


def qeuler(rx, ry, rz):
    return Euler((rx, ry, rz), "XYZ").to_quaternion()


# Cocked back and up over the shoulder, then across the front, then through.
Q_REST = qeuler(0, 0, 0)
Q_WIND = qeuler(0.40, -2.40, 1.00)
# Across the front of the chest, in front of the body, with a modest lean-in.
Q_HIT = qeuler(-0.50, -1.25, -1.80)
Q_FOLLOW = qeuler(-0.85, -1.65, -1.50)


def pose_attack(i, body, shield, bar):
    """20 frames at 10 fps. Frames 0–8 are the wind-up. Frame 9 is the hit.
    The sweep itself is the step from 8 to 9, then a short follow-through."""
    if i <= 8:
        u = (i / 8) ** 1.6
        bq = Q_REST.slerp(Q_WIND, u)
        lean, twist = -0.36 * u, 0.26 * u
        hop = 0.025 * u
        shield_y = -0.16 * u
    elif i == 9:
        bq = Q_HIT
        lean, twist, hop, shield_y = 0.18, -0.30, 0.012, 0.06
    elif i <= 12:
        u = (i - 9) / 3
        bq = Q_HIT.slerp(Q_FOLLOW, u)
        lean = 0.18 * (1 - u) + 0.06 * u
        twist = -0.30 * (1 - 0.45 * u)
        hop = 0.01 * (1 - u)
        shield_y = 0.06 * (1 - u)
    else:
        u = (i - 12) / 7
        bq = Q_FOLLOW.slerp(Q_REST, u)
        lean = 0.06 * (1 - u)
        twist = -0.16 * (1 - u)
        hop = 0
        shield_y = 0
    bar.rotation_mode = "QUATERNION"
    bar.rotation_quaternion = bq
    body.rotation_euler = (lean, 0, twist)
    body.location = (0.04 * twist, 0, hop)
    shield.rotation_euler = (0, shield_y, 0)
    pose_feet(0.0, False)


def bar_tip(root):
    bpy.context.view_layer.update()
    ob = bpy.data.objects.get("blade") or bpy.data.objects["barend"]
    pivot = bpy.data.objects["PIVOT_BAR"].matrix_world.translation
    verts = [ob.matrix_world @ v.co for v in ob.data.vertices]
    tip = max(verts, key=lambda p: (p - pivot).length)
    return root.matrix_world.inverted() @ tip


def _swoosh_mesh(points, width_scale):
    """One tapered crescent. points[0] is the point behind the blade, points[-1] is thick."""
    bm = bmesh.new()
    rings = []
    n = len(points)
    segs = 8
    for i, p in enumerate(points):
        t = i / (n - 1)
        rad = 0.105 * (t ** 1.15) * width_scale
        if i == 0:
            tangent = points[1] - points[0]
        elif i == n - 1:
            tangent = points[-1] - points[-2]
        else:
            tangent = points[i + 1] - points[i - 1]
        if tangent.length < 1e-6:
            tangent = Vector((0, 0, 1))
        tangent = tangent.normalized()
        side = tangent.cross(Vector((0, 0, 1)))
        if side.length < 0.2:
            side = tangent.cross(Vector((1, 0, 0)))
        side.normalize()
        up = side.cross(tangent).normalized()
        ring = []
        for k in range(segs):
            a = k / segs * math.tau
            ring.append(bm.verts.new(p + (side * math.cos(a) + up * math.sin(a)) * rad))
        rings.append(ring)
    for i in range(n - 1):
        for k in range(segs):
            bm.faces.new((rings[i][k], rings[i][(k + 1) % segs], rings[i + 1][(k + 1) % segs], rings[i + 1][k]))
    bm.faces.new(tuple(rings[-1]))
    return bm


def _put_mesh(ob, bm):
    me = bpy.data.meshes.new(ob.name + "-mesh")
    bm.to_mesh(me)
    bm.free()
    old = ob.data
    ob.data = me
    if old.materials:
        me.materials.append(old.materials[0])
    if old.users == 0:
        bpy.data.meshes.remove(old)


def place_arc(parts, frame, tips):
    """One crescent on the hit frames. Thick by the blade, a point behind it.
    Shifted slightly behind the blade so the sword stays on top."""
    for ob in parts:
        ob.hide_render = True
    if tips is None or frame not in (9, 10):
        return
    if frame == 9:
        tail, head = tips[8], tips[9]
    else:
        tail, head = tips[9], tips[10]
    # Along the path just behind the blade. The tip of the sword stays past the thick end.
    start = head
    head = start.lerp(tail, 0.16)
    tail = start.lerp(tail, 0.72)
    mid = (tail + head) * 0.5
    direction = head - tail
    bend = Vector((-direction.z, 0.0, direction.x))
    if bend.length < 1e-4:
        bend = Vector((0.2, 0.0, 0.2))
    bend.normalize()
    # Curve along the swing, nudged behind the blade so the sword draws on top.
    ctrl = mid + bend * 0.10 + Vector((0.0, 0.05, 0.0))
    pts = []
    steps = 12
    for i in range(steps + 1):
        t = i / steps
        p = (1 - t) ** 2 * tail + 2 * (1 - t) * t * ctrl + t ** 2 * head
        pts.append(Vector((p.x, p.y + 0.09, p.z)))
    edge, gold = parts
    _put_mesh(edge, _swoosh_mesh(pts, 1.0))
    gold_pts = [Vector((p.x, p.y - 0.015, p.z)) for p in pts]
    _put_mesh(gold, _swoosh_mesh(gold_pts, 0.72))
    edge.hide_render = False
    gold.hide_render = False


def place_embers(embers, phase, show):
    for i, ob in enumerate(embers):
        ob.hide_render = not show
        if not show:
            continue
        # Rise off the shield core, above the rim, so they don't sit under it.
        u = (phase / (2 * math.pi) + i / 3.0) % 1.0
        ob.location = Vector((
            # Above the shield, not in front of it. In front reads as specks under the rim.
            -0.28 - SHIELD_PIVOT[0] + 0.07 * i,
            -0.05 - SHIELD_PIVOT[1],
            1.12 - SHIELD_PIVOT[2] + 0.26 * u,
        ))
        ob.scale = (1.15 - 0.55 * u, 1.15 - 0.55 * u, 1.45 - 0.45 * u)


def render_file(sc, root, path, yaw):
    root.rotation_euler = Euler((0, 0, math.radians(yaw)))
    sc.render.filepath = path
    bpy.ops.render.render(write_still=True)


def want(name):
    if A.only == "all":
        return True
    return name in [p.strip() for p in A.only.split(",") if p.strip()]


def pose_spark(i, body, shield, bar):
    """Spark Shield. The shield comes forward so a Strike can meet it.
    Gold motes sit on the rim. The shield itself stays visible. Not red."""
    if i <= 6:
        u = (i / 6) ** 1.4
        lean, twist = -0.16 * u, 0.08 * u
        present = 0.15 * u
    elif i <= 10:
        u = (i - 6) / 4
        lean, twist = -0.16 + 0.28 * u, 0.08 - 0.18 * u
        present = 0.15 + 0.85 * u
    else:
        u = (i - 10) / 5
        lean, twist = 0.12 * (1 - u), -0.10 * (1 - u)
        present = 1.0 * (1 - u)
    body.rotation_euler = (lean, 0, twist)
    body.location = (0, -0.06 * present, 0.02 * present)
    shield.location = Vector(SHIELD_PIVOT) + Vector((0.0, -0.32 * present, 0.08 * present))
    shield.rotation_euler = (0.15 * present, -0.35 * present, 0)
    bar.rotation_mode = "XYZ"
    bar.rotation_euler = (0.1 * present, 0.15 * present, 0)
    pose_feet(0.0, False)
    return present


def pose_sweep(i, body, shield, bar):
    """Forge Sweep. A wide blade arc with a step forward. The blade stays visible."""
    if i <= 6:
        u = (i / 6) ** 1.5
        bq = Q_REST.slerp(Q_WIND, u)
        lean, twist, lunge = -0.28 * u, 0.22 * u, 0.0
    elif i <= 9:
        u = (i - 6) / 3
        bq = Q_WIND.slerp(Q_HIT, u)
        lean = -0.28 + 0.46 * u
        twist = 0.22 - 0.55 * u
        lunge = 0.28 * u
    else:
        u = (i - 9) / 6
        bq = Q_HIT.slerp(Q_REST, u)
        lean = 0.18 * (1 - u)
        twist = -0.33 * (1 - u)
        lunge = 0.28 * (1 - u)
    bar.rotation_mode = "QUATERNION"
    bar.rotation_quaternion = bq
    body.rotation_euler = (lean, 0, twist)
    body.location = (0.03 * twist, -lunge, 0.02)
    shield.rotation_euler = (0, -0.12, 0)
    pose_feet(0.0, False)


def place_sparks(sparks, present):
    show = present > 0.45
    for i, ob in enumerate(sparks):
        ob.hide_render = not show
        if not show:
            continue
        ang = i / len(sparks) * math.tau + present
        ob.location = Vector((
            0.02 + math.cos(ang) * 0.30,
            -0.30,
            0.02 + math.sin(ang) * 0.24,
        ))
        s = 0.85 + 0.35 * present
        ob.scale = (s, s, s)


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
    # Upper arms, then the bar shaft (the forearm of the weapon arm). The body stays as approved.
    for name in ("armshield", "armshield_outline", "armbar", "armbar_outline"):
        thicken(name, 0.05)
    body = make_pivot(sc, root, "PIVOT_BODY", (0, 0, 0))
    adopt(body, BODY)
    shield = make_pivot(sc, body, "PIVOT_SHIELD", SHIELD_PIVOT)
    bar = make_pivot(sc, body, "PIVOT_BAR", BAR_PIVOT)
    adopt(shield, SHIELD)
    adopt(bar, BAR)
    add_sword(sc, bar)
    add_boots(sc, body)
    ring, steam, embers = add_effects(sc, shield)
    arc = add_slash_arc(sc, root)
    sparks = []
    for i in range(6):
        bpy.ops.mesh.primitive_uv_sphere_add(radius=0.055, segments=10, ring_count=6)
        ob = bpy.context.active_object
        ob.name = f"spark-{i}"
        ob.data.materials.append(emission("SPARK%d" % i, "#ffc14d" if i % 2 == 0 else "#ffe08a"))
        keep_world(ob, shield)
        ob.hide_render = True
        sparks.append(ob)

    def hide_fx():
        ring.hide_render = True
        for ob in steam:
            ob.hide_render = True
        place_embers(embers, 0, False)
        place_arc(arc, -1, None)
        place_sparks(sparks, 0)

    jobs = []
    if A.only == "test":
        jobs.append(("attack", 20, (9,), ("S", "N", "E")))
        jobs.append(("sweep", 16, (8,), ("S", "N")))
    else:
        if want("idle"):
            jobs.append(("idle", 8, range(8), [d for d, _ in DIRS]))
        if want("walk"):
            jobs.append(("walk", 10, range(10), [d for d, _ in DIRS]))
        if want("attack"):
            jobs.append(("attack", 20, range(20), [d for d, _ in DIRS]))
        if want("shift"):
            jobs.append(("shift", 4, range(4), [d for d, _ in DIRS]))
        if want("spark"):
            jobs.append(("spark", 16, range(16), [d for d, _ in DIRS]))
        if want("sweep"):
            jobs.append(("sweep", 16, range(16), [d for d, _ in DIRS]))

    # Where the bar head actually is, so the trail sits on the swing.
    tips = {}
    sweep_tips = {}
    if any(anim == "attack" for anim, _, _, _ in jobs):
        for i in range(20):
            zero(body, shield, bar)
            pose_attack(i, body, shield, bar)
            tips[i] = bar_tip(root).copy()
        zero(body, shield, bar)
    if any(anim == "sweep" for anim, _, _, _ in jobs):
        for i in range(16):
            zero(body, shield, bar)
            pose_sweep(i, body, shield, bar)
            sweep_tips[i] = bar_tip(root).copy()
        zero(body, shield, bar)

    yaw_of = dict(DIRS)
    n = 0
    for anim, count, frame_ids, dir_names in jobs:
        for d in dir_names:
            for i in frame_ids:
                hide_fx()
                zero(body, shield, bar)
                if anim == "idle":
                    phase = pose_idle(i, body, shield, bar)
                    # The old embers sat in front of the shield and read as white specks.
                    place_embers(embers, phase, False)
                elif anim == "walk":
                    pose_walk(i, body, shield, bar)
                elif anim == "attack":
                    pose_attack(i, body, shield, bar)
                    place_arc(arc, i, tips)
                elif anim == "spark":
                    present = pose_spark(i, body, shield, bar)
                    place_sparks(sparks, present)
                elif anim == "sweep":
                    pose_sweep(i, body, shield, bar)
                    if i in (7, 8, 9):
                        place_arc(arc, 9, {8: sweep_tips[6], 9: sweep_tips[i], 10: sweep_tips[min(i + 1, 15)]})
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
                        place_embers(embers, math.pi * 0.5, False)
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
