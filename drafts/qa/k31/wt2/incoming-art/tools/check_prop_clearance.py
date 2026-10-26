"""
Dojo Ascent - prop clearance check (Art Director bot). Runs inside Blender on a built character .blend:

    blender -b <char>.blend -P check_prop_clearance.py -- --anim sweep --prop prop-broom [--allow hand,forearm]

For every frame of the animation, tests the prop's meshes against the body's meshes (BVH overlap, posed and
evaluated) and reports any intersection. The hands and forearms (which grip the prop) are allowed to touch.
The check is in 3D, so it covers all 8 directions at once (directions only turn the camera).
"""
import bpy, sys, argparse
from mathutils.bvhtree import BVHTree
argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
ap = argparse.ArgumentParser(); ap.add_argument("--anim", required=True); ap.add_argument("--prop", required=True)
ap.add_argument("--allow", default="hand,forearm,fist,sleeve,cuff,arm,outline")
a = ap.parse_args(argv)
arm = next(o for o in bpy.data.objects if o.type == "ARMATURE")
act = bpy.data.actions[a.anim]; arm.animation_data.action = act
coll = lambda o: [c.name for c in o.users_collection]
props = [o for o in bpy.data.objects if o.type == "MESH" and any(a.prop in c for c in coll(o)) and "outline" not in o.name]
allow = a.allow.split(",")
body = [o for o in bpy.data.objects if o.type == "MESH" and o not in props and not any("prop-" in c for c in coll(o))
        and not any(w in o.name.lower() for w in allow)]
def bvh(o, dg):
    e = o.evaluated_get(dg); me = e.to_mesh(); me.transform(e.matrix_world)
    t = BVHTree.FromPolygons([v.co.copy() for v in me.vertices], [p.vertices[:] for p in me.polygons]); e.to_mesh_clear(); return t
bad = 0
for f in range(int(act.frame_range[0]), int(act.frame_range[1]) + 1):
    bpy.context.scene.frame_set(f); dg = bpy.context.evaluated_depsgraph_get()
    pt = [(p.name, bvh(p, dg)) for p in props]
    for b in body:
        bt = bvh(b, dg)
        for pn, t in pt:
            if t.overlap(bt): bad += 1; print(f"INTERSECT frame {f}: {pn} x {b.name}")
print(f"CHECKED {a.anim}: {len(props)} prop meshes vs {len(body)} body meshes; {bad} intersections")
