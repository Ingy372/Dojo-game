"""Body B ear fix (Jay: the girl's ears sat on her shoulders). build_custom.py made the ears smaller with an OBJECT scale of
0.85; the ear objects' origin is the rig origin, so they also slid 15 % toward the floor (ear centre z 0.906 instead of 1.069).
This puts the scale back to 1 and scales the ear meshes (and outlines) by 0.85 about the ear's own centre, so they keep their
smaller size but sit on the sides of the head where body A's ears are. Saves the blend in place.
    blender -b incoming-art/player-custom/source/player_custom_b.blend -P incoming-art/player-custom/source/fix_ears_b.py"""
import bpy
from mathutils import Vector
for side in ("L", "R"):
    ear = bpy.data.objects[f"ear.{side}"]
    if abs(ear.scale[0] - 1) < 1e-6: print("FIX_EARS already fixed", side); continue
    c = sum((v.co for v in ear.data.vertices), Vector()) / len(ear.data.vertices)
    for nm in (f"ear.{side}", f"ear.{side}_outline"):
        o = bpy.data.objects[nm]; s = o.scale[0]
        for v in o.data.vertices: v.co = c + (v.co - c) * s
        o.scale = (1, 1, 1)
    print("FIX_EARS", side, "centre", tuple(round(x, 3) for x in c))
bpy.ops.wm.save_mainfile()
