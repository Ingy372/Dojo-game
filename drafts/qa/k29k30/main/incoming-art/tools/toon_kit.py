"""
Dojo Ascent - shared toon kit (Art Director bot).

The house look, shared by every build script (enemies, rooms, props): flat cel ("toon") shading done with an
emission shader and one fixed light direction, a dark inverted-hull outline, and small mesh helpers.
Same code as the player character (character-test/source/build_character.py), so everything matches.

    import sys; sys.path.insert(0, "<repo>/incoming-art/tools"); from toon_kit import *
"""
import bpy, bmesh, math
from mathutils import Vector, Matrix, Euler

def srgb(h):
    """'#rrggbb' -> linear RGBA (node colors are linear)."""
    h = h.lstrip("#")
    out = []
    for i in (0, 2, 4):
        c = int(h[i:i + 2], 16) / 255.0
        out.append(c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4)
    return (*out, 1.0)

# ------------------------------------------------------------------ materials
# Cel ("toon") shading done with an emission shader: the light direction is fixed in
# the world, so shading is identical in every engine and every direction.
LIGHT_DIR = Vector((-0.45, -0.55, 0.70)).normalized()   # from the camera side, upper left

def toon_material(name, hex_color, shadow=0.66, highlight=1.10):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    nt = m.node_tree
    nt.nodes.clear()
    geo = nt.nodes.new("ShaderNodeNewGeometry")
    light = nt.nodes.new("ShaderNodeCombineXYZ")
    light.inputs[0].default_value, light.inputs[1].default_value, light.inputs[2].default_value = LIGHT_DIR
    dot = nt.nodes.new("ShaderNodeVectorMath"); dot.operation = "DOT_PRODUCT"
    ramp = nt.nodes.new("ShaderNodeValToRGB")
    ramp.color_ramp.interpolation = "CONSTANT"
    els = ramp.color_ramp.elements
    els[0].position = 0.0; els[0].color = (shadow, shadow, shadow, 1)
    els[1].position = 0.47; els[1].color = (1, 1, 1, 1)          # dot >= -0.06 -> lit
    e = els.new(0.93); e.color = (highlight, highlight, highlight, 1)  # small highlight
    remap = nt.nodes.new("ShaderNodeMapRange")                   # dot [-1,1] -> [0,1]
    remap.inputs["From Min"].default_value = -1.0
    remap.inputs["From Max"].default_value = 1.0
    mult = nt.nodes.new("ShaderNodeMix"); mult.data_type = "RGBA"; mult.blend_type = "MULTIPLY"
    mult.inputs["Factor"].default_value = 1.0
    mult.inputs[6].default_value = srgb(hex_color)
    emit = nt.nodes.new("ShaderNodeEmission")
    out = nt.nodes.new("ShaderNodeOutputMaterial")
    nt.links.new(geo.outputs["Normal"], dot.inputs[0])
    nt.links.new(light.outputs[0], dot.inputs[1])
    nt.links.new(dot.outputs["Value"], remap.inputs["Value"])
    nt.links.new(remap.outputs["Result"], ramp.inputs["Fac"])
    nt.links.new(ramp.outputs["Color"], mult.inputs[7])
    nt.links.new(mult.outputs[2], emit.inputs["Color"])
    nt.links.new(emit.outputs[0], out.inputs["Surface"])
    m.diffuse_color = srgb(hex_color)
    return m

def outline_material():
    """Inverted-hull outline: dark where we see the inside of the hull, see-through elsewhere."""
    m = bpy.data.materials.new("OUTLINE")
    m.use_nodes = True
    nt = m.node_tree; nt.nodes.clear()
    geo = nt.nodes.new("ShaderNodeNewGeometry")
    emit = nt.nodes.new("ShaderNodeEmission"); emit.inputs["Color"].default_value = srgb("#14121c")
    clear = nt.nodes.new("ShaderNodeBsdfTransparent")
    mix = nt.nodes.new("ShaderNodeMixShader")
    out = nt.nodes.new("ShaderNodeOutputMaterial")
    nt.links.new(geo.outputs["Backfacing"], mix.inputs["Fac"])
    nt.links.new(emit.outputs[0], mix.inputs[1])
    nt.links.new(clear.outputs[0], mix.inputs[2])
    nt.links.new(mix.outputs[0], out.inputs["Surface"])
    m.use_backface_culling = True       # same look in Eevee/viewport
    m.diffuse_color = srgb("#14121c")
    return m

def ellipsoid(center, size, rot=(0, 0, 0), segs=16, rings=10):
    bm = bmesh.new()
    bmesh.ops.create_uvsphere(bm, u_segments=segs, v_segments=rings, radius=1.0)
    m = Matrix.Translation(center) @ Euler([math.radians(a) for a in rot]).to_matrix().to_4x4() \
        @ Matrix.Diagonal((*size, 1))
    bmesh.ops.transform(bm, matrix=m, verts=bm.verts)
    return bm

def tube(p0, p1, r0, r1, segs=12, sx=1.0, sy=1.0):
    """Capped tapered cylinder from p0 to p1 (radius r0 at p0, r1 at p1)."""
    p0, p1 = Vector(p0), Vector(p1)
    d = p1 - p0
    bm = bmesh.new()
    bmesh.ops.create_cone(bm, cap_ends=True, cap_tris=False, segments=segs,
                          radius1=r0, radius2=r1, depth=d.length)
    # cone is centred on origin along Z; non-uniform cross-section first
    bmesh.ops.transform(bm, matrix=Matrix.Diagonal((sx, sy, 1, 1)), verts=bm.verts)
    if d.normalized().z < -0.9999:
        # straight down: rotation_difference() would flip around a 45-degree axis and swap sx/sy
        # (Revision 2 fix - this made the gi skirt deeper than the belt, so it poked through at the back)
        rot = Matrix.Rotation(math.pi, 4, "X")
    else:
        rot = Vector((0, 0, 1)).rotation_difference(d.normalized()).to_matrix().to_4x4()
    bmesh.ops.transform(bm, matrix=Matrix.Translation((p0 + p1) / 2) @ rot, verts=bm.verts)
    return bm

def box(center, size, rot=(0, 0, 0), bevel=0.0):
    bm = bmesh.new()
    bmesh.ops.create_cube(bm, size=1.0)
    if bevel:
        bmesh.ops.bevel(bm, geom=bm.edges[:], offset=bevel / max(size), segments=2, affect="EDGES")
    m = Matrix.Translation(center) @ Euler([math.radians(a) for a in rot]).to_matrix().to_4x4() \
        @ Matrix.Diagonal((*size, 1))
    bmesh.ops.transform(bm, matrix=m, verts=bm.verts)
    return bm

def strip(p0, p1, width, thick, normal_hint=(0, -1, 0)):
    """A flat strip (belt tail / tape) from p0 to p1."""
    p0, p1 = Vector(p0), Vector(p1)
    d = (p1 - p0)
    y = d.normalized()
    n = Vector(normal_hint).normalized()
    x = y.cross(n).normalized()
    n = x.cross(y).normalized()
    m = Matrix((x, y, n)).transposed().to_4x4()
    bm = bmesh.new()
    bmesh.ops.create_cube(bm, size=1.0)
    bmesh.ops.transform(bm, matrix=Matrix.Translation((p0 + p1) / 2) @ m @ Matrix.Diagonal((width, d.length, thick, 1)),
                        verts=bm.verts)
    return bm


OUTLINE_W = 0.013        # world units (~1.1 px at the standard camera, 80 px per tile)

def add_hull(src, coll, mat, width, parent=None, bone_name=None, name_suffix="_outline"):
    """Inverted-hull copy of src (outline, glow rim or telegraph rim), linked to coll."""
    bm = bmesh.new(); bm.from_mesh(src.data)
    bm.normal_update()
    for v in bm.verts:
        v.co += v.normal * width
    bmesh.ops.reverse_faces(bm, faces=bm.faces[:])
    me = bpy.data.meshes.new(src.name + name_suffix)
    bm.to_mesh(me); bm.free()
    me.materials.append(mat)
    ob = bpy.data.objects.new(src.name + name_suffix, me)
    coll.objects.link(ob)
    ob.matrix_world = src.matrix_world.copy()
    return ob

def hull_material(name, hex_color):
    """Like the outline, but any colour: only the hull's inside faces show (a rim around the shape)."""
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    nt = m.node_tree; nt.nodes.clear()
    geo = nt.nodes.new("ShaderNodeNewGeometry")
    emit = nt.nodes.new("ShaderNodeEmission"); emit.inputs["Color"].default_value = srgb(hex_color)
    clear = nt.nodes.new("ShaderNodeBsdfTransparent")
    mix = nt.nodes.new("ShaderNodeMixShader")
    out = nt.nodes.new("ShaderNodeOutputMaterial")
    nt.links.new(geo.outputs["Backfacing"], mix.inputs["Fac"])
    nt.links.new(emit.outputs[0], mix.inputs[1])
    nt.links.new(clear.outputs[0], mix.inputs[2])
    nt.links.new(mix.outputs[0], out.inputs["Surface"])
    m.use_backface_culling = True
    return m
