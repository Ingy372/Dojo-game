"""Put the pre-A7 eyes back (Jay: no "crazy eyes"). Run on a blend whose faces came from the A7 build:
    OLD_BLEND=<same blend from before A7 (git show 4e8da4c^:...)> blender -b X.blend -P restore_eyes.py   (saves X.blend in place)
It swaps each f*_eyerim / f*_shine mesh for the earlier mesh, removes the A7 second shine (f*_shine2), and puts the earlier
eye-ring and mouth colours back (F_EYERIM, F_MOUTH). Nothing else in the blend changes (rig, actions, hair palette, kohai top-knot)."""
import bpy, os
old = os.environ["OLD_BLEND"]
names = [o.name for o in bpy.data.objects if ("_eyerim." in o.name or "_shine." in o.name)]
with bpy.data.libraries.load(old, link=False) as (src, dst):
    dst.meshes = [n for n in src.meshes if n in names]
    dst.materials = [m for m in src.materials if m in ("F_EYERIM", "F_MOUTH")]
olds = {m.name.rsplit(".", 1)[0] if m.name.count(".") > 1 else m.name: m for m in dst.meshes}
swapped = 0
for n in names:
    o = bpy.data.objects[n]; me = [m for m in dst.meshes if m.name.startswith(n)][0]
    me.materials.clear()
    for s in o.data.materials: me.materials.append(s)
    o.data = me; swapped += 1
gone = 0
for o in [o for o in bpy.data.objects if "_shine2." in o.name]:
    bpy.data.objects.remove(o, do_unlink=True); gone += 1
for m in dst.materials:
    base = m.name.split(".")[0]; cur = bpy.data.materials[base]
    if cur is not m:
        cur.user_remap(m); bpy.data.materials.remove(cur); m.name = base
print("RESTORE_EYES swapped", swapped, "removed shine2", gone)
bpy.ops.outliner.orphans_purge(do_recursive=True)
bpy.ops.wm.save_mainfile()
