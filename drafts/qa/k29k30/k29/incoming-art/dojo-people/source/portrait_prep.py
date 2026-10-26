"""Run BEFORE tools/render_sprites.py in the same Blender call to render a 512 px speech-card portrait:
    blender -b incoming-art/dojo-people/source/<who>.blend -P incoming-art/dojo-people/source/portrait_prep.py \
        -P incoming-art/tools/render_sprites.py -- --out <dir> --name <who>_portrait --anims portrait --directions S \
        --size 512 --elevation 5 --ortho <O> --anchor-y <Y>       (O and Y per character: see make_portraits.sh)
It only changes the in-memory scene (nothing is saved): smoother curves for the big size (subdivision on every mesh)
and a thinner outline (0.006 tiles, about 3-4 px at 512 px), so the portrait matches the sprite look instead of a
7 px-thick line."""
import bpy, bmesh
PORTRAIT_OUTLINE = 0.006
arm = bpy.data.objects["MartialArtistRig"]; s = arm.scale[0]; hs = arm.pose.bones["head"].scale[0]
for ob in [o for o in bpy.data.objects if o.name.endswith("_outline") and o.type == "MESH"]:
    src = bpy.data.objects.get(ob.name[:-len("_outline")])
    if src is None: continue
    k = s * (hs if src.parent_bone == "head" else 1.0)
    bm = bmesh.new(); bm.from_mesh(src.data); bm.normal_update()
    for v in bm.verts: v.co += v.normal * (PORTRAIT_OUTLINE / k)
    bmesh.ops.reverse_faces(bm, faces=bm.faces[:]); bm.to_mesh(ob.data); bm.free()
for ob in bpy.data.objects:
    if ob.type == "MESH" and len(ob.data.vertices) > 8:
        # smoother curves for the big size; the gi only gets one level, so it stays crisp cloth instead of looking puffy
        gi = any(c.name == "L_gi" for c in ob.users_collection)
        m = ob.modifiers.new("smooth", "SUBSURF"); m.levels = m.render_levels = (1 if gi else 2)
import os
from mathutils import Matrix, Vector
EXPR = os.environ.get("PORTRAIT_EXPR", "")   # neutral / happy / proud / thinking; unset = the mouths as built (the sprite face)
if EXPR:
    for ob in bpy.data.objects:
        key = {"neutral": "soft", "happy": "toothy"}.get(EXPR, EXPR)     # the mouth set for each expression
        if ob.name.startswith("expr_"): ob.hide_render = not ob.name.startswith(f"expr_{key}_")
    # brows: proud lifts both a little; thinking lifts one and lowers the other (moved in the head's space)
    lift = {"proud": (0.008, 0.008), "thinking": (0.016, -0.006)}.get(EXPR)
    if lift:
        bpy.context.view_layer.update()
        for ob in bpy.data.objects:
            n = ob.name
            if ob.type != "MESH" or "brow" not in n or n.endswith("_outline"): continue
            dz = lift[0] if n.endswith(".L") else lift[1]
            me = ob.data
            for v in me.vertices: v.co.z += dz
